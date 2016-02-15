import React, {
  Component,
  View,
  Text,
  StyleSheet,
  PropTypes,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';

const propTypes = {};

const defaultProps = {};

const contextTypes = {
  scroll: PropTypes.instanceOf(Animated.Value).isRequired,
};

export default class MarqueeScene extends Component {
  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
  }
  onScroll(e) {
    const { scroll } = this.context;
    const y = e.nativeEvent.contentOffset.y;
    scroll.setValue(y);
  }
  render() {
    return (
      <ScrollView
        style={styles.container}
        onScroll={this.onScroll}
        scrollEventThrottle={16}
      >
        <TouchableOpacity onPress={() => this.props.navigator.parentNavigator.pop()}>
          <View style={[styles.row, { backgroundColor: 'blue' }]} />
        </TouchableOpacity>
        <View style={[styles.row, { backgroundColor: 'red' }]} />
        <View style={[styles.row, { backgroundColor: 'orange' }]} />
        <View style={[styles.row, { backgroundColor: 'green' }]} />
        <View style={[styles.row, { backgroundColor: 'blue' }]} />
        <View style={[styles.row, { backgroundColor: 'red' }]} />
        <View style={[styles.row, { backgroundColor: 'orange' }]} />
        <View style={[styles.row, { backgroundColor: 'green' }]} />
      </ScrollView>
    );
  }
}

MarqueeScene.defaultProps = defaultProps;
MarqueeScene.propTypes = propTypes;
MarqueeScene.contextTypes = contextTypes;

const styles = StyleSheet.create({
  container: {},
  row: {
    height: 200,
  },
});
