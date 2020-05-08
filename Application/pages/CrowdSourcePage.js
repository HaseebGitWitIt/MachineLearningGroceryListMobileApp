import React, { Component } from "react";
import { StyleSheet, Dimensions, } from "react-native";
import { Layout, TopNavigation, TopNavigationAction } from 'react-native-ui-kitten';
import { MenuOutline } from "../assets/icons/icons.js";
import { ScrollView } from "react-native-gesture-handler";
import { dark, light } from '../assets/Themes.js';
import HomeSquareContainer from "../components/HomeSquareContainer.js";
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';

const PAGE_TITLE = "Croud-Source";
const MARGIN_RATIO = 30; // higher number = smaller margin

// Strings for controlling navigation
const REGISTER_ITEM_PAGE = "RegisterItemPage";
const ADD_ITEM_LOCATION_PAGE = "AddItemLocationPage";
const MAP_CREATOR_PAGE = "MapCreatorPage";

class CrowdSourcePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    };
    this.onLayout = this.onLayout.bind(this);
    this.focusListener = this.props.navigation.addListener(
      "willFocus",
      () => {
        nm.setThat(this)
        this._isMounted = true;
      }
    );
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this._isMounted = false;
  }

  /**
   * Updates the width and height state varibles if the screen is rotated.
   * @param {*} e this
   */
  onLayout(e) {
    if (this._isMounted) this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
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

  renderMenuAction = () => (
    <TopNavigationAction icon={MenuOutline} onPress={() => this.props.navigation.toggleDrawer()} />
  );

  render() {
    aspectRatio = this.state.height / this.state.width;
    gridShape = aspectRatio > 1.6 ? 2 : 4;
    marginValue = this.calcMarginValue(this.state.width, gridShape);
    sizeValue = this.calcSizeValue(this.state.width, gridShape);
    return (
      <React.Fragment>
        <TopNavigation
          title={PAGE_TITLE}
          alignment='center'
          leftControl={this.renderMenuAction()}
        />
        <ScrollView style={[styles.scrollContainer, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
          <Layout style={styles.container} onLayout={this.onLayout} >
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Register Item' icon='pricetags-outline' onPress={() => this.props.navigation.navigate(REGISTER_ITEM_PAGE)} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Add Item Location' icon='pin-outline' onPress={() => this.props.navigation.navigate(ADD_ITEM_LOCATION_PAGE)} />
            <HomeSquareContainer sizeValue={sizeValue} marginValue={marginValue} name='Map Creator' icon='map-outline' shape={2} onPress={() => this.props.navigation.navigate(MAP_CREATOR_PAGE)} />
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
});

export default CrowdSourcePage;