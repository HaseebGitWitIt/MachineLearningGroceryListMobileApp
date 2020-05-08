import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './SideMenuStyle';
import { NavigationActions } from 'react-navigation';
import { ScrollView } from 'react-native';
import { Layout, Text, Button } from 'react-native-ui-kitten';
import firebase from 'firebase';
import { PersonIcon } from '../assets/icons/icons.js';
import { dark, light } from '../assets/Themes.js';

const YOUR_DATA = "Your Data";
const ABOUT_US = "About Us";
const PRIVACY_POLICY = "Privacy Policy";
const HOME = "Home";
const CONTACTS = "Contacts";
const YOUR_LISTS = "Your Lists";
const SEARCH_RECIPE = "Find Recipes";
const FEEDBACK = "Feedback";
const ADD_ITEM_LOCATION = "Add Item Location";
const MAP_A_STORE = "Map a Store";
const REGISTER_AN_ITEM = "Register an Item";
const SIGNOUT = "Sign Out";
const EXCEL_PARSER = "Parse Excel File";
const FAV_RECIPE_PAGE = "Your Favourite Recipes";

const DEV_MODE_ENABLED = false;
import * as Crypto from 'expo-crypto';

export default class SideMenu extends Component {
    constructor(props) {
        super(props)
    }

    navigateToScreen = (route) => () => {
        if (route == 'Logout') {
            this.signOutUser();
        } else {
            const navigateAction = NavigationActions.navigate({
                routeName: route
            });
            this.props.navigation.dispatch(navigateAction);
        }
    }

    signOutUser = async () => {
        try {
            var currentUserEmail = firebase.auth().currentUser.email.toString();
            const digest = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                currentUserEmail
            );
            firebase
                .database()
                .ref("/userInfo/" + digest + "/notificationToken")
                .remove()
            await firebase.auth().signOut();
        } catch (e) {
            console.log(e);
        }
    }

    devModeRender() {
        return (
            <Text
                style={styles.navItemStyle}
                onPress={this.navigateToScreen('ExcelParserPage')}
            >
                {EXCEL_PARSER}
            </Text>
        );
    }

    returnDispalyName() {
        if (firebase.auth().currentUser != null && firebase.auth().currentUser.displayName != null) {
            return (firebase.auth().currentUser.displayName);
        }
    }

    render() {
        return (
            <Layout style={styles.columnContainer} level='2'>
                <ScrollView style={[styles.container, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]} >
                    <Layout style={styles.profileOuterContainer} level='3'>
                        <Layout style={styles.profileInnerContainer} level='2'>
                            <Button
                                style={styles.profileButton}
                                appearance='outline'
                                status='basic'
                                icon={PersonIcon}
                                onPress={this.navigateToScreen('UserAccountPage')}
                            />
                            <Layout style={styles.profileNameContainer} level='2'>
                                <Text category='h4'>{this.returnDispalyName()}</Text>
                            </Layout>
                        </Layout>
                    </Layout>
                    <Layout style={styles.columnContainer}>
                        <Layout style={styles.headingContainer} level='4'>
                            <Text style={styles.sectionHeadingStyle}>
                                {YOUR_DATA}
                            </Text>
                        </Layout>
                        <Layout style={styles.navSectionStyle} level='3'>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('Home')}>
                                {HOME}
                            </Text>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('YourContacts')}>
                                {CONTACTS}
                            </Text>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('YourListsPage')}>
                                {YOUR_LISTS}
                            </Text>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('FindRecipePage')}>
                                {SEARCH_RECIPE}
                            </Text>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('FavRecipesPage')}>
                                {FAV_RECIPE_PAGE}
                            </Text>
                        </Layout>
                    </Layout>
                    <Layout style={styles.columnContainer}>
                        <Layout style={styles.headingContainer} level='4'>
                            <Text style={styles.sectionHeadingStyle}>
                                {FEEDBACK}
                            </Text>
                        </Layout>
                        <Layout style={styles.navSectionStyle} level='3'>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('AddItemLocationPage')}>
                                {ADD_ITEM_LOCATION}
                            </Text>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('MapCreatorPage')}>
                                {MAP_A_STORE}
                            </Text>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('RegisterItemPage')}>
                                {REGISTER_AN_ITEM}
                            </Text>
                            {DEV_MODE_ENABLED && this.devModeRender()}
                        </Layout>
                    </Layout>
                    <Layout style={styles.columnContainer}>
                        <Layout style={styles.headingContainer} level='4'>
                            <Text style={styles.sectionHeadingStyle}>
                                {ABOUT_US}
                            </Text>
                        </Layout>
                        <Layout style={styles.navSectionStyle} level='3'>
                            <Text style={styles.navItemStyle} onPress={this.navigateToScreen('PrivacyPolicyPage')}>
                                {PRIVACY_POLICY}
                            </Text>
                        </Layout>
                    </Layout>
                </ScrollView>
                <Layout style={styles.footerContainer} level='3'>
                    <Layout level='3'>
                        <Text style={styles.signedInText} appearance='hint'>{"Signed in as "}{this.returnDispalyName()}</Text>
                    </Layout>
                    <Layout level='3'>
                        <Text style={styles.navItemStyle} onPress={this.navigateToScreen('Logout')}>{SIGNOUT}</Text>
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

SideMenu.propTypes = {
    navigation: PropTypes.object
};