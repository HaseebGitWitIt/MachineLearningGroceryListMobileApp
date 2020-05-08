import {
    StyleSheet,
    Dimensions
} from 'react-native';

export default StyleSheet.create({
    pickerIOS: {
        marginHorizontal: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    pickerAndroid: {
        marginHorizontal: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    listItem: {
        flex: 1,
        marginVertical: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderRadius: 10,
    },
    listTextContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    itemTextContainer: {
        flex: 1,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemText: {
        flexWrap: 'wrap',
        width: '100%'
    },
    itemButtonContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    selectMenu: {
        flex: 1,
        paddingHorizontal: 8,
        minWidth: 60,
    },
    scrollContainer: {
        flex: 1,
    },
    formOuterContainer: {
        margin: 8,
        padding: 8,
        borderRadius: 10,
    },
    formInnerContainer: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    flatList: {
        flex: 1
    },
    mainButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    mainPageButton: {
        flex: 1,
        padding: 8,
        marginVertical: 8,
        marginHorizontal: 2,
    },
});