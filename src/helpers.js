var isArray = Array.isArray;

function toArray(target) {
	return Array.prototype.slice.apply(target);
}

function isUndefined(target) {
	return typeof target === 'undefined';
}

function isNull (target) {
	return target == null && typeof target == 'object';
}

function isBoolean(target) {
	return typeof target === 'boolean';
}

function isDefined(target) {
	return isUndefined(target) === false;
}

function isDate(value) {
  return toString.call(value) === '[object Date]';
}

function isRegExp(value) {
  return toString.call(value) === '[object RegExp]';
}

function isWindow(value) {
  return toString.call(value) === '[object Window]';
}

function inherit(parent, extra) {
	return extend(Object.create(parent), extra);
}

var EMPTY = '',
    START_SYMBOL = '{',
    END_SYMBOL = '}';

function createError () {
  var i,
      ii,
      vars = toArray(arguments),
      text = [],
      value,
      message = vars.shift(),
      addCharacter = 1;

  for(i = 0, ii = message.length; i < ii; i++) {
    value = message[i];

    if(value == START_SYMBOL) {
      if(message.substring(i).indexOf(END_SYMBOL) === -1) {
        throwError('Unclosed bracket at column ' + i);
      }

      if(addCharacter == 0) {
        throwError('Expecting ' + END_SYMBOL + ' but go ' + value + ' at column ' + i);
      }

      addCharacter = 0;
    } else if (value == END_SYMBOL) {
      addCharacter = 1;
    } else if(addCharacter == 1) {
      text.push(value);
    } else {
      text.push(vars.length > 0 ? vars.shift() : EMPTY);
    }
  }

  return new Error(text.join(EMPTY));
}

function isEqual(o1, o2) {
  var v1,
      v2,
      t1 = typeof o1,
      t2 = typeof o2,
      keys,
      length;

  if(o1 === o2) return true;
  if(o1 === null || o2 === null) return false;

  // Compares the type of each variable
  if(t1 !== t2) return false;

  if(isNumber(o1)) {
    if(o1 != o2) {
      return false;
    }
  } else if(isString(o1)) {
    if(o1.length != o2.length || o1 != o2) {
      return false;
    }
  } else if(isArray(o1)) {
    // Check for difference lengths between arrays
    if(o1.length != o2.length) return false;

    length = o1.length;

    while(length--) {
      if(isEqual(o1[length], o2[length])) {
        continue;
      }

      return false;
    }
  } else if (isObject(o1)) {
    keys = Object.keys(o1);
    length = keys.length;

    while(length--) {
      if(isEqual(o1[keys[length]], o2[keys[length]])) {
        continue;
      }

      return false;
    }
  }

  return true;
}

function sum(array, fn) {
	return array.reduce(fn || function(previousValue, currentValue) {
		return (previousValue + currentValue);
	});
}

function first(array) {
	return array[0];
}

function copy (destination, source, stack) {
	if(isObject(source)) {
		var keys = Object.keys(source);
		var i,
				ii = keys.length,
				key,
				value;

		stack = stack || [];

		for(i = 0; i < ii; i++) {
			key 		= keys[i];
			value 	= source[key];

			stack.push(value);

			if(isObject(value) && stack.indexOf(value) === -1) {
				value = copy(isArray(value) ? [] : {}, value, stack);
			}

			destination[key] = value;
		}

		return destination;
	}
	return source;
}

function clone (object) {
	return copy(isArray(object) ? [] : {}, object);
}

function values (object) {
	var keys = Object.keys(object);
	var i,
			ii = keys.length,
			values = [];
	for(i = 0; i < ii; i++) {
		values[i] = object[keys[i]];
	}
	return values;
}

function some(array, iterator, context) {
	var i,
			ii = array.length,
			result = false;
	for(i = 0; i < ii; i++) {
		if(iterator.call(context, array, i)) {
			result = true;
		}
	}
	return result;
}

function get (object, path) {
	var keys = path.split('.');

	var i,
			ii = keys.length,
			result = object;
	for(i = 0; i < ii; i++) {
		if(result) {
			result = result[keys[i]];
		}
	}

	return result;
}

function set (object, path, value) {
	if(!path) path = '';

	var keys = path.split('.');

	var i,
			ii = keys.length,
			result = object;

	for(i = 0; i < ii; i++) {
		if(!result) result = {};
		if(i === (ii - 1)) {
			result[keys[i]] = value;
		} else if(result && result.hasOwnProperty(keys[i])) {
			result = result[keys[i]];
		} else {
			result = result[keys[i]] = {};
		}
	}

	return result;
}

function has (object, path) {
	var keys = path.split('.');

	var i,
			ii = keys.length,
			has = false,
			result = object;

	for(i = 0; i < ii; i++) {
		has = false;

		if(!result) result = {};
		if(result.hasOwnProperty(keys[i])) {
			result = result[keys[i]];
		} else {
			break;
		}

		has = true;
	}

	return has;
}

function noop() {
	return;
}

function isObject (value) {
	return value !== null && (typeof value === 'object');
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
	if(!target) target = {};

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
		if((source = sources[i]) && isObject(source)) {
			keys = Object.keys(source);
			jj = keys.length;

			for(j = 0; j < jj; j++) {
				key 					= keys[j];
				value 				= source[key];

				target[key] 	= value;
			}
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
	var length;

	if(isArray(array)) {
		for(i = 0, length = array.length; i < length; i++) {
			iterator.call(context, array[i], i, array);
		}
	} else {
		var keys = Object.keys(array);
		var ii = keys.length, i, key, value;

		for(i = 0; i < ii; i++) {
			key = keys[i];
			value = array[key];

			iterator.call(context, value, key, array);
		}
	}
	return array;
}

function map (array, iterator, context) {
  var i,
      cloned = isArray(array) ? [] : {};

  if(isArray(array)) {
    for(i = 0; i < array.length; i++) {
      cloned[i] = iterator.call(context, array[i], i, array);
    }
  } else if (isObject(array)) {
    var keys = Object.keys(array);

    for(i = 0; i < keys.length; i++) {
      cloned[keys[i]] = iterator.call(context, array[keys[i]], keys[i], array);
    }
  }

  return cloned;
}

function camelCase (str) {
	return (str = str.replace(/[^A-z]/g, ' ')) && lowercase(str).replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index == 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function kebabCase(str) {
	return lowercase(str.replace(/[A-Z]/g, '-$&'));
}

function toString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  var result = value == null ? '' : (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

function lowercase(str) {
	return String(str).toLowerCase();
}

function lazy(callback, context) {
	return function() {
		return bind(callback, context);
	};
}

function last(array) {
	return array && array[array.length - 1];
}

function bind(callback, context) {
	return function() {
		return callback.apply(context, arguments);
	};
}

function inherits (ctor, superCtor, attrs, ctorAttrs) {
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
	ctor.prototype = Object.create(superCtor.prototype);

	if(attrs) {
		extend(ctor.prototype, attrs);
	}

  if(ctorAttrs) {
    extend(ctor, ctorAttrs);
  }
}

var id = 0;
function nextId() {
	return ++id;
}

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
