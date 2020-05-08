import * as firebase from "firebase";
import * as func from "./DBInterface"

const NUMBER_OF_RECIPES_TO_GET_FROM_API_TO_STORE_IN_DB = "30";
const NUMBER_OF_RECIPES_TO_SHOW_USERS = 20;

class RecipeFunctions {
   constructor() { }

   GetUrlAndIngredientsFromName(recipeName, that) {
      var recipeId = func.replaceInvalidPathCharsGlobal(recipeName);

      firebase
         .database()
         .ref("/recipes/" + recipeId)
         .once("value", function (snapshot) {
            if (snapshot.val()) {
               that.that.props.navigation.navigate("RecipeDetailsPage", {
                  item: snapshot.val(),
                  name: snapshot.val().title,
                  ingredients: snapshot.val().extendedIngredients
               })
            }
         })
   }

   UpdateFavouriteRecipe(that, recipeName) {
      var recipeId = func.replaceInvalidPathCharsGlobal(recipeName);

      firebase
         .database()
         .ref("/favRecipes/" + firebase.auth().currentUser.uid + "/" + recipeId)
         .once("value", function (snapshot) {
            if (snapshot.val()) {
               that.setState({
                  favourite: true
               })
            } else {
               that.setState({
                  favourite: false
               })
            }
         })
   }

   GetRandomRecipesFromDatabase(that) {
      firebase.database().ref("/dailyRecipes/").once("value", function (snapshot) {
         var recipes = [];
         if (snapshot.val()) {
            var total = 0;
            for (var recipe in snapshot.val()) {
               recipes.push(snapshot.val()[recipe]);
               total++;
               if (total >= NUMBER_OF_RECIPES_TO_SHOW_USERS) {
                  break;
               }
            }
            that.setState({
               recipes: recipes
            });
            // return recipes;
         } else {
            console.log("Error: Could not get any recipes")
         }
      })
   }

   AddFavouriteRecipe(recipeName, callback) {
      var currentUserId = firebase.auth().currentUser.uid;
      var recipeId = func.replaceInvalidPathCharsGlobal(recipeName);

      firebase
         .database()
         .ref("/favRecipes/" + currentUserId + "/" + recipeId)
         .once("value", function (snapshot) {
            if (!snapshot.val()) {
               firebase.database().ref("/favRecipes/" + currentUserId + "/" + recipeId).set(recipeName).then((val) => {
                  callback(true)
               })
            } else {
               firebase
                  .database()
                  .ref("/favRecipes/" + currentUserId + "/" + recipeId).remove().then((val) => {
                     callback(false);
                  })
            }
         });
   }

   GetFavouriteRecipes(that) {
      firebase.database().ref("/favRecipes/" + firebase.auth().currentUser.uid).on("value", function (snapshot) {
         if (snapshot.val()) {
            that.state.recipes = [];
            for (var recipe in snapshot.val()) {
               firebase.database().ref("/recipes/" + recipe).once("value", function (returnRecipe) {
                  var recipes = that.state.recipes;
                  recipes.push(returnRecipe.val());
                  that.setState({
                     recipes: recipes
                  });
               })
            }
         }
      })
   }

   RemoveListeners() {
      firebase.database().ref("/favRecipes/" + firebase.auth().currentUser.uid).off()

   }

   async updateRandomRecipesForDay() {
      try {

         const resp = await firebase.functions().httpsCallable('updateRandomRecipesForDay')({
            numRecipesToGet: NUMBER_OF_RECIPES_TO_SHOW_USERS
         }).then((val) => {
            console.log(val.data.string)
         });
      } catch (e) {
         console.error("Error calling cloud function: " + e);
      }
   }

   // Call this method once a day
   async AddRecipesToDatabase() {
      firebase.database().ref('/globals/latestRecipeUpdate').once("value", (snapshot) => {
         if (snapshot.val()) {
            var currentDate = new Date().toUTCString();
            var currentDateSplit = currentDate.split(" ");
            var dateStr = snapshot.val().split(" ");
            if (dateStr[0] == currentDateSplit[0] && dateStr[1] == currentDateSplit[1] && dateStr[2] == currentDateSplit[2] && dateStr[3] == currentDateSplit[3]) {
               console.log("Recipes were already added to the database today.")
            } else {
               firebase.database().ref('/globals/spoonacularApiKey').once("value", (snapshot) => {
                  var apiKey = snapshot.val();
                  return apiKey;
               }).then((apiKey) => {
                  firebase.database().ref('/globals/latestRecipeUpdate').set(currentDate).then((snapshot) => {
                     let url = "https://api.spoonacular.com/recipes/random?number=" + NUMBER_OF_RECIPES_TO_GET_FROM_API_TO_STORE_IN_DB + "&apiKey=" + apiKey;
                     fetch(url, {
                        method: "GET",
                     }).then((response) => {
                        if (response.status === 200) {
                           response.json().then((json) => {
                              // console.log(json.recipes)
                              for (var a = 0; a < json.recipes.length; a++) {
                                 var data = json.recipes[a];
                                 var title = func.replaceInvalidPathCharsGlobal(data.title);

                                 firebase.database().ref('/recipes/' + title).set(data).then((snapshot) => {
                                    // console.log(snapshot);
                                 });
                              }
                           });
                           console.log("Recipes were added to the database.")
                        } else {
                           console.log("API did not respond well.")
                        }
                     }, ((error) => {
                        console.log(error.message)
                     }))
                  });
               });

               this.updateRandomRecipesForDay()

            }

         } else {
            console.log("Could not get date from database.")
         }
      })
   }
}

const rf = new RecipeFunctions();
export default rf;