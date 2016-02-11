import { InteractionManager } from 'react-native';
/**
 * This mixin provides safe versions of InteractionManager start/end methods
 * that ensures `clearInteractionHandle` is always called
 * once per start, even if the component is unmounted.
 */
const InteractionMixin = {
  componentWillUnmount: function() {
    while (this._interactionMixinHandles.length) {
      InteractionManager.clearInteractionHandle(
        this._interactionMixinHandles.pop()
      );
    }
  },

  _interactionMixinHandles: [],

  createInteractionHandle() {
    var handle = InteractionManager.createInteractionHandle();
    this._interactionMixinHandles.push(handle);
    return handle;
  },

  clearInteractionHandle(clearHandle) {
    InteractionManager.clearInteractionHandle(clearHandle);
    this._interactionMixinHandles = this._interactionMixinHandles.filter(
        handle => handle !== clearHandle
    );
  },

  /**
   * Schedule work for after all interactions have completed.
   *
   * @param {function} callback
   */
  runAfterInteractions(callback) {
    InteractionManager.runAfterInteractions(callback);
  },
};

module.exports = InteractionMixin;
