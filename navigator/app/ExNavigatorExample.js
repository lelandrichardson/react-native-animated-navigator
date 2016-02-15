import React, {
  Component,
  View,
  Text,
  StyleSheet,
  PropTypes,
} from 'react-native';

import Navigator from '../src/ExNavigator/index';
import Router from './router';

export default class ExNavigatorExample extends Component {
  render() {
    return (
      <Navigator
        showNavigationBar={false}
        initialRoute={Router.getHomeSceneWithNavigator()}
        style={{ flex: 1 }}
        sceneStyle={{ paddingTop: 0 }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
