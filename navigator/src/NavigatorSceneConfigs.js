import {
  Dimensions,
  PixelRatio,
} from 'react-native';

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;

var interp = (anim, a, b, c) => anim.interpolate({
  inputRange: [-1, 0, 1],
  outputRange: [a, b, c],
});

var configAnimation = (enter, exit) => anim => ({
  opacity: interp(anim, exit.opacity, 1.0, enter.opacity),
  transform: [
    { translateX: interp(anim, exit.translateX, 0, enter.translateX) },
    { translateY: interp(anim, exit.translateY, 0, enter.translateY) },
    //{ translateZ: interp(anim, exit.translateZ, 0, enter.translateZ) },
    { scaleX: interp(anim, exit.scaleX, 1, enter.scaleY) },
    { scaleY: interp(anim, 0.95, 1, 1) },
  ],
});



// Styles / Animations
// ===================

var CENTER = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  scaleX: 1,
  scaleY: 1,
};

var FromTheRight = {
  ...CENTER,
  translateX: SCREEN_WIDTH,
};

var FromTheLeft = {
  ...CENTER,
  translateX: -SCREEN_WIDTH,
};

var FromTheUp = {
  ...CENTER,
  translateY: -SCREEN_HEIGHT,
};

var FromTheDown = {
  ...CENTER,
  translateY: SCREEN_HEIGHT,
};


var FadeToTheLeft = {
  ...CENTER,
  opacity: 0.3,
  translateX: -SCREEN_WIDTH * 0.3,
  scaleX: 0.95,
  scaleY: 0.95,
};

var FadeToTheRight = {
  ...FadeToTheLeft,
  translateX: SCREEN_WIDTH * 0.3,
};

var FromTheFront = {
  ...CENTER,
  translateY: SCREEN_HEIGHT,
};

var ToTheBack = {
  ...CENTER,
  scaleX: 0.95,
  scaleY: 0.95,
  opacity: 0.3,
};

var Fade = {
  ...CENTER,
  opacity: 0,
};

var ToTheLeft = {
  ...CENTER,
  translateX: -SCREEN_WIDTH,
};

var ToTheRight = {
  ...CENTER,
  translateX: SCREEN_WIDTH,
};

var ToTheUp = {
  ...CENTER,
  translateY: -SCREEN_HEIGHT,
};

var ToTheDown = {
  ...CENTER,
  translateY: SCREEN_HEIGHT,
};


// Gestures
// ========


var BaseOverswipeConfig = {
  frictionConstant: 1,
  frictionByDistance: 1.5,
};

var BaseLeftToRightGesture = {

  // If the gesture can end and restart during one continuous touch
  isDetachable: false,

  // How far the swipe must drag to start transitioning
  gestureDetectMovement: 2,

  // Amplitude of release velocity that is considered still
  notMoving: 0.3,

  // Fraction of directional move required.
  directionRatio: 0.66,

  // Velocity to transition with when the gesture release was "not moving"
  snapVelocity: 2,

  // Region that can trigger swipe. iOS default is 30px from the left edge
  edgeHitWidth: 30,

  // Ratio of gesture completion when non-velocity release will cause action
  stillCompletionRatio: 3 / 5,

  fullDistance: SCREEN_WIDTH,

  direction: 'left-to-right',

};

var BaseRightToLeftGesture = {
  ...BaseLeftToRightGesture,
  direction: 'right-to-left',
};

var BaseDownUpGesture = {
  ...BaseLeftToRightGesture,
  fullDistance: SCREEN_HEIGHT,
  direction: 'down-to-up',
};

var BaseUpDownGesture = {
  ...BaseLeftToRightGesture,
  fullDistance: SCREEN_HEIGHT,
  direction: 'up-to-down',
};


var NavigatorSceneConfigs = {
  PushFromRight: {
    style: configAnimation(FromTheRight, FadeToTheLeft),
    gestures: {
      pop: BaseLeftToRightGesture,
    },
  },
  FloatFromRight: {
    style: configAnimation(FromTheRight, FadeToTheLeft),
    gestures: {
      pop: BaseLeftToRightGesture,
    },
  },
  FloatFromLeft: {
    style: configAnimation(FromTheLeft, FadeToTheRight),
    gestures: {
      pop: BaseRightToLeftGesture,
    },
  },
  FloatFromBottom: {
    style: configAnimation(FromTheFront, ToTheBack),
    gestures: {
      pop: {
        ...BaseLeftToRightGesture,
        edgeHitWidth: 150,
        direction: 'top-to-bottom',
        fullDistance: SCREEN_HEIGHT,
      },
    },
  },
  Fade: {
    style: configAnimation(Fade, Fade),
  },
  HorizontalSwipeJump: {
    style: configAnimation(FromTheLeft, ToTheRight),
    gestures: {
      jumpBack: {
        ...BaseLeftToRightGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
      jumpForward: {
        ...BaseRightToLeftGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
    },
  },
  HorizontalSwipeJumpFromRight: {
    style: configAnimation(FromTheRight, ToTheLeft),
    gestures: {
      jumpBack: {
        ...BaseRightToLeftGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
      jumpForward: {
        ...BaseLeftToRightGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
      pop: BaseRightToLeftGesture,
    },
  },
  VerticalUpSwipeJump: {
    style: configAnimation(FromTheDown, ToTheUp),
    gestures: {
      jumpBack: {
        ...BaseDownUpGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
      jumpForward: {
        ...BaseDownUpGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
    },
  },
  VerticalDownSwipeJump: {
    style: configAnimation(FromTheUp, ToTheDown),
    gestures: {
      jumpBack: {
        ...BaseUpDownGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
      jumpForward: {
        ...BaseUpDownGesture,
        overswipe: BaseOverswipeConfig,
        edgeHitWidth: null,
        isDetachable: true,
      },
    },
  },
  //FloatFromBottomAndroid: {
  //  ...BaseConfig,
  //  gestures: null,
  //  defaultTransitionVelocity: 3,
  //  springFriction: 20,
  //  animationInterpolators: {
  //    into: buildStyleInterpolator(FromTheFrontAndroid),
  //    out: buildStyleInterpolator(ToTheBackAndroid),
  //  },
  //},
  //FadeAndroid: {
  //  ...BaseConfig,
  //  gestures: null,
  //  animationInterpolators: {
  //    into: buildStyleInterpolator(FadeIn),
  //    out: buildStyleInterpolator(FadeOut),
  //  },
  //},
};

module.exports = NavigatorSceneConfigs;
