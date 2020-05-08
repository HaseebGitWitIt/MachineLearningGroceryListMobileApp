import {
   Alert
} from "react-native";
import * as firebase from "firebase";
import * as Crypto from 'expo-crypto';

/**
 * This class contains all the functions that the UI uses to manipulate the database.
 */
class ContactFunctions {
   constructor() {}

   sendNotification = (token, title, body, data) => {
      console.log("TOken: " + token)
      let response = fetch('https://exp.host/--/api/v2/push/send', {
         method: 'POST',
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: data
         })
      });
   }

   RemoveYourContactsPageListeners() {
      firebase
         .database()
         .ref("/contacts/" + firebase.auth().currentUser.uid).off()
   }

   async ShareRecipe(props, recipeName, usersToShareWith, callback) {
      var that = this;
      firebase
         .database()
         .ref("/userInfo/")
         .once("value", async (snapshot) => {
            if (snapshot.val()) {
               for (user in usersToShareWith) {
                  var name = firebase.auth().currentUser.email;
                  const hashedName = await Crypto.digestStringAsync(
                     Crypto.CryptoDigestAlgorithm.SHA256,
                     name
                  );
                  var userInfoKey = usersToShareWith[user];
                  if (snapshot.val()[userInfoKey]) {
                     var uidOfUserToShare = snapshot.val()[userInfoKey].uid
                     var notificationToken = snapshot.val()[userInfoKey].notificationToken
                     firebase
                        .database()
                        .ref("/contacts/" + uidOfUserToShare)
                        .once("value", function (snapshot) {
                           if (snapshot.val()) {
                              for (contact in snapshot.val()) {
                                 if (snapshot.val()[contact].email == hashedName) {
                                    name = snapshot.val()[contact].name;
                                    var title = 'Grocery Shopping Recipe Sharing';
                                    var message = name + ' has shared the following recipe with you: ' + recipeName;
                                    that.sendNotification(notificationToken, title, message, {
                                       "page": "RecipeDetailsPage",
                                       "name": recipeName,
                                       "title": title,
                                       "message": message,
                                    });
                                    break;
                                 }
                              }
                           } else {
                              console.log("Contacts not configured properly")
                           }
                        })

                     callback(props)

                  } else {
                     console.log("Could not get user info key")
                  }
               }
            } else {
               console.log("Could not get users")
            }
         })
   }

   EditContact(props, contactEmail, contactName, contactGroup, callback) {
      var currentUser = firebase.auth().currentUser
      firebase
         .database()
         .ref("/contacts/" + currentUser.uid)
         .once("value", function (snapshot) {
            var ssv = snapshot.val();
            if (ssv) {
               for (var contact in ssv) {
                  if (ssv[contact].email == contactEmail) {
                     firebase
                        .database()
                        .ref("/contacts/" + currentUser.uid + "/" + contact)
                        .update({
                           "name": contactName,
                           "group": contactGroup
                        });
                     callback(props)
                     break
                  }
               }
            }
         })
   }

   async ShareList(props, listName, listID, usersToShareWith, callback) {
      // Update user count in lists and add to users shared list
      // Alert.alert("List " + listID + " will be shared with: " + usersToShareWith.toString());
      var that = this;
      firebase
         .database()
         .ref("/userInfo/")
         .once("value", async (snapshot) => {
            if (snapshot.val()) {
               for (user in usersToShareWith) {
                  var name = firebase.auth().currentUser.email;
                  const hashedName = await Crypto.digestStringAsync(
                     Crypto.CryptoDigestAlgorithm.SHA256,
                     name
                  );
                  var userInfoKey = usersToShareWith[user];
                  if (snapshot.val()[userInfoKey]) {
                     var uidOfUserToShare = snapshot.val()[userInfoKey].uid
                     var notificationToken = snapshot.val()[userInfoKey].notificationToken
                     firebase
                        .database()
                        .ref("/users/" + uidOfUserToShare + "/lists/shared")
                        .child(listID)
                        .set(0)
                        .then(data => {
                           firebase
                              .database()
                              .ref("/lists/" + listID)
                              .once("value", function (snapshot) {
                                 if (snapshot.val()) {
                                    var newCount = (snapshot.val().user_count) + 1;
                                    firebase
                                       .database()
                                       .ref("/lists/" + listID)
                                       .update({
                                          user_count: newCount
                                       }).then(data => {
                                          firebase
                                             .database()
                                             .ref("/contacts/" + uidOfUserToShare)
                                             .once("value", function (snapshot) {
                                                if (snapshot.val()) {
                                                   for (contact in snapshot.val()) {
                                                      if (snapshot.val()[contact].email == hashedName) {
                                                         name = snapshot.val()[contact].name;
                                                         var title = 'Grocery Shopping List Sharing';
                                                         var message = name + ' has shared the following list with you: ' + listName;
                                                         that.sendNotification(notificationToken, title, message, {
                                                            "page": "CurrentListPage",
                                                            "name": listName,
                                                            "listID": listID,
                                                            "title": title,
                                                            "message": message
                                                         });
                                                         break;
                                                      }
                                                   }
                                                } else {
                                                   console.log("Contacts not configured properly")
                                                }
                                             })

                                          callback(props)
                                       }).catch(error => {
                                          Alert.alert("ERROR: Contact developer")
                                          console.log("Error updating user count: " + error)
                                       });
                                 } else {
                                    console.log("Error could not find list.")
                                 }
                              })
                        })
                        .catch(error => {
                           console.log("Failed to share list: " + error);
                        });
                  } else {
                     console.log(tempEmail + " account was not configured in table 'userInfo' correctly.")
                  }

               }
            }
         })
   }

   async DeleteContact(email) {
      var currentUser = firebase.auth().currentUser
      firebase
         .database()
         .ref("/contacts/" + currentUser.uid)
         .once("value", function (snapshot) {
            if (snapshot.val()) {
               var ssv = snapshot.val()
               for (var contact in ssv) {
                  if (ssv[contact].email == email) {
                     firebase
                        .database()
                        .ref("/contacts/" + currentUser.uid)
                        .child(contact)
                        .remove();

                     var userInfoKey = email;
                     firebase
                        .database()
                        .ref("/userInfo/" + userInfoKey)
                        .once("value", function (snapshot) {
                           if (snapshot.val()) {
                              var uid = snapshot.val().uid
                              firebase
                                 .database()
                                 .ref("/contacts/" + uid)
                                 .once("value", async (snapshot) => {
                                    if (snapshot.val()) {
                                       const hashedEmail = await Crypto.digestStringAsync(
                                          Crypto.CryptoDigestAlgorithm.SHA256,
                                          currentUser.email
                                       );
                                       for (var contact in snapshot.val()) {

                                          if (snapshot.val()[contact].email == hashedEmail) {

                                             firebase
                                                .database()
                                                .ref("/contacts/" + uid)
                                                .child(contact)
                                                .remove();
                                          }
                                       }
                                    }
                                 })
                           } else {
                              console.log("User not logged in properly.")
                           }
                        })
                  }
               }
            }
         })
   }

   async RejectContactRequest(requestEmail) {
      var currentUser = firebase.auth().currentUser
      firebase
         .database()
         .ref("/contacts/" + currentUser.uid)
         .once("value", async (snapshot) => {
            if (snapshot.val()) {
               var ssv = snapshot.val()
               const requestEmailHashed = await Crypto.digestStringAsync(
                  Crypto.CryptoDigestAlgorithm.SHA256,
                  requestEmail
               );
               for (var contact in ssv) {
                  if (ssv[contact].email == requestEmail) {
                     firebase
                        .database()
                        .ref("/contacts/" + currentUser.uid)
                        .child(contact)
                        .remove();

                     var userInfoKey = requestEmailHashed;
                     firebase
                        .database()
                        .ref("/userInfo/" + userInfoKey)
                        .once("value", function (snapshot) {
                           if (snapshot.val()) {
                              var requestuid = snapshot.val().uid
                              firebase
                                 .database()
                                 .ref("/contacts/" + requestuid)
                                 .once("value", async (snapshot) => {
                                    if (snapshot.val()) {
                                       const hashedEmail = await Crypto.digestStringAsync(
                                          Crypto.CryptoDigestAlgorithm.SHA256,
                                          currentUser.email
                                       );
                                       for (var contact in snapshot.val()) {

                                          if (snapshot.val()[contact].email == hashedEmail) {

                                             firebase
                                                .database()
                                                .ref("/contacts/" + requestuid)
                                                .child(contact)
                                                .remove();
                                          }
                                       }
                                    }


                                 })
                           } else {
                              console.log("User not logged in properly.")
                           }
                        })
                  }
               }
            }
         });
   }

   async AcceptContactRequest(props, contactEmail, contactName, contactGroup, callback) {
      var that = this
      var currentUser = firebase.auth().currentUser
      firebase
         .database()
         .ref("/contacts/" + currentUser.uid)
         .once("value", async (snapshot) => {
            var ssv = snapshot.val();
            if (ssv) {
               const changeEmail = await Crypto.digestStringAsync(
                  Crypto.CryptoDigestAlgorithm.SHA256,
                  contactEmail
               );
               for (var contact in ssv) {
                  if (ssv[contact].email == contactEmail) {
                     firebase
                        .database()
                        .ref("/contacts/" + currentUser.uid + "/" + contact)
                        .update({
                           "email": changeEmail,
                           "status": "contact",
                           "name": contactName,
                           "group": contactGroup
                        });
                     var userInfoKey = changeEmail;
                     var token = '';
                     var name = '';
                     firebase
                        .database()
                        .ref("/userInfo/" + userInfoKey)
                        .once("value", function (snapshot) {
                           if (snapshot.val()) {
                              token = snapshot.val().notificationToken
                              var newuid = snapshot.val().uid
                              firebase
                                 .database()
                                 .ref("/contacts/" + newuid)
                                 .once("value", async (snapshot) => {
                                    var ssv = snapshot.val();
                                    if (ssv) {
                                       const hashedEmail = await Crypto.digestStringAsync(
                                          Crypto.CryptoDigestAlgorithm.SHA256,
                                          currentUser.email
                                       );
                                       for (var contact in ssv) {
                                          if (ssv[contact].email == hashedEmail) {
                                             firebase
                                                .database()
                                                .ref("/contacts/" + newuid + "/" + contact)
                                                .update({
                                                   "status": "contact"
                                                });
                                             name = ssv[contact].name
                                             var title = 'Grocery Shopping List New Contact';
                                             var message = name + ' has accepted your contact request!';
                                             that.sendNotification(token, title, message, {
                                                "page": "YourContacts",
                                                "title": title,
                                                "message": message
                                             });
                                             break;
                                          }
                                       }
                                    } else {
                                       console.log("Something went wrong!")
                                    }
                                 })

                              callback(props)

                           } else {
                              console.log("The app was not configured properly.")
                           }
                        });

                  }
               }
            }
         })
   }

   AddNewGroup(that, groupName, listOfGroups) {
      for (group in listOfGroups) {
         if (listOfGroups[group].text == groupName) {
            Alert.alert("That group already exists!")
            return;
         }
      }
      var obj = {
         label: groupName,
         value: groupName,
         text: groupName
      };
      listOfGroups.push(obj);
      if (that._isMounted) that.setState({
         isDialogVisible: false,
         group: obj,
         allGroups: listOfGroups
      });
   }

   async SendContactRequest(props, email, name, group, callback) {
      var that = this;
      firebase.auth().fetchSignInMethodsForEmail(email)
         .then(function (signInMethods) {
            if (signInMethods.length == 0) {
               Alert.alert("The email you entered does not have an account with us!")
            } else {
               var uid = firebase.auth().currentUser.uid
               var currentUserEmail = firebase.auth().currentUser.email.toString()
               firebase
                  .database()
                  .ref("/contacts/" + uid)
                  .once("value", async (snapshot) => {
                     const tempEmail = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        email
                     );
                     var ssv = snapshot.val();
                     if (ssv) {
                        for (var contact in ssv) {

                           if (ssv[contact].email == tempEmail) {
                              if (ssv[contact].status == "sent") {
                                 Alert.alert("You have already sent a contact request to this person!")
                                 return
                              } else if (ssv[contact].status == "contact") {
                                 Alert.alert("This person is already a contact of yours!")
                                 return
                              } else if (ssv[contact].status == "pending") {
                                 Alert.alert("You have a contact request from this person pending!")
                                 return
                              }
                           }
                        }
                     }
                     // Place contact request in your sent
                     firebase
                        .database()
                        .ref("/contacts/" + uid)
                        .push({
                           name: name,
                           group: group,
                           email: tempEmail,
                           status: "sent"
                        });

                     // Place contact request in other persons pending
                     var userInfoKey = tempEmail;
                     var token = '';
                     firebase
                        .database()
                        .ref("/userInfo/" + userInfoKey)
                        .once("value", function (snapshot) {
                           if (snapshot.val()) {
                              // Keep email here so user knows who sent it
                              firebase
                                 .database()
                                 .ref("/contacts/" + snapshot.val().uid)
                                 .push({
                                    name: "",
                                    group: "",
                                    email: currentUserEmail,
                                    status: "pending"
                                 });
                              token = snapshot.val().notificationToken
                              var title = 'Grocery Shopping List Contact Request';
                              var message = 'A user with the email ' + firebase.auth().currentUser.email.toString() + ' has sent you a contact request!';
                              that.sendNotification(token, title, message, {
                                 "page": "YourContacts",
                                 "title": title,
                                 "message": message
                              });
                           } else {
                              console.log("The app was not configured properly.")
                           }
                        });

                     callback(props)
                     Alert.alert("Your contact will appear once the other person accepts it.")




                  });
            }

         })
         .catch(function (error) {
            Alert.alert("You used an invalid email format!")
         });
   }

   GetContactInfo(that) {
      var uid = firebase.auth().currentUser.uid
      firebase
         .database()
         .ref("/contacts/" + uid).orderByChild("name")
         .on("value", function (snapshot) {
            var allContacts = [];
            var groups = [];
            var groupNames = [];
            var groupedList = {};
            var pendingList = {};
            var sections = [];
            var groupsWithoutPending = [];
            var sectionsWithoutPending = [];
            snapshot.forEach(function (child) {
               if (child.val().status == "sent") {} else if (child.val().status == "pending") {
                  if (groupNames.includes("Pending")) {
                     pendingList["Pending"].push(child.val())
                  } else {
                     groups.push({
                        label: "Pending",
                        value: "Pending",
                        text: "Pending"
                     })
                     groupNames.push("Pending")
                     pendingList["Pending"] = [];
                     pendingList["Pending"].push(child.val())

                  }
               } else {
                  allContacts.push(child.val());

                  if (child.val().group != "") {

                     if (groupNames.includes(child.val().group)) {
                        groupedList[child.val().group].push(child.val())
                     } else {
                        groups.push({
                           label: child.val().group,
                           text: child.val().group,
                           value: child.val().group
                        })
                        groupsWithoutPending.push({
                           label: child.val().group,
                           text: child.val().group,
                           value: child.val().group
                        })
                        groupNames.push(child.val().group)
                        groupedList[child.val().group] = [];
                        groupedList[child.val().group].push(child.val())

                     }
                  }
               }
            });

            for (var group in pendingList) {
               var temp = [];
               for (var person in pendingList[group]) {
                  temp.push(pendingList[group][person]);
               }
               sections.push({
                  title: group,
                  data: temp
               });
            }

            for (var group in groupedList) {
               var temp = [];
               for (var person in groupedList[group]) {
                  temp.push(groupedList[group][person]);
               }
               sections.push({
                  title: group,
                  data: temp
               });
               sectionsWithoutPending.push({
                  title: group,
                  data: temp
               });
            }
            sections.push({
               title: "All Contacts",
               data: allContacts
            });
            sectionsWithoutPending.push({
               title: "All Contacts",
               data: allContacts
            });
            if (that._isMounted) that.setState({
               sections: sections,
               groups: groups,
               sectionsWoPending: sectionsWithoutPending,
               groupsWoPending: groupsWithoutPending
            });

         });
   }
}

const lf = new ContactFunctions();
export default lf;