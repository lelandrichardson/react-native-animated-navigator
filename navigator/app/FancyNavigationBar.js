import React, {
  Component,
  View,
  Text,
  StyleSheet,
  PropTypes,
} from 'react-native';

import Navigator from '../src/Navigator/Navigator';

const propTypes = {};

const defaultProps = {};

export default class FancyNavigationBar extends Component {
  render() {
    const { style, anim, scroll } = this.props;

    const opacity = scroll.interpolate({
      inputRange: [0, 100, 125, 126],
      outputRange: [0, 0, 1, 1],
    });

    return (
      <Navigator.NavigationBar
        {...this.props}
        style={[style, {
          opacity,
        }]}
      />
    );
  }
}

FancyNavigationBar.defaultProps = defaultProps;
FancyNavigationBar.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {},
});
