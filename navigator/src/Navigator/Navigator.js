import React, {
  Dimensions,
  StyleSheet,
  PanResponder,
  View,
  PropTypes,
  Animated,
  Easing,
} from 'react-native';

import invariant from 'invariant';
import NavigationContext from './Navigation/NavigationContext';
import NavigatorNavigationBar from './NavigatorNavigationBar';
import NavigatorSceneConfigs from './NavigatorSceneConfigs';
import cloneReferencedElement from 'react-clone-referenced-element';
import clamp from './clamp'; // TODO(lmr): refactor

const easing = Easing.bezier(0.42, 0.97, 0.45, 1);

function getOrCreate(map, key, makeDefault) {
  if (!map.has(key)) {
    map.set(key, makeDefault());
  }
  return map.get(key);
}

const _scrollMap = new Map();
const _transitionMap = new Map();


// TODO: this is not ideal because there is no guarantee that the navigator
// is full screen, however we don't have a good way to measure the actual
// size of the navigator right now, so this is the next best thing.
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SCENE_DISABLED_NATIVE_PROPS = {
  pointerEvents: 'none',
  style: {
    top: SCREEN_HEIGHT,
    bottom: -SCREEN_HEIGHT,
    opacity: 0,
  },
};

const primaryScroll = new Animated.Value(0);

var __uid = 0;
function getuid() {
  return __uid++;
}

function getRouteID(route) {
  if (route === null || typeof route !== 'object') {
    return String(route);
  }

  var key = '__navigatorRouteID';

  if (!route.hasOwnProperty(key)) {
    Object.defineProperty(route, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: getuid(),
    });
  }
  return route[key];
}

// styles moved to the top of the file so getDefaultProps can refer to it
var styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  defaultSceneStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  baseScene: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  disabledScene: {
    top: SCREEN_HEIGHT,
    bottom: -SCREEN_HEIGHT,
  },
  transitioner: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  }
});

var GESTURE_ACTIONS = [
  'pop',
  'jumpBack',
  'jumpForward',
];

/**
 * Use `Navigator` to transition between different scenes in your app. To
 * accomplish this, provide route objects to the navigator to identify each
 * scene, and also a `renderScene` function that the navigator can use to
 * render the scene for a given route.
 *
 * To change the animation or gesture properties of the scene, provide a
 * `configureScene` prop to get the config object for a given route. See
 * `Navigator.SceneConfigs` for default animations and more info on
 * scene config options.
 *
 * ### Basic Usage
 *
 * ```
 *   <Navigator
 *     initialRoute={{name: 'My First Scene', index: 0}}
 *     renderScene={(route, navigator) =>
 *       <MySceneComponent
 *         name={route.name}
 *         onForward={() => {
 *           var nextIndex = route.index + 1;
 *           navigator.push({
 *             name: 'Scene ' + nextIndex,
 *             index: nextIndex,
 *           });
 *         }}
 *         onBack={() => {
 *           if (route.index > 0) {
 *             navigator.pop();
 *           }
 *         }}
 *       />
 *     }
 *   />
 * ```
 *
 * ### Navigator Methods
 *
 * If you have a ref to the Navigator element, you can invoke several methods
 * on it to trigger navigation:
 *
 *  - `getCurrentRoutes()` - returns the current list of routes
 *  - `jumpBack()` - Jump backward without unmounting the current scene
 *  - `jumpForward()` - Jump forward to the next scene in the route stack
 *  - `jumpTo(route)` - Transition to an existing scene without unmounting
 *  - `push(route)` - Navigate forward to a new scene, squashing any scenes
 *     that you could `jumpForward` to
 *  - `pop()` - Transition back and unmount the current scene
 *  - `replace(route)` - Replace the current scene with a new route
 *  - `replaceAtIndex(route, index)` - Replace a scene as specified by an index
 *  - `replacePrevious(route)` - Replace the previous scene
 *  - `resetTo(route)` - Navigate to a new scene and reset route stack
 *  - `immediatelyResetRouteStack(routeStack)` - Reset every scene with an
 *     array of routes
 *  - `popToRoute(route)` - Pop to a particular scene, as specified by its
 *     route. All scenes after it will be unmounted
 *  - `popToTop()` - Pop to the first scene in the stack, unmounting every
 *     other scene
 *
 */
var Navigator = React.createClass({

  propTypes: {
    /**
     * Optional function that allows configuration about scene animations and
     * gestures. Will be invoked with the route and the routeStack and should
     * return a scene configuration object
     *
     * ```
     * (route, routeStack) => Navigator.SceneConfigs.FloatFromRight
     * ```
     */
    configureScene: PropTypes.func,

    /**
     * Required function which renders the scene for a given route. Will be
     * invoked with the route and the navigator object
     *
     * ```
     * (route, navigator) =>
     *   <MySceneComponent title={route.title} navigator={navigator} />
     * ```
     */
    renderScene: PropTypes.func.isRequired,

    /**
     * Specify a route to start on. A route is an object that the navigator
     * will use to identify each scene to render. `initialRoute` must be
     * a route in the `initialRouteStack` if both props are provided. The
     * `initialRoute` will default to the last item in the `initialRouteStack`.
     */
    initialRoute: PropTypes.object,

    /**
     * Provide a set of routes to initially mount. Required if no initialRoute
     * is provided. Otherwise, it will default to an array containing only the
     * `initialRoute`
     */
    initialRouteStack: PropTypes.arrayOf(PropTypes.object),

    /**
     * Optionally provide a navigation bar that persists across scene
     * transitions
     */
    navigationBar: PropTypes.node,

    /**
     * Optionally provide the navigator object from a parent Navigator
     */
    navigator: PropTypes.object,

    /**
     * Styles to apply to the container of each scene
     */
    sceneStyle: View.propTypes.style,
  },

  statics: {
    //BreadcrumbNavigationBar: NavigatorBreadcrumbNavigationBar,
    NavigationBar: NavigatorNavigationBar,
    SceneConfigs: NavigatorSceneConfigs,
  },

  getDefaultProps() {
    return {
      configureScene: () => NavigatorSceneConfigs.PushFromRight,
      sceneStyle: styles.defaultSceneStyle,
      scroll: primaryScroll,
    };
  },

  getInitialState() {
    this._navigationBarNavigator = this.props.navigationBarNavigator || this;

    this._scenesByRoute = new Map();


    var routeStack = this.props.initialRouteStack || [this.props.initialRoute];
    invariant(
      routeStack.length >= 1,
      'Navigator requires props.initialRoute or props.initialRouteStack.'
    );
    var initialRouteIndex = routeStack.length - 1;
    if (this.props.initialRoute) {
      initialRouteIndex = routeStack.indexOf(this.props.initialRoute);
      invariant(
        initialRouteIndex !== -1,
        'initialRoute is not in initialRouteStack.'
      );
      if (this.props.parentScroll) {
        _scrollMap.set(this.props.initialRoute, this.props.parentScroll);
      }
    }
    return {
      sceneConfigStack: routeStack.map(
        (route) => this.props.configureScene(route, routeStack)
      ),
      routeStack,
      presentedIndex: initialRouteIndex,
      transitionFromIndex: null,
      activeGesture: null,
      pendingGestureProgress: null,
      transitionQueue: [],
      gestureAnimation: new Animated.Value(0),
    };
  },

  componentWillMount() {
    // TODO(t7489503): Don't need this once ES6 Class landed.
    this.__defineGetter__('navigationContext', this._getNavigationContext);

    this._subRouteFocus = [];
    this.parentNavigator = this.props.navigator;
    this.panGesture = PanResponder.create({
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderRelease: this._handlePanResponderRelease,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderTerminate: this._handlePanResponderTerminate,
    });
    //this._interactionHandle = null;
    this._emitWillFocus(this.state.routeStack[this.state.presentedIndex]);
  },

  componentDidMount() {
    this._emitDidFocus(this.state.routeStack[this.state.presentedIndex]);
  },

  componentWillUnmount() {
    if (this._navigationContext) {
      this._navigationContext.dispose();
      this._navigationContext = null;
    }
  },

  /**
   * @param {RouteStack} nextRouteStack Next route stack to reinitialize. This
   * doesn't accept stack item `id`s, which implies that all existing items are
   * destroyed, and then potentially recreated according to `routeStack`. Does
   * not animate, immediately replaces and rerenders navigation bar and stack
   * items.
   */
  immediatelyResetRouteStack(nextRouteStack) {
    var destIndex = nextRouteStack.length - 1;
    this.setState({
      routeStack: nextRouteStack,
      sceneConfigStack: nextRouteStack.map(
          route => this.props.configureScene(route, nextRouteStack)
      ),
      presentedIndex: destIndex,
      activeGesture: null,
      transitionFromIndex: null,
      transitionQueue: [],
    }, () => {
      //this._handleSpringUpdate();
      this._navBar && this._navBar.immediatelyRefresh();
    });
  },

  _animValueForIndex(index) {
    return this._scenesByRoute.get(this.state.routeStack[index]).anim;
  },

  _scrollValueForIndex(index) {
    return _scrollMap.get(this.state.routeStack[index]);
  },

  _transitionTo(destIndex, velocity, jumpSpringTo, cb) {
    if (destIndex === this.state.presentedIndex) {
      return;
    }
    if (this.state.transitionFromIndex !== null) {
      this.state.transitionQueue.push({
        destIndex,
        velocity,
        cb,
      });
      return;
    }
    var fromIndex = this.state.presentedIndex;
    this.state.transitionFromIndex = this.state.presentedIndex;
    this.state.presentedIndex = destIndex;
    this.state.transitionCb = cb;
    const dest = this._animValueForIndex(destIndex);
    const current = this._animValueForIndex(fromIndex);
    const destScroll = this._scrollValueForIndex(destIndex);
    const scroll = this.props.scroll;
    const currentToValue = destIndex > fromIndex ? -1 : 1;
    current.stopAnimation();
    dest.stopAnimation();
    scroll.stopAnimation();

    Animated.parallel([
      Animated.timing(dest, { toValue: 0, easing, }),
      Animated.timing(current, { toValue: currentToValue, easing, }),
    ]).start(({ finished }) => {
      if (!finished) {
        dest.setValue(0);
        current.setValue(currentToValue);
      }
      this._completeTransition();
      cb && cb();

      Animated.timing(scroll, {
        toValue: destScroll,
        duration: 0
      }).start();
    });
  },

  /**
   * This happens at the end of a transition started by transitionTo, and when the spring catches up to a pending gesture
   */
  _completeTransition() {
    if (!this.isMounted()) {
      return;
    }

    var presentedIndex = this.state.presentedIndex;
    var didFocusRoute = this._subRouteFocus[presentedIndex] || this.state.routeStack[presentedIndex];
    this._emitDidFocus(didFocusRoute);
    this.state.transitionFromIndex = null;
    this._hideScenes();
    if (this.state.transitionCb) {
      this.state.transitionCb();
      this.state.transitionCb = null;
    }
    if (this.state.pendingGestureProgress) {
      // A transition completed, but there is already another gesture happening.
      // Enable the scene and set the spring to catch up with the new gesture
      var gestureToIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
      this._enableScene(gestureToIndex);
      return;
    }
    if (this.state.transitionQueue.length) {
      var queuedTransition = this.state.transitionQueue.shift();
      this._enableScene(queuedTransition.destIndex);
      this._emitWillFocus(this.state.routeStack[queuedTransition.destIndex]);
      this._transitionTo(
        queuedTransition.destIndex,
        queuedTransition.velocity,
        null,
        queuedTransition.cb
      );
    }
  },

  _emitDidFocus(route) {
    this.navigationContext.emit('didfocus', { route });

    if (this.props.onDidFocus) {
      this.props.onDidFocus(route);
    }
  },

  _emitWillFocus(route) {
    this.navigationContext.emit('willfocus', { route });

    var navBar = this._navBar;
    if (navBar && navBar.handleWillFocus) {
      navBar.handleWillFocus(route);
    }
    if (this.props.onWillFocus) {
      this.props.onWillFocus(route);
    }
  },

  /**
   * Hides all scenes that we are not currently on, gesturing to, or transitioning from
   */
  _hideScenes() {
    var gesturingToIndex = null;
    if (this.state.activeGesture) {
      gesturingToIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
    }
    for (var i = 0; i < this.state.routeStack.length; i++) {
      if (i === this.state.presentedIndex ||
        i === this.state.transitionFromIndex ||
        i === gesturingToIndex) {
        continue;
      }
      this._disableScene(i);
    }
  },

  /**
   * Push a scene off the screen, so that opacity:0 scenes will not block touches sent to the presented scenes
   */
  _disableScene(sceneIndex) {
    this.refs['scene_' + sceneIndex] &&
    this.refs['scene_' + sceneIndex].setNativeProps(SCENE_DISABLED_NATIVE_PROPS);
  },

  /**
   * Put the scene back into the state as defined by props.sceneStyle, so transitions can happen normally
   */
  _enableScene(sceneIndex) {
    // First, determine what the defined styles are for scenes in this navigator
    var sceneStyle = StyleSheet.flatten([styles.baseScene, this.props.sceneStyle]);
    // Then restore the pointer events and top value for this scene
    var enabledSceneNativeProps = {
      pointerEvents: 'auto',
      style: {
        top: sceneStyle.top,
        bottom: sceneStyle.bottom,
      },
    };
    if (sceneIndex !== this.state.transitionFromIndex && sceneIndex !== this.state.presentedIndex) {
      // If we are not in a transition from this index, make sure opacity is 0
      // to prevent the enabled scene from flashing over the presented scene
      enabledSceneNativeProps.style.opacity = 0;
    }
    this.refs['scene_' + sceneIndex] &&
    this.refs['scene_' + sceneIndex].setNativeProps(enabledSceneNativeProps);
  },

  _handleTouchStart() {
    this._eligibleGestures = GESTURE_ACTIONS;
  },

  _handleMoveShouldSetPanResponder(e, gestureState) {
    var sceneConfig = this.state.sceneConfigStack[this.state.presentedIndex];
    if (!sceneConfig) {
      return false;
    }
    this._expectingGestureGrant =
      this._matchGestureAction(this._eligibleGestures, sceneConfig.gestures, gestureState);
    return !!this._expectingGestureGrant;
  },

  _doesGestureOverswipe(gestureName) {
    var wouldOverswipeBack = this.state.presentedIndex <= 0 &&
      (gestureName === 'pop' || gestureName === 'jumpBack');
    var wouldOverswipeForward = this.state.presentedIndex >= this.state.routeStack.length - 1 &&
      gestureName === 'jumpForward';
    return wouldOverswipeForward || wouldOverswipeBack;
  },

  _deltaForGestureAction(gestureAction) {
    switch (gestureAction) {
      case 'pop':
      case 'jumpBack':
        return -1;
      case 'jumpForward':
        return 1;
      default:
        invariant(false, 'Unsupported gesture action ' + gestureAction);
        return;
    }
  },

  _handlePanResponderRelease(e, gestureState) {
    var sceneConfig = this.state.sceneConfigStack[this.state.presentedIndex];
    var releaseGestureAction = this.state.activeGesture;
    if (!releaseGestureAction) {
      // The gesture may have been detached while responder, so there is no action here
      return;
    }
    var releaseGesture = sceneConfig.gestures[releaseGestureAction];
    var destIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
    var isTravelVertical = releaseGesture.direction === 'top-to-bottom' || releaseGesture.direction === 'bottom-to-top';
    var isTravelInverted = releaseGesture.direction === 'right-to-left' || releaseGesture.direction === 'bottom-to-top';
    var velocity, gestureDistance;
    if (isTravelVertical) {
      velocity = isTravelInverted ? -gestureState.vy : gestureState.vy;
      gestureDistance = isTravelInverted ? -gestureState.dy : gestureState.dy;
    } else {
      velocity = isTravelInverted ? -gestureState.vx : gestureState.vx;
      gestureDistance = isTravelInverted ? -gestureState.dx : gestureState.dx;
    }
    var transitionVelocity = clamp(-10, velocity, 10);
    if (Math.abs(velocity) < releaseGesture.notMoving) {
      // The gesture velocity is so slow, is "not moving"
      var hasGesturedEnoughToComplete = gestureDistance > releaseGesture.fullDistance * releaseGesture.stillCompletionRatio;
      transitionVelocity = hasGesturedEnoughToComplete ? releaseGesture.snapVelocity : -releaseGesture.snapVelocity;
    }
    if (transitionVelocity < 0 || this._doesGestureOverswipe(releaseGestureAction)) {
      // This gesture is to an overswiped region or does not have enough velocity to complete
      // If we are currently mid-transition, then this gesture was a pending gesture. Because this gesture takes no action, we can stop here
      if (this.state.transitionFromIndex == null) {
        // There is no current transition, so we need to transition back to the presented index
        var transitionBackToPresentedIndex = this.state.presentedIndex;
        // slight hack: change the presented index for a moment in order to transitionTo correctly
        this.state.presentedIndex = destIndex;
        const dest = this._animValueForIndex(destIndex);
        this._transitionTo(
          transitionBackToPresentedIndex,
          -transitionVelocity,
          1 - dest.__getValue()
        );
      }
    } else {
      // The gesture has enough velocity to complete, so we transition to the gesture's destination
      this._emitWillFocus(this.state.routeStack[destIndex]);
      this._transitionTo(
        destIndex,
        transitionVelocity,
        null,
        () => {
          if (releaseGestureAction === 'pop') {
            this._cleanScenesPastIndex(destIndex);
          }
        }
      );
    }
    this._detachGesture();
  },

  _handlePanResponderTerminate(e, gestureState) {
    if (this.state.activeGesture == null) {
      return;
    }
    var destIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
    this._detachGesture();
    var transitionBackToPresentedIndex = this.state.presentedIndex;
    // slight hack: change the presented index for a moment in order to transitionTo correctly
    this.state.presentedIndex = destIndex;
    const dest = this._animValueForIndex(destIndex);
    this._transitionTo(
      transitionBackToPresentedIndex,
      null,
      1 - dest.__getValue()
    );
  },

  _attachGesture(gestureId) {
    this.state.activeGesture = gestureId;
    var gesturingToIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
    this._enableScene(gesturingToIndex);
    const current = this._animValueForIndex(this.state.presentedIndex);
    const dest = this._animValueForIndex(gesturingToIndex);
    const gesture = this.state.gestureAnimation;

    current.stopAnimation();
    dest.stopAnimation();

    Animated.parallel([
      Animated.timing(current, {
        toValue: gesture.interpolate({
          inputRange: [0, SCREEN_WIDTH],
          outputRange: [0, 1],
        }),
        duration: 0,
      }),
      Animated.timing(dest, {
        toValue: gesture.interpolate({
          inputRange: [0, SCREEN_WIDTH],
          outputRange: [-1, 0],
        }),
        duration: 0,
      }),
    ]).start();
  },

  _detachGesture() {
    this.state.activeGesture = null;
    this.state.pendingGestureProgress = null;
    this._hideScenes();
  },

  _handlePanResponderMove(e, gestureState) {
    if (this._isMoveGestureAttached !== undefined) {
      invariant(
        this._expectingGestureGrant,
        'Responder granted unexpectedly.'
      );
      this._attachGesture(this._expectingGestureGrant);
      this._onAnimationStart();
      this._expectingGestureGrant = undefined;
    }

    var sceneConfig = this.state.sceneConfigStack[this.state.presentedIndex];
    if (this.state.activeGesture) {
      var gesture = sceneConfig.gestures[this.state.activeGesture];
      return this._moveAttachedGesture(gesture, gestureState);
    }
    var matchedGesture = this._matchGestureAction(GESTURE_ACTIONS, sceneConfig.gestures, gestureState);
    if (matchedGesture) {
      this._attachGesture(matchedGesture);
    }
  },

  _moveAttachedGesture(gesture, gestureState) {
    var isTravelVertical = gesture.direction === 'top-to-bottom' || gesture.direction === 'bottom-to-top';
    var isTravelInverted = gesture.direction === 'right-to-left' || gesture.direction === 'bottom-to-top';
    var distance = isTravelVertical ? gestureState.dy : gestureState.dx;
    distance = isTravelInverted ? -distance : distance;
    this.state.gestureAnimation.setValue(distance);
  },

  _matchGestureAction(eligibleGestures, gestures, gestureState) {
    if (!gestures) {
      return null;
    }
    var matchedGesture = null;
    eligibleGestures.some((gestureName, gestureIndex) => {
      var gesture = gestures[gestureName];
      if (!gesture) {
        return;
      }
      if (gesture.overswipe == null && this._doesGestureOverswipe(gestureName)) {
        // cannot swipe past first or last scene without overswiping
        return false;
      }
      var isTravelVertical = gesture.direction === 'top-to-bottom' || gesture.direction === 'bottom-to-top';
      var isTravelInverted = gesture.direction === 'right-to-left' || gesture.direction === 'bottom-to-top';
      var currentLoc = isTravelVertical ? gestureState.moveY : gestureState.moveX;
      var travelDist = isTravelVertical ? gestureState.dy : gestureState.dx;
      var oppositeAxisTravelDist =
        isTravelVertical ? gestureState.dx : gestureState.dy;
      var edgeHitWidth = gesture.edgeHitWidth;
      if (isTravelInverted) {
        currentLoc = -currentLoc;
        travelDist = -travelDist;
        oppositeAxisTravelDist = -oppositeAxisTravelDist;
        edgeHitWidth = isTravelVertical ?
                       -(SCREEN_HEIGHT - edgeHitWidth) :
                       -(SCREEN_WIDTH - edgeHitWidth);
      }
      var moveStartedInRegion = gesture.edgeHitWidth == null ||
        currentLoc < edgeHitWidth;
      if (!moveStartedInRegion) {
        return false;
      }
      var moveTravelledFarEnough = travelDist >= gesture.gestureDetectMovement;
      if (!moveTravelledFarEnough) {
        return false;
      }
      var directionIsCorrect = Math.abs(travelDist) > Math.abs(oppositeAxisTravelDist) * gesture.directionRatio;
      if (directionIsCorrect) {
        matchedGesture = gestureName;
        return true;
      } else {
        this._eligibleGestures = this._eligibleGestures.slice().splice(gestureIndex, 1);
      }
    });
    return matchedGesture || null;
  },

  _handleResponderTerminationRequest() {
    return false;
  },

  _getDestIndexWithinBounds(n) {
    var currentIndex = this.state.presentedIndex;
    var destIndex = currentIndex + n;
    invariant(
      destIndex >= 0,
      'Cannot jump before the first route.'
    );
    var maxIndex = this.state.routeStack.length - 1;
    invariant(
      maxIndex >= destIndex,
      'Cannot jump past the last route.'
    );
    return destIndex;
  },

  _jumpN(n) {
    var destIndex = this._getDestIndexWithinBounds(n);
    this._enableScene(destIndex);
    this._emitWillFocus(this.state.routeStack[destIndex]);
    this._transitionTo(destIndex);
  },

  jumpTo(route) {
    var destIndex = this.state.routeStack.indexOf(route);
    invariant(
      destIndex !== -1,
      'Cannot jump to route that is not in the route stack'
    );
    this._jumpN(destIndex - this.state.presentedIndex);
  },

  jumpForward() {
    this._jumpN(1);
  },

  jumpBack() {
    this._jumpN(-1);
  },

  push(route) {
    invariant(!!route, 'Must supply route to push');
    var activeLength = this.state.presentedIndex + 1;
    var activeStack = this.state.routeStack.slice(0, activeLength);
    var activeAnimationConfigStack = this.state.sceneConfigStack.slice(0, activeLength);
    var nextStack = activeStack.concat([route]);
    var destIndex = nextStack.length - 1;
    var nextAnimationConfigStack = activeAnimationConfigStack.concat([
      this.props.configureScene(route, nextStack),
    ]);
    this._emitWillFocus(nextStack[destIndex]);
    this.setState({
      routeStack: nextStack,
      sceneConfigStack: nextAnimationConfigStack,
    }, () => {
      this._enableScene(destIndex);
      this._transitionTo(destIndex);
    });
  },

  _popN(n) {
    if (n === 0) {
      return;
    }
    invariant(
      this.state.presentedIndex - n >= 0,
      'Cannot pop below zero'
    );
    var popIndex = this.state.presentedIndex - n;
    this._enableScene(popIndex);
    this._emitWillFocus(this.state.routeStack[popIndex]);
    this._transitionTo(
      popIndex,
      null, // default velocity
      null, // no spring jumping
      () => {
        this._cleanScenesPastIndex(popIndex);
      }
    );
  },

  pop() {
    if (this.state.transitionQueue.length) {
      // This is the workaround to prevent user from firing multiple `pop()`
      // calls that may pop the routes beyond the limit.
      // Because `this.state.presentedIndex` does not update until the
      // transition starts, we can't reliably use `this.state.presentedIndex`
      // to know whether we can safely keep popping the routes or not at this
      //  moment.
      return;
    }

    if (this.state.presentedIndex > 0) {
      this._popN(1);
    }
  },

  /**
   * Replace a route in the navigation stack.
   *
   * `index` specifies the route in the stack that should be replaced.
   * If it's negative, it counts from the back.
   */
  replaceAtIndex(route, index, cb) {
    invariant(!!route, 'Must supply route to replace');
    if (index < 0) {
      index += this.state.routeStack.length;
    }

    if (this.state.routeStack.length <= index) {
      return;
    }

    var nextRouteStack = this.state.routeStack.slice();
    var nextAnimationModeStack = this.state.sceneConfigStack.slice();
    nextRouteStack[index] = route;
    nextAnimationModeStack[index] = this.props.configureScene(route, nextRouteStack);

    if (index === this.state.presentedIndex) {
      this._emitWillFocus(route);
    }
    this.setState({
      routeStack: nextRouteStack,
      sceneConfigStack: nextAnimationModeStack,
    }, () => {
      if (index === this.state.presentedIndex) {
        this._emitDidFocus(route);
      }
      cb && cb();
    });
  },

  /**
   * Replaces the current scene in the stack.
   */
  replace(route) {
    this.replaceAtIndex(route, this.state.presentedIndex);
  },

  /**
   * Replace the current route's parent.
   */
  replacePrevious(route) {
    this.replaceAtIndex(route, this.state.presentedIndex - 1);
  },

  popToTop() {
    this.popToRoute(this.state.routeStack[0]);
  },

  popToRoute(route) {
    var indexOfRoute = this.state.routeStack.indexOf(route);
    invariant(
      indexOfRoute !== -1,
      'Calling popToRoute for a route that doesn\'t exist!'
    );
    var numToPop = this.state.presentedIndex - indexOfRoute;
    this._popN(numToPop);
  },

  replacePreviousAndPop(route) {
    if (this.state.routeStack.length < 2) {
      return;
    }
    this.replacePrevious(route);
    this.pop();
  },

  resetTo(route) {
    invariant(!!route, 'Must supply route to push');
    this.replaceAtIndex(route, 0, () => {
      // Do not use popToRoute here, because race conditions could prevent the
      // route from existing at this time. Instead, just go to index 0
      if (this.state.presentedIndex > 0) {
        this._popN(this.state.presentedIndex);
      }
    });
  },

  getCurrentRoutes() {
    // Clone before returning to avoid caller mutating the stack
    return this.state.routeStack.slice();
  },

  _cleanScenesPastIndex(index) {
    var newStackLength = index + 1;
    // Remove any unneeded rendered routes.
    if (newStackLength < this.state.routeStack.length) {
      this.setState({
        sceneConfigStack: this.state.sceneConfigStack.slice(0, newStackLength),
        routeStack: this.state.routeStack.slice(0, newStackLength),
      });
    }
  },

  _renderScene(route, i) {
    const { presentedIndex } = this.state;
    var disabledSceneStyle = null;
    var disabledScenePointerEvents = 'auto';
    if (i !== presentedIndex) {
      disabledSceneStyle = styles.disabledScene;
      disabledScenePointerEvents = 'none';
    }
    const val = i < presentedIndex
      ? -1
      : i > presentedIndex
        ? 1
        : 0;
    const anim = getOrCreate(_transitionMap, route, () => new Animated.Value(val));
    const scroll = getOrCreate(_scrollMap, route, () => new Animated.Value(0));
    const view = (
      <Animated.View
        key={'scene_' + getRouteID(route)}
        ref={'scene_' + i}
        onStartShouldSetResponderCapture={() => this.state.transitionFromIndex != null}
        pointerEvents={disabledScenePointerEvents}
        style={[
          styles.baseScene,
          this.props.sceneStyle,
          this.state.sceneConfigStack[i].style(anim),
        ]}
      >
        {this.props.renderScene(route, this, anim, scroll)}
      </Animated.View>
    );
    return { anim, scroll, view };
  },

  _renderNavigationBar() {
    let { renderNavigationBar } = this.props;
    if (!renderNavigationBar) {
      return null;
    }

    const navBar = renderNavigationBar({
      navigator: this._navigationBarNavigator,
      navState: this.state,
      sceneMap: this._scenesByRoute, // TODO(lmr): do in a way that doesn't expose this structure
      scroll: this.props.scroll,
    });

    if (navBar === null) {
      return navBar;
    }

    return cloneReferencedElement(navBar, {
      ref: (el) => { this._navBar = el; },
    });
  },

  render() {
    var newRenderedSceneMap = new Map();
    var scenes = this.state.routeStack.map((route, index) => {
      var renderedScene;
      if (this._scenesByRoute.has(route) && index !== this.state.presentedIndex) {
        renderedScene = this._scenesByRoute.get(route);
      } else {
        renderedScene = this._renderScene(route, index);
      }
      newRenderedSceneMap.set(route, renderedScene);
      return renderedScene.view;
    });
    this._scenesByRoute = newRenderedSceneMap;
    return (
      <View style={[styles.container, this.props.style]}>
        <View
          style={styles.transitioner}
          {...this.panGesture.panHandlers}
          onTouchStart={this._handleTouchStart}
          onResponderTerminationRequest={this._handleResponderTerminationRequest}
        >
          {scenes}
        </View>
        {this._renderNavigationBar()}
      </View>
    );
  },

  _getNavigationContext() {
    if (!this._navigationContext) {
      this._navigationContext = new NavigationContext();
    }
    return this._navigationContext;
  },
});

module.exports = Navigator;
