import {
    StyleSheet,
    Dimensions
} from 'react-native';

export default StyleSheet.create({
    list: {
        flex: 1,
    },
    container: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    scrollContainer: {
        flex: 1,
    },
    avoidingView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    selectBox: {
      width: '100%',
    },
    overflowMenu: {
        padding: 4,
        shadowColor: 'black',
        shadowOpacity: .5,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
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
    listItem: {
        flex: 1,
        marginVertical: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderRadius: 10,
    },
    selectMenu: {
        flex: 1,
        paddingHorizontal: 8,
        minWidth: 60,
    },
    flatList: {
        flex: 1
    },
    inputRow: {
        paddingVertical: 4,
    },
    selectBox: {
        width: '100%',
    },
    button: {
        flex: 1,
        marginTop: 8,
        width: '100%',
    },
    placeholderStyle: {
        color: 'gray',
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
    loading: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
    }
});