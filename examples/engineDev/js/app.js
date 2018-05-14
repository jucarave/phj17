(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Matrix4_1 = require("./math/Matrix4");
var Vector3_1 = require("./math/Vector3");
var Utils_1 = require("./Utils");
var Camera = (function () {
    function Camera(projection) {
        this.projection = projection;
        this._transform = Matrix4_1.default.createIdentity();
        this.position = new Vector3_1.Vector3(0, 0, 0);
        this._target = new Vector3_1.Vector3(0, 0, 0);
        this._up = new Vector3_1.Vector3(0, 1, 0);
        this._angle = new Vector3_1.Vector3(0.0);
        this.screenSize = new Vector3_1.Vector3(0.0);
        this._needsUpdate = true;
    }
    Camera.prototype.setPosition = function (x, y, z) {
        this.position.set(x, y, z);
        this._needsUpdate = true;
        return this;
    };
    Camera.prototype.setTarget = function (x, y, z) {
        this._target.set(x, y, z);
        this._needsUpdate = true;
        return this;
    };
    Camera.prototype.setAngle = function (x, y, z) {
        this._angle.set(x, y, z);
        this._needsUpdate = true;
        return this;
    };
    Camera.prototype.getAngle = function () {
        return this._angle;
    };
    Camera.prototype.getTransformation = function () {
        if (!this._needsUpdate) {
            return this._transform;
        }
        var f = Utils_1.rememberPoolAlloc(this.forward), l = Utils_1.rememberPoolAlloc(Vector3_1.Vector3.cross(this._up, f).normalize()), u = Utils_1.rememberPoolAlloc(Vector3_1.Vector3.cross(f, l).normalize());
        var cp = this.position, x = -Vector3_1.Vector3.dot(l, cp), y = -Vector3_1.Vector3.dot(u, cp), z = -Vector3_1.Vector3.dot(f, cp);
        this._transform.set(l.x, u.x, f.x, 0, l.y, u.y, f.y, 0, l.z, u.z, f.z, 0, x, y, z, 1);
        this._needsUpdate = false;
        Utils_1.freePoolAlloc();
        return this._transform;
    };
    Object.defineProperty(Camera.prototype, "forward", {
        get: function () {
            var cp = this.position, t = this._target;
            return Vector3_1.vec3(cp.x - t.x, cp.y - t.y, cp.z - t.z).normalize();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "isUpdated", {
        get: function () {
            return !this._needsUpdate;
        },
        enumerable: true,
        configurable: true
    });
    Camera.createPerspective = function (fov, ratio, znear, zfar) {
        return new Camera(Matrix4_1.default.createPerspective(fov, ratio, znear, zfar));
    };
    Camera.createOrthographic = function (width, height, znear, zfar) {
        var ret = new Camera(Matrix4_1.default.createOrtho(width, height, znear, zfar));
        ret.screenSize.set(width, height, 0);
        return ret;
    };
    return Camera;
}());
exports.default = Camera;
},{"./Utils":12,"./math/Matrix4":25,"./math/Vector3":26}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Component = (function () {
    function Component(componentName) {
        this.name = componentName;
    }
    Component.prototype.addInstance = function (instance) {
        this._instance = instance;
    };
    return Component;
}());
exports.default = Component;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config = {
    PLAY_FULLSCREEN: false,
    DISPLAY_COLLISIONS: false,
    PIXEL_UNIT_RELATION: 1 / 16,
    setUnitPixelsWidth: function (width) {
        this.PIXEL_UNIT_RELATION = 1 / width;
    }
};
exports.default = Config;
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERTICE_SIZE = 3;
exports.TEXCOORD_SIZE = 2;
exports.PI_2 = Math.PI / 2;
exports.PI2 = Math.PI * 2;
exports.PI3_2 = Math.PI * 3 / 2;
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
var Config_1 = require("./Config");
var Input = (function () {
    function Input() {
        this._element = null;
        this._keydownCallbacks = [];
        this._keyupCallbacks = [];
        this._mousemoveCallbacks = [];
        this._elementFocus = false;
    }
    Input.prototype._handleKeydown = function (keyEvent) {
        if (!this._elementFocus) {
            return;
        }
        for (var i = 0, callback = void 0; callback = this._keydownCallbacks[i]; i++) {
            callback.callback(keyEvent.keyCode);
        }
    };
    Input.prototype._handleKeyup = function (keyEvent) {
        for (var i = 0, callback = void 0; callback = this._keyupCallbacks[i]; i++) {
            callback.callback(keyEvent.keyCode);
        }
    };
    Input.prototype._handleMouseMove = function (mouseEvent) {
        if (!this._elementFocus) {
            return;
        }
        for (var i = 0, callback = void 0; callback = this._mousemoveCallbacks[i]; i++) {
            callback.callback(mouseEvent.movementX, mouseEvent.movementY);
        }
    };
    Input.prototype._handlePointerLockChange = function () {
        this._elementFocus = (document.pointerLockElement === this._element);
    };
    Input.prototype._deleteFromList = function (list, id) {
        for (var i = 0, callback = void 0; callback = list[i]; i++) {
            if (callback.id == id) {
                list.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Input.prototype._createCallbackToList = function (list, callback) {
        var ret = {
            id: Utils_1.createUUID(),
            callback: callback
        };
        list.push(ret);
        return ret.id;
    };
    Input.prototype.init = function (focusElement) {
        var _this = this;
        this._element = focusElement;
        document.addEventListener("keydown", function (keyEvent) { _this._handleKeydown(keyEvent); });
        document.addEventListener("keyup", function (keyEvent) { _this._handleKeyup(keyEvent); });
        this._element.addEventListener("mousemove", function (ev) { _this._handleMouseMove(ev); });
        document.addEventListener('pointerlockchange', function () { _this._handlePointerLockChange(); }, false);
        document.addEventListener('mozpointerlockchange', function () { _this._handlePointerLockChange(); }, false);
        document.addEventListener('webkitpointerlockchange', function () { _this._handlePointerLockChange(); }, false);
        this._element.requestFullscreen = this._element.requestFullscreen || this._element.webkitRequestFullScreen || this._element.mozRequestFullScreen;
        this._element.addEventListener("click", function () {
            if (Config_1.default.PLAY_FULLSCREEN && _this._element.requestFullscreen)
                _this._element.requestFullscreen();
            _this._element.requestPointerLock();
        });
    };
    Input.prototype.onKeydown = function (callback) {
        return this._createCallbackToList(this._keydownCallbacks, callback);
    };
    Input.prototype.onKeyup = function (callback) {
        return this._createCallbackToList(this._keyupCallbacks, callback);
    };
    Input.prototype.onMouseMove = function (callback) {
        return this._createCallbackToList(this._mousemoveCallbacks, callback);
    };
    Input.prototype.deleteCallback = function (id) {
        if (this._deleteFromList(this._keydownCallbacks, id)) {
            return;
        }
        if (this._deleteFromList(this._keyupCallbacks, id)) {
            return;
        }
        if (this._deleteFromList(this._mousemoveCallbacks, id)) {
            return;
        }
    };
    return Input;
}());
exports.default = (new Input());
},{"./Config":3,"./Utils":12}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Poolify_1 = require("./Poolify");
var Node = (function () {
    function Node() {
        this.clear();
    }
    Node.prototype.clear = function () {
        this.prev = null;
        this.next = null;
        this.item = null;
    };
    Node.prototype.delete = function () {
        pool.free(this);
    };
    Node.allocate = function (item) {
        var ret = pool.allocate();
        ret.item = item;
        return ret;
    };
    return Node;
}());
var pool = new Poolify_1.default(100, Node);
var List = (function () {
    function List() {
        this._head = null;
        this._tail = null;
        this._length = 0;
    }
    List.prototype.push = function (item) {
        var node = Node.allocate(item);
        if (this._head == null) {
            this._head = node;
            this._tail = node;
        }
        else {
            var tail = this._tail;
            node.prev = tail;
            tail.next = node;
            this._tail = node;
        }
        this._length += 1;
    };
    List.prototype.remove = function (item) {
        var node = this._head;
        while (node) {
            if (node.item == item) {
                if (node.prev) {
                    if (this._tail == node) {
                        this._tail = node.prev;
                    }
                    node.prev.next = node.next;
                }
                if (node.next) {
                    if (this._head == node) {
                        this._head = node.next;
                    }
                    node.next.prev = node.prev;
                }
                node.delete();
                this._length -= 1;
                return;
            }
            node = node.next;
        }
    };
    List.prototype.getAt = function (index) {
        if (this._length == 0) {
            return null;
        }
        var node = this._head, count = 0;
        while (count < index) {
            node = node.next;
            count++;
            if (!node) {
                return null;
            }
        }
        return node.item;
    };
    List.prototype.insertAt = function (index, item) {
        var node = this._head, count = 0;
        this._length++;
        while (count < index) {
            node = node.next;
            count++;
            if (!node) {
                this.push(item);
                return;
            }
        }
        var newItem = Node.allocate(item);
        if (this._head == node) {
            this._head.prev = newItem;
            newItem.next = this._head;
            this._head = newItem;
        }
        else {
            newItem.next = node;
            newItem.prev = node.prev;
            if (node.prev)
                node.prev.next = newItem;
            node.prev = newItem;
        }
    };
    List.prototype.each = function (callback) {
        var item = this._head;
        while (item) {
            callback(item.item);
            item = item.next;
        }
    };
    List.prototype.clear = function () {
        var node = this._head;
        while (node) {
            node.delete();
            node = node.next;
        }
    };
    List.prototype.sort = function (sortCheck) {
        if (this._length < 2) {
            return;
        }
        var node = this._head.next, compare = this._head;
        while (node) {
            var next = node.next;
            if (sortCheck(node.item, compare.item)) {
                if (node.prev) {
                    node.prev.next = node.next;
                }
                if (node.next) {
                    node.next.prev = node.prev;
                }
                node.next = compare;
                node.prev = compare.prev;
                if (compare.prev)
                    compare.prev.next = node;
                compare.prev = node;
                if (compare == this._head) {
                    this._head = node;
                }
                if (compare == this._tail) {
                    this._tail = node;
                }
                node = next;
                compare = this._head;
            }
            else {
                compare = compare.next;
            }
            if (compare == node) {
                node = next;
                compare = this._head;
            }
        }
    };
    Object.defineProperty(List.prototype, "head", {
        get: function () {
            return this._head;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(List.prototype, "length", {
        get: function () {
            return this._length;
        },
        enumerable: true,
        configurable: true
    });
    return List;
}());
exports.default = List;
},{"./Poolify":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Poolify = (function () {
    function Poolify(limit, ClassName) {
        this._limit = limit;
        this._class = ClassName;
        this._members = new Array(limit);
        for (var i = 0; i < limit; i++) {
            var obj = new ClassName();
            obj.inUse = false;
            this._members[i] = obj;
        }
    }
    Poolify.prototype.allocate = function () {
        for (var i = 0, member = void 0; member = this._members[i]; i++) {
            if (!member.inUse) {
                member.inUse = true;
                return member;
            }
        }
        console.log(this._class);
        throw new Error("Ran out of objects, limit set: " + this._limit);
    };
    Poolify.prototype.free = function (object) {
        object.clear();
        object.inUse = false;
    };
    return Poolify;
}());
exports.default = Poolify;
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shader_1 = require("./shaders/Shader");
var Basic_1 = require("./shaders/Basic");
var Color_1 = require("./shaders/Color");
var Renderer = (function () {
    function Renderer(width, height, container) {
        this._createCanvas(width, height, container);
        this._initGL();
        this._initShaders();
    }
    Renderer.prototype._createCanvas = function (width, height, container) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        if (container) {
            container.appendChild(canvas);
        }
        this._canvas = canvas;
    };
    Renderer.prototype._initGL = function () {
        var gl = this._canvas.getContext("webgl");
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        this._gl = gl;
    };
    Renderer.prototype._initShaders = function () {
        this._shaders = {};
        this._shaders.BASIC = new Shader_1.default(this._gl, Basic_1.default);
        this._shaders.COLOR = new Shader_1.default(this._gl, Color_1.default);
        this._shaders.BASIC.useProgram();
    };
    Renderer.prototype.clear = function () {
        var gl = this._gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };
    Renderer.prototype.switchShader = function (shaderName) {
        this._shaders[shaderName].useProgram();
    };
    Renderer.prototype.getShader = function (shaderName) {
        return this._shaders[shaderName];
    };
    Object.defineProperty(Renderer.prototype, "GL", {
        get: function () {
            return this._gl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "width", {
        get: function () {
            return this._canvas.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "height", {
        get: function () {
            return this._canvas.height;
        },
        enumerable: true,
        configurable: true
    });
    return Renderer;
}());
exports.default = Renderer;
},{"./shaders/Basic":28,"./shaders/Color":29,"./shaders/Shader":30}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var List_1 = require("./List");
var RenderingLayer = (function () {
    function RenderingLayer() {
        this._instances = new List_1.default();
        this.onPrerender = null;
        this.onPostUpdate = null;
    }
    RenderingLayer.prototype._createInstanceMap = function (instance) {
        return {
            instance: instance,
            params: {}
        };
    };
    RenderingLayer.prototype.addInstance = function (instance) {
        var added = false;
        for (var i = 0, ins = void 0; ins = this._instances.getAt(i); i++) {
            var cond1 = (!ins.instance.material && !instance.material), cond2 = (ins.instance.material && instance.material && ins.instance.material.shaderName == instance.material.shaderName);
            if (cond1 || cond2) {
                this._instances.insertAt(i, this._createInstanceMap(instance));
                i = this._instances.length;
                added = true;
                break;
            }
        }
        if (!added) {
            this._instances.push(this._createInstanceMap(instance));
        }
    };
    RenderingLayer.prototype.awake = function () {
        this._instances.each(function (instance) {
            instance.instance.awake();
        });
    };
    RenderingLayer.prototype.update = function () {
        var _this = this;
        this._instances.each(function (instance) {
            var ins = instance.instance;
            if (ins.isDestroyed) {
                _this._instances.remove(instance);
                return;
            }
            ins.update();
            if (_this.onPostUpdate) {
                _this.onPostUpdate(instance);
            }
        });
    };
    RenderingLayer.prototype.render = function (camera) {
        if (this.onPrerender) {
            this.onPrerender(this._instances);
        }
        this._instances.each(function (instance) {
            instance.instance.render(camera);
        });
    };
    return RenderingLayer;
}());
exports.default = RenderingLayer;
},{"./List":6}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RenderingLayer_1 = require("./RenderingLayer");
var List_1 = require("./List");
var Utils_1 = require("./Utils");
var Scene = (function () {
    function Scene(renderer) {
        this._renderer = renderer;
        this._camera = null;
        this._started = false;
        this._initLayers();
    }
    Scene.prototype._initLayers = function () {
        var _this = this;
        this._renderingLayers = new List_1.default();
        var opaques = new RenderingLayer_1.default();
        this._renderingLayers.push(opaques);
        var transparents = new RenderingLayer_1.default();
        this._renderingLayers.push(transparents);
        transparents.onPostUpdate = (function (item) {
            item.params.distance = Utils_1.getSquaredDistance(item.instance.position, _this._camera.position);
        });
        transparents.onPrerender = function (instances) {
            instances.sort(function (itemA, itemB) {
                return (itemA.params.distance > itemB.params.distance);
            });
        };
    };
    Scene.prototype.addGameObject = function (instance) {
        var mat = instance.material;
        instance.setScene(this);
        if (this._started) {
            instance.awake();
        }
        var layer = this._renderingLayers.getAt(0);
        if (mat && !mat.isOpaque) {
            layer = this._renderingLayers.getAt(1);
        }
        layer.addInstance(instance);
    };
    Scene.prototype.testCollision = function (instance, direction) {
        instance;
        return direction;
    };
    Scene.prototype.setCamera = function (camera) {
        this._camera = camera;
    };
    Scene.prototype.init = function () {
        this._renderingLayers.each(function (layer) {
            layer.awake();
        });
        this._started = true;
    };
    Scene.prototype.update = function () {
        this._renderingLayers.each(function (layer) {
            layer.update();
        });
    };
    Scene.prototype.render = function () {
        var _this = this;
        this._renderingLayers.each(function (layer) {
            layer.render(_this._camera);
        });
    };
    return Scene;
}());
exports.default = Scene;
},{"./List":6,"./RenderingLayer":9,"./Utils":12}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector4_1 = require("./math/Vector4");
var Texture = (function () {
    function Texture(src, renderer, callback) {
        var _this = this;
        this._renderer = renderer;
        this.texture = renderer.GL.createTexture();
        this._ready = false;
        if (src.getContext) {
            this._canvas = src;
            this._img = null;
            this._src = null;
            this._onReady();
        }
        else {
            this._canvas = null;
            this._src = src;
            this._img = new Image();
            this._img.src = this._src;
            this._img.onload = function () {
                _this._onReady();
                if (callback) {
                    callback(_this);
                }
            };
        }
    }
    Texture.prototype._onReady = function () {
        var gl = this._renderer.GL;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, (this._canvas) ? this._canvas : this._img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._ready = true;
    };
    Texture.prototype.getUVS = function (x, y, w, h) {
        var _x;
        if (x.length !== undefined) {
            _x = x.x;
            y = x.y;
            w = x.z;
            h = x.w;
        }
        return new Vector4_1.Vector4(_x / this.width, y / this.height, w / this.width, h / this.height);
    };
    Object.defineProperty(Texture.prototype, "isReady", {
        get: function () {
            return this._ready;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "width", {
        get: function () {
            return (this._canvas) ? this._canvas.width : this._img.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "height", {
        get: function () {
            return (this._canvas) ? this._canvas.height : this._img.height;
        },
        enumerable: true,
        configurable: true
    });
    return Texture;
}());
exports.default = Texture;
},{"./math/Vector4":27}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector3_1 = require("./math/Vector3");
var Config_1 = require("./Config");
var Constants_1 = require("./Constants");
function createUUID() {
    var date = (new Date()).getTime(), ret = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function (c) {
        var ran = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (c == 'x' ? ran : (ran & 0x3 | 0x8)).toString(16);
    });
    return ret;
}
exports.createUUID = createUUID;
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
exports.degToRad = degToRad;
function get2DVectorDir(x, y) {
    if (x == 1 && y == 0) {
        return 0;
    }
    else if (x == 1 && y == -1) {
        return degToRad(45);
    }
    else if (x == 0 && y == -1) {
        return degToRad(90);
    }
    else if (x == -1 && y == -1) {
        return degToRad(135);
    }
    else if (x == -1 && y == 0) {
        return Math.PI;
    }
    else if (x == -1 && y == 1) {
        return degToRad(225);
    }
    else if (x == 0 && y == 1) {
        return degToRad(270);
    }
    else if (x == 1 && y == 1) {
        return degToRad(315);
    }
}
exports.get2DVectorDir = get2DVectorDir;
function get2DAngle(position1, position2) {
    var x = position2.x - position1.x, y = position2.z - position1.z;
    var ret = Math.atan2(-y, x);
    return (ret + Constants_1.PI2) % Constants_1.PI2;
}
exports.get2DAngle = get2DAngle;
function getSquaredDistance(position1, position2) {
    var x = position1.x - position2.x, y = position1.y - position2.y, z = position1.z - position2.z;
    return x * x + y * y + z * z;
}
exports.getSquaredDistance = getSquaredDistance;
function coordsToOrtho(camera, x, y) {
    return Vector3_1.vec3(x - camera.screenSize.x / 2.0, (camera.screenSize.y / 2.0) - y, 0.0);
}
exports.coordsToOrtho = coordsToOrtho;
function pixelCoordsToWorld(vector) {
    return vector.set(vector.x * Config_1.default.PIXEL_UNIT_RELATION, vector.y * Config_1.default.PIXEL_UNIT_RELATION, vector.z * Config_1.default.PIXEL_UNIT_RELATION);
}
exports.pixelCoordsToWorld = pixelCoordsToWorld;
function roundUpPowerOf2(x) {
    var ret = 2;
    while (ret < x) {
        ret *= 2;
    }
    return ret;
}
exports.roundUpPowerOf2 = roundUpPowerOf2;
function httpRequest(url, callback) {
    var http = new XMLHttpRequest();
    http.open('GET', url, true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    };
    http.send();
}
exports.httpRequest = httpRequest;
var smallPool = [];
function rememberPoolAlloc(object) {
    smallPool.push(object);
    return object;
}
exports.rememberPoolAlloc = rememberPoolAlloc;
function freePoolAlloc() {
    for (var i = 0, obj = void 0; obj = smallPool[i]; i++) {
        obj.delete();
    }
    smallPool.length = 0;
}
exports.freePoolAlloc = freePoolAlloc;
},{"./Config":3,"./Constants":4,"./math/Vector3":26}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Collision_1 = require("./Collision");
var ColorMaterial_1 = require("../materials/ColorMaterial");
var CubeGeometry_1 = require("../geometries/CubeGeometry");
var Vector4_1 = require("../math/Vector4");
var Instance_1 = require("../entities/Instance");
var BoxCollision = (function (_super) {
    __extends(BoxCollision, _super);
    function BoxCollision(position, size) {
        var _this = _super.call(this, null) || this;
        _this._position = position;
        _this._size = size;
        _this.isDynamic = false;
        _this._recalc();
        return _this;
    }
    BoxCollision.prototype._reorderBox = function (box) {
        for (var i = 0; i < 3; i++) {
            if (box[3 + i] < box[0 + i]) {
                var h = box[0 + i];
                box[0 + i] = box[3 + i];
                box[3 + i] = h;
            }
        }
        return box;
    };
    BoxCollision.prototype._boxCollision = function (box) {
        var b = this._box;
        if (box[0] >= b[3] || box[1] >= b[4] || box[2] >= b[5] || box[3] < b[0] || box[4] < b[1] || box[5] < b[2]) {
            return false;
        }
        return true;
    };
    BoxCollision.prototype._recalc = function () {
        var position = this._position, size = this._size;
        var px = position.x + this._offset.x, py = position.y + this._offset.y, pz = position.z + this._offset.z, sx = size.x / 2, sy = size.y / 2, sz = size.z / 2;
        this._box = this._reorderBox([px - sx, py - sy, pz - sz, px + sx, py + sy, pz + sz]);
    };
    BoxCollision.prototype.test = function (position, direction) {
        if (this.isDynamic) {
            this._recalc();
        }
        var collided = false, width = 0.3, height = 0.8, x = position.x, y = position.y, z = position.z, xTo = direction.x, zTo = direction.z, sign = (direction.x > 0) ? 1 : -1, box = this._reorderBox([x - width * sign, y, z - width, x + width * sign + direction.x, y + height, z + width]);
        if (this._boxCollision(box)) {
            xTo = 0;
            collided = true;
        }
        x += xTo;
        sign = (direction.z > 0) ? 1 : -1;
        box = this._reorderBox([x - width, y, z - width * sign, x + width, y + height, z + width * sign + direction.z]);
        if (this._boxCollision(box)) {
            zTo = 0;
            collided = true;
        }
        if (!collided) {
            return null;
        }
        if (this.solid) {
            direction.set(xTo, 0, zTo);
        }
        return direction;
    };
    BoxCollision.prototype.addCollisionInstance = function (renderer) {
        var geometry = new CubeGeometry_1.default(renderer, this._size.x, this._size.y, this._size.z), material = new ColorMaterial_1.default(renderer, new Vector4_1.Vector4(0.0, 1.0, 0.0, 0.5)), object = Instance_1.default.allocate(renderer, geometry, material);
        material.setOpaque(false);
        object.position = this._position;
        geometry.offset = this._offset;
        this._scene.addGameObject(object);
        this._displayInstance = object;
    };
    BoxCollision.prototype.centerInAxis = function (x, y, z) {
        this._offset.x = (!x) ? this._size.x / 2 : 0;
        this._offset.y = (!y) ? this._size.y / 2 : 0;
        this._offset.z = (!z) ? this._size.z / 2 : 0;
        this._recalc();
        return this;
    };
    return BoxCollision;
}(Collision_1.default));
exports.default = BoxCollision;
},{"../entities/Instance":15,"../geometries/CubeGeometry":17,"../materials/ColorMaterial":23,"../math/Vector4":27,"./Collision":14}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector3_1 = require("../math/Vector3");
var Collision = (function () {
    function Collision(scene) {
        this.setScene(scene);
        this.solid = true;
        this._offset = new Vector3_1.Vector3(0, 0, 0);
    }
    Collision.prototype.setScene = function (scene) {
        this._scene = scene;
    };
    Collision.prototype.setInstance = function (instance) {
        this._instance = instance;
    };
    Collision.prototype.addCollisionInstance = function (renderer) {
        renderer;
    };
    Collision.prototype.destroy = function () {
        this._displayInstance.destroy();
    };
    Object.defineProperty(Collision.prototype, "instance", {
        get: function () {
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collision.prototype, "displayInstance", {
        get: function () {
            return this._displayInstance;
        },
        enumerable: true,
        configurable: true
    });
    return Collision;
}());
exports.default = Collision;
},{"../math/Vector3":26}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shader_1 = require("../shaders/Shader");
var Matrix4_1 = require("../math/Matrix4");
var Vector3_1 = require("../math/Vector3");
var Utils_1 = require("../Utils");
var Config_1 = require("../Config");
var Utils_2 = require("../Utils");
var Poolify_1 = require("../Poolify");
var List_1 = require("../List");
var Instance = (function () {
    function Instance(renderer, geometry, material) {
        if (renderer === void 0) { renderer = null; }
        if (geometry === void 0) { geometry = null; }
        if (material === void 0) { material = null; }
        this._transform = Matrix4_1.default.createIdentity();
        this.position = new Vector3_1.Vector3(0.0);
        this._rotation = new Vector3_1.Vector3(0.0);
        this.isBillboard = false;
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._renderer = renderer;
        this._scene = null;
        this._components = new List_1.default();
        this._collision = null;
        this._destroyed = false;
    }
    Instance.prototype.translate = function (x, y, z, relative) {
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (relative === void 0) { relative = false; }
        var _x;
        if (x.length) {
            _x = x.x;
            y = x.y;
            z = x.z;
        }
        else {
            _x = x;
        }
        if (relative) {
            this.position.add(_x, y, z);
        }
        else {
            this.position.set(_x, y, z);
        }
        this._needsUpdate = true;
        if (this._collision && this._collision.displayInstance) {
            this._collision.displayInstance.translate(x, y, z, true);
        }
        return this;
    };
    Instance.prototype.rotate = function (x, y, z, relative) {
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (relative === void 0) { relative = false; }
        var _x;
        if (x.length) {
            _x = x.x;
            y = x.y;
            z = x.z;
        }
        else {
            _x = x;
        }
        if (relative) {
            this._rotation.add(_x, y, z);
        }
        else {
            this._rotation.set(_x, y, z);
        }
        this._needsUpdate = true;
        return this;
    };
    Instance.prototype.setScene = function (scene) {
        this._scene = scene;
    };
    Instance.prototype.addComponent = function (component) {
        this._components.push(component);
        component.addInstance(this);
    };
    Instance.prototype.getComponent = function (componentName) {
        for (var i = 0, comp = void 0; comp = this._components.getAt(i); i++) {
            if (comp.name == componentName) {
                return comp;
            }
        }
        return null;
    };
    Instance.prototype.getTransformation = function () {
        if (!this._needsUpdate) {
            return this._transform;
        }
        this._transform.setIdentity();
        this._transform.multiply(Utils_2.rememberPoolAlloc(Matrix4_1.default.createXRotation(this._rotation.x)));
        this._transform.multiply(Utils_2.rememberPoolAlloc(Matrix4_1.default.createZRotation(this._rotation.z)));
        this._transform.multiply(Utils_2.rememberPoolAlloc(Matrix4_1.default.createYRotation(this._rotation.y)));
        var offset = this._geometry.offset;
        this._transform.translate(this.position.x + offset.x, this.position.y + offset.y, this.position.z + offset.z);
        this._needsUpdate = false;
        Utils_2.freePoolAlloc();
        return this._transform;
    };
    Instance.prototype.setCollision = function (collision) {
        this._collision = collision;
        collision.setInstance(this);
    };
    Instance.prototype.set = function (renderer, geometry, material) {
        if (geometry === void 0) { geometry = null; }
        if (material === void 0) { material = null; }
        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._destroyed = false;
    };
    Instance.prototype.clear = function () {
        this.position.set(0, 0, 0);
        this._rotation.set(0, 0, 0);
        this._transform.setIdentity();
        this._renderer = null;
        this._geometry = null;
        this._material = null;
        this.isBillboard = false;
        this._needsUpdate = true;
        this._scene = null;
        this._components.clear();
        this._collision = null;
        this._destroyed = true;
    };
    Instance.prototype.delete = function () {
        pool.free(this);
    };
    Instance.prototype.awake = function () {
        this._components.each(function (component) {
            component.awake();
        });
        if (this._collision && Config_1.default.DISPLAY_COLLISIONS) {
            var collision = this._collision;
            collision.setScene(this._scene);
            collision.addCollisionInstance(this._renderer);
        }
    };
    Instance.prototype.update = function () {
        this._components.each(function (component) {
            component.update();
        });
    };
    Instance.prototype.destroy = function () {
        this._components.each(function (component) {
            component.destroy();
        });
        if (this._geometry.isDynamic) {
            this._geometry.destroy();
        }
        if (this._collision && Config_1.default.DISPLAY_COLLISIONS) {
            this._collision.destroy();
        }
        this._destroyed = true;
        this.delete();
    };
    Instance.prototype.render = function (camera) {
        if (!this._geometry || !this._material) {
            return;
        }
        if (!this._material.isReady) {
            return;
        }
        this._renderer.switchShader(this._material.shaderName);
        var gl = this._renderer.GL, shader = Shader_1.default.lastProgram;
        if (this.isBillboard) {
            this.rotate(0, Utils_1.get2DAngle(this.position, camera.position) + Math.PI / 2, 0);
        }
        var uPosition = Matrix4_1.default.allocate();
        uPosition.multiply(this.getTransformation());
        uPosition.multiply(camera.getTransformation());
        gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(shader.uniforms["uPosition"], false, uPosition.data);
        this._material.render();
        this._geometry.render();
        uPosition.delete();
    };
    Instance.allocate = function (renderer, geometry, material) {
        if (geometry === void 0) { geometry = null; }
        if (material === void 0) { material = null; }
        var ins = pool.allocate();
        ins.set(renderer, geometry, material);
        return ins;
    };
    Object.defineProperty(Instance.prototype, "geometry", {
        get: function () {
            return this._geometry;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instance.prototype, "material", {
        get: function () {
            return this._material;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instance.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instance.prototype, "collision", {
        get: function () {
            return this._collision;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instance.prototype, "scene", {
        get: function () {
            return this._scene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instance.prototype, "isDestroyed", {
        get: function () {
            return this._destroyed;
        },
        enumerable: true,
        configurable: true
    });
    return Instance;
}());
var pool = new Poolify_1.default(20, Instance);
exports.default = Instance;
},{"../Config":3,"../List":6,"../Poolify":7,"../Utils":12,"../math/Matrix4":25,"../math/Vector3":26,"../shaders/Shader":30}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Texture_1 = require("../Texture");
var BasicMaterial_1 = require("../materials/BasicMaterial");
var WallGeometry_1 = require("../geometries/WallGeometry");
var Vector3_1 = require("../math/Vector3");
var Utils_1 = require("../Utils");
var Instance_1 = require("../entities/Instance");
var OptionsDefault = {
    size: 12,
    stroke: false,
    fill: true,
    fillColor: '#FFFFFF',
    strokeColor: '#FFFFFF',
    position: new Vector3_1.Vector3(0.0, 0.0, 0.0),
    rotation: new Vector3_1.Vector3(0.0, 0.0, 0.0)
};
var Text = (function (_super) {
    __extends(Text, _super);
    function Text(renderer, text, font, options) {
        var _this = _super.call(this, renderer) || this;
        _this._text = text;
        _this._font = font;
        _this._options = _this._mergeOptions(options);
        _this._printText();
        return _this;
    }
    Text.prototype._mergeOptions = function (options) {
        if (!options) {
            return OptionsDefault;
        }
        if (!options.size) {
            options.size = OptionsDefault.size;
        }
        if (!options.stroke) {
            options.stroke = OptionsDefault.stroke;
        }
        if (!options.fill) {
            options.fill = OptionsDefault.fill;
        }
        if (!options.fillColor) {
            options.fillColor = OptionsDefault.fillColor;
        }
        if (!options.strokeColor) {
            options.strokeColor = OptionsDefault.strokeColor;
        }
        if (!options.position) {
            options.position = OptionsDefault.position;
        }
        if (!options.rotation) {
            options.rotation = OptionsDefault.rotation;
        }
        return options;
    };
    Text.prototype._printText = function () {
        var canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
        ctx.font = this._options.size + "px " + this._font;
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.oImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        var size = ctx.measureText(this._text);
        canvas.width = Utils_1.roundUpPowerOf2(size.width);
        canvas.height = Utils_1.roundUpPowerOf2(this._options.size);
        ctx.font = this._options.size + "px " + this._font;
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.oImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        if (this._options.fill) {
            ctx.fillStyle = this._options.fillColor;
            ctx.fillText(this._text, 4, this._options.size);
        }
        if (this._options.stroke) {
            ctx.strokeStyle = this._options.strokeColor;
            ctx.strokeText(this._text, 4, this._options.size);
        }
        var uvs = [0, 0, (size.width + 4) / canvas.width, (this._options.size + 8) / canvas.height], texture = new Texture_1.default(canvas, this._renderer), material = new BasicMaterial_1.default(this._renderer, texture), geometry = new WallGeometry_1.default(this._renderer, size.width / 100, this._options.size / 100);
        material.setUv(uvs[0], uvs[1], uvs[2], uvs[3]);
        material.setOpaque(false);
        this._material = material;
        this._geometry = geometry;
        this.translate(this._options.position.x, this._options.position.y, this._options.position.z);
        this.rotate(this._options.rotation.x, this._options.rotation.y, this._options.rotation.z);
    };
    return Text;
}(Instance_1.default));
exports.default = Text;
},{"../Texture":11,"../Utils":12,"../entities/Instance":15,"../geometries/WallGeometry":20,"../materials/BasicMaterial":22,"../math/Vector3":26}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Geometry_1 = require("../geometries/Geometry");
var CubeGeometry = (function (_super) {
    __extends(CubeGeometry, _super);
    function CubeGeometry(renderer, width, height, length) {
        var _this = _super.call(this) || this;
        _this._renderer = renderer;
        _this._dynamic = true;
        _this._buildCube(width, height, length);
        return _this;
    }
    CubeGeometry.prototype._buildCube = function (width, height, length) {
        var w = width / 2, h = height / 2, l = length / 2;
        this.addVertice(-w, -h, l);
        this.addVertice(w, -h, l);
        this.addVertice(-w, h, l);
        this.addVertice(w, h, l);
        this.addVertice(w, -h, -l);
        this.addVertice(-w, -h, -l);
        this.addVertice(w, h, -l);
        this.addVertice(-w, h, -l);
        this.addVertice(-w, -h, -l);
        this.addVertice(-w, -h, l);
        this.addVertice(-w, h, -l);
        this.addVertice(-w, h, l);
        this.addVertice(w, -h, l);
        this.addVertice(w, -h, -l);
        this.addVertice(w, h, l);
        this.addVertice(w, h, -l);
        this.addVertice(-w, h, l);
        this.addVertice(w, h, l);
        this.addVertice(-w, h, -l);
        this.addVertice(w, h, -l);
        this.addVertice(w, -h, l);
        this.addVertice(-w, -h, l);
        this.addVertice(w, -h, -l);
        this.addVertice(-w, -h, -l);
        for (var i = 0; i < 6; i++) {
            var ind = i * 4;
            this.addTriangle(ind + 0, ind + 1, ind + 2);
            this.addTriangle(ind + 1, ind + 3, ind + 2);
            this.addTexCoord(0.0, 1.0);
            this.addTexCoord(1.0, 1.0);
            this.addTexCoord(0.0, 0.0);
            this.addTexCoord(1.0, 0.0);
        }
        this.build(this._renderer);
    };
    return CubeGeometry;
}(Geometry_1.default));
exports.default = CubeGeometry;
},{"../geometries/Geometry":18}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("../Constants");
var Shader_1 = require("../shaders/Shader");
var Vector3_1 = require("../math/Vector3");
var Geometry = (function () {
    function Geometry() {
        this._vertices = [];
        this._texCoords = [];
        this._triangles = [];
        this._boundingBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        this.offset = new Vector3_1.Vector3(0, 0, 0);
        this._dynamic = false;
    }
    Geometry.prototype.addVertice = function (x, y, z) {
        this._vertices.push(x, y, z);
        this._boundingBox = [
            Math.min(this._boundingBox[0], x),
            Math.min(this._boundingBox[1], y),
            Math.min(this._boundingBox[2], z),
            Math.max(this._boundingBox[3], x),
            Math.max(this._boundingBox[4], y),
            Math.max(this._boundingBox[5], z)
        ];
    };
    Geometry.prototype.addTexCoord = function (x, y) {
        this._texCoords.push(x, y);
    };
    Geometry.prototype.addTriangle = function (vert1, vert2, vert3) {
        if (this._vertices[vert1 * Constants_1.VERTICE_SIZE] === undefined) {
            throw new Error("Vertice [" + vert1 + "] not found!");
        }
        if (this._vertices[vert2 * Constants_1.VERTICE_SIZE] === undefined) {
            throw new Error("Vertice [" + vert2 + "] not found!");
        }
        if (this._vertices[vert3 * Constants_1.VERTICE_SIZE] === undefined) {
            throw new Error("Vertice [" + vert3 + "] not found!");
        }
        this._triangles.push(vert1, vert2, vert3);
    };
    Geometry.prototype.build = function (renderer) {
        var gl = renderer.GL;
        this._renderer = renderer;
        this._vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);
        this._texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoords), gl.STATIC_DRAW);
        this._indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._triangles), gl.STATIC_DRAW);
        this._indexLength = this._triangles.length;
        this._vertices = null;
        this._texCoords = null;
        this._triangles = null;
    };
    Geometry.prototype.clearBoundBoxAxis = function (x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (x == 1) {
            this._boundingBox[0] = 0;
            this._boundingBox[3] = 0;
        }
        if (y == 1) {
            this._boundingBox[1] = 0;
            this._boundingBox[4] = 0;
        }
        if (z == 1) {
            this._boundingBox[2] = 0;
            this._boundingBox[5] = 0;
        }
        return this;
    };
    Geometry.prototype.destroy = function () {
        var gl = this._renderer.GL;
        gl.deleteBuffer(this._vertexBuffer);
        gl.deleteBuffer(this._texBuffer);
        gl.deleteBuffer(this._indexBuffer);
    };
    Geometry.prototype.render = function () {
        var gl = this._renderer.GL, shader = Shader_1.default.lastProgram;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(shader.attributes["aVertexPosition"], Constants_1.VERTICE_SIZE, gl.FLOAT, false, 0, 0);
        if (shader.attributes["aTexCoords"]) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
            gl.vertexAttribPointer(shader.attributes["aTexCoords"], Constants_1.TEXCOORD_SIZE, gl.FLOAT, false, 0, 0);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.drawElements(gl.TRIANGLES, this._indexLength, gl.UNSIGNED_SHORT, 0);
    };
    Object.defineProperty(Geometry.prototype, "isDynamic", {
        get: function () {
            return this._dynamic;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Geometry.prototype, "boundingBox", {
        get: function () {
            return this._boundingBox;
        },
        enumerable: true,
        configurable: true
    });
    return Geometry;
}());
exports.default = Geometry;
},{"../Constants":4,"../math/Vector3":26,"../shaders/Shader":30}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Geometry_1 = require("../geometries/Geometry");
var PlaneGeometry = (function (_super) {
    __extends(PlaneGeometry, _super);
    function PlaneGeometry(renderer, width, height) {
        var _this = _super.call(this) || this;
        _this._renderer = renderer;
        _this._dynamic = true;
        _this._buildPlane(width, height);
        return _this;
    }
    PlaneGeometry.prototype._buildPlane = function (width, height) {
        var w = width / 2, h = height / 2;
        this.addVertice(-w, 0, h);
        this.addVertice(w, 0, h);
        this.addVertice(-w, 0, -h);
        this.addVertice(w, 0, -h);
        this.addTriangle(0, 1, 2);
        this.addTriangle(1, 3, 2);
        this.addTexCoord(0.0, 1.0);
        this.addTexCoord(1.0, 1.0);
        this.addTexCoord(0.0, 0.0);
        this.addTexCoord(1.0, 0.0);
        this.build(this._renderer);
    };
    return PlaneGeometry;
}(Geometry_1.default));
exports.default = PlaneGeometry;
},{"../geometries/Geometry":18}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Geometry_1 = require("../geometries/Geometry");
var WallGeometry = (function (_super) {
    __extends(WallGeometry, _super);
    function WallGeometry(renderer, width, height) {
        var _this = _super.call(this) || this;
        _this._renderer = renderer;
        _this._dynamic = true;
        _this._buildWall(width, height);
        return _this;
    }
    WallGeometry.prototype._buildWall = function (width, height) {
        var w = width / 2, h = height / 2;
        this.addVertice(-w, -h, 0);
        this.addVertice(w, -h, 0);
        this.addVertice(-w, h, 0);
        this.addVertice(w, h, 0);
        this.addTriangle(0, 1, 2);
        this.addTriangle(1, 3, 2);
        this.addTexCoord(0.0, 1.0);
        this.addTexCoord(1.0, 1.0);
        this.addTexCoord(0.0, 0.0);
        this.addTexCoord(1.0, 0.0);
        this.build(this._renderer);
    };
    return WallGeometry;
}(Geometry_1.default));
exports.default = WallGeometry;
},{"../geometries/Geometry":18}],21:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Renderer_1 = require("./Renderer");
exports.Renderer = Renderer_1.default;
var Camera_1 = require("./Camera");
exports.Camera = Camera_1.default;
var Component_1 = require("./Component");
exports.Component = Component_1.default;
var Config_1 = require("./Config");
exports.Config = Config_1.default;
__export(require("./Constants"));
var Input_1 = require("./Input");
exports.Input = Input_1.default;
var List_1 = require("./List");
exports.List = List_1.default;
var Poolify_1 = require("./Poolify");
exports.Poolify = Poolify_1.default;
var RenderingLayer_1 = require("./RenderingLayer");
exports.RenderingLayer = RenderingLayer_1.default;
var Scene_1 = require("./Scene");
exports.Scene = Scene_1.default;
var Texture_1 = require("./Texture");
exports.Texture = Texture_1.default;
__export(require("./Utils"));
var BoxCollision_1 = require("./collisions/BoxCollision");
exports.BoxCollision = BoxCollision_1.default;
var Collision_1 = require("./collisions/Collision");
exports.Collision = Collision_1.default;
var Instance_1 = require("./entities/Instance");
exports.Instance = Instance_1.default;
var Text_1 = require("./entities/Text");
exports.Text = Text_1.default;
var CubeGeometry_1 = require("./geometries/CubeGeometry");
exports.CubeGeometry = CubeGeometry_1.default;
var PlaneGeometry_1 = require("./geometries/PlaneGeometry");
exports.PlaneGeometry = PlaneGeometry_1.default;
var WallGeometry_1 = require("./geometries/WallGeometry");
exports.WallGeometry = WallGeometry_1.default;
var Geometry_1 = require("./geometries/Geometry");
exports.Geometry = Geometry_1.default;
var BasicMaterial_1 = require("./materials/BasicMaterial");
exports.BasicMaterial = BasicMaterial_1.default;
var ColorMaterial_1 = require("./materials/ColorMaterial");
exports.ColorMaterial = ColorMaterial_1.default;
var Material_1 = require("./materials/Material");
exports.Material = Material_1.default;
var Matrix4_1 = require("./math/Matrix4");
exports.Matrix4 = Matrix4_1.default;
var Vector3_1 = require("./math/Vector3");
exports.Vector3 = Vector3_1.Vector3;
exports.vec3 = Vector3_1.vec3;
var Vector4_1 = require("./math/Vector4");
exports.Vector4 = Vector4_1.Vector4;
var Shader_1 = require("./shaders/Shader");
exports.Shader = Shader_1.default;
var Basic_1 = require("./shaders/Basic");
exports.Basic = Basic_1.default;
var Color_1 = require("./shaders/Color");
exports.Color = Color_1.default;
},{"./Camera":1,"./Component":2,"./Config":3,"./Constants":4,"./Input":5,"./List":6,"./Poolify":7,"./Renderer":8,"./RenderingLayer":9,"./Scene":10,"./Texture":11,"./Utils":12,"./collisions/BoxCollision":13,"./collisions/Collision":14,"./entities/Instance":15,"./entities/Text":16,"./geometries/CubeGeometry":17,"./geometries/Geometry":18,"./geometries/PlaneGeometry":19,"./geometries/WallGeometry":20,"./materials/BasicMaterial":22,"./materials/ColorMaterial":23,"./materials/Material":24,"./math/Matrix4":25,"./math/Vector3":26,"./math/Vector4":27,"./shaders/Basic":28,"./shaders/Color":29,"./shaders/Shader":30}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Material_1 = require("../materials/Material");
var Shader_1 = require("../shaders/Shader");
var BasicMaterial = (function (_super) {
    __extends(BasicMaterial, _super);
    function BasicMaterial(renderer, texture) {
        var _this = _super.call(this, renderer, "BASIC") || this;
        _this._texture = texture;
        _this._uv = [0.0, 0.0, 1.0, 1.0];
        _this._repeat = [1.0, 1.0];
        return _this;
    }
    BasicMaterial.prototype.setUv = function (x, y, w, h) {
        this._uv = [x, y, w, h];
    };
    BasicMaterial.prototype.setRepeat = function (x, y) {
        this._repeat = [x, y];
    };
    BasicMaterial.prototype.render = function () {
        if (Material_1.default.lastRendered == this) {
            return;
        }
        var gl = this._renderer.GL, shader = Shader_1.default.lastProgram;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture.texture);
        gl.uniform1i(shader.uniforms["uTexture"], 0);
        gl.uniform4fv(shader.uniforms["uUV"], this._uv);
        gl.uniform2fv(shader.uniforms["uRepeat"], this._repeat);
        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        }
        else {
            gl.enable(gl.CULL_FACE);
        }
        Material_1.default.lastRendered = this;
    };
    Object.defineProperty(BasicMaterial.prototype, "isReady", {
        get: function () {
            return this._texture.isReady;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BasicMaterial.prototype, "texture", {
        get: function () {
            return this._texture;
        },
        enumerable: true,
        configurable: true
    });
    return BasicMaterial;
}(Material_1.default));
exports.default = BasicMaterial;
},{"../materials/Material":24,"../shaders/Shader":30}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Material_1 = require("../materials/Material");
var Shader_1 = require("../shaders/Shader");
var ColorMaterial = (function (_super) {
    __extends(ColorMaterial, _super);
    function ColorMaterial(renderer, color) {
        var _this = _super.call(this, renderer, "COLOR") || this;
        _this._color = color.toArray();
        return _this;
    }
    ColorMaterial.prototype.render = function () {
        if (Material_1.default.lastRendered == this) {
            return;
        }
        var gl = this._renderer.GL, shader = Shader_1.default.lastProgram;
        gl.uniform4fv(shader.uniforms["uColor"], this._color);
        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        }
        else {
            gl.enable(gl.CULL_FACE);
        }
        Material_1.default.lastRendered = this;
    };
    Object.defineProperty(ColorMaterial.prototype, "isReady", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return ColorMaterial;
}(Material_1.default));
exports.default = ColorMaterial;
},{"../materials/Material":24,"../shaders/Shader":30}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../Utils");
var Material = (function () {
    function Material(renderer, shaderName) {
        this._renderer = renderer;
        this.shaderName = shaderName;
        this.uuid = Utils_1.createUUID();
        this._isOpaque = true;
        this._renderBothFaces = false;
    }
    Material.prototype.getShader = function () {
        return this._renderer.getShader(this.shaderName);
    };
    Object.defineProperty(Material.prototype, "isOpaque", {
        get: function () {
            return this._isOpaque;
        },
        enumerable: true,
        configurable: true
    });
    Material.prototype.setOpaque = function (opaque) {
        this._isOpaque = opaque;
        return this;
    };
    Material.prototype.setCulling = function (bothFaces) {
        this._renderBothFaces = bothFaces;
        return this;
    };
    Material.lastRendered = null;
    return Material;
}());
exports.default = Material;
},{"../Utils":12}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector4_1 = require("../math/Vector4");
var Poolify_1 = require("../Poolify");
var Matrix4 = (function () {
    function Matrix4() {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        this.data = new Array(16);
        if (values.length == 0) {
            return;
        }
        if (values.length != 16) {
            throw new Error("Matrix4 needs 16 values to be created");
        }
        for (var i = 0; i < 16; i++) {
            this.data[i] = values[i];
        }
    }
    Matrix4.prototype.set = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        if (values.length != 16) {
            throw new Error("Matrix4 needs 16 values to be created");
        }
        for (var i = 0; i < 16; i++) {
            this.data[i] = values[i];
        }
        return this;
    };
    Matrix4.prototype.multiply = function (matrixB) {
        var T = matrixB.data;
        var C1 = new Vector4_1.Vector4(T[0], T[4], T[8], T[12]);
        var C2 = new Vector4_1.Vector4(T[1], T[5], T[9], T[13]);
        var C3 = new Vector4_1.Vector4(T[2], T[6], T[10], T[14]);
        var C4 = new Vector4_1.Vector4(T[3], T[7], T[11], T[15]);
        T = this.data;
        var R1 = new Vector4_1.Vector4(T[0], T[1], T[2], T[3]);
        var R2 = new Vector4_1.Vector4(T[4], T[5], T[6], T[7]);
        var R3 = new Vector4_1.Vector4(T[8], T[9], T[10], T[11]);
        var R4 = new Vector4_1.Vector4(T[12], T[13], T[14], T[15]);
        this.set(Vector4_1.Vector4.dot(R1, C1), Vector4_1.Vector4.dot(R1, C2), Vector4_1.Vector4.dot(R1, C3), Vector4_1.Vector4.dot(R1, C4), Vector4_1.Vector4.dot(R2, C1), Vector4_1.Vector4.dot(R2, C2), Vector4_1.Vector4.dot(R2, C3), Vector4_1.Vector4.dot(R2, C4), Vector4_1.Vector4.dot(R3, C1), Vector4_1.Vector4.dot(R3, C2), Vector4_1.Vector4.dot(R3, C3), Vector4_1.Vector4.dot(R3, C4), Vector4_1.Vector4.dot(R4, C1), Vector4_1.Vector4.dot(R4, C2), Vector4_1.Vector4.dot(R4, C3), Vector4_1.Vector4.dot(R4, C4));
        return this;
    };
    Matrix4.prototype.translate = function (x, y, z, relative) {
        if (z === void 0) { z = 0; }
        if (relative === void 0) { relative = false; }
        if (relative) {
            this.data[12] += x;
            this.data[13] += y;
            this.data[14] += z;
        }
        else {
            this.data[12] = x;
            this.data[13] = y;
            this.data[14] = z;
        }
    };
    Matrix4.prototype.setIdentity = function () {
        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this;
    };
    Matrix4.prototype.delete = function () {
        pool.free(this);
    };
    Matrix4.prototype.clear = function () {
        this.setIdentity();
    };
    Matrix4.createIdentity = function () {
        return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    };
    Matrix4.createOrtho = function (width, height, znear, zfar) {
        var l = -width / 2.0, r = width / 2.0, b = -height / 2.0, t = height / 2.0, A = 2.0 / (r - l), B = 2.0 / (t - b), C = -2 / (zfar - znear), X = -(r + l) / (r - l), Y = -(t + b) / (t - b), Z = -(zfar + znear) / (zfar - znear);
        return new Matrix4(A, 0, 0, 0, 0, B, 0, 0, 0, 0, C, 0, X, Y, Z, 1);
    };
    Matrix4.createPerspective = function (fov, ratio, znear, zfar) {
        var S = 1 / Math.tan(fov / 2), R = S * ratio, A = -(zfar) / (zfar - znear), B = -(zfar * znear) / (zfar - znear);
        return new Matrix4(S, 0, 0, 0, 0, R, 0, 0, 0, 0, A, -1, 0, 0, B, 0);
    };
    Matrix4.allocate = function () {
        return pool.allocate();
    };
    Matrix4.createTranslate = function (x, y, z) {
        return Matrix4.allocate().set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
    };
    Matrix4.createXRotation = function (radians) {
        var C = Math.cos(radians), S = Math.sin(radians);
        return Matrix4.allocate().set(1, 0, 0, 0, 0, C, -S, 0, 0, S, C, 0, 0, 0, 0, 1);
    };
    Matrix4.createYRotation = function (radians) {
        var C = Math.cos(radians), S = Math.sin(radians);
        return Matrix4.allocate().set(C, 0, -S, 0, 0, 1, 0, 0, S, 0, C, 0, 0, 0, 0, 1);
    };
    Matrix4.createZRotation = function (radians) {
        var C = Math.cos(radians), S = Math.sin(radians);
        return Matrix4.allocate().set(C, -S, 0, 0, S, C, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    };
    return Matrix4;
}());
var pool = new Poolify_1.default(5, Matrix4);
exports.default = Matrix4;
},{"../Poolify":7,"../math/Vector4":27}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Poolify_1 = require("../Poolify");
var Vector3 = (function () {
    function Vector3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.set(x, y, z);
    }
    Vector3.prototype.clear = function () {
        this.set(0, 0, 0);
        return this;
    };
    Vector3.prototype.set = function (x, y, z) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.needsUpdate = true;
        return this;
    };
    Vector3.prototype.add = function (x, y, z) {
        this._x += x;
        this._y += y;
        this._z += z;
        this.needsUpdate = true;
        return this;
    };
    Vector3.prototype.multiply = function (num) {
        this._x *= num;
        this._y *= num;
        this._z *= num;
        this.needsUpdate = true;
        return this;
    };
    Vector3.prototype.normalize = function () {
        var l = this.length;
        this.multiply(1 / l);
        return this;
    };
    Vector3.prototype.clone = function () {
        return vec3(this.x, this.y, this.z);
    };
    Vector3.prototype.delete = function () {
        pool.free(this);
    };
    Vector3.prototype.equals = function (vector3) {
        return (this.x == vector3.x && this.y == vector3.y && this.z == vector3.z);
    };
    Object.defineProperty(Vector3.prototype, "x", {
        get: function () { return this._x; },
        set: function (x) { this._x = x; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "y", {
        get: function () { return this._y; },
        set: function (y) { this._y = y; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "z", {
        get: function () { return this._z; },
        set: function (z) { this._z = z; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "length", {
        get: function () {
            if (!this.needsUpdate) {
                return this._length;
            }
            this._length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            this.needsUpdate = false;
            return this._length;
        },
        enumerable: true,
        configurable: true
    });
    Vector3.cross = function (vectorA, vectorB) {
        return vec3(vectorA.y * vectorB.z - vectorA.z * vectorB.y, vectorA.z * vectorB.x - vectorA.x * vectorB.z, vectorA.x * vectorB.y - vectorA.y * vectorB.x);
    };
    Vector3.dot = function (vectorA, vectorB) {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
    };
    return Vector3;
}());
exports.Vector3 = Vector3;
var pool = new Poolify_1.default(10, Vector3);
function vec3(x, y, z) {
    if (x === void 0) { x = 0; }
    if (y === undefined && z === undefined) {
        z = x;
    }
    else if (z === undefined) {
        z = 0;
    }
    if (y === undefined) {
        y = x;
    }
    var obj = (pool.allocate());
    return obj.set(x, y, z);
}
exports.vec3 = vec3;
},{"../Poolify":7}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector4 = (function () {
    function Vector4(x, y, z, w) {
        this.set(x, y, z, w);
    }
    Vector4.prototype.set = function (x, y, z, w) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this.needsUpdate = true;
        return this;
    };
    Vector4.prototype.add = function (x, y, z, w) {
        this._x += x;
        this._y += y;
        this._z += z;
        this._w += w;
        this.needsUpdate = true;
        return this;
    };
    Vector4.prototype.multiply = function (num) {
        this._x *= num;
        this._y *= num;
        this._z *= num;
        this._w *= num;
        this.needsUpdate = true;
        return this;
    };
    Vector4.prototype.normalize = function () {
        var l = this.length;
        this.multiply(1 / l);
        return this;
    };
    Vector4.prototype.toArray = function () {
        return [this.x, this.y, this.z, this.w];
    };
    Object.defineProperty(Vector4.prototype, "x", {
        get: function () { return this._x; },
        set: function (x) { this._x = x; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "y", {
        get: function () { return this._y; },
        set: function (y) { this._y = y; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "z", {
        get: function () { return this._z; },
        set: function (z) { this._z = z; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "w", {
        get: function () { return this._w; },
        set: function (w) { this._w = w; this.needsUpdate = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "length", {
        get: function () {
            if (!this.needsUpdate) {
                return this._length;
            }
            this._length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            this.needsUpdate = false;
            return this._length;
        },
        enumerable: true,
        configurable: true
    });
    Vector4.dot = function (vectorA, vectorB) {
        var ret = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z + vectorA.w * vectorB.w;
        return ret;
    };
    return Vector4;
}());
exports.Vector4 = Vector4;
},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Basic = {
    vertexShader: "\n        precision mediump float;\n\n        attribute vec3 aVertexPosition;\n        attribute vec2 aTexCoords;\n\n        uniform mat4 uProjection;\n        uniform mat4 uPosition;\n\n        varying vec2 vTexCoords;\n\n        void main(void) {\n            gl_Position = uProjection * uPosition * vec4(aVertexPosition, 1.0);\n\n            vTexCoords = aTexCoords;\n        }\n    ",
    fragmentShader: "\n        precision mediump float;\n        \n        uniform vec4 uUV;\n        uniform vec2 uRepeat;\n        uniform sampler2D uTexture;\n\n        varying vec2 vTexCoords;\n\n        void main(void) {\n            vec2 coords = mod(clamp(vTexCoords, 0.0, 1.0) * uRepeat, 1.0) * uUV.zw + uUV.xy;\n\n            //gl_FragColor = vec4(texture2D(uTexture, coords).rgb, 1.0);\n            gl_FragColor = texture2D(uTexture, coords);;\n        }\n    "
};
exports.default = Basic;
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Color = {
    vertexShader: "\n        precision mediump float;\n\n        attribute vec3 aVertexPosition;\n\n        uniform mat4 uProjection;\n        uniform mat4 uPosition;\n\n        void main(void) {\n            gl_Position = uProjection * uPosition * vec4(aVertexPosition, 1.0);\n        }\n    ",
    fragmentShader: "\n        precision mediump float;\n\n        uniform vec4 uColor;\n\n        void main(void) {\n            gl_FragColor = uColor;\n        }\n    "
};
exports.default = Color;
},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../Utils");
;
var Shader = (function () {
    function Shader(gl, shader) {
        this.gl = gl;
        this.attributes = {};
        this.uniforms = {};
        this.uuid = Utils_1.createUUID();
        this.compileShaders(shader);
        this.getShaderAttributes(shader);
        this.getShaderUniforms(shader);
    }
    Shader.prototype.compileShaders = function (shader) {
        var gl = this.gl;
        var vShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, shader.vertexShader);
        gl.compileShader(vShader);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, shader.fragmentShader);
        gl.compileShader(fShader);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vShader));
            throw new Error("Error compiling vertex shader");
        }
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fShader));
            throw new Error("Error compiling fragment shader");
        }
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(this.program));
            throw new Error("Error linking the program");
        }
    };
    Shader.prototype.getShaderAttributes = function (shader) {
        var code = shader.vertexShader.split(/\n/g);
        var gl = this.gl;
        var attribute;
        var location;
        this.attributesCount = 0;
        for (var i = 0, len = code.length; i < len; i++) {
            var c = code[i].trim().split(/ /g);
            if (c[0] == 'attribute') {
                attribute = c.pop().replace(/;/g, "");
                location = gl.getAttribLocation(this.program, attribute);
                gl.enableVertexAttribArray(location);
                this.attributes[attribute] = location;
                this.attributesCount += 1;
            }
        }
        Shader.maxAttribLength = Math.max(Shader.maxAttribLength, this.attributesCount);
    };
    Shader.prototype.getShaderUniforms = function (shader) {
        var code = shader.vertexShader.split(/\n/g);
        code = code.concat(shader.fragmentShader.split(/\n/g));
        var gl = this.gl;
        var uniform;
        var location;
        var usedUniforms = [];
        for (var i = 0, len = code.length; i < len; i++) {
            var c = code[i].trim().split(/ /g);
            if (c[0] == "uniform") {
                uniform = c.pop().replace(/;/g, "");
                if (usedUniforms.indexOf(uniform) != -1) {
                    continue;
                }
                location = gl.getUniformLocation(this.program, uniform);
                usedUniforms.push(uniform);
                this.uniforms[uniform] = location;
            }
        }
    };
    Shader.prototype.useProgram = function () {
        if (Shader.lastProgram == this) {
            return;
        }
        var gl = this.gl;
        gl.useProgram(this.program);
        Shader.lastProgram = this;
        var attribLength = this.attributesCount;
        for (var i = 0, len = Shader.maxAttribLength; i < len; i++) {
            if (i < attribLength) {
                gl.enableVertexAttribArray(i);
            }
            else {
                gl.disableVertexAttribArray(i);
            }
        }
    };
    return Shader;
}());
Shader.maxAttribLength = 0;
Shader.lastProgram = null;
exports.default = Shader;
},{"../Utils":12}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../engine");
var App = (function () {
    function App() {
        var render = new engine_1.Renderer(854, 480, document.getElementById("divGame"));
        render.clear();
    }
    return App;
}());
window.onload = function () { return new App(); };
},{"../../engine":21}]},{},[31])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL0NhbWVyYS50cyIsInNyYy9lbmdpbmUvQ29tcG9uZW50LnRzIiwic3JjL2VuZ2luZS9Db25maWcudHMiLCJzcmMvZW5naW5lL0NvbnN0YW50cy50cyIsInNyYy9lbmdpbmUvSW5wdXQudHMiLCJzcmMvZW5naW5lL0xpc3QudHMiLCJzcmMvZW5naW5lL1Bvb2xpZnkudHMiLCJzcmMvZW5naW5lL1JlbmRlcmVyLnRzIiwic3JjL2VuZ2luZS9SZW5kZXJpbmdMYXllci50cyIsInNyYy9lbmdpbmUvU2NlbmUudHMiLCJzcmMvZW5naW5lL1RleHR1cmUudHMiLCJzcmMvZW5naW5lL1V0aWxzLnRzIiwic3JjL2VuZ2luZS9jb2xsaXNpb25zL0JveENvbGxpc2lvbi50cyIsInNyYy9lbmdpbmUvY29sbGlzaW9ucy9Db2xsaXNpb24udHMiLCJzcmMvZW5naW5lL2VudGl0aWVzL0luc3RhbmNlLnRzIiwic3JjL2VuZ2luZS9lbnRpdGllcy9UZXh0LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9HZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL1dhbGxHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvaW5kZXgudHMiLCJzcmMvZW5naW5lL21hdGVyaWFscy9CYXNpY01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbC50cyIsInNyYy9lbmdpbmUvbWF0ZXJpYWxzL01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRoL01hdHJpeDQudHMiLCJzcmMvZW5naW5lL21hdGgvVmVjdG9yMy50cyIsInNyYy9lbmdpbmUvbWF0aC9WZWN0b3I0LnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0Jhc2ljLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0NvbG9yLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL1NoYWRlci50cyIsInNyYy9leGFtcGxlcy9lbmdpbmVEZXYvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSwwQ0FBcUM7QUFDckMsMENBQStDO0FBQy9DLGlDQUFrRTtBQUVsRTtJQVlJLGdCQUFZLFVBQW1CO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUzQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU0sNEJBQVcsR0FBbEIsVUFBbUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sMEJBQVMsR0FBaEIsVUFBaUIsQ0FBUyxFQUFFLENBQVMs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S0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFcEgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNSLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsQ0FBQztRQUVELENBQUMsSUFBSSxHQUFHLENBQUM7UUFFVCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDUixRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNiLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENB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QyxDQUFDO1FBR25CLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVoQixJQUFJLENBQUMsV0FBVyxD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R0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRS9DLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2QsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxHQUFHLENBQ0osaUJB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LEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUUxRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUNMLFVBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsY0FBTSxPQUFBLElBQUksR0FBRyxFQUFFLEVBQVQsQ0FBUyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBNYXRyaXg0IGZyb20gJy4vbWF0aC9NYXRyaXg0JztcclxuaW1wb3J0IHsgVmVjdG9yMywgdmVjMyB9IGZyb20gJy4vbWF0aC9WZWN0b3IzJztcclxuaW1wb3J0IHsgcmVtZW1iZXJQb29sQWxsb2MgYXMgcnBhLCBmcmVlUG9vbEFsbG9jIH0gZnJvbSAnLi9VdGlscyc7XHJcblxyXG5jbGFzcyBDYW1lcmEge1xyXG4gICAgcHJpdmF0ZSBfdHJhbnNmb3JtICAgICAgICAgICA6IE1hdHJpeDQ7XHJcbiAgICBwcml2YXRlIF90YXJnZXQgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByaXZhdGUgX3VwICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG4gICAgcHJpdmF0ZSBfYW5nbGUgICAgICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcml2YXRlIF9uZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgcG9zaXRpb24gICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHB1YmxpYyBzY3JlZW5TaXplICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG5cclxuICAgIHB1YmxpYyByZWFkb25seSBwcm9qZWN0aW9uICAgICAgICAgIDogTWF0cml4NDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9qZWN0aW9uOiBNYXRyaXg0KSB7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gcHJvamVjdGlvbjtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSBNYXRyaXg0LmNyZWF0ZUlkZW50aXR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLl90YXJnZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLl91cCA9IG5ldyBWZWN0b3IzKDAsIDEsIDApO1xyXG4gICAgICAgIHRoaXMuX2FuZ2xlID0gbmV3IFZlY3RvcjMoMC4wKTtcclxuICAgICAgICB0aGlzLnNjcmVlblNpemUgPSBuZXcgVmVjdG9yMygwLjApO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBDYW1lcmEge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRUYXJnZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XHJcbiAgICAgICAgdGhpcy5fdGFyZ2V0LnNldCh4LCB5LCB6KTtcclxuXHJcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0QW5nbGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XHJcbiAgICAgICAgdGhpcy5fYW5nbGUuc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRBbmdsZSgpOiBWZWN0b3IzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW5nbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFRyYW5zZm9ybWF0aW9uKCk6IE1hdHJpeDQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmID0gcnBhKHRoaXMuZm9yd2FyZCksXHJcbiAgICAgICAgICAgIGwgPSBycGEoVmVjdG9yMy5jcm9zcyh0aGlzLl91cCwgZikubm9ybWFsaXplKCkpLFxyXG4gICAgICAgICAgICB1ID0gcnBhKFZlY3RvcjMuY3Jvc3MoZiwgbCkubm9ybWFsaXplKCkpO1xyXG5cclxuICAgICAgICBsZXQgY3AgPSB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICB4ID0gLVZlY3RvcjMuZG90KGwsIGNwKSxcclxuICAgICAgICAgICAgeSA9IC1WZWN0b3IzLmRvdCh1LCBjcCksXHJcbiAgICAgICAgICAgIHogPSAtVmVjdG9yMy5kb3QoZiwgY3ApO1xyXG5cclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0KFxyXG4gICAgICAgICAgICBsLngsIHUueCwgZi54LCAwLFxyXG4gICAgICAgICAgICBsLnksIHUueSwgZi55LCAwLFxyXG4gICAgICAgICAgICBsLnosIHUueiwgZi56LCAwLFxyXG4gICAgICAgICAgICAgIHgsICAgeSwgICB6LCAxXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmcmVlUG9vbEFsbG9jKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBmb3J3YXJkKCk6IFZlY3RvcjMge1xyXG4gICAgICAgIGxldCBjcCA9IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgIHQgPSB0aGlzLl90YXJnZXQ7XHJcblxyXG4gICAgICAgIHJldHVybiB2ZWMzKGNwLnggLSB0LngsIGNwLnkgLSB0LnksIGNwLnogLSB0LnopLm5vcm1hbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNVcGRhdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5fbmVlZHNVcGRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVQZXJzcGVjdGl2ZShmb3Y6IG51bWJlciwgcmF0aW86IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogQ2FtZXJhIHtcclxuICAgICAgICByZXR1cm4gbmV3IENhbWVyYShNYXRyaXg0LmNyZWF0ZVBlcnNwZWN0aXZlKGZvdiwgcmF0aW8sIHpuZWFyLCB6ZmFyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVPcnRob2dyYXBoaWMod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHpuZWFyOiBudW1iZXIsIHpmYXI6IG51bWJlcik6IENhbWVyYSB7XHJcbiAgICAgICAgbGV0IHJldCA9IG5ldyBDYW1lcmEoTWF0cml4NC5jcmVhdGVPcnRobyh3aWR0aCwgaGVpZ2h0LCB6bmVhciwgemZhcikpO1xyXG4gICAgICAgIHJldC5zY3JlZW5TaXplLnNldCh3aWR0aCwgaGVpZ2h0LCAwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhOyIsImltcG9ydCBJbnN0YW5jZSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcclxuXHJcbmFic3RyYWN0IGNsYXNzIENvbXBvbmVudCB7XHJcbiAgICBwcm90ZWN0ZWQgX2luc3RhbmNlICAgICAgICAgICAgICAgICA6IEluc3RhbmNlO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSAgICAgICAgICAgICAgICAgICAgOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGNvbXBvbmVudE5hbWUgICAgOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29tcG9uZW50TmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gY29tcG9uZW50TmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBpbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgYXdha2UoKTogdm9pZDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCB1cGRhdGUoKTogdm9pZDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudDsiLCJsZXQgQ29uZmlnID0ge1xyXG4gICAgUExBWV9GVUxMU0NSRUVOICAgICAgICA6IGZhbHNlLFxyXG4gICAgRElTUExBWV9DT0xMSVNJT05TICAgICA6IGZhbHNlLFxyXG5cclxuICAgIFBJWEVMX1VOSVRfUkVMQVRJT04gICAgOiAxIC8gMTYsXHJcblxyXG4gICAgc2V0VW5pdFBpeGVsc1dpZHRoOiBmdW5jdGlvbih3aWR0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5QSVhFTF9VTklUX1JFTEFUSU9OID0gMSAvIHdpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnOyIsImV4cG9ydCBjb25zdCBWRVJUSUNFX1NJWkUgICAgICAgICAgID0gMztcclxuZXhwb3J0IGNvbnN0IFRFWENPT1JEX1NJWkUgICAgICAgICAgPSAyO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBJXzIgICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJIC8gMjtcclxuZXhwb3J0IGNvbnN0IFBJMiAgICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMjtcclxuZXhwb3J0IGNvbnN0IFBJM18yICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMyAvIDI7IiwiaW1wb3J0IHsgY3JlYXRlVVVJRCB9IGZyb20gJy4vVXRpbHMnO1xyXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vQ29uZmlnJztcclxuXHJcbmludGVyZmFjZSBDYWxsYmFjayB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG59XHJcblxyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwcml2YXRlIF9lbGVtZW50ICAgICAgICAgICAgICAgICA6IEhUTUxFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBfa2V5ZG93bkNhbGxiYWNrcyAgICAgICAgOiBBcnJheTxDYWxsYmFjaz47XHJcbiAgICBwcml2YXRlIF9rZXl1cENhbGxiYWNrcyAgICAgICAgICA6IEFycmF5PENhbGxiYWNrPjtcclxuICAgIHByaXZhdGUgX21vdXNlbW92ZUNhbGxiYWNrcyAgICAgIDogQXJyYXk8Q2FsbGJhY2s+O1xyXG4gICAgcHJpdmF0ZSBfZWxlbWVudEZvY3VzICAgICAgICAgICAgOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2tleWRvd25DYWxsYmFja3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9rZXl1cENhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1cyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9oYW5kbGVLZXlkb3duKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbGVtZW50Rm9jdXMpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9rZXlkb3duQ2FsbGJhY2tzW2ldO2krKykge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhrZXlFdmVudC5rZXlDb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGFuZGxlS2V5dXAoa2V5RXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9dGhpcy5fa2V5dXBDYWxsYmFja3NbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGxiYWNrKGtleUV2ZW50LmtleUNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9oYW5kbGVNb3VzZU1vdmUobW91c2VFdmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudEZvY3VzKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9dGhpcy5fbW91c2Vtb3ZlQ2FsbGJhY2tzW2ldO2krKykge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhtb3VzZUV2ZW50Lm1vdmVtZW50WCwgbW91c2VFdmVudC5tb3ZlbWVudFkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9oYW5kbGVQb2ludGVyTG9ja0NoYW5nZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9lbGVtZW50Rm9jdXMgPSAoZG9jdW1lbnQucG9pbnRlckxvY2tFbGVtZW50ID09PSB0aGlzLl9lbGVtZW50KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfZGVsZXRlRnJvbUxpc3QobGlzdDogQXJyYXk8Q2FsbGJhY2s+LCBpZDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wLGNhbGxiYWNrO2NhbGxiYWNrPWxpc3RbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5pZCA9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KGxpc3Q6IEFycmF5PENhbGxiYWNrPiwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgcmV0OiBDYWxsYmFjayA9IHtcclxuICAgICAgICAgICAgaWQ6IGNyZWF0ZVVVSUQoKSxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaXN0LnB1c2gocmV0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldC5pZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdChmb2N1c0VsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGZvY3VzRWxlbWVudDtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleWRvd24oa2V5RXZlbnQpOyB9KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleXVwKGtleUV2ZW50KTsgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZXY6IE1vdXNlRXZlbnQpID0+IHsgdGhpcy5faGFuZGxlTW91c2VNb3ZlKGV2KTsgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJsb2NrY2hhbmdlJywgKCkgPT4geyB0aGlzLl9oYW5kbGVQb2ludGVyTG9ja0NoYW5nZSgpOyB9LCBmYWxzZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW96cG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRwb2ludGVybG9ja2NoYW5nZScsICgpID0+IHsgdGhpcy5faGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTsgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLl9lbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuID0gdGhpcy5fZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCB0aGlzLl9lbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIHx8ICg8YW55PnRoaXMuX2VsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuO1xyXG5cclxuICAgICAgICB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChDb25maWcuUExBWV9GVUxMU0NSRUVOICYmIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IFxyXG5cclxuICAgIHB1YmxpYyBvbktleWRvd24oY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlQ2FsbGJhY2tUb0xpc3QodGhpcy5fa2V5ZG93bkNhbGxiYWNrcywgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgb25LZXl1cChjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYWxsYmFja1RvTGlzdCh0aGlzLl9rZXl1cENhbGxiYWNrcywgY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbk1vdXNlTW92ZShjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYWxsYmFja1RvTGlzdCh0aGlzLl9tb3VzZW1vdmVDYWxsYmFja3MsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVsZXRlQ2FsbGJhY2soaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9kZWxldGVGcm9tTGlzdCh0aGlzLl9rZXlkb3duQ2FsbGJhY2tzLCBpZCkpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZUZyb21MaXN0KHRoaXMuX2tleXVwQ2FsbGJhY2tzLCBpZCkpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZUZyb21MaXN0KHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAobmV3IElucHV0KCkpOyIsImltcG9ydCBQb29saWZ5IGZyb20gJy4vUG9vbGlmeSc7XHJcbmltcG9ydCB7IFBvb2xDbGFzcyB9IGZyb20gJy4vUG9vbGlmeSc7XHJcblxyXG5jbGFzcyBOb2RlIGltcGxlbWVudHMgUG9vbENsYXNzIHtcclxuICAgIHB1YmxpYyBwcmV2ICAgICAgICA6IE5vZGU7XHJcbiAgICBwdWJsaWMgbmV4dCAgICAgICAgOiBOb2RlO1xyXG4gICAgcHVibGljIGl0ZW0gICAgICAgIDogYW55O1xyXG4gICAgcHVibGljIGluVXNlICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucHJldiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLml0ZW0gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGUoKTogdm9pZCB7XHJcbiAgICAgICAgcG9vbC5mcmVlKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgYWxsb2NhdGUoaXRlbTogYW55KTogTm9kZSB7XHJcbiAgICAgICAgbGV0IHJldCA9IHBvb2wuYWxsb2NhdGUoKTtcclxuXHJcbiAgICAgICAgcmV0Lml0ZW0gPSBpdGVtO1xyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgcG9vbCA9IG5ldyBQb29saWZ5KDEwMCwgTm9kZSk7XHJcblxyXG5jbGFzcyBMaXN0PFQ+IHtcclxuICAgIHByaXZhdGUgX2hlYWQgICAgICAgICAgIDogTm9kZTtcclxuICAgIHByaXZhdGUgX3RhaWwgICAgICAgICAgIDogTm9kZTtcclxuICAgIHByaXZhdGUgX2xlbmd0aCAgICAgICAgIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2hlYWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3RhaWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHB1c2goaXRlbTogVCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBub2RlID0gTm9kZS5hbGxvY2F0ZShpdGVtKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkID0gbm9kZTtcclxuICAgICAgICAgICAgdGhpcy5fdGFpbCA9IG5vZGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHRhaWwgPSB0aGlzLl90YWlsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbm9kZS5wcmV2ID0gdGFpbDtcclxuICAgICAgICAgICAgdGFpbC5uZXh0ID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3RhaWwgPSBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbGVuZ3RoICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZShpdGVtOiBUKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xyXG5cclxuICAgICAgICB3aGlsZSAobm9kZSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5pdGVtID09IGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl90YWlsID09IG5vZGUpIHsgdGhpcy5fdGFpbCA9IG5vZGUucHJldjsgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJldi5uZXh0ID0gbm9kZS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHQpeyBcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faGVhZCA9PSBub2RlKSB7IHRoaXMuX2hlYWQgPSBub2RlLm5leHQ7IH1cclxuICAgICAgICAgICAgICAgICAgICBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLmRlbGV0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX2xlbmd0aCAtPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEF0KGluZGV4OiBudW1iZXIpOiBUIHtcclxuICAgICAgICBpZiAodGhpcy5fbGVuZ3RoID09IDApIHsgcmV0dXJuIG51bGw7IH1cclxuXHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkLFxyXG4gICAgICAgICAgICBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIHdoaWxlIChjb3VudCA8IGluZGV4KSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbm9kZS5pdGVtO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgaW5zZXJ0QXQoaW5kZXg6IG51bWJlciwgaXRlbTogVCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZCxcclxuICAgICAgICAgICAgY291bnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLl9sZW5ndGgrKztcclxuXHJcbiAgICAgICAgd2hpbGUgKGNvdW50IDwgaW5kZXgpIHtcclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcclxuICAgICAgICAgICAgY291bnQrKztcclxuXHJcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmV3SXRlbSA9IE5vZGUuYWxsb2NhdGUoaXRlbSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkLnByZXYgPSBuZXdJdGVtO1xyXG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSB0aGlzLl9oZWFkO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkID0gbmV3SXRlbTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSBub2RlO1xyXG4gICAgICAgICAgICBuZXdJdGVtLnByZXYgPSBub2RlLnByZXY7XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKG5vZGUucHJldikgbm9kZS5wcmV2Lm5leHQgPSBuZXdJdGVtO1xyXG4gICAgICAgICAgICBub2RlLnByZXYgPSBuZXdJdGVtO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZWFjaChjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2hlYWQ7XHJcblxyXG4gICAgICAgIHdoaWxlIChpdGVtKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0uaXRlbSk7XHJcblxyXG4gICAgICAgICAgICBpdGVtID0gaXRlbS5uZXh0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xyXG5cclxuICAgICAgICB3aGlsZSAobm9kZSkge1xyXG4gICAgICAgICAgICBub2RlLmRlbGV0ZSgpO1xyXG5cclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNvcnQoc29ydENoZWNrOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggPCAyKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQubmV4dCxcclxuICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XHJcblxyXG4gICAgICAgIHdoaWxlIChub2RlKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gbm9kZS5uZXh0O1xyXG5cclxuICAgICAgICAgICAgaWYgKHNvcnRDaGVjayhub2RlLml0ZW0sIGNvbXBhcmUuaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXYpIHsgbm9kZS5wcmV2Lm5leHQgPSBub2RlLm5leHQ7IH1cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHQpIHsgbm9kZS5uZXh0LnByZXYgPSBub2RlLnByZXY7IH1cclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLm5leHQgPSBjb21wYXJlO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wcmV2ID0gY29tcGFyZS5wcmV2O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlLnByZXYpIGNvbXBhcmUucHJldi5uZXh0ID0gbm9kZTtcclxuICAgICAgICAgICAgICAgIGNvbXBhcmUucHJldiA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlID09IHRoaXMuX2hlYWQpIHsgdGhpcy5faGVhZCA9IG5vZGU7IH0gXHJcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZSA9PSB0aGlzLl90YWlsKSB7IHRoaXMuX3RhaWwgPSBub2RlOyB9XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICBjb21wYXJlID0gdGhpcy5faGVhZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbXBhcmUgPSBjb21wYXJlLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlID09IG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoZWFkKCk6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGlzdDsiLCJjbGFzcyBQb29saWZ5IHtcclxuICAgIHByaXZhdGUgX2xpbWl0ICAgICAgICAgICAgICA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX2NsYXNzICAgICAgICAgICAgICA6IFBvb2xDbGFzcztcclxuICAgIHByaXZhdGUgX21lbWJlcnMgICAgICAgICAgICA6IEFycmF5PFBvb2xDbGFzcz47XHJcblxyXG4gICAgY29uc3RydWN0b3IobGltaXQ6IG51bWJlciwgQ2xhc3NOYW1lOiBhbnkpIHtcclxuICAgICAgICB0aGlzLl9saW1pdCA9IGxpbWl0O1xyXG4gICAgICAgIHRoaXMuX2NsYXNzID0gQ2xhc3NOYW1lO1xyXG4gICAgICAgIHRoaXMuX21lbWJlcnMgPSBuZXcgQXJyYXkobGltaXQpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7aTxsaW1pdDtpKyspIHtcclxuICAgICAgICAgICAgbGV0IG9iaiA9IG5ldyBDbGFzc05hbWUoKTtcclxuICAgICAgICAgICAgb2JqLmluVXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX21lbWJlcnNbaV0gPSBvYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhbGxvY2F0ZSgpOiBhbnkge1xyXG4gICAgICAgIGZvciAobGV0IGk9MCxtZW1iZXI7bWVtYmVyPXRoaXMuX21lbWJlcnNbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghbWVtYmVyLmluVXNlKSB7XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuaW5Vc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5fY2xhc3MpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJhbiBvdXQgb2Ygb2JqZWN0cywgbGltaXQgc2V0OiBcIiArIHRoaXMuX2xpbWl0KTsgXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZyZWUob2JqZWN0OiBhbnkpIHtcclxuICAgICAgICBvYmplY3QuY2xlYXIoKTtcclxuICAgICAgICBvYmplY3QuaW5Vc2UgPSBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUG9vbGlmeTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUG9vbENsYXNzIHtcclxuICAgIGluVXNlICAgICAgICAgICAgOiBib29sZWFuO1xyXG5cclxuICAgIGNsZWFyKCk6IHZvaWQ7XHJcbiAgICBkZWxldGUoKTogdm9pZDtcclxufSIsImltcG9ydCBTaGFkZXIgZnJvbSAnLi9zaGFkZXJzL1NoYWRlcic7XHJcbmltcG9ydCBCYXNpYyBmcm9tICcuL3NoYWRlcnMvQmFzaWMnO1xyXG5pbXBvcnQgQ29sb3IgZnJvbSAnLi9zaGFkZXJzL0NvbG9yJztcclxuaW1wb3J0IHsgU2hhZGVyTWFwLCBTaGFkZXJzTmFtZXMgfSBmcm9tICcuL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcclxuXHJcbmNsYXNzIFJlbmRlcmVyIHtcclxuICAgIHByaXZhdGUgX2NhbnZhcyAgICAgICAgICAgICAgOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHByaXZhdGUgX2dsICAgICAgICAgICAgICAgICAgOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XHJcbiAgICBwcml2YXRlIF9zaGFkZXJzICAgICAgICAgICAgIDogU2hhZGVyTWFwO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY29udGFpbmVyOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyh3aWR0aCwgaGVpZ2h0LCBjb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuX2luaXRHTCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTaGFkZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlQ2FudmFzKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jYW52YXMgPSBjYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEdMKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBnbCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2xcIik7XHJcblxyXG4gICAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xyXG5cclxuICAgICAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcclxuICAgICAgICBcclxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dsID0gZ2w7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdFNoYWRlcnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc2hhZGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLl9zaGFkZXJzLkJBU0lDID0gbmV3IFNoYWRlcih0aGlzLl9nbCwgQmFzaWMpO1xyXG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQ09MT1IgPSBuZXcgU2hhZGVyKHRoaXMuX2dsLCBDb2xvcik7XHJcblxyXG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQkFTSUMudXNlUHJvZ3JhbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9nbDtcclxuXHJcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzd2l0Y2hTaGFkZXIoc2hhZGVyTmFtZTogU2hhZGVyc05hbWVzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc2hhZGVyc1tzaGFkZXJOYW1lXS51c2VQcm9ncmFtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNoYWRlcihzaGFkZXJOYW1lOiBTaGFkZXJzTmFtZXMpOiBTaGFkZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFkZXJzW3NoYWRlck5hbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgR0woKTogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZ2w7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXMud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FudmFzLmhlaWdodDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyZXI7IiwiaW1wb3J0IEluc3RhbmNlIGZyb20gJy4vZW50aXRpZXMvSW5zdGFuY2UnO1xyXG5pbXBvcnQgTGlzdCBmcm9tICcuL0xpc3QnO1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcclxuXHJcbmludGVyZmFjZSBQYXJhbXMge1xyXG4gICAgW2luZGV4OiBzdHJpbmddIDogYW55XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW5zdGFuY2VzTWFwIHtcclxuICAgIGluc3RhbmNlOiBJbnN0YW5jZTtcclxuICAgIHBhcmFtczogUGFyYW1zXHJcbn1cclxuXHJcbmNsYXNzIFJlbmRlcmluZ0xheWVyIHtcclxuICAgIHByaXZhdGUgX2luc3RhbmNlcyAgICAgICAgICAgICAgICAgICA6IExpc3Q8SW5zdGFuY2VzTWFwPjtcclxuXHJcbiAgICBwdWJsaWMgb25QcmVyZW5kZXIgICAgICAgICAgICAgICAgICAgOiBGdW5jdGlvbjtcclxuICAgIHB1YmxpYyBvblBvc3RVcGRhdGUgICAgICAgICAgICAgICAgICA6IEZ1bmN0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2luc3RhbmNlcyA9IG5ldyBMaXN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMub25QcmVyZW5kZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25Qb3N0VXBkYXRlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVJbnN0YW5jZU1hcChpbnN0YW5jZTogSW5zdGFuY2UpOiBJbnN0YW5jZXNNYXAge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7fVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGFkZGVkID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wLGlucztpbnM9dGhpcy5faW5zdGFuY2VzLmdldEF0KGkpO2krKykge1xyXG4gICAgICAgICAgICBsZXQgY29uZDEgPSAoIWlucy5pbnN0YW5jZS5tYXRlcmlhbCAmJiAhaW5zdGFuY2UubWF0ZXJpYWwpLFxyXG4gICAgICAgICAgICAgICAgY29uZDIgPSAoaW5zLmluc3RhbmNlLm1hdGVyaWFsICYmIGluc3RhbmNlLm1hdGVyaWFsICYmIGlucy5pbnN0YW5jZS5tYXRlcmlhbC5zaGFkZXJOYW1lID09IGluc3RhbmNlLm1hdGVyaWFsLnNoYWRlck5hbWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbmQxIHx8IGNvbmQyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMuaW5zZXJ0QXQoaSwgdGhpcy5fY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2UpKTtcclxuICAgICAgICAgICAgICAgIGkgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgYWRkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghYWRkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2VzLnB1c2godGhpcy5fY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2UpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBhd2FrZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbnN0YW5jZXMuZWFjaCgoaW5zdGFuY2U6IEluc3RhbmNlc01hcCkgPT4ge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5pbnN0YW5jZS5hd2FrZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzLmVhY2goKGluc3RhbmNlOiBJbnN0YW5jZXNNYXApID0+IHtcclxuICAgICAgICAgICAgbGV0IGlucyA9IGluc3RhbmNlLmluc3RhbmNlO1xyXG4gICAgICAgICAgICBpZiAoaW5zLmlzRGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMucmVtb3ZlKGluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5zLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub25Qb3N0VXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uUG9zdFVwZGF0ZShpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMub25QcmVyZW5kZXIpIHsgXHJcbiAgICAgICAgICAgIHRoaXMub25QcmVyZW5kZXIodGhpcy5faW5zdGFuY2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2luc3RhbmNlcy5lYWNoKChpbnN0YW5jZTogSW5zdGFuY2VzTWFwKSA9PiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmluc3RhbmNlLnJlbmRlcihjYW1lcmEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJpbmdMYXllcjsiLCJpbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXInO1xyXG5pbXBvcnQgUmVuZGVyaW5nTGF5ZXIgZnJvbSAnLi9SZW5kZXJpbmdMYXllcic7XHJcbmltcG9ydCB7IEluc3RhbmNlc01hcCB9IGZyb20gJy4vUmVuZGVyaW5nTGF5ZXInO1xyXG5pbXBvcnQgTGlzdCBmcm9tICcuL0xpc3QnO1xyXG5pbXBvcnQgeyBnZXRTcXVhcmVkRGlzdGFuY2UgfSBmcm9tICcuL1V0aWxzJztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4vZW50aXRpZXMvSW5zdGFuY2UnO1xyXG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xyXG5cclxuY2xhc3MgU2NlbmUge1xyXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgICAgICAgOiBSZW5kZXJlcjtcclxuICAgIHByb3RlY3RlZCBfY2FtZXJhICAgICAgICAgICAgICAgICAgIDogQ2FtZXJhO1xyXG4gICAgcHJvdGVjdGVkIF9zdGFydGVkICAgICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJpbmdMYXllcnMgICAgICAgICAgOiBMaXN0PFJlbmRlcmluZ0xheWVyPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIpIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdExheWVycygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMgPSBuZXcgTGlzdCgpO1xyXG5cclxuICAgICAgICBsZXQgb3BhcXVlcyA9IG5ldyBSZW5kZXJpbmdMYXllcigpO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5wdXNoKG9wYXF1ZXMpO1xyXG5cclxuICAgICAgICBsZXQgdHJhbnNwYXJlbnRzID0gbmV3IFJlbmRlcmluZ0xheWVyKCk7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLnB1c2godHJhbnNwYXJlbnRzKTtcclxuXHJcbiAgICAgICAgdHJhbnNwYXJlbnRzLm9uUG9zdFVwZGF0ZSA9ICgoaXRlbTogSW5zdGFuY2VzTWFwKSA9PiB7XHJcbiAgICAgICAgICAgIGl0ZW0ucGFyYW1zLmRpc3RhbmNlID0gZ2V0U3F1YXJlZERpc3RhbmNlKGl0ZW0uaW5zdGFuY2UucG9zaXRpb24sIHRoaXMuX2NhbWVyYS5wb3NpdGlvbik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRyYW5zcGFyZW50cy5vblByZXJlbmRlciA9IChpbnN0YW5jZXM6IExpc3Q8SW5zdGFuY2VzTWFwPikgPT4ge1xyXG4gICAgICAgICAgICBpbnN0YW5jZXMuc29ydCgoaXRlbUE6IEluc3RhbmNlc01hcCwgaXRlbUI6IEluc3RhbmNlc01hcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpdGVtQS5wYXJhbXMuZGlzdGFuY2UgPiBpdGVtQi5wYXJhbXMuZGlzdGFuY2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRHYW1lT2JqZWN0KGluc3RhbmNlOiBJbnN0YW5jZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtYXQgPSBpbnN0YW5jZS5tYXRlcmlhbDtcclxuXHJcbiAgICAgICAgaW5zdGFuY2Uuc2V0U2NlbmUodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuYXdha2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsYXllciA9IHRoaXMuX3JlbmRlcmluZ0xheWVycy5nZXRBdCgwKTtcclxuICAgICAgICBpZiAobWF0ICYmICFtYXQuaXNPcGFxdWUpIHtcclxuICAgICAgICAgICAgbGF5ZXIgPSB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZ2V0QXQoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxheWVyLmFkZEluc3RhbmNlKGluc3RhbmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGVzdENvbGxpc2lvbihpbnN0YW5jZTogSW5zdGFuY2UsIGRpcmVjdGlvbjogVmVjdG9yMyk6IFZlY3RvcjMge1xyXG4gICAgICAgIGluc3RhbmNlO1xyXG4gICAgICAgIHJldHVybiBkaXJlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldENhbWVyYShjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IGNhbWVyYTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XHJcbiAgICAgICAgICAgIGxheWVyLmF3YWtlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLmVhY2goKGxheWVyOiBSZW5kZXJpbmdMYXllcikgPT4ge1xyXG4gICAgICAgICAgICBsYXllci51cGRhdGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5lYWNoKChsYXllcjogUmVuZGVyaW5nTGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgbGF5ZXIucmVuZGVyKHRoaXMuX2NhbWVyYSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjZW5lOyIsImltcG9ydCBSZW5kZXJlciBmcm9tICcuL1JlbmRlcmVyJztcclxuaW1wb3J0IHsgVmVjdG9yNCB9IGZyb20gJy4vbWF0aC9WZWN0b3I0JztcclxuXHJcbmNsYXNzIFRleHR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc3JjICAgICAgICAgICAgICAgOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9pbWcgICAgICAgICAgICAgICA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIF9jYW52YXMgICAgICAgICAgICA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBfcmVuZGVyZXIgICAgICAgICAgOiBSZW5kZXJlcjtcclxuICAgIHByaXZhdGUgX3JlYWR5ICAgICAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGV4dHVyZSAgICA6IFdlYkdMVGV4dHVyZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcmM6IHN0cmluZ3xIVE1MQ2FudmFzRWxlbWVudCwgcmVuZGVyZXI6IFJlbmRlcmVyLCBjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSByZW5kZXJlci5HTC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVhZHkgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKDxIVE1MQ2FudmFzRWxlbWVudD5zcmMpLmdldENvbnRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PnNyYztcclxuICAgICAgICAgICAgdGhpcy5faW1nID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc3JjID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVhZHkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zcmMgPSA8c3RyaW5nPnNyYztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2ltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9pbWcuc3JjID0gdGhpcy5fc3JjO1xyXG4gICAgICAgICAgICB0aGlzLl9pbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25SZWFkeSgpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfb25SZWFkeSgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9yZW5kZXJlci5HTDtcclxuXHJcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcclxuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMgOiB0aGlzLl9pbWcpO1xyXG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VVZTKHg6IG51bWJlcnxWZWN0b3I0LCB5PzogbnVtYmVyLCB3PzogbnVtYmVyLCBoPzogbnVtYmVyKTogVmVjdG9yNCB7XHJcbiAgICAgICAgbGV0IF94OiBudW1iZXI7XHJcblxyXG4gICAgICAgIGlmICgoPFZlY3RvcjQ+eCkubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgX3ggPSAoPFZlY3RvcjQ+eCkueDtcclxuICAgICAgICAgICAgeSA9ICg8VmVjdG9yND54KS55O1xyXG4gICAgICAgICAgICB3ID0gKDxWZWN0b3I0PngpLno7XHJcbiAgICAgICAgICAgIGggPSAoPFZlY3RvcjQ+eCkudztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yNChcclxuICAgICAgICAgICAgX3ggLyB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICB5IC8gdGhpcy5oZWlnaHQsXHJcbiAgICAgICAgICAgIHcgLyB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICBoIC8gdGhpcy5oZWlnaHRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fY2FudmFzKT8gdGhpcy5fY2FudmFzLndpZHRoIDogdGhpcy5faW1nLndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMuaGVpZ2h0IDogdGhpcy5faW1nLmhlaWdodDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGV4dHVyZTsiLCJpbXBvcnQgeyBWZWN0b3IzLCB2ZWMzIH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xyXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vQ29uZmlnJztcclxuaW1wb3J0IHsgUEkyIH0gZnJvbSAnLi9Db25zdGFudHMnO1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVVUlEKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksXHJcbiAgICAgICAgcmV0ID0gKCd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnKS5yZXBsYWNlKC9beHldL2csIChjOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmFuID0gKGRhdGUgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICBkYXRlID0gTWF0aC5mbG9vcihkYXRlIC8gMTYpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChjID09ICd4JyA/IHJhbiA6IChyYW4mMHgzfDB4OCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQoZGVncmVlczogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEVmVjdG9yRGlyKHg6IG51bWJlciwgeTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGlmICh4ID09IDEgJiYgeSA9PSAwKSB7IHJldHVybiAwOyB9ZWxzZSBcclxuICAgIGlmICh4ID09IDEgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoNDUpOyB9ZWxzZSBcclxuICAgIGlmICh4ID09IDAgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoOTApOyB9ZWxzZVxyXG4gICAgaWYgKHggPT0gLTEgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoMTM1KTsgfWVsc2VcclxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMCkgeyByZXR1cm4gTWF0aC5QSTsgfWVsc2VcclxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMSkgeyByZXR1cm4gZGVnVG9SYWQoMjI1KTsgfWVsc2VcclxuICAgIGlmICh4ID09IDAgJiYgeSA9PSAxKSB7IHJldHVybiBkZWdUb1JhZCgyNzApOyB9ZWxzZVxyXG4gICAgaWYgKHggPT0gMSAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDMxNSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEQW5nbGUocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xyXG4gICAgbGV0IHggPSBwb3NpdGlvbjIueCAtIHBvc2l0aW9uMS54LFxyXG4gICAgICAgIHkgPSBwb3NpdGlvbjIueiAtIHBvc2l0aW9uMS56O1xyXG5cclxuICAgIGxldCByZXQgPSBNYXRoLmF0YW4yKC15LCB4KTtcclxuXHJcbiAgICByZXR1cm4gKHJldCArIFBJMikgJSBQSTI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTcXVhcmVkRGlzdGFuY2UocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xyXG4gICAgbGV0IHggPSBwb3NpdGlvbjEueCAtIHBvc2l0aW9uMi54LFxyXG4gICAgICAgIHkgPSBwb3NpdGlvbjEueSAtIHBvc2l0aW9uMi55LFxyXG4gICAgICAgIHogPSBwb3NpdGlvbjEueiAtIHBvc2l0aW9uMi56O1xyXG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkc1RvT3J0aG8oY2FtZXJhOiBDYW1lcmEsIHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdmVjMyhcclxuICAgICAgICB4IC0gY2FtZXJhLnNjcmVlblNpemUueCAvIDIuMCxcclxuICAgICAgICAoY2FtZXJhLnNjcmVlblNpemUueSAvIDIuMCkgLSB5LFxyXG4gICAgICAgIDAuMFxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBpeGVsQ29vcmRzVG9Xb3JsZCh2ZWN0b3I6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB2ZWN0b3Iuc2V0KFxyXG4gICAgICAgIHZlY3Rvci54ICogQ29uZmlnLlBJWEVMX1VOSVRfUkVMQVRJT04sXHJcbiAgICAgICAgdmVjdG9yLnkgKiBDb25maWcuUElYRUxfVU5JVF9SRUxBVElPTixcclxuICAgICAgICB2ZWN0b3IueiAqIENvbmZpZy5QSVhFTF9VTklUX1JFTEFUSU9OXHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcm91bmRVcFBvd2VyT2YyKHg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBsZXQgcmV0ID0gMjtcclxuXHJcbiAgICB3aGlsZSAocmV0IDwgeCkge1xyXG4gICAgICAgIHJldCAqPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBodHRwUmVxdWVzdCh1cmw6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICBsZXQgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICAgIGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGh0dHAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGh0dHAuc2VuZCgpO1xyXG59XHJcblxyXG5sZXQgc21hbGxQb29sOiBBcnJheTxhbnk+ID0gW107XHJcbmV4cG9ydCBmdW5jdGlvbiByZW1lbWJlclBvb2xBbGxvYyhvYmplY3Q6IGFueSk6IGFueSB7XHJcbiAgICBzbWFsbFBvb2wucHVzaChvYmplY3QpO1xyXG4gICAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZyZWVQb29sQWxsb2MoKTogdm9pZCB7XHJcbiAgICBmb3IgKGxldCBpPTAsb2JqO29iaj1zbWFsbFBvb2xbaV07aSsrKSB7XHJcbiAgICAgICAgb2JqLmRlbGV0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNtYWxsUG9vbC5sZW5ndGggPSAwO1xyXG59IiwiaW1wb3J0IENvbGxpc2lvbiBmcm9tICcuL0NvbGxpc2lvbic7XHJcbmltcG9ydCBDb2xvck1hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9Db2xvck1hdGVyaWFsJztcclxuaW1wb3J0IEN1YmVHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeSc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xyXG5pbXBvcnQgeyBWZWN0b3I0IH0gZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcclxuXHJcbmNsYXNzIEJveENvbGxpc2lvbiBleHRlbmRzIENvbGxpc2lvbiB7XHJcbiAgICBwcml2YXRlIF9zaXplICAgICAgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByaXZhdGUgX2JveCAgICAgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG5cclxuICAgIHB1YmxpYyBpc0R5bmFtaWMgICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgXHJcblxyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFZlY3RvcjMsIHNpemU6IFZlY3RvcjMpIHtcclxuICAgICAgICBzdXBlcihudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgICAgICB0aGlzLl9zaXplID0gc2l6ZTtcclxuICAgICAgICB0aGlzLmlzRHluYW1pYyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLl9yZWNhbGMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZW9yZGVyQm94KGJveDogQXJyYXk8bnVtYmVyPik6IEFycmF5PG51bWJlcj4ge1xyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDM7aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChib3hbMytpXSA8IGJveFswK2ldKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaCA9IGJveFswK2ldO1xyXG4gICAgICAgICAgICAgICAgYm94WzAraV0gPSBib3hbMytpXTtcclxuICAgICAgICAgICAgICAgIGJveFszK2ldID0gaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJveDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ib3hDb2xsaXNpb24oYm94OiBBcnJheTxudW1iZXI+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGIgPSB0aGlzLl9ib3g7XHJcblxyXG4gICAgICAgIGlmIChib3hbMF0gPj0gYlszXSB8fCBib3hbMV0gPj0gYls0XSB8fCBib3hbMl0gPj0gYls1XSB8fCBib3hbM10gPCBiWzBdIHx8IGJveFs0XSA8IGJbMV0gfHwgYm94WzVdIDwgYlsyXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWNhbGMoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb24sXHJcbiAgICAgICAgICAgIHNpemUgPSB0aGlzLl9zaXplO1xyXG5cclxuICAgICAgICBsZXQgcHggPSBwb3NpdGlvbi54ICsgdGhpcy5fb2Zmc2V0LngsXHJcbiAgICAgICAgICAgIHB5ID0gcG9zaXRpb24ueSArIHRoaXMuX29mZnNldC55LFxyXG4gICAgICAgICAgICBweiA9IHBvc2l0aW9uLnogKyB0aGlzLl9vZmZzZXQueixcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHN4ID0gc2l6ZS54IC8gMixcclxuICAgICAgICAgICAgc3kgPSBzaXplLnkgLyAyLFxyXG4gICAgICAgICAgICBzeiA9IHNpemUueiAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuX2JveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3B4IC0gc3gsIHB5IC0gc3ksIHB6IC0gc3osIHB4ICsgc3gsIHB5ICsgc3ksIHB6ICsgc3pdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGVzdChwb3NpdGlvbjogVmVjdG9yMywgZGlyZWN0aW9uOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEeW5hbWljKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY2FsYygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbGxpZGVkID0gZmFsc2UsXHJcbiAgICAgICAgICAgIHdpZHRoID0gMC4zLFxyXG4gICAgICAgICAgICBoZWlnaHQgPSAwLjgsXHJcbiAgICAgICAgICAgIHggPSBwb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueSxcclxuICAgICAgICAgICAgeiA9IHBvc2l0aW9uLnosXHJcbiAgICAgICAgICAgIHhUbyA9IGRpcmVjdGlvbi54LFxyXG4gICAgICAgICAgICB6VG8gPSBkaXJlY3Rpb24ueixcclxuICAgICAgICAgICAgc2lnbiA9IChkaXJlY3Rpb24ueCA+IDApPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCAqIHNpZ24sIHksIHogLSB3aWR0aCwgeCArIHdpZHRoICogc2lnbiArIGRpcmVjdGlvbi54LCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGhdKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2JveENvbGxpc2lvbihib3gpKSB7XHJcbiAgICAgICAgICAgIHhUbyA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHggKz0geFRvO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNpZ24gPSAoZGlyZWN0aW9uLnogPiAwKT8gMSA6IC0xO1xyXG4gICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCwgeSwgeiAtIHdpZHRoICogc2lnbiwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGggKiBzaWduICsgZGlyZWN0aW9uLnpdKTtcclxuICAgICAgICBpZiAodGhpcy5fYm94Q29sbGlzaW9uKGJveCkpIHtcclxuICAgICAgICAgICAgelRvID0gMDtcclxuICAgICAgICAgICAgY29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjb2xsaWRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNvbGlkKSB7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvbi5zZXQoeFRvLCAwLCB6VG8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQ29sbGlzaW9uSW5zdGFuY2UocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IEN1YmVHZW9tZXRyeShyZW5kZXJlciwgdGhpcy5fc2l6ZS54LCB0aGlzLl9zaXplLnksIHRoaXMuX3NpemUueiksXHJcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IENvbG9yTWF0ZXJpYWwocmVuZGVyZXIsIG5ldyBWZWN0b3I0KDAuMCwgMS4wLCAwLjAsIDAuNSkpLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgb2JqZWN0ID0gSW5zdGFuY2UuYWxsb2NhdGUocmVuZGVyZXIsIGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIG1hdGVyaWFsLnNldE9wYXF1ZShmYWxzZSk7XHJcblxyXG4gICAgICAgIG9iamVjdC5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uO1xyXG5cclxuICAgICAgICBnZW9tZXRyeS5vZmZzZXQgPSB0aGlzLl9vZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZEdhbWVPYmplY3Qob2JqZWN0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlID0gb2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjZW50ZXJJbkF4aXMoeDogYm9vbGVhbiwgeTogYm9vbGVhbiwgejogYm9vbGVhbik6IEJveENvbGxpc2lvbiB7XHJcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnggPSAoIXgpPyB0aGlzLl9zaXplLnggLyAyIDogMDtcclxuICAgICAgICB0aGlzLl9vZmZzZXQueSA9ICgheSk/IHRoaXMuX3NpemUueSAvIDIgOiAwO1xyXG4gICAgICAgIHRoaXMuX29mZnNldC56ID0gKCF6KT8gdGhpcy5fc2l6ZS56IC8gMiA6IDA7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlY2FsYygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCb3hDb2xsaXNpb247IiwiaW1wb3J0IFNjZW5lIGZyb20gJy4uL1NjZW5lJztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcclxuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBDb2xsaXNpb24ge1xyXG4gICAgcHJvdGVjdGVkIF9zY2VuZSAgICAgICAgICAgICAgICA6IFNjZW5lO1xyXG4gICAgcHJvdGVjdGVkIF9pbnN0YW5jZSAgICAgICAgICAgICA6IEluc3RhbmNlO1xyXG4gICAgcHJvdGVjdGVkIF9wb3NpdGlvbiAgICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcm90ZWN0ZWQgX29mZnNldCAgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByb3RlY3RlZCBfZGlzcGxheUluc3RhbmNlICAgICAgOiBJbnN0YW5jZTtcclxuXHJcbiAgICBwdWJsaWMgc29saWQgICAgICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogU2NlbmUpIHtcclxuICAgICAgICB0aGlzLnNldFNjZW5lKHNjZW5lKTtcclxuICAgICAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fb2Zmc2V0ID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IHRlc3QocG9zaXRpb246IFZlY3RvcjMsIGRpcmVjdGlvbjogVmVjdG9yMykgOiBWZWN0b3IzO1xyXG5cclxuICAgIHB1YmxpYyBzZXRTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRJbnN0YW5jZShpbnN0YW5jZTogSW5zdGFuY2UpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbnN0YW5jZSA9IGluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb2xsaXNpb25JbnN0YW5jZShyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkIHtcclxuICAgICAgICByZW5kZXJlcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlLmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGluc3RhbmNlKCk6IEluc3RhbmNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBkaXNwbGF5SW5zdGFuY2UoKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNwbGF5SW5zdGFuY2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbGxpc2lvbjsiLCJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4uL0NhbWVyYSc7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9TY2VuZSc7XHJcbmltcG9ydCBDb2xsaXNpb24gZnJvbSAnLi4vY29sbGlzaW9ucy9Db2xsaXNpb24nO1xyXG5pbXBvcnQgR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XHJcbmltcG9ydCBNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvTWF0ZXJpYWwnO1xyXG5pbXBvcnQgU2hhZGVyIGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyJztcclxuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuLi9Db21wb25lbnQnO1xyXG5pbXBvcnQgTWF0cml4NCBmcm9tICcuLi9tYXRoL01hdHJpeDQnO1xyXG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcclxuaW1wb3J0IHsgZ2V0MkRBbmdsZSB9IGZyb20gJy4uL1V0aWxzJztcclxuaW1wb3J0IENvbmZpZyBmcm9tICcuLi9Db25maWcnO1xyXG5pbXBvcnQgeyByZW1lbWJlclBvb2xBbGxvYyBhcyBycGEsIGZyZWVQb29sQWxsb2MgfSBmcm9tICcuLi9VdGlscyc7XHJcbmltcG9ydCBQb29saWZ5IGZyb20gJy4uL1Bvb2xpZnknO1xyXG5pbXBvcnQgeyBQb29sQ2xhc3MgfSBmcm9tICcuLi9Qb29saWZ5JztcclxuaW1wb3J0IExpc3QgZnJvbSAnLi4vTGlzdCc7XHJcblxyXG5jbGFzcyBJbnN0YW5jZSBpbXBsZW1lbnRzIFBvb2xDbGFzcyB7XHJcbiAgICBwcm90ZWN0ZWQgX3JlbmRlcmVyICAgICAgICAgICA6IFJlbmRlcmVyO1xyXG4gICAgcHJvdGVjdGVkIF9nZW9tZXRyeSAgICAgICAgICAgOiBHZW9tZXRyeTtcclxuICAgIHByb3RlY3RlZCBfbWF0ZXJpYWwgICAgICAgICAgIDogTWF0ZXJpYWw7XHJcbiAgICBwcm90ZWN0ZWQgX3JvdGF0aW9uICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcm90ZWN0ZWQgX3RyYW5zZm9ybSAgICAgICAgICA6IE1hdHJpeDQ7XHJcbiAgICBwcm90ZWN0ZWQgX3NjZW5lICAgICAgICAgICAgICA6IFNjZW5lO1xyXG4gICAgcHJvdGVjdGVkIF9jb21wb25lbnRzICAgICAgICAgOiBMaXN0PENvbXBvbmVudD47XHJcbiAgICBwcm90ZWN0ZWQgX2NvbGxpc2lvbiAgICAgICAgICA6IENvbGxpc2lvbjtcclxuICAgIHByb3RlY3RlZCBfbmVlZHNVcGRhdGUgICAgICAgIDogYm9vbGVhbjtcclxuICAgIHByb3RlY3RlZCBfZGVzdHJveWVkICAgICAgICAgIDogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgcHVibGljIHBvc2l0aW9uICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG4gICAgcHVibGljIGlzQmlsbGJvYXJkICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgcHVibGljIGluVXNlICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIgPSBudWxsLCBnZW9tZXRyeTogR2VvbWV0cnkgPSBudWxsLCBtYXRlcmlhbDogTWF0ZXJpYWwgPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gTWF0cml4NC5jcmVhdGVJZGVudGl0eSgpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLjApO1xyXG4gICAgICAgIHRoaXMuX3JvdGF0aW9uID0gbmV3IFZlY3RvcjMoMC4wKTtcclxuICAgICAgICB0aGlzLmlzQmlsbGJvYXJkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX3NjZW5lID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gbmV3IExpc3QoKTtcclxuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlcnxWZWN0b3IzLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIGxldCBfeDogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yMz54KS54O1xyXG4gICAgICAgICAgICB5ID0gKDxWZWN0b3IzPngpLnk7XHJcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfeCA9IDxudW1iZXI+eDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZWxhdGl2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZChfeCwgeSwgeik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoX3gsIHksIHopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fY29sbGlzaW9uICYmIHRoaXMuX2NvbGxpc2lvbi5kaXNwbGF5SW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRpc3BsYXlJbnN0YW5jZS50cmFuc2xhdGUoeCwgeSwgeiwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHJvdGF0ZSh4OiBudW1iZXJ8VmVjdG9yMywgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IEluc3RhbmNlIHtcclxuICAgICAgICBsZXQgX3g6IG51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yMz54KS54O1xyXG4gICAgICAgICAgICB5ID0gKDxWZWN0b3IzPngpLnk7XHJcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfeCA9IDxudW1iZXI+eDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JvdGF0aW9uLmFkZChfeCwgeSwgeik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcm90YXRpb24uc2V0KF94LCB5LCB6KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcclxuICAgICAgICBjb21wb25lbnQuYWRkSW5zdGFuY2UodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbXBvbmVudDxUPihjb21wb25lbnROYW1lOiBzdHJpbmcpOiBUIHtcclxuICAgICAgICBmb3IgKGxldCBpPTAsY29tcDtjb21wPXRoaXMuX2NvbXBvbmVudHMuZ2V0QXQoaSk7aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wLm5hbWUgPT0gY29tcG9uZW50TmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxUPig8YW55PmNvbXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFRyYW5zZm9ybWF0aW9uKCk6IE1hdHJpeDQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRJZGVudGl0eSgpO1xyXG5cclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkocnBhKE1hdHJpeDQuY3JlYXRlWFJvdGF0aW9uKHRoaXMuX3JvdGF0aW9uLngpKSk7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtLm11bHRpcGx5KHJwYShNYXRyaXg0LmNyZWF0ZVpSb3RhdGlvbih0aGlzLl9yb3RhdGlvbi56KSkpO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5tdWx0aXBseShycGEoTWF0cml4NC5jcmVhdGVZUm90YXRpb24odGhpcy5fcm90YXRpb24ueSkpKTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuX2dlb21ldHJ5Lm9mZnNldDtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0udHJhbnNsYXRlKHRoaXMucG9zaXRpb24ueCArIG9mZnNldC54LCB0aGlzLnBvc2l0aW9uLnkgKyBvZmZzZXQueSwgdGhpcy5wb3NpdGlvbi56ICsgb2Zmc2V0LnopO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmcmVlUG9vbEFsbG9jKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldENvbGxpc2lvbihjb2xsaXNpb246IENvbGxpc2lvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbiA9IGNvbGxpc2lvbjtcclxuICAgICAgICBjb2xsaXNpb24uc2V0SW5zdGFuY2UodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldChyZW5kZXJlcjogUmVuZGVyZXIsIGdlb21ldHJ5OiBHZW9tZXRyeSA9IG51bGwsIG1hdGVyaWFsOiBNYXRlcmlhbCA9IG51bGwpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDtcclxuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5fcm90YXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRJZGVudGl0eSgpO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNCaWxsYm9hcmQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZSgpOiB2b2lkIHtcclxuICAgICAgICBwb29sLmZyZWUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGF3YWtlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuZWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgY29tcG9uZW50LmF3YWtlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgQ29uZmlnLkRJU1BMQVlfQ09MTElTSU9OUykge1xyXG4gICAgICAgICAgICBsZXQgY29sbGlzaW9uID0gdGhpcy5fY29sbGlzaW9uO1xyXG5cclxuICAgICAgICAgICAgY29sbGlzaW9uLnNldFNjZW5lKHRoaXMuX3NjZW5lKTtcclxuICAgICAgICAgICAgY29sbGlzaW9uLmFkZENvbGxpc2lvbkluc3RhbmNlKHRoaXMuX3JlbmRlcmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLmVhY2goKGNvbXBvbmVudDogQ29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudC51cGRhdGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLmVhY2goKGNvbXBvbmVudDogQ29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5kZXN0cm95KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9nZW9tZXRyeS5pc0R5bmFtaWMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2VvbWV0cnkuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbGxpc2lvbiAmJiBDb25maWcuRElTUExBWV9DT0xMSVNJT05TKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxpc2lvbi5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXIoY2FtZXJhOiBDYW1lcmEpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2dlb21ldHJ5IHx8ICF0aGlzLl9tYXRlcmlhbCkgeyByZXR1cm47IH1cclxuICAgICAgICBpZiAoIXRoaXMuX21hdGVyaWFsLmlzUmVhZHkpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnN3aXRjaFNoYWRlcih0aGlzLl9tYXRlcmlhbC5zaGFkZXJOYW1lKTtcclxuXHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNCaWxsYm9hcmQpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGUoMCwgZ2V0MkRBbmdsZSh0aGlzLnBvc2l0aW9uLCBjYW1lcmEucG9zaXRpb24pICsgTWF0aC5QSSAvIDIsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHVQb3NpdGlvbiA9IE1hdHJpeDQuYWxsb2NhdGUoKTtcclxuICAgICAgICB1UG9zaXRpb24ubXVsdGlwbHkodGhpcy5nZXRUcmFuc2Zvcm1hdGlvbigpKTtcclxuICAgICAgICB1UG9zaXRpb24ubXVsdGlwbHkoY2FtZXJhLmdldFRyYW5zZm9ybWF0aW9uKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zW1widVByb2plY3Rpb25cIl0sIGZhbHNlLCBjYW1lcmEucHJvamVjdGlvbi5kYXRhKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtc1tcInVQb3NpdGlvblwiXSwgZmFsc2UsIHVQb3NpdGlvbi5kYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5LnJlbmRlcigpO1xyXG5cclxuICAgICAgICB1UG9zaXRpb24uZGVsZXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhbGxvY2F0ZShyZW5kZXJlcjogUmVuZGVyZXIsIGdlb21ldHJ5OiBHZW9tZXRyeSA9IG51bGwsIG1hdGVyaWFsOiBNYXRlcmlhbCA9IG51bGwpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IGlucyA9IDxJbnN0YW5jZT5wb29sLmFsbG9jYXRlKCk7XHJcblxyXG4gICAgICAgIGlucy5zZXQocmVuZGVyZXIsIGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBnZW9tZXRyeSgpOiBHZW9tZXRyeSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IG1hdGVyaWFsKCk6IE1hdGVyaWFsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWF0ZXJpYWw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgcm90YXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JvdGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY29sbGlzaW9uKCk6IENvbGxpc2lvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxpc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNjZW5lKCk6IFNjZW5lIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NlbmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpc0Rlc3Ryb3llZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVzdHJveWVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgcG9vbCA9IG5ldyBQb29saWZ5KDIwLCBJbnN0YW5jZSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbnN0YW5jZTsiLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuaW1wb3J0IEJhc2ljTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL0Jhc2ljTWF0ZXJpYWwnO1xyXG5pbXBvcnQgV2FsbEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcclxuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XHJcbmltcG9ydCB7IHJvdW5kVXBQb3dlck9mMiB9IGZyb20gJy4uL1V0aWxzJztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGV4dE9wdGlvbnMge1xyXG4gICAgc2l6ZT86IG51bWJlcjtcclxuICAgIHN0cm9rZT86IGJvb2xlYW47XHJcbiAgICBmaWxsPzogYm9vbGVhbjtcclxuICAgIGZpbGxDb2xvcj86IHN0cmluZztcclxuICAgIHN0cm9rZUNvbG9yPzogc3RyaW5nO1xyXG4gICAgcG9zaXRpb24/OiBWZWN0b3IzO1xyXG4gICAgcm90YXRpb24/OiBWZWN0b3IzO1xyXG59XHJcblxyXG5jb25zdCBPcHRpb25zRGVmYXVsdDogVGV4dE9wdGlvbnMgPSB7XHJcbiAgICBzaXplOiAxMixcclxuICAgIHN0cm9rZTogZmFsc2UsXHJcbiAgICBmaWxsOiB0cnVlLFxyXG4gICAgZmlsbENvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICBzdHJva2VDb2xvcjogJyNGRkZGRkYnLFxyXG4gICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApLFxyXG4gICAgcm90YXRpb246IG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApXHJcbn07XHJcblxyXG5jbGFzcyBUZXh0IGV4dGVuZHMgSW5zdGFuY2Uge1xyXG4gICAgcHJpdmF0ZSBfdGV4dCAgICAgICAgICAgICAgIDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfZm9udCAgICAgICAgICAgICAgIDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfb3B0aW9ucyAgICAgICAgICAgIDogVGV4dE9wdGlvbnM7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgdGV4dDogc3RyaW5nLCBmb250OiBzdHJpbmcsIG9wdGlvbnM/OiBUZXh0T3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKHJlbmRlcmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGV4dCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHRoaXMuX21lcmdlT3B0aW9ucyhvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJpbnRUZXh0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbWVyZ2VPcHRpb25zKG9wdGlvbnM6IFRleHRPcHRpb25zKTogVGV4dE9wdGlvbnMge1xyXG4gICAgICAgIGlmICghb3B0aW9ucykgeyByZXR1cm4gT3B0aW9uc0RlZmF1bHQ7IH1cclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNpemUpIHsgb3B0aW9ucy5zaXplID0gT3B0aW9uc0RlZmF1bHQuc2l6ZTsgfVxyXG4gICAgICAgIGlmICghb3B0aW9ucy5zdHJva2UpIHsgb3B0aW9ucy5zdHJva2UgPSBPcHRpb25zRGVmYXVsdC5zdHJva2U7IH1cclxuICAgICAgICBpZiAoIW9wdGlvbnMuZmlsbCkgeyBvcHRpb25zLmZpbGwgPSBPcHRpb25zRGVmYXVsdC5maWxsOyB9XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmZpbGxDb2xvcikgeyBvcHRpb25zLmZpbGxDb2xvciA9IE9wdGlvbnNEZWZhdWx0LmZpbGxDb2xvcjsgfVxyXG4gICAgICAgIGlmICghb3B0aW9ucy5zdHJva2VDb2xvcikgeyBvcHRpb25zLnN0cm9rZUNvbG9yID0gT3B0aW9uc0RlZmF1bHQuc3Ryb2tlQ29sb3I7IH1cclxuICAgICAgICBpZiAoIW9wdGlvbnMucG9zaXRpb24pIHsgb3B0aW9ucy5wb3NpdGlvbiA9IE9wdGlvbnNEZWZhdWx0LnBvc2l0aW9uOyB9XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnJvdGF0aW9uKSB7IG9wdGlvbnMucm90YXRpb24gPSBPcHRpb25zRGVmYXVsdC5yb3RhdGlvbjsgfVxyXG5cclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9wcmludFRleHQoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXHJcbiAgICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgIGN0eC5mb250ID0gdGhpcy5fb3B0aW9ucy5zaXplICsgXCJweCBcIiArIHRoaXMuX2ZvbnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBjdHgub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHNpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy5fdGV4dCk7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHJvdW5kVXBQb3dlck9mMihzaXplLndpZHRoKTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gcm91bmRVcFBvd2VyT2YyKHRoaXMuX29wdGlvbnMuc2l6ZSk7XHJcbiAgICAgICAgY3R4LmZvbnQgPSB0aGlzLl9vcHRpb25zLnNpemUgKyBcInB4IFwiICsgdGhpcy5fZm9udDtcclxuXHJcbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBjdHgub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZmlsbCkge1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5fb3B0aW9ucy5maWxsQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLl90ZXh0LCA0LCB0aGlzLl9vcHRpb25zLnNpemUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc3Ryb2tlKSB7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuX29wdGlvbnMuc3Ryb2tlQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VUZXh0KHRoaXMuX3RleHQsIDQsIHRoaXMuX29wdGlvbnMuc2l6ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdXZzID0gWzAsIDAsIChzaXplLndpZHRoICsgNCkgLyBjYW52YXMud2lkdGgsICh0aGlzLl9vcHRpb25zLnNpemUgKyA4KSAvIGNhbnZhcy5oZWlnaHRdLFxyXG4gICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoY2FudmFzLCB0aGlzLl9yZW5kZXJlciksXHJcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IEJhc2ljTWF0ZXJpYWwodGhpcy5fcmVuZGVyZXIsIHRleHR1cmUpLFxyXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBXYWxsR2VvbWV0cnkodGhpcy5fcmVuZGVyZXIsIHNpemUud2lkdGggLyAxMDAsIHRoaXMuX29wdGlvbnMuc2l6ZSAvIDEwMCk7XHJcblxyXG4gICAgICAgIG1hdGVyaWFsLnNldFV2KHV2c1swXSwgdXZzWzFdLCB1dnNbMl0sIHV2c1szXSk7XHJcbiAgICAgICAgbWF0ZXJpYWwuc2V0T3BhcXVlKGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XHJcblxyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlKHRoaXMuX29wdGlvbnMucG9zaXRpb24ueCwgdGhpcy5fb3B0aW9ucy5wb3NpdGlvbi55LCB0aGlzLl9vcHRpb25zLnBvc2l0aW9uLnopO1xyXG4gICAgICAgIHRoaXMucm90YXRlKHRoaXMuX29wdGlvbnMucm90YXRpb24ueCwgdGhpcy5fb3B0aW9ucy5yb3RhdGlvbi55LCB0aGlzLl9vcHRpb25zLnJvdGF0aW9uLnopO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXh0OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuXHJcbmNsYXNzIEN1YmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgICAgICB0aGlzLl9keW5hbWljID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRDdWJlKHdpZHRoLCBoZWlnaHQsIGxlbmd0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYnVpbGRDdWJlKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCB3ID0gd2lkdGggLyAyLFxyXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMixcclxuICAgICAgICAgICAgbCA9IGxlbmd0aCAvIDI7XHJcblxyXG4gICAgICAgIC8vIEZyb250IGZhY2VcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XHJcblxyXG4gICAgICAgIC8vIEJhY2sgZmFjZVxyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAtbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsIC1sKTtcclxuXHJcbiAgICAgICAgLy8gTGVmdCBmYWNlXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgLWwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsICBsKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgIGwpO1xyXG5cclxuICAgICAgICAvLyBSaWdodCBmYWNlXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xyXG5cclxuICAgICAgICAvLyBUb3AgZmFjZVxyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgLWwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsIC1sKTtcclxuXHJcbiAgICAgICAgLy8gQm90dG9tIGZhY2VcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIGwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAtbCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDY7aSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmQgPSBpICogNDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMik7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMSwgaW5kICsgMywgaW5kICsgMik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMS4wKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDEuMCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAwLjApO1xyXG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMC4wKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQodGhpcy5fcmVuZGVyZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDdWJlR2VvbWV0cnk7IiwiaW1wb3J0IHsgVkVSVElDRV9TSVpFLCBURVhDT09SRF9TSVpFIH0gZnJvbSAnLi4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XHJcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xyXG5cclxuY2xhc3MgR2VvbWV0cnkge1xyXG4gICAgcHJpdmF0ZSBfdmVydGljZXMgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfdHJpYW5nbGVzICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfdGV4Q29vcmRzICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfdmVydGV4QnVmZmVyICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcclxuICAgIHByaXZhdGUgX3RleEJ1ZmZlciAgICAgICAgICAgICAgIDogV2ViR0xCdWZmZXI7XHJcbiAgICBwcml2YXRlIF9pbmRleEJ1ZmZlciAgICAgICAgICAgICA6IFdlYkdMQnVmZmVyO1xyXG4gICAgcHJpdmF0ZSBfaW5kZXhMZW5ndGggICAgICAgICAgICAgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9ib3VuZGluZ0JveCAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBfcmVuZGVyZXIgICAgICAgICAgICAgIDogUmVuZGVyZXI7XHJcbiAgICBwcm90ZWN0ZWQgX2R5bmFtaWMgICAgICAgICAgICAgICA6IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIG9mZnNldCAgICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5fdGV4Q29vcmRzID0gW107XHJcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzID0gW107XHJcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSBbSW5maW5pdHksIEluZmluaXR5LCBJbmZpbml0eSwgLUluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eV07XHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZHluYW1pYyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRWZXJ0aWNlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNlcy5wdXNoKHgsIHksIHopO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgYm91bmRpbmcgYm94XHJcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSBbXHJcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzBdLCB4KSxcclxuICAgICAgICAgICAgTWF0aC5taW4odGhpcy5fYm91bmRpbmdCb3hbMV0sIHkpLFxyXG4gICAgICAgICAgICBNYXRoLm1pbih0aGlzLl9ib3VuZGluZ0JveFsyXSwgeiksXHJcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzNdLCB4KSxcclxuICAgICAgICAgICAgTWF0aC5tYXgodGhpcy5fYm91bmRpbmdCb3hbNF0sIHkpLFxyXG4gICAgICAgICAgICBNYXRoLm1heCh0aGlzLl9ib3VuZGluZ0JveFs1XSwgeilcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgYWRkVGV4Q29vcmQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl90ZXhDb29yZHMucHVzaCh4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkVHJpYW5nbGUodmVydDE6IG51bWJlciwgdmVydDI6IG51bWJlciwgdmVydDM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNlc1t2ZXJ0MSAqIFZFUlRJQ0VfU0laRV0gPT09IHVuZGVmaW5lZCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJWZXJ0aWNlIFtcIiArIHZlcnQxICsgXCJdIG5vdCBmb3VuZCFcIil9XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQyICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDIgKyBcIl0gbm90IGZvdW5kIVwiKX1cclxuICAgICAgICBpZiAodGhpcy5fdmVydGljZXNbdmVydDMgKiBWRVJUSUNFX1NJWkVdID09PSB1bmRlZmluZWQpIHsgdGhyb3cgbmV3IEVycm9yKFwiVmVydGljZSBbXCIgKyB2ZXJ0MyArIFwiXSBub3QgZm91bmQhXCIpfVxyXG5cclxuICAgICAgICB0aGlzLl90cmlhbmdsZXMucHVzaCh2ZXJ0MSwgdmVydDIsIHZlcnQzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnVpbGQocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGdsID0gcmVuZGVyZXIuR0w7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XHJcblxyXG4gICAgICAgIHRoaXMuX3ZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl92ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRoaXMuX3ZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICB0aGlzLl90ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5fdGV4QnVmZmVyKTtcclxuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLl90ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luZGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5faW5kZXhCdWZmZXIpO1xyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheSh0aGlzLl90cmlhbmdsZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luZGV4TGVuZ3RoID0gdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5fdmVydGljZXMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3RleENvb3JkcyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXJCb3VuZEJveEF4aXMoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCk6IEdlb21ldHJ5IHtcclxuICAgICAgICBpZiAoeCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzBdID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbM10gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoeSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzFdID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbNF0gPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHogPT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFsyXSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzVdID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBnbCA9IHRoaXMuX3JlbmRlcmVyLkdMO1xyXG5cclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5fdmVydGV4QnVmZmVyKTtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5fdGV4QnVmZmVyKTtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5faW5kZXhCdWZmZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuX3ZlcnRleEJ1ZmZlcik7XHJcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlc1tcImFWZXJ0ZXhQb3NpdGlvblwiXSwgVkVSVElDRV9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cclxuICAgICAgICBpZiAoc2hhZGVyLmF0dHJpYnV0ZXNbXCJhVGV4Q29vcmRzXCJdKSB7XHJcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl90ZXhCdWZmZXIpO1xyXG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzW1wiYVRleENvb3Jkc1wiXSwgVEVYQ09PUkRfU0laRSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuX2luZGV4QnVmZmVyKTtcclxuXHJcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgdGhpcy5faW5kZXhMZW5ndGgsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzRHluYW1pYygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZHluYW1pYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGJvdW5kaW5nQm94KCk6IEFycmF5PG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ib3VuZGluZ0JveDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgR2VvbWV0cnk7IiwiaW1wb3J0IEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvR2VvbWV0cnknO1xyXG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xyXG5cclxuY2xhc3MgUGxhbmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX2R5bmFtaWMgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9idWlsZFBsYW5lKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkUGxhbmUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdyA9IHdpZHRoIC8gMixcclxuICAgICAgICAgICAgaCA9IGhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgIC8vIFRvcCBmYWNlXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgMCwgIGgpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIDAsICBoKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICAwLCAtaCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgMCwgLWgpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDAsIDEsIDIpO1xyXG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMSwgMywgMik7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAxLjApO1xyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAwLjApO1xyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkKHRoaXMuX3JlbmRlcmVyKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxhbmVHZW9tZXRyeTsiLCJpbXBvcnQgR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcblxyXG5jbGFzcyBXYWxsR2VvbWV0cnkgZXh0ZW5kcyBHZW9tZXRyeSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgICAgICB0aGlzLl9keW5hbWljID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRXYWxsKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkV2FsbCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCB3ID0gd2lkdGggLyAyLFxyXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIDApO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICAwKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgIDApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMCwgMSwgMik7XHJcbiAgICAgICAgdGhpcy5hZGRUcmlhbmdsZSgxLCAzLCAyKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDEuMCk7XHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDEuMCk7XHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDAuMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQodGhpcy5fcmVuZGVyZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXYWxsR2VvbWV0cnk7IiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJlciB9IGZyb20gJy4vUmVuZGVyZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENhbWVyYSB9IGZyb20gJy4vQ2FtZXJhJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb21wb25lbnQgfSBmcm9tICcuL0NvbXBvbmVudCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29uZmlnIH0gZnJvbSAnLi9Db25maWcnO1xyXG5leHBvcnQgKiBmcm9tICcuL0NvbnN0YW50cyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5wdXQgfSBmcm9tICcuL0lucHV0JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBMaXN0IH0gZnJvbSAnLi9MaXN0JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBQb29saWZ5IH0gZnJvbSAnLi9Qb29saWZ5JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJpbmdMYXllciB9IGZyb20gJy4vUmVuZGVyaW5nTGF5ZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjZW5lIH0gZnJvbSAnLi9TY2VuZSc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dHVyZSB9IGZyb20gJy4vVGV4dHVyZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vVXRpbHMnO1xyXG5cclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBCb3hDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbnMvQm94Q29sbGlzaW9uJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbnMvQ29sbGlzaW9uJztcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5zdGFuY2UgfSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBUZXh0IH0gZnJvbSAnLi9lbnRpdGllcy9UZXh0JztcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ3ViZUdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeSc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxhbmVHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBXYWxsR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJhc2ljTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFscy9CYXNpY01hdGVyaWFsJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb2xvck1hdGVyaWFsIH0gZnJvbSAnLi9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFscy9NYXRlcmlhbCc7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIE1hdHJpeDQgfSBmcm9tICcuL21hdGgvTWF0cml4NCc7XHJcbmV4cG9ydCB7IFZlY3RvcjMsIHZlYzMgfSBmcm9tICcuL21hdGgvVmVjdG9yMyc7XHJcbmV4cG9ydCB7IFZlY3RvcjQgfSBmcm9tICcuL21hdGgvVmVjdG9yNCc7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoYWRlciB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXInO1xyXG5leHBvcnQgeyBTaGFkZXJTdHJ1Y3QsIFNoYWRlck1hcCwgU2hhZGVyc05hbWVzIH0gZnJvbSAnLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQmFzaWMgfSBmcm9tICcuL3NoYWRlcnMvQmFzaWMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbG9yIH0gZnJvbSAnLi9zaGFkZXJzL0NvbG9yJzsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vVGV4dHVyZSc7XHJcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xyXG5cclxuY2xhc3MgQmFzaWNNYXRlcmlhbCBleHRlbmRzIE1hdGVyaWFsIHtcclxuICAgIHByaXZhdGUgX3RleHR1cmUgICAgICAgICA6IFRleHR1cmU7XHJcbiAgICBwcml2YXRlIF91diAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfcmVwZWF0ICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHRleHR1cmU6IFRleHR1cmUpIHtcclxuICAgICAgICBzdXBlcihyZW5kZXJlciwgXCJCQVNJQ1wiKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICAgICAgdGhpcy5fdXYgPSBbMC4wLCAwLjAsIDEuMCwgMS4wXTtcclxuICAgICAgICB0aGlzLl9yZXBlYXQgPSBbMS4wLCAxLjBdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRVdih4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl91diA9IFt4LCB5LCB3LCBoXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFJlcGVhdCh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3JlcGVhdCA9IFt4LCB5XTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPT0gdGhpcykgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XHJcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5fdGV4dHVyZS50ZXh0dXJlKTtcclxuICAgICAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zW1widVRleHR1cmVcIl0sIDApO1xyXG5cclxuICAgICAgICBnbC51bmlmb3JtNGZ2KHNoYWRlci51bmlmb3Jtc1tcInVVVlwiXSwgdGhpcy5fdXYpO1xyXG4gICAgICAgIGdsLnVuaWZvcm0yZnYoc2hhZGVyLnVuaWZvcm1zW1widVJlcGVhdFwiXSwgdGhpcy5fcmVwZWF0KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xyXG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZS5pc1JlYWR5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdGV4dHVyZSgpOiBUZXh0dXJlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmFzaWNNYXRlcmlhbDsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcclxuaW1wb3J0IHsgVmVjdG9yNCB9IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xyXG5cclxuY2xhc3MgQ29sb3JNYXRlcmlhbCBleHRlbmRzIE1hdGVyaWFsIHtcclxuICAgIHByaXZhdGUgX2NvbG9yICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyLCBjb2xvcjogVmVjdG9yNCkge1xyXG4gICAgICAgIHN1cGVyKHJlbmRlcmVyLCBcIkNPTE9SXCIpO1xyXG5cclxuICAgICAgICB0aGlzLl9jb2xvciA9IGNvbG9yLnRvQXJyYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPT0gdGhpcykgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgZ2wudW5pZm9ybTRmdihzaGFkZXIudW5pZm9ybXNbXCJ1Q29sb3JcIl0sIHRoaXMuX2NvbG9yKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xyXG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29sb3JNYXRlcmlhbDsiLCJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xyXG5pbXBvcnQgeyBTaGFkZXJzTmFtZXMgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XHJcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVVVUlEIH0gZnJvbSAnLi4vVXRpbHMnO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgTWF0ZXJpYWwge1xyXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgICAgICA6IFJlbmRlcmVyO1xyXG4gICAgcHJvdGVjdGVkIF9pc09wYXF1ZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XHJcbiAgICBwcm90ZWN0ZWQgX3JlbmRlckJvdGhGYWNlcyAgICAgICAgIDogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgcHVibGljIHJlYWRvbmx5IHNoYWRlck5hbWUgICAgICAgIDogU2hhZGVyc05hbWVzO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IHV1aWQgICAgICAgICAgICAgIDogc3RyaW5nO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgbGFzdFJlbmRlcmVkICAgICAgICA6IE1hdGVyaWFsID0gbnVsbDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHNoYWRlck5hbWU6IFNoYWRlcnNOYW1lcykge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XHJcbiAgICAgICAgdGhpcy5zaGFkZXJOYW1lID0gc2hhZGVyTmFtZTtcclxuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGFxdWUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckJvdGhGYWNlcyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRTaGFkZXIoKTogU2hhZGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVuZGVyZXIuZ2V0U2hhZGVyKHRoaXMuc2hhZGVyTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IHJlbmRlcigpOiB2b2lkO1xyXG4gICAgcHVibGljIGFic3RyYWN0IGdldCBpc1JlYWR5KCk6IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIGdldCBpc09wYXF1ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNPcGFxdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldE9wYXF1ZShvcGFxdWU6IGJvb2xlYW4pOiBNYXRlcmlhbCB7XHJcbiAgICAgICAgdGhpcy5faXNPcGFxdWUgPSBvcGFxdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEN1bGxpbmcoYm90aEZhY2VzOiBib29sZWFuKTogTWF0ZXJpYWwge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckJvdGhGYWNlcyA9IGJvdGhGYWNlcztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWF0ZXJpYWw7IiwiaW1wb3J0IHsgVmVjdG9yNCB9IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XHJcbmltcG9ydCBQb29saWZ5IGZyb20gJy4uL1Bvb2xpZnknO1xyXG5pbXBvcnQgeyBQb29sQ2xhc3MgfSBmcm9tICcuLi9Qb29saWZ5JztcclxuXHJcbmNsYXNzIE1hdHJpeDQgaW1wbGVtZW50cyBQb29sQ2xhc3Mge1xyXG4gICAgcHVibGljIGRhdGEgICAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcclxuICAgIHB1YmxpYyBpblVzZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IEFycmF5KDE2KTtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWF0cml4NCBuZWVkcyAxNiB2YWx1ZXMgdG8gYmUgY3JlYXRlZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDE2O2krKykge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSB2YWx1ZXNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KTogTWF0cml4NCB7XHJcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWF0cml4NCBuZWVkcyAxNiB2YWx1ZXMgdG8gYmUgY3JlYXRlZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDE2O2krKykge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSB2YWx1ZXNbaV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkobWF0cml4QjogTWF0cml4NCk6IE1hdHJpeDQge1xyXG4gICAgICAgIGxldCBUOiBBcnJheTxudW1iZXI+ID0gbWF0cml4Qi5kYXRhO1xyXG5cclxuICAgICAgICBsZXQgQzEgPSBuZXcgVmVjdG9yNChUWzBdLCBUWzRdLCBUWzhdLCBUWzEyXSk7XHJcbiAgICAgICAgbGV0IEMyID0gbmV3IFZlY3RvcjQoVFsxXSwgVFs1XSwgVFs5XSwgVFsxM10pO1xyXG4gICAgICAgIGxldCBDMyA9IG5ldyBWZWN0b3I0KFRbMl0sIFRbNl0sIFRbMTBdLCBUWzE0XSk7XHJcbiAgICAgICAgbGV0IEM0ID0gbmV3IFZlY3RvcjQoVFszXSwgVFs3XSwgVFsxMV0sIFRbMTVdKTtcclxuXHJcbiAgICAgICAgVCA9IHRoaXMuZGF0YTtcclxuICAgICAgICBsZXQgUjEgPSBuZXcgVmVjdG9yNChUWzBdLCBUWzFdLCBUWzJdLCBUWzNdKTtcclxuICAgICAgICBsZXQgUjIgPSBuZXcgVmVjdG9yNChUWzRdLCBUWzVdLCBUWzZdLCBUWzddKTtcclxuICAgICAgICBsZXQgUjMgPSBuZXcgVmVjdG9yNChUWzhdLCBUWzldLCBUWzEwXSwgVFsxMV0pO1xyXG4gICAgICAgIGxldCBSNCA9IG5ldyBWZWN0b3I0KFRbMTJdLCBUWzEzXSwgVFsxNF0sIFRbMTVdKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXQoXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIxLCBDMSksIFZlY3RvcjQuZG90KFIxLCBDMiksIFZlY3RvcjQuZG90KFIxLCBDMyksIFZlY3RvcjQuZG90KFIxLCBDNCksXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIyLCBDMSksIFZlY3RvcjQuZG90KFIyLCBDMiksIFZlY3RvcjQuZG90KFIyLCBDMyksIFZlY3RvcjQuZG90KFIyLCBDNCksXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIzLCBDMSksIFZlY3RvcjQuZG90KFIzLCBDMiksIFZlY3RvcjQuZG90KFIzLCBDMyksIFZlY3RvcjQuZG90KFIzLCBDNCksXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFI0LCBDMSksIFZlY3RvcjQuZG90KFI0LCBDMiksIFZlY3RvcjQuZG90KFI0LCBDMyksIFZlY3RvcjQuZG90KFI0LCBDNClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gKz0geDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSArPSB5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdICs9IHo7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSA9IHg7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gPSB5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdID0gejtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldElkZW50aXR5KCk6IE1hdHJpeDQge1xyXG4gICAgICAgIHRoaXMuc2V0KFxyXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZSgpOiB2b2lkIHtcclxuICAgICAgICBwb29sLmZyZWUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc2V0SWRlbnRpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUlkZW50aXR5KCk6IE1hdHJpeDQge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVPcnRobyh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogTWF0cml4NCB7XHJcbiAgICAgICAgbGV0IGwgPSAtd2lkdGggLyAyLjAsXHJcbiAgICAgICAgICAgIHIgPSB3aWR0aCAvIDIuMCxcclxuICAgICAgICAgICAgYiA9IC1oZWlnaHQgLyAyLjAsXHJcbiAgICAgICAgICAgIHQgPSBoZWlnaHQgLyAyLjAsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBBID0gMi4wIC8gKHIgLSBsKSxcclxuICAgICAgICAgICAgQiA9IDIuMCAvICh0IC0gYiksXHJcbiAgICAgICAgICAgIEMgPSAtMiAvICh6ZmFyIC0gem5lYXIpLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgWCA9IC0ociArIGwpIC8gKHIgLSBsKSxcclxuICAgICAgICAgICAgWSA9IC0odCArIGIpIC8gKHQgLSBiKSxcclxuICAgICAgICAgICAgWiA9IC0oemZhciArIHpuZWFyKSAvICh6ZmFyIC0gem5lYXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgICAgICAgIEEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIEIsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIEMsIDAsXHJcbiAgICAgICAgICAgIFgsIFksIFosIDFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlUGVyc3BlY3RpdmUoZm92OiBudW1iZXIsIHJhdGlvOiBudW1iZXIsIHpuZWFyOiBudW1iZXIsIHpmYXI6IG51bWJlcik6IE1hdHJpeDQge1xyXG4gICAgICAgIGxldCBTID0gMSAvIE1hdGgudGFuKGZvdiAvIDIpLFxyXG4gICAgICAgICAgICBSID0gUyAqIHJhdGlvLFxyXG4gICAgICAgICAgICBBID0gLSh6ZmFyKSAvICh6ZmFyIC0gem5lYXIpLFxyXG4gICAgICAgICAgICBCID0gLSh6ZmFyICogem5lYXIpIC8gKHpmYXIgLSB6bmVhcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAgICAgICBTLCAwLCAwLCAgMCxcclxuICAgICAgICAgICAgMCwgUiwgMCwgIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIEEsIC0xLFxyXG4gICAgICAgICAgICAwLCAwLCBCLCAgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhbGxvY2F0ZSgpOiBNYXRyaXg0IHtcclxuICAgICAgICByZXR1cm4gPE1hdHJpeDQ+cG9vbC5hbGxvY2F0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlVHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBNYXRyaXg0IHtcclxuICAgICAgICByZXR1cm4gTWF0cml4NC5hbGxvY2F0ZSgpLnNldChcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgeCwgeSwgeiwgMVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVYUm90YXRpb24ocmFkaWFuczogbnVtYmVyKTogTWF0cml4NCB7XHJcbiAgICAgICAgbGV0IEM6IG51bWJlciA9IE1hdGguY29zKHJhZGlhbnMpLFxyXG4gICAgICAgICAgICBTOiBudW1iZXIgPSBNYXRoLnNpbihyYWRpYW5zKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE1hdHJpeDQuYWxsb2NhdGUoKS5zZXQoXHJcbiAgICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAgMCwgQywtUywgMCxcclxuICAgICAgICAgICAgIDAsIFMsIEMsIDAsXHJcbiAgICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVlSb3RhdGlvbihyYWRpYW5zOiBudW1iZXIpOiBNYXRyaXg0IHtcclxuICAgICAgICBsZXQgQzogbnVtYmVyID0gTWF0aC5jb3MocmFkaWFucyksXHJcbiAgICAgICAgICAgIFM6IG51bWJlciA9IE1hdGguc2luKHJhZGlhbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4gTWF0cml4NC5hbGxvY2F0ZSgpLnNldChcclxuICAgICAgICAgICAgIEMsIDAsLVMsIDAsXHJcbiAgICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAgUywgMCwgQywgMCxcclxuICAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlWlJvdGF0aW9uKHJhZGlhbnM6IG51bWJlcik6IE1hdHJpeDQge1xyXG4gICAgICAgIGxldCBDOiBudW1iZXIgPSBNYXRoLmNvcyhyYWRpYW5zKSxcclxuICAgICAgICAgICAgUzogbnVtYmVyID0gTWF0aC5zaW4ocmFkaWFucyk7XHJcblxyXG4gICAgICAgIHJldHVybiBNYXRyaXg0LmFsbG9jYXRlKCkuc2V0KFxyXG4gICAgICAgICAgICAgQywtUywgMCwgMCxcclxuICAgICAgICAgICAgIFMsIEMsIDAsIDAsXHJcbiAgICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IHBvb2wgPSBuZXcgUG9vbGlmeSg1LCBNYXRyaXg0KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hdHJpeDQ7IiwiaW1wb3J0IFBvb2xpZnkgZnJvbSAnLi4vUG9vbGlmeSc7XHJcbmltcG9ydCB7IFBvb2xDbGFzcyB9IGZyb20gJy4uL1Bvb2xpZnknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZlY3RvcjMgaW1wbGVtZW50cyBQb29sQ2xhc3Mge1xyXG4gICAgcHJpdmF0ZSBfeCAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeSAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeiAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBuZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgaW5Vc2UgICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHo6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgdGhpcy5zZXQoMCwgMCwgMCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFZlY3RvcjMge1xyXG4gICAgICAgIHRoaXMuX3ggPSB4O1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuX3ogPSB6O1xyXG5cclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICAgICAgdGhpcy5feCArPSB4O1xyXG4gICAgICAgIHRoaXMuX3kgKz0geTtcclxuICAgICAgICB0aGlzLl96ICs9IHo7XHJcblxyXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkobnVtOiBudW1iZXIpOiBWZWN0b3IzIHtcclxuICAgICAgICB0aGlzLl94ICo9IG51bTtcclxuICAgICAgICB0aGlzLl95ICo9IG51bTtcclxuICAgICAgICB0aGlzLl96ICo9IG51bTtcclxuXHJcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aXBseSgxIC8gbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9uZSgpOiBWZWN0b3IzIHtcclxuICAgICAgICByZXR1cm4gdmVjMyh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVsZXRlKCk6IHZvaWQge1xyXG4gICAgICAgIHBvb2wuZnJlZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXF1YWxzKHZlY3RvcjM6IFZlY3RvcjMpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMueCA9PSB2ZWN0b3IzLnggJiYgdGhpcy55ID09IHZlY3RvcjMueSAmJiB0aGlzLnogPT0gdmVjdG9yMy56KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3g7IH1cclxuICAgIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feTsgfVxyXG4gICAgcHVibGljIGdldCB6KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl96OyB9XHJcblxyXG4gICAgcHVibGljIHNldCB4KHg6IG51bWJlcikgeyB0aGlzLl94ID0geDsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cclxuICAgIHB1YmxpYyBzZXQgeSh5OiBudW1iZXIpIHsgdGhpcy5feSA9IHk7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XHJcbiAgICBwdWJsaWMgc2V0IHooejogbnVtYmVyKSB7IHRoaXMuX3ogPSB6OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sZW5ndGggPSBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56KTtcclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gIGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3Jvc3ModmVjdG9yQTogVmVjdG9yMywgdmVjdG9yQjogVmVjdG9yMyk6IFZlY3RvcjMge1xyXG4gICAgICAgIHJldHVybiB2ZWMzKFxyXG4gICAgICAgICAgICB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnogLSB2ZWN0b3JBLnogKiB2ZWN0b3JCLnksXHJcbiAgICAgICAgICAgIHZlY3RvckEueiAqIHZlY3RvckIueCAtIHZlY3RvckEueCAqIHZlY3RvckIueixcclxuICAgICAgICAgICAgdmVjdG9yQS54ICogdmVjdG9yQi55IC0gdmVjdG9yQS55ICogdmVjdG9yQi54XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGRvdCh2ZWN0b3JBOiBWZWN0b3IzLCB2ZWN0b3JCOiBWZWN0b3IzKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdmVjdG9yQS54ICogdmVjdG9yQi54ICsgdmVjdG9yQS55ICogdmVjdG9yQi55ICsgdmVjdG9yQS56ICogdmVjdG9yQi56O1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBwb29sID0gbmV3IFBvb2xpZnkoMTAsIFZlY3RvcjMpO1xyXG5leHBvcnQgZnVuY3Rpb24gdmVjMyh4OiBudW1iZXIgPSAwLCB5PzogbnVtYmVyLCB6PzogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICBpZiAoeSA9PT0gdW5kZWZpbmVkICYmIHogPT09IHVuZGVmaW5lZCkgeyB6ID0geDsgfVxyXG4gICAgZWxzZSBpZiAoeiA9PT0gdW5kZWZpbmVkKXsgeiA9IDA7IH1cclxuICAgIGlmICh5ID09PSB1bmRlZmluZWQpeyB5ID0geDsgfVxyXG5cclxuICAgIGxldCBvYmogPSA8VmVjdG9yMz4ocG9vbC5hbGxvY2F0ZSgpKTtcclxuICAgIHJldHVybiBvYmouc2V0KHgsIHksIHopO1xyXG59IiwiZXhwb3J0IGNsYXNzIFZlY3RvcjQge1xyXG4gICAgcHJpdmF0ZSBfeCAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeSAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeiAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfdyAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBuZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldCh4LCB5LCB6LCB3KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IFZlY3RvcjQge1xyXG4gICAgICAgIHRoaXMuX3ggPSB4O1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuX3ogPSB6O1xyXG4gICAgICAgIHRoaXMuX3cgPSB3O1xyXG5cclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpOiBWZWN0b3I0IHtcclxuICAgICAgICB0aGlzLl94ICs9IHg7XHJcbiAgICAgICAgdGhpcy5feSArPSB5O1xyXG4gICAgICAgIHRoaXMuX3ogKz0gejtcclxuICAgICAgICB0aGlzLl93ICs9IHc7XHJcblxyXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkobnVtOiBudW1iZXIpOiBWZWN0b3I0IHtcclxuICAgICAgICB0aGlzLl94ICo9IG51bTtcclxuICAgICAgICB0aGlzLl95ICo9IG51bTtcclxuICAgICAgICB0aGlzLl96ICo9IG51bTtcclxuICAgICAgICB0aGlzLl93ICo9IG51bTtcclxuXHJcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yNCB7XHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aXBseSgxIC8gbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdG9BcnJheSgpOiBBcnJheTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMud107XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feDsgfVxyXG4gICAgcHVibGljIGdldCB5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95OyB9XHJcbiAgICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3o7IH1cclxuICAgIHB1YmxpYyBnZXQgdygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fdzsgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0IHgoeDogbnVtYmVyKSB7IHRoaXMuX3ggPSB4OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxyXG4gICAgcHVibGljIHNldCB5KHk6IG51bWJlcikgeyB0aGlzLl95ID0geTsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cclxuICAgIHB1YmxpYyBzZXQgeih6OiBudW1iZXIpIHsgdGhpcy5feiA9IHo7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XHJcbiAgICBwdWJsaWMgc2V0IHcodzogbnVtYmVyKSB7IHRoaXMuX3cgPSB3OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sZW5ndGggPSBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gIGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZG90KHZlY3RvckE6IFZlY3RvcjQsIHZlY3RvckI6IFZlY3RvcjQpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCByZXQgPSB2ZWN0b3JBLnggKiB2ZWN0b3JCLnggKyB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnkgKyB2ZWN0b3JBLnogKiB2ZWN0b3JCLnogKyB2ZWN0b3JBLncgKiB2ZWN0b3JCLnc7XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxufSIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcclxuXHJcbmxldCBCYXNpYzogU2hhZGVyU3RydWN0ID0ge1xyXG4gICAgdmVydGV4U2hhZGVyOiBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcblxyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhVGV4Q29vcmRzO1xyXG5cclxuICAgICAgICB1bmlmb3JtIG1hdDQgdVByb2plY3Rpb247XHJcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdmFyeWluZyB2ZWMyIHZUZXhDb29yZHM7XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb24gKiB1UG9zaXRpb24gKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcclxuXHJcbiAgICAgICAgICAgIHZUZXhDb29yZHMgPSBhVGV4Q29vcmRzO1xyXG4gICAgICAgIH1cclxuICAgIGAsXHJcblxyXG4gICAgZnJhZ21lbnRTaGFkZXI6IGBcclxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuICAgICAgICBcclxuICAgICAgICB1bmlmb3JtIHZlYzQgdVVWO1xyXG4gICAgICAgIHVuaWZvcm0gdmVjMiB1UmVwZWF0O1xyXG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVUZXh0dXJlO1xyXG5cclxuICAgICAgICB2YXJ5aW5nIHZlYzIgdlRleENvb3JkcztcclxuXHJcbiAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcclxuICAgICAgICAgICAgdmVjMiBjb29yZHMgPSBtb2QoY2xhbXAodlRleENvb3JkcywgMC4wLCAxLjApICogdVJlcGVhdCwgMS4wKSAqIHVVVi56dyArIHVVVi54eTtcclxuXHJcbiAgICAgICAgICAgIC8vZ2xfRnJhZ0NvbG9yID0gdmVjNCh0ZXh0dXJlMkQodVRleHR1cmUsIGNvb3JkcykucmdiLCAxLjApO1xyXG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVRleHR1cmUsIGNvb3Jkcyk7O1xyXG4gICAgICAgIH1cclxuICAgIGBcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhc2ljOyIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcclxuXHJcbmxldCBDb2xvcjogU2hhZGVyU3RydWN0ID0ge1xyXG4gICAgdmVydGV4U2hhZGVyOiBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcblxyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uO1xyXG4gICAgICAgIHVuaWZvcm0gbWF0NCB1UG9zaXRpb247XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb24gKiB1UG9zaXRpb24gKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICB9XHJcbiAgICBgLFxyXG5cclxuICAgIGZyYWdtZW50U2hhZGVyOiBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcblxyXG4gICAgICAgIHVuaWZvcm0gdmVjNCB1Q29sb3I7XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHVDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICBgXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb2xvcjsiLCJpbXBvcnQgeyBTaGFkZXJTdHJ1Y3QgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XHJcbmltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuLi9VdGlscyc7XHJcblxyXG5pbnRlcmZhY2UgQXR0cmlidXRlcyB7XHJcbiAgICBbaW5kZXg6IHN0cmluZ106IG51bWJlclxyXG59O1xyXG5cclxuaW50ZXJmYWNlIFVuaWZvcm1zIHtcclxuICAgIFtpbmRleDogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb25cclxufVxyXG5cclxuY2xhc3MgU2hhZGVyIHtcclxuICAgIHB1YmxpYyBhdHRyaWJ1dGVzICAgICAgICAgICAgICAgOiBBdHRyaWJ1dGVzO1xyXG4gICAgcHVibGljIHVuaWZvcm1zICAgICAgICAgICAgICAgICA6IFVuaWZvcm1zO1xyXG4gICAgcHVibGljIHByb2dyYW0gICAgICAgICAgICAgICAgICA6IFdlYkdMUHJvZ3JhbTtcclxuICAgIHB1YmxpYyBhdHRyaWJ1dGVzQ291bnQgICAgICAgICAgOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IHV1aWQgICAgICAgICAgICA6IHN0cmluZztcclxuXHJcbiAgICBzdGF0aWMgbWF4QXR0cmliTGVuZ3RoICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgc3RhdGljIGxhc3RQcm9ncmFtICAgICAgICAgICAgICA6IFNoYWRlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsIHNoYWRlcjogU2hhZGVyU3RydWN0KSB7XHJcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XHJcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY29tcGlsZVNoYWRlcnMoc2hhZGVyKTtcclxuICAgICAgICB0aGlzLmdldFNoYWRlckF0dHJpYnV0ZXMoc2hhZGVyKTtcclxuICAgICAgICB0aGlzLmdldFNoYWRlclVuaWZvcm1zKHNoYWRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb21waWxlU2hhZGVycyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcclxuXHJcbiAgICAgICAgbGV0IHZTaGFkZXI6IFdlYkdMU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgICAgIGdsLnNoYWRlclNvdXJjZSh2U2hhZGVyLCBzaGFkZXIudmVydGV4U2hhZGVyKTtcclxuICAgICAgICBnbC5jb21waWxlU2hhZGVyKHZTaGFkZXIpO1xyXG5cclxuICAgICAgICBsZXQgZlNoYWRlcjogV2ViR0xTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuICAgICAgICBnbC5zaGFkZXJTb3VyY2UoZlNoYWRlciwgc2hhZGVyLmZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBnbC5jb21waWxlU2hhZGVyKGZTaGFkZXIpO1xyXG5cclxuICAgICAgICB0aGlzLnByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgdlNoYWRlcik7XHJcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgZlNoYWRlcik7XHJcbiAgICAgICAgZ2wubGlua1Byb2dyYW0odGhpcy5wcm9ncmFtKTtcclxuXHJcbiAgICAgICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodlNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGdsLmdldFNoYWRlckluZm9Mb2codlNoYWRlcikpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb21waWxpbmcgdmVydGV4IHNoYWRlclwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRTaGFkZXJJbmZvTG9nKGZTaGFkZXIpKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgY29tcGlsaW5nIGZyYWdtZW50IHNoYWRlclwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLnByb2dyYW0pKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgbGlua2luZyB0aGUgcHJvZ3JhbVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaGFkZXJBdHRyaWJ1dGVzKHNoYWRlcjogU2hhZGVyU3RydWN0KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNvZGU6IEFycmF5PHN0cmluZz4gPSBzaGFkZXIudmVydGV4U2hhZGVyLnNwbGl0KC9cXG4vZyk7XHJcbiAgICAgICAgbGV0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSB0aGlzLmdsO1xyXG5cclxuICAgICAgICBsZXQgYXR0cmlidXRlOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGxvY2F0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlc0NvdW50ID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGM6IEFycmF5PHN0cmluZz4gPSBjb2RlW2ldLnRyaW0oKS5zcGxpdCgvIC9nKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjWzBdID09ICdhdHRyaWJ1dGUnKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPSBjLnBvcCgpLnJlcGxhY2UoLzsvZywgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgYXR0cmlidXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV0gPSBsb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc0NvdW50ICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNoYWRlci5tYXhBdHRyaWJMZW5ndGggPSBNYXRoLm1heChTaGFkZXIubWF4QXR0cmliTGVuZ3RoLCB0aGlzLmF0dHJpYnV0ZXNDb3VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaGFkZXJVbmlmb3JtcyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjb2RlOiBBcnJheTxzdHJpbmc+ID0gc2hhZGVyLnZlcnRleFNoYWRlci5zcGxpdCgvXFxuL2cpO1xyXG4gICAgICAgIGNvZGUgPSBjb2RlLmNvbmNhdChzaGFkZXIuZnJhZ21lbnRTaGFkZXIuc3BsaXQoL1xcbi9nKSk7XHJcblxyXG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcclxuXHJcbiAgICAgICAgbGV0IHVuaWZvcm06IHN0cmluZztcclxuICAgICAgICBsZXQgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgICAgIGxldCB1c2VkVW5pZm9ybXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGM6IEFycmF5PHN0cmluZz4gPSBjb2RlW2ldLnRyaW0oKS5zcGxpdCgvIC9nKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjWzBdID09IFwidW5pZm9ybVwiKSB7XHJcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gYy5wb3AoKS5yZXBsYWNlKC87L2csIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZWRVbmlmb3Jtcy5pbmRleE9mKHVuaWZvcm0pICE9IC0xKSB7IGNvbnRpbnVlOyB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1bmlmb3JtKTtcclxuXHJcbiAgICAgICAgICAgICAgICB1c2VkVW5pZm9ybXMucHVzaCh1bmlmb3JtKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm1zW3VuaWZvcm1dID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZVByb2dyYW0oKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKFNoYWRlci5sYXN0UHJvZ3JhbSA9PSB0aGlzKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IHRoaXMuZ2w7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcclxuICAgICAgICBTaGFkZXIubGFzdFByb2dyYW0gPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgYXR0cmliTGVuZ3RoOiBudW1iZXIgPSB0aGlzLmF0dHJpYnV0ZXNDb3VudDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gU2hhZGVyLm1heEF0dHJpYkxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChpIDwgYXR0cmliTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuU2hhZGVyLm1heEF0dHJpYkxlbmd0aCA9IDA7XHJcblNoYWRlci5sYXN0UHJvZ3JhbSA9IG51bGw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFkZXI7IiwiaW1wb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuLi8uLi9lbmdpbmUnO1xyXG5cclxuY2xhc3MgQXBwIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGNvbnN0IHJlbmRlciA9IG5ldyBSZW5kZXJlcig4NTQsIDQ4MCwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXZHYW1lXCIpKTtcclxuXHJcbiAgICAgICAgcmVuZGVyLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiBuZXcgQXBwKCk7Il19
