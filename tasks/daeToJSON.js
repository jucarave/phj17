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
	geometry: {
		vertices: [],
		normals: [],
		texCoords: [],
		triangles: {
			indices: [],
			order: []
		}
	},
	skin: {
		joints: {},
		weights: [],
		indices: []
	}
};
var jointOrder;

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

function parseMesh(geometry) {
    var mesh = geometry.mesh;
    var meshId = geometry._attributes.id;
    var sources = mesh.source;

    for (let i=0,source;source=sources[i];i++) {
        var type = source._attributes.id;
        var data = source.float_array._text.split(" ");
        var stride = parseInt(source.technique_common.accessor._attributes.stride, 10);
        var parsed = parseData(data, stride);

        if (type === meshId + "-positions") {
            JSONModel.geometry.vertices = parsed;
        } else if (type === meshId + "-normals") {
            JSONModel.geometry.normals = parsed;
        } else if (type === meshId + "-map-0") {
            JSONModel.geometry.texCoords = parsed;
        }
    }

    var triangles = mesh.triangles;
    var input = triangles.input;
    var data = triangles.p._text.split(" ");
    var parsed = parseData(data, input.length);

    JSONModel.geometry.triangles.indices = parsed;

    for (var i=0,order;order=input[i];i++) {
        JSONModel.geometry.triangles.order.push(order._attributes.semantic);
    }
}

function parseWeights(controller) {
    var id = controller._attributes.id;
    var skin = controller.skin;

    for (var i=0,source;source=skin.source[i];i++) {
        var sourceId = source._attributes.id;

        if (sourceId == id + "-joints") {
            jointOrder = source.Name_array._text.split(" ");
        } else if (sourceId == id + "-weights") {
            var data = source.float_array._text.split(" ");
            JSONModel.skin.weights = parseData(data, 1);
        }
    }

    var weightsIndices = skin.vertex_weights;
    var data = parseData(weightsIndices.v._text.split(" "), 1);
    var strides = parseData(weightsIndices.vcount._text.split(" "), 1);
    var indices = [];
    var ind = 0;

    for (var i=0,stride;stride=strides[i];i++) {
        var line = [];
        for (var j=0;j<stride*2;j++) {
            line.push(data[ind++]);
        }

        indices.push(line);
    }

    JSONModel.skin.indices = indices;
}

function parseJoints(joints) {
    var ret = [];
    
    for (var i=0,joint;joint=joints[i];i++) {
        var name = joint._attributes.name;
        var matrix = parseData(joint.matrix._text.split(" "), 1);

        var childs = null;
        if (joint.node) childs = parseJoints((joint.node.indexOf)? joint.node : [joint.node]);

        ret.push({
            name: name,
            index: jointOrder.indexOf(name),
            bindMatrix: matrix,
            childs: childs
        });
    }

    return ret;
}

module.exports = {
    convert() {
        var file = params.file;
        var xml = fs.readFileSync(file, 'utf8');

        var result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
        
        var libraryGeometries = result.COLLADA.library_geometries;
        var libraryControllers = result.COLLADA.library_controllers;
        var libraryVisualScenes = result.COLLADA.library_visual_scenes;
        
        parseMesh(libraryGeometries.geometry);
        parseWeights(libraryControllers.controller);
        JSONModel.skin.joints = parseJoints([libraryVisualScenes.visual_scene.node[0].node])[0];

        var out = file.replace(".dae", ".json");

        var fd = fs.openSync(out, "w");
        fs.writeSync(fd, JSON.stringify(JSONModel), 'utf8');
        fs.closeSync(fd);
    }
};