var renderer = {},

    $expsCache = {},
    $templateCache = {},

    elCache,
    cacheKey;

renderer.prototype = {
  $$elementCache: {},
  $$cacheKey: 'nd339'
};

elCache = renderer.prototype.$$elementCache;
cacheKey = renderer.prototype.$$cacheKey;

extend(renderer, {
  scan: scan,
  scope: new Scope(),
  apply: apply,
  compile: compile,
  compileNodes: compileNodes,
  interpolate: interpolate,
  templateCache: templateCache,
  parse: parse,
  AST: AST,
  ASTFinder: ASTFinder,
  ASTCompiler: ASTCompiler,
  Lexer: Lexer,
  Scope: Scope,
  Grammar: Grammar,
  Watcher: Watcher,
  Attributes: Attributes,
  EventEmitter: EventEmitter,
  registry: registry,
  controller: controller,
  invokeDirectiveFn: invokeDirectiveFn,
  clearRegistry: clearRegistry,
  hasDirective: hasDirective,
  getDirectives: registry.$$get,
  register: register
});

function registerDirective(name, factory, registry) {
	if(!registry.hasOwnProperty(name)) {
    var directives = [];

		registry[name] = {
			directives: directives,

			executed: false,

			load: function() {
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

function invokeDirectiveFn(factory) {
  return factory.call(null);
}

function hasDirective(name) {
  return registry.hasOwnProperty(name);
}

function clearRegistry() {
  forEach(registry, function(value, name) {
    if(name !== '$$get') delete registry[name];
  });
}

/**
 * Register a directive into registry
 */
function register(name, factory) {
  return registerDirective(name, factory, registry);
}

function parse (exp, cache) {
  if($expsCache.hasOwnProperty(exp) && cache !== false) {
    return $expsCache[exp];
  }

  var lexer = new Lexer(),
      parser = new Parser(lexer);

  return ($expsCache[exp] = parser.parse(exp));
}

function templateCache (path, value) {
  if(isString(path)) {
    if(!value) {
      return $templateCache[path];
    }

    $templateCache[path] = value;
  }
  return null;
}

function controller (ctor, scope, node, attributes, $transcludeFn) {
  return (new ctor(scope, node, attributes, $transcludeFn));
}
