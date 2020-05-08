import React, { Component } from "react";
import {
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Picker
} from "react-native";
import {
    Layout,
    Button,
    TopNavigation,
    TopNavigationAction,
    Autocomplete,
    Text,
    Modal
} from 'react-native-ui-kitten';
import { ArrowBackIcon, MapIcon } from '../assets/icons/icons.js';
import { dark, light } from '../assets/Themes.js';
import NotificationPopup from 'react-native-push-notification-popup';
import lf from "./Functions/ListFunctions";
import nm from '../pages/Functions/NotificationManager.js';
import StringSimilarity from "string-similarity";
import { departments } from "../DepartmentList";
import RNPickerSelect from 'react-native-picker-select';

const PAGE_TITLE = "Select Store";
const NEW_STORE = "Register a store...";
const MAPS = "MapsPage";

const STRING_SIMILARITY_THRESHOLD = 0.30;
const DATA_LOAD_DELAY = 100;

const MIN_DEPS_TO_GET = 1;
const MAXIMUM_MODAL_DEPS = 3;

var availableStores = [];
var mapClusters = [];
var choosenCluster = [];

class SelectStorePage extends Component {
    constructor(props) {
        super(props);

        // Use a list for keeping track of all the departments
        this.currDepartments = [
            {
            },
        ]

        this.state = {
            listId: "",
            listName: "",

            sort: "",

            currStoreTitle: "",
            currStoreAddr: "",
            currStoreId: "",
            currStoreName: "",

            value: '',
            data: [],

            modalVisible: false,
            depsToGet: MIN_DEPS_TO_GET,
            arrayHolder: [],
            dispDeps: [departments]
        };
        this._isMounted = true;
        nm.setThat(this)
        this.state = {
            listName: this.props.navigation.getParam("name", "(Invalid Name)"),
            listId: this.props.navigation.getParam("listID", "(Invalid List ID)"),
            sort: this.props.navigation.getParam("sort", "(Invalid Sort Method)"),
            arrayHolder: [...this.currDepartments]
        };

        var that = this;
        // Populate the Arrays for the autocomplete fields
        this.loadAvailableStores().then((value) => {
            that.getDepartmentsForCluster();
        });
    }

    /**
    * componentWillUnmount
    * 
    * Function to call before the component is unmounted.
    * 
    * @param   None
    * 
    * @returns None
    */
    componentWillUnmount() {
        this._isMounted = false;
    }

    /**
    * loadAvailableStores
    * 
    * Loads the known store names and their
    * corresponding ids from the database.
    * 
    * @param   None
    * 
    * @returns None
    */
    loadAvailableStores() {
        // Load the available stores and parses the data
        var tempList = lf.getAvailableStores().then((value) => {
            availableStores = value;
        });

        var tempClusters = lf.getMapClusters().then((value) => {
            mapClusters = value;
        })

        return Promise.all([tempList, tempClusters]);
    }

    /**
    * updateCurrStore
    * 
    * Updates the current store name and id in
    * the state based on the given information.
    * 
    * @param {String} newStore The name of the store given by the user
    * 
    * @returns None
    */
    updateCurrStore(newStore) {
        console.log("Updating current store...");
        if (newStore.toString() == NEW_STORE) {
            this.props.navigation.navigate("MapCreatorPage", {
                previousPage: "CurrentListPage",
                listName: this.props.navigation.getParam("name", "(Invalid Name)"),
                listId: this.props.navigation.getParam("listID", "(Invalid List ID)")
            })
        } else {
            var id = ""; // Empty id to handle unknown stores
            var addr = "";
            var storeName = newStore.toString();

            newStore = newStore.toString();

            // Find the name of the store in the list of available stores
            for (var i = 0; i < availableStores.length; i++) {
                var title = availableStores[i].title;
                if (title === newStore) {
                    // Set the id of the store if known
                    id = availableStores[i].id;
                    addr = availableStores[i].addr;
                    storeName = availableStores[i].storeName;
                }
            }

            // if exact match was not found look for similar strings
            if (id == "") {
                if (availableStores != []) {
                    var similarity = StringSimilarity.findBestMatch(newStore, availableStores.map(store => store.title));
                    if (similarity.bestMatch.rating >= STRING_SIMILARITY_THRESHOLD) {
                        id = availableStores.find(element => element.title == similarity.bestMatch.target).id;
                        console.log("Similarity matched store id: " + id);
                    }
                    else {
                        console.log("Similarity threshold: " + STRING_SIMILARITY_THRESHOLD + " too high for input: " + newStore);
                        console.log("Best matched store name: " + similarity.bestMatch.target);
                        console.log("Best matched store similarity rating: " + similarity.bestMatch.rating);
                    }
                }
                else {
                    console.log("availableStores was empty!");
                }
            }

            // Update the state
            this._isMounted && this.setState({
                currStoreTitle: newStore,
                currStoreId: id,
                currStoreAddr: addr,
                currStoreName: storeName
            });
        }
    }

    handleEnterButton = () => {
        var choosen = this.state.arrayHolder;
        var clusterCands = mapClusters;

        for (var depInd = 0; depInd < choosen.length; depInd++) {
            var newCands = [];
            for (var clustInd = 0; clustInd < clusterCands.length; clustInd++) {
                var currCluster = clusterCands[clustInd];
                var currDep = choosen[depInd].department;
                if ((depInd < currCluster.length) && (currDep === currCluster[depInd])) {
                    newCands.push(currCluster);
                }
            }

            if (newCands.length === 0) {
                depInd = choosen.length + 1;
            } else {
                clusterCands = newCands;
            }
        }

        this.choosenCluster = clusterCands[0];

        this.setState({
            modalVisible: false
        });

        this.navBack();
    }

    getDepartmentsForCluster() {
        var depsToGet = 0;
        var found = false;
        var validDeps = [];
        var currCombos = [];
        for (var i = 0; i < mapClusters.length; i++) {
            currCombos.push([]);
        }
        while (!found) {
            var currVals = [];
            for (var clusterInd = 0; clusterInd < mapClusters.length; clusterInd++) {
                var val = null;
                if (depsToGet >= mapClusters[clusterInd].length) {
                    val = depsToGet + clusterInd;
                } else {
                    val = mapClusters[clusterInd][depsToGet];
                }
                currVals.push(val);
                currCombos[clusterInd] += val;
            }

            validDeps.push([...new Set(currVals)]);
            found = new Set(currCombos).size === mapClusters.length;
            depsToGet += 1;
        }

        if (depsToGet < MIN_DEPS_TO_GET) {
            depsToGet = MIN_DEPS_TO_GET;
        }

        var dispDeps = [];

        for (var validInd = 0; validInd < validDeps.length; validInd++) {
            var temp = [];
            for (var depInd = 0; depInd < validDeps[validInd].length; depInd++) {
                var result = departments.find(obj => {
                    return obj.text === validDeps[validInd][depInd];
                });
                temp.push(result);
            }
            dispDeps.push(temp);
        }

        this.currDepartments.length = 0;
        for (var i = 0; i < depsToGet; i++) {
            this.currDepartments.push({
                department: dispDeps[i][0].text
            });
        }

        this.setState({
            depsToGet: depsToGet,
            arrayHolder: [...this.currDepartments],
            dispDeps: dispDeps
        });
    }

    updateDepartment = (ind, newVal) => {
        // Set the new value in the current departments array
        this.currDepartments[ind]["department"] = newVal;

        // Update the state
        if (this._isMounted) {
            this.setState({
                arrayHolder: [...this.currDepartments]
            });
        }
    }

    stringifyNumber(n) {
        var retVal = String(n);

        if ((n % 10 === 1) && (n % 100 !== 11)) {
            retVal += "st";
        } else if ((n % 10 === 2) && (n % 100 !== 12)) {
            retVal += "nd";
        } else if ((n % 10 === 3) && (n % 100 !== 13)) {
            retVal += "rd";
        } else {
            retVal += "th";
        }
        return retVal;
    }

    renderDepartmentGetter(index) {
        const placeholder = {
            label: 'Select a department...',
            value: null
        };

        renderIosPicker = () => {
            tempDepartments = [];
            for (var i = 0; i < this.state.dispDeps[index].length; i++) {
                currDepartment = this.state.dispDeps[index][i];
                currDepartment.color = global.theme == light ? light["text-hint-color"] : dark["text-hint-color"];
                tempDepartments.push(currDepartment);
            }

            return (
                <RNPickerSelect
                    style={styles.pickerIOS}
                    key={index}
                    items={tempDepartments}
                    placeholder={placeholder}
                    value={this.state.arrayHolder[index]['department']}
                    onValueChange={(val) => this.updateDepartment(index, val)}
                />
            );
        }

        renderAndroidPicker = () => {
            return (
                <Picker
                    style={styles.pickerAndroid}
                    prompt={placeholder.label}
                    selectedValue={this.state.arrayHolder[index]['department']}
                    onValueChange={(val) => this.updateDepartment(index, val)}
                >
                    {
                        this.state.dispDeps[index].map((v) => {
                            return (
                                <Picker.Item
                                    key={index}
                                    label={v.label}
                                    value={v.value}
                                    color={global.theme == light ? light["text-hint-color"] : dark["text-hint-color"]}
                                />
                            );
                        })
                    }
                </Picker>
            );
        }

        return (
            <Layout
                key={index}
                style={styles.listItem}
                level='2'
            >
                <Layout
                    level='2'
                    style={styles.selectMenu}
                >
                    <Text>
                        {this.stringifyNumber(index + 1) + " closest department: "}
                    </Text>
                    {Platform.OS === 'ios' ? renderIosPicker() : renderAndroidPicker()}
                </Layout>
            </Layout>
        );

    }

    renderGetClusterModal() {
        var selectors = [];
        for (var i = 0; ((i < this.state.depsToGet) && (i < MAXIMUM_MODAL_DEPS)); i++) {
            selectors.push(this.renderDepartmentGetter(i));
        }

        return (
            <Layout
                level='3'
                style={styles.modalContainer}>
                <Text>We need some quick info about the store. Please choose the closest department(s) to you from the following options:</Text>
                {selectors}
                <Button onPress={() => this.handleEnterButton()}>
                    ENTER
                </Button>
            </Layout>
        );
    }


    /**
    * submitStore
    * 
    * Submits the current selected store to the CurrentList page
    * Navigates to CurrentList page
    * 
    * @param   None
    * 
    * @returns None
    */
    submitStore = () => {
        if (this.state.currStoreId === "") {
            this.updateCurrStore(this.state.value);

            this.setGetClusterModalVisible(true);
        } else {
            this.navBack();
        }
    };

    navBack() {
        this.props.navigation.navigate("CurrentListPage", {
            fromPage: "SelectStorePage",
            listName: this.state.listName,
            listId: this.state.listId,
            currStoreTitle: this.state.currStoreTitle,
            currStoreId: this.state.currStoreId,
            currStoreAddr: this.state.currStoreAddr,
            currStoreName: this.state.currStoreName,
            sort: this.state.sort,
            choosenCluster: this.choosenCluster
        });
    }

    selectStore = location => {
        console.log("Location received from MapsPage:");
        console.log(location);
        this.setState({ value: location });
        setTimeout(() => { this.updateCurrStore(location) }, DATA_LOAD_DELAY);
    }

    setGetClusterModalVisible = (newVal) => {
        this.setState({
            modalVisible: newVal
        });
    }

    onChangeText = (value) => {
        this.setState({
            value: value,
            data: [{ title: value }].concat(availableStores.filter(item => item.title.toLowerCase().includes(value.toLowerCase())).concat(availableStores[availableStores.length - 1]))
        });
    }

    onSelect = ({ title }) => {
        this.setState({
            value: title
        });
        this.updateCurrStore(title);
    }

    render() {
        const renderMenuAction = () => (
            <TopNavigationAction
                icon={ArrowBackIcon}
                onPress={() => this.props.navigation.goBack()}
            />
        );

        return (
            < React.Fragment >
                <TopNavigation
                    title={PAGE_TITLE}
                    alignment="center"
                    leftControl={renderMenuAction()}
                />

                <KeyboardAvoidingView behavior="position" enabled>
                    <Modal
                        visible={this.state.modalVisible}
                        backdropStyle={styles.modalBackdrop}
                        allowBackdrop={true}
                        onBackdropPress={() => this.setGetClusterModalVisible(false)}
                    >
                        {this.renderGetClusterModal()}
                    </Modal>
                </KeyboardAvoidingView>

                <ScrollView style={[styles.scrollContainer, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
                    <Layout style={styles.formOuterContainer} level='3'>
                        <Layout style={styles.formInnerContainer}>
                            <Layout style={styles.mainInputGroup}>
                                <Layout style={styles.autocompleteContainer}>
                                    <Autocomplete
                                        ref={(input) => { this.autoCompleteInput = input; }}
                                        style={styles.autocomplete}
                                        placeholder={'Enter a store name'}
                                        value={this.state.value}
                                        data={this.state.data}
                                        onChangeText={(val) => this.onChangeText(val)}
                                        onSelect={(val) => this.onSelect(val)}
                                    />
                                </Layout>
                                <Button style={styles.mapButton} icon={MapIcon} onPress={() => this.props.navigation.navigate(MAPS, { selectStore: this.selectStore })} />
                            </Layout>

                            <Layout style={styles.mainButtonGroup} >
                                <Button
                                    style={styles.mainPageButton}
                                    status='danger'
                                    onPress={() => this.props.navigation.goBack()}
                                >
                                    {'Cancel'}
                                </Button>

                                <Button
                                    style={styles.mainPageButton}
                                    status='primary'
                                    onPress={() => this.submitStore()}
                                >
                                    {'Submit'}
                                </Button>
                            </Layout>
                        </Layout>
                    </Layout>
                </ScrollView>
                <NotificationPopup ref={ref => this.popup = ref} />
            </React.Fragment >
        );
    }
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    avoidingView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    mainButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
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
    mainInputGroup: {
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
    mapButton: {
        padding: 8,
        marginVertical: 4,
        marginHorizontal: 10,
        borderRadius: 20,
    },
    autocompleteContainer: {
        flex: 1,
        borderRadius: 20,
    },
    autocomplete: {
        marginTop: 9,
        margin: 4,
        borderRadius: 20,
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 256,
        padding: 16,
    },
    modalBackdrop: {
        backgroundColor: 'black',
        opacity: 0.75
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
    selectMenu: {
        flex: 1,
        paddingHorizontal: 8,
        minWidth: 60,
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
});

export default SelectStorePage;


