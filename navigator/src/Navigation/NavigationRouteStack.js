import { List, Set, Record } from 'immutable';
import invariant from 'invariant';

function isRouteEmpty(route) {
  return (route === undefined || route === null || route === '') || false;
}

var _nextID = 0;

class RouteNode {
  constructor(route) {
    // Key value gets bigger incrementally. Developer can compare the
    // keys of two routes then know which route is added to the stack
    // earlier.
    this.key = String(_nextID++);

    this.value = route;
  }
}

var StackDiffRecord = Record({
  key: null,
  route: null,
  index: null,
});

/**
 * The immutable route stack.
 */
class RouteStack {
  constructor(index, routeNodes) {
    invariant(
      routeNodes.size > 0,
      'size must not be empty'
    );

    invariant(
      index > -1 && index <= routeNodes.size - 1,
      'index out of bound'
    );

    this._routeNodes = routeNodes;
    this._index = index;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get size() {
    return this._routeNodes.size;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get index() {
    return this._index;
  }

  toArray() {
    var result = [];
    var ii = 0;
    var nodes = this._routeNodes;
    while (ii < nodes.size) {
      result.push(nodes.get(ii).value);
      ii++;
    }
    return result;
  }

  get(index) {
    if (index < 0 || index > this._routeNodes.size - 1) {
      return null;
    }
    return this._routeNodes.get(index).value;
  }

  /**
   * Returns the key associated with the route.
   * When a route is added to a stack, the stack creates a key for this route.
   * The key will persist until the initial stack and its derived stack
   * no longer contains this route.
   */
  keyOf(route) {
    if (isRouteEmpty(route)) {
      return null;
    }
    var index = this.indexOf(route);
    return index > -1 ?
      this._routeNodes.get(index).key :
      null;
  }

  indexOf(route) {
    if (isRouteEmpty(route)) {
      return -1;
    }

    var finder = (node) => {
      return node.value === route;
    };

    return this._routeNodes.findIndex(finder, this);
  }

  slice(begin, end) {
    var routeNodes = this._routeNodes.slice(begin, end);
    var index = Math.min(this._index, routeNodes.size - 1);
    return this._update(index, routeNodes);
  }

  /**
   * Returns a new stack with the provided route appended,
   * starting at this stack size.
   */
  push(route) {

    invariant(
      !isRouteEmpty(route),
      'Must supply route to push'
    );

    invariant(this._routeNodes.indexOf(route) === -1, 'route must be unique');

    // When pushing, removes the rest of the routes past the current index.
    var routeNodes = this._routeNodes.withMutations((list: List) => {
      list.slice(0, this._index + 1).push(new RouteNode(route));
    });

    return this._update(routeNodes.size - 1, routeNodes);
  }

  /**
   * Returns a new stack a size ones less than this stack,
   * excluding the last index in this stack.
   */
  pop() {
    invariant(this._routeNodes.size > 1, 'shoud not pop routeNodes stack to empty');

    // When popping, removes the rest of the routes past the current index.
    var routeNodes = this._routeNodes.slice(0, this._index);
    return this._update(routeNodes.size - 1, routeNodes);
  }

  jumpToIndex(index) {
    invariant(
      index > -1 && index < this._routeNodes.size,
      'index out of bound'
    );

    return this._update(index, this._routeNodes);
  }

  /**
   * Replace a route in the navigation stack.
   *
   * `index` specifies the route in the stack that should be replaced.
   * If it's negative, it counts from the back.
   */
  replaceAtIndex(index, route) {
    invariant(
      !isRouteEmpty(route),
      'Must supply route to replace'
    );

    if (this.get(index) === route) {
      return this;
    }

    invariant(this.indexOf(route) === -1, 'route must be unique');

    if (index < 0) {
      index += this._routeNodes.size;
    }

    invariant(
      index > -1 && index < this._routeNodes.size,
      'index out of bound'
    );

    var routeNodes = this._routeNodes.set(index, new RouteNode(route));
    return this._update(index, routeNodes);
  }

  // Iterations
  forEach(callback, context) {
    var ii = 0;
    var nodes = this._routeNodes;
    while (ii < nodes.size) {
      var node = nodes.get(ii);
      callback.call(context, node.value, ii, node.key);
      ii++;
    }
  }

  mapToArray(callback, context) {
    var result = [];
    this.forEach((route, index, key) => {
      result.push(callback.call(context, route, index, key));
    });
    return result;
  }

  /**
   * Returns a Set excluding any routes contained within the stack given.
   */
  subtract(stack) {
    var items = [];
    this._routeNodes.forEach((node, index) => {
      if (!stack._routeNodes.contains(node)) {
        items.push(
          new StackDiffRecord({
            route: node.value,
            index: index,
            key: node.key,
          })
        );
      }
    });
    return new Set(items);
  }

  _update(index, routeNodes) {
    if (this._index === index && this._routeNodes === routeNodes) {
      return this;
    }
    return new RouteStack(index, routeNodes);
  }
}

/**
 * The first class data structure for NavigationContext to manage the navigation
 * stack of routes.
 */
class NavigationRouteStack extends RouteStack {
  constructor(index, routeNodes) {
    // For now, `RouteStack` internally,  uses an immutable `List` to keep
    // track of routeNodes. Since using `List` is really just the implementation
    // detail, we don't want to accept `routeNodes` as `list` from constructor
    // for developer.
    var nodes = routeNodes.map((route) => {
      invariant(!isRouteEmpty(route), 'route must not be mepty');
      return new RouteNode(route);
    });

    super(index, new List(nodes));
  }
}

module.exports = NavigationRouteStack;
