import React, { Component } from "react";
import { StyleSheet, Platform } from "react-native";
import {
    Layout,
    Button,
    Input,
    Modal,
    TopNavigation,
    TopNavigationAction,
    Select,
    Text,
    CheckBox
} from "react-native-ui-kitten";
import { ArrowBackIcon } from "../assets/icons/icons.js";
import { dark, light } from "../assets/Themes.js";
import NotificationPopup from "react-native-push-notification-popup";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import lf from "./Functions/ListFunctions";
import HereMapsSearchAsync from "../components/HereMapsSearchAsync.js";
// import axios from 'axios';
import nm from '../pages/Functions/NotificationManager.js';

const PAGE_TITLE = "Select Location";
const NO_LOCATION_PERMISSION =
    "Please enable location permissions to view your current location.";
const ANDROID_EMULATOR_ERROR =
    "Oops, this will not work on Sketch in an Android emulator. Try it on your device!";

const DEFAULT_LATITUDE = 45.421;
const DEFAULT_LONGITUDE = -75.6907;
const DEFAULT_LATITUDE_DELTA = 0.01;
const DEFAULT_LONGITUDE_DELTA = 0.01;
const CURRENT_LOCATION_MARKER_TITLE = "Your Current Location";
const CURRENT_LOCATION_MARKER_DESCRIPTION = "";
const DEFAULT_MAX_LOCATIONS = 20;
const MAP_ANIMATION_DURATION = 200;
const DEFAULT_REQUEST_TIMEOUT = 500;


const HERE_REQUEST_HEADER_1 =
    "https://places.sit.ls.hereapi.com/places/v1/browse";
const HERE_REQUEST_HEADER_2 = "&q=grocery+store";
const HERE_REQUEST_HEADER_3 = "&tf=plain";
const HERE_REQUEST_HEADER_4 = "&cat=shopping";

// SMAPLE API REQUEST
// https://places.sit.ls.hereapi.com/places/v1/discover/explore
// ?apiKey={YOUR_API_KEY}
// &in=53.2711,-9.0541;r=150
// &cat=sights-museums
// &pretty

class MapsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLocation: {
                latitude: DEFAULT_LATITUDE,
                longitude: DEFAULT_LONGITUDE,
                latitudeDelta: DEFAULT_LATITUDE_DELTA,
                longitudeDelta: DEFAULT_LONGITUDE_DELTA,
            },
            currentCursorLocation: {
                latitude: DEFAULT_LATITUDE,
                longitude: DEFAULT_LONGITUDE,
                latitudeDelta: DEFAULT_LATITUDE_DELTA,
                longitudeDelta: DEFAULT_LONGITUDE_DELTA,
            },
            markerOpacity: 0,
            statusMessage: null,
            apiKey: null,
            searchRequestParams: [],
            storesApiRequestResult: null,
            ready: false,
            requestTimeout: 0,
        };
        this._getApiKey();

    }

    componentDidMount() {
        this._getLocationAsync();
        nm.setThat(this)
    }

    async _getApiKey() {
        var key = await lf.getMapsApiKey();
        this.setState({ apiKey: key });
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== "granted") {
            this.setState({
                errorMessage: NO_LOCATION_PERMISSION
            });
        }
        let currentLocation = await Location.getCurrentPositionAsync();
        let region = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: DEFAULT_LATITUDE_DELTA,
            longitudeDelta: DEFAULT_LONGITUDE_DELTA,
        };
        this.setRegion(region);
        this.setSearchRequestParams(region);
        this.setState({ currentLocation: region });
        this.setState({ markerOpacity: 1 });
    }

    setRegion(region) {
        if (this.state.ready) {
            this.map.animateToRegion(region, MAP_ANIMATION_DURATION);
            this.setState({ currentCursorLocation: region });
        }
    }

    setSearchRequestParams = location => {
        if (this.state.apiKey != null) {
            var request = [];
            request[0] = HERE_REQUEST_HEADER_1 + "?at=" + location.latitude + "," + location.longitude;
            request[1] = "&name=";
            request[2] = "";
            request[3] = HERE_REQUEST_HEADER_4 + HERE_REQUEST_HEADER_3;
            request[4] = "&apiKey=" + this.state.apiKey;
            this.setState({ searchRequestParams: request });
        }
        else {
            console.log("MapsPage: apiKey is null, could not set search params.");
        }
    }

    getNearbyStores = region => {
        if (this.state.apiKey != null) {
            const request =
                HERE_REQUEST_HEADER_1 +
                "?at=" +
                region.latitude +
                "," +
                region.longitude +
                HERE_REQUEST_HEADER_2 +
                HERE_REQUEST_HEADER_3 +
                "&apiKey=" +
                this.state.apiKey;
            console.log("REQUEST STRING: " + request);
            axios
                .get(request)
                .then(result => {
                    this.setState({ storesApiRequestResult: result });
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            console.log("MapsPage: apiKey is null, could not get nearby stores.");
        }
    }

    handleMapReady = () => {
        if (!this.state.ready) {
            this.setState({ ready: true });
        }
    }

    calculateLatitudeDelta(latitude) {
        if (this.state.storesApiRequestResult != null) {
            var delta = 0.0;
            this.state.storesApiRequestResult.data.results.items.map((item, key) => {
                delta = Math.max(
                    delta,
                    Math.abs(
                        latitude - item.position[0]
                    )
                );
            });
            return delta * 2;
        }
        else {
            return DEFAULT_LATITUDE_DELTA;
        }
    }

    calculateLongitudeDelta(longitude) {
        if (this.state.storesApiRequestResult != null) {
            var delta = 0.0;
            this.state.storesApiRequestResult.data.results.items.map((item, key) => {
                delta = Math.max(
                    delta,
                    Math.abs(
                        longitude - item.position[1]
                    )
                );
            });
            return delta * 2;
        }
        else {
            return DEFAULT_LONGITUDE_DELTA;
        }
    }

    handleMapRegionChange = newRegion => {
        if (this.state.ready) {
            if (this.state.requestTimeout) {
                clearTimeout(this.state.requestTimeout);
            }
            setTimeout(() => { this.getNearbyStores(newRegion); }, DEFAULT_REQUEST_TIMEOUT);
            this.setSearchRequestParams(newRegion);
            this.setState({
                currentCursorLocation: newRegion
            });
        }
    };

    selectStore = location => {
        if (this.props.navigation.state.params) {
            this.props.navigation.state.params.selectStore(location);
        }
        this.props.navigation.goBack();
    };

    autoCompleteSelected = (selectedStore, storePosition) => {
        console.log("RECEIVED selectedStore: " + selectedStore);
        console.log("RECEIVED storePosition: latitude: " + storePosition.latitude + " longitude: " + storePosition.longitude);
        const storeRegion = {
            latitude: storePosition.latitude,
            longitude: storePosition.longitude,
            latitudeDelta: DEFAULT_LATITUDE_DELTA,
            longitudeDelta: DEFAULT_LONGITUDE_DELTA,
        }
        this.map.animateToRegion(storeRegion, MAP_ANIMATION_DURATION)
    }

    render() {
        const renderMenuAction = () => (
            <TopNavigationAction
                icon={ArrowBackIcon}
                onPress={() => this.props.navigation.goBack()}
            />
        );

        const createStoreMarker = (coords, title, description, key) => (
            <Marker
                key={key}
                coordinate={{ latitude: coords[0], longitude: coords[1] }}
                title={title}
                description={description}
                opacity={this.state.markerOpacity}
                pinColor={"green"}
                onCalloutPress={() => this.selectStore(title + " - " + description)}
            />
        );

        return (
            <React.Fragment>
                <TopNavigation
                    title={PAGE_TITLE}
                    alignment="center"
                    leftControl={renderMenuAction()}
                />
                <Layout style={styles.container}>
                    <Layout style={styles.autoCompleteInputContainer}>
                        <HereMapsSearchAsync
                            placeholder={"Search for stores..."}
                            backgroundLevel='2'
                            requestArray={this.state.searchRequestParams}
                            // the requestValueIndex value here is based on the position of the value in the requestArray
                            requestValueIndex={2}
                            onValueSelected={this.autoCompleteSelected}
                        />
                    </Layout>
                    <MapView
                        ref={map => (this.map = map)}
                        style={styles.mapView}
                        initialRegion={{
                            latitude: DEFAULT_LATITUDE,
                            longitude: DEFAULT_LONGITUDE,
                            latitudeDelta: DEFAULT_LATITUDE_DELTA * 100,
                            longitudeDelta: DEFAULT_LONGITUDE_DELTA * 100,
                        }}
                        onMapReady={this.handleMapReady}
                        onRegionChangeComplete={this.handleMapRegionChange}
                    >
                        <Marker
                            coordinate={this.state.currentLocation}
                            title={CURRENT_LOCATION_MARKER_TITLE}
                            description={CURRENT_LOCATION_MARKER_DESCRIPTION}
                            opacity={this.state.markerOpacity}
                        />
                        {this.state.storesApiRequestResult != null
                            ? this.state.storesApiRequestResult.data.results.items.map(
                                (item, key) => {
                                    return createStoreMarker(
                                        item.position,
                                        item.title,
                                        item.vicinity,
                                        key
                                    );
                                }
                            )
                            : null}
                    </MapView>
                </Layout>
                <NotificationPopup ref={ref => (this.popup = ref)} />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    autoCompleteInputContainer: {
        flexBasis: 60,
        padding: 8,
    },
    mapView: {
        flex: 1,
    },
});

export default MapsPage;
