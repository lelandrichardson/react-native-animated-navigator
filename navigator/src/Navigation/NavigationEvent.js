import invariant from 'invariant';

class NavigationEventPool {
  constructor() {
    this._list = [];
  }

  get(type, currentTarget, data) {
    var event;
    if (this._list.length > 0) {
      event = this._list.pop();
      event.constructor.call(event, type, currentTarget, data);
    } else {
      event = new NavigationEvent(type, currentTarget, data);
    }
    return event;
  }

  put(event) {
    this._list.push(event);
  }
}

var _navigationEventPool = new NavigationEventPool();

/**
 * The NavigationEvent interface represents any event of the navigation.
 * It contains common properties and methods to any event.
 *
 * == Important Properties ==
 *
 * - target:
 *   A reference to the navigation context that dispatched the event. It is
 *   different from event.currentTarget when the event handler is called during
 *   the bubbling or capturing phase of the event.
 *
 * - currentTarget:
 *   Identifies the current target for the event, as the event traverses the
 *   navigation context tree. It always refers to the navigation context the
 *   event handler has been attached to as opposed to event.target which
 *   identifies the navigation context on which the event occurred.
 *
 * - eventPhase:
 *   Returns an integer value which specifies the current evaluation phase of
 *   the event flow; possible values are listed in NavigationEvent phase
 *   constants below.
 */
class NavigationEvent {

  static pool(type, currentTarget, data) {
    return _navigationEventPool.get(type, currentTarget, data);
  }

  constructor(type, currentTarget, data) {
    this.target = currentTarget;
    this.eventPhase = NavigationEvent.NONE;

    this._type = type;
    this._currentTarget = currentTarget;
    this._data = data;
    this._defaultPrevented = false;
    this._disposed = false;
    this._propagationStopped = false;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get type() {
    return this._type;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get currentTarget() {
    return this._currentTarget;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get data() {
    return this._data;
  }

  /* $FlowFixMe - get/set properties not yet supported */
  get defaultPrevented() {
    return this._defaultPrevented;
  }

  preventDefault() {
    this._defaultPrevented = true;
  }

  stopPropagation() {
    this._propagationStopped = true;
  }

  stop() {
    this.preventDefault();
    this.stopPropagation();
  }

  isPropagationStopped() {
    return this._propagationStopped;
  }

  /**
   * Dispose the event.
   * NavigationEvent shall be disposed after being emitted by
   * `NavigationEventEmitter`.
   */
  dispose() {
    invariant(!this._disposed, 'NavigationEvent is already disposed');
    this._disposed = true;

    // Clean up.
    this.target = null;
    this.eventPhase = NavigationEvent.NONE;
    this._type = null;
    this._currentTarget = null;
    this._data = null;
    this._defaultPrevented = false;

    // Put this back to the pool to reuse the instance.
    _navigationEventPool.put(this);
  }
}

/**
 * Event phase constants.
 * These values describe which phase the event flow is currently being
 * evaluated.
 */

// No event is being processed at this time.
NavigationEvent.NONE = 0;

// The event is being propagated through the currentTarget's ancestor objects.
NavigationEvent.CAPTURING_PHASE = 1;

// The event has arrived at the event's currentTarget. Event listeners registered for
// this phase are called at this time.
NavigationEvent.AT_TARGET = 2;

// The event is propagating back up through the currentTarget's ancestors in reverse
// order, starting with the parent. This is known as bubbling, and occurs only
// if event propagation isn't prevented. Event listeners registered for this
// phase are triggered during this process.
NavigationEvent.BUBBLING_PHASE = 3;

module.exports = NavigationEvent;
