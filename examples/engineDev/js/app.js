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
        this.position = new Vector3_1.default(0, 0, 0);
        this._target = new Vector3_1.default(0, 0, 0);
        this._up = new Vector3_1.default(0, 1, 0);
        this.screenSize = new Vector3_1.default(0.0);
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
    Camera.prototype.getTransformation = function () {
        if (!this._needsUpdate) {
            return this._transform;
        }
        var f = this.forward, l = Vector3_1.default.cross(this._up, f).normalize(), u = Vector3_1.default.cross(f, l).normalize();
        var cp = this.position, x = -Vector3_1.default.dot(l, cp), y = -Vector3_1.default.dot(u, cp), z = -Vector3_1.default.dot(f, cp);
        this._transform.set(l.x, u.x, f.x, 0, l.y, u.y, f.y, 0, l.z, u.z, f.z, 0, x, y, z, 1);
        this._needsUpdate = false;
        return this._transform;
    };
    Object.defineProperty(Camera.prototype, "forward", {
        get: function () {
            var cp = this.position, t = this._target;
            return new Vector3_1.default(cp.x - t.x, cp.y - t.y, cp.z - t.z).normalize();
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
    Camera.createPerspective = function (fovDegrees, ratio, znear, zfar) {
        var fov = Utils_1.degToRad(fovDegrees);
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

},{"./Utils":11,"./math/Matrix4":24,"./math/Vector3":25}],2:[function(require,module,exports){
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
    DISPLAY_COLLISIONS: false
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

},{"./Config":3,"./Utils":11}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Node = (function () {
    function Node(item) {
        this.item = item;
    }
    Node.prototype.clear = function () {
        this.prev = null;
        this.next = null;
        this.item = null;
    };
    return Node;
}());
var List = (function () {
    function List() {
        this._head = null;
        this._tail = null;
        this._length = 0;
    }
    List.prototype.push = function (item) {
        var node = new Node(item);
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
                node.clear();
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
        var newItem = new Node(item);
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
            node.clear();
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

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shader_1 = require("./shaders/Shader");
var Basic_1 = require("./shaders/Basic");
var Color_1 = require("./shaders/Color");
var Utils_1 = require("./Utils");
var Renderer = (function () {
    function Renderer(width, height) {
        this.id = Utils_1.createUUID();
        this._createCanvas(width, height);
        this._initGL();
        this._initShaders();
    }
    Renderer.prototype._createCanvas = function (width, height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
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

},{"./Utils":11,"./shaders/Basic":27,"./shaders/Color":28,"./shaders/Shader":29}],8:[function(require,module,exports){
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
    RenderingLayer.prototype.render = function (renderer, camera) {
        if (this.onPrerender) {
            this.onPrerender(this._instances);
        }
        this._instances.each(function (instance) {
            instance.instance.render(renderer, camera);
        });
    };
    return RenderingLayer;
}());
exports.default = RenderingLayer;

},{"./List":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RenderingLayer_1 = require("./RenderingLayer");
var List_1 = require("./List");
var Utils_1 = require("./Utils");
var Scene = (function () {
    function Scene() {
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
            item.params.distance = Utils_1.getSquaredDistance(item.instance.position, _this._currentCamera.position);
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
    Scene.prototype.render = function (renderer, camera) {
        this._currentCamera = camera;
        this._renderingLayers.each(function (layer) {
            layer.render(renderer, camera);
        });
        this._currentCamera = null;
    };
    return Scene;
}());
exports.default = Scene;

},{"./List":6,"./RenderingLayer":8,"./Utils":11}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector4_1 = require("./math/Vector4");
var Texture = (function () {
    function Texture(src, callback) {
        var _this = this;
        this._textureMap = {};
        this._ready = false;
        if (src.getContext) {
            this._canvas = src;
            this._img = null;
            this._src = null;
            this._ready = true;
        }
        else {
            this._canvas = null;
            this._src = src;
            this._img = new Image();
            this._img.src = this._src;
            this._img.onload = function () {
                _this._ready = true;
                if (callback) {
                    callback(_this);
                }
            };
        }
    }
    Texture.prototype._parseTexture = function (renderer) {
        var gl = renderer.GL;
        if (!this._textureMap[renderer.id]) {
            this._textureMap[renderer.id] = gl.createTexture();
        }
        var texture = this._textureMap[renderer.id];
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, (this._canvas) ? this._canvas : this._img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    Texture.prototype.getUVS = function (x, y, w, h) {
        var _x;
        if (x.length !== undefined) {
            _x = x.x;
            y = x.y;
            w = x.z;
            h = x.w;
        }
        return new Vector4_1.default(_x / this.width, y / this.height, w / this.width, h / this.height);
    };
    Texture.prototype.getTexture = function (renderer) {
        if (!this._textureMap[renderer.id]) {
            this._parseTexture(renderer);
        }
        return this._textureMap[renderer.id];
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

},{"./math/Vector4":26}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector3_1 = require("./math/Vector3");
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
    return new Vector3_1.default(x - camera.screenSize.x / 2.0, (camera.screenSize.y / 2.0) - y, 0.0);
}
exports.coordsToOrtho = coordsToOrtho;
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

},{"./Constants":4,"./math/Vector3":25}],12:[function(require,module,exports){
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
    BoxCollision.prototype.addCollisionInstance = function () {
        var geometry = new CubeGeometry_1.default(this._size.x, this._size.y, this._size.z), material = new ColorMaterial_1.default(new Vector4_1.default(0.0, 1.0, 0.0, 0.5)), object = new Instance_1.default(geometry, material);
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

},{"../entities/Instance":14,"../geometries/CubeGeometry":16,"../materials/ColorMaterial":22,"../math/Vector4":26,"./Collision":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector3_1 = require("../math/Vector3");
var Collision = (function () {
    function Collision(scene) {
        this.setScene(scene);
        this.solid = true;
        this._offset = new Vector3_1.default(0, 0, 0);
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

},{"../math/Vector3":25}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shader_1 = require("../shaders/Shader");
var Matrix4_1 = require("../math/Matrix4");
var Vector3_1 = require("../math/Vector3");
var Utils_1 = require("../Utils");
var Config_1 = require("../Config");
var List_1 = require("../List");
var Instance = (function () {
    function Instance(geometry, material) {
        if (geometry === void 0) { geometry = null; }
        if (material === void 0) { material = null; }
        this._transform = Matrix4_1.default.createIdentity();
        this._worldMatrix = Matrix4_1.default.createIdentity();
        this.position = new Vector3_1.default(0.0);
        this._rotation = new Vector3_1.default(0.0);
        this.isBillboard = false;
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
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
        this._transform.multiply(Matrix4_1.default.createXRotation(this._rotation.x));
        this._transform.multiply(Matrix4_1.default.createZRotation(this._rotation.z));
        this._transform.multiply(Matrix4_1.default.createYRotation(this._rotation.y));
        var offset = this._geometry.offset;
        this._transform.translate(this.position.x + offset.x, this.position.y + offset.y, this.position.z + offset.z);
        this._needsUpdate = false;
        return this._transform;
    };
    Instance.prototype.setCollision = function (collision) {
        this._collision = collision;
        collision.setInstance(this);
    };
    Instance.prototype.clear = function () {
        this.position.set(0, 0, 0);
        this._rotation.set(0, 0, 0);
        this._transform.setIdentity();
        this._geometry = null;
        this._material = null;
        this.isBillboard = false;
        this._needsUpdate = true;
        this._scene = null;
        this._components.clear();
        this._collision = null;
        this._destroyed = true;
    };
    Instance.prototype.awake = function () {
        this._components.each(function (component) {
            component.awake();
        });
        if (this._collision && Config_1.default.DISPLAY_COLLISIONS) {
            var collision = this._collision;
            collision.setScene(this._scene);
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
        this._geometry.destroy();
        if (this._collision && Config_1.default.DISPLAY_COLLISIONS) {
            this._collision.destroy();
        }
        this._destroyed = true;
    };
    Instance.prototype.render = function (renderer, camera) {
        if (!this._geometry || !this._material) {
            return;
        }
        if (!this._material.isReady) {
            return;
        }
        renderer.switchShader(this._material.shaderName);
        var gl = renderer.GL, shader = Shader_1.default.lastProgram;
        if (this.isBillboard) {
            this.rotate(0, Utils_1.get2DAngle(this.position, camera.position) + Math.PI / 2, 0);
        }
        this._worldMatrix.copy(this.getTransformation());
        this._worldMatrix.multiply(camera.getTransformation());
        gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(shader.uniforms["uPosition"], false, this._worldMatrix.data);
        this._material.render(renderer);
        this._geometry.render(renderer);
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
exports.default = Instance;

},{"../Config":3,"../List":6,"../Utils":11,"../math/Matrix4":24,"../math/Vector3":25,"../shaders/Shader":29}],15:[function(require,module,exports){
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
    position: new Vector3_1.default(0.0, 0.0, 0.0),
    rotation: new Vector3_1.default(0.0, 0.0, 0.0)
};
var Text = (function (_super) {
    __extends(Text, _super);
    function Text(text, font, options) {
        var _this = _super.call(this) || this;
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
        var uvs = [0, 0, (size.width + 4) / canvas.width, (this._options.size + 8) / canvas.height], texture = new Texture_1.default(canvas), material = new BasicMaterial_1.default(texture), geometry = new WallGeometry_1.default(size.width / 100, this._options.size / 100);
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

},{"../Texture":10,"../Utils":11,"../entities/Instance":14,"../geometries/WallGeometry":19,"../materials/BasicMaterial":21,"../math/Vector3":25}],16:[function(require,module,exports){
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
    function CubeGeometry(width, height, length) {
        var _this = _super.call(this) || this;
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
    };
    return CubeGeometry;
}(Geometry_1.default));
exports.default = CubeGeometry;

},{"../geometries/Geometry":17}],17:[function(require,module,exports){
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
        this._buffers = {};
        this._boundingBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        this.offset = new Vector3_1.default(0, 0, 0);
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
        var gl = renderer.GL, bufferMap = { glContext: gl };
        bufferMap.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);
        bufferMap.texCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoords), gl.STATIC_DRAW);
        bufferMap.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferMap.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._triangles), gl.STATIC_DRAW);
        this._indexLength = this._triangles.length;
        this._buffers[renderer.id] = bufferMap;
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
        for (var i in this._buffers) {
            var bufferMap = this._buffers[i], gl = bufferMap.glContext;
            gl.deleteBuffer(bufferMap.vertexBuffer);
            gl.deleteBuffer(bufferMap.texCoordsBuffer);
            gl.deleteBuffer(bufferMap.indexBuffer);
        }
    };
    Geometry.prototype.render = function (renderer) {
        if (!this._buffers[renderer.id]) {
            this.build(renderer);
        }
        var gl = renderer.GL, shader = Shader_1.default.lastProgram, bufferMap = this._buffers[renderer.id];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.vertexBuffer);
        gl.vertexAttribPointer(shader.attributes["aVertexPosition"], Constants_1.VERTICE_SIZE, gl.FLOAT, false, 0, 0);
        if (shader.attributes["aTexCoords"]) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.texCoordsBuffer);
            gl.vertexAttribPointer(shader.attributes["aTexCoords"], Constants_1.TEXCOORD_SIZE, gl.FLOAT, false, 0, 0);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferMap.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this._indexLength, gl.UNSIGNED_SHORT, 0);
    };
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

},{"../Constants":4,"../math/Vector3":25,"../shaders/Shader":29}],18:[function(require,module,exports){
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
    function PlaneGeometry(width, height) {
        var _this = _super.call(this) || this;
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
    };
    return PlaneGeometry;
}(Geometry_1.default));
exports.default = PlaneGeometry;

},{"../geometries/Geometry":17}],19:[function(require,module,exports){
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
    function WallGeometry(width, height) {
        var _this = _super.call(this) || this;
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
    };
    return WallGeometry;
}(Geometry_1.default));
exports.default = WallGeometry;

},{"../geometries/Geometry":17}],20:[function(require,module,exports){
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
exports.Vector3 = Vector3_1.default;
var Vector4_1 = require("./math/Vector4");
exports.Vector4 = Vector4_1.default;
var Shader_1 = require("./shaders/Shader");
exports.Shader = Shader_1.default;
var Basic_1 = require("./shaders/Basic");
exports.Basic = Basic_1.default;
var Color_1 = require("./shaders/Color");
exports.Color = Color_1.default;

},{"./Camera":1,"./Component":2,"./Config":3,"./Constants":4,"./Input":5,"./List":6,"./Renderer":7,"./RenderingLayer":8,"./Scene":9,"./Texture":10,"./Utils":11,"./collisions/BoxCollision":12,"./collisions/Collision":13,"./entities/Instance":14,"./entities/Text":15,"./geometries/CubeGeometry":16,"./geometries/Geometry":17,"./geometries/PlaneGeometry":18,"./geometries/WallGeometry":19,"./materials/BasicMaterial":21,"./materials/ColorMaterial":22,"./materials/Material":23,"./math/Matrix4":24,"./math/Vector3":25,"./math/Vector4":26,"./shaders/Basic":27,"./shaders/Color":28,"./shaders/Shader":29}],21:[function(require,module,exports){
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
    function BasicMaterial(texture) {
        var _this = _super.call(this, "BASIC") || this;
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
    BasicMaterial.prototype.render = function (renderer) {
        if (Material_1.default.lastRendered == this) {
            return;
        }
        var gl = renderer.GL, shader = Shader_1.default.lastProgram;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture.getTexture(renderer));
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

},{"../materials/Material":23,"../shaders/Shader":29}],22:[function(require,module,exports){
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
    function ColorMaterial(color) {
        var _this = _super.call(this, "COLOR") || this;
        _this._color = color.toArray();
        return _this;
    }
    ColorMaterial.prototype.render = function (renderer) {
        if (Material_1.default.lastRendered == this) {
            return;
        }
        var gl = renderer.GL, shader = Shader_1.default.lastProgram;
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

},{"../materials/Material":23,"../shaders/Shader":29}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../Utils");
var Material = (function () {
    function Material(shaderName) {
        this.shaderName = shaderName;
        this.uuid = Utils_1.createUUID();
        this._isOpaque = true;
        this._renderBothFaces = false;
    }
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

},{"../Utils":11}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector4_1 = require("../math/Vector4");
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
    Matrix4.prototype.copy = function (matrix) {
        for (var i = 0; i < 16; i++) {
            this.data[i] = matrix.data[i];
        }
        return this;
    };
    Matrix4.prototype.multiply = function (matrixB) {
        var T = matrixB.data;
        var C1 = new Vector4_1.default(T[0], T[4], T[8], T[12]);
        var C2 = new Vector4_1.default(T[1], T[5], T[9], T[13]);
        var C3 = new Vector4_1.default(T[2], T[6], T[10], T[14]);
        var C4 = new Vector4_1.default(T[3], T[7], T[11], T[15]);
        T = this.data;
        var R1 = new Vector4_1.default(T[0], T[1], T[2], T[3]);
        var R2 = new Vector4_1.default(T[4], T[5], T[6], T[7]);
        var R3 = new Vector4_1.default(T[8], T[9], T[10], T[11]);
        var R4 = new Vector4_1.default(T[12], T[13], T[14], T[15]);
        this.set(Vector4_1.default.dot(R1, C1), Vector4_1.default.dot(R1, C2), Vector4_1.default.dot(R1, C3), Vector4_1.default.dot(R1, C4), Vector4_1.default.dot(R2, C1), Vector4_1.default.dot(R2, C2), Vector4_1.default.dot(R2, C3), Vector4_1.default.dot(R2, C4), Vector4_1.default.dot(R3, C1), Vector4_1.default.dot(R3, C2), Vector4_1.default.dot(R3, C3), Vector4_1.default.dot(R3, C4), Vector4_1.default.dot(R4, C1), Vector4_1.default.dot(R4, C2), Vector4_1.default.dot(R4, C3), Vector4_1.default.dot(R4, C4));
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
    Matrix4.createTranslate = function (x, y, z) {
        return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
    };
    Matrix4.createXRotation = function (radians) {
        var C = Math.cos(radians), S = Math.sin(radians);
        return new Matrix4(1, 0, 0, 0, 0, C, -S, 0, 0, S, C, 0, 0, 0, 0, 1);
    };
    Matrix4.createYRotation = function (radians) {
        var C = Math.cos(radians), S = Math.sin(radians);
        return new Matrix4(C, 0, -S, 0, 0, 1, 0, 0, S, 0, C, 0, 0, 0, 0, 1);
    };
    Matrix4.createZRotation = function (radians) {
        var C = Math.cos(radians), S = Math.sin(radians);
        return new Matrix4(C, -S, 0, 0, S, C, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    };
    return Matrix4;
}());
exports.default = Matrix4;

},{"../math/Vector4":26}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return new Vector3(this.x, this.y, this.z);
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
        return new Vector3(vectorA.y * vectorB.z - vectorA.z * vectorB.y, vectorA.z * vectorB.x - vectorA.x * vectorB.z, vectorA.x * vectorB.y - vectorA.y * vectorB.x);
    };
    Vector3.dot = function (vectorA, vectorB) {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
    };
    return Vector3;
}());
exports.default = Vector3;

},{}],26:[function(require,module,exports){
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
exports.default = Vector4;

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Basic = {
    vertexShader: "\n        precision mediump float;\n\n        attribute vec3 aVertexPosition;\n        attribute vec2 aTexCoords;\n\n        uniform mat4 uProjection;\n        uniform mat4 uPosition;\n\n        varying vec2 vTexCoords;\n\n        void main(void) {\n            gl_Position = uProjection * uPosition * vec4(aVertexPosition, 1.0);\n\n            vTexCoords = aTexCoords;\n        }\n    ",
    fragmentShader: "\n        precision mediump float;\n        \n        uniform vec4 uUV;\n        uniform vec2 uRepeat;\n        uniform sampler2D uTexture;\n\n        varying vec2 vTexCoords;\n\n        void main(void) {\n            vec2 coords = mod(clamp(vTexCoords, 0.0, 1.0) * uRepeat, 1.0) * uUV.zw + uUV.xy;\n\n            //gl_FragColor = vec4(texture2D(uTexture, coords).rgb, 1.0);\n            gl_FragColor = texture2D(uTexture, coords);;\n        }\n    "
};
exports.default = Basic;

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Color = {
    vertexShader: "\n        precision mediump float;\n\n        attribute vec3 aVertexPosition;\n\n        uniform mat4 uProjection;\n        uniform mat4 uPosition;\n\n        void main(void) {\n            gl_Position = uProjection * uPosition * vec4(aVertexPosition, 1.0);\n        }\n    ",
    fragmentShader: "\n        precision mediump float;\n\n        uniform vec4 uColor;\n\n        void main(void) {\n            gl_FragColor = uColor;\n        }\n    "
};
exports.default = Color;

},{}],29:[function(require,module,exports){
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

},{"../Utils":11}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../engine");
var App = (function () {
    function App() {
        var render = new engine_1.Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);
        var render_2 = new engine_1.Renderer(854, 480);
        document.getElementById("divGame").appendChild(render_2.canvas);
        var camera = engine_1.Camera.createPerspective(90, 854 / 480, 0.1, 1000.0);
        camera.setPosition(10, 10, 10);
        camera.setTarget(0, 0, 0);
        var camera_2 = engine_1.Camera.createPerspective(90, 854 / 480, 0.1, 1000.0);
        camera_2.setPosition(0, 0, 10);
        camera_2.setTarget(0, 0, 0);
        var geo = new engine_1.CubeGeometry(2, 2, 2);
        var mat = new engine_1.ColorMaterial(new engine_1.Vector4(1.0, 1.0, 1.0, 1.0));
        var inst = new engine_1.Instance(geo, mat);
        var scene = new engine_1.Scene();
        scene.addGameObject(inst);
        scene.init();
        this._loop(render, render_2, camera, camera_2, scene);
    }
    App.prototype._loop = function (render, render_2, camera, camera_2, scene) {
        var _this = this;
        render.clear();
        render_2.clear();
        scene.render(render, camera);
        scene.render(render_2, camera_2);
        requestAnimationFrame(function () { return _this._loop(render, render_2, camera, camera_2, scene); });
    };
    return App;
}());
window.onload = function () { return new App(); };

},{"../../engine":20}]},{},[30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL0NhbWVyYS50cyIsInNyYy9lbmdpbmUvQ29tcG9uZW50LnRzIiwic3JjL2VuZ2luZS9Db25maWcudHMiLCJzcmMvZW5naW5lL0NvbnN0YW50cy50cyIsInNyYy9lbmdpbmUvSW5wdXQudHMiLCJzcmMvZW5naW5lL0xpc3QudHMiLCJzcmMvZW5naW5lL1JlbmRlcmVyLnRzIiwic3JjL2VuZ2luZS9SZW5kZXJpbmdMYXllci50cyIsInNyYy9lbmdpbmUvU2NlbmUudHMiLCJzcmMvZW5naW5lL1RleHR1cmUudHMiLCJzcmMvZW5naW5lL1V0aWxzLnRzIiwic3JjL2VuZ2luZS9jb2xsaXNpb25zL0JveENvbGxpc2lvbi50cyIsInNyYy9lbmdpbmUvY29sbGlzaW9ucy9Db2xsaXNpb24udHMiLCJzcmMvZW5naW5lL2VudGl0aWVzL0luc3RhbmNlLnRzIiwic3JjL2VuZ2luZS9lbnRpdGllcy9UZXh0LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9HZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL1dhbGxHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvaW5kZXgudHMiLCJzcmMvZW5naW5lL21hdGVyaWFscy9CYXNpY01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbC50cyIsInNyYy9lbmdpbmUvbWF0ZXJpYWxzL01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRoL01hdHJpeDQudHMiLCJzcmMvZW5naW5lL21hdGgvVmVjdG9yMy50cyIsInNyYy9lbmdpbmUvbWF0aC9WZWN0b3I0LnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0Jhc2ljLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0NvbG9yLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL1NoYWRlci50cyIsInNyYy9leGFtcGxlcy9lbmdpbmVEZXYvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSwwQ0FBcUM7QUFDckMsMENBQXFDO0FBQ3JDLGlDQUFtQztBQUVuQztJQVdJLGdCQUFZLFVBQW1CO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUzQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU0sNEJBQVcsR0FBbEIsVUFBbUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sMEJBQVMsR0FBaEIsVUFBaUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7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QUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDdkYsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxNQUFNLENBQUMsRUFDN0IsUUFBUSxHQUFHLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsRUFDckMsUUFBUSxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUU1RSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBQ0wsV0FBQztBQUFELENBM0VBLEFBMkVDLENBM0VrQixrQkFBUSxHQTJFMUI7QUFFRCxrQkFBZSxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3hHcEIsbURBQThDO0FBRTlDO0lBQTJCLGdDQUFRO0lBQy9CLHNCQUFZLEtBQWEsRUFBRSxNQUFjLEVBQUUsTUFBYztRQUF6RCxZQUNJLGlCQUFPLFNBR1Y7UUFERyxLQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7O0lBQzNDLENBQUM7SUFFTyxpQ0FBVSxHQUFsQixVQUFtQixLQUFhLEVBQUUsTUFBYyxFQUFFLE1BQWM7UUFDNUQsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFDYixDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFDZCxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUduQixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FB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QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUvQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNkLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqRCxJQUFJLENBQUMsR0FBRyxDQUNKLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDbEYsaUJBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNsRixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ2xGLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxD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LEdBQUcsRUFBRSxFQUFULENBQVMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgTWF0cml4NCBmcm9tICcuL21hdGgvTWF0cml4NCc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL21hdGgvVmVjdG9yMyc7XG5pbXBvcnQgeyBkZWdUb1JhZCB9IGZyb20gJy4vVXRpbHMnO1xuXG5jbGFzcyBDYW1lcmEge1xuICAgIHByaXZhdGUgX3RyYW5zZm9ybSAgICAgICAgICAgOiBNYXRyaXg0O1xuICAgIHByaXZhdGUgX3RhcmdldCAgICAgICAgICAgICAgOiBWZWN0b3IzO1xuICAgIHByaXZhdGUgX3VwICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xuICAgIHByaXZhdGUgX25lZWRzVXBkYXRlICAgICAgICAgOiBib29sZWFuO1xuXG4gICAgcHVibGljIHBvc2l0aW9uICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHVibGljIHNjcmVlblNpemUgICAgICAgICAgICA6IFZlY3RvcjM7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvamVjdGlvbiAgICAgICAgICA6IE1hdHJpeDQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9qZWN0aW9uOiBNYXRyaXg0KSB7XG4gICAgICAgIHRoaXMucHJvamVjdGlvbiA9IHByb2plY3Rpb247XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IE1hdHJpeDQuY3JlYXRlSWRlbnRpdHkoKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuX3RhcmdldCA9IG5ldyBWZWN0b3IzKDAsIDAsIDApO1xuICAgICAgICB0aGlzLl91cCA9IG5ldyBWZWN0b3IzKDAsIDEsIDApO1xuICAgICAgICB0aGlzLnNjcmVlblNpemUgPSBuZXcgVmVjdG9yMygwLjApO1xuXG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHksIHopO1xuXG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VGFyZ2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBDYW1lcmEge1xuICAgICAgICB0aGlzLl90YXJnZXQuc2V0KHgsIHksIHopO1xuXG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VHJhbnNmb3JtYXRpb24oKTogTWF0cml4NCB7XG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZiA9IHRoaXMuZm9yd2FyZCxcbiAgICAgICAgICAgIGwgPSBWZWN0b3IzLmNyb3NzKHRoaXMuX3VwLCBmKS5ub3JtYWxpemUoKSxcbiAgICAgICAgICAgIHUgPSBWZWN0b3IzLmNyb3NzKGYsIGwpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgIGxldCBjcCA9IHRoaXMucG9zaXRpb24sXG4gICAgICAgICAgICB4ID0gLVZlY3RvcjMuZG90KGwsIGNwKSxcbiAgICAgICAgICAgIHkgPSAtVmVjdG9yMy5kb3QodSwgY3ApLFxuICAgICAgICAgICAgeiA9IC1WZWN0b3IzLmRvdChmLCBjcCk7XG5cbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtLnNldChcbiAgICAgICAgICAgIGwueCwgdS54LCBmLngsIDAsXG4gICAgICAgICAgICBsLnksIHUueSwgZi55LCAwLFxuICAgICAgICAgICAgbC56LCB1LnosIGYueiwgMCxcbiAgICAgICAgICAgICAgeCwgICB5LCAgIHosIDFcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGZvcndhcmQoKTogVmVjdG9yMyB7XG4gICAgICAgIGxldCBjcCA9IHRoaXMucG9zaXRpb24sXG4gICAgICAgICAgICB0ID0gdGhpcy5fdGFyZ2V0O1xuXG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMyhjcC54IC0gdC54LCBjcC55IC0gdC55LCBjcC56IC0gdC56KS5ub3JtYWxpemUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzVXBkYXRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLl9uZWVkc1VwZGF0ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVBlcnNwZWN0aXZlKGZvdkRlZ3JlZXM6IG51bWJlciwgcmF0aW86IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogQ2FtZXJhIHtcbiAgICAgICAgY29uc3QgZm92ID0gZGVnVG9SYWQoZm92RGVncmVlcyk7XG4gICAgICAgIHJldHVybiBuZXcgQ2FtZXJhKE1hdHJpeDQuY3JlYXRlUGVyc3BlY3RpdmUoZm92LCByYXRpbywgem5lYXIsIHpmYXIpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZU9ydGhvZ3JhcGhpYyh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogQ2FtZXJhIHtcbiAgICAgICAgbGV0IHJldCA9IG5ldyBDYW1lcmEoTWF0cml4NC5jcmVhdGVPcnRobyh3aWR0aCwgaGVpZ2h0LCB6bmVhciwgemZhcikpO1xuICAgICAgICByZXQuc2NyZWVuU2l6ZS5zZXQod2lkdGgsIGhlaWdodCwgMCk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhbWVyYTsiLCJpbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5cbmFic3RyYWN0IGNsYXNzIENvbXBvbmVudCB7XG4gICAgcHJvdGVjdGVkIF9pbnN0YW5jZSAgICAgICAgICAgICAgICAgOiBJbnN0YW5jZTtcbiAgICBcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSAgICAgICAgICAgICAgICAgICAgOiBzdHJpbmc7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBjb21wb25lbnROYW1lICAgIDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY29tcG9uZW50TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IGNvbXBvbmVudE5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEluc3RhbmNlKGluc3RhbmNlOiBJbnN0YW5jZSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9pbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhYnN0cmFjdCBhd2FrZSgpOiB2b2lkO1xuICAgIHB1YmxpYyBhYnN0cmFjdCB1cGRhdGUoKTogdm9pZDtcbiAgICBwdWJsaWMgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQ7IiwibGV0IENvbmZpZyA9IHtcbiAgICBQTEFZX0ZVTExTQ1JFRU4gICAgICAgIDogZmFsc2UsXG4gICAgRElTUExBWV9DT0xMSVNJT05TICAgICA6IGZhbHNlXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb25maWc7IiwiZXhwb3J0IGNvbnN0IFZFUlRJQ0VfU0laRSAgICAgICAgICAgPSAzO1xuZXhwb3J0IGNvbnN0IFRFWENPT1JEX1NJWkUgICAgICAgICAgPSAyO1xuXG5leHBvcnQgY29uc3QgUElfMiAgICAgICAgICAgICAgICAgICA9IE1hdGguUEkgLyAyO1xuZXhwb3J0IGNvbnN0IFBJMiAgICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMjtcbmV4cG9ydCBjb25zdCBQSTNfMiAgICAgICAgICAgICAgICAgID0gTWF0aC5QSSAqIDMgLyAyOyIsImltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuL1V0aWxzJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9Db25maWcnO1xuXG5pbnRlcmZhY2UgQ2FsbGJhY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xufVxuXG5jbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBfZWxlbWVudCAgICAgICAgICAgICAgICAgOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9rZXlkb3duQ2FsbGJhY2tzICAgICAgICA6IEFycmF5PENhbGxiYWNrPjtcbiAgICBwcml2YXRlIF9rZXl1cENhbGxiYWNrcyAgICAgICAgICA6IEFycmF5PENhbGxiYWNrPjtcbiAgICBwcml2YXRlIF9tb3VzZW1vdmVDYWxsYmFja3MgICAgICA6IEFycmF5PENhbGxiYWNrPjtcbiAgICBwcml2YXRlIF9lbGVtZW50Rm9jdXMgICAgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2tleWRvd25DYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5fa2V5dXBDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5fbW91c2Vtb3ZlQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1cyA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9oYW5kbGVLZXlkb3duKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudEZvY3VzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9rZXlkb3duQ2FsbGJhY2tzW2ldO2krKykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbGJhY2soa2V5RXZlbnQua2V5Q29kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVLZXl1cChrZXlFdmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9dGhpcy5fa2V5dXBDYWxsYmFja3NbaV07aSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhrZXlFdmVudC5rZXlDb2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2hhbmRsZU1vdXNlTW92ZShtb3VzZUV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudEZvY3VzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9tb3VzZW1vdmVDYWxsYmFja3NbaV07aSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhtb3VzZUV2ZW50Lm1vdmVtZW50WCwgbW91c2VFdmVudC5tb3ZlbWVudFkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1cyA9IChkb2N1bWVudC5wb2ludGVyTG9ja0VsZW1lbnQgPT09IHRoaXMuX2VsZW1lbnQpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9kZWxldGVGcm9tTGlzdChsaXN0OiBBcnJheTxDYWxsYmFjaz4sIGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgZm9yIChsZXQgaT0wLGNhbGxiYWNrO2NhbGxiYWNrPWxpc3RbaV07aSsrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suaWQgPT0gaWQpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVDYWxsYmFja1RvTGlzdChsaXN0OiBBcnJheTxDYWxsYmFjaz4sIGNhbGxiYWNrOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgICAgIGxldCByZXQ6IENhbGxiYWNrID0ge1xuICAgICAgICAgICAgaWQ6IGNyZWF0ZVVVSUQoKSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5wdXNoKHJldCk7XG5cbiAgICAgICAgcmV0dXJuIHJldC5pZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdChmb2N1c0VsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBmb2N1c0VsZW1lbnQ7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleWRvd24oa2V5RXZlbnQpOyB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChrZXlFdmVudDogS2V5Ym9hcmRFdmVudCkgPT4geyB0aGlzLl9oYW5kbGVLZXl1cChrZXlFdmVudCk7IH0pO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZXY6IE1vdXNlRXZlbnQpID0+IHsgdGhpcy5faGFuZGxlTW91c2VNb3ZlKGV2KTsgfSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW96cG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuID0gdGhpcy5fZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCB0aGlzLl9lbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIHx8ICg8YW55PnRoaXMuX2VsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChDb25maWcuUExBWV9GVUxMU0NSRUVOICYmIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcblxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZXF1ZXN0UG9pbnRlckxvY2soKTtcbiAgICAgICAgfSk7XG4gICAgfSBcblxuICAgIHB1YmxpYyBvbktleWRvd24oY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KHRoaXMuX2tleWRvd25DYWxsYmFja3MsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG9uS2V5dXAoY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KHRoaXMuX2tleXVwQ2FsbGJhY2tzLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uTW91c2VNb3ZlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYWxsYmFja1RvTGlzdCh0aGlzLl9tb3VzZW1vdmVDYWxsYmFja3MsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVsZXRlQ2FsbGJhY2soaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZGVsZXRlRnJvbUxpc3QodGhpcy5fa2V5ZG93bkNhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodGhpcy5fZGVsZXRlRnJvbUxpc3QodGhpcy5fa2V5dXBDYWxsYmFja3MsIGlkKSkgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZUZyb21MaXN0KHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKG5ldyBJbnB1dCgpKTsiLCJjbGFzcyBOb2RlIHtcbiAgICBwdWJsaWMgcHJldiAgICAgICAgOiBOb2RlO1xuICAgIHB1YmxpYyBuZXh0ICAgICAgICA6IE5vZGU7XG4gICAgcHVibGljIGl0ZW0gICAgICAgIDogYW55O1xuICAgIHB1YmxpYyBpblVzZSAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihpdGVtOiBhbnkpIHtcbiAgICAgICAgdGhpcy5pdGVtID0gaXRlbTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuaXRlbSA9IG51bGw7XG4gICAgfVxufVxuXG5jbGFzcyBMaXN0PFQ+IHtcbiAgICBwcml2YXRlIF9oZWFkICAgICAgICAgICA6IE5vZGU7XG4gICAgcHJpdmF0ZSBfdGFpbCAgICAgICAgICAgOiBOb2RlO1xuICAgIHByaXZhdGUgX2xlbmd0aCAgICAgICAgIDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2hlYWQgPSBudWxsO1xuICAgICAgICB0aGlzLl90YWlsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHVzaChpdGVtOiBUKTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gbmV3IE5vZGUoaXRlbSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5faGVhZCA9IG5vZGU7XG4gICAgICAgICAgICB0aGlzLl90YWlsID0gbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0YWlsID0gdGhpcy5fdGFpbDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm9kZS5wcmV2ID0gdGFpbDtcbiAgICAgICAgICAgIHRhaWwubmV4dCA9IG5vZGU7XG5cbiAgICAgICAgICAgIHRoaXMuX3RhaWwgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGVuZ3RoICs9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZShpdGVtOiBUKTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZDtcblxuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuaXRlbSA9PSBpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucHJldil7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl90YWlsID09IG5vZGUpIHsgdGhpcy5fdGFpbCA9IG5vZGUucHJldjsgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLnByZXYubmV4dCA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0KXsgXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oZWFkID09IG5vZGUpIHsgdGhpcy5faGVhZCA9IG5vZGUubmV4dDsgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBub2RlLmNsZWFyKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9sZW5ndGggLT0gMTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBdChpbmRleDogbnVtYmVyKTogVCB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggPT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZCxcbiAgICAgICAgICAgIGNvdW50ID0gMDtcblxuICAgICAgICB3aGlsZSAoY291bnQgPCBpbmRleCkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgIGNvdW50Kys7XG5cbiAgICAgICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGUuaXRlbTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGluc2VydEF0KGluZGV4OiBudW1iZXIsIGl0ZW06IFQpOiB2b2lkIHtcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkLFxuICAgICAgICAgICAgY291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMuX2xlbmd0aCsrO1xuXG4gICAgICAgIHdoaWxlIChjb3VudCA8IGluZGV4KSB7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdJdGVtID0gbmV3IE5vZGUoaXRlbSk7XG4gICAgICAgIGlmICh0aGlzLl9oZWFkID09IG5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYWQucHJldiA9IG5ld0l0ZW07XG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSB0aGlzLl9oZWFkO1xuICAgICAgICAgICAgdGhpcy5faGVhZCA9IG5ld0l0ZW07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSBub2RlO1xuICAgICAgICAgICAgbmV3SXRlbS5wcmV2ID0gbm9kZS5wcmV2O1xuICAgIFxuICAgICAgICAgICAgaWYgKG5vZGUucHJldikgbm9kZS5wcmV2Lm5leHQgPSBuZXdJdGVtO1xuICAgICAgICAgICAgbm9kZS5wcmV2ID0gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBlYWNoKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2hlYWQ7XG5cbiAgICAgICAgd2hpbGUgKGl0ZW0pIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0uaXRlbSk7XG5cbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLm5leHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZDtcblxuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5jbGVhcigpO1xuXG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNvcnQoc29ydENoZWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fbGVuZ3RoIDwgMikgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQubmV4dCxcbiAgICAgICAgICAgIGNvbXBhcmUgPSB0aGlzLl9oZWFkO1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IG5vZGUubmV4dDtcblxuICAgICAgICAgICAgaWYgKHNvcnRDaGVjayhub2RlLml0ZW0sIGNvbXBhcmUuaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2KSB7IG5vZGUucHJldi5uZXh0ID0gbm9kZS5uZXh0OyB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubmV4dCkgeyBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjsgfVxuXG4gICAgICAgICAgICAgICAgbm9kZS5uZXh0ID0gY29tcGFyZTtcbiAgICAgICAgICAgICAgICBub2RlLnByZXYgPSBjb21wYXJlLnByZXY7XG5cbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZS5wcmV2KSBjb21wYXJlLnByZXYubmV4dCA9IG5vZGU7XG4gICAgICAgICAgICAgICAgY29tcGFyZS5wcmV2ID0gbm9kZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZSA9PSB0aGlzLl9oZWFkKSB7IHRoaXMuX2hlYWQgPSBub2RlOyB9IFxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlID09IHRoaXMuX3RhaWwpIHsgdGhpcy5fdGFpbCA9IG5vZGU7IH1cblxuICAgICAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICAgICAgICAgIGNvbXBhcmUgPSB0aGlzLl9oZWFkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wYXJlID0gY29tcGFyZS5uZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29tcGFyZSA9PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGhlYWQoKTogTm9kZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0OyIsImltcG9ydCBTaGFkZXIgZnJvbSAnLi9zaGFkZXJzL1NoYWRlcic7XG5pbXBvcnQgQmFzaWMgZnJvbSAnLi9zaGFkZXJzL0Jhc2ljJztcbmltcG9ydCBDb2xvciBmcm9tICcuL3NoYWRlcnMvQ29sb3InO1xuaW1wb3J0IHsgU2hhZGVyTWFwLCBTaGFkZXJzTmFtZXMgfSBmcm9tICcuL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcbmltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuL1V0aWxzJztcblxuY2xhc3MgUmVuZGVyZXIge1xuICAgIHByaXZhdGUgX2NhbnZhcyAgICAgICAgICAgICAgOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIF9nbCAgICAgICAgICAgICAgICAgIDogV2ViR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIHByaXZhdGUgX3NoYWRlcnMgICAgICAgICAgICAgOiBTaGFkZXJNYXA7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgaWQgICAgICAgICAgIDogc3RyaW5nO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuaWQgPSBjcmVhdGVVVUlEKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9jcmVhdGVDYW52YXMod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMuX2luaXRHTCgpO1xuICAgICAgICB0aGlzLl9pbml0U2hhZGVycygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUNhbnZhcyh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblxuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLl9jYW52YXMgPSBjYW52YXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdEdMKCk6IHZvaWQge1xuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dChcIndlYmdsXCIpO1xuXG4gICAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG5cbiAgICAgICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgICAgIFxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDEpO1xuXG4gICAgICAgIHRoaXMuX2dsID0gZ2w7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdFNoYWRlcnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NoYWRlcnMgPSB7fTtcblxuICAgICAgICB0aGlzLl9zaGFkZXJzLkJBU0lDID0gbmV3IFNoYWRlcih0aGlzLl9nbCwgQmFzaWMpO1xuICAgICAgICB0aGlzLl9zaGFkZXJzLkNPTE9SID0gbmV3IFNoYWRlcih0aGlzLl9nbCwgQ29sb3IpO1xuXG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQkFTSUMudXNlUHJvZ3JhbSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fZ2w7XG5cbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzd2l0Y2hTaGFkZXIoc2hhZGVyTmFtZTogU2hhZGVyc05hbWVzKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NoYWRlcnNbc2hhZGVyTmFtZV0udXNlUHJvZ3JhbSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTaGFkZXIoc2hhZGVyTmFtZTogU2hhZGVyc05hbWVzKTogU2hhZGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYWRlcnNbc2hhZGVyTmFtZV07XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBHTCgpOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2w7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhcy53aWR0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FudmFzLmhlaWdodDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmVyOyIsImltcG9ydCBJbnN0YW5jZSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcbmltcG9ydCBMaXN0IGZyb20gJy4vTGlzdCc7XG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuL1JlbmRlcmVyJztcblxuaW50ZXJmYWNlIFBhcmFtcyB7XG4gICAgW2luZGV4OiBzdHJpbmddIDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5zdGFuY2VzTWFwIHtcbiAgICBpbnN0YW5jZTogSW5zdGFuY2U7XG4gICAgcGFyYW1zOiBQYXJhbXNcbn1cblxuY2xhc3MgUmVuZGVyaW5nTGF5ZXIge1xuICAgIHByaXZhdGUgX2luc3RhbmNlcyAgICAgICAgICAgICAgICAgICA6IExpc3Q8SW5zdGFuY2VzTWFwPjtcblxuICAgIHB1YmxpYyBvblByZXJlbmRlciAgICAgICAgICAgICAgICAgICA6IEZ1bmN0aW9uO1xuICAgIHB1YmxpYyBvblBvc3RVcGRhdGUgICAgICAgICAgICAgICAgICA6IEZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2luc3RhbmNlcyA9IG5ldyBMaXN0KCk7XG5cbiAgICAgICAgdGhpcy5vblByZXJlbmRlciA9IG51bGw7XG4gICAgICAgIHRoaXMub25Qb3N0VXBkYXRlID0gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVJbnN0YW5jZU1hcChpbnN0YW5jZTogSW5zdGFuY2UpOiBJbnN0YW5jZXNNYXAge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlLFxuICAgICAgICAgICAgcGFyYW1zOiB7fVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEluc3RhbmNlKGluc3RhbmNlOiBJbnN0YW5jZSk6IHZvaWQge1xuICAgICAgICBsZXQgYWRkZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaT0wLGlucztpbnM9dGhpcy5faW5zdGFuY2VzLmdldEF0KGkpO2krKykge1xuICAgICAgICAgICAgbGV0IGNvbmQxID0gKCFpbnMuaW5zdGFuY2UubWF0ZXJpYWwgJiYgIWluc3RhbmNlLm1hdGVyaWFsKSxcbiAgICAgICAgICAgICAgICBjb25kMiA9IChpbnMuaW5zdGFuY2UubWF0ZXJpYWwgJiYgaW5zdGFuY2UubWF0ZXJpYWwgJiYgaW5zLmluc3RhbmNlLm1hdGVyaWFsLnNoYWRlck5hbWUgPT0gaW5zdGFuY2UubWF0ZXJpYWwuc2hhZGVyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChjb25kMSB8fCBjb25kMikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlcy5pbnNlcnRBdChpLCB0aGlzLl9jcmVhdGVJbnN0YW5jZU1hcChpbnN0YW5jZSkpO1xuICAgICAgICAgICAgICAgIGkgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGFkZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYWRkZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlcy5wdXNoKHRoaXMuX2NyZWF0ZUluc3RhbmNlTWFwKGluc3RhbmNlKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGF3YWtlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXMuZWFjaCgoaW5zdGFuY2U6IEluc3RhbmNlc01hcCkgPT4ge1xuICAgICAgICAgICAgaW5zdGFuY2UuaW5zdGFuY2UuYXdha2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzLmVhY2goKGluc3RhbmNlOiBJbnN0YW5jZXNNYXApID0+IHtcbiAgICAgICAgICAgIGxldCBpbnMgPSBpbnN0YW5jZS5pbnN0YW5jZTtcbiAgICAgICAgICAgIGlmIChpbnMuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMucmVtb3ZlKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlucy51cGRhdGUoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub25Qb3N0VXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblBvc3RVcGRhdGUoaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKHJlbmRlcmVyOiBSZW5kZXJlciwgY2FtZXJhOiBDYW1lcmEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub25QcmVyZW5kZXIpIHsgXG4gICAgICAgICAgICB0aGlzLm9uUHJlcmVuZGVyKHRoaXMuX2luc3RhbmNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbnN0YW5jZXMuZWFjaCgoaW5zdGFuY2U6IEluc3RhbmNlc01hcCkgPT4ge1xuICAgICAgICAgICAgaW5zdGFuY2UuaW5zdGFuY2UucmVuZGVyKHJlbmRlcmVyLCBjYW1lcmEpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmluZ0xheWVyOyIsImltcG9ydCBDYW1lcmEgZnJvbSAnLi9DYW1lcmEnO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXInO1xuaW1wb3J0IFJlbmRlcmluZ0xheWVyIGZyb20gJy4vUmVuZGVyaW5nTGF5ZXInO1xuaW1wb3J0IHsgSW5zdGFuY2VzTWFwIH0gZnJvbSAnLi9SZW5kZXJpbmdMYXllcic7XG5pbXBvcnQgTGlzdCBmcm9tICcuL0xpc3QnO1xuaW1wb3J0IHsgZ2V0U3F1YXJlZERpc3RhbmNlIH0gZnJvbSAnLi9VdGlscyc7XG5pbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL21hdGgvVmVjdG9yMyc7XG5cbmNsYXNzIFNjZW5lIHtcbiAgICBwcml2YXRlIF9jdXJyZW50Q2FtZXJhICAgICAgICAgICAgICA6IENhbWVyYTtcblxuICAgIHByb3RlY3RlZCBfc3RhcnRlZCAgICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX3JlbmRlcmluZ0xheWVycyAgICAgICAgICA6IExpc3Q8UmVuZGVyaW5nTGF5ZXI+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdExheWVycygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzID0gbmV3IExpc3QoKTtcblxuICAgICAgICBsZXQgb3BhcXVlcyA9IG5ldyBSZW5kZXJpbmdMYXllcigpO1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMucHVzaChvcGFxdWVzKTtcblxuICAgICAgICBsZXQgdHJhbnNwYXJlbnRzID0gbmV3IFJlbmRlcmluZ0xheWVyKCk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5wdXNoKHRyYW5zcGFyZW50cyk7XG5cbiAgICAgICAgdHJhbnNwYXJlbnRzLm9uUG9zdFVwZGF0ZSA9ICgoaXRlbTogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICBpdGVtLnBhcmFtcy5kaXN0YW5jZSA9IGdldFNxdWFyZWREaXN0YW5jZShpdGVtLmluc3RhbmNlLnBvc2l0aW9uLCB0aGlzLl9jdXJyZW50Q2FtZXJhLnBvc2l0aW9uKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJhbnNwYXJlbnRzLm9uUHJlcmVuZGVyID0gKGluc3RhbmNlczogTGlzdDxJbnN0YW5jZXNNYXA+KSA9PiB7XG4gICAgICAgICAgICBpbnN0YW5jZXMuc29ydCgoaXRlbUE6IEluc3RhbmNlc01hcCwgaXRlbUI6IEluc3RhbmNlc01hcCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaXRlbUEucGFyYW1zLmRpc3RhbmNlID4gaXRlbUIucGFyYW1zLmRpc3RhbmNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRHYW1lT2JqZWN0KGluc3RhbmNlOiBJbnN0YW5jZSk6IHZvaWQge1xuICAgICAgICBsZXQgbWF0ID0gaW5zdGFuY2UubWF0ZXJpYWw7XG5cbiAgICAgICAgaW5zdGFuY2Uuc2V0U2NlbmUodGhpcyk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5fc3RhcnRlZCkge1xuICAgICAgICAgICAgaW5zdGFuY2UuYXdha2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXllciA9IHRoaXMuX3JlbmRlcmluZ0xheWVycy5nZXRBdCgwKTtcbiAgICAgICAgaWYgKG1hdCAmJiAhbWF0LmlzT3BhcXVlKSB7XG4gICAgICAgICAgICBsYXllciA9IHRoaXMuX3JlbmRlcmluZ0xheWVycy5nZXRBdCgxKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGF5ZXIuYWRkSW5zdGFuY2UoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0ZXN0Q29sbGlzaW9uKGluc3RhbmNlOiBJbnN0YW5jZSwgZGlyZWN0aW9uOiBWZWN0b3IzKTogVmVjdG9yMyB7XG4gICAgICAgIGluc3RhbmNlO1xuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XG4gICAgICAgICAgICBsYXllci5hd2FrZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XG4gICAgICAgICAgICBsYXllci51cGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRDYW1lcmEgPSBjYW1lcmE7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLmVhY2goKGxheWVyOiBSZW5kZXJpbmdMYXllcikgPT4ge1xuICAgICAgICAgICAgbGF5ZXIucmVuZGVyKHJlbmRlcmVyLCBjYW1lcmEpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9jdXJyZW50Q2FtZXJhID0gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lOyIsImltcG9ydCBSZW5kZXJlciBmcm9tICcuL1JlbmRlcmVyJztcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4vbWF0aC9WZWN0b3I0JztcblxuaW50ZXJmYWNlIFJlbmRlcmVyVGV4dHVyZU1hcCB7XG4gICAgW2luZGV4OiBzdHJpbmddICAgICAgICAgICAgIDogV2ViR0xUZXh0dXJlO1xufVxuXG5jbGFzcyBUZXh0dXJlIHtcbiAgICBwcml2YXRlIF9zcmMgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwcml2YXRlIF9pbWcgICAgICAgICAgICAgICA6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfY2FudmFzICAgICAgICAgICAgOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIF9yZWFkeSAgICAgICAgICAgICA6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfdGV4dHVyZU1hcCAgICAgICAgOiBSZW5kZXJlclRleHR1cmVNYXA7XG5cbiAgICBjb25zdHJ1Y3RvcihzcmM6IHN0cmluZ3xIVE1MQ2FudmFzRWxlbWVudCwgY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuICAgICAgICB0aGlzLl90ZXh0dXJlTWFwID0ge307XG4gICAgICAgIHRoaXMuX3JlYWR5ID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBpZiAoKDxIVE1MQ2FudmFzRWxlbWVudD5zcmMpLmdldENvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5zcmM7XG4gICAgICAgICAgICB0aGlzLl9pbWcgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc3JjID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fcmVhZHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY2FudmFzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NyYyA9IDxzdHJpbmc+c3JjO1xuXG4gICAgICAgICAgICB0aGlzLl9pbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHRoaXMuX2ltZy5zcmMgPSB0aGlzLl9zcmM7XG4gICAgICAgICAgICB0aGlzLl9pbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlYWR5ID0gdHJ1ZTtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3BhcnNlVGV4dHVyZShyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZ2wgPSByZW5kZXJlci5HTDtcblxuICAgICAgICBpZiAoIXRoaXMuX3RleHR1cmVNYXBbcmVuZGVyZXIuaWRdKSB7XG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlTWFwW3JlbmRlcmVyLmlkXSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSB0aGlzLl90ZXh0dXJlTWFwW3JlbmRlcmVyLmlkXTtcblxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCAodGhpcy5fY2FudmFzKT8gdGhpcy5fY2FudmFzIDogdGhpcy5faW1nKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVWUyh4OiBudW1iZXJ8VmVjdG9yNCwgeT86IG51bWJlciwgdz86IG51bWJlciwgaD86IG51bWJlcik6IFZlY3RvcjQge1xuICAgICAgICBsZXQgX3g6IG51bWJlcjtcblxuICAgICAgICBpZiAoKDxWZWN0b3I0PngpLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yND54KS54O1xuICAgICAgICAgICAgeSA9ICg8VmVjdG9yND54KS55O1xuICAgICAgICAgICAgdyA9ICg8VmVjdG9yND54KS56O1xuICAgICAgICAgICAgaCA9ICg8VmVjdG9yND54KS53O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3I0KFxuICAgICAgICAgICAgX3ggLyB0aGlzLndpZHRoLFxuICAgICAgICAgICAgeSAvIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgdyAvIHRoaXMud2lkdGgsXG4gICAgICAgICAgICBoIC8gdGhpcy5oZWlnaHRcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VGV4dHVyZShyZW5kZXJlcjogUmVuZGVyZXIpOiBXZWJHTFRleHR1cmUge1xuICAgICAgICBpZiAoIXRoaXMuX3RleHR1cmVNYXBbcmVuZGVyZXIuaWRdKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJzZVRleHR1cmUocmVuZGVyZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RleHR1cmVNYXBbcmVuZGVyZXIuaWRdO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMud2lkdGggOiB0aGlzLl9pbWcud2lkdGg7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMuaGVpZ2h0IDogdGhpcy5faW1nLmhlaWdodDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHR1cmU7IiwiaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xuaW1wb3J0IHsgUEkyIH0gZnJvbSAnLi9Db25zdGFudHMnO1xuaW1wb3J0IENhbWVyYSBmcm9tICcuL0NhbWVyYSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVVUlEKCk6IHN0cmluZyB7XG4gICAgbGV0IGRhdGUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpLFxuICAgICAgICByZXQgPSAoJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcpLnJlcGxhY2UoL1t4eV0vZywgKGM6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICBsZXQgcmFuID0gKGRhdGUgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgICAgICAgICAgZGF0ZSA9IE1hdGguZmxvb3IoZGF0ZSAvIDE2KTtcblxuICAgICAgICAgICAgcmV0dXJuIChjID09ICd4JyA/IHJhbiA6IChyYW4mMHgzfDB4OCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQoZGVncmVlczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQyRFZlY3RvckRpcih4OiBudW1iZXIsIHk6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHggPT0gMSAmJiB5ID09IDApIHsgcmV0dXJuIDA7IH1lbHNlIFxuICAgIGlmICh4ID09IDEgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoNDUpOyB9ZWxzZSBcbiAgICBpZiAoeCA9PSAwICYmIHkgPT0gLTEpIHsgcmV0dXJuIGRlZ1RvUmFkKDkwKTsgfWVsc2VcbiAgICBpZiAoeCA9PSAtMSAmJiB5ID09IC0xKSB7IHJldHVybiBkZWdUb1JhZCgxMzUpOyB9ZWxzZVxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMCkgeyByZXR1cm4gTWF0aC5QSTsgfWVsc2VcbiAgICBpZiAoeCA9PSAtMSAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDIyNSk7IH1lbHNlXG4gICAgaWYgKHggPT0gMCAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDI3MCk7IH1lbHNlXG4gICAgaWYgKHggPT0gMSAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDMxNSk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEQW5nbGUocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xuICAgIGxldCB4ID0gcG9zaXRpb24yLnggLSBwb3NpdGlvbjEueCxcbiAgICAgICAgeSA9IHBvc2l0aW9uMi56IC0gcG9zaXRpb24xLno7XG5cbiAgICBsZXQgcmV0ID0gTWF0aC5hdGFuMigteSwgeCk7XG5cbiAgICByZXR1cm4gKHJldCArIFBJMikgJSBQSTI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTcXVhcmVkRGlzdGFuY2UocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xuICAgIGxldCB4ID0gcG9zaXRpb24xLnggLSBwb3NpdGlvbjIueCxcbiAgICAgICAgeSA9IHBvc2l0aW9uMS55IC0gcG9zaXRpb24yLnksXG4gICAgICAgIHogPSBwb3NpdGlvbjEueiAtIHBvc2l0aW9uMi56O1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb29yZHNUb09ydGhvKGNhbWVyYTogQ2FtZXJhLCB4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyhcbiAgICAgICAgeCAtIGNhbWVyYS5zY3JlZW5TaXplLnggLyAyLjAsXG4gICAgICAgIChjYW1lcmEuc2NyZWVuU2l6ZS55IC8gMi4wKSAtIHksXG4gICAgICAgIDAuMFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZFVwUG93ZXJPZjIoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBsZXQgcmV0ID0gMjtcblxuICAgIHdoaWxlIChyZXQgPCB4KSB7XG4gICAgICAgIHJldCAqPSAyO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodHRwUmVxdWVzdCh1cmw6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgbGV0IGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICBodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBodHRwLnNlbmQoKTtcbn0iLCJpbXBvcnQgQ29sbGlzaW9uIGZyb20gJy4vQ29sbGlzaW9uJztcbmltcG9ydCBDb2xvck1hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9Db2xvck1hdGVyaWFsJztcbmltcG9ydCBDdWJlR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9DdWJlR2VvbWV0cnknO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XG5pbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi4vZW50aXRpZXMvSW5zdGFuY2UnO1xuXG5jbGFzcyBCb3hDb2xsaXNpb24gZXh0ZW5kcyBDb2xsaXNpb24ge1xuICAgIHByaXZhdGUgX3NpemUgICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xuICAgIHByaXZhdGUgX2JveCAgICAgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuXG4gICAgcHVibGljIGlzRHluYW1pYyAgICAgICAgICAgICAgICA6IGJvb2xlYW47XG4gICAgXG5cbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogVmVjdG9yMywgc2l6ZTogVmVjdG9yMykge1xuICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgICB0aGlzLl9zaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy5pc0R5bmFtaWMgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9yZWNhbGMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZW9yZGVyQm94KGJveDogQXJyYXk8bnVtYmVyPik6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBmb3IgKGxldCBpPTA7aTwzO2krKykge1xuICAgICAgICAgICAgaWYgKGJveFszK2ldIDwgYm94WzAraV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IGJveFswK2ldO1xuICAgICAgICAgICAgICAgIGJveFswK2ldID0gYm94WzMraV07XG4gICAgICAgICAgICAgICAgYm94WzMraV0gPSBoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJveDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ib3hDb2xsaXNpb24oYm94OiBBcnJheTxudW1iZXI+KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBiID0gdGhpcy5fYm94O1xuXG4gICAgICAgIGlmIChib3hbMF0gPj0gYlszXSB8fCBib3hbMV0gPj0gYls0XSB8fCBib3hbMl0gPj0gYls1XSB8fCBib3hbM10gPCBiWzBdIHx8IGJveFs0XSA8IGJbMV0gfHwgYm94WzVdIDwgYlsyXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVjYWxjKCk6IHZvaWQge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbixcbiAgICAgICAgICAgIHNpemUgPSB0aGlzLl9zaXplO1xuXG4gICAgICAgIGxldCBweCA9IHBvc2l0aW9uLnggKyB0aGlzLl9vZmZzZXQueCxcbiAgICAgICAgICAgIHB5ID0gcG9zaXRpb24ueSArIHRoaXMuX29mZnNldC55LFxuICAgICAgICAgICAgcHogPSBwb3NpdGlvbi56ICsgdGhpcy5fb2Zmc2V0LnosXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN4ID0gc2l6ZS54IC8gMixcbiAgICAgICAgICAgIHN5ID0gc2l6ZS55IC8gMixcbiAgICAgICAgICAgIHN6ID0gc2l6ZS56IC8gMjtcblxuICAgICAgICB0aGlzLl9ib3ggPSB0aGlzLl9yZW9yZGVyQm94KFtweCAtIHN4LCBweSAtIHN5LCBweiAtIHN6LCBweCArIHN4LCBweSArIHN5LCBweiArIHN6XSk7XG4gICAgfVxuXG4gICAgcHVibGljIHRlc3QocG9zaXRpb246IFZlY3RvcjMsIGRpcmVjdGlvbjogVmVjdG9yMyk6IFZlY3RvcjMge1xuICAgICAgICBpZiAodGhpcy5pc0R5bmFtaWMpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlY2FsYygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbGxpZGVkID0gZmFsc2UsXG4gICAgICAgICAgICB3aWR0aCA9IDAuMyxcbiAgICAgICAgICAgIGhlaWdodCA9IDAuOCxcbiAgICAgICAgICAgIHggPSBwb3NpdGlvbi54LFxuICAgICAgICAgICAgeSA9IHBvc2l0aW9uLnksXG4gICAgICAgICAgICB6ID0gcG9zaXRpb24ueixcbiAgICAgICAgICAgIHhUbyA9IGRpcmVjdGlvbi54LFxuICAgICAgICAgICAgelRvID0gZGlyZWN0aW9uLnosXG4gICAgICAgICAgICBzaWduID0gKGRpcmVjdGlvbi54ID4gMCk/IDEgOiAtMSxcbiAgICAgICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCAqIHNpZ24sIHksIHogLSB3aWR0aCwgeCArIHdpZHRoICogc2lnbiArIGRpcmVjdGlvbi54LCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGhdKTtcblxuICAgICAgICBpZiAodGhpcy5fYm94Q29sbGlzaW9uKGJveCkpIHtcbiAgICAgICAgICAgIHhUbyA9IDA7XG4gICAgICAgICAgICBjb2xsaWRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB4ICs9IHhUbztcbiAgICAgICAgXG4gICAgICAgIHNpZ24gPSAoZGlyZWN0aW9uLnogPiAwKT8gMSA6IC0xO1xuICAgICAgICBib3ggPSB0aGlzLl9yZW9yZGVyQm94KFt4IC0gd2lkdGgsIHksIHogLSB3aWR0aCAqIHNpZ24sIHggKyB3aWR0aCwgeSArIGhlaWdodCwgeiArIHdpZHRoICogc2lnbiArIGRpcmVjdGlvbi56XSk7XG4gICAgICAgIGlmICh0aGlzLl9ib3hDb2xsaXNpb24oYm94KSkge1xuICAgICAgICAgICAgelRvID0gMDtcbiAgICAgICAgICAgIGNvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY29sbGlkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc29saWQpIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbi5zZXQoeFRvLCAwLCB6VG8pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQ29sbGlzaW9uSW5zdGFuY2UoKTogdm9pZCB7XG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBDdWJlR2VvbWV0cnkodGhpcy5fc2l6ZS54LCB0aGlzLl9zaXplLnksIHRoaXMuX3NpemUueiksXG4gICAgICAgICAgICBtYXRlcmlhbCA9IG5ldyBDb2xvck1hdGVyaWFsKG5ldyBWZWN0b3I0KDAuMCwgMS4wLCAwLjAsIDAuNSkpLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmplY3QgPSBuZXcgSW5zdGFuY2UoZ2VvbWV0cnksIG1hdGVyaWFsKTtcblxuICAgICAgICBtYXRlcmlhbC5zZXRPcGFxdWUoZmFsc2UpO1xuXG4gICAgICAgIG9iamVjdC5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uO1xuXG4gICAgICAgIGdlb21ldHJ5Lm9mZnNldCA9IHRoaXMuX29mZnNldDtcblxuICAgICAgICB0aGlzLl9zY2VuZS5hZGRHYW1lT2JqZWN0KG9iamVjdCk7XG5cbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlID0gb2JqZWN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBjZW50ZXJJbkF4aXMoeDogYm9vbGVhbiwgeTogYm9vbGVhbiwgejogYm9vbGVhbik6IEJveENvbGxpc2lvbiB7XG4gICAgICAgIHRoaXMuX29mZnNldC54ID0gKCF4KT8gdGhpcy5fc2l6ZS54IC8gMiA6IDA7XG4gICAgICAgIHRoaXMuX29mZnNldC55ID0gKCF5KT8gdGhpcy5fc2l6ZS55IC8gMiA6IDA7XG4gICAgICAgIHRoaXMuX29mZnNldC56ID0gKCF6KT8gdGhpcy5fc2l6ZS56IC8gMiA6IDA7XG5cbiAgICAgICAgdGhpcy5fcmVjYWxjKCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJveENvbGxpc2lvbjsiLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi4vU2NlbmUnO1xuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuXG5hYnN0cmFjdCBjbGFzcyBDb2xsaXNpb24ge1xuICAgIHByb3RlY3RlZCBfc2NlbmUgICAgICAgICAgICAgICAgOiBTY2VuZTtcbiAgICBwcm90ZWN0ZWQgX2luc3RhbmNlICAgICAgICAgICAgIDogSW5zdGFuY2U7XG4gICAgcHJvdGVjdGVkIF9wb3NpdGlvbiAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJvdGVjdGVkIF9vZmZzZXQgICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJvdGVjdGVkIF9kaXNwbGF5SW5zdGFuY2UgICAgICA6IEluc3RhbmNlO1xuXG4gICAgcHVibGljIHNvbGlkICAgICAgICAgICAgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogU2NlbmUpIHtcbiAgICAgICAgdGhpcy5zZXRTY2VuZShzY2VuZSk7XG4gICAgICAgIHRoaXMuc29saWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX29mZnNldCA9IG5ldyBWZWN0b3IzKDAsIDAsIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBhYnN0cmFjdCB0ZXN0KHBvc2l0aW9uOiBWZWN0b3IzLCBkaXJlY3Rpb246IFZlY3RvcjMpIDogVmVjdG9yMztcblxuICAgIHB1YmxpYyBzZXRTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBzY2VuZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2luc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZENvbGxpc2lvbkluc3RhbmNlKHJlbmRlcmVyOiBSZW5kZXJlcik6IHZvaWQge1xuICAgICAgICByZW5kZXJlcjtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Rpc3BsYXlJbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpbnN0YW5jZSgpOiBJbnN0YW5jZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGRpc3BsYXlJbnN0YW5jZSgpOiBJbnN0YW5jZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNwbGF5SW5zdGFuY2U7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb2xsaXNpb247IiwiaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vQ2FtZXJhJztcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9TY2VuZSc7XG5pbXBvcnQgQ29sbGlzaW9uIGZyb20gJy4uL2NvbGxpc2lvbnMvQ29sbGlzaW9uJztcbmltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcbmltcG9ydCBNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvTWF0ZXJpYWwnO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4uL0NvbXBvbmVudCc7XG5pbXBvcnQgTWF0cml4NCBmcm9tICcuLi9tYXRoL01hdHJpeDQnO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCB7IGdldDJEQW5nbGUgfSBmcm9tICcuLi9VdGlscyc7XG5pbXBvcnQgQ29uZmlnIGZyb20gJy4uL0NvbmZpZyc7XG5pbXBvcnQgTGlzdCBmcm9tICcuLi9MaXN0JztcblxuY2xhc3MgSW5zdGFuY2Uge1xuICAgIHByb3RlY3RlZCBfZ2VvbWV0cnkgICAgICAgICAgIDogR2VvbWV0cnk7XG4gICAgcHJvdGVjdGVkIF9tYXRlcmlhbCAgICAgICAgICAgOiBNYXRlcmlhbDtcbiAgICBwcm90ZWN0ZWQgX3JvdGF0aW9uICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJvdGVjdGVkIF90cmFuc2Zvcm0gICAgICAgICAgOiBNYXRyaXg0O1xuICAgIHByb3RlY3RlZCBfd29ybGRNYXRyaXggICAgICAgIDogTWF0cml4NDtcbiAgICBwcm90ZWN0ZWQgX3NjZW5lICAgICAgICAgICAgICA6IFNjZW5lO1xuICAgIHByb3RlY3RlZCBfY29tcG9uZW50cyAgICAgICAgIDogTGlzdDxDb21wb25lbnQ+O1xuICAgIHByb3RlY3RlZCBfY29sbGlzaW9uICAgICAgICAgIDogQ29sbGlzaW9uO1xuICAgIHByb3RlY3RlZCBfbmVlZHNVcGRhdGUgICAgICAgIDogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX2Rlc3Ryb3llZCAgICAgICAgICA6IGJvb2xlYW47XG4gICAgXG4gICAgcHVibGljIHBvc2l0aW9uICAgICAgICAgICAgOiBWZWN0b3IzO1xuICAgIHB1YmxpYyBpc0JpbGxib2FyZCAgICAgICAgIDogYm9vbGVhbjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihnZW9tZXRyeTogR2VvbWV0cnkgPSBudWxsLCBtYXRlcmlhbDogTWF0ZXJpYWwgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IE1hdHJpeDQuY3JlYXRlSWRlbnRpdHkoKTtcbiAgICAgICAgdGhpcy5fd29ybGRNYXRyaXggPSBNYXRyaXg0LmNyZWF0ZUlkZW50aXR5KCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLjApO1xuICAgICAgICB0aGlzLl9yb3RhdGlvbiA9IG5ldyBWZWN0b3IzKDAuMCk7XG4gICAgICAgIHRoaXMuaXNCaWxsYm9hcmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG1hdGVyaWFsO1xuICAgICAgICB0aGlzLl9zY2VuZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBuZXcgTGlzdCgpO1xuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBudWxsO1xuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRyYW5zbGF0ZSh4OiBudW1iZXJ8VmVjdG9yMywgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IEluc3RhbmNlIHtcbiAgICAgICAgbGV0IF94OiBudW1iZXI7XG5cbiAgICAgICAgaWYgKCg8VmVjdG9yMz54KS5sZW5ndGgpIHtcbiAgICAgICAgICAgIF94ID0gKDxWZWN0b3IzPngpLng7XG4gICAgICAgICAgICB5ID0gKDxWZWN0b3IzPngpLnk7XG4gICAgICAgICAgICB6ID0gKDxWZWN0b3IzPngpLno7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfeCA9IDxudW1iZXI+eDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQoX3gsIHksIHopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoX3gsIHksIHopO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgdGhpcy5fY29sbGlzaW9uLmRpc3BsYXlJbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRpc3BsYXlJbnN0YW5jZS50cmFuc2xhdGUoeCwgeSwgeiwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJvdGF0ZSh4OiBudW1iZXJ8VmVjdG9yMywgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IEluc3RhbmNlIHtcbiAgICAgICAgbGV0IF94OiBudW1iZXI7XG4gICAgICAgIFxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xuICAgICAgICAgICAgX3ggPSAoPFZlY3RvcjM+eCkueDtcbiAgICAgICAgICAgIHkgPSAoPFZlY3RvcjM+eCkueTtcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF94ID0gPG51bWJlcj54O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3JvdGF0aW9uLmFkZChfeCwgeSwgeik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yb3RhdGlvbi5zZXQoX3gsIHksIHopO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0U2NlbmUoc2NlbmU6IFNjZW5lKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NjZW5lID0gc2NlbmU7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgY29tcG9uZW50LmFkZEluc3RhbmNlKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb21wb25lbnQ8VD4oY29tcG9uZW50TmFtZTogc3RyaW5nKTogVCB7XG4gICAgICAgIGZvciAobGV0IGk9MCxjb21wO2NvbXA9dGhpcy5fY29tcG9uZW50cy5nZXRBdChpKTtpKyspIHtcbiAgICAgICAgICAgIGlmIChjb21wLm5hbWUgPT0gY29tcG9uZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiA8VD4oPGFueT5jb21wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0VHJhbnNmb3JtYXRpb24oKTogTWF0cml4NCB7XG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0SWRlbnRpdHkoKTtcblxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkoTWF0cml4NC5jcmVhdGVYUm90YXRpb24odGhpcy5fcm90YXRpb24ueCkpO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkoTWF0cml4NC5jcmVhdGVaUm90YXRpb24odGhpcy5fcm90YXRpb24ueikpO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkoTWF0cml4NC5jcmVhdGVZUm90YXRpb24odGhpcy5fcm90YXRpb24ueSkpO1xuXG4gICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLl9nZW9tZXRyeS5vZmZzZXQ7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS50cmFuc2xhdGUodGhpcy5wb3NpdGlvbi54ICsgb2Zmc2V0LngsIHRoaXMucG9zaXRpb24ueSArIG9mZnNldC55LCB0aGlzLnBvc2l0aW9uLnogKyBvZmZzZXQueik7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb2xsaXNpb24oY29sbGlzaW9uOiBDb2xsaXNpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY29sbGlzaW9uID0gY29sbGlzaW9uO1xuICAgICAgICBjb2xsaXNpb24uc2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5fcm90YXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0SWRlbnRpdHkoKTtcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSBudWxsO1xuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNCaWxsYm9hcmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zY2VuZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fY29sbGlzaW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXdha2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuZWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5hd2FrZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5fY29sbGlzaW9uICYmIENvbmZpZy5ESVNQTEFZX0NPTExJU0lPTlMpIHtcbiAgICAgICAgICAgIGxldCBjb2xsaXNpb24gPSB0aGlzLl9jb2xsaXNpb247XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbi5zZXRTY2VuZSh0aGlzLl9zY2VuZSk7XG4gICAgICAgICAgICAvLyBjb2xsaXNpb24uYWRkQ29sbGlzaW9uSW5zdGFuY2UodGhpcy5fcmVuZGVyZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cy5lYWNoKChjb21wb25lbnQ6IENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cy5lYWNoKChjb21wb25lbnQ6IENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50LmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkuZGVzdHJveSgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgQ29uZmlnLkRJU1BMQVlfQ09MTElTSU9OUykge1xuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZ2VvbWV0cnkgfHwgIXRoaXMuX21hdGVyaWFsKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAoIXRoaXMuX21hdGVyaWFsLmlzUmVhZHkpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgcmVuZGVyZXIuc3dpdGNoU2hhZGVyKHRoaXMuX21hdGVyaWFsLnNoYWRlck5hbWUpO1xuXG4gICAgICAgIGNvbnN0IGdsID0gcmVuZGVyZXIuR0wsXG4gICAgICAgICAgICBzaGFkZXIgPSBTaGFkZXIubGFzdFByb2dyYW07XG5cbiAgICAgICAgaWYgKHRoaXMuaXNCaWxsYm9hcmQpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRlKDAsIGdldDJEQW5nbGUodGhpcy5wb3NpdGlvbiwgY2FtZXJhLnBvc2l0aW9uKSArIE1hdGguUEkgLyAyLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3dvcmxkTWF0cml4LmNvcHkodGhpcy5nZXRUcmFuc2Zvcm1hdGlvbigpKTtcbiAgICAgICAgdGhpcy5fd29ybGRNYXRyaXgubXVsdGlwbHkoY2FtZXJhLmdldFRyYW5zZm9ybWF0aW9uKCkpO1xuICAgICAgICBcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXNbXCJ1UHJvamVjdGlvblwiXSwgZmFsc2UsIGNhbWVyYS5wcm9qZWN0aW9uLmRhdGEpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtc1tcInVQb3NpdGlvblwiXSwgZmFsc2UsIHRoaXMuX3dvcmxkTWF0cml4LmRhdGEpO1xuXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnJlbmRlcihyZW5kZXJlcik7XG5cbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkucmVuZGVyKHJlbmRlcmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGdlb21ldHJ5KCk6IEdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IG1hdGVyaWFsKCk6IE1hdGVyaWFsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hdGVyaWFsO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uKCk6IFZlY3RvcjMge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm90YXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb2xsaXNpb24oKTogQ29sbGlzaW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxpc2lvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNjZW5lKCk6IFNjZW5lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjZW5lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNEZXN0cm95ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZXN0cm95ZWQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnN0YW5jZTsiLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcbmltcG9ydCBCYXNpY01hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9CYXNpY01hdGVyaWFsJztcbmltcG9ydCBXYWxsR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9XYWxsR2VvbWV0cnknO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCB7IHJvdW5kVXBQb3dlck9mMiB9IGZyb20gJy4uL1V0aWxzJztcbmltcG9ydCBJbnN0YW5jZSBmcm9tICcuLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGV4dE9wdGlvbnMge1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgc3Ryb2tlPzogYm9vbGVhbjtcbiAgICBmaWxsPzogYm9vbGVhbjtcbiAgICBmaWxsQ29sb3I/OiBzdHJpbmc7XG4gICAgc3Ryb2tlQ29sb3I/OiBzdHJpbmc7XG4gICAgcG9zaXRpb24/OiBWZWN0b3IzO1xuICAgIHJvdGF0aW9uPzogVmVjdG9yMztcbn1cblxuY29uc3QgT3B0aW9uc0RlZmF1bHQ6IFRleHRPcHRpb25zID0ge1xuICAgIHNpemU6IDEyLFxuICAgIHN0cm9rZTogZmFsc2UsXG4gICAgZmlsbDogdHJ1ZSxcbiAgICBmaWxsQ29sb3I6ICcjRkZGRkZGJyxcbiAgICBzdHJva2VDb2xvcjogJyNGRkZGRkYnLFxuICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMygwLjAsIDAuMCwgMC4wKSxcbiAgICByb3RhdGlvbjogbmV3IFZlY3RvcjMoMC4wLCAwLjAsIDAuMClcbn07XG5cbmNsYXNzIFRleHQgZXh0ZW5kcyBJbnN0YW5jZSB7XG4gICAgcHJpdmF0ZSBfdGV4dCAgICAgICAgICAgICAgIDogc3RyaW5nO1xuICAgIHByaXZhdGUgX2ZvbnQgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwcml2YXRlIF9vcHRpb25zICAgICAgICAgICAgOiBUZXh0T3B0aW9ucztcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZywgb3B0aW9ucz86IFRleHRPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fdGV4dCA9IHRleHQ7XG4gICAgICAgIHRoaXMuX2ZvbnQgPSBmb250O1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gdGhpcy5fbWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX3ByaW50VGV4dCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX21lcmdlT3B0aW9ucyhvcHRpb25zOiBUZXh0T3B0aW9ucyk6IFRleHRPcHRpb25zIHtcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7IHJldHVybiBPcHRpb25zRGVmYXVsdDsgfVxuXG4gICAgICAgIGlmICghb3B0aW9ucy5zaXplKSB7IG9wdGlvbnMuc2l6ZSA9IE9wdGlvbnNEZWZhdWx0LnNpemU7IH1cbiAgICAgICAgaWYgKCFvcHRpb25zLnN0cm9rZSkgeyBvcHRpb25zLnN0cm9rZSA9IE9wdGlvbnNEZWZhdWx0LnN0cm9rZTsgfVxuICAgICAgICBpZiAoIW9wdGlvbnMuZmlsbCkgeyBvcHRpb25zLmZpbGwgPSBPcHRpb25zRGVmYXVsdC5maWxsOyB9XG4gICAgICAgIGlmICghb3B0aW9ucy5maWxsQ29sb3IpIHsgb3B0aW9ucy5maWxsQ29sb3IgPSBPcHRpb25zRGVmYXVsdC5maWxsQ29sb3I7IH1cbiAgICAgICAgaWYgKCFvcHRpb25zLnN0cm9rZUNvbG9yKSB7IG9wdGlvbnMuc3Ryb2tlQ29sb3IgPSBPcHRpb25zRGVmYXVsdC5zdHJva2VDb2xvcjsgfVxuICAgICAgICBpZiAoIW9wdGlvbnMucG9zaXRpb24pIHsgb3B0aW9ucy5wb3NpdGlvbiA9IE9wdGlvbnNEZWZhdWx0LnBvc2l0aW9uOyB9XG4gICAgICAgIGlmICghb3B0aW9ucy5yb3RhdGlvbikgeyBvcHRpb25zLnJvdGF0aW9uID0gT3B0aW9uc0RlZmF1bHQucm90YXRpb247IH1cblxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9wcmludFRleHQoKTogdm9pZCB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLFxuICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgICBjdHguZm9udCA9IHRoaXMuX29wdGlvbnMuc2l6ZSArIFwicHggXCIgKyB0aGlzLl9mb250O1xuICAgICAgICBcbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC5vSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICBsZXQgc2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLl90ZXh0KTtcblxuICAgICAgICBjYW52YXMud2lkdGggPSByb3VuZFVwUG93ZXJPZjIoc2l6ZS53aWR0aCk7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSByb3VuZFVwUG93ZXJPZjIodGhpcy5fb3B0aW9ucy5zaXplKTtcbiAgICAgICAgY3R4LmZvbnQgPSB0aGlzLl9vcHRpb25zLnNpemUgKyBcInB4IFwiICsgdGhpcy5fZm9udDtcblxuICAgICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4Lm9JbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmZpbGwpIHtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLl9vcHRpb25zLmZpbGxDb2xvcjtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLl90ZXh0LCA0LCB0aGlzLl9vcHRpb25zLnNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc3Ryb2tlKSB7XG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLl9vcHRpb25zLnN0cm9rZUNvbG9yO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVRleHQodGhpcy5fdGV4dCwgNCwgdGhpcy5fb3B0aW9ucy5zaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1dnMgPSBbMCwgMCwgKHNpemUud2lkdGggKyA0KSAvIGNhbnZhcy53aWR0aCwgKHRoaXMuX29wdGlvbnMuc2l6ZSArIDgpIC8gY2FudmFzLmhlaWdodF0sXG4gICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoY2FudmFzKSxcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IEJhc2ljTWF0ZXJpYWwodGV4dHVyZSksXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBXYWxsR2VvbWV0cnkoc2l6ZS53aWR0aCAvIDEwMCwgdGhpcy5fb3B0aW9ucy5zaXplIC8gMTAwKTtcblxuICAgICAgICBtYXRlcmlhbC5zZXRVdih1dnNbMF0sIHV2c1sxXSwgdXZzWzJdLCB1dnNbM10pO1xuICAgICAgICBtYXRlcmlhbC5zZXRPcGFxdWUoZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuX21hdGVyaWFsID0gbWF0ZXJpYWw7ICAgICAgICBcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSBnZW9tZXRyeTtcblxuICAgICAgICB0aGlzLnRyYW5zbGF0ZSh0aGlzLl9vcHRpb25zLnBvc2l0aW9uLngsIHRoaXMuX29wdGlvbnMucG9zaXRpb24ueSwgdGhpcy5fb3B0aW9ucy5wb3NpdGlvbi56KTtcbiAgICAgICAgdGhpcy5yb3RhdGUodGhpcy5fb3B0aW9ucy5yb3RhdGlvbi54LCB0aGlzLl9vcHRpb25zLnJvdGF0aW9uLnksIHRoaXMuX29wdGlvbnMucm90YXRpb24ueik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcblxuY2xhc3MgQ3ViZUdlb21ldHJ5IGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX2J1aWxkQ3ViZSh3aWR0aCwgaGVpZ2h0LCBsZW5ndGgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2J1aWxkQ3ViZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHcgPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGwgPSBsZW5ndGggLyAyO1xuXG4gICAgICAgIC8vIEZyb250IGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgIGwpO1xuXG4gICAgICAgIC8vIEJhY2sgZmFjZVxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XG5cbiAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcblxuICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsIC1sKTtcblxuICAgICAgICAvLyBUb3AgZmFjZVxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAtbCk7XG5cbiAgICAgICAgLy8gQm90dG9tIGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgLWwpO1xuXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDY7aSsrKSB7XG4gICAgICAgICAgICBsZXQgaW5kID0gaSAqIDQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMik7XG4gICAgICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKGluZCArIDEsIGluZCArIDMsIGluZCArIDIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMS4wKTtcbiAgICAgICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAxLjApO1xuICAgICAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMC4wKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3ViZUdlb21ldHJ5OyIsImltcG9ydCB7IFZFUlRJQ0VfU0laRSwgVEVYQ09PUkRfU0laRSB9IGZyb20gJy4uL0NvbnN0YW50cyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xuXG5pbnRlcmZhY2UgQnVmZmVyTWFwIHtcbiAgICB2ZXJ0ZXhCdWZmZXI/ICAgICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICB0ZXhDb29yZHNCdWZmZXI/ICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICBpbmRleEJ1ZmZlcj8gICAgICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICBnbENvbnRleHQgICAgICAgICAgICAgICAgICAgOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG59XG5cbmludGVyZmFjZSBSZW5kZXJlckJ1ZmZlck1hcCB7XG4gICAgW2luZGV4OiBzdHJpbmddIDogQnVmZmVyTWFwO1xufVxuXG5jbGFzcyBHZW9tZXRyeSB7XG4gICAgcHJpdmF0ZSBfdmVydGljZXMgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuICAgIHByaXZhdGUgX3RyaWFuZ2xlcyAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwcml2YXRlIF90ZXhDb29yZHMgICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgcHJpdmF0ZSBfYnVmZmVycyAgICAgICAgICAgICAgICAgOiBSZW5kZXJlckJ1ZmZlck1hcDtcbiAgICBwcml2YXRlIF9pbmRleExlbmd0aCAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF9ib3VuZGluZ0JveCAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgXG4gICAgcHVibGljIG9mZnNldCAgICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzID0gW107XG4gICAgICAgIHRoaXMuX3RleENvb3JkcyA9IFtdO1xuICAgICAgICB0aGlzLl90cmlhbmdsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fYnVmZmVycyA9IHt9O1xuICAgICAgICB0aGlzLl9ib3VuZGluZ0JveCA9IFtJbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eSwgLUluZmluaXR5XTtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkVmVydGljZSh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzLnB1c2goeCwgeSwgeik7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJvdW5kaW5nIGJveFxuICAgICAgICB0aGlzLl9ib3VuZGluZ0JveCA9IFtcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzBdLCB4KSxcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzFdLCB5KSxcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzJdLCB6KSxcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzNdLCB4KSxcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzRdLCB5KSxcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzVdLCB6KVxuICAgICAgICBdO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgYWRkVGV4Q29vcmQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdGV4Q29vcmRzLnB1c2goeCwgeSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFRyaWFuZ2xlKHZlcnQxOiBudW1iZXIsIHZlcnQyOiBudW1iZXIsIHZlcnQzOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQxICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDEgKyBcIl0gbm90IGZvdW5kIVwiKX1cbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQyICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDIgKyBcIl0gbm90IGZvdW5kIVwiKX1cbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQzICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDMgKyBcIl0gbm90IGZvdW5kIVwiKX1cblxuICAgICAgICB0aGlzLl90cmlhbmdsZXMucHVzaCh2ZXJ0MSwgdmVydDIsIHZlcnQzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYnVpbGQocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdsID0gcmVuZGVyZXIuR0wsXG4gICAgICAgICAgICBidWZmZXJNYXA6IEJ1ZmZlck1hcCA9IHsgZ2xDb250ZXh0OiBnbCB9O1xuXG4gICAgICAgIGJ1ZmZlck1hcC52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlck1hcC52ZXJ0ZXhCdWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLl92ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcblxuICAgICAgICBidWZmZXJNYXAudGV4Q29vcmRzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAudGV4Q29vcmRzQnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fdGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIGJ1ZmZlck1hcC5pbmRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAuaW5kZXhCdWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkodGhpcy5fdHJpYW5nbGVzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIHRoaXMuX2luZGV4TGVuZ3RoID0gdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9idWZmZXJzW3JlbmRlcmVyLmlkXSA9IGJ1ZmZlck1hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJCb3VuZEJveEF4aXMoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCk6IEdlb21ldHJ5IHtcbiAgICAgICAgaWYgKHggPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbMF0gPSAwO1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbM10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoeSA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFsxXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFs0XSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeiA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFsyXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFs1XSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLl9idWZmZXJzKXtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlck1hcCA9IHRoaXMuX2J1ZmZlcnNbaV0sXG4gICAgICAgICAgICAgICAgZ2wgPSBidWZmZXJNYXAuZ2xDb250ZXh0O1xuXG4gICAgICAgICAgICBnbC5kZWxldGVCdWZmZXIoYnVmZmVyTWFwLnZlcnRleEJ1ZmZlcik7XG4gICAgICAgICAgICBnbC5kZWxldGVCdWZmZXIoYnVmZmVyTWFwLnRleENvb3Jkc0J1ZmZlcik7XG4gICAgICAgICAgICBnbC5kZWxldGVCdWZmZXIoYnVmZmVyTWFwLmluZGV4QnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fYnVmZmVyc1tyZW5kZXJlci5pZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGQocmVuZGVyZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2wgPSByZW5kZXJlci5HTCxcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbSxcbiAgICAgICAgICAgIGJ1ZmZlck1hcCA9IHRoaXMuX2J1ZmZlcnNbcmVuZGVyZXIuaWRdO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAudmVydGV4QnVmZmVyKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlc1tcImFWZXJ0ZXhQb3NpdGlvblwiXSwgVkVSVElDRV9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICAgIGlmIChzaGFkZXIuYXR0cmlidXRlc1tcImFUZXhDb29yZHNcIl0pIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAudGV4Q29vcmRzQnVmZmVyKTtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXNbXCJhVGV4Q29vcmRzXCJdLCBURVhDT09SRF9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVyTWFwLmluZGV4QnVmZmVyKTtcblxuICAgICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCB0aGlzLl9pbmRleExlbmd0aCwgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYm91bmRpbmdCb3goKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ib3VuZGluZ0JveDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdlb21ldHJ5OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcblxuY2xhc3MgUGxhbmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX2J1aWxkUGxhbmUod2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYnVpbGRQbGFuZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgdyA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGggPSBoZWlnaHQgLyAyO1xuXG4gICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIDAsICBoKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgMCwgIGgpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICAwLCAtaCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIDAsIC1oKTtcblxuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDAsIDEsIDIpO1xuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDEsIDMsIDIpO1xuXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xuICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMS4wKTtcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhbmVHZW9tZXRyeTsiLCJpbXBvcnQgR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XG5cbmNsYXNzIFdhbGxHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX2J1aWxkV2FsbCh3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9idWlsZFdhbGwod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHcgPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMjtcblxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgMCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICAwKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgIDApO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgMCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDAsIDEsIDIpO1xuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDEsIDMsIDIpO1xuXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xuICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMS4wKTtcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FsbEdlb21ldHJ5OyIsImV4cG9ydCB7IGRlZmF1bHQgYXMgUmVuZGVyZXIgfSBmcm9tICcuL1JlbmRlcmVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ2FtZXJhIH0gZnJvbSAnLi9DYW1lcmEnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb21wb25lbnQgfSBmcm9tICcuL0NvbXBvbmVudCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbmZpZyB9IGZyb20gJy4vQ29uZmlnJztcbmV4cG9ydCAqIGZyb20gJy4vQ29uc3RhbnRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5wdXQgfSBmcm9tICcuL0lucHV0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTGlzdCB9IGZyb20gJy4vTGlzdCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFJlbmRlcmluZ0xheWVyIH0gZnJvbSAnLi9SZW5kZXJpbmdMYXllcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjZW5lIH0gZnJvbSAnLi9TY2VuZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFRleHR1cmUgfSBmcm9tICcuL1RleHR1cmUnO1xuZXhwb3J0ICogZnJvbSAnLi9VdGlscyc7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQm94Q29sbGlzaW9uIH0gZnJvbSAnLi9jb2xsaXNpb25zL0JveENvbGxpc2lvbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbGxpc2lvbiB9IGZyb20gJy4vY29sbGlzaW9ucy9Db2xsaXNpb24nO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIEluc3RhbmNlIH0gZnJvbSAnLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFRleHQgfSBmcm9tICcuL2VudGl0aWVzL1RleHQnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIEN1YmVHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9DdWJlR2VvbWV0cnknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGFuZUdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyaWVzL1BsYW5lR2VvbWV0cnknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBXYWxsR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvR2VvbWV0cnknO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJhc2ljTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFscy9CYXNpY01hdGVyaWFsJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29sb3JNYXRlcmlhbCB9IGZyb20gJy4vbWF0ZXJpYWxzL0NvbG9yTWF0ZXJpYWwnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNYXRlcmlhbCB9IGZyb20gJy4vbWF0ZXJpYWxzL01hdGVyaWFsJztcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBNYXRyaXg0IH0gZnJvbSAnLi9tYXRoL01hdHJpeDQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWZWN0b3IzIH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWZWN0b3I0IH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjQnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoYWRlciB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXInO1xuZXhwb3J0IHsgU2hhZGVyU3RydWN0LCBTaGFkZXJNYXAsIFNoYWRlcnNOYW1lcyB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXJTdHJ1Y3QnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBCYXNpYyB9IGZyb20gJy4vc2hhZGVycy9CYXNpYyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbG9yIH0gZnJvbSAnLi9zaGFkZXJzL0NvbG9yJzsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xuXG5jbGFzcyBCYXNpY01hdGVyaWFsIGV4dGVuZHMgTWF0ZXJpYWwge1xuICAgIHByaXZhdGUgX3RleHR1cmUgICAgICAgICA6IFRleHR1cmU7XG4gICAgcHJpdmF0ZSBfdXYgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwcml2YXRlIF9yZXBlYXQgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogVGV4dHVyZSkge1xuICAgICAgICBzdXBlcihcIkJBU0lDXCIpO1xuXG4gICAgICAgIHRoaXMuX3RleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB0aGlzLl91diA9IFswLjAsIDAuMCwgMS4wLCAxLjBdO1xuICAgICAgICB0aGlzLl9yZXBlYXQgPSBbMS4wLCAxLjBdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRVdih4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXYgPSBbeCwgeSwgdywgaF07XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzZXRSZXBlYXQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVwZWF0ID0gW3gsIHldO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIGlmIChNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPT0gdGhpcykgeyByZXR1cm47IH1cblxuICAgICAgICBjb25zdCBnbCA9IHJlbmRlcmVyLkdMLFxuICAgICAgICAgICAgc2hhZGVyID0gU2hhZGVyLmxhc3RQcm9ncmFtO1xuXG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLl90ZXh0dXJlLmdldFRleHR1cmUocmVuZGVyZXIpKTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHNoYWRlci51bmlmb3Jtc1tcInVUZXh0dXJlXCJdLCAwKTtcblxuICAgICAgICBnbC51bmlmb3JtNGZ2KHNoYWRlci51bmlmb3Jtc1tcInVVVlwiXSwgdGhpcy5fdXYpO1xuICAgICAgICBnbC51bmlmb3JtMmZ2KHNoYWRlci51bmlmb3Jtc1tcInVSZXBlYXRcIl0sIHRoaXMuX3JlcGVhdCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cblxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RleHR1cmUuaXNSZWFkeTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHRleHR1cmUoKTogVGV4dHVyZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0dXJlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWNNYXRlcmlhbDsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XG5cbmNsYXNzIENvbG9yTWF0ZXJpYWwgZXh0ZW5kcyBNYXRlcmlhbCB7XG4gICAgcHJpdmF0ZSBfY29sb3IgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcblxuICAgIGNvbnN0cnVjdG9yKGNvbG9yOiBWZWN0b3I0KSB7XG4gICAgICAgIHN1cGVyKFwiQ09MT1JcIik7XG5cbiAgICAgICAgdGhpcy5fY29sb3IgPSBjb2xvci50b0FycmF5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKE1hdGVyaWFsLmxhc3RSZW5kZXJlZCA9PSB0aGlzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBnbCA9IHJlbmRlcmVyLkdMLFxuICAgICAgICAgICAgc2hhZGVyID0gU2hhZGVyLmxhc3RQcm9ncmFtO1xuXG4gICAgICAgIGdsLnVuaWZvcm00ZnYoc2hhZGVyLnVuaWZvcm1zW1widUNvbG9yXCJdLCB0aGlzLl9jb2xvcik7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cblxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb2xvck1hdGVyaWFsOyIsImltcG9ydCB7IFNoYWRlcnNOYW1lcyB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcbmltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuLi9VdGlscyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuXG5hYnN0cmFjdCBjbGFzcyBNYXRlcmlhbCB7XG4gICAgcHJvdGVjdGVkIF9pc09wYXF1ZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIF9yZW5kZXJCb3RoRmFjZXMgICAgICAgICA6IGJvb2xlYW47XG4gICAgXG4gICAgcHVibGljIHJlYWRvbmx5IHNoYWRlck5hbWUgICAgICAgIDogU2hhZGVyc05hbWVzO1xuICAgIHB1YmxpYyByZWFkb25seSB1dWlkICAgICAgICAgICAgICA6IHN0cmluZztcblxuICAgIHB1YmxpYyBzdGF0aWMgbGFzdFJlbmRlcmVkICAgICAgICA6IE1hdGVyaWFsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHNoYWRlck5hbWU6IFNoYWRlcnNOYW1lcykge1xuICAgICAgICB0aGlzLnNoYWRlck5hbWUgPSBzaGFkZXJOYW1lO1xuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMuX2lzT3BhcXVlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcmVuZGVyQm90aEZhY2VzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkO1xuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXQgaXNSZWFkeSgpOiBib29sZWFuO1xuXG4gICAgcHVibGljIGdldCBpc09wYXF1ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BhcXVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRPcGFxdWUob3BhcXVlOiBib29sZWFuKTogTWF0ZXJpYWwge1xuICAgICAgICB0aGlzLl9pc09wYXF1ZSA9IG9wYXF1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEN1bGxpbmcoYm90aEZhY2VzOiBib29sZWFuKTogTWF0ZXJpYWwge1xuICAgICAgICB0aGlzLl9yZW5kZXJCb3RoRmFjZXMgPSBib3RoRmFjZXM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWF0ZXJpYWw7IiwiaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcblxuY2xhc3MgTWF0cml4NCB7XG4gICAgcHVibGljIGRhdGEgICAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwdWJsaWMgaW5Vc2UgICAgICAgICAgICAgICAgOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBcnJheSgxNik7XG5cbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCAhPSAxNikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWF0cml4NCBuZWVkcyAxNiB2YWx1ZXMgdG8gYmUgY3JlYXRlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDE2O2krKykge1xuICAgICAgICAgICAgdGhpcy5kYXRhW2ldID0gdmFsdWVzW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldCguLi52YWx1ZXM6IEFycmF5PG51bWJlcj4pOiBNYXRyaXg0IHtcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hdHJpeDQgbmVlZHMgMTYgdmFsdWVzIHRvIGJlIGNyZWF0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IHZhbHVlc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb3B5KG1hdHJpeDogTWF0cml4NCk6IE1hdHJpeDQge1xuICAgICAgICBmb3IgKGxldCBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IG1hdHJpeC5kYXRhW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG11bHRpcGx5KG1hdHJpeEI6IE1hdHJpeDQpOiBNYXRyaXg0IHtcbiAgICAgICAgbGV0IFQ6IEFycmF5PG51bWJlcj4gPSBtYXRyaXhCLmRhdGE7XG5cbiAgICAgICAgbGV0IEMxID0gbmV3IFZlY3RvcjQoVFswXSwgVFs0XSwgVFs4XSwgVFsxMl0pO1xuICAgICAgICBsZXQgQzIgPSBuZXcgVmVjdG9yNChUWzFdLCBUWzVdLCBUWzldLCBUWzEzXSk7XG4gICAgICAgIGxldCBDMyA9IG5ldyBWZWN0b3I0KFRbMl0sIFRbNl0sIFRbMTBdLCBUWzE0XSk7XG4gICAgICAgIGxldCBDNCA9IG5ldyBWZWN0b3I0KFRbM10sIFRbN10sIFRbMTFdLCBUWzE1XSk7XG5cbiAgICAgICAgVCA9IHRoaXMuZGF0YTtcbiAgICAgICAgbGV0IFIxID0gbmV3IFZlY3RvcjQoVFswXSwgVFsxXSwgVFsyXSwgVFszXSk7XG4gICAgICAgIGxldCBSMiA9IG5ldyBWZWN0b3I0KFRbNF0sIFRbNV0sIFRbNl0sIFRbN10pO1xuICAgICAgICBsZXQgUjMgPSBuZXcgVmVjdG9yNChUWzhdLCBUWzldLCBUWzEwXSwgVFsxMV0pO1xuICAgICAgICBsZXQgUjQgPSBuZXcgVmVjdG9yNChUWzEyXSwgVFsxM10sIFRbMTRdLCBUWzE1XSk7XG5cbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgICBWZWN0b3I0LmRvdChSMSwgQzEpLCBWZWN0b3I0LmRvdChSMSwgQzIpLCBWZWN0b3I0LmRvdChSMSwgQzMpLCBWZWN0b3I0LmRvdChSMSwgQzQpLFxuICAgICAgICAgICAgVmVjdG9yNC5kb3QoUjIsIEMxKSwgVmVjdG9yNC5kb3QoUjIsIEMyKSwgVmVjdG9yNC5kb3QoUjIsIEMzKSwgVmVjdG9yNC5kb3QoUjIsIEM0KSxcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIzLCBDMSksIFZlY3RvcjQuZG90KFIzLCBDMiksIFZlY3RvcjQuZG90KFIzLCBDMyksIFZlY3RvcjQuZG90KFIzLCBDNCksXG4gICAgICAgICAgICBWZWN0b3I0LmRvdChSNCwgQzEpLCBWZWN0b3I0LmRvdChSNCwgQzIpLCBWZWN0b3I0LmRvdChSNCwgQzMpLCBWZWN0b3I0LmRvdChSNCwgQzQpXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHRyYW5zbGF0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gKz0geDtcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gKz0geTtcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0gKz0gejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gPSB4O1xuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSA9IHk7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdID0gejtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJZGVudGl0eSgpOiBNYXRyaXg0IHtcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAxXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNldElkZW50aXR5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVJZGVudGl0eSgpOiBNYXRyaXg0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlT3J0aG8od2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHpuZWFyOiBudW1iZXIsIHpmYXI6IG51bWJlcik6IE1hdHJpeDQge1xuICAgICAgICBsZXQgbCA9IC13aWR0aCAvIDIuMCxcbiAgICAgICAgICAgIHIgPSB3aWR0aCAvIDIuMCxcbiAgICAgICAgICAgIGIgPSAtaGVpZ2h0IC8gMi4wLFxuICAgICAgICAgICAgdCA9IGhlaWdodCAvIDIuMCxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQSA9IDIuMCAvIChyIC0gbCksXG4gICAgICAgICAgICBCID0gMi4wIC8gKHQgLSBiKSxcbiAgICAgICAgICAgIEMgPSAtMiAvICh6ZmFyIC0gem5lYXIpLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBYID0gLShyICsgbCkgLyAociAtIGwpLFxuICAgICAgICAgICAgWSA9IC0odCArIGIpIC8gKHQgLSBiKSxcbiAgICAgICAgICAgIFogPSAtKHpmYXIgKyB6bmVhcikgLyAoemZhciAtIHpuZWFyKTtcblxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICBBLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgQiwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIEMsIDAsXG4gICAgICAgICAgICBYLCBZLCBaLCAxXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVQZXJzcGVjdGl2ZShmb3Y6IG51bWJlciwgcmF0aW86IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogTWF0cml4NCB7XG4gICAgICAgIGxldCBTID0gMSAvIE1hdGgudGFuKGZvdiAvIDIpLFxuICAgICAgICAgICAgUiA9IFMgKiByYXRpbyxcbiAgICAgICAgICAgIEEgPSAtKHpmYXIpIC8gKHpmYXIgLSB6bmVhciksXG4gICAgICAgICAgICBCID0gLSh6ZmFyICogem5lYXIpIC8gKHpmYXIgLSB6bmVhcik7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICBTLCAwLCAwLCAgMCxcbiAgICAgICAgICAgIDAsIFIsIDAsICAwLFxuICAgICAgICAgICAgMCwgMCwgQSwgLTEsXG4gICAgICAgICAgICAwLCAwLCBCLCAgMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlVHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBNYXRyaXg0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxuICAgICAgICAgICAgeCwgeSwgeiwgMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlWFJvdGF0aW9uKHJhZGlhbnM6IG51bWJlcik6IE1hdHJpeDQge1xuICAgICAgICBsZXQgQzogbnVtYmVyID0gTWF0aC5jb3MocmFkaWFucyksXG4gICAgICAgICAgICBTOiBudW1iZXIgPSBNYXRoLnNpbihyYWRpYW5zKTtcblxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICAgMSwgMCwgMCwgMCxcbiAgICAgICAgICAgICAwLCBDLC1TLCAwLFxuICAgICAgICAgICAgIDAsIFMsIEMsIDAsXG4gICAgICAgICAgICAgMCwgMCwgMCwgMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlWVJvdGF0aW9uKHJhZGlhbnM6IG51bWJlcik6IE1hdHJpeDQge1xuICAgICAgICBsZXQgQzogbnVtYmVyID0gTWF0aC5jb3MocmFkaWFucyksXG4gICAgICAgICAgICBTOiBudW1iZXIgPSBNYXRoLnNpbihyYWRpYW5zKTtcblxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICAgQywgMCwtUywgMCxcbiAgICAgICAgICAgICAwLCAxLCAwLCAwLFxuICAgICAgICAgICAgIFMsIDAsIEMsIDAsXG4gICAgICAgICAgICAgMCwgMCwgMCwgMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlWlJvdGF0aW9uKHJhZGlhbnM6IG51bWJlcik6IE1hdHJpeDQge1xuICAgICAgICBsZXQgQzogbnVtYmVyID0gTWF0aC5jb3MocmFkaWFucyksXG4gICAgICAgICAgICBTOiBudW1iZXIgPSBNYXRoLnNpbihyYWRpYW5zKTtcblxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICAgQywtUywgMCwgMCxcbiAgICAgICAgICAgICBTLCBDLCAwLCAwLFxuICAgICAgICAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAgICAgICAgMCwgMCwgMCwgMVxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWF0cml4NDsiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3IzIHtcbiAgICBwcml2YXRlIF94ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfeSAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3ogICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF9sZW5ndGggICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBuZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBpblVzZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwKSB7XG4gICAgICAgIHRoaXMuc2V0KHgsIHksIHopO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhcigpOiBWZWN0b3IzIHtcbiAgICAgICAgdGhpcy5zZXQoMCwgMCwgMCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVmVjdG9yMyB7XG4gICAgICAgIHRoaXMuX3ggPSB4O1xuICAgICAgICB0aGlzLl95ID0geTtcbiAgICAgICAgdGhpcy5feiA9IHo7XG5cbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVmVjdG9yMyB7XG4gICAgICAgIHRoaXMuX3ggKz0geDtcbiAgICAgICAgdGhpcy5feSArPSB5O1xuICAgICAgICB0aGlzLl96ICs9IHo7XG5cbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG11bHRpcGx5KG51bTogbnVtYmVyKTogVmVjdG9yMyB7XG4gICAgICAgIHRoaXMuX3ggKj0gbnVtO1xuICAgICAgICB0aGlzLl95ICo9IG51bTtcbiAgICAgICAgdGhpcy5feiAqPSBudW07XG5cbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG5vcm1hbGl6ZSgpOiBWZWN0b3IzIHtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLm11bHRpcGx5KDEgLyBsKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xvbmUoKTogVmVjdG9yMyB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMyh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZXF1YWxzKHZlY3RvcjM6IFZlY3RvcjMpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnggPT0gdmVjdG9yMy54ICYmIHRoaXMueSA9PSB2ZWN0b3IzLnkgJiYgdGhpcy56ID09IHZlY3RvcjMueik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94OyB9XG4gICAgcHVibGljIGdldCB5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95OyB9XG4gICAgcHVibGljIGdldCB6KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl96OyB9XG5cbiAgICBwdWJsaWMgc2V0IHgoeDogbnVtYmVyKSB7IHRoaXMuX3ggPSB4OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuICAgIHB1YmxpYyBzZXQgeSh5OiBudW1iZXIpIHsgdGhpcy5feSA9IHk7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG4gICAgcHVibGljIHNldCB6KHo6IG51bWJlcikgeyB0aGlzLl96ID0gejsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnopO1xuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gIGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcm9zcyh2ZWN0b3JBOiBWZWN0b3IzLCB2ZWN0b3JCOiBWZWN0b3IzKTogVmVjdG9yMyB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMyhcbiAgICAgICAgICAgIHZlY3RvckEueSAqIHZlY3RvckIueiAtIHZlY3RvckEueiAqIHZlY3RvckIueSxcbiAgICAgICAgICAgIHZlY3RvckEueiAqIHZlY3RvckIueCAtIHZlY3RvckEueCAqIHZlY3RvckIueixcbiAgICAgICAgICAgIHZlY3RvckEueCAqIHZlY3RvckIueSAtIHZlY3RvckEueSAqIHZlY3RvckIueFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZG90KHZlY3RvckE6IFZlY3RvcjMsIHZlY3RvckI6IFZlY3RvcjMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdmVjdG9yQS54ICogdmVjdG9yQi54ICsgdmVjdG9yQS55ICogdmVjdG9yQi55ICsgdmVjdG9yQS56ICogdmVjdG9yQi56O1xuICAgIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3I0IHtcbiAgICBwcml2YXRlIF94ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfeSAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3ogICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF93ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgbmVlZHNVcGRhdGUgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zZXQoeCwgeSwgeiwgdyk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpOiBWZWN0b3I0IHtcbiAgICAgICAgdGhpcy5feCA9IHg7XG4gICAgICAgIHRoaXMuX3kgPSB5O1xuICAgICAgICB0aGlzLl96ID0gejtcbiAgICAgICAgdGhpcy5fdyA9IHc7XG5cbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpOiBWZWN0b3I0IHtcbiAgICAgICAgdGhpcy5feCArPSB4O1xuICAgICAgICB0aGlzLl95ICs9IHk7XG4gICAgICAgIHRoaXMuX3ogKz0gejtcbiAgICAgICAgdGhpcy5fdyArPSB3O1xuXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBtdWx0aXBseShudW06IG51bWJlcik6IFZlY3RvcjQge1xuICAgICAgICB0aGlzLl94ICo9IG51bTtcbiAgICAgICAgdGhpcy5feSAqPSBudW07XG4gICAgICAgIHRoaXMuX3ogKj0gbnVtO1xuICAgICAgICB0aGlzLl93ICo9IG51bTtcblxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgbm9ybWFsaXplKCk6IFZlY3RvcjQge1xuICAgICAgICBsZXQgbCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMubXVsdGlwbHkoMSAvIGwpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdG9BcnJheSgpOiBBcnJheTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueSwgdGhpcy56LCB0aGlzLnddO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94OyB9XG4gICAgcHVibGljIGdldCB5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95OyB9XG4gICAgcHVibGljIGdldCB6KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl96OyB9XG4gICAgcHVibGljIGdldCB3KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl93OyB9XG4gICAgXG4gICAgcHVibGljIHNldCB4KHg6IG51bWJlcikgeyB0aGlzLl94ID0geDsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cbiAgICBwdWJsaWMgc2V0IHkoeTogbnVtYmVyKSB7IHRoaXMuX3kgPSB5OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuICAgIHB1YmxpYyBzZXQgeih6OiBudW1iZXIpIHsgdGhpcy5feiA9IHo7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG4gICAgcHVibGljIHNldCB3KHc6IG51bWJlcikgeyB0aGlzLl93ID0gdzsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLncpO1xuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gIGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBkb3QodmVjdG9yQTogVmVjdG9yNCwgdmVjdG9yQjogVmVjdG9yNCk6IG51bWJlciB7XG4gICAgICAgIGxldCByZXQgPSB2ZWN0b3JBLnggKiB2ZWN0b3JCLnggKyB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnkgKyB2ZWN0b3JBLnogKiB2ZWN0b3JCLnogKyB2ZWN0b3JBLncgKiB2ZWN0b3JCLnc7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxufSIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcblxubGV0IEJhc2ljOiBTaGFkZXJTdHJ1Y3QgPSB7XG4gICAgdmVydGV4U2hhZGVyOiBgXG4gICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcbiAgICAgICAgYXR0cmlidXRlIHZlYzIgYVRleENvb3JkcztcblxuICAgICAgICB1bmlmb3JtIG1hdDQgdVByb2plY3Rpb247XG4gICAgICAgIHVuaWZvcm0gbWF0NCB1UG9zaXRpb247XG5cbiAgICAgICAgdmFyeWluZyB2ZWMyIHZUZXhDb29yZHM7XG5cbiAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb24gKiB1UG9zaXRpb24gKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcblxuICAgICAgICAgICAgdlRleENvb3JkcyA9IGFUZXhDb29yZHM7XG4gICAgICAgIH1cbiAgICBgLFxuXG4gICAgZnJhZ21lbnRTaGFkZXI6IGBcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG4gICAgICAgIFxuICAgICAgICB1bmlmb3JtIHZlYzQgdVVWO1xuICAgICAgICB1bmlmb3JtIHZlYzIgdVJlcGVhdDtcbiAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdVRleHR1cmU7XG5cbiAgICAgICAgdmFyeWluZyB2ZWMyIHZUZXhDb29yZHM7XG5cbiAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcbiAgICAgICAgICAgIHZlYzIgY29vcmRzID0gbW9kKGNsYW1wKHZUZXhDb29yZHMsIDAuMCwgMS4wKSAqIHVSZXBlYXQsIDEuMCkgKiB1VVYuencgKyB1VVYueHk7XG5cbiAgICAgICAgICAgIC8vZ2xfRnJhZ0NvbG9yID0gdmVjNCh0ZXh0dXJlMkQodVRleHR1cmUsIGNvb3JkcykucmdiLCAxLjApO1xuICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVUZXh0dXJlLCBjb29yZHMpOztcbiAgICAgICAgfVxuICAgIGBcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2ljOyIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcblxubGV0IENvbG9yOiBTaGFkZXJTdHJ1Y3QgPSB7XG4gICAgdmVydGV4U2hhZGVyOiBgXG4gICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcblxuICAgICAgICB1bmlmb3JtIG1hdDQgdVByb2plY3Rpb247XG4gICAgICAgIHVuaWZvcm0gbWF0NCB1UG9zaXRpb247XG5cbiAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb24gKiB1UG9zaXRpb24gKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgfVxuICAgIGAsXG5cbiAgICBmcmFnbWVudFNoYWRlcjogYFxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcblxuICAgICAgICB1bmlmb3JtIHZlYzQgdUNvbG9yO1xuXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB1Q29sb3I7XG4gICAgICAgIH1cbiAgICBgXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb2xvcjsiLCJpbXBvcnQgeyBTaGFkZXJTdHJ1Y3QgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XG5pbXBvcnQgeyBjcmVhdGVVVUlEIH0gZnJvbSAnLi4vVXRpbHMnO1xuXG5pbnRlcmZhY2UgQXR0cmlidXRlcyB7XG4gICAgW2luZGV4OiBzdHJpbmddOiBudW1iZXJcbn07XG5cbmludGVyZmFjZSBVbmlmb3JtcyB7XG4gICAgW2luZGV4OiBzdHJpbmddOiBXZWJHTFVuaWZvcm1Mb2NhdGlvblxufVxuXG5jbGFzcyBTaGFkZXIge1xuICAgIHB1YmxpYyBhdHRyaWJ1dGVzICAgICAgICAgICAgICAgOiBBdHRyaWJ1dGVzO1xuICAgIHB1YmxpYyB1bmlmb3JtcyAgICAgICAgICAgICAgICAgOiBVbmlmb3JtcztcbiAgICBwdWJsaWMgcHJvZ3JhbSAgICAgICAgICAgICAgICAgIDogV2ViR0xQcm9ncmFtO1xuICAgIHB1YmxpYyBhdHRyaWJ1dGVzQ291bnQgICAgICAgICAgOiBudW1iZXI7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgdXVpZCAgICAgICAgICAgIDogc3RyaW5nO1xuXG4gICAgc3RhdGljIG1heEF0dHJpYkxlbmd0aCAgICAgICAgICA6IG51bWJlcjtcbiAgICBzdGF0aWMgbGFzdFByb2dyYW0gICAgICAgICAgICAgIDogU2hhZGVyO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LCBzaGFkZXI6IFNoYWRlclN0cnVjdCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHt9O1xuXG4gICAgICAgIHRoaXMudXVpZCA9IGNyZWF0ZVVVSUQoKTtcblxuICAgICAgICB0aGlzLmNvbXBpbGVTaGFkZXJzKHNoYWRlcik7XG4gICAgICAgIHRoaXMuZ2V0U2hhZGVyQXR0cmlidXRlcyhzaGFkZXIpO1xuICAgICAgICB0aGlzLmdldFNoYWRlclVuaWZvcm1zKHNoYWRlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb21waWxlU2hhZGVycyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xuICAgICAgICBsZXQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IHRoaXMuZ2w7XG5cbiAgICAgICAgbGV0IHZTaGFkZXI6IFdlYkdMU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICBnbC5zaGFkZXJTb3VyY2UodlNoYWRlciwgc2hhZGVyLnZlcnRleFNoYWRlcik7XG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIodlNoYWRlcik7XG5cbiAgICAgICAgbGV0IGZTaGFkZXI6IFdlYkdMU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgICAgIGdsLnNoYWRlclNvdXJjZShmU2hhZGVyLCBzaGFkZXIuZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKGZTaGFkZXIpO1xuXG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgdlNoYWRlcik7XG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcih0aGlzLnByb2dyYW0sIGZTaGFkZXIpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuXG4gICAgICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHZTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZ2wuZ2V0U2hhZGVySW5mb0xvZyh2U2hhZGVyKSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb21waWxpbmcgdmVydGV4IHNoYWRlclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZ2wuZ2V0U2hhZGVySW5mb0xvZyhmU2hhZGVyKSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb21waWxpbmcgZnJhZ21lbnQgc2hhZGVyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLnByb2dyYW0pKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGxpbmtpbmcgdGhlIHByb2dyYW1cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNoYWRlckF0dHJpYnV0ZXMoc2hhZGVyOiBTaGFkZXJTdHJ1Y3QpOiB2b2lkIHtcbiAgICAgICAgbGV0IGNvZGU6IEFycmF5PHN0cmluZz4gPSBzaGFkZXIudmVydGV4U2hhZGVyLnNwbGl0KC9cXG4vZyk7XG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcblxuICAgICAgICBsZXQgYXR0cmlidXRlOiBzdHJpbmc7XG4gICAgICAgIGxldCBsb2NhdGlvbjogbnVtYmVyO1xuXG4gICAgICAgIHRoaXMuYXR0cmlidXRlc0NvdW50ID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGV0IGM6IEFycmF5PHN0cmluZz4gPSBjb2RlW2ldLnRyaW0oKS5zcGxpdCgvIC9nKTtcblxuICAgICAgICAgICAgaWYgKGNbMF0gPT0gJ2F0dHJpYnV0ZScpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPSBjLnBvcCgpLnJlcGxhY2UoLzsvZywgXCJcIik7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnByb2dyYW0sIGF0dHJpYnV0ZSk7XG5cbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbYXR0cmlidXRlXSA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc0NvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBTaGFkZXIubWF4QXR0cmliTGVuZ3RoID0gTWF0aC5tYXgoU2hhZGVyLm1heEF0dHJpYkxlbmd0aCwgdGhpcy5hdHRyaWJ1dGVzQ291bnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2hhZGVyVW5pZm9ybXMoc2hhZGVyOiBTaGFkZXJTdHJ1Y3QpOiB2b2lkIHtcbiAgICAgICAgbGV0IGNvZGU6IEFycmF5PHN0cmluZz4gPSBzaGFkZXIudmVydGV4U2hhZGVyLnNwbGl0KC9cXG4vZyk7XG4gICAgICAgIGNvZGUgPSBjb2RlLmNvbmNhdChzaGFkZXIuZnJhZ21lbnRTaGFkZXIuc3BsaXQoL1xcbi9nKSk7XG5cbiAgICAgICAgbGV0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSB0aGlzLmdsO1xuXG4gICAgICAgIGxldCB1bmlmb3JtOiBzdHJpbmc7XG4gICAgICAgIGxldCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb247XG4gICAgICAgIGxldCB1c2VkVW5pZm9ybXM6IEFycmF5PHN0cmluZz4gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGV0IGM6IEFycmF5PHN0cmluZz4gPSBjb2RlW2ldLnRyaW0oKS5zcGxpdCgvIC9nKTtcblxuICAgICAgICAgICAgaWYgKGNbMF0gPT0gXCJ1bmlmb3JtXCIpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gYy5wb3AoKS5yZXBsYWNlKC87L2csIFwiXCIpO1xuICAgICAgICAgICAgICAgIGlmICh1c2VkVW5pZm9ybXMuaW5kZXhPZih1bmlmb3JtKSAhPSAtMSkgeyBjb250aW51ZTsgfVxuXG4gICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1bmlmb3JtKTtcblxuICAgICAgICAgICAgICAgIHVzZWRVbmlmb3Jtcy5wdXNoKHVuaWZvcm0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy51bmlmb3Jtc1t1bmlmb3JtXSA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHVzZVByb2dyYW0oKTogdm9pZCB7XG4gICAgICAgIGlmIChTaGFkZXIubGFzdFByb2dyYW0gPT0gdGhpcykgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IHRoaXMuZ2w7XG5cbiAgICAgICAgZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgICAgICBTaGFkZXIubGFzdFByb2dyYW0gPSB0aGlzO1xuXG4gICAgICAgIGxldCBhdHRyaWJMZW5ndGg6IG51bWJlciA9IHRoaXMuYXR0cmlidXRlc0NvdW50O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gU2hhZGVyLm1heEF0dHJpYkxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA8IGF0dHJpYkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblNoYWRlci5tYXhBdHRyaWJMZW5ndGggPSAwO1xuU2hhZGVyLmxhc3RQcm9ncmFtID0gbnVsbDtcblxuZXhwb3J0IGRlZmF1bHQgU2hhZGVyOyIsImltcG9ydCB7IFJlbmRlcmVyLCBDYW1lcmEsIFNjZW5lLCBDdWJlR2VvbWV0cnksIENvbG9yTWF0ZXJpYWwsIFZlY3RvcjQsIEluc3RhbmNlIH0gZnJvbSAnLi4vLi4vZW5naW5lJztcblxuY2xhc3MgQXBwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyID0gbmV3IFJlbmRlcmVyKDg1NCwgNDgwKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXZHYW1lXCIpLmFwcGVuZENoaWxkKHJlbmRlci5jYW52YXMpO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlcl8yID0gbmV3IFJlbmRlcmVyKDg1NCwgNDgwKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXZHYW1lXCIpLmFwcGVuZENoaWxkKHJlbmRlcl8yLmNhbnZhcyk7XG5cbiAgICAgICAgY29uc3QgY2FtZXJhID0gQ2FtZXJhLmNyZWF0ZVBlcnNwZWN0aXZlKDkwLCA4NTQvNDgwLCAwLjEsIDEwMDAuMCk7XG4gICAgICAgIGNhbWVyYS5zZXRQb3NpdGlvbigxMCwgMTAsIDEwKTtcbiAgICAgICAgY2FtZXJhLnNldFRhcmdldCgwLCAwLCAwKTtcblxuICAgICAgICBjb25zdCBjYW1lcmFfMiA9IENhbWVyYS5jcmVhdGVQZXJzcGVjdGl2ZSg5MCwgODU0LzQ4MCwgMC4xLCAxMDAwLjApO1xuICAgICAgICBjYW1lcmFfMi5zZXRQb3NpdGlvbigwLCAwLCAxMCk7XG4gICAgICAgIGNhbWVyYV8yLnNldFRhcmdldCgwLCAwLCAwKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGdlbyA9IG5ldyBDdWJlR2VvbWV0cnkoMiwgMiwgMik7XG4gICAgICAgIGNvbnN0IG1hdCA9IG5ldyBDb2xvck1hdGVyaWFsKG5ldyBWZWN0b3I0KDEuMCwgMS4wLCAxLjAsIDEuMCkpO1xuICAgICAgICBjb25zdCBpbnN0ID0gbmV3IEluc3RhbmNlKGdlbywgbWF0KTtcblxuICAgICAgICBjb25zdCBzY2VuZSA9IG5ldyBTY2VuZSgpO1xuICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KGluc3QpO1xuXG4gICAgICAgIHNjZW5lLmluaXQoKTtcblxuICAgICAgICB0aGlzLl9sb29wKHJlbmRlciwgcmVuZGVyXzIsIGNhbWVyYSwgY2FtZXJhXzIsIHNjZW5lKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9sb29wKHJlbmRlcjogUmVuZGVyZXIsIHJlbmRlcl8yOiBSZW5kZXJlciwgY2FtZXJhOiBDYW1lcmEsIGNhbWVyYV8yOiBDYW1lcmEsIHNjZW5lOiBTY2VuZSkge1xuICAgICAgICByZW5kZXIuY2xlYXIoKTtcbiAgICAgICAgcmVuZGVyXzIuY2xlYXIoKTtcblxuICAgICAgICBzY2VuZS5yZW5kZXIocmVuZGVyLCBjYW1lcmEpO1xuICAgICAgICBzY2VuZS5yZW5kZXIocmVuZGVyXzIsIGNhbWVyYV8yKTtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fbG9vcChyZW5kZXIsIHJlbmRlcl8yLCBjYW1lcmEsIGNhbWVyYV8yLCBzY2VuZSkpO1xuICAgIH1cbn1cblxud2luZG93Lm9ubG9hZCA9ICgpID0+IG5ldyBBcHAoKTsiXX0=
