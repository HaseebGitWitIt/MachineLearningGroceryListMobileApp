import copy
import collections

import GrocListObj
import ItemObj
import StoreObj
import LocPredictor
import DataCreator

"""
reorgGrocListAlpha

Reorganizes the given list in alphabetical order

@input  grocItems   The GrocListObj to sort
@input  store   The store the user is in
@input  knownStore  The list of known stores

@return The sorted list
"""
def reorgGrocListAlpha(grocItems, store, knownStores):
    items = copy.copy(grocItems.getItems())
    items = sorted(items, key=lambda x: x.getName())
    finalDict = {"ITEMS" : items}
    return(finalDict)

"""
reorgGrocListLoc

Reorganizes the given list based on the location
of the items in the store

@input  grocItems   The GrocListObj to sort
@input  store   The store the user is in
@input  knownStore  The list of known stores

@return The sorted list
"""
def reorgGrocListLoc(grocItems, store, knownStores):
    items = grocItems.getItems()

    # Get the location of all items in the store
    for item in items:
        item.setLoc(LocPredictor.predictLoc(knownStores, store, item.getName()))

    # Group the items based on their locations
    locDict = {}
    for item in items:
        itemName = item.getName()
        itemLoc = item.getLoc()

        dep = str(itemLoc.getDepartment().getName())
        aisle = str(itemLoc.getAisle().getNumber())

        if dep not in locDict:
            locDict[dep] = {}

        if aisle not in locDict[dep]:
            locDict[dep][aisle] = []

        locDict[dep][aisle].append(itemName)

    finalDict = collections.OrderedDict()

    deps = list(locDict.keys())
    sortedDeps = sorted(deps)

    for dep in sortedDeps:
        finalDict[dep] = collections.OrderedDict()

        aisles = list(locDict[dep].keys())
        sortedAisles = sorted(aisles)
        for aisle in sortedAisles:
            finalDict[dep][aisle] = sorted(locDict[dep][aisle])

    return(finalDict)

"""
reorgGrocListFastest

Reorganizes the given list to put the items
in their fastest order

@input  grocItems   The GrocListObj to sort
@input  store   The store the user is in
@input  knownStore  The list of known stores

@return The sorted list
"""
def reorgGrocListFastest(grocItems, store, knownStores):
    # Reorganize the list based on the item's locations
    dictList = reorgGrocListLoc(grocItems, store, knownStores)

    grocDepartments = list(dictList.keys())

    storeDepartments = store.getDepartments()
    storeDepartments = [department.getName() for department in storeDepartments]

    finalDict = collections.OrderedDict()

    # Sort the groupings based on the map
    for department in storeDepartments:
        if department in grocDepartments:
            finalDict[department] = dictList[department]
            grocDepartments.remove(department)

    for department in grocDepartments:
        finalDict[department] = dictList[department]

    return(finalDict)

if __name__ == "__main__":
    knownStores = DataCreator.loadInfo("GeneratedData.yaml")

    testList = GrocListObj.GrocList("Test List")

    """
    Original
    testList.addItem(ItemObj.Item("ITEM_123", None))
    testList.addItem(ItemObj.Item("ITEM_192", None))
    testList.addItem(ItemObj.Item("ITEM_58", None))
    testList.addItem(ItemObj.Item("ITEM_138", None))
    testList.addItem(ItemObj.Item("ITEM_199", None))
    testList.addItem(ItemObj.Item("ITEM_94", None))
    testList.addItem(ItemObj.Item("ITEM_165", None))
    """

    testList.addItem(ItemObj.Item("ITEM_58", None))
    testList.addItem(ItemObj.Item("ITEM_123", None))
    testList.addItem(ItemObj.Item("ITEM_94", None))
    testList.addItem(ItemObj.Item("ITEM_138", None))
    testList.addItem(ItemObj.Item("ITEM_165", None))
    testList.addItem(ItemObj.Item("ITEM_199", None))
    testList.addItem(ItemObj.Item("ITEM_192", None))

    testStore = knownStores[0]

    alphaList = reorgGrocListAlpha(testList, testStore, knownStores)
    print("Sorted alphabetically:")
    for item in alphaList["ITEMS"]:
        print("\t" + str(item))

    print("\n")

    locList = reorgGrocListLoc(testList, testStore, knownStores)
    print("Sorted by location:")
    for dep in locList:
        print("\t" + str(dep))
        for aisle in locList[dep]:
            print("\t\t" + str(aisle))
            for item in locList[dep][aisle]:
                print("\t\t\t" + str(item))

    print("\n")

    fastList = reorgGrocListFastest(testList, testStore, knownStores)
    print("Sorted in fastest:")
    for dep in fastList:
        print("\t" + str(dep))
        for aisle in fastList[dep]:
            print("\t\t" + str(aisle))
            for item in fastList[dep][aisle]:
                print("\t\t\t" + str(item))