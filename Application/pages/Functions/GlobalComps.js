import * as firebase from "firebase";

/**
 * ItemObj
 * 
 * An item object used to format the various paths
 * and ids for items.
 */
class ItemObj {
    /**
     * constructor
     * 
     * Creates a new item object
     * 
     * @param {String} name The generic name of the object
     * 
     * @returns None
     */
    constructor(name) {
        this.name = name;
    }

    /**
     * getPath
     * 
     * Returns the expected path to the item.
     * Path is:
     *  /items/${genericName}/${specificName}/
     * 
     * @param   None
     * 
     * @returns The path to the item
     */
    getPath() {
        var itemPath = "/items/" + this.name + "/";
        return (itemPath);
    }

    /**
     * getId
     * 
     * Returns the expected id of the item.
     * The name is:
     *  ${genericName}&${specificName}
     * 
     * @param   None
     * 
     * @returns The id of the item
     */
    getId() {
        var itemId = this.name;
        return (itemId);
    }

    /**
     * getDispName
     * 
     * Returns the name of this item to display to the user.
     * The name is:
     *  ${genericName} (${specificName})
     * 
     * @param   None
     * 
     * @returns The display name of the item
     */
    getDispName() {
        return (this.name);

    }

    /**
     * getInfoFromId
     * 
     * Returns the item data corresponding to the
     * given id
     * 
     * @param {String} id The id of the item
     * 
     * @returns The data of the item
     */
    static getInfoFromId(id) {
        return {
            name: id
        }
    }
}

/**
 * StoreObj
 * 
 * A store object used to format the various paths
 * and ids for stores.
 */
class StoreObj {
    /**
     * constructor
     * 
     * Creates a new store object
     * 
     * @param {String} address The address of the object
     * @param {String} storeName The store name of the object
     *                           default is null
     * 
     * @returns None
     */
    constructor(address, storeName) {
        this.address = address;
        this.storeName = storeName;
    }

    /**
     * getPath
     * 
     * Returns the expected path to the store.
     * Path is:
     *  /stores/${address}/${storeName}/
     * 
     * @param   None
     * 
     * @returns The path to the store
     */
    getPath() {
        var storePath = "/stores/" + this.address + "/" + this.storeName + "/";
        return (storePath);
    }

    /**
     * getId
     * 
     * Returns the expected id of the store.
     * The name is:
     *  ${address}&${storeName}
     * 
     * @param   None
     * 
     * @returns The id of the store
     */
    getId() {
        var storeId = this.address + "&" + this.storeName;
        return (storeId);
    }

    /**
     * getDispName
     * 
     * Returns the name of this store to display to the user.
     * The name is:
     *  ${storeName} - ${address}
     * 
     * @param   None
     * 
     * @returns The display name of the store
     */
    getDispName() {
        var storeName = this.storeName + " - " + this.address;
        return (storeName);

    }

    /**
     * getInfoFromId
     * 
     * Returns the store data corresponding to the
     * given id
     * 
     * @param {String} id The id of the store
     * 
     * @returns The data of the store
     */
    static getInfoFromId(id) {
        var parts = id.split("&");
        return {
            address: parts[0],
            storeName: parts[1]
        }
    }
}

/**
 * getItem
 * 
 * Retrives the item object from the given database
 * corresponding to the given generic name and specific name.
 * 
 * @param {String} name The generic name of the item
 * 
 * @returns The item object corresponding to the given data
 *          Null if no item found
 */
const getItem = function(name) {
    var itemInfo = firebase.database().ref("/items").once("value").then((snapshot) => {
        var ssv = snapshot.val();
        var item = null;

        // Parse the item table for the item
        for (var tempName in ssv) {
            if (tempName.toUpperCase() === name.toUpperCase()) {
                // Item found
                item = ssv[tempName];

                // Get the final price of the item by
                // parsing all of the known prices from teh descriptions
                var minPrice = Number.MAX_SAFE_INTEGER;
                var maxPrice = -1;
                if (item !== null) {
                    var descs = item.descs;
                    for (var currDescId in descs) {
                        // Parse each description
                        var currDesc = descs[currDescId];
                        var prices = currDesc.prices;
                        if (prices) {
                            for (var priceId in prices) {
                                // Update the price range with the new information
                                var currPrice = prices[priceId];
                                if (currPrice < minPrice) {
                                    minPrice = currPrice;
                                }

                                if (currPrice > maxPrice) {
                                    maxPrice = currPrice;
                                }
                            }
                        }
                    }
                }

                if (maxPrice != -1) {
                    // Add the final price range to the item
                    item.finalPrice = {
                        minPrice: minPrice,
                        maxPrice: maxPrice
                    }
                } else {
                    item.finalPrice = {}
                }
            }
        }

        return {
            item: item
        }
    });

    return itemInfo;
}

/**
 * getStore
 * 
 * Retrives the store object from the given database
 * corresponding to the given store name and address.
 * 
 * @param {String} storeName The name of the store
 * @param {String} address The address of the store
 * 
 * @returns The store object, null if not found
 */
const getStore = function (storeName, address) {
    var storeInfo = firebase.database().ref("/stores").once("value").then((snapshot) => {
        var ssv = snapshot.val();
        var store = null;

        // Parse the store table
        for (var tempAddress in ssv) {
            if (tempAddress === address) {
                // Address subtable found
                var temp = ssv[tempAddress];

                for (var tempStoreName in temp) {
                    if (tempStoreName === storeName) {
                        // Store found
                        store = ssv[tempAddress][tempStoreName];
                        break;
                    }
                }
                break;
            }
        }

        return {
            store: store
        }
    });

    return storeInfo;
}

exports.ItemObj = ItemObj;
exports.StoreObj = StoreObj;
exports.getItem = getItem;
exports.getStore = getStore;