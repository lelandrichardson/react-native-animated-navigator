import React, {
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import NavigatorNavigationBarStylesAndroid from './NavigatorNavigationBarStylesAndroid';
import NavigatorNavigationBarStylesIOS from './NavigatorNavigationBarStylesIOS';
import { Map } from 'immutable';
import guid from './guid';


var COMPONENT_NAMES = ['Title', 'LeftButton', 'RightButton'];

var NavigatorNavigationBarStyles = Platform.OS === 'android'
  ? NavigatorNavigationBarStylesAndroid
  : NavigatorNavigationBarStylesIOS;

var navStatePresentedIndex = function(navState) {
  if (navState.presentedIndex !== undefined) {
    return navState.presentedIndex;
  }
  // TODO: rename `observedTopOfStack` to `presentedIndex` in `NavigatorIOS`
  return navState.observedTopOfStack;
};

var NavigatorNavigationBar = React.createClass({

  propTypes: {
    navigator: React.PropTypes.object,
    routeMapper: React.PropTypes.shape({
      Title: React.PropTypes.func.isRequired,
      LeftButton: React.PropTypes.func.isRequired,
      RightButton: React.PropTypes.func.isRequired,
    }).isRequired,
    navState: React.PropTypes.shape({
      routeStack: React.PropTypes.arrayOf(React.PropTypes.object),
      presentedIndex: React.PropTypes.number,
    }),
    navigationStyles: React.PropTypes.object,
    style: View.propTypes.style,
  },

  statics: {
    Styles: NavigatorNavigationBarStyles,
    StylesAndroid: NavigatorNavigationBarStylesAndroid,
    StylesIOS: NavigatorNavigationBarStylesIOS,
  },

  getDefaultProps() {
    return {
      navigationStyles: NavigatorNavigationBarStyles,
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
    this._reusableProps = {};
    this._components = {};
    this._descriptors = {};

    COMPONENT_NAMES.forEach(componentName => {
      this._components[componentName] = new Map();
      this._descriptors[componentName] = new Map();
    });
  },

  _getReusableProps: function(
    /*string*/componentName,
    /*number*/index
  ) /*object*/ {
    var propStack = this._reusableProps[componentName];
    if (!propStack) {
      propStack = this._reusableProps[componentName] = [];
    }
    var props = propStack[index];
    if (!props) {
      props = propStack[index] = {style:{}};
    }
    return props;
  },

  _updateIndexProgress: function(
    /*number*/progress,
    /*number*/index,
    /*number*/fromIndex,
    /*number*/toIndex
  ) {
    var amount = toIndex > fromIndex ? progress : (1 - progress);
    var oldDistToCenter = index - fromIndex;
    var newDistToCenter = index - toIndex;
    var interpolate;
    if (oldDistToCenter > 0 && newDistToCenter === 0 ||
        newDistToCenter > 0 && oldDistToCenter === 0) {
      interpolate = this.props.navigationStyles.Interpolators.RightToCenter;
    } else if (oldDistToCenter < 0 && newDistToCenter === 0 ||
               newDistToCenter < 0 && oldDistToCenter === 0) {
      interpolate = this.props.navigationStyles.Interpolators.CenterToLeft;
    } else if (oldDistToCenter === newDistToCenter) {
      interpolate = this.props.navigationStyles.Interpolators.RightToCenter;
    } else {
      interpolate = this.props.navigationStyles.Interpolators.RightToLeft;
    }

    COMPONENT_NAMES.forEach(function (componentName) {
      var component = this._components[componentName].get(this.props.navState.routeStack[index]);
      var props = this._getReusableProps(componentName, index);
      if (component && interpolate[componentName](props.style, amount)) {
        component.setNativeProps(props);
      }
    }, this);
  },

  updateProgress: function(
    /*number*/progress,
    /*number*/fromIndex,
    /*number*/toIndex
  ) {
    var max = Math.max(fromIndex, toIndex);
    var min = Math.min(fromIndex, toIndex);
    for (var index = min; index <= max; index++) {
      this._updateIndexProgress(progress, index, fromIndex, toIndex);
    }
  },

  render: function() {
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

  _getComponent: function(
    /*string*/componentName,
    /*object*/route,
    /*number*/index
  ) /*?Object*/ {
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

    var initialStage = index === navStatePresentedIndex(this.props.navState) ?
      this.props.navigationStyles.Stages.Center :
      this.props.navigationStyles.Stages.Left;
    rendered = (
      <View
        ref={(ref) => {
          this._components[componentName] = this._components[componentName].set(route, ref);
        }}
        pointerEvents="box-none"
        style={initialStage[componentName]}>
        {content}
      </View>
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
