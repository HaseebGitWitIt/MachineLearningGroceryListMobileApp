import React, { Component } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Layout, Text, Button, } from 'react-native-ui-kitten';

export default class RecipesCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { title = 'Title', description = 'description', imageSource = '', onPress = () => { }, onSharePress = () => { }, onDetailsPress = () => { } } = this.props;
        return (
            <Layout style={styles.cardContainer} level='4'>
                <Layout style={styles.card}>
                    <Layout style={styles.imageContainer}>
                        {imageSource !== '' && 
                        <Image
                            style={styles.headerImage}
                            source={{ uri: imageSource }}
                        />
                        }
                    </Layout>
                    <Layout style={styles.title}>
                        <Text category='h4'>{title}</Text>
                    </Layout>
                    <Layout style={styles.description}>
                        <Text category='p1'>{description}</Text>
                    </Layout>
                    <Layout style={styles.footerContainer}>
                        <Layout style={styles.cardButtonGroup} >
                            <Button
                                style={styles.cardButtonLeft}
                                status='basic'
                                onPress={onSharePress}
                            >
                                {"SHARE"}
                            </Button>
                            <Button
                                style={styles.cardButtonRight}
                                onPress={onDetailsPress}
                            >
                                {"DETAILS"}
                            </Button>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 20,
        shadowColor: 'black',
        shadowOpacity: .50,
        shadowOffset: { width: 0, height: 0, },
        backgroundColor: "#0000",
        elevation: 6,
    },
    card: {
        flex: 1,
        margin: 4,
        borderRadius: 20,
    },
    imageContainer: {
        borderRadius: 20,
    },
    headerImage: {
        flex: 1,
        height: 300,
        borderRadius: 20,
    },
    title: {
        margin: 8,
    },
    description: {
        marginHorizontal: 8,
        marginBottom: 4,
    },
    footerContainer: {
        flex: 1,
        margin: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    cardButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    cardButtonLeft: {
        flex: 1,
        padding: 8,
        marginRight: 4,
        borderRadius: 10,
    },
    cardButtonRight: {
        flex: 1,
        padding: 8,
        marginLeft: 4,
        borderRadius: 10,
    },
});