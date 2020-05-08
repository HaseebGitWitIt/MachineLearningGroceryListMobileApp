import React, { Component } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { TopNavigation, TopNavigationAction, Layout, Text, Button, Input, Icon, Spinner } from 'react-native-ui-kitten';
import { dark, light } from '../assets/Themes.js';
import { ArrowBackIcon } from "../assets/icons/icons.js";
import firebase from 'firebase';

const PAGE_TITLE = "User Account";

export default class UserAccountPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
            secureTextEntry: true,
            updatingPassword: false,
        }
        this.focusListener = this.props.navigation.addListener(
            "willFocus",
            () => {
                this._isMount = true;
                this.state = { oldPassword: "", newPassword: "", confirmNewPassword: "", secureTextEntry: true, };
            }
        );

    }

    updatePassword = () => {
        if (this.checkInputs()) {
            this.setState({ updatingPassword: true });
            firebase.auth()
                .signInWithEmailAndPassword(firebase.auth().currentUser.email, this.state.oldPassword)
                .then((user) => {
                    if (user != null) {
                        firebase.auth().currentUser.updatePassword(this.state.newPassword).then(() => {
                            this.setState({
                                oldPassword: "",
                                newPassword: "",
                                confirmNewPassword: "",
                                secureTextEntry: true,
                                updatingPassword: false
                            });
                            Alert.alert("Password Updated", "", [{ text: 'OK', onPress: () => this.setState({ updatingPassword: false }) }], { cancelable: false });
                        }).catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            if (errorCode == "auth/weak-password") {
                                Alert.alert("Password Not Updated", "The new password is too weak!", [{ text: 'OK', onPress: () => this.setState({ updatingPassword: false }) }], { cancelable: false });
                            }
                            console.log("FirebaseUser: " + errorCode + " " + errorMessage);
                            this.setState({ updatingPassword: false });
                        });
                    }
                }).catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == "auth/wrong-password") {
                        Alert.alert("Invalid Password", "Old password was incorrect.", [{ text: 'OK', onPress: () => this.setState({ updatingPassword: false }) }], { cancelable: false });
                    }
                    console.log("FirebaseUser: " + errorCode + " " + errorMessage);
                    this.setState({ updatingPassword: false });
                });
        }

    }

    checkInputs() {
        if (!this.state.oldPassword || !this.state.newPassword
            || !this.state.confirmNewPassword) {
            Alert.alert("Invalid Inputs!");
            return false;
        } else {
            if (this.state.newPassword == this.state.confirmNewPassword) {
                return true;
            }
            else {
                Alert.alert("Passwords don't match!");
                return false;
            }
        }
    }

    returnDispalyName() {
        if (firebase.auth().currentUser != null && firebase.auth().currentUser.displayName != null) {
            return (firebase.auth().currentUser.displayName);
        }
    }

    returnEmailAddress() {
        if (firebase.auth().currentUser != null && firebase.auth().currentUser.email != null) {
            return (firebase.auth().currentUser.email);
        }
    }

    renderPasswordEyeIcon = (style) => {
        const iconName = this.state.secureTextEntry ? 'eye-off' : 'eye';
        return (
            <Icon {...style} name={iconName} />
        );
    };

    onPasswordEyeIconPress = () => {
        const secureTextEntry = !this.state.secureTextEntry;
        if (this._isMount) this.setState({ secureTextEntry });
    };

    render() {
        const renderMenuAction = () => (
            <TopNavigationAction icon={ArrowBackIcon} onPress={() => this.props.navigation.goBack()} />
        );
        return (
            <React.Fragment>
                <TopNavigation
                    title={PAGE_TITLE}
                    alignment='center'
                    leftControl={renderMenuAction()}
                />
                <Layout style={styles.container}>
                    <ScrollView style={[styles.container, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]} >
                        <Layout style={styles.contentOuterContainer} level='3'>
                            <Layout style={styles.contentInnerContainer}>
                                <Layout style={styles.contentRow}>
                                    <Text style={styles.content}>{"Display Name: "}</Text>
                                    <Text style={styles.content}>{this.returnDispalyName()}</Text>
                                </Layout>
                                <Layout style={styles.contentRow}>
                                    <Text style={styles.content}>{"Email Address: "}</Text>
                                    <Text style={styles.content}>{this.returnEmailAddress()}</Text>
                                </Layout>

                            </Layout>
                        </Layout>
                        <Layout style={styles.contentOuterContainer} level='3'>
                            {!this.state.updatingPassword &&
                                <Layout style={styles.contentInnerContainer}>
                                    <Layout style={styles.contentRow}>
                                        <Input
                                            style={styles.input}
                                            placeholder="Enter your old password..."
                                            ref="oldPassword"
                                            autoCapitalize="none"
                                            autoCompleteType="password"
                                            returnKeyType='next'
                                            icon={this.renderPasswordEyeIcon}
                                            secureTextEntry={this.state.secureTextEntry}
                                            onIconPress={this.onPasswordEyeIconPress}
                                            onChangeText={oldPassword => this._isMount && this.setState({ oldPassword })}
                                            onSubmitEditing={() => this.refs.newPassword.focus()}
                                            blurOnSubmit={false}
                                            value={this.state.oldPassword} />
                                    </Layout>
                                    <Layout style={styles.contentRow}>
                                        <Input
                                            style={styles.input}
                                            placeholder="Enter your new password..."
                                            ref="newPassword"
                                            autoCapitalize="none"
                                            autoCompleteType="password"
                                            returnKeyType='next'
                                            icon={this.renderPasswordEyeIcon}
                                            secureTextEntry={this.state.secureTextEntry}
                                            onIconPress={this.onPasswordEyeIconPress}
                                            onChangeText={newPassword => this._isMount && this.setState({ newPassword })}
                                            onSubmitEditing={() => this.refs.confirmNewPassword.focus()}
                                            blurOnSubmit={false}
                                            value={this.state.newPassword} />
                                    </Layout>
                                    <Layout style={styles.contentRow}>
                                        <Input
                                            style={styles.input}
                                            placeholder="Confirm your new password..."
                                            ref="confirmNewPassword"
                                            autoCapitalize="none"
                                            autoCompleteType="password"
                                            icon={this.renderPasswordEyeIcon}
                                            secureTextEntry={this.state.secureTextEntry}
                                            onIconPress={this.onPasswordEyeIconPress}
                                            onChangeText={confirmNewPassword => this._isMount && this.setState({ confirmNewPassword })}
                                            blurOnSubmit={false}
                                            value={this.state.confirmNewPassword} />
                                    </Layout>
                                    <Layout style={styles.contentRow}>
                                        <Button
                                            style={styles.changePasswordButton}
                                            disabled={this.state.updatingPassword}
                                            onPress={this.updatePassword}
                                        >
                                            {"Update Password"}
                                        </Button>
                                    </Layout>
                                </Layout>
                            }
                            {this.state.updatingPassword &&
                                <Layout style={styles.spinnerContainer}>
                                    <Spinner status='warning' />
                                </Layout>
                            }
                        </Layout>
                    </ScrollView>
                </Layout>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentOuterContainer: {
        margin: 4,
        padding: 4,
        borderRadius: 20,
    },
    contentInnerContainer: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    contentRow: {
        margin: 2,
        flexDirection: 'row',
    },
    content: {
        margin: 4,
    },
    input: {
        flex: 1,
        borderRadius: 20,
    },
    changePasswordButton: {
        flex: 1,
        margin: 4,
        borderRadius: 20,
    },
    spinnerContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
});
