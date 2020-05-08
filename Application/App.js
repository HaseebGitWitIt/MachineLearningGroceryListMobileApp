import React, { Component } from 'react';
import { Image, Platform, StatusBar, StyleSheet, SafeAreaView, } from 'react-native';
import { mapping, } from '@eva-design/eva';
import { dark, light } from './assets/Themes.js';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ApplicationProvider, IconRegistry, Layout, Text } from 'react-native-ui-kitten';
import FirebaseConfig from './components/FirebaseConfig';
import * as firebase from 'firebase';
import RootNavigation from './navigation/RootNavigation';
import MainDrawerNavigator from './navigation/MainDrawerNavigator';
import { Asset } from 'expo-asset';
import { SplashScreen } from 'expo';
import { YellowBox } from 'react-native';
import lf from './pages/Functions/ListFunctions.js';
import _ from 'lodash';

export default class App extends Component {
  constructor(props) {
    super(props);
    global.theme = dark;
    this.state = {
      isLoadingComplete: false,
      isAuthProcessReady: false,
      isAuthenticated: false,
      theme: 'dark',
    };
    //Temprory Solution to remove Timer warning on android, hide virtualized lists error from user, but not console.
    // Placing a flat list inside scrollview negates the advantages of flatlist so we get this warning.
    YellowBox.ignoreWarnings(['Setting a timer', 'VirtualizedLists should never be nested']);
    const _console = _.clone(console);
    console.warn = message => {
      if (message.indexOf('Setting a timer') <= -1) {
        _console.warn(message);
      }
    };

    if (!firebase.apps.length) { // Check to see if Firebase app is already initialized on Android
      app = firebase.initializeApp(FirebaseConfig.firebaseConfig);
    }

    firebase.auth().onIdTokenChanged(this.onAuthStateChanged); // User is signed in or token was refreshed
    SplashScreen.preventAutoHide();

  }

  onAuthStateChanged = (user) => {
    this.setState({ isAuthProcessReady: true });
    if (!!user) {
      if (user != null && user.emailVerified == true) {
        this.setState({ isAuthenticated: !!user }); // (Bang Bang) !! returns the true value of the obj
      }
    } else {
      this.setState({ isAuthenticated: !!user }); // (Bang Bang) !! returns the true value of the obj
    }
    if (this.state.isAuthenticated) {
      lf.GetTheme(this);
    }
  }

  componentWillUnmount() {
    this.eventListener.remove();
  }

  renderCurrentState() {
    if ((!this.state.isLoadingComplete || !this.state.isAuthProcessReady) && !this.props.skipLoadingScreen) {
      return (
        <Layout style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image style={{
            height: '100%',
            aspectRatio: .5,
          }}
            source={require('./assets/splash.png')}
            onLoad={this._loadResourcesAsync}
          />
        </Layout>
      );
    }
    return (
      <Layout style={styles.container}><StatusBar barStyle={global.theme == light ? 'dark-content' : 'light-content'} />
        {(this.state.isAuthenticated) ? <MainDrawerNavigator /> : <RootNavigation />}
      </Layout>
    );
  }

  render() {
    global.theme = this.state.theme == 'light' ? light : dark;
    return (
      <React.Fragment>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider mapping={mapping} theme={global.theme}>
          <SafeAreaView style={[styles.container, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
            {this.renderCurrentState()}
          </SafeAreaView>
        </ApplicationProvider>
      </React.Fragment>
    );
  }

  _loadResourcesAsync = async () => {
    await Promise.all([
      Asset.loadAsync([
        // Add all necessary assets here
      ]),
    ]);
    SplashScreen.hide();
    this.setState({ isLoadingComplete: true });
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});