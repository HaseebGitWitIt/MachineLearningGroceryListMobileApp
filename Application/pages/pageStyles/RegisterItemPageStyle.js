import {
    StyleSheet
  } from 'react-native';

export default StyleSheet.create({
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
    inputRow: {
      paddingVertical: 4,
    },
    horizontalInnerContainer: {
      flexDirection: 'row',
    },
    inputLeftColumn: {
      flex: 4,
      paddingVertical: 4,
    },
    inputRightColumn: {
      flex: 1,
      paddingTop: 21,
      paddingLeft: 8,
      paddingVertical: 4,
      minWidth: 60,
    },
    button: {
      flex: 1,
      marginTop: 8,
      width: '100%',
    },
  });