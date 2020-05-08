import React, { Component } from "react";
import { FlatList, KeyboardAvoidingView, BackHandler } from "react-native";
import { Layout, Button, Text, Input, Modal, TopNavigation, TopNavigationAction, Spinner } from 'react-native-ui-kitten';
import { MenuOutline, AddIcon } from "../assets/icons/icons.js";
import lf from "./Functions/ListFunctions";
import ListItemContainer from '../components/ListItemContainer.js';
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';
import * as firebase from "firebase";
import styles from './pageStyles/YourListsPageStyle'

const PAGE_TITLE = "Your Lists";

class YourLists extends Component {
   constructor(props) {
      super(props);
      this.newListName = "";
      this.state = {
         listTitles: [],
         apiData: [],
         modalVisible: false,
         selected: [],
         selectedIds: [],
         asyncWait: false
      };
      this.focusListener = this.props.navigation.addListener(
         "willFocus",
         () => {
            this._isMount = true;
            // Set the context of the notification manager
            nm.setThat(this)

            // Load the needed data
            this.GenerateNeededData(this);
         }
      );
   }

   /**
    * GenerateNeededData
    * 
    * Loads the names and ids of the lists that have
    * been created by the user or shared with the user.
    * 
    * @param {Component} that Context of the caller
    * 
    * @returns None
    */
   GenerateNeededData(that) {
      that.setState({
         asyncWait: true
      });

      var uid = firebase.auth().currentUser.uid;

      var ref = firebase.database().ref("/users/" + uid + "/lists")
      var retVal = ref.on("value", function (snapshot) {
         // Load the list ids
         var ssv = snapshot.val();
         var childVals = [];
         var listIds = [];

         if (ssv) {
            // Get all created list ids
            for (var created in ssv.created) {
               listIds.push(created);
            }

            // Get all shared list ids
            for (var shared in ssv.shared) {
               listIds.push(shared);
            }

            // Load all lists that the user has access to
            for (var idKey in listIds) {
               var currentListId = listIds[idKey];

               var childRef = firebase.database().ref("/lists/" + currentListId).once("value");

               childVals.push(childRef);
            }
         }

         // Wait until all information has been loaded
         Promise.all(childVals).then(result => {
            var listIdLength = result.length;

            var apiData = [];
            var listTitles = [];

            // Get the keys and names of each list
            for (var i = 0; i < result.length; i++) {
               var ssv = result[i];

               if (ssv) {
                  apiData.push({
                     key: ssv.key,
                     name: ssv.val().name,
                     lastMod: ssv.val().lastMod,
                     uc: ssv.val().user_count
                  });

                  listTitles.push(ssv.val().name);

                  if ((i - 1) === listIdLength) {
                     break;
                  }
               } else {
                  console.log("ERROR: List does not exist.");
                  break;
               }
            }

            // Update the state of the callee
            that.updateListState(apiData, listTitles);
         });
      });
   }

   /**
    * updateListState
    * 
    * Updates the arrays of list names and ids to
    * match the given data.
    * 
    * @param {Array} newApiData Array of objects of new API data
    * @param {Array} newListTitles Array of string of new list titles
    * 
    * @returns None
    */
   updateListState(newApiData, newListTitles) {
      // Get the local api data and titles
      var localApiData = this.state.apiData;
      var localListTitles = this.state.listTitles;

      /**
       * checkArrayApi
       * 
       * Checks if the given api object is in the
       * array of api objects
       * 
       * @param {Array} arr   The array of API objects to check
       * @param {Object} api    The API object to look for
       */
      function checkArrayApi(arr, api) {
         // Check the given array
         for (var i = 0; i < arr.length; i++) {
            var tempApi = arr[i];
            // Two API objects are equal if they have the same key and name
            if ((tempApi.key === api.key) && (tempApi.name === api.name)) {
               return true;
            }
         }
         return false;
      }

      // Get the API data added/removed
      var itemsAdded = newApiData.filter(x => !checkArrayApi(localApiData, x));
      var itemsRemoved = localApiData.filter(x => !checkArrayApi(newApiData, x));

      if (itemsAdded.length > 0) {
         // Copy all added objects to the array
         for (var i = 0; i < itemsAdded.length; i++) {
            var ind = newApiData.indexOf(itemsAdded[i]);

            localApiData.push(newApiData[ind]);
            localListTitles.push(newListTitles[ind]);
         }
      } else if (itemsRemoved.length > 0) {
         // Remove all extra objects from the array
         for (var i = 0; i < itemsRemoved.length; i++) {
            var ind = localApiData.indexOf(itemsRemoved[i]);

            if (ind > -1) {
               localApiData.splice(ind, 1);
               localListTitles.splice(ind, 1);
            }
         }
      } else {
         localListTitles = newListTitles;
         localApiData = newApiData;
      }

      // Updates the state
      if (this._isMount) this.setState({
         listTitles: localListTitles.slice(),
         apiData: localApiData.slice(),
         asyncWait: false
      });
   }
   componentWillUnmount() {
      lf.RemoveYourListsPageListeners()
      this.focusListener.remove()
      this._isMount = false;
   }

   /**
    * GetListID
    * 
    * Gets the ID corresponding to the given name.
    * 
    * @param {String} listName The name of the list
    * 
    * @returns The key of the given list. Null if the id is unknown
    */
   GetListID(listName) {
      // Get the array of api data
      var data = this.state.apiData;

      // Parse the api data to find the list
      for (var list in data) {
         if (data[list].name == listName) {
            // Return the key
            return data[list].key;
         }
      }

      return null;
   }

   /**
    * GoToList
    * 
    * Navigates to the page displaying the
    * given list.
    * 
    * @param {String} listName The name of the list
    * 
    * @returns None
    */
   GoToList(listName) {
      this.props.navigation.navigate("CurrentListPage", {
         listName: listName,
         listID: this.GetListID(listName)
      });
   }

   /**
    * handleCreate
    * 
    * Handlers for creating a new list.
    * Creates the new list with the name inputted
    * in the modal and hides the modal
    * 
    * @param   None
    * 
    * @returns None
    */
   handleCreate = () => {
      // Create the list
      lf.CreateNewList(this.newListName);

      // Clear the list name and hide the modal
      this.newListName = "";
      if (this._isMount) this.setState({
         modalVisible: false
      });
   };

   /**
    * setNewListName
    * 
    * Sets the new list name to the given value
    * 
    * @param {String} name The name of the new list
    * 
    * @returns None
    */
   setNewListName(name) {
      this.newListName = name;
   }

   /**
    * deleteListWithID
    * 
    * Deletes the list with the given ID
    * 
    * @param {String}   id The ID of the list to delete
    * 
    * @returns None
    */
   deleteListWithID = (id) => {
      lf.DeleteList(id);
   }

   /**
    * renderModalElement
    * 
    * Renders the modal for getting the name of the new list.
    * 
    * @param   None
    * 
    * @returns None
    */
   renderModalElement = () => {
      return (
         <Layout
            level='3'
            style={styles.modalContainer}>
            <Text category='h6' >Create New List</Text>
            <Input
               style={styles.input}
               placeholder='List Name...'
               onChangeText={name => this.setNewListName(name)}
               autoFocus={this.state.modalVisible ? true : false}
            />
            <Layout style={styles.buttonContainer}>
               <Button style={styles.modalButton} onPress={this.setModalVisible}>Cancel</Button>
               <Button style={styles.modalButton} onPress={() => { this.handleCreate() }}>Create</Button>
            </Layout>
         </Layout>
      );
   };

   /**
    * setModalVisible
    * 
    * Toggles the visibility of the modal.
    * 
    * @param   None
    * 
    * @returns None
    */
   setModalVisible = () => {
      const modalVisible = !this.state.modalVisible;
      if (modalVisible) {
         this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (this.state.modalVisible) {
               const modalVisible = false;
               if (this._isMount) this.setState({ modalVisible });
            }
            this.backHandler.remove();
            return true;
         });
      }
      else {
         this.backHandler.remove();
      }
      if (this._isMount) this.setState({
         modalVisible
      });
   };

   CheckIfSelected(list) {
      var selected = this.state.selected
      if (selected.includes(list)) {
         return true;
      } else {
         return false;
      }
   }

   AddListPress(index, list) {
      var newSelected = this.state.selected
      var newSelectedIds = this.state.selectedIds;
      if (newSelected.includes(list)) {
         for (var a = 0; a < newSelected.length; a++) {
            if (newSelected[a] === list) {
               newSelected.splice(a, 1);
               a--;
            }
         }
         for (var b = 0; b < newSelectedIds.length; b++) {
            if (newSelectedIds[b] === this.state.apiData[index].key) {
               newSelectedIds.splice(b, 1);
               b--;
            }
         }
         this.setState({ selected: newSelected, selectedIds: newSelectedIds });
      } else {
         newSelected.push(list)
         newSelectedIds.push(this.state.apiData[index].key)
         this.setState({ selected: newSelected, selectedIds: newSelectedIds });
      }
   }

   formatDate = (date) => {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
   }

   renderItemDescription = (index) => {
      var sharedCount = (this.state.apiData[index].uc) - 1;
      var description = "";
      if (sharedCount == 0) {
         description += "Shared With: No one";
      } else if (sharedCount == 1) {
         description += "Shared With: 1 person";
      } else {
         description += "Shared With: " + sharedCount + " others";
      }
      var displayDateString = "";
      displayDateString = new Date(Date.parse(this.state.apiData[index].lastMod));
      description += "\nLast Modified: " + this.formatDate(displayDateString);
      return (description);
   }

   render() {
      const AddAction = (props) => (
         <TopNavigationAction {...props} icon={AddIcon} onPress={this.setModalVisible} />
      );

      const renderRightControls = () => [
         <AddAction />,
      ];

      const renderMenuAction = () => (
         <TopNavigationAction icon={MenuOutline} onPress={() => this.props.navigation.toggleDrawer()} />
      );

      return (
         <React.Fragment>
            {this.props.navigation.getParam("ingredients", false) &&
               <TopNavigation
                  title={"Select Lists..."}
                  alignment='center'
                  rightControls={renderRightControls()}
               />}
            {!this.props.navigation.getParam("ingredients", false) &&
               <TopNavigation
                  title={PAGE_TITLE}
                  alignment='center'
                  leftControl={renderMenuAction()}
                  rightControls={renderRightControls()}
               />}
            {!this.state.asyncWait &&
               <Layout style={styles.ListContainer}>
                  <KeyboardAvoidingView style={styles.container} behavior="position" enabled>
                     <Modal style={styles.modal}
                        allowBackdrop={true}
                        backdropStyle={{ backgroundColor: 'black', opacity: 0.75 }}
                        onBackdropPress={this.setModalVisible}
                        visible={this.state.modalVisible}>
                        {this.renderModalElement()}
                     </Modal>
                  </KeyboardAvoidingView>
                  {!this.props.navigation.getParam("ingredients", false) &&
                     <FlatList
                        contentContainerStyle={{ paddingBottom: 16 }}// This paddingBottom is to make the last item in the flatlist to be visible.
                        style={styles.flatList}
                        data={this.state.listTitles}
                        width="100%"
                        keyExtractor={index => index.toString()}
                        renderItem={({ item, index }) => (
                           <ListItemContainer
                              title={item}
                              description={this.renderItemDescription(index)}
                              listName={item}
                              onPress={this.GoToList.bind(this, item)}
                              listIndex={index}
                              listID={this.state.apiData[index].key}
                              onDelete={this.deleteListWithID}
                              navigate={() => {
                                 this.props.navigation.navigate("YourContacts", {
                                    share: true,
                                    listID: this.state.apiData[index].key,
                                    listName: item
                                 })
                              }}
                           />
                        )}
                     />}
                  {this.props.navigation.getParam("ingredients", false) &&
                     <FlatList
                        contentContainerStyle={{ paddingBottom: 16 }}// This paddingBottom is to make the last item in the flatlist to be visible.
                        style={styles.flatList}
                        data={this.state.listTitles}
                        width="100%"
                        keyExtractor={index => index.toString()}
                        renderItem={({ item, index }) => (
                           <ListItemContainer share={true} contact={true} title={item} purchased={this.CheckIfSelected(item)} fromItemView={false} onPress={() => { this.AddListPress(index, item) }} description={this.renderItemDescription(index)} />
                        )}
                     />}
               </Layout>
            }
            {!this.state.asyncWait && this.props.navigation.getParam("ingredients", false) &&
               <Layout>
                  <Button style={styles.shareButton}
                     status="success"
                     onPress={() => lf.AddIngredientsToList(this.state.selectedIds, this.props.navigation.getParam("ingredients", false), this.props, function (props) {
                        props.navigation.goBack()
                     })}
                  >{"ADD TO LIST"}</Button>
               </Layout>
            }
            {this.state.asyncWait &&
               <Layout style={styles.loading}>
                  <Spinner />
               </Layout>
            }
            <NotificationPopup ref={ref => this.popup = ref} />
         </React.Fragment>
      );
   }
}

export default YourLists;