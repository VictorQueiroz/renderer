(function() { "use strict"; var renderer = {};
var isArray = Array.isArray;

function toArray(target) {
	return Array.prototype.slice.apply(target);
}

function isUndefined(target) {
	return typeof target === 'undefined';
}

function isDefined(target) {
	return isUndefined(target) === false;
}

function clone (object) {
	var keys = Object.keys(object);
	var i, ii = keys.length, key, value;
	var cloned = {};

	for(i = 0; i < ii; i++) {
		key 		= keys[i];
		value 	= object[key];

		if(isObject(value)) {
			value = clone(value);
		}

		cloned[key] = value;
	}

	return cloned;
}

function noop() {
	return;
}

function isObject (value) {
	return typeof value === 'object';
}

function isString (value) {
	return typeof value === 'string';
}

function isFunction (value) {
	return typeof value === 'function';
}

function isNumber (value) {
	return typeof value === 'number';
}

function pick(object, keys) {
	if(isString(keys)) {
		keys = [keys];
	}

	var i,
			ii = keys.length,
			key,
			cloned = {};

	for(i = 0; i < ii; i++) {
		key = keys[i];

		cloned[key] = object[key];
	}

	return cloned;
}

function omit(object, keys) {
	if(isString(keys)) {
		keys = [keys];
	}

	var objectKeys = Object.keys(object).filter(function(key) {
		return keys.indexOf(key) > -1;
	});

	return pick(object, objectKeys);
}

function extend (target) {
	var sources = toArray(arguments).slice(1).filter(isDefined);

	var source,
			value,
			keys,
			key,
			ii = sources.length,
			jj,
			i,
			j;

	for(i = 0; i < ii; i++) {
		source = sources[i];

		keys = Object.keys(source);

		jj = keys.length;

		for(j = 0; j < jj; j++) {
			key 					= keys[j];
			value 				= source[key];

			target[key] 	= value;
		}
	}

	return target;
}

function defaults (object, source) {
	var keys = Object.keys(source);
	var i, ii = keys.length, key, value;

	for(i = 0; i < ii; i++) {
		key 		= keys[i];
		value		= source[key];

		if(!object.hasOwnProperty(key)) {
			object[key] = value;
		}
	}
}

function forEach (array, iterator, context) {
	var keys = Object.keys(array);
	var ii = keys.length, i, key, value;

	for(i = 0; i < ii; i++) {
		key = keys[i];
		value = array[key];

		iterator.call(context, value, key, array);
	}
}

function camelCase (str) {
  return (str = str.replace(/[^A-z]/g, ' ')) && lowercase(str).replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function lowercase(str) {
	return String(str).toLowerCase();
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

function inherits (ctor, superCtor, attrs) {
  if (ctor === undefined || ctor === null)
    throw new TypeError('The constructor to "inherits" must not be ' +
                        'null or undefined');

  if (superCtor === undefined || superCtor === null)
    throw new TypeError('The super constructor to "inherits" must not ' +
                        'be null or undefined');

  if (superCtor.prototype === undefined)
    throw new TypeError('The super constructor to "inherits" must ' +
                        'have a prototype');

  ctor.super_ = superCtor;
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype);

  if(attrs) {
  	extend(ctor.prototype, attrs);
  }
}

var id = 0;
function nextId() {
	return ++id;
}

renderer.prototype = {
	__elementCache: {},

	__cacheKey: '$$$rt339'
};

var elCache = renderer.prototype.__elementCache;
var cacheKey = renderer.prototype.__cacheKey;

function elementData(node, key, value) {
	if(!node.hasOwnProperty(cacheKey)) {
		node[cacheKey] = nextId();

		elCache[node[cacheKey]] = {};
	}

	var cache = elCache[node[cacheKey]];

	if(!key) {
		return cache;
	}

	if(!value && cache.hasOwnProperty(key)) {
		return cache[key];
	} else if(value) {
		cache[key] = value;
	}

	return null;
}

function elementInheritedData(element, name, value) {
  // if element is the document object work with the html element instead
  // this makes $(document).scope() possible
  if (element.nodeType == Node.DOCUMENT_NODE) {
    element = element.documentElement;
  }
  
  var names = isArray(name) ? name : [name];

  while (element) {
    for (var i = 0, ii = names.length; i < ii; i++) {
      if (value = elementData(element, names[i])) return value;
    }

    // If dealing with a document fragment node with a host element, and no parent, use the host
    // element as the parent. This enables directives within a Shadow DOM or polyfilled Shadow DOM
    // to lookup parent controllers.
    element = element.parentNode || (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE && element.host);
  }
}

function request (url, successFn, errorFn) {
	var xhr = new XMLHttpRequest();

	if(!successFn) {
		throw new Error('you must pass a success callback');
	}

	xhr.addEventListener('readystatechange', function(e) {
		if(xhr.readyState == XMLHttpRequest.DONE) {
			setTimeout(function() {
				successFn(xhr.responseText);
			});
		}
	});

	xhr.open('GET', url, true);
	xhr.send(null);
}
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
/**
 * Scanner all the present directives
 * in a dom element
 */
function Scanner(node, registry, maxPriority) {
	this.node = node;
	this.registry = registry;
	this.attributes = {},
	this.directives = [];
	this.maxPriority = maxPriority;
}

Scanner.prototype = {
	scan: function() {
		if(this.directives.length) {
			this.directives = [];
		}

		var node = this.node;

		var attributes = node.attributes;
		var name,
				i,
				ii = attributes && attributes.length || 0;

		this.add(this.normalize(node.nodeName), 'E');

		for(i = 0; i < ii; i++) {
			if(attributes[i].name == 'class') {
				var classes = attributes[i].value.split(' ');
				var j,
						jj = classes.length;
				for(j = 0; j < jj; j++) {
					this.add(this.normalize(classes[j]), 'C');
				}
			}

			name = this.normalize(attributes[i].name);

			this.attributes[name] = attributes[i].value;

			this.add(name, 'A');
		}

		/**
     * Sorting function for bound directives.
     */
    this.directives.sort(function (a, b) {
      var diff = b.priority - a.priority;
      if (diff !== 0) return diff;
      if (a.name !== b.name) return (a.name < b.name) ? -1 : 1;
      return a.index - b.index;
    });

		return this.directives;
	},

	add: function(name, restrict) {
		var directives = this.registry.$$get(name);
		var maxPriority = this.maxPriority;

		if(!directives) {
			return null;
		}

		var i,
				ii = directives.length,
				directive;

		for(i = 0; i < ii; i++) {
			directive = directives[i];

			if(directive.restrict.indexOf(restrict) === -1 ||
				(isDefined(maxPriority) && !(directive.priority > maxPriority))) {
				this.clearPriority();
				continue;
			}

			this.directives.push(directive);
		}
	},

	normalize: function(name) {
		return camelCase(name);
	},

	clearPriority: function() {
		delete this.maxPriority;	
	}
};
function Compile(node, registry, options) {
	this.node = node;
	this.options = options || {};
	this.registry = registry;
	this.prepare();
}

Compile.prototype = {
	prepare: function() {
		if(this.node instanceof DocumentFragment === true) {
			this.node = this.node.childNodes;
		}

		if ((this.node instanceof NodeList === true ||
				isArray(this.node) === true) && this.node.length > 0) {
			this.compositeLink = new CompositeLink(this.node, this.registry, this.options);
		} else if(this.node instanceof Node === true) {
			var scanner = new Scanner(this.node, this.registry, this.options.maxPriority);

			var directives = scanner.scan();
			var attributes = scanner.attributes;

			this.compositeLink = new NodeLink(this.node, directives, attributes);
			this.compositeLink.prepare(this.registry);

			this.childLink = new Compile(this.node.childNodes, this.registry, extend(clone(this.options), {
				// We need to clear the 'maxPriority' here, for we don't
				// want to skip directives that shouldn't be skipped, since
				// the 'maxPriority' is defined before to prevent that the same
				// node directive gets recompiled twice.
				maxPriority: undefined
			}));
		}
	},

	execute: function(scope, transcludeFn) {
		if(this.compositeLink) {
			this.compositeLink.execute(scope, this.childLink, transcludeFn);
		} else if(this.childLink) {
			this.childLink.execute(scope, transcludeFn);
		}
	}
};
/**
 * Compile an entire NodeList instance, different of
 * NodeLink, which compiles only a single node and are
 * capable of execute the compile child link of the node
 */
function CompositeLink (nodeList, registry, options) {
	this.options = options;
	this.nodeList = nodeList;
	this.registry = registry;

	var i,
			nodeLink,
			nodeLinks = [],
			childLink,
			hasChildNodes,
			attributes,
			directives = [];

	for(i = 0; i < nodeList.length; i++) {
		scanner = new Scanner(nodeList[i], this.registry, i === 0 ? this.options.maxPriority : undefined);

		directives = scanner.scan();
		attributes = scanner.attributes;

		hasChildNodes = nodeList[i].childNodes &&
										nodeList[i].childNodes.length > 0 &&
										nodeList[i].childNodes ||
										0;

		nodeLink = new NodeLink(nodeList[i], directives, attributes);
		nodeLink.prepare(registry);

		childLink = new Compile(hasChildNodes ? nodeList[i].childNodes : [], this.registry, this.options);

		nodeLinks.push(nodeLink, childLink);
	}

	this.nodeLinks = nodeLinks;
}

CompositeLink.prototype = {
	execute: function(scope, childLink, transcludeFn) {
		var i, ii = this.nodeLinks.length;

		for(i = 0; i < ii; i++) {
			this.nodeLinks[i].execute(scope, this.nodeLinks[++i], transcludeFn);
		}
	}
};
function Directive(name, options) {
	if(name) {
		this.name = name;
	}

	if(isObject(options)) extend(this, options);
}
function EventEmitter() {
	this._events = {};
}

EventEmitter.prototype = {
	on: function(name, listener) {
		if(!this._events.hasOwnProperty(name)) {
			this._events[name] = [];
		}

		this._events[name].push(listener);

		return this;
	},

	off: function(name, listener) {
		var listeners = this._events[name];
		var i;

		for(i = 0; i < listeners.length; i++) {
			if(listeners[i] == listener) {
				listeners.splice(i, 1);
			}
		}

		return this;
	},

	emit: function(name) {
		var args = toArray(arguments).slice(1);
		var i,
				listeners;

		if(this._events.hasOwnProperty(name)) {
			listeners = this._events[name];

			for(i = 0; i < listeners.length; i++) {
				listeners[i].apply(this, args);
			}
		}

		if(listeners && listeners.length > 0) {
			return true;
		}

		return false;
	}
};
function NodeLink(node, directives, attributes, context) {
	this.node = node;
	this.links = {
		post: [],
		pre: []
	};

	this.context = context || {};
	this.attributes = attributes;
	this.directives = directives;
	this.transclude = null;
	this.terminalPriority = -Number.MAX_VALUE;
}

NodeLink.prototype = {
	prepare: function(registry) {
		var i,
				ii = this.directives.length,
				options,
				context = this.context,
				directive;

		for(i = 0; i < ii; i++) {
			directive = this.directives[i];

			if (this.terminalPriority > directive.priority) {
        break; // prevent further processing of directives
      }

      if(!directive.templateUrl && directive.controller) {
      	// The list of all the
      	// directives controllers.
      	context.controllers = context.controllers || {};
      	context.controllers[directive.name] = directive;
      }

      if(!directive.transclude && directive.template) {
      	directive.transclude = true;
      }

			if(directive.transclude) {
				if(directive.transclude == 'element') {
					this.terminalPriority = directive.priority;
				}

				options = {
					type: directive.transclude,
					registry: registry,
					directive: directive,
					attributes: this.attributes,
					controllers: context.controllers,
					terminalPriority: this.terminalPriority,
				};

				this.transclude = new Transclude(this.node, options);

				if(directive.transclude == 'element' &&
					this.node !== this.transclude.comment) {
					this.node = this.transclude.comment;
				}

				this.transcludeFn = this.transclude.getTranscludeCallback();
			}

			if(directive.template) {
				if(isArray(directive.template)) {
					directive.template = directive.template.join('');
				}

				this.node.innerHTML = directive.template;
				this.hasTemplate = true;
			}

			this.addLink(directive.compile(this.node, this.attributes, this.transcludeFn), directive);

			if(directive.terminal) {
				this.terminal = true;
				this.terminalPriority = Math.max(this.terminalPriority, directive.priority);
			}
		}
	},

	REQUIRE_PREFIX_REGEXP: /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,

	getControllers: function(directiveName, node, require, controllers) {
		var value;

    if (isString(require)) {
      var match = require.match(this.REQUIRE_PREFIX_REGEXP);
      var name = require.substring(match[0].length);
      var inheritType = match[1] || match[3];
      var optional = match[2] === '?';

      //If only parents then start at the parent element
      if (inheritType === '^^') {
        $element = $element.parent();
      //Otherwise attempt getting the controller from controllers in case
      //the element is transcluded (and has no data) and to avoid .data if possible
      } else {
        value = controllers && controllers[name];
        value = value && value.instance;
      }

      if (!value) {
        var dataName = '$' + name + 'Controller';
        value = inheritType ? elementInheritedData(node, dataName) : elementData(node, dataName);
      }

      if (!value && !optional) {
        throw new Error("Controller '" + name + "', required by " +
        								"directive '" + directiveName + "', can't " +
        								"be found!");
      }
    } else if (isArray(require)) {
      value = [];
      for (var i = 0, ii = require.length; i < ii; i++) {
        value[i] = this.getControllers(directiveName, node, require[i], controllers);
      }
    }

    return value || null;
	},

	invokeLinks: function(type) {
		var args = toArray(arguments).slice(1);
		var links = this.links[type];
		var i, ii = links.length;

		for(i = 0; i < ii; i++) {
			if(args[3] == null) {
				args[3] = this.getControllers(links[i].directiveName, this.node, links[i].require, this.controllers);
			}

			links[i].apply(null, args);
		}
	},

	instantiate: function(directive, Controller) {
		return new Controller();
	},

	setupControllers: function(scope, node, attributes, transcludeFn) {
		var i,
				keys = Object.keys(this.context.controllers),
				directive,
				controller,
				controllers = {};
		
		for(i = 0; i < keys.length; i++) {
			directive = this.context.controllers[keys[i]];

			if(isFunction(directive.controller)) {
				controller = this.instantiate(directive, directive.controller);
			} else {
				continue;
			}

			controllers[directive.name] = controller;

			elementData(node, '$' + directive.name + 'Controller', controllers[directive.name]);
		}

		return controllers;
	},

	execute: function(scope, childLink, transcludeFn) {
		if(this.transclude) {
			this.transcludeFn = this.transclude.getTranscludeCallback(scope);
		} else if (!this.transcludeFn && isFunction(transcludeFn)) {
			this.transcludeFn = transcludeFn;
		}

		if(this.context.controllers) {
			this.controllers = this.setupControllers(scope, this.node, this.attributes, transcludeFn);
		}

		this.invokeLinks('pre', scope, this.node, this.attributes, null, this.transcludeFn);

		childLink.execute(scope, this.transcludeFn);

		this.invokeLinks('post', scope, this.node, this.attributes, null, this.transcludeFn);
	},

	addLink: function(link, directive) {
		var links = this.links;

		if(isObject(link)) {
			forEach(link, function(value, key) {
				extend(value, {
					directiveName: directive.name,
					require: directive.require
				});

				if(links.hasOwnProperty(key)) {
					links[key].push(value);
				}
			});
		} else if(isFunction(link)) {
			extend(link, {
				directiveName: directive.name,
				require: directive.require
			});

			links.post.push(link);
		}
	}
};
function Scope(parent) {
	this.$parent = parent;
}

inherits(Scope, EventEmitter, {
	$$createChildScopeClass: function() {
		var parent = this;

		function ChildScope() {
			Scope.call(this, parent);
		}

		ChildScope.prototype = parent;

		return ChildScope;
	},

	$new: function(isolate, parent) {
		var child;

		parent = parent || this;

		if(isolate) {
			child = new Scope();
		} else {
			// Only create a child scope class if somebody asks for one,
      // but cache it to allow the VM to optimize lookups.
      if (!this.$$ChildScope) {
        this.$$ChildScope = this.$$createChildScopeClass();
      }

      child = new this.$$ChildScope();
		}

		return child;
	}
});
function Transclude(node, options) {
	this.node = node;
	
	if(isObject(options)) {
		extend(this, options);
	}

	this.compileOptions = {};

	if(isNumber(this.terminalPriority)) {
		this.compileOptions.maxPriority = this.terminalPriority;
	}

	var i;

	if(this.type == 'element') {
		var name = this.directive.name;
		var attrs = this.attributes;

		var parent = this.node.parentNode;
		var comment = document.createComment(' ' + name + ': ' + attrs[name] + ' ');

		if(!this.clone) {
			this.clone = this.node.cloneNode(1);
		}

		if(parent) {
			parent.replaceChild(comment, this.node);
		}

		this.comment = comment;
	} else {
		var fragment = document.createDocumentFragment();
		var childNodes = [];

		for(i = 0; i < this.node.childNodes.length; i++) {
			childNodes[i] = this.node.childNodes[i];
		}

		for(i = 0; i < childNodes.length; i++) {
			fragment.appendChild(childNodes[i]);
		}

		this.clone = fragment;
	}

	if(isObject(this.type)) {
		var key,
				keys = Object.keys(this.type),
				slots = {},
				optional,
				slotName,
				slotNames = {},
				filledSlots = {};

		for(i = 0; i < keys.length; i++) {
			key = keys[i];
			slotName = this.type[key];

			optional = (slotName.charAt(0) === '?');
			slotName = optional ? slotName.substring(1) : slotName;

			slotNames[key] = slotName;
			slots[slotName] = document.createDocumentFragment();
			// filledSlots contains `true` for all slots that are either optional or have been
      // filled. This is used to check that we have not missed any required slots
      filledSlots[slotName] = optional;
		}

		// Add the matching elements into their slot
		for(i = 0; i < this.clone.childNodes.length; i++) {
			slotName = slotNames[camelCase(this.clone.childNodes[i].nodeName)];

			if(slotName) {
				filledSlots[slotName] = true;
				slots[slotName].appendChild(this.clone.childNodes[i].cloneNode(1));
			}
		}

		this.slots = slots;
	}
}

Transclude.prototype = {
	getTranscludeCallback: function(defaultScope) {
		var self = this;
		var slots = this.slots;
		var registry = this.registry;
		var compileOptions = this.compileOptions;

		return function(scope, caller, slot) {
			if(isFunction(scope)) {
				caller = scope;
				scope = defaultScope.$new();
			}

			var clone = isString(slot) ? slots[slot] : self.clone;
			var cloned = clone.cloneNode(1);

			var compile = new Compile(cloned, registry, compileOptions);

			caller(cloned);

			compile.execute(scope);
		};
	}
};}());