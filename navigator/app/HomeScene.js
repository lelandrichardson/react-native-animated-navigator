import React, {
  Component,
  View,
  Text,
  StyleSheet,
  PropTypes,
  TouchableOpacity,
} from 'react-native';

import Router from './router';

const propTypes = {};

const defaultProps = {};

export default class HomeScene extends Component {
  onPress() {
    this.props.navigator.parentNavigator.push(Router.getMarqueeSceneWithNavigator());
  }
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text>Home Scene</Text>
        </View>
        <TouchableOpacity onPress={() => this.onPress()}>
          <Text>Marquee Scene</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

HomeScene.defaultProps = defaultProps;
HomeScene.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {},
});
