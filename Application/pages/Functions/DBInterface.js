import * as firebase from "firebase";

const globalComps = require('./GlobalComps');

export function replaceInvalidPathCharsGlobal(string) {
    if (string !== null) {
        string = string.
        replace(".", "").
        replace("#", "").
        replace("$", "").
        replace("[", "").
        replace("]", "");
    }

    return (string);
}

function replaceInvalidPathChars(stringToMod) {
    if (stringToMod !== null) {
        stringToMod = stringToMod.
        replace(".", "").
        replace("#", "").
        replace("$", "").
        replace("[", "").
        replace("]", "");
    }

    return (stringToMod);
}

function formatText(string){
    var newSrting = titleCase(string)
    return newSrting.trim();
}

//https://stackoverflow.com/questions/32589197/capitalize-first-letter-of-each-word-in-a-string-javascript/32589256
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }

/**
 * compArrays
 * 
 * Compares the two given arrays to see if they are equal.
 * They are equal of both are arrays, both are equal length,
 * and their inner objects are equal
 * 
 * @param {Array} array1 The first array to compare
 * @param {Array} array2 The second array to compare
 */
function compArrays(array1, array2) {
    // if the other array is a falsy value, return
    if (!array1 || !array2) {
        return false;
    }

    // compare lengths - can save a lot of time 
    if (array1.length !== array2.length) {
        return false;
    }

    for (var i = 0, l = array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].equals(array2[i])) {
                return false;
            }
        } else if (array1[i] !== array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

/**
 * registerItem
 * 
 * Registers the given information to the items database.
 * If the item has not been registered before, then all of the
 * given information is stored. If the item has been registered,
 * then it is parsed to check if the description has been saved. If
 * it has not been saved then the whole description is saved, otherwise
 * only the price is saved.
 * 
 * @param {String} name   The generic name of the item
 * @param {String} specificName The specific name of the item
 *                              Default is null
 * @param {Integer} size The size of the item in the given unit of measurement
 *                       Default is null
 * @param {String} sizeUnit The unit of measurement corresponding to the given size
 *                          Default is null
 * @param {Integer} price The price of the item
 *                        Default is null
 * 
 * @returns None
 */
export function registerItem(name, size = null, sizeUnit = null, price = null) {
    name = replaceInvalidPathChars(name);
    name = formatText(name);

    // Get the path to the item
    var itemPath = (new globalComps.ItemObj(name)).getPath();

    var itemInfo = globalComps.getItem(name).then((itemInfo) => {
        var item = itemInfo.item;

        if (item === null) {
            // Register the full item if it has not been registered before
            // Format the data in a dictionary before saving
            var initialDesc = {
                name: name
            };

            if (size !== null) {
                initialDesc.size = size;
                initialDesc.sizeUnit = sizeUnit;
            }

            if (price !== null) {
                initialDesc.prices = { initialPrice: price };
            }

            // Push the dictionary to the table
            item = firebase.database().ref(itemPath + "descs").push(initialDesc);
        } else {
            // Item has already been registered
            var descId = null;
            var priceExists = false;

            // Check if the description has been previosuly saved
            var descs = item.descs;
            for (var tempDescId in descs) {
                var tempDesc = descs[tempDescId];
                if (((tempDesc.size === size) && (tempDesc.sizeUnit === sizeUnit)) ||
                    ((tempDesc.size === undefined) && (tempDesc.sizeUnit === undefined) && (size === null))) {
                    // Description found
                    descId = tempDescId;

                    // Check if the price has also been saved in the description
                    var prices = tempDesc.prices;
                    for (var tempPriceId in prices) {
                        if (prices[tempPriceId] === price) {
                            priceExists = true;
                        }
                    }
                }
            }

            // Save the new data
            if (descId === null) {
                // Description has not been saved, so save
                // the full description
                toAdd = {};
                if (size !== null) {
                    toAdd.size = size;
                    toAdd.sizeUnit = sizeUnit;
                }

                if (price !== null) {
                    toAdd.prices = { initialPrice: price };
                }

                item = firebase.database().ref(itemPath + "descs").push(toAdd);
            } else if ((descId !== null) && (!priceExists) && (price !== null)) {
                // Only the price has not been saved, so save the price
                item = firebase.database().ref(itemPath + "descs/" + descId + "/prices").push(
                    price
                );
            }
        }

        // Return the item key
        return {
            itemId: item.key
        }
    });

    return itemInfo;
}

/**
 * modStoreWeights
 * 
 * Updates the weights of each map for the given store
 * based on how similar the map is to the given map.
 * Difference metric is based on the departments unique
 * to the current map and given map. The metric is also
 * based on the order of the common departments.
 * 
 * @param {String} storeName    Name of the store
 * @param {String} address Address of teh store
 * @param {Array} map   The map to compare against
 * 
 * @returns None 
 */
export async function modStoreWeights(storeName, address, map) {
    try {
        // Call the function to get the sorted list
        const {
            data
        } = await firebase.functions().httpsCallable('cloudModStoreWeights')({
            storeName: storeName,
            address: address,
            map: map
        });

        return data;
    } catch (e) {
        console.error(e);

        return (null);
    }
}

/**
 * registerStore
 * 
 * Registers the store with the given information to the
 * given database. If the store has not been previously saved,
 * the save the whole store, otheriwse only save the franchise name
 * 
 * @param {String} storeName The name of the store
 * @param {String} address The address of the store
 * @param {Array} map The map of the store
 * @param {String} franchiseName The franchise name of the store
 *                               Default is  null
 * 
 * @returns None
 */
export function registerStore(storeName, address, map, franchiseName = null) {
    storeName = replaceInvalidPathChars(storeName);
    address = replaceInvalidPathChars(address);

    // Get the path of the store
    var storePath = (new globalComps.StoreObj(address, storeName)).getPath();

    // Load the store
    var storeInfo = globalComps.getStore(storeName, address).then((storeInfo) => {
        var store = storeInfo.store;

        if (store === null) {
            // Store has not been saved before, so save all the data
            // Format the data in a dictionary before saving
            var toAdd = {
                maps: [{
                    map: map,
                    weight: 1,
                }]
            };

            if (franchiseName !== null) {
                toAdd.candFranchiseName = [{
                    franchiseName: franchiseName,
                    count: 1
                }]
            }

            // Push the data to the database
            store = firebase.database().ref(storePath).update(toAdd);
        } else {
            var maps = store.maps;
            var mapExists = false;

            // Check if the map has been saved before
            for (var mapId in maps) {
                var tempMap = maps[mapId];
                if (compArrays(tempMap.map, map)) {
                    mapExists = true;
                    break;
                }
            }

            // Handle the franchise name
            if (franchiseName !== null) {
                var fNames = store.candFranchiseName;
                var franchiseNameCount = 0;

                // Check if the franchise name has been registered before
                // if it has, then get the cound and id
                var fNameId = null;
                for (var tempFNameId in fNames) {
                    var tempFName = fNames[tempFNameId];
                    if (tempFName.franchiseName === franchiseName) {
                        franchiseNameCount = tempFName.count;
                        fNameId = tempFNameId;
                        break;
                    }
                }

                // Iterate the franchise name count
                franchiseNameCount += 1;

                // Update the franchise name and count
                if (fNameId === null) {
                    store = firebase.database().ref(storePath + "candFranchiseName/").push({
                        franchiseName: franchiseName,
                        count: franchiseNameCount
                    });
                } else {
                    store = firebase.database().ref(storePath + "candFranchiseName/" + fNameId).update({
                        count: franchiseNameCount
                    });
                }
            }

            if (!mapExists) {
                // Push the list to the database, if it has not been registered
                store = firebase.database().ref(storePath + "maps").push({
                    map: map,
                    weight: 1,
                });
            }
        }

        return {
            storeId: store.key
        }
    });

    return storeInfo;
}

/**
 * addItemLoc
 * 
 * Saves the given location to the database. Creates
 * the item and store for the location if they have
 * not already been created. Adds the location if
 * if has not already been created.
 * 
 * @param {String} name The generic name of the item
 * @param {String} storeName The name of the store
 * @param {String} address The address of the store
 * @param {Integer} aisleNum The aisle number of the item
 * @param {String} itemDepartment The department name of the item
 * 
 * @returns None
 */
export function addItemLoc(name, storeName, address, aisleNum, itemDepartment) {
    name = replaceInvalidPathChars(name);
    storeName = replaceInvalidPathChars(storeName);
    address = replaceInvalidPathChars(address);

    var database = firebase.database();

    // Get the store object
    var storeInfo = globalComps.getStore(storeName, address).then((storeInfo) => {
        var store = storeInfo.store;

        return {
            store: store
        };
    }).then((value) => {
        var store = value.store;

        // If the store has not been created, then register the store
        if (store === null) {
            var map = [];
            var temp = registerStore(storeName, address, map);
        }

        return Promise.all([store]);
    }).then((value) => {
        var store = value[0];

        // Get the item object
        var itemInfo = globalComps.getItem(name);

        return Promise.all([store, itemInfo]);
    }).then((value) => {
        var store = value[0];
        var item = value[1].item;

        // If the item has not been created, then register the item
        if (item === null) {
            var temp = registerItem(name);
        }

        return Promise.all([store, item]);
    }).then((value) => {
        var store = value[0];
        var item = value[1];

        // Create the store and item objects to get the paths and ids
        var tempStore = new globalComps.StoreObj(address, storeName);
        var tempItem = new globalComps.ItemObj(name);

        // Get the corresponding paths
        var storePath = tempStore.getPath();
        var itemPath = tempItem.getPath();

        // Get the corresponding ids
        var storeId = tempStore.getId();
        var itemId = tempItem.getId();

        // If the item was already registered,
        // parse if to check if the location has already been saved
        var added = false;
        if ((item !== null) && (item.locs !== undefined) && (storeId in item.locs)) {
            // Get the known locations
            var locs = item.locs[storeId];

            // Check all locations to check if it has already been saved
            var locId = null;
            for (var tempLocId in locs) {
                var tempLoc = locs[tempLocId];
                if (((tempLoc.aisleNum === aisleNum) || ((tempLoc.aisleNum === undefined) && (aisleNum === null))) &&
                    (tempLoc.department === itemDepartment)) {
                    // location has already been saved
                    locId = tempLocId;
                    break;
                }
            }

            // If the location has already been saved, iterate the cound
            if (locId !== null) {
                count = item.locs[storeId][locId].count + 1;

                firebase.database().ref(itemPath + "/locs/" + storeId + "/" + locId).update({
                    count: count
                });

                added = true;
            }
        }

        // If the location has not already been saved, then add it
        if (!added) {
            firebase.database().ref(itemPath + "/locs/" + storeId).push({
                department: itemDepartment,
                aisleNum: aisleNum,
                aisleTags: [],
                count: 1
            });
        }

        // If the store was already registered,
        // parse if to check if the location has already been saved
        added = false;
        if ((store !== null) && (store.items !== undefined) && (itemId in store.items)) {
            // Get the known locations
            locs = store.items[itemId];

            // Check all locations to check if it has already been saved
            locId = null;
            for (tempLocId in locs) {
                tempLoc = locs[tempLocId];
                if (((tempLoc.aisleNum === aisleNum) || ((tempLoc.aisleNum === undefined) && (aisleNum === null))) &&
                    (tempLoc.department === itemDepartment)) {
                    // location has already been saved
                    locId = tempLocId;
                    break;
                }
            }

            // If the location has already been saved, iterate the cound
            if (locId !== null) {
                count = store.items[itemId][locId].count + 1;
                firebase.database().ref(storePath + "/items/" + itemId + "/" + locId).update({
                    count: count
                });
                added = true;
            }
        }

        // If the location has not already been saved, then add it
        if (!added) {
            firebase.database().ref(storePath + "/items/" + itemId).push({
                department: itemDepartment,
                aisleTags: [],
                aisleNum: aisleNum,
                count: 1
            });
        }

        return {
            added: added
        }

    });
}