import React, { Component } from 'react';
import { StyleSheet, BackHandler, } from 'react-native';
import { Layout, ListItem, Icon, OverflowMenu, Button, } from 'react-native-ui-kitten';
import { ShareIcon, Trash2Icon, CheckmarkIcon, CloseIcon } from "../assets/icons/icons.js";
import { departments } from "../DepartmentList";

/**
 * ListItemContainer - A simple list item container designed to be used within lists
 * @property {string} title - Text to be displayed (default: 'Lorem Ipsum')
 * @property {string} description - Text to be displayed below the name (default: 'Lorem Ipsum')
 * @property {string} iconFill - Color to fill the icon on the right of the container (default: #8F9BB3)
 * @property {string} backgroundLevel - Sets the level value of the ui-kitten Layout component (default: '3') (see https://akveo.github.io/react-native-ui-kitten/docs/components/layout/api#layout for more details)
 * @property {function} onPress - onPress()
 * @property {function} onDelete - onDelete()
 * @property {boolean} fromItemView - Determines if this component is being created from YourLists page or CurrentList page (default: false)
 * @property {boolean} purchased - Determines if this component will display the purchased icon(checkmark-circle-outline) or the default icon(radio-button-off-outline) (default: false) 
 * @property {*} listID - The listID that this component refers to.
 * @property {*} itemID - The itemID that this component refers to.
 */
export default class ListItemContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuVisible: false,
        };
    }


    listViewMenuData = [
        { title: 'Share', icon: ShareIcon },
        { title: 'Delete', icon: Trash2Icon },
    ];

    itemViewMenuData = [
        { title: 'Delete', icon: Trash2Icon },
    ];

    // This handles Modal visibility even with Android back button press
    onMenuActionPress = () => {
        const menuVisible = !this.state.menuVisible;
        if (menuVisible) {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (this.state.menuVisible) {
                    const menuVisible = false;
                    this.setState({ menuVisible });
                }
                this.backHandler.remove();
                return true;
            });
        }
        else {
            this.backHandler.remove();
        }
        this.setState({ menuVisible });
    };

    onSelectMenuItem = (index) => {
        this.setState({ menuVisible: false }, () => { this.preformMenuAction(index) });
    };

    preformMenuAction = (index) => {
        if (this.props.fromItemView) {
            if (index == 0) {
                this.props.onDelete(this.props.listID, this.props.itemID);
            }
        } else {
            if (index == 0) {
                if (this.props.fromContactView) {
                    this.props.onDelete()
                } else {
                    // Alert.alert("Share the list " + this.props.listID)
                    this.props.navigate()
                }
            }
            else if (index == 1) {
                // Delete
                this.props.onDelete(this.props.listID);
            }
        }
    }

    getListItemStyle(propVals) {
        var sheetStyle = styles.listItemContainer;

        var retStyle = {};
        for (var key in sheetStyle) {
            retStyle[key] = sheetStyle[key];
        }

        var dep = propVals.department;
        if ((dep !== undefined) && (dep !== null)) {
            var col = "black";

            for (var i = 0; i < departments.length; i++) {
                if (departments[i].value === dep) {
                    col = departments[i].colour;
                    i = departments.length + 2;
                }
            }

            retStyle.borderColor = col;
            retStyle.borderWidth = 1;
            retStyle.borderRadius = 8;
        }

        return retStyle;

    }

    render() {
        const { fromContactView = false,
            share = false,
            contact = false,
            pending = false,
            title = 'Lorem Ipsum',
            description = '',
            fromItemView = false,
            purchased = false,
            iconFill = '#8F9BB3',
            backgroundLevel = '3',
            onPress = () => { },
            onDelete = () => { }
        } = this.props;

        MenuIcon = () => (
            <Icon name='more-vertical-outline' fill={iconFill} />
        );

        CheckmarkCircleIcon = () => (
            <Icon name='checkmark-circle-outline' fill='green' />
        );

        RadioButtonOffIcon = () => (
            <Icon name='radio-button-off-outline' fill='orange' />
        );

        if (contact) {
            if (pending) {
                return (
                    <Layout style={styles.outerContainer} level={backgroundLevel} >
                        <Layout style={styles.listItemContainer} level={backgroundLevel}>
                            <ListItem style={styles.listItemContainer} disabled={fromItemView} title={title} description={description} titleStyle={{ fontSize: 16 }} onPress={onPress} />
                        </Layout>
                        <Layout style={styles.optionButtonContainer} level={backgroundLevel}>
                            <OverflowMenu
                                style={styles.overflowMenu}
                                visible={this.state.menuVisible}
                                data={fromItemView ? this.itemViewMenuData : this.listViewMenuData}
                                placement='left'
                                onSelect={this.onSelectMenuItem}
                                onBackdropPress={this.onMenuActionPress}>
                                <Layout style={styles.pending} level={backgroundLevel}>
                                    <Button appearance='ghost' status='success' icon={CheckmarkIcon} onPress={() => this.props.acceptFunction()} />
                                    <Button appearance='ghost' status='danger' icon={CloseIcon} onPress={() => this.props.rejectFunction()} />
                                </Layout>
                            </OverflowMenu>
                        </Layout>
                    </Layout >
                );
            } else {
                if (share) {
                    return (
                        <Layout style={styles.outerContainer} level={backgroundLevel} >
                            <Layout style={styles.listItemContainer} level={backgroundLevel}>
                                <ListItem icon={purchased ? CheckmarkCircleIcon : RadioButtonOffIcon} style={styles.listItemContainer} disabled={fromItemView} title={title} description={description} titleStyle={{ fontSize: 16 }} onPress={onPress} />
                            </Layout>
                        </Layout>
                    );

                } else {
                    return (
                        <Layout style={styles.outerContainer} level={backgroundLevel} >
                            <Layout style={styles.listItemContainer} level={backgroundLevel}>
                                <ListItem style={styles.listItemContainer} disabled={fromItemView} title={title} description={description} titleStyle={{ fontSize: 16 }} onPress={onPress} />
                            </Layout>
                            <Layout style={styles.optionButtonContainer} level={backgroundLevel}>
                                <OverflowMenu
                                    style={styles.overflowMenu}
                                    visible={this.state.menuVisible}
                                    data={fromItemView ? this.listViewMenuData : this.itemViewMenuData}
                                    placement='left'
                                    onSelect={this.onSelectMenuItem}
                                    onBackdropPress={this.onMenuActionPress}>
                                    <Button
                                        appearance='ghost'
                                        icon={MenuIcon}
                                        onPress={this.onMenuActionPress}
                                    />
                                </OverflowMenu>
                            </Layout>
                        </Layout>
                    );
                }
            }
        }

        return (
            <Layout style={styles.outerContainer} level={backgroundLevel} >
                <Layout
                    style={styles.listItemContainer}
                    level={backgroundLevel}
                >
                    <ListItem
                        style={this.getListItemStyle(this.props)}
                        disabled={fromItemView}
                        icon={purchased ? CheckmarkCircleIcon : RadioButtonOffIcon}
                        title={title}
                        description={description}
                        titleStyle={{ fontSize: 16 }}
                        onPress={onPress}
                    />
                </Layout>

                <Layout style={styles.optionButtonContainer} level={backgroundLevel}>
                    <OverflowMenu
                        style={styles.overflowMenu}
                        visible={this.state.menuVisible}
                        data={fromItemView ? this.itemViewMenuData : this.listViewMenuData}
                        placement='left'
                        onSelect={this.onSelectMenuItem}
                        onBackdropPress={this.onMenuActionPress}
                    >
                        <Button
                            appearance='ghost'
                            icon={MenuIcon}
                            onPress={this.onMenuActionPress}
                        />
                    </OverflowMenu>
                </Layout>

            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    outerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        margin: 4,
        shadowColor: 'black',
        shadowOpacity: .20,
        shadowOffset: { width: 0, height: 0, },
        elevation: 4,
    },
    listItemContainer: {
        flex: 1,
        borderRadius: 10,
        padding: 4,
    },
    optionButtonContainer: {
        borderRadius: 10,
    },
    overflowMenu: {
        padding: 4,
        shadowColor: 'black',
        shadowOpacity: .5,
        shadowOffset: { width: 4, height: 4 },
        elevation: 8,
    },
    pending: {
        flexDirection: 'row',
        borderRadius: 10,
    }
});