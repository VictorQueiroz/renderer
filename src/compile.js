var registry = directiveRegistry;

function compile(node) {
  var nodes;

  if(isArray(node) || (node instanceof NodeList === true)) {
    nodes = node;
    node = null;
  } else {
    nodes = [];
    nodes.push(node);
  }

  var compositeLinkFn = compileNodes(nodes);

  return function(scope) {
    if(compositeLinkFn) {
      compositeLinkFn(scope);
    }
  };
}

/**
 * Apply a set of directives to a node element:
 *  - Execute the compile function of all the directives instances
 *  - Store the retrieved linking functions from the execution of the compile function
 *
 * Returns the node link function
 */
function apply(directives, node, attributes) {
  var i,
      ii,
      linkFn,
      directive,
      terminalPriority = -Number.MAX_VALUE;

  // pre/post links
  var preLinkFns = [],
      postLinkFns = [];

  for(i = 0, ii = directives.length; i < ii; i++) {
    directive = directives[i];

    if(terminalPriority > directive.priority) {
      break; // prevent further processing of directives
    }
    linkFn = directive.compile(node, attributes);

    if(isFunction(linkFn)) {
      addLinkFn(0, linkFn);
    } else if(isObject(linkFn)) {
      addLinkFn(linkFn.pre, linkFn.post);
    }

    if(directive.terminal) {
      nodeLinkFn.terminal = true;
      terminalPriority = Math.max(terminalPriority, directive.priority); // make sure to always get the bigger priority
    }
  }

  function addLinkFn (pre, post, directive) {
    if(pre) {
      preLinkFns.push(pre);
    }

    if(post) {
      postLinkFns.push(post);
    }
  }

  return nodeLinkFn;

  /**
   *  - Executes the pre and post linking functions
   */
  function nodeLinkFn (scope, node, childLinkFn, options) {
    var i,
        linkFn;

    for(i = 0; i < preLinkFns.length; i++) {
      linkFn = preLinkFns[i];
      invokeLinkFn(linkFn,
        scope,
        node,
        attributes
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
        attributes
      );
    }
  };
}

function invokeLinkFn(linkFn, scope, node, attributes) {
  linkFn(scope, node, attributes);
}

function addDirective(name, directives, maxPriority) {
  var i,
      ii,
      instances,
      directive;

  if((instances = registry.$$get(name))) {
    for(i = 0, ii = instances.length; i < ii; i++) {
      directive = instances[i];

      if((isUndefined(maxPriority) || maxPriority > directive.priority)) {
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
      name = camelCase(node.tagName),
      attr,
      attrs = node.attributes;

  addDirective(name, directives, maxPriority);

  for(i = 0, ii = attrs.length; i < ii; i++) {
    attr = attrs[i];
    name = camelCase(attr.name);

    attributes[name] = attr.value;
  }

  directives.sort(byPriority);
}

function compileNodes(nodeList) {
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

    scan(nodeList[i], directives, attributes);

    nodeLinkFn = directives.length ? apply(directives, nodeList[i], attributes) : null;

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

    childLinkFn = childLinkFn ? compileNodes(nodeList[i].childNodes) : null;

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

      if(nodeLinkFn) {
        nodeLinkFn(scope, node, childLinkFn);
      } else if (childLinkFn) {
        childLinkFn(scope, node.childNodes);
      }
    }
  }
}
