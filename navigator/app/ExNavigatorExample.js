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
        initialRoute={Router.getHomeRoute()}
        style={{ flex: 1 }}
        sceneStyle={{ paddingTop: 64 }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
