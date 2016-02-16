import NavigationEvent from './NavigationEvent';
import NavigationEventEmitter from './NavigationEventEmitter';
import NavigationTreeNode from './NavigationTreeNode';
import invariant from 'invariant';
import { Set } from 'immutable';

var emptyFunction = () => {};

const {
  AT_TARGET,
  BUBBLING_PHASE,
  CAPTURING_PHASE,
} = NavigationEvent;

// Event types that do not support event bubbling, capturing and
// reconciliation API (e.g event.preventDefault(), event.stopPropagation()).
var LegacyEventTypes = Set.of(
  'willfocus',
  'didfocus'
);

/**
 * Class that contains the info and methods for app navigation.
 */
class NavigationContext {
  constructor() {
    this._bubbleEventEmitter = new NavigationEventEmitter(this);
    this._captureEventEmitter = new NavigationEventEmitter(this);
    this._currentRoute = null;

    // Sets the protected property `__node`.
    this.__node = new NavigationTreeNode(this);

    this._emitCounter = 0;
    this._emitQueue = [];

    this.addListener('willfocus', this._onFocus);
    this.addListener('didfocus', this._onFocus);
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get parent() {
    var parent = this.__node.getParent();
      return parent ? parent.getValue() : null;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get top() {
    var result = null;
    var parentNode = this.__node.getParent();
    while (parentNode) {
      result = parentNode.getValue();
      parentNode = parentNode.getParent();
    }
    return result;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get currentRoute() {
    return this._currentRoute;
  }

  appendChild(childContext) {
    this.__node.appendChild(childContext.__node);
  }

  addListener(
    eventType,
    listener,
    useCapture
  ) {
    if (LegacyEventTypes.has(eventType)) {
      useCapture = false;
    }

    var emitter = useCapture ?
                  this._captureEventEmitter :
                  this._bubbleEventEmitter;

    if (emitter) {
      return emitter.addListener(eventType, listener/*, this*/);
    } else {
      return {remove: emptyFunction};
    }
  }

  emit(eventType, data, didEmitCallback) {
    if (this._emitCounter > 0) {
      // An event cycle that was previously created hasn't finished yet.
      // Put this event cycle into the queue and will finish them later.
      var args = Array.prototype.slice.call(arguments);
      this._emitQueue.push(args);
      return;
    }

    this._emitCounter++;

    if (LegacyEventTypes.has(eventType)) {
      // Legacy events does not support event bubbling and reconciliation.
      this.__emit(
        eventType,
        data,
        null,
        {
          defaultPrevented: false,
          eventPhase: AT_TARGET,
          propagationStopped: true,
          target: this,
        }
      );
    } else {
      var targets = [this];
      var parentTarget = this.parent;
      while (parentTarget) {
        targets.unshift(parentTarget);
        parentTarget = parentTarget.parent;
      }

      var propagationStopped = false;
      var defaultPrevented = false;
      var callback = (event) => {
        propagationStopped = propagationStopped || event.isPropagationStopped();
        defaultPrevented = defaultPrevented || event.defaultPrevented;
      };

      // Capture phase
      targets.some((currentTarget) => {
        if (propagationStopped) {
          return true;
        }

        var extraInfo = {
          defaultPrevented,
          eventPhase: CAPTURING_PHASE,
          propagationStopped,
          target: this,
        };

        currentTarget.__emit(eventType, data, callback, extraInfo);
      }, this);

      // bubble phase
      targets.reverse().some((currentTarget) => {
        if (propagationStopped) {
          return true;
        }
        var extraInfo = {
          defaultPrevented,
          eventPhase: BUBBLING_PHASE,
          propagationStopped,
          target: this,
        };
        currentTarget.__emit(eventType, data, callback, extraInfo);
      }, this);
    }

    if (didEmitCallback) {
      var event = NavigationEvent.pool(eventType, this, data);
      propagationStopped && event.stopPropagation();
      defaultPrevented && event.preventDefault();
      didEmitCallback.call(this, event);
      event.dispose();
    }

    this._emitCounter--;
    while (this._emitQueue.length) {
      var args = this._emitQueue.shift();
      this.emit.apply(this, args);
    }
  }

  dispose() {
    // clean up everything.
    this._bubbleEventEmitter && this._bubbleEventEmitter.removeAllListeners();
    this._captureEventEmitter && this._captureEventEmitter.removeAllListeners();
    this._bubbleEventEmitter = null;
    this._captureEventEmitter = null;
    this._currentRoute = null;
  }

  // This method `__method` is protected.
  __emit(
    eventType,
    data,
    didEmitCallback,
    extraInfo
  ) {
    var emitter;
    switch (extraInfo.eventPhase) {
      case CAPTURING_PHASE: // phase = 1
        emitter = this._captureEventEmitter;
        break;

      case AT_TARGET: // phase = 2
        emitter = this._bubbleEventEmitter;
        break;

      case BUBBLING_PHASE: // phase = 3
        emitter = this._bubbleEventEmitter;
        break;

      default:
        invariant(false, 'invalid event phase %s', extraInfo.eventPhase);
    }

    if (extraInfo.target === this) {
      // phase = 2
      extraInfo.eventPhase = AT_TARGET;
    }

    if (emitter) {
      emitter.emit(
        eventType,
        data,
        didEmitCallback,
        extraInfo
      );
    }
  }

  _onFocus(event) {
    invariant(
      event.data && event.data.hasOwnProperty('route'),
      'event type "%s" should provide route',
      event.type
    );

    this._currentRoute = event.data.route;
  }
}

module.exports = NavigationContext;
