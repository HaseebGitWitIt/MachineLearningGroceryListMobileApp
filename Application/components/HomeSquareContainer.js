import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, } from 'react-native';
import { Layout, Text, Icon, } from 'react-native-ui-kitten';

/**
 * HomeSquareContainer - A simple shaped button designed for the home screen
 * @property {string} name - Text to be displayed (default: 'Lorem Ipsum')
 * @property {string} icon - Icon name (currently only supports names from Eva Icons Pack: https://akveo.github.io/eva-icons/#/) (default: 'list-outline')
 * @property {integer} shape - 1 for Square, 2 for Rectangle (default: 1)
 * @property {string} iconFill - Color to fill the icon (default: #8F9BB3)
 * @property {string} backgroundLevel - Sets the level value of the ui-kitten Layout component (default: '2') (see https://akveo.github.io/react-native-ui-kitten/docs/components/layout/api#layout for more details)
 * @property {GestureResponderEvent} onPress - onPress()
 * @property {integer} sizeValue - Sets the size of the container (default: 200)
 * @property {integer} marginValue - Sets the margin of the container (default: 8)
 * 
 */
export default class HomeSquareContainer extends Component {
    render() {
        const { name = 'Lorem Ipsum', icon = 'list-outline', shape = 1, iconFill = '#8F9BB3', backgroundLevel = '2', onPress = () => { }, sizeValue = 200, marginValue = 8} = this.props;
        return (
            <TouchableHighlight style={[styles.outerContainer, { width: shape == 1 ? sizeValue : (sizeValue * 2) + marginValue * 2, height: sizeValue, margin: marginValue }]} onPress={onPress}>
                <Layout style={[styles.container, { width: shape == 1 ? sizeValue : (sizeValue * 2) + marginValue * 2, height: sizeValue, margin: marginValue }]} level={backgroundLevel}>
                    <Icon style={styles.margin} name={icon} width={sizeValue * .25} height={sizeValue * .25} fill={iconFill} />
                    <Text style={styles.margin} category='h6' appearance='default'>{name}</Text>
                </Layout>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 8,
        borderRadius: 20,
        shadowColor: 'black',
        shadowOpacity: .20,
        shadowOffset: { width: 0, height: 0, },
        elevation: 4,
    },
    margin: {
        margin: 4,
    },
});