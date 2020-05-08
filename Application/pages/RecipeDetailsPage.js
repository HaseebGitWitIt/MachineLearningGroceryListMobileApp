import React, { Component } from 'react';
import NotificationPopup from 'react-native-push-notification-popup';
import nm from './Functions/NotificationManager.js';
import rf from "./Functions/RecipeFunctions";
import { StyleSheet, ScrollView } from 'react-native';
import { TopNavigation, TopNavigationAction, Layout, Spinner } from 'react-native-ui-kitten';
import RecipeDetailsCard from '../components/RecipeDetailsCard.js';
import { dark, light } from '../assets/Themes.js';
import { ArrowBackIcon, HeartIcon, FilledInHeartIcon, ShareIcon } from "../assets/icons/icons.js";

export default class RecipeDetailsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      favourite: false,
      item: null,
    }
    this.focusListener = this.props.navigation.addListener(
      "willFocus",
      () => {
        nm.setThat(this)
        this._isMounted = true;
        this.setState({
          item: this.props.navigation.getParam("item", null)
        });
        rf.UpdateFavouriteRecipe(this, this.props.navigation.getParam("name", "error"))
      }
    );
  }

  componentWillUnmount() {
    this.focusListener.remove()
    this._isMounted = false;
  }

  favouriteOrNot() {
    if (this.state.favourite) {
      return FilledInHeartIcon;
    } else {
      return HeartIcon;
    }
  }

  render() {
    const AddAction = (props) => (
      <Layout style={{ flexDirection: "row" }}>
        <TopNavigationAction {...props} icon={ShareIcon} onPress={() => {
          this.props.navigation.navigate("YourContacts", {
            share: true,
            recipeName: this.state.item.title,
            recipeUrl: this.state.item.spoonacularSourceUrl,
            ingredients: this.state.item.extendedIngredients
          });
        }} />
        <TopNavigationAction {...props} icon={this.favouriteOrNot()} onPress={() => rf.AddFavouriteRecipe(this.props.navigation.getParam("name", "error"), (bool) => { this.setState({ favourite: bool }) })} />
      </Layout>
    );

    const renderRightControls = () => [
      <AddAction />
    ];

    const renderMenuAction = () => (
      <TopNavigationAction icon={ArrowBackIcon} onPress={() => this.props.navigation.goBack()} />
    );
    return (
      <React.Fragment>
        <TopNavigation
          title="Recipe Details"
          alignment='center'
          leftControl={renderMenuAction()}
          rightControls={renderRightControls()}
        />
        <ScrollView
          style={{ backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }}>
          {this.state.item &&
            <RecipeDetailsCard
              title={this.state.item.title}
              ingredients={this.state.item.extendedIngredients}
              instructions={this.state.item.analyzedInstructions}
              imageSource={this.state.item.image}
              onAddPress={() => this.props.navigation.navigate("YourListsPage", {
                ingredients: this.props.navigation.getParam("ingredients", false)
              })}
            />
          }
          {!this.state.item &&
            <Spinner />
          }
        </ScrollView>
        <NotificationPopup ref={ref => this.popup = ref} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  recipeDetailsContainer: {
    flex: 1,
  },
});
