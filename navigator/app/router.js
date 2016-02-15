import React, {
  View,
  Text,
  Image
} from 'react-native';
import Navigator from '../src/ExNavigator/index';
import HomeScene from './HomeScene';
import MarqueeScene from './MarqueeScene';
import FancyNavigationBar from './FancyNavigationBar';

var Button = require('react-native-button');

export default Router = {
  getHomeSceneWithNavigator() {
    return {
      renderScene(props) {
        return (
          <Navigator
            {...props}
            initialRoute={Router.getHomeScene()}
            sceneStyle={{ paddingTop: 64 }}
          />
        );
      },
    };
  },

  getHomeScene() {
    return {
      // Return a React component class for the scene. It receives a prop
      // called `navigator` that you can use to push on more routes.
      getSceneClass: () => HomeScene,

      // When this scene receives focus, you can run some code. We're just
      // proxying the `didfocus` event that Navigator emits, so refer to
      // Navigator's source code for the semantics.
      onDidFocus(event) {
        console.log('Home Scene received focus.');
      },

      // Return a string to display in the title section of the navigation bar.
      // This route's title is displayed next to the back button when you push
      // a new route on top of this one.
      getTitle() {
        return 'Home';
      },
    };
  },

  getMarqueeSceneWithNavigator() {
    return {
      renderScene(props) {
        return (
          <Navigator
            {...props}
            initialRoute={Router.getMarqueeScene()}
            sceneStyle={{ paddingTop: 0 }}
            renderNavigationBar={props => <FancyNavigationBar {...props} />}
          />
        );
      },
    };
  },

  getMarqueeScene() {
    return {
      // You can also render a scene yourself when you need more control over
      // the props of the scene component
      renderScene(props) {
        return (
          <MarqueeScene {...props} />
        );
      },

      // There are onWillBlur and onDidBlur events when the scene loses focus.
      // These events occur when another scene will focus or did focus,
      // respectively. The difference between "will" and "did" is the start and
      // end of the scene transition.
      onDidBlur(event) {
      },

      // You can render arbitrary views for the title component. Note that you
      // also need to implement getTitle if you want the title of this route to
      // show up in the back button to it.
      renderTitle() {
        return (
          <View style={styles.container}>
            <Text style={styles.titleName}>Marquee!</Text>
          </View>
        );
      },

      getTitle() {
        return "Marquee!";
      },

      // Render the view to display on the right side of the navigation bar. It
      // is typically a button but doesn't have to be.
      renderRightButton() {
        return (
          <Button onPress={() => { console.log('Tapped right button'); }}>
            Log
          </Button>
        );
      },
    };
  },
};

var styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleName: {
    marginLeft: 5,
    fontWeight: 'bold'
  },
  titlePhoto: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
};
