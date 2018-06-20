var convert = require('xml-js');
var fs = require('fs');

var params = {
    file: ''
};

(function() {
    var args = process.argv,
        lastParam = null;

    for (var i=0,arg;arg=args[i];i++) {
        if (arg.indexOf("--") == 0) {
            lastParam = arg.replace("--", "");
        } else if (lastParam !== null) {
            params[lastParam] = arg;
            lastParam = null;
        }
    }
})();

var JSONModel = {
	animations: []
};

function parseData(array, stride) {
    var ret = [],
        line = [];

    for (var i=0,data;data=array[i];i++) {
        if (stride == 1) {
            ret.push(parseFloat(parseFloat(data).toFixed(4)));
        } else {
            line.push(parseFloat(parseFloat(data).toFixed(4)));

            if (line.length == stride) {
                ret.push(line);
                line = [];
            }
        }
    }

    return ret;
}

function parseAnimations(animations, armatureName) {
    for (var i=0,animation;animation=animations[i];i++) {
        var id = animation._attributes.id,
            sources = animation.source,
            
            times,
            poses;

        for (var j=0,source;source=sources[j];j++) {
            var type = source._attributes.id.replace(id + "-", "");

            if (type == "input") {
                times = parseData(source.float_array._text.split(" "), 1);
            } else if (type == "output") {
                poses = parseData(source.float_array._text.split(" "), 16);
            }
        }

        var animation = {
            joint: id.replace("_pose_matrix", "").replace(armatureName + "_", ""),
            keyframes: []
        };

        for (var j=0,len=times.length;j<len;j++) {
            animation.keyframes.push({
                time: times[j],
                pose: poses[j]
            });
        }

        JSONModel.animations.push(animation);
    }
}

module.exports = {
    convert() {
        var file = params.file;
        var xml = fs.readFileSync(file, 'utf8');

        var result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
        
        var animations = result.COLLADA.library_animations.animation;
        var armatureName = result.COLLADA.library_visual_scenes.visual_scene.node[0]._attributes.name;

        parseAnimations(animations, armatureName);
        
        var out = file.replace(".dae", "-animation.json");

        var fd = fs.openSync(out, "w");
        fs.writeSync(fd, JSON.stringify(JSONModel), 'utf8');
        fs.closeSync(fd);
    }
};