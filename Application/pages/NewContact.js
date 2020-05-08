import React, { Component } from "react";
import {
   KeyboardAvoidingView, StyleSheet
} from "react-native";
import cf from "./Functions/ContactFunctions";
import { Layout, Button, Text, Input, Modal, Select, TopNavigation, TopNavigationAction, } from 'react-native-ui-kitten';
import { MenuOutline } from "../assets/icons/icons.js";
import { dark, light } from '../assets/Themes.js';
import { ScrollView } from "react-native-gesture-handler";
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';

// These are the default values for all of the input boxes
const DEFAULT_NAME = ""
const DEFAULT_GROUP = [];
const DEFAULT_EMAIL = ""

class NewContact extends Component {
   constructor(props) {
      super(props);

      this.state = {
         name: DEFAULT_NAME,
         group: DEFAULT_GROUP,
         email: DEFAULT_EMAIL,
         isDialogVisible: false,
         allGroups: [],
         fromPending: false, fromEdit: false
      };
      this.focusListener = this.props.navigation.addListener(
         "willFocus",
         () => {
            this.load();
         }
      );
   }
   load() {
      nm.setThat(this)
      if (this.props.navigation.getParam("edit", false)) {
         var email = this.props.navigation.getParam("email", DEFAULT_EMAIL);
         var name = this.props.navigation.getParam("name", DEFAULT_NAME);
         var groups = [];
         groups.push({
            label: 'Select a group...',
            value: 'Select a group...',
            text: 'Select a group...'
         });
         groups = groups.concat(this.props.navigation.getParam("groups", []))
         var group = this.props.navigation.getParam("group", "");
         if (group != "") {
            group = {
               label: group,
               value: group,
               text: group
            }
         } else {
            group = {
               label: 'Select a group...',
               value: 'Select a group...',
               text: 'Select a group...'
            }
         }
         this.setState({ email: email, name: name, allGroups: groups, group: group, fromEdit: true })
      } else {
         var email = this.props.navigation.getParam("email", DEFAULT_EMAIL);
         var bool = false;
         if (email != DEFAULT_EMAIL) {
            bool = true;
         }
         var temp = [];
         temp.push({
            label: 'Select a group...',
            value: 'Select a group...',
            text: 'Select a group...'
         });
         temp = temp.concat(this.props.navigation.getParam("groups", []))
         this.setState({ email: email, fromPending: bool, allGroups: temp, fromEdit: false });
      }
   }

   componentDidMount() {
      this._isMounted = true;
   }

   componentWillUnmount() {
      this.focusListener.remove()
      this._isMounted = false;
   }

   handleChangeGroup(val) {
      if (val != DEFAULT_GROUP) {
         if (this._isMounted) this.setState({ group: val });
      }
   }

   handleCancel = () => {
      if (this._isMounted) this.setState({ isDialogVisible: false, group: DEFAULT_GROUP });
   };

   handleCreate = () => {
      cf.AddNewGroup(this, this.state.group, this.state.allGroups)
   };



   handleAdd = () => {
      var aGroup = "";
      if (this.state.group != DEFAULT_GROUP && this.state.group.text && this.state.group.text != 'Select a group...') {
         aGroup = this.state.group.text.trim();
      }
      //Try adding the contact

      if (this.state.fromPending) {
         cf.AcceptContactRequest(this.props, this.state.email.trim(), this.state.name.trim(), aGroup, function (props) {
            props.navigation.navigate("YourContacts")
         })
         if (this._isMounted) this.setState({ fromPending: false })

      } else if (this.state.fromEdit) {
         cf.EditContact(this.props, this.state.email.trim(), this.state.name.trim(), aGroup, function (props) {
            props.navigation.navigate("YourContacts")
         })
         if (this._isMounted) this.setState({ fromEdit: false })

      } else {
         cf.SendContactRequest(this.props, this.state.email.trim(), this.state.name.trim(), aGroup, function (props) {
            props.navigation.navigate("YourContacts")
         })
      }
   };

   renderModalElement = () => {
      return (
         <Layout
            level='3'
            style={styles.modalContainer}>
            <Text category='h6' >{"Create New Group"}</Text>
            <Input
               style={styles.input}
               placeholder='Enter a group name'
               onChangeText={(group) => this._isMounted && this.setState({ group })}
               autoFocus={this.state.isDialogVisible ? true : false}
            />
            <Layout style={styles.buttonContainer}>
               <Button style={styles.modalButton} onPress={() => this.handleCancel()}>Cancel</Button>
               <Button style={styles.modalButton} onPress={() => { this.handleCreate() }}>Create</Button>
            </Layout>
         </Layout>
      );
   };

   render() {
      const renderMenuAction = () => (
         <TopNavigationAction icon={MenuOutline} onPress={() => this.props.navigation.toggleDrawer()} />
      );
      return (
         <React.Fragment>
            <TopNavigation
               title={(this.state.fromPending || this.state.fromEdit) ? "Edit Contact" : "New Contact"}
               alignment='center'
               leftControl={renderMenuAction()}
            />
            <Modal style={styles.modal}
               allowBackdrop={true}
               backdropStyle={{ backgroundColor: 'black', opacity: 0.75 }}
               onBackdropPress={() => { this._isMounted && this.setState({ isDialogVisible: !this.state.isDialogVisible }) }}
               visible={this.state.isDialogVisible}>
               {this.renderModalElement()}
            </Modal>
            <ScrollView style={[styles.scrollContainer, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
               <Layout style={styles.formOuterContainer} level='3'>
                  <Layout style={styles.formInnerContainer}>
                     <Input style={styles.inputRow}
                        label='Email'
                        placeholder='Enter an email'
                        value={this.state.email}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCompleteType="email"
                        returnKeyType='next'
                        onChangeText={(email) => this._isMounted && this.setState({ email })}
                        disabled={(this.state.fromPending || this.state.fromEdit) ? true : false}
                     />
                     <Input style={styles.inputRow}
                        label='Name'
                        autoCapitalize="words"
                        keyboardType="default"
                        placeholder='Enter a name'
                        value={this.state.name}
                        onChangeText={(name) => this._isMounted && this.setState({ name })}
                     />
                     <Layout style={styles.mainInputGroup}>
                        <Layout style={styles.selectBoxContainer}>
                           <Select style={styles.selectBox}
                              label='Group'
                              data={this.state.allGroups}
                              placeholder='Select a group...'
                              selectedOption={this.state.group}
                              onSelect={(group) => this.handleChangeGroup(group)}
                           />
                        </Layout>
                        <Button style={styles.groupButton} status="success" appearance='outline' onPress={() => this._isMounted && this.setState({ isDialogVisible: true })} >{"New Group"}</Button>
                     </Layout>
                     <Button style={styles.button} onPress={() => this.handleAdd()} >{(this.state.fromEdit) ? "Update Contact" : "Add Contact"}</Button>
                  </Layout>
               </Layout>
            </ScrollView>
            <NotificationPopup ref={ref => this.popup = ref} />
         </React.Fragment >
      );
   }
}


const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
      color: "black",
   },
   modal: {
      paddingBottom: 300, // TODO: Make this dynamic...
   },
   formOuterContainer: {
      margin: 8,
      padding: 8,
      borderRadius: 10,
   },
   formInnerContainer: {
      flex: 1,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
   },
   inputRow: {
      paddingVertical: 4,
   },
   selectBoxContainer: {
      flex: 1
   },
   selectBox: {
   },
   modalContainer: {
      flex: 1,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
   },
   input: {
      flexDirection: 'row',
      borderRadius: 30,
      width: 250,
      margin: 4,
   },
   buttonContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 250,
      borderRadius: 30,
   },
   modalButton: {
      flex: 1,
      margin: 4,
      borderRadius: 30,
   },
   button: {
      flex: 1,
      marginTop: 8,
      width: '100%',
   },
   scrollContainer: {
      flex: 1,
   },
   avoidingView: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
   },
   groupButton: {
      marginLeft: 8,
      alignSelf: "flex-end"
   },
   mainInputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
   },
});

export default NewContact;