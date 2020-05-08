import React, { Component } from "react";
import { StyleSheet, FlatList } from "react-native";
import { MenuOutline } from "../assets/icons/icons.js";
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';
import rf from "./Functions/RecipeFunctions";
import { TopNavigation, TopNavigationAction, Layout } from 'react-native-ui-kitten';
import RecipesCard from '../components/RecipesCard.js';
import { dark, light } from '../assets/Themes.js';

class FavRecipesPage extends Component {
   constructor(props) {
      super(props);
      this.state = {
         recipes: []
      }
      this.focusListener = this.props.navigation.addListener(
         "willFocus",
         () => {
            nm.setThat(this);
            this._isMounted = true;
            rf.GetFavouriteRecipes(this)
         }
      );
   }

   componentWillUnmount() {
      this.focusListener.remove()
      this._isMounted = false;
      rf.RemoveListeners();
   }

   render() {
      const renderMenuAction = () => (
         <TopNavigationAction icon={MenuOutline} onPress={() => this.props.navigation.toggleDrawer()} />
      );

      return (
         <React.Fragment>
            <TopNavigation
               title="Favourite Recipes"
               alignment='center'
               leftControl={renderMenuAction()}
            />
            <Layout style={styles.outerContainer}>
               {this.state.recipes.length > 0 &&
                  <FlatList
                     style={{ backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }}
                     data={this.state.recipes}
                     width="100%"
                     keyExtractor={(item, index) => item.title}
                     renderItem={({ item }) => {
                        return (
                           <RecipesCard
                              imageSource={item.image}
                              title={item.title}
                              description={"Serves " + item.servings + "\t\t\tReady in " + item.readyInMinutes + " minutes"}
                              onSharePress={() => {
                                 this.props.navigation.navigate("YourContacts", {
                                    share: true,
                                    recipeName: item.title,
                                 });
                              }}
                              onDetailsPress={() => {
                                 this.props.navigation.navigate("RecipeDetailsPage", {
                                    item: item,
                                    name: item.title,
                                    ingredients: item.extendedIngredients
                                 });
                              }}
                           />
                        );
                     }}
                  />}
            </Layout>
            <NotificationPopup ref={ref => this.popup = ref} />
         </React.Fragment>
      );
   }
}

const styles = StyleSheet.create({
   outerContainer: {
      flex: 1,
   },
});
export default FavRecipesPage;