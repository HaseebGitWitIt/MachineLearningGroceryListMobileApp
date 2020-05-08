import React, { Component } from "react";
import {
   SectionList,
   StyleSheet,
   Alert,
} from "react-native";
import cf from "./Functions/ContactFunctions";
import { Layout, Text, TopNavigation, TopNavigationAction, Button } from 'react-native-ui-kitten';
import { MenuOutline, AddIcon } from "../assets/icons/icons.js";
import ListItemContainer from '../components/ListItemContainer.js';
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';

class YourContacts extends Component {
   constructor(props) {
      super(props);
      this.state = { listName: '', listID: '', sections: [], groups: [], share: false, selected: [], sectionsWoPending: [], groupsWoPending: [], sectionsSelected: [] };
      this.focusListener = this.props.navigation.addListener(
         "willFocus",
         () => {
            this.load();
         }
      );
   }

   load() {
      this._isMounted = true;
      nm.setThat(this)

      this.setState({
         share: this.props.navigation.getParam("share", false),
         listID: this.props.navigation.getParam("listID", ''),
         listName: this.props.navigation.getParam("listName", ''),
         recipeName: this.props.navigation.getParam("recipeName", ''),
      });
      cf.GetContactInfo(this);

   }

   componentWillUnmount() {
      cf.RemoveYourContactsPageListeners()
      this.focusListener.remove()
      this._isMounted = false;
   }

   GetSectionListItem = item => {
      //Function for click on an item
      Alert.alert(item);
   };

   ShareContactPress(email) {
      var newSelected = this.state.selected
      if (newSelected.includes(email)) {
         for (var a = 0; a < newSelected.length; a++) {
            if (newSelected[a] === email) {
               newSelected.splice(a, 1);
               a--;
            }
         }
         if (this._isMounted) this.setState({ selected: newSelected });
      } else {
         newSelected.push(email)
         if (this._isMounted) this.setState({ selected: newSelected });
      }
   }

   CheckIfSelected(email) {
      var selected = this.state.selected
      if (selected.includes(email)) {
         return true;
      } else {
         return false;
      }
   }

   SectionShare(section) {
      var sectionsSelected = this.state.sectionsSelected;
      var newSelected = this.state.selected;
      if (sectionsSelected.includes(section.title)) {
         for (var a = 0; a < sectionsSelected.length; a++) {
            if (sectionsSelected[a] === section.title) {
               sectionsSelected.splice(a, 1);
               a--;
            }
         }
         for (var data in section.data) {
            if (newSelected.includes(section.data[data].email)) {
               for (var a = 0; a < newSelected.length; a++) {
                  if (newSelected[a] === section.data[data].email) {
                     newSelected.splice(a, 1);
                     a--;
                  }
               }
            }
         }
      } else {
         sectionsSelected.push(section.title)
         for (var data in section.data) {
            if (!newSelected.includes(section.data[data].email)) {
               newSelected.push(section.data[data].email)
            }
         }
      }
      if (this._isMounted) this.setState({ selected: newSelected, sectionsSelected: sectionsSelected });
   }

   render() {
      const AddAction = (props) => (
         <TopNavigationAction {...props} icon={AddIcon} onPress={() => this.props.navigation.navigate("NewContact", { groups: this.state.groupsWoPending })} />
      );

      const renderRightControls = () => [
         <AddAction />
      ];

      const renderMenuAction = () => (
         <TopNavigationAction icon={MenuOutline} onPress={() => this.props.navigation.toggleDrawer()} />
      );
      return (
         <React.Fragment>
            {(this.state.listID != '' || this.state.recipeName != '') &&
               <TopNavigation
                  title={(this.state.listID != '' || this.state.recipeName != '') ? "Select Contacts..." : "Your Contacts"}
                  alignment='center'
                  rightControls={renderRightControls()}
               />
            }
            {(this.state.listID == '' && this.state.recipeName == '') &&
               <TopNavigation
                  title={(this.state.listID != '' || this.state.recipeName != '') ? "Select Contacts..." : "Your Contacts"}
                  alignment='center'
                  leftControl={renderMenuAction()}
                  rightControls={renderRightControls()}
               />}
            <Layout style={styles.sectionListContainer}>
               <SectionList
                  sections={this.state.share ? this.state.sectionsWoPending : this.state.sections}
                  renderSectionHeader={({ section }) => {
                     if (this.state.share) {
                        return (
                           <Layout level='3' style={styles.sectionHeaderContainer}>
                              <Text style={styles.sectionHeaderStyle} category='s1' onPress={() => { this.SectionShare(section) }}> {section.title} </Text>
                           </Layout>);
                     } else {
                        return (
                           <Layout level='3' style={styles.sectionHeaderContainer}>
                              <Text style={styles.sectionHeaderStyle} category='s1'> {section.title} </Text>
                           </Layout>);
                     }
                  }}
                  renderItem={({ item }) => {
                     if (this.state.share) {
                        return (
                           <ListItemContainer
                              share={true}
                              contact={true}
                              title={item.name}
                              purchased={this.CheckIfSelected(item.email)} fromItemView={false}
                              onPress={() => { this.ShareContactPress(item.email) }} />
                        );
                     } else {
                        if (item.status == "contact") {
                           return (
                              <ListItemContainer
                                 contact={true}
                                 title={item.name}
                                 fromContactView={true}
                                 fromItemView={false}
                                 onDelete={() => cf.DeleteContact(item.email)}
                                 onPress={() => { this.props.navigation.navigate("NewContact", { groups: this.state.groupsWoPending, email: item.email, group: item.group, name: item.name, edit: true }) }} />
                           );
                        } else if (item.status == "pending") {
                           return (
                              <ListItemContainer
                                 title={item.email}
                                 fromItemView={true}
                                 contact={true}
                                 acceptFunction={() => { this.props.navigation.navigate("NewContact", { groups: this.state.groupsWoPending, email: item.email }) }}
                                 rejectFunction={() => cf.RejectContactRequest(item.email)} pending={true} />
                           );
                        }
                     }

                  }}
                  keyExtractor={(item, index) => index}
               />
            </Layout>
            {this.state.listID != '' &&
               <Layout>
                  <Button style={styles.shareButton}
                     status="success"
                     onPress={() => cf.ShareList(this.props, this.state.listName, this.state.listID, this.state.selected, function (props) {
                        props.navigation.navigate("YourListsPage")
                     })}
                  >{"SHARE"}</Button>
               </Layout>
            }
            {this.state.recipeName != '' &&
               <Layout>
                  <Button style={styles.shareButton}
                     status="success"
                     onPress={() => cf.ShareRecipe(this.props, this.state.recipeName, this.state.selected, function (props) {
                        props.navigation.goBack()
                     })}
                  >{"SHARE"}</Button>
               </Layout>
            }
            <NotificationPopup ref={ref => this.popup = ref} />
         </React.Fragment >
      );
   }
}
const styles = StyleSheet.create({
   sectionListContainer: {
      flex: 1,
   },
   sectionHeaderContainer: {
      marginTop: 4,
      marginHorizontal: 4,
      borderRadius: 10,
   },
   sectionHeaderStyle: {
      paddingHorizontal: 8,
      paddingVertical: 4,
   },
   shareButton: {
      margin: 8,
      borderRadius: 10,
   },
});
export default YourContacts;