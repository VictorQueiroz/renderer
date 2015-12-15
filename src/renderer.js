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

renderer.bootstrap = function(element) {
  renderer.rootElement = element;

  var rootScope = renderer._rootScope = new renderer.Scope();

  return renderer.compile(element)(scope);
};

extend(renderer, {
	Scope: Scope,
	Compile: Compile,

	_registry: directiveRegistry
});

global.renderer = renderer;

renderer.prototype = {
	__elementCache: {},

	__cacheKey: '$$$rt339'
};

var elCache = renderer.prototype.__elementCache;
var cacheKey = renderer.prototype.__cacheKey;
