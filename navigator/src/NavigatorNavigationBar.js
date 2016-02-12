import React, {
  Platform,
  View,
  StyleSheet,
  Animated,
  PropTypes,
} from 'react-native';
import NavigatorNavigationBarStylesAndroid from './NavigatorNavigationBarStylesAndroid';
import NavigatorNavigationBarStylesIOS from './NavigatorNavigationBarStylesIOS';
import { Map } from 'immutable';
import guid from './guid';

var COMPONENT_NAMES = ['Title', 'LeftButton', 'RightButton'];

var NavigationBarStyles = Platform.OS === 'android'
  ? NavigatorNavigationBarStylesAndroid // TODO(lmr):
  : NavigatorNavigationBarStylesIOS;

var NavigatorNavigationBar = React.createClass({

  propTypes: {
    navigator: PropTypes.object,
    routeMapper: PropTypes.shape({
      Title: PropTypes.func.isRequired,
      LeftButton: PropTypes.func.isRequired,
      RightButton: PropTypes.func.isRequired,
    }).isRequired,
    navState: PropTypes.shape({
      routeStack: PropTypes.arrayOf(PropTypes.object),
      presentedIndex: PropTypes.number,
    }),
    navigationStyles: PropTypes.object,
    style: View.propTypes.style,
  },

  statics: {
    Styles: NavigationBarStyles,
    StylesAndroid: NavigatorNavigationBarStylesAndroid,
    StylesIOS: NavigatorNavigationBarStylesIOS,
  },

  getDefaultProps() {
    return {
      navigationStyles: NavigationBarStyles,
    };
  },

  componentWillMount: function() {
    this._reset();
  },

  /**
   * Stop transtion, immediately resets the cached state and re-render the
   * whole view.
   */
  immediatelyRefresh() {
    this._reset();
    this.forceUpdate();
  },

  _reset() {
    this._key = guid();
    this._descriptors = {};

    COMPONENT_NAMES.forEach(componentName => {
      this._descriptors[componentName] = new Map();
    });
  },

  render() {
    var navBarStyle = {
      height: this.props.navigationStyles.General.TotalNavHeight,
    };
    var navState = this.props.navState;
    var components = navState.routeStack.map((route, index) =>
      COMPONENT_NAMES.map(componentName =>
        this._getComponent(componentName, route, index)
      )
    );

    return (
      <View
        key={this._key}
        style={[styles.navBarContainer, navBarStyle, this.props.style]}>
        {components}
      </View>
    );
  },

  _getComponent(componentName, route, index) {
    if (this._descriptors[componentName].includes(route)) {
      return this._descriptors[componentName].get(route);
    }

    var rendered = null;

    var content = this.props.routeMapper[componentName](
      this.props.navState.routeStack[index],
      this.props.navigator,
      index,
      this.props.navState
    );

    if (!content) {
      return null;
    }

    const { anim } = this.props.sceneMap.get(route);
    rendered = (
      <Animated.View
        pointerEvents="box-none"
        style={[
          NavigationBarStyles.BaseStyles[componentName],
          NavigationBarStyles.Animations[componentName](anim)
        ]}
      >
        {content}
      </Animated.View>
    );

    this._descriptors[componentName] = this._descriptors[componentName].set(route, rendered);
    return rendered;
  },

});


var styles = StyleSheet.create({
  navBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});

module.exports = NavigatorNavigationBar;
