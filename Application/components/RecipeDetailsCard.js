import React, { Component } from 'react';
import { Image, StyleSheet, FlatList } from 'react-native';
import { Layout, Text, Button, } from 'react-native-ui-kitten';
import { dark, light } from '../assets/Themes.js';

export default class RecipeDetailsCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { title = 'Title', instructions = null, ingredients = null, imageSource = '', onPress = () => { }, onSharePress = () => { }, onAddPress = () => { } } = this.props;
        return (
            <Layout style={styles.cardContainer}>
                <Layout style={styles.card}>
                    <Layout style={styles.imageContainer}>
                        <Image
                            style={styles.headerImage}
                            source={{ uri: imageSource }}
                        />
                    </Layout>
                    <Layout style={styles.title}>
                        <Text category='h4'>{title}</Text>
                    </Layout>
                    <Layout>
                        {ingredients &&
                            <Layout style={styles.ingredientsContainer} >
                                <Text category='label'>{"Ingredients:"}</Text>
                                <FlatList
                                    style={{ backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }}
                                    data={ingredients}
                                    width='100%'
                                    horizontal={true}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => {
                                        return (
                                            <Button
                                                appearance='outline'
                                                status='success'
                                                size='small'
                                                style={styles.ingredientsButton}>
                                                {" "}{item.original}
                                            </Button>
                                        );
                                    }}
                                />
                            </Layout>
                        }
                    </Layout>
                    <Layout style={styles.instructionsContainer}>
                        {instructions &&
                            <Layout>
                                <Text category='label'>{"Instructions:"}</Text>
                                <FlatList
                                    style={{ backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }}
                                    data={instructions[0].steps}
                                    width='100%'
                                    keyExtractor={(item) => item.number.toString(2)}
                                    renderItem={({ item }) => {
                                        return (
                                            <Text style={styles.stepsText}>{"• "}{item.step}</Text>
                                        );
                                    }}
                                />
                            </Layout>
                        }
                    </Layout>
                    <Layout style={styles.footerContainer}>
                        <Layout style={styles.cardButtonGroup} >
                            <Button
                                style={styles.cardButton}
                                onPress={onAddPress}
                            >
                                {"ADD INGREDIENTS TO LIST"}
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
    ingredientsContainer: {
        marginHorizontal: 8,
        marginBottom: 4,
    },
    ingredientsButton: {
        marginVertical: 4,
        marginRight: 8,
        borderRadius: 20,
    },
    instructionsContainer: {
        marginHorizontal: 8,
        marginBottom: 4,
    },
    instructions: {
        flex: 1,
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
    cardButton: {
        flex: 1,
        padding: 8,
        marginHorizontal: 4,
        borderRadius: 10,
    },
    boldText: {
        fontWeight: 'bold'
    },
    stepsText: {
        margin: 2,
    },
});