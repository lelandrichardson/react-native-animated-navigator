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

class HomeScene extends Component {
  onPress() {
    this.props.navigator.push(Router.getProfileRoute({
      name: 'New Name!',
    }));
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

module.exports = HomeScene;
