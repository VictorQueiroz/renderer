/**
 * Scanner all the present directives
 * in a dom element
 */
function Scanner(node, registry, maxPriority) {
	this.node = node;
	this.registry = registry;
	this.attributes = new Attributes(this.node),
	this.directives = [];
	this.maxPriority = maxPriority;
}

Scanner.prototype = {
	/**
	 * Check if a set of directives is
	 * multi element
	 */
	isMultiElement: function(name) {
		var i = 0,
				ii,
				directive,
				directives;

		if((directives = this.registry.$$get(name))) {
			for(ii = directives.length; i < ii; i++) {
				directive = directives[i];

				if(directive.multiElement) {
					return true;
				}
			}
		}
		return false;
	},

	scan: function() {
		if(this.directives.length) {
			this.directives = [];
		}

		var MULTI_ELEMENT_DIR_RE = /^(.+)Start$/;

		var node = this.node;
		var attributes = node.attributes;
		var i,
				j,
				jj,
				ii = attributes && attributes.length || 0,
				name = this.normalize(node.nodeName),
				classes,
				attrStartName,
				attrEndName;

		this.add(name, 'E');

		for(i = 0; i < ii; i++) {
			name = this.normalize(attributes[i].name);

			var multiElementMatch = name.match(MULTI_ELEMENT_DIR_RE);
			if(multiElementMatch && this.isMultiElement(multiElementMatch[1])) {
				attrStartName = attributes[i].name;
				attrEndName = attributes[i].name.substr(0, name.length - 3) + 'end';
				name = name.substring(0, name.length - 5);
			}

			this.interpolate(name, attributes[i].value);
			this.attributes[name] = attributes[i].value;
			this.add(name, 'A', attrStartName, attrEndName);
		}

		if(node.nodeType == Node.ELEMENT_NODE) {
			classes = node.className.split(' ');
			jj = classes.length;

			for(j = 0; j < jj; j++) {
				this.add(this.normalize(classes[j]), 'C');
			}
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

	interpolate: function(name, value) {
		this.directives.push({
			priority: 100,
			compile: function() {
				return {
					pre: function(scope, element, attrs) {
						var interpolate = new Interpolate(value);

						if(interpolate.exps.length === 0) {
							return;
						}

            attrs[name] = interpolate.compile(scope);

						scope.watchGroup(interpolate.exps, function() {
							attrs.$set(name, interpolate.compile(scope));
						});
					}
				};
			}
		});
	},

	add: function(name, restrict, startAttrName, endAttrName) {
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
				maxPriority = undefined;
        delete this.maxPriority;
				continue;
			}

			if(startAttrName) {
				directive = inherit(directive, {
					$$start: startAttrName,
					$$end: endAttrName
				});
			}

			this.directives.push(directive);
		}
	},

	normalize: function(name) {
		return camelCase(name);
	}
};
