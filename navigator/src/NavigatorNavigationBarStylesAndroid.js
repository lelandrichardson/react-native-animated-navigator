import { Dimensions, Animated } from 'react-native';

var interp = (anim, a, b, c) => anim.interpolate({
  inputRange: [-1, 0, 1],
  outputRange: [a, b, c],
});

// Android Material Design
var NAV_BAR_HEIGHT = 56;
var TITLE_LEFT = 72;
var BUTTON_SIZE = 24;
var TOUCH_TARGT_SIZE = 48;
var BUTTON_HORIZONTAL_MARGIN = 16;

var BUTTON_EFFECTIVE_MARGIN = BUTTON_HORIZONTAL_MARGIN - (TOUCH_TARGT_SIZE - BUTTON_SIZE) / 2;
var NAV_ELEMENT_HEIGHT = NAV_BAR_HEIGHT;

module.exports = {
  General: {
    NavBarHeight: NAV_BAR_HEIGHT,
    StatusBarHeight: 0,
    TotalNavHeight: NAV_BAR_HEIGHT,
  },
  BaseStyles: {
    Title: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'flex-start',
      height: NAV_ELEMENT_HEIGHT,
      backgroundColor: 'transparent',
      marginLeft: TITLE_LEFT,
    },
    LeftButton: {
      position: 'absolute',
      top: 0,
      left: BUTTON_EFFECTIVE_MARGIN,
      overflow: 'hidden',
      height: NAV_ELEMENT_HEIGHT,
      backgroundColor: 'transparent',
    },
    RightButton: {
      position: 'absolute',
      top: 0,
      right: BUTTON_EFFECTIVE_MARGIN,
      overflow: 'hidden',
      alignItems: 'flex-end',
      height: NAV_ELEMENT_HEIGHT,
      backgroundColor: 'transparent',
    },
  },
  Animations: {
    Title: (anim) => ({
      opacity: interp(anim, 0, 1, 0),
    }),
    LeftButton: (anim) => ({
      opacity: interp(anim, 0, 1, 0),
    }),
    RightButton: (anim) => ({
      opacity: interp(anim, 0, 1, 0),
    }),
  },
};
