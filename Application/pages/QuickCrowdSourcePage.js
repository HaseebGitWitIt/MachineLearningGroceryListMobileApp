import React, { Component } from "react";
import {
    FlatList,
    ScrollView,
    Platform,
    Picker
} from "react-native";
import {
    Layout,
    Button,
    TopNavigation,
    TopNavigationAction,
    Text,
    ButtonGroup
} from 'react-native-ui-kitten';
import { dark, light } from '../assets/Themes.js';
import NotificationPopup from 'react-native-push-notification-popup';
import nm from '../pages/Functions/NotificationManager.js';
import { departments } from "../DepartmentList";
import { ArrowBackIcon, MoveUpIcon, MoveDownIcon } from "../assets/icons/icons.js";
import styles from "../pages/pageStyles/QuickCrowdSourcePageStyle";
import * as dbi from "./Functions/DBInterface";

const PAGE_TITLE = "Quick Crowd Source";
const DEFAULT_STORE_NAME = "";
const DEFAULT_ADDRESS = "";

class QuickCrowdSourcePage extends Component {
    constructor(props) {
        super(props);

        // Use a list for keeping track of all the departments
        this.currLocs = [];

        this.state = {
            arrayHolder: [],
            unknownItems: [],
            storeName: DEFAULT_STORE_NAME,
            storeAddr: DEFAULT_ADDRESS,
            previousPage: null,
            listName: null,
            listId: null
        };
        this.focusListener = this.props.navigation.addListener(
            "willFocus",
            () => {
                nm.setThat(this);

                this._isMounted = true;

                // Initialize the page if information is passed in
                var previousPage = this.props.navigation.getParam("previousPage", null);
                if (previousPage !== null) {
                    var currStoreAddr = this.props.navigation.getParam("storeAddr", DEFAULT_ADDRESS);
                    var currStoreName = this.props.navigation.getParam("storeName", DEFAULT_STORE_NAME);
                    var listName = this.props.navigation.getParam("listName", null);
                    var listId = this.props.navigation.getParam("listId", null);
                    var items = this.props.navigation.getParam("items", []);
                    var locs = this.props.navigation.getParam("locs", []);

                    for (var i = 0; i < locs.length; i++) {
                        var currLoc = locs[i];

                        if (currLoc === null) {
                            this.currLocs.push({
                                itemName: items[i].name,
                                loc: departments[0].text.slice(0)
                            });
                        } else {
                            for (var j = 0; j < departments.length; j++) {
                                if (departments[j].text === locs[i]) {
                                    this.currLocs.push({
                                        itemName: items[i].name,
                                        loc: departments[j].text.slice(0)
                                    });
                                    j = departments.length + 2;
                                }
                            }
                        }
                    }

                    this.setState({
                        storeName: currStoreName,
                        storeAddr: currStoreAddr,
                        previousPage: previousPage,
                        listName: listName,
                        listId: listId,
                        arrayHolder: this.currLocs
                    });
                }
            }
        );
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
        // Set the mounted var
        this._isMounted = false;
    }

    updateDepartment = (ind, newVal) => {
        // Set the new value in the current departments array
        this.currLocs[ind]["loc"] = newVal;

        // Update the state
        if (this._isMounted) {
            this.setState({
                arrayHolder: [...this.currLocs]
            });
        }
    }

    handleSaveLocations = () => {
        var deps = [];
        var locs = this.currLocs;

        for (var i = 0; i < locs.length; i++) {
            var currItem = locs[i];

            var genName = currItem.itemName;
            var storeName = this.state.storeName;
            var storeAddr = this.state.storeAddr;
            var department = currItem.loc;
            var aisleNum = null;

            deps.push(department);

            // Add the value to the database
            dbi.addItemLoc(genName,
                storeName,
                storeAddr,
                aisleNum,
                department);
        }

        deps = Array.from(new Set(deps));

        dbi.modStoreWeights(this.state.storeName,
            this.state.storeAddr,
            deps);

        previousPage = this.state.previousPage;
        if (previousPage !== null) {
            this.props.navigation.navigate(previousPage, {
                listName: this.state.listName,
                listID: this.state.listId
            });
        }
    }

    upButtonPressed = (ind) => {
        // Check if the index is at the top of the list
        if (ind != 0) {
            // Swap the element at the index with the one above it
            var aboveItem = this.currLocs[ind - 1];
            this.currLocs[ind - 1] = this.currLocs[ind];
            this.currLocs[ind] = aboveItem;

            // Update the state
            if (this._isMounted) {
                this.setState({
                    arrayHolder: [...this.currLocs]
                });
            }
        }
    }

    downButtonPressed = (ind) => {
        // Check if the index is at the bottom of the list
        if (ind != this.currLocs.length - 1) {
            // Swap the element at the index with the below it
            var belowItem = this.currLocs[ind + 1];
            this.currLocs[ind + 1] = this.currLocs[ind];
            this.currLocs[ind] = belowItem;

            // Update the state
            if (this._isMounted) {
                this.setState({
                    arrayHolder: [...this.currLocs]
                });
            }
        }
    }

    /**
     * renderListElem
     * 
     * The renderer for each of the list items.
     * 
     * @param {Object} item The item object being rendered
     * @param {Integer} index The index in the list to add
     * 
     * @returns The rendered list element
     */
    renderListElem = (item, index) => {
        const placeholder = {
            label: 'Select a department...',
            value: null
        };

        renderIosPicker = () => {
            tempDepartments = [];
            for (var i = 0; i < departments.length; i++) {
                currDepartment = departments[i];
                currDepartment.color = global.theme == light ? light["text-hint-color"] : dark["text-hint-color"];
                tempDepartments.push(currDepartment);
            }

            return (
                <RNPickerSelect
                    style={styles.pickerIOS}
                    key={index}
                    items={tempDepartments}
                    placeholder={placeholder}
                    value={this.state.arrayHolder[index]['loc']}
                    onValueChange={(val) => this.updateDepartment(index, val)}
                />
            );
        }

        renderAndroidPicker = () => {
            return (
                <Picker
                    style={styles.pickerAndroid}
                    prompt={placeholder.label}
                    selectedValue={this.state.arrayHolder[index]['loc']}
                    onValueChange={(val) => this.updateDepartment(index, val)}
                >
                    {
                        departments.map((v) => {
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
            <Layout style={styles.listItem} level='2'>
                <Layout style={styles.listTextContainer} level='1'>
                    <ButtonGroup appearance='outline' status='primary'>
                        <Button icon={MoveUpIcon} onPress={() => this.upButtonPressed(index)} />
                        <Button icon={MoveDownIcon} onPress={() => this.downButtonPressed(index)} />
                    </ButtonGroup>

                    <Layout style={styles.itemTextContainer} level='1'>
                        <Text style={styles.itemText}>
                            {item.itemName}
                        </Text>
                    </Layout>

                    <Layout level='2' style={styles.selectMenu}>
                        {Platform.OS === 'ios' ? renderIosPicker() : renderAndroidPicker()}
                    </Layout>
                </Layout>
            </Layout>
        );
    }

    renderMenuAction = () => (
        <TopNavigationAction icon={ArrowBackIcon} onPress={() => this.props.navigation.goBack()} />
    );

    render() {
        return (
            <React.Fragment>
                <TopNavigation
                    title={PAGE_TITLE}
                    alignment="center"
                    leftControl={this.renderMenuAction()}
                />
                <ScrollView style={[styles.scrollContainer, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
                    <Layout style={styles.formOuterContainer} level='3'>
                        <Layout style={styles.formInnerContainer}>
                            <FlatList
                                style={styles.flatList}
                                width="100%"
                                data={this.state.arrayHolder}
                                renderItem={({ item, index }) => this.renderListElem(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                                extraData={this.state.arrayHolder}
                            />
                            <Layout style={styles.mainButtonGroup} >
                                <Button
                                    style={styles.mainPageButton}
                                    status='success'
                                    onPress={this.handleSaveLocations}
                                >
                                    {'Save Locations And Go Back'}
                                </Button>
                            </Layout>
                        </Layout>
                    </Layout>
                </ScrollView>
                <NotificationPopup ref={ref => this.popup = ref} />
            </React.Fragment>
        );
    }
}

export default QuickCrowdSourcePage;


