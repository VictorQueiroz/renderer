var registry = directiveRegistry;

function compile(node, transcludeFn, maxPriority) {
  var nodes;

  if(isArray(node) || (node instanceof NodeList === true)) {
    nodes = node;
    node = null;
  } else {
    nodes = [];
    nodes.push(node);
  }

  var compositeLinkFn = compileNodes(nodes, transcludeFn, maxPriority);

  return publicLinkFn;

  function publicLinkFn (scope, cloneConnectFn) {
    var linkNodes;

    if(cloneConnectFn) {
      var clones = new Array(nodes.length);

      for(var i = 0; i < clones.length; i++) {
        clones[i] = nodes[i].cloneNode(1);
      }

      linkNodes = clones;
    } else {
      linkNodes = nodes;
    }

    if(cloneConnectFn) cloneConnectFn(linkNodes, scope);
    if(compositeLinkFn) compositeLinkFn(scope, linkNodes);

    return linkNodes;
  }
}

function replaceWith (node, replaceElement) {
  var parent = node.parentNode;

  if(parent) {
    parent.replaceChild(replaceElement, node);
  }
}

function data(node, key, value) {
  if(node && node.nodeType === Node.ELEMENT_NODE) {
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
  }

  return null;
}

function inheritedData (element, name, value) {
  // if element is the document object work with the html element instead
  // this makes $(document).scope() possible
  if (element.nodeType == Node.DOCUMENT_NODE) {
    element = element.documentElement;
  }

  var names = isArray(name) ? name : [name];

  while (element) {
    for (var i = 0, ii = names.length; i < ii; i++) {
      if ((value = data(element, names[i]))) return value;
    }

    // If dealing with a document fragment node with a host element, and no parent, use the host
    // element as the parent. This enables directives within a Shadow DOM or polyfilled Shadow DOM
    // to lookup parent controllers.
    element = element.parentNode || (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE && element.host);
  }
}

function copyData(destElement, srcElement) {
  data(destElement, clone(data(srcElement)));
}

function clearData(element) {
  if(element && element.nodeType === Node.ELEMENT_NODE) {
    if(element.hasOwnProperty(cacheKey)) {
      var id = element[cacheKey];
      delete elCache[id];
    }
  }
}

var REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/;

/**
 * Apply a set of directives to a node element:
 *  - Execute the compile function of all the directives instances
 *  - Store the retrieved linking functions from the execution of the compile function
 *
 * Returns the node link function
 */
function apply(directives, node, attributes, transcludeFn) {
  var i,
      ii,
      linkFn,
      directive,
      directiveValue,
      terminalPriority = -Number.MAX_VALUE,
      childTranscludeFn = transcludeFn;

  var directiveControllers = Object.create(null);

  // pre/post links
  var preLinkFns = [],
      postLinkFns = [];

  for(i = 0, ii = directives.length; i < ii; i++) {
    directive = directives[i];

    if(terminalPriority > directive.priority) {
      break; // prevent further processing of directives
    }

    if(directiveValue = directive.transclude) {
      if(directiveValue == 'element') {
        terminalPriority = directive.priority;

        var template = node;

        node = document.createComment(' ' + directive.name + ': ' + attributes[directive.name] + ' ');
        replaceWith(template, node);

        childTranscludeFn = compile(template, transcludeFn, terminalPriority);
      } else {
        var template = new Array(node.childNodes.length);

        for(var i = 0; i < template.length; i++) {
          template[i] = node.childNodes[i];
        }

        // child nodes naked transclude function generated
        childTranscludeFn = compile(template, transcludeFn);
      }
    }

    if(directiveValue = directive.template) {
      node.innerHTML = directive.template;
    } else if (directive.transclude && directive.transclude !== 'element') {
      node.innerHTML = '';
    }

    if(directive.controller) {
      directiveControllers[directive.name] = directive;
    }

    linkFn = directive.compile(node, attributes, childTranscludeFn);

    if(isFunction(linkFn)) {
      addLinkFn(0, linkFn, directive);
    } else if(isObject(linkFn)) {
      addLinkFn(linkFn.pre, linkFn.post, directive);
    }

    if(directive.terminal) {
      nodeLinkFn.terminal = true;
      terminalPriority = Math.max(terminalPriority, directive.priority); // make sure to always get the bigger priority
    }
  }

  function addLinkFn (pre, post, directive) {
    var require = directive.require,
        directiveName = directive.name;

    if(pre) {
      pre.require = require;
      pre.directiveName = directiveName;

      preLinkFns.push(pre);
    }

    if(post) {
      post.require = require;
      post.directiveName = directiveName;

      postLinkFns.push(post);
    }
  }

  // store the transclude function generated by this node link function
  // so we can pass to the compileNodes() while generating the composite link function
  // to the child nodes of this element in the next lines on the actual compileNodes() loop
  nodeLinkFn.transcludeFn = childTranscludeFn;
  nodeLinkFn.controllers = Object.create(null);

  return nodeLinkFn;

  function setupControllers(directives, controllers, scope, node, attributes, $transcludeFn) {
    var ctor,
        dataName,
        directive;

    for(var name in directives) {
      dataName = '$' + name + 'Controller',
      directive = directives[name],
      ctor = directive.controller;

      if(controllers[name]) {
        continue;
      }

      controllers[name] = renderer.controller(ctor, scope, node, attributes, $transcludeFn);
      data(node, dataName, controllers[name]);
    }
  }

  function getControllers(require, node, controllers, directiveName) {
    var value;

    if(isArray(require)) {
      value = new Array(require.length);

      var i, ii;

      for(i = 0, ii = value.length; i < ii; i++) {
        value[i] = getControllers(require[i], node, controllers, directiveName);
      }

      return value;
    }

    var match = require.match(REQUIRE_PREFIX_REGEXP),
        name = require.substring(match[0].length),
        inheritType = match[1] || match[3],
        optional = match[2] === '?';

    //If only parents then start at the parent element
    if(inheritType === '^^') {
      node = node.parentNode;
    } else {
      value = controllers && controllers[name];
    }

    if(!value) {
      var dataName = '$' + name + 'Controller';
      value = inheritType ? inheritedData(node, dataName) : data(node, dataName);
    }

    if(!value && !optional) {
      throw new Error("Controller '" + name + "', required by directive '" + directiveName + "', can't be found!");
    }

    return value;
  }

  /**
   *  - Executes the pre and post linking functions
   */
  function nodeLinkFn (scope, node, childLinkFn, transcludeFn) {
    var i,
        linkFn,
        controllers = nodeLinkFn.controllers,
        $transcludeFn = (transcludeFn ? scopeBoundTranscludeFn : undefined);

    // instantiate all the directives controllers on this node link function
    setupControllers(directiveControllers, controllers, scope, node, attributes, $transcludeFn);

    for(i = 0; i < preLinkFns.length; i++) {
      linkFn = preLinkFns[i];
      invokeLinkFn(linkFn,
        scope,
        node,
        attributes,
        linkFn.require && getControllers(linkFn.require, node, controllers, linkFn.directiveName),
        $transcludeFn
      );
    }

    if(childLinkFn) {
      childLinkFn(scope, node.childNodes);
    }

    for(i = postLinkFns.length - 1; i >= 0; i--) {
      linkFn = postLinkFns[i];
      invokeLinkFn(linkFn,
        scope,
        node,
        attributes,
        linkFn.require && getControllers(linkFn.require, node, controllers, linkFn.directiveName),
        $transcludeFn
      );
    }

    // bound the transcludeFn to the above passed scope, so we didn't have
    // to pass the scope as we should in a naked transclude function
    function scopeBoundTranscludeFn($scope, cloneAttachFn) {
      if(isFunction($scope)) {
        cloneAttachFn = $scope;
        $scope = scope;
      }

      transcludeFn($scope, cloneAttachFn);
    }
  };
}

function invokeLinkFn(linkFn, scope, node, attributes, controllers, transcludeFn) {
  linkFn(scope, node, attributes, controllers, transcludeFn);
}

function addDirective(name, type, directives, maxPriority) {
  var i,
      ii,
      instances,
      directive;

  if((instances = registry.$$get(name))) {
    for(i = 0, ii = instances.length; i < ii; i++) {
      directive = instances[i];

      if((isUndefined(maxPriority) || maxPriority > directive.priority) && directive.type.indexOf(type) > -1) {
        directives.push(directive);
      }
    }
  }
}

/**
 * Sorting function for bound directives.
 */
function byPriority(a, b) {
  var diff = b.priority - a.priority;
  if (diff !== 0) return diff;
  if (a.name !== b.name) return (a.name < b.name) ? -1 : 1;
  return a.index - b.index;
}

function scan(node, directives, attributes, maxPriority) {
  var i,
      ii,
      name,
      attr,
      attrs,
      classes;

  switch(node.nodeType) {
    case Node.ELEMENT_NODE: /* Element */
      name = camelCase(node.tagName),
      attrs = node.attributes,

      // Element tag name
      addDirective(name, 'E', directives, maxPriority);

      for(i = 0, ii = attrs.length; i < ii; i++) {
        attr = attrs[i];
        name = camelCase(attr.name);

        attributes[name] = attr.value;

        // Attributes
        addDirective(name, 'A', directives, maxPriority);
      }

      classes = node.classList;

      for(i = 0, ii = classes.length; i < ii; i++) {
        name = camelCase(classes[i]);

        // Classes
        addDirective(name, 'C', directives, maxPriority);
      }

      break;
  }

  directives.sort(byPriority);
}

function compileNodes(nodeList, transcludeFn, maxPriority) {
  var i,
      linkFns = [],
      childLinkFn,
      linkFnFound,
      nodeLinkFnFound;

  // node link function variables
  var directives,
      nodeLinkFn,
      attributes;

  for(i = 0; i < nodeList.length; i++) {
    directives = [],
    attributes = new Attributes();

    scan(nodeList[i], directives, attributes, i === 0 ? maxPriority : undefined);

    nodeLinkFn = directives.length ? apply(directives, nodeList[i], attributes, transcludeFn) : null;

    // Check if the node link is terminal or have child nodes to be compiled.
    // If it's a terminal node link function it means that a set of directives
    // must be compiled before the rest of them, according to the priority level
    // The highest priority level directive will be compiled first (as it should)
    // until it reach the terminal directive instance which generates a transclude
    // function to be executed later
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) &&
                  nodeList[i] &&
                  nodeList[i].childNodes &&
                  nodeList[i].childNodes.length;

    childLinkFn = childLinkFn ? compileNodes(nodeList[i].childNodes, nodeLinkFn && nodeLinkFn.transcludeFn ? nodeLinkFn.transcludeFn : transcludeFn) : null;

    if(childLinkFn || nodeLinkFn) {
      linkFnFound = true;
      nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn;

      linkFns.push(i, nodeLinkFn, childLinkFn);
    }
  }

  return (linkFnFound ? compositeLinkFn : null);

  function compositeLinkFn (scope, nodeList) {
    var i,
        node,
        nodeLinkFn,
        childLinkFn,
        transcludeFn,
        stableNodeList;

    // copy node list so if the node link adds or remove a dom element our
    // offsets don't get screw up
    if(nodeLinkFnFound) {
      var idx,
          nodeListLength = nodeList.length;

      stableNodeList = new Array(nodeListLength);

      for(i = 0; i < linkFns.length; i += 3) {
        idx = linkFns[i];
        stableNodeList[idx] = nodeList[idx];
      }
    } else {
      stableNodeList = nodeList;
    }

    for(i = 0; i < linkFns.length;) {
      node = stableNodeList[linkFns[i++]];
      nodeLinkFn = linkFns[i++];
      childLinkFn = linkFns[i++];
      transcludeFn = nodeLinkFn && nodeLinkFn.transcludeFn;

      if(nodeLinkFn) {
        nodeLinkFn(scope, node, childLinkFn, transcludeFn);
      } else if (childLinkFn) {
        childLinkFn(scope, node.childNodes, transcludeFn);
      }
    }
  }
}
