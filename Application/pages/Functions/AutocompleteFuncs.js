import * as firebase from "firebase";

const globalComps = require('./GlobalComps');

/**
 * cloudLoadAvailableStores
 * 
 * Loads all available stores. Available stores
 * are all known stores. Saves each stores ids and
 * their display names.
 * 
 * @param {Object}  data    The object containing the inputted data
 * @param {Component} context   The context of the caller
 * @param {Database}    database    The database to save the data to
 * 
 * @returns The ids and names of each store
 */
export function cloudLoadAvailableStores() {
    // Parse the stores table
    var ref = firebase.database().ref('/stores');
    var retItems = ref.once('value').then((snapshot) => {
       var storeTitles = [];
       var storeIds = [];
       var storeAddrs = [];
       var storeNames = [];
 
       var ssv = snapshot.val();
       if (ssv) {
          for (var tempAddress in ssv) {
             for (var tempStoreName in ssv[tempAddress]) {
                // Create a Store object corresponding to the current address and name
                var tempStore = new globalComps.StoreObj(tempAddress, tempStoreName);
 
                // Get the store ID and display name
                var storeId = tempStore.getId();
                var dispName = tempStore.getDispName();
 
                // Save the name and id
                storeTitles.push(dispName);
                storeIds.push(storeId);
                storeAddrs.push(tempAddress);
                storeNames.push(tempStoreName);
             }
          }
       }
 
       // Return the parsed data
       return {
          ids: storeIds,
          titles: storeTitles,
          addrs: storeAddrs,
          names: storeNames
       };
    });
 
    return retItems;
 }
 
 /**
  * cloudLoadAvailableItems
  * 
  * Loads all available items. Available items
  * are all known items. Saves each items ids, their display names,
  * generic names, and specific name.
  * 
  * @param {Object}  data    The object containing the inputted data
  * @param {Component} context   The context of the caller
  * @param {Database}    database    The database to save the data to
  * 
  * @returns The ids and names of each item
  */
 export function cloudLoadAvailableItems() {
    // Parse the items table
    var ref = firebase.database().ref('/items');
    var retItems = ref.once('value').then((snapshot) => {
       var dispNames = [];
       var itemIds = [];
       var genNames = [];
 
       var ssv = snapshot.val();
 
       if (ssv) {
          for (var tempName in ssv) {
            // Create a Store object corresponding to the current generic and specific names
            var tempItem = new globalComps.ItemObj(tempName);

            // Get the item ID and display name
            var itemId = tempItem.getId();
            var itemName = tempItem.getDispName();

            // Save the names and id
            dispNames.push(itemName);
            itemIds.push(itemId);
            genNames.push(tempName);
          }
       }
 
       // Return the parsed data
       return {
          ids: itemIds,
          items: dispNames,
          genNames: genNames
       };
    });
 
    return retItems;
 } 