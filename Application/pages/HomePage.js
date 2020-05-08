import React, { Component } from "react";
import { StyleSheet, Dimensions } from 'react-native';
import { Layout, TopNavigation, TopNavigationAction, OverflowMenu, } from 'react-native-ui-kitten';
import { MenuOutline, SunIcon, MenuIcon } from "../assets/icons/icons.js";
import { dark, light } from '../assets/Themes.js';
import { ScrollView } from "react-native-gesture-handler";
import HomeSquareContainer from "../components/HomeSquareContainer.js";
import lf from '../pages/Functions/ListFunctions.js';
import * as firebase from "firebase";
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';
import rf from "./Functions/RecipeFunctions";
import * as Crypto from 'expo-crypto';

var PAGE_TITLE = "Home ";
const YOUR_LISTS_PAGE = "YourListsPage";
const CROWD_SOURCE_PAGE = "CrowdSourcePage";
const CONTACTS = "YourContacts"
const RECIPE_PAGE = "FindRecipePage"
const MAPS = "MapsPage";
const MARGIN_RATIO = 30; // higher number = smaller margin

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
      menuVisible: false,
    };
    this.onLayout = this.onLayout.bind(this);
    this.focusListener = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.load();
      }
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.focusListener.remove()
  }

  async load() {
    this._isMounted = true;
    nm.setThat(this)
    rf.AddRecipesToDatabase();
    // Make sure user information added to the database
    var currentUser = firebase.auth().currentUser;
    var emailId = currentUser.email.toString();
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      emailId
    );
    firebase
      .database()
      .ref("/userInfo/" + digest)
      .once("value", function (snapshot) {
        if (!snapshot.val() || !snapshot.val().uid) {
          firebase.database().ref('/userInfo/' + digest).set({ uid: currentUser.uid }).then(function (snapshot) {
          });
        }
      });

    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    try {
      firebase.database().ref('/userInfo/' + digest + '/notificationToken').set(token)
      this._notificationSubscription = Notifications.addListener(nm._handleNotification);
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Updates the width and height state varibles if the screen is rotated.
   * @param {*} e this
   */
  onLayout(e) {
    if (this._isMounted) {
      this.setState({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      });
    }
  }

  /**
   * To be used with HomeSquareContainer,
   * Determines the margin size.
   * @param {integer} deviceWidth The current width of the device in the current orientation
   * @param {integer} tpr THis value determines the number containers in one row
   * @returns {integer} Margin Size
   */
  calcMarginValue = (deviceWidth, tpr) => {
    marginValue = deviceWidth / (tpr * MARGIN_RATIO);
    return marginValue;
  };

  /**
   * To be used with HomeSquareContainer,
   * Determines the container size.
   * @param {integer} deviceWidth The current width of the device in the current orientation
   * @param {integer} tpr THis value determines the number containers in one row
   * @returns {integer} Container size
   */
  calcSizeValue = (deviceWidth, tpr) => {
    marginValue = deviceWidth / (tpr * MARGIN_RATIO);
    sizeValue = (deviceWidth - marginValue * (tpr * 2)) / tpr;
    return sizeValue;
  };

  menuData = [
    { title: 'Toggle Theme', icon: SunIcon },
  ];

  renderLeftMenuAction = () => (
    <TopNavigationAction icon={MenuOutline} onPress={() => this.props.navigation.toggleDrawer()} />
  );

  renderRightMenuAction = () => (
    <OverflowMenu
      style={styles.overflowMenu}
      visible={this.state.menuVisible}
      data={this.menuData}
      placement='bottom end'
      onSelect={this.onMenuItemSelect}
      onBackdropPress={this.onMenuActionPress}>
      <TopNavigationAction
        icon={MenuIcon}
        onPress={() => this.onMenuActionPress()}
      />
    </OverflowMenu>
  );

  onMenuActionPress = () => {
    if (this._isMounted) this.setState({ menuVisible: !this.state.menuVisible });
  };

  onMenuItemSelect = (index) => {
    if (index = 1) {
      lf.ToggleTheme();
    }
    if (this._isMounted) this.setState({ menuVisible: false });
  };

  render() {
    aspectRatio = this.state.height / this.state.width;
    gridShape = aspectRatio > 1.6 ? 2 : 4;
    marginValue = this.calcMarginValue(this.state.width, gridShape);
    sizeValue = this.calcSizeValue(this.state.width, gridShape);
    // PAGE_TITLE += firebase.auth().currentUser.email.toString();
    return (
      <React.Fragment >
        <TopNavigation
          title={PAGE_TITLE}
          alignment='center'
          leftControl={this.renderLeftMenuAction()}
          rightControls={this.renderRightMenuAction()}
        />
        <ScrollView style={[styles.scrollContainer, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
          <Layout style={styles.container} onLayout={this.onLayout} >
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Your Lists' icon='list-outline' onPress={() => this.props.navigation.navigate(YOUR_LISTS_PAGE)} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Your Contacts' icon='people-outline' onPress={() => this.props.navigation.navigate(CONTACTS)} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Find Stores' icon='map-outline' onPress={() => this.props.navigation.navigate(MAPS)} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Find Recipes' icon='search-outline' onPress={() => this.props.navigation.navigate(RECIPE_PAGE)} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Your Recommendations' icon='bulb-outline' shape={2} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Shared With You' icon='share-outline' />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Crowd-Source' icon='loader-outline' onPress={() => this.props.navigation.navigate(CROWD_SOURCE_PAGE)} />
          </Layout>
        </ScrollView>
        <NotificationPopup ref={ref => this.popup = ref} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scrollContainer: {
    flex: 1,
  },
  overflowMenu: {
    padding: 4,
    shadowColor: 'black',
    shadowOpacity: .5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});

export default HomePage;
