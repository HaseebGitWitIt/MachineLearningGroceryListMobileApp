import {
   StyleSheet,
   Dimensions
} from 'react-native';

export const enterStoreModalStyles = StyleSheet.create({
   result: {
      backgroundColor: '#A8A8A8'
   },
   modalContainer: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
   modalSubContainer: {
      width: Dimensions.get("window").width * 0.75,
      height: Dimensions.get("window").height * 0.5,
      top: Dimensions.get("window").height * 0.1,
      alignItems: "center",
      borderRadius: 20,
   },
   modalAutocompleteContainer: {
      flex: 1,
      position: 'absolute',
      top: Dimensions.get("window").height * 0.2,
      width: "60%",
      zIndex: 5,
   },
   modalDoneButton: {
      position: 'absolute',
      top: Dimensions.get("window").height * 0.3,
      backgroundColor: 'black',
      flexDirection: 'row'
   },
   modalButtonText: {
      color: "white"
   },
})

export const styles = StyleSheet.create({
   container: {

   },
   ListContainer: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
   },
   notPurchasedItem: {
      padding: 10,
      fontSize: 18,
      color: "white"
   },
   purchasedItem: {
      padding: 10,
      fontSize: 18,
      color: "red",
      textDecorationLine: "line-through"
   },
   flatList: {
      paddingTop: 8,
      paddingHorizontal: 4,
   },
   backButton: {
      padding: 10,
      paddingTop: 50,
      paddingBottom: 15,
      color: "white",
      fontSize: 12
   },
   pageTitle: {
      padding: 30,
      paddingTop: 50,
      paddingBottom: 15,
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: 30
   },
   modalContainer: {
      flex: 1,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
   },
   modal: {
      paddingBottom: 300, // TODO: Make this dynamic...
   },
   input: {
      flexDirection: 'row',
      borderRadius: 30,
      width: 250,
      margin: 4,
   },
   selectContainer: {
      flexDirection: "row",
      marginHorizontal: 8,
   },
   selectBox: {
      flex: 1,
   },
   buttonContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 250,
      borderRadius: 30,
   },
   modalButton: {
      flex: 1,
      margin: 4,
      borderRadius: 30,
   },
   dashboard: {
      width: '100%',
      paddingHorizontal: 8,
      paddingVertical: 8,
   },
   dashboardOuterContainer: {
      padding: 8,
      borderRadius: 10,
   },
   dashboardContainer: {
      borderRadius: 10,
   },
   dashboardInnerContainer: {
      paddingHorizontal: 8,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      borderRadius: 10,
   },
   dashboardText: {
      marginHorizontal: 6,
   },
   dashboardExpandButton: {
      marginVertical: -8
   },
   mapButton: {
      borderRadius: 20,
   },
   loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   listTextContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
   },
});