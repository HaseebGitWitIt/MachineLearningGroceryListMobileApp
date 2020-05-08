import React, { Component } from "react";
import { Alert, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Layout, Button, Input } from 'react-native-ui-kitten';
import { ScrollView } from "react-native-gesture-handler";
import * as firebase from "firebase";
import globalStyles from "../pages/pageStyles/GlobalStyle";
import * as ng from "../navigation/NavigationGlobals";

const RESETPASS = "Reset Password";
const BACK_TO_LOGIN = "Back To Login";

class ForgotPasswordPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: ""
        };
    }

    resetPassword = () => {
        firebase.auth().sendPasswordResetEmail(this.state.email).then(() => {
            Alert.alert("Password Reset Link Sent", "Please check your email for the password reset link.");
        }, (error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            Alert.alert(errorCode, errorMessage);
            console.log(errorCode + " " + errorMessage);
        });
    }

    onBackToLoginPress = () => {
        this.props.navigation.navigate(ng.LOGINPAGE);
    }

    render() {
        return (
            <Layout style={globalStyles.defaultContainer}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Layout style={styles.columnContainer}>
                        <Layout style={styles.rowContainer}>
                            <Input
                                style={styles.input}
                                placeholder="Enter your email..."
                                ref="email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCompleteType="email"
                                onChangeText={email => this.setState({ email })}
                                onSubmitEditing={() => this.refs.reset.scrollTo}
                                value={this.state.email} />
                        </Layout>
                        <Layout style={styles.rowContainer}>
                            <Button
                                style={styles.button}
                                ref="reset"
                                onPress={this.resetPassword}>
                                {RESETPASS}
                            </Button>
                        </Layout>
                        <Layout style={styles.rowContainer}>
                            <Button
                                style={styles.button}
                                ref="backToLogin"
                                onPress={this.onBackToLoginPress}>
                                {BACK_TO_LOGIN}
                            </Button>
                        </Layout>
                    </Layout>
                </ScrollView>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    columnContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    button: {
        marginVertical: 4,
        marginHorizontal: 4,
        borderRadius: 30,
        width: 250,
    },
    input: {
        flexDirection: 'row',
        borderRadius: 30,
        width: 250,
    },
});

export default ForgotPasswordPage;
