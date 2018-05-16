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
    Scene.prototype.render = function (renderer) {
        var _this = this;
        this._renderingLayers.each(function (layer) {
            layer.render(renderer, _this._camera);
        });
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
        var uPosition = Matrix4_1.default.createIdentity();
        uPosition.multiply(this.getTransformation());
        uPosition.multiply(camera.getTransformation());
        gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(shader.uniforms["uPosition"], false, uPosition.data);
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
        var camera = engine_1.Camera.createPerspective(90, 854 / 480, 0.1, 1000.0);
        camera.setPosition(10, 10, 10);
        camera.setTarget(0, 0, 0);
        var geo = new engine_1.CubeGeometry(2, 2, 2);
        var mat = new engine_1.ColorMaterial(new engine_1.Vector4(1.0, 1.0, 1.0, 1.0));
        var inst = new engine_1.Instance(geo, mat);
        var scene = new engine_1.Scene();
        scene.setCamera(camera);
        scene.addGameObject(inst);
        scene.init();
        this._loop(render, scene);
    }
    App.prototype._loop = function (render, scene) {
        var _this = this;
        render.clear();
        scene.render(render);
        requestAnimationFrame(function () { return _this._loop(render, scene); });
    };
    return App;
}());
window.onload = function () { return new App(); };

},{"../../engine":20}]},{},[30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL0NhbWVyYS50cyIsInNyYy9lbmdpbmUvQ29tcG9uZW50LnRzIiwic3JjL2VuZ2luZS9Db25maWcudHMiLCJzcmMvZW5naW5lL0NvbnN0YW50cy50cyIsInNyYy9lbmdpbmUvSW5wdXQudHMiLCJzcmMvZW5naW5lL0xpc3QudHMiLCJzcmMvZW5naW5lL1JlbmRlcmVyLnRzIiwic3JjL2VuZ2luZS9SZW5kZXJpbmdMYXllci50cyIsInNyYy9lbmdpbmUvU2NlbmUudHMiLCJzcmMvZW5naW5lL1RleHR1cmUudHMiLCJzcmMvZW5naW5lL1V0aWxzLnRzIiwic3JjL2VuZ2luZS9jb2xsaXNpb25zL0JveENvbGxpc2lvbi50cyIsInNyYy9lbmdpbmUvY29sbGlzaW9ucy9Db2xsaXNpb24udHMiLCJzcmMvZW5naW5lL2VudGl0aWVzL0luc3RhbmNlLnRzIiwic3JjL2VuZ2luZS9lbnRpdGllcy9UZXh0LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9HZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL1dhbGxHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvaW5kZXgudHMiLCJzcmMvZW5naW5lL21hdGVyaWFscy9CYXNpY01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbC50cyIsInNyYy9lbmdpbmUvbWF0ZXJpYWxzL01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRoL01hdHJpeDQudHMiLCJzcmMvZW5naW5lL21hdGgvVmVjdG9yMy50cyIsInNyYy9lbmdpbmUvbWF0aC9WZWN0b3I0LnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0Jhc2ljLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0NvbG9yLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL1NoYWRlci50cyIsInNyYy9leGFtcGxlcy9lbmdpbmVEZXYvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSwwQ0FBcUM7QUFDckMsMENBQXFDO0FBQ3JDLGlDQUFtQztBQUVuQztJQVdJLGdCQUFZLFVBQW1CO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUzQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU0sNEJBQVcsR0FBbEIsVUFBbUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sMEJBQVMsR0FBaEIsVUFBaUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7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SUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUFDLENBQUM7SUFBQSxJQUFJLENBQ3JELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQUMsQ0FBQztJQUFBLElBQUksQ0FDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUFDLENBQUM7SUFBQSxJQUFJLENBQ3BELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUFBLElBQUksQ0FDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFBQyxDQUFDO0FBQ25ELENBQUM7QUFURCx3Q0FTQztBQUVELG9CQUEyQixTQUFrQixFQUFFLFNBQWtCO0lBQzdELElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFDN0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTVCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxl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QUVELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDdkYsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxNQUFNLENBQUMsRUFDN0IsUUFBUSxHQUFHLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsRUFDckMsUUFBUSxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUU1RSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBQ0wsV0FBQztBQUFELENBM0VBLEFBMkVDLENBM0VrQixrQkFBUSxHQTJFMUI7QUFFRCxrQkFBZSxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3hHcEIsbURBQThDO0FBRTlDO0lBQTJCLGdDQUFRO0lBQy9CLHNCQUFZLEtBQWEsRUFBRSxNQUFjLEVBQUUsTUFBYztRQUF6RCxZQUNJLGlCQUFPLFNBR1Y7UUFERyxLQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7O0lBQzNDLENBQUM7SUFFTyxpQ0FBVSxHQUFsQixVQUFtQixLQUFhLEVBQUUsTUFBYyxFQUFFLE1BQWM7UUFDNUQsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFDYixDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFDZCxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUduQixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FB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QUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRS9DLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2QsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFF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QyxDQUFDO1FBRXJCLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFDTCxVQUFDO0FBQUQsQ0E3QkEsQUE2QkMsSUFBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsY0FBTSxPQUFBLElBQUksR0FBRyxFQUFFLEVBQVQsQ0FBUyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBNYXRyaXg0IGZyb20gJy4vbWF0aC9NYXRyaXg0JztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCB7IGRlZ1RvUmFkIH0gZnJvbSAnLi9VdGlscyc7XG5cbmNsYXNzIENhbWVyYSB7XG4gICAgcHJpdmF0ZSBfdHJhbnNmb3JtICAgICAgICAgICA6IE1hdHJpeDQ7XG4gICAgcHJpdmF0ZSBfdGFyZ2V0ICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJpdmF0ZSBfdXAgICAgICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJpdmF0ZSBfbmVlZHNVcGRhdGUgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgcG9zaXRpb24gICAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwdWJsaWMgc2NyZWVuU2l6ZSAgICAgICAgICAgIDogVmVjdG9yMztcblxuICAgIHB1YmxpYyByZWFkb25seSBwcm9qZWN0aW9uICAgICAgICAgIDogTWF0cml4NDtcblxuICAgIGNvbnN0cnVjdG9yKHByb2plY3Rpb246IE1hdHJpeDQpIHtcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gcHJvamVjdGlvbjtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gTWF0cml4NC5jcmVhdGVJZGVudGl0eSgpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5fdGFyZ2V0ID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuX3VwID0gbmV3IFZlY3RvcjMoMCwgMSwgMCk7XG4gICAgICAgIHRoaXMuc2NyZWVuU2l6ZSA9IG5ldyBWZWN0b3IzKDAuMCk7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogQ2FtZXJhIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUYXJnZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XG4gICAgICAgIHRoaXMuX3RhcmdldC5zZXQoeCwgeSwgeik7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUcmFuc2Zvcm1hdGlvbigpOiBNYXRyaXg0IHtcbiAgICAgICAgaWYgKCF0aGlzLl9uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmID0gdGhpcy5mb3J3YXJkLFxuICAgICAgICAgICAgbCA9IFZlY3RvcjMuY3Jvc3ModGhpcy5fdXAsIGYpLm5vcm1hbGl6ZSgpLFxuICAgICAgICAgICAgdSA9IFZlY3RvcjMuY3Jvc3MoZiwgbCkubm9ybWFsaXplKCk7XG5cbiAgICAgICAgbGV0IGNwID0gdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHggPSAtVmVjdG9yMy5kb3QobCwgY3ApLFxuICAgICAgICAgICAgeSA9IC1WZWN0b3IzLmRvdCh1LCBjcCksXG4gICAgICAgICAgICB6ID0gLVZlY3RvcjMuZG90KGYsIGNwKTtcblxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0KFxuICAgICAgICAgICAgbC54LCB1LngsIGYueCwgMCxcbiAgICAgICAgICAgIGwueSwgdS55LCBmLnksIDAsXG4gICAgICAgICAgICBsLnosIHUueiwgZi56LCAwLFxuICAgICAgICAgICAgICB4LCAgIHksICAgeiwgMVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZm9yd2FyZCgpOiBWZWN0b3IzIHtcbiAgICAgICAgbGV0IGNwID0gdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHQgPSB0aGlzLl90YXJnZXQ7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKGNwLnggLSB0LngsIGNwLnkgLSB0LnksIGNwLnogLSB0LnopLm5vcm1hbGl6ZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNVcGRhdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuX25lZWRzVXBkYXRlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlUGVyc3BlY3RpdmUoZm92RGVncmVlczogbnVtYmVyLCByYXRpbzogbnVtYmVyLCB6bmVhcjogbnVtYmVyLCB6ZmFyOiBudW1iZXIpOiBDYW1lcmEge1xuICAgICAgICBjb25zdCBmb3YgPSBkZWdUb1JhZChmb3ZEZWdyZWVzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW1lcmEoTWF0cml4NC5jcmVhdGVQZXJzcGVjdGl2ZShmb3YsIHJhdGlvLCB6bmVhciwgemZhcikpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlT3J0aG9ncmFwaGljKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB6bmVhcjogbnVtYmVyLCB6ZmFyOiBudW1iZXIpOiBDYW1lcmEge1xuICAgICAgICBsZXQgcmV0ID0gbmV3IENhbWVyYShNYXRyaXg0LmNyZWF0ZU9ydGhvKHdpZHRoLCBoZWlnaHQsIHpuZWFyLCB6ZmFyKSk7XG4gICAgICAgIHJldC5zY3JlZW5TaXplLnNldCh3aWR0aCwgaGVpZ2h0LCAwKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhOyIsImltcG9ydCBJbnN0YW5jZSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcblxuYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IHtcbiAgICBwcm90ZWN0ZWQgX2luc3RhbmNlICAgICAgICAgICAgICAgICA6IEluc3RhbmNlO1xuICAgIFxuICAgIHB1YmxpYyByZWFkb25seSBuYW1lICAgICAgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGNvbXBvbmVudE5hbWUgICAgOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb21wb25lbnROYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gY29tcG9uZW50TmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2luc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IGF3YWtlKCk6IHZvaWQ7XG4gICAgcHVibGljIGFic3RyYWN0IHVwZGF0ZSgpOiB2b2lkO1xuICAgIHB1YmxpYyBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudDsiLCJsZXQgQ29uZmlnID0ge1xuICAgIFBMQVlfRlVMTFNDUkVFTiAgICAgICAgOiBmYWxzZSxcbiAgICBESVNQTEFZX0NPTExJU0lPTlMgICAgIDogZmFsc2Vcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZzsiLCJleHBvcnQgY29uc3QgVkVSVElDRV9TSVpFICAgICAgICAgICA9IDM7XG5leHBvcnQgY29uc3QgVEVYQ09PUkRfU0laRSAgICAgICAgICA9IDI7XG5cbmV4cG9ydCBjb25zdCBQSV8yICAgICAgICAgICAgICAgICAgID0gTWF0aC5QSSAvIDI7XG5leHBvcnQgY29uc3QgUEkyICAgICAgICAgICAgICAgICAgICA9IE1hdGguUEkgKiAyO1xuZXhwb3J0IGNvbnN0IFBJM18yICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMyAvIDI7IiwiaW1wb3J0IHsgY3JlYXRlVVVJRCB9IGZyb20gJy4vVXRpbHMnO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL0NvbmZpZyc7XG5cbmludGVyZmFjZSBDYWxsYmFjayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XG59XG5cbmNsYXNzIElucHV0IHtcbiAgICBwcml2YXRlIF9lbGVtZW50ICAgICAgICAgICAgICAgICA6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX2tleWRvd25DYWxsYmFja3MgICAgICAgIDogQXJyYXk8Q2FsbGJhY2s+O1xuICAgIHByaXZhdGUgX2tleXVwQ2FsbGJhY2tzICAgICAgICAgIDogQXJyYXk8Q2FsbGJhY2s+O1xuICAgIHByaXZhdGUgX21vdXNlbW92ZUNhbGxiYWNrcyAgICAgIDogQXJyYXk8Q2FsbGJhY2s+O1xuICAgIHByaXZhdGUgX2VsZW1lbnRGb2N1cyAgICAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fa2V5ZG93bkNhbGxiYWNrcyA9IFtdO1xuICAgICAgICB0aGlzLl9rZXl1cENhbGxiYWNrcyA9IFtdO1xuICAgICAgICB0aGlzLl9tb3VzZW1vdmVDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5fZWxlbWVudEZvY3VzID0gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgX2hhbmRsZUtleWRvd24oa2V5RXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbGVtZW50Rm9jdXMpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgZm9yIChsZXQgaT0wLGNhbGxiYWNrO2NhbGxiYWNrPXRoaXMuX2tleWRvd25DYWxsYmFja3NbaV07aSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhrZXlFdmVudC5rZXlDb2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2hhbmRsZUtleXVwKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9rZXl1cENhbGxiYWNrc1tpXTtpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGxiYWNrKGtleUV2ZW50LmtleUNvZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlTW91c2VNb3ZlKG1vdXNlRXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbGVtZW50Rm9jdXMpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgZm9yIChsZXQgaT0wLGNhbGxiYWNrO2NhbGxiYWNrPXRoaXMuX21vdXNlbW92ZUNhbGxiYWNrc1tpXTtpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGxiYWNrKG1vdXNlRXZlbnQubW92ZW1lbnRYLCBtb3VzZUV2ZW50Lm1vdmVtZW50WSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVQb2ludGVyTG9ja0NoYW5nZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudEZvY3VzID0gKGRvY3VtZW50LnBvaW50ZXJMb2NrRWxlbWVudCA9PT0gdGhpcy5fZWxlbWVudCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgX2RlbGV0ZUZyb21MaXN0KGxpc3Q6IEFycmF5PENhbGxiYWNrPiwgaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9bGlzdFtpXTtpKyspIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KGxpc3Q6IEFycmF5PENhbGxiYWNrPiwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHJldDogQ2FsbGJhY2sgPSB7XG4gICAgICAgICAgICBpZDogY3JlYXRlVVVJRCgpLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnB1c2gocmV0KTtcblxuICAgICAgICByZXR1cm4gcmV0LmlkO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KGZvY3VzRWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGZvY3VzRWxlbWVudDtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoa2V5RXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHsgdGhpcy5faGFuZGxlS2V5ZG93bihrZXlFdmVudCk7IH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleXVwKGtleUV2ZW50KTsgfSk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChldjogTW91c2VFdmVudCkgPT4geyB0aGlzLl9oYW5kbGVNb3VzZU1vdmUoZXYpOyB9KTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybG9ja2NoYW5nZScsICgpID0+IHsgdGhpcy5faGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTsgfSwgZmFsc2UpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3pwb2ludGVybG9ja2NoYW5nZScsICgpID0+IHsgdGhpcy5faGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTsgfSwgZmFsc2UpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRwb2ludGVybG9ja2NoYW5nZScsICgpID0+IHsgdGhpcy5faGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTsgfSwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4gPSB0aGlzLl9lbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuIHx8IHRoaXMuX2VsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4gfHwgKDxhbnk+dGhpcy5fZWxlbWVudCkubW96UmVxdWVzdEZ1bGxTY3JlZW47XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKENvbmZpZy5QTEFZX0ZVTExTQ1JFRU4gJiYgdGhpcy5fZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbikgdGhpcy5fZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xuXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnJlcXVlc3RQb2ludGVyTG9jaygpO1xuICAgICAgICB9KTtcbiAgICB9IFxuXG4gICAgcHVibGljIG9uS2V5ZG93bihjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlQ2FsbGJhY2tUb0xpc3QodGhpcy5fa2V5ZG93bkNhbGxiYWNrcywgY2FsbGJhY2spO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgb25LZXl1cChjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlQ2FsbGJhY2tUb0xpc3QodGhpcy5fa2V5dXBDYWxsYmFja3MsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Nb3VzZU1vdmUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZWxldGVDYWxsYmFjayhpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kZWxldGVGcm9tTGlzdCh0aGlzLl9rZXlkb3duQ2FsbGJhY2tzLCBpZCkpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICh0aGlzLl9kZWxldGVGcm9tTGlzdCh0aGlzLl9rZXl1cENhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodGhpcy5fZGVsZXRlRnJvbUxpc3QodGhpcy5fbW91c2Vtb3ZlQ2FsbGJhY2tzLCBpZCkpIHsgcmV0dXJuOyB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAobmV3IElucHV0KCkpOyIsImNsYXNzIE5vZGUge1xuICAgIHB1YmxpYyBwcmV2ICAgICAgICA6IE5vZGU7XG4gICAgcHVibGljIG5leHQgICAgICAgIDogTm9kZTtcbiAgICBwdWJsaWMgaXRlbSAgICAgICAgOiBhbnk7XG4gICAgcHVibGljIGluVXNlICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGl0ZW06IGFueSkge1xuICAgICAgICB0aGlzLml0ZW0gPSBpdGVtO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5pdGVtID0gbnVsbDtcbiAgICB9XG59XG5cbmNsYXNzIExpc3Q8VD4ge1xuICAgIHByaXZhdGUgX2hlYWQgICAgICAgICAgIDogTm9kZTtcbiAgICBwcml2YXRlIF90YWlsICAgICAgICAgICA6IE5vZGU7XG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5faGVhZCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RhaWwgPSBudWxsO1xuICAgICAgICB0aGlzLl9sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBwdXNoKGl0ZW06IFQpOiB2b2lkIHtcbiAgICAgICAgbGV0IG5vZGUgPSBuZXcgTm9kZShpdGVtKTtcblxuICAgICAgICBpZiAodGhpcy5faGVhZCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFkID0gbm9kZTtcbiAgICAgICAgICAgIHRoaXMuX3RhaWwgPSBub2RlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRhaWwgPSB0aGlzLl90YWlsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBub2RlLnByZXYgPSB0YWlsO1xuICAgICAgICAgICAgdGFpbC5uZXh0ID0gbm9kZTtcblxuICAgICAgICAgICAgdGhpcy5fdGFpbCA9IG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9sZW5ndGggKz0gMTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlKGl0ZW06IFQpOiB2b2lkIHtcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5pdGVtID09IGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2KXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3RhaWwgPT0gbm9kZSkgeyB0aGlzLl90YWlsID0gbm9kZS5wcmV2OyB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJldi5uZXh0ID0gbm9kZS5uZXh0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHQpeyBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbm9kZSkgeyB0aGlzLl9oZWFkID0gbm9kZS5uZXh0OyB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGUubmV4dC5wcmV2ID0gbm9kZS5wcmV2O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG5vZGUuY2xlYXIoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2xlbmd0aCAtPSAxO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldEF0KGluZGV4OiBudW1iZXIpOiBUIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCA9PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkLFxuICAgICAgICAgICAgY291bnQgPSAwO1xuXG4gICAgICAgIHdoaWxlIChjb3VudCA8IGluZGV4KSB7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9kZS5pdGVtO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgaW5zZXJ0QXQoaW5kZXg6IG51bWJlciwgaXRlbTogVCk6IHZvaWQge1xuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQsXG4gICAgICAgICAgICBjb3VudCA9IDA7XG5cbiAgICAgICAgdGhpcy5fbGVuZ3RoKys7XG5cbiAgICAgICAgd2hpbGUgKGNvdW50IDwgaW5kZXgpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld0l0ZW0gPSBuZXcgTm9kZShpdGVtKTtcbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5faGVhZC5wcmV2ID0gbmV3SXRlbTtcbiAgICAgICAgICAgIG5ld0l0ZW0ubmV4dCA9IHRoaXMuX2hlYWQ7XG4gICAgICAgICAgICB0aGlzLl9oZWFkID0gbmV3SXRlbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0l0ZW0ubmV4dCA9IG5vZGU7XG4gICAgICAgICAgICBuZXdJdGVtLnByZXYgPSBub2RlLnByZXY7XG4gICAgXG4gICAgICAgICAgICBpZiAobm9kZS5wcmV2KSBub2RlLnByZXYubmV4dCA9IG5ld0l0ZW07XG4gICAgICAgICAgICBub2RlLnByZXYgPSBuZXdJdGVtO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGVhY2goY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5faGVhZDtcblxuICAgICAgICB3aGlsZSAoaXRlbSkge1xuICAgICAgICAgICAgY2FsbGJhY2soaXRlbS5pdGVtKTtcblxuICAgICAgICAgICAgaXRlbSA9IGl0ZW0ubmV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLmNsZWFyKCk7XG5cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc29ydChzb3J0Q2hlY2s6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggPCAyKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZC5uZXh0LFxuICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XG5cbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gbm9kZS5uZXh0O1xuXG4gICAgICAgICAgICBpZiAoc29ydENoZWNrKG5vZGUuaXRlbSwgY29tcGFyZS5pdGVtKSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXYpIHsgbm9kZS5wcmV2Lm5leHQgPSBub2RlLm5leHQ7IH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0KSB7IG5vZGUubmV4dC5wcmV2ID0gbm9kZS5wcmV2OyB9XG5cbiAgICAgICAgICAgICAgICBub2RlLm5leHQgPSBjb21wYXJlO1xuICAgICAgICAgICAgICAgIG5vZGUucHJldiA9IGNvbXBhcmUucHJldjtcblxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlLnByZXYpIGNvbXBhcmUucHJldi5uZXh0ID0gbm9kZTtcbiAgICAgICAgICAgICAgICBjb21wYXJlLnByZXYgPSBub2RlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlID09IHRoaXMuX2hlYWQpIHsgdGhpcy5faGVhZCA9IG5vZGU7IH0gXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUgPT0gdGhpcy5fdGFpbCkgeyB0aGlzLl90YWlsID0gbm9kZTsgfVxuXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBhcmUgPSBjb21wYXJlLm5leHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb21wYXJlID09IG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgICAgICAgICBjb21wYXJlID0gdGhpcy5faGVhZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaGVhZCgpOiBOb2RlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpc3Q7IiwiaW1wb3J0IFNoYWRlciBmcm9tICcuL3NoYWRlcnMvU2hhZGVyJztcbmltcG9ydCBCYXNpYyBmcm9tICcuL3NoYWRlcnMvQmFzaWMnO1xuaW1wb3J0IENvbG9yIGZyb20gJy4vc2hhZGVycy9Db2xvcic7XG5pbXBvcnQgeyBTaGFkZXJNYXAsIFNoYWRlcnNOYW1lcyB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXJTdHJ1Y3QnO1xuaW1wb3J0IHsgY3JlYXRlVVVJRCB9IGZyb20gJy4vVXRpbHMnO1xuXG5jbGFzcyBSZW5kZXJlciB7XG4gICAgcHJpdmF0ZSBfY2FudmFzICAgICAgICAgICAgICA6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgX2dsICAgICAgICAgICAgICAgICAgOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBfc2hhZGVycyAgICAgICAgICAgICA6IFNoYWRlck1hcDtcblxuICAgIHB1YmxpYyByZWFkb25seSBpZCAgICAgICAgICAgOiBzdHJpbmc7XG4gICAgXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5pZCA9IGNyZWF0ZVVVSUQoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5faW5pdEdMKCk7XG4gICAgICAgIHRoaXMuX2luaXRTaGFkZXJzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXRlQ2FudmFzKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IGNhbnZhcztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0R0woKTogdm9pZCB7XG4gICAgICAgIGxldCBnbCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2xcIik7XG5cbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcblxuICAgICAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbiAgICAgICAgXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XG5cbiAgICAgICAgdGhpcy5fZ2wgPSBnbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0U2hhZGVycygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2hhZGVycyA9IHt9O1xuXG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQkFTSUMgPSBuZXcgU2hhZGVyKHRoaXMuX2dsLCBCYXNpYyk7XG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQ09MT1IgPSBuZXcgU2hhZGVyKHRoaXMuX2dsLCBDb2xvcik7XG5cbiAgICAgICAgdGhpcy5fc2hhZGVycy5CQVNJQy51c2VQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9nbDtcblxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN3aXRjaFNoYWRlcihzaGFkZXJOYW1lOiBTaGFkZXJzTmFtZXMpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2hhZGVyc1tzaGFkZXJOYW1lXS51c2VQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNoYWRlcihzaGFkZXJOYW1lOiBTaGFkZXJzTmFtZXMpOiBTaGFkZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhZGVyc1tzaGFkZXJOYW1lXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IEdMKCk6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNhbnZhcygpOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FudmFzLndpZHRoO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXMuaGVpZ2h0O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyZXI7IiwiaW1wb3J0IEluc3RhbmNlIGZyb20gJy4vZW50aXRpZXMvSW5zdGFuY2UnO1xuaW1wb3J0IExpc3QgZnJvbSAnLi9MaXN0JztcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi9DYW1lcmEnO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXInO1xuXG5pbnRlcmZhY2UgUGFyYW1zIHtcbiAgICBbaW5kZXg6IHN0cmluZ10gOiBhbnlcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnN0YW5jZXNNYXAge1xuICAgIGluc3RhbmNlOiBJbnN0YW5jZTtcbiAgICBwYXJhbXM6IFBhcmFtc1xufVxuXG5jbGFzcyBSZW5kZXJpbmdMYXllciB7XG4gICAgcHJpdmF0ZSBfaW5zdGFuY2VzICAgICAgICAgICAgICAgICAgIDogTGlzdDxJbnN0YW5jZXNNYXA+O1xuXG4gICAgcHVibGljIG9uUHJlcmVuZGVyICAgICAgICAgICAgICAgICAgIDogRnVuY3Rpb247XG4gICAgcHVibGljIG9uUG9zdFVwZGF0ZSAgICAgICAgICAgICAgICAgIDogRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzID0gbmV3IExpc3QoKTtcblxuICAgICAgICB0aGlzLm9uUHJlcmVuZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vblBvc3RVcGRhdGUgPSBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUluc3RhbmNlTWFwKGluc3RhbmNlOiBJbnN0YW5jZSk6IEluc3RhbmNlc01hcCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgICAgICBwYXJhbXM6IHt9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XG4gICAgICAgIGxldCBhZGRlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpPTAsaW5zO2lucz10aGlzLl9pbnN0YW5jZXMuZ2V0QXQoaSk7aSsrKSB7XG4gICAgICAgICAgICBsZXQgY29uZDEgPSAoIWlucy5pbnN0YW5jZS5tYXRlcmlhbCAmJiAhaW5zdGFuY2UubWF0ZXJpYWwpLFxuICAgICAgICAgICAgICAgIGNvbmQyID0gKGlucy5pbnN0YW5jZS5tYXRlcmlhbCAmJiBpbnN0YW5jZS5tYXRlcmlhbCAmJiBpbnMuaW5zdGFuY2UubWF0ZXJpYWwuc2hhZGVyTmFtZSA9PSBpbnN0YW5jZS5tYXRlcmlhbC5zaGFkZXJOYW1lKTtcblxuICAgICAgICAgICAgaWYgKGNvbmQxIHx8IGNvbmQyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5zdGFuY2VzLmluc2VydEF0KGksIHRoaXMuX2NyZWF0ZUluc3RhbmNlTWFwKGluc3RhbmNlKSk7XG4gICAgICAgICAgICAgICAgaSA9IHRoaXMuX2luc3RhbmNlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYWRkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhZGRlZCkge1xuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2VzLnB1c2godGhpcy5fY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2UpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgYXdha2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2luc3RhbmNlcy5lYWNoKChpbnN0YW5jZTogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICBpbnN0YW5jZS5pbnN0YW5jZS5hd2FrZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXMuZWFjaCgoaW5zdGFuY2U6IEluc3RhbmNlc01hcCkgPT4ge1xuICAgICAgICAgICAgbGV0IGlucyA9IGluc3RhbmNlLmluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKGlucy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlcy5yZW1vdmUoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5zLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vblBvc3RVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUG9zdFVwZGF0ZShpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyLCBjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vblByZXJlbmRlcikgeyBcbiAgICAgICAgICAgIHRoaXMub25QcmVyZW5kZXIodGhpcy5faW5zdGFuY2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luc3RhbmNlcy5lYWNoKChpbnN0YW5jZTogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICBpbnN0YW5jZS5pbnN0YW5jZS5yZW5kZXIocmVuZGVyZXIsIGNhbWVyYSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyaW5nTGF5ZXI7IiwiaW1wb3J0IENhbWVyYSBmcm9tICcuL0NhbWVyYSc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9SZW5kZXJlcic7XG5pbXBvcnQgUmVuZGVyaW5nTGF5ZXIgZnJvbSAnLi9SZW5kZXJpbmdMYXllcic7XG5pbXBvcnQgeyBJbnN0YW5jZXNNYXAgfSBmcm9tICcuL1JlbmRlcmluZ0xheWVyJztcbmltcG9ydCBMaXN0IGZyb20gJy4vTGlzdCc7XG5pbXBvcnQgeyBnZXRTcXVhcmVkRGlzdGFuY2UgfSBmcm9tICcuL1V0aWxzJztcbmltcG9ydCBJbnN0YW5jZSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vbWF0aC9WZWN0b3IzJztcblxuY2xhc3MgU2NlbmUge1xuICAgIHByb3RlY3RlZCBfY2FtZXJhICAgICAgICAgICAgICAgICAgIDogQ2FtZXJhO1xuICAgIHByb3RlY3RlZCBfc3RhcnRlZCAgICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX3JlbmRlcmluZ0xheWVycyAgICAgICAgICA6IExpc3Q8UmVuZGVyaW5nTGF5ZXI+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdExheWVycygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzID0gbmV3IExpc3QoKTtcblxuICAgICAgICBsZXQgb3BhcXVlcyA9IG5ldyBSZW5kZXJpbmdMYXllcigpO1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMucHVzaChvcGFxdWVzKTtcblxuICAgICAgICBsZXQgdHJhbnNwYXJlbnRzID0gbmV3IFJlbmRlcmluZ0xheWVyKCk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5wdXNoKHRyYW5zcGFyZW50cyk7XG5cbiAgICAgICAgdHJhbnNwYXJlbnRzLm9uUG9zdFVwZGF0ZSA9ICgoaXRlbTogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICBpdGVtLnBhcmFtcy5kaXN0YW5jZSA9IGdldFNxdWFyZWREaXN0YW5jZShpdGVtLmluc3RhbmNlLnBvc2l0aW9uLCB0aGlzLl9jYW1lcmEucG9zaXRpb24pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0cmFuc3BhcmVudHMub25QcmVyZW5kZXIgPSAoaW5zdGFuY2VzOiBMaXN0PEluc3RhbmNlc01hcD4pID0+IHtcbiAgICAgICAgICAgIGluc3RhbmNlcy5zb3J0KChpdGVtQTogSW5zdGFuY2VzTWFwLCBpdGVtQjogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpdGVtQS5wYXJhbXMuZGlzdGFuY2UgPiBpdGVtQi5wYXJhbXMuZGlzdGFuY2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEdhbWVPYmplY3QoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XG4gICAgICAgIGxldCBtYXQgPSBpbnN0YW5jZS5tYXRlcmlhbDtcblxuICAgICAgICBpbnN0YW5jZS5zZXRTY2VuZSh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5hd2FrZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxheWVyID0gdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLmdldEF0KDApO1xuICAgICAgICBpZiAobWF0ICYmICFtYXQuaXNPcGFxdWUpIHtcbiAgICAgICAgICAgIGxheWVyID0gdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLmdldEF0KDEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsYXllci5hZGRJbnN0YW5jZShpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHRlc3RDb2xsaXNpb24oaW5zdGFuY2U6IEluc3RhbmNlLCBkaXJlY3Rpb246IFZlY3RvcjMpOiBWZWN0b3IzIHtcbiAgICAgICAgaW5zdGFuY2U7XG4gICAgICAgIHJldHVybiBkaXJlY3Rpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldENhbWVyYShjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBjYW1lcmE7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5lYWNoKChsYXllcjogUmVuZGVyaW5nTGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGxheWVyLmF3YWtlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5lYWNoKChsYXllcjogUmVuZGVyaW5nTGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGxheWVyLnVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKHJlbmRlcmVyOiBSZW5kZXJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XG4gICAgICAgICAgICBsYXllci5yZW5kZXIocmVuZGVyZXIsIHRoaXMuX2NhbWVyYSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmU7IiwiaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXInO1xuaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi9tYXRoL1ZlY3RvcjQnO1xuXG5pbnRlcmZhY2UgUmVuZGVyZXJUZXh0dXJlTWFwIHtcbiAgICBbaW5kZXg6IHN0cmluZ10gICAgICAgICAgICAgOiBXZWJHTFRleHR1cmU7XG59XG5cbmNsYXNzIFRleHR1cmUge1xuICAgIHByaXZhdGUgX3NyYyAgICAgICAgICAgICAgIDogc3RyaW5nO1xuICAgIHByaXZhdGUgX2ltZyAgICAgICAgICAgICAgIDogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIF9jYW52YXMgICAgICAgICAgICA6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgX3JlYWR5ICAgICAgICAgICAgIDogYm9vbGVhbjtcbiAgICBwcml2YXRlIF90ZXh0dXJlTWFwICAgICAgICA6IFJlbmRlcmVyVGV4dHVyZU1hcDtcblxuICAgIGNvbnN0cnVjdG9yKHNyYzogc3RyaW5nfEhUTUxDYW52YXNFbGVtZW50LCBjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuX3RleHR1cmVNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGlmICgoPEhUTUxDYW52YXNFbGVtZW50PnNyYykuZ2V0Q29udGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PnNyYztcbiAgICAgICAgICAgIHRoaXMuX2ltZyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zcmMgPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9yZWFkeSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc3JjID0gPHN0cmluZz5zcmM7XG5cbiAgICAgICAgICAgIHRoaXMuX2ltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgdGhpcy5faW1nLnNyYyA9IHRoaXMuX3NyYztcbiAgICAgICAgICAgIHRoaXMuX2ltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVhZHkgPSB0cnVlO1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VUZXh0dXJlKHJlbmRlcmVyOiBSZW5kZXJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBnbCA9IHJlbmRlcmVyLkdMO1xuXG4gICAgICAgIGlmICghdGhpcy5fdGV4dHVyZU1hcFtyZW5kZXJlci5pZF0pIHtcbiAgICAgICAgICAgIHRoaXMuX3RleHR1cmVNYXBbcmVuZGVyZXIuaWRdID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IHRoaXMuX3RleHR1cmVNYXBbcmVuZGVyZXIuaWRdO1xuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMgOiB0aGlzLl9pbWcpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VVZTKHg6IG51bWJlcnxWZWN0b3I0LCB5PzogbnVtYmVyLCB3PzogbnVtYmVyLCBoPzogbnVtYmVyKTogVmVjdG9yNCB7XG4gICAgICAgIGxldCBfeDogbnVtYmVyO1xuXG4gICAgICAgIGlmICgoPFZlY3RvcjQ+eCkubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF94ID0gKDxWZWN0b3I0PngpLng7XG4gICAgICAgICAgICB5ID0gKDxWZWN0b3I0PngpLnk7XG4gICAgICAgICAgICB3ID0gKDxWZWN0b3I0PngpLno7XG4gICAgICAgICAgICBoID0gKDxWZWN0b3I0PngpLnc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjQoXG4gICAgICAgICAgICBfeCAvIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB5IC8gdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICB3IC8gdGhpcy53aWR0aCxcbiAgICAgICAgICAgIGggLyB0aGlzLmhlaWdodFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUZXh0dXJlKHJlbmRlcmVyOiBSZW5kZXJlcik6IFdlYkdMVGV4dHVyZSB7XG4gICAgICAgIGlmICghdGhpcy5fdGV4dHVyZU1hcFtyZW5kZXJlci5pZF0pIHtcbiAgICAgICAgICAgIHRoaXMuX3BhcnNlVGV4dHVyZShyZW5kZXJlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZU1hcFtyZW5kZXJlci5pZF07XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc1JlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZHk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2NhbnZhcyk/IHRoaXMuX2NhbnZhcy53aWR0aCA6IHRoaXMuX2ltZy53aWR0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2NhbnZhcyk/IHRoaXMuX2NhbnZhcy5oZWlnaHQgOiB0aGlzLl9pbWcuaGVpZ2h0O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV4dHVyZTsiLCJpbXBvcnQgVmVjdG9yMyBmcm9tICcuL21hdGgvVmVjdG9yMyc7XG5pbXBvcnQgeyBQSTIgfSBmcm9tICcuL0NvbnN0YW50cyc7XG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVVSUQoKTogc3RyaW5nIHtcbiAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksXG4gICAgICAgIHJldCA9ICgneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JykucmVwbGFjZSgvW3h5XS9nLCAoYzogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGxldCByYW4gPSAoZGF0ZSArIE1hdGgucmFuZG9tKCkgKiAxNikgJSAxNiB8IDA7XG4gICAgICAgICAgICBkYXRlID0gTWF0aC5mbG9vcihkYXRlIC8gMTYpO1xuXG4gICAgICAgICAgICByZXR1cm4gKGMgPT0gJ3gnID8gcmFuIDogKHJhbiYweDN8MHg4KSkudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWdUb1JhZChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEVmVjdG9yRGlyKHg6IG51bWJlciwgeTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAoeCA9PSAxICYmIHkgPT0gMCkgeyByZXR1cm4gMDsgfWVsc2UgXG4gICAgaWYgKHggPT0gMSAmJiB5ID09IC0xKSB7IHJldHVybiBkZWdUb1JhZCg0NSk7IH1lbHNlIFxuICAgIGlmICh4ID09IDAgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoOTApOyB9ZWxzZVxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gLTEpIHsgcmV0dXJuIGRlZ1RvUmFkKDEzNSk7IH1lbHNlXG4gICAgaWYgKHggPT0gLTEgJiYgeSA9PSAwKSB7IHJldHVybiBNYXRoLlBJOyB9ZWxzZVxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMSkgeyByZXR1cm4gZGVnVG9SYWQoMjI1KTsgfWVsc2VcbiAgICBpZiAoeCA9PSAwICYmIHkgPT0gMSkgeyByZXR1cm4gZGVnVG9SYWQoMjcwKTsgfWVsc2VcbiAgICBpZiAoeCA9PSAxICYmIHkgPT0gMSkgeyByZXR1cm4gZGVnVG9SYWQoMzE1KTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0MkRBbmdsZShwb3NpdGlvbjE6IFZlY3RvcjMsIHBvc2l0aW9uMjogVmVjdG9yMyk6IG51bWJlciB7XG4gICAgbGV0IHggPSBwb3NpdGlvbjIueCAtIHBvc2l0aW9uMS54LFxuICAgICAgICB5ID0gcG9zaXRpb24yLnogLSBwb3NpdGlvbjEuejtcblxuICAgIGxldCByZXQgPSBNYXRoLmF0YW4yKC15LCB4KTtcblxuICAgIHJldHVybiAocmV0ICsgUEkyKSAlIFBJMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNxdWFyZWREaXN0YW5jZShwb3NpdGlvbjE6IFZlY3RvcjMsIHBvc2l0aW9uMjogVmVjdG9yMyk6IG51bWJlciB7XG4gICAgbGV0IHggPSBwb3NpdGlvbjEueCAtIHBvc2l0aW9uMi54LFxuICAgICAgICB5ID0gcG9zaXRpb24xLnkgLSBwb3NpdGlvbjIueSxcbiAgICAgICAgeiA9IHBvc2l0aW9uMS56IC0gcG9zaXRpb24yLno7XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkc1RvT3J0aG8oY2FtZXJhOiBDYW1lcmEsIHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKFxuICAgICAgICB4IC0gY2FtZXJhLnNjcmVlblNpemUueCAvIDIuMCxcbiAgICAgICAgKGNhbWVyYS5zY3JlZW5TaXplLnkgLyAyLjApIC0geSxcbiAgICAgICAgMC4wXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kVXBQb3dlck9mMih4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGxldCByZXQgPSAyO1xuXG4gICAgd2hpbGUgKHJldCA8IHgpIHtcbiAgICAgICAgcmV0ICo9IDI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh0dHBSZXF1ZXN0KHVybDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBsZXQgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgaHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGh0dHAucmVhZHlTdGF0ZSA9PSA0ICYmIGh0dHAuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2soaHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGh0dHAuc2VuZCgpO1xufSIsImltcG9ydCBDb2xsaXNpb24gZnJvbSAnLi9Db2xsaXNpb24nO1xuaW1wb3J0IENvbG9yTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL0NvbG9yTWF0ZXJpYWwnO1xuaW1wb3J0IEN1YmVHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeSc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xuaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcbmltcG9ydCBJbnN0YW5jZSBmcm9tICcuLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5cbmNsYXNzIEJveENvbGxpc2lvbiBleHRlbmRzIENvbGxpc2lvbiB7XG4gICAgcHJpdmF0ZSBfc2l6ZSAgICAgICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJpdmF0ZSBfYm94ICAgICAgICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG5cbiAgICBwdWJsaWMgaXNEeW5hbWljICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcbiAgICBcblxuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBWZWN0b3IzLCBzaXplOiBWZWN0b3IzKSB7XG4gICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgICAgICB0aGlzLmlzRHluYW1pYyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX3JlY2FsYygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Jlb3JkZXJCb3goYm94OiBBcnJheTxudW1iZXI+KTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGZvciAobGV0IGk9MDtpPDM7aSsrKSB7XG4gICAgICAgICAgICBpZiAoYm94WzMraV0gPCBib3hbMCtpXSkge1xuICAgICAgICAgICAgICAgIGxldCBoID0gYm94WzAraV07XG4gICAgICAgICAgICAgICAgYm94WzAraV0gPSBib3hbMytpXTtcbiAgICAgICAgICAgICAgICBib3hbMytpXSA9IGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm94O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2JveENvbGxpc2lvbihib3g6IEFycmF5PG51bWJlcj4pOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGIgPSB0aGlzLl9ib3g7XG5cbiAgICAgICAgaWYgKGJveFswXSA+PSBiWzNdIHx8IGJveFsxXSA+PSBiWzRdIHx8IGJveFsyXSA+PSBiWzVdIHx8IGJveFszXSA8IGJbMF0gfHwgYm94WzRdIDwgYlsxXSB8fCBib3hbNV0gPCBiWzJdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWNhbGMoKTogdm9pZCB7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uLFxuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuX3NpemU7XG5cbiAgICAgICAgbGV0IHB4ID0gcG9zaXRpb24ueCArIHRoaXMuX29mZnNldC54LFxuICAgICAgICAgICAgcHkgPSBwb3NpdGlvbi55ICsgdGhpcy5fb2Zmc2V0LnksXG4gICAgICAgICAgICBweiA9IHBvc2l0aW9uLnogKyB0aGlzLl9vZmZzZXQueixcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ggPSBzaXplLnggLyAyLFxuICAgICAgICAgICAgc3kgPSBzaXplLnkgLyAyLFxuICAgICAgICAgICAgc3ogPSBzaXplLnogLyAyO1xuXG4gICAgICAgIHRoaXMuX2JveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3B4IC0gc3gsIHB5IC0gc3ksIHB6IC0gc3osIHB4ICsgc3gsIHB5ICsgc3ksIHB6ICsgc3pdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdGVzdChwb3NpdGlvbjogVmVjdG9yMywgZGlyZWN0aW9uOiBWZWN0b3IzKTogVmVjdG9yMyB7XG4gICAgICAgIGlmICh0aGlzLmlzRHluYW1pYykge1xuICAgICAgICAgICAgdGhpcy5fcmVjYWxjKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29sbGlkZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHdpZHRoID0gMC4zLFxuICAgICAgICAgICAgaGVpZ2h0ID0gMC44LFxuICAgICAgICAgICAgeCA9IHBvc2l0aW9uLngsXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueSxcbiAgICAgICAgICAgIHogPSBwb3NpdGlvbi56LFxuICAgICAgICAgICAgeFRvID0gZGlyZWN0aW9uLngsXG4gICAgICAgICAgICB6VG8gPSBkaXJlY3Rpb24ueixcbiAgICAgICAgICAgIHNpZ24gPSAoZGlyZWN0aW9uLnggPiAwKT8gMSA6IC0xLFxuICAgICAgICAgICAgYm94ID0gdGhpcy5fcmVvcmRlckJveChbeCAtIHdpZHRoICogc2lnbiwgeSwgeiAtIHdpZHRoLCB4ICsgd2lkdGggKiBzaWduICsgZGlyZWN0aW9uLngsIHkgKyBoZWlnaHQsIHogKyB3aWR0aF0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9ib3hDb2xsaXNpb24oYm94KSkge1xuICAgICAgICAgICAgeFRvID0gMDtcbiAgICAgICAgICAgIGNvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHggKz0geFRvO1xuICAgICAgICBcbiAgICAgICAgc2lnbiA9IChkaXJlY3Rpb24ueiA+IDApPyAxIDogLTE7XG4gICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCwgeSwgeiAtIHdpZHRoICogc2lnbiwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGggKiBzaWduICsgZGlyZWN0aW9uLnpdKTtcbiAgICAgICAgaWYgKHRoaXMuX2JveENvbGxpc2lvbihib3gpKSB7XG4gICAgICAgICAgICB6VG8gPSAwO1xuICAgICAgICAgICAgY29sbGlkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb2xsaWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zb2xpZCkge1xuICAgICAgICAgICAgZGlyZWN0aW9uLnNldCh4VG8sIDAsIHpUbyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRDb2xsaXNpb25JbnN0YW5jZSgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IEN1YmVHZW9tZXRyeSh0aGlzLl9zaXplLngsIHRoaXMuX3NpemUueSwgdGhpcy5fc2l6ZS56KSxcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IENvbG9yTWF0ZXJpYWwobmV3IFZlY3RvcjQoMC4wLCAxLjAsIDAuMCwgMC41KSksXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iamVjdCA9IG5ldyBJbnN0YW5jZShnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXG4gICAgICAgIG1hdGVyaWFsLnNldE9wYXF1ZShmYWxzZSk7XG5cbiAgICAgICAgb2JqZWN0LnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG5cbiAgICAgICAgZ2VvbWV0cnkub2Zmc2V0ID0gdGhpcy5fb2Zmc2V0O1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZEdhbWVPYmplY3Qob2JqZWN0KTtcblxuICAgICAgICB0aGlzLl9kaXNwbGF5SW5zdGFuY2UgPSBvYmplY3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGNlbnRlckluQXhpcyh4OiBib29sZWFuLCB5OiBib29sZWFuLCB6OiBib29sZWFuKTogQm94Q29sbGlzaW9uIHtcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnggPSAoIXgpPyB0aGlzLl9zaXplLnggLyAyIDogMDtcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnkgPSAoIXkpPyB0aGlzLl9zaXplLnkgLyAyIDogMDtcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnogPSAoIXopPyB0aGlzLl9zaXplLnogLyAyIDogMDtcblxuICAgICAgICB0aGlzLl9yZWNhbGMoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm94Q29sbGlzaW9uOyIsImltcG9ydCBTY2VuZSBmcm9tICcuLi9TY2VuZSc7XG5pbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi4vZW50aXRpZXMvSW5zdGFuY2UnO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5cbmFic3RyYWN0IGNsYXNzIENvbGxpc2lvbiB7XG4gICAgcHJvdGVjdGVkIF9zY2VuZSAgICAgICAgICAgICAgICA6IFNjZW5lO1xuICAgIHByb3RlY3RlZCBfaW5zdGFuY2UgICAgICAgICAgICAgOiBJbnN0YW5jZTtcbiAgICBwcm90ZWN0ZWQgX3Bvc2l0aW9uICAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwcm90ZWN0ZWQgX29mZnNldCAgICAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwcm90ZWN0ZWQgX2Rpc3BsYXlJbnN0YW5jZSAgICAgIDogSW5zdGFuY2U7XG5cbiAgICBwdWJsaWMgc29saWQgICAgICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBTY2VuZSkge1xuICAgICAgICB0aGlzLnNldFNjZW5lKHNjZW5lKTtcbiAgICAgICAgdGhpcy5zb2xpZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fb2Zmc2V0ID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IHRlc3QocG9zaXRpb246IFZlY3RvcjMsIGRpcmVjdGlvbjogVmVjdG9yMykgOiBWZWN0b3IzO1xuXG4gICAgcHVibGljIHNldFNjZW5lKHNjZW5lOiBTY2VuZSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnN0YW5jZShpbnN0YW5jZTogSW5zdGFuY2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQ29sbGlzaW9uSW5zdGFuY2UocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIHJlbmRlcmVyO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGluc3RhbmNlKCk6IEluc3RhbmNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGlzcGxheUluc3RhbmNlKCk6IEluc3RhbmNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc3BsYXlJbnN0YW5jZTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbGxpc2lvbjsiLCJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9DYW1lcmEnO1xuaW1wb3J0IFNjZW5lIGZyb20gJy4uL1NjZW5lJztcbmltcG9ydCBDb2xsaXNpb24gZnJvbSAnLi4vY29sbGlzaW9ucy9Db2xsaXNpb24nO1xuaW1wb3J0IEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvR2VvbWV0cnknO1xuaW1wb3J0IE1hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9NYXRlcmlhbCc7XG5pbXBvcnQgU2hhZGVyIGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi4vQ29tcG9uZW50JztcbmltcG9ydCBNYXRyaXg0IGZyb20gJy4uL21hdGgvTWF0cml4NCc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xuaW1wb3J0IHsgZ2V0MkRBbmdsZSB9IGZyb20gJy4uL1V0aWxzJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi4vQ29uZmlnJztcbmltcG9ydCBMaXN0IGZyb20gJy4uL0xpc3QnO1xuXG5jbGFzcyBJbnN0YW5jZSB7XG4gICAgcHJvdGVjdGVkIF9nZW9tZXRyeSAgICAgICAgICAgOiBHZW9tZXRyeTtcbiAgICBwcm90ZWN0ZWQgX21hdGVyaWFsICAgICAgICAgICA6IE1hdGVyaWFsO1xuICAgIHByb3RlY3RlZCBfcm90YXRpb24gICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwcm90ZWN0ZWQgX3RyYW5zZm9ybSAgICAgICAgICA6IE1hdHJpeDQ7XG4gICAgcHJvdGVjdGVkIF9zY2VuZSAgICAgICAgICAgICAgOiBTY2VuZTtcbiAgICBwcm90ZWN0ZWQgX2NvbXBvbmVudHMgICAgICAgICA6IExpc3Q8Q29tcG9uZW50PjtcbiAgICBwcm90ZWN0ZWQgX2NvbGxpc2lvbiAgICAgICAgICA6IENvbGxpc2lvbjtcbiAgICBwcm90ZWN0ZWQgX25lZWRzVXBkYXRlICAgICAgICA6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIF9kZXN0cm95ZWQgICAgICAgICAgOiBib29sZWFuO1xuICAgIFxuICAgIHB1YmxpYyBwb3NpdGlvbiAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwdWJsaWMgaXNCaWxsYm9hcmQgICAgICAgICA6IGJvb2xlYW47XG4gICAgXG4gICAgY29uc3RydWN0b3IoZ2VvbWV0cnk6IEdlb21ldHJ5ID0gbnVsbCwgbWF0ZXJpYWw6IE1hdGVyaWFsID0gbnVsbCkge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSBNYXRyaXg0LmNyZWF0ZUlkZW50aXR5KCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLjApO1xuICAgICAgICB0aGlzLl9yb3RhdGlvbiA9IG5ldyBWZWN0b3IzKDAuMCk7XG4gICAgICAgIHRoaXMuaXNCaWxsYm9hcmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG1hdGVyaWFsO1xuICAgICAgICB0aGlzLl9zY2VuZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBuZXcgTGlzdCgpO1xuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBudWxsO1xuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRyYW5zbGF0ZSh4OiBudW1iZXJ8VmVjdG9yMywgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IEluc3RhbmNlIHtcbiAgICAgICAgbGV0IF94OiBudW1iZXI7XG5cbiAgICAgICAgaWYgKCg8VmVjdG9yMz54KS5sZW5ndGgpIHtcbiAgICAgICAgICAgIF94ID0gKDxWZWN0b3IzPngpLng7XG4gICAgICAgICAgICB5ID0gKDxWZWN0b3IzPngpLnk7XG4gICAgICAgICAgICB6ID0gKDxWZWN0b3IzPngpLno7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfeCA9IDxudW1iZXI+eDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQoX3gsIHksIHopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoX3gsIHksIHopO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgdGhpcy5fY29sbGlzaW9uLmRpc3BsYXlJbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRpc3BsYXlJbnN0YW5jZS50cmFuc2xhdGUoeCwgeSwgeiwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJvdGF0ZSh4OiBudW1iZXJ8VmVjdG9yMywgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IEluc3RhbmNlIHtcbiAgICAgICAgbGV0IF94OiBudW1iZXI7XG4gICAgICAgIFxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xuICAgICAgICAgICAgX3ggPSAoPFZlY3RvcjM+eCkueDtcbiAgICAgICAgICAgIHkgPSAoPFZlY3RvcjM+eCkueTtcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF94ID0gPG51bWJlcj54O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3JvdGF0aW9uLmFkZChfeCwgeSwgeik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yb3RhdGlvbi5zZXQoX3gsIHksIHopO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0U2NlbmUoc2NlbmU6IFNjZW5lKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NjZW5lID0gc2NlbmU7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgY29tcG9uZW50LmFkZEluc3RhbmNlKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb21wb25lbnQ8VD4oY29tcG9uZW50TmFtZTogc3RyaW5nKTogVCB7XG4gICAgICAgIGZvciAobGV0IGk9MCxjb21wO2NvbXA9dGhpcy5fY29tcG9uZW50cy5nZXRBdChpKTtpKyspIHtcbiAgICAgICAgICAgIGlmIChjb21wLm5hbWUgPT0gY29tcG9uZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiA8VD4oPGFueT5jb21wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0VHJhbnNmb3JtYXRpb24oKTogTWF0cml4NCB7XG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0SWRlbnRpdHkoKTtcblxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkoTWF0cml4NC5jcmVhdGVYUm90YXRpb24odGhpcy5fcm90YXRpb24ueCkpO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkoTWF0cml4NC5jcmVhdGVaUm90YXRpb24odGhpcy5fcm90YXRpb24ueikpO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkoTWF0cml4NC5jcmVhdGVZUm90YXRpb24odGhpcy5fcm90YXRpb24ueSkpO1xuXG4gICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLl9nZW9tZXRyeS5vZmZzZXQ7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS50cmFuc2xhdGUodGhpcy5wb3NpdGlvbi54ICsgb2Zmc2V0LngsIHRoaXMucG9zaXRpb24ueSArIG9mZnNldC55LCB0aGlzLnBvc2l0aW9uLnogKyBvZmZzZXQueik7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb2xsaXNpb24oY29sbGlzaW9uOiBDb2xsaXNpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY29sbGlzaW9uID0gY29sbGlzaW9uO1xuICAgICAgICBjb2xsaXNpb24uc2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5fcm90YXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0SWRlbnRpdHkoKTtcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSBudWxsO1xuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNCaWxsYm9hcmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zY2VuZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fY29sbGlzaW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXdha2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuZWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5hd2FrZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5fY29sbGlzaW9uICYmIENvbmZpZy5ESVNQTEFZX0NPTExJU0lPTlMpIHtcbiAgICAgICAgICAgIGxldCBjb2xsaXNpb24gPSB0aGlzLl9jb2xsaXNpb247XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbi5zZXRTY2VuZSh0aGlzLl9zY2VuZSk7XG4gICAgICAgICAgICAvLyBjb2xsaXNpb24uYWRkQ29sbGlzaW9uSW5zdGFuY2UodGhpcy5fcmVuZGVyZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cy5lYWNoKChjb21wb25lbnQ6IENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cy5lYWNoKChjb21wb25lbnQ6IENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50LmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkuZGVzdHJveSgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgQ29uZmlnLkRJU1BMQVlfQ09MTElTSU9OUykge1xuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZ2VvbWV0cnkgfHwgIXRoaXMuX21hdGVyaWFsKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAoIXRoaXMuX21hdGVyaWFsLmlzUmVhZHkpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgcmVuZGVyZXIuc3dpdGNoU2hhZGVyKHRoaXMuX21hdGVyaWFsLnNoYWRlck5hbWUpO1xuXG4gICAgICAgIGNvbnN0IGdsID0gcmVuZGVyZXIuR0wsXG4gICAgICAgICAgICBzaGFkZXIgPSBTaGFkZXIubGFzdFByb2dyYW07XG5cbiAgICAgICAgaWYgKHRoaXMuaXNCaWxsYm9hcmQpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRlKDAsIGdldDJEQW5nbGUodGhpcy5wb3NpdGlvbiwgY2FtZXJhLnBvc2l0aW9uKSArIE1hdGguUEkgLyAyLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVQb3NpdGlvbiA9IE1hdHJpeDQuY3JlYXRlSWRlbnRpdHkoKTtcbiAgICAgICAgdVBvc2l0aW9uLm11bHRpcGx5KHRoaXMuZ2V0VHJhbnNmb3JtYXRpb24oKSk7XG4gICAgICAgIHVQb3NpdGlvbi5tdWx0aXBseShjYW1lcmEuZ2V0VHJhbnNmb3JtYXRpb24oKSk7XG4gICAgICAgIFxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtc1tcInVQcm9qZWN0aW9uXCJdLCBmYWxzZSwgY2FtZXJhLnByb2plY3Rpb24uZGF0YSk7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zW1widVBvc2l0aW9uXCJdLCBmYWxzZSwgdVBvc2l0aW9uLmRhdGEpO1xuXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnJlbmRlcihyZW5kZXJlcik7XG5cbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkucmVuZGVyKHJlbmRlcmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGdlb21ldHJ5KCk6IEdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IG1hdGVyaWFsKCk6IE1hdGVyaWFsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hdGVyaWFsO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uKCk6IFZlY3RvcjMge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm90YXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb2xsaXNpb24oKTogQ29sbGlzaW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxpc2lvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNjZW5lKCk6IFNjZW5lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjZW5lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNEZXN0cm95ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZXN0cm95ZWQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnN0YW5jZTsiLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcbmltcG9ydCBCYXNpY01hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9CYXNpY01hdGVyaWFsJztcbmltcG9ydCBXYWxsR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9XYWxsR2VvbWV0cnknO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCB7IHJvdW5kVXBQb3dlck9mMiB9IGZyb20gJy4uL1V0aWxzJztcbmltcG9ydCBJbnN0YW5jZSBmcm9tICcuLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGV4dE9wdGlvbnMge1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgc3Ryb2tlPzogYm9vbGVhbjtcbiAgICBmaWxsPzogYm9vbGVhbjtcbiAgICBmaWxsQ29sb3I/OiBzdHJpbmc7XG4gICAgc3Ryb2tlQ29sb3I/OiBzdHJpbmc7XG4gICAgcG9zaXRpb24/OiBWZWN0b3IzO1xuICAgIHJvdGF0aW9uPzogVmVjdG9yMztcbn1cblxuY29uc3QgT3B0aW9uc0RlZmF1bHQ6IFRleHRPcHRpb25zID0ge1xuICAgIHNpemU6IDEyLFxuICAgIHN0cm9rZTogZmFsc2UsXG4gICAgZmlsbDogdHJ1ZSxcbiAgICBmaWxsQ29sb3I6ICcjRkZGRkZGJyxcbiAgICBzdHJva2VDb2xvcjogJyNGRkZGRkYnLFxuICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMygwLjAsIDAuMCwgMC4wKSxcbiAgICByb3RhdGlvbjogbmV3IFZlY3RvcjMoMC4wLCAwLjAsIDAuMClcbn07XG5cbmNsYXNzIFRleHQgZXh0ZW5kcyBJbnN0YW5jZSB7XG4gICAgcHJpdmF0ZSBfdGV4dCAgICAgICAgICAgICAgIDogc3RyaW5nO1xuICAgIHByaXZhdGUgX2ZvbnQgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwcml2YXRlIF9vcHRpb25zICAgICAgICAgICAgOiBUZXh0T3B0aW9ucztcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZywgb3B0aW9ucz86IFRleHRPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fdGV4dCA9IHRleHQ7XG4gICAgICAgIHRoaXMuX2ZvbnQgPSBmb250O1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gdGhpcy5fbWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX3ByaW50VGV4dCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX21lcmdlT3B0aW9ucyhvcHRpb25zOiBUZXh0T3B0aW9ucyk6IFRleHRPcHRpb25zIHtcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7IHJldHVybiBPcHRpb25zRGVmYXVsdDsgfVxuXG4gICAgICAgIGlmICghb3B0aW9ucy5zaXplKSB7IG9wdGlvbnMuc2l6ZSA9IE9wdGlvbnNEZWZhdWx0LnNpemU7IH1cbiAgICAgICAgaWYgKCFvcHRpb25zLnN0cm9rZSkgeyBvcHRpb25zLnN0cm9rZSA9IE9wdGlvbnNEZWZhdWx0LnN0cm9rZTsgfVxuICAgICAgICBpZiAoIW9wdGlvbnMuZmlsbCkgeyBvcHRpb25zLmZpbGwgPSBPcHRpb25zRGVmYXVsdC5maWxsOyB9XG4gICAgICAgIGlmICghb3B0aW9ucy5maWxsQ29sb3IpIHsgb3B0aW9ucy5maWxsQ29sb3IgPSBPcHRpb25zRGVmYXVsdC5maWxsQ29sb3I7IH1cbiAgICAgICAgaWYgKCFvcHRpb25zLnN0cm9rZUNvbG9yKSB7IG9wdGlvbnMuc3Ryb2tlQ29sb3IgPSBPcHRpb25zRGVmYXVsdC5zdHJva2VDb2xvcjsgfVxuICAgICAgICBpZiAoIW9wdGlvbnMucG9zaXRpb24pIHsgb3B0aW9ucy5wb3NpdGlvbiA9IE9wdGlvbnNEZWZhdWx0LnBvc2l0aW9uOyB9XG4gICAgICAgIGlmICghb3B0aW9ucy5yb3RhdGlvbikgeyBvcHRpb25zLnJvdGF0aW9uID0gT3B0aW9uc0RlZmF1bHQucm90YXRpb247IH1cblxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9wcmludFRleHQoKTogdm9pZCB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLFxuICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgICBjdHguZm9udCA9IHRoaXMuX29wdGlvbnMuc2l6ZSArIFwicHggXCIgKyB0aGlzLl9mb250O1xuICAgICAgICBcbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC5vSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICBsZXQgc2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLl90ZXh0KTtcblxuICAgICAgICBjYW52YXMud2lkdGggPSByb3VuZFVwUG93ZXJPZjIoc2l6ZS53aWR0aCk7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSByb3VuZFVwUG93ZXJPZjIodGhpcy5fb3B0aW9ucy5zaXplKTtcbiAgICAgICAgY3R4LmZvbnQgPSB0aGlzLl9vcHRpb25zLnNpemUgKyBcInB4IFwiICsgdGhpcy5fZm9udDtcblxuICAgICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4Lm9JbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmZpbGwpIHtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLl9vcHRpb25zLmZpbGxDb2xvcjtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLl90ZXh0LCA0LCB0aGlzLl9vcHRpb25zLnNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc3Ryb2tlKSB7XG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLl9vcHRpb25zLnN0cm9rZUNvbG9yO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVRleHQodGhpcy5fdGV4dCwgNCwgdGhpcy5fb3B0aW9ucy5zaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1dnMgPSBbMCwgMCwgKHNpemUud2lkdGggKyA0KSAvIGNhbnZhcy53aWR0aCwgKHRoaXMuX29wdGlvbnMuc2l6ZSArIDgpIC8gY2FudmFzLmhlaWdodF0sXG4gICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoY2FudmFzKSxcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IEJhc2ljTWF0ZXJpYWwodGV4dHVyZSksXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBXYWxsR2VvbWV0cnkoc2l6ZS53aWR0aCAvIDEwMCwgdGhpcy5fb3B0aW9ucy5zaXplIC8gMTAwKTtcblxuICAgICAgICBtYXRlcmlhbC5zZXRVdih1dnNbMF0sIHV2c1sxXSwgdXZzWzJdLCB1dnNbM10pO1xuICAgICAgICBtYXRlcmlhbC5zZXRPcGFxdWUoZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuX21hdGVyaWFsID0gbWF0ZXJpYWw7ICAgICAgICBcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSBnZW9tZXRyeTtcblxuICAgICAgICB0aGlzLnRyYW5zbGF0ZSh0aGlzLl9vcHRpb25zLnBvc2l0aW9uLngsIHRoaXMuX29wdGlvbnMucG9zaXRpb24ueSwgdGhpcy5fb3B0aW9ucy5wb3NpdGlvbi56KTtcbiAgICAgICAgdGhpcy5yb3RhdGUodGhpcy5fb3B0aW9ucy5yb3RhdGlvbi54LCB0aGlzLl9vcHRpb25zLnJvdGF0aW9uLnksIHRoaXMuX29wdGlvbnMucm90YXRpb24ueik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcblxuY2xhc3MgQ3ViZUdlb21ldHJ5IGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX2J1aWxkQ3ViZSh3aWR0aCwgaGVpZ2h0LCBsZW5ndGgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2J1aWxkQ3ViZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHcgPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGwgPSBsZW5ndGggLyAyO1xuXG4gICAgICAgIC8vIEZyb250IGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgIGwpO1xuXG4gICAgICAgIC8vIEJhY2sgZmFjZVxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XG5cbiAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcblxuICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsIC1sKTtcblxuICAgICAgICAvLyBUb3AgZmFjZVxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAtbCk7XG5cbiAgICAgICAgLy8gQm90dG9tIGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgLWwpO1xuXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDY7aSsrKSB7XG4gICAgICAgICAgICBsZXQgaW5kID0gaSAqIDQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMik7XG4gICAgICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKGluZCArIDEsIGluZCArIDMsIGluZCArIDIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMS4wKTtcbiAgICAgICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAxLjApO1xuICAgICAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMC4wKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3ViZUdlb21ldHJ5OyIsImltcG9ydCB7IFZFUlRJQ0VfU0laRSwgVEVYQ09PUkRfU0laRSB9IGZyb20gJy4uL0NvbnN0YW50cyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xuXG5pbnRlcmZhY2UgQnVmZmVyTWFwIHtcbiAgICB2ZXJ0ZXhCdWZmZXI/ICAgICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICB0ZXhDb29yZHNCdWZmZXI/ICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICBpbmRleEJ1ZmZlcj8gICAgICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICBnbENvbnRleHQgICAgICAgICAgICAgICAgICAgOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG59XG5cbmludGVyZmFjZSBSZW5kZXJlckJ1ZmZlck1hcCB7XG4gICAgW2luZGV4OiBzdHJpbmddIDogQnVmZmVyTWFwO1xufVxuXG5jbGFzcyBHZW9tZXRyeSB7XG4gICAgcHJpdmF0ZSBfdmVydGljZXMgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuICAgIHByaXZhdGUgX3RyaWFuZ2xlcyAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwcml2YXRlIF90ZXhDb29yZHMgICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgcHJpdmF0ZSBfYnVmZmVycyAgICAgICAgICAgICAgICAgOiBSZW5kZXJlckJ1ZmZlck1hcDtcbiAgICBwcml2YXRlIF9pbmRleExlbmd0aCAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF9ib3VuZGluZ0JveCAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgXG4gICAgcHVibGljIG9mZnNldCAgICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzID0gW107XG4gICAgICAgIHRoaXMuX3RleENvb3JkcyA9IFtdO1xuICAgICAgICB0aGlzLl90cmlhbmdsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fYnVmZmVycyA9IHt9O1xuICAgICAgICB0aGlzLl9ib3VuZGluZ0JveCA9IFtJbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eSwgLUluZmluaXR5XTtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkVmVydGljZSh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzLnB1c2goeCwgeSwgeik7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJvdW5kaW5nIGJveFxuICAgICAgICB0aGlzLl9ib3VuZGluZ0JveCA9IFtcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzBdLCB4KSxcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzFdLCB5KSxcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzJdLCB6KSxcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzNdLCB4KSxcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzRdLCB5KSxcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzVdLCB6KVxuICAgICAgICBdO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgYWRkVGV4Q29vcmQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdGV4Q29vcmRzLnB1c2goeCwgeSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFRyaWFuZ2xlKHZlcnQxOiBudW1iZXIsIHZlcnQyOiBudW1iZXIsIHZlcnQzOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQxICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDEgKyBcIl0gbm90IGZvdW5kIVwiKX1cbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQyICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDIgKyBcIl0gbm90IGZvdW5kIVwiKX1cbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQzICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDMgKyBcIl0gbm90IGZvdW5kIVwiKX1cblxuICAgICAgICB0aGlzLl90cmlhbmdsZXMucHVzaCh2ZXJ0MSwgdmVydDIsIHZlcnQzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYnVpbGQocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdsID0gcmVuZGVyZXIuR0wsXG4gICAgICAgICAgICBidWZmZXJNYXA6IEJ1ZmZlck1hcCA9IHsgZ2xDb250ZXh0OiBnbCB9O1xuXG4gICAgICAgIGJ1ZmZlck1hcC52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlck1hcC52ZXJ0ZXhCdWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLl92ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcblxuICAgICAgICBidWZmZXJNYXAudGV4Q29vcmRzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAudGV4Q29vcmRzQnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fdGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIGJ1ZmZlck1hcC5pbmRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAuaW5kZXhCdWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkodGhpcy5fdHJpYW5nbGVzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIHRoaXMuX2luZGV4TGVuZ3RoID0gdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9idWZmZXJzW3JlbmRlcmVyLmlkXSA9IGJ1ZmZlck1hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJCb3VuZEJveEF4aXMoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCk6IEdlb21ldHJ5IHtcbiAgICAgICAgaWYgKHggPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbMF0gPSAwO1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbM10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoeSA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFsxXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFs0XSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeiA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFsyXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFs1XSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLl9idWZmZXJzKXtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlck1hcCA9IHRoaXMuX2J1ZmZlcnNbaV0sXG4gICAgICAgICAgICAgICAgZ2wgPSBidWZmZXJNYXAuZ2xDb250ZXh0O1xuXG4gICAgICAgICAgICBnbC5kZWxldGVCdWZmZXIoYnVmZmVyTWFwLnZlcnRleEJ1ZmZlcik7XG4gICAgICAgICAgICBnbC5kZWxldGVCdWZmZXIoYnVmZmVyTWFwLnRleENvb3Jkc0J1ZmZlcik7XG4gICAgICAgICAgICBnbC5kZWxldGVCdWZmZXIoYnVmZmVyTWFwLmluZGV4QnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fYnVmZmVyc1tyZW5kZXJlci5pZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGQocmVuZGVyZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2wgPSByZW5kZXJlci5HTCxcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbSxcbiAgICAgICAgICAgIGJ1ZmZlck1hcCA9IHRoaXMuX2J1ZmZlcnNbcmVuZGVyZXIuaWRdO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAudmVydGV4QnVmZmVyKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlc1tcImFWZXJ0ZXhQb3NpdGlvblwiXSwgVkVSVElDRV9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICAgIGlmIChzaGFkZXIuYXR0cmlidXRlc1tcImFUZXhDb29yZHNcIl0pIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJNYXAudGV4Q29vcmRzQnVmZmVyKTtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXNbXCJhVGV4Q29vcmRzXCJdLCBURVhDT09SRF9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVyTWFwLmluZGV4QnVmZmVyKTtcblxuICAgICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCB0aGlzLl9pbmRleExlbmd0aCwgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYm91bmRpbmdCb3goKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ib3VuZGluZ0JveDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdlb21ldHJ5OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcblxuY2xhc3MgUGxhbmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX2J1aWxkUGxhbmUod2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYnVpbGRQbGFuZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgdyA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGggPSBoZWlnaHQgLyAyO1xuXG4gICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIDAsICBoKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgMCwgIGgpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICAwLCAtaCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIDAsIC1oKTtcblxuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDAsIDEsIDIpO1xuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDEsIDMsIDIpO1xuXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xuICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMS4wKTtcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhbmVHZW9tZXRyeTsiLCJpbXBvcnQgR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XG5cbmNsYXNzIFdhbGxHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX2J1aWxkV2FsbCh3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9idWlsZFdhbGwod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHcgPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMjtcblxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgMCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICAwKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgIDApO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgMCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDAsIDEsIDIpO1xuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDEsIDMsIDIpO1xuXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xuICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMS4wKTtcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FsbEdlb21ldHJ5OyIsImV4cG9ydCB7IGRlZmF1bHQgYXMgUmVuZGVyZXIgfSBmcm9tICcuL1JlbmRlcmVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ2FtZXJhIH0gZnJvbSAnLi9DYW1lcmEnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb21wb25lbnQgfSBmcm9tICcuL0NvbXBvbmVudCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbmZpZyB9IGZyb20gJy4vQ29uZmlnJztcbmV4cG9ydCAqIGZyb20gJy4vQ29uc3RhbnRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5wdXQgfSBmcm9tICcuL0lucHV0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTGlzdCB9IGZyb20gJy4vTGlzdCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFJlbmRlcmluZ0xheWVyIH0gZnJvbSAnLi9SZW5kZXJpbmdMYXllcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjZW5lIH0gZnJvbSAnLi9TY2VuZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFRleHR1cmUgfSBmcm9tICcuL1RleHR1cmUnO1xuZXhwb3J0ICogZnJvbSAnLi9VdGlscyc7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQm94Q29sbGlzaW9uIH0gZnJvbSAnLi9jb2xsaXNpb25zL0JveENvbGxpc2lvbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbGxpc2lvbiB9IGZyb20gJy4vY29sbGlzaW9ucy9Db2xsaXNpb24nO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIEluc3RhbmNlIH0gZnJvbSAnLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFRleHQgfSBmcm9tICcuL2VudGl0aWVzL1RleHQnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIEN1YmVHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9DdWJlR2VvbWV0cnknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGFuZUdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyaWVzL1BsYW5lR2VvbWV0cnknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBXYWxsR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvR2VvbWV0cnknO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJhc2ljTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFscy9CYXNpY01hdGVyaWFsJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29sb3JNYXRlcmlhbCB9IGZyb20gJy4vbWF0ZXJpYWxzL0NvbG9yTWF0ZXJpYWwnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNYXRlcmlhbCB9IGZyb20gJy4vbWF0ZXJpYWxzL01hdGVyaWFsJztcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBNYXRyaXg0IH0gZnJvbSAnLi9tYXRoL01hdHJpeDQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWZWN0b3IzIH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWZWN0b3I0IH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjQnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoYWRlciB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXInO1xuZXhwb3J0IHsgU2hhZGVyU3RydWN0LCBTaGFkZXJNYXAsIFNoYWRlcnNOYW1lcyB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXJTdHJ1Y3QnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBCYXNpYyB9IGZyb20gJy4vc2hhZGVycy9CYXNpYyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbG9yIH0gZnJvbSAnLi9zaGFkZXJzL0NvbG9yJzsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xuXG5jbGFzcyBCYXNpY01hdGVyaWFsIGV4dGVuZHMgTWF0ZXJpYWwge1xuICAgIHByaXZhdGUgX3RleHR1cmUgICAgICAgICA6IFRleHR1cmU7XG4gICAgcHJpdmF0ZSBfdXYgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwcml2YXRlIF9yZXBlYXQgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogVGV4dHVyZSkge1xuICAgICAgICBzdXBlcihcIkJBU0lDXCIpO1xuXG4gICAgICAgIHRoaXMuX3RleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB0aGlzLl91diA9IFswLjAsIDAuMCwgMS4wLCAxLjBdO1xuICAgICAgICB0aGlzLl9yZXBlYXQgPSBbMS4wLCAxLjBdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRVdih4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXYgPSBbeCwgeSwgdywgaF07XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzZXRSZXBlYXQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVwZWF0ID0gW3gsIHldO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIGlmIChNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPT0gdGhpcykgeyByZXR1cm47IH1cblxuICAgICAgICBjb25zdCBnbCA9IHJlbmRlcmVyLkdMLFxuICAgICAgICAgICAgc2hhZGVyID0gU2hhZGVyLmxhc3RQcm9ncmFtO1xuXG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLl90ZXh0dXJlLmdldFRleHR1cmUocmVuZGVyZXIpKTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHNoYWRlci51bmlmb3Jtc1tcInVUZXh0dXJlXCJdLCAwKTtcblxuICAgICAgICBnbC51bmlmb3JtNGZ2KHNoYWRlci51bmlmb3Jtc1tcInVVVlwiXSwgdGhpcy5fdXYpO1xuICAgICAgICBnbC51bmlmb3JtMmZ2KHNoYWRlci51bmlmb3Jtc1tcInVSZXBlYXRcIl0sIHRoaXMuX3JlcGVhdCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cblxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RleHR1cmUuaXNSZWFkeTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHRleHR1cmUoKTogVGV4dHVyZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0dXJlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWNNYXRlcmlhbDsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XG5cbmNsYXNzIENvbG9yTWF0ZXJpYWwgZXh0ZW5kcyBNYXRlcmlhbCB7XG4gICAgcHJpdmF0ZSBfY29sb3IgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcblxuICAgIGNvbnN0cnVjdG9yKGNvbG9yOiBWZWN0b3I0KSB7XG4gICAgICAgIHN1cGVyKFwiQ09MT1JcIik7XG5cbiAgICAgICAgdGhpcy5fY29sb3IgPSBjb2xvci50b0FycmF5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKE1hdGVyaWFsLmxhc3RSZW5kZXJlZCA9PSB0aGlzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBnbCA9IHJlbmRlcmVyLkdMLFxuICAgICAgICAgICAgc2hhZGVyID0gU2hhZGVyLmxhc3RQcm9ncmFtO1xuXG4gICAgICAgIGdsLnVuaWZvcm00ZnYoc2hhZGVyLnVuaWZvcm1zW1widUNvbG9yXCJdLCB0aGlzLl9jb2xvcik7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cblxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb2xvck1hdGVyaWFsOyIsImltcG9ydCB7IFNoYWRlcnNOYW1lcyB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcbmltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuLi9VdGlscyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuXG5hYnN0cmFjdCBjbGFzcyBNYXRlcmlhbCB7XG4gICAgcHJvdGVjdGVkIF9pc09wYXF1ZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIF9yZW5kZXJCb3RoRmFjZXMgICAgICAgICA6IGJvb2xlYW47XG4gICAgXG4gICAgcHVibGljIHJlYWRvbmx5IHNoYWRlck5hbWUgICAgICAgIDogU2hhZGVyc05hbWVzO1xuICAgIHB1YmxpYyByZWFkb25seSB1dWlkICAgICAgICAgICAgICA6IHN0cmluZztcblxuICAgIHB1YmxpYyBzdGF0aWMgbGFzdFJlbmRlcmVkICAgICAgICA6IE1hdGVyaWFsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHNoYWRlck5hbWU6IFNoYWRlcnNOYW1lcykge1xuICAgICAgICB0aGlzLnNoYWRlck5hbWUgPSBzaGFkZXJOYW1lO1xuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMuX2lzT3BhcXVlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcmVuZGVyQm90aEZhY2VzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkO1xuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXQgaXNSZWFkeSgpOiBib29sZWFuO1xuXG4gICAgcHVibGljIGdldCBpc09wYXF1ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BhcXVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRPcGFxdWUob3BhcXVlOiBib29sZWFuKTogTWF0ZXJpYWwge1xuICAgICAgICB0aGlzLl9pc09wYXF1ZSA9IG9wYXF1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEN1bGxpbmcoYm90aEZhY2VzOiBib29sZWFuKTogTWF0ZXJpYWwge1xuICAgICAgICB0aGlzLl9yZW5kZXJCb3RoRmFjZXMgPSBib3RoRmFjZXM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWF0ZXJpYWw7IiwiaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcblxuY2xhc3MgTWF0cml4NCB7XG4gICAgcHVibGljIGRhdGEgICAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwdWJsaWMgaW5Vc2UgICAgICAgICAgICAgICAgOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBcnJheSgxNik7XG5cbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCAhPSAxNikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWF0cml4NCBuZWVkcyAxNiB2YWx1ZXMgdG8gYmUgY3JlYXRlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDE2O2krKykge1xuICAgICAgICAgICAgdGhpcy5kYXRhW2ldID0gdmFsdWVzW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldCguLi52YWx1ZXM6IEFycmF5PG51bWJlcj4pOiBNYXRyaXg0IHtcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hdHJpeDQgbmVlZHMgMTYgdmFsdWVzIHRvIGJlIGNyZWF0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IHZhbHVlc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBtdWx0aXBseShtYXRyaXhCOiBNYXRyaXg0KTogTWF0cml4NCB7XG4gICAgICAgIGxldCBUOiBBcnJheTxudW1iZXI+ID0gbWF0cml4Qi5kYXRhO1xuXG4gICAgICAgIGxldCBDMSA9IG5ldyBWZWN0b3I0KFRbMF0sIFRbNF0sIFRbOF0sIFRbMTJdKTtcbiAgICAgICAgbGV0IEMyID0gbmV3IFZlY3RvcjQoVFsxXSwgVFs1XSwgVFs5XSwgVFsxM10pO1xuICAgICAgICBsZXQgQzMgPSBuZXcgVmVjdG9yNChUWzJdLCBUWzZdLCBUWzEwXSwgVFsxNF0pO1xuICAgICAgICBsZXQgQzQgPSBuZXcgVmVjdG9yNChUWzNdLCBUWzddLCBUWzExXSwgVFsxNV0pO1xuXG4gICAgICAgIFQgPSB0aGlzLmRhdGE7XG4gICAgICAgIGxldCBSMSA9IG5ldyBWZWN0b3I0KFRbMF0sIFRbMV0sIFRbMl0sIFRbM10pO1xuICAgICAgICBsZXQgUjIgPSBuZXcgVmVjdG9yNChUWzRdLCBUWzVdLCBUWzZdLCBUWzddKTtcbiAgICAgICAgbGV0IFIzID0gbmV3IFZlY3RvcjQoVFs4XSwgVFs5XSwgVFsxMF0sIFRbMTFdKTtcbiAgICAgICAgbGV0IFI0ID0gbmV3IFZlY3RvcjQoVFsxMl0sIFRbMTNdLCBUWzE0XSwgVFsxNV0pO1xuXG4gICAgICAgIHRoaXMuc2V0KFxuICAgICAgICAgICAgVmVjdG9yNC5kb3QoUjEsIEMxKSwgVmVjdG9yNC5kb3QoUjEsIEMyKSwgVmVjdG9yNC5kb3QoUjEsIEMzKSwgVmVjdG9yNC5kb3QoUjEsIEM0KSxcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIyLCBDMSksIFZlY3RvcjQuZG90KFIyLCBDMiksIFZlY3RvcjQuZG90KFIyLCBDMyksIFZlY3RvcjQuZG90KFIyLCBDNCksXG4gICAgICAgICAgICBWZWN0b3I0LmRvdChSMywgQzEpLCBWZWN0b3I0LmRvdChSMywgQzIpLCBWZWN0b3I0LmRvdChSMywgQzMpLCBWZWN0b3I0LmRvdChSMywgQzQpLFxuICAgICAgICAgICAgVmVjdG9yNC5kb3QoUjQsIEMxKSwgVmVjdG9yNC5kb3QoUjQsIEMyKSwgVmVjdG9yNC5kb3QoUjQsIEMzKSwgVmVjdG9yNC5kb3QoUjQsIEM0KVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmFuc2xhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciA9IDAsIHJlbGF0aXZlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdICs9IHg7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdICs9IHk7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdICs9IHo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdID0geDtcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gPSB5O1xuICAgICAgICAgICAgdGhpcy5kYXRhWzE0XSA9IHo7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SWRlbnRpdHkoKTogTWF0cml4NCB7XG4gICAgICAgIHRoaXMuc2V0KFxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZXRJZGVudGl0eSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlSWRlbnRpdHkoKTogTWF0cml4NCB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZU9ydGhvKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB6bmVhcjogbnVtYmVyLCB6ZmFyOiBudW1iZXIpOiBNYXRyaXg0IHtcbiAgICAgICAgbGV0IGwgPSAtd2lkdGggLyAyLjAsXG4gICAgICAgICAgICByID0gd2lkdGggLyAyLjAsXG4gICAgICAgICAgICBiID0gLWhlaWdodCAvIDIuMCxcbiAgICAgICAgICAgIHQgPSBoZWlnaHQgLyAyLjAsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEEgPSAyLjAgLyAociAtIGwpLFxuICAgICAgICAgICAgQiA9IDIuMCAvICh0IC0gYiksXG4gICAgICAgICAgICBDID0gLTIgLyAoemZhciAtIHpuZWFyKSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgWCA9IC0ociArIGwpIC8gKHIgLSBsKSxcbiAgICAgICAgICAgIFkgPSAtKHQgKyBiKSAvICh0IC0gYiksXG4gICAgICAgICAgICBaID0gLSh6ZmFyICsgem5lYXIpIC8gKHpmYXIgLSB6bmVhcik7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgQSwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIEIsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCBDLCAwLFxuICAgICAgICAgICAgWCwgWSwgWiwgMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlUGVyc3BlY3RpdmUoZm92OiBudW1iZXIsIHJhdGlvOiBudW1iZXIsIHpuZWFyOiBudW1iZXIsIHpmYXI6IG51bWJlcik6IE1hdHJpeDQge1xuICAgICAgICBsZXQgUyA9IDEgLyBNYXRoLnRhbihmb3YgLyAyKSxcbiAgICAgICAgICAgIFIgPSBTICogcmF0aW8sXG4gICAgICAgICAgICBBID0gLSh6ZmFyKSAvICh6ZmFyIC0gem5lYXIpLFxuICAgICAgICAgICAgQiA9IC0oemZhciAqIHpuZWFyKSAvICh6ZmFyIC0gem5lYXIpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgUywgMCwgMCwgIDAsXG4gICAgICAgICAgICAwLCBSLCAwLCAgMCxcbiAgICAgICAgICAgIDAsIDAsIEEsIC0xLFxuICAgICAgICAgICAgMCwgMCwgQiwgIDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVRyYW5zbGF0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogTWF0cml4NCB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcbiAgICAgICAgICAgIHgsIHksIHosIDFcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVhSb3RhdGlvbihyYWRpYW5zOiBudW1iZXIpOiBNYXRyaXg0IHtcbiAgICAgICAgbGV0IEM6IG51bWJlciA9IE1hdGguY29zKHJhZGlhbnMpLFxuICAgICAgICAgICAgUzogbnVtYmVyID0gTWF0aC5zaW4ocmFkaWFucyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAgICAgICAgMCwgQywtUywgMCxcbiAgICAgICAgICAgICAwLCBTLCBDLCAwLFxuICAgICAgICAgICAgIDAsIDAsIDAsIDFcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVlSb3RhdGlvbihyYWRpYW5zOiBudW1iZXIpOiBNYXRyaXg0IHtcbiAgICAgICAgbGV0IEM6IG51bWJlciA9IE1hdGguY29zKHJhZGlhbnMpLFxuICAgICAgICAgICAgUzogbnVtYmVyID0gTWF0aC5zaW4ocmFkaWFucyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgIEMsIDAsLVMsIDAsXG4gICAgICAgICAgICAgMCwgMSwgMCwgMCxcbiAgICAgICAgICAgICBTLCAwLCBDLCAwLFxuICAgICAgICAgICAgIDAsIDAsIDAsIDFcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVpSb3RhdGlvbihyYWRpYW5zOiBudW1iZXIpOiBNYXRyaXg0IHtcbiAgICAgICAgbGV0IEM6IG51bWJlciA9IE1hdGguY29zKHJhZGlhbnMpLFxuICAgICAgICAgICAgUzogbnVtYmVyID0gTWF0aC5zaW4ocmFkaWFucyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgICAgIEMsLVMsIDAsIDAsXG4gICAgICAgICAgICAgUywgQywgMCwgMCxcbiAgICAgICAgICAgICAwLCAwLCAxLCAwLFxuICAgICAgICAgICAgIDAsIDAsIDAsIDFcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hdHJpeDQ7IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVjdG9yMyB7XG4gICAgcHJpdmF0ZSBfeCAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3kgICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF96ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgbmVlZHNVcGRhdGUgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgaW5Vc2UgICAgICAgICAgICAgICAgOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCkge1xuICAgICAgICB0aGlzLnNldCh4LCB5LCB6KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogVmVjdG9yMyB7XG4gICAgICAgIHRoaXMuc2V0KDAsIDAsIDApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFZlY3RvcjMge1xuICAgICAgICB0aGlzLl94ID0geDtcbiAgICAgICAgdGhpcy5feSA9IHk7XG4gICAgICAgIHRoaXMuX3ogPSB6O1xuXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFZlY3RvcjMge1xuICAgICAgICB0aGlzLl94ICs9IHg7XG4gICAgICAgIHRoaXMuX3kgKz0geTtcbiAgICAgICAgdGhpcy5feiArPSB6O1xuXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBtdWx0aXBseShudW06IG51bWJlcik6IFZlY3RvcjMge1xuICAgICAgICB0aGlzLl94ICo9IG51bTtcbiAgICAgICAgdGhpcy5feSAqPSBudW07XG4gICAgICAgIHRoaXMuX3ogKj0gbnVtO1xuXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yMyB7XG4gICAgICAgIGxldCBsID0gdGhpcy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5tdWx0aXBseSgxIC8gbCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGNsb25lKCk6IFZlY3RvcjMge1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjModGhpcy54LCB0aGlzLnksIHRoaXMueik7XG4gICAgfVxuXG4gICAgcHVibGljIGVxdWFscyh2ZWN0b3IzOiBWZWN0b3IzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy54ID09IHZlY3RvcjMueCAmJiB0aGlzLnkgPT0gdmVjdG9yMy55ICYmIHRoaXMueiA9PSB2ZWN0b3IzLnopO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feDsgfVxuICAgIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feTsgfVxuICAgIHB1YmxpYyBnZXQgeigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fejsgfVxuXG4gICAgcHVibGljIHNldCB4KHg6IG51bWJlcikgeyB0aGlzLl94ID0geDsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cbiAgICBwdWJsaWMgc2V0IHkoeTogbnVtYmVyKSB7IHRoaXMuX3kgPSB5OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuICAgIHB1YmxpYyBzZXQgeih6OiBudW1iZXIpIHsgdGhpcy5feiA9IHo7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICBpZiAoIXRoaXMubmVlZHNVcGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9sZW5ndGggPSBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56KTtcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9ICBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3Jvc3ModmVjdG9yQTogVmVjdG9yMywgdmVjdG9yQjogVmVjdG9yMyk6IFZlY3RvcjMge1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjMoXG4gICAgICAgICAgICB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnogLSB2ZWN0b3JBLnogKiB2ZWN0b3JCLnksXG4gICAgICAgICAgICB2ZWN0b3JBLnogKiB2ZWN0b3JCLnggLSB2ZWN0b3JBLnggKiB2ZWN0b3JCLnosXG4gICAgICAgICAgICB2ZWN0b3JBLnggKiB2ZWN0b3JCLnkgLSB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnhcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGRvdCh2ZWN0b3JBOiBWZWN0b3IzLCB2ZWN0b3JCOiBWZWN0b3IzKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHZlY3RvckEueCAqIHZlY3RvckIueCArIHZlY3RvckEueSAqIHZlY3RvckIueSArIHZlY3RvckEueiAqIHZlY3RvckIuejtcbiAgICB9XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVjdG9yNCB7XG4gICAgcHJpdmF0ZSBfeCAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3kgICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF96ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfdyAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2xlbmd0aCAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIG5lZWRzVXBkYXRlICAgICAgICAgOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2V0KHgsIHksIHosIHcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKTogVmVjdG9yNCB7XG4gICAgICAgIHRoaXMuX3ggPSB4O1xuICAgICAgICB0aGlzLl95ID0geTtcbiAgICAgICAgdGhpcy5feiA9IHo7XG4gICAgICAgIHRoaXMuX3cgPSB3O1xuXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKTogVmVjdG9yNCB7XG4gICAgICAgIHRoaXMuX3ggKz0geDtcbiAgICAgICAgdGhpcy5feSArPSB5O1xuICAgICAgICB0aGlzLl96ICs9IHo7XG4gICAgICAgIHRoaXMuX3cgKz0gdztcblxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgbXVsdGlwbHkobnVtOiBudW1iZXIpOiBWZWN0b3I0IHtcbiAgICAgICAgdGhpcy5feCAqPSBudW07XG4gICAgICAgIHRoaXMuX3kgKj0gbnVtO1xuICAgICAgICB0aGlzLl96ICo9IG51bTtcbiAgICAgICAgdGhpcy5fdyAqPSBudW07XG5cbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG5vcm1hbGl6ZSgpOiBWZWN0b3I0IHtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLm11bHRpcGx5KDEgLyBsKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRvQXJyYXkoKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53XTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feDsgfVxuICAgIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feTsgfVxuICAgIHB1YmxpYyBnZXQgeigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fejsgfVxuICAgIHB1YmxpYyBnZXQgdygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fdzsgfVxuICAgIFxuICAgIHB1YmxpYyBzZXQgeCh4OiBudW1iZXIpIHsgdGhpcy5feCA9IHg7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG4gICAgcHVibGljIHNldCB5KHk6IG51bWJlcikgeyB0aGlzLl95ID0geTsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cbiAgICBwdWJsaWMgc2V0IHooejogbnVtYmVyKSB7IHRoaXMuX3ogPSB6OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuICAgIHB1YmxpYyBzZXQgdyh3OiBudW1iZXIpIHsgdGhpcy5fdyA9IHc7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICBpZiAoIXRoaXMubmVlZHNVcGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9sZW5ndGggPSBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9ICBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZG90KHZlY3RvckE6IFZlY3RvcjQsIHZlY3RvckI6IFZlY3RvcjQpOiBudW1iZXIge1xuICAgICAgICBsZXQgcmV0ID0gdmVjdG9yQS54ICogdmVjdG9yQi54ICsgdmVjdG9yQS55ICogdmVjdG9yQi55ICsgdmVjdG9yQS56ICogdmVjdG9yQi56ICsgdmVjdG9yQS53ICogdmVjdG9yQi53O1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn0iLCJpbXBvcnQgeyBTaGFkZXJTdHJ1Y3QgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XG5cbmxldCBCYXNpYzogU2hhZGVyU3RydWN0ID0ge1xuICAgIHZlcnRleFNoYWRlcjogYFxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcblxuICAgICAgICBhdHRyaWJ1dGUgdmVjMyBhVmVydGV4UG9zaXRpb247XG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMyIGFUZXhDb29yZHM7XG5cbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uO1xuICAgICAgICB1bmlmb3JtIG1hdDQgdVBvc2l0aW9uO1xuXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2VGV4Q29vcmRzO1xuXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XG4gICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVQcm9qZWN0aW9uICogdVBvc2l0aW9uICogdmVjNChhVmVydGV4UG9zaXRpb24sIDEuMCk7XG5cbiAgICAgICAgICAgIHZUZXhDb29yZHMgPSBhVGV4Q29vcmRzO1xuICAgICAgICB9XG4gICAgYCxcblxuICAgIGZyYWdtZW50U2hhZGVyOiBgXG4gICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuICAgICAgICBcbiAgICAgICAgdW5pZm9ybSB2ZWM0IHVVVjtcbiAgICAgICAgdW5pZm9ybSB2ZWMyIHVSZXBlYXQ7XG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVUZXh0dXJlO1xuXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2VGV4Q29vcmRzO1xuXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XG4gICAgICAgICAgICB2ZWMyIGNvb3JkcyA9IG1vZChjbGFtcCh2VGV4Q29vcmRzLCAwLjAsIDEuMCkgKiB1UmVwZWF0LCAxLjApICogdVVWLnp3ICsgdVVWLnh5O1xuXG4gICAgICAgICAgICAvL2dsX0ZyYWdDb2xvciA9IHZlYzQodGV4dHVyZTJEKHVUZXh0dXJlLCBjb29yZHMpLnJnYiwgMS4wKTtcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1VGV4dHVyZSwgY29vcmRzKTs7XG4gICAgICAgIH1cbiAgICBgXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNpYzsiLCJpbXBvcnQgeyBTaGFkZXJTdHJ1Y3QgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XG5cbmxldCBDb2xvcjogU2hhZGVyU3RydWN0ID0ge1xuICAgIHZlcnRleFNoYWRlcjogYFxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcblxuICAgICAgICBhdHRyaWJ1dGUgdmVjMyBhVmVydGV4UG9zaXRpb247XG5cbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uO1xuICAgICAgICB1bmlmb3JtIG1hdDQgdVBvc2l0aW9uO1xuXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XG4gICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVQcm9qZWN0aW9uICogdVBvc2l0aW9uICogdmVjNChhVmVydGV4UG9zaXRpb24sIDEuMCk7XG4gICAgICAgIH1cbiAgICBgLFxuXG4gICAgZnJhZ21lbnRTaGFkZXI6IGBcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG5cbiAgICAgICAgdW5pZm9ybSB2ZWM0IHVDb2xvcjtcblxuICAgICAgICB2b2lkIG1haW4odm9pZCkge1xuICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdUNvbG9yO1xuICAgICAgICB9XG4gICAgYFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29sb3I7IiwiaW1wb3J0IHsgU2hhZGVyU3RydWN0IH0gZnJvbSAnLi4vc2hhZGVycy9TaGFkZXJTdHJ1Y3QnO1xuaW1wb3J0IHsgY3JlYXRlVVVJRCB9IGZyb20gJy4uL1V0aWxzJztcblxuaW50ZXJmYWNlIEF0dHJpYnV0ZXMge1xuICAgIFtpbmRleDogc3RyaW5nXTogbnVtYmVyXG59O1xuXG5pbnRlcmZhY2UgVW5pZm9ybXMge1xuICAgIFtpbmRleDogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb25cbn1cblxuY2xhc3MgU2hhZGVyIHtcbiAgICBwdWJsaWMgYXR0cmlidXRlcyAgICAgICAgICAgICAgIDogQXR0cmlidXRlcztcbiAgICBwdWJsaWMgdW5pZm9ybXMgICAgICAgICAgICAgICAgIDogVW5pZm9ybXM7XG4gICAgcHVibGljIHByb2dyYW0gICAgICAgICAgICAgICAgICA6IFdlYkdMUHJvZ3JhbTtcbiAgICBwdWJsaWMgYXR0cmlidXRlc0NvdW50ICAgICAgICAgIDogbnVtYmVyO1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHV1aWQgICAgICAgICAgICA6IHN0cmluZztcblxuICAgIHN0YXRpYyBtYXhBdHRyaWJMZW5ndGggICAgICAgICAgOiBudW1iZXI7XG4gICAgc3RhdGljIGxhc3RQcm9ncmFtICAgICAgICAgICAgICA6IFNoYWRlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgc2hhZGVyOiBTaGFkZXJTdHJ1Y3QpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB7fTtcblxuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XG5cbiAgICAgICAgdGhpcy5jb21waWxlU2hhZGVycyhzaGFkZXIpO1xuICAgICAgICB0aGlzLmdldFNoYWRlckF0dHJpYnV0ZXMoc2hhZGVyKTtcbiAgICAgICAgdGhpcy5nZXRTaGFkZXJVbmlmb3JtcyhzaGFkZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29tcGlsZVNoYWRlcnMoc2hhZGVyOiBTaGFkZXJTdHJ1Y3QpOiB2b2lkIHtcbiAgICAgICAgbGV0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSB0aGlzLmdsO1xuXG4gICAgICAgIGxldCB2U2hhZGVyOiBXZWJHTFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKHZTaGFkZXIsIHNoYWRlci52ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKHZTaGFkZXIpO1xuXG4gICAgICAgIGxldCBmU2hhZGVyOiBXZWJHTFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgICAgICBnbC5zaGFkZXJTb3VyY2UoZlNoYWRlciwgc2hhZGVyLmZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgZ2wuY29tcGlsZVNoYWRlcihmU2hhZGVyKTtcblxuICAgICAgICB0aGlzLnByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcih0aGlzLnByb2dyYW0sIHZTaGFkZXIpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5wcm9ncmFtLCBmU2hhZGVyKTtcbiAgICAgICAgZ2wubGlua1Byb2dyYW0odGhpcy5wcm9ncmFtKTtcblxuICAgICAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGdsLmdldFNoYWRlckluZm9Mb2codlNoYWRlcikpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgY29tcGlsaW5nIHZlcnRleCBzaGFkZXJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihmU2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGdsLmdldFNoYWRlckluZm9Mb2coZlNoYWRlcikpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgY29tcGlsaW5nIGZyYWdtZW50IHNoYWRlclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZ2wuZ2V0UHJvZ3JhbUluZm9Mb2codGhpcy5wcm9ncmFtKSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBsaW5raW5nIHRoZSBwcm9ncmFtXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTaGFkZXJBdHRyaWJ1dGVzKHNoYWRlcjogU2hhZGVyU3RydWN0KTogdm9pZCB7XG4gICAgICAgIGxldCBjb2RlOiBBcnJheTxzdHJpbmc+ID0gc2hhZGVyLnZlcnRleFNoYWRlci5zcGxpdCgvXFxuL2cpO1xuICAgICAgICBsZXQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IHRoaXMuZ2w7XG5cbiAgICAgICAgbGV0IGF0dHJpYnV0ZTogc3RyaW5nO1xuICAgICAgICBsZXQgbG9jYXRpb246IG51bWJlcjtcblxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNDb3VudCA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjOiBBcnJheTxzdHJpbmc+ID0gY29kZVtpXS50cmltKCkuc3BsaXQoLyAvZyk7XG5cbiAgICAgICAgICAgIGlmIChjWzBdID09ICdhdHRyaWJ1dGUnKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlID0gYy5wb3AoKS5yZXBsYWNlKC87L2csIFwiXCIpO1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBhdHRyaWJ1dGUpO1xuXG4gICAgICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV0gPSBsb2NhdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNDb3VudCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgU2hhZGVyLm1heEF0dHJpYkxlbmd0aCA9IE1hdGgubWF4KFNoYWRlci5tYXhBdHRyaWJMZW5ndGgsIHRoaXMuYXR0cmlidXRlc0NvdW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNoYWRlclVuaWZvcm1zKHNoYWRlcjogU2hhZGVyU3RydWN0KTogdm9pZCB7XG4gICAgICAgIGxldCBjb2RlOiBBcnJheTxzdHJpbmc+ID0gc2hhZGVyLnZlcnRleFNoYWRlci5zcGxpdCgvXFxuL2cpO1xuICAgICAgICBjb2RlID0gY29kZS5jb25jYXQoc2hhZGVyLmZyYWdtZW50U2hhZGVyLnNwbGl0KC9cXG4vZykpO1xuXG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcblxuICAgICAgICBsZXQgdW5pZm9ybTogc3RyaW5nO1xuICAgICAgICBsZXQgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xuICAgICAgICBsZXQgdXNlZFVuaWZvcm1zOiBBcnJheTxzdHJpbmc+ID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjOiBBcnJheTxzdHJpbmc+ID0gY29kZVtpXS50cmltKCkuc3BsaXQoLyAvZyk7XG5cbiAgICAgICAgICAgIGlmIChjWzBdID09IFwidW5pZm9ybVwiKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybSA9IGMucG9wKCkucmVwbGFjZSgvOy9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICBpZiAodXNlZFVuaWZvcm1zLmluZGV4T2YodW5pZm9ybSkgIT0gLTEpIHsgY29udGludWU7IH1cblxuICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgdW5pZm9ybSk7XG5cbiAgICAgICAgICAgICAgICB1c2VkVW5pZm9ybXMucHVzaCh1bmlmb3JtKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybXNbdW5pZm9ybV0gPSBsb2NhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB1c2VQcm9ncmFtKCk6IHZvaWQge1xuICAgICAgICBpZiAoU2hhZGVyLmxhc3RQcm9ncmFtID09IHRoaXMpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgbGV0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSB0aGlzLmdsO1xuXG4gICAgICAgIGdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICAgICAgU2hhZGVyLmxhc3RQcm9ncmFtID0gdGhpcztcblxuICAgICAgICBsZXQgYXR0cmliTGVuZ3RoOiBudW1iZXIgPSB0aGlzLmF0dHJpYnV0ZXNDb3VudDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IFNoYWRlci5tYXhBdHRyaWJMZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPCBhdHRyaWJMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5TaGFkZXIubWF4QXR0cmliTGVuZ3RoID0gMDtcblNoYWRlci5sYXN0UHJvZ3JhbSA9IG51bGw7XG5cbmV4cG9ydCBkZWZhdWx0IFNoYWRlcjsiLCJpbXBvcnQgeyBSZW5kZXJlciwgQ2FtZXJhLCBTY2VuZSwgQ3ViZUdlb21ldHJ5LCBDb2xvck1hdGVyaWFsLCBWZWN0b3I0LCBJbnN0YW5jZSB9IGZyb20gJy4uLy4uL2VuZ2luZSc7XG5cbmNsYXNzIEFwcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHJlbmRlciA9IG5ldyBSZW5kZXJlcig4NTQsIDQ4MCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGl2R2FtZVwiKS5hcHBlbmRDaGlsZChyZW5kZXIuY2FudmFzKVxuXG4gICAgICAgIGNvbnN0IGNhbWVyYSA9IENhbWVyYS5jcmVhdGVQZXJzcGVjdGl2ZSg5MCwgODU0LzQ4MCwgMC4xLCAxMDAwLjApO1xuICAgICAgICBjYW1lcmEuc2V0UG9zaXRpb24oMTAsIDEwLCAxMCk7XG4gICAgICAgIGNhbWVyYS5zZXRUYXJnZXQoMCwgMCwgMCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBnZW8gPSBuZXcgQ3ViZUdlb21ldHJ5KDIsIDIsIDIpO1xuICAgICAgICBjb25zdCBtYXQgPSBuZXcgQ29sb3JNYXRlcmlhbChuZXcgVmVjdG9yNCgxLjAsIDEuMCwgMS4wLCAxLjApKTtcbiAgICAgICAgY29uc3QgaW5zdCA9IG5ldyBJbnN0YW5jZShnZW8sIG1hdCk7XG5cbiAgICAgICAgY29uc3Qgc2NlbmUgPSBuZXcgU2NlbmUoKTtcbiAgICAgICAgc2NlbmUuc2V0Q2FtZXJhKGNhbWVyYSk7XG4gICAgICAgIHNjZW5lLmFkZEdhbWVPYmplY3QoaW5zdCk7XG5cbiAgICAgICAgc2NlbmUuaW5pdCgpO1xuXG4gICAgICAgIHRoaXMuX2xvb3AocmVuZGVyLCBzY2VuZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbG9vcChyZW5kZXI6IFJlbmRlcmVyLCBzY2VuZTogU2NlbmUpIHtcbiAgICAgICAgcmVuZGVyLmNsZWFyKCk7XG5cbiAgICAgICAgc2NlbmUucmVuZGVyKHJlbmRlcik7XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX2xvb3AocmVuZGVyLCBzY2VuZSkpO1xuICAgIH1cbn1cblxud2luZG93Lm9ubG9hZCA9ICgpID0+IG5ldyBBcHAoKTsiXX0=
