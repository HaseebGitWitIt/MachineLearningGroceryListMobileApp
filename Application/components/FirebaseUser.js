import Firebase from "firebase";
import { Alert } from "react-native";

export default class FirebaseUser {
    constructor() {
        this.auth = Firebase.auth();
        this.user = this.auth.currentUser;
        if (this.user != null) {
            this.name = this.user.displayName;
            this.email = this.user.email;
            this.photoUrl = this.user.photoURL;
            this.emailVerified = this.user.emailVerified;
            this.uid = this.user.uid;
        }
    }

    async register(email, password, displayName) {
        this.auth = Firebase.auth();
        return await this.auth.createUserWithEmailAndPassword(email, password).then(() => {
            if (Firebase.auth().currentUser) {
                Firebase.auth().currentUser.sendEmailVerification().then(() => {
                    Alert.alert("Verification Email Send..", "For full functionality please confirm your email-address by opening the link that was send to the provided email-address.");
                    Firebase.auth().currentUser.updateProfile({
                        displayName: displayName
                    }).then(() => {
                        return true;
                    }, (error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log("FirebaseUser: " + errorCode + " " + errorMessage);
                        return false;
                    })
                }, (error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    Alert.alert(errorCode, errorMessage);
                    console.log("FirebaseUser: " + errorCode + " " + errorMessage);
                    return false;
                });
            } else {
                return false;
            }
        }, (error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode == "auth/weak-password") {
                alert("The password is too weak!");
            }
            else if (errorCode == "auth/email-already-in-use") {
                alert("The email-address is already in use!");
            } else {
                console.log("FirebaseUser: " + "Error(1) " + errorCode + ": " + errorMessage);
            }
            return false;
        });
    }

    async requestVerificationEmail() {
        if (Firebase.auth().currentUser != null) {
            await Firebase.auth().currentUser.sendEmailVerification().then(async function () {
                Alert.alert("New Verification Email Send.", "Check your email for the new verification email.");
            }).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                Alert.alert(errorCode, errorMessage);
                console.log("FirebaseUser: " + errorCode + " " + errorMessage);
                return false;
            });
        } else {
            return false;
        }
        return true;
    }

    getIdToken() {
        if (Firebase.auth().currentUser != null) {
            Firebase.auth().currentUser.getIdToken(true);
        }
    }

    isUserEmailVerified = () => {
        return this.emailVerified;
    }

    getDisplayName() {
        return this.displayName;
    }

    getCurrentUser() {
        return this.user;
    }

    reloadUserInfo() {
        this.user = Firebase.auth().currentUser.reload().then(() => {
            if (this.user != null) {
                this.name = this.user.displayName;
                this.email = this.user.email;
                this.photoUrl = this.user.photoURL;
                this.emailVerified = this.user.emailVerified;
                this.uid = this.user.uid;
            }
        });
    }
}