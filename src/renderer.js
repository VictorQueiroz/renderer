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
					data = renderer.invokeDirectiveFn(factory);
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
						type: 'EA'
					});

					defaults(options, {
						require: (options.controller && options.name)
					});

					instances.push(options);
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

renderer.invokeDirectiveFn = function(factory) {
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

var expsCache = {},
    _templateCache = {};

function parse (exp, cache) {
  if(expsCache.hasOwnProperty(exp) && cache !== false) {
    return expsCache[exp];
  }

  var parser = new Parser(new Lexer());

  return (expsCache[exp] = parser.parse(exp));
}

function templateCache (path, value) {
  if(isString(path)) {
    if(!value) {
      return _templateCache[path];
    }

    _templateCache[path] = value;
  }
  return null;
}

renderer.compile = function(node, transcludeFn, maxPriority) {
  return compile(node, transcludeFn, maxPriority);
};

extend(renderer, {
  templateCache: templateCache,

  parse: parse,

  Scope: Scope,

  instances: instances,

  _registry: directiveRegistry,

  onDestroyQueue: onDestroyQueue,

  beforeCompileQueue: beforeCompileQueue,

  afterCompileQueue: afterCompileQueue,

  controller: function(ctor, scope, node, attributes, $transcludeFn) {
    return (new ctor(scope, node, attributes, $transcludeFn));
  },
});

global.renderer = renderer;

renderer.prototype = {
	__elementCache: {},
	__cacheKey: '$$$rt339'
};

var elCache = renderer.prototype.__elementCache;
var cacheKey = renderer.prototype.__cacheKey;
