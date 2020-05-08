import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Autocomplete } from 'react-native-ui-kitten';
import axios from "axios";

/**
 * HereMapsSearchAsync - An asyncronous autocomplete input box
 * @property {string} title - Text to be displayed (default: 'Lorem Ipsum')
 */
export default class HereMapsSearchAsync extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            data: [],
            apiResponse: null,
            typingTimeout: 0,
        };
    }

    render() {
        const { placeholder = 'Start typing to fetch options', requestArray = [], requestValueIndex = 0, backgroundLevel = '3', searchTimeout = 1000, onValueSelected = () => { } } = this.props;

        const onSelect = ({ title, position }) => {
            this.setState({ value: title });
            onValueSelected(title, position);
        };

        const onChangeText = (value) => {

            if (value.length > 3) {
                if (this.state.typingTimeout) {
                    clearTimeout(this.state.typingTimeout);
                }

                this.setState({
                    value,
                    typingTimeout: setTimeout(() => {
                        // console.log("CREATING REQUEST:= requestArray: " + requestArray);
                        const request = requestArray.slice(0, requestValueIndex).concat(value.trim()).concat(requestArray.slice(requestValueIndex + 1)).join('');
                        console.log("CREATED REQUEST:= request: " + request);
                        axios
                            .get(request)
                            .then(result => {
                                // console.log(result);
                                var displayResult = [];
                                result.data.results.items.forEach(element => {
                                    displayResult.push({ title: element.title + ' - ' + element.vicinity.replace(/[\n\r]/g, " "), position: { latitude: Number(element.position[0]), longitude: Number(element.position[1]) } });
                                });
                                this.setState({ data: displayResult });
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }, searchTimeout)
                });
            }
            else {
                this.setState({ value });
            }
        };

        return (
            <Layout style={styles.outerContainer} level={backgroundLevel} >
                <Autocomplete
                    placeholder={placeholder}
                    value={this.state.value}
                    data={this.state.data}
                    onChangeText={onChangeText}
                    onSelect={onSelect}
                />
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        borderRadius: 10,
    },
});