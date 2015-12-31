function NodeGroup (nodeList) {
	this.nodeList = isArray(nodeList) ? nodeList : [];

	Object.defineProperty(this, 'classList', {
		value: {
			add: bind(this._classList.add, this),
			remove: bind(this._classList.remove, this),
			contains: bind(this._classList.contains, this)
		}
	});
}

NodeGroup.prototype = {
	_classList: {
		add: function() {
			return this.exec('classList.add', arguments);
		},

		remove: function() {
			return this.exec('classList.remove', arguments);
		},

		contains: function() {
			return this.exec('classList.contains', arguments);
		}
	},

	exec: function(method, args) {
		var i = 0,
				fn,
				node,
				keys,
				result,
				context,
				response;

		for(; i < this.nodeList.length; i++) {
			node = this.nodeList[i];

			if(method.indexOf('.') > -1) {
				fn = get(node, method);
				keys = method.split('.');

				context = get(node, first(keys.slice(-2)));
			} else {
				fn = node[method];
				context = node;
			}

			if((response = fn.apply(context, args))) {
				result = response;
			} else {
				result = null;
			}
		}
		return result;
	},

	setAttribute: function() {
		return this.exec('setAttribute', arguments);
	},

	getAttribute: function(key, value) {
		var i = 0;

		for(; i < this.nodeList.length; i++) {
			if(this.nodeList[i].hasAttribute(key)) {
				return this.nodeList[i].getAttribute(key);
			}
		}
	}
};
