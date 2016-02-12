import {
  Dimensions,
  PixelRatio,
} from 'react-native';

var buildStyleInterpolator = require('./buildStyleInterpolator');

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;

var mergeTransform = (a, b) => {
  var indexByKey = {};
  var t = a ? a.slice(0) : [];
  t.forEach((transform, i) => {
    var key = Object.keys(transform)[0];
    indexByKey[key] = i;
  });

  if (b) {
    b.forEach(transform => {
      var key = Object.keys(transform)[0];
      if (indexByKey[key] !== undefined) {
        t[indexByKey[key]] = transform;
      } else {
        t.push(transform);
      }
    });
  }
  return t;
};

var mergeAnimations = (a, b) => {
  return Object.assign({}, a, b, { transform: mergeTransform(a.transform, b.transform) });
};

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


//
//var FadeToTheLeft = {
//  // Rotate *requires* you to break out each individual component of
//  // rotation (x, y, z, w)
//  transformTranslate: {
//    from: {x: 0, y: 0, z: 0},
//    to: {x: -Math.round(Dimensions.get('window').width * 0.3), y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  // Uncomment to try rotation:
//  // Quick guide to reasoning about rotations:
//  // http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-17-quaternions/#Quaternions
//  // transformRotateRadians: {
//  //   from: {x: 0, y: 0, z: 0, w: 1},
//  //   to: {x: 0, y: 0, z: -0.47, w: 0.87},
//  //   min: 0,
//  //   max: 1,
//  //   type: 'linear',
//  //   extrapolate: true
//  // },
//  transformScale: {
//    from: {x: 1, y: 1, z: 1},
//    to: {x: 0.95, y: 0.95, z: 1},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true
//  },
//  opacity: {
//    from: 1,
//    to: 0.3,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: false,
//    round: 100,
//  },
//  translateX: {
//    from: 0,
//    to: -Math.round(Dimensions.get('window').width * 0.3),
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  scaleX: {
//    from: 1,
//    to: 0.95,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true
//  },
//  scaleY: {
//    from: 1,
//    to: 0.95,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true
//  },
//};
//
//var FadeToTheRight = {
//  ...FadeToTheLeft,
//  transformTranslate: {
//    from: {x: 0, y: 0, z: 0},
//    to: {x: Math.round(SCREEN_WIDTH * 0.3), y: 0, z: 0},
//  },
//  translateX: {
//    from: 0,
//    to: Math.round(SCREEN_WIDTH * 0.3),
//  }
//};
//
//var FadeIn = {
//  opacity: {
//    from: 0,
//    to: 1,
//    min: 0.5,
//    max: 1,
//    type: 'linear',
//    extrapolate: false,
//    round: 100,
//  },
//};
//
//var FadeOut = {
//  opacity: {
//    from: 1,
//    to: 0,
//    min: 0,
//    max: 0.5,
//    type: 'linear',
//    extrapolate: false,
//    round: 100,
//  },
//};
//
//var ToTheLeft = {
//  transformTranslate: {
//    from: {x: 0, y: 0, z: 0},
//    to: {x: -Dimensions.get('window').width, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  opacity: {
//    value: 1.0,
//    type: 'constant',
//  },
//
//  translateX: {
//    from: 0,
//    to: -Dimensions.get('window').width,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var ToTheUp = {
//  transformTranslate: {
//    from: {x: 0, y: 0, z: 0},
//    to: {x: 0, y: -Dimensions.get('window').height, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  opacity: {
//    value: 1.0,
//    type: 'constant',
//  },
//  translateY: {
//    from: 0,
//    to: -Dimensions.get('window').height,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var ToTheDown = {
//  transformTranslate: {
//    from: {x: 0, y: 0, z: 0},
//    to: {x: 0, y: Dimensions.get('window').height, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  opacity: {
//    value: 1.0,
//    type: 'constant',
//  },
//  translateY: {
//    from: 0,
//    to: Dimensions.get('window').height,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var FromTheRight = {
//  opacity: {
//    value: 1.0,
//    type: 'constant',
//  },
//
//  transformTranslate: {
//    from: {x: Dimensions.get('window').width, y: 0, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//
//  translateX: {
//    from: Dimensions.get('window').width,
//    to: 0,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//
//  scaleX: {
//    value: 1,
//    type: 'constant',
//  },
//  scaleY: {
//    value: 1,
//    type: 'constant',
//  },
//};
//
//var FromTheLeft = {
//  ...FromTheRight,
//  transformTranslate: {
//    from: {x: -SCREEN_WIDTH, y: 0, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  translateX: {
//    from: -SCREEN_WIDTH,
//    to: 0,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var FromTheDown = {
//  ...FromTheRight,
//  transformTranslate: {
//    from: {y: SCREEN_HEIGHT, x: 0, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  translateY: {
//    from: SCREEN_HEIGHT,
//    to: 0,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var FromTheTop = {
//  ...FromTheRight,
//  transformTranslate: {
//    from: {y: -SCREEN_HEIGHT, x: 0, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  translateY: {
//    from: -SCREEN_HEIGHT,
//    to: 0,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var ToTheBack = {
//  // Rotate *requires* you to break out each individual component of
//  // rotation (x, y, z, w)
//  transformTranslate: {
//    from: {x: 0, y: 0, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  transformScale: {
//    from: {x: 1, y: 1, z: 1},
//    to: {x: 0.95, y: 0.95, z: 1},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true
//  },
//  opacity: {
//    from: 1,
//    to: 0.3,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: false,
//    round: 100,
//  },
//  scaleX: {
//    from: 1,
//    to: 0.95,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true
//  },
//  scaleY: {
//    from: 1,
//    to: 0.95,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true
//  },
//};
//
//var FromTheFront = {
//  opacity: {
//    value: 1.0,
//    type: 'constant',
//  },
//
//  transformTranslate: {
//    from: {x: 0, y: Dimensions.get('window').height, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  translateY: {
//    from: Dimensions.get('window').height,
//    to: 0,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  scaleX: {
//    value: 1,
//    type: 'constant',
//  },
//  scaleY: {
//    value: 1,
//    type: 'constant',
//  },
//};
//
//var ToTheBackAndroid = {
//  opacity: {
//    value: 1,
//    type: 'constant',
//  },
//};
//
//var FromTheFrontAndroid = {
//  opacity: {
//    from: 0,
//    to: 1,
//    min: 0.5,
//    max: 1,
//    type: 'linear',
//    extrapolate: false,
//    round: 100,
//  },
//  transformTranslate: {
//    from: {x: 0, y: 100, z: 0},
//    to: {x: 0, y: 0, z: 0},
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//  translateY: {
//    from: 100,
//    to: 0,
//    min: 0,
//    max: 1,
//    type: 'linear',
//    extrapolate: true,
//    round: PixelRatio.get(),
//  },
//};
//
//var BaseOverswipeConfig = {
//  frictionConstant: 1,
//  frictionByDistance: 1.5,
//};
//
//var BaseLeftToRightGesture = {
//
//  // If the gesture can end and restart during one continuous touch
//  isDetachable: false,
//
//  // How far the swipe must drag to start transitioning
//  gestureDetectMovement: 2,
//
//  // Amplitude of release velocity that is considered still
//  notMoving: 0.3,
//
//  // Fraction of directional move required.
//  directionRatio: 0.66,
//
//  // Velocity to transition with when the gesture release was "not moving"
//  snapVelocity: 2,
//
//  // Region that can trigger swipe. iOS default is 30px from the left edge
//  edgeHitWidth: 30,
//
//  // Ratio of gesture completion when non-velocity release will cause action
//  stillCompletionRatio: 3 / 5,
//
//  fullDistance: SCREEN_WIDTH,
//
//  direction: 'left-to-right',
//
//};
//
//var BaseRightToLeftGesture = {
//  ...BaseLeftToRightGesture,
//  direction: 'right-to-left',
//};
//
//var BaseDownUpGesture = {
//  ...BaseLeftToRightGesture,
//  fullDistance: SCREEN_HEIGHT,
//  direction: 'down-to-up',
//};
//
//var BaseUpDownGesture = {
//  ...BaseLeftToRightGesture,
//  fullDistance: SCREEN_HEIGHT,
//  direction: 'up-to-down',
//};

//var BaseConfig = {
//  // A list of all gestures that are enabled on this scene
//  gestures: {
//    pop: BaseLeftToRightGesture, // TODO(lmr)
//  },
//
//  // Rebound spring parameters when transitioning FROM this scene
//  springFriction: 26, // TODO(lmr)
//  springTension: 200, // TODO(lmr)
//
//  // Velocity to start at when transitioning without gesture
//  defaultTransitionVelocity: 1.5, // TODO(lmr)
//
//  // Animation interpolators for horizontal transitioning:
//  animationInterpolators: {
//    into: buildStyleInterpolator(FromTheRight),
//    out: buildStyleInterpolator(FadeToTheLeft),
//  },
//};

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


const componentStyle = {
  Title: (anim) => {

  },
  LeftButton: (anim) => {

  },
  RightButton: (anim) => {

  },
};


var NavigatorSceneConfigs = {
  PushFromRight: configAnimation(FromTheRight, FadeToTheLeft),
  FloatFromRight: configAnimation(FromTheRight, FadeToTheLeft),
  FloatFromLeft: configAnimation(FromTheLeft, FadeToTheRight),
  FloatFromBottom: configAnimation(FromTheFront, ToTheBack),
  Fade: configAnimation(Fade, Fade),
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
  //HorizontalSwipeJump: {
  //  ...BaseConfig,
  //  gestures: {
  //    jumpBack: {
  //      ...BaseLeftToRightGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //    jumpForward: {
  //      ...BaseRightToLeftGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //  },
  //  animationInterpolators: {
  //    into: buildStyleInterpolator(FromTheRight),
  //    out: buildStyleInterpolator(ToTheLeft),
  //  },
  //},
  //HorizontalSwipeJumpFromRight: {
  //  ...BaseConfig,
  //  gestures: {
  //    jumpBack: {
  //      ...BaseRightToLeftGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //    jumpForward: {
  //      ...BaseLeftToRightGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //    pop: BaseRightToLeftGesture,
  //  },
  //  animationInterpolators: {
  //    into: buildStyleInterpolator(FromTheLeft),
  //    out: buildStyleInterpolator(FadeToTheRight),
  //  },
  //},
  //VerticalUpSwipeJump: {
  //  ...BaseConfig,
  //  gestures: {
  //    jumpBack: {
  //      ...BaseDownUpGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //    jumpForward: {
  //      ...BaseDownUpGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //  },
  //  animationInterpolators: {
  //    into: buildStyleInterpolator(FromTheDown),
  //    out: buildStyleInterpolator(ToTheUp),
  //  },
  //},
  //VerticalDownSwipeJump: {
  //  ...BaseConfig,
  //  gestures: {
  //    jumpBack: {
  //      ...BaseUpDownGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //    jumpForward: {
  //      ...BaseUpDownGesture,
  //      overswipe: BaseOverswipeConfig,
  //      edgeHitWidth: null,
  //      isDetachable: true,
  //    },
  //  },
  //  animationInterpolators: {
  //    into: buildStyleInterpolator(FromTheTop),
  //    out: buildStyleInterpolator(ToTheDown),
  //  },
  //},
};

module.exports = NavigatorSceneConfigs;
