import React, { Component } from 'react';
import { StyleSheet, ScrollView, Image } from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Button, } from 'react-native-ui-kitten';
import { ArrowBackIcon } from "../assets/icons/icons.js";
import globalStyles from "../pages/pageStyles/GlobalStyle";
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';

const PAGE_TITLE = "Privacy Policy";

export default class PrivacyPolicyPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            registration: false,
        };
        this.state = {
            registration: this.props.navigation.getParam('registration', false)
        };

        // Set "that" for the notification manager
        nm.setThat(this)
    }

    onDenyPress = () => {
        this.props.navigation.state.params.onDeny();
        this.props.navigation.goBack();
    }

    onAcceptPress = () => {
        this.props.navigation.state.params.onAccept();
        this.props.navigation.goBack();
    }

    render() {
        const renderMenuAction = () => (
            <TopNavigationAction
                icon={ArrowBackIcon}
                onPress={() => this.props.navigation.goBack()}
            />
        );
        return (
            <React.Fragment>
                <TopNavigation
                    title={PAGE_TITLE}
                    alignment="center"
                    leftControl={renderMenuAction()}
                />
                <Layout style={globalStyles.defaultContainer}>
                    <ScrollView style={styles.scrollContainer}>
                        <Layout style={styles.imageContainer}>
                            <Image source={require('../assets/icon.png')} />
                        </Layout>
                        <Layout style={styles.titleContainer}>
                            <Text style={styles.centeredText} category='h4'>{"Our Commitment to Privacy"}</Text>
                        </Layout>
                        <Layout style={styles.questionAnswer} level='2'>
                            <Text style={styles.LeftAlignedText} category='s1'>{"What happens when you create a Grocery List Manager account?"}</Text>
                            <Text style={styles.LeftAlignedText} category='p1'>{"We use Google Cloud Platform to securely encrypt and store your personal information such as your name, email-address and password."}</Text>
                        </Layout>
                        <Layout style={styles.questionAnswer} level='2'>
                            <Text style={styles.LeftAlignedText} category='s1'>{"What does Grocery List Manager do with your usage data?"}</Text>
                            <Text style={styles.LeftAlignedText} category='p1'>{"Grocery List Manager stores the absolute minimum amount of data we believe is required to provide the features of our service. We will not sell, rent, share or otherwise disclose your personal information to anyone except as necessary to provide our services or as otherwise described in this Policy without first providing you with notice and the opportunity to consent. We do not use data to identify who you are and any application usage history data generated for machine learning is anonymized to protect the user."}</Text>
                            <Text style={styles.LeftAlignedText} category='p1'>{"Here's how Grocery List Manager uses this data:"}</Text>
                            <Layout style={styles.detailedTextContainer} level='3'>
                                <Text style={styles.LeftAlignedText} category='s1'>{"User ID: "}<Text category='p1'>{"We generate a random identifer when you sign-up for an account."}</Text></Text>
                            </Layout>
                            <Layout style={styles.detailedTextContainer} level='3'>
                                <Text style={styles.LeftAlignedText} category='s1'>{"Device Notification Token: "}<Text category='p1'>{"We temporatly store the device notification token to send push notifications as required by some of the features in the application."}</Text></Text>
                            </Layout>
                        </Layout>
                        <Layout style={styles.questionAnswer} level='2'>
                            <Text style={styles.LeftAlignedText} category='s1'>{"What guidelines does Grocery List Manager follow for user data privacy?"}</Text>
                            <Text style={styles.LeftAlignedText} category='p1'>{"Grocery List Manager will act in accordance with Canada’s Personal Information Protection and Electronic Documents Act.\nWe will notify users of Grocery List Manager if this Privacy Policy ever changes and users will be provided with a summary of the changes."}</Text>
                        </Layout>
                        {this.state.registration ? <Layout style={styles.userInputContainer}>
                            <Layout style={styles.userInputButtonGroup} >
                                <Button
                                    style={styles.userInputButtonLeft}
                                    status='danger'
                                    onPress={this.onDenyPress}>
                                    {"DENY"}
                                </Button>
                                <Button
                                    style={styles.userInputButtonRight}
                                    status='success'
                                    onPress={this.onAcceptPress}>
                                    {"ACCEPT"}
                                </Button>
                            </Layout>
                        </Layout> : null}
                    </ScrollView>
                </Layout>
                <NotificationPopup ref={ref => this.popup = ref} />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    scrollContainer: {
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 16,
    },
    titleContainer: {
        margin: 8,
    },
    centeredText: {
        textAlign: 'center',
        margin: 4,
    },
    LeftAlignedText: {
        textAlign: 'left',
        margin: 4,
    },
    questionAnswer: {
        margin: 8,
        padding: 4,
        borderRadius: 10,
    },
    detailedTextContainer: {
        flexDirection: 'row',
        marginVertical: 2,
        paddingTop: 2,
        borderRadius: 10,
    },
    userInputContainer: {
        flex: 1,
        margin: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    userInputButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    userInputButtonLeft: {
        flex: 1,
        padding: 8,
        marginRight: 4,
        borderRadius: 10,
    },
    userInputButtonRight: {
        flex: 1,
        padding: 8,
        marginLeft: 4,
        borderRadius: 10,
    },
});