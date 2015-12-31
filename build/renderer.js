!function(global) {
    "use strict";
    function toArray(target) {
        return Array.prototype.slice.apply(target);
    }
    function isUndefined(target) {
        return "undefined" == typeof target;
    }
    function isBoolean(target) {
        return "boolean" == typeof target;
    }
    function isDefined(target) {
        return isUndefined(target) === !1;
    }
    function inherit(parent, extra) {
        return extend(Object.create(parent), extra);
    }
    function join(collection, string) {
        return Array.prototype.join.call(collection, string);
    }
    function createError() {
        var i, ii, value, vars = toArray(arguments), text = [], message = vars.shift(), addCharacter = 1;
        for (i = 0, ii = message.length; ii > i; i++) value = message[i], value == START_SYMBOL ? (-1 === message.substring(i).indexOf(END_SYMBOL) && throwError("Unclosed bracket at column " + i), 
        0 === addCharacter && throwError("Expecting " + END_SYMBOL + " but go " + value + " at column " + i), 
        addCharacter = 0) : value == END_SYMBOL ? addCharacter = 1 : 1 == addCharacter ? text.push(value) : text.push(vars.length > 0 ? vars.shift() : EMPTY);
        return new Error(text.join(EMPTY));
    }
    function throwError() {
        throw createError.apply(this, arguments);
    }
    function isEqual(o1, o2) {
        var keys, length, t1 = typeof o1, t2 = typeof o2;
        if (o1 === o2) return !0;
        if (null === o1 || null === o2) return !1;
        if (t1 !== t2) return !1;
        if (isNumber(o1)) {
            if (o1 != o2) return !1;
        } else if (isString(o1)) {
            if (o1.length != o2.length || o1 != o2) return !1;
        } else if (isArray(o1)) {
            if (o1.length != o2.length) return !1;
            for (length = o1.length; length--; ) if (!isEqual(o1[length], o2[length])) return !1;
        } else if (isObject(o1)) for (keys = Object.keys(o1), length = keys.length; length--; ) if (!isEqual(o1[keys[length]], o2[keys[length]])) return !1;
        return !0;
    }
    function sum(array, fn) {
        return array.reduce(fn || function(previousValue, currentValue) {
            return previousValue + currentValue;
        });
    }
    function first(array) {
        return array[0];
    }
    function copy(destination, source, stack) {
        if (isObject(source)) {
            var i, key, value, keys = Object.keys(source), ii = keys.length;
            for (stack = stack || [], i = 0; ii > i; i++) key = keys[i], value = source[key], 
            stack.push(value), isObject(value) && -1 === stack.indexOf(value) && (value = copy(isArray(value) ? [] : {}, value, stack)), 
            destination[key] = value;
            return destination;
        }
        return source;
    }
    function clone(object) {
        return copy(isArray(object) ? [] : {}, object);
    }
    function values(object) {
        var i, keys = Object.keys(object), ii = keys.length, values_ = [];
        for (i = 0; ii > i; i++) values_[i] = object[keys[i]];
        return values_;
    }
    function get(object, path) {
        var i, keys = path.split("."), ii = keys.length, result = object;
        for (i = 0; ii > i; i++) result && (result = result[keys[i]]);
        return result;
    }
    function noop() {}
    function isObject(value) {
        return null !== value && "object" == typeof value;
    }
    function isString(value) {
        return "string" == typeof value;
    }
    function isFunction(value) {
        return "function" == typeof value;
    }
    function isNumber(value) {
        return "number" == typeof value;
    }
    function extend(target) {
        target || (target = {});
        var source, value, keys, key, jj, i, j, sources = toArray(arguments).slice(1).filter(isDefined), ii = sources.length;
        for (i = 0; ii > i; i++) if ((source = sources[i]) && isObject(source)) for (keys = Object.keys(source), 
        jj = keys.length, j = 0; jj > j; j++) key = keys[j], value = source[key], target[key] = value;
        return target;
    }
    function defaults(object, source) {
        var i, key, value, keys = Object.keys(source), ii = keys.length;
        for (i = 0; ii > i; i++) key = keys[i], value = source[key], object.hasOwnProperty(key) || (object[key] = value);
    }
    function forEach(array, iterator, context) {
        var length;
        if (isArray(array)) for (i = 0, length = array.length; length > i; i++) iterator.call(context, array[i], i, array); else {
            var i, key, value, keys = Object.keys(array), ii = keys.length;
            for (i = 0; ii > i; i++) key = keys[i], value = array[key], iterator.call(context, value, key, array);
        }
        return array;
    }
    function map(array, iterator, context) {
        var i, cloned = isArray(array) ? [] : {};
        if (isArray(array)) for (i = 0; i < array.length; i++) cloned[i] = iterator.call(context, array[i], i, array); else if (isObject(array)) {
            var keys = Object.keys(array);
            for (i = 0; i < keys.length; i++) cloned[keys[i]] = iterator.call(context, array[keys[i]], keys[i], array);
        }
        return cloned;
    }
    function camelCase(str) {
        return (str = str.replace(/[^A-z]/g, " ")) && lowercase(str).replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            return 0 === +match ? "" : 0 === index ? match.toLowerCase() : match.toUpperCase();
        });
    }
    function kebabCase(str) {
        return lowercase(str.replace(/[A-Z]/g, "-$&"));
    }
    function toString(value) {
        if ("string" == typeof value) return value;
        var result = null === value ? "" : value + "";
        return "0" == result && 1 / value == -INFINITY ? "-0" : result;
    }
    function lowercase(str) {
        return (isString(str) ? str : toString(str)).toLowerCase();
    }
    function lazy(callback, context) {
        return function() {
            return bind(callback, context);
        };
    }
    function bind(callback, context) {
        return function() {
            return callback.apply(context, arguments);
        };
    }
    function inherits(ctor, superCtor, attrs, ctorAttrs) {
        if (void 0 === ctor || null === ctor) throw new TypeError('The constructor to "inherits" must not be null or undefined');
        if (void 0 === superCtor || null === superCtor) throw new TypeError('The super constructor to "inherits" must not be null or undefined');
        if (void 0 === superCtor.prototype) throw new TypeError('The super constructor to "inherits" must have a prototype');
        ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype), attrs && extend(ctor.prototype, attrs), 
        ctorAttrs && extend(ctor, ctorAttrs);
    }
    function nextId() {
        return ++id;
    }
    function elementData(node, key, value) {
        node.hasOwnProperty(cacheKey) || (node[cacheKey] = nextId(), elCache[node[cacheKey]] = {});
        var cache = elCache[node[cacheKey]];
        return key ? !value && cache.hasOwnProperty(key) ? cache[key] : (value && (cache[key] = value), 
        null) : cache;
    }
    function elementInheritedData(element, name, value) {
        element.nodeType == Node.DOCUMENT_NODE && (element = element.documentElement);
        for (var names = isArray(name) ? name : [ name ]; element; ) {
            for (var i = 0, ii = names.length; ii > i; i++) if (value = elementData(element, names[i])) return value;
            element = element.parentNode || element.nodeType === Node.DOCUMENT_FRAGMENT_NODE && element.host;
        }
    }
    function registerDirective(name, factory, registry) {
        registry.hasOwnProperty(name) || (registry[name] = {
            directives: [],
            executed: !1,
            load: function() {
                var data, options, directive, directives = this.directives, instances = [];
                return forEach(directives, function(factory, index) {
                    data = renderer.invokeFactory(factory), options = {}, isFunction(data) ? options.compile = lazy(data) : !data.compile && data.link ? options.compile = lazy(data.link) : data.compile || data.link || (data.compile = noop), 
                    isObject(data) && extend(options, data), defaults(options, {
                        priority: 0,
                        index: index,
                        name: name,
                        restrict: "EA"
                    }), defaults(options, {
                        require: options.controller && options.name
                    }), directive = new Directive(name, options), instances.push(directive);
                }), instances;
            }
        }), registry[name].directives.push(factory);
    }
    function getFromRegistry(name, registry) {
        if (registry = registry, name = name || "", !registry.hasOwnProperty(name)) return null;
        var loader = registry[name];
        return loader.executed || extend(loader, {
            load: loader.load(),
            executed: !0
        }), loader.load;
    }
    function EventEmitter() {
        this._events = {};
    }
    function Watcher() {
        EventEmitter.call(this), this.observer = new Observer(this);
    }
    function Scope(parent) {
        Watcher.call(this), parent && (this.parentScope = parent), this.childScopes = [], 
        this.topLevelScope = Scope.getTopLevelScope(this), this.postDigestQueue = [];
    }
    function Compile(node, registry, options) {
        this.node = node, this.options = options || {}, this.registry = registry, this.prepare();
    }
    function Scanner(node, registry, maxPriority) {
        this.node = node, this.registry = registry, this.attributes = new Attributes(this.node), 
        this.directives = [], this.maxPriority = maxPriority;
    }
    function AST(lexer) {
        this.current = null, this.lexer = lexer;
    }
    function isAssignable(ast) {
        return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
    }
    function ifDefined(v, d) {
        return "undefined" != typeof v ? v : d;
    }
    function ASTCompiler(astBuilder) {
        this.grammar = new Grammar("fn"), this.astBuilder = astBuilder;
    }
    function ASTFinder(astBuilder) {
        this.astBuilder = astBuilder, this.id = 0;
    }
    function Attributes(node) {
        this.$$node = node, this.$$observers = {};
    }
    function CompositeLink(nodeList, registry, options) {
        this.options = options, this.nodeList = nodeList, this.registry = registry;
        var i, scanner, nodeLink, childLink, hasChildNodes, attributes, nodeLinks = [], directives = [];
        for (i = 0; i < nodeList.length; i++) scanner = new Scanner(nodeList[i], this.registry, 0 === i ? this.options.maxPriority : void 0), 
        directives = scanner.scan(), attributes = scanner.attributes, nodeLink = new NodeLink(nodeList[i], directives, attributes), 
        nodeLink.prepare(registry), hasChildNodes = nodeList[i].childNodes && nodeList[i].childNodes.length > 0 && nodeList[i].childNodes || 0, 
        childLink = new Compile(hasChildNodes ? nodeList[i].childNodes : [], this.registry, this.options), 
        nodeLinks.push(nodeLink, childLink);
        this.nodeLinks = nodeLinks;
    }
    function Directive(name, options) {
        name && (this.name = name), isObject(options) && extend(this, options);
    }
    function Grammar(fn) {
        this.state = {}, this.nextId_ = 0, this.current_ = fn || "fn", this.setCurrent(this.current_);
    }
    function Interpolate(text, startSymbol, endSymbol) {
        this.text = text, this.exps = [], this.index = 0, this.parseFns = [], this.endSymbol = endSymbol || Interpolate.endSymbol, 
        this.startSymbol = startSymbol || Interpolate.startSymbol, text = this.text, endSymbol = this.endSymbol, 
        startSymbol = this.startSymbol;
        for (var exp, endIndex, startIndex, index = this.index, concat = [], endSymbolLength = endSymbol.length, startSymbolLength = startSymbol.length, expressionPositions = []; index < text.length; ) {
            if (!((startIndex = text.indexOf(startSymbol, index)) > -1 && (endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) > -1)) {
                index !== text.length && concat.push(text.substring(index));
                break;
            }
            index !== startIndex && concat.push(text.substring(index, startIndex)), exp = text.substring(startIndex + startSymbolLength, endIndex).trim(), 
            this.exps.push(exp), this.parseFns.push(this.parse(exp)), expressionPositions.push(concat.length), 
            concat.push(""), index = endIndex + endSymbolLength;
        }
        this.concat = concat, this.expressionPositions = expressionPositions;
    }
    function Lexer() {}
    function NodeGroup(nodeList) {
        this.nodeList = isArray(nodeList) ? nodeList : [], Object.defineProperty(this, "classList", {
            value: {
                add: bind(this._classList.add, this),
                remove: bind(this._classList.remove, this),
                contains: bind(this._classList.contains, this)
            }
        });
    }
    function NodeLink(node, directives, attributes, context) {
        this.node = node, this.links = {
            post: [],
            pre: []
        }, this.scope = null, this.context = context || {}, this.attributes = attributes, 
        this.directives = directives || [], this.transclude = null, this.terminalPriority = -Number.MAX_VALUE, 
        this.node.nodeType === Node.TEXT_NODE && this.directives.push({
            compile: function(node) {
                return function(scope, node) {
                    var interpolate = new Interpolate(node.nodeValue);
                    scope.watchGroup(interpolate.exps, function() {
                        node.nodeValue = interpolate.compile(scope);
                    });
                };
            }
        });
    }
    function Observer(object) {
        this.object = object, this.watchers = {};
    }
    function Parser(lexer) {
        this.lexer = lexer, this.ast = new AST(this.lexer), this.astCompiler = new ASTCompiler(this.ast);
    }
    function Transclude(node, options) {
        this.node = node, isObject(options) && extend(this, options), this.compileOptions = {}, 
        isNumber(this.terminalPriority) && (this.compileOptions.maxPriority = this.terminalPriority);
        var i;
        if ("element" == this.type) {
            var name = this.directive.name, attrs = this.attributes, parent = this.node.parentNode, comment = document.createComment(" " + name + ": " + attrs[name] + " ");
            this.clone || (this.clone = this.node.cloneNode(1)), parent && parent.replaceChild(comment, this.node), 
            this.comment = comment;
        } else {
            var fragment = document.createDocumentFragment(), childNodes = [];
            for (i = 0; i < this.node.childNodes.length; i++) childNodes[i] = this.node.childNodes[i];
            for (i = 0; i < childNodes.length; i++) fragment.appendChild(childNodes[i]);
            this.clone = fragment;
        }
        if (isObject(this.type)) {
            var key, optional, slotName, keys = Object.keys(this.type), slots = {}, slotNames = {}, filledSlots = {};
            for (i = 0; i < keys.length; i++) key = keys[i], slotName = this.type[key], optional = "?" === slotName.charAt(0), 
            slotName = optional ? slotName.substring(1) : slotName, slotNames[key] = slotName, 
            slots[slotName] = document.createDocumentFragment(), filledSlots[slotName] = optional;
            for (i = 0; i < this.clone.childNodes.length; i++) slotName = slotNames[camelCase(this.clone.childNodes[i].nodeName)], 
            slotName && (filledSlots[slotName] = !0, slots[slotName].appendChild(this.clone.childNodes[i].cloneNode(1)));
            this.slots = slots;
        }
    }
    var isArray = Array.isArray, EMPTY = "", START_SYMBOL = "{", END_SYMBOL = "}", id = 0, global = window, renderer = {}, directiveRegistry = {
        $$get: function(name) {
            return getFromRegistry(name, directiveRegistry);
        }
    };
    renderer.invokeFactory = function(factory) {
        return factory.call(null);
    }, renderer.clearRegistry = function() {
        return forEach(directiveRegistry, function(value, name) {
            "$$get" !== name && delete directiveRegistry[name];
        }), this;
    }, renderer.hasDirective = function(name) {
        return directiveRegistry.hasOwnProperty(name);
    }, renderer.getDirectives = directiveRegistry.$$get, renderer.register = function(name, factory) {
        return registerDirective(name, factory, directiveRegistry);
    };
    var expsCache = {};
    renderer.parse = function(exp, cache) {
        if (expsCache.hasOwnProperty(exp) && cache !== !1) return expsCache[exp];
        var parser = new Parser(new Lexer());
        return expsCache[exp] = parser.parse(exp);
    };
    var templateCache = {};
    renderer.templateCache = function(path, value) {
        if (isString(path)) {
            if (!value) return templateCache[path];
            templateCache[path] = value;
        }
        return null;
    }, renderer.compile = function(node) {
        var compile = new Compile(node, directiveRegistry);
        return function(scope) {
            return compile.execute(scope);
        };
    };
    var instances = [], onDestroyQueue = [], beforeCompileQueue = [], afterCompileQueue = [];
    extend(renderer, {
        Scope: Scope,
        Compile: Compile,
        instances: instances,
        _registry: directiveRegistry,
        onDestroyQueue: onDestroyQueue,
        beforeCompileQueue: beforeCompileQueue,
        afterCompileQueue: afterCompileQueue,
        beforeCompile: function(fn) {
            return beforeCompileQueue.unshift(fn), renderer;
        },
        afterCompile: function(fn) {
            return afterCompileQueue.unshift(fn), renderer;
        },
        onDestroyRunningApp: function(fn) {
            return onDestroyQueue.unshift(fn), renderer;
        },
        bootstrap: function(element) {
            var i, args = [], instance = {}, rootElement = element, rootScope = new renderer.Scope(), bootstrapArgs = toArray(arguments);
            for (args.push(rootScope), i = 0; i < bootstrapArgs.length; i++) args.push(bootstrapArgs[i]);
            for (i = beforeCompileQueue.length - 1; i >= 0; i--) beforeCompileQueue[i].apply(instance, args);
            rootElement instanceof Node == !0 ? instance.clonedElement = rootElement.cloneNode(1) : isObject(rootElement) && (instance.clonedElement = clone(rootElement));
            var destroyQueue = [];
            for (extend(instance, {
                link: renderer.compile(rootElement),
                rootScope: rootScope,
                rootElement: rootElement,
                onDestroy: function(fn) {
                    return destroyQueue.unshift(fn), instance;
                },
                destroy: function() {
                    var j;
                    for (j = onDestroyQueue.length - 1; j >= 0; j--) onDestroyQueue[j](instance);
                    for (j = destroyQueue.length - 1; j >= 0; j--) destroyQueue[j]();
                }
            }), instance.link(rootScope), i = afterCompileQueue.length - 1; i >= 0; i--) afterCompileQueue[i].apply(instance, args);
            return instances.push(instance), instance;
        }
    }), renderer.onDestroyRunningApp(function(instance) {
        var i = instances.indexOf(instance);
        i > -1 && instances.splice(i, 1);
    }), global.renderer = renderer, renderer.prototype = {
        __elementCache: {},
        __cacheKey: "$$$rt339"
    };
    var elCache = renderer.prototype.__elementCache, cacheKey = renderer.prototype.__cacheKey;
    EventEmitter.prototype = {
        on: function(name, listener) {
            return this._events.hasOwnProperty(name) || (this._events[name] = []), this._events[name].push(listener), 
            this;
        },
        off: function(name, listener) {
            var i, listeners = this._events[name];
            for (i = 0; i < listeners.length; i++) listeners[i] == listener && listeners.splice(i, 1);
            return this;
        },
        emit: function(name) {
            var i, listeners, args = toArray(arguments).slice(1);
            if (this._events.hasOwnProperty(name)) for (listeners = this._events[name], i = 0; i < listeners.length; i++) listeners[i].apply(this, args);
            return listeners && listeners.length > 0 ? !0 : !1;
        },
        removeAllListeners: function() {
            var i, j, jj, events, eventName, eventNames = Object.keys(this._events), ii = eventNames.length;
            for (i = 0; ii > i; i++) for (eventName = eventNames[i], events = this._events[eventName], 
            jj = events.length, j = 0; jj > j; j++) events.splice(j, 1);
        }
    }, inherits(Watcher, EventEmitter, {
        deliverChangeRecords: function() {
            this.observer.deliverChangeRecords();
        },
        watch: function(exp, listener) {
            var firstListener = !1;
            this.observer.watchers.hasOwnProperty(exp) || (firstListener = !0), this.observer.watch(exp, bind(listener, this)), 
            firstListener && this.observer.fire(exp);
        },
        watchGroup: function(exps, listener) {
            var watcher = this;
            forEach(exps, function(exp) {
                watcher.watch(exp, listener);
            });
        }
    });
    var EMPTY = "", digest = function(scope) {
        scope.deliver();
        for (var i = scope.childScopes.length - 1; i >= 0; i--) digest(scope.childScopes[i]);
    }, deliver = function(scope) {
        return Watcher.prototype.deliverChangeRecords.call(scope);
    };
    inherits(Scope, Watcher, {
        watch: function(exp, listener) {
            if (Scope.isComplexExpression(exp)) {
                var oldValue, finder = Scope.extractExpressions(exp), identifiers = finder.identifiers, exps = finder.allExps.map(function(exp) {
                    return exp.join(".");
                });
                return this.watchGroup(exps.concat(identifiers), function() {
                    var value = this.eval(exp);
                    listener.call(this, value, oldValue), oldValue = clone(value);
                });
            }
            return Watcher.prototype.watch.call(this, exp, listener);
        },
        eval: function(exp) {
            return isFunction(exp) ? exp(this) : isUndefined(exp) ? exp : renderer.parse(exp)(this);
        },
        clone: function(isolate, parent) {
            var child;
            parent = parent || this, isolate ? child = new Scope(parent) : (this.ChildScopeClass || (this.ChildScopeClass = Scope.createChildScopeClass(this)), 
            child = new this.ChildScopeClass());
            var childScopeIndex = this.childScopes.length;
            return this.childScopes[childScopeIndex] = child, child.on("destroy", function() {
                this.parentScope.childScopes.splice(childScopeIndex, 1);
            }), child;
        },
        broadcast: function(name, fn) {
            this.parentScope && this.parentScope.broadcast(name, fn), this.emit(name, fn);
        },
        postDigest: function(fn) {
            return this.postDigestQueue.push(fn), this;
        },
        throwError: function() {
            throw createError.apply(this, arguments);
        },
        deliver: function() {
            try {
                return deliver(this);
            } finally {
                for (;this.postDigestQueue.length; ) try {
                    this.postDigestQueue.shift()();
                } catch (e) {
                    Scope.handleError(e);
                }
            }
        },
        deliverChangeRecords: function() {
            for (var parent = this.parentScope; parent; ) parent.deliver(), parent = parent.parentScope;
            this.deliver();
            for (var childScopes = this.childScopes, i = childScopes.length - 1; i >= 0; i--) digest(childScopes[i]);
            return this;
        },
        apply: function(fn) {
            var topLevelScope = this.topLevelScope;
            try {
                Scope.beginPhase(topLevelScope, "apply");
                try {
                    return this.eval(fn);
                } finally {
                    Scope.clearPhase(topLevelScope);
                }
            } catch (e) {
                throw e;
            } finally {
                try {
                    this.deliverChangeRecords();
                } catch (e) {
                    throw e;
                }
            }
            return this;
        },
        destroy: function() {
            this.emit("destroy");
        }
    }, {
        extractExpressions: function(exps) {
            var lexer = new Lexer(), astBuilder = new AST(lexer), astFinder = new ASTFinder(astBuilder);
            return astFinder.find(exps) && astFinder;
        },
        isComplexExpression: function(exp) {
            var i, token, tokens = this.complexTokens.split(EMPTY);
            for (i = tokens.length - 1; i >= 0; i--) if (token = tokens[i], exp.indexOf(token) > -1) return !0;
            return !1;
        },
        handleError: function(e) {
            throw e;
        },
        createChildScopeClass: function(parent) {
            function ChildScope() {
                Scope.call(this, parent);
            }
            return ChildScope.prototype = parent, ChildScope;
        },
        beginPhase: function(scope, phase) {
            scope.phase ? this.throwError("{0} already in progress", scope.phase) : scope.phase = phase;
        },
        clearPhase: function(scope) {
            scope.phase = null;
        },
        getTopLevelScope: function(scope) {
            for (var topLevelScope = scope; topLevelScope && topLevelScope.parentScope; ) topLevelScope = topLevelScope.parentScope;
            return topLevelScope;
        },
        complexTokens: "[]()&!`/*+-="
    }), Compile.prototype = {
        prepare: function() {
            if (this.node instanceof DocumentFragment == !0 && (this.node = this.node.childNodes), 
            (this.node instanceof NodeList == !0 || isArray(this.node) === !0) && this.node.length > 0) this.compositeLink = new CompositeLink(this.node, this.registry, this.options); else if (this.node instanceof Node == !0) {
                var scanner = new Scanner(this.node, this.registry, this.options.maxPriority), directives = scanner.scan(), attributes = scanner.attributes;
                this.compositeLink = new NodeLink(this.node, directives, attributes), this.compositeLink.prepare(this.registry), 
                this.childLink = new Compile(this.node.childNodes, this.registry, extend(clone(this.options), {
                    maxPriority: void 0
                }));
            }
        },
        execute: function(scope, transcludeFn) {
            if (this.node instanceof Node == !0) if (this._node) {
                var parent = this.node.parentNode;
                parent && this.node.replaceChild(this._node, this.node), this.node = this._node, 
                this.prepare(), this._node = this._node.cloneNode(1);
            } else this._node = this.node.cloneNode(1);
            this.compositeLink ? this.compositeLink.execute(scope, this.childLink, transcludeFn) : this.childLink && this.childLink.execute(scope, transcludeFn);
        }
    }, Scanner.prototype = {
        isMultiElement: function(name) {
            var ii, directive, directives, i = 0;
            if (directives = this.registry.$$get(name)) for (ii = directives.length; ii > i; i++) if (directive = directives[i], 
            directive.multiElement) return !0;
            return !1;
        },
        scan: function() {
            this.directives.length && (this.directives = []);
            var i, j, jj, classes, attrStartName, attrEndName, MULTI_ELEMENT_DIR_RE = /^(.+)Start$/, node = this.node, attributes = node.attributes, ii = attributes && attributes.length || 0, name = this.normalize(node.nodeName);
            for (this.add(name, "E"), i = 0; ii > i; i++) {
                name = this.normalize(attributes[i].name);
                var multiElementMatch = name.match(MULTI_ELEMENT_DIR_RE);
                multiElementMatch && this.isMultiElement(multiElementMatch[1]) && (attrStartName = attributes[i].name, 
                attrEndName = attributes[i].name.substr(0, name.length - 3) + "end", name = name.substring(0, name.length - 5)), 
                this.interpolate(name, attributes[i].value), this.attributes[name] = attributes[i].value, 
                this.add(name, "A", attrStartName, attrEndName);
            }
            if (node.nodeType == Node.ELEMENT_NODE) for (classes = node.className.split(" "), 
            jj = classes.length, j = 0; jj > j; j++) this.add(this.normalize(classes[j]), "C");
            return this.directives.sort(function(a, b) {
                var diff = b.priority - a.priority;
                return 0 !== diff ? diff : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index;
            }), this.directives;
        },
        interpolate: function(name, value) {
            this.directives.push({
                priority: 100,
                compile: function() {
                    return {
                        pre: function(scope, element, attrs) {
                            var interpolate = new Interpolate(value);
                            0 !== interpolate.exps.length && (attrs[name] = interpolate.compile(scope), scope.watchGroup(interpolate.exps, function() {
                                attrs.$set(name, interpolate.compile(scope));
                            }));
                        }
                    };
                }
            });
        },
        add: function(name, restrict, startAttrName, endAttrName) {
            var directives = this.registry.$$get(name), maxPriority = this.maxPriority;
            if (!directives) return null;
            var i, directive, ii = directives.length;
            for (i = 0; ii > i; i++) directive = directives[i], -1 === directive.restrict.indexOf(restrict) || isDefined(maxPriority) && directive.priority > maxPriority == !1 ? (maxPriority = void 0, 
            delete this.maxPriority) : (startAttrName && (directive = inherit(directive, {
                $$start: startAttrName,
                $$end: endAttrName
            })), this.directives.push(directive));
        },
        normalize: function(name) {
            return camelCase(name);
        }
    };
    var Regex = {
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    }, Character = {
        isIdentifierStart: function(cp) {
            return 36 === cp || 95 === cp || cp >= 65 && 90 >= cp || cp >= 97 && 122 >= cp || 92 === cp || cp >= 128 && Regex.NonAsciiIdentifierStart.test(Character.fromCodePoint(cp));
        },
        isWhiteSpace: function(cp) {
            return 32 === cp || 9 === cp || 11 === cp || 12 === cp || 160 === cp || cp >= 5760 && [ 5760, 6158, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279 ].indexOf(cp) >= 0;
        },
        isIdentifierPart: function(ch) {
            return 36 === ch || 95 === ch || ch >= 65 && 90 >= ch || ch >= 97 && 122 >= ch || ch >= 48 && 57 >= ch || 92 === ch || ch >= 128 && Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
        }
    }, Syntax = {
        Program: "Program",
        ExpressionStatement: "ExpressionStatement",
        AssignmentExpression: "AssignmentExpression",
        ConditionalExpression: "ConditionalExpression",
        LogicalExpression: "LogicalExpression",
        BinaryExpression: "BinaryExpression",
        UnaryExpression: "UnaryExpression",
        CallExpression: "CallExpression",
        MemberExpression: "MemberExpression",
        Identifier: "Identifier",
        Literal: "Literal",
        ArrayExpression: "ArrayExpression",
        Property: "Property",
        ObjectExpression: "ObjectExpression",
        ThisExpression: "ThisExpression",
        TemplateElement: "TemplateElement",
        TemplateLiteral: "TemplateLiteral"
    }, Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9,
        Template: 10
    };
    forEach(Token, function(value, key) {
        Token[value] = key.replace(/Literal/, "");
    }), extend(AST, Syntax), AST.prototype = {
        ast: function(text) {
            this.text = text, this.tokens = this.tokenize(this.lexer.lex(this.text)), this.current = null;
            var value = this.program();
            return value;
        },
        tokenize: function(tokens) {
            var i, token;
            for (i = 0; i < tokens.length; i++) token = tokens[i], (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) && (token.raw = this.text.substring(token.start, token.end));
            return tokens;
        },
        throwError: function(msg, token) {
            throw $parseMinErr("syntax", "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].", token.value, msg, token.index + 1, this.text, this.text.substring(token.index));
        },
        program: function() {
            for (var statement, body = []; this.tokens.length > 0; ) statement = this.expressionStatement(), 
            body.push(statement), this.expect(";");
            return {
                type: AST.Program,
                body: body
            };
        },
        peekToken: function() {
            if (0 === this.tokens.length) throw new Error("Unexpected end of expression: " + this.text);
            return this.tokens[0];
        },
        peek: function(e1, e2, e3, e4) {
            return this.peekAhead(0, e1, e2, e3, e4);
        },
        peekAhead: function(i, e1, e2, e3, e4) {
            var token, t;
            return this.tokens.length > i && (token = this.tokens[i], t = token.value, t === e1 || t === e2 || t === e3 || t === e4 || !e1 && !e2 && !e3 && !e4) ? token : !1;
        },
        consume: function(e1) {
            if (0 === this.tokens.length) throw new Error("unexpected end of expression" + this.text);
            var token = this.expect(e1);
            return token || this.throwError("is unexpected, expecting [" + e1 + "]", this.peek()), 
            token;
        },
        expect: function(e1, e2, e3, e4) {
            var token = this.peek(e1, e2, e3, e4);
            return token ? (this.tokens.shift(), token) : !1;
        },
        expressionStatement: function() {
            return {
                type: AST.ExpressionStatement,
                expression: this.expression()
            };
        },
        expression: function() {
            return this.assignment();
        },
        assignment: function() {
            var token, result = this.conditional();
            return (token = this.expect("*=", "/=", "%=", "-=") || this.expect("<<=", ">>=", ">>>=", "&=") || this.expect("^=", "|=", "+=", "=")) && (result = {
                type: AST.AssignmentExpression,
                left: result,
                right: this.assignment(),
                operator: token.value
            }), result;
        },
        conditional: function() {
            var alternate, consequent, test = this.logicalOR();
            return this.expect("?") && (alternate = this.expression(), this.consume(":")) ? (consequent = this.expression(), 
            {
                type: AST.ConditionalExpression,
                test: test,
                alternate: alternate,
                consequent: consequent
            }) : test;
        },
        logicalOR: function() {
            for (var left = this.logicalAND(); this.expect("||"); ) left = {
                type: AST.LogicalExpression,
                operator: "||",
                left: left,
                right: this.logicalAND()
            };
            return left;
        },
        logicalAND: function() {
            for (var left = this.equality(); this.expect("&&"); ) left = {
                type: AST.LogicalExpression,
                operator: "&&",
                left: left,
                right: this.equality()
            };
            return left;
        },
        equality: function() {
            for (var token, left = this.bitwise(); token = this.expect("==", "!=", "===", "!=="); ) left = {
                type: AST.BinaryExpression,
                operator: token.value,
                left: left,
                right: this.bitwise()
            };
            return left;
        },
        bitwise: function() {
            for (var token, left = this.shift(); token = this.expect("&", "^", "|"); ) left = {
                type: AST.BinaryExpression,
                operator: token.value,
                left: left,
                right: this.shift()
            };
            return left;
        },
        shift: function() {
            for (var token, left = this.relational(); token = this.expect("<<", ">>", ">>>"); ) left = {
                type: AST.BinaryExpression,
                operator: token.value,
                left: left,
                right: this.relational()
            };
            return left;
        },
        relational: function() {
            for (var token, left = this.additive(); token = this.expect("<", ">", "<=", ">="); ) left = {
                type: AST.BinaryExpression,
                operator: token.value,
                left: left,
                right: this.additive()
            };
            return left;
        },
        additive: function() {
            for (var token, left = this.multiplicative(); token = this.expect("+", "-"); ) left = {
                type: AST.BinaryExpression,
                operator: token.value,
                left: left,
                right: this.multiplicative()
            };
            return left;
        },
        multiplicative: function() {
            for (var token, left = this.unary(); token = this.expect("*", "/", "%"); ) left = {
                type: AST.BinaryExpression,
                operator: token.value,
                left: left,
                right: this.unary()
            };
            return left;
        },
        unary: function() {
            var token;
            return (token = this.expect("+", "-", "!")) ? {
                type: AST.UnaryExpression,
                operator: token.value,
                prefix: !0,
                argument: this.unary()
            } : this.primary();
        },
        primary: function() {
            var primary;
            this.expect("(") ? (primary = this.expression(), this.consume(")")) : this.expect("[") ? primary = this.arrayDeclaration() : this.expect("{") ? primary = this.object() : this.constants.hasOwnProperty(this.peek().value) ? primary = clone(this.constants[this.consume().value]) : this.peek().type === Token.Identifier ? primary = this.identifier() : this.peek().type === Token.NumericLiteral || this.peek().type === Token.StringLiteral ? primary = this.constant() : this.peek().type === Token.Template ? primary = this.template() : this.throwError("not a primary expression", this.peek());
            for (var next; next = this.expect("(", "[", "."); ) "(" === next.value ? (primary = {
                type: AST.CallExpression,
                callee: primary,
                arguments: this.parseArguments()
            }, this.consume(")")) : "[" === next.value ? (primary = {
                type: AST.MemberExpression,
                object: primary,
                property: this.expression(),
                computed: !0
            }, this.consume("]")) : "." === next.value ? primary = {
                type: AST.MemberExpression,
                object: primary,
                property: this.identifier(),
                computed: !1
            } : this.throwError("IMPOSSIBLE");
            return primary;
        },
        templateElement: function() {
            var token = this.consume();
            return {
                type: AST.TemplateElement,
                cooked: {
                    value: token.value,
                    raw: token.value
                },
                tail: token.tail
            };
        },
        template: function() {
            for (var token, tail = !1, quasis = [], expressions = []; ;) {
                if (token = this.peek(), !token) break;
                if (token.type === Token.Template ? (token.tail && (tail = !0), quasis.push(this.templateElement())) : expressions.push(this.expression()), 
                tail) break;
            }
            return {
                type: AST.TemplateLiteral,
                quasis: quasis,
                expressions: expressions
            };
        },
        parseArguments: function() {
            var args = [];
            if (")" !== this.peek().value) do args.push(this.expression()); while (this.expect(","));
            return args;
        },
        identifier: function() {
            var token = this.consume();
            return token.type !== Token.Identifier && this.throwError("is not a valid identifier", token), 
            {
                type: AST.Identifier,
                name: token.value
            };
        },
        constant: function() {
            return {
                type: AST.Literal,
                value: this.consume().raw
            };
        },
        arrayDeclaration: function() {
            var elements = [];
            if ("]" !== this.peekToken().text) do {
                if (this.peek("]")) break;
                elements.push(this.expression());
            } while (this.expect(","));
            return this.consume("]"), {
                type: AST.ArrayExpression,
                elements: elements
            };
        },
        object: function() {
            var property, properties = [];
            if ("}" !== this.peekToken().value) do {
                if (this.peek("}")) break;
                property = {
                    type: AST.Property,
                    kind: "init"
                }, this.peek().type === Token.NumericLiteral ? property.key = this.constant() : this.peek().type === Token.Identifier ? property.key = this.identifier() : this.throwError("invalid key", this.peek()), 
                this.consume(":"), property.value = this.expression(), properties.push(property);
            } while (this.expect(","));
            return this.consume("}"), {
                type: AST.ObjectExpression,
                properties: properties
            };
        },
        constants: {
            "true": {
                type: AST.Literal,
                value: !0
            },
            "false": {
                type: AST.Literal,
                value: !1
            },
            "null": {
                type: AST.Literal,
                value: null
            },
            undefined: {
                type: AST.Literal,
                value: void 0
            },
            "this": {
                type: AST.ThisExpression
            }
        }
    }, ASTCompiler.prototype = {
        assignableAST: function(ast) {
            return 1 === ast.body.length && isAssignable(ast.body[0].expression) ? {
                type: AST.AssignmentExpression,
                left: ast.body[0].expression,
                right: {
                    type: AST.NGValueParameter
                },
                operator: "="
            } : void 0;
        },
        compile: function(expression, expensiveChecks) {
            var assignable, ast = this.astBuilder.ast(expression), extra = "";
            if (assignable = this.assignableAST(ast)) {
                this.grammar.setCurrent("assign");
                var result = this.nextId();
                this.recurse(assignable, result, void 0, void 0, !0), this.grammar.return_(result), 
                extra += "fn.assign=" + this.generateFunction("assign", "s,v,l") + ";";
            }
            this.grammar.setCurrent("fn"), this.recurse(ast);
            var fnString = "var fn = " + this.generateFunction("fn", "s,l") + ";" + extra + "return fn;", fn = new Function("plus", "isUndefined", "ifDefined", fnString)(this.sum, isUndefined, ifDefined);
            return this.clear(), fn;
        },
        sum: function(a, b) {
            var args = toArray(arguments);
            return sum.call(this, args);
        },
        clear: function(name) {
            this.grammar.clear(name);
        },
        lazyRecurse: function() {
            var self = this, args = arguments;
            return function() {
                self.recurse.apply(self, args);
            };
        },
        generateFunction: function(name, params) {
            return this.grammar.generateFunction(name, params);
        },
        nextId: function() {
            return this.grammar.nextId.apply(this.grammar, arguments);
        },
        id: function(id) {
            return this.grammar.id(id);
        },
        exec: function(fn) {
            var args = toArray(arguments).slice(1);
            return fn.apply(this, args), this;
        },
        recurse: function(ast, id, data, recursion, create) {
            switch (id = id || this.nextId(), recursion = recursion || noop, ast.type) {
              case AST.Program:
                this.parseProgram(ast);
                break;

              case AST.Literal:
                this.parseLiteral(ast, id, recursion);
                break;

              case AST.BinaryExpression:
                this.parseBinaryExpression(ast, id, recursion, create);
                break;

              case AST.LogicalExpression:
                this.parseLogicalExpression(ast, id, recursion, create);
                break;

              case AST.UnaryExpression:
                this.parseUnaryExpression(ast, id, recursion, create);
                break;

              case AST.Identifier:
                this.parseIdentifier(ast, id, data, recursion, create);
                break;

              case AST.MemberExpression:
                this.parseMemberExpression(ast, id, data, recursion, create);
                break;

              case AST.AssignmentExpression:
                this.parseAssignmentExpression(ast, id, recursion);
                break;

              case AST.ConditionalExpression:
                this.parseConditionalExpression(ast, id, recursion);
                break;

              case AST.CallExpression:
                this.parseCallExpression(ast, id, recursion);
                break;

              case AST.ObjectExpression:
                this.parseObjectExpression(ast, id, recursion);
                break;

              case AST.TemplateLiteral:
                this.parseTemplateLiteral(ast, id, recursion);
                break;

              case AST.ArrayExpression:
                this.parseArrayExpression(ast, id, recursion);
                break;

              case AST.ThisExpression:
                this.parseThisExpression(ast, id, recursion);
                break;

              case AST.NGValueParameter:
                this.grammar.assign(id, "v"), recursion("v");
                break;

              default:
                throw new Error("no statement for " + ast.type);
            }
            return id;
        },
        parseUnaryExpression: function(ast, id, recursion) {
            var right, expression;
            this.recurse(ast.argument, void 0, void 0, function(expr) {
                right = expr;
            }), expression = ast.operator + "(" + this.grammar.ifDefined(right, 0) + ")", this.grammar.assign(id, expression), 
            recursion(expression);
        },
        parseThisExpression: function(ast, id, recursion) {
            this.grammar.assign(id, "s"), recursion("s");
        },
        parseArrayExpression: function(ast, id, recursion) {
            var i, element, elements = ast.elements;
            for (this.grammar.assign(id, "new Array(" + elements.length + ")"), i = 0; i < elements.length; i++) element = this.recurse(elements[i]), 
            this.grammar.assign(id + "[" + i + "]", element);
            recursion(id);
        },
        parseTemplateLiteral: function(ast, id, recursion) {
            var i, expression, quasi, template = [], expressions = [];
            for (i = 0; i < ast.expressions.length; i++) expression = ast.expressions[i], expressions.push(this.recurse(expression));
            for (i = 0; i < ast.quasis.length && (quasi = ast.quasis[i], !quasi.tail || isNumber(quasi.cooked.value) || !isEmpty(quasi.cooked.value)); i++) template.push(this.grammar.getAsString(this.grammar.escape(quasi.cooked.value))), 
            expressions.length && (expression = expressions.shift(), expression = this.grammar.join(this.grammar.join(this.grammar.execute("isNumber", expression), this.grammar.execute("String", expression), "&&"), expression, "||"), 
            template.push(this.grammar.block(this.grammar.join(expression, this.grammar.getAsString(), "||"))));
            this.grammar.assign(id, template.join("+")), recursion(id);
        },
        parseObjectExpression: function(ast, id, recursion) {
            var expression, args = [], self = this;
            forEach(ast.properties, function(property) {
                self.recurse(property.value, self.nextId(), void 0, function(expr) {
                    args.push(self.grammar.escape(property.key.type === AST.Identifier ? property.key.name : property.key.value) + ":" + expr);
                });
            }), expression = "{" + args.join(",") + "}", this.grammar.assign(id, expression), 
            recursion(expression);
        },
        parseCallExpression: function(ast, id, recursion) {
            var right, left, expression, self = this, args = [], grammar = this.grammar;
            right = this.nextId(), left = ast.callee, this.recurse(ast.callee, right, void 0, function() {
                grammar.ifNotNull(right, function() {
                    forEach(ast.arguments, function(expr) {
                        self.recurse(expr, self.nextId(), function(argument) {
                            args.push(argument);
                        });
                    }), expression = left.name ? this.member("s", left.name, left.computed) + this.block(args.join(",")) : this.execute(right, args), 
                    this.assign(id, expression);
                }, function() {
                    this.assign(id, "undefined");
                }), recursion(id);
            });
        },
        parseConditionalExpression: function(ast, id, recursion) {
            this.recurse(ast.test, id), this.grammar.if_(id, this.lazyRecurse(ast.alternate, id), this.lazyRecurse(ast.consequent, id)), 
            recursion(id);
        },
        parseBinaryExpression: function(ast, id, recursion, create) {
            var expression, right = this.nextId(), left = this.nextId();
            this.recurse(ast.left, left, void 0, function(expr) {
                left = expr;
            }, create), this.recurse(ast.right, right, void 0, function(expr) {
                right = expr;
            }, create), expression = "+" === ast.operator ? this.grammar.plus(left, right) : "-" === ast.operator ? this.grammar.ifDefined(left, 0) + ast.operator + this.grammar.ifDefined(right, 0) : this.grammar.block(left) + ast.operator + this.grammar.block(right), 
            this.grammar.assign(id, expression), this.exec(recursion, expression);
        },
        parseAssignmentExpression: function(ast, id, recursion) {
            var expression, self = this, right = this.nextId(), grammar = this.grammar;
            if (!isAssignable(ast.left)) throw $parseMinErr("lval", "Trying to assign a value to a non l-value");
            var left = {};
            this.recurse(ast.left, void 0, left, function(a) {
                grammar.ifNotNull("s", function() {
                    self.recurse(ast.right, right), expression = this.member(left.context, left.name, left.computed) + ast.operator + right, 
                    this.assign(id, expression), self.exec(recursion, id || expression);
                });
            }, 1);
        },
        parseIdentifier: function(ast, id, data, recursion, create) {
            data && (data.context = "s", data.computed = !1, data.name = ast.name), this.grammar.ifNot(this.grammar.getHasOwnProperty("l", ast.name), function() {
                this.if_("s", function() {
                    create && this.ifNot(this.getHasOwnProperty("s", ast.name), this.lazyAssign(this.member("s", ast.name), "{}")), 
                    this.assign(id, this.member("s", ast.name));
                });
            }, function() {
                this.if_(this.getHasOwnProperty("l", ast.name), this.lazyAssign(id, this.member("l", ast.name)));
            }), this.exec(recursion, id);
        },
        parseLogicalExpression: function(ast, id, recursion, create) {
            var grammar = this.grammar;
            this.recurse(ast.left, id, void 0, void 0, create), grammar["&&" === ast.operator ? "if_" : "ifNot"](id, this.lazyRecurse(ast.right, id)), 
            this.exec(recursion, id);
        },
        parseMemberExpression: function(ast, id, data, recursion, create) {
            var expression, right, self = this, left = (this.grammar, data && (data.context = this.nextId()) || this.nextId());
            this.recurse(ast.object, left, void 0, function(a) {
                var grammar = this.grammar;
                grammar.ifNotNull(left, function() {
                    ast.computed ? (right = this.nextId(), self.recurse(ast.property, right), create && this.ifNot(this.computedMember(left, right), this.lazyAssign(this.computedMember(left, right), "{}")), 
                    expression = this.computedMember(left, right), this.assign(id, expression), data && (data.computed = !0, 
                    data.name = right)) : (create && this.ifNot(this.join(left, left + '.hasOwnProperty("' + ast.property.name + '")', "&&"), this.lazyAssign(this.nonComputedMember(left, ast.property.name), "{}")), 
                    expression = grammar.nonComputedMember(left, ast.property.name), this.assign(id, expression), 
                    data && (data.computed = !1, data.name = ast.property.name));
                }, function() {
                    this.assign(id, "undefined");
                }), this.exec(recursion, id);
            }, !!create);
        },
        parseLiteral: function(ast, id, recursion) {
            var value = clone(ast.value);
            this.grammar.assign(id, value), this.exec(recursion, value);
        },
        parseProgram: function(ast, recurse) {
            var right, grammar = this.grammar;
            recurse = recurse || bind(this.recurse, this), forEach(ast.body, function(exp, pos) {
                recurse(exp.expression, void 0, void 0, function(expr) {
                    right = expr;
                }), pos !== ast.body.length - 1 ? grammar.current().body.push(right, ";") : grammar.return_(right);
            });
        }
    }, ASTFinder.prototype = {
        nextId: function() {
            return ++this.id;
        },
        find: function(exp) {
            var computeds, expressions, objects, ast = this.astBuilder.ast(exp);
            return this.objects = objects = {}, this.computeds = computeds = {}, this.expressions = expressions = {}, 
            this.identifiers = [], this.recurse(ast), forEach(this.expressions, function(exps, id) {
                computeds[id] && exps.length || (delete computeds[id], delete expressions[id]);
            }), this.exps = map(this.expressions, function(exps, key) {
                var expression = exps.join("."), exp = {
                    property: !0,
                    exp: expression
                };
                return objects[key] && objects[key].join(".") === expression && (exp.property = !1), 
                exp;
            }), this.allExps = values(this.expressions);
        },
        parseProgram: function(ast) {
            var self = this;
            forEach(ast.body, function(statement) {
                self.recurse(statement.expression);
            });
        },
        parseMemberExpression: function(ast, id, recursion) {
            var property, expressions = this.expressions[id];
            ast.hasOwnProperty("object") && ast.object.name && this.objects[id].push(ast.object.name), 
            this.recurse(ast.object, id, function() {
                ast.computed ? (property = this.nextId(), this.computeds[property] = !0, this.recurse(ast.property, property)) : expressions.push(ast.property.name), 
                recursion(id);
            });
        },
        parseBinaryExpression: function(ast, id, recursion) {
            var left = this.nextId(), right = this.nextId(), computeds = this.computeds;
            this.recurse(ast.left, left, function() {
                this.recurse(ast.right, right), forEach(this.expressions, function(value, key) {
                    (key == right || key == left) && (computeds[key] = !0);
                }), recursion(id);
            });
        },
        parseLogicalExpression: function(ast, id, recursion) {
            this.recurse(ast.left), this.recurse(ast.right);
        },
        parseIdentifier: function(ast, id, recursion) {
            this.identifiers.push(ast.name), this.expressions[id].push(ast.name), recursion(id);
        },
        parseTemplateLiteral: function(ast, id, recursion) {
            var exprId, self = this;
            forEach(ast.expressions, function(expr) {
                exprId = self.nextId(), self.computeds[exprId] = !0, self.recurse(expr, exprId);
            }), recursion(id);
        },
        parseArrayExpression: function(ast, id, recursion) {
            console.log(ast);
        },
        recurse: function(ast, id, recursion) {
            switch (id = id || this.nextId(), recursion = recursion && bind(recursion, this) || noop, 
            this.expressions.hasOwnProperty(id) || (this.expressions[id] = []), this.objects.hasOwnProperty(id) || (this.objects[id] = []), 
            ast.type) {
              case AST.CallExpression:
              case AST.ArrayExpression:
              case AST.Literal:
                recursion(id);
                break;

              case AST.TemplateLiteral:
                this.parseTemplateLiteral(ast, id, recursion);
                break;

              case AST.LogicalExpression:
                this.parseLogicalExpression(ast, id, recursion);
                break;

              case AST.BinaryExpression:
                this.parseBinaryExpression(ast, id, recursion);
                break;

              case AST.MemberExpression:
                this.parseMemberExpression(ast, id, recursion);
                break;

              case AST.Program:
                this.parseProgram(ast);
                break;

              case AST.Identifier:
                this.parseIdentifier(ast, id, recursion);
                break;

              default:
                throw new Error("there is no statement for " + ast.type);
            }
        }
    }, Attributes.prototype = {
        $set: function(name, value) {
            this[name] = value;
            var attrName = this.$$normalize(name);
            this.$$node instanceof Node == !0 && this.$$node.setAttribute(attrName, value), 
            this.$$fire(name);
        },
        $$fire: function(name) {
            if (this.$$observers.hasOwnProperty(name)) {
                var i = 0, ii = this.$$observers[name].length;
                if (ii > 0) {
                    for (;ii > i; i++) this.$$observers[name][i](this[name]);
                    this.$$observers[name].$$called++;
                }
            }
        },
        $$normalize: function(str) {
            return kebabCase(str);
        },
        $observe: function(name, listener) {
            var attrs = this;
            return this.$$observers.hasOwnProperty(name) || (this.$$observers[name] = [], this.$$observers[name].$$called = 0), 
            this.$$observers[name].push(listener), setTimeout(function() {
                attrs.$$observers[name].$$called < 1 && attrs.hasOwnProperty(name) && !isUndefined(attrs[name]) && attrs.$$fire(name);
            }), function() {
                return attrs.$$removeObserver(name, listener);
            };
        },
        $$removeObserver: function(name, listener) {
            if (this.$$observers.hasOwnProperty(name)) {
                for (var i = 0, ii = this.$$observers[name].length; ii > i; i++) this.$$observers[name][i] == listener && this.$$observers[name].splice(i, 1);
                return !0;
            }
            return !1;
        }
    }, CompositeLink.prototype = {
        execute: function(scope, childLink, transcludeFn) {
            var i, ii = this.nodeLinks.length;
            for (i = 0; ii > i; i++) this.nodeLinks[i].execute(scope, this.nodeLinks[++i], transcludeFn);
        }
    }, Grammar.prototype = {
        nextId: function(skip, init) {
            var id = "v" + this.nextId_++;
            return skip || this.current().vars.push(id + (init ? "=" + init : "")), id;
        },
        assign: function(id, value) {
            return id ? (this.current().body.push(id, "=", value, ";"), id) : void 0;
        },
        setCurrent: function(name) {
            return this.state.hasOwnProperty(name) || this.createSection(name), this.current_ = name, 
            this;
        },
        createSection: function(name) {
            return this.state[name] = {
                body: [],
                vars: [],
                own: {},
                nextId: 0
            }, this;
        },
        body: function(section) {
            return this.state[section].body.join("");
        },
        current: function() {
            return this.state[this.current_];
        },
        varsPrefix: function(section) {
            return this.state[section].vars.length ? "var " + this.state[section].vars.join(",") + ";" : "";
        },
        exec: function(fn) {
            var args = toArray(arguments).slice(1);
            return fn.apply(this, args), this;
        },
        nonComputedMember: function(left, right) {
            return left + "." + right;
        },
        computedMember: function(left, right) {
            return left + "[" + right + "]";
        },
        member: function(left, right, computed) {
            return computed ? this.computedMember(left, right) : this.nonComputedMember(left, right);
        },
        not: function(expression) {
            return "!" + this.block(expression);
        },
        notNull: function(expression) {
            return expression + "!=null";
        },
        ifNot: function(expression, alternate, consequent) {
            return this.if_(this.not(expression), alternate, consequent);
        },
        ifNotNull: function(expression, alternate, consequent) {
            return this.if_(this.notNull(expression), alternate, consequent), this;
        },
        ifIsDefined: function(variable, alternate, consequent) {
            return this.if_(this.join(this.notNull(variable), "&&"), alternate, consequent);
        },
        if_: function(test, alternate, consequent) {
            var body = this.current().body;
            body.push("if(", test, "){"), this.exec(alternate, test), body.push("}"), consequent && (body.push("else{"), 
            this.exec(consequent, test), body.push("}"));
        },
        return_: function(id) {
            this.current().body.push("return ", id, ";");
        },
        escape: function(string) {
            return escape(string);
        },
        join: function() {
            var args = toArray(arguments), del = args.slice(-1)[0];
            return args.slice(0, args.length - 1).join(del);
        },
        getHasOwnProperty: function(element, property) {
            var key = element + "." + property, own = this.current().own;
            return own.hasOwnProperty(key) || (own[key] = this.nextId(!1, this.join(element, this.block(this.member(element, this.execute("hasOwnProperty", '"' + this.escape(property) + '"'))), "&&"))), 
            own[key];
        },
        block: function(exp, stCh, enCh) {
            return stCh = stCh || "(", enCh = enCh || ")", stCh + exp + enCh;
        },
        execute: function(name) {
            var args = toArray(arguments).slice(1);
            return 1 === args.length && isArray(args[0]) && (args = args[0]), name + this.block(args.join(","));
        },
        plus: function(left, right) {
            return this.execute("plus", left, right);
        },
        ifDefined: function(id, defaultValue) {
            return this.execute("ifDefined", id, this.escape(defaultValue));
        },
        ifIsUndefined: function(id) {
            return this.execute("isUndefined", id);
        },
        generateFunction: function(name, params) {
            return params || (params = ""), "function(" + params + "){" + this.varsPrefix(name) + this.body(name) + "}";
        },
        id: function(id, skip, init) {
            return id || this.nextId(skip, init);
        },
        lazyAssign: function(id, value) {
            var self = this;
            return function() {
                self.assign(id, value);
            };
        },
        push: function() {
            var args = toArray(arguments), body = this.current().body;
            return body.push.apply(body, args);
        },
        getAsString: function(value) {
            return '"' + (value || "") + '"';
        },
        clear: function(name) {
            var grammar = this;
            return name ? (this.state.hasOwnProperty(name) && delete this.state[name], void this.setCurrent(name)) : (forEach(this.state, function(state, name) {
                grammar.clear(name);
            }), this);
        }
    }, extend(Interpolate, {
        startSymbol: "{{",
        endSymbol: "}}"
    }), Interpolate.prototype = {
        parse: function(exp) {
            return renderer.parse(exp);
        },
        compute: function(values) {
            for (var exps = this.exps, concat = this.concat, expressionPositions = this.expressionPositions, i = 0, ii = exps.length; ii > i; i++) concat[expressionPositions[i]] = values[i];
            return concat.join("");
        },
        compile: function(context) {
            for (var i = 0, ii = this.exps.length, values = new Array(ii); ii > i; i++) values[i] = this.parseFns[i](context);
            return this.compute(values);
        }
    }, Lexer.prototype = {
        lex: function(text) {
            this.index = 0, this.text = text, this.length = this.text.length, this._scanning = !1, 
            this.tokens = [], this.curlyStack = [];
            for (var ch; !this.eof(); ) ch = this.text.charCodeAt(this.index), this.isWhiteSpace(ch) ? ++this.index : this.isIdentifierStart(ch) ? this.scanIdentifier() : 40 === ch || 41 === ch || 59 === ch ? this.scanPunctuator() : 39 === ch || 34 === ch ? this.scanStringLiteral() : 46 === ch ? this.isDecimalDigit(this.text.charCodeAt(this.index + 1)) ? this.scanNumericLiteral() : this.scanPunctuator() : this.isDecimalDigit(ch) ? this.scanNumericLiteral() : 96 === ch || 125 === ch && "${" === this.curlyStack[this.curlyStack.length - 1] ? this.scanTemplate() : this.scanPunctuator();
            return this.tokens;
        },
        throwUnexpectedToken: function() {
            throw new Error("Column " + this.index + ": Unexpected token " + this.text[this.index]);
        },
        isDecimalDigit: function(ch) {
            return ch >= 48 && 57 >= ch;
        },
        isIdentifierPart: function(ch) {
            return Character.isIdentifierPart(ch);
        },
        isOctalDigit: function(cp) {
            return cp >= 48 && 55 >= cp;
        },
        getIdentifier: function() {
            for (var ch, start = this.index++; !this.eof(); ) {
                if (ch = this.text.charCodeAt(this.index), 92 === ch) return this.index = start, 
                this.getComplexIdentifier();
                if (ch >= 55296 && 57343 > ch) return this.index = start, this.getComplexIdentifier();
                if (!this.isIdentifierPart(ch)) break;
                ++this.index;
            }
            return this.text.slice(start, this.index);
        },
        scanTemplate: function() {
            var ch, cooked = "", terminated = !1, start = this.index, head = "`" === this.text[start], tail = !1, rawOffset = 2;
            for (++this.index; !this.eof(); ) {
                if (ch = this.text[this.index++], "`" === ch) {
                    rawOffset = 1, tail = !0, terminated = !0;
                    break;
                }
                if ("$" === ch) {
                    if ("{" === this.text[this.index]) {
                        this.curlyStack.push("${"), ++this.index, terminated = !0;
                        break;
                    }
                    cooked += ch;
                } else cooked += ch;
            }
            terminated || this.throwUnexpectedToken(), head || this.curlyStack.pop(), this.tokens.push({
                type: Token.Template,
                value: cooked,
                start: start,
                tail: tail,
                head: head,
                end: this.index
            });
        },
        scanNumericLiteral: function() {
            var ch;
            ch = this.text[this.index], this.assert(this.isDecimalDigit(ch.charCodeAt(0)) || "." === ch, "Numeric literal must start with a decimal digit or a decimal point");
            var start = this.index, number = "";
            if ("." !== ch) {
                if (number = this.text[this.index++], ch = this.text[this.index], "0" === number) {
                    if ("x" === ch || "X" === ch) return ++this.index, this.scanHexLiteral(start);
                    if ("b" === ch || "B" === ch) return ++this.index, this.scanBinaryLiteral(start);
                    if ("o" === ch || "O" === ch) return this.scanOctalLiteral(ch, start);
                    if (this.isOctalDigit(ch) && this.isImplicitOctalLiteral()) return this.scanOctalLiteral(ch, start);
                }
                for (;this.isDecimalDigit(this.text.charCodeAt(this.index)); ) number += this.text[this.index++];
                ch = this.text[this.index];
            }
            if ("." === ch) {
                for (number += this.text[this.index++]; this.isDecimalDigit(this.text.charCodeAt(this.index)); ) number += this.text[this.index++];
                ch = this.text[this.index];
            }
            if ("e" === ch || "E" === ch) if (number += this.text[this.index++], ch = this.text[this.index], 
            ("+" === ch || "-" === ch) && (number += this.text[this.index++]), this.isDecimalDigit(this.text.charCodeAt(this.index))) for (;this.isDecimalDigit(this.text.charCodeAt(this.index)); ) number += this.text[this.index++]; else this.throwUnexpectedToken();
            this.isIdentifierPart(this.text.charCodeAt(this.index)) && this.throwUnexpectedToken(), 
            this.tokens.push({
                type: Token.NumericLiteral,
                value: parseFloat(number),
                start: start,
                end: this.index
            });
        },
        scanIdentifier: function() {
            var id, type, start = this.index;
            id = 92 === this.text.charCodeAt(this.index) ? this.getComplexIdentifier() : this.getIdentifier(), 
            type = 1 === id.length ? Token.Identifier : "null" === id ? Token.NullLiteral : "true" === id || "false" === id ? Token.BooleanLiteral : Token.Identifier, 
            this.tokens.push({
                type: type,
                value: id,
                start: start,
                end: this.index
            });
        },
        assert: function(condition, message) {
            if (!condition) throw new Error("ASSERT: " + message);
        },
        eof: function() {
            return this.index >= this.length;
        },
        isWhiteSpace: function(ch) {
            return Character.isWhiteSpace(ch);
        },
        isIdentifierStart: function(ch) {
            return Character.isIdentifierStart(ch);
        },
        scanPunctuator: function() {
            var token = {
                type: Token.Punctuator,
                value: "",
                start: this.index,
                end: this.index
            }, str = this.text[this.index];
            switch (str) {
              case "{":
                "{" === str && this.curlyStack.push(str), ++this.index;
                break;

              case "}":
                ++this.index, this.curlyStack.pop();
                break;

              case ".":
                ++this.index, "." === this.text[this.index] && "." === this.text[this.index + 1] && (this.index += 2, 
                str = "...");
                break;

              case "(":
              case ")":
              case ";":
              case ",":
              case "[":
              case "]":
              case ":":
              case "?":
              case "~":
                ++this.index;
                break;

              default:
                str = this.text.substr(this.index, 4), ">>>=" === str ? this.index += 4 : (str = str.substr(0, 3), 
                "===" === str || "!==" === str || ">>>" === str || "<<=" === str || ">>=" === str ? this.index += 3 : (str = str.substr(0, 2), 
                "&&" === str || "||" === str || "==" === str || "!=" === str || "+=" === str || "-=" === str || "*=" === str || "/=" === str || "++" === str || "--" === str || "<<" === str || ">>" === str || "&=" === str || "|=" === str || "^=" === str || "%=" === str || "<=" === str || ">=" === str || "=>" === str ? this.index += 2 : (str = this.text[this.index], 
                "<>=!+-*%&|^/".indexOf(str) >= 0 && ++this.index)));
            }
            this.index === token.start && this.throwUnexpectedToken(), token.end = this.index, 
            token.value = str, this.tokens.push(token);
        },
        scanStringLiteral: function() {
            var start = this.index, quote = this.text[start];
            this.assert("'" === quote || '"' === quote, "String literal must starts with a quote"), 
            ++this.index;
            for (var ch, octal = !1, str = ""; !this.eof(); ) {
                if (ch = this.text[this.index++], ch === quote) {
                    quote = "";
                    break;
                }
                str += ch;
            }
            "" !== quote && this.throwUnexpectedToken(), this.tokens.push({
                type: Token.StringLiteral,
                value: str,
                octal: octal,
                start: start,
                end: this.index
            });
        },
        scanning: function(value) {
            return this._scanning = value || !this._scanning, this;
        }
    }, NodeGroup.prototype = {
        _classList: {
            add: function() {
                return this.exec("classList.add", arguments);
            },
            remove: function() {
                return this.exec("classList.remove", arguments);
            },
            contains: function() {
                return this.exec("classList.contains", arguments);
            }
        },
        exec: function(method, args) {
            for (var fn, node, keys, result, context, response, i = 0; i < this.nodeList.length; i++) node = this.nodeList[i], 
            method.indexOf(".") > -1 ? (fn = get(node, method), keys = method.split("."), context = get(node, first(keys.slice(-2)))) : (fn = node[method], 
            context = node), result = (response = fn.apply(context, args)) ? response : null;
            return result;
        },
        setAttribute: function() {
            return this.exec("setAttribute", arguments);
        },
        getAttribute: function(key, value) {
            for (var i = 0; i < this.nodeList.length; i++) if (this.nodeList[i].hasAttribute(key)) return this.nodeList[i].getAttribute(key);
        }
    }, extend(NodeLink, {
        SCOPE_CHILD: 1,
        SCOPE_ISOLATED: 2
    }), NodeLink.prototype = {
        constructor: NodeLink,
        group: function(attrStart, attrEnd) {
            var node = this.node, nodes = [], depth = 0;
            if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
                do {
                    if (!node) throw $compileMinErr("uterdir", "Unterminated attribute, found '{0}' but no matching '{1}' found.", attrStart, attrEnd);
                    node.nodeType == Node.ELEMENT_NODE && (node.hasAttribute(attrStart) && depth++, 
                    node.hasAttribute(attrEnd) && depth--), nodes.push(node), node = node.nextSibling;
                } while (depth > 0);
            } else nodes.push(node);
            return new NodeGroup(nodes);
        },
        prepare: function(registry) {
            var i, options, attrEnd, attrStart, directive, scopeType, ii = this.directives.length, context = this.context;
            for (i = 0; ii > i && (directive = this.directives[i], !(this.terminalPriority > directive.priority)); i++) {
                if (attrStart = directive.$$start, attrEnd = directive.$$end, attrStart && (this.node = this.group(attrStart, attrEnd)), 
                directive.hasOwnProperty("scope") && directive.scope) {
                    if (isObject(directive.scope)) {
                        if (this.scope) throw new Error("You can't define a new isolated scope on a node that already has a child scope defined");
                        scopeType = NodeLink.SCOPE_ISOLATED;
                    } else isBoolean(directive.scope) && (scopeType = NodeLink.SCOPE_CHILD);
                    this.scope = {
                        type: scopeType,
                        bindings: directive.scope
                    };
                }
                directive.controller && (context.controllers = context.controllers || {}, context.controllers[directive.name] = directive), 
                !directive.transclude && directive.template && (directive.transclude = !0), directive.transclude && ("element" == directive.transclude && (this.terminalPriority = directive.priority), 
                options = {
                    type: directive.transclude,
                    registry: registry,
                    directive: directive,
                    attributes: this.attributes,
                    controllers: context.controllers,
                    terminalPriority: this.terminalPriority
                }, this.transclude = new Transclude(this.node, options), "element" == directive.transclude && this.node !== this.transclude.comment && (this.node = this.transclude.comment), 
                this.transcludeFn = this.transclude.getTranscludeCallback()), directive.template && (isArray(directive.template) && (directive.template = join(directive.template, "")), 
                this.node.innerHTML = directive.template, this.hasTemplate = !0), this.addLink(directive.compile(this.node, this.attributes, this.transcludeFn), directive), 
                directive.terminal && (this.terminal = !0, this.terminalPriority = Math.max(this.terminalPriority, directive.priority));
            }
        },
        REQUIRE_PREFIX_REGEXP: /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,
        getControllers: function(directiveName, node, require, controllers) {
            var value;
            if (isString(require)) {
                var match = require.match(this.REQUIRE_PREFIX_REGEXP), name = require.substring(match[0].length), inheritType = match[1] || match[3], optional = "?" === match[2];
                if ("^^" === inheritType ? $element = $element.parentNode : (value = controllers && controllers[name], 
                value = value && value.instance), !value) {
                    var dataName = "$" + name + "Controller";
                    value = inheritType ? elementInheritedData(node, dataName) : elementData(node, dataName);
                }
                if (!value && !optional) throw new Error("Controller '" + name + "', required by directive '" + directiveName + "', can't be found!");
            } else if (isArray(require)) {
                value = [];
                for (var i = 0, ii = require.length; ii > i; i++) value[i] = this.getControllers(directiveName, node, require[i], controllers);
            }
            return value || null;
        },
        instantiate: function(Controller, scope, node, attributes, transcludeFn) {
            return new Controller(scope, node, attributes, transcludeFn);
        },
        setupControllers: function(scope, node, attributes, transcludeFn) {
            var i, directive, controller, keys = Object.keys(this.context.controllers), controllers = {};
            for (i = 0; i < keys.length; i++) directive = this.context.controllers[keys[i]], 
            isFunction(directive.controller) && (controller = this.instantiate(directive.controller, scope, node, attributes, transcludeFn), 
            controllers[directive.name] = controller, elementData(node, "$" + directive.name + "Controller", controllers[directive.name]));
            return controllers;
        },
        parse: function(exp) {
            return new Parser(new Lexer()).parse(exp);
        },
        directiveBindings: function(scope, dest, bindings) {
            var bindingsKeys = Object.keys(bindings), attrs = (bindingsKeys.length, this.attributes);
            forEach(bindings, function(mode, key) {
                var attrName, parentGet, parentSet, lastValue;
                switch (mode = bindings[key], mode.length > 1 ? (attrName = mode.substring(1), mode = mode[0]) : attrName = key, 
                mode) {
                  case "@":
                    attrs.$observe(attrName, function(value) {
                        isString(value) && (dest[key] = value);
                    }), isString(attrs[attrName]) && (dest[key] = new Interpolate(attrs[attrName]).compile(scope));
                    break;

                  case "=":
                    if (!attrs.hasOwnProperty(attrName)) break;
                    parentGet = this.parse(attrs[attrName]), parentSet = parentGet.assign, lastValue = dest[key] = parentGet(scope);
                    var parentWatcher = function(value) {
                        return isEqual(value, dest[key]) || (isEqual(value, lastValue) ? parentSet(scope, value = dest[key]) : dest[key] = value), 
                        lastValue = value;
                    };
                    scope.watch(attrs[attrName], parentWatcher), dest.watch(key, function(value) {
                        parentWatcher(get(scope, attrs[attrName]));
                    });
                }
            }, this);
        },
        callLink: function(link, scope, transcludeFn) {
            return link(scope, this.node, this.attributes, this.getControllers(link.directiveName, this.node, link.require, this.controllers), transcludeFn), 
            this;
        },
        execute: function(scope, childLink, transcludeFn) {
            var newScope;
            if (this.transclude ? this.transcludeFn = this.transclude.getTranscludeCallback(scope) : !this.transcludeFn && isFunction(transcludeFn) && (this.transcludeFn = transcludeFn), 
            this.scope) switch (this.scope.type) {
              case NodeLink.SCOPE_CHILD:
                newScope = scope.clone();
                break;

              case NodeLink.SCOPE_ISOLATED:
                newScope = scope.clone(!0), this.directiveBindings(scope, newScope, this.scope.bindings);
            } else newScope || (newScope = scope);
            this.context.controllers && (this.controllers = this.setupControllers(newScope, this.node, this.attributes, transcludeFn));
            for (var link, i = 0, links = this.links, ii = links.pre.length; ii > i; i++) link = links.pre[i], 
            this.callLink(link, link.newScopeType ? newScope : scope, this.transcludeFn);
            for (childLink.execute(scope, this.transcludeFn), i = links.post.length - 1; i >= 0; i--) link = links.post[i], 
            this.callLink(link, link.newScopeType ? newScope : scope, this.transcludeFn);
        },
        addLink: function(link, directive) {
            var links = this.links, directiveData = {
                directiveName: directive.name,
                require: directive.require,
                newScopeType: isDefined(directive.scope)
            };
            isObject(link) ? forEach(link, function(value, key) {
                extend(value, directiveData), links.hasOwnProperty(key) && links[key].push(value);
            }) : isFunction(link) && (extend(link, directiveData), links.post.push(link));
        }
    }, Observer.prototype = {
        deliverChangeRecords: function() {
            var i, ii, path, value, watcher, oldValue, keys = Object.keys(this.watchers);
            for (i = 0, ii = keys.length; ii > i; i++) path = keys[i], value = get(this.object, path), 
            watcher = this.watchers[path], oldValue = watcher.oldValue, isObject(value) ? isEqual(value, oldValue) || this.fire(path) : value != oldValue && this.fire(path), 
            watcher.oldValue = clone(value);
        },
        watch: function(path, listener) {
            var watcher, listeners;
            this.watchers.hasOwnProperty(path) ? watcher = this.watchers[path] : this.watchers[path] = watcher = {
                path: path,
                oldValue: void 0,
                listeners: []
            }, listeners = watcher.listeners, listeners.push(listener);
        },
        fire: function(path) {
            var i, ii, watcher = this.watchers[path], listeners = watcher.listeners;
            for (i = 0, ii = listeners.length; ii > i; i++) listeners[i](get(this.object, watcher.path), watcher.oldValue);
            return this;
        }
    }, Parser.prototype = {
        constructor: Parser,
        parse: function(text) {
            return this.astCompiler.compile(text);
        }
    }, Transclude.prototype = {
        getTranscludeCallback: function(defaultScope) {
            var self = this, slots = this.slots, registry = this.registry, compileOptions = this.compileOptions;
            return function(scope, caller, slot) {
                isFunction(scope) && (caller = scope, scope = defaultScope.clone());
                var clone = isString(slot) ? slots[slot] : self.clone, cloned = clone.cloneNode(1), compile = new Compile(cloned, registry, compileOptions);
                caller(cloned), compile.execute(scope);
            };
        }
    };
}(window);