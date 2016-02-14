import React, {
  StyleSheet,
  View,
  Image
} from 'react-native';

import Layout from './Layout';

export class BackIcon extends React.Component {
  render() {
    return (
      <Image
        {...this.props}
        sources={{
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAqCAYAAACtMEtjAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABxpRE9UAAAAAgAAAAAAAAAVAAAAKAAAABUAAAAVAAABCxhsNeEAAADXSURBVFgJvJM9C8JQDEUrIiLiIA7iIDj4/xcnB3HQwcFvHARBEAQREVF01vPA0vAGM6TxQmjSkHteHm2S+KiP7djHOnMdkL6/Mcxe55uNBCSFhe1y1QS31Dx+9vIiTX9AAjT0zVriEG8gazOkAGCjQGbWNYoYbP8B2SmQuXWTEgZ7b0gZwEGBLOibVGH6SMivKc7NkCqAkzekBuCsQMJ/ZFKd6QsRX5GszZAGgKsCWdE3qcn0jZAnj3MzpAXg7g1pA3gokDV9kzpMP4n4imRthnQBvLwhHwAAAP//RYcLnAAAAMpJREFUvdYrC8JQAMXxKzLEIAYxGCwGP7wOH/P9Kq4oaJjBYBAMQxBBRLHquWGwIPeUoxcOg134/1ibMcbUsRf2dqyBO8mpofLE/oJVAT0I1sS95FRQuWOuL/MlEiJl7EawlgorIXQlWFuFFRG6EKyrwgoInQkWqLA8QjHBeiosh9CJYH0V5iF0JNhAhWUROhBspMIyCO0JNlZiO4JNVJjtbAg2VWIrgs2U2JJgCyU2d2ChErKt4RdsrUaSXieFbZOXv3raf4woHf8AvbFKeXDI5jkAAAAASUVORK5CYII=',
          isStatic: true,
        }}
        style={[styles.backIcon, this.props.style]}
      />
    );
  }
}

let styles = StyleSheet.create({
  backIcon: {
    width: 13,
    height: 21,
    marginTop: 11 + Layout.pixel,
    marginLeft: 8,
  },
});
