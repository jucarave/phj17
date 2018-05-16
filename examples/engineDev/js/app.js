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
var Renderer = (function () {
    function Renderer(width, height) {
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

},{"./shaders/Basic":27,"./shaders/Color":28,"./shaders/Shader":29}],8:[function(require,module,exports){
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

},{"./List":6}],9:[function(require,module,exports){
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

},{"./List":6,"./RenderingLayer":8,"./Utils":11}],10:[function(require,module,exports){
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
        return new Vector4_1.default(_x / this.width, y / this.height, w / this.width, h / this.height);
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
    return new Vector3_1.default(x - camera.screenSize.x / 2.0, (camera.screenSize.y / 2.0) - y, 0.0);
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

},{"./Config":3,"./Constants":4,"./math/Vector3":25}],12:[function(require,module,exports){
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
        var geometry = new CubeGeometry_1.default(renderer, this._size.x, this._size.y, this._size.z), material = new ColorMaterial_1.default(renderer, new Vector4_1.default(0.0, 1.0, 0.0, 0.5)), object = new Instance_1.default(renderer, geometry, material);
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
    function Instance(renderer, geometry, material) {
        if (renderer === void 0) { renderer = null; }
        if (geometry === void 0) { geometry = null; }
        if (material === void 0) { material = null; }
        this._transform = Matrix4_1.default.createIdentity();
        this.position = new Vector3_1.default(0.0);
        this._rotation = new Vector3_1.default(0.0);
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
        var uPosition = Matrix4_1.default.createIdentity();
        uPosition.multiply(this.getTransformation());
        uPosition.multiply(camera.getTransformation());
        gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(shader.uniforms["uPosition"], false, uPosition.data);
        this._material.render();
        this._geometry.render();
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
        this._boundingBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        this.offset = new Vector3_1.default(0, 0, 0);
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

},{"../materials/Material":23,"../shaders/Shader":29}],23:[function(require,module,exports){
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
        var geo = new engine_1.CubeGeometry(render, 2, 2, 2);
        var mat = new engine_1.ColorMaterial(render, new engine_1.Vector4(1.0, 1.0, 1.0, 1.0));
        var inst = new engine_1.Instance(render, geo, mat);
        var scene = new engine_1.Scene(render);
        scene.setCamera(camera);
        scene.addGameObject(inst);
        scene.init();
        this._loop(render, scene);
    }
    App.prototype._loop = function (render, scene) {
        var _this = this;
        render.clear();
        scene.render();
        requestAnimationFrame(function () { return _this._loop(render, scene); });
    };
    return App;
}());
window.onload = function () { return new App(); };

},{"../../engine":20}]},{},[30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL0NhbWVyYS50cyIsInNyYy9lbmdpbmUvQ29tcG9uZW50LnRzIiwic3JjL2VuZ2luZS9Db25maWcudHMiLCJzcmMvZW5naW5lL0NvbnN0YW50cy50cyIsInNyYy9lbmdpbmUvSW5wdXQudHMiLCJzcmMvZW5naW5lL0xpc3QudHMiLCJzcmMvZW5naW5lL1JlbmRlcmVyLnRzIiwic3JjL2VuZ2luZS9SZW5kZXJpbmdMYXllci50cyIsInNyYy9lbmdpbmUvU2NlbmUudHMiLCJzcmMvZW5naW5lL1RleHR1cmUudHMiLCJzcmMvZW5naW5lL1V0aWxzLnRzIiwic3JjL2VuZ2luZS9jb2xsaXNpb25zL0JveENvbGxpc2lvbi50cyIsInNyYy9lbmdpbmUvY29sbGlzaW9ucy9Db2xsaXNpb24udHMiLCJzcmMvZW5naW5lL2VudGl0aWVzL0luc3RhbmNlLnRzIiwic3JjL2VuZ2luZS9lbnRpdGllcy9UZXh0LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9HZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL1dhbGxHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvaW5kZXgudHMiLCJzcmMvZW5naW5lL21hdGVyaWFscy9CYXNpY01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbC50cyIsInNyYy9lbmdpbmUvbWF0ZXJpYWxzL01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRoL01hdHJpeDQudHMiLCJzcmMvZW5naW5lL21hdGgvVmVjdG9yMy50cyIsInNyYy9lbmdpbmUvbWF0aC9WZWN0b3I0LnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0Jhc2ljLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0NvbG9yLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL1NoYWRlci50cyIsInNyYy9leGFtcGxlcy9lbmdpbmVEZXYvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSwwQ0FBcUM7QUFDckMsMENBQXFDO0FBQ3JDLGlDQUFtQztBQUVuQztJQVdJLGdCQUFZLFVBQW1CO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUzQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU0sNEJBQVcsR0FBbEIsVUFBbUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sMEJBQVMsR0FBaEIsVUFBaUIsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7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QUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQztRQUV4QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckIsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUN4QyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2QixHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUN2RixPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQzdDLFFBQVEsR0FBRyxJQUFJLHVCQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFDckQsUUFBUSxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRTVGLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUUxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFDTCxXQUFDO0FBQUQsQ0EzRUEsQUEyRUMsQ0EzRWtCLGtCQUFRLEdBMkUxQjtBQUVELGtCQUFlLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDekdwQixtREFBOEM7QUFHOUM7SUFBMkIsZ0NBQVE7SUFDL0Isc0JBQVksUUFBa0IsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLE1BQWM7UUFBN0UsWUFDSSxpQkFBTyxTQU1WO1FBSkcsS0FBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOztJQUMzQyxDQUFDO0lBRU8saUNBQVUsR0FBbEIsVUFBbUIsS0FBYSxFQUFFLE1BQWMsRUFBRSxNQUFjO1FBQzVELElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQ2IsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEVBQ2QsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFHbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdB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QUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUvQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNkLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFD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QyxLQUFLLEVBQUUsQ0FBQztRQUVmLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVmLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFDTCxVQUFDO0FBQUQsQ0E3QkEsQUE2QkMsSUFBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsY0FBTSxPQUFBLElBQUksR0FBRyxFQUFFLEVBQVQsQ0FBUyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBNYXRyaXg0IGZyb20gJy4vbWF0aC9NYXRyaXg0JztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCB7IGRlZ1RvUmFkIH0gZnJvbSAnLi9VdGlscyc7XG5cbmNsYXNzIENhbWVyYSB7XG4gICAgcHJpdmF0ZSBfdHJhbnNmb3JtICAgICAgICAgICA6IE1hdHJpeDQ7XG4gICAgcHJpdmF0ZSBfdGFyZ2V0ICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJpdmF0ZSBfdXAgICAgICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJpdmF0ZSBfbmVlZHNVcGRhdGUgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgcG9zaXRpb24gICAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwdWJsaWMgc2NyZWVuU2l6ZSAgICAgICAgICAgIDogVmVjdG9yMztcblxuICAgIHB1YmxpYyByZWFkb25seSBwcm9qZWN0aW9uICAgICAgICAgIDogTWF0cml4NDtcblxuICAgIGNvbnN0cnVjdG9yKHByb2plY3Rpb246IE1hdHJpeDQpIHtcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gcHJvamVjdGlvbjtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gTWF0cml4NC5jcmVhdGVJZGVudGl0eSgpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5fdGFyZ2V0ID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuX3VwID0gbmV3IFZlY3RvcjMoMCwgMSwgMCk7XG4gICAgICAgIHRoaXMuc2NyZWVuU2l6ZSA9IG5ldyBWZWN0b3IzKDAuMCk7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogQ2FtZXJhIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUYXJnZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XG4gICAgICAgIHRoaXMuX3RhcmdldC5zZXQoeCwgeSwgeik7XG5cbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUcmFuc2Zvcm1hdGlvbigpOiBNYXRyaXg0IHtcbiAgICAgICAgaWYgKCF0aGlzLl9uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmID0gdGhpcy5mb3J3YXJkLFxuICAgICAgICAgICAgbCA9IFZlY3RvcjMuY3Jvc3ModGhpcy5fdXAsIGYpLm5vcm1hbGl6ZSgpLFxuICAgICAgICAgICAgdSA9IFZlY3RvcjMuY3Jvc3MoZiwgbCkubm9ybWFsaXplKCk7XG5cbiAgICAgICAgbGV0IGNwID0gdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHggPSAtVmVjdG9yMy5kb3QobCwgY3ApLFxuICAgICAgICAgICAgeSA9IC1WZWN0b3IzLmRvdCh1LCBjcCksXG4gICAgICAgICAgICB6ID0gLVZlY3RvcjMuZG90KGYsIGNwKTtcblxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0KFxuICAgICAgICAgICAgbC54LCB1LngsIGYueCwgMCxcbiAgICAgICAgICAgIGwueSwgdS55LCBmLnksIDAsXG4gICAgICAgICAgICBsLnosIHUueiwgZi56LCAwLFxuICAgICAgICAgICAgICB4LCAgIHksICAgeiwgMVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZm9yd2FyZCgpOiBWZWN0b3IzIHtcbiAgICAgICAgbGV0IGNwID0gdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHQgPSB0aGlzLl90YXJnZXQ7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKGNwLnggLSB0LngsIGNwLnkgLSB0LnksIGNwLnogLSB0LnopLm5vcm1hbGl6ZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNVcGRhdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuX25lZWRzVXBkYXRlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlUGVyc3BlY3RpdmUoZm92RGVncmVlczogbnVtYmVyLCByYXRpbzogbnVtYmVyLCB6bmVhcjogbnVtYmVyLCB6ZmFyOiBudW1iZXIpOiBDYW1lcmEge1xuICAgICAgICBjb25zdCBmb3YgPSBkZWdUb1JhZChmb3ZEZWdyZWVzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW1lcmEoTWF0cml4NC5jcmVhdGVQZXJzcGVjdGl2ZShmb3YsIHJhdGlvLCB6bmVhciwgemZhcikpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlT3J0aG9ncmFwaGljKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB6bmVhcjogbnVtYmVyLCB6ZmFyOiBudW1iZXIpOiBDYW1lcmEge1xuICAgICAgICBsZXQgcmV0ID0gbmV3IENhbWVyYShNYXRyaXg0LmNyZWF0ZU9ydGhvKHdpZHRoLCBoZWlnaHQsIHpuZWFyLCB6ZmFyKSk7XG4gICAgICAgIHJldC5zY3JlZW5TaXplLnNldCh3aWR0aCwgaGVpZ2h0LCAwKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhOyIsImltcG9ydCBJbnN0YW5jZSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcblxuYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IHtcbiAgICBwcm90ZWN0ZWQgX2luc3RhbmNlICAgICAgICAgICAgICAgICA6IEluc3RhbmNlO1xuICAgIFxuICAgIHB1YmxpYyByZWFkb25seSBuYW1lICAgICAgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGNvbXBvbmVudE5hbWUgICAgOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb21wb25lbnROYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gY29tcG9uZW50TmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2luc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IGF3YWtlKCk6IHZvaWQ7XG4gICAgcHVibGljIGFic3RyYWN0IHVwZGF0ZSgpOiB2b2lkO1xuICAgIHB1YmxpYyBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudDsiLCJsZXQgQ29uZmlnID0ge1xuICAgIFBMQVlfRlVMTFNDUkVFTiAgICAgICAgOiBmYWxzZSxcbiAgICBESVNQTEFZX0NPTExJU0lPTlMgICAgIDogZmFsc2UsXG5cbiAgICBQSVhFTF9VTklUX1JFTEFUSU9OICAgIDogMSAvIDE2LFxuXG4gICAgc2V0VW5pdFBpeGVsc1dpZHRoOiBmdW5jdGlvbih3aWR0aDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuUElYRUxfVU5JVF9SRUxBVElPTiA9IDEgLyB3aWR0aDtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb25maWc7IiwiZXhwb3J0IGNvbnN0IFZFUlRJQ0VfU0laRSAgICAgICAgICAgPSAzO1xuZXhwb3J0IGNvbnN0IFRFWENPT1JEX1NJWkUgICAgICAgICAgPSAyO1xuXG5leHBvcnQgY29uc3QgUElfMiAgICAgICAgICAgICAgICAgICA9IE1hdGguUEkgLyAyO1xuZXhwb3J0IGNvbnN0IFBJMiAgICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMjtcbmV4cG9ydCBjb25zdCBQSTNfMiAgICAgICAgICAgICAgICAgID0gTWF0aC5QSSAqIDMgLyAyOyIsImltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuL1V0aWxzJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9Db25maWcnO1xuXG5pbnRlcmZhY2UgQ2FsbGJhY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xufVxuXG5jbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBfZWxlbWVudCAgICAgICAgICAgICAgICAgOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9rZXlkb3duQ2FsbGJhY2tzICAgICAgICA6IEFycmF5PENhbGxiYWNrPjtcbiAgICBwcml2YXRlIF9rZXl1cENhbGxiYWNrcyAgICAgICAgICA6IEFycmF5PENhbGxiYWNrPjtcbiAgICBwcml2YXRlIF9tb3VzZW1vdmVDYWxsYmFja3MgICAgICA6IEFycmF5PENhbGxiYWNrPjtcbiAgICBwcml2YXRlIF9lbGVtZW50Rm9jdXMgICAgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2tleWRvd25DYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5fa2V5dXBDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5fbW91c2Vtb3ZlQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1cyA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9oYW5kbGVLZXlkb3duKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudEZvY3VzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9rZXlkb3duQ2FsbGJhY2tzW2ldO2krKykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbGJhY2soa2V5RXZlbnQua2V5Q29kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVLZXl1cChrZXlFdmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9dGhpcy5fa2V5dXBDYWxsYmFja3NbaV07aSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhrZXlFdmVudC5rZXlDb2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2hhbmRsZU1vdXNlTW92ZShtb3VzZUV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudEZvY3VzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9tb3VzZW1vdmVDYWxsYmFja3NbaV07aSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhtb3VzZUV2ZW50Lm1vdmVtZW50WCwgbW91c2VFdmVudC5tb3ZlbWVudFkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1cyA9IChkb2N1bWVudC5wb2ludGVyTG9ja0VsZW1lbnQgPT09IHRoaXMuX2VsZW1lbnQpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9kZWxldGVGcm9tTGlzdChsaXN0OiBBcnJheTxDYWxsYmFjaz4sIGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgZm9yIChsZXQgaT0wLGNhbGxiYWNrO2NhbGxiYWNrPWxpc3RbaV07aSsrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suaWQgPT0gaWQpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVDYWxsYmFja1RvTGlzdChsaXN0OiBBcnJheTxDYWxsYmFjaz4sIGNhbGxiYWNrOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgICAgIGxldCByZXQ6IENhbGxiYWNrID0ge1xuICAgICAgICAgICAgaWQ6IGNyZWF0ZVVVSUQoKSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5wdXNoKHJldCk7XG5cbiAgICAgICAgcmV0dXJuIHJldC5pZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdChmb2N1c0VsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBmb2N1c0VsZW1lbnQ7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleWRvd24oa2V5RXZlbnQpOyB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChrZXlFdmVudDogS2V5Ym9hcmRFdmVudCkgPT4geyB0aGlzLl9oYW5kbGVLZXl1cChrZXlFdmVudCk7IH0pO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZXY6IE1vdXNlRXZlbnQpID0+IHsgdGhpcy5faGFuZGxlTW91c2VNb3ZlKGV2KTsgfSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW96cG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuID0gdGhpcy5fZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCB0aGlzLl9lbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIHx8ICg8YW55PnRoaXMuX2VsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChDb25maWcuUExBWV9GVUxMU0NSRUVOICYmIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcblxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZXF1ZXN0UG9pbnRlckxvY2soKTtcbiAgICAgICAgfSk7XG4gICAgfSBcblxuICAgIHB1YmxpYyBvbktleWRvd24oY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KHRoaXMuX2tleWRvd25DYWxsYmFja3MsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG9uS2V5dXAoY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KHRoaXMuX2tleXVwQ2FsbGJhY2tzLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uTW91c2VNb3ZlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYWxsYmFja1RvTGlzdCh0aGlzLl9tb3VzZW1vdmVDYWxsYmFja3MsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVsZXRlQ2FsbGJhY2soaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZGVsZXRlRnJvbUxpc3QodGhpcy5fa2V5ZG93bkNhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodGhpcy5fZGVsZXRlRnJvbUxpc3QodGhpcy5fa2V5dXBDYWxsYmFja3MsIGlkKSkgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZUZyb21MaXN0KHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKG5ldyBJbnB1dCgpKTsiLCJjbGFzcyBOb2RlIHtcbiAgICBwdWJsaWMgcHJldiAgICAgICAgOiBOb2RlO1xuICAgIHB1YmxpYyBuZXh0ICAgICAgICA6IE5vZGU7XG4gICAgcHVibGljIGl0ZW0gICAgICAgIDogYW55O1xuICAgIHB1YmxpYyBpblVzZSAgICAgICA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihpdGVtOiBhbnkpIHtcbiAgICAgICAgdGhpcy5pdGVtID0gaXRlbTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuaXRlbSA9IG51bGw7XG4gICAgfVxufVxuXG5jbGFzcyBMaXN0PFQ+IHtcbiAgICBwcml2YXRlIF9oZWFkICAgICAgICAgICA6IE5vZGU7XG4gICAgcHJpdmF0ZSBfdGFpbCAgICAgICAgICAgOiBOb2RlO1xuICAgIHByaXZhdGUgX2xlbmd0aCAgICAgICAgIDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2hlYWQgPSBudWxsO1xuICAgICAgICB0aGlzLl90YWlsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHVzaChpdGVtOiBUKTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gbmV3IE5vZGUoaXRlbSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5faGVhZCA9IG5vZGU7XG4gICAgICAgICAgICB0aGlzLl90YWlsID0gbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0YWlsID0gdGhpcy5fdGFpbDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm9kZS5wcmV2ID0gdGFpbDtcbiAgICAgICAgICAgIHRhaWwubmV4dCA9IG5vZGU7XG5cbiAgICAgICAgICAgIHRoaXMuX3RhaWwgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGVuZ3RoICs9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZShpdGVtOiBUKTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZDtcblxuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuaXRlbSA9PSBpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucHJldil7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl90YWlsID09IG5vZGUpIHsgdGhpcy5fdGFpbCA9IG5vZGUucHJldjsgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLnByZXYubmV4dCA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0KXsgXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oZWFkID09IG5vZGUpIHsgdGhpcy5faGVhZCA9IG5vZGUubmV4dDsgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBub2RlLmNsZWFyKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9sZW5ndGggLT0gMTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBdChpbmRleDogbnVtYmVyKTogVCB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggPT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZCxcbiAgICAgICAgICAgIGNvdW50ID0gMDtcblxuICAgICAgICB3aGlsZSAoY291bnQgPCBpbmRleCkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgIGNvdW50Kys7XG5cbiAgICAgICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGUuaXRlbTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGluc2VydEF0KGluZGV4OiBudW1iZXIsIGl0ZW06IFQpOiB2b2lkIHtcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkLFxuICAgICAgICAgICAgY291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMuX2xlbmd0aCsrO1xuXG4gICAgICAgIHdoaWxlIChjb3VudCA8IGluZGV4KSB7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdJdGVtID0gbmV3IE5vZGUoaXRlbSk7XG4gICAgICAgIGlmICh0aGlzLl9oZWFkID09IG5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYWQucHJldiA9IG5ld0l0ZW07XG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSB0aGlzLl9oZWFkO1xuICAgICAgICAgICAgdGhpcy5faGVhZCA9IG5ld0l0ZW07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSBub2RlO1xuICAgICAgICAgICAgbmV3SXRlbS5wcmV2ID0gbm9kZS5wcmV2O1xuICAgIFxuICAgICAgICAgICAgaWYgKG5vZGUucHJldikgbm9kZS5wcmV2Lm5leHQgPSBuZXdJdGVtO1xuICAgICAgICAgICAgbm9kZS5wcmV2ID0gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBlYWNoKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2hlYWQ7XG5cbiAgICAgICAgd2hpbGUgKGl0ZW0pIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0uaXRlbSk7XG5cbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLm5leHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZDtcblxuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5jbGVhcigpO1xuXG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNvcnQoc29ydENoZWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fbGVuZ3RoIDwgMikgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQubmV4dCxcbiAgICAgICAgICAgIGNvbXBhcmUgPSB0aGlzLl9oZWFkO1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IG5vZGUubmV4dDtcblxuICAgICAgICAgICAgaWYgKHNvcnRDaGVjayhub2RlLml0ZW0sIGNvbXBhcmUuaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2KSB7IG5vZGUucHJldi5uZXh0ID0gbm9kZS5uZXh0OyB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubmV4dCkgeyBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjsgfVxuXG4gICAgICAgICAgICAgICAgbm9kZS5uZXh0ID0gY29tcGFyZTtcbiAgICAgICAgICAgICAgICBub2RlLnByZXYgPSBjb21wYXJlLnByZXY7XG5cbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZS5wcmV2KSBjb21wYXJlLnByZXYubmV4dCA9IG5vZGU7XG4gICAgICAgICAgICAgICAgY29tcGFyZS5wcmV2ID0gbm9kZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZSA9PSB0aGlzLl9oZWFkKSB7IHRoaXMuX2hlYWQgPSBub2RlOyB9IFxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlID09IHRoaXMuX3RhaWwpIHsgdGhpcy5fdGFpbCA9IG5vZGU7IH1cblxuICAgICAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICAgICAgICAgIGNvbXBhcmUgPSB0aGlzLl9oZWFkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wYXJlID0gY29tcGFyZS5uZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29tcGFyZSA9PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGhlYWQoKTogTm9kZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0OyIsImltcG9ydCBTaGFkZXIgZnJvbSAnLi9zaGFkZXJzL1NoYWRlcic7XG5pbXBvcnQgQmFzaWMgZnJvbSAnLi9zaGFkZXJzL0Jhc2ljJztcbmltcG9ydCBDb2xvciBmcm9tICcuL3NoYWRlcnMvQ29sb3InO1xuaW1wb3J0IHsgU2hhZGVyTWFwLCBTaGFkZXJzTmFtZXMgfSBmcm9tICcuL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcblxuY2xhc3MgUmVuZGVyZXIge1xuICAgIHByaXZhdGUgX2NhbnZhcyAgICAgICAgICAgICAgOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIF9nbCAgICAgICAgICAgICAgICAgIDogV2ViR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIHByaXZhdGUgX3NoYWRlcnMgICAgICAgICAgICAgOiBTaGFkZXJNYXA7XG4gICAgXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2FudmFzKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLl9pbml0R0woKTtcbiAgICAgICAgdGhpcy5faW5pdFNoYWRlcnMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVDYW52YXMod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzID0gY2FudmFzO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXRHTCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbFwiKTtcblxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuXG4gICAgICAgIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICBcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLCAwLCAwLCAxKTtcblxuICAgICAgICB0aGlzLl9nbCA9IGdsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXRTaGFkZXJzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zaGFkZXJzID0ge307XG5cbiAgICAgICAgdGhpcy5fc2hhZGVycy5CQVNJQyA9IG5ldyBTaGFkZXIodGhpcy5fZ2wsIEJhc2ljKTtcbiAgICAgICAgdGhpcy5fc2hhZGVycy5DT0xPUiA9IG5ldyBTaGFkZXIodGhpcy5fZ2wsIENvbG9yKTtcblxuICAgICAgICB0aGlzLl9zaGFkZXJzLkJBU0lDLnVzZVByb2dyYW0oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGxldCBnbCA9IHRoaXMuX2dsO1xuXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3dpdGNoU2hhZGVyKHNoYWRlck5hbWU6IFNoYWRlcnNOYW1lcyk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zaGFkZXJzW3NoYWRlck5hbWVdLnVzZVByb2dyYW0oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2hhZGVyKHNoYWRlck5hbWU6IFNoYWRlcnNOYW1lcyk6IFNoYWRlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFkZXJzW3NoYWRlck5hbWVdO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgR0woKTogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dsO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY2FudmFzKCk6IEhUTUxDYW52YXNFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHdpZHRoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXMud2lkdGg7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhcy5oZWlnaHQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJlcjsiLCJpbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5pbXBvcnQgTGlzdCBmcm9tICcuL0xpc3QnO1xuaW1wb3J0IENhbWVyYSBmcm9tICcuL0NhbWVyYSc7XG5cbmludGVyZmFjZSBQYXJhbXMge1xuICAgIFtpbmRleDogc3RyaW5nXSA6IGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluc3RhbmNlc01hcCB7XG4gICAgaW5zdGFuY2U6IEluc3RhbmNlO1xuICAgIHBhcmFtczogUGFyYW1zXG59XG5cbmNsYXNzIFJlbmRlcmluZ0xheWVyIHtcbiAgICBwcml2YXRlIF9pbnN0YW5jZXMgICAgICAgICAgICAgICAgICAgOiBMaXN0PEluc3RhbmNlc01hcD47XG5cbiAgICBwdWJsaWMgb25QcmVyZW5kZXIgICAgICAgICAgICAgICAgICAgOiBGdW5jdGlvbjtcbiAgICBwdWJsaWMgb25Qb3N0VXBkYXRlICAgICAgICAgICAgICAgICAgOiBGdW5jdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXMgPSBuZXcgTGlzdCgpO1xuXG4gICAgICAgIHRoaXMub25QcmVyZW5kZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm9uUG9zdFVwZGF0ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2U6IEluc3RhbmNlKTogSW5zdGFuY2VzTWFwIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcbiAgICAgICAgICAgIHBhcmFtczoge31cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhZGRJbnN0YW5jZShpbnN0YW5jZTogSW5zdGFuY2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IGFkZGVkID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGk9MCxpbnM7aW5zPXRoaXMuX2luc3RhbmNlcy5nZXRBdChpKTtpKyspIHtcbiAgICAgICAgICAgIGxldCBjb25kMSA9ICghaW5zLmluc3RhbmNlLm1hdGVyaWFsICYmICFpbnN0YW5jZS5tYXRlcmlhbCksXG4gICAgICAgICAgICAgICAgY29uZDIgPSAoaW5zLmluc3RhbmNlLm1hdGVyaWFsICYmIGluc3RhbmNlLm1hdGVyaWFsICYmIGlucy5pbnN0YW5jZS5tYXRlcmlhbC5zaGFkZXJOYW1lID09IGluc3RhbmNlLm1hdGVyaWFsLnNoYWRlck5hbWUpO1xuXG4gICAgICAgICAgICBpZiAoY29uZDEgfHwgY29uZDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMuaW5zZXJ0QXQoaSwgdGhpcy5fY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2UpKTtcbiAgICAgICAgICAgICAgICBpID0gdGhpcy5faW5zdGFuY2VzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBhZGRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWFkZGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMucHVzaCh0aGlzLl9jcmVhdGVJbnN0YW5jZU1hcChpbnN0YW5jZSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBhd2FrZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzLmVhY2goKGluc3RhbmNlOiBJbnN0YW5jZXNNYXApID0+IHtcbiAgICAgICAgICAgIGluc3RhbmNlLmluc3RhbmNlLmF3YWtlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2luc3RhbmNlcy5lYWNoKChpbnN0YW5jZTogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICBsZXQgaW5zID0gaW5zdGFuY2UuaW5zdGFuY2U7XG4gICAgICAgICAgICBpZiAoaW5zLmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5zdGFuY2VzLnJlbW92ZShpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbnMudXBkYXRlKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9uUG9zdFVwZGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Qb3N0VXBkYXRlKGluc3RhbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vblByZXJlbmRlcikgeyBcbiAgICAgICAgICAgIHRoaXMub25QcmVyZW5kZXIodGhpcy5faW5zdGFuY2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luc3RhbmNlcy5lYWNoKChpbnN0YW5jZTogSW5zdGFuY2VzTWFwKSA9PiB7XG4gICAgICAgICAgICBpbnN0YW5jZS5pbnN0YW5jZS5yZW5kZXIoY2FtZXJhKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJpbmdMYXllcjsiLCJpbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuL1JlbmRlcmVyJztcbmltcG9ydCBSZW5kZXJpbmdMYXllciBmcm9tICcuL1JlbmRlcmluZ0xheWVyJztcbmltcG9ydCB7IEluc3RhbmNlc01hcCB9IGZyb20gJy4vUmVuZGVyaW5nTGF5ZXInO1xuaW1wb3J0IExpc3QgZnJvbSAnLi9MaXN0JztcbmltcG9ydCB7IGdldFNxdWFyZWREaXN0YW5jZSB9IGZyb20gJy4vVXRpbHMnO1xuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4vZW50aXRpZXMvSW5zdGFuY2UnO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xuXG5jbGFzcyBTY2VuZSB7XG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgICAgICAgOiBSZW5kZXJlcjtcbiAgICBwcm90ZWN0ZWQgX2NhbWVyYSAgICAgICAgICAgICAgICAgICA6IENhbWVyYTtcbiAgICBwcm90ZWN0ZWQgX3N0YXJ0ZWQgICAgICAgICAgICAgICAgICA6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIF9yZW5kZXJpbmdMYXllcnMgICAgICAgICAgOiBMaXN0PFJlbmRlcmluZ0xheWVyPjtcblxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlcikge1xuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBudWxsO1xuICAgICAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXRMYXllcnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycyA9IG5ldyBMaXN0KCk7XG5cbiAgICAgICAgbGV0IG9wYXF1ZXMgPSBuZXcgUmVuZGVyaW5nTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLnB1c2gob3BhcXVlcyk7XG5cbiAgICAgICAgbGV0IHRyYW5zcGFyZW50cyA9IG5ldyBSZW5kZXJpbmdMYXllcigpO1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMucHVzaCh0cmFuc3BhcmVudHMpO1xuXG4gICAgICAgIHRyYW5zcGFyZW50cy5vblBvc3RVcGRhdGUgPSAoKGl0ZW06IEluc3RhbmNlc01hcCkgPT4ge1xuICAgICAgICAgICAgaXRlbS5wYXJhbXMuZGlzdGFuY2UgPSBnZXRTcXVhcmVkRGlzdGFuY2UoaXRlbS5pbnN0YW5jZS5wb3NpdGlvbiwgdGhpcy5fY2FtZXJhLnBvc2l0aW9uKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJhbnNwYXJlbnRzLm9uUHJlcmVuZGVyID0gKGluc3RhbmNlczogTGlzdDxJbnN0YW5jZXNNYXA+KSA9PiB7XG4gICAgICAgICAgICBpbnN0YW5jZXMuc29ydCgoaXRlbUE6IEluc3RhbmNlc01hcCwgaXRlbUI6IEluc3RhbmNlc01hcCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaXRlbUEucGFyYW1zLmRpc3RhbmNlID4gaXRlbUIucGFyYW1zLmRpc3RhbmNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRHYW1lT2JqZWN0KGluc3RhbmNlOiBJbnN0YW5jZSk6IHZvaWQge1xuICAgICAgICBsZXQgbWF0ID0gaW5zdGFuY2UubWF0ZXJpYWw7XG5cbiAgICAgICAgaW5zdGFuY2Uuc2V0U2NlbmUodGhpcyk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5fc3RhcnRlZCkge1xuICAgICAgICAgICAgaW5zdGFuY2UuYXdha2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXllciA9IHRoaXMuX3JlbmRlcmluZ0xheWVycy5nZXRBdCgwKTtcbiAgICAgICAgaWYgKG1hdCAmJiAhbWF0LmlzT3BhcXVlKSB7XG4gICAgICAgICAgICBsYXllciA9IHRoaXMuX3JlbmRlcmluZ0xheWVycy5nZXRBdCgxKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGF5ZXIuYWRkSW5zdGFuY2UoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0ZXN0Q29sbGlzaW9uKGluc3RhbmNlOiBJbnN0YW5jZSwgZGlyZWN0aW9uOiBWZWN0b3IzKTogVmVjdG9yMyB7XG4gICAgICAgIGluc3RhbmNlO1xuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDYW1lcmEoY2FtZXJhOiBDYW1lcmEpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2FtZXJhID0gY2FtZXJhO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XG4gICAgICAgICAgICBsYXllci5hd2FrZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XG4gICAgICAgICAgICBsYXllci51cGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLmVhY2goKGxheWVyOiBSZW5kZXJpbmdMYXllcikgPT4ge1xuICAgICAgICAgICAgbGF5ZXIucmVuZGVyKHRoaXMuX2NhbWVyYSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmU7IiwiaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXInO1xuaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi9tYXRoL1ZlY3RvcjQnO1xuXG5jbGFzcyBUZXh0dXJlIHtcbiAgICBwcml2YXRlIF9zcmMgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwcml2YXRlIF9pbWcgICAgICAgICAgICAgICA6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfY2FudmFzICAgICAgICAgICAgOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIF9yZW5kZXJlciAgICAgICAgICA6IFJlbmRlcmVyO1xuICAgIHByaXZhdGUgX3JlYWR5ICAgICAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIHB1YmxpYyByZWFkb25seSB0ZXh0dXJlICAgIDogV2ViR0xUZXh0dXJlO1xuXG4gICAgY29uc3RydWN0b3Ioc3JjOiBzdHJpbmd8SFRNTENhbnZhc0VsZW1lbnQsIHJlbmRlcmVyOiBSZW5kZXJlciwgY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gcmVuZGVyZXIuR0wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLl9yZWFkeSA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgaWYgKCg8SFRNTENhbnZhc0VsZW1lbnQ+c3JjKS5nZXRDb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9jYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+c3JjO1xuICAgICAgICAgICAgdGhpcy5faW1nID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NyYyA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuX29uUmVhZHkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zcmMgPSA8c3RyaW5nPnNyYztcblxuICAgICAgICAgICAgdGhpcy5faW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICB0aGlzLl9pbWcuc3JjID0gdGhpcy5fc3JjO1xuICAgICAgICAgICAgdGhpcy5faW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblJlYWR5KCk7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9vblJlYWR5KCk6IHZvaWQge1xuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9yZW5kZXJlci5HTDtcblxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMgOiB0aGlzLl9pbWcpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcblxuICAgICAgICB0aGlzLl9yZWFkeSA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVWUyh4OiBudW1iZXJ8VmVjdG9yNCwgeT86IG51bWJlciwgdz86IG51bWJlciwgaD86IG51bWJlcik6IFZlY3RvcjQge1xuICAgICAgICBsZXQgX3g6IG51bWJlcjtcblxuICAgICAgICBpZiAoKDxWZWN0b3I0PngpLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yND54KS54O1xuICAgICAgICAgICAgeSA9ICg8VmVjdG9yND54KS55O1xuICAgICAgICAgICAgdyA9ICg8VmVjdG9yND54KS56O1xuICAgICAgICAgICAgaCA9ICg8VmVjdG9yND54KS53O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3I0KFxuICAgICAgICAgICAgX3ggLyB0aGlzLndpZHRoLFxuICAgICAgICAgICAgeSAvIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgdyAvIHRoaXMud2lkdGgsXG4gICAgICAgICAgICBoIC8gdGhpcy5oZWlnaHRcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzUmVhZHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkeTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHdpZHRoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAodGhpcy5fY2FudmFzKT8gdGhpcy5fY2FudmFzLndpZHRoIDogdGhpcy5faW1nLndpZHRoO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAodGhpcy5fY2FudmFzKT8gdGhpcy5fY2FudmFzLmhlaWdodCA6IHRoaXMuX2ltZy5oZWlnaHQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlOyIsImltcG9ydCBWZWN0b3IzIGZyb20gJy4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9Db25maWcnO1xuaW1wb3J0IHsgUEkyIH0gZnJvbSAnLi9Db25zdGFudHMnO1xuaW1wb3J0IENhbWVyYSBmcm9tICcuL0NhbWVyYSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVVUlEKCk6IHN0cmluZyB7XG4gICAgbGV0IGRhdGUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpLFxuICAgICAgICByZXQgPSAoJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcpLnJlcGxhY2UoL1t4eV0vZywgKGM6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICBsZXQgcmFuID0gKGRhdGUgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgICAgICAgICAgZGF0ZSA9IE1hdGguZmxvb3IoZGF0ZSAvIDE2KTtcblxuICAgICAgICAgICAgcmV0dXJuIChjID09ICd4JyA/IHJhbiA6IChyYW4mMHgzfDB4OCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQoZGVncmVlczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQyRFZlY3RvckRpcih4OiBudW1iZXIsIHk6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHggPT0gMSAmJiB5ID09IDApIHsgcmV0dXJuIDA7IH1lbHNlIFxuICAgIGlmICh4ID09IDEgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoNDUpOyB9ZWxzZSBcbiAgICBpZiAoeCA9PSAwICYmIHkgPT0gLTEpIHsgcmV0dXJuIGRlZ1RvUmFkKDkwKTsgfWVsc2VcbiAgICBpZiAoeCA9PSAtMSAmJiB5ID09IC0xKSB7IHJldHVybiBkZWdUb1JhZCgxMzUpOyB9ZWxzZVxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMCkgeyByZXR1cm4gTWF0aC5QSTsgfWVsc2VcbiAgICBpZiAoeCA9PSAtMSAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDIyNSk7IH1lbHNlXG4gICAgaWYgKHggPT0gMCAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDI3MCk7IH1lbHNlXG4gICAgaWYgKHggPT0gMSAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDMxNSk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEQW5nbGUocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xuICAgIGxldCB4ID0gcG9zaXRpb24yLnggLSBwb3NpdGlvbjEueCxcbiAgICAgICAgeSA9IHBvc2l0aW9uMi56IC0gcG9zaXRpb24xLno7XG5cbiAgICBsZXQgcmV0ID0gTWF0aC5hdGFuMigteSwgeCk7XG5cbiAgICByZXR1cm4gKHJldCArIFBJMikgJSBQSTI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTcXVhcmVkRGlzdGFuY2UocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xuICAgIGxldCB4ID0gcG9zaXRpb24xLnggLSBwb3NpdGlvbjIueCxcbiAgICAgICAgeSA9IHBvc2l0aW9uMS55IC0gcG9zaXRpb24yLnksXG4gICAgICAgIHogPSBwb3NpdGlvbjEueiAtIHBvc2l0aW9uMi56O1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb29yZHNUb09ydGhvKGNhbWVyYTogQ2FtZXJhLCB4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyhcbiAgICAgICAgeCAtIGNhbWVyYS5zY3JlZW5TaXplLnggLyAyLjAsXG4gICAgICAgIChjYW1lcmEuc2NyZWVuU2l6ZS55IC8gMi4wKSAtIHksXG4gICAgICAgIDAuMFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXhlbENvb3Jkc1RvV29ybGQodmVjdG9yOiBWZWN0b3IzKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHZlY3Rvci5zZXQoXG4gICAgICAgIHZlY3Rvci54ICogQ29uZmlnLlBJWEVMX1VOSVRfUkVMQVRJT04sXG4gICAgICAgIHZlY3Rvci55ICogQ29uZmlnLlBJWEVMX1VOSVRfUkVMQVRJT04sXG4gICAgICAgIHZlY3Rvci56ICogQ29uZmlnLlBJWEVMX1VOSVRfUkVMQVRJT05cbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm91bmRVcFBvd2VyT2YyKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgbGV0IHJldCA9IDI7XG5cbiAgICB3aGlsZSAocmV0IDwgeCkge1xuICAgICAgICByZXQgKj0gMjtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHR0cFJlcXVlc3QodXJsOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGxldCBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICBodHRwLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgaHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaHR0cC5zZW5kKCk7XG59IiwiaW1wb3J0IENvbGxpc2lvbiBmcm9tICcuL0NvbGxpc2lvbic7XG5pbXBvcnQgQ29sb3JNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbCc7XG5pbXBvcnQgQ3ViZUdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvQ3ViZUdlb21ldHJ5JztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xuaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcbmltcG9ydCBJbnN0YW5jZSBmcm9tICcuLi9lbnRpdGllcy9JbnN0YW5jZSc7XG5cbmNsYXNzIEJveENvbGxpc2lvbiBleHRlbmRzIENvbGxpc2lvbiB7XG4gICAgcHJpdmF0ZSBfc2l6ZSAgICAgICAgICAgICAgICAgICA6IFZlY3RvcjM7XG4gICAgcHJpdmF0ZSBfYm94ICAgICAgICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG5cbiAgICBwdWJsaWMgaXNEeW5hbWljICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcbiAgICBcblxuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBWZWN0b3IzLCBzaXplOiBWZWN0b3IzKSB7XG4gICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgICAgICB0aGlzLmlzRHluYW1pYyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX3JlY2FsYygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Jlb3JkZXJCb3goYm94OiBBcnJheTxudW1iZXI+KTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGZvciAobGV0IGk9MDtpPDM7aSsrKSB7XG4gICAgICAgICAgICBpZiAoYm94WzMraV0gPCBib3hbMCtpXSkge1xuICAgICAgICAgICAgICAgIGxldCBoID0gYm94WzAraV07XG4gICAgICAgICAgICAgICAgYm94WzAraV0gPSBib3hbMytpXTtcbiAgICAgICAgICAgICAgICBib3hbMytpXSA9IGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm94O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2JveENvbGxpc2lvbihib3g6IEFycmF5PG51bWJlcj4pOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGIgPSB0aGlzLl9ib3g7XG5cbiAgICAgICAgaWYgKGJveFswXSA+PSBiWzNdIHx8IGJveFsxXSA+PSBiWzRdIHx8IGJveFsyXSA+PSBiWzVdIHx8IGJveFszXSA8IGJbMF0gfHwgYm94WzRdIDwgYlsxXSB8fCBib3hbNV0gPCBiWzJdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWNhbGMoKTogdm9pZCB7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uLFxuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuX3NpemU7XG5cbiAgICAgICAgbGV0IHB4ID0gcG9zaXRpb24ueCArIHRoaXMuX29mZnNldC54LFxuICAgICAgICAgICAgcHkgPSBwb3NpdGlvbi55ICsgdGhpcy5fb2Zmc2V0LnksXG4gICAgICAgICAgICBweiA9IHBvc2l0aW9uLnogKyB0aGlzLl9vZmZzZXQueixcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ggPSBzaXplLnggLyAyLFxuICAgICAgICAgICAgc3kgPSBzaXplLnkgLyAyLFxuICAgICAgICAgICAgc3ogPSBzaXplLnogLyAyO1xuXG4gICAgICAgIHRoaXMuX2JveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3B4IC0gc3gsIHB5IC0gc3ksIHB6IC0gc3osIHB4ICsgc3gsIHB5ICsgc3ksIHB6ICsgc3pdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdGVzdChwb3NpdGlvbjogVmVjdG9yMywgZGlyZWN0aW9uOiBWZWN0b3IzKTogVmVjdG9yMyB7XG4gICAgICAgIGlmICh0aGlzLmlzRHluYW1pYykge1xuICAgICAgICAgICAgdGhpcy5fcmVjYWxjKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29sbGlkZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHdpZHRoID0gMC4zLFxuICAgICAgICAgICAgaGVpZ2h0ID0gMC44LFxuICAgICAgICAgICAgeCA9IHBvc2l0aW9uLngsXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueSxcbiAgICAgICAgICAgIHogPSBwb3NpdGlvbi56LFxuICAgICAgICAgICAgeFRvID0gZGlyZWN0aW9uLngsXG4gICAgICAgICAgICB6VG8gPSBkaXJlY3Rpb24ueixcbiAgICAgICAgICAgIHNpZ24gPSAoZGlyZWN0aW9uLnggPiAwKT8gMSA6IC0xLFxuICAgICAgICAgICAgYm94ID0gdGhpcy5fcmVvcmRlckJveChbeCAtIHdpZHRoICogc2lnbiwgeSwgeiAtIHdpZHRoLCB4ICsgd2lkdGggKiBzaWduICsgZGlyZWN0aW9uLngsIHkgKyBoZWlnaHQsIHogKyB3aWR0aF0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9ib3hDb2xsaXNpb24oYm94KSkge1xuICAgICAgICAgICAgeFRvID0gMDtcbiAgICAgICAgICAgIGNvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHggKz0geFRvO1xuICAgICAgICBcbiAgICAgICAgc2lnbiA9IChkaXJlY3Rpb24ueiA+IDApPyAxIDogLTE7XG4gICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCwgeSwgeiAtIHdpZHRoICogc2lnbiwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGggKiBzaWduICsgZGlyZWN0aW9uLnpdKTtcbiAgICAgICAgaWYgKHRoaXMuX2JveENvbGxpc2lvbihib3gpKSB7XG4gICAgICAgICAgICB6VG8gPSAwO1xuICAgICAgICAgICAgY29sbGlkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb2xsaWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zb2xpZCkge1xuICAgICAgICAgICAgZGlyZWN0aW9uLnNldCh4VG8sIDAsIHpUbyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRDb2xsaXNpb25JbnN0YW5jZShyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IEN1YmVHZW9tZXRyeShyZW5kZXJlciwgdGhpcy5fc2l6ZS54LCB0aGlzLl9zaXplLnksIHRoaXMuX3NpemUueiksXG4gICAgICAgICAgICBtYXRlcmlhbCA9IG5ldyBDb2xvck1hdGVyaWFsKHJlbmRlcmVyLCBuZXcgVmVjdG9yNCgwLjAsIDEuMCwgMC4wLCAwLjUpKSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqZWN0ID0gbmV3IEluc3RhbmNlKHJlbmRlcmVyLCBnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXG4gICAgICAgIG1hdGVyaWFsLnNldE9wYXF1ZShmYWxzZSk7XG5cbiAgICAgICAgb2JqZWN0LnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG5cbiAgICAgICAgZ2VvbWV0cnkub2Zmc2V0ID0gdGhpcy5fb2Zmc2V0O1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZEdhbWVPYmplY3Qob2JqZWN0KTtcblxuICAgICAgICB0aGlzLl9kaXNwbGF5SW5zdGFuY2UgPSBvYmplY3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGNlbnRlckluQXhpcyh4OiBib29sZWFuLCB5OiBib29sZWFuLCB6OiBib29sZWFuKTogQm94Q29sbGlzaW9uIHtcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnggPSAoIXgpPyB0aGlzLl9zaXplLnggLyAyIDogMDtcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnkgPSAoIXkpPyB0aGlzLl9zaXplLnkgLyAyIDogMDtcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnogPSAoIXopPyB0aGlzLl9zaXplLnogLyAyIDogMDtcblxuICAgICAgICB0aGlzLl9yZWNhbGMoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm94Q29sbGlzaW9uOyIsImltcG9ydCBTY2VuZSBmcm9tICcuLi9TY2VuZSc7XG5pbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi4vZW50aXRpZXMvSW5zdGFuY2UnO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5cbmFic3RyYWN0IGNsYXNzIENvbGxpc2lvbiB7XG4gICAgcHJvdGVjdGVkIF9zY2VuZSAgICAgICAgICAgICAgICA6IFNjZW5lO1xuICAgIHByb3RlY3RlZCBfaW5zdGFuY2UgICAgICAgICAgICAgOiBJbnN0YW5jZTtcbiAgICBwcm90ZWN0ZWQgX3Bvc2l0aW9uICAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwcm90ZWN0ZWQgX29mZnNldCAgICAgICAgICAgICAgIDogVmVjdG9yMztcbiAgICBwcm90ZWN0ZWQgX2Rpc3BsYXlJbnN0YW5jZSAgICAgIDogSW5zdGFuY2U7XG5cbiAgICBwdWJsaWMgc29saWQgICAgICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBTY2VuZSkge1xuICAgICAgICB0aGlzLnNldFNjZW5lKHNjZW5lKTtcbiAgICAgICAgdGhpcy5zb2xpZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fb2Zmc2V0ID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IHRlc3QocG9zaXRpb246IFZlY3RvcjMsIGRpcmVjdGlvbjogVmVjdG9yMykgOiBWZWN0b3IzO1xuXG4gICAgcHVibGljIHNldFNjZW5lKHNjZW5lOiBTY2VuZSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnN0YW5jZShpbnN0YW5jZTogSW5zdGFuY2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQ29sbGlzaW9uSW5zdGFuY2UocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XG4gICAgICAgIHJlbmRlcmVyO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGluc3RhbmNlKCk6IEluc3RhbmNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGlzcGxheUluc3RhbmNlKCk6IEluc3RhbmNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc3BsYXlJbnN0YW5jZTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbGxpc2lvbjsiLCJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9DYW1lcmEnO1xuaW1wb3J0IFNjZW5lIGZyb20gJy4uL1NjZW5lJztcbmltcG9ydCBDb2xsaXNpb24gZnJvbSAnLi4vY29sbGlzaW9ucy9Db2xsaXNpb24nO1xuaW1wb3J0IEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvR2VvbWV0cnknO1xuaW1wb3J0IE1hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9NYXRlcmlhbCc7XG5pbXBvcnQgU2hhZGVyIGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi4vQ29tcG9uZW50JztcbmltcG9ydCBNYXRyaXg0IGZyb20gJy4uL21hdGgvTWF0cml4NCc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xuaW1wb3J0IHsgZ2V0MkRBbmdsZSB9IGZyb20gJy4uL1V0aWxzJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi4vQ29uZmlnJztcbmltcG9ydCBMaXN0IGZyb20gJy4uL0xpc3QnO1xuXG5jbGFzcyBJbnN0YW5jZSB7XG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgOiBSZW5kZXJlcjtcbiAgICBwcm90ZWN0ZWQgX2dlb21ldHJ5ICAgICAgICAgICA6IEdlb21ldHJ5O1xuICAgIHByb3RlY3RlZCBfbWF0ZXJpYWwgICAgICAgICAgIDogTWF0ZXJpYWw7XG4gICAgcHJvdGVjdGVkIF9yb3RhdGlvbiAgICAgICAgICAgOiBWZWN0b3IzO1xuICAgIHByb3RlY3RlZCBfdHJhbnNmb3JtICAgICAgICAgIDogTWF0cml4NDtcbiAgICBwcm90ZWN0ZWQgX3NjZW5lICAgICAgICAgICAgICA6IFNjZW5lO1xuICAgIHByb3RlY3RlZCBfY29tcG9uZW50cyAgICAgICAgIDogTGlzdDxDb21wb25lbnQ+O1xuICAgIHByb3RlY3RlZCBfY29sbGlzaW9uICAgICAgICAgIDogQ29sbGlzaW9uO1xuICAgIHByb3RlY3RlZCBfbmVlZHNVcGRhdGUgICAgICAgIDogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX2Rlc3Ryb3llZCAgICAgICAgICA6IGJvb2xlYW47XG4gICAgXG4gICAgcHVibGljIHBvc2l0aW9uICAgICAgICAgICAgOiBWZWN0b3IzO1xuICAgIHB1YmxpYyBpc0JpbGxib2FyZCAgICAgICAgIDogYm9vbGVhbjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIgPSBudWxsLCBnZW9tZXRyeTogR2VvbWV0cnkgPSBudWxsLCBtYXRlcmlhbDogTWF0ZXJpYWwgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IE1hdHJpeDQuY3JlYXRlSWRlbnRpdHkoKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IzKDAuMCk7XG4gICAgICAgIHRoaXMuX3JvdGF0aW9uID0gbmV3IFZlY3RvcjMoMC4wKTtcbiAgICAgICAgdGhpcy5pc0JpbGxib2FyZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgICAgIHRoaXMuX21hdGVyaWFsID0gbWF0ZXJpYWw7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgIHRoaXMuX3NjZW5lID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IG5ldyBMaXN0KCk7XG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlcnxWZWN0b3IzLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogSW5zdGFuY2Uge1xuICAgICAgICBsZXQgX3g6IG51bWJlcjtcblxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xuICAgICAgICAgICAgX3ggPSAoPFZlY3RvcjM+eCkueDtcbiAgICAgICAgICAgIHkgPSAoPFZlY3RvcjM+eCkueTtcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF94ID0gPG51bWJlcj54O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZChfeCwgeSwgeik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldChfeCwgeSwgeik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbGxpc2lvbiAmJiB0aGlzLl9jb2xsaXNpb24uZGlzcGxheUluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb2xsaXNpb24uZGlzcGxheUluc3RhbmNlLnRyYW5zbGF0ZSh4LCB5LCB6LCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcm90YXRlKHg6IG51bWJlcnxWZWN0b3IzLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogSW5zdGFuY2Uge1xuICAgICAgICBsZXQgX3g6IG51bWJlcjtcbiAgICAgICAgXG4gICAgICAgIGlmICgoPFZlY3RvcjM+eCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yMz54KS54O1xuICAgICAgICAgICAgeSA9ICg8VmVjdG9yMz54KS55O1xuICAgICAgICAgICAgeiA9ICg8VmVjdG9yMz54KS56O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3ggPSA8bnVtYmVyPng7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5fcm90YXRpb24uYWRkKF94LCB5LCB6KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3JvdGF0aW9uLnNldChfeCwgeSwgeik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzZXRTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBzY2VuZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICBjb21wb25lbnQuYWRkSW5zdGFuY2UodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbXBvbmVudDxUPihjb21wb25lbnROYW1lOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgZm9yIChsZXQgaT0wLGNvbXA7Y29tcD10aGlzLl9jb21wb25lbnRzLmdldEF0KGkpO2krKykge1xuICAgICAgICAgICAgaWYgKGNvbXAubmFtZSA9PSBjb21wb25lbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxUPig8YW55PmNvbXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRUcmFuc2Zvcm1hdGlvbigpOiBNYXRyaXg0IHtcbiAgICAgICAgaWYgKCF0aGlzLl9uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRJZGVudGl0eSgpO1xuXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5tdWx0aXBseShNYXRyaXg0LmNyZWF0ZVhSb3RhdGlvbih0aGlzLl9yb3RhdGlvbi54KSk7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5tdWx0aXBseShNYXRyaXg0LmNyZWF0ZVpSb3RhdGlvbih0aGlzLl9yb3RhdGlvbi56KSk7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5tdWx0aXBseShNYXRyaXg0LmNyZWF0ZVlSb3RhdGlvbih0aGlzLl9yb3RhdGlvbi55KSk7XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuX2dlb21ldHJ5Lm9mZnNldDtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtLnRyYW5zbGF0ZSh0aGlzLnBvc2l0aW9uLnggKyBvZmZzZXQueCwgdGhpcy5wb3NpdGlvbi55ICsgb2Zmc2V0LnksIHRoaXMucG9zaXRpb24ueiArIG9mZnNldC56KTtcblxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuXG4gICAgcHVibGljIHNldENvbGxpc2lvbihjb2xsaXNpb246IENvbGxpc2lvbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBjb2xsaXNpb247XG4gICAgICAgIGNvbGxpc2lvbi5zZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0KHJlbmRlcmVyOiBSZW5kZXJlciwgZ2VvbWV0cnk6IEdlb21ldHJ5ID0gbnVsbCwgbWF0ZXJpYWw6IE1hdGVyaWFsID0gbnVsbCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG1hdGVyaWFsO1xuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICB0aGlzLl9yb3RhdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRJZGVudGl0eSgpO1xuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBudWxsO1xuICAgICAgICB0aGlzLmlzQmlsbGJvYXJkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9jb21wb25lbnRzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGF3YWtlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jb21wb25lbnRzLmVhY2goKGNvbXBvbmVudDogQ29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICBjb21wb25lbnQuYXdha2UoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbGxpc2lvbiAmJiBDb25maWcuRElTUExBWV9DT0xMSVNJT05TKSB7XG4gICAgICAgICAgICBsZXQgY29sbGlzaW9uID0gdGhpcy5fY29sbGlzaW9uO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24uc2V0U2NlbmUodGhpcy5fc2NlbmUpO1xuICAgICAgICAgICAgY29sbGlzaW9uLmFkZENvbGxpc2lvbkluc3RhbmNlKHRoaXMuX3JlbmRlcmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuZWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC51cGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuZWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9nZW9tZXRyeS5pc0R5bmFtaWMpIHtcbiAgICAgICAgICAgIHRoaXMuX2dlb21ldHJ5LmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgQ29uZmlnLkRJU1BMQVlfQ09MTElTSU9OUykge1xuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2dlb21ldHJ5IHx8ICF0aGlzLl9tYXRlcmlhbCkgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKCF0aGlzLl9tYXRlcmlhbC5pc1JlYWR5KSB7IHJldHVybjsgfVxuXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnN3aXRjaFNoYWRlcih0aGlzLl9tYXRlcmlhbC5zaGFkZXJOYW1lKTtcblxuICAgICAgICBjb25zdCBnbCA9IHRoaXMuX3JlbmRlcmVyLkdMLFxuICAgICAgICAgICAgc2hhZGVyID0gU2hhZGVyLmxhc3RQcm9ncmFtO1xuXG4gICAgICAgIGlmICh0aGlzLmlzQmlsbGJvYXJkKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGF0ZSgwLCBnZXQyREFuZ2xlKHRoaXMucG9zaXRpb24sIGNhbWVyYS5wb3NpdGlvbikgKyBNYXRoLlBJIC8gMiwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1UG9zaXRpb24gPSBNYXRyaXg0LmNyZWF0ZUlkZW50aXR5KCk7XG4gICAgICAgIHVQb3NpdGlvbi5tdWx0aXBseSh0aGlzLmdldFRyYW5zZm9ybWF0aW9uKCkpO1xuICAgICAgICB1UG9zaXRpb24ubXVsdGlwbHkoY2FtZXJhLmdldFRyYW5zZm9ybWF0aW9uKCkpO1xuICAgICAgICBcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXNbXCJ1UHJvamVjdGlvblwiXSwgZmFsc2UsIGNhbWVyYS5wcm9qZWN0aW9uLmRhdGEpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtc1tcInVQb3NpdGlvblwiXSwgZmFsc2UsIHVQb3NpdGlvbi5kYXRhKTtcblxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5yZW5kZXIoKTtcblxuICAgICAgICB0aGlzLl9nZW9tZXRyeS5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGdlb21ldHJ5KCk6IEdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IG1hdGVyaWFsKCk6IE1hdGVyaWFsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hdGVyaWFsO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uKCk6IFZlY3RvcjMge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm90YXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb2xsaXNpb24oKTogQ29sbGlzaW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxpc2lvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNjZW5lKCk6IFNjZW5lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjZW5lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNEZXN0cm95ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZXN0cm95ZWQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnN0YW5jZTsiLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5pbXBvcnQgQmFzaWNNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvQmFzaWNNYXRlcmlhbCc7XG5pbXBvcnQgV2FsbEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XG5pbXBvcnQgeyByb3VuZFVwUG93ZXJPZjIgfSBmcm9tICcuLi9VdGlscyc7XG5pbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi4vZW50aXRpZXMvSW5zdGFuY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRleHRPcHRpb25zIHtcbiAgICBzaXplPzogbnVtYmVyO1xuICAgIHN0cm9rZT86IGJvb2xlYW47XG4gICAgZmlsbD86IGJvb2xlYW47XG4gICAgZmlsbENvbG9yPzogc3RyaW5nO1xuICAgIHN0cm9rZUNvbG9yPzogc3RyaW5nO1xuICAgIHBvc2l0aW9uPzogVmVjdG9yMztcbiAgICByb3RhdGlvbj86IFZlY3RvcjM7XG59XG5cbmNvbnN0IE9wdGlvbnNEZWZhdWx0OiBUZXh0T3B0aW9ucyA9IHtcbiAgICBzaXplOiAxMixcbiAgICBzdHJva2U6IGZhbHNlLFxuICAgIGZpbGw6IHRydWUsXG4gICAgZmlsbENvbG9yOiAnI0ZGRkZGRicsXG4gICAgc3Ryb2tlQ29sb3I6ICcjRkZGRkZGJyxcbiAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMoMC4wLCAwLjAsIDAuMCksXG4gICAgcm90YXRpb246IG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApXG59O1xuXG5jbGFzcyBUZXh0IGV4dGVuZHMgSW5zdGFuY2Uge1xuICAgIHByaXZhdGUgX3RleHQgICAgICAgICAgICAgICA6IHN0cmluZztcbiAgICBwcml2YXRlIF9mb250ICAgICAgICAgICAgICAgOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfb3B0aW9ucyAgICAgICAgICAgIDogVGV4dE9wdGlvbnM7XG4gICAgXG4gICAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyLCB0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZywgb3B0aW9ucz86IFRleHRPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKHJlbmRlcmVyKTtcblxuICAgICAgICB0aGlzLl90ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5fZm9udCA9IGZvbnQ7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSB0aGlzLl9tZXJnZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fcHJpbnRUZXh0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbWVyZ2VPcHRpb25zKG9wdGlvbnM6IFRleHRPcHRpb25zKTogVGV4dE9wdGlvbnMge1xuICAgICAgICBpZiAoIW9wdGlvbnMpIHsgcmV0dXJuIE9wdGlvbnNEZWZhdWx0OyB9XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnNpemUpIHsgb3B0aW9ucy5zaXplID0gT3B0aW9uc0RlZmF1bHQuc2l6ZTsgfVxuICAgICAgICBpZiAoIW9wdGlvbnMuc3Ryb2tlKSB7IG9wdGlvbnMuc3Ryb2tlID0gT3B0aW9uc0RlZmF1bHQuc3Ryb2tlOyB9XG4gICAgICAgIGlmICghb3B0aW9ucy5maWxsKSB7IG9wdGlvbnMuZmlsbCA9IE9wdGlvbnNEZWZhdWx0LmZpbGw7IH1cbiAgICAgICAgaWYgKCFvcHRpb25zLmZpbGxDb2xvcikgeyBvcHRpb25zLmZpbGxDb2xvciA9IE9wdGlvbnNEZWZhdWx0LmZpbGxDb2xvcjsgfVxuICAgICAgICBpZiAoIW9wdGlvbnMuc3Ryb2tlQ29sb3IpIHsgb3B0aW9ucy5zdHJva2VDb2xvciA9IE9wdGlvbnNEZWZhdWx0LnN0cm9rZUNvbG9yOyB9XG4gICAgICAgIGlmICghb3B0aW9ucy5wb3NpdGlvbikgeyBvcHRpb25zLnBvc2l0aW9uID0gT3B0aW9uc0RlZmF1bHQucG9zaXRpb247IH1cbiAgICAgICAgaWYgKCFvcHRpb25zLnJvdGF0aW9uKSB7IG9wdGlvbnMucm90YXRpb24gPSBPcHRpb25zRGVmYXVsdC5yb3RhdGlvbjsgfVxuXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3ByaW50VGV4dCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXG4gICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgICAgIGN0eC5mb250ID0gdGhpcy5fb3B0aW9ucy5zaXplICsgXCJweCBcIiArIHRoaXMuX2ZvbnQ7XG4gICAgICAgIFxuICAgICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4Lm9JbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBzaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuX3RleHQpO1xuXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHJvdW5kVXBQb3dlck9mMihzaXplLndpZHRoKTtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHJvdW5kVXBQb3dlck9mMih0aGlzLl9vcHRpb25zLnNpemUpO1xuICAgICAgICBjdHguZm9udCA9IHRoaXMuX29wdGlvbnMuc2l6ZSArIFwicHggXCIgKyB0aGlzLl9mb250O1xuXG4gICAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjdHgub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZmlsbCkge1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuX29wdGlvbnMuZmlsbENvbG9yO1xuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHRoaXMuX3RleHQsIDQsIHRoaXMuX29wdGlvbnMuc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zdHJva2UpIHtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuX29wdGlvbnMuc3Ryb2tlQ29sb3I7XG4gICAgICAgICAgICBjdHguc3Ryb2tlVGV4dCh0aGlzLl90ZXh0LCA0LCB0aGlzLl9vcHRpb25zLnNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHV2cyA9IFswLCAwLCAoc2l6ZS53aWR0aCArIDQpIC8gY2FudmFzLndpZHRoLCAodGhpcy5fb3B0aW9ucy5zaXplICsgOCkgLyBjYW52YXMuaGVpZ2h0XSxcbiAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShjYW52YXMsIHRoaXMuX3JlbmRlcmVyKSxcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IEJhc2ljTWF0ZXJpYWwodGhpcy5fcmVuZGVyZXIsIHRleHR1cmUpLFxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgV2FsbEdlb21ldHJ5KHRoaXMuX3JlbmRlcmVyLCBzaXplLndpZHRoIC8gMTAwLCB0aGlzLl9vcHRpb25zLnNpemUgLyAxMDApO1xuXG4gICAgICAgIG1hdGVyaWFsLnNldFV2KHV2c1swXSwgdXZzWzFdLCB1dnNbMl0sIHV2c1szXSk7XG4gICAgICAgIG1hdGVyaWFsLnNldE9wYXF1ZShmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDsgICAgICAgIFxuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IGdlb21ldHJ5O1xuXG4gICAgICAgIHRoaXMudHJhbnNsYXRlKHRoaXMuX29wdGlvbnMucG9zaXRpb24ueCwgdGhpcy5fb3B0aW9ucy5wb3NpdGlvbi55LCB0aGlzLl9vcHRpb25zLnBvc2l0aW9uLnopO1xuICAgICAgICB0aGlzLnJvdGF0ZSh0aGlzLl9vcHRpb25zLnJvdGF0aW9uLngsIHRoaXMuX29wdGlvbnMucm90YXRpb24ueSwgdGhpcy5fb3B0aW9ucy5yb3RhdGlvbi56KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHQ7IiwiaW1wb3J0IEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvR2VvbWV0cnknO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcblxuY2xhc3MgQ3ViZUdlb21ldHJ5IGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy5fZHluYW1pYyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fYnVpbGRDdWJlKHdpZHRoLCBoZWlnaHQsIGxlbmd0aCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYnVpbGRDdWJlKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgdyA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGggPSBoZWlnaHQgLyAyLFxuICAgICAgICAgICAgbCA9IGxlbmd0aCAvIDI7XG5cbiAgICAgICAgLy8gRnJvbnQgZmFjZVxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XG5cbiAgICAgICAgLy8gQmFjayBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsIC1sKTtcblxuICAgICAgICAvLyBMZWZ0IGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsIC1sKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgIGwpO1xuXG4gICAgICAgIC8vIFJpZ2h0IGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xuXG4gICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgIGwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsIC1sKTtcblxuICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAgbCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsICBsKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgLWwpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAtbCk7XG5cbiAgICAgICAgZm9yIChsZXQgaT0wO2k8NjtpKyspIHtcbiAgICAgICAgICAgIGxldCBpbmQgPSBpICogNDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5hZGRUcmlhbmdsZShpbmQgKyAwLCBpbmQgKyAxLCBpbmQgKyAyKTtcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMSwgaW5kICsgMywgaW5kICsgMik7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xuICAgICAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDEuMCk7XG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMC4wKTtcbiAgICAgICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5idWlsZCh0aGlzLl9yZW5kZXJlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDdWJlR2VvbWV0cnk7IiwiaW1wb3J0IHsgVkVSVElDRV9TSVpFLCBURVhDT09SRF9TSVpFIH0gZnJvbSAnLi4vQ29uc3RhbnRzJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5pbXBvcnQgU2hhZGVyIGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XG5cbmNsYXNzIEdlb21ldHJ5IHtcbiAgICBwcml2YXRlIF92ZXJ0aWNlcyAgICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgcHJpdmF0ZSBfdHJpYW5nbGVzICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuICAgIHByaXZhdGUgX3RleENvb3JkcyAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcbiAgICBwcml2YXRlIF92ZXJ0ZXhCdWZmZXIgICAgICAgICAgICA6IFdlYkdMQnVmZmVyO1xuICAgIHByaXZhdGUgX3RleEJ1ZmZlciAgICAgICAgICAgICAgIDogV2ViR0xCdWZmZXI7XG4gICAgcHJpdmF0ZSBfaW5kZXhCdWZmZXIgICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcbiAgICBwcml2YXRlIF9pbmRleExlbmd0aCAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF9ib3VuZGluZ0JveCAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgICAgOiBSZW5kZXJlcjtcbiAgICBwcm90ZWN0ZWQgX2R5bmFtaWMgICAgICAgICAgICAgICA6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgb2Zmc2V0ICAgICAgICAgICAgICAgICAgICA6IFZlY3RvcjM7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fdmVydGljZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fdGV4Q29vcmRzID0gW107XG4gICAgICAgIHRoaXMuX3RyaWFuZ2xlcyA9IFtdO1xuICAgICAgICB0aGlzLl9ib3VuZGluZ0JveCA9IFtJbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eSwgLUluZmluaXR5XTtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcblxuICAgICAgICB0aGlzLl9keW5hbWljID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFZlcnRpY2UoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl92ZXJ0aWNlcy5wdXNoKHgsIHksIHopO1xuXG4gICAgICAgIC8vIENhbGN1bGF0ZSBib3VuZGluZyBib3hcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSBbXG4gICAgICAgICAgICBNYXRoLm1pbih0aGlzLl9ib3VuZGluZ0JveFswXSwgeCksXG4gICAgICAgICAgICBNYXRoLm1pbih0aGlzLl9ib3VuZGluZ0JveFsxXSwgeSksXG4gICAgICAgICAgICBNYXRoLm1pbih0aGlzLl9ib3VuZGluZ0JveFsyXSwgeiksXG4gICAgICAgICAgICBNYXRoLm1heCh0aGlzLl9ib3VuZGluZ0JveFszXSwgeCksXG4gICAgICAgICAgICBNYXRoLm1heCh0aGlzLl9ib3VuZGluZ0JveFs0XSwgeSksXG4gICAgICAgICAgICBNYXRoLm1heCh0aGlzLl9ib3VuZGluZ0JveFs1XSwgeilcbiAgICAgICAgXTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGFkZFRleENvb3JkKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3RleENvb3Jkcy5wdXNoKHgsIHkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRUcmlhbmdsZSh2ZXJ0MTogbnVtYmVyLCB2ZXJ0MjogbnVtYmVyLCB2ZXJ0MzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNlc1t2ZXJ0MSAqIFZFUlRJQ0VfU0laRV0gPT09IHVuZGVmaW5lZCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJWZXJ0aWNlIFtcIiArIHZlcnQxICsgXCJdIG5vdCBmb3VuZCFcIil9XG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNlc1t2ZXJ0MiAqIFZFUlRJQ0VfU0laRV0gPT09IHVuZGVmaW5lZCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJWZXJ0aWNlIFtcIiArIHZlcnQyICsgXCJdIG5vdCBmb3VuZCFcIil9XG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNlc1t2ZXJ0MyAqIFZFUlRJQ0VfU0laRV0gPT09IHVuZGVmaW5lZCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJWZXJ0aWNlIFtcIiArIHZlcnQzICsgXCJdIG5vdCBmb3VuZCFcIil9XG5cbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzLnB1c2godmVydDEsIHZlcnQyLCB2ZXJ0Myk7XG4gICAgfVxuXG4gICAgcHVibGljIGJ1aWxkKHJlbmRlcmVyOiBSZW5kZXJlcik6IHZvaWQge1xuICAgICAgICBsZXQgZ2wgPSByZW5kZXJlci5HTDtcblxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xuXG4gICAgICAgIHRoaXMuX3ZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5fdmVydGV4QnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fdmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XG5cbiAgICAgICAgdGhpcy5fdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl90ZXhCdWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLl90ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XG5cbiAgICAgICAgdGhpcy5faW5kZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5faW5kZXhCdWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkodGhpcy5fdHJpYW5nbGVzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIHRoaXMuX2luZGV4TGVuZ3RoID0gdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLl92ZXJ0aWNlcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RleENvb3JkcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RyaWFuZ2xlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQm91bmRCb3hBeGlzKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHo6IG51bWJlciA9IDApOiBHZW9tZXRyeSB7XG4gICAgICAgIGlmICh4ID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzBdID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzNdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHkgPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbMV0gPSAwO1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbNF0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHogPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbMl0gPSAwO1xuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbNV0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGxldCBnbCA9IHRoaXMuX3JlbmRlcmVyLkdMO1xuXG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcih0aGlzLl92ZXJ0ZXhCdWZmZXIpO1xuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5fdGV4QnVmZmVyKTtcbiAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKHRoaXMuX2luZGV4QnVmZmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9yZW5kZXJlci5HTCxcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5fdmVydGV4QnVmZmVyKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlc1tcImFWZXJ0ZXhQb3NpdGlvblwiXSwgVkVSVElDRV9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICAgIGlmIChzaGFkZXIuYXR0cmlidXRlc1tcImFUZXhDb29yZHNcIl0pIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl90ZXhCdWZmZXIpO1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlc1tcImFUZXhDb29yZHNcIl0sIFRFWENPT1JEX1NJWkUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLl9pbmRleEJ1ZmZlcik7XG5cbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgdGhpcy5faW5kZXhMZW5ndGgsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzRHluYW1pYygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2R5bmFtaWM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBib3VuZGluZ0JveCgpOiBBcnJheTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdW5kaW5nQm94O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2VvbWV0cnk7IiwiaW1wb3J0IEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvR2VvbWV0cnknO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcblxuY2xhc3MgUGxhbmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy5fZHluYW1pYyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fYnVpbGRQbGFuZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9idWlsZFBsYW5lKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCB3ID0gd2lkdGggLyAyLFxuICAgICAgICAgICAgaCA9IGhlaWdodCAvIDI7XG5cbiAgICAgICAgLy8gVG9wIGZhY2VcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgMCwgIGgpO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICAwLCAgaCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIDAsIC1oKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgMCwgLWgpO1xuXG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMCwgMSwgMik7XG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMSwgMywgMik7XG5cbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDEuMCk7XG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAxLjApO1xuICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMC4wKTtcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDAuMCk7XG5cbiAgICAgICAgdGhpcy5idWlsZCh0aGlzLl9yZW5kZXJlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGFuZUdlb21ldHJ5OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5cbmNsYXNzIFdhbGxHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy5fZHluYW1pYyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fYnVpbGRXYWxsKHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2J1aWxkV2FsbCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgdyA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGggPSBoZWlnaHQgLyAyO1xuXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsICAwKTtcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIDApO1xuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAgMCk7XG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsICAwKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMCwgMSwgMik7XG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMSwgMywgMik7XG5cbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDEuMCk7XG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAxLjApO1xuICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMC4wKTtcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDAuMCk7XG5cbiAgICAgICAgdGhpcy5idWlsZCh0aGlzLl9yZW5kZXJlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsR2VvbWV0cnk7IiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJlciB9IGZyb20gJy4vUmVuZGVyZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBDYW1lcmEgfSBmcm9tICcuL0NhbWVyYSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbXBvbmVudCB9IGZyb20gJy4vQ29tcG9uZW50JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29uZmlnIH0gZnJvbSAnLi9Db25maWcnO1xuZXhwb3J0ICogZnJvbSAnLi9Db25zdGFudHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBJbnB1dCB9IGZyb20gJy4vSW5wdXQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBMaXN0IH0gZnJvbSAnLi9MaXN0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUmVuZGVyaW5nTGF5ZXIgfSBmcm9tICcuL1JlbmRlcmluZ0xheWVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NlbmUgfSBmcm9tICcuL1NjZW5lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dHVyZSB9IGZyb20gJy4vVGV4dHVyZSc7XG5leHBvcnQgKiBmcm9tICcuL1V0aWxzJztcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBCb3hDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbnMvQm94Q29sbGlzaW9uJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29sbGlzaW9uIH0gZnJvbSAnLi9jb2xsaXNpb25zL0NvbGxpc2lvbic7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5zdGFuY2UgfSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dCB9IGZyb20gJy4vZW50aXRpZXMvVGV4dCc7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ3ViZUdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsYW5lR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvUGxhbmVHZW9tZXRyeSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFdhbGxHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9XYWxsR2VvbWV0cnknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQmFzaWNNYXRlcmlhbCB9IGZyb20gJy4vbWF0ZXJpYWxzL0Jhc2ljTWF0ZXJpYWwnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb2xvck1hdGVyaWFsIH0gZnJvbSAnLi9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE1hdGVyaWFsIH0gZnJvbSAnLi9tYXRlcmlhbHMvTWF0ZXJpYWwnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIE1hdHJpeDQgfSBmcm9tICcuL21hdGgvTWF0cml4NCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZlY3RvcjMgfSBmcm9tICcuL21hdGgvVmVjdG9yMyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZlY3RvcjQgfSBmcm9tICcuL21hdGgvVmVjdG9yNCc7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hhZGVyIH0gZnJvbSAnLi9zaGFkZXJzL1NoYWRlcic7XG5leHBvcnQgeyBTaGFkZXJTdHJ1Y3QsIFNoYWRlck1hcCwgU2hhZGVyc05hbWVzIH0gZnJvbSAnLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEJhc2ljIH0gZnJvbSAnLi9zaGFkZXJzL0Jhc2ljJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29sb3IgfSBmcm9tICcuL3NoYWRlcnMvQ29sb3InOyIsImltcG9ydCBNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvTWF0ZXJpYWwnO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4uL1RleHR1cmUnO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XG5cbmNsYXNzIEJhc2ljTWF0ZXJpYWwgZXh0ZW5kcyBNYXRlcmlhbCB7XG4gICAgcHJpdmF0ZSBfdGV4dHVyZSAgICAgICAgIDogVGV4dHVyZTtcbiAgICBwcml2YXRlIF91diAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuICAgIHByaXZhdGUgX3JlcGVhdCAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHRleHR1cmU6IFRleHR1cmUpIHtcbiAgICAgICAgc3VwZXIocmVuZGVyZXIsIFwiQkFTSUNcIik7XG5cbiAgICAgICAgdGhpcy5fdGV4dHVyZSA9IHRleHR1cmU7XG4gICAgICAgIHRoaXMuX3V2ID0gWzAuMCwgMC4wLCAxLjAsIDEuMF07XG4gICAgICAgIHRoaXMuX3JlcGVhdCA9IFsxLjAsIDEuMF07XG4gICAgfVxuXG4gICAgcHVibGljIHNldFV2KHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl91diA9IFt4LCB5LCB3LCBoXTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFJlcGVhdCh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZXBlYXQgPSBbeCwgeV07XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcbiAgICAgICAgaWYgKE1hdGVyaWFsLmxhc3RSZW5kZXJlZCA9PSB0aGlzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBnbCA9IHRoaXMuX3JlbmRlcmVyLkdMLFxuICAgICAgICAgICAgc2hhZGVyID0gU2hhZGVyLmxhc3RQcm9ncmFtO1xuXG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLl90ZXh0dXJlLnRleHR1cmUpO1xuICAgICAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zW1widVRleHR1cmVcIl0sIDApO1xuXG4gICAgICAgIGdsLnVuaWZvcm00ZnYoc2hhZGVyLnVuaWZvcm1zW1widVVWXCJdLCB0aGlzLl91dik7XG4gICAgICAgIGdsLnVuaWZvcm0yZnYoc2hhZGVyLnVuaWZvcm1zW1widVJlcGVhdFwiXSwgdGhpcy5fcmVwZWF0KTtcblxuICAgICAgICBpZiAodGhpcy5fcmVuZGVyQm90aEZhY2VzKSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE1hdGVyaWFsLmxhc3RSZW5kZXJlZCA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc1JlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZS5pc1JlYWR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdGV4dHVyZSgpOiBUZXh0dXJlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RleHR1cmU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNpY01hdGVyaWFsOyIsImltcG9ydCBNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvTWF0ZXJpYWwnO1xuaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XG5pbXBvcnQgU2hhZGVyIGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyJztcblxuY2xhc3MgQ29sb3JNYXRlcmlhbCBleHRlbmRzIE1hdGVyaWFsIHtcbiAgICBwcml2YXRlIF9jb2xvciAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xuXG4gICAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyLCBjb2xvcjogVmVjdG9yNCkge1xuICAgICAgICBzdXBlcihyZW5kZXJlciwgXCJDT0xPUlwiKTtcblxuICAgICAgICB0aGlzLl9jb2xvciA9IGNvbG9yLnRvQXJyYXkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xuICAgICAgICBpZiAoTWF0ZXJpYWwubGFzdFJlbmRlcmVkID09IHRoaXMpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXG4gICAgICAgICAgICBzaGFkZXIgPSBTaGFkZXIubGFzdFByb2dyYW07XG5cbiAgICAgICAgZ2wudW5pZm9ybTRmdihzaGFkZXIudW5pZm9ybXNbXCJ1Q29sb3JcIl0sIHRoaXMuX2NvbG9yKTtcblxuICAgICAgICBpZiAodGhpcy5fcmVuZGVyQm90aEZhY2VzKSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE1hdGVyaWFsLmxhc3RSZW5kZXJlZCA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc1JlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbG9yTWF0ZXJpYWw7IiwiaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcbmltcG9ydCB7IFNoYWRlcnNOYW1lcyB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xuaW1wb3J0IHsgY3JlYXRlVVVJRCB9IGZyb20gJy4uL1V0aWxzJztcblxuYWJzdHJhY3QgY2xhc3MgTWF0ZXJpYWwge1xuICAgIHByb3RlY3RlZCBfcmVuZGVyZXIgICAgICAgICAgICAgICAgOiBSZW5kZXJlcjtcbiAgICBwcm90ZWN0ZWQgX2lzT3BhcXVlICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX3JlbmRlckJvdGhGYWNlcyAgICAgICAgIDogYm9vbGVhbjtcbiAgICBcbiAgICBwdWJsaWMgcmVhZG9ubHkgc2hhZGVyTmFtZSAgICAgICAgOiBTaGFkZXJzTmFtZXM7XG4gICAgcHVibGljIHJlYWRvbmx5IHV1aWQgICAgICAgICAgICAgIDogc3RyaW5nO1xuXG4gICAgcHVibGljIHN0YXRpYyBsYXN0UmVuZGVyZWQgICAgICAgIDogTWF0ZXJpYWwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyLCBzaGFkZXJOYW1lOiBTaGFkZXJzTmFtZXMpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy5zaGFkZXJOYW1lID0gc2hhZGVyTmFtZTtcbiAgICAgICAgdGhpcy51dWlkID0gY3JlYXRlVVVJRCgpO1xuICAgICAgICB0aGlzLl9pc09wYXF1ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX3JlbmRlckJvdGhGYWNlcyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTaGFkZXIoKTogU2hhZGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVyLmdldFNoYWRlcih0aGlzLnNoYWRlck5hbWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhYnN0cmFjdCByZW5kZXIoKTogdm9pZDtcbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0IGlzUmVhZHkoKTogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBnZXQgaXNPcGFxdWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wYXF1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0T3BhcXVlKG9wYXF1ZTogYm9vbGVhbik6IE1hdGVyaWFsIHtcbiAgICAgICAgdGhpcy5faXNPcGFxdWUgPSBvcGFxdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDdWxsaW5nKGJvdGhGYWNlczogYm9vbGVhbik6IE1hdGVyaWFsIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyQm90aEZhY2VzID0gYm90aEZhY2VzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hdGVyaWFsOyIsImltcG9ydCBWZWN0b3I0IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XG5cbmNsYXNzIE1hdHJpeDQge1xuICAgIHB1YmxpYyBkYXRhICAgICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XG4gICAgcHVibGljIGluVXNlICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKC4uLnZhbHVlczogQXJyYXk8bnVtYmVyPikge1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgQXJyYXkoMTYpO1xuXG4gICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hdHJpeDQgbmVlZHMgMTYgdmFsdWVzIHRvIGJlIGNyZWF0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IHZhbHVlc1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXQoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KTogTWF0cml4NCB7XG4gICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoICE9IDE2KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNYXRyaXg0IG5lZWRzIDE2IHZhbHVlcyB0byBiZSBjcmVhdGVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSB2YWx1ZXNbaV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgbXVsdGlwbHkobWF0cml4QjogTWF0cml4NCk6IE1hdHJpeDQge1xuICAgICAgICBsZXQgVDogQXJyYXk8bnVtYmVyPiA9IG1hdHJpeEIuZGF0YTtcblxuICAgICAgICBsZXQgQzEgPSBuZXcgVmVjdG9yNChUWzBdLCBUWzRdLCBUWzhdLCBUWzEyXSk7XG4gICAgICAgIGxldCBDMiA9IG5ldyBWZWN0b3I0KFRbMV0sIFRbNV0sIFRbOV0sIFRbMTNdKTtcbiAgICAgICAgbGV0IEMzID0gbmV3IFZlY3RvcjQoVFsyXSwgVFs2XSwgVFsxMF0sIFRbMTRdKTtcbiAgICAgICAgbGV0IEM0ID0gbmV3IFZlY3RvcjQoVFszXSwgVFs3XSwgVFsxMV0sIFRbMTVdKTtcblxuICAgICAgICBUID0gdGhpcy5kYXRhO1xuICAgICAgICBsZXQgUjEgPSBuZXcgVmVjdG9yNChUWzBdLCBUWzFdLCBUWzJdLCBUWzNdKTtcbiAgICAgICAgbGV0IFIyID0gbmV3IFZlY3RvcjQoVFs0XSwgVFs1XSwgVFs2XSwgVFs3XSk7XG4gICAgICAgIGxldCBSMyA9IG5ldyBWZWN0b3I0KFRbOF0sIFRbOV0sIFRbMTBdLCBUWzExXSk7XG4gICAgICAgIGxldCBSNCA9IG5ldyBWZWN0b3I0KFRbMTJdLCBUWzEzXSwgVFsxNF0sIFRbMTVdKTtcblxuICAgICAgICB0aGlzLnNldChcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIxLCBDMSksIFZlY3RvcjQuZG90KFIxLCBDMiksIFZlY3RvcjQuZG90KFIxLCBDMyksIFZlY3RvcjQuZG90KFIxLCBDNCksXG4gICAgICAgICAgICBWZWN0b3I0LmRvdChSMiwgQzEpLCBWZWN0b3I0LmRvdChSMiwgQzIpLCBWZWN0b3I0LmRvdChSMiwgQzMpLCBWZWN0b3I0LmRvdChSMiwgQzQpLFxuICAgICAgICAgICAgVmVjdG9yNC5kb3QoUjMsIEMxKSwgVmVjdG9yNC5kb3QoUjMsIEMyKSwgVmVjdG9yNC5kb3QoUjMsIEMzKSwgVmVjdG9yNC5kb3QoUjMsIEM0KSxcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFI0LCBDMSksIFZlY3RvcjQuZG90KFI0LCBDMiksIFZlY3RvcjQuZG90KFI0LCBDMyksIFZlY3RvcjQuZG90KFI0LCBDNClcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSArPSB4O1xuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSArPSB5O1xuICAgICAgICAgICAgdGhpcy5kYXRhWzE0XSArPSB6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSA9IHg7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdID0geTtcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0gPSB6O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldElkZW50aXR5KCk6IE1hdHJpeDQge1xuICAgICAgICB0aGlzLnNldChcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2V0SWRlbnRpdHkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUlkZW50aXR5KCk6IE1hdHJpeDQge1xuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAxXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVPcnRobyh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogTWF0cml4NCB7XG4gICAgICAgIGxldCBsID0gLXdpZHRoIC8gMi4wLFxuICAgICAgICAgICAgciA9IHdpZHRoIC8gMi4wLFxuICAgICAgICAgICAgYiA9IC1oZWlnaHQgLyAyLjAsXG4gICAgICAgICAgICB0ID0gaGVpZ2h0IC8gMi4wLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBBID0gMi4wIC8gKHIgLSBsKSxcbiAgICAgICAgICAgIEIgPSAyLjAgLyAodCAtIGIpLFxuICAgICAgICAgICAgQyA9IC0yIC8gKHpmYXIgLSB6bmVhciksXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFggPSAtKHIgKyBsKSAvIChyIC0gbCksXG4gICAgICAgICAgICBZID0gLSh0ICsgYikgLyAodCAtIGIpLFxuICAgICAgICAgICAgWiA9IC0oemZhciArIHpuZWFyKSAvICh6ZmFyIC0gem5lYXIpO1xuXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgIEEsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCBCLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgQywgMCxcbiAgICAgICAgICAgIFgsIFksIFosIDFcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVBlcnNwZWN0aXZlKGZvdjogbnVtYmVyLCByYXRpbzogbnVtYmVyLCB6bmVhcjogbnVtYmVyLCB6ZmFyOiBudW1iZXIpOiBNYXRyaXg0IHtcbiAgICAgICAgbGV0IFMgPSAxIC8gTWF0aC50YW4oZm92IC8gMiksXG4gICAgICAgICAgICBSID0gUyAqIHJhdGlvLFxuICAgICAgICAgICAgQSA9IC0oemZhcikgLyAoemZhciAtIHpuZWFyKSxcbiAgICAgICAgICAgIEIgPSAtKHpmYXIgKiB6bmVhcikgLyAoemZhciAtIHpuZWFyKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgIFMsIDAsIDAsICAwLFxuICAgICAgICAgICAgMCwgUiwgMCwgIDAsXG4gICAgICAgICAgICAwLCAwLCBBLCAtMSxcbiAgICAgICAgICAgIDAsIDAsIEIsICAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVUcmFuc2xhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IE1hdHJpeDQge1xuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAgICAgICB4LCB5LCB6LCAxXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVYUm90YXRpb24ocmFkaWFuczogbnVtYmVyKTogTWF0cml4NCB7XG4gICAgICAgIGxldCBDOiBudW1iZXIgPSBNYXRoLmNvcyhyYWRpYW5zKSxcbiAgICAgICAgICAgIFM6IG51bWJlciA9IE1hdGguc2luKHJhZGlhbnMpO1xuXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgICAxLCAwLCAwLCAwLFxuICAgICAgICAgICAgIDAsIEMsLVMsIDAsXG4gICAgICAgICAgICAgMCwgUywgQywgMCxcbiAgICAgICAgICAgICAwLCAwLCAwLCAxXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVZUm90YXRpb24ocmFkaWFuczogbnVtYmVyKTogTWF0cml4NCB7XG4gICAgICAgIGxldCBDOiBudW1iZXIgPSBNYXRoLmNvcyhyYWRpYW5zKSxcbiAgICAgICAgICAgIFM6IG51bWJlciA9IE1hdGguc2luKHJhZGlhbnMpO1xuXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgICBDLCAwLC1TLCAwLFxuICAgICAgICAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAgICAgICAgUywgMCwgQywgMCxcbiAgICAgICAgICAgICAwLCAwLCAwLCAxXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVaUm90YXRpb24ocmFkaWFuczogbnVtYmVyKTogTWF0cml4NCB7XG4gICAgICAgIGxldCBDOiBudW1iZXIgPSBNYXRoLmNvcyhyYWRpYW5zKSxcbiAgICAgICAgICAgIFM6IG51bWJlciA9IE1hdGguc2luKHJhZGlhbnMpO1xuXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAgICBDLC1TLCAwLCAwLFxuICAgICAgICAgICAgIFMsIEMsIDAsIDAsXG4gICAgICAgICAgICAgMCwgMCwgMSwgMCxcbiAgICAgICAgICAgICAwLCAwLCAwLCAxXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXRyaXg0OyIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvcjMge1xuICAgIHByaXZhdGUgX3ggICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF95ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfeiAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2xlbmd0aCAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIG5lZWRzVXBkYXRlICAgICAgICAgOiBib29sZWFuO1xuXG4gICAgcHVibGljIGluVXNlICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHo6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy5zZXQoeCwgeSwgeik7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCk6IFZlY3RvcjMge1xuICAgICAgICB0aGlzLnNldCgwLCAwLCAwKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBWZWN0b3IzIHtcbiAgICAgICAgdGhpcy5feCA9IHg7XG4gICAgICAgIHRoaXMuX3kgPSB5O1xuICAgICAgICB0aGlzLl96ID0gejtcblxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBWZWN0b3IzIHtcbiAgICAgICAgdGhpcy5feCArPSB4O1xuICAgICAgICB0aGlzLl95ICs9IHk7XG4gICAgICAgIHRoaXMuX3ogKz0gejtcblxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgbXVsdGlwbHkobnVtOiBudW1iZXIpOiBWZWN0b3IzIHtcbiAgICAgICAgdGhpcy5feCAqPSBudW07XG4gICAgICAgIHRoaXMuX3kgKj0gbnVtO1xuICAgICAgICB0aGlzLl96ICo9IG51bTtcblxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgbm9ybWFsaXplKCk6IFZlY3RvcjMge1xuICAgICAgICBsZXQgbCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMubXVsdGlwbHkoMSAvIGwpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9uZSgpOiBWZWN0b3IzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xuICAgIH1cblxuICAgIHB1YmxpYyBlcXVhbHModmVjdG9yMzogVmVjdG9yMyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKHRoaXMueCA9PSB2ZWN0b3IzLnggJiYgdGhpcy55ID09IHZlY3RvcjMueSAmJiB0aGlzLnogPT0gdmVjdG9yMy56KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3g7IH1cbiAgICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3k7IH1cbiAgICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3o7IH1cblxuICAgIHB1YmxpYyBzZXQgeCh4OiBudW1iZXIpIHsgdGhpcy5feCA9IHg7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG4gICAgcHVibGljIHNldCB5KHk6IG51bWJlcikgeyB0aGlzLl95ID0geTsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cbiAgICBwdWJsaWMgc2V0IHooejogbnVtYmVyKSB7IHRoaXMuX3ogPSB6OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueik7XG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSAgZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyb3NzKHZlY3RvckE6IFZlY3RvcjMsIHZlY3RvckI6IFZlY3RvcjMpOiBWZWN0b3IzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKFxuICAgICAgICAgICAgdmVjdG9yQS55ICogdmVjdG9yQi56IC0gdmVjdG9yQS56ICogdmVjdG9yQi55LFxuICAgICAgICAgICAgdmVjdG9yQS56ICogdmVjdG9yQi54IC0gdmVjdG9yQS54ICogdmVjdG9yQi56LFxuICAgICAgICAgICAgdmVjdG9yQS54ICogdmVjdG9yQi55IC0gdmVjdG9yQS55ICogdmVjdG9yQi54XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBkb3QodmVjdG9yQTogVmVjdG9yMywgdmVjdG9yQjogVmVjdG9yMyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB2ZWN0b3JBLnggKiB2ZWN0b3JCLnggKyB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnkgKyB2ZWN0b3JBLnogKiB2ZWN0b3JCLno7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvcjQge1xuICAgIHByaXZhdGUgX3ggICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF95ICAgICAgICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfeiAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3cgICAgICAgICAgICAgICAgICA6IG51bWJlcjtcbiAgICBwcml2YXRlIF9sZW5ndGggICAgICAgICAgICAgOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBuZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNldCh4LCB5LCB6LCB3KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IFZlY3RvcjQge1xuICAgICAgICB0aGlzLl94ID0geDtcbiAgICAgICAgdGhpcy5feSA9IHk7XG4gICAgICAgIHRoaXMuX3ogPSB6O1xuICAgICAgICB0aGlzLl93ID0gdztcblxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IFZlY3RvcjQge1xuICAgICAgICB0aGlzLl94ICs9IHg7XG4gICAgICAgIHRoaXMuX3kgKz0geTtcbiAgICAgICAgdGhpcy5feiArPSB6O1xuICAgICAgICB0aGlzLl93ICs9IHc7XG5cbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG11bHRpcGx5KG51bTogbnVtYmVyKTogVmVjdG9yNCB7XG4gICAgICAgIHRoaXMuX3ggKj0gbnVtO1xuICAgICAgICB0aGlzLl95ICo9IG51bTtcbiAgICAgICAgdGhpcy5feiAqPSBudW07XG4gICAgICAgIHRoaXMuX3cgKj0gbnVtO1xuXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yNCB7XG4gICAgICAgIGxldCBsID0gdGhpcy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5tdWx0aXBseSgxIC8gbCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB0b0FycmF5KCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMud107XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3g7IH1cbiAgICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3k7IH1cbiAgICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3o7IH1cbiAgICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3c7IH1cbiAgICBcbiAgICBwdWJsaWMgc2V0IHgoeDogbnVtYmVyKSB7IHRoaXMuX3ggPSB4OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuICAgIHB1YmxpYyBzZXQgeSh5OiBudW1iZXIpIHsgdGhpcy5feSA9IHk7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XG4gICAgcHVibGljIHNldCB6KHo6IG51bWJlcikgeyB0aGlzLl96ID0gejsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cbiAgICBwdWJsaWMgc2V0IHcodzogbnVtYmVyKSB7IHRoaXMuX3cgPSB3OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxuXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiArIHRoaXMudyAqIHRoaXMudyk7XG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSAgZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGRvdCh2ZWN0b3JBOiBWZWN0b3I0LCB2ZWN0b3JCOiBWZWN0b3I0KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IHJldCA9IHZlY3RvckEueCAqIHZlY3RvckIueCArIHZlY3RvckEueSAqIHZlY3RvckIueSArIHZlY3RvckEueiAqIHZlY3RvckIueiArIHZlY3RvckEudyAqIHZlY3RvckIudztcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG59IiwiaW1wb3J0IHsgU2hhZGVyU3RydWN0IH0gZnJvbSAnLi4vc2hhZGVycy9TaGFkZXJTdHJ1Y3QnO1xuXG5sZXQgQmFzaWM6IFNoYWRlclN0cnVjdCA9IHtcbiAgICB2ZXJ0ZXhTaGFkZXI6IGBcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG5cbiAgICAgICAgYXR0cmlidXRlIHZlYzMgYVZlcnRleFBvc2l0aW9uO1xuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhVGV4Q29vcmRzO1xuXG4gICAgICAgIHVuaWZvcm0gbWF0NCB1UHJvamVjdGlvbjtcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQb3NpdGlvbjtcblxuICAgICAgICB2YXJ5aW5nIHZlYzIgdlRleENvb3JkcztcblxuICAgICAgICB2b2lkIG1haW4odm9pZCkge1xuICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1UHJvamVjdGlvbiAqIHVQb3NpdGlvbiAqIHZlYzQoYVZlcnRleFBvc2l0aW9uLCAxLjApO1xuXG4gICAgICAgICAgICB2VGV4Q29vcmRzID0gYVRleENvb3JkcztcbiAgICAgICAgfVxuICAgIGAsXG5cbiAgICBmcmFnbWVudFNoYWRlcjogYFxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcbiAgICAgICAgXG4gICAgICAgIHVuaWZvcm0gdmVjNCB1VVY7XG4gICAgICAgIHVuaWZvcm0gdmVjMiB1UmVwZWF0O1xuICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1VGV4dHVyZTtcblxuICAgICAgICB2YXJ5aW5nIHZlYzIgdlRleENvb3JkcztcblxuICAgICAgICB2b2lkIG1haW4odm9pZCkge1xuICAgICAgICAgICAgdmVjMiBjb29yZHMgPSBtb2QoY2xhbXAodlRleENvb3JkcywgMC4wLCAxLjApICogdVJlcGVhdCwgMS4wKSAqIHVVVi56dyArIHVVVi54eTtcblxuICAgICAgICAgICAgLy9nbF9GcmFnQ29sb3IgPSB2ZWM0KHRleHR1cmUyRCh1VGV4dHVyZSwgY29vcmRzKS5yZ2IsIDEuMCk7XG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVRleHR1cmUsIGNvb3Jkcyk7O1xuICAgICAgICB9XG4gICAgYFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQmFzaWM7IiwiaW1wb3J0IHsgU2hhZGVyU3RydWN0IH0gZnJvbSAnLi4vc2hhZGVycy9TaGFkZXJTdHJ1Y3QnO1xuXG5sZXQgQ29sb3I6IFNoYWRlclN0cnVjdCA9IHtcbiAgICB2ZXJ0ZXhTaGFkZXI6IGBcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG5cbiAgICAgICAgYXR0cmlidXRlIHZlYzMgYVZlcnRleFBvc2l0aW9uO1xuXG4gICAgICAgIHVuaWZvcm0gbWF0NCB1UHJvamVjdGlvbjtcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQb3NpdGlvbjtcblxuICAgICAgICB2b2lkIG1haW4odm9pZCkge1xuICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1UHJvamVjdGlvbiAqIHVQb3NpdGlvbiAqIHZlYzQoYVZlcnRleFBvc2l0aW9uLCAxLjApO1xuICAgICAgICB9XG4gICAgYCxcblxuICAgIGZyYWdtZW50U2hhZGVyOiBgXG4gICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG4gICAgICAgIHVuaWZvcm0gdmVjNCB1Q29sb3I7XG5cbiAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHVDb2xvcjtcbiAgICAgICAgfVxuICAgIGBcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbG9yOyIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcbmltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuLi9VdGlscyc7XG5cbmludGVyZmFjZSBBdHRyaWJ1dGVzIHtcbiAgICBbaW5kZXg6IHN0cmluZ106IG51bWJlclxufTtcblxuaW50ZXJmYWNlIFVuaWZvcm1zIHtcbiAgICBbaW5kZXg6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uXG59XG5cbmNsYXNzIFNoYWRlciB7XG4gICAgcHVibGljIGF0dHJpYnV0ZXMgICAgICAgICAgICAgICA6IEF0dHJpYnV0ZXM7XG4gICAgcHVibGljIHVuaWZvcm1zICAgICAgICAgICAgICAgICA6IFVuaWZvcm1zO1xuICAgIHB1YmxpYyBwcm9ncmFtICAgICAgICAgICAgICAgICAgOiBXZWJHTFByb2dyYW07XG4gICAgcHVibGljIGF0dHJpYnV0ZXNDb3VudCAgICAgICAgICA6IG51bWJlcjtcblxuICAgIHB1YmxpYyByZWFkb25seSB1dWlkICAgICAgICAgICAgOiBzdHJpbmc7XG5cbiAgICBzdGF0aWMgbWF4QXR0cmliTGVuZ3RoICAgICAgICAgIDogbnVtYmVyO1xuICAgIHN0YXRpYyBsYXN0UHJvZ3JhbSAgICAgICAgICAgICAgOiBTaGFkZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsIHNoYWRlcjogU2hhZGVyU3RydWN0KSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0ge307XG5cbiAgICAgICAgdGhpcy51dWlkID0gY3JlYXRlVVVJRCgpO1xuXG4gICAgICAgIHRoaXMuY29tcGlsZVNoYWRlcnMoc2hhZGVyKTtcbiAgICAgICAgdGhpcy5nZXRTaGFkZXJBdHRyaWJ1dGVzKHNoYWRlcik7XG4gICAgICAgIHRoaXMuZ2V0U2hhZGVyVW5pZm9ybXMoc2hhZGVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbXBpbGVTaGFkZXJzKHNoYWRlcjogU2hhZGVyU3RydWN0KTogdm9pZCB7XG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcblxuICAgICAgICBsZXQgdlNoYWRlcjogV2ViR0xTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIGdsLnNoYWRlclNvdXJjZSh2U2hhZGVyLCBzaGFkZXIudmVydGV4U2hhZGVyKTtcbiAgICAgICAgZ2wuY29tcGlsZVNoYWRlcih2U2hhZGVyKTtcblxuICAgICAgICBsZXQgZlNoYWRlcjogV2ViR0xTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKGZTaGFkZXIsIHNoYWRlci5mcmFnbWVudFNoYWRlcik7XG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIoZlNoYWRlcik7XG5cbiAgICAgICAgdGhpcy5wcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5wcm9ncmFtLCB2U2hhZGVyKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgZlNoYWRlcik7XG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG5cbiAgICAgICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodlNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRTaGFkZXJJbmZvTG9nKHZTaGFkZXIpKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGNvbXBpbGluZyB2ZXJ0ZXggc2hhZGVyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZlNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRTaGFkZXJJbmZvTG9nKGZTaGFkZXIpKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGNvbXBpbGluZyBmcmFnbWVudCBzaGFkZXJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGdsLmdldFByb2dyYW1JbmZvTG9nKHRoaXMucHJvZ3JhbSkpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgbGlua2luZyB0aGUgcHJvZ3JhbVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2hhZGVyQXR0cmlidXRlcyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xuICAgICAgICBsZXQgY29kZTogQXJyYXk8c3RyaW5nPiA9IHNoYWRlci52ZXJ0ZXhTaGFkZXIuc3BsaXQoL1xcbi9nKTtcbiAgICAgICAgbGV0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSB0aGlzLmdsO1xuXG4gICAgICAgIGxldCBhdHRyaWJ1dGU6IHN0cmluZztcbiAgICAgICAgbGV0IGxvY2F0aW9uOiBudW1iZXI7XG5cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzQ291bnQgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgYzogQXJyYXk8c3RyaW5nPiA9IGNvZGVbaV0udHJpbSgpLnNwbGl0KC8gL2cpO1xuXG4gICAgICAgICAgICBpZiAoY1swXSA9PSAnYXR0cmlidXRlJykge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZSA9IGMucG9wKCkucmVwbGFjZSgvOy9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgYXR0cmlidXRlKTtcblxuICAgICAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVdID0gbG9jYXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzQ291bnQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIFNoYWRlci5tYXhBdHRyaWJMZW5ndGggPSBNYXRoLm1heChTaGFkZXIubWF4QXR0cmliTGVuZ3RoLCB0aGlzLmF0dHJpYnV0ZXNDb3VudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTaGFkZXJVbmlmb3JtcyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xuICAgICAgICBsZXQgY29kZTogQXJyYXk8c3RyaW5nPiA9IHNoYWRlci52ZXJ0ZXhTaGFkZXIuc3BsaXQoL1xcbi9nKTtcbiAgICAgICAgY29kZSA9IGNvZGUuY29uY2F0KHNoYWRlci5mcmFnbWVudFNoYWRlci5zcGxpdCgvXFxuL2cpKTtcblxuICAgICAgICBsZXQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IHRoaXMuZ2w7XG5cbiAgICAgICAgbGV0IHVuaWZvcm06IHN0cmluZztcbiAgICAgICAgbGV0IGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcbiAgICAgICAgbGV0IHVzZWRVbmlmb3JtczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgYzogQXJyYXk8c3RyaW5nPiA9IGNvZGVbaV0udHJpbSgpLnNwbGl0KC8gL2cpO1xuXG4gICAgICAgICAgICBpZiAoY1swXSA9PSBcInVuaWZvcm1cIikge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gPSBjLnBvcCgpLnJlcGxhY2UoLzsvZywgXCJcIik7XG4gICAgICAgICAgICAgICAgaWYgKHVzZWRVbmlmb3Jtcy5pbmRleE9mKHVuaWZvcm0pICE9IC0xKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIHVuaWZvcm0pO1xuXG4gICAgICAgICAgICAgICAgdXNlZFVuaWZvcm1zLnB1c2godW5pZm9ybSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm1zW3VuaWZvcm1dID0gbG9jYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdXNlUHJvZ3JhbSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKFNoYWRlci5sYXN0UHJvZ3JhbSA9PSB0aGlzKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcblxuICAgICAgICBnbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgIFNoYWRlci5sYXN0UHJvZ3JhbSA9IHRoaXM7XG5cbiAgICAgICAgbGV0IGF0dHJpYkxlbmd0aDogbnVtYmVyID0gdGhpcy5hdHRyaWJ1dGVzQ291bnQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBTaGFkZXIubWF4QXR0cmliTGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpIDwgYXR0cmliTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuU2hhZGVyLm1heEF0dHJpYkxlbmd0aCA9IDA7XG5TaGFkZXIubGFzdFByb2dyYW0gPSBudWxsO1xuXG5leHBvcnQgZGVmYXVsdCBTaGFkZXI7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIENhbWVyYSwgU2NlbmUsIEN1YmVHZW9tZXRyeSwgQ29sb3JNYXRlcmlhbCwgVmVjdG9yNCwgSW5zdGFuY2UgfSBmcm9tICcuLi8uLi9lbmdpbmUnO1xuXG5jbGFzcyBBcHAge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCByZW5kZXIgPSBuZXcgUmVuZGVyZXIoODU0LCA0ODApO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpdkdhbWVcIikuYXBwZW5kQ2hpbGQocmVuZGVyLmNhbnZhcylcblxuICAgICAgICBjb25zdCBjYW1lcmEgPSBDYW1lcmEuY3JlYXRlUGVyc3BlY3RpdmUoOTAsIDg1NC80ODAsIDAuMSwgMTAwMC4wKTtcbiAgICAgICAgY2FtZXJhLnNldFBvc2l0aW9uKDEwLCAxMCwgMTApO1xuICAgICAgICBjYW1lcmEuc2V0VGFyZ2V0KDAsIDAsIDApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZ2VvID0gbmV3IEN1YmVHZW9tZXRyeShyZW5kZXIsIDIsIDIsIDIpO1xuICAgICAgICBjb25zdCBtYXQgPSBuZXcgQ29sb3JNYXRlcmlhbChyZW5kZXIsIG5ldyBWZWN0b3I0KDEuMCwgMS4wLCAxLjAsIDEuMCkpO1xuICAgICAgICBjb25zdCBpbnN0ID0gbmV3IEluc3RhbmNlKHJlbmRlciwgZ2VvLCBtYXQpO1xuXG4gICAgICAgIGNvbnN0IHNjZW5lID0gbmV3IFNjZW5lKHJlbmRlcik7XG4gICAgICAgIHNjZW5lLnNldENhbWVyYShjYW1lcmEpO1xuICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KGluc3QpO1xuXG4gICAgICAgIHNjZW5lLmluaXQoKTtcblxuICAgICAgICB0aGlzLl9sb29wKHJlbmRlciwgc2NlbmUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2xvb3AocmVuZGVyOiBSZW5kZXJlciwgc2NlbmU6IFNjZW5lKSB7XG4gICAgICAgIHJlbmRlci5jbGVhcigpO1xuXG4gICAgICAgIHNjZW5lLnJlbmRlcigpO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9sb29wKHJlbmRlciwgc2NlbmUpKTtcbiAgICB9XG59XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiBuZXcgQXBwKCk7Il19
