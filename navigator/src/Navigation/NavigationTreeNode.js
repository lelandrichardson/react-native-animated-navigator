
import invariant from 'invariant';
import { List } from 'immutable';

/**
 * Utility to build a tree of nodes.
 * Note that this tree does not perform cyclic redundancy check
 * while appending child node.
 */
class NavigationTreeNode {
  constructor(value) {
    this.__parent = null;
    this._children = new List();
    this._value = value;
  }

  getValue() {
    return this._value;
  }

  getParent() {
    return this.__parent;
  }

  getChildrenCount() {
    return this._children.size;
  }

  getChildAt(index) {
    return index > -1 && index < this._children.size ?
      this._children.get(index) :
      null;
  }

  appendChild(child) {
    if (child.__parent) {
      child.__parent.removeChild(child);
    }
    child.__parent = this;
    this._children = this._children.push(child);
  }

  removeChild(child) {
    var index = this._children.indexOf(child);

    invariant(
      index > -1,
      'The node to be removed is not a child of this node.'
    );

    child.__parent = null;

    this._children = this._children.splice(index, 1);
  }

  indexOf(child) {
    return this._children.indexOf(child);
  }

  forEach(callback, context) {
    this._children.forEach(callback, context);
  }

  map(callback, context) {
    return this._children.map(callback, context).toJS();
  }

  some(callback, context) {
    return this._children.some(callback, context);
  }
}


module.exports = NavigationTreeNode;
