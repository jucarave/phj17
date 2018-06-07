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
var TexturesManager_1 = require("managers/TexturesManager");
var ModelsManager_1 = require("managers/ModelsManager");
var SectorsManager_1 = require("managers/SectorsManager");
var DemoScene_1 = require("scenes/DemoScene");
var CANVAS_WIDTH = 854;
var CANVAS_HEIGHT = 480;
var CAMERA_FOV = 105 * Math.PI / 180;
var CAMERA_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
var CAMERA_ZNEAR = 0.1;
var CAMERA_ZFAR = 1000;
var CAMERA_ORTHO_WIDTH = (CANVAS_WIDTH / 4) << 0;
var CAMERA_ORTHO_HEIGHT = (CANVAS_HEIGHT / 4) << 0;
var App = (function () {
    function App() {
        this._stats = new Stats();
        this._renderer = new engine_1.Renderer(CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById("divGame"));
        engine_1.Input.init(this._renderer.canvas);
        TexturesManager_1.default.init(this._renderer);
        ModelsManager_1.default.init(this._renderer);
        SectorsManager_1.default.init(this._renderer);
        this.camera = engine_1.Camera.createPerspective(CAMERA_FOV, CAMERA_RATIO, CAMERA_ZNEAR, CAMERA_ZFAR);
        this.cameraOrtho = engine_1.Camera.createOrthographic(CAMERA_ORTHO_WIDTH, CAMERA_ORTHO_HEIGHT, CAMERA_ZNEAR, CAMERA_ZFAR);
        this.cameraOrtho.setPosition(0, 0, 5);
        this.cameraOrtho.setTarget(0, 0, 0);
        this._waitLoad();
    }
    App.prototype._waitLoad = function () {
        var _this = this;
        if (TexturesManager_1.default.isReady() && ModelsManager_1.default.isReady()) {
            this._scene = new DemoScene_1.default(this, this._renderer);
            this._scene.init();
            this._stats.showPanel(1);
            document.body.appendChild(this._stats.dom);
            this._loop();
        }
        else {
            requestAnimationFrame(function () { _this._waitLoad(); });
        }
    };
    App.prototype._loop = function () {
        var _this = this;
        this._stats.begin();
        this._scene.update();
        this._renderer.clear();
        this._scene.render();
        this._stats.end();
        requestAnimationFrame(function () { _this._loop(); });
    };
    return App;
}());
window.onload = function () {
    document.body.removeChild(document.getElementsByTagName("h1")[0]);
    return new App();
};
exports.default = App;
},{"../../engine":21,"managers/ModelsManager":38,"managers/SectorsManager":39,"managers/TexturesManager":40,"scenes/DemoScene":42}],32:[function(require,module,exports){
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
var engine_1 = require("../../../engine");
var CharaComponent = (function (_super) {
    __extends(CharaComponent, _super);
    function CharaComponent() {
        return _super.call(this, CharaComponent.componentName) || this;
    }
    CharaComponent.prototype.moveTo = function (xTo, zTo) {
        var dir = engine_1.vec3(xTo, 0, zTo), collision = this._instance.scene.testCollision(this._instance, dir);
        if (collision.x != 0 || collision.z != 0) {
            this._instance.translate(collision.x, 0, collision.z, true);
            this._moved = true;
        }
        dir.delete();
    };
    CharaComponent.prototype.awake = function () {
    };
    CharaComponent.prototype.destroy = function () {
    };
    CharaComponent.prototype.update = function () {
        this._moved = false;
    };
    Object.defineProperty(CharaComponent.prototype, "moved", {
        get: function () {
            return this._moved;
        },
        enumerable: true,
        configurable: true
    });
    CharaComponent.componentName = "CharaComponent";
    return CharaComponent;
}(engine_1.Component));
exports.default = CharaComponent;
},{"../../../engine":21}],33:[function(require,module,exports){
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
var engine_1 = require("../../../engine");
var CharaComponent_1 = require("components/CharaComponent");
var ang45 = engine_1.degToRad(45), ang135 = engine_1.degToRad(135), ang225 = engine_1.degToRad(225), ang315 = engine_1.degToRad(315);
var CharaRendererComponent = (function (_super) {
    __extends(CharaRendererComponent, _super);
    function CharaRendererComponent(uv) {
        var _this = _super.call(this, CharaRendererComponent.componentName) || this;
        _this._uvs = uv;
        return _this;
    }
    CharaRendererComponent.prototype.awake = function () {
        var _this = this;
        this._material = this._instance.material;
        var uv = this._material.texture.getUVS(this._uvs.FRONT);
        this._material.setUv(uv.x, uv.y, uv.z, uv.w);
        this._scene = this._instance.scene;
        this._player = this._scene.player;
        this._charaComponent = this._instance.getComponent(CharaComponent_1.default.componentName);
        if (!this._charaComponent) {
            throw new Error("CharaRendererComponent requires CharaComponent");
        }
        this._playerCharaComponent = this._player.getComponent(CharaComponent_1.default.componentName);
        setTimeout(function () {
            _this._instance.destroy();
        }, 3000);
    };
    CharaRendererComponent.prototype.update = function () {
        if (this._playerCharaComponent.moved) {
            var ang = engine_1.get2DAngle(this._instance.position, this._player.position), uv = void 0;
            if (ang >= ang45 && ang < ang135) {
                uv = this._material.texture.getUVS(this._uvs.LEFT);
            }
            else if (ang >= ang135 && ang < ang225) {
                uv = this._material.texture.getUVS(this._uvs.BACK);
            }
            else if (ang >= ang225 && ang < ang315) {
                uv = this._material.texture.getUVS(this._uvs.RIGHT);
            }
            else {
                uv = this._material.texture.getUVS(this._uvs.FRONT);
            }
            this._material.setUv(uv.x, uv.y, uv.z, uv.w);
        }
    };
    CharaRendererComponent.prototype.destroy = function () {
    };
    CharaRendererComponent.componentName = "CharaRendererComponent";
    return CharaRendererComponent;
}(engine_1.Component));
exports.default = CharaRendererComponent;
},{"../../../engine":21,"components/CharaComponent":32}],34:[function(require,module,exports){
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
var engine_1 = require("../../../engine");
var CharaComponent_1 = require("components/CharaComponent");
var LIMIT_ROTATION = engine_1.degToRad(70);
var CONTROLS = {
    UP: 0,
    LEFT: 1,
    RIGHT: 2,
    DOWN: 3
};
var PlayerComponent = (function (_super) {
    __extends(PlayerComponent, _super);
    function PlayerComponent() {
        var _this = _super.call(this, PlayerComponent.componentName) || this;
        _this._keys = [];
        _this._callbackIds = [];
        _this._camera = null;
        _this._height = 1.3;
        return _this;
    }
    PlayerComponent.prototype._getKeyId = function (keyCode) {
        switch (keyCode) {
            case 65: return CONTROLS.LEFT;
            case 83: return CONTROLS.DOWN;
            case 68: return CONTROLS.RIGHT;
            case 87: return CONTROLS.UP;
            default: return null;
        }
    };
    PlayerComponent.prototype._handleKeyboard = function (keyCode, position) {
        var keyId = this._getKeyId(keyCode);
        if (keyId === null) {
            return;
        }
        if (position == 1 && this._keys[keyId] == 2) {
            return;
        }
        this._keys[keyId] = position;
    };
    PlayerComponent.prototype._handleMouseMove = function (dx, dy) {
        var rot = this._instance.rotation, ang_y = rot.y - engine_1.degToRad(dx), ang_x = rot.x - engine_1.degToRad(dy);
        if (ang_x > LIMIT_ROTATION) {
            ang_x = LIMIT_ROTATION;
        }
        else if (ang_x < -LIMIT_ROTATION) {
            ang_x = -LIMIT_ROTATION;
        }
        this._instance.rotate(ang_x, ang_y, 0);
    };
    PlayerComponent.prototype._updateMovement = function () {
        var x = 0, y = 0;
        if (this._keys[CONTROLS.UP]) {
            y = -1;
        }
        else if (this._keys[CONTROLS.DOWN]) {
            y = 1;
        }
        if (this._keys[CONTROLS.RIGHT]) {
            x = 1;
        }
        else if (this._keys[CONTROLS.LEFT]) {
            x = -1;
        }
        if (x != 0 || y != 0) {
            var rot = this._instance.rotation, spd = 0.05, angVar = engine_1.get2DVectorDir(x, y) - engine_1.PI_2, xTo = Math.cos(rot.y + angVar) * spd, zTo = -Math.sin(rot.y + angVar) * spd;
            this._charaComponent.moveTo(xTo, zTo);
        }
    };
    PlayerComponent.prototype._updateCamera = function () {
        if (!this._camera) {
            return;
        }
        var pos = this._instance.position, rot = this._instance.rotation;
        this._camera.setPosition(pos.x, pos.y + this._height, pos.z);
        var c = Math.cos(rot.x), xTo = pos.x + Math.cos(rot.y) * c, yTo = pos.y + this._height + Math.sin(rot.x), zTo = pos.z - Math.sin(rot.y) * c;
        this._camera.setTarget(xTo, yTo, zTo);
    };
    PlayerComponent.prototype.setCamera = function (camera) {
        this._camera = camera;
    };
    PlayerComponent.prototype.awake = function () {
        var _this = this;
        this._callbackIds.push(engine_1.Input.onKeydown(function (keyCode) { _this._handleKeyboard(keyCode, 1); }));
        this._callbackIds.push(engine_1.Input.onKeyup(function (keyCode) { _this._handleKeyboard(keyCode, 0); }));
        this._callbackIds.push(engine_1.Input.onMouseMove(function (dx, dy) { _this._handleMouseMove(dx, dy); }));
        this._charaComponent = this._instance.getComponent(CharaComponent_1.default.componentName);
        if (!this._charaComponent) {
            throw new Error("PlayerComponent requires CharaComponent");
        }
    };
    PlayerComponent.prototype.destroy = function () {
        for (var i = 0, id = void 0; id = this._callbackIds[i]; i++) {
            engine_1.Input.deleteCallback(id);
        }
    };
    PlayerComponent.prototype.update = function () {
        this._updateMovement();
        this._updateCamera();
    };
    Object.defineProperty(PlayerComponent.prototype, "moved", {
        get: function () {
            return this._charaComponent.moved;
        },
        enumerable: true,
        configurable: true
    });
    PlayerComponent.componentName = "PlayerComponent";
    return PlayerComponent;
}(engine_1.Component));
exports.default = PlayerComponent;
},{"../../../engine":21,"components/CharaComponent":32}],35:[function(require,module,exports){
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
var engine_1 = require("../../../engine");
var SectorSolidComponent = (function (_super) {
    __extends(SectorSolidComponent, _super);
    function SectorSolidComponent() {
        var _this = _super.call(this, SectorSolidComponent.componentName) || this;
        _this._sectors = [];
        return _this;
    }
    SectorSolidComponent.prototype._updateCollisions = function () {
        for (var i = 0, sector = void 0; sector = this._sectors[i]; i++) {
            sector.clearCollision(this._instance.collision);
        }
        var sectors = this._scene.getIntersectingSectors(this._instance);
        this._sectors = sectors;
        for (var i = 0, sector = void 0; sector = sectors[i]; i++) {
            sector.registerCollision(this._instance.collision);
        }
    };
    SectorSolidComponent.prototype.awake = function () {
        this._scene = this._instance.scene;
        this._updateCollisions();
    };
    SectorSolidComponent.prototype.update = function () {
    };
    SectorSolidComponent.prototype.destroy = function () {
    };
    SectorSolidComponent.componentName = "SectorSolidComponent";
    return SectorSolidComponent;
}(engine_1.Component));
exports.default = SectorSolidComponent;
},{"../../../engine":21}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var PlayerComponent_1 = require("components/PlayerComponent");
var CharaComponent_1 = require("components/CharaComponent");
var CharaRendererComponent_1 = require("components/CharaRendererComponent");
var SectorSolidComponent_1 = require("components/SectorSolidComponent");
var TexturesManager_1 = require("managers/TexturesManager");
var UVManager_1 = require("managers/UVManager");
var EntityFactory = (function () {
    function EntityFactory() {
    }
    EntityFactory.createPlayer = function (renderer, camera) {
        var ret = engine_1.Instance.allocate(renderer), playerComponent = new PlayerComponent_1.default();
        playerComponent.setCamera(camera);
        ret.addComponent(new CharaComponent_1.default());
        ret.addComponent(playerComponent);
        return ret;
    };
    EntityFactory.createAlleyGuy = function (renderer) {
        var size = engine_1.rememberPoolAlloc(engine_1.pixelCoordsToWorld(engine_1.vec3(12, 26))), geometry = new engine_1.WallGeometry(renderer, size.x, size.y), texture = TexturesManager_1.default.getTexture("NPCS"), material = new engine_1.BasicMaterial(renderer, texture), uv = UVManager_1.default.NPCS.ALLEY_PERSON, ret = engine_1.Instance.allocate(renderer, geometry, material), collisionSize = engine_1.rememberPoolAlloc(engine_1.pixelCoordsToWorld(engine_1.vec3(8, 23, 8))), bc = (new engine_1.BoxCollision(ret.position, collisionSize)).centerInAxis(true, false, true);
        geometry.offset.set(0, size.y / 2, 0);
        bc.isDynamic = true;
        ret.addComponent(new CharaComponent_1.default());
        ret.addComponent(new CharaRendererComponent_1.default(uv));
        ret.addComponent(new SectorSolidComponent_1.default());
        ret.setCollision(bc);
        ret.isBillboard = true;
        material.setOpaque(false);
        engine_1.freePoolAlloc();
        return ret;
    };
    EntityFactory.createInstance = function (renderer, name, position) {
        var ins;
        switch (name) {
            case 'ALLEY_GUY':
                ins = this.createAlleyGuy(renderer);
                break;
        }
        ins.position.add(position.x, position.y, position.z);
        return ins;
    };
    return EntityFactory;
}());
exports.default = EntityFactory;
},{"../../../engine":21,"components/CharaComponent":32,"components/CharaRendererComponent":33,"components/PlayerComponent":34,"components/SectorSolidComponent":35,"managers/TexturesManager":40,"managers/UVManager":41}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var TexturesManager_1 = require("managers/TexturesManager");
var ModelsManager_1 = require("managers/ModelsManager");
var PropsFactory = (function () {
    function PropsFactory() {
    }
    PropsFactory._createMaterial = function (renderer, texture, uv, repeat) {
        var ret = new engine_1.BasicMaterial(renderer, texture);
        if (repeat)
            ret.setRepeat(repeat[0], repeat[1]);
        if (uv)
            ret.setUv(uv.x, uv.y, uv.z, uv.w);
        return ret;
    };
    PropsFactory._processObjectProperties = function (object, options) {
        if (options.position) {
            object.translate(options.position.x, options.position.y, options.position.z, true);
        }
        if (options.rotation) {
            object.rotate(options.rotation.x, options.rotation.y, options.rotation.z);
        }
        if (options.culling !== undefined) {
            object.material.setCulling(options.culling);
        }
        if (options.opaque !== undefined) {
            object.material.setOpaque(options.opaque);
        }
        if (options.billboard) {
            object.isBillboard = options.billboard;
        }
        return object;
    };
    PropsFactory._centerObjectInGrid = function (object, options) {
        var bbox = object.geometry.boundingBox;
        var x = -bbox[0], y = -bbox[1], z = -bbox[2];
        if (options.rotation && (options.rotation.y == engine_1.PI_2 || options.rotation.y == engine_1.PI3_2)) {
            x = -bbox[2];
            z = -bbox[0];
        }
        object.translate(x, y, z);
        return object;
    };
    PropsFactory.create3DModel = function (renderer, options) {
        var material = null, model = ModelsManager_1.default.getModel(options.model), object;
        if (model.material) {
            material = model.material;
        }
        else if (options.texture) {
            material = this._createMaterial(renderer, TexturesManager_1.default.getTexture(options.texture));
        }
        else if (options.material) {
            material = options.material;
        }
        object = engine_1.Instance.allocate(renderer, model.geometry, material);
        this._centerObjectInGrid(object, options);
        return this._processObjectProperties(object, options);
    };
    PropsFactory.createText = function (renderer, options) {
        return new engine_1.Text(renderer, options.text, options.font, { position: options.position, rotation: options.rotation, size: options.fontSize });
    };
    PropsFactory.createFloor = function (renderer, options) {
        var geometry = new engine_1.PlaneGeometry(renderer, options.size.x, options.size.y), texture = TexturesManager_1.default.getTexture(options.texture), material = this._createMaterial(renderer, texture, texture.getUVS(options.uv), options.repeat), object = engine_1.Instance.allocate(renderer, geometry, material);
        var bbox = geometry.boundingBox;
        object.translate(-bbox[0], -bbox[1], -bbox[2]);
        return this._processObjectProperties(object, options);
    };
    PropsFactory.createWall = function (renderer, options) {
        var geometry = new engine_1.WallGeometry(renderer, options.size.x, options.size.y), texture = TexturesManager_1.default.getTexture(options.texture), material = this._createMaterial(renderer, texture, texture.getUVS(options.uv), options.repeat), object = engine_1.Instance.allocate(renderer, geometry, material);
        this._centerObjectInGrid(object, options);
        return this._processObjectProperties(object, options);
    };
    PropsFactory.createProp = function (renderer, propName, options) {
        var name = propName, obj;
        switch (name) {
            case 'Model3D':
                obj = PropsFactory.create3DModel(renderer, options);
                break;
            case 'Text':
                obj = PropsFactory.createText(renderer, options);
                break;
            case 'Floor':
                obj = PropsFactory.createFloor(renderer, options);
                break;
            case 'Wall':
                obj = PropsFactory.createWall(renderer, options);
                break;
            default:
                throw new Error("Prop [" + propName + "] not found!");
        }
        return obj;
    };
    return PropsFactory;
}());
exports.default = PropsFactory;
},{"../../../engine":21,"managers/ModelsManager":38,"managers/TexturesManager":40}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var ModelsManager = (function () {
    function ModelsManager() {
        this._models = {};
        this._modelsCount = 0;
        this._modelsReady = 0;
    }
    ModelsManager.prototype._loadModel = function (modelName, renderer, clearBBAxis) {
        var _this = this;
        this._modelsCount++;
        engine_1.httpRequest("data/" + modelName + ".obj", function (data) {
            var lines = data.split("\n"), vertices = [], texCoords = [], geometry = new engine_1.Geometry(), indCount = 0;
            for (var i = 0, line = void 0; line = lines[i]; i++) {
                line = line.trim();
                if (line.charAt(0) == "#") {
                    continue;
                }
                var args = line.split(" ");
                if (args[0] == "v") {
                    vertices.push(new engine_1.Vector3().set(parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3])));
                }
                else if (args[0] == "vt") {
                    texCoords.push(new engine_1.Vector3().set(parseFloat(args[1]), parseFloat(args[2]), 0));
                }
                else if (args[0] == "f") {
                    for (var j = 1; j <= 3; j++) {
                        var indices = args[j].split("/"), vertex = vertices[parseInt(indices[0]) - 1], texCoord = texCoords[parseInt(indices[1]) - 1];
                        geometry.addVertice(vertex.x, vertex.y, vertex.z);
                        geometry.addTexCoord(texCoord.x, 1 - texCoord.y);
                    }
                    geometry.addTriangle(indCount++, indCount++, indCount++);
                }
            }
            geometry.build(renderer);
            if (clearBBAxis) {
                geometry.clearBoundBoxAxis(clearBBAxis[0], clearBBAxis[1], clearBBAxis[2]);
            }
            _this._modelsReady++;
            var obj = {
                geometry: geometry,
                material: null
            };
            _this._models[modelName] = obj;
        });
    };
    ModelsManager.prototype.init = function (renderer) {
        this._loadModel("BarSign", renderer);
        this._loadModel("Dumpster", renderer);
        this._loadModel("BarWindow", renderer, [1, 0, 0]);
        this._loadModel("BarDoorFrame", renderer, [1, 0, 0]);
        this._loadModel("BarDoor", renderer);
        this._loadModel("Barrel", renderer);
    };
    ModelsManager.prototype.getModel = function (name) {
        return this._models[name];
    };
    ModelsManager.prototype.isReady = function () {
        return this._modelsCount == this._modelsReady;
    };
    return ModelsManager;
}());
exports.default = (new ModelsManager());
},{"../../../engine":21}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var Sector_1 = require("scenes/Sector");
var UVManager_1 = require("managers/UVManager");
var SectorsManager = (function () {
    function SectorsManager() {
        this._sectors = {};
    }
    SectorsManager.prototype._buildAlley = function (renderer) {
        var sector = new Sector_1.default(renderer, new engine_1.Vector3(0.0, 0.0, 0.0), new engine_1.Vector3(3.0, 8.0, 9.0)), sectorName = 'ALLEY', city = UVManager_1.default.CITY;
        sector.addProp("Floor", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(0.0, 0.0, 0.0)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(144, 48)), uv: city.ALLEY_FLOOR, repeat: [9, 3] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(0.0, 0.0, 0.0)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(144, 128)), uv: city.BLACK_BUILDING, repeat: [9, 8] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(0.0, 0.0, 0.0)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(48, 36)), uv: city.ALLEY_BACK_WALL, repeat: [3, 1] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(0.0, 0.0, 48)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(32, 48)), rotation: new engine_1.Vector3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [2, 1] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(64, 0.0, 48)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(16, 48)), rotation: new engine_1.Vector3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [1, 1] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(96, 0.0, 48)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(16, 48)), rotation: new engine_1.Vector3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [1, 1] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(128, 0.0, 48)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(16, 48)), rotation: new engine_1.Vector3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [1, 1] });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(128, 0.0, 0.0)), rotation: new engine_1.Vector3(0, engine_1.PI3_2, 0), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(48, 32)), uv: city.ALLEY_FENCE, repeat: [3, 1], opaque: false });
        sector.addProp("Wall", { texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(24, 0.0, 40)), size: engine_1.pixelCoordsToWorld(new engine_1.Vector3(10, 11)), uv: city.BAR_FLOOR_SIGN, billboard: true });
        sector.addProp("Model3D", { model: 'Dumpster', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(0.0, 0.0, 8.0)), culling: true });
        sector.addProp("Model3D", { model: 'BarSign', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(32, 26, 48)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0), culling: true });
        sector.addProp("Model3D", { model: 'BarWindow', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(80, 0.0, 48)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0) });
        sector.addProp("Model3D", { model: 'BarWindow', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(112, 0.0, 48)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0) });
        sector.addProp("Model3D", { model: 'BarDoorFrame', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(32, 0.0, 48)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0) });
        sector.addProp("Model3D", { model: 'BarDoor', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(41, 0.0, 48)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0), opaque: false });
        sector.addProp("Model3D", { model: 'Barrel', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(66, 0.0, 2)) });
        sector.addProp("Model3D", { model: 'Barrel', texture: 'CITY', position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(80, 0.0, 2)), rotation: new engine_1.Vector3(0, -engine_1.PI_2, 0) });
        sector.addProp("Text", { text: "Jucarave", font: "retganon", fontSize: 36, position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(48, 24, 24)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0), opaque: false });
        sector.addProp("Text", { text: "A Game By", font: "retganon", fontSize: 36, position: engine_1.pixelCoordsToWorld(new engine_1.Vector3(80, 16, 24)), rotation: new engine_1.Vector3(0, engine_1.PI_2, 0), opaque: false });
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(0, 0, -1)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(144, 128, 2)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(-1, 0, 0)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(2, 36, 48)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(0, 0, 47)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(41, 48, 2)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(55, 0, 47)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(89, 48, 2)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(127, 0, 0)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(2, 32, 48)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(0, 0, 8)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(16, 16, 30)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(22, 0, 36)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(12, 12, 12)))).centerInAxis(false, false, false));
        sector.registerCollision((new engine_1.BoxCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(66, 0, 0)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(27, 16, 16)))).centerInAxis(false, false, false));
        sector.setCollision(engine_1.pixelCoordsToWorld(new engine_1.Vector3(0, 0, 0)), engine_1.pixelCoordsToWorld(new engine_1.Vector3(144, 128, 48)));
        this._sectors[sectorName] = sector;
    };
    SectorsManager.prototype.init = function (renderer) {
        this._buildAlley(renderer);
    };
    SectorsManager.prototype.getSector = function (sectorName) {
        return this._sectors[sectorName];
    };
    return SectorsManager;
}());
exports.default = (new SectorsManager());
},{"../../../engine":21,"managers/UVManager":41,"scenes/Sector":44}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var TexturesManager = (function () {
    function TexturesManager() {
        this._textures = {};
        this._texturesCount = 0;
        this._texturesReady = 0;
    }
    TexturesManager.prototype._onTextureLoad = function () {
        this._texturesReady += 1;
    };
    TexturesManager.prototype._loadTexture = function (renderer, code, url) {
        var _this = this;
        this._texturesCount += 1;
        this._textures[code] = new engine_1.Texture(url, renderer, function () { _this._onTextureLoad(); });
    };
    TexturesManager.prototype.init = function (renderer) {
        this._loadTexture(renderer, 'TEXTURE_16', "img/texture.png");
        this._loadTexture(renderer, 'CITY', "img/city.png");
        this._loadTexture(renderer, 'NPCS', "img/npcs.png");
        this._loadTexture(renderer, 'MOCKGUN', "img/mockGun.png");
    };
    TexturesManager.prototype.getTexture = function (textureName) {
        return this._textures[textureName];
    };
    TexturesManager.prototype.isReady = function () {
        return this._texturesReady == this._texturesCount;
    };
    return TexturesManager;
}());
exports.default = (new TexturesManager());
},{"../../../engine":21}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var UVManager = {
    CITY: {
        ALLEY_FLOOR: new engine_1.Vector4(1, 1, 16, 16),
        ALLEY_FENCE: new engine_1.Vector4(19, 1, 16, 32),
        ALLEY_BACK_WALL: new engine_1.Vector4(1, 19, 16, 36),
        BAR_FLOOR_SIGN: new engine_1.Vector4(22, 76, 10, 11),
        BAR_EXT_WALL: new engine_1.Vector4(1, 53, 16, 48),
        BLACK_WINDOW: new engine_1.Vector4(19, 40, 16, 16),
        BLACK_BUILDING: new engine_1.Vector4(1, 103, 16, 16)
    },
    NPCS: {
        ALLEY_PERSON: {
            FRONT: new engine_1.Vector4(1, 1, 12, 25),
            LEFT: new engine_1.Vector4(25, 1, -12, 25),
            RIGHT: new engine_1.Vector4(13, 1, 12, 25),
            BACK: new engine_1.Vector4(25, 1, 12, 25)
        }
    }
};
exports.default = UVManager;
},{"../../../engine":21}],42:[function(require,module,exports){
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
var engine_1 = require("../../../engine");
var EntityFactory_1 = require("factories/EntityFactory");
var SectorsManager_1 = require("managers/SectorsManager");
var HUDScene_1 = require("scenes/HUDScene");
var PlayerComponent_1 = require("components/PlayerComponent");
var DemoScene = (function (_super) {
    __extends(DemoScene, _super);
    function DemoScene(app, renderer) {
        var _this = _super.call(this, renderer) || this;
        _this._app = app;
        _this._triggers = [];
        _this._sectors = [];
        _this._buildScene();
        return _this;
    }
    DemoScene.prototype._addTrigger = function (position, size, sector, destroy) {
        this._triggers.push({
            position: position,
            size: size,
            sector: sector,
            destroy: destroy
        });
    };
    DemoScene.prototype._addSectorInstances = function (sector) {
        sector.build();
        var instances = sector.instances;
        for (var i = 0, ins = void 0; ins = instances[i]; i++) {
            this.addGameObject(ins);
        }
    };
    DemoScene.prototype._buildScene = function () {
        var camera = this._app.camera, player = EntityFactory_1.default.createPlayer(this._renderer, camera);
        var sector = SectorsManager_1.default.getSector("ALLEY");
        sector.setScene(this);
        sector.displayCollisions();
        this._sectors.push(sector);
        this._addSectorInstances(sector);
        this._addTrigger(new engine_1.Vector3(0.0, 0.0, 1.5), new engine_1.Vector3(9.0, 10.0, 4.5), sector, false);
        this._addTrigger(new engine_1.Vector3(0.0, 0.0, 6.0), new engine_1.Vector3(9.0, 10.0, 4.5), sector, true);
        this.addGameObject(EntityFactory_1.default.createAlleyGuy(this._renderer).translate(engine_1.rememberPoolAlloc(engine_1.pixelCoordsToWorld(engine_1.vec3(24, 0, 8)))));
        this.addGameObject(player.translate(engine_1.rememberPoolAlloc(engine_1.pixelCoordsToWorld(engine_1.vec3(112, 0.0, 24)))).rotate(0, Math.PI, 0));
        this.setCamera(camera);
        this._hud = new HUDScene_1.default(this._app, this._renderer);
        this._player = player;
        this._playerComponent = player.getComponent(PlayerComponent_1.default.componentName);
        engine_1.freePoolAlloc();
    };
    DemoScene.prototype.testCollision = function (instance, direction) {
        var position = instance.position, insCol = instance.collision;
        for (var i = 0, sector = void 0; sector = this._sectors[i]; i++) {
            if (sector.collision.test(position, direction)) {
                for (var j = 0, collision = void 0; collision = sector.solidInstances[j]; j++) {
                    if (collision == insCol) {
                        continue;
                    }
                    var result = collision.test(position, direction);
                    if (result) {
                        direction = result;
                    }
                }
            }
        }
        return direction;
    };
    DemoScene.prototype.getIntersectingSectors = function (instance) {
        var ret = [], pos = instance.position, dir = engine_1.vec3(0, 0, 0);
        for (var i = 0, sector = void 0; sector = this._sectors[i]; i++) {
            if (sector.collision.test(pos, dir)) {
                ret.push(sector);
            }
        }
        dir.delete();
        return ret;
    };
    DemoScene.prototype.update = function () {
        _super.prototype.update.call(this);
        if (!this._playerComponent.moved) {
            return;
        }
        var p = this._player.position;
        for (var i = 0, trig = void 0; trig = this._triggers[i]; i++) {
            var tp = trig.position, ts = trig.size;
            if (p.x < tp.x || p.x >= tp.x + ts.x || p.y < tp.y || p.y >= tp.y + ts.y || p.z < tp.z || p.z >= tp.z + ts.z) {
                continue;
            }
            if (trig.destroy) {
                trig.sector.destroy();
            }
            else {
                var ret = trig.sector.build();
                if (ret != null) {
                    this._addSectorInstances(trig.sector);
                }
            }
            break;
        }
    };
    DemoScene.prototype.render = function () {
        _super.prototype.render.call(this);
        this._hud.render();
    };
    Object.defineProperty(DemoScene.prototype, "player", {
        get: function () {
            return this._player;
        },
        enumerable: true,
        configurable: true
    });
    return DemoScene;
}(engine_1.Scene));
exports.default = DemoScene;
},{"../../../engine":21,"components/PlayerComponent":34,"factories/EntityFactory":36,"managers/SectorsManager":39,"scenes/HUDScene":43}],43:[function(require,module,exports){
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
var engine_1 = require("../../../engine");
var TexturesManager_1 = require("managers/TexturesManager");
var HUDScene = (function (_super) {
    __extends(HUDScene, _super);
    function HUDScene(app, renderer) {
        var _this = _super.call(this, renderer) || this;
        _this._camera = app.cameraOrtho;
        _this._buildScene();
        return _this;
    }
    HUDScene.prototype._createSprite = function (texture, width, height, position) {
        var geometry = new engine_1.WallGeometry(this._renderer, width, height), material = new engine_1.BasicMaterial(this._renderer, texture), object = engine_1.Instance.allocate(this._renderer, geometry, material);
        object.translate(position.x, position.y, position.z);
        this.addGameObject(object);
    };
    HUDScene.prototype._buildScene = function () {
        var coords = engine_1.coordsToOrtho(this._camera, 106, 104);
        this._createSprite(TexturesManager_1.default.getTexture("MOCKGUN"), 32.0, 32.0, coords);
        coords.delete();
    };
    HUDScene.prototype.render = function () {
        _super.prototype.render.call(this);
    };
    return HUDScene;
}(engine_1.Scene));
exports.default = HUDScene;
},{"../../../engine":21,"managers/TexturesManager":40}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../../engine");
var PropsFactory_1 = require("factories/PropsFactory");
var EntityFactory_1 = require("factories/EntityFactory");
var Sector = (function () {
    function Sector(renderer, position, size) {
        this._renderer = renderer;
        this._position = position;
        this._size = size;
        this._propList = [];
        this._insList = [];
        this._solidInstances = [];
        this._scene = null;
    }
    Sector.prototype.addProp = function (propName, options) {
        this._propList.push({
            name: propName,
            options: options
        });
    };
    Sector.prototype.addInstance = function (insName, options) {
        this._insList.push({
            name: insName,
            options: options
        });
    };
    Sector.prototype.setCollision = function (position, size) {
        this._collision = new engine_1.BoxCollision(position, size).centerInAxis(false, false, false);
        this._collision.solid = false;
    };
    Sector.prototype.setScene = function (scene) {
        this._scene = scene;
    };
    Sector.prototype.registerCollision = function (collision) {
        this._solidInstances.push(collision);
    };
    Sector.prototype.clearCollision = function (collision) {
        this._solidInstances.splice(this._solidInstances.indexOf(collision), 1);
    };
    Sector.prototype.displayCollisions = function () {
        if (engine_1.Config.DISPLAY_COLLISIONS) {
            for (var i = 0, collision = void 0; collision = this._solidInstances[i]; i++) {
                collision.setScene(this._scene);
                collision.addCollisionInstance(this._renderer);
            }
        }
    };
    Sector.prototype.build = function () {
        if (this._instances != null) {
            return null;
        }
        var ret = [], solid = [];
        for (var i = 0, prop = void 0; prop = this._propList[i]; i++) {
            var instance = PropsFactory_1.default.createProp(this._renderer, prop.name, prop.options);
            ret.push(instance);
            if (instance.collision && instance.collision.solid) {
                solid.push(instance.collision);
            }
        }
        for (var i = 0, ins = void 0; ins = this._insList[i]; i++) {
            var instance = EntityFactory_1.default.createInstance(this._renderer, ins.name, ins.options.position);
            ret.push(instance);
            if (instance.collision && instance.collision.solid) {
                solid.push(instance.collision);
            }
        }
        this._instances = ret;
        this._solidInstances = this._solidInstances.concat(solid);
        return ret;
    };
    Sector.prototype.destroy = function () {
        if (this._instances == null) {
            return;
        }
        for (var i = 0, ins = void 0; ins = this._instances[i]; i++) {
            ins.destroy();
        }
        this._instances = null;
    };
    Object.defineProperty(Sector.prototype, "instances", {
        get: function () {
            return this._instances;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "collision", {
        get: function () {
            return this._collision;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "solidInstances", {
        get: function () {
            return this._solidInstances;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    return Sector;
}());
exports.default = Sector;
},{"../../../engine":21,"factories/EntityFactory":36,"factories/PropsFactory":37}]},{},[31])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL0NhbWVyYS50cyIsInNyYy9lbmdpbmUvQ29tcG9uZW50LnRzIiwic3JjL2VuZ2luZS9Db25maWcudHMiLCJzcmMvZW5naW5lL0NvbnN0YW50cy50cyIsInNyYy9lbmdpbmUvSW5wdXQudHMiLCJzcmMvZW5naW5lL0xpc3QudHMiLCJzcmMvZW5naW5lL1Bvb2xpZnkudHMiLCJzcmMvZW5naW5lL1JlbmRlcmVyLnRzIiwic3JjL2VuZ2luZS9SZW5kZXJpbmdMYXllci50cyIsInNyYy9lbmdpbmUvU2NlbmUudHMiLCJzcmMvZW5naW5lL1RleHR1cmUudHMiLCJzcmMvZW5naW5lL1V0aWxzLnRzIiwic3JjL2VuZ2luZS9jb2xsaXNpb25zL0JveENvbGxpc2lvbi50cyIsInNyYy9lbmdpbmUvY29sbGlzaW9ucy9Db2xsaXNpb24udHMiLCJzcmMvZW5naW5lL2VudGl0aWVzL0luc3RhbmNlLnRzIiwic3JjL2VuZ2luZS9lbnRpdGllcy9UZXh0LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9HZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5LnRzIiwic3JjL2VuZ2luZS9nZW9tZXRyaWVzL1dhbGxHZW9tZXRyeS50cyIsInNyYy9lbmdpbmUvaW5kZXgudHMiLCJzcmMvZW5naW5lL21hdGVyaWFscy9CYXNpY01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbC50cyIsInNyYy9lbmdpbmUvbWF0ZXJpYWxzL01hdGVyaWFsLnRzIiwic3JjL2VuZ2luZS9tYXRoL01hdHJpeDQudHMiLCJzcmMvZW5naW5lL21hdGgvVmVjdG9yMy50cyIsInNyYy9lbmdpbmUvbWF0aC9WZWN0b3I0LnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0Jhc2ljLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL0NvbG9yLnRzIiwic3JjL2VuZ2luZS9zaGFkZXJzL1NoYWRlci50cyIsInNyYy9leGFtcGxlcy9vbGQvQXBwLnRzIiwic3JjL2V4YW1wbGVzL29sZC9jb21wb25lbnRzL0NoYXJhQ29tcG9uZW50LnRzIiwic3JjL2V4YW1wbGVzL29sZC9jb21wb25lbnRzL0NoYXJhUmVuZGVyZXJDb21wb25lbnQudHMiLCJzcmMvZXhhbXBsZXMvb2xkL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50LnRzIiwic3JjL2V4YW1wbGVzL29sZC9jb21wb25lbnRzL1NlY3RvclNvbGlkQ29tcG9uZW50LnRzIiwic3JjL2V4YW1wbGVzL29sZC9mYWN0b3JpZXMvRW50aXR5RmFjdG9yeS50cyIsInNyYy9leGFtcGxlcy9vbGQvZmFjdG9yaWVzL1Byb3BzRmFjdG9yeS50cyIsInNyYy9leGFtcGxlcy9vbGQvbWFuYWdlcnMvTW9kZWxzTWFuYWdlci50cyIsInNyYy9leGFtcGxlcy9vbGQvbWFuYWdlcnMvU2VjdG9yc01hbmFnZXIudHMiLCJzcmMvZXhhbXBsZXMvb2xkL21hbmFnZXJzL1RleHR1cmVzTWFuYWdlci50cyIsInNyYy9leGFtcGxlcy9vbGQvbWFuYWdlcnMvVVZNYW5hZ2VyLnRzIiwic3JjL2V4YW1wbGVzL29sZC9zY2VuZXMvRGVtb1NjZW5lLnRzIiwic3JjL2V4YW1wbGVzL29sZC9zY2VuZXMvSFVEU2NlbmUudHMiLCJzcmMvZXhhbXBsZXMvb2xkL3NjZW5lcy9TZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLDBDQUFxQztBQUNyQywwQ0FBK0M7QUFDL0MsaUNBQWtFO0FBRWxFO0lBWUksZ0JBQVksVUFBbUI7UUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxpQkFBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTNDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBTyxD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Q0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQUEsSUFBSSxDQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUFBLElBQUksQ0FDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUFBLElBQUksQ0FDckQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFBQyxDQUFDO0lBQUEsSUFBSSxDQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUFBLElBQUksQ0FDcEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQUEsSUFBSSxDQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUFDLENBQUM7QUFDbkQsQ0FBQztBQVRELHdDQVNDO0FBRUQsb0JBQTJCLFNBQWtCLEVBQUUsU0FBa0I7SUFD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LENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDdkYsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUM3QyxRQUFRLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQ3JELFFBQVEsR0FBRyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUU1RixRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBQ0wsV0FBQztBQUFELENBM0VBLEFBMkVDLENBM0VrQixrQkFBUSxHQTJFMUI7QUFFRCxrQkFBZSxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDekdwQixtREFBOEM7QUFHOUM7SUFBMkIsZ0NBQVE7SUFDL0Isc0JBQVksUUFBa0IsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLE1BQWM7UUFBN0UsWUFDSSxpQkFBTyxTQU1WO1FBSkcsS0FBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOztJQUMzQyxDQUFDO0lBRU8saUNBQVUsR0FBbEIsVUFBbUIsS0FBYSxFQUFFLE1BQWMsRUFBRSxNQUFjO1FBQzVELElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQ2IsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEVBQ2QsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFHbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNuQixJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWhCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFDTCxtQkFBQztBQUFELENBakVBLEFBaUVDLENBakUwQixrQkFBUSxHQWlFbEM7QUFFRCxrQkFBZSxZQUFZLENBQUM7Ozs7QUN0RTVCLDBDQUEyRDtBQUUzRCw0Q0FBdUM7QUFDdkMsMkNBQTBDO0FBRTFDO0lBZUk7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRW5DLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFTSw2QkFBVSxHQUFqQixVQUFrQixDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUc3QixJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BDLENBQUM7SUFDTixDQUFDO0lBRU0sOEJBQVcsR0FBbEIsVUFBbUIsQ0FBUyxFQUFFLENBQVM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSw4QkFBVyxHQUFsQixVQUFtQixLQUFhLEVBQUUsS0FBYSxFQUFFLEtBQWE7UUFDMUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsd0JBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsY0FBYyxDQUFDLENBQUE7UUFBQSxDQUFDO1FBQ2hILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLHdCQUFZLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFBO1FBQUEsQ0FBQztRQUNoSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyx3QkFBWSxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxjQUFjLENBQUMsQ0FBQTtRQUFBLENBQUM7UUFFaEgsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU0sd0JBQUssR0FBWixVQUFhLFFBQWtCO1FBQzNCLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdkMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVqRixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWxGLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRCxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXpGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFFM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVNLG9DQUFpQixHQUF4QixVQUF5QixDQUFhLEVBQUUsQ0FBYSxFQUFFLENBQWE7UUFBM0Msa0JBQUEsRUFBQSxLQUFhO1FBQUUsa0JBQUEsRUFBQSxLQUFhO1FBQUUsa0JBQUEsRUFBQSxLQUFhO1FBQ2hFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLDBCQUFPLEdBQWQ7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUUzQixFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0seUJBQU0sR0FBYjtRQUNJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUN0QixNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7UUFFaEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxFQUFFLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLHdCQUFZLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUseUJBQWEsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQztRQUVELEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxRCxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxzQkFBVywrQkFBUzthQUFwQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsaUNBQVc7YUFBdEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUM3QixDQUFDOzs7T0FBQTtJQUNMLGVBQUM7QUFBRCxDQTlIQSxBQThIQyxJQUFBO0FBRUQsa0JBQWUsUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3JJeEIsbURBQThDO0FBRzlDO0lBQTRCLGlDQUFRO0lBQ2hDLHVCQUFZLFFBQWtCLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFBN0QsWUFDSSxpQkFBTyxTQU1WO1FBSkcsS0FBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O0lBQ3BDLENBQUM7SUFFTyxtQ0FBVyxHQUFuQixVQUFvQixLQUFhLEVBQUUsTUFBYztRQUM3QyxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUNiLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBR25CLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0E5QkEsQUE4QkMsQ0E5QjJCLGtCQUFRLEdBOEJuQztBQUVELGtCQUFlLGFBQWEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUNuQzdCLG1EQUE4QztBQUc5QztJQUEyQixnQ0FBUTtJQUMvQixzQkFBWSxRQUFrQixFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQTdELFlBQ0ksaUJBQU8sU0FNVjtRQUpHLEtBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLEtBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBRXJCLEtBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztJQUNuQyxDQUFDO0lBRU8saUNBQVUsR0FBbEIsVUFBbUIsS0FBYSxFQUFFLE1BQWM7UUFDNUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFDYixDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVuQixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFDTCxtQkFBQztBQUFELENBN0JBLEFBNkJDLENBN0IwQixrQkFBUSxHQTZCbEM7QUFFRCxrQkFBZSxZQUFZLENBQUM7Ozs7Ozs7QUNsQzVCLHVDQUFpRDtBQUF4Qyw4QkFBQSxPQUFPLENBQVk7QUFDNUIsbUNBQTZDO0FBQXBDLDBCQUFBLE9BQU8sQ0FBVTtBQUMxQix5Q0FBbUQ7QUFBMUMsZ0NBQUEsT0FBTyxDQUFhO0FBQzdCLG1DQUE2QztBQUFwQywwQkFBQSxPQUFPLENBQVU7QUFDMUIsaUNBQTRCO0FBQzVCLGlDQUEyQztBQUFsQyx3QkFBQSxPQUFPLENBQVM7QUFDekIsK0JBQXlDO0FBQWhDLHNCQUFBLE9BQU8sQ0FBUTtBQUN4QixxQ0FBK0M7QUFBdEMsNEJBQUEsT0FBTyxDQUFXO0FBQzNCLG1EQUE2RDtBQUFwRCwwQ0FBQSxPQUFPLENBQWtCO0FBQ2xDLGlDQUEyQztBQUFsQyx3QkFBQSxPQUFPLENBQVM7QUFDekIscUNBQStDO0FBQXRDLDRCQUFBLE9BQU8sQ0FBVztBQUMzQiw2QkFBd0I7QUFFeEIsMERBQW9FO0FBQTNELHNDQUFBLE9BQU8sQ0FBZ0I7QUFDaEMsb0RBQThEO0FBQXJELGdDQUFBLE9BQU8sQ0FBYTtBQUU3QixnREFBMEQ7QUFBakQsOEJBQUEsT0FBTyxDQUFZO0FBQzVCLHdDQUFrRDtBQUF6QyxzQkFBQSxPQUFPLENBQVE7QUFFeEIsMERBQW9FO0FBQTNELHNDQUFBLE9BQU8sQ0FBZ0I7QUFDaEMsNERBQXNFO0FBQTdELHdDQUFBLE9BQU8sQ0FBaUI7QUFDakMsMERBQW9FO0FBQTNELHNDQUFBLE9BQU8sQ0FBZ0I7QUFDaEMsa0RBQTREO0FBQW5ELDhCQUFBLE9BQU8sQ0FBWTtBQUU1QiwyREFBcUU7QUFBNUQsd0NBQUEsT0FBTyxDQUFpQjtBQUNqQywyREFBcUU7QUFBNUQsd0NBQUEsT0FBTyxDQUFpQjtBQUNqQyxpREFBMkQ7QUFBbEQsOEJBQUEsT0FBTyxDQUFZO0FBRTVCLDBDQUFvRDtBQUEzQyw0QkFBQSxPQUFPLENBQVc7QUFDM0IsMENBQStDO0FBQXRDLDRCQUFBLE9BQU8sQ0FBQTtBQUFFLHlCQUFBLElBQUksQ0FBQTtBQUN0QiwwQ0FBeUM7QUFBaEMsNEJBQUEsT0FBTyxDQUFBO0FBRWhCLDJDQUFxRDtBQUE1QywwQkFBQSxPQUFPLENBQVU7QUFFMUIseUNBQW1EO0FBQTFDLHdCQUFBLE9BQU8sQ0FBUztBQUN6Qix5Q0FBbUQ7QUFBMUMsd0JBQUEsT0FBTyxDQUFTOzs7Ozs7Ozs7Ozs7OztBQ25DekIsa0RBQTZDO0FBRzdDLDRDQUF1QztBQUV2QztJQUE0QixpQ0FBUTtJQUtoQyx1QkFBWSxRQUFrQixFQUFFLE9BQWdCO1FBQWhELFlBQ0ksa0JBQU0sUUFBUSxFQUFFLE9BQU8sQ0FBQyxTQUszQjtRQUhHLEtBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLEtBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoQyxLQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztJQUM5QixDQUFDO0lBRU0sNkJBQUssR0FBWixVQUFhLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDbkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTSxpQ0FBUyxHQUFoQixVQUFpQixDQUFTLEVBQUUsQ0FBUztRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTSw4QkFBTSxHQUFiO1FBQ0ksRUFBRSxDQUFDLENBQUMsa0JBQVEsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFFOUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQ3RCLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztRQUVoQyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRCxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFN0MsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDeEIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELGtCQUFRLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUNqQyxDQUFDO0lBRUQsc0JBQVcsa0NBQU87YUFBbEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDakMsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxrQ0FBTzthQUFsQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7OztPQUFBO0lBQ0wsb0JBQUM7QUFBRCxDQWxEQSxBQWtEQyxDQWxEMkIsa0JBQVEsR0FrRG5DO0FBRUQsa0JBQWUsYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3pEN0Isa0RBQTZDO0FBRzdDLDRDQUF1QztBQUV2QztJQUE0QixpQ0FBUTtJQUdoQyx1QkFBWSxRQUFrQixFQUFFLEtBQWM7UUFBOUMsWUFDSSxrQkFBTSxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBRzNCO1FBREcsS0FBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7O0lBQ2xDLENBQUM7SUFFTSw4QkFBTSxHQUFiO1FBQ0ksRUFBRSxDQUFDLENBQUMsa0JBQVEsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFFOUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQ3RCLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztRQUVoQyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXRELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDeEIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELGtCQUFRLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUNqQyxDQUFDO0lBRUQsc0JBQVcsa0NBQU87YUFBbEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7OztPQUFBO0lBQ0wsb0JBQUM7QUFBRCxDQTdCQSxBQTZCQyxDQTdCMkIsa0JBQVEsR0E2Qm5DO0FBRUQsa0JBQWUsYUFBYSxDQUFDOzs7O0FDakM3QixrQ0FBc0M7QUFFdEM7SUFVSSxrQkFBWSxRQUFrQixFQUFFLFVBQXdCO1FBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQVUsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVNLDRCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBS0Qsc0JBQVcsOEJBQVE7YUFBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDOzs7T0FBQTtJQUVNLDRCQUFTLEdBQWhCLFVBQWlCLE1BQWU7UUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sNkJBQVUsR0FBakIsVUFBa0IsU0FBa0I7UUFDaEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUE3QmEscUJBQVksR0FBcUIsSUFBSSxDQUFDO0lBOEJ4RCxlQUFDO0NBdENELEFBc0NDLElBQUE7QUFFRCxrQkFBZSxRQUFRLENBQUM7Ozs7QUM3Q3hCLDJDQUEwQztBQUMxQyxzQ0FBaUM7QUFHakM7SUFJSTtRQUFZLGdCQUF3QjthQUF4QixVQUF3QixFQUF4QixxQkFBd0IsRUFBeEIsSUFBd0I7WUFBeEIsMkJBQXdCOztRQUNoQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTFCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFFbkMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxFQUFFLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0wsQ0FBQztJQUVNLHFCQUFHLEdBQVY7UUFBVyxnQkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLDJCQUF3Qjs7UUFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxFQUFFLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sMEJBQVEsR0FBZixVQUFnQixPQUFnQjtRQUM1QixJQUFJLENBQUMsR0FBa0IsT0FBTyxDQUFDLElBQUksQ0FBQztRQUVwQyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFL0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDZCxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLElBQUksRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxJQUFJLEVBQUUsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLEdBQUcsQ0FDSixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ2xGLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxF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QUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRWhMLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLGdCQUFPLENBQUMsQ0FBQyxFQUFFLGFBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVuTixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xOLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxnQkFBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDak4sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQWUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLGdCQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqTixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWxOLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLGdCQUFPLENBQUMsQ0FBQyxFQUFFLGNBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRS9OLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM5SyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBZSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsYUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3pLLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFlLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsYUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3SixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBZSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLGdCQUFPLENBQUMsQ0FBQyxFQUFFLGFBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUosTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQWUsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxnQkFBTyxDQUFDLENBQUMsRUFBRSxhQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hLLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsYUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFlLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RILE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFlLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTFKLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFlLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxnQkFBTyxDQUFDLENBQUMsRUFBRSxhQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckwsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQWUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLGdCQUFPLENBQUMsQ0FBQyxFQUFFLGFBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUd0TCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLHFCQUFZLENBQUMsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsMkJBQUksQ0FBQyxJQUFJLGdCQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzVJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUkscUJBQVksQ0FBQywyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxxQkFBWSxDQUFDLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxxQkFBWSxDQUFDLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0ksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxxQkFBWSxDQUFDLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFM0ksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxxQkFBWSxDQUFDLDJCQUFJLENBQUMsSUFBSSxnQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSwyQkFBSSxDQUFDLElBQUksZ0JBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxxQkFBWSxD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WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUFBLGFBQUM7QUFBRCxDQXpITCxBQXlITSxJQUFBO0FBRU4sa0JBQWUsTUFBTSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBNYXRyaXg0IGZyb20gJy4vbWF0aC9NYXRyaXg0JztcclxuaW1wb3J0IHsgVmVjdG9yMywgdmVjMyB9IGZyb20gJy4vbWF0aC9WZWN0b3IzJztcclxuaW1wb3J0IHsgcmVtZW1iZXJQb29sQWxsb2MgYXMgcnBhLCBmcmVlUG9vbEFsbG9jIH0gZnJvbSAnLi9VdGlscyc7XHJcblxyXG5jbGFzcyBDYW1lcmEge1xyXG4gICAgcHJpdmF0ZSBfdHJhbnNmb3JtICAgICAgICAgICA6IE1hdHJpeDQ7XHJcbiAgICBwcml2YXRlIF90YXJnZXQgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByaXZhdGUgX3VwICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG4gICAgcHJpdmF0ZSBfYW5nbGUgICAgICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcml2YXRlIF9uZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgcG9zaXRpb24gICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHB1YmxpYyBzY3JlZW5TaXplICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG5cclxuICAgIHB1YmxpYyByZWFkb25seSBwcm9qZWN0aW9uICAgICAgICAgIDogTWF0cml4NDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9qZWN0aW9uOiBNYXRyaXg0KSB7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gcHJvamVjdGlvbjtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSBNYXRyaXg0LmNyZWF0ZUlkZW50aXR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLl90YXJnZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLl91cCA9IG5ldyBWZWN0b3IzKDAsIDEsIDApO1xyXG4gICAgICAgIHRoaXMuX2FuZ2xlID0gbmV3IFZlY3RvcjMoMC4wKTtcclxuICAgICAgICB0aGlzLnNjcmVlblNpemUgPSBuZXcgVmVjdG9yMygwLjApO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBDYW1lcmEge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRUYXJnZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XHJcbiAgICAgICAgdGhpcy5fdGFyZ2V0LnNldCh4LCB5LCB6KTtcclxuXHJcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0QW5nbGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IENhbWVyYSB7XHJcbiAgICAgICAgdGhpcy5fYW5nbGUuc2V0KHgsIHksIHopO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRBbmdsZSgpOiBWZWN0b3IzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW5nbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFRyYW5zZm9ybWF0aW9uKCk6IE1hdHJpeDQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmID0gcnBhKHRoaXMuZm9yd2FyZCksXHJcbiAgICAgICAgICAgIGwgPSBycGEoVmVjdG9yMy5jcm9zcyh0aGlzLl91cCwgZikubm9ybWFsaXplKCkpLFxyXG4gICAgICAgICAgICB1ID0gcnBhKFZlY3RvcjMuY3Jvc3MoZiwgbCkubm9ybWFsaXplKCkpO1xyXG5cclxuICAgICAgICBsZXQgY3AgPSB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICB4ID0gLVZlY3RvcjMuZG90KGwsIGNwKSxcclxuICAgICAgICAgICAgeSA9IC1WZWN0b3IzLmRvdCh1LCBjcCksXHJcbiAgICAgICAgICAgIHogPSAtVmVjdG9yMy5kb3QoZiwgY3ApO1xyXG5cclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0uc2V0KFxyXG4gICAgICAgICAgICBsLngsIHUueCwgZi54LCAwLFxyXG4gICAgICAgICAgICBsLnksIHUueSwgZi55LCAwLFxyXG4gICAgICAgICAgICBsLnosIHUueiwgZi56LCAwLFxyXG4gICAgICAgICAgICAgIHgsICAgeSwgICB6LCAxXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmcmVlUG9vbEFsbG9jKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBmb3J3YXJkKCk6IFZlY3RvcjMge1xyXG4gICAgICAgIGxldCBjcCA9IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgIHQgPSB0aGlzLl90YXJnZXQ7XHJcblxyXG4gICAgICAgIHJldHVybiB2ZWMzKGNwLnggLSB0LngsIGNwLnkgLSB0LnksIGNwLnogLSB0LnopLm5vcm1hbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNVcGRhdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5fbmVlZHNVcGRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVQZXJzcGVjdGl2ZShmb3Y6IG51bWJlciwgcmF0aW86IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogQ2FtZXJhIHtcclxuICAgICAgICByZXR1cm4gbmV3IENhbWVyYShNYXRyaXg0LmNyZWF0ZVBlcnNwZWN0aXZlKGZvdiwgcmF0aW8sIHpuZWFyLCB6ZmFyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVPcnRob2dyYXBoaWMod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHpuZWFyOiBudW1iZXIsIHpmYXI6IG51bWJlcik6IENhbWVyYSB7XHJcbiAgICAgICAgbGV0IHJldCA9IG5ldyBDYW1lcmEoTWF0cml4NC5jcmVhdGVPcnRobyh3aWR0aCwgaGVpZ2h0LCB6bmVhciwgemZhcikpO1xyXG4gICAgICAgIHJldC5zY3JlZW5TaXplLnNldCh3aWR0aCwgaGVpZ2h0LCAwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhOyIsImltcG9ydCBJbnN0YW5jZSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcclxuXHJcbmFic3RyYWN0IGNsYXNzIENvbXBvbmVudCB7XHJcbiAgICBwcm90ZWN0ZWQgX2luc3RhbmNlICAgICAgICAgICAgICAgICA6IEluc3RhbmNlO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSAgICAgICAgICAgICAgICAgICAgOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGNvbXBvbmVudE5hbWUgICAgOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29tcG9uZW50TmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gY29tcG9uZW50TmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBpbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgYXdha2UoKTogdm9pZDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCB1cGRhdGUoKTogdm9pZDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudDsiLCJsZXQgQ29uZmlnID0ge1xyXG4gICAgUExBWV9GVUxMU0NSRUVOICAgICAgICA6IGZhbHNlLFxyXG4gICAgRElTUExBWV9DT0xMSVNJT05TICAgICA6IGZhbHNlLFxyXG5cclxuICAgIFBJWEVMX1VOSVRfUkVMQVRJT04gICAgOiAxIC8gMTYsXHJcblxyXG4gICAgc2V0VW5pdFBpeGVsc1dpZHRoOiBmdW5jdGlvbih3aWR0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5QSVhFTF9VTklUX1JFTEFUSU9OID0gMSAvIHdpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnOyIsImV4cG9ydCBjb25zdCBWRVJUSUNFX1NJWkUgICAgICAgICAgID0gMztcclxuZXhwb3J0IGNvbnN0IFRFWENPT1JEX1NJWkUgICAgICAgICAgPSAyO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBJXzIgICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJIC8gMjtcclxuZXhwb3J0IGNvbnN0IFBJMiAgICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMjtcclxuZXhwb3J0IGNvbnN0IFBJM18yICAgICAgICAgICAgICAgICAgPSBNYXRoLlBJICogMyAvIDI7IiwiaW1wb3J0IHsgY3JlYXRlVVVJRCB9IGZyb20gJy4vVXRpbHMnO1xyXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vQ29uZmlnJztcclxuXHJcbmludGVyZmFjZSBDYWxsYmFjayB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG59XHJcblxyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwcml2YXRlIF9lbGVtZW50ICAgICAgICAgICAgICAgICA6IEhUTUxFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBfa2V5ZG93bkNhbGxiYWNrcyAgICAgICAgOiBBcnJheTxDYWxsYmFjaz47XHJcbiAgICBwcml2YXRlIF9rZXl1cENhbGxiYWNrcyAgICAgICAgICA6IEFycmF5PENhbGxiYWNrPjtcclxuICAgIHByaXZhdGUgX21vdXNlbW92ZUNhbGxiYWNrcyAgICAgIDogQXJyYXk8Q2FsbGJhY2s+O1xyXG4gICAgcHJpdmF0ZSBfZWxlbWVudEZvY3VzICAgICAgICAgICAgOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2tleWRvd25DYWxsYmFja3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9rZXl1cENhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1cyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9oYW5kbGVLZXlkb3duKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbGVtZW50Rm9jdXMpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MCxjYWxsYmFjaztjYWxsYmFjaz10aGlzLl9rZXlkb3duQ2FsbGJhY2tzW2ldO2krKykge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhrZXlFdmVudC5rZXlDb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGFuZGxlS2V5dXAoa2V5RXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9dGhpcy5fa2V5dXBDYWxsYmFja3NbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGxiYWNrKGtleUV2ZW50LmtleUNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9oYW5kbGVNb3VzZU1vdmUobW91c2VFdmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudEZvY3VzKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTAsY2FsbGJhY2s7Y2FsbGJhY2s9dGhpcy5fbW91c2Vtb3ZlQ2FsbGJhY2tzW2ldO2krKykge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsYmFjayhtb3VzZUV2ZW50Lm1vdmVtZW50WCwgbW91c2VFdmVudC5tb3ZlbWVudFkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9oYW5kbGVQb2ludGVyTG9ja0NoYW5nZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9lbGVtZW50Rm9jdXMgPSAoZG9jdW1lbnQucG9pbnRlckxvY2tFbGVtZW50ID09PSB0aGlzLl9lbGVtZW50KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfZGVsZXRlRnJvbUxpc3QobGlzdDogQXJyYXk8Q2FsbGJhY2s+LCBpZDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wLGNhbGxiYWNrO2NhbGxiYWNrPWxpc3RbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5pZCA9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUNhbGxiYWNrVG9MaXN0KGxpc3Q6IEFycmF5PENhbGxiYWNrPiwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgcmV0OiBDYWxsYmFjayA9IHtcclxuICAgICAgICAgICAgaWQ6IGNyZWF0ZVVVSUQoKSxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaXN0LnB1c2gocmV0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldC5pZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdChmb2N1c0VsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGZvY3VzRWxlbWVudDtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleWRvd24oa2V5RXZlbnQpOyB9KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKGtleUV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7IHRoaXMuX2hhbmRsZUtleXVwKGtleUV2ZW50KTsgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZXY6IE1vdXNlRXZlbnQpID0+IHsgdGhpcy5faGFuZGxlTW91c2VNb3ZlKGV2KTsgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJsb2NrY2hhbmdlJywgKCkgPT4geyB0aGlzLl9oYW5kbGVQb2ludGVyTG9ja0NoYW5nZSgpOyB9LCBmYWxzZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW96cG9pbnRlcmxvY2tjaGFuZ2UnLCAoKSA9PiB7IHRoaXMuX2hhbmRsZVBvaW50ZXJMb2NrQ2hhbmdlKCk7IH0sIGZhbHNlKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRwb2ludGVybG9ja2NoYW5nZScsICgpID0+IHsgdGhpcy5faGFuZGxlUG9pbnRlckxvY2tDaGFuZ2UoKTsgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLl9lbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuID0gdGhpcy5fZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCB0aGlzLl9lbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIHx8ICg8YW55PnRoaXMuX2VsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuO1xyXG5cclxuICAgICAgICB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChDb25maWcuUExBWV9GVUxMU0NSRUVOICYmIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIHRoaXMuX2VsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IFxyXG5cclxuICAgIHB1YmxpYyBvbktleWRvd24oY2FsbGJhY2s6IEZ1bmN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlQ2FsbGJhY2tUb0xpc3QodGhpcy5fa2V5ZG93bkNhbGxiYWNrcywgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgb25LZXl1cChjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYWxsYmFja1RvTGlzdCh0aGlzLl9rZXl1cENhbGxiYWNrcywgY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbk1vdXNlTW92ZShjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYWxsYmFja1RvTGlzdCh0aGlzLl9tb3VzZW1vdmVDYWxsYmFja3MsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVsZXRlQ2FsbGJhY2soaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9kZWxldGVGcm9tTGlzdCh0aGlzLl9rZXlkb3duQ2FsbGJhY2tzLCBpZCkpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZUZyb21MaXN0KHRoaXMuX2tleXVwQ2FsbGJhY2tzLCBpZCkpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlbGV0ZUZyb21MaXN0KHRoaXMuX21vdXNlbW92ZUNhbGxiYWNrcywgaWQpKSB7IHJldHVybjsgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAobmV3IElucHV0KCkpOyIsImltcG9ydCBQb29saWZ5IGZyb20gJy4vUG9vbGlmeSc7XHJcbmltcG9ydCB7IFBvb2xDbGFzcyB9IGZyb20gJy4vUG9vbGlmeSc7XHJcblxyXG5jbGFzcyBOb2RlIGltcGxlbWVudHMgUG9vbENsYXNzIHtcclxuICAgIHB1YmxpYyBwcmV2ICAgICAgICA6IE5vZGU7XHJcbiAgICBwdWJsaWMgbmV4dCAgICAgICAgOiBOb2RlO1xyXG4gICAgcHVibGljIGl0ZW0gICAgICAgIDogYW55O1xyXG4gICAgcHVibGljIGluVXNlICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucHJldiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLml0ZW0gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGUoKTogdm9pZCB7XHJcbiAgICAgICAgcG9vbC5mcmVlKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgYWxsb2NhdGUoaXRlbTogYW55KTogTm9kZSB7XHJcbiAgICAgICAgbGV0IHJldCA9IHBvb2wuYWxsb2NhdGUoKTtcclxuXHJcbiAgICAgICAgcmV0Lml0ZW0gPSBpdGVtO1xyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgcG9vbCA9IG5ldyBQb29saWZ5KDEwMCwgTm9kZSk7XHJcblxyXG5jbGFzcyBMaXN0PFQ+IHtcclxuICAgIHByaXZhdGUgX2hlYWQgICAgICAgICAgIDogTm9kZTtcclxuICAgIHByaXZhdGUgX3RhaWwgICAgICAgICAgIDogTm9kZTtcclxuICAgIHByaXZhdGUgX2xlbmd0aCAgICAgICAgIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2hlYWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3RhaWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHB1c2goaXRlbTogVCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBub2RlID0gTm9kZS5hbGxvY2F0ZShpdGVtKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkID0gbm9kZTtcclxuICAgICAgICAgICAgdGhpcy5fdGFpbCA9IG5vZGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHRhaWwgPSB0aGlzLl90YWlsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbm9kZS5wcmV2ID0gdGFpbDtcclxuICAgICAgICAgICAgdGFpbC5uZXh0ID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3RhaWwgPSBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbGVuZ3RoICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZShpdGVtOiBUKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xyXG5cclxuICAgICAgICB3aGlsZSAobm9kZSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5pdGVtID09IGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl90YWlsID09IG5vZGUpIHsgdGhpcy5fdGFpbCA9IG5vZGUucHJldjsgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJldi5uZXh0ID0gbm9kZS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHQpeyBcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faGVhZCA9PSBub2RlKSB7IHRoaXMuX2hlYWQgPSBub2RlLm5leHQ7IH1cclxuICAgICAgICAgICAgICAgICAgICBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLmRlbGV0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX2xlbmd0aCAtPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEF0KGluZGV4OiBudW1iZXIpOiBUIHtcclxuICAgICAgICBpZiAodGhpcy5fbGVuZ3RoID09IDApIHsgcmV0dXJuIG51bGw7IH1cclxuXHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkLFxyXG4gICAgICAgICAgICBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIHdoaWxlIChjb3VudCA8IGluZGV4KSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbm9kZS5pdGVtO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgaW5zZXJ0QXQoaW5kZXg6IG51bWJlciwgaXRlbTogVCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5faGVhZCxcclxuICAgICAgICAgICAgY291bnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLl9sZW5ndGgrKztcclxuXHJcbiAgICAgICAgd2hpbGUgKGNvdW50IDwgaW5kZXgpIHtcclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcclxuICAgICAgICAgICAgY291bnQrKztcclxuXHJcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmV3SXRlbSA9IE5vZGUuYWxsb2NhdGUoaXRlbSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYWQgPT0gbm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkLnByZXYgPSBuZXdJdGVtO1xyXG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSB0aGlzLl9oZWFkO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkID0gbmV3SXRlbTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXdJdGVtLm5leHQgPSBub2RlO1xyXG4gICAgICAgICAgICBuZXdJdGVtLnByZXYgPSBub2RlLnByZXY7XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKG5vZGUucHJldikgbm9kZS5wcmV2Lm5leHQgPSBuZXdJdGVtO1xyXG4gICAgICAgICAgICBub2RlLnByZXYgPSBuZXdJdGVtO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZWFjaChjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2hlYWQ7XHJcblxyXG4gICAgICAgIHdoaWxlIChpdGVtKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0uaXRlbSk7XHJcblxyXG4gICAgICAgICAgICBpdGVtID0gaXRlbS5uZXh0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xyXG5cclxuICAgICAgICB3aGlsZSAobm9kZSkge1xyXG4gICAgICAgICAgICBub2RlLmRlbGV0ZSgpO1xyXG5cclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNvcnQoc29ydENoZWNrOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggPCAyKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQubmV4dCxcclxuICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XHJcblxyXG4gICAgICAgIHdoaWxlIChub2RlKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gbm9kZS5uZXh0O1xyXG5cclxuICAgICAgICAgICAgaWYgKHNvcnRDaGVjayhub2RlLml0ZW0sIGNvbXBhcmUuaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXYpIHsgbm9kZS5wcmV2Lm5leHQgPSBub2RlLm5leHQ7IH1cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHQpIHsgbm9kZS5uZXh0LnByZXYgPSBub2RlLnByZXY7IH1cclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLm5leHQgPSBjb21wYXJlO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wcmV2ID0gY29tcGFyZS5wcmV2O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlLnByZXYpIGNvbXBhcmUucHJldi5uZXh0ID0gbm9kZTtcclxuICAgICAgICAgICAgICAgIGNvbXBhcmUucHJldiA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlID09IHRoaXMuX2hlYWQpIHsgdGhpcy5faGVhZCA9IG5vZGU7IH0gXHJcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZSA9PSB0aGlzLl90YWlsKSB7IHRoaXMuX3RhaWwgPSBub2RlOyB9XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICBjb21wYXJlID0gdGhpcy5faGVhZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbXBhcmUgPSBjb21wYXJlLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlID09IG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgY29tcGFyZSA9IHRoaXMuX2hlYWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoZWFkKCk6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGlzdDsiLCJjbGFzcyBQb29saWZ5IHtcclxuICAgIHByaXZhdGUgX2xpbWl0ICAgICAgICAgICAgICA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX2NsYXNzICAgICAgICAgICAgICA6IFBvb2xDbGFzcztcclxuICAgIHByaXZhdGUgX21lbWJlcnMgICAgICAgICAgICA6IEFycmF5PFBvb2xDbGFzcz47XHJcblxyXG4gICAgY29uc3RydWN0b3IobGltaXQ6IG51bWJlciwgQ2xhc3NOYW1lOiBhbnkpIHtcclxuICAgICAgICB0aGlzLl9saW1pdCA9IGxpbWl0O1xyXG4gICAgICAgIHRoaXMuX2NsYXNzID0gQ2xhc3NOYW1lO1xyXG4gICAgICAgIHRoaXMuX21lbWJlcnMgPSBuZXcgQXJyYXkobGltaXQpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7aTxsaW1pdDtpKyspIHtcclxuICAgICAgICAgICAgbGV0IG9iaiA9IG5ldyBDbGFzc05hbWUoKTtcclxuICAgICAgICAgICAgb2JqLmluVXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX21lbWJlcnNbaV0gPSBvYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhbGxvY2F0ZSgpOiBhbnkge1xyXG4gICAgICAgIGZvciAobGV0IGk9MCxtZW1iZXI7bWVtYmVyPXRoaXMuX21lbWJlcnNbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghbWVtYmVyLmluVXNlKSB7XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuaW5Vc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5fY2xhc3MpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJhbiBvdXQgb2Ygb2JqZWN0cywgbGltaXQgc2V0OiBcIiArIHRoaXMuX2xpbWl0KTsgXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZyZWUob2JqZWN0OiBhbnkpIHtcclxuICAgICAgICBvYmplY3QuY2xlYXIoKTtcclxuICAgICAgICBvYmplY3QuaW5Vc2UgPSBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUG9vbGlmeTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUG9vbENsYXNzIHtcclxuICAgIGluVXNlICAgICAgICAgICAgOiBib29sZWFuO1xyXG5cclxuICAgIGNsZWFyKCk6IHZvaWQ7XHJcbiAgICBkZWxldGUoKTogdm9pZDtcclxufSIsImltcG9ydCBTaGFkZXIgZnJvbSAnLi9zaGFkZXJzL1NoYWRlcic7XHJcbmltcG9ydCBCYXNpYyBmcm9tICcuL3NoYWRlcnMvQmFzaWMnO1xyXG5pbXBvcnQgQ29sb3IgZnJvbSAnLi9zaGFkZXJzL0NvbG9yJztcclxuaW1wb3J0IHsgU2hhZGVyTWFwLCBTaGFkZXJzTmFtZXMgfSBmcm9tICcuL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcclxuXHJcbmNsYXNzIFJlbmRlcmVyIHtcclxuICAgIHByaXZhdGUgX2NhbnZhcyAgICAgICAgICAgICAgOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHByaXZhdGUgX2dsICAgICAgICAgICAgICAgICAgOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XHJcbiAgICBwcml2YXRlIF9zaGFkZXJzICAgICAgICAgICAgIDogU2hhZGVyTWFwO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY29udGFpbmVyOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyh3aWR0aCwgaGVpZ2h0LCBjb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuX2luaXRHTCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTaGFkZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlQ2FudmFzKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jYW52YXMgPSBjYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEdMKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBnbCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2xcIik7XHJcblxyXG4gICAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xyXG5cclxuICAgICAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcclxuICAgICAgICBcclxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dsID0gZ2w7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdFNoYWRlcnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc2hhZGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLl9zaGFkZXJzLkJBU0lDID0gbmV3IFNoYWRlcih0aGlzLl9nbCwgQmFzaWMpO1xyXG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQ09MT1IgPSBuZXcgU2hhZGVyKHRoaXMuX2dsLCBDb2xvcik7XHJcblxyXG4gICAgICAgIHRoaXMuX3NoYWRlcnMuQkFTSUMudXNlUHJvZ3JhbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9nbDtcclxuXHJcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzd2l0Y2hTaGFkZXIoc2hhZGVyTmFtZTogU2hhZGVyc05hbWVzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc2hhZGVyc1tzaGFkZXJOYW1lXS51c2VQcm9ncmFtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNoYWRlcihzaGFkZXJOYW1lOiBTaGFkZXJzTmFtZXMpOiBTaGFkZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFkZXJzW3NoYWRlck5hbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgR0woKTogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZ2w7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYW52YXMud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FudmFzLmhlaWdodDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyZXI7IiwiaW1wb3J0IEluc3RhbmNlIGZyb20gJy4vZW50aXRpZXMvSW5zdGFuY2UnO1xyXG5pbXBvcnQgTGlzdCBmcm9tICcuL0xpc3QnO1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcclxuXHJcbmludGVyZmFjZSBQYXJhbXMge1xyXG4gICAgW2luZGV4OiBzdHJpbmddIDogYW55XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW5zdGFuY2VzTWFwIHtcclxuICAgIGluc3RhbmNlOiBJbnN0YW5jZTtcclxuICAgIHBhcmFtczogUGFyYW1zXHJcbn1cclxuXHJcbmNsYXNzIFJlbmRlcmluZ0xheWVyIHtcclxuICAgIHByaXZhdGUgX2luc3RhbmNlcyAgICAgICAgICAgICAgICAgICA6IExpc3Q8SW5zdGFuY2VzTWFwPjtcclxuXHJcbiAgICBwdWJsaWMgb25QcmVyZW5kZXIgICAgICAgICAgICAgICAgICAgOiBGdW5jdGlvbjtcclxuICAgIHB1YmxpYyBvblBvc3RVcGRhdGUgICAgICAgICAgICAgICAgICA6IEZ1bmN0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2luc3RhbmNlcyA9IG5ldyBMaXN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMub25QcmVyZW5kZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25Qb3N0VXBkYXRlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVJbnN0YW5jZU1hcChpbnN0YW5jZTogSW5zdGFuY2UpOiBJbnN0YW5jZXNNYXAge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7fVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkSW5zdGFuY2UoaW5zdGFuY2U6IEluc3RhbmNlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGFkZGVkID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wLGlucztpbnM9dGhpcy5faW5zdGFuY2VzLmdldEF0KGkpO2krKykge1xyXG4gICAgICAgICAgICBsZXQgY29uZDEgPSAoIWlucy5pbnN0YW5jZS5tYXRlcmlhbCAmJiAhaW5zdGFuY2UubWF0ZXJpYWwpLFxyXG4gICAgICAgICAgICAgICAgY29uZDIgPSAoaW5zLmluc3RhbmNlLm1hdGVyaWFsICYmIGluc3RhbmNlLm1hdGVyaWFsICYmIGlucy5pbnN0YW5jZS5tYXRlcmlhbC5zaGFkZXJOYW1lID09IGluc3RhbmNlLm1hdGVyaWFsLnNoYWRlck5hbWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbmQxIHx8IGNvbmQyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMuaW5zZXJ0QXQoaSwgdGhpcy5fY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2UpKTtcclxuICAgICAgICAgICAgICAgIGkgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgYWRkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghYWRkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2VzLnB1c2godGhpcy5fY3JlYXRlSW5zdGFuY2VNYXAoaW5zdGFuY2UpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBhd2FrZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbnN0YW5jZXMuZWFjaCgoaW5zdGFuY2U6IEluc3RhbmNlc01hcCkgPT4ge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5pbnN0YW5jZS5hd2FrZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzLmVhY2goKGluc3RhbmNlOiBJbnN0YW5jZXNNYXApID0+IHtcclxuICAgICAgICAgICAgbGV0IGlucyA9IGluc3RhbmNlLmluc3RhbmNlO1xyXG4gICAgICAgICAgICBpZiAoaW5zLmlzRGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXMucmVtb3ZlKGluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5zLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub25Qb3N0VXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uUG9zdFVwZGF0ZShpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMub25QcmVyZW5kZXIpIHsgXHJcbiAgICAgICAgICAgIHRoaXMub25QcmVyZW5kZXIodGhpcy5faW5zdGFuY2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2luc3RhbmNlcy5lYWNoKChpbnN0YW5jZTogSW5zdGFuY2VzTWFwKSA9PiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmluc3RhbmNlLnJlbmRlcihjYW1lcmEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJpbmdMYXllcjsiLCJpbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXInO1xyXG5pbXBvcnQgUmVuZGVyaW5nTGF5ZXIgZnJvbSAnLi9SZW5kZXJpbmdMYXllcic7XHJcbmltcG9ydCB7IEluc3RhbmNlc01hcCB9IGZyb20gJy4vUmVuZGVyaW5nTGF5ZXInO1xyXG5pbXBvcnQgTGlzdCBmcm9tICcuL0xpc3QnO1xyXG5pbXBvcnQgeyBnZXRTcXVhcmVkRGlzdGFuY2UgfSBmcm9tICcuL1V0aWxzJztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4vZW50aXRpZXMvSW5zdGFuY2UnO1xyXG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xyXG5cclxuY2xhc3MgU2NlbmUge1xyXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgICAgICAgOiBSZW5kZXJlcjtcclxuICAgIHByb3RlY3RlZCBfY2FtZXJhICAgICAgICAgICAgICAgICAgIDogQ2FtZXJhO1xyXG4gICAgcHJvdGVjdGVkIF9zdGFydGVkICAgICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJpbmdMYXllcnMgICAgICAgICAgOiBMaXN0PFJlbmRlcmluZ0xheWVyPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIpIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdExheWVycygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMgPSBuZXcgTGlzdCgpO1xyXG5cclxuICAgICAgICBsZXQgb3BhcXVlcyA9IG5ldyBSZW5kZXJpbmdMYXllcigpO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5wdXNoKG9wYXF1ZXMpO1xyXG5cclxuICAgICAgICBsZXQgdHJhbnNwYXJlbnRzID0gbmV3IFJlbmRlcmluZ0xheWVyKCk7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLnB1c2godHJhbnNwYXJlbnRzKTtcclxuXHJcbiAgICAgICAgdHJhbnNwYXJlbnRzLm9uUG9zdFVwZGF0ZSA9ICgoaXRlbTogSW5zdGFuY2VzTWFwKSA9PiB7XHJcbiAgICAgICAgICAgIGl0ZW0ucGFyYW1zLmRpc3RhbmNlID0gZ2V0U3F1YXJlZERpc3RhbmNlKGl0ZW0uaW5zdGFuY2UucG9zaXRpb24sIHRoaXMuX2NhbWVyYS5wb3NpdGlvbik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRyYW5zcGFyZW50cy5vblByZXJlbmRlciA9IChpbnN0YW5jZXM6IExpc3Q8SW5zdGFuY2VzTWFwPikgPT4ge1xyXG4gICAgICAgICAgICBpbnN0YW5jZXMuc29ydCgoaXRlbUE6IEluc3RhbmNlc01hcCwgaXRlbUI6IEluc3RhbmNlc01hcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpdGVtQS5wYXJhbXMuZGlzdGFuY2UgPiBpdGVtQi5wYXJhbXMuZGlzdGFuY2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRHYW1lT2JqZWN0KGluc3RhbmNlOiBJbnN0YW5jZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtYXQgPSBpbnN0YW5jZS5tYXRlcmlhbDtcclxuXHJcbiAgICAgICAgaW5zdGFuY2Uuc2V0U2NlbmUodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuYXdha2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsYXllciA9IHRoaXMuX3JlbmRlcmluZ0xheWVycy5nZXRBdCgwKTtcclxuICAgICAgICBpZiAobWF0ICYmICFtYXQuaXNPcGFxdWUpIHtcclxuICAgICAgICAgICAgbGF5ZXIgPSB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZ2V0QXQoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxheWVyLmFkZEluc3RhbmNlKGluc3RhbmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGVzdENvbGxpc2lvbihpbnN0YW5jZTogSW5zdGFuY2UsIGRpcmVjdGlvbjogVmVjdG9yMyk6IFZlY3RvcjMge1xyXG4gICAgICAgIGluc3RhbmNlO1xyXG4gICAgICAgIHJldHVybiBkaXJlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldENhbWVyYShjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IGNhbWVyYTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJpbmdMYXllcnMuZWFjaCgobGF5ZXI6IFJlbmRlcmluZ0xheWVyKSA9PiB7XHJcbiAgICAgICAgICAgIGxheWVyLmF3YWtlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nTGF5ZXJzLmVhY2goKGxheWVyOiBSZW5kZXJpbmdMYXllcikgPT4ge1xyXG4gICAgICAgICAgICBsYXllci51cGRhdGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmluZ0xheWVycy5lYWNoKChsYXllcjogUmVuZGVyaW5nTGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgbGF5ZXIucmVuZGVyKHRoaXMuX2NhbWVyYSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjZW5lOyIsImltcG9ydCBSZW5kZXJlciBmcm9tICcuL1JlbmRlcmVyJztcclxuaW1wb3J0IHsgVmVjdG9yNCB9IGZyb20gJy4vbWF0aC9WZWN0b3I0JztcclxuXHJcbmNsYXNzIFRleHR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc3JjICAgICAgICAgICAgICAgOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9pbWcgICAgICAgICAgICAgICA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIF9jYW52YXMgICAgICAgICAgICA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBfcmVuZGVyZXIgICAgICAgICAgOiBSZW5kZXJlcjtcclxuICAgIHByaXZhdGUgX3JlYWR5ICAgICAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGV4dHVyZSAgICA6IFdlYkdMVGV4dHVyZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcmM6IHN0cmluZ3xIVE1MQ2FudmFzRWxlbWVudCwgcmVuZGVyZXI6IFJlbmRlcmVyLCBjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSByZW5kZXJlci5HTC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVhZHkgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKDxIVE1MQ2FudmFzRWxlbWVudD5zcmMpLmdldENvbnRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PnNyYztcclxuICAgICAgICAgICAgdGhpcy5faW1nID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc3JjID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVhZHkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zcmMgPSA8c3RyaW5nPnNyYztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2ltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9pbWcuc3JjID0gdGhpcy5fc3JjO1xyXG4gICAgICAgICAgICB0aGlzLl9pbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25SZWFkeSgpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfb25SZWFkeSgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZ2wgPSB0aGlzLl9yZW5kZXJlci5HTDtcclxuXHJcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcclxuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMgOiB0aGlzLl9pbWcpO1xyXG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VVZTKHg6IG51bWJlcnxWZWN0b3I0LCB5PzogbnVtYmVyLCB3PzogbnVtYmVyLCBoPzogbnVtYmVyKTogVmVjdG9yNCB7XHJcbiAgICAgICAgbGV0IF94OiBudW1iZXI7XHJcblxyXG4gICAgICAgIGlmICgoPFZlY3RvcjQ+eCkubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgX3ggPSAoPFZlY3RvcjQ+eCkueDtcclxuICAgICAgICAgICAgeSA9ICg8VmVjdG9yND54KS55O1xyXG4gICAgICAgICAgICB3ID0gKDxWZWN0b3I0PngpLno7XHJcbiAgICAgICAgICAgIGggPSAoPFZlY3RvcjQ+eCkudztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yNChcclxuICAgICAgICAgICAgX3ggLyB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICB5IC8gdGhpcy5oZWlnaHQsXHJcbiAgICAgICAgICAgIHcgLyB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICBoIC8gdGhpcy5oZWlnaHRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fY2FudmFzKT8gdGhpcy5fY2FudmFzLndpZHRoIDogdGhpcy5faW1nLndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9jYW52YXMpPyB0aGlzLl9jYW52YXMuaGVpZ2h0IDogdGhpcy5faW1nLmhlaWdodDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGV4dHVyZTsiLCJpbXBvcnQgeyBWZWN0b3IzLCB2ZWMzIH0gZnJvbSAnLi9tYXRoL1ZlY3RvcjMnO1xyXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vQ29uZmlnJztcclxuaW1wb3J0IHsgUEkyIH0gZnJvbSAnLi9Db25zdGFudHMnO1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4vQ2FtZXJhJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVVUlEKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgZGF0ZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksXHJcbiAgICAgICAgcmV0ID0gKCd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnKS5yZXBsYWNlKC9beHldL2csIChjOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmFuID0gKGRhdGUgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICBkYXRlID0gTWF0aC5mbG9vcihkYXRlIC8gMTYpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChjID09ICd4JyA/IHJhbiA6IChyYW4mMHgzfDB4OCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQoZGVncmVlczogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEVmVjdG9yRGlyKHg6IG51bWJlciwgeTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGlmICh4ID09IDEgJiYgeSA9PSAwKSB7IHJldHVybiAwOyB9ZWxzZSBcclxuICAgIGlmICh4ID09IDEgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoNDUpOyB9ZWxzZSBcclxuICAgIGlmICh4ID09IDAgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoOTApOyB9ZWxzZVxyXG4gICAgaWYgKHggPT0gLTEgJiYgeSA9PSAtMSkgeyByZXR1cm4gZGVnVG9SYWQoMTM1KTsgfWVsc2VcclxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMCkgeyByZXR1cm4gTWF0aC5QSTsgfWVsc2VcclxuICAgIGlmICh4ID09IC0xICYmIHkgPT0gMSkgeyByZXR1cm4gZGVnVG9SYWQoMjI1KTsgfWVsc2VcclxuICAgIGlmICh4ID09IDAgJiYgeSA9PSAxKSB7IHJldHVybiBkZWdUb1JhZCgyNzApOyB9ZWxzZVxyXG4gICAgaWYgKHggPT0gMSAmJiB5ID09IDEpIHsgcmV0dXJuIGRlZ1RvUmFkKDMxNSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldDJEQW5nbGUocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xyXG4gICAgbGV0IHggPSBwb3NpdGlvbjIueCAtIHBvc2l0aW9uMS54LFxyXG4gICAgICAgIHkgPSBwb3NpdGlvbjIueiAtIHBvc2l0aW9uMS56O1xyXG5cclxuICAgIGxldCByZXQgPSBNYXRoLmF0YW4yKC15LCB4KTtcclxuXHJcbiAgICByZXR1cm4gKHJldCArIFBJMikgJSBQSTI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTcXVhcmVkRGlzdGFuY2UocG9zaXRpb24xOiBWZWN0b3IzLCBwb3NpdGlvbjI6IFZlY3RvcjMpOiBudW1iZXIge1xyXG4gICAgbGV0IHggPSBwb3NpdGlvbjEueCAtIHBvc2l0aW9uMi54LFxyXG4gICAgICAgIHkgPSBwb3NpdGlvbjEueSAtIHBvc2l0aW9uMi55LFxyXG4gICAgICAgIHogPSBwb3NpdGlvbjEueiAtIHBvc2l0aW9uMi56O1xyXG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkc1RvT3J0aG8oY2FtZXJhOiBDYW1lcmEsIHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdmVjMyhcclxuICAgICAgICB4IC0gY2FtZXJhLnNjcmVlblNpemUueCAvIDIuMCxcclxuICAgICAgICAoY2FtZXJhLnNjcmVlblNpemUueSAvIDIuMCkgLSB5LFxyXG4gICAgICAgIDAuMFxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBpeGVsQ29vcmRzVG9Xb3JsZCh2ZWN0b3I6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB2ZWN0b3Iuc2V0KFxyXG4gICAgICAgIHZlY3Rvci54ICogQ29uZmlnLlBJWEVMX1VOSVRfUkVMQVRJT04sXHJcbiAgICAgICAgdmVjdG9yLnkgKiBDb25maWcuUElYRUxfVU5JVF9SRUxBVElPTixcclxuICAgICAgICB2ZWN0b3IueiAqIENvbmZpZy5QSVhFTF9VTklUX1JFTEFUSU9OXHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcm91bmRVcFBvd2VyT2YyKHg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBsZXQgcmV0ID0gMjtcclxuXHJcbiAgICB3aGlsZSAocmV0IDwgeCkge1xyXG4gICAgICAgIHJldCAqPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBodHRwUmVxdWVzdCh1cmw6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICBsZXQgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICAgIGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGh0dHAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGh0dHAuc2VuZCgpO1xyXG59XHJcblxyXG5sZXQgc21hbGxQb29sOiBBcnJheTxhbnk+ID0gW107XHJcbmV4cG9ydCBmdW5jdGlvbiByZW1lbWJlclBvb2xBbGxvYyhvYmplY3Q6IGFueSk6IGFueSB7XHJcbiAgICBzbWFsbFBvb2wucHVzaChvYmplY3QpO1xyXG4gICAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZyZWVQb29sQWxsb2MoKTogdm9pZCB7XHJcbiAgICBmb3IgKGxldCBpPTAsb2JqO29iaj1zbWFsbFBvb2xbaV07aSsrKSB7XHJcbiAgICAgICAgb2JqLmRlbGV0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNtYWxsUG9vbC5sZW5ndGggPSAwO1xyXG59IiwiaW1wb3J0IENvbGxpc2lvbiBmcm9tICcuL0NvbGxpc2lvbic7XHJcbmltcG9ydCBDb2xvck1hdGVyaWFsIGZyb20gJy4uL21hdGVyaWFscy9Db2xvck1hdGVyaWFsJztcclxuaW1wb3J0IEN1YmVHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeSc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xyXG5pbXBvcnQgeyBWZWN0b3I0IH0gZnJvbSAnLi4vbWF0aC9WZWN0b3I0JztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcclxuXHJcbmNsYXNzIEJveENvbGxpc2lvbiBleHRlbmRzIENvbGxpc2lvbiB7XHJcbiAgICBwcml2YXRlIF9zaXplICAgICAgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByaXZhdGUgX2JveCAgICAgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG5cclxuICAgIHB1YmxpYyBpc0R5bmFtaWMgICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgXHJcblxyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFZlY3RvcjMsIHNpemU6IFZlY3RvcjMpIHtcclxuICAgICAgICBzdXBlcihudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgICAgICB0aGlzLl9zaXplID0gc2l6ZTtcclxuICAgICAgICB0aGlzLmlzRHluYW1pYyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLl9yZWNhbGMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZW9yZGVyQm94KGJveDogQXJyYXk8bnVtYmVyPik6IEFycmF5PG51bWJlcj4ge1xyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDM7aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChib3hbMytpXSA8IGJveFswK2ldKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaCA9IGJveFswK2ldO1xyXG4gICAgICAgICAgICAgICAgYm94WzAraV0gPSBib3hbMytpXTtcclxuICAgICAgICAgICAgICAgIGJveFszK2ldID0gaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJveDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ib3hDb2xsaXNpb24oYm94OiBBcnJheTxudW1iZXI+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGIgPSB0aGlzLl9ib3g7XHJcblxyXG4gICAgICAgIGlmIChib3hbMF0gPj0gYlszXSB8fCBib3hbMV0gPj0gYls0XSB8fCBib3hbMl0gPj0gYls1XSB8fCBib3hbM10gPCBiWzBdIHx8IGJveFs0XSA8IGJbMV0gfHwgYm94WzVdIDwgYlsyXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWNhbGMoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb24sXHJcbiAgICAgICAgICAgIHNpemUgPSB0aGlzLl9zaXplO1xyXG5cclxuICAgICAgICBsZXQgcHggPSBwb3NpdGlvbi54ICsgdGhpcy5fb2Zmc2V0LngsXHJcbiAgICAgICAgICAgIHB5ID0gcG9zaXRpb24ueSArIHRoaXMuX29mZnNldC55LFxyXG4gICAgICAgICAgICBweiA9IHBvc2l0aW9uLnogKyB0aGlzLl9vZmZzZXQueixcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHN4ID0gc2l6ZS54IC8gMixcclxuICAgICAgICAgICAgc3kgPSBzaXplLnkgLyAyLFxyXG4gICAgICAgICAgICBzeiA9IHNpemUueiAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuX2JveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3B4IC0gc3gsIHB5IC0gc3ksIHB6IC0gc3osIHB4ICsgc3gsIHB5ICsgc3ksIHB6ICsgc3pdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGVzdChwb3NpdGlvbjogVmVjdG9yMywgZGlyZWN0aW9uOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEeW5hbWljKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY2FsYygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbGxpZGVkID0gZmFsc2UsXHJcbiAgICAgICAgICAgIHdpZHRoID0gMC4zLFxyXG4gICAgICAgICAgICBoZWlnaHQgPSAwLjgsXHJcbiAgICAgICAgICAgIHggPSBwb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueSxcclxuICAgICAgICAgICAgeiA9IHBvc2l0aW9uLnosXHJcbiAgICAgICAgICAgIHhUbyA9IGRpcmVjdGlvbi54LFxyXG4gICAgICAgICAgICB6VG8gPSBkaXJlY3Rpb24ueixcclxuICAgICAgICAgICAgc2lnbiA9IChkaXJlY3Rpb24ueCA+IDApPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCAqIHNpZ24sIHksIHogLSB3aWR0aCwgeCArIHdpZHRoICogc2lnbiArIGRpcmVjdGlvbi54LCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGhdKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2JveENvbGxpc2lvbihib3gpKSB7XHJcbiAgICAgICAgICAgIHhUbyA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHggKz0geFRvO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNpZ24gPSAoZGlyZWN0aW9uLnogPiAwKT8gMSA6IC0xO1xyXG4gICAgICAgIGJveCA9IHRoaXMuX3Jlb3JkZXJCb3goW3ggLSB3aWR0aCwgeSwgeiAtIHdpZHRoICogc2lnbiwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB6ICsgd2lkdGggKiBzaWduICsgZGlyZWN0aW9uLnpdKTtcclxuICAgICAgICBpZiAodGhpcy5fYm94Q29sbGlzaW9uKGJveCkpIHtcclxuICAgICAgICAgICAgelRvID0gMDtcclxuICAgICAgICAgICAgY29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjb2xsaWRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNvbGlkKSB7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvbi5zZXQoeFRvLCAwLCB6VG8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQ29sbGlzaW9uSW5zdGFuY2UocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IEN1YmVHZW9tZXRyeShyZW5kZXJlciwgdGhpcy5fc2l6ZS54LCB0aGlzLl9zaXplLnksIHRoaXMuX3NpemUueiksXHJcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IENvbG9yTWF0ZXJpYWwocmVuZGVyZXIsIG5ldyBWZWN0b3I0KDAuMCwgMS4wLCAwLjAsIDAuNSkpLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgb2JqZWN0ID0gSW5zdGFuY2UuYWxsb2NhdGUocmVuZGVyZXIsIGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIG1hdGVyaWFsLnNldE9wYXF1ZShmYWxzZSk7XHJcblxyXG4gICAgICAgIG9iamVjdC5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uO1xyXG5cclxuICAgICAgICBnZW9tZXRyeS5vZmZzZXQgPSB0aGlzLl9vZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZEdhbWVPYmplY3Qob2JqZWN0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlID0gb2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjZW50ZXJJbkF4aXMoeDogYm9vbGVhbiwgeTogYm9vbGVhbiwgejogYm9vbGVhbik6IEJveENvbGxpc2lvbiB7XHJcbiAgICAgICAgdGhpcy5fb2Zmc2V0LnggPSAoIXgpPyB0aGlzLl9zaXplLnggLyAyIDogMDtcclxuICAgICAgICB0aGlzLl9vZmZzZXQueSA9ICgheSk/IHRoaXMuX3NpemUueSAvIDIgOiAwO1xyXG4gICAgICAgIHRoaXMuX29mZnNldC56ID0gKCF6KT8gdGhpcy5fc2l6ZS56IC8gMiA6IDA7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlY2FsYygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCb3hDb2xsaXNpb247IiwiaW1wb3J0IFNjZW5lIGZyb20gJy4uL1NjZW5lJztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcclxuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBDb2xsaXNpb24ge1xyXG4gICAgcHJvdGVjdGVkIF9zY2VuZSAgICAgICAgICAgICAgICA6IFNjZW5lO1xyXG4gICAgcHJvdGVjdGVkIF9pbnN0YW5jZSAgICAgICAgICAgICA6IEluc3RhbmNlO1xyXG4gICAgcHJvdGVjdGVkIF9wb3NpdGlvbiAgICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcm90ZWN0ZWQgX29mZnNldCAgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByb3RlY3RlZCBfZGlzcGxheUluc3RhbmNlICAgICAgOiBJbnN0YW5jZTtcclxuXHJcbiAgICBwdWJsaWMgc29saWQgICAgICAgICAgICAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogU2NlbmUpIHtcclxuICAgICAgICB0aGlzLnNldFNjZW5lKHNjZW5lKTtcclxuICAgICAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fb2Zmc2V0ID0gbmV3IFZlY3RvcjMoMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IHRlc3QocG9zaXRpb246IFZlY3RvcjMsIGRpcmVjdGlvbjogVmVjdG9yMykgOiBWZWN0b3IzO1xyXG5cclxuICAgIHB1YmxpYyBzZXRTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRJbnN0YW5jZShpbnN0YW5jZTogSW5zdGFuY2UpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbnN0YW5jZSA9IGluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb2xsaXNpb25JbnN0YW5jZShyZW5kZXJlcjogUmVuZGVyZXIpOiB2b2lkIHtcclxuICAgICAgICByZW5kZXJlcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUluc3RhbmNlLmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGluc3RhbmNlKCk6IEluc3RhbmNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBkaXNwbGF5SW5zdGFuY2UoKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNwbGF5SW5zdGFuY2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbGxpc2lvbjsiLCJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4uL0NhbWVyYSc7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9TY2VuZSc7XHJcbmltcG9ydCBDb2xsaXNpb24gZnJvbSAnLi4vY29sbGlzaW9ucy9Db2xsaXNpb24nO1xyXG5pbXBvcnQgR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XHJcbmltcG9ydCBNYXRlcmlhbCBmcm9tICcuLi9tYXRlcmlhbHMvTWF0ZXJpYWwnO1xyXG5pbXBvcnQgU2hhZGVyIGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyJztcclxuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuLi9Db21wb25lbnQnO1xyXG5pbXBvcnQgTWF0cml4NCBmcm9tICcuLi9tYXRoL01hdHJpeDQnO1xyXG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi4vbWF0aC9WZWN0b3IzJztcclxuaW1wb3J0IHsgZ2V0MkRBbmdsZSB9IGZyb20gJy4uL1V0aWxzJztcclxuaW1wb3J0IENvbmZpZyBmcm9tICcuLi9Db25maWcnO1xyXG5pbXBvcnQgeyByZW1lbWJlclBvb2xBbGxvYyBhcyBycGEsIGZyZWVQb29sQWxsb2MgfSBmcm9tICcuLi9VdGlscyc7XHJcbmltcG9ydCBQb29saWZ5IGZyb20gJy4uL1Bvb2xpZnknO1xyXG5pbXBvcnQgeyBQb29sQ2xhc3MgfSBmcm9tICcuLi9Qb29saWZ5JztcclxuaW1wb3J0IExpc3QgZnJvbSAnLi4vTGlzdCc7XHJcblxyXG5jbGFzcyBJbnN0YW5jZSBpbXBsZW1lbnRzIFBvb2xDbGFzcyB7XHJcbiAgICBwcm90ZWN0ZWQgX3JlbmRlcmVyICAgICAgICAgICA6IFJlbmRlcmVyO1xyXG4gICAgcHJvdGVjdGVkIF9nZW9tZXRyeSAgICAgICAgICAgOiBHZW9tZXRyeTtcclxuICAgIHByb3RlY3RlZCBfbWF0ZXJpYWwgICAgICAgICAgIDogTWF0ZXJpYWw7XHJcbiAgICBwcm90ZWN0ZWQgX3JvdGF0aW9uICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcm90ZWN0ZWQgX3RyYW5zZm9ybSAgICAgICAgICA6IE1hdHJpeDQ7XHJcbiAgICBwcm90ZWN0ZWQgX3NjZW5lICAgICAgICAgICAgICA6IFNjZW5lO1xyXG4gICAgcHJvdGVjdGVkIF9jb21wb25lbnRzICAgICAgICAgOiBMaXN0PENvbXBvbmVudD47XHJcbiAgICBwcm90ZWN0ZWQgX2NvbGxpc2lvbiAgICAgICAgICA6IENvbGxpc2lvbjtcclxuICAgIHByb3RlY3RlZCBfbmVlZHNVcGRhdGUgICAgICAgIDogYm9vbGVhbjtcclxuICAgIHByb3RlY3RlZCBfZGVzdHJveWVkICAgICAgICAgIDogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgcHVibGljIHBvc2l0aW9uICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG4gICAgcHVibGljIGlzQmlsbGJvYXJkICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgcHVibGljIGluVXNlICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIgPSBudWxsLCBnZW9tZXRyeTogR2VvbWV0cnkgPSBudWxsLCBtYXRlcmlhbDogTWF0ZXJpYWwgPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gTWF0cml4NC5jcmVhdGVJZGVudGl0eSgpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygwLjApO1xyXG4gICAgICAgIHRoaXMuX3JvdGF0aW9uID0gbmV3IFZlY3RvcjMoMC4wKTtcclxuICAgICAgICB0aGlzLmlzQmlsbGJvYXJkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX3NjZW5lID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gbmV3IExpc3QoKTtcclxuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlcnxWZWN0b3IzLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIGxldCBfeDogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yMz54KS54O1xyXG4gICAgICAgICAgICB5ID0gKDxWZWN0b3IzPngpLnk7XHJcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfeCA9IDxudW1iZXI+eDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZWxhdGl2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZChfeCwgeSwgeik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoX3gsIHksIHopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fY29sbGlzaW9uICYmIHRoaXMuX2NvbGxpc2lvbi5kaXNwbGF5SW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGlzaW9uLmRpc3BsYXlJbnN0YW5jZS50cmFuc2xhdGUoeCwgeSwgeiwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHJvdGF0ZSh4OiBudW1iZXJ8VmVjdG9yMywgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCwgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IEluc3RhbmNlIHtcclxuICAgICAgICBsZXQgX3g6IG51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKDxWZWN0b3IzPngpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBfeCA9ICg8VmVjdG9yMz54KS54O1xyXG4gICAgICAgICAgICB5ID0gKDxWZWN0b3IzPngpLnk7XHJcbiAgICAgICAgICAgIHogPSAoPFZlY3RvcjM+eCkuejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfeCA9IDxudW1iZXI+eDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JvdGF0aW9uLmFkZChfeCwgeSwgeik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcm90YXRpb24uc2V0KF94LCB5LCB6KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcclxuICAgICAgICBjb21wb25lbnQuYWRkSW5zdGFuY2UodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbXBvbmVudDxUPihjb21wb25lbnROYW1lOiBzdHJpbmcpOiBUIHtcclxuICAgICAgICBmb3IgKGxldCBpPTAsY29tcDtjb21wPXRoaXMuX2NvbXBvbmVudHMuZ2V0QXQoaSk7aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wLm5hbWUgPT0gY29tcG9uZW50TmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxUPig8YW55PmNvbXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFRyYW5zZm9ybWF0aW9uKCk6IE1hdHJpeDQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmVlZHNVcGRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRJZGVudGl0eSgpO1xyXG5cclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0ubXVsdGlwbHkocnBhKE1hdHJpeDQuY3JlYXRlWFJvdGF0aW9uKHRoaXMuX3JvdGF0aW9uLngpKSk7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtLm11bHRpcGx5KHJwYShNYXRyaXg0LmNyZWF0ZVpSb3RhdGlvbih0aGlzLl9yb3RhdGlvbi56KSkpO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5tdWx0aXBseShycGEoTWF0cml4NC5jcmVhdGVZUm90YXRpb24odGhpcy5fcm90YXRpb24ueSkpKTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuX2dlb21ldHJ5Lm9mZnNldDtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm0udHJhbnNsYXRlKHRoaXMucG9zaXRpb24ueCArIG9mZnNldC54LCB0aGlzLnBvc2l0aW9uLnkgKyBvZmZzZXQueSwgdGhpcy5wb3NpdGlvbi56ICsgb2Zmc2V0LnopO1xyXG5cclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmcmVlUG9vbEFsbG9jKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldENvbGxpc2lvbihjb2xsaXNpb246IENvbGxpc2lvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbiA9IGNvbGxpc2lvbjtcclxuICAgICAgICBjb2xsaXNpb24uc2V0SW5zdGFuY2UodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldChyZW5kZXJlcjogUmVuZGVyZXIsIGdlb21ldHJ5OiBHZW9tZXRyeSA9IG51bGwsIG1hdGVyaWFsOiBNYXRlcmlhbCA9IG51bGwpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDtcclxuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5fcm90YXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRJZGVudGl0eSgpO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNCaWxsYm9hcmQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZSgpOiB2b2lkIHtcclxuICAgICAgICBwb29sLmZyZWUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGF3YWtlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMuZWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgY29tcG9uZW50LmF3YWtlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb2xsaXNpb24gJiYgQ29uZmlnLkRJU1BMQVlfQ09MTElTSU9OUykge1xyXG4gICAgICAgICAgICBsZXQgY29sbGlzaW9uID0gdGhpcy5fY29sbGlzaW9uO1xyXG5cclxuICAgICAgICAgICAgY29sbGlzaW9uLnNldFNjZW5lKHRoaXMuX3NjZW5lKTtcclxuICAgICAgICAgICAgY29sbGlzaW9uLmFkZENvbGxpc2lvbkluc3RhbmNlKHRoaXMuX3JlbmRlcmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLmVhY2goKGNvbXBvbmVudDogQ29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudC51cGRhdGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLmVhY2goKGNvbXBvbmVudDogQ29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5kZXN0cm95KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9nZW9tZXRyeS5pc0R5bmFtaWMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2VvbWV0cnkuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbGxpc2lvbiAmJiBDb25maWcuRElTUExBWV9DT0xMSVNJT05TKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxpc2lvbi5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXIoY2FtZXJhOiBDYW1lcmEpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2dlb21ldHJ5IHx8ICF0aGlzLl9tYXRlcmlhbCkgeyByZXR1cm47IH1cclxuICAgICAgICBpZiAoIXRoaXMuX21hdGVyaWFsLmlzUmVhZHkpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnN3aXRjaFNoYWRlcih0aGlzLl9tYXRlcmlhbC5zaGFkZXJOYW1lKTtcclxuXHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNCaWxsYm9hcmQpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGUoMCwgZ2V0MkRBbmdsZSh0aGlzLnBvc2l0aW9uLCBjYW1lcmEucG9zaXRpb24pICsgTWF0aC5QSSAvIDIsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHVQb3NpdGlvbiA9IE1hdHJpeDQuYWxsb2NhdGUoKTtcclxuICAgICAgICB1UG9zaXRpb24ubXVsdGlwbHkodGhpcy5nZXRUcmFuc2Zvcm1hdGlvbigpKTtcclxuICAgICAgICB1UG9zaXRpb24ubXVsdGlwbHkoY2FtZXJhLmdldFRyYW5zZm9ybWF0aW9uKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zW1widVByb2plY3Rpb25cIl0sIGZhbHNlLCBjYW1lcmEucHJvamVjdGlvbi5kYXRhKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtc1tcInVQb3NpdGlvblwiXSwgZmFsc2UsIHVQb3NpdGlvbi5kYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5LnJlbmRlcigpO1xyXG5cclxuICAgICAgICB1UG9zaXRpb24uZGVsZXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhbGxvY2F0ZShyZW5kZXJlcjogUmVuZGVyZXIsIGdlb21ldHJ5OiBHZW9tZXRyeSA9IG51bGwsIG1hdGVyaWFsOiBNYXRlcmlhbCA9IG51bGwpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IGlucyA9IDxJbnN0YW5jZT5wb29sLmFsbG9jYXRlKCk7XHJcblxyXG4gICAgICAgIGlucy5zZXQocmVuZGVyZXIsIGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBnZW9tZXRyeSgpOiBHZW9tZXRyeSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IG1hdGVyaWFsKCk6IE1hdGVyaWFsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWF0ZXJpYWw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgcm90YXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JvdGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY29sbGlzaW9uKCk6IENvbGxpc2lvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxpc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNjZW5lKCk6IFNjZW5lIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NlbmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpc0Rlc3Ryb3llZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVzdHJveWVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgcG9vbCA9IG5ldyBQb29saWZ5KDIwLCBJbnN0YW5jZSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbnN0YW5jZTsiLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9UZXh0dXJlJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuaW1wb3J0IEJhc2ljTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL0Jhc2ljTWF0ZXJpYWwnO1xyXG5pbXBvcnQgV2FsbEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcclxuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4uL21hdGgvVmVjdG9yMyc7XHJcbmltcG9ydCB7IHJvdW5kVXBQb3dlck9mMiB9IGZyb20gJy4uL1V0aWxzJztcclxuaW1wb3J0IEluc3RhbmNlIGZyb20gJy4uL2VudGl0aWVzL0luc3RhbmNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGV4dE9wdGlvbnMge1xyXG4gICAgc2l6ZT86IG51bWJlcjtcclxuICAgIHN0cm9rZT86IGJvb2xlYW47XHJcbiAgICBmaWxsPzogYm9vbGVhbjtcclxuICAgIGZpbGxDb2xvcj86IHN0cmluZztcclxuICAgIHN0cm9rZUNvbG9yPzogc3RyaW5nO1xyXG4gICAgcG9zaXRpb24/OiBWZWN0b3IzO1xyXG4gICAgcm90YXRpb24/OiBWZWN0b3IzO1xyXG59XHJcblxyXG5jb25zdCBPcHRpb25zRGVmYXVsdDogVGV4dE9wdGlvbnMgPSB7XHJcbiAgICBzaXplOiAxMixcclxuICAgIHN0cm9rZTogZmFsc2UsXHJcbiAgICBmaWxsOiB0cnVlLFxyXG4gICAgZmlsbENvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICBzdHJva2VDb2xvcjogJyNGRkZGRkYnLFxyXG4gICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApLFxyXG4gICAgcm90YXRpb246IG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApXHJcbn07XHJcblxyXG5jbGFzcyBUZXh0IGV4dGVuZHMgSW5zdGFuY2Uge1xyXG4gICAgcHJpdmF0ZSBfdGV4dCAgICAgICAgICAgICAgIDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfZm9udCAgICAgICAgICAgICAgIDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfb3B0aW9ucyAgICAgICAgICAgIDogVGV4dE9wdGlvbnM7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgdGV4dDogc3RyaW5nLCBmb250OiBzdHJpbmcsIG9wdGlvbnM/OiBUZXh0T3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKHJlbmRlcmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGV4dCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHRoaXMuX21lcmdlT3B0aW9ucyhvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJpbnRUZXh0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbWVyZ2VPcHRpb25zKG9wdGlvbnM6IFRleHRPcHRpb25zKTogVGV4dE9wdGlvbnMge1xyXG4gICAgICAgIGlmICghb3B0aW9ucykgeyByZXR1cm4gT3B0aW9uc0RlZmF1bHQ7IH1cclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNpemUpIHsgb3B0aW9ucy5zaXplID0gT3B0aW9uc0RlZmF1bHQuc2l6ZTsgfVxyXG4gICAgICAgIGlmICghb3B0aW9ucy5zdHJva2UpIHsgb3B0aW9ucy5zdHJva2UgPSBPcHRpb25zRGVmYXVsdC5zdHJva2U7IH1cclxuICAgICAgICBpZiAoIW9wdGlvbnMuZmlsbCkgeyBvcHRpb25zLmZpbGwgPSBPcHRpb25zRGVmYXVsdC5maWxsOyB9XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmZpbGxDb2xvcikgeyBvcHRpb25zLmZpbGxDb2xvciA9IE9wdGlvbnNEZWZhdWx0LmZpbGxDb2xvcjsgfVxyXG4gICAgICAgIGlmICghb3B0aW9ucy5zdHJva2VDb2xvcikgeyBvcHRpb25zLnN0cm9rZUNvbG9yID0gT3B0aW9uc0RlZmF1bHQuc3Ryb2tlQ29sb3I7IH1cclxuICAgICAgICBpZiAoIW9wdGlvbnMucG9zaXRpb24pIHsgb3B0aW9ucy5wb3NpdGlvbiA9IE9wdGlvbnNEZWZhdWx0LnBvc2l0aW9uOyB9XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnJvdGF0aW9uKSB7IG9wdGlvbnMucm90YXRpb24gPSBPcHRpb25zRGVmYXVsdC5yb3RhdGlvbjsgfVxyXG5cclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9wcmludFRleHQoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXHJcbiAgICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgIGN0eC5mb250ID0gdGhpcy5fb3B0aW9ucy5zaXplICsgXCJweCBcIiArIHRoaXMuX2ZvbnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBjdHgub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHNpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy5fdGV4dCk7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHJvdW5kVXBQb3dlck9mMihzaXplLndpZHRoKTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gcm91bmRVcFBvd2VyT2YyKHRoaXMuX29wdGlvbnMuc2l6ZSk7XHJcbiAgICAgICAgY3R4LmZvbnQgPSB0aGlzLl9vcHRpb25zLnNpemUgKyBcInB4IFwiICsgdGhpcy5fZm9udDtcclxuXHJcbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBjdHgub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZmlsbCkge1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5fb3B0aW9ucy5maWxsQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLl90ZXh0LCA0LCB0aGlzLl9vcHRpb25zLnNpemUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc3Ryb2tlKSB7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuX29wdGlvbnMuc3Ryb2tlQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VUZXh0KHRoaXMuX3RleHQsIDQsIHRoaXMuX29wdGlvbnMuc2l6ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdXZzID0gWzAsIDAsIChzaXplLndpZHRoICsgNCkgLyBjYW52YXMud2lkdGgsICh0aGlzLl9vcHRpb25zLnNpemUgKyA4KSAvIGNhbnZhcy5oZWlnaHRdLFxyXG4gICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoY2FudmFzLCB0aGlzLl9yZW5kZXJlciksXHJcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbmV3IEJhc2ljTWF0ZXJpYWwodGhpcy5fcmVuZGVyZXIsIHRleHR1cmUpLFxyXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBXYWxsR2VvbWV0cnkodGhpcy5fcmVuZGVyZXIsIHNpemUud2lkdGggLyAxMDAsIHRoaXMuX29wdGlvbnMuc2l6ZSAvIDEwMCk7XHJcblxyXG4gICAgICAgIG1hdGVyaWFsLnNldFV2KHV2c1swXSwgdXZzWzFdLCB1dnNbMl0sIHV2c1szXSk7XHJcbiAgICAgICAgbWF0ZXJpYWwuc2V0T3BhcXVlKGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gZ2VvbWV0cnk7XHJcblxyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlKHRoaXMuX29wdGlvbnMucG9zaXRpb24ueCwgdGhpcy5fb3B0aW9ucy5wb3NpdGlvbi55LCB0aGlzLl9vcHRpb25zLnBvc2l0aW9uLnopO1xyXG4gICAgICAgIHRoaXMucm90YXRlKHRoaXMuX29wdGlvbnMucm90YXRpb24ueCwgdGhpcy5fb3B0aW9ucy5yb3RhdGlvbi55LCB0aGlzLl9vcHRpb25zLnJvdGF0aW9uLnopO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXh0OyIsImltcG9ydCBHZW9tZXRyeSBmcm9tICcuLi9nZW9tZXRyaWVzL0dlb21ldHJ5JztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuXHJcbmNsYXNzIEN1YmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgICAgICB0aGlzLl9keW5hbWljID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRDdWJlKHdpZHRoLCBoZWlnaHQsIGxlbmd0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYnVpbGRDdWJlKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCB3ID0gd2lkdGggLyAyLFxyXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMixcclxuICAgICAgICAgICAgbCA9IGxlbmd0aCAvIDI7XHJcblxyXG4gICAgICAgIC8vIEZyb250IGZhY2VcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XHJcblxyXG4gICAgICAgIC8vIEJhY2sgZmFjZVxyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAtbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsIC1sKTtcclxuXHJcbiAgICAgICAgLy8gTGVmdCBmYWNlXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgLWwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgLWgsICBsKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAtbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgIGwpO1xyXG5cclxuICAgICAgICAvLyBSaWdodCBmYWNlXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAtaCwgIGwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgLWwpO1xyXG5cclxuICAgICAgICAvLyBUb3AgZmFjZVxyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSgtdywgIGgsICBsKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsICBoLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgaCwgLWwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIGgsIC1sKTtcclxuXHJcbiAgICAgICAgLy8gQm90dG9tIGZhY2VcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoIHcsIC1oLCAgbCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIGwpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsIC1sKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsIC1oLCAtbCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDY7aSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmQgPSBpICogNDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMik7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoaW5kICsgMSwgaW5kICsgMywgaW5kICsgMik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDAuMCwgMS4wKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDEuMCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAwLjApO1xyXG4gICAgICAgICAgICB0aGlzLmFkZFRleENvb3JkKDEuMCwgMC4wKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQodGhpcy5fcmVuZGVyZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDdWJlR2VvbWV0cnk7IiwiaW1wb3J0IHsgVkVSVElDRV9TSVpFLCBURVhDT09SRF9TSVpFIH0gZnJvbSAnLi4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuaW1wb3J0IFNoYWRlciBmcm9tICcuLi9zaGFkZXJzL1NoYWRlcic7XHJcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuLi9tYXRoL1ZlY3RvcjMnO1xyXG5cclxuY2xhc3MgR2VvbWV0cnkge1xyXG4gICAgcHJpdmF0ZSBfdmVydGljZXMgICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfdHJpYW5nbGVzICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfdGV4Q29vcmRzICAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfdmVydGV4QnVmZmVyICAgICAgICAgICAgOiBXZWJHTEJ1ZmZlcjtcclxuICAgIHByaXZhdGUgX3RleEJ1ZmZlciAgICAgICAgICAgICAgIDogV2ViR0xCdWZmZXI7XHJcbiAgICBwcml2YXRlIF9pbmRleEJ1ZmZlciAgICAgICAgICAgICA6IFdlYkdMQnVmZmVyO1xyXG4gICAgcHJpdmF0ZSBfaW5kZXhMZW5ndGggICAgICAgICAgICAgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9ib3VuZGluZ0JveCAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBfcmVuZGVyZXIgICAgICAgICAgICAgIDogUmVuZGVyZXI7XHJcbiAgICBwcm90ZWN0ZWQgX2R5bmFtaWMgICAgICAgICAgICAgICA6IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIG9mZnNldCAgICAgICAgICAgICAgICAgICAgOiBWZWN0b3IzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5fdGV4Q29vcmRzID0gW107XHJcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzID0gW107XHJcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSBbSW5maW5pdHksIEluZmluaXR5LCBJbmZpbml0eSwgLUluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eV07XHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZHluYW1pYyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRWZXJ0aWNlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNlcy5wdXNoKHgsIHksIHopO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgYm91bmRpbmcgYm94XHJcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSBbXHJcbiAgICAgICAgICAgIE1hdGgubWluKHRoaXMuX2JvdW5kaW5nQm94WzBdLCB4KSxcclxuICAgICAgICAgICAgTWF0aC5taW4odGhpcy5fYm91bmRpbmdCb3hbMV0sIHkpLFxyXG4gICAgICAgICAgICBNYXRoLm1pbih0aGlzLl9ib3VuZGluZ0JveFsyXSwgeiksXHJcbiAgICAgICAgICAgIE1hdGgubWF4KHRoaXMuX2JvdW5kaW5nQm94WzNdLCB4KSxcclxuICAgICAgICAgICAgTWF0aC5tYXgodGhpcy5fYm91bmRpbmdCb3hbNF0sIHkpLFxyXG4gICAgICAgICAgICBNYXRoLm1heCh0aGlzLl9ib3VuZGluZ0JveFs1XSwgeilcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgYWRkVGV4Q29vcmQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl90ZXhDb29yZHMucHVzaCh4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkVHJpYW5nbGUodmVydDE6IG51bWJlciwgdmVydDI6IG51bWJlciwgdmVydDM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNlc1t2ZXJ0MSAqIFZFUlRJQ0VfU0laRV0gPT09IHVuZGVmaW5lZCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJWZXJ0aWNlIFtcIiArIHZlcnQxICsgXCJdIG5vdCBmb3VuZCFcIil9XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW3ZlcnQyICogVkVSVElDRV9TSVpFXSA9PT0gdW5kZWZpbmVkKSB7IHRocm93IG5ldyBFcnJvcihcIlZlcnRpY2UgW1wiICsgdmVydDIgKyBcIl0gbm90IGZvdW5kIVwiKX1cclxuICAgICAgICBpZiAodGhpcy5fdmVydGljZXNbdmVydDMgKiBWRVJUSUNFX1NJWkVdID09PSB1bmRlZmluZWQpIHsgdGhyb3cgbmV3IEVycm9yKFwiVmVydGljZSBbXCIgKyB2ZXJ0MyArIFwiXSBub3QgZm91bmQhXCIpfVxyXG5cclxuICAgICAgICB0aGlzLl90cmlhbmdsZXMucHVzaCh2ZXJ0MSwgdmVydDIsIHZlcnQzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnVpbGQocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGdsID0gcmVuZGVyZXIuR0w7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XHJcblxyXG4gICAgICAgIHRoaXMuX3ZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl92ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRoaXMuX3ZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICB0aGlzLl90ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5fdGV4QnVmZmVyKTtcclxuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLl90ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luZGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5faW5kZXhCdWZmZXIpO1xyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheSh0aGlzLl90cmlhbmdsZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luZGV4TGVuZ3RoID0gdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5fdmVydGljZXMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3RleENvb3JkcyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXJCb3VuZEJveEF4aXMoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCwgejogbnVtYmVyID0gMCk6IEdlb21ldHJ5IHtcclxuICAgICAgICBpZiAoeCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzBdID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbM10gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoeSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzFdID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fYm91bmRpbmdCb3hbNF0gPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHogPT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ib3VuZGluZ0JveFsyXSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdW5kaW5nQm94WzVdID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBnbCA9IHRoaXMuX3JlbmRlcmVyLkdMO1xyXG5cclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5fdmVydGV4QnVmZmVyKTtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5fdGV4QnVmZmVyKTtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5faW5kZXhCdWZmZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuX3ZlcnRleEJ1ZmZlcik7XHJcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlc1tcImFWZXJ0ZXhQb3NpdGlvblwiXSwgVkVSVElDRV9TSVpFLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cclxuICAgICAgICBpZiAoc2hhZGVyLmF0dHJpYnV0ZXNbXCJhVGV4Q29vcmRzXCJdKSB7XHJcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl90ZXhCdWZmZXIpO1xyXG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzW1wiYVRleENvb3Jkc1wiXSwgVEVYQ09PUkRfU0laRSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuX2luZGV4QnVmZmVyKTtcclxuXHJcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgdGhpcy5faW5kZXhMZW5ndGgsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzRHluYW1pYygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZHluYW1pYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGJvdW5kaW5nQm94KCk6IEFycmF5PG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ib3VuZGluZ0JveDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgR2VvbWV0cnk7IiwiaW1wb3J0IEdlb21ldHJ5IGZyb20gJy4uL2dlb21ldHJpZXMvR2VvbWV0cnknO1xyXG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xyXG5cclxuY2xhc3MgUGxhbmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyOiBSZW5kZXJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG4gICAgICAgIHRoaXMuX2R5bmFtaWMgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9idWlsZFBsYW5lKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkUGxhbmUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdyA9IHdpZHRoIC8gMixcclxuICAgICAgICAgICAgaCA9IGhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgIC8vIFRvcCBmYWNlXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAgMCwgIGgpO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgIDAsICBoKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICAwLCAtaCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgMCwgLWgpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZFRyaWFuZ2xlKDAsIDEsIDIpO1xyXG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMSwgMywgMik7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAxLjApO1xyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAxLjApO1xyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMC4wLCAwLjApO1xyXG4gICAgICAgIHRoaXMuYWRkVGV4Q29vcmQoMS4wLCAwLjApO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkKHRoaXMuX3JlbmRlcmVyKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxhbmVHZW9tZXRyeTsiLCJpbXBvcnQgR2VvbWV0cnkgZnJvbSAnLi4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcblxyXG5jbGFzcyBXYWxsR2VvbWV0cnkgZXh0ZW5kcyBHZW9tZXRyeSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgICAgICB0aGlzLl9keW5hbWljID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRXYWxsKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkV2FsbCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCB3ID0gd2lkdGggLyAyLFxyXG4gICAgICAgICAgICBoID0gaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKC13LCAtaCwgIDApO1xyXG4gICAgICAgIHRoaXMuYWRkVmVydGljZSggdywgLWgsICAwKTtcclxuICAgICAgICB0aGlzLmFkZFZlcnRpY2UoLXcsICBoLCAgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRWZXJ0aWNlKCB3LCAgaCwgIDApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkVHJpYW5nbGUoMCwgMSwgMik7XHJcbiAgICAgICAgdGhpcy5hZGRUcmlhbmdsZSgxLCAzLCAyKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDEuMCk7XHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDEuMCk7XHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgwLjAsIDAuMCk7XHJcbiAgICAgICAgdGhpcy5hZGRUZXhDb29yZCgxLjAsIDAuMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQodGhpcy5fcmVuZGVyZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXYWxsR2VvbWV0cnk7IiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJlciB9IGZyb20gJy4vUmVuZGVyZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENhbWVyYSB9IGZyb20gJy4vQ2FtZXJhJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb21wb25lbnQgfSBmcm9tICcuL0NvbXBvbmVudCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29uZmlnIH0gZnJvbSAnLi9Db25maWcnO1xyXG5leHBvcnQgKiBmcm9tICcuL0NvbnN0YW50cyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5wdXQgfSBmcm9tICcuL0lucHV0JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBMaXN0IH0gZnJvbSAnLi9MaXN0JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBQb29saWZ5IH0gZnJvbSAnLi9Qb29saWZ5JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJpbmdMYXllciB9IGZyb20gJy4vUmVuZGVyaW5nTGF5ZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjZW5lIH0gZnJvbSAnLi9TY2VuZSc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dHVyZSB9IGZyb20gJy4vVGV4dHVyZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vVXRpbHMnO1xyXG5cclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBCb3hDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbnMvQm94Q29sbGlzaW9uJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbnMvQ29sbGlzaW9uJztcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5zdGFuY2UgfSBmcm9tICcuL2VudGl0aWVzL0luc3RhbmNlJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBUZXh0IH0gZnJvbSAnLi9lbnRpdGllcy9UZXh0JztcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ3ViZUdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyaWVzL0N1YmVHZW9tZXRyeSc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxhbmVHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9QbGFuZUdlb21ldHJ5JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBXYWxsR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJpZXMvV2FsbEdlb21ldHJ5JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cmllcy9HZW9tZXRyeSc7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJhc2ljTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFscy9CYXNpY01hdGVyaWFsJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb2xvck1hdGVyaWFsIH0gZnJvbSAnLi9tYXRlcmlhbHMvQ29sb3JNYXRlcmlhbCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFscy9NYXRlcmlhbCc7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIE1hdHJpeDQgfSBmcm9tICcuL21hdGgvTWF0cml4NCc7XHJcbmV4cG9ydCB7IFZlY3RvcjMsIHZlYzMgfSBmcm9tICcuL21hdGgvVmVjdG9yMyc7XHJcbmV4cG9ydCB7IFZlY3RvcjQgfSBmcm9tICcuL21hdGgvVmVjdG9yNCc7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoYWRlciB9IGZyb20gJy4vc2hhZGVycy9TaGFkZXInO1xyXG5leHBvcnQgeyBTaGFkZXJTdHJ1Y3QsIFNoYWRlck1hcCwgU2hhZGVyc05hbWVzIH0gZnJvbSAnLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQmFzaWMgfSBmcm9tICcuL3NoYWRlcnMvQmFzaWMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbG9yIH0gZnJvbSAnLi9zaGFkZXJzL0NvbG9yJzsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uL1JlbmRlcmVyJztcclxuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vVGV4dHVyZSc7XHJcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xyXG5cclxuY2xhc3MgQmFzaWNNYXRlcmlhbCBleHRlbmRzIE1hdGVyaWFsIHtcclxuICAgIHByaXZhdGUgX3RleHR1cmUgICAgICAgICA6IFRleHR1cmU7XHJcbiAgICBwcml2YXRlIF91diAgICAgICAgICAgICAgOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfcmVwZWF0ICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHRleHR1cmU6IFRleHR1cmUpIHtcclxuICAgICAgICBzdXBlcihyZW5kZXJlciwgXCJCQVNJQ1wiKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICAgICAgdGhpcy5fdXYgPSBbMC4wLCAwLjAsIDEuMCwgMS4wXTtcclxuICAgICAgICB0aGlzLl9yZXBlYXQgPSBbMS4wLCAxLjBdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRVdih4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl91diA9IFt4LCB5LCB3LCBoXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFJlcGVhdCh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3JlcGVhdCA9IFt4LCB5XTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPT0gdGhpcykgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XHJcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5fdGV4dHVyZS50ZXh0dXJlKTtcclxuICAgICAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zW1widVRleHR1cmVcIl0sIDApO1xyXG5cclxuICAgICAgICBnbC51bmlmb3JtNGZ2KHNoYWRlci51bmlmb3Jtc1tcInVVVlwiXSwgdGhpcy5fdXYpO1xyXG4gICAgICAgIGdsLnVuaWZvcm0yZnYoc2hhZGVyLnVuaWZvcm1zW1widVJlcGVhdFwiXSwgdGhpcy5fcmVwZWF0KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xyXG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZS5pc1JlYWR5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdGV4dHVyZSgpOiBUZXh0dXJlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmFzaWNNYXRlcmlhbDsiLCJpbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vbWF0ZXJpYWxzL01hdGVyaWFsJztcclxuaW1wb3J0IHsgVmVjdG9yNCB9IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XHJcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi9SZW5kZXJlcic7XHJcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xyXG5cclxuY2xhc3MgQ29sb3JNYXRlcmlhbCBleHRlbmRzIE1hdGVyaWFsIHtcclxuICAgIHByaXZhdGUgX2NvbG9yICAgICAgICAgICAgICA6IEFycmF5PG51bWJlcj47XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyLCBjb2xvcjogVmVjdG9yNCkge1xyXG4gICAgICAgIHN1cGVyKHJlbmRlcmVyLCBcIkNPTE9SXCIpO1xyXG5cclxuICAgICAgICB0aGlzLl9jb2xvciA9IGNvbG9yLnRvQXJyYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPT0gdGhpcykgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fcmVuZGVyZXIuR0wsXHJcbiAgICAgICAgICAgIHNoYWRlciA9IFNoYWRlci5sYXN0UHJvZ3JhbTtcclxuXHJcbiAgICAgICAgZ2wudW5pZm9ybTRmdihzaGFkZXIudW5pZm9ybXNbXCJ1Q29sb3JcIl0sIHRoaXMuX2NvbG9yKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlckJvdGhGYWNlcykge1xyXG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBNYXRlcmlhbC5sYXN0UmVuZGVyZWQgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29sb3JNYXRlcmlhbDsiLCJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vUmVuZGVyZXInO1xyXG5pbXBvcnQgeyBTaGFkZXJzTmFtZXMgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XHJcbmltcG9ydCBTaGFkZXIgZnJvbSAnLi4vc2hhZGVycy9TaGFkZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVVVUlEIH0gZnJvbSAnLi4vVXRpbHMnO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgTWF0ZXJpYWwge1xyXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJlciAgICAgICAgICAgICAgICA6IFJlbmRlcmVyO1xyXG4gICAgcHJvdGVjdGVkIF9pc09wYXF1ZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XHJcbiAgICBwcm90ZWN0ZWQgX3JlbmRlckJvdGhGYWNlcyAgICAgICAgIDogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgcHVibGljIHJlYWRvbmx5IHNoYWRlck5hbWUgICAgICAgIDogU2hhZGVyc05hbWVzO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IHV1aWQgICAgICAgICAgICAgIDogc3RyaW5nO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgbGFzdFJlbmRlcmVkICAgICAgICA6IE1hdGVyaWFsID0gbnVsbDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZW5kZXJlcjogUmVuZGVyZXIsIHNoYWRlck5hbWU6IFNoYWRlcnNOYW1lcykge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XHJcbiAgICAgICAgdGhpcy5zaGFkZXJOYW1lID0gc2hhZGVyTmFtZTtcclxuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGFxdWUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckJvdGhGYWNlcyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRTaGFkZXIoKTogU2hhZGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVuZGVyZXIuZ2V0U2hhZGVyKHRoaXMuc2hhZGVyTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IHJlbmRlcigpOiB2b2lkO1xyXG4gICAgcHVibGljIGFic3RyYWN0IGdldCBpc1JlYWR5KCk6IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIGdldCBpc09wYXF1ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNPcGFxdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldE9wYXF1ZShvcGFxdWU6IGJvb2xlYW4pOiBNYXRlcmlhbCB7XHJcbiAgICAgICAgdGhpcy5faXNPcGFxdWUgPSBvcGFxdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEN1bGxpbmcoYm90aEZhY2VzOiBib29sZWFuKTogTWF0ZXJpYWwge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckJvdGhGYWNlcyA9IGJvdGhGYWNlcztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWF0ZXJpYWw7IiwiaW1wb3J0IHsgVmVjdG9yNCB9IGZyb20gJy4uL21hdGgvVmVjdG9yNCc7XHJcbmltcG9ydCBQb29saWZ5IGZyb20gJy4uL1Bvb2xpZnknO1xyXG5pbXBvcnQgeyBQb29sQ2xhc3MgfSBmcm9tICcuLi9Qb29saWZ5JztcclxuXHJcbmNsYXNzIE1hdHJpeDQgaW1wbGVtZW50cyBQb29sQ2xhc3Mge1xyXG4gICAgcHVibGljIGRhdGEgICAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcclxuICAgIHB1YmxpYyBpblVzZSAgICAgICAgICAgICAgICA6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IEFycmF5KDE2KTtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWF0cml4NCBuZWVkcyAxNiB2YWx1ZXMgdG8gYmUgY3JlYXRlZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDE2O2krKykge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSB2YWx1ZXNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQoLi4udmFsdWVzOiBBcnJheTxudW1iZXI+KTogTWF0cml4NCB7XHJcbiAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT0gMTYpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWF0cml4NCBuZWVkcyAxNiB2YWx1ZXMgdG8gYmUgY3JlYXRlZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDE2O2krKykge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSB2YWx1ZXNbaV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkobWF0cml4QjogTWF0cml4NCk6IE1hdHJpeDQge1xyXG4gICAgICAgIGxldCBUOiBBcnJheTxudW1iZXI+ID0gbWF0cml4Qi5kYXRhO1xyXG5cclxuICAgICAgICBsZXQgQzEgPSBuZXcgVmVjdG9yNChUWzBdLCBUWzRdLCBUWzhdLCBUWzEyXSk7XHJcbiAgICAgICAgbGV0IEMyID0gbmV3IFZlY3RvcjQoVFsxXSwgVFs1XSwgVFs5XSwgVFsxM10pO1xyXG4gICAgICAgIGxldCBDMyA9IG5ldyBWZWN0b3I0KFRbMl0sIFRbNl0sIFRbMTBdLCBUWzE0XSk7XHJcbiAgICAgICAgbGV0IEM0ID0gbmV3IFZlY3RvcjQoVFszXSwgVFs3XSwgVFsxMV0sIFRbMTVdKTtcclxuXHJcbiAgICAgICAgVCA9IHRoaXMuZGF0YTtcclxuICAgICAgICBsZXQgUjEgPSBuZXcgVmVjdG9yNChUWzBdLCBUWzFdLCBUWzJdLCBUWzNdKTtcclxuICAgICAgICBsZXQgUjIgPSBuZXcgVmVjdG9yNChUWzRdLCBUWzVdLCBUWzZdLCBUWzddKTtcclxuICAgICAgICBsZXQgUjMgPSBuZXcgVmVjdG9yNChUWzhdLCBUWzldLCBUWzEwXSwgVFsxMV0pO1xyXG4gICAgICAgIGxldCBSNCA9IG5ldyBWZWN0b3I0KFRbMTJdLCBUWzEzXSwgVFsxNF0sIFRbMTVdKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXQoXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIxLCBDMSksIFZlY3RvcjQuZG90KFIxLCBDMiksIFZlY3RvcjQuZG90KFIxLCBDMyksIFZlY3RvcjQuZG90KFIxLCBDNCksXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIyLCBDMSksIFZlY3RvcjQuZG90KFIyLCBDMiksIFZlY3RvcjQuZG90KFIyLCBDMyksIFZlY3RvcjQuZG90KFIyLCBDNCksXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFIzLCBDMSksIFZlY3RvcjQuZG90KFIzLCBDMiksIFZlY3RvcjQuZG90KFIzLCBDMyksIFZlY3RvcjQuZG90KFIzLCBDNCksXHJcbiAgICAgICAgICAgIFZlY3RvcjQuZG90KFI0LCBDMSksIFZlY3RvcjQuZG90KFI0LCBDMiksIFZlY3RvcjQuZG90KFI0LCBDMyksIFZlY3RvcjQuZG90KFI0LCBDNClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgPSAwLCByZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gKz0geDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSArPSB5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdICs9IHo7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSA9IHg7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gPSB5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdID0gejtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldElkZW50aXR5KCk6IE1hdHJpeDQge1xyXG4gICAgICAgIHRoaXMuc2V0KFxyXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZSgpOiB2b2lkIHtcclxuICAgICAgICBwb29sLmZyZWUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc2V0SWRlbnRpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUlkZW50aXR5KCk6IE1hdHJpeDQge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVPcnRobyh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgem5lYXI6IG51bWJlciwgemZhcjogbnVtYmVyKTogTWF0cml4NCB7XHJcbiAgICAgICAgbGV0IGwgPSAtd2lkdGggLyAyLjAsXHJcbiAgICAgICAgICAgIHIgPSB3aWR0aCAvIDIuMCxcclxuICAgICAgICAgICAgYiA9IC1oZWlnaHQgLyAyLjAsXHJcbiAgICAgICAgICAgIHQgPSBoZWlnaHQgLyAyLjAsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBBID0gMi4wIC8gKHIgLSBsKSxcclxuICAgICAgICAgICAgQiA9IDIuMCAvICh0IC0gYiksXHJcbiAgICAgICAgICAgIEMgPSAtMiAvICh6ZmFyIC0gem5lYXIpLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgWCA9IC0ociArIGwpIC8gKHIgLSBsKSxcclxuICAgICAgICAgICAgWSA9IC0odCArIGIpIC8gKHQgLSBiKSxcclxuICAgICAgICAgICAgWiA9IC0oemZhciArIHpuZWFyKSAvICh6ZmFyIC0gem5lYXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgICAgICAgIEEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIEIsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIEMsIDAsXHJcbiAgICAgICAgICAgIFgsIFksIFosIDFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlUGVyc3BlY3RpdmUoZm92OiBudW1iZXIsIHJhdGlvOiBudW1iZXIsIHpuZWFyOiBudW1iZXIsIHpmYXI6IG51bWJlcik6IE1hdHJpeDQge1xyXG4gICAgICAgIGxldCBTID0gMSAvIE1hdGgudGFuKGZvdiAvIDIpLFxyXG4gICAgICAgICAgICBSID0gUyAqIHJhdGlvLFxyXG4gICAgICAgICAgICBBID0gLSh6ZmFyKSAvICh6ZmFyIC0gem5lYXIpLFxyXG4gICAgICAgICAgICBCID0gLSh6ZmFyICogem5lYXIpIC8gKHpmYXIgLSB6bmVhcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAgICAgICBTLCAwLCAwLCAgMCxcclxuICAgICAgICAgICAgMCwgUiwgMCwgIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIEEsIC0xLFxyXG4gICAgICAgICAgICAwLCAwLCBCLCAgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhbGxvY2F0ZSgpOiBNYXRyaXg0IHtcclxuICAgICAgICByZXR1cm4gPE1hdHJpeDQ+cG9vbC5hbGxvY2F0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlVHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBNYXRyaXg0IHtcclxuICAgICAgICByZXR1cm4gTWF0cml4NC5hbGxvY2F0ZSgpLnNldChcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgeCwgeSwgeiwgMVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVYUm90YXRpb24ocmFkaWFuczogbnVtYmVyKTogTWF0cml4NCB7XHJcbiAgICAgICAgbGV0IEM6IG51bWJlciA9IE1hdGguY29zKHJhZGlhbnMpLFxyXG4gICAgICAgICAgICBTOiBudW1iZXIgPSBNYXRoLnNpbihyYWRpYW5zKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE1hdHJpeDQuYWxsb2NhdGUoKS5zZXQoXHJcbiAgICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAgMCwgQywtUywgMCxcclxuICAgICAgICAgICAgIDAsIFMsIEMsIDAsXHJcbiAgICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVlSb3RhdGlvbihyYWRpYW5zOiBudW1iZXIpOiBNYXRyaXg0IHtcclxuICAgICAgICBsZXQgQzogbnVtYmVyID0gTWF0aC5jb3MocmFkaWFucyksXHJcbiAgICAgICAgICAgIFM6IG51bWJlciA9IE1hdGguc2luKHJhZGlhbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4gTWF0cml4NC5hbGxvY2F0ZSgpLnNldChcclxuICAgICAgICAgICAgIEMsIDAsLVMsIDAsXHJcbiAgICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAgUywgMCwgQywgMCxcclxuICAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlWlJvdGF0aW9uKHJhZGlhbnM6IG51bWJlcik6IE1hdHJpeDQge1xyXG4gICAgICAgIGxldCBDOiBudW1iZXIgPSBNYXRoLmNvcyhyYWRpYW5zKSxcclxuICAgICAgICAgICAgUzogbnVtYmVyID0gTWF0aC5zaW4ocmFkaWFucyk7XHJcblxyXG4gICAgICAgIHJldHVybiBNYXRyaXg0LmFsbG9jYXRlKCkuc2V0KFxyXG4gICAgICAgICAgICAgQywtUywgMCwgMCxcclxuICAgICAgICAgICAgIFMsIEMsIDAsIDAsXHJcbiAgICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IHBvb2wgPSBuZXcgUG9vbGlmeSg1LCBNYXRyaXg0KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hdHJpeDQ7IiwiaW1wb3J0IFBvb2xpZnkgZnJvbSAnLi4vUG9vbGlmeSc7XHJcbmltcG9ydCB7IFBvb2xDbGFzcyB9IGZyb20gJy4uL1Bvb2xpZnknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZlY3RvcjMgaW1wbGVtZW50cyBQb29sQ2xhc3Mge1xyXG4gICAgcHJpdmF0ZSBfeCAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeSAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeiAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBuZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgaW5Vc2UgICAgICAgICAgICAgICAgOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHo6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLnNldCh4LCB5LCB6KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgdGhpcy5zZXQoMCwgMCwgMCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFZlY3RvcjMge1xyXG4gICAgICAgIHRoaXMuX3ggPSB4O1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuX3ogPSB6O1xyXG5cclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICAgICAgdGhpcy5feCArPSB4O1xyXG4gICAgICAgIHRoaXMuX3kgKz0geTtcclxuICAgICAgICB0aGlzLl96ICs9IHo7XHJcblxyXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkobnVtOiBudW1iZXIpOiBWZWN0b3IzIHtcclxuICAgICAgICB0aGlzLl94ICo9IG51bTtcclxuICAgICAgICB0aGlzLl95ICo9IG51bTtcclxuICAgICAgICB0aGlzLl96ICo9IG51bTtcclxuXHJcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aXBseSgxIC8gbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9uZSgpOiBWZWN0b3IzIHtcclxuICAgICAgICByZXR1cm4gdmVjMyh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVsZXRlKCk6IHZvaWQge1xyXG4gICAgICAgIHBvb2wuZnJlZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXF1YWxzKHZlY3RvcjM6IFZlY3RvcjMpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMueCA9PSB2ZWN0b3IzLnggJiYgdGhpcy55ID09IHZlY3RvcjMueSAmJiB0aGlzLnogPT0gdmVjdG9yMy56KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3g7IH1cclxuICAgIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feTsgfVxyXG4gICAgcHVibGljIGdldCB6KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl96OyB9XHJcblxyXG4gICAgcHVibGljIHNldCB4KHg6IG51bWJlcikgeyB0aGlzLl94ID0geDsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cclxuICAgIHB1YmxpYyBzZXQgeSh5OiBudW1iZXIpIHsgdGhpcy5feSA9IHk7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XHJcbiAgICBwdWJsaWMgc2V0IHooejogbnVtYmVyKSB7IHRoaXMuX3ogPSB6OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sZW5ndGggPSBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56KTtcclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gIGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3Jvc3ModmVjdG9yQTogVmVjdG9yMywgdmVjdG9yQjogVmVjdG9yMyk6IFZlY3RvcjMge1xyXG4gICAgICAgIHJldHVybiB2ZWMzKFxyXG4gICAgICAgICAgICB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnogLSB2ZWN0b3JBLnogKiB2ZWN0b3JCLnksXHJcbiAgICAgICAgICAgIHZlY3RvckEueiAqIHZlY3RvckIueCAtIHZlY3RvckEueCAqIHZlY3RvckIueixcclxuICAgICAgICAgICAgdmVjdG9yQS54ICogdmVjdG9yQi55IC0gdmVjdG9yQS55ICogdmVjdG9yQi54XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGRvdCh2ZWN0b3JBOiBWZWN0b3IzLCB2ZWN0b3JCOiBWZWN0b3IzKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdmVjdG9yQS54ICogdmVjdG9yQi54ICsgdmVjdG9yQS55ICogdmVjdG9yQi55ICsgdmVjdG9yQS56ICogdmVjdG9yQi56O1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBwb29sID0gbmV3IFBvb2xpZnkoMTAsIFZlY3RvcjMpO1xyXG5leHBvcnQgZnVuY3Rpb24gdmVjMyh4OiBudW1iZXIgPSAwLCB5PzogbnVtYmVyLCB6PzogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICBpZiAoeSA9PT0gdW5kZWZpbmVkICYmIHogPT09IHVuZGVmaW5lZCkgeyB6ID0geDsgfVxyXG4gICAgZWxzZSBpZiAoeiA9PT0gdW5kZWZpbmVkKXsgeiA9IDA7IH1cclxuICAgIGlmICh5ID09PSB1bmRlZmluZWQpeyB5ID0geDsgfVxyXG5cclxuICAgIGxldCBvYmogPSA8VmVjdG9yMz4ocG9vbC5hbGxvY2F0ZSgpKTtcclxuICAgIHJldHVybiBvYmouc2V0KHgsIHksIHopO1xyXG59IiwiZXhwb3J0IGNsYXNzIFZlY3RvcjQge1xyXG4gICAgcHJpdmF0ZSBfeCAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeSAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfeiAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfdyAgICAgICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfbGVuZ3RoICAgICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBuZWVkc1VwZGF0ZSAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldCh4LCB5LCB6LCB3KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IFZlY3RvcjQge1xyXG4gICAgICAgIHRoaXMuX3ggPSB4O1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuX3ogPSB6O1xyXG4gICAgICAgIHRoaXMuX3cgPSB3O1xyXG5cclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpOiBWZWN0b3I0IHtcclxuICAgICAgICB0aGlzLl94ICs9IHg7XHJcbiAgICAgICAgdGhpcy5feSArPSB5O1xyXG4gICAgICAgIHRoaXMuX3ogKz0gejtcclxuICAgICAgICB0aGlzLl93ICs9IHc7XHJcblxyXG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkobnVtOiBudW1iZXIpOiBWZWN0b3I0IHtcclxuICAgICAgICB0aGlzLl94ICo9IG51bTtcclxuICAgICAgICB0aGlzLl95ICo9IG51bTtcclxuICAgICAgICB0aGlzLl96ICo9IG51bTtcclxuICAgICAgICB0aGlzLl93ICo9IG51bTtcclxuXHJcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yNCB7XHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aXBseSgxIC8gbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdG9BcnJheSgpOiBBcnJheTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMud107XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feDsgfVxyXG4gICAgcHVibGljIGdldCB5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95OyB9XHJcbiAgICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3o7IH1cclxuICAgIHB1YmxpYyBnZXQgdygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fdzsgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0IHgoeDogbnVtYmVyKSB7IHRoaXMuX3ggPSB4OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxyXG4gICAgcHVibGljIHNldCB5KHk6IG51bWJlcikgeyB0aGlzLl95ID0geTsgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7IH1cclxuICAgIHB1YmxpYyBzZXQgeih6OiBudW1iZXIpIHsgdGhpcy5feiA9IHo7IHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlOyB9XHJcbiAgICBwdWJsaWMgc2V0IHcodzogbnVtYmVyKSB7IHRoaXMuX3cgPSB3OyB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sZW5ndGggPSBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcclxuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gIGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZG90KHZlY3RvckE6IFZlY3RvcjQsIHZlY3RvckI6IFZlY3RvcjQpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCByZXQgPSB2ZWN0b3JBLnggKiB2ZWN0b3JCLnggKyB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnkgKyB2ZWN0b3JBLnogKiB2ZWN0b3JCLnogKyB2ZWN0b3JBLncgKiB2ZWN0b3JCLnc7XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxufSIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcclxuXHJcbmxldCBCYXNpYzogU2hhZGVyU3RydWN0ID0ge1xyXG4gICAgdmVydGV4U2hhZGVyOiBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcblxyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhVGV4Q29vcmRzO1xyXG5cclxuICAgICAgICB1bmlmb3JtIG1hdDQgdVByb2plY3Rpb247XHJcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdmFyeWluZyB2ZWMyIHZUZXhDb29yZHM7XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb24gKiB1UG9zaXRpb24gKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcclxuXHJcbiAgICAgICAgICAgIHZUZXhDb29yZHMgPSBhVGV4Q29vcmRzO1xyXG4gICAgICAgIH1cclxuICAgIGAsXHJcblxyXG4gICAgZnJhZ21lbnRTaGFkZXI6IGBcclxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuICAgICAgICBcclxuICAgICAgICB1bmlmb3JtIHZlYzQgdVVWO1xyXG4gICAgICAgIHVuaWZvcm0gdmVjMiB1UmVwZWF0O1xyXG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVUZXh0dXJlO1xyXG5cclxuICAgICAgICB2YXJ5aW5nIHZlYzIgdlRleENvb3JkcztcclxuXHJcbiAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcclxuICAgICAgICAgICAgdmVjMiBjb29yZHMgPSBtb2QoY2xhbXAodlRleENvb3JkcywgMC4wLCAxLjApICogdVJlcGVhdCwgMS4wKSAqIHVVVi56dyArIHVVVi54eTtcclxuXHJcbiAgICAgICAgICAgIC8vZ2xfRnJhZ0NvbG9yID0gdmVjNCh0ZXh0dXJlMkQodVRleHR1cmUsIGNvb3JkcykucmdiLCAxLjApO1xyXG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVRleHR1cmUsIGNvb3Jkcyk7O1xyXG4gICAgICAgIH1cclxuICAgIGBcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhc2ljOyIsImltcG9ydCB7IFNoYWRlclN0cnVjdCB9IGZyb20gJy4uL3NoYWRlcnMvU2hhZGVyU3RydWN0JztcclxuXHJcbmxldCBDb2xvcjogU2hhZGVyU3RydWN0ID0ge1xyXG4gICAgdmVydGV4U2hhZGVyOiBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcblxyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uO1xyXG4gICAgICAgIHVuaWZvcm0gbWF0NCB1UG9zaXRpb247XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb24gKiB1UG9zaXRpb24gKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICB9XHJcbiAgICBgLFxyXG5cclxuICAgIGZyYWdtZW50U2hhZGVyOiBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcblxyXG4gICAgICAgIHVuaWZvcm0gdmVjNCB1Q29sb3I7XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHVDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICBgXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb2xvcjsiLCJpbXBvcnQgeyBTaGFkZXJTdHJ1Y3QgfSBmcm9tICcuLi9zaGFkZXJzL1NoYWRlclN0cnVjdCc7XHJcbmltcG9ydCB7IGNyZWF0ZVVVSUQgfSBmcm9tICcuLi9VdGlscyc7XHJcblxyXG5pbnRlcmZhY2UgQXR0cmlidXRlcyB7XHJcbiAgICBbaW5kZXg6IHN0cmluZ106IG51bWJlclxyXG59O1xyXG5cclxuaW50ZXJmYWNlIFVuaWZvcm1zIHtcclxuICAgIFtpbmRleDogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb25cclxufVxyXG5cclxuY2xhc3MgU2hhZGVyIHtcclxuICAgIHB1YmxpYyBhdHRyaWJ1dGVzICAgICAgICAgICAgICAgOiBBdHRyaWJ1dGVzO1xyXG4gICAgcHVibGljIHVuaWZvcm1zICAgICAgICAgICAgICAgICA6IFVuaWZvcm1zO1xyXG4gICAgcHVibGljIHByb2dyYW0gICAgICAgICAgICAgICAgICA6IFdlYkdMUHJvZ3JhbTtcclxuICAgIHB1YmxpYyBhdHRyaWJ1dGVzQ291bnQgICAgICAgICAgOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IHV1aWQgICAgICAgICAgICA6IHN0cmluZztcclxuXHJcbiAgICBzdGF0aWMgbWF4QXR0cmliTGVuZ3RoICAgICAgICAgIDogbnVtYmVyO1xyXG4gICAgc3RhdGljIGxhc3RQcm9ncmFtICAgICAgICAgICAgICA6IFNoYWRlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsIHNoYWRlcjogU2hhZGVyU3RydWN0KSB7XHJcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XHJcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLnV1aWQgPSBjcmVhdGVVVUlEKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY29tcGlsZVNoYWRlcnMoc2hhZGVyKTtcclxuICAgICAgICB0aGlzLmdldFNoYWRlckF0dHJpYnV0ZXMoc2hhZGVyKTtcclxuICAgICAgICB0aGlzLmdldFNoYWRlclVuaWZvcm1zKHNoYWRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb21waWxlU2hhZGVycyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcclxuXHJcbiAgICAgICAgbGV0IHZTaGFkZXI6IFdlYkdMU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgICAgIGdsLnNoYWRlclNvdXJjZSh2U2hhZGVyLCBzaGFkZXIudmVydGV4U2hhZGVyKTtcclxuICAgICAgICBnbC5jb21waWxlU2hhZGVyKHZTaGFkZXIpO1xyXG5cclxuICAgICAgICBsZXQgZlNoYWRlcjogV2ViR0xTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuICAgICAgICBnbC5zaGFkZXJTb3VyY2UoZlNoYWRlciwgc2hhZGVyLmZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBnbC5jb21waWxlU2hhZGVyKGZTaGFkZXIpO1xyXG5cclxuICAgICAgICB0aGlzLnByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgdlNoYWRlcik7XHJcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgZlNoYWRlcik7XHJcbiAgICAgICAgZ2wubGlua1Byb2dyYW0odGhpcy5wcm9ncmFtKTtcclxuXHJcbiAgICAgICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodlNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGdsLmdldFNoYWRlckluZm9Mb2codlNoYWRlcikpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb21waWxpbmcgdmVydGV4IHNoYWRlclwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRTaGFkZXJJbmZvTG9nKGZTaGFkZXIpKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgY29tcGlsaW5nIGZyYWdtZW50IHNoYWRlclwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLnByb2dyYW0pKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgbGlua2luZyB0aGUgcHJvZ3JhbVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaGFkZXJBdHRyaWJ1dGVzKHNoYWRlcjogU2hhZGVyU3RydWN0KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNvZGU6IEFycmF5PHN0cmluZz4gPSBzaGFkZXIudmVydGV4U2hhZGVyLnNwbGl0KC9cXG4vZyk7XHJcbiAgICAgICAgbGV0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSB0aGlzLmdsO1xyXG5cclxuICAgICAgICBsZXQgYXR0cmlidXRlOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGxvY2F0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlc0NvdW50ID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGM6IEFycmF5PHN0cmluZz4gPSBjb2RlW2ldLnRyaW0oKS5zcGxpdCgvIC9nKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjWzBdID09ICdhdHRyaWJ1dGUnKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPSBjLnBvcCgpLnJlcGxhY2UoLzsvZywgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgYXR0cmlidXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV0gPSBsb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc0NvdW50ICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNoYWRlci5tYXhBdHRyaWJMZW5ndGggPSBNYXRoLm1heChTaGFkZXIubWF4QXR0cmliTGVuZ3RoLCB0aGlzLmF0dHJpYnV0ZXNDb3VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaGFkZXJVbmlmb3JtcyhzaGFkZXI6IFNoYWRlclN0cnVjdCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjb2RlOiBBcnJheTxzdHJpbmc+ID0gc2hhZGVyLnZlcnRleFNoYWRlci5zcGxpdCgvXFxuL2cpO1xyXG4gICAgICAgIGNvZGUgPSBjb2RlLmNvbmNhdChzaGFkZXIuZnJhZ21lbnRTaGFkZXIuc3BsaXQoL1xcbi9nKSk7XHJcblxyXG4gICAgICAgIGxldCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0ID0gdGhpcy5nbDtcclxuXHJcbiAgICAgICAgbGV0IHVuaWZvcm06IHN0cmluZztcclxuICAgICAgICBsZXQgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgICAgIGxldCB1c2VkVW5pZm9ybXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGM6IEFycmF5PHN0cmluZz4gPSBjb2RlW2ldLnRyaW0oKS5zcGxpdCgvIC9nKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjWzBdID09IFwidW5pZm9ybVwiKSB7XHJcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gYy5wb3AoKS5yZXBsYWNlKC87L2csIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZWRVbmlmb3Jtcy5pbmRleE9mKHVuaWZvcm0pICE9IC0xKSB7IGNvbnRpbnVlOyB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1bmlmb3JtKTtcclxuXHJcbiAgICAgICAgICAgICAgICB1c2VkVW5pZm9ybXMucHVzaCh1bmlmb3JtKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm1zW3VuaWZvcm1dID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZVByb2dyYW0oKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKFNoYWRlci5sYXN0UHJvZ3JhbSA9PSB0aGlzKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IHRoaXMuZ2w7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcclxuICAgICAgICBTaGFkZXIubGFzdFByb2dyYW0gPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgYXR0cmliTGVuZ3RoOiBudW1iZXIgPSB0aGlzLmF0dHJpYnV0ZXNDb3VudDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gU2hhZGVyLm1heEF0dHJpYkxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChpIDwgYXR0cmliTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuU2hhZGVyLm1heEF0dHJpYkxlbmd0aCA9IDA7XHJcblNoYWRlci5sYXN0UHJvZ3JhbSA9IG51bGw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFkZXI7IiwiZGVjbGFyZSB2YXIgU3RhdHM6IGFueTtcclxuXHJcbmltcG9ydCB7IFJlbmRlcmVyLCBJbnB1dCwgU2NlbmUsIENhbWVyYSB9IGZyb20gJy4uLy4uL2VuZ2luZSc7XHJcbmltcG9ydCBUZXh0dXJlc01hbmFnZXIgZnJvbSAnbWFuYWdlcnMvVGV4dHVyZXNNYW5hZ2VyJztcclxuaW1wb3J0IE1vZGVsc01hbmFnZXIgZnJvbSAnbWFuYWdlcnMvTW9kZWxzTWFuYWdlcic7XHJcbmltcG9ydCBTZWN0b3JzTWFuYWdlciBmcm9tICdtYW5hZ2Vycy9TZWN0b3JzTWFuYWdlcic7XHJcbmltcG9ydCBEZW1vU2NlbmUgZnJvbSAnc2NlbmVzL0RlbW9TY2VuZSc7XHJcblxyXG5jb25zdCBDQU5WQVNfV0lEVEggICAgICAgICAgID0gODU0OyBcclxuY29uc3QgQ0FOVkFTX0hFSUdIVCAgICAgICAgICA9IDQ4MDtcclxuXHJcbmNvbnN0IENBTUVSQV9GT1YgICAgICAgICAgICAgPSAxMDUgKiBNYXRoLlBJIC8gMTgwO1xyXG5jb25zdCBDQU1FUkFfUkFUSU8gICAgICAgICAgID0gQ0FOVkFTX1dJRFRIIC8gQ0FOVkFTX0hFSUdIVDtcclxuY29uc3QgQ0FNRVJBX1pORUFSICAgICAgICAgICA9IDAuMTtcclxuY29uc3QgQ0FNRVJBX1pGQVIgICAgICAgICAgICA9IDEwMDA7XHJcbmNvbnN0IENBTUVSQV9PUlRIT19XSURUSCAgICAgPSAoQ0FOVkFTX1dJRFRIIC8gNCkgPDwgMDtcclxuY29uc3QgQ0FNRVJBX09SVEhPX0hFSUdIVCAgICA9IChDQU5WQVNfSEVJR0hUIC8gNCkgPDwgMDtcclxuXHJcbmNsYXNzIEFwcCB7XHJcbiAgICBwcml2YXRlIF9yZW5kZXJlciAgICAgICAgICAgICAgICAgICA6IFJlbmRlcmVyO1xyXG4gICAgcHJpdmF0ZSBfc2NlbmUgICAgICAgICAgICAgICAgICAgICAgOiBTY2VuZTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfc3RhdHMgPSBuZXcgU3RhdHMoKTtcclxuICAgIFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGNhbWVyYSAgICAgICAgICAgICAgOiBDYW1lcmE7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2FtZXJhT3J0aG8gICAgICAgICA6IENhbWVyYTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IG5ldyBSZW5kZXJlcihDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGl2R2FtZVwiKSk7XHJcblxyXG4gICAgICAgIElucHV0LmluaXQodGhpcy5fcmVuZGVyZXIuY2FudmFzKTtcclxuICAgICAgICBUZXh0dXJlc01hbmFnZXIuaW5pdCh0aGlzLl9yZW5kZXJlcik7XHJcbiAgICAgICAgTW9kZWxzTWFuYWdlci5pbml0KHRoaXMuX3JlbmRlcmVyKTtcclxuICAgICAgICBTZWN0b3JzTWFuYWdlci5pbml0KHRoaXMuX3JlbmRlcmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBDYW1lcmEuY3JlYXRlUGVyc3BlY3RpdmUoQ0FNRVJBX0ZPViwgQ0FNRVJBX1JBVElPLCBDQU1FUkFfWk5FQVIsIENBTUVSQV9aRkFSKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmFPcnRobyA9IENhbWVyYS5jcmVhdGVPcnRob2dyYXBoaWMoQ0FNRVJBX09SVEhPX1dJRFRILCBDQU1FUkFfT1JUSE9fSEVJR0hULCBDQU1FUkFfWk5FQVIsIENBTUVSQV9aRkFSKTtcclxuICAgICAgICB0aGlzLmNhbWVyYU9ydGhvLnNldFBvc2l0aW9uKDAsIDAsIDUpO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhT3J0aG8uc2V0VGFyZ2V0KDAsIDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLl93YWl0TG9hZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3dhaXRMb2FkKCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChUZXh0dXJlc01hbmFnZXIuaXNSZWFkeSgpICYmIE1vZGVsc01hbmFnZXIuaXNSZWFkeSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjZW5lID0gbmV3IERlbW9TY2VuZSh0aGlzLCB0aGlzLl9yZW5kZXJlcik7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjZW5lLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXRzLnNob3dQYW5lbCgxKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLl9zdGF0cy5kb20pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fbG9vcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7IHRoaXMuX3dhaXRMb2FkKCk7IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb29wKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3N0YXRzLmJlZ2luKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fc2NlbmUudXBkYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5fc2NlbmUucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3N0YXRzLmVuZCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4geyB0aGlzLl9sb29wKCk7IH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImgxXCIpWzBdKTtcclxuICAgIHJldHVybiBuZXcgQXBwKCk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcHA7IiwiaW1wb3J0IHsgQ29tcG9uZW50LCB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vZW5naW5lJztcclxuXHJcbmNsYXNzIENoYXJhQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIHByaXZhdGUgX21vdmVkICAgICAgICAgIDogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGNvbXBvbmVudE5hbWUgPSBcIkNoYXJhQ29tcG9uZW50XCI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoQ2hhcmFDb21wb25lbnQuY29tcG9uZW50TmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1vdmVUbyh4VG86IG51bWJlciwgelRvOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZGlyID0gdmVjMyh4VG8sIDAsIHpUbyksXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRoaXMuX2luc3RhbmNlLnNjZW5lLnRlc3RDb2xsaXNpb24odGhpcy5faW5zdGFuY2UsIGRpcik7XHJcblxyXG4gICAgICAgIGlmIChjb2xsaXNpb24ueCAhPSAwIHx8IGNvbGxpc2lvbi56ICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2UudHJhbnNsYXRlKGNvbGxpc2lvbi54LCAwLCBjb2xsaXNpb24ueiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX21vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRpci5kZWxldGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXdha2UoKTogdm9pZCB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9tb3ZlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbW92ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vdmVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDaGFyYUNvbXBvbmVudDsiLCJpbXBvcnQgeyBDb21wb25lbnQsIEJhc2ljTWF0ZXJpYWwsIEluc3RhbmNlLCBnZXQyREFuZ2xlLCBkZWdUb1JhZCB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG5pbXBvcnQgeyBDSEFSQV9VVlN9IGZyb20gJ21hbmFnZXJzL1VWTWFuYWdlcic7XHJcbmltcG9ydCBEZW1vU2NlbmUgZnJvbSAnc2NlbmVzL0RlbW9TY2VuZSc7XHJcbmltcG9ydCBDaGFyYUNvbXBvbmVudCBmcm9tICdjb21wb25lbnRzL0NoYXJhQ29tcG9uZW50JztcclxuXHJcbmNvbnN0IGFuZzQ1ID0gZGVnVG9SYWQoNDUpLFxyXG4gICAgICBhbmcxMzUgPSBkZWdUb1JhZCgxMzUpLFxyXG4gICAgICBhbmcyMjUgPSBkZWdUb1JhZCgyMjUpLFxyXG4gICAgICBhbmczMTUgPSBkZWdUb1JhZCgzMTUpO1xyXG5cclxuY2xhc3MgQ2hhcmFSZW5kZXJlckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICBwcml2YXRlIF91dnMgICAgICAgICAgICAgICAgICAgICAgOiBDSEFSQV9VVlM7XHJcbiAgICBwcml2YXRlIF9tYXRlcmlhbCAgICAgICAgICAgICAgICAgOiBCYXNpY01hdGVyaWFsO1xyXG4gICAgcHJpdmF0ZSBfc2NlbmUgICAgICAgICAgICAgICAgICAgIDogRGVtb1NjZW5lO1xyXG4gICAgcHJpdmF0ZSBfcGxheWVyICAgICAgICAgICAgICAgICAgIDogSW5zdGFuY2U7XHJcbiAgICBwcml2YXRlIF9jaGFyYUNvbXBvbmVudCAgICAgICAgICAgOiBDaGFyYUNvbXBvbmVudDtcclxuICAgIHByaXZhdGUgX3BsYXllckNoYXJhQ29tcG9uZW50ICAgICA6IENoYXJhQ29tcG9uZW50O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgY29tcG9uZW50TmFtZSA9IFwiQ2hhcmFSZW5kZXJlckNvbXBvbmVudFwiO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHV2OiBDSEFSQV9VVlMpIHtcclxuICAgICAgICBzdXBlcihDaGFyYVJlbmRlcmVyQ29tcG9uZW50LmNvbXBvbmVudE5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLl91dnMgPSB1djtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXdha2UoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSA8QmFzaWNNYXRlcmlhbD50aGlzLl9pbnN0YW5jZS5tYXRlcmlhbDtcclxuXHJcbiAgICAgICAgbGV0IHV2ID0gdGhpcy5fbWF0ZXJpYWwudGV4dHVyZS5nZXRVVlModGhpcy5fdXZzLkZST05UKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRVdih1di54LCB1di55LCB1di56LCB1di53KTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2NlbmUgPSA8RGVtb1NjZW5lPnRoaXMuX2luc3RhbmNlLnNjZW5lO1xyXG4gICAgICAgIHRoaXMuX3BsYXllciA9IHRoaXMuX3NjZW5lLnBsYXllcjtcclxuXHJcbiAgICAgICAgdGhpcy5fY2hhcmFDb21wb25lbnQgPSB0aGlzLl9pbnN0YW5jZS5nZXRDb21wb25lbnQ8Q2hhcmFDb21wb25lbnQ+KENoYXJhQ29tcG9uZW50LmNvbXBvbmVudE5hbWUpO1xyXG4gICAgICAgIGlmICghdGhpcy5fY2hhcmFDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhcmFSZW5kZXJlckNvbXBvbmVudCByZXF1aXJlcyBDaGFyYUNvbXBvbmVudFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3BsYXllckNoYXJhQ29tcG9uZW50ID0gdGhpcy5fcGxheWVyLmdldENvbXBvbmVudDxDaGFyYUNvbXBvbmVudD4oQ2hhcmFDb21wb25lbnQuY29tcG9uZW50TmFtZSk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9pbnN0YW5jZS5kZXN0cm95KCk7XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fcGxheWVyQ2hhcmFDb21wb25lbnQubW92ZWQpIHtcclxuICAgICAgICAgICAgbGV0IGFuZyA9IGdldDJEQW5nbGUodGhpcy5faW5zdGFuY2UucG9zaXRpb24sIHRoaXMuX3BsYXllci5wb3NpdGlvbiksXHJcbiAgICAgICAgICAgICAgICB1djtcclxuXHJcbiAgICAgICAgICAgIGlmIChhbmcgPj0gYW5nNDUgJiYgYW5nIDwgYW5nMTM1KSB7XHJcbiAgICAgICAgICAgICAgICB1diA9IHRoaXMuX21hdGVyaWFsLnRleHR1cmUuZ2V0VVZTKHRoaXMuX3V2cy5MRUZUKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmcgPj0gYW5nMTM1ICYmIGFuZyA8IGFuZzIyNSkge1xyXG4gICAgICAgICAgICAgICAgdXYgPSB0aGlzLl9tYXRlcmlhbC50ZXh0dXJlLmdldFVWUyh0aGlzLl91dnMuQkFDSyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nID49IGFuZzIyNSAmJiBhbmcgPCBhbmczMTUpIHtcclxuICAgICAgICAgICAgICAgIHV2ID0gdGhpcy5fbWF0ZXJpYWwudGV4dHVyZS5nZXRVVlModGhpcy5fdXZzLlJJR0hUKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHV2ID0gdGhpcy5fbWF0ZXJpYWwudGV4dHVyZS5nZXRVVlModGhpcy5fdXZzLkZST05UKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0VXYodXYueCwgdXYueSwgdXYueiwgdXYudyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2hhcmFSZW5kZXJlckNvbXBvbmVudDsiLCJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBDYW1lcmEsIGRlZ1RvUmFkLCBnZXQyRFZlY3RvckRpciwgUElfMiB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG5pbXBvcnQgQ2hhcmFDb21wb25lbnQgZnJvbSAnY29tcG9uZW50cy9DaGFyYUNvbXBvbmVudCc7XHJcblxyXG5jb25zdCBMSU1JVF9ST1RBVElPTiA9IGRlZ1RvUmFkKDcwKTtcclxuXHJcbmNvbnN0IENPTlRST0xTID0ge1xyXG4gICAgVVA6IDAsXHJcbiAgICBMRUZUOiAxLFxyXG4gICAgUklHSFQ6IDIsXHJcbiAgICBET1dOOiAzXHJcbn07XHJcblxyXG5jbGFzcyBQbGF5ZXJDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgcHJpdmF0ZSBfa2V5cyAgICAgICAgICAgICAgIDogQXJyYXk8bnVtYmVyPjtcclxuICAgIHByaXZhdGUgX2NhbGxiYWNrSWRzICAgICAgICA6IEFycmF5PHN0cmluZz5cclxuICAgIHByaXZhdGUgX2NhbWVyYSAgICAgICAgICAgICA6IENhbWVyYTtcclxuICAgIHByaXZhdGUgX2hlaWdodCAgICAgICAgICAgICA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX2NoYXJhQ29tcG9uZW50ICAgICA6IENoYXJhQ29tcG9uZW50O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgY29tcG9uZW50TmFtZSA9IFwiUGxheWVyQ29tcG9uZW50XCI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoUGxheWVyQ29tcG9uZW50LmNvbXBvbmVudE5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLl9rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tJZHMgPSBbXTtcclxuICAgICAgICB0aGlzLl9jYW1lcmEgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2hlaWdodCA9IDEuMztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRLZXlJZChrZXlDb2RlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDY1OiByZXR1cm4gQ09OVFJPTFMuTEVGVDtcclxuICAgICAgICAgICAgY2FzZSA4MzogcmV0dXJuIENPTlRST0xTLkRPV047XHJcbiAgICAgICAgICAgIGNhc2UgNjg6IHJldHVybiBDT05UUk9MUy5SSUdIVDtcclxuICAgICAgICAgICAgY2FzZSA4NzogcmV0dXJuIENPTlRST0xTLlVQO1xyXG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGFuZGxlS2V5Ym9hcmQoa2V5Q29kZTogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGtleUlkID0gdGhpcy5fZ2V0S2V5SWQoa2V5Q29kZSk7XHJcblxyXG4gICAgICAgIGlmIChrZXlJZCA9PT0gbnVsbCl7IHJldHVybjsgfVxyXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PSAxICYmIHRoaXMuX2tleXNba2V5SWRdID09IDIpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMuX2tleXNba2V5SWRdID0gcG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGFuZGxlTW91c2VNb3ZlKGR4OiBudW1iZXIsIGR5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcm90ID0gdGhpcy5faW5zdGFuY2Uucm90YXRpb24sXHJcbiAgICAgICAgICAgIGFuZ195ID0gcm90LnkgLSBkZWdUb1JhZChkeCksXHJcbiAgICAgICAgICAgIGFuZ194ID0gcm90LnggLSBkZWdUb1JhZChkeSk7XHJcblxyXG4gICAgICAgIGlmIChhbmdfeCA+IExJTUlUX1JPVEFUSU9OKSB7IGFuZ194ID0gTElNSVRfUk9UQVRJT047IH1lbHNlIFxyXG4gICAgICAgIGlmIChhbmdfeCA8IC1MSU1JVF9ST1RBVElPTikgeyBhbmdfeCA9IC1MSU1JVF9ST1RBVElPTjsgfVxyXG5cclxuICAgICAgICB0aGlzLl9pbnN0YW5jZS5yb3RhdGUoYW5nX3gsIGFuZ195LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVNb3ZlbWVudCgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgeCA9IDAsXHJcbiAgICAgICAgICAgIHkgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLl9rZXlzW0NPTlRST0xTLlVQXSkgeyB5ID0gLTE7IH1lbHNlXHJcbiAgICAgICAgaWYgKHRoaXMuX2tleXNbQ09OVFJPTFMuRE9XTl0pIHsgeSA9IDE7IH1cclxuICAgICAgICBpZiAodGhpcy5fa2V5c1tDT05UUk9MUy5SSUdIVF0pIHsgeCA9IDE7IH1lbHNlXHJcbiAgICAgICAgaWYgKHRoaXMuX2tleXNbQ09OVFJPTFMuTEVGVF0pIHsgeCA9IC0xOyB9XHJcblxyXG4gICAgICAgIGlmICh4ICE9IDAgfHwgeSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxldCByb3QgPSB0aGlzLl9pbnN0YW5jZS5yb3RhdGlvbixcclxuICAgICAgICAgICAgICAgIHNwZCA9IDAuMDUsXHJcbiAgICAgICAgICAgICAgICBhbmdWYXIgPSBnZXQyRFZlY3RvckRpcih4LCB5KSAtIFBJXzIsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgeFRvID0gTWF0aC5jb3Mocm90LnkgKyBhbmdWYXIpICogc3BkLFxyXG4gICAgICAgICAgICAgICAgelRvID0gLU1hdGguc2luKHJvdC55ICsgYW5nVmFyKSAqIHNwZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2NoYXJhQ29tcG9uZW50Lm1vdmVUbyh4VG8sIHpUbyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF91cGRhdGVDYW1lcmEoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jYW1lcmEpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLl9pbnN0YW5jZS5wb3NpdGlvbixcclxuICAgICAgICAgICAgcm90ID0gdGhpcy5faW5zdGFuY2Uucm90YXRpb247XHJcblxyXG4gICAgICAgIHRoaXMuX2NhbWVyYS5zZXRQb3NpdGlvbihwb3MueCwgcG9zLnkgKyB0aGlzLl9oZWlnaHQsIHBvcy56KTtcclxuXHJcbiAgICAgICAgbGV0IGMgPSBNYXRoLmNvcyhyb3QueCksXHJcbiAgICAgICAgICAgIHhUbyA9IHBvcy54ICsgTWF0aC5jb3Mocm90LnkpICogYyxcclxuICAgICAgICAgICAgeVRvID0gcG9zLnkgKyB0aGlzLl9oZWlnaHQgKyBNYXRoLnNpbihyb3QueCksXHJcbiAgICAgICAgICAgIHpUbyA9IHBvcy56IC0gTWF0aC5zaW4ocm90LnkpICogYztcclxuXHJcbiAgICAgICAgdGhpcy5fY2FtZXJhLnNldFRhcmdldCh4VG8sIHlUbywgelRvKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0Q2FtZXJhKGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fY2FtZXJhID0gY2FtZXJhO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhd2FrZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jYWxsYmFja0lkcy5wdXNoKElucHV0Lm9uS2V5ZG93bigoa2V5Q29kZTogbnVtYmVyKSA9PiB7IHRoaXMuX2hhbmRsZUtleWJvYXJkKGtleUNvZGUsIDEpOyB9KSk7XHJcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tJZHMucHVzaChJbnB1dC5vbktleXVwKChrZXlDb2RlOiBudW1iZXIpID0+IHsgdGhpcy5faGFuZGxlS2V5Ym9hcmQoa2V5Q29kZSwgMCk7IH0pKTtcclxuICAgICAgICB0aGlzLl9jYWxsYmFja0lkcy5wdXNoKElucHV0Lm9uTW91c2VNb3ZlKChkeDogbnVtYmVyLCBkeTogbnVtYmVyKSA9PiB7IHRoaXMuX2hhbmRsZU1vdXNlTW92ZShkeCwgZHkpOyB9KSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NoYXJhQ29tcG9uZW50ID0gdGhpcy5faW5zdGFuY2UuZ2V0Q29tcG9uZW50PENoYXJhQ29tcG9uZW50PihDaGFyYUNvbXBvbmVudC5jb21wb25lbnROYW1lKTtcclxuICAgICAgICBpZiAoIXRoaXMuX2NoYXJhQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXllckNvbXBvbmVudCByZXF1aXJlcyBDaGFyYUNvbXBvbmVudFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wLGlkO2lkPXRoaXMuX2NhbGxiYWNrSWRzW2ldO2krKykge1xyXG4gICAgICAgICAgICBJbnB1dC5kZWxldGVDYWxsYmFjayhpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTW92ZW1lbnQoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVDYW1lcmEoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1vdmVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGFyYUNvbXBvbmVudC5tb3ZlZDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheWVyQ29tcG9uZW50OyIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG5pbXBvcnQgU2VjdG9yIGZyb20gJ3NjZW5lcy9TZWN0b3InO1xyXG5pbXBvcnQgRGVtb1NjZW5lIGZyb20gJ3NjZW5lcy9EZW1vU2NlbmUnO1xyXG5cclxuY2xhc3MgU2VjdG9yU29saWRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgcHJpdmF0ZSBfc2VjdG9ycyAgICAgICAgICAgIDogQXJyYXk8U2VjdG9yPjtcclxuICAgIHByaXZhdGUgX3NjZW5lICAgICAgICAgICAgICA6IERlbW9TY2VuZTtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGNvbXBvbmVudE5hbWUgPSBcIlNlY3RvclNvbGlkQ29tcG9uZW50XCI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoU2VjdG9yU29saWRDb21wb25lbnQuY29tcG9uZW50TmFtZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NlY3RvcnMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVDb2xsaXNpb25zKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IGk9MCxzZWN0b3I7c2VjdG9yPXRoaXMuX3NlY3RvcnNbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIHNlY3Rvci5jbGVhckNvbGxpc2lvbih0aGlzLl9pbnN0YW5jZS5jb2xsaXNpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNlY3RvcnMgPSB0aGlzLl9zY2VuZS5nZXRJbnRlcnNlY3RpbmdTZWN0b3JzKHRoaXMuX2luc3RhbmNlKTtcclxuICAgICAgICB0aGlzLl9zZWN0b3JzID0gc2VjdG9ycztcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wLHNlY3RvcjtzZWN0b3I9c2VjdG9yc1tpXTtpKyspIHtcclxuICAgICAgICAgICAgc2VjdG9yLnJlZ2lzdGVyQ29sbGlzaW9uKHRoaXMuX2luc3RhbmNlLmNvbGxpc2lvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhd2FrZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zY2VuZSA9IDxEZW1vU2NlbmU+IHRoaXMuX2luc3RhbmNlLnNjZW5lO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVDb2xsaXNpb25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZWN0b3JTb2xpZENvbXBvbmVudDsiLCJpbXBvcnQgeyBJbnN0YW5jZSwgUmVuZGVyZXIsIENhbWVyYSwgV2FsbEdlb21ldHJ5LCBCYXNpY01hdGVyaWFsLCBWZWN0b3IzLCB2ZWMzLCBCb3hDb2xsaXNpb24sIHBpeGVsQ29vcmRzVG9Xb3JsZCBhcyBwY3R3LCByZW1lbWJlclBvb2xBbGxvYyBhcyBycGEsIGZyZWVQb29sQWxsb2MgfSBmcm9tICcuLi8uLi8uLi9lbmdpbmUnO1xyXG5cclxuaW1wb3J0IFBsYXllckNvbXBvbmVudCBmcm9tICdjb21wb25lbnRzL1BsYXllckNvbXBvbmVudCc7XHJcbmltcG9ydCBDaGFyYUNvbXBvbmVudCBmcm9tICdjb21wb25lbnRzL0NoYXJhQ29tcG9uZW50JztcclxuaW1wb3J0IENoYXJhUmVuZGVyZXJDb21wb25lbnQgZnJvbSAnY29tcG9uZW50cy9DaGFyYVJlbmRlcmVyQ29tcG9uZW50JztcclxuaW1wb3J0IFNlY3RvclNvbGlkQ29tcG9uZW50IGZyb20gJ2NvbXBvbmVudHMvU2VjdG9yU29saWRDb21wb25lbnQnO1xyXG5pbXBvcnQgVGV4dHVyZU1hbmFnZXIgZnJvbSAnbWFuYWdlcnMvVGV4dHVyZXNNYW5hZ2VyJztcclxuaW1wb3J0IFVWTWFuYWdlciBmcm9tICdtYW5hZ2Vycy9VVk1hbmFnZXInO1xyXG5cclxuZXhwb3J0IHR5cGUgRW50aXRpZXNOYW1lcyA9ICdBTExFWV9HVVknO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgRW50aXR5RmFjdG9yeSB7XHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVBsYXllcihyZW5kZXJlcjogUmVuZGVyZXIsIGNhbWVyYTogQ2FtZXJhKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIGxldCByZXQ6IEluc3RhbmNlID0gSW5zdGFuY2UuYWxsb2NhdGUocmVuZGVyZXIpLFxyXG4gICAgICAgIHBsYXllckNvbXBvbmVudCA9IG5ldyBQbGF5ZXJDb21wb25lbnQoKTtcclxuXHJcbiAgICAgICAgcGxheWVyQ29tcG9uZW50LnNldENhbWVyYShjYW1lcmEpO1xyXG5cclxuICAgICAgICByZXQuYWRkQ29tcG9uZW50KG5ldyBDaGFyYUNvbXBvbmVudCgpKTtcclxuICAgICAgICByZXQuYWRkQ29tcG9uZW50KHBsYXllckNvbXBvbmVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVBbGxleUd1eShyZW5kZXJlcjogUmVuZGVyZXIpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IHNpemUgPSBycGEocGN0dyh2ZWMzKDEyLCAyNikpKSxcclxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgV2FsbEdlb21ldHJ5KHJlbmRlcmVyLCBzaXplLngsIHNpemUueSksXHJcbiAgICAgICAgICAgIHRleHR1cmUgPSBUZXh0dXJlTWFuYWdlci5nZXRUZXh0dXJlKFwiTlBDU1wiKSxcclxuICAgICAgICAgICAgbWF0ZXJpYWwgPSBuZXcgQmFzaWNNYXRlcmlhbChyZW5kZXJlciwgdGV4dHVyZSksXHJcbiAgICAgICAgICAgIHV2ID0gVVZNYW5hZ2VyLk5QQ1MuQUxMRVlfUEVSU09OLFxyXG4gICAgICAgICAgICByZXQgPSBJbnN0YW5jZS5hbGxvY2F0ZShyZW5kZXJlciwgZ2VvbWV0cnksIG1hdGVyaWFsKSxcclxuICAgICAgICAgICAgY29sbGlzaW9uU2l6ZSA9IHJwYShwY3R3KHZlYzMoOCwgMjMsIDgpKSksXHJcbiAgICAgICAgICAgIGJjID0gKG5ldyBCb3hDb2xsaXNpb24ocmV0LnBvc2l0aW9uLCBjb2xsaXNpb25TaXplKSkuY2VudGVySW5BeGlzKHRydWUsIGZhbHNlLCB0cnVlKTtcclxuXHJcbiAgICAgICAgZ2VvbWV0cnkub2Zmc2V0LnNldCgwLCBzaXplLnkgLyAyLCAwKTtcclxuXHJcbiAgICAgICAgYmMuaXNEeW5hbWljID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICByZXQuYWRkQ29tcG9uZW50KG5ldyBDaGFyYUNvbXBvbmVudCgpKTtcclxuICAgICAgICByZXQuYWRkQ29tcG9uZW50KG5ldyBDaGFyYVJlbmRlcmVyQ29tcG9uZW50KHV2KSk7XHJcbiAgICAgICAgcmV0LmFkZENvbXBvbmVudChuZXcgU2VjdG9yU29saWRDb21wb25lbnQoKSk7XHJcbiAgICAgICAgcmV0LnNldENvbGxpc2lvbihiYylcclxuICAgICAgICByZXQuaXNCaWxsYm9hcmQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIG1hdGVyaWFsLnNldE9wYXF1ZShmYWxzZSk7XHJcblxyXG4gICAgICAgIGZyZWVQb29sQWxsb2MoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUluc3RhbmNlKHJlbmRlcmVyOiBSZW5kZXJlciwgbmFtZTogRW50aXRpZXNOYW1lcywgcG9zaXRpb246IFZlY3RvcjMpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IGluczogSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICAgICAgICBjYXNlICdBTExFWV9HVVknOlxyXG4gICAgICAgICAgICAgICAgaW5zID0gdGhpcy5jcmVhdGVBbGxleUd1eShyZW5kZXJlcik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucy5wb3NpdGlvbi5hZGQocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueik7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVudGl0eUZhY3Rvcnk7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIFRleHR1cmUsIE1hdGVyaWFsLCBCYXNpY01hdGVyaWFsLCBXYWxsR2VvbWV0cnksIFBsYW5lR2VvbWV0cnksIEluc3RhbmNlLCBUZXh0LCBWZWN0b3IzLCBWZWN0b3I0LCBQSV8yLCBQSTNfMiB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG5pbXBvcnQgVGV4dHVyZXNNYW5hZ2VyIGZyb20gJ21hbmFnZXJzL1RleHR1cmVzTWFuYWdlcic7XHJcbmltcG9ydCB7IFRleHR1cmVzTmFtZXMgfSBmcm9tICdtYW5hZ2Vycy9UZXh0dXJlc01hbmFnZXInO1xyXG5pbXBvcnQgTW9kZWxzTWFuYWdlciBmcm9tICdtYW5hZ2Vycy9Nb2RlbHNNYW5hZ2VyJztcclxuaW1wb3J0IHsgTW9kZWxOYW1lcyB9IGZyb20gJ21hbmFnZXJzL01vZGVsc01hbmFnZXInO1xyXG5cclxuZXhwb3J0IHR5cGUgUHJvcHNOYW1lcyA9ICdNb2RlbDNEJyB8ICdUZXh0JyB8ICdGbG9vcicgfCAnV2FsbCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb3BPcHRpb25zIHtcclxuICAgIG1vZGVsPzogc3RyaW5nO1xyXG4gICAgXHJcbiAgICB0ZXh0dXJlPzogVGV4dHVyZXNOYW1lcztcclxuICAgIG1hdGVyaWFsPzogTWF0ZXJpYWw7XHJcbiAgICB1dj86IFZlY3RvcjQ7XHJcbiAgICByZXBlYXQ/OiBBcnJheTxudW1iZXI+O1xyXG4gICAgXHJcbiAgICBwb3NpdGlvbj86IFZlY3RvcjM7XHJcbiAgICByb3RhdGlvbj86IFZlY3RvcjM7XHJcbiAgICBzaXplPzogVmVjdG9yMztcclxuICAgIFxyXG4gICAgY3VsbGluZz86IGJvb2xlYW47XHJcbiAgICBvcGFxdWU/OiBib29sZWFuO1xyXG4gICAgYmlsbGJvYXJkPzogYm9vbGVhbjtcclxuXHJcbiAgICB0ZXh0Pzogc3RyaW5nO1xyXG4gICAgZm9udD86IHN0cmluZztcclxuICAgIGZvbnRTaXplPzogbnVtYmVyO1xyXG59XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBQcm9wc0ZhY3Rvcnkge1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZU1hdGVyaWFsKHJlbmRlcmVyOiBSZW5kZXJlciwgdGV4dHVyZTogVGV4dHVyZSwgdXY/OiBWZWN0b3I0LCByZXBlYXQ/OiBBcnJheTxudW1iZXI+KTogTWF0ZXJpYWwge1xyXG4gICAgICAgIGxldCByZXQgPSBuZXcgQmFzaWNNYXRlcmlhbChyZW5kZXJlciwgdGV4dHVyZSk7XHJcblxyXG4gICAgICAgIGlmIChyZXBlYXQpIHJldC5zZXRSZXBlYXQocmVwZWF0WzBdLCByZXBlYXRbMV0pO1xyXG4gICAgICAgIGlmICh1dikgcmV0LnNldFV2KHV2LngsIHV2LnksIHV2LnosIHV2LncpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfcHJvY2Vzc09iamVjdFByb3BlcnRpZXMob2JqZWN0OiBJbnN0YW5jZSwgb3B0aW9uczogUHJvcE9wdGlvbnMpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMucG9zaXRpb24pIHsgb2JqZWN0LnRyYW5zbGF0ZShvcHRpb25zLnBvc2l0aW9uLngsIG9wdGlvbnMucG9zaXRpb24ueSwgb3B0aW9ucy5wb3NpdGlvbi56LCB0cnVlKTsgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLnJvdGF0aW9uKSB7IG9iamVjdC5yb3RhdGUob3B0aW9ucy5yb3RhdGlvbi54LCBvcHRpb25zLnJvdGF0aW9uLnksIG9wdGlvbnMucm90YXRpb24ueik7IH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuY3VsbGluZyAhPT0gdW5kZWZpbmVkKSB7IG9iamVjdC5tYXRlcmlhbC5zZXRDdWxsaW5nKG9wdGlvbnMuY3VsbGluZyk7IH1cclxuICAgICAgICBpZiAob3B0aW9ucy5vcGFxdWUgIT09IHVuZGVmaW5lZCkgeyBvYmplY3QubWF0ZXJpYWwuc2V0T3BhcXVlKG9wdGlvbnMub3BhcXVlKTsgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5iaWxsYm9hcmQpIHsgb2JqZWN0LmlzQmlsbGJvYXJkID0gb3B0aW9ucy5iaWxsYm9hcmQ7IH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY2VudGVyT2JqZWN0SW5HcmlkKG9iamVjdDogSW5zdGFuY2UsIG9wdGlvbnM6IFByb3BPcHRpb25zKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIC8vIENlbnRlciBPYmplY3QgaW4gZ3JpZFxyXG4gICAgICAgIGxldCBiYm94ID0gb2JqZWN0Lmdlb21ldHJ5LmJvdW5kaW5nQm94O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB4ID0gLWJib3hbMF0sXHJcbiAgICAgICAgICAgIHkgPSAtYmJveFsxXSxcclxuICAgICAgICAgICAgeiA9IC1iYm94WzJdO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5yb3RhdGlvbiAmJiAob3B0aW9ucy5yb3RhdGlvbi55ID09IFBJXzIgfHwgb3B0aW9ucy5yb3RhdGlvbi55ID09IFBJM18yKSkge1xyXG4gICAgICAgICAgICB4ID0gLWJib3hbMl07XHJcbiAgICAgICAgICAgIHogPSAtYmJveFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9iamVjdC50cmFuc2xhdGUoeCwgeSwgeik7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUzRE1vZGVsKHJlbmRlcmVyOiBSZW5kZXJlciwgb3B0aW9uczogUHJvcE9wdGlvbnMpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsOiBNYXRlcmlhbCA9IG51bGwsXHJcbiAgICAgICAgICAgIG1vZGVsID0gTW9kZWxzTWFuYWdlci5nZXRNb2RlbCg8TW9kZWxOYW1lcz5vcHRpb25zLm1vZGVsKSxcclxuICAgICAgICAgICAgb2JqZWN0OiBJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKG1vZGVsLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgIG1hdGVyaWFsID0gbW9kZWwubWF0ZXJpYWw7XHJcbiAgICAgICAgfWVsc2UgaWYgKG9wdGlvbnMudGV4dHVyZSkge1xyXG4gICAgICAgICAgICBtYXRlcmlhbCA9IHRoaXMuX2NyZWF0ZU1hdGVyaWFsKHJlbmRlcmVyLCBUZXh0dXJlc01hbmFnZXIuZ2V0VGV4dHVyZSg8VGV4dHVyZXNOYW1lcz5vcHRpb25zLnRleHR1cmUpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgbWF0ZXJpYWwgPSBvcHRpb25zLm1hdGVyaWFsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb2JqZWN0ID0gSW5zdGFuY2UuYWxsb2NhdGUocmVuZGVyZXIsIG1vZGVsLmdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NlbnRlck9iamVjdEluR3JpZChvYmplY3QsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc09iamVjdFByb3BlcnRpZXMob2JqZWN0LCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVRleHQocmVuZGVyZXI6IFJlbmRlcmVyLCBvcHRpb25zOiBQcm9wT3B0aW9ucyk6IFRleHQge1xyXG4gICAgICAgIHJldHVybiBuZXcgVGV4dChyZW5kZXJlciwgb3B0aW9ucy50ZXh0LCBvcHRpb25zLmZvbnQsIHtwb3NpdGlvbjogb3B0aW9ucy5wb3NpdGlvbiwgcm90YXRpb246IG9wdGlvbnMucm90YXRpb24sIHNpemU6IG9wdGlvbnMuZm9udFNpemV9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUZsb29yKHJlbmRlcmVyOiBSZW5kZXJlciwgb3B0aW9uczogUHJvcE9wdGlvbnMpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFBsYW5lR2VvbWV0cnkocmVuZGVyZXIsIG9wdGlvbnMuc2l6ZS54LCBvcHRpb25zLnNpemUueSksXHJcbiAgICAgICAgICAgIHRleHR1cmUgPSBUZXh0dXJlc01hbmFnZXIuZ2V0VGV4dHVyZSg8VGV4dHVyZXNOYW1lcz5vcHRpb25zLnRleHR1cmUpLFxyXG4gICAgICAgICAgICBtYXRlcmlhbCA9IHRoaXMuX2NyZWF0ZU1hdGVyaWFsKHJlbmRlcmVyLCB0ZXh0dXJlLCB0ZXh0dXJlLmdldFVWUyhvcHRpb25zLnV2KSwgb3B0aW9ucy5yZXBlYXQpLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgb2JqZWN0ID0gSW5zdGFuY2UuYWxsb2NhdGUocmVuZGVyZXIsIGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIC8vIENlbnRlciBPYmplY3QgaW4gZ3JpZFxyXG4gICAgICAgIGxldCBiYm94ID0gZ2VvbWV0cnkuYm91bmRpbmdCb3g7XHJcbiAgICAgICAgb2JqZWN0LnRyYW5zbGF0ZSgtYmJveFswXSwgLWJib3hbMV0sIC1iYm94WzJdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NPYmplY3RQcm9wZXJ0aWVzKG9iamVjdCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlV2FsbChyZW5kZXJlcjogUmVuZGVyZXIsIG9wdGlvbnM6IFByb3BPcHRpb25zKTogSW5zdGFuY2Uge1xyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBXYWxsR2VvbWV0cnkocmVuZGVyZXIsIG9wdGlvbnMuc2l6ZS54LCBvcHRpb25zLnNpemUueSksXHJcbiAgICAgICAgICAgIHRleHR1cmUgPSBUZXh0dXJlc01hbmFnZXIuZ2V0VGV4dHVyZSg8VGV4dHVyZXNOYW1lcz5vcHRpb25zLnRleHR1cmUpLFxyXG4gICAgICAgICAgICBtYXRlcmlhbCA9IHRoaXMuX2NyZWF0ZU1hdGVyaWFsKHJlbmRlcmVyLCB0ZXh0dXJlLCB0ZXh0dXJlLmdldFVWUyhvcHRpb25zLnV2KSwgb3B0aW9ucy5yZXBlYXQpLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgb2JqZWN0ID0gSW5zdGFuY2UuYWxsb2NhdGUocmVuZGVyZXIsIGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NlbnRlck9iamVjdEluR3JpZChvYmplY3QsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc09iamVjdFByb3BlcnRpZXMob2JqZWN0LCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVByb3AocmVuZGVyZXI6IFJlbmRlcmVyLCBwcm9wTmFtZTogc3RyaW5nLCBvcHRpb25zPzogUHJvcE9wdGlvbnMpOiBJbnN0YW5jZSB7XHJcbiAgICAgICAgbGV0IG5hbWUgPSA8UHJvcHNOYW1lcz5wcm9wTmFtZSxcclxuICAgICAgICAgICAgb2JqOiBJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ01vZGVsM0QnOlxyXG4gICAgICAgICAgICAgICAgb2JqID0gUHJvcHNGYWN0b3J5LmNyZWF0ZTNETW9kZWwocmVuZGVyZXIsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgY2FzZSAnVGV4dCc6XHJcbiAgICAgICAgICAgICAgICBvYmogPSBQcm9wc0ZhY3RvcnkuY3JlYXRlVGV4dChyZW5kZXJlciwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjYXNlICdGbG9vcic6XHJcbiAgICAgICAgICAgICAgICBvYmogPSBQcm9wc0ZhY3RvcnkuY3JlYXRlRmxvb3IocmVuZGVyZXIsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgY2FzZSAnV2FsbCc6XHJcbiAgICAgICAgICAgICAgICBvYmogPSBQcm9wc0ZhY3RvcnkuY3JlYXRlV2FsbChyZW5kZXJlciwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9wIFtcIiArIHByb3BOYW1lICsgXCJdIG5vdCBmb3VuZCFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQcm9wc0ZhY3Rvcnk7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIEdlb21ldHJ5LCBNYXRlcmlhbCwgVmVjdG9yMywgaHR0cFJlcXVlc3QgfSBmcm9tICcuLi8uLi8uLi9lbmdpbmUnO1xyXG5cclxuaW50ZXJmYWNlIE1vZGVsIHtcclxuICAgIGdlb21ldHJ5OiBHZW9tZXRyeSxcclxuICAgIG1hdGVyaWFsOiBNYXRlcmlhbFxyXG59XHJcblxyXG5pbnRlcmZhY2UgTW9kZWxNYXAge1xyXG4gICAgW2luZGV4OiBzdHJpbmddOiBNb2RlbDtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgTW9kZWxOYW1lcyA9ICdCYXJTaWduJyB8ICdEdW1wc3RlcicgfCAnQmFyV2luZG93JyB8ICdCYXJEb29yRnJhbWUnIHwgJ0JhckRvb3InIHwgJ0JhcnJlbCc7XHJcblxyXG5jbGFzcyBNb2RlbHNNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgX21vZGVscyAgICAgICAgICAgICAgICAgOiBNb2RlbE1hcDtcclxuICAgIHByaXZhdGUgX21vZGVsc0NvdW50ICAgICAgICAgICAgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9tb2RlbHNSZWFkeSAgICAgICAgICAgIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX21vZGVscyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX21vZGVsc0NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLl9tb2RlbHNSZWFkeSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZE1vZGVsKG1vZGVsTmFtZTogc3RyaW5nLCByZW5kZXJlcjogUmVuZGVyZXIsIGNsZWFyQkJBeGlzPzogQXJyYXk8bnVtYmVyPik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX21vZGVsc0NvdW50Kys7XHJcbiAgICAgICAgaHR0cFJlcXVlc3QoXCJkYXRhL1wiICsgbW9kZWxOYW1lICsgXCIub2JqXCIsIChkYXRhOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxpbmVzID0gZGF0YS5zcGxpdChcIlxcblwiKSxcclxuICAgICAgICAgICAgICAgIHZlcnRpY2VzOiBBcnJheTxWZWN0b3IzPiA9IFtdLFxyXG4gICAgICAgICAgICAgICAgdGV4Q29vcmRzOiBBcnJheTxWZWN0b3IzPiA9IFtdLFxyXG4gICAgICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgR2VvbWV0cnkoKSxcclxuICAgICAgICAgICAgICAgIGluZENvdW50ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGk9MCxsaW5lO2xpbmU9bGluZXNbaV07aSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lID0gbGluZS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobGluZS5jaGFyQXQoMCkgPT0gXCIjXCIpIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYXJncyA9IGxpbmUuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoYXJnc1swXSA9PSBcInZcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzLnB1c2gobmV3IFZlY3RvcjMoKS5zZXQocGFyc2VGbG9hdChhcmdzWzFdKSwgcGFyc2VGbG9hdChhcmdzWzJdKSwgcGFyc2VGbG9hdChhcmdzWzNdKSkpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKGFyZ3NbMF0gPT0gXCJ2dFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4Q29vcmRzLnB1c2gobmV3IFZlY3RvcjMoKS5zZXQocGFyc2VGbG9hdChhcmdzWzFdKSwgcGFyc2VGbG9hdChhcmdzWzJdKSwgMCkpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKGFyZ3NbMF0gPT0gXCJmXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqPTE7ajw9MztqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZGljZXMgPSBhcmdzW2pdLnNwbGl0KFwiL1wiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRleCA9IHZlcnRpY2VzW3BhcnNlSW50KGluZGljZXNbMF0pIC0gMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXhDb29yZCA9IHRleENvb3Jkc1twYXJzZUludChpbmRpY2VzWzFdKSAtIDFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkVmVydGljZSh2ZXJ0ZXgueCwgdmVydGV4LnksIHZlcnRleC56KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkVGV4Q29vcmQodGV4Q29vcmQueCwgMSAtIHRleENvb3JkLnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkVHJpYW5nbGUoaW5kQ291bnQrKywgaW5kQ291bnQrKywgaW5kQ291bnQrKyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGdlb21ldHJ5LmJ1aWxkKHJlbmRlcmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjbGVhckJCQXhpcykge1xyXG4gICAgICAgICAgICAgICAgZ2VvbWV0cnkuY2xlYXJCb3VuZEJveEF4aXMoY2xlYXJCQkF4aXNbMF0sIGNsZWFyQkJBeGlzWzFdLCBjbGVhckJCQXhpc1syXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX21vZGVsc1JlYWR5Kys7XHJcblxyXG4gICAgICAgICAgICBsZXQgb2JqOiBNb2RlbCA9IHtcclxuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBnZW9tZXRyeSxcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsOiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX21vZGVsc1ttb2RlbE5hbWVdID0gb2JqO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KHJlbmRlcmVyOiBSZW5kZXJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xvYWRNb2RlbChcIkJhclNpZ25cIiwgcmVuZGVyZXIpO1xyXG4gICAgICAgIHRoaXMuX2xvYWRNb2RlbChcIkR1bXBzdGVyXCIsIHJlbmRlcmVyKTtcclxuICAgICAgICB0aGlzLl9sb2FkTW9kZWwoXCJCYXJXaW5kb3dcIiwgcmVuZGVyZXIsIFsxLCAwLCAwXSk7XHJcbiAgICAgICAgdGhpcy5fbG9hZE1vZGVsKFwiQmFyRG9vckZyYW1lXCIsIHJlbmRlcmVyLCBbMSwgMCwgMF0pO1xyXG4gICAgICAgIHRoaXMuX2xvYWRNb2RlbChcIkJhckRvb3JcIiwgcmVuZGVyZXIpO1xyXG4gICAgICAgIHRoaXMuX2xvYWRNb2RlbChcIkJhcnJlbFwiLCByZW5kZXJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1vZGVsKG5hbWU6IE1vZGVsTmFtZXMpOiBNb2RlbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsc1tuYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWxzQ291bnQgPT0gdGhpcy5fbW9kZWxzUmVhZHk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IChuZXcgTW9kZWxzTWFuYWdlcigpKTsiLCJpbXBvcnQgeyBSZW5kZXJlciwgQm94Q29sbGlzaW9uLCBWZWN0b3IzLCBQSV8yLCBQSTNfMiwgcGl4ZWxDb29yZHNUb1dvcmxkIGFzIHBjdHcgfSBmcm9tICcuLi8uLi8uLi9lbmdpbmUnO1xyXG5cclxuaW1wb3J0IFNlY3RvciBmcm9tICdzY2VuZXMvU2VjdG9yJztcclxuaW1wb3J0IHsgUHJvcE9wdGlvbnMgfSBmcm9tICdmYWN0b3JpZXMvUHJvcHNGYWN0b3J5JztcclxuaW1wb3J0IFVWTWFuYWdlciBmcm9tICdtYW5hZ2Vycy9VVk1hbmFnZXInO1xyXG5cclxuaW50ZXJmYWNlIFNlY3RvcnNNYXAge1xyXG4gICAgW2luZGV4OiBzdHJpbmddOiBTZWN0b3I7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFNlY3Rvck5hbWVzID0gJ0FMTEVZJztcclxuXHJcbmNsYXNzIFNlY3RvcnNNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgX3NlY3RvcnMgICAgICAgICAgICA6IFNlY3RvcnNNYXA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VjdG9ycyA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkQWxsZXkocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlY3RvciA9IG5ldyBTZWN0b3IocmVuZGVyZXIsIG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApLCBuZXcgVmVjdG9yMygzLjAsIDguMCwgOS4wKSksXHJcbiAgICAgICAgICAgIHNlY3Rvck5hbWU6IFNlY3Rvck5hbWVzID0gJ0FMTEVZJyxcclxuICAgICAgICAgICAgY2l0eSA9IFVWTWFuYWdlci5DSVRZO1xyXG5cclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIkZsb29yXCIsIDxQcm9wT3B0aW9ucz57IHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoMC4wLCAwLjAsIDAuMCkpLCBzaXplOiBwY3R3KG5ldyBWZWN0b3IzKDE0NCwgNDgpKSwgdXY6IGNpdHkuQUxMRVlfRkxPT1IsIHJlcGVhdDogWzksIDNdfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2VjdG9yLmFkZFByb3AoXCJXYWxsXCIsIDxQcm9wT3B0aW9ucz57IHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoMC4wLCAwLjAsIDAuMCkpLCBzaXplOiBwY3R3KG5ldyBWZWN0b3IzKDE0NCwgMTI4KSksIHV2OiBjaXR5LkJMQUNLX0JVSUxESU5HLCByZXBlYXQ6IFs5LCA4XX0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiV2FsbFwiLCA8UHJvcE9wdGlvbnM+eyB0ZXh0dXJlOiAnQ0lUWScsIHBvc2l0aW9uOiBwY3R3KG5ldyBWZWN0b3IzKDAuMCwgMC4wLCAwLjApKSwgcm90YXRpb246IG5ldyBWZWN0b3IzKDAsIFBJXzIsIDApLCBzaXplOiBwY3R3KG5ldyBWZWN0b3IzKDQ4LCAzNikpLCB1djogY2l0eS5BTExFWV9CQUNLX1dBTEwsIHJlcGVhdDogWzMsIDFdIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiV2FsbFwiLCA8UHJvcE9wdGlvbnM+eyB0ZXh0dXJlOiAnQ0lUWScsIHBvc2l0aW9uOiBwY3R3KG5ldyBWZWN0b3IzKDAuMCwgMC4wLCA0OCkpLCBzaXplOiBwY3R3KG5ldyBWZWN0b3IzKDMyLCA0OCkpLCByb3RhdGlvbjogbmV3IFZlY3RvcjMoMCwgTWF0aC5QSSwgMCksIHV2OiBjaXR5LkJBUl9FWFRfV0FMTCwgcmVwZWF0OiBbMiwgMV0gfSk7XHJcbiAgICAgICAgc2VjdG9yLmFkZFByb3AoXCJXYWxsXCIsIDxQcm9wT3B0aW9ucz57IHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoNjQsIDAuMCwgNDgpKSwgc2l6ZTogcGN0dyhuZXcgVmVjdG9yMygxNiwgNDgpKSwgcm90YXRpb246IG5ldyBWZWN0b3IzKDAsIE1hdGguUEksIDApLCB1djogY2l0eS5CQVJfRVhUX1dBTEwsIHJlcGVhdDogWzEsIDFdIH0pO1xyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiV2FsbFwiLCA8UHJvcE9wdGlvbnM+eyB0ZXh0dXJlOiAnQ0lUWScsIHBvc2l0aW9uOiBwY3R3KG5ldyBWZWN0b3IzKDk2LCAwLjAsIDQ4KSksIHNpemU6IHBjdHcobmV3IFZlY3RvcjMoMTYsIDQ4KSksIHJvdGF0aW9uOiBuZXcgVmVjdG9yMygwLCBNYXRoLlBJLCAwKSwgdXY6IGNpdHkuQkFSX0VYVF9XQUxMLCByZXBlYXQ6IFsxLCAxXSB9KTtcclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIldhbGxcIiwgPFByb3BPcHRpb25zPnsgdGV4dHVyZTogJ0NJVFknLCBwb3NpdGlvbjogcGN0dyhuZXcgVmVjdG9yMygxMjgsIDAuMCwgNDgpKSwgc2l6ZTogcGN0dyhuZXcgVmVjdG9yMygxNiwgNDgpKSwgcm90YXRpb246IG5ldyBWZWN0b3IzKDAsIE1hdGguUEksIDApLCB1djogY2l0eS5CQVJfRVhUX1dBTEwsIHJlcGVhdDogWzEsIDFdIH0pO1xyXG5cclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIldhbGxcIiwgPFByb3BPcHRpb25zPnsgdGV4dHVyZTogJ0NJVFknLCBwb3NpdGlvbjogcGN0dyhuZXcgVmVjdG9yMygxMjgsIDAuMCwgMC4wKSksIHJvdGF0aW9uOiBuZXcgVmVjdG9yMygwLCBQSTNfMiwgMCksIHNpemU6IHBjdHcobmV3IFZlY3RvcjMoNDgsIDMyKSksIHV2OiBjaXR5LkFMTEVZX0ZFTkNFLCByZXBlYXQ6IFszLCAxXSwgb3BhcXVlOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgc2VjdG9yLmFkZFByb3AoXCJXYWxsXCIsIDxQcm9wT3B0aW9ucz57IHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoMjQsIDAuMCwgNDApKSwgc2l6ZTogcGN0dyhuZXcgVmVjdG9yMygxMCwgMTEpKSwgdXY6IGNpdHkuQkFSX0ZMT09SX1NJR04sIGJpbGxib2FyZDogdHJ1ZSB9KTtcclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIk1vZGVsM0RcIiwgPFByb3BPcHRpb25zPnsgbW9kZWw6ICdEdW1wc3RlcicsIHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoMC4wLCAwLjAsIDguMCkpLCBjdWxsaW5nOiB0cnVlIH0pO1xyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiTW9kZWwzRFwiLCA8UHJvcE9wdGlvbnM+eyBtb2RlbDogJ0JhclNpZ24nLCB0ZXh0dXJlOiAnQ0lUWScsIHBvc2l0aW9uOiBwY3R3KG5ldyBWZWN0b3IzKDMyLCAyNiwgNDgpKSwgcm90YXRpb246IG5ldyBWZWN0b3IzKDAsIFBJXzIsIDApLCBjdWxsaW5nOiB0cnVlIH0pO1xyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiTW9kZWwzRFwiLCA8UHJvcE9wdGlvbnM+eyBtb2RlbDogJ0JhcldpbmRvdycsIHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoODAsIDAuMCwgNDgpKSwgcm90YXRpb246IG5ldyBWZWN0b3IzKDAsIFBJXzIsIDApIH0pO1xyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiTW9kZWwzRFwiLCA8UHJvcE9wdGlvbnM+eyBtb2RlbDogJ0JhcldpbmRvdycsIHRleHR1cmU6ICdDSVRZJywgcG9zaXRpb246IHBjdHcobmV3IFZlY3RvcjMoMTEyLCAwLjAsIDQ4KSksIHJvdGF0aW9uOiBuZXcgVmVjdG9yMygwLCBQSV8yLCAwKSB9KTtcclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIk1vZGVsM0RcIiwgPFByb3BPcHRpb25zPnsgbW9kZWw6ICdCYXJEb29yRnJhbWUnLCB0ZXh0dXJlOiAnQ0lUWScsIHBvc2l0aW9uOiBwY3R3KG5ldyBWZWN0b3IzKDMyLCAwLjAsIDQ4KSksIHJvdGF0aW9uOiBuZXcgVmVjdG9yMygwLCBQSV8yLCAwKSB9KTtcclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIk1vZGVsM0RcIiwgPFByb3BPcHRpb25zPnsgbW9kZWw6ICdCYXJEb29yJywgdGV4dHVyZTogJ0NJVFknLCBwb3NpdGlvbjogcGN0dyhuZXcgVmVjdG9yMyg0MSwgMC4wLCA0OCkpLCByb3RhdGlvbjogbmV3IFZlY3RvcjMoMCwgUElfMiwgMCksIG9wYXF1ZTogZmFsc2UgfSk7XHJcbiAgICAgICAgc2VjdG9yLmFkZFByb3AoXCJNb2RlbDNEXCIsIDxQcm9wT3B0aW9ucz57IG1vZGVsOiAnQmFycmVsJywgdGV4dHVyZTogJ0NJVFknLCBwb3NpdGlvbjogcGN0dyhuZXcgVmVjdG9yMyg2NiwgMC4wLCAyKSkgfSk7XHJcbiAgICAgICAgc2VjdG9yLmFkZFByb3AoXCJNb2RlbDNEXCIsIDxQcm9wT3B0aW9ucz57IG1vZGVsOiAnQmFycmVsJywgdGV4dHVyZTogJ0NJVFknLCBwb3NpdGlvbjogcGN0dyhuZXcgVmVjdG9yMyg4MCwgMC4wLCAyKSksIHJvdGF0aW9uOiBuZXcgVmVjdG9yMygwLCAtUElfMiwgMCkgfSk7XHJcblxyXG4gICAgICAgIHNlY3Rvci5hZGRQcm9wKFwiVGV4dFwiLCA8UHJvcE9wdGlvbnM+eyB0ZXh0OiBcIkp1Y2FyYXZlXCIsIGZvbnQ6IFwicmV0Z2Fub25cIiwgZm9udFNpemU6IDM2LCBwb3NpdGlvbjogcGN0dyhuZXcgVmVjdG9yMyg0OCwgMjQsIDI0KSksIHJvdGF0aW9uOiBuZXcgVmVjdG9yMygwLCBQSV8yLCAwKSwgb3BhcXVlOiBmYWxzZSB9KTtcclxuICAgICAgICBzZWN0b3IuYWRkUHJvcChcIlRleHRcIiwgPFByb3BPcHRpb25zPnsgdGV4dDogXCJBIEdhbWUgQnlcIiwgZm9udDogXCJyZXRnYW5vblwiLCBmb250U2l6ZTogMzYsIHBvc2l0aW9uOiBwY3R3KG5ldyBWZWN0b3IzKDgwLCAxNiwgMjQpKSwgcm90YXRpb246IG5ldyBWZWN0b3IzKDAsIFBJXzIsIDApLCBvcGFxdWU6IGZhbHNlIH0pO1xyXG5cclxuICAgICAgICAvLyBDb2xsaXNpb25zXHJcbiAgICAgICAgc2VjdG9yLnJlZ2lzdGVyQ29sbGlzaW9uKChuZXcgQm94Q29sbGlzaW9uKHBjdHcobmV3IFZlY3RvcjMoMCwgMCwgLTEpKSwgcGN0dyhuZXcgVmVjdG9yMygxNDQsIDEyOCwgMikpKSkuY2VudGVySW5BeGlzKGZhbHNlLCBmYWxzZSwgZmFsc2UpKTsgLy8gUmlnaHRXYWxsXHJcbiAgICAgICAgc2VjdG9yLnJlZ2lzdGVyQ29sbGlzaW9uKChuZXcgQm94Q29sbGlzaW9uKHBjdHcobmV3IFZlY3RvcjMoLTEsIDAsIDApKSwgcGN0dyhuZXcgVmVjdG9yMygyLCAzNiwgNDgpKSkpLmNlbnRlckluQXhpcyhmYWxzZSwgZmFsc2UsIGZhbHNlKSk7IC8vIEJhY2tXYWxsXHJcbiAgICAgICAgc2VjdG9yLnJlZ2lzdGVyQ29sbGlzaW9uKChuZXcgQm94Q29sbGlzaW9uKHBjdHcobmV3IFZlY3RvcjMoMCwgMCwgNDcpKSwgcGN0dyhuZXcgVmVjdG9yMyg0MSwgNDgsIDIpKSkpLmNlbnRlckluQXhpcyhmYWxzZSwgZmFsc2UsIGZhbHNlKSk7IC8vIEJhciBwYXJ0IDFcclxuICAgICAgICBzZWN0b3IucmVnaXN0ZXJDb2xsaXNpb24oKG5ldyBCb3hDb2xsaXNpb24ocGN0dyhuZXcgVmVjdG9yMyg1NSwgMCwgNDcpKSwgcGN0dyhuZXcgVmVjdG9yMyg4OSwgNDgsIDIpKSkpLmNlbnRlckluQXhpcyhmYWxzZSwgZmFsc2UsIGZhbHNlKSk7IC8vIEJhciBwYXJ0IDJcclxuICAgICAgICBzZWN0b3IucmVnaXN0ZXJDb2xsaXNpb24oKG5ldyBCb3hDb2xsaXNpb24ocGN0dyhuZXcgVmVjdG9yMygxMjcsIDAsIDApKSwgcGN0dyhuZXcgVmVjdG9yMygyLCAzMiwgNDgpKSkpLmNlbnRlckluQXhpcyhmYWxzZSwgZmFsc2UsIGZhbHNlKSk7IC8vIEZlbmNlXHJcblxyXG4gICAgICAgIHNlY3Rvci5yZWdpc3RlckNvbGxpc2lvbigobmV3IEJveENvbGxpc2lvbihwY3R3KG5ldyBWZWN0b3IzKDAsIDAsIDgpKSwgcGN0dyhuZXcgVmVjdG9yMygxNiwgMTYsIDMwKSkpKS5jZW50ZXJJbkF4aXMoZmFsc2UsIGZhbHNlLCBmYWxzZSkpOyAvLyBEdW1wc3RlclxyXG4gICAgICAgIHNlY3Rvci5yZWdpc3RlckNvbGxpc2lvbigobmV3IEJveENvbGxpc2lvbihwY3R3KG5ldyBWZWN0b3IzKDIyLCAwLCAzNikpLCBwY3R3KG5ldyBWZWN0b3IzKDEyLCAxMiwgMTIpKSkpLmNlbnRlckluQXhpcyhmYWxzZSwgZmFsc2UsIGZhbHNlKSk7IC8vIFNpZ25cclxuICAgICAgICBzZWN0b3IucmVnaXN0ZXJDb2xsaXNpb24oKG5ldyBCb3hDb2xsaXNpb24ocGN0dyhuZXcgVmVjdG9yMyg2NiwgMCwgMCkpLCBwY3R3KG5ldyBWZWN0b3IzKDI3LCAxNiwgMTYpKSkpLmNlbnRlckluQXhpcyhmYWxzZSwgZmFsc2UsIGZhbHNlKSk7IC8vIEJhcnJlbHNcclxuXHJcbiAgICAgICAgc2VjdG9yLnNldENvbGxpc2lvbihwY3R3KG5ldyBWZWN0b3IzKDAsIDAsIDApKSwgcGN0dyhuZXcgVmVjdG9yMygxNDQsIDEyOCwgNDgpKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NlY3RvcnNbc2VjdG9yTmFtZV0gPSBzZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fYnVpbGRBbGxleShyZW5kZXJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNlY3RvcihzZWN0b3JOYW1lOiBTZWN0b3JOYW1lcyk6IFNlY3RvciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlY3RvcnNbc2VjdG9yTmFtZV07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IChuZXcgU2VjdG9yc01hbmFnZXIoKSk7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIFRleHR1cmUgfSBmcm9tICcuLi8uLi8uLi9lbmdpbmUnO1xyXG5cclxuaW50ZXJmYWNlIFRleHR1cmVzTWFwIHtcclxuICAgIFtpbmRleDogc3RyaW5nXSA6IFRleHR1cmVcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgVGV4dHVyZXNOYW1lcyA9ICdURVhUVVJFXzE2JyB8ICdNT0NLR1VOJyB8ICdDSVRZJyB8ICdOUENTJztcclxuXHJcbmNsYXNzIFRleHR1cmVzTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIF90ZXh0dXJlcyAgICAgICAgICAgOiBUZXh0dXJlc01hcDtcclxuICAgIHByaXZhdGUgX3RleHR1cmVzQ291bnQgICAgICA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX3RleHR1cmVzUmVhZHkgICAgICA6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl90ZXh0dXJlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3RleHR1cmVzQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuX3RleHR1cmVzUmVhZHkgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29uVGV4dHVyZUxvYWQoKSB7XHJcbiAgICAgICAgdGhpcy5fdGV4dHVyZXNSZWFkeSArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvYWRUZXh0dXJlKHJlbmRlcmVyOiBSZW5kZXJlciwgY29kZTogVGV4dHVyZXNOYW1lcywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl90ZXh0dXJlc0NvdW50ICs9IDE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fdGV4dHVyZXNbY29kZV0gPSBuZXcgVGV4dHVyZSh1cmwsIHJlbmRlcmVyLCAoKSA9PiB7IHRoaXMuX29uVGV4dHVyZUxvYWQoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQocmVuZGVyZXI6IFJlbmRlcmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbG9hZFRleHR1cmUocmVuZGVyZXIsICdURVhUVVJFXzE2JywgXCJpbWcvdGV4dHVyZS5wbmdcIik7XHJcbiAgICAgICAgdGhpcy5fbG9hZFRleHR1cmUocmVuZGVyZXIsICdDSVRZJywgXCJpbWcvY2l0eS5wbmdcIik7XHJcbiAgICAgICAgdGhpcy5fbG9hZFRleHR1cmUocmVuZGVyZXIsICdOUENTJywgXCJpbWcvbnBjcy5wbmdcIik7XHJcblxyXG4gICAgICAgIHRoaXMuX2xvYWRUZXh0dXJlKHJlbmRlcmVyLCAnTU9DS0dVTicsIFwiaW1nL21vY2tHdW4ucG5nXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRUZXh0dXJlKHRleHR1cmVOYW1lOiBUZXh0dXJlc05hbWVzKTogVGV4dHVyZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RleHR1cmVzW3RleHR1cmVOYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZXNSZWFkeSA9PSB0aGlzLl90ZXh0dXJlc0NvdW50O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAobmV3IFRleHR1cmVzTWFuYWdlcigpKTsiLCJpbXBvcnQgeyBWZWN0b3I0IH0gZnJvbSAnLi4vLi4vLi4vZW5naW5lJztcclxuXHJcbmV4cG9ydCB0eXBlIENIQVJBX1VWUyA9IHtcclxuICAgIEZST05UOiBWZWN0b3I0LFxyXG4gICAgTEVGVDogVmVjdG9yNCxcclxuICAgIFJJR0hUOiBWZWN0b3I0LFxyXG4gICAgQkFDSzogVmVjdG9yNCxcclxufVxyXG5cclxuY29uc3QgVVZNYW5hZ2VyID0ge1xyXG4gICAgQ0lUWToge1xyXG4gICAgICAgIEFMTEVZX0ZMT09SOiBuZXcgVmVjdG9yNCgxLCAxLCAxNiwgMTYpLFxyXG4gICAgICAgIEFMTEVZX0ZFTkNFOiBuZXcgVmVjdG9yNCgxOSwgMSwgMTYsIDMyKSxcclxuICAgICAgICBBTExFWV9CQUNLX1dBTEw6IG5ldyBWZWN0b3I0KDEsIDE5LCAxNiwgMzYpLFxyXG5cclxuICAgICAgICBCQVJfRkxPT1JfU0lHTjogbmV3IFZlY3RvcjQoMjIsIDc2LCAxMCwgMTEpLFxyXG4gICAgICAgIEJBUl9FWFRfV0FMTDogbmV3IFZlY3RvcjQoMSwgNTMsIDE2LCA0OCksXHJcblxyXG4gICAgICAgIEJMQUNLX1dJTkRPVzogbmV3IFZlY3RvcjQoMTksIDQwLCAxNiwgMTYpLFxyXG5cclxuICAgICAgICBCTEFDS19CVUlMRElORzogbmV3IFZlY3RvcjQoMSwgMTAzLCAxNiwgMTYpXHJcbiAgICB9LFxyXG5cclxuICAgIE5QQ1M6IHtcclxuICAgICAgICBBTExFWV9QRVJTT046IDxDSEFSQV9VVlM+e1xyXG4gICAgICAgICAgICBGUk9OVDogbmV3IFZlY3RvcjQoMSwgMSwgMTIsIDI1KSxcclxuICAgICAgICAgICAgTEVGVDogbmV3IFZlY3RvcjQoMjUsIDEsIC0xMiwgMjUpLFxyXG4gICAgICAgICAgICBSSUdIVDogbmV3IFZlY3RvcjQoMTMsIDEsIDEyLCAyNSksXHJcbiAgICAgICAgICAgIEJBQ0s6IG5ldyBWZWN0b3I0KDI1LCAxLCAxMiwgMjUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVVk1hbmFnZXI7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIFNjZW5lLCBJbnN0YW5jZSwgVmVjdG9yMywgdmVjMywgcGl4ZWxDb29yZHNUb1dvcmxkIGFzIHBjdHcsIHJlbWVtYmVyUG9vbEFsbG9jIGFzIHJwYSwgZnJlZVBvb2xBbGxvYyB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG5pbXBvcnQgRW50aXR5RmFjdG9yeSBmcm9tICdmYWN0b3JpZXMvRW50aXR5RmFjdG9yeSc7XHJcbmltcG9ydCBTZWN0b3JzTWFuYWdlciBmcm9tICdtYW5hZ2Vycy9TZWN0b3JzTWFuYWdlcic7XHJcbmltcG9ydCBBcHAgZnJvbSAnQXBwJztcclxuaW1wb3J0IEhVRFNjZW5lIGZyb20gJ3NjZW5lcy9IVURTY2VuZSc7XHJcbmltcG9ydCBTZWN0b3IgZnJvbSAnc2NlbmVzL1NlY3Rvcic7XHJcbmltcG9ydCBQbGF5ZXJDb21wb25lbnQgZnJvbSAnY29tcG9uZW50cy9QbGF5ZXJDb21wb25lbnQnO1xyXG5cclxuaW50ZXJmYWNlIFNlY3RvclRyaWdnZXIge1xyXG4gICAgcG9zaXRpb246IFZlY3RvcjM7XHJcbiAgICBzaXplOiBWZWN0b3IzO1xyXG4gICAgc2VjdG9yOiBTZWN0b3I7XHJcbiAgICBkZXN0cm95OiBib29sZWFuO1xyXG59XHJcblxyXG5jbGFzcyBEZW1vU2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcbiAgICBwcml2YXRlIF9odWQgICAgICAgICAgICAgICAgOiBIVURTY2VuZTtcclxuICAgIHByaXZhdGUgX3RyaWdnZXJzICAgICAgICAgICA6IEFycmF5PFNlY3RvclRyaWdnZXI+O1xyXG4gICAgcHJpdmF0ZSBfcGxheWVyICAgICAgICAgICAgIDogSW5zdGFuY2U7XHJcbiAgICBwcml2YXRlIF9wbGF5ZXJDb21wb25lbnQgICAgOiBQbGF5ZXJDb21wb25lbnQ7XHJcbiAgICBwcml2YXRlIF9zZWN0b3JzICAgICAgICAgICAgOiBBcnJheTxTZWN0b3I+O1xyXG4gICAgcHJpdmF0ZSBfYXBwICAgICAgICAgICAgICAgIDogQXBwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCByZW5kZXJlcjogUmVuZGVyZXIpIHtcclxuICAgICAgICBzdXBlcihyZW5kZXJlcik7XHJcblxyXG4gICAgICAgIHRoaXMuX2FwcCA9IGFwcDtcclxuICAgICAgICB0aGlzLl90cmlnZ2VycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NlY3RvcnMgPSBbXTtcclxuICAgICAgICB0aGlzLl9idWlsZFNjZW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkVHJpZ2dlcihwb3NpdGlvbjogVmVjdG9yMywgc2l6ZTogVmVjdG9yMywgc2VjdG9yOiBTZWN0b3IsIGRlc3Ryb3k6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl90cmlnZ2Vycy5wdXNoKHtcclxuICAgICAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgICAgIHNpemUsXHJcbiAgICAgICAgICAgIHNlY3RvcixcclxuICAgICAgICAgICAgZGVzdHJveVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2FkZFNlY3Rvckluc3RhbmNlcyhzZWN0b3I6IFNlY3Rvcik6IHZvaWQge1xyXG4gICAgICAgIHNlY3Rvci5idWlsZCgpO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZXMgPSBzZWN0b3IuaW5zdGFuY2VzO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTAsaW5zO2lucz1pbnN0YW5jZXNbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChpbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9idWlsZFNjZW5lKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYW1lcmEgPSB0aGlzLl9hcHAuY2FtZXJhLFxyXG4gICAgICAgICAgICBwbGF5ZXIgPSBFbnRpdHlGYWN0b3J5LmNyZWF0ZVBsYXllcih0aGlzLl9yZW5kZXJlciwgY2FtZXJhKTtcclxuXHJcbiAgICAgICAgLy8gU2VjdG9yc1xyXG4gICAgICAgIGxldCBzZWN0b3IgPSBTZWN0b3JzTWFuYWdlci5nZXRTZWN0b3IoXCJBTExFWVwiKTtcclxuICAgICAgICBzZWN0b3Iuc2V0U2NlbmUodGhpcyk7XHJcbiAgICAgICAgc2VjdG9yLmRpc3BsYXlDb2xsaXNpb25zKCk7XHJcbiAgICAgICAgdGhpcy5fc2VjdG9ycy5wdXNoKHNlY3Rvcik7XHJcbiAgICAgICAgdGhpcy5fYWRkU2VjdG9ySW5zdGFuY2VzKHNlY3Rvcik7XHJcbiAgICAgICAgdGhpcy5fYWRkVHJpZ2dlcihuZXcgVmVjdG9yMygwLjAsIDAuMCwgMS41KSwgbmV3IFZlY3RvcjMoOS4wLCAxMC4wLCA0LjUpLCBzZWN0b3IsIGZhbHNlKTsgLy9BY3RpdmF0ZVxyXG4gICAgICAgIHRoaXMuX2FkZFRyaWdnZXIobmV3IFZlY3RvcjMoMC4wLCAwLjAsIDYuMCksIG5ldyBWZWN0b3IzKDkuMCwgMTAuMCwgNC41KSwgc2VjdG9yLCB0cnVlKTsgLy9EZWFjdGl2YXRlXHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChFbnRpdHlGYWN0b3J5LmNyZWF0ZUFsbGV5R3V5KHRoaXMuX3JlbmRlcmVyKS50cmFuc2xhdGUocnBhKHBjdHcodmVjMygyNCwgMCwgOCkpKSkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChwbGF5ZXIudHJhbnNsYXRlKHJwYShwY3R3KHZlYzMoMTEyLCAwLjAsIDI0KSkpKS5yb3RhdGUoMCwgTWF0aC5QSSwgMCkpO1xyXG4gICAgICAgIHRoaXMuc2V0Q2FtZXJhKGNhbWVyYSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2h1ZCA9IG5ldyBIVURTY2VuZSh0aGlzLl9hcHAsIHRoaXMuX3JlbmRlcmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgIHRoaXMuX3BsYXllckNvbXBvbmVudCA9IHBsYXllci5nZXRDb21wb25lbnQ8UGxheWVyQ29tcG9uZW50PihQbGF5ZXJDb21wb25lbnQuY29tcG9uZW50TmFtZSk7XHJcblxyXG4gICAgICAgIGZyZWVQb29sQWxsb2MoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGVzdENvbGxpc2lvbihpbnN0YW5jZTogSW5zdGFuY2UsIGRpcmVjdGlvbjogVmVjdG9yMyk6IFZlY3RvcjMge1xyXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IGluc3RhbmNlLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICBpbnNDb2wgPSBpbnN0YW5jZS5jb2xsaXNpb247XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MCxzZWN0b3I7c2VjdG9yPXRoaXMuX3NlY3RvcnNbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWN0b3IuY29sbGlzaW9uLnRlc3QocG9zaXRpb24sIGRpcmVjdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGo9MCxjb2xsaXNpb247Y29sbGlzaW9uPXNlY3Rvci5zb2xpZEluc3RhbmNlc1tqXTtqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlzaW9uID09IGluc0NvbCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBjb2xsaXNpb24udGVzdChwb3NpdGlvbiwgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEludGVyc2VjdGluZ1NlY3RvcnMoaW5zdGFuY2U6IEluc3RhbmNlKTogQXJyYXk8U2VjdG9yPiB7XHJcbiAgICAgICAgbGV0IHJldDogQXJyYXk8U2VjdG9yPiA9IFtdLFxyXG4gICAgICAgICAgICBwb3MgPSBpbnN0YW5jZS5wb3NpdGlvbixcclxuICAgICAgICAgICAgZGlyID0gdmVjMygwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wLHNlY3RvcjtzZWN0b3I9dGhpcy5fc2VjdG9yc1tpXTtpKyspIHtcclxuICAgICAgICAgICAgaWYgKHNlY3Rvci5jb2xsaXNpb24udGVzdChwb3MsIGRpcikpIHtcclxuICAgICAgICAgICAgICAgIHJldC5wdXNoKHNlY3Rvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRpci5kZWxldGUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX3BsYXllckNvbXBvbmVudC5tb3ZlZCkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IHAgPSB0aGlzLl9wbGF5ZXIucG9zaXRpb247XHJcbiAgICAgICAgZm9yIChsZXQgaT0wLHRyaWc7dHJpZz10aGlzLl90cmlnZ2Vyc1tpXTtpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRwID0gdHJpZy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgIHRzID0gdHJpZy5zaXplO1xyXG5cclxuICAgICAgICAgICAgaWYgKHAueCA8IHRwLnggfHwgcC54ID49IHRwLngrdHMueCB8fCBwLnkgPCB0cC55IHx8IHAueSA+PSB0cC55K3RzLnkgfHwgcC56IDwgdHAueiB8fCBwLnogPj0gdHAueit0cy56KSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRyaWcuZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgdHJpZy5zZWN0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJldCA9IHRyaWcuc2VjdG9yLmJ1aWxkKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmV0ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRTZWN0b3JJbnN0YW5jZXModHJpZy5zZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5faHVkLnJlbmRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcGxheWVyKCk6IEluc3RhbmNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGxheWVyO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZW1vU2NlbmU7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIFNjZW5lLCBUZXh0dXJlLCBCYXNpY01hdGVyaWFsLCBXYWxsR2VvbWV0cnksIFZlY3RvcjMsIEluc3RhbmNlLCBjb29yZHNUb09ydGhvIH0gZnJvbSAnLi4vLi4vLi4vZW5naW5lJztcclxuXHJcbmltcG9ydCBBcHAgZnJvbSAnQXBwJztcclxuaW1wb3J0IFRleHR1cmVNYW5hZ2VyIGZyb20gJ21hbmFnZXJzL1RleHR1cmVzTWFuYWdlcic7XHJcblxyXG5jbGFzcyBIVURTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCByZW5kZXJlcjogUmVuZGVyZXIpIHtcclxuICAgICAgICBzdXBlcihyZW5kZXJlcik7XHJcblxyXG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IGFwcC5jYW1lcmFPcnRobztcclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRTY2VuZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZVNwcml0ZSh0ZXh0dXJlOiBUZXh0dXJlLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcG9zaXRpb246IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgV2FsbEdlb21ldHJ5KHRoaXMuX3JlbmRlcmVyLCB3aWR0aCwgaGVpZ2h0KSxcclxuICAgICAgICAgICAgbWF0ZXJpYWwgPSBuZXcgQmFzaWNNYXRlcmlhbCh0aGlzLl9yZW5kZXJlciwgdGV4dHVyZSksXHJcbiAgICAgICAgICAgIG9iamVjdCA9IEluc3RhbmNlLmFsbG9jYXRlKHRoaXMuX3JlbmRlcmVyLCBnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIG9iamVjdC50cmFuc2xhdGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueik7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChvYmplY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkU2NlbmUoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNvb3JkcyA9IGNvb3Jkc1RvT3J0aG8odGhpcy5fY2FtZXJhLCAxMDYsIDEwNCk7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlU3ByaXRlKFRleHR1cmVNYW5hZ2VyLmdldFRleHR1cmUoXCJNT0NLR1VOXCIpLCAzMi4wLCAzMi4wLCBjb29yZHMpO1xyXG5cclxuICAgICAgICBjb29yZHMuZGVsZXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5yZW5kZXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSFVEU2NlbmU7IiwiaW1wb3J0IHsgUmVuZGVyZXIsIFNjZW5lLCBDb25maWcsIFZlY3RvcjMsIEluc3RhbmNlLCBDb2xsaXNpb24sIEJveENvbGxpc2lvbiB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG5pbXBvcnQgUHJvcHNGYWN0b3J5IGZyb20gJ2ZhY3Rvcmllcy9Qcm9wc0ZhY3RvcnknO1xyXG5pbXBvcnQge1Byb3BzTmFtZXN9IGZyb20gJ2ZhY3Rvcmllcy9Qcm9wc0ZhY3RvcnknO1xyXG5pbXBvcnQgRW50aXR5RmFjdG9yeSBmcm9tICdmYWN0b3JpZXMvRW50aXR5RmFjdG9yeSc7XHJcbmltcG9ydCB7IEVudGl0aWVzTmFtZXMgfSBmcm9tICdmYWN0b3JpZXMvRW50aXR5RmFjdG9yeSc7XHJcblxyXG5pbnRlcmZhY2UgUHJvcCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBvcHRpb25zPzogYW55O1xyXG59XHJcblxyXG5jbGFzcyBTZWN0b3Ige1xyXG4gICAgcHJpdmF0ZSBfcmVuZGVyZXIgICAgICAgICAgICAgICA6IFJlbmRlcmVyO1xyXG4gICAgcHJpdmF0ZSBfc2NlbmUgICAgICAgICAgICAgICAgICA6IFNjZW5lO1xyXG4gICAgcHJpdmF0ZSBfcG9zaXRpb24gICAgICAgICAgICAgICA6IFZlY3RvcjM7XHJcbiAgICBwcml2YXRlIF9zaXplICAgICAgICAgICAgICAgICAgIDogVmVjdG9yMztcclxuICAgIHByaXZhdGUgX3Byb3BMaXN0ICAgICAgICAgICAgICAgOiBBcnJheTxQcm9wPjtcclxuICAgIHByaXZhdGUgX2luc0xpc3QgICAgICAgICAgICAgICAgOiBBcnJheTxQcm9wPjtcclxuICAgIHByaXZhdGUgX2luc3RhbmNlcyAgICAgICAgICAgICAgOiBBcnJheTxJbnN0YW5jZT47XHJcbiAgICBwcml2YXRlIF9zb2xpZEluc3RhbmNlcyAgICAgICAgIDogQXJyYXk8Q29sbGlzaW9uPjtcclxuICAgIHByaXZhdGUgX2NvbGxpc2lvbiAgICAgICAgICAgICAgOiBCb3hDb2xsaXNpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyLCBwb3NpdGlvbjogVmVjdG9yMywgc2l6ZTogVmVjdG9yMykge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgICAgICB0aGlzLl9zaXplID0gc2l6ZTtcclxuICAgICAgICB0aGlzLl9wcm9wTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2luc0xpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLl9zb2xpZEluc3RhbmNlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NjZW5lID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkUHJvcChwcm9wTmFtZTogUHJvcHNOYW1lcywgb3B0aW9ucz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3Byb3BMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBwcm9wTmFtZSxcclxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRJbnN0YW5jZShpbnNOYW1lOiBFbnRpdGllc05hbWVzLCBvcHRpb25zPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5zTGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogaW5zTmFtZSxcclxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRDb2xsaXNpb24ocG9zaXRpb246IFZlY3RvcjMsIHNpemU6IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jb2xsaXNpb24gPSBuZXcgQm94Q29sbGlzaW9uKHBvc2l0aW9uLCBzaXplKS5jZW50ZXJJbkF4aXMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5fY29sbGlzaW9uLnNvbGlkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFNjZW5lKHNjZW5lOiBTY2VuZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NjZW5lID0gc2NlbmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlZ2lzdGVyQ29sbGlzaW9uKGNvbGxpc2lvbjogQ29sbGlzaW9uKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc29saWRJbnN0YW5jZXMucHVzaChjb2xsaXNpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhckNvbGxpc2lvbihjb2xsaXNpb246IENvbGxpc2lvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvbGlkSW5zdGFuY2VzLnNwbGljZSh0aGlzLl9zb2xpZEluc3RhbmNlcy5pbmRleE9mKGNvbGxpc2lvbiksIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkaXNwbGF5Q29sbGlzaW9ucygpOiB2b2lkIHtcclxuICAgICAgICBpZiAoQ29uZmlnLkRJU1BMQVlfQ09MTElTSU9OUykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpPTAsY29sbGlzaW9uO2NvbGxpc2lvbj10aGlzLl9zb2xpZEluc3RhbmNlc1tpXTtpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbi5zZXRTY2VuZSh0aGlzLl9zY2VuZSk7XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24uYWRkQ29sbGlzaW9uSW5zdGFuY2UodGhpcy5fcmVuZGVyZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBidWlsZCgpOiBBcnJheTxJbnN0YW5jZT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnN0YW5jZXMgIT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxyXG5cclxuICAgICAgICBsZXQgcmV0OiBBcnJheTxJbnN0YW5jZT4gPSBbXSxcclxuICAgICAgICAgICAgc29saWQ6IEFycmF5PENvbGxpc2lvbj4gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wLHByb3A7cHJvcD10aGlzLl9wcm9wTGlzdFtpXTtpKyspIHtcclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gUHJvcHNGYWN0b3J5LmNyZWF0ZVByb3AodGhpcy5fcmVuZGVyZXIsIHByb3AubmFtZSwgcHJvcC5vcHRpb25zKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldC5wdXNoKGluc3RhbmNlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5jb2xsaXNpb24gJiYgaW5zdGFuY2UuY29sbGlzaW9uLnNvbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBzb2xpZC5wdXNoKGluc3RhbmNlLmNvbGxpc2lvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MCxpbnM7aW5zPXRoaXMuX2luc0xpc3RbaV07aSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IEVudGl0eUZhY3RvcnkuY3JlYXRlSW5zdGFuY2UodGhpcy5fcmVuZGVyZXIsIDxFbnRpdGllc05hbWVzPmlucy5uYW1lLCBpbnMub3B0aW9ucy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXQucHVzaChpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuY29sbGlzaW9uICYmIGluc3RhbmNlLmNvbGxpc2lvbi5zb2xpZCkge1xyXG4gICAgICAgICAgICAgICAgc29saWQucHVzaChpbnN0YW5jZS5jb2xsaXNpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9pbnN0YW5jZXMgPSByZXQ7XHJcbiAgICAgICAgdGhpcy5fc29saWRJbnN0YW5jZXMgPSB0aGlzLl9zb2xpZEluc3RhbmNlcy5jb25jYXQoc29saWQpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnN0YW5jZXMgPT0gbnVsbCkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wLGlucztpbnM9dGhpcy5faW5zdGFuY2VzW2ldO2krKykge1xyXG4gICAgICAgICAgICBpbnMuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGluc3RhbmNlcygpOiBBcnJheTxJbnN0YW5jZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjb2xsaXNpb24oKTogQm94Q29sbGlzaW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29sbGlzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgc29saWRJbnN0YW5jZXMoKTogQXJyYXk8Q29sbGlzaW9uPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvbGlkSW5zdGFuY2VzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldCBzaXplKCk6IFZlY3RvcjMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplO1xyXG4gICAgfX1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNlY3RvcjsiXX0=
