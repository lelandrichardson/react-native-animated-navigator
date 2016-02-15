import { Dimensions, Animated } from 'react-native';

var interp = (anim, a, b, c) => anim.interpolate({
  inputRange: [-1, 0, 1],
  outputRange: [a, b, c],
});

var SCREEN_WIDTH = Dimensions.get('window').width;
var NAV_BAR_HEIGHT = 44;
var STATUS_BAR_HEIGHT = 20;
var NAV_HEIGHT = NAV_BAR_HEIGHT + STATUS_BAR_HEIGHT;

module.exports = {
  General: {
    NavBarHeight: NAV_BAR_HEIGHT,
    StatusBarHeight: STATUS_BAR_HEIGHT,
    TotalNavHeight: NAV_HEIGHT,
  },
  BaseStyles: {
    Title: {
      position: 'absolute',
      top: STATUS_BAR_HEIGHT,
      left: 0,
      right: 0,
      alignItems: 'center',
      height: NAV_BAR_HEIGHT,
      backgroundColor: 'transparent',
    },
    LeftButton: {
      position: 'absolute',
      top: STATUS_BAR_HEIGHT,
      left: 0,
      overflow: 'hidden',
      opacity: 1,
      height: NAV_BAR_HEIGHT,
      backgroundColor: 'transparent',
    },
    RightButton: {
      position: 'absolute',
      top: STATUS_BAR_HEIGHT,
      right: 0,
      overflow: 'hidden',
      opacity: 1,
      alignItems: 'flex-end',
      height: NAV_BAR_HEIGHT,
      backgroundColor: 'transparent',
    },
  },
  Animations: {
    Title: (anim) => ({
      left: interp(anim, -SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2),
      opacity: interp(anim, 0, 1, 0),
    }),
    LeftButton: (anim) => ({
      left: interp(anim, -SCREEN_WIDTH / 3, 0, 0),
      opacity: interp(anim, 0, 1, 0),
    }),
    RightButton: (anim) => ({
      opacity: interp(anim, 0, 1, 0),
    }),
  },
};
