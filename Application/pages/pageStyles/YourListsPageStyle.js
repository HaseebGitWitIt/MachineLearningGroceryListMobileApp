import {
   StyleSheet
} from 'react-native';

export default StyleSheet.create({
   shareButton: {
      margin: 8,
      borderRadius: 10,
   },
   container: {

   },
   ListContainer: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
   },
   flatList: {
      paddingTop: 8,
      paddingHorizontal: 4,
   },
   pageTitle: {
      padding: 30,
      paddingBottom: 15,
      color: "white",
      fontSize: 30
   },
   item: {
      padding: 10,
      fontSize: 18,
      // height: 40,
      color: "white"
   },
   addButton: {
      padding: 10,
      paddingTop: 50,
      paddingBottom: 15,
      color: "white"
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
   loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   }
});