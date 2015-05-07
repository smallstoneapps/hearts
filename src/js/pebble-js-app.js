(function() {
    function require(path, parent, orig) {
        var resolved = require.resolve(path);
        if (null == resolved) {
            orig = orig || path;
            parent = parent || "root";
            var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
            err.path = orig;
            err.parent = parent;
            err.require = true;
            throw err;
        }
        var module = require.modules[resolved];
        if (!module.exports) {
            module.exports = {};
            module.client = module.component = true;
            module.call(this, module.exports, require.relative(resolved), module);
        }
        return module.exports;
    }
    require.modules = {};
    require.aliases = {};
    require.resolve = function(path) {
        if (path.charAt(0) === "/") path = path.slice(1);
        var index = path + "/index.js";
        var paths = [ path, path + ".js", path + ".json", path + "/index.js", path + "/index.json" ];
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if (require.modules.hasOwnProperty(path)) return path;
        }
        if (require.aliases.hasOwnProperty(index)) {
            return require.aliases[index];
        }
    };
    require.normalize = function(curr, path) {
        var segs = [];
        if ("." != path.charAt(0)) return path;
        curr = curr.split("/");
        path = path.split("/");
        for (var i = 0; i < path.length; ++i) {
            if (".." == path[i]) {
                curr.pop();
            } else if ("." != path[i] && "" != path[i]) {
                segs.push(path[i]);
            }
        }
        return curr.concat(segs).join("/");
    };
    require.register = function(path, definition) {
        require.modules[path] = definition;
    };
    require.alias = function(from, to) {
        if (!require.modules.hasOwnProperty(from)) {
            throw new Error('Failed to alias "' + from + '", it does not exist');
        }
        require.aliases[to] = from;
    };
    require.relative = function(parent) {
        var p = require.normalize(parent, "..");
        function lastIndexOf(arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) return i;
            }
            return -1;
        }
        function localRequire(path) {
            var resolved = localRequire.resolve(path);
            return require(resolved, parent, path);
        }
        localRequire.resolve = function(path) {
            var c = path.charAt(0);
            if ("/" == c) return path.slice(1);
            if ("." == c) return require.normalize(p, path);
            var segs = parent.split("/");
            var i = lastIndexOf(segs, "deps") + 1;
            if (!i) i = 0;
            path = segs.slice(0, i + 1).join("/") + "/deps/" + path;
            return path;
        };
        localRequire.exists = function(path) {
            return require.modules.hasOwnProperty(localRequire.resolve(path));
        };
        return localRequire;
    };
    require.register("component-indexof/index.js", function(exports, require, module) {
        var indexOf = [].indexOf;
        module.exports = function(arr, obj) {
            if (indexOf) return arr.indexOf(obj);
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] === obj) return i;
            }
            return -1;
        };
    });
    require.register("component-emitter/index.js", function(exports, require, module) {
        var index = require("indexof");
        module.exports = Emitter;
        function Emitter(obj) {
            if (obj) return mixin(obj);
        }
        function mixin(obj) {
            for (var key in Emitter.prototype) {
                obj[key] = Emitter.prototype[key];
            }
            return obj;
        }
        Emitter.prototype.on = function(event, fn) {
            this._callbacks = this._callbacks || {};
            (this._callbacks[event] = this._callbacks[event] || []).push(fn);
            return this;
        };
        Emitter.prototype.once = function(event, fn) {
            var self = this;
            this._callbacks = this._callbacks || {};
            function on() {
                self.off(event, on);
                fn.apply(this, arguments);
            }
            fn._off = on;
            this.on(event, on);
            return this;
        };
        Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = function(event, fn) {
            this._callbacks = this._callbacks || {};
            if (0 == arguments.length) {
                this._callbacks = {};
                return this;
            }
            var callbacks = this._callbacks[event];
            if (!callbacks) return this;
            if (1 == arguments.length) {
                delete this._callbacks[event];
                return this;
            }
            var i = index(callbacks, fn._off || fn);
            if (~i) callbacks.splice(i, 1);
            return this;
        };
        Emitter.prototype.emit = function(event) {
            this._callbacks = this._callbacks || {};
            var args = [].slice.call(arguments, 1), callbacks = this._callbacks[event];
            if (callbacks) {
                callbacks = callbacks.slice(0);
                for (var i = 0, len = callbacks.length; i < len; ++i) {
                    callbacks[i].apply(this, args);
                }
            }
            return this;
        };
        Emitter.prototype.listeners = function(event) {
            this._callbacks = this._callbacks || {};
            return this._callbacks[event] || [];
        };
        Emitter.prototype.hasListeners = function(event) {
            return !!this.listeners(event).length;
        };
    });
    require.register("RedVentures-reduce/index.js", function(exports, require, module) {
        module.exports = function(arr, fn, initial) {
            var idx = 0;
            var len = arr.length;
            var curr = arguments.length == 3 ? initial : arr[idx++];
            while (idx < len) {
                curr = fn.call(null, curr, arr[idx], ++idx, arr);
            }
            return curr;
        };
    });
    require.register("superagent/lib/client.js", function(exports, require, module) {
        var Emitter = require("emitter");
        var reduce = require("reduce");
        var root = "undefined" == typeof window ? this : window;
        function noop() {}
        function isHost(obj) {
            var str = {}.toString.call(obj);
            switch (str) {
              case "[object File]":
              case "[object Blob]":
              case "[object FormData]":
                return true;

              default:
                return false;
            }
        }
        function getXHR() {
            if (root.XMLHttpRequest && ("file:" != root.location.protocol || !root.ActiveXObject)) {
                return new XMLHttpRequest();
            } else {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                } catch (e) {}
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                } catch (e) {}
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {}
            }
            return false;
        }
        var trim = "".trim ? function(s) {
            return s.trim();
        } : function(s) {
            return s.replace(/(^\s*|\s*$)/g, "");
        };
        function isObject(obj) {
            return obj === Object(obj);
        }
        function serialize(obj) {
            if (!isObject(obj)) return obj;
            var pairs = [];
            for (var key in obj) {
                pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
            }
            return pairs.join("&");
        }
        request.serializeObject = serialize;
        function parseString(str) {
            var obj = {};
            var pairs = str.split("&");
            var parts;
            var pair;
            for (var i = 0, len = pairs.length; i < len; ++i) {
                pair = pairs[i];
                parts = pair.split("=");
                obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }
            return obj;
        }
        request.parseString = parseString;
        request.types = {
            html: "text/html",
            json: "application/json",
            urlencoded: "application/x-www-form-urlencoded",
            form: "application/x-www-form-urlencoded",
            "form-data": "application/x-www-form-urlencoded"
        };
        request.serialize = {
            "application/x-www-form-urlencoded": serialize,
            "application/json": JSON.stringify
        };
        request.parse = {
            "application/x-www-form-urlencoded": parseString,
            "application/json": JSON.parse
        };
        function parseHeader(str) {
            var lines = str.split(/\r?\n/);
            var fields = {};
            var index;
            var line;
            var field;
            var val;
            lines.pop();
            for (var i = 0, len = lines.length; i < len; ++i) {
                line = lines[i];
                index = line.indexOf(":");
                field = line.slice(0, index).toLowerCase();
                val = trim(line.slice(index + 1));
                fields[field] = val;
            }
            return fields;
        }
        function type(str) {
            return str.split(/ *; */).shift();
        }
        function params(str) {
            return reduce(str.split(/ *; */), function(obj, str) {
                var parts = str.split(/ *= */), key = parts.shift(), val = parts.shift();
                if (key && val) obj[key] = val;
                return obj;
            }, {});
        }
        function Response(xhr, options) {
            options = options || {};
            this.xhr = xhr;
            this.text = xhr.responseText;
            this.setStatusProperties(xhr.status);
            this.header = this.headers = parseHeader(xhr.getAllResponseHeaders());
            this.header["content-type"] = xhr.getResponseHeader("content-type");
            this.setHeaderProperties(this.header);
            this.body = this.parseBody(this.text);
        }
        Response.prototype.get = function(field) {
            return this.header[field.toLowerCase()];
        };
        Response.prototype.setHeaderProperties = function(header) {
            var ct = this.header["content-type"] || "";
            this.type = type(ct);
            var obj = params(ct);
            for (var key in obj) this[key] = obj[key];
        };
        Response.prototype.parseBody = function(str) {
            var parse = request.parse[this.type];
            return parse ? parse(str) : null;
        };
        Response.prototype.setStatusProperties = function(status) {
            var type = status / 100 | 0;
            this.status = status;
            this.statusType = type;
            this.info = 1 == type;
            this.ok = 2 == type;
            this.clientError = 4 == type;
            this.serverError = 5 == type;
            this.error = 4 == type || 5 == type ? this.toError() : false;
            this.accepted = 202 == status;
            this.noContent = 204 == status || 1223 == status;
            this.badRequest = 400 == status;
            this.unauthorized = 401 == status;
            this.notAcceptable = 406 == status;
            this.notFound = 404 == status;
            this.forbidden = 403 == status;
        };
        Response.prototype.toError = function() {
            var msg = "got " + this.status + " response";
            var err = new Error(msg);
            err.status = this.status;
            return err;
        };
        request.Response = Response;
        function Request(method, url) {
            var self = this;
            Emitter.call(this);
            this._query = this._query || [];
            this.method = method;
            this.url = url;
            this.header = {};
            this._header = {};
            this.set("X-Requested-With", "XMLHttpRequest");
            this.on("end", function() {
                var res = new Response(self.xhr);
                if ("HEAD" == method) res.text = null;
                self.callback(null, res);
            });
        }
        Request.prototype = new Emitter();
        Request.prototype.constructor = Request;
        Request.prototype.timeout = function(ms) {
            this._timeout = ms;
            return this;
        };
        Request.prototype.clearTimeout = function() {
            this._timeout = 0;
            clearTimeout(this._timer);
            return this;
        };
        Request.prototype.abort = function() {
            if (this.aborted) return;
            this.aborted = true;
            this.xhr.abort();
            this.clearTimeout();
            this.emit("abort");
            return this;
        };
        Request.prototype.set = function(field, val) {
            if (isObject(field)) {
                for (var key in field) {
                    this.set(key, field[key]);
                }
                return this;
            }
            this._header[field.toLowerCase()] = val;
            this.header[field] = val;
            return this;
        };
        Request.prototype.getHeader = function(field) {
            return this._header[field.toLowerCase()];
        };
        Request.prototype.type = function(type) {
            this.set("Content-Type", request.types[type] || type);
            return this;
        };
        Request.prototype.auth = function(user, pass) {
            var str = btoa(user + ":" + pass);
            this.set("Authorization", "Basic " + str);
            return this;
        };
        Request.prototype.query = function(val) {
            if ("string" != typeof val) val = serialize(val);
            if (val) this._query.push(val);
            return this;
        };
        Request.prototype.send = function(data) {
            var obj = isObject(data);
            var type = this.getHeader("Content-Type");
            if (obj && isObject(this._data)) {
                for (var key in data) {
                    this._data[key] = data[key];
                }
            } else if ("string" == typeof data) {
                if (!type) this.type("form");
                type = this.getHeader("Content-Type");
                if ("application/x-www-form-urlencoded" == type) {
                    this._data = this._data ? this._data + "&" + data : data;
                } else {
                    this._data = (this._data || "") + data;
                }
            } else {
                this._data = data;
            }
            if (!obj) return this;
            if (!type) this.type("json");
            return this;
        };
        Request.prototype.callback = function(err, res) {
            var fn = this._callback;
            if (2 == fn.length) return fn(err, res);
            if (err) return this.emit("error", err);
            fn(res);
        };
        Request.prototype.crossDomainError = function() {
            var err = new Error("Origin is not allowed by Access-Control-Allow-Origin");
            err.crossDomain = true;
            this.callback(err);
        };
        Request.prototype.timeoutError = function() {
            var timeout = this._timeout;
            var err = new Error("timeout of " + timeout + "ms exceeded");
            err.timeout = timeout;
            this.callback(err);
        };
        Request.prototype.withCredentials = function() {
            this._withCredentials = true;
            return this;
        };
        Request.prototype.end = function(fn) {
            var self = this;
            var xhr = this.xhr = getXHR();
            var query = this._query.join("&");
            var timeout = this._timeout;
            var data = this._data;
            this._callback = fn || noop;
            if (this._withCredentials) xhr.withCredentials = true;
            xhr.onreadystatechange = function() {
                if (4 != xhr.readyState) return;
                if (0 == xhr.status) {
                    if (self.aborted) return self.timeoutError();
                    return self.crossDomainError();
                }
                self.emit("end");
            };
            if (xhr.upload) {
                xhr.upload.onprogress = function(e) {
                    e.percent = e.loaded / e.total * 100;
                    self.emit("progress", e);
                };
            }
            if (timeout && !this._timer) {
                this._timer = setTimeout(function() {
                    self.abort();
                }, timeout);
            }
            if (query) {
                query = request.serializeObject(query);
                this.url += ~this.url.indexOf("?") ? "&" + query : "?" + query;
            }
            xhr.open(this.method, this.url, true);
            if ("GET" != this.method && "HEAD" != this.method && "string" != typeof data && !isHost(data)) {
                var serialize = request.serialize[this.getHeader("Content-Type")];
                if (serialize) data = serialize(data);
            }
            for (var field in this.header) {
                if (null == this.header[field]) continue;
                xhr.setRequestHeader(field, this.header[field]);
            }
            xhr.send(data);
            return this;
        };
        request.Request = Request;
        function request(method, url) {
            if ("function" == typeof url) {
                return new Request("GET", method).end(url);
            }
            if (1 == arguments.length) {
                return new Request("GET", method);
            }
            return new Request(method, url);
        }
        request.get = function(url, data, fn) {
            var req = request("GET", url);
            if ("function" == typeof data) fn = data, data = null;
            if (data) req.query(data);
            if (fn) req.end(fn);
            return req;
        };
        request.head = function(url, data, fn) {
            var req = request("HEAD", url);
            if ("function" == typeof data) fn = data, data = null;
            if (data) req.send(data);
            if (fn) req.end(fn);
            return req;
        };
        request.del = function(url, fn) {
            var req = request("DELETE", url);
            if (fn) req.end(fn);
            return req;
        };
        request.patch = function(url, data, fn) {
            var req = request("PATCH", url);
            if ("function" == typeof data) fn = data, data = null;
            if (data) req.send(data);
            if (fn) req.end(fn);
            return req;
        };
        request.post = function(url, data, fn) {
            var req = request("POST", url);
            if ("function" == typeof data) fn = data, data = null;
            if (data) req.send(data);
            if (fn) req.end(fn);
            return req;
        };
        request.put = function(url, data, fn) {
            var req = request("PUT", url);
            if ("function" == typeof data) fn = data, data = null;
            if (data) req.send(data);
            if (fn) req.end(fn);
            return req;
        };
        module.exports = request;
    });
    require.alias("component-emitter/index.js", "superagent/deps/emitter/index.js");
    require.alias("component-emitter/index.js", "emitter/index.js");
    require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");
    require.alias("RedVentures-reduce/index.js", "superagent/deps/reduce/index.js");
    require.alias("RedVentures-reduce/index.js", "reduce/index.js");
    require.alias("superagent/lib/client.js", "superagent/index.js");
    if (typeof exports == "object") {
        module.exports = require("superagent");
    } else if (typeof define == "function" && define.amd) {
        define(function() {
            return require("superagent");
        });
    } else {
        this["superagent"] = require("superagent");
    }
})();

var MessageQueue = function() {
    var RETRY_MAX = 5;
    var queue = [];
    var sending = false;
    var timer = null;
    return {
        reset: reset,
        sendAppMessage: sendAppMessage,
        size: size
    };
    function reset() {
        queue = [];
        sending = false;
    }
    function sendAppMessage(message, ack, nack) {
        if (!isValidMessage(message)) {
            return false;
        }
        queue.push({
            message: message,
            ack: ack || null,
            nack: nack || null,
            attempts: 0
        });
        setTimeout(function() {
            sendNextMessage();
        }, 1);
        return true;
    }
    function size() {
        return queue.length;
    }
    function isValidMessage(message) {
        if (message !== Object(message)) {
            return false;
        }
        var keys = Object.keys(message);
        if (!keys.length) {
            return false;
        }
        for (var k = 0; k < keys.length; k += 1) {
            var validKey = /^[0-9a-zA-Z-_]*$/.test(keys[k]);
            if (!validKey) {
                return false;
            }
            var value = message[keys[k]];
            if (!validValue(value)) {
                return false;
            }
        }
        return true;
        function validValue(value) {
            switch (typeof value) {
              case "string":
                return true;

              case "number":
                return true;

              case "object":
                if (Object.toString.call(value) === "[object Array]") {
                    return true;
                }
            }
            return false;
        }
    }
    function sendNextMessage() {
        if (sending) {
            return;
        }
        var message = queue.shift();
        if (!message) {
            return;
        }
        message.attempts += 1;
        sending = true;
        Pebble.sendAppMessage(message.message, ack, nack);
        timer = setTimeout(function() {
            timeout();
        }, 1e3);
        function ack() {
            clearTimeout(timer);
            setTimeout(function() {
                sending = false;
                sendNextMessage();
            }, 200);
            if (message.ack) {
                message.ack.apply(null, arguments);
            }
        }
        function nack() {
            clearTimeout(timer);
            if (message.attempts < RETRY_MAX) {
                queue.unshift(message);
                setTimeout(function() {
                    sending = false;
                    sendNextMessage();
                }, 200 * message.attempts);
            } else {
                if (message.nack) {
                    message.nack.apply(null, arguments);
                }
            }
        }
        function timeout() {
            setTimeout(function() {
                sending = false;
                sendNextMessage();
            }, 1e3);
            if (message.ack) {
                message.ack.apply(null, arguments);
            }
        }
    }
}();

var GColor = function() {
    return {
        fromHex: GColorFromHex,
        toName: GColorName,
        ArmyGreen: 212,
        BabyBlueEyes: 235,
        Black: 192,
        Blue: 195,
        BlueMoon: 199,
        Brass: 233,
        BrightGreen: 220,
        BrilliantRose: 246,
        BulgarianRose: 208,
        CadetBlue: 218,
        Celeste: 239,
        ChromeYellow: 248,
        CobaltBlue: 198,
        Cyan: 207,
        DarkCandyAppleRed: 224,
        DarkGray: 213,
        DarkGreen: 196,
        DukeBlue: 194,
        ElectricBlue: 223,
        ElectricUltramarine: 211,
        FashionMagenta: 242,
        Folly: 241,
        Green: 204,
        Icterine: 253,
        ImperialPurple: 209,
        Inchworm: 237,
        Indigo: 210,
        IslamicGreen: 200,
        JaegerGreen: 201,
        JazzberryJam: 225,
        KellyGreen: 216,
        LavenderIndigo: 231,
        Liberty: 214,
        LightGray: 234,
        Limerick: 232,
        Magenta: 243,
        Malachite: 205,
        MayGreen: 217,
        MediumAquamarine: 222,
        MediumSpringGreen: 206,
        Melon: 250,
        MidnightGreen: 197,
        MintGreen: 238,
        Orange: 244,
        OxfordBlue: 193,
        PastelYellow: 254,
        PictonBlue: 219,
        Purple: 226,
        Purpureus: 230,
        Rajah: 249,
        Red: 240,
        RichBrilliantLavender: 251,
        RoseVale: 229,
        ScreaminGreen: 221,
        ShockingPink: 247,
        SpringBud: 236,
        SunsetOrange: 245,
        TiffanyBlue: 202,
        VeryLightBlue: 215,
        VividCerulean: 203,
        VividViolet: 227,
        White: 255,
        WindsorTan: 228,
        Yellow: 252
    };
    function GColorFromHex(hex) {
        var hexNum = parseInt(hex, 16);
        var a = 192;
        var r = (hexNum >> 16 & 255) >> 6 << 4;
        var g = (hexNum >> 8 & 255) >> 6 << 2;
        var b = (hexNum >> 0 & 255) >> 6 << 0;
        return a + r + g + b;
    }
    function GColorName(color) {
        var names = Object.keys(GColor);
        for (var n = 0; n < names.length; n += 1) {
            if (GColor[names[n]] == color) {
                return names[n];
            }
        }
        return null;
    }
}();

"use strict";

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.store = factory();
    }
})(this, function() {
    var store = {}, win = window, doc = win.document, localStorageName = "localStorage", scriptTag = "script", storage;
    store.disabled = false;
    store.version = "1.3.17";
    store.set = function(key, value) {};
    store.get = function(key, defaultVal) {};
    store.has = function(key) {
        return store.get(key) !== undefined;
    };
    store.remove = function(key) {};
    store.clear = function() {};
    store.transact = function(key, defaultVal, transactionFn) {
        if (transactionFn == null) {
            transactionFn = defaultVal;
            defaultVal = null;
        }
        if (defaultVal == null) {
            defaultVal = {};
        }
        var val = store.get(key, defaultVal);
        transactionFn(val);
        store.set(key, val);
    };
    store.getAll = function() {};
    store.forEach = function() {};
    store.serialize = function(value) {
        return JSON.stringify(value);
    };
    store.deserialize = function(value) {
        if (typeof value != "string") {
            return undefined;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value || undefined;
        }
    };
    function isLocalStorageNameSupported() {
        try {
            return localStorageName in win && win[localStorageName];
        } catch (err) {
            return false;
        }
    }
    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.set = function(key, val) {
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setItem(key, store.serialize(val));
            return val;
        };
        store.get = function(key, defaultVal) {
            var val = store.deserialize(storage.getItem(key));
            return val === undefined ? defaultVal : val;
        };
        store.remove = function(key) {
            storage.removeItem(key);
        };
        store.clear = function() {
            storage.clear();
        };
        store.getAll = function() {
            var ret = {};
            store.forEach(function(key, val) {
                ret[key] = val;
            });
            return ret;
        };
        store.forEach = function(callback) {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                callback(key, store.get(key));
            }
        };
    } else if (doc.documentElement.addBehavior) {
        var storageOwner, storageContainer;
        try {
            storageContainer = new ActiveXObject("htmlfile");
            storageContainer.open();
            storageContainer.write("<" + scriptTag + ">document.w=window</" + scriptTag + '><iframe src="/favicon.ico"></iframe>');
            storageContainer.close();
            storageOwner = storageContainer.w.frames[0].document;
            storage = storageOwner.createElement("div");
        } catch (e) {
            storage = doc.createElement("div");
            storageOwner = doc.body;
        }
        var withIEStorage = function(storeFunction) {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(storage);
                storageOwner.appendChild(storage);
                storage.addBehavior("#default#userData");
                storage.load(localStorageName);
                var result = storeFunction.apply(store, args);
                storageOwner.removeChild(storage);
                return result;
            };
        };
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
        var ieKeyFix = function(key) {
            return key.replace(/^d/, "___$&").replace(forbiddenCharsRegex, "___");
        };
        store.set = withIEStorage(function(storage, key, val) {
            key = ieKeyFix(key);
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setAttribute(key, store.serialize(val));
            storage.save(localStorageName);
            return val;
        });
        store.get = withIEStorage(function(storage, key, defaultVal) {
            key = ieKeyFix(key);
            var val = store.deserialize(storage.getAttribute(key));
            return val === undefined ? defaultVal : val;
        });
        store.remove = withIEStorage(function(storage, key) {
            key = ieKeyFix(key);
            storage.removeAttribute(key);
            storage.save(localStorageName);
        });
        store.clear = withIEStorage(function(storage) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            storage.load(localStorageName);
            while (attributes.length) {
                storage.removeAttribute(attributes[0].name);
            }
            storage.save(localStorageName);
        });
        store.getAll = function(storage) {
            var ret = {};
            store.forEach(function(key, val) {
                ret[key] = val;
            });
            return ret;
        };
        store.forEach = withIEStorage(function(storage, callback) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            for (var i = 0, attr; attr = attributes[i]; ++i) {
                callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
            }
        });
    }
    try {
        var testKey = "__storejs__";
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) {
            store.disabled = true;
        }
        store.remove(testKey);
    } catch (e) {
        store.disabled = true;
    }
    store.enabled = !store.disabled;
    return store;
});

(function(window) {
    var re = {
        not_string: /[^s]/,
        number: /[dief]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fijosuxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    };
    function sprintf() {
        var key = arguments[0], cache = sprintf.cache;
        if (!(cache[key] && cache.hasOwnProperty(key))) {
            cache[key] = sprintf.parse(key);
        }
        return sprintf.format.call(null, cache[key], arguments);
    }
    sprintf.format = function(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = "";
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if (node_type === "string") {
                output[output.length] = parse_tree[i];
            } else if (node_type === "array") {
                match = parse_tree[i];
                if (match[2]) {
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                } else if (match[1]) {
                    arg = argv[match[1]];
                } else {
                    arg = argv[cursor++];
                }
                if (get_type(arg) == "function") {
                    arg = arg();
                }
                if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && get_type(arg) != "number" && isNaN(arg)) {
                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)));
                }
                if (re.number.test(match[8])) {
                    is_positive = arg >= 0;
                }
                switch (match[8]) {
                  case "b":
                    arg = arg.toString(2);
                    break;

                  case "c":
                    arg = String.fromCharCode(arg);
                    break;

                  case "d":
                  case "i":
                    arg = parseInt(arg, 10);
                    break;

                  case "j":
                    arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0);
                    break;

                  case "e":
                    arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                    break;

                  case "f":
                    arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                    break;

                  case "o":
                    arg = arg.toString(8);
                    break;

                  case "s":
                    arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;
                    break;

                  case "u":
                    arg = arg >>> 0;
                    break;

                  case "x":
                    arg = arg.toString(16);
                    break;

                  case "X":
                    arg = arg.toString(16).toUpperCase();
                    break;
                }
                if (re.json.test(match[8])) {
                    output[output.length] = arg;
                } else {
                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
                        sign = is_positive ? "+" : "-";
                        arg = arg.toString().replace(re.sign, "");
                    } else {
                        sign = "";
                    }
                    pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " ";
                    pad_length = match[6] - (sign + arg).length;
                    pad = match[6] ? pad_length > 0 ? str_repeat(pad_character, pad_length) : "" : "";
                    output[output.length] = match[5] ? sign + arg + pad : pad_character === "0" ? sign + pad + arg : pad + sign + arg;
                }
            }
        }
        return output.join("");
    };
    sprintf.cache = {};
    sprintf.parse = function(fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = match[0];
            } else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = "%";
            } else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list[field_list.length] = field_match[1];
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1];
                            } else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1];
                            } else {
                                throw new SyntaxError("[sprintf] failed to parse named argument key");
                            }
                        }
                    } else {
                        throw new SyntaxError("[sprintf] failed to parse named argument key");
                    }
                    match[2] = field_list;
                } else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
                }
                parse_tree[parse_tree.length] = match;
            } else {
                throw new SyntaxError("[sprintf] unexpected placeholder");
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return parse_tree;
    };
    var vsprintf = function(fmt, argv, _argv) {
        _argv = (argv || []).slice(0);
        _argv.splice(0, 0, fmt);
        return sprintf.apply(null, _argv);
    };
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }
    function str_repeat(input, multiplier) {
        return Array(multiplier + 1).join(input);
    }
    if (typeof exports !== "undefined") {
        exports.sprintf = sprintf;
        exports.vsprintf = vsprintf;
    } else {
        window.sprintf = sprintf;
        window.vsprintf = vsprintf;
        if (typeof define === "function" && define.amd) {
            define(function() {
                return {
                    sprintf: sprintf,
                    vsprintf: vsprintf
                };
            });
        }
    }
})(typeof window === "undefined" ? this : window);

var AppInfo = {
    uuid: "bcdef00a-b309-485d-b82f-341307693c73",
    shortName: "Hearts",
    longName: "Hearts",
    companyName: "Matthew Tole",
    targetPlatforms: [ "aplite", "basalt" ],
    sdkVersion: "3",
    versionCode: 2,
    versionLabel: "4.0",
    watchapp: {
        watchface: false
    },
    appKeys: {
        group: 0,
        operation: 1,
        data: 2
    },
    capabilities: [ "configurable" ],
    resources: {
        media: [ {
            type: "png",
            name: "ICON_PHONE",
            file: "images/phone.png"
        }, {
            type: "png",
            name: "ICON_REFRESH",
            file: "images/refresh.png"
        } ]
    },
    settings: {
        configUrl: "http://192.168.0.7:8080/?version=%s",
        apiUrl: "'http://pblweb.com/api/v1/store/developers/%s.json"
    }
};

if (!window.location) {
    window.location = "";
}

Pebble.addEventListener("ready", function() {
    var msg = {
        group: "BOOT",
        operation: "BOOT",
        data: "BOOT"
    };
    Pebble.sendAppMessage(msg, function() {
        boot();
    }, function() {
        console.log("Boot message failed!");
    });
});

Pebble.addEventListener("appmessage", function(event) {
    console.log(JSON.stringify(event.data));
});

Pebble.addEventListener("showConfiguration", function() {
    Pebble.openURL(sprintf(AppInfo.settings.configUrl, AppInfo.versionLabel));
});

Pebble.addEventListener("webviewclosed", function(event) {
    store.set("developerId", event.response);
    sendIsConfigured();
    updateHearts(store.get("developerId"), sendHearts);
});

function boot() {
    if (store.get("developerId")) {
        sendIsConfigured();
        updateHearts(store.get("developerId"), sendHearts);
        return;
    }
}

function sendIsConfigured() {
    var msg = {
        group: "SETUP",
        operation: "SETUP",
        data: "SETUP"
    };
    Pebble.sendAppMessage(msg, function() {}, function() {});
}

function sendHearts(err, data) {
    if (err) {
        return console.log(err);
    }
    Pebble.sendAppMessage({
        group: "HEARTS",
        operation: "UPDATE",
        data: data.join("^")
    }, function() {}, function() {});
}

function updateHearts(developerId, callback) {
    var url = sprintf(AppInfo.config.apiUrl, developerId);
    superagent(url, function(err, res) {
        if (err) {
            return callback(err);
        }
        var dataArray = [ res.body.length ];
        res.body.sort(function(app1, app2) {
            if (app1.hearts > app2.hearts) {
                return -1;
            } else if (app1.hearts < app2.hearts) {
                return 1;
            }
            return app1.title < app2.title ? -1 : 1;
        });
        res.body.forEach(function(app) {
            dataArray.push(app.title);
            dataArray.push(app.hearts);
        });
        callback(null, dataArray);
    });
}