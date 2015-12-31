var global = window;

var renderer = {};

var directiveRegistry = {
	$$get: function(name) {
		return getFromRegistry(name, directiveRegistry);
	}
};

function registerDirective(name, factory, registry) {
	if(!registry.hasOwnProperty(name)) {
		registry[name] = {
			directives: [],

			executed: false,

			load: function() {
				var directives = this.directives;
				var data,
						options,
						directive,
						instances = [];

				forEach(directives, function(factory, index) {
					data = renderer.invokeFactory(factory);
					options = {};

					if(isFunction(data)) {
						options.compile = lazy(data);
					} else if (!data.compile && data.link) {
						options.compile = lazy(data.link);
					} else if (!data.compile && !data.link) {
						data.compile = noop;
					}

					if(isObject(data)) {
						extend(options, data);
					}

					defaults(options, {
						priority: 0,
						index: index,
						name: name,
						restrict: 'EA'
					});

					defaults(options, {
						require: (options.controller && options.name)
					});

					directive = new Directive(name, options);
					instances.push(directive);
				});

				return instances;
			}
		};
	}

	registry[name].directives.push(factory);
}

function getFromRegistry(name, registry) {
	registry = registry;
	name = name || '';

	if(!registry.hasOwnProperty(name)) {
		return null;
	}

	var loader = registry[name];

	if(!loader.executed) {
		extend(loader, {
			load: loader.load(),
			executed: true
		});
	}

	return loader.load;
}

renderer.invokeFactory = function(factory) {
	return factory.call(null);
};

renderer.clearRegistry = function() {
	forEach(directiveRegistry, function(value, name) {
		if(name !== '$$get') delete directiveRegistry[name];
	});

	return this;
};

renderer.hasDirective = function(name) {
	return directiveRegistry.hasOwnProperty(name);
};

renderer.getDirectives = directiveRegistry.$$get;

renderer.register = function(name, factory) {
	return registerDirective(name, factory, directiveRegistry);
};

var expsCache = {};

renderer.parse = function(exp, cache) {
	if(expsCache.hasOwnProperty(exp) && cache != false) {
		return expsCache[exp];
	}

	var parser = new Parser(new Lexer());

	return (expsCache[exp] = parser.parse(exp));
};

var templateCache = {};

renderer.templateCache = function (path, value) {
	if(isString(path)) {
		if(!value) {
			return templateCache[path];
		}

		templateCache[path] = value;
	}
	return null;
};

renderer.compile = function(node) {
	var compile = new Compile(node, directiveRegistry);

	return function(scope) {
		return compile.execute(scope);
	};
};

var instances = [],
    onDestroyQueue = [],
    beforeCompileQueue = [],
    afterCompileQueue = [];

extend(renderer, {
  Scope: Scope,
  Compile: Compile,
  instances: instances,
  _registry: directiveRegistry,
  onDestroyQueue: onDestroyQueue,
  beforeCompileQueue: beforeCompileQueue,
  afterCompileQueue: afterCompileQueue,

  beforeCompile: function(fn) {
    beforeCompileQueue.unshift(fn);

    return renderer;
  },

  afterCompile: function(fn) {
    afterCompileQueue.unshift(fn);

    return renderer;
  },

  onDestroyRunningApp: function(fn) {
    onDestroyQueue.unshift(fn);

    return renderer;
  },

  bootstrap: function(element) {
    var i,
        args = [],
        instance = {},
        rootElement = element,
        rootScope = new renderer.Scope(),
        bootstrapArgs = toArray(arguments);

    args.push(rootScope);

    for(var i = 0; i < bootstrapArgs.length; i++) {
      args.push(bootstrapArgs[i]);
    }

    for(i = beforeCompileQueue.length - 1; i >= 0; i--) {
      beforeCompileQueue[i].apply(instance, args);
    }

    if(rootElement instanceof Node === true) {
      instance.clonedElement = rootElement.cloneNode(1);
    } else if (isObject(rootElement)) {
      instance.clonedElement = clone(rootElement);
    }

    var destroyQueue = [];

    extend(instance, {
      link: renderer.compile(rootElement),
      rootScope: rootScope,
      rootElement: rootElement,

      onDestroy: function(fn) {
        destroyQueue.unshift(fn);

        return instance;
      },

      destroy: function() {
        var j;

        for(j = onDestroyQueue.length - 1; j >= 0; j--) {
          onDestroyQueue[j](instance);
        }

        for(j = destroyQueue.length - 1; j >= 0; j--) {
          destroyQueue[j]();
        }
      }
    });

    instance.link(rootScope);

    for(i = afterCompileQueue.length - 1; i >= 0; i--) {
      afterCompileQueue[i].apply(instance, args);
    }

    instances.push(instance);

    return instance;
  }
});

renderer.onDestroyRunningApp(function(instance) {
  var i = instances.indexOf(instance);

  if(i > -1) {
    instances.splice(i, 1);
  }
});

global.renderer = renderer;

renderer.prototype = {
	__elementCache: {},

	__cacheKey: '$$$rt339'
};

var elCache = renderer.prototype.__elementCache;
var cacheKey = renderer.prototype.__cacheKey;
