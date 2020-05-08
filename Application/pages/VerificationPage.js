import React, { Component } from "react";
import { Alert, StyleSheet } from "react-native";
import { Text, Layout, Button, ButtonGroup } from 'react-native-ui-kitten';
import globalStyles from "./pageStyles/GlobalStyle";
import FirebaseUser from "../components/FirebaseUser";
import * as firebase from 'firebase';

const VERIFY = "Verify";
const RESEND = "Resend confirmation link";
const HOMEPAGE = "Home";

class VerificationPage extends Component {
  constructor(props) {
    super(props);
  }

  buttonListener = buttonId => {
    var firebaseUser = new FirebaseUser();
    if (buttonId === VERIFY) {
      if (firebase.auth().currentUser.reload().then(() => { return firebase.auth().currentUser.emailVerified; })) {
        firebaseUser.getIdToken();
      } else {
        Alert.alert("Email Not Verified", "Check email for verification link.");
        console.log("VerificationPage: Email Verification Check Failed!");
      }
    } else if (buttonId === RESEND) {
      firebaseUser.requestVerificationEmail();
    }
  };

  render() {
    return (
      <Layout style={globalStyles.defaultContainer}>
        <Layout style={styles.formOuterContainer} level='3'>
          <Layout style={styles.formInnerContainer}>
            <Text style={styles.textPadding} category='h6'>Please confirm your email address by clicking the verification link that was send to the email address that was provided during registration.</Text>
            <Text style={styles.textPadding} appearance='hint'>** Check your junk folder if you cannot find the email or you can request a new confirmation email.</Text>
            <Button style={styles.button} appearance='outline' status='success' onPress={() => this.buttonListener(VERIFY)} >{VERIFY}</Button>
            <Button style={styles.button} appearance='outline' status='warning' onPress={() => this.buttonListener(RESEND)} >{RESEND}</Button>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 8,
    justifyContent: 'center',
  },
  textPadding: {
    paddingBottom: 4,
    textAlign: 'center'
  },
  formOuterContainer: {
    margin: 8,
    padding: 8,
    borderRadius: 10,
  },
  formInnerContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});

export default VerificationPage;