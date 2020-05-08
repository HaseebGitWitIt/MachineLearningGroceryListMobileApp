const dbLoading = require('./DBLoading');
const StoreObj = require('./StoreObj');

function internalGetStoreFromId(database, storeId) {
    var retVal = dbLoading.loadAllStores(database).then((knownStores) => {
        // Get the store's info from the given id
        var info = StoreObj.StoreObj.getInfoFromId(storeId);

        var address = info.address;
        var storeName = info.storeName;

        var store = null;

        // Get the store
        if ((address in knownStores) && (storeName in knownStores[address])) {
            store = knownStores[address][storeName];
        }

        return(store);
    });

    return retVal;
}

/**
 * getStoreFromId
 * 
 * Returns the state of the store with the given
 * store id.
 * 
 * @param {String} storeId The id of the store to find
 * 
 * @returns The state of the store with the given id
 *          Null if the store is unknown
 */
exports.getStoreFromId = function(database, storeId) {
    return internalGetStoreFromId(database, storeId)
}

function internalGetItemLocInStore(database, storeId, itemId) {
    // Get the store's items
    var retVal = internalGetStoreFromId(database, storeId).then((store) => {
        var department = null;
        var aisleNum = null;
        var aisleTags = [];

        if (store !== null) {        
            var itemList = store.items;

            // Parse the store's items to find the target item
            for (var tempItemId in itemList) {
                if (tempItemId === itemId) {
                    // Item found
                    var candItemInfo = itemList[tempItemId];
                    var maxCount = -1;
                    var info = null;

                    // Loop through all of the candidate item infos to
                    // find the location with the highest cound
                    for (var tempCandItemInfoId in candItemInfo) {
                        var tempCandItemInfo = candItemInfo[tempCandItemInfoId];
                        if (tempCandItemInfo.count > maxCount) {
                            info = tempCandItemInfo;
                            maxCount = tempCandItemInfo.count;
                        }
                    }

                    // Get the location's information
                    department = info.department;
                    aisleNum = info.aisleNum;
                    for (var tag in info.tags){
                        aisleTags.push(info.tags[tag]);
                    }
                }
            }
        }

        // Return the information
        return {
            department: department,
            aisleNum: aisleNum,
            aisleTags: aisleTags
        };
    });

    return retVal;
}

/**
 * getItemLocInStore
 * 
 * Retrieves the location of the given item in
 * the given store. The location is the candidate
 * location with the highest count.
 * 
 * @param {String} storeId The id of the store
 * @param {String} itemId The id of the item
 * 
 * @returns An object containing the location with
 *          the location's department, aisle number,
 *          and aisle tags
 */
exports.getItemLocInStore = function(database, storeId, itemId){
    return internalGetItemLocInStore(database, storeId, itemId);
}

function internalGetStoreMap(database, storeId) {
    var retVal = dbLoading.loadStoresMaps(database, storeId).then((ssv) => {
        var mapCount = {};

        // Loop through all of the store's maps
        for (var tempMapId in ssv) {
            var tempMapObj = ssv[tempMapId];

            // Get the weight and order of the current map
            var weight = tempMapObj.weight;
            var tempMap = tempMapObj.map;

            // Loop through all of the departments in the current map
            for (var i = 0; i < tempMap.length; i++) {
                var dep = tempMap[i];

                // Add the department to the map count object if
                // it has not already been added
                if (!(dep in mapCount)) {
                    mapCount[dep] = 0;
                }

                // Update the current departments count
                mapCount[dep] = mapCount[dep] + i * weight;
            }
        }

        // Copy the map count data to a list
        var sortMap = [];
        for (dep in mapCount) {
            sortMap.push([dep, mapCount[dep]]);
        }

        // Sort the list based on the department's counts
        sortMap.sort((a, b) => {
            return a[1] - b[1];
        });

        // Parse out the final data
        var finalMap = [];
        for (i = 0; i < sortMap.length; i++){
            finalMap.push(sortMap[i][0]);
        }

        // Return the final map
        return finalMap;
    });

    return retVal;
}

/**
 * getStoreMap
 * 
 * Calculates the most likely map of the given store
 * based on the known data. The map is calculate as follows:
 *  For each known map:
 *      Assign a weight to the department in the map
 *      based on the map's weight and the location of
 *      the department in the list
 * 
 *  Take the sum of the weights
 *  Sort the list based on the weights
 * 
 * @param {Database} database The database to parse
 * @param {String} storeId The id of the store
 */
exports.getStoreMap = function(database, storeId) {
    return internalGetStoreMap(database, storeId);
}

/**
 * predictItemLoc
 * 
 * Predicts the given item's location in the given store.
 * If the location is known, then it is returned. Otherwise
 * the location is predicted. To predict the location, the
 * algorithm first calculates the three most similar stores
 * that contain the item. The majority location is then used to
 * predict the location.
 * 
 * @param {Database} database The database containing all of the information
 * @param {String} storeId The id of the store
 * @param {String} itemId The id of the item
 * 
 * @returns An object containing the predicted location with
 *          the department, aisle number, and aisle tags.
 */
exports.predictItemLoc = function(database, storeSimilarities, storeId, itemId) {
    var retVal = Promise.all([dbLoading.loadAllStores(database), internalGetItemLocInStore(database, storeId, itemId)]).then((data) => {
        var knownStores = data[0];
        var loc = data[1];

        var department = null;
        var aisleNum = null;
        var aisleTags = [];

        var locs = [];
        var storeIds = [];

        var known = false;

        if (loc.department !== null){
            // If the location is known, then get the location's information
            department = loc.department;
            aisleNum = loc.aisleNum;
            aisleTags = loc.aisleTags;

            known = true;
        } else {
            // Check all known stores to check if they contain the target item
            for (var tempAddress in knownStores){
                for (var tempStoreName in knownStores[tempAddress]){
                    var tempStoreId = (new StoreObj.StoreObj(tempAddress, tempStoreName)).getId();
                    var tempLoc = internalGetItemLocInStore(database, tempStoreId, itemId);
                    storeIds.push(tempStoreId);
                    locs.push(tempLoc);
                }
            }
        }

        return Promise.all([department, aisleNum, Promise.all(aisleTags), known, Promise.all(storeIds), Promise.all(locs)]);
    }).then((data) => {
        var department = data[0];
        var aisleNum = data[1];
        var aisleTags = data[2];
        var known = data[3];
        var storeIds = data[4];
        var locs = data[5];

        if (department === null) {
            // If the location is unknown, predict it
            var storesWithItem = [];

            // Check all known stores to check if they contain the target item
            for (var i = 0; i < locs.length; i++) {
                var tempLoc = locs[i];
                if (tempLoc.department !== null) {
                    // If the store contains the item, then save the location
                    storesWithItem.push({
                        id: storeIds[i],
                        department: tempLoc.department,
                        aisleNum: tempLoc.aisleNum,
                        aisleTags: tempLoc.aisleTags
                    });
                }
            }

            // Calculate the similarity of all stores that contain the item
            for (i = 0; i < storesWithItem.length; i++) {
                var temp = storeSimilarities[storeId][storesWithItem[i].id];
                storesWithItem[i].score = temp;
            }

            // Sort the stores with the item based on their score
            storesWithItem.sort((a, b) => b.score - a.score);

            // Get the three most similar stores
            storesWithItem = storesWithItem.slice(0, 3);

            depCount = {};
            aisleCount = {};

            // Calculate how often each department appears
            for (i = 0; i < storesWithItem.length; i++){
                var store = storesWithItem[i];
                var dep = store.department;
                var num = store.aisleNum;

                if (dep in depCount){
                    depCount[dep] += 1;
                } else {
                    depCount[dep] = 1;
                }

                if (num in aisleCount){
                    aisleCount[num] += 1;
                } else {
                    aisleCount[num] = 0;
                }
            }

            // Sort the locations based on their occurance counts
            department = Object.keys(depCount);
            if (department.length > 0) {
                department = department.reduce((a, b) => depCount.a > depCount.b ? a : b);
            } else {
                department = null;
            }

            aisleNum = Object.keys(aisleCount)
            if (aisleNum.length > 0) {
                aisleNum = aisleNum.reduce((a, b) => aisleCount.a > aisleCount.b ? a : b);
            } else {
                aisleNum = null;
            }
        }

        // Return the average location
        return {
            known: known,
            department : department,
            aisleNum : aisleNum,
            aisleTags : aisleTags
        }
    });

    return retVal;
}

/**
 * getOptimizerMap
 * 
 * Loads the map used by the optimizer and
 * returns that map.
 * 
 * @param {Database} database The database containing all of the information
 * @param {String} storeId The id of the store
 * @param {String} itemId The id of the item
 * 
 * @returns The map used by the optimizer
 */
exports.getOptimizerMap = function(data, context, database) {
    var address = data.address;
    var storeName = data.storeName;

    var store = new StoreObj.StoreObj(address, storeName);

    var storeId = store.getId();

    var map = internalGetStoreMap(database, storeId);

    return map;
}

/**
 * getMostPopularMap
 * 
 * Loads the map with the highest weight
 * and returns that value.
 * 
 * @param {Database} database The database containing all of the information
 * @param {String} storeId The id of the store
 * @param {String} itemId The id of the item
 * 
 * @returns The map with the highest weight
 */
exports.getMostPopularMap = function(data, context, database) {
    var address = data.address;
    var storeName = data.storeName;

    // Get the path to the store
    var store = new StoreObj.StoreObj(address, storeName);
    var storePath = store.getPath();
    var storeId = store.getId();

    // Get the current state of the store's maps
    var retVal = dbLoading.loadStoresMaps(database, storeId).then((maps) => {
        var currMap = null;
        var maxWeight = -1;

        // Loop through all of the store's maps
        for (var tempMapId in maps) {
            var tempMapObj = maps[tempMapId];

            // Get the weight and order of the current map
            var weight = tempMapObj.weight;
            var tempMap = tempMapObj.map;

            if (weight > maxWeight) {
                currMap = tempMap;
            }
        }

        // Return the final map
        return currMap;
    });
    return retVal;
}