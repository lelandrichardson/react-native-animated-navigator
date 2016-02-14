/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import NavigatorExample from './app/NavigatorExample';
import ExNavigatorExample from './app/ExNavigatorExample';

class navigator extends Component {
  componentDidMount() {
    //this.props.navigator.listenToScrollView(this.refs.scrollView);
  }
  render() {
    //return (
    //  <Animated.ScrollView scrollY={this.context.scrollY}>
    //    <HeroMarquee>
    //      <NavigatorButtonRow>
    //        <Button />
    //        <Button />
    //      </NavigatorButtonRow>
    //    </HeroMarquee>
    //  </Animated.ScrollView>
    //);

    return (
      <ExNavigatorExample />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('navigator', () => navigator);
