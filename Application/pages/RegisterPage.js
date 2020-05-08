import React, { Component } from "react";
import { KeyboardAvoidingView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Layout, Button, Input, Icon } from 'react-native-ui-kitten';
import { ScrollView } from "react-native-gesture-handler";
import FirebaseUser from "../components/FirebaseUser";
import globalStyles from "../pages/pageStyles/GlobalStyle";
import * as ng from "../navigation/NavigationGlobals";
import nm from '../pages/Functions/NotificationManager.js';

const REGISTER = "Register";
const LOGIN = "Already Registered/Login";
const BACK_TO_LOGIN = "Back to Login";
const PRIVACY_POLICY = "Accept Privacy Policy";

class RegisterPage extends Component {

  constructor(props) {
    super(props);
    userAlreadyLoggedIn = false;
    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      secureTextEntry: true,
      registering: false,
      privacyPolicyAccepted: false,
      returnedFromprivacyPolicy: false,
    }
    this.focusListener = this.props.navigation.addListener(
      "willFocus",
      () => {
        nm.setThat(this)
        if (!this.state.returnedFromprivacyPolicy) {
          this.state = { firstname: "", lastname: "", email: "", password: "", confirmPassword: "", privacyPolicyAccepted: false, };
        }
      }
    );
  }

  componentDidMount() {
    this._isMount = true;
  }


  buttonListener = buttonId => {
    if (buttonId === REGISTER) {
      this.updateRegisterInfo();
    } else if (buttonId === LOGIN) {
      this.props.navigation.navigate(ng.LOGINPAGE);
    } else if (buttonId === BACK_TO_LOGIN) {
      this.props.navigation.navigate(ng.LOGINPAGE);
    } else if (buttonId === PRIVACY_POLICY) {
      this.props.navigation.navigate(ng.PRIVACYPOLICY, {
        onAccept: () => this.setState({ privacyPolicyAccepted: true, returnedFromprivacyPolicy: true, }),
        onDeny: () => this.setState({ privacyPolicyAccepted: false, returnedFromprivacyPolicy: true, }),
        oldState: this.state,
        registration: true
      });
    }
  };

  updateRegisterInfo() {
    if (this.checkInputs()) {
      if (this._isMount) this.setState({ registering: true });
      var firstName = this.state.firstname.replace(/^\w/, c => c.toUpperCase());
      var lastName = this.state.lastname.replace(/^\w/, c => c.toUpperCase());
      var displayName = firstName + " " + lastName;
      displayName = displayName.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
      var firebaseUser = new FirebaseUser();
      var register = firebaseUser.register(this.state.email, this.state.password, displayName).then(() => {
        if (register) {
          this.props.navigation.navigate(ng.VERIFICATIONPAGE);
        }
        this.setState({ registering: false });
      });
    } else {
      Alert.alert("Invalid Inputs", "Please Confirm the inputs and try again.");
    }
  }

  checkInputs() {
    if (!this.state.email || !this.state.password
      || !this.state.firstname || !this.state.lastname) {
      return false;
    } else {
      if (this.state.password == this.state.confirmPassword) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  componentWillUnmount() {
    this.focusListener.remove()
    this._isMount = false;
  }

  renderPasswordEyeIcon = (style) => {
    const iconName = this.state.secureTextEntry ? 'eye-off' : 'eye';
    return (
      <Icon {...style} name={iconName} />
    );
  };

  onPasswordEyeIconPress = () => {
    const secureTextEntry = !this.state.secureTextEntry;
    if (this._isMount) this.setState({ secureTextEntry });
  };

  renderCurrentState() {
    if (this.state.registering) {
      return (
        <Layout style={styles.columnContainer}>
          <ActivityIndicator size="large" />
        </Layout>
      );
    }

    if (!this.userAlreadyLoggedIn) {
      return (
        <Layout style={styles.columnContainer}>
          <Layout style={styles.rowContainer}>
            <Input
              style={styles.input}
              placeholder="First Name"
              ref="firstname"
              keyboardType="default"
              autoCapitalize="words"
              returnKeyType='next'
              onChangeText={firstname => this._isMount && this.setState({ firstname })}
              onSubmitEditing={() => this.refs.lastname.focus()}
              blurOnSubmit={false}
              value={this.state.firstname} />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Input
              style={styles.input}
              placeholder="Last Name"
              ref="lastname"
              keyboardType="default"
              autoCapitalize="words"
              returnKeyType='next'
              onChangeText={lastname => this._isMount && this.setState({ lastname })}
              onSubmitEditing={() => this.refs.email.focus()}
              blurOnSubmit={false}
              value={this.state.lastname} />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Input
              style={styles.input}
              placeholder="Email"
              ref="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCompleteType="email"
              returnKeyType='next'
              onChangeText={email => this._isMount && this.setState({ email })}
              onSubmitEditing={() => this.refs.password.focus()}
              blurOnSubmit={false}
              value={this.state.email} />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Input
              style={styles.input}
              placeholder="Enter your password..."
              ref="password"
              autoCapitalize="none"
              autoCompleteType="password"
              returnKeyType='next'
              icon={this.renderPasswordEyeIcon}
              secureTextEntry={this.state.secureTextEntry}
              onIconPress={this.onPasswordEyeIconPress}
              onChangeText={password => this._isMount && this.setState({ password })}
              onSubmitEditing={() => this.refs.confirmPassword.focus()}
              blurOnSubmit={false}
              value={this.state.password} />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Input
              style={styles.input}
              placeholder="Confirm your password..."
              ref="confirmPassword"
              autoCapitalize="none"
              autoCompleteType="password"
              icon={this.renderPasswordEyeIcon}
              secureTextEntry={this.state.secureTextEntry}
              onIconPress={this.onPasswordEyeIconPress}
              onChangeText={confirmPassword => this._isMount && this.setState({ confirmPassword })}
              onSubmitEditing={() => this.refs.privacypolicy.scrollTo}
              value={this.state.confirmPassword} />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Button
              style={styles.button}
              appearance='outline'
              status={!this.state.privacyPolicyAccepted ? 'basic' : 'success'}
              ref="privacypolicy"
              onPress={() => this.buttonListener(PRIVACY_POLICY)}>
              {PRIVACY_POLICY}
            </Button>
          </Layout>
          <Layout style={styles.rowContainer}>
            <Button
              style={styles.button}
              ref="register"
              disabled={!this.state.privacyPolicyAccepted}
              onPress={() => this.buttonListener(REGISTER)}>
              {REGISTER}
            </Button>
          </Layout>
          <Layout style={styles.rowContainer}>
            <Button
              style={styles.button}
              ref="backToLogin"
              onPress={() => this.buttonListener(BACK_TO_LOGIN)}>
              {BACK_TO_LOGIN}
            </Button>
          </Layout>
        </Layout>
      );
    }
  }

  render() {
    return (
      <Layout style={globalStyles.defaultContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {this.renderCurrentState()}
        </ScrollView>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  columnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  button: {
    marginVertical: 4,
    marginHorizontal: 4,
    borderRadius: 30,
    width: 250,
  },
  input: {
    flexDirection: 'row',
    borderRadius: 30,
    width: 250,
  },
});

export default RegisterPage;
