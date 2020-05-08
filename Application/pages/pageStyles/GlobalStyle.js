import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({
  defaultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultButtonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  defaultInputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  defaultInputs: {
    height: 45,
    marginLeft: 16,
    flex: 1,
  },
  defaultInputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: "#00b5ec",
  },
  whiteText: {
    color: 'white'
  },
  whiteTextPadding: {
    color: 'white',
    paddingLeft: 20,
    paddingRight: 20,
    textAlign: 'center'
  },
  blackText: {
    color: "black"
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
  requiredHighlight: {
    color: "red",
  },
});