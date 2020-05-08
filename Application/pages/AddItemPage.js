import React, { Component } from "react";
import {
    StyleSheet,
    KeyboardAvoidingView,
    FlatList,
    ScrollView
} from "react-native";
import {
    Layout,
    Button,
    TopNavigation,
    TopNavigationAction,
    Autocomplete,
    Text,
} from 'react-native-ui-kitten';
import { dark, light } from '../assets/Themes.js';
import NotificationPopup from 'react-native-push-notification-popup';
import lf from "./Functions/ListFunctions";
import { ArrowBackIcon, AddIcon, RefreshIcon, CheckmarkIcon } from '../assets/icons/icons.js';
import * as firebase from 'firebase/app';
import nm from '../pages/Functions/NotificationManager.js';

const globalComps = require('./Functions/GlobalComps');

const PAGE_TITLE = "Add Item";
const NEW_ITEM = "Register an item...";
const DEFAULT_GEN_NAME = "";

// The number of items to recommend
const NUM_REC_ITEMS = 10;

var availableItems = [];

class AddItemPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listId: "", // ID of current list
            listName: "", // Name of current list

            itemName: "", // The item name entered in the autocomplete box
            genName: DEFAULT_GEN_NAME, // The generic name of the entered item
            currItemId: "", // The id name of the entered item
            value: '', // The current text entered in the autocomplete box
            data: [], // The data entered in the autocomplete box

            prevRecommended: [], // The previously recommended items
            recommendedItems: [], // The list of recommended items
            listItemIds: [], // The ids of the recommended items

            toAdd: [] // The recommended items the user wants to add to their list
        };

        nm.setThat(this);
        // set the mounted var

        // Save the current state of the list
        this.state = {
            listName: this.props.navigation.getParam("name", "(Invalid Name)"),
            listId: this.props.navigation.getParam("listID", "(Invalid List ID)"),
            listItemIds: this.props.navigation.getParam("listItemIds", "(Invalid List Item IDs")
        };

        // Populate the Arrays for the autocomplete fields
        this.loadAvailableItems();
    }

    /**
     * componentDidMount
     * 
     * Function called after the component mounts.
     * Loads the recommended items
     * 
     * @param None
     * 
     * @returns None
     */
    componentDidMount() {
        this._isMounted = true;
        this.loadRecommendedItems();
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
        this.addToggledRecommendedItems();

        // Set the mounted var
        this._isMounted = false;
    }

    /**
    * loadAvailableItems
    * 
    * Loads the known item names and their
    * corresponding ids from the database.
    * 
    * @param   None
    * 
    * @returns None
    */
    loadAvailableItems() {
        // Load the available items and parses the data
        var tempList = lf.getAvailableItems();
        tempList.then((value) => {
            // Get the items, their ids, and data
            var items = value.items;
            var ids = value.ids;
            var genNames = value.genNames;

            // Save the item information
            var temp = [];
            for (var i = 0; i < ids.length; i++) {
                temp.push({
                    name: items[i],
                    title: items[i],
                    id: ids[i],
                    genName: genNames[i]
                });
            }

            // Add the option to register a new item to the list
            temp.push({ name: NEW_ITEM, title: NEW_ITEM, id: -1 });

            availableItems = temp;
        });
    }

    /**
     * sortObjectByKeys
     * 
     * Sorts the object's keys and values based on their
     * keys. Returns the sorted order in a list.
     *  
     * @param {Object} toSort The object to sort
     * 
     * @returns The sorted order of keys
     */
    sortObjectByKeys(toSort) {
        var sortable = [];

        // Place all the key-value pairts in a list
        for (var item in toSort) {
            sortable.push([item, toSort[item]]);
        }

        // Sort the list
        sortable.sort(function (a, b) {
            return b[1] - a[1];
        });

        return sortable;
    }

    /**
     * loadRecommendedItems
     * 
     * Loads the current list of recommended items
     * based on the the contents of the user's list.
     * First checks all known rules to see if the the 
     * list contains any of the precendents for any rules.
     * Populates the list of recommended items with the
     * antecedents of the followed rules. Then populates
     * the list of recommended items with the most
     * popular items until a maximum length is reached.
     * 
     * @input   None
     * 
     * @returns None
     */
    loadRecommendedItems() {
        // Get the ids of the current items in the list
        var currItemIds = this.state.listItemIds ? this.state.listItemIds : [];
        var currPrevRec = this.state.prevRecommended ? this.state.prevRecommended : [];

        var that = this;

        var ref = firebase.database().ref('/recommendations');
        var retItems = ref.once('value').then((snapshot) => {
            var newItems = {};
            var finalItems = [];

            // First check the rules
            // If an item is the precedent of a rule, add
            // the antecedent to the list of recommended items
            var ssv = snapshot.val();
            if (ssv) {
                for (var i = 0; i < currItemIds.length; i++) {
                    var itemId = currItemIds[i];
                    if (itemId in ssv) {
                        var items = ssv[itemId];
                        for (var newItemId in items) {
                            var newItem = items[newItemId];
                            if (!currItemIds.includes(newItem)) {
                                if (!(newItem in newItems)) {
                                    newItems[newItem] = 0;
                                }
                                newItems[newItem] += 1;
                            }
                        }
                    }
                }

                // Sort the current recommend items and
                // the list of top items
                var recItems = this.sortObjectByKeys(newItems);
                var topItems = this.sortObjectByKeys(ssv.topItems);

                var ids = [];
                var backlog = [];

                // Copy the top recommended items to the final list to recommend
                // as well as their ids, upto the maximum length
                for (var i = 0; (i < recItems.length) && (finalItems.length < NUM_REC_ITEMS); i++) {
                    var info = globalComps.ItemObj.getInfoFromId(recItems[i][0]);
                    var name = (new globalComps.ItemObj(info.name)).getDispName();
                    var id = recItems[i][0];

                    var toAdd = {
                        genName: info.name,
                        name: name,
                        id: id,
                        added: false
                    };

                    // Add the item to final items if it is not currently in the
                    // user's list and it has not been previosuly recommended.
                    // Otherwise, if the item is not in the list, but has been
                    // previously recommended, add it to the backlog
                    if ((!ids.includes(id)) && (!currPrevRec.includes(id))) {
                        finalItems.push(toAdd);
                    } else if ((!ids.includes(id)) && (currPrevRec.includes(id))) {
                        backlog.push(toAdd);
                    }

                    ids.push(id)
                }

                // Fill the remaining space in the list of recommend items
                // with the most popular items
                for (var i = 0; (i < topItems.length) && (finalItems.length < NUM_REC_ITEMS); i++) {
                    var id = topItems[i][0];
                    if (!currItemIds.includes(id)) {
                        var info = globalComps.ItemObj.getInfoFromId(topItems[i][0]);
                        var name = (new globalComps.ItemObj(info.name)).getDispName();

                        var toAdd = {
                            genName: info.name,
                            name: name,
                            id: id,
                            added: false
                        };

                        // Same as above
                        if ((!ids.includes(id)) && (!currPrevRec.includes(id))) {
                            finalItems.push(toAdd);
                        } else if ((!ids.includes(id)) && (currPrevRec.includes(id))) {
                            backlog.push(toAdd);
                        }
                    }
                }

                // If we're out of items to recommend, reset the backlog and previosuly recommended items
                for (var i = 0; (i < backlog.length) && (finalItems.length < NUM_REC_ITEMS); i++) {
                    finalItems.push(backlog[i]);
                    currPrevRec = [];
                }
            }

            // Save the list of recommended items
            that.setState({
                recommendedItems: finalItems,
                prevRecommended: currPrevRec
            });
        });
    }

    /**
    * updateCurrItem
    * 
    * Updates the current item name and id in
    * the state based on the given information.
    * 
    * @param {String} newStore The name of the store given by the user
    * 
    * @returns None
    */
    updateCurrItem(newItem) {
        if (newItem.toString() == NEW_ITEM) {
            this.props.navigation.navigate("RegisterItemPage", {
                page: "CurrentListPage",
                listName: this.props.navigation.getParam("name", "(Invalid Name)"),
                listId: this.props.navigation.getParam("listID", "(Invalid List ID)")
            })
        } else {
            var id = ""; // Assume an empty id
            var genName = newItem; // Assume the given name is the generic name

            newItem = newItem.toString();

            // Check if the item is a known item
            for (var i = 0; i < availableItems.length; i++) {
                var name = availableItems[i].name;
                if (name === newItem) {
                    // Set the data for the item if known
                    id = availableItems[i].id;
                    genName = availableItems[i].genName;
                    break;
                }
            }

            // Update the state
            this.setState({
                itemName: newItem,
                genName: genName,
                currItemId: id
            });
        }
    }

    /**
     * handleAddButton
     * 
     * Handler for the add item button under
     * the autocomplete box.
     */
    handleAddButton = () => {
        this.addToggledRecommendedItems();

        if (this.state.genName !== DEFAULT_GEN_NAME) {
            var name = this.state.genName;
            if ((name === undefined) || (name === DEFAULT_GEN_NAME)) {
                name = this.state.value;
            }

            console.log("ADD", name, this.state.value);

            // Add the item to the list
            this.addItem(this.state.listId, name);
        }

        // Return to the list
        if (this._isMounted) {
            this.props.navigation.goBack();
        }
    }

    /**
     * handleAddRecommendedButton
     * 
     * Handler for the add recommended item button.
     * Adds the item to the list of items to add
     * and sets the item to added.
     * 
     * @param {Integer} ind The index of the item selected
     * 
     * @retunrs None
     */
    handleAddRecommendedButton = (ind) => {
        // Get the list of recommended items
        var temp = this.state.recommendedItems;

        // Add the selected item to the list
        temp[ind].added = true;

        this.setState({
            recommendedItems: temp
        });
    }

    /**
    * addItem
    * 
    * Adds the current item saved in the state
    * to the current list. Toggles the add item
    * modal visibility and clears the item name.
    * 
    * @param   None
    * 
    * @returns None
    */
    addItem(listId, genName) {
        console.log("ADD_ITEM", listId, genName, this.state.value);

        // Add the item to the list
        lf.AddItemToList(
            listId,
            genName,
            1,
            "aSize mL",
            "aNote");
    };

    addToggledRecommendedItems() {
        var currRecItems = this.state.recommendedItems;
        var currItemIds = this.state.listItemIds;
        var currPrevRec = this.state.prevRecommended;

        // Add all of the recommended items the user
        // has selected to their list. Also update
        // the previously recommended items
        for (var i = 0; i < currRecItems.length; i++) {
            var item = currRecItems[i];
            if (item.added) {
                this.addItem(this.state.listId,
                    item.genName);

                currItemIds.push(item.id);
            } else {
                currPrevRec.push(item.id);
            }
        }

        this.setState({
            listItemIds: currItemIds,
            prevRecommended: currPrevRec
        });
    }

    /**
     * handleRefreshButton
     * 
     * Handler for the refresh recommended items button.
     * Refreshes the recommended items
     * 
     * @param None
     * 
     * @returns None
     */
    handleRefreshButton() {
        this.addToggledRecommendedItems();
        this.loadRecommendedItems();
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
        return (
            <Layout style={styles.listItem} level='2'>
                <Layout style={styles.listTextContainer} level='1'>
                    <Layout style={styles.itemTextContainer} level='1'>
                        <Text style={styles.itemText}>
                            {item.name}
                        </Text>
                    </Layout>
                    <Layout style={styles.itemButtonContainer} level='1'>
                        <Button
                            icon={item.added ? CheckmarkIcon : AddIcon}
                            appearance='outline'
                            status={item.added ? 'success' : 'danger'}
                            onPress={() => this.handleAddRecommendedButton(index)}
                        />
                    </Layout>

                </Layout>
            </Layout>
        );
    }

    render() {
        const renderMenuAction = () => (
            <TopNavigationAction
                icon={ArrowBackIcon}
                onPress={() => this.props.navigation.goBack()}
            />
        );

        const onSelect = ({ title }) => {
            this.setState({ value: title });
            this.updateCurrItem(title);
        };

        const onChangeText = (value) => {
            this.setState({ value });
            this.setState({
                data: [{ name: value, title: value }].concat(availableItems.filter(item => item.title.toLowerCase().includes(value.toLowerCase())).concat(availableItems[availableItems.length - 1]))
            });
        };

        return (
            < React.Fragment >
                <TopNavigation
                    title={PAGE_TITLE}
                    alignment="center"
                    leftControl={renderMenuAction()}
                />
                <ScrollView style={[styles.scrollContainer, { backgroundColor: global.theme == light ? light["background-basic-color-1"] : dark["background-basic-color-1"] }]}>
                    <Layout style={styles.formOuterContainer} level='3'>
                        <Layout style={styles.formInnerContainer}>
                            <Autocomplete
                                ref={(input) => { this.autoCompleteInput = input; }}
                                style={styles.autocomplete}
                                placeholder='Enter an item'
                                value={this.state.value}
                                data={this.state.data}
                                onChangeText={onChangeText}
                                onSelect={onSelect}
                            />

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
                                    onPress={this.handleAddButton}
                                >
                                    {'Add Item'}
                                </Button>
                            </Layout>

                        </Layout>
                    </Layout>

                    <Layout style={styles.formOuterContainer} level='3'>
                        <Layout style={styles.formInnerContainer}>
                            <Layout style={styles.listItem} level='2'>
                                <Layout style={styles.listTextContainer} level='1'>
                                    <Layout style={styles.itemTextContainer} level='1'>
                                        <Text style={styles.itemText}>
                                            Recommended Items:
                                        </Text>
                                    </Layout>
                                    <Layout style={styles.itemButtonContainer} level='1'>
                                        <Button
                                            icon={RefreshIcon}
                                            appearance='outline'
                                            status='warning'
                                            onPress={() => this.handleRefreshButton()}
                                        />
                                    </Layout>

                                </Layout>
                            </Layout>

                            <FlatList
                                contentContainerStyle={{ paddingBottom: 16 }}// This paddingBottom is to make the last item in the flatlist to be visible.
                                style={styles.flatList}
                                data={this.state.recommendedItems}
                                width="100%"
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => this.renderListElem(item, index)}
                            />
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
    flatList: {
        paddingTop: 8,
        paddingHorizontal: 4,
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
    listItem: {
        flex: 1,
        marginVertical: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderRadius: 10,
    },
    formInnerContainer: {
        flex: 1,
        padding: 8,
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
    autocomplete: {
        width: '100%',
        margin: 4,
        borderRadius: 20,
    },
    ListContainer: {
        //justifyContent: "center",
        //alignItems: "center",
        flex: 1,
    },
    listTextContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    listSpacerContainer: {
        flex: 0.1
    },
    listButtonContainer: {
        flex: 0.25
    },
    itemTextContainer: {
        flex: 1,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemButtonContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    itemText: {
        flexWrap: 'wrap',
        width: '100%'
    },
});

export default AddItemPage;


