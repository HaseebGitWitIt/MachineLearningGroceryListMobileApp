const StoreObj = require('./StoreObj');

var dbCache = resetCache();

function resetCache() {
    var clearCache = {
        storesMaps: {},
        stores: null,
        storeSimilarities: null,
        lists: {}
    }

    return clearCache;
}

exports.clearCache = function() {
    dbCache = resetCache();
}

exports.clearStoresMapsCache = function(storeId) {
    // Get the store's info from the id
    var info = StoreObj.StoreObj.getInfoFromId(storeId);
    var address = info.address;
    var storeName = info.storeName;

    // Get the path to the store
    var storePath = (new StoreObj.StoreObj(address, storeName)).getPath();
    
    delete dbCache.storesMaps[storePath];

}

exports.clearStoresCache = function() {
    dbCache.stores = null;
}

exports.clearStoreSimilaritiesCache = function() {
    dbCache.storeSimilarities = null;
}

exports.clearListsCache = function(listId) {
    delete dbCache.lists[listId];
}

exports.loadStoresMaps = async function(database, storeId, forceReload = false) {
    // Get the store's info from the id
    var info = StoreObj.StoreObj.getInfoFromId(storeId);
    var address = info.address;
    var storeName = info.storeName;

    // Get the path to the store
    var storePath = (new StoreObj.StoreObj(address, storeName)).getPath();

    if ((!(storePath in dbCache.storesMaps)) || forceReload) {
        // Get the current state of the store's maps
        var dbMap = database.ref(storePath + "maps").once("value").then((snapshot) => {
            var val = snapshot.val();
            dbCache.storesMaps[storePath] = val;
            return val;
        });
        dbCache.storesMaps[storePath] = dbMap;
        return dbMap;
    } else {
        return Promise.resolve(dbCache.storesMaps[storePath]);
    }
}

exports.loadAllStores = function(database, forceReload = false) {
    if ((dbCache.stores === null) || forceReload) {
        // Load the stores table
        var dbStores = database.ref('/stores').once('value').then((snapshot) => {
            var val = snapshot.val()
            dbCache.stores = val;
            return val;
        });
        dbCache.stores = dbStores;
        return dbStores;
    } else {
        return Promise.resolve(dbCache.stores);
    }
}

exports.loadStoreSimilarities = function(database, forceReload = false) {
    if ((dbCache.storeSimilarities === null) || forceReload) {
        // Load the stores table
        var dbStoreSimilarities = database.ref("/storeSimilarities").once("value").then((snapshot) => {
            var val = snapshot.val();
            dbCache.storeSimilarities = val;
            return val;
        });
        dbCache.storeSimilarities = dbStoreSimilarities;
        return dbStoreSimilarities;
    } else {
        return Promise.resolve(dbCache.storeSimilarities);
    }
}

exports.loadList = function(database, listId, forceReload = false) {
    if ((!(listId in dbCache.lists)) || forceReload) {
        var dbList = database.ref('/lists/' + listId).once('value').then((snapshot) => {
            var val = snapshot.val();
            dbCache.lists[listId] = val;
            return val;
        });
        dbCache.lists[listId] = dbList;
        return dbList;
    } else {
        return Promise.resolve(dbCache.lists[listId]);
    }
}