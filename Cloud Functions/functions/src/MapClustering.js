const storeFuncs = require('./StoreFuncs');
const dbLoading = require('./DBLoading');
const StoreObj = require('./StoreObj');

/**
 * calcStoreSimilarity
 * 
 * Calculate the similarity between the two given stores.
 * 
 * TODO: Update the algorithm of this store
 * 
 * @param {String} storeId1 The id of the first store
 * @param {String} storeId2 The id of the second store
 * 
 * @returns The similarity with 1 being the highest and 0 being the lowest
 */
function calcStoreSimilarity(database, storeId1, storeId2){
    if (storeId1 === storeId2) {
        return Promise.resolve(1);
    } else {
        var retVal = Promise.all([storeFuncs.getStoreFromId(database, storeId1), storeFuncs.getStoreFromId(database, storeId2)]).then((data) => {
            var store1 = data[0];
            var store2 = data[1];

            // Get the two stores' items
            var items1 = [];
            if (store1 !== null) {
                items1 = store1.items;
            }

            var items2 = [];
            if (store2 !== null) {
                items2 = store2.items;
            }

            var itemIntersect = [];
            var maxNumItems = 0;

            // Get the items common between both sets of items
            for (var itemId in items1){
                maxNumItems += 1;

                for (var itemId2 in items2){
                    if (itemId === itemId2) {
                        itemIntersect.push(itemId);
                    }
                }
            }

            var locs1 = [];
            var locs2 = [];

            // Calculate the similarity between the two items' locations
            for (var i = 0; i < itemIntersect.length; i++) {
                itemId = itemIntersect[i];

                // Get the location of both items in their respective stores
                locs1.push(storeFuncs.getItemLocInStore(database, storeId1, itemId));
                locs2.push(storeFuncs.getItemLocInStore(database, storeId2, itemId));
            }

            return Promise.all([locs1, locs2, itemIntersect, maxNumItems]);
        }).then((data) => {
            var locs1 = data[0];
            var locs2 = data[1];
            var itemIntersect = data[2];
            var maxNumItems = data[3];

            var similarity = 0;

            // Calculate the similarity between the two items' locations
            for (var i = 0; i < itemIntersect.length; i++) {
                itemId = itemIntersect[i];

                // Get the location of both items in their respective stores
                var loc1 = locs1[i];
                var loc2 = locs2[i];

                // Compare the departments and aisles
                var depComp = loc1.department === loc1.department ? 1 : 0;
                var aisleComp = loc1.aisleNum === loc2.aisleNum ? 1 : 0;

                // Calculate and update the similarity
                similarity += (0.8 * depComp) + (0.2 * aisleComp);
            }

            // Calculate the average similarity
            if (maxNumItems !== 0) {
                similarity = similarity / maxNumItems;
            }

            return(similarity);
        });

        return retVal;
    }
}

function calcMapSimilarity(refMap, compMap) {
    var score = 0;

    // Get departments unique to each map
    var refMapUnique = refMap.filter((e1) => {
        return compMap.indexOf(e1) < 0;
    });
    var compMapUnique = compMap.filter((e1) => {
        return refMap.indexOf(e1) < 0;
    });

    // remove unique departments from each map
    var refMapRem = refMap.filter((e1) => {
        return refMapUnique.indexOf(e1) < 0;
    });
    var compMapRem = compMap.filter((e1) => {
        return compMapUnique.indexOf(e1) < 0;
    });

    // Calculate the mean squared difference of each department location
    var meanDif = {};

    for (var i = 0; i < refMapRem.length; i++){
        var dep = refMapRem[i];
        if (!(dep in meanDif)) {
            meanDif[dep] = [i, -1];
        }
    }

    for (i = 0; i < compMapRem.length; i++){
        dep = compMapRem[i];
        if (meanDif[dep][1] === -1) {
            meanDif[dep][1] = i;
        }
    }

    for (var key in meanDif){
        var vals = meanDif[key];
        score += (vals[0] - vals[1]) ** 2;
    }

    if (refMapRem.length > 0) {
        score /= refMapRem.length;
    }
    
    //score += refMapUnique.length;
    //score += compMapUnique.length;

    return(score);

}

exports.cloudDetermineClusters = function(database) {
    var retVal = dbLoading.loadAllStores(database).then((ssv) => {        
        var maps = [];
        var names = [];

        for (var addr in ssv) {
            var storesAtAddr = ssv[addr];
            for (var storeName in storesAtAddr) {
                var store = new StoreObj.StoreObj(addr, storeName)
                var id = store.getId();

                maps.push(storeFuncs.getStoreMap(database, id));
                names.push(store.getDispName());
            }
        }

        return Promise.all([Promise.all(maps), Promise.all(names)]);
    }).then((data) => {
        var maps = data[0];
        var names = data[1];

        var compDict = {};

        for (var i = 0; i < maps.length; i++) {
            var name1 = names[i];
            compDict[name1] = {};

            for (var j = 0; j < maps.length; j++) {
                var name2 = names[j];
                var score = calcMapSimilarity(maps[i], maps[j]);
                compDict[name1][name2] = score;
            }
        }

        const desiredNumClusters = Math.sqrt(maps.length);

        var threshold = 0;
        
        var currNumClusters = Number.MAX_SAFE_INTEGER;
        var clusters = [];
        var mapClusters = [];
        while (currNumClusters > desiredNumClusters) {
            clusters.length = 0;
            mapClusters.length = 0;
            for (i = 0; i < maps.length; i++) {
                var refMap = maps[i];
                var inCluster = false;
                name1 = names[i];

                for (j = 0; j < maps.length; j++) {
                    var compMap = maps[j];
                    name2 = names[j];
                    score = compDict[name1][name2];

                    if ((score !== 0) && (score < threshold)) {
                        var found = false;
                        var k = 0;
                        while ((k < clusters.length) && (!found)){
                            if ((clusters[k].includes(name1)) && (!clusters[k].includes(name2))){
                                clusters[k].push(name2);
                                mapClusters[k].push(compMap);
                                found = true;
                            } else if ((!clusters[k].includes(name1)) && (clusters[k].includes(name2))){
                                clusters[k].push(name1);
                                mapClusters[k].push(refMap);
                                found = true;
                            } else if ((clusters[k].includes(name1)) && (clusters[k].includes(name2))){
                                found = true;
                            }
                            k += 1;
                        }

                        if (!found) {
                            var newCluster = [name1, name2];
                            clusters.push(newCluster);
                            mapClusters.push([refMap, compMap]);
                        }

                        inCluster = true;
                    }
                }

                if (!inCluster) {
                    clusters.push([name1]);
                    mapClusters.push(refMap);
                }
            }

            currNumClusters = clusters.length;
            threshold += 1;
        }

        threshold -= 1;

        var clusterMaps = [];

        for (var clusterInd = 0; clusterInd < clusters.length; clusterInd++) {
            var mapCount = {};

            var currCluster = clusters[clusterInd];

            for (var mapInd = 0; mapInd < currCluster.length; mapInd++) {
                var tempMap = currCluster[mapInd];

                var nameInd = names.indexOf(tempMap);
                tempMap = maps[nameInd];

                // Loop through all of the departments in the current map
                for (var depInd = 0; depInd < tempMap.length; depInd++) {
                    var dep = tempMap[depInd];

                    // Add the department to the map count object if
                    // it has not already been added
                    if (!(dep in mapCount)) {
                        mapCount[dep] = 0;
                    }

                    // Update the current departments count
                    mapCount[dep] = mapCount[dep] + depInd;
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

            clusterMaps.push(finalMap);

        }

        database.ref("/mapClusters/").set(clusterMaps);

        return clusters;
    });

    return retVal;
}

exports.cloudCalculateStoreSimilarities = function(database) {
    // Load the stores table
    var retVal = dbLoading.loadAllStores(database).then((knownStores) => {
        var storeIds = [];
        for (var tempAddress in knownStores){
            for (var tempStoreName in knownStores[tempAddress]){
                var tempStoreId = (new StoreObj.StoreObj(tempAddress, tempStoreName)).getId();
                storeIds.push(tempStoreId);
            }
        }

        var similarityDict = {};
        for (var i = 0; i < storeIds.length; i++) {
            var id1 = storeIds[i];
            similarityDict[id1] = {};
            for (var j = 0; j < storeIds.length; j++) {
                var id2 = storeIds[j];
                similarityDict[id1][id2] = null;
            }
        }

        var similarityList = [];
        for (i = 0; i < storeIds.length; i++) {
            id1 = storeIds[i];
            for (j = 0; j < storeIds.length; j++) {
                id2 = storeIds[j];

                var score = null;
                var check = similarityDict[id2][id1];
                if (check !== null) {
                    score = check;
                } else {
                    var temp = calcStoreSimilarity(knownStores, storeIds[i], storeIds[j]);
                    score = temp;
                }
                similarityDict[id1][id2] = score;
                similarityList.push(score);
            }
        }

        return Promise.all([Promise.all(similarityList), Promise.all(storeIds)]);
    }).then((data) => {
        var similarityList = data[0];
        var storeIds = data[1];

        var listInd = 0;
        var similarityDict = {};
        for (var i = 0; i < storeIds.length; i++) {
            var id1 = storeIds[i];
            similarityDict[id1] = {};
            for (var j = 0; j < storeIds.length; j++) {
                var id2 = storeIds[j];
                similarityDict[id1][id2] = similarityList[listInd];
                listInd += 1;
            }
        }

        database.ref("/storeSimilarities/").update(similarityDict);

        return {
            similarities: similarityDict
        }
    });

    return retVal;
}

exports.cloudUpdateStoreSimilarities = function(database, address, storeName) {
    // Load the stores table
    var retVal = Promise.all([dbLoading.loadAllStores(database), dbLoading.loadStoreSimilarities(database)]).then((data) => {
        var knownStores = data[0];
        var similarityDict = data[1];

        var idToUpdate = (new StoreObj.StoreObj(address, storeName)).getId();

        var storeIds = [];
        for (var tempAddress in knownStores){
            for (var tempStoreName in knownStores[tempAddress]){
                var tempStoreId = (new StoreObj.StoreObj(tempAddress, tempStoreName)).getId();
                storeIds.push(tempStoreId);
            }
        }

        var similarityList = [];
        for (i = 0; i < storeIds.length; i++) {
            var refId = storeIds[i];
            var score = calcStoreSimilarity(knownStores, refId, idToUpdate);
            similarityList.push(score);
        }

        return Promise.all([Promise.all(similarityList), Promise.all(storeIds), similarityDict, idToUpdate]);
    }).then((data) => {
        var similarityList = data[0];
        var storeIds = data[1];
        var similarityDict = data[2];
        var idToUpdate = data[3];

        var listInd = 0;
        for (var idInd = 0; idInd < storeIds.length; idInd++) {
            var refId = storeIds[idInd];

            var score = similarityList[listInd];

            similarityDict[refId][idToUpdate] = score;
            similarityDict[idToUpdate][refId] = score;

            listInd += 1;
        }

        database.ref("/storeSimilarities/").update(similarityDict);

        return {
            similarities: similarityDict
        }
    });

    return retVal;
}

/**
 * cloudModStoreWeights
 * 
 * Updates the weights of each map for the given store
 * based on how similar the map is to the given map.
 * Difference metric is based on the departments unique
 * to the current map and given map. The metric is also
 * based on the order of the common departments.
 * 
 * @param {Database} database The database containing all of the information
 * @param {String} storeId The id of the store
 * @param {String} itemId The id of the item
 * 
 * @returns None 
 */
exports.cloudModStoreWeights = function(data, context, database) {
    var address = data.address;
    var storeName = data.storeName;
    var refMap = data.map;

    // Get the path to the store
    var store = new StoreObj.StoreObj(address, storeName);
    var storePath = store.getPath();
    var storeId = store.getId();

    // Get the current state of the store's maps
    var retVal = dbLoading.loadStoresMaps(database, storeId).then((ssv) => {
        // Calculate the max score
        var maxScore = 0;
        var start = refMap.length - 1;
        while (start >= 0) {
            maxScore += start * start;
            start -= 2;
        }

        // Loop through all of the store's maps
        for (var tempMapId in ssv) {
            var tempMapObj = ssv[tempMapId];

            // Get the weight and order of the current map
            var weight = tempMapObj.weight;
            var compMap = tempMapObj.map;
            var timesChecked = tempMapObj.timesChecked;

            if ((timesChecked === undefined) || (timesChecked === null)) {
                timesChecked = 1;
            }

            var score = calcMapSimilarity(refMap, compMap);

            // Calculate the new value
            var newVal = 1 - (score / maxScore);
            if (newVal < 0) {
                newVal = 0;
            }

            // Calculte the new weight
            timesChecked += 1;
            var newWeight = (weight * (timesChecked - 1) + newVal) / timesChecked;

            console.log(timesChecked, weight, newVal);

            // Save the new data
            database.ref(storePath + "maps/" + tempMapId).update({
                map: compMap,
                weight: newWeight,
                timesChecked: timesChecked
            });
        }
        
        // Return the final map
        return true;
    });

    return retVal;
}