import EventEmitter from 'eventemitter2'; // TODO(lmr): refactor
import NavigationEvent from './NavigationEvent';

class NavigationEventEmitter extends EventEmitter.EventEmitter2 {
  constructor(target) {
    super();
    this._emitting = false;
    this._emitQueue = [];
    this._target = target;
  }

  _superEmit(args) {
    return EventEmitter.EventEmitter2.prototype.emit.call(this, ...args);
  }

  emit(
    eventType,
    data,
    didEmitCallback,
    extraInfo
  ) {
    if (this._emitting) {
      // An event cycle that was previously created hasn't finished yet.
      // Put this event cycle into the queue and will finish them later.
      var args = Array.prototype.slice.call(arguments);
      this._emitQueue.unshift(args);
      return;
    }

    this._emitting = true;

    var event = NavigationEvent.pool(eventType, this._target, data);

    if (extraInfo) {
      if (extraInfo.target) {
        event.target = extraInfo.target;
      }

      if (extraInfo.eventPhase) {
        event.eventPhase = extraInfo.eventPhase;
      }

      if (extraInfo.defaultPrevented) {
        event.preventDefault();
      }

      if (extraInfo.propagationStopped) {
        event.stopPropagation();
      }
    }

    // EventEmitter#emit only takes `eventType` as `String`. Casting `eventType`
    // to `String` to make @flow happy.
    this._superEmit(String(eventType), event);

    if (typeof didEmitCallback === 'function') {
      didEmitCallback.call(this._target, event);
    }
    event.dispose();

    this._emitting = false;

    while (this._emitQueue.length) {
      var args = this._emitQueue.shift();
      this.emit.apply(this, args);
    }
  }
}

module.exports = NavigationEventEmitter;
