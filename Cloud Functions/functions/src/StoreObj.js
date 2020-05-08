/**
 * StoreObj
 * 
 * A store object used to format the various paths
 * and ids for stores.
 */
exports.StoreObj = class {
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
        return(storePath);
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
        return(storeId);
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
        return(storeName);

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