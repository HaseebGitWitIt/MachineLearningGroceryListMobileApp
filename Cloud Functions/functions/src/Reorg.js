const storeFuncs = require('./StoreFuncs');
const dbLoading = require('./DBLoading');

function checkForNoneType(val) {
    if ((val === null) || (val === undefined)) {
        return true;
    } else {
        return false;
    }
}

function sortList(database, listId, storeId, cluster, sortFunction) {
    var retVal = Promise.all([dbLoading.loadStoreSimilarities(database), dbLoading.loadList(database, listId, true)]).then((data) => {
        var storeSimilarities = data[0];
        var list = data[1];

        var items = [];
        var ids = [];

        // Get all of the items and their ids in the list
        if (list && list.items) {
            for (var item in list.items) {
                items.push(list.items[item]);
                ids.push(item);
            }
        }

        console.log(ids);

        // Get the locations of all items in the store
        var predictedLocs = [];
        for (var i = 0; i < ids.length; i++) {
            loc = storeFuncs.predictItemLoc(database, storeSimilarities, storeId, ids[i]);
            predictedLocs.push(loc);  
        }

        // Get the store map
        var map = null

        if (cluster === null) {
            map = storeFuncs.getStoreMap(database, storeId);
        } else {
            map = cluster;
        }

        return Promise.all([map, Promise.all(predictedLocs), Promise.all(items), Promise.all(ids)]);
    }).then((data) => {
        var map = data[0];
        var predictedLocs = data[1];
        var items = data[2];
        var ids = data[3];

        // Copy all of the needed location information
        locs = [];
        for (i = 0; i < predictedLocs.length; i++) {
            var loc = predictedLocs[i];

            locs.push({
                item: items[i],
                id: ids[i],
                department: loc.department,
                aisleNum: loc.aisleNum,
                aisleTags: loc.aisleTags,
                known: loc.known
            })
        }

        // Group and sort the locations based on their
        // departments and aisle numbers
        locs.sort((a, b) => sortFunction(a, b, map));

        // Get just the item names and ids
        items = [];
        ids = [];
        retLocs = [];
        unknownItems = [];
        for (i = 0; i < locs.length; i++) {
            item = locs[i].item;
            var id = locs[i].id;
            var dep = locs[i].department;

            items.push(item);
            ids.push(id);
            retLocs.push(dep);

            if (dep === null) {
                unknownItems.push(item);
            }
        }

        // Return the information
        return {
            items: items,
            ids: ids,
            locs: retLocs,
            unknownItems: unknownItems,
            map: map
        };
    });

    return retVal;
}

/**
 * cloudReorgListLoc
 * 
 * Reorganize the given list based on
 * the locations of the items in the store.
 * Predicts locations as needed.
 * the groupings of items are then sorted based
 * on the alphabetical order of the department titles.
 * 
 * @param {Object}  data    The object containing the inputted data
 * @param {Component} context   The context of the caller
 * @param {Database}    database    The database to save the data to
 * 
 * @returns The new order of the items and ids
 */
exports.cloudReorgListLoc = function(data, context, database) {
    // Parse the data object
    var listId = data.listId;
    var storeId = data.storeId;
    var cluster = data.cluster;

    var sortFunc = function(a, b, map) {
        var depA, depB;
        var aisleA, aisleB;

        depA = a.department;
        depB = b.department;

        aisleA = a.aisleNum;
        aisleB = b.aisleNum;

        console.log(depA, depB);

        if ((depA < depB) || checkForNoneType(depB)) {
                return -1;
        } else if ((depA > depB) || checkForNoneType(depA)) {
                return 1;
        } else {
            if ((aisleA - aisleB < 0) || checkForNoneType(aisleB)) {
                return - 1;
            } else if ((aisleA - aisleB > 0) || checkForNoneType(aisleA)) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    return sortList(database, listId, storeId, cluster, sortFunc);
}

/**
 * cloudReorgListFastest
 * 
 * Reorganize the given list based on
 * the fastest path through the store.
 * Predicts locations as needed.
 * 
 * @param {Object}  data    The object containing the inputted data
 * @param {Component} context   The context of the caller
 * @param {Database}    database    The database to save the data to
 * 
 * @returns The new order of the items and ids
 */
exports.cloudReorgListFastest = function(data, context, database) {
    // Parse the data object
    var storeId = data.storeId;
    var listId = data.listId;
    var cluster = data.cluster;

    var sortFunc = function(a, b, map) {
        var nameA, nameB;
        var depA, depB;
        var aisleA, aisleB;
        var depIndA, depIndB;

        nameA = a.item.name;
        nameB = b.item.name;

        depA = a.department;
        depB = b.department;

        aisleA = a.aisleNum;
        aisleB = b.aisleNum;

        // Get the department locations in the map
        depIndA = Object.keys(map).find(key => map[key] === depA);
        depIndB = Object.keys(map).find(key => map[key] === depB);

        if ((depIndA - depIndB < 0) || checkForNoneType(depIndB)) {
            return -1;
        } else if ((depIndA - depIndB > 0) || checkForNoneType(depIndA)) {
            return 1;
        } else {
            if (depIndA === -1) {
                if ((depIndA - depIndB < 0) || checkForNoneType(depIndB)) {
                    return -1;
                } else if ((depIndA - depIndB > 0) || checkForNoneType(depIndA)) {
                    return 1;
                }
            }

            if ((aisleA - aisleB < 0) || checkForNoneType(aisleB)) {
                return - 1;
            } else if ((aisleA - aisleB > 0) || checkForNoneType(aisleA)) {
                return 1;
            } else {
                if ((nameA < nameB) || checkForNoneType(nameB)) {
                    return -1;
                } else if ((nameA > nameB) || checkForNoneType(nameA)) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }

    return sortList(database, listId, storeId, cluster, sortFunc);
} 