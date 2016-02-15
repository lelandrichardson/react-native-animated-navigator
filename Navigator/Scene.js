import React, {
  Component,
  View,
  Text,
  StyleSheet,
  PropTypes,
  Animated,
} from 'react-native';

const propTypes = {
  transition: PropTypes.instanceOf(Animated.Value).isRequired,
  scroll: PropTypes.instanceOf(Animated.Value).isRequired,
};

const childContextTypes = {
  transition: PropTypes.instanceOf(Animated.Value),
  scroll: PropTypes.instanceOf(Animated.Value),
};

const defaultProps = {

};

export default class Scene extends Component {
  setNativeProps(props) {
    this.refs.view.setNativeProps(props);
  }
  getChildContext() {
    return {
      transition: this.props.transition,
      scroll: this.props.scroll,
    };
  }
  render() {
    return (
      <Animated.View
        {...this.props}
        ref="view"
      >
        {this.props.renderScene()}
      </Animated.View>
    );
  }
}

Scene.defaultProps = defaultProps;
Scene.propTypes = propTypes;
Scene.childContextTypes = childContextTypes;
