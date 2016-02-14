'use strict';

import React, {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import invariant from 'invariant';
import cloneReferencedElement from 'react-clone-referenced-element';

import ExNavigatorStyles from './ExNavigatorStyles';
import NavigatorSceneConfigs from '../Navigator/NavigatorSceneConfigs';
import Layout from './Layout';

import { BackIcon } from './ExNavigatorIcons';

class NavigationBarRouteMapper {
  constructor(navigator, styles) {
    this._navigator = navigator;
    this._titleStyle = styles.titleStyle;
    this._barButtonTextStyle = styles.barButtonTextStyle;
    this._barButtonIconStyle = styles.barButtonIconStyle;
  }

  Title(route, navigator, index, state) {
    if (route.renderTitle) {
      return route.renderTitle(this._navigator, index, state);
    }

    if (!route.getTitle) {
      return null;
    }

    return (
      <Text style={[ExNavigatorStyles.barTitleText, this._titleStyle]}>
        {shortenTitle(route.getTitle(this._navigator, index, state))}
      </Text>
    );
  }

  LeftButton(route, navigator, index, state) {

    if (route.renderLeftButton) {
      return route.renderLeftButton(this._navigator, index, state);
    }

    if (index === 0) {
      return null;
    }

    return this._renderBackButton(route, index, state);
  }

  _renderBackButton(route, index, state,) {
    let previousIndex = index - 1;
    let previousRoute = state.routeStack[previousIndex];
    if (previousRoute.renderBackButton) {
      return previousRoute.renderBackButton(this._navigator, previousIndex, state);
    }

    let defaultRenderBackButton = this._navigator.props.renderBackButton;
    if (defaultRenderBackButton) {
      return defaultRenderBackButton(this._navigator, previousIndex, state);
    }

    let title;
    if (route.getBackButtonTitle){
      title = route.getBackButtonTitle(this._navigator, index, state);
    } else if (previousRoute.getTitle) {
      title = previousRoute.getTitle(this._navigator, previousIndex, state);
    }

    let buttonText;
    if (title) {
      buttonText =
        <Text
          numberOfLines={1}
          style={[
            ExNavigatorStyles.barButtonText,
            ExNavigatorStyles.barBackButtonText,
            this._barButtonTextStyle,
          ]}>
          {title}
        </Text>;
    }

    return (
      <TouchableOpacity
        pressRetentionOffset={ExNavigatorStyles.barButtonPressRetentionOffset}
        onPress={() => this._navigator.pop()}
        style={[ExNavigatorStyles.barBackButton, styles.backButtonStyle]}>
        <BackIcon
          style={[
            ExNavigatorStyles.barButtonIcon,
            this._barButtonIconStyle,
          ]}
        />
        {buttonText}
      </TouchableOpacity>
    );
  }

  RightButton(route, navigator, index, state) {
    if (route.renderRightButton) {
      return route.renderRightButton(this._navigator, index, state);
    }
  }
};

export default class ExRouteRenderer {
  constructor(navigator, styles) {
    this._previousRoute = null;
    this.navigationBarRouteMapper = new NavigationBarRouteMapper(
      navigator,
      styles,
    );
  }

  configureScene(route) {
    if (route.configureScene) {
      let sceneConfig = route.configureScene();
      if (sceneConfig) {
        return sceneConfig;
      }
    }

    if (Platform.OS === 'android') {
      return NavigatorSceneConfigs.Fade;
    } else {
      return NavigatorSceneConfigs.PushFromRight;
    }
  }

  renderScene(route, navigator) {
    if (route.renderScene) {
      console.log("route.renderScene");
      let scene = route.renderScene(navigator);
      if (!scene) {
        return scene;
      }
      return cloneReferencedElement(scene, {
        ref: component => { route.scene = component; },
      });
    }

    invariant(
      route.getSceneClass,
      'The route must implement renderScene or getSceneClass',
    );
    let Component = route.getSceneClass();
    console.log(Component);
    return (
      <Component
        ref={component => { route.scene = component; }}
        navigator={navigator}
      />
    );
  }

  onWillFocus(event) {
    let { data: { route } } = event;
    if (route.onWillFocus) {
      route.onWillFocus(event);
    }
    // The component isn't mounted yet if this is the first time it's rendered
    if (route.scene && route.scene.componentWillFocus) {
      route.scene.componentWillFocus(event);
    }

    let previousRoute = this._previousRoute;
    if (previousRoute) {
      if (previousRoute.onWillBlur) {
        previousRoute.onWillBlur(event);
      }
      let previousScene = previousRoute.scene;
      if (previousScene && previousScene.componentWillBlur) {
        previousScene.componentWillBlur(event);
      }
    }
  }

  onDidFocus(event) {
    let { data: { route } } = event;
    if (route.onDidFocus) {
      route.onDidFocus(event);
    }
    if (route.scene && route.scene.componentDidFocus) {
      route.scene.componentDidFocus(event);
    }

    let previousRoute = this._previousRoute;
    if (previousRoute) {
      if (previousRoute.onDidBlur) {
        previousRoute.onDidBlur(event);
      }
      let previousScene = previousRoute.scene;
      if (previousScene && previousScene.componentDidBlur) {
        previousScene.componentDidBlur(event);
      }
    }
    this._previousRoute = route;
  }
};

// Long titles will run into the left and right button text or overflow even
// further and just generally look gross so we try to limit the damage by
// shortening the title text.
//
// iOS does this by moving the title to take up the available space (to the
// left or right if the buttons leave space), and then ellipsising as necessary
// by measuring the actual text, etc. We can eventually but for now, we'll just
// limit titles to at most 18 characters.
function shortenTitle(title) {
  if (title.length > 18) {
    return title.substr(0, 18) + '…';
  } else {
    return title;
  }
}

let styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ExRouteRenderer;
