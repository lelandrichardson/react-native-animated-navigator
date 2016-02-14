import React, {
  Component,
  View,
  Text,
  StyleSheet,
  PropTypes,
} from 'react-native';

const propTypes = {};

const defaultProps = {};

class MarqueeScene extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Home Scene</Text>
      </View>
    );
  }
}

MarqueeScene.defaultProps = defaultProps;
MarqueeScene.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {},
});

module.exports = MarqueeScene;
