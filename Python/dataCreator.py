import random
import yaml
import json
import numpy as np

import StoreObj
import DepartmentObj
import AisleObj
import ItemLocObj
import ItemObj

GEN_FILE_PATH = "./"
FILE_NAME = GEN_FILE_PATH + "GeneratedData"
YAML_EXTENSION = ".yaml"
JSON_EXTENSION = ".json"

"""
normSumOne
Normalizes the integers in the list such that
the items add up to a total of 1
@input  listToNorm  The list of integers to normalize
@return The normalized list
"""
def normSumOne(listToNorm):
    s = sum(listToNorm)
    newList = [float(i) / s for i in listToNorm]

    return(newList)

"""
getNItemsFromList
Returns a list of random elements from the given list.
Can control whether or not to grab duplicate elements.
Additionally, can control the probability of grabbing each
independent item. Casts the items in the list to strings
by default.
@input  itemList    The list of items
@input  numElems    The number of elements to retrieve from the list
@input  getDups     Whether or not to get duplicate items (defualt = False)
@input  probs       The probability to grap each independent item
                    If None, assumes equal probability (defualt = None)
@input  elemType    The type to cast each item in the list to (default = str)
@return List of retrieved elements
"""
def getNItemsFromList(itemList, numElems, getDups=False, probs=None, elemType=str):
    # If probabilities were not given, assume equal probability
    if probs == None:
        probs = normSumOne([1] * len(itemList))

    # Get the random elements, and cast to lise of desired type
    items = np.random.choice(itemList, numElems, replace=getDups, p=probs)
    items = list(items)
    items = [elemType(item) for item in items]

    return(items)

"""
getRandInRange
Returns a random integer in the given range
@input  intRange    The range to retrieve from [min, max]
@return A random integer in the given range
"""
def getRandInRange(intRange):
    return(random.randint(intRange[0], intRange[1]))

"""
genNames
Returns a number of generated names using the given pattern.
The names are of the format $pattern_$integer
@input  pattern     The pattern to generate names from
@input  numItems    The number of names to generate
@return A list of the generated names
"""
def genNames(pattern, numItems):
    names = []

    for i in range(numItems):
        name = pattern + "_" + str(i)
        names.append(name)

    return(names)

"""
genData
Generates a dictionary of grocery store data. Uses the
input parameters to control the number of possible
items, departments, and stores. The storeSizeInfo
is used to control the sizing of each individual store.
This is a dictionary that controls the number of items in
each aisle, number of aisle in each department, and number
of departments in each store. The itemLocInfo controls how
many possible departments each item can be found in.
@input  sizeItemPool    The size of the pool of items to use
@input  sizeDepPool     The size of the pool of departments to use
@input  sizeStorePool   The size of the pool of store to use
@input  storeSizeInfo   The dictionary describing the possible sizes for each store
@input  itemLocInfo     The dictionary describing the possible locations for each item
@return The generated data
"""
def genData(sizeItemPool, sizeDepPool, sizeStorePool, storeSizeInfo, itemLocInfo):
    # Generate the pool of information using the given sizes
    itemPool = genNames("ITEM", sizeItemPool)
    depPool = genNames("DEPARTMENT", sizeDepPool)
    storePool = genNames("STORE", sizeStorePool)

    # Get the weights for each item location
    departmentWeights = itemLocInfo["DEPARTMENT_LOC_WEIGHTS"] 

    # For each item in the pool,
    # generate the possible locations that item can
    # be found in
    itemMap = {}
    tracker = [[dep, 0] for dep in depPool]
    for item in itemPool:
        # Get the possible departments the item can be found in
        tracker.sort(key=lambda x: x[1])

        # Add the item to each of its departments dictionaries
        for i in range(len(departmentWeights)):
            department = tracker[i][0]

            # Initialize the dictionary if it has not been
            if department not in itemMap:
                itemMap[department] = {}
                itemMap[department]["ITEMS"] = []
                itemMap[department]["PROBABILITIES"] = []

            # Add the item and its probabilities to the lists
            itemMap[department]["ITEMS"].append(item)
            itemMap[department]["PROBABILITIES"].append(departmentWeights[i])

            tracker[i][1] += 1

    # Normalize each probability list
    for department in itemMap:        
        itemMap[department]["PROBABILITIES"] = normSumOne(itemMap[department]["PROBABILITIES"])

    data = {}
    # Initialize the store information using the given information dictionary
    for store in storePool:
        # Determine the size of the store
        size = getNItemsFromList(list(storeSizeInfo.keys()), 1)[0]

        # Determine the departments for the store
        departments = getNItemsFromList(depPool,
                                        getRandInRange(storeSizeInfo[size]["DEPARTMENTS_PER_STORE"]))

        # Generate the aisles for each department
        aisleCount = 0
        for dep in departments:
            # Generate the number of aisles in the department
            numAisles = getRandInRange(storeSizeInfo[size]["AISLES_PER_DEPARTMENT"])

            # Populate the dictionary
            for _ in range(numAisles):
                # Initialize the store dictionary
                if store not in data:
                    data[store] = {}
                    data[store]["DEPARTMENTS"] = {}
                    data[store]["SIZE"] = size

                # Initialize the department dictionary
                if dep not in data[store]:
                    data[store]["DEPARTMENTS"][dep] = {}

                # Generate the aisle name
                aisleName = "AISLE_" + str(aisleCount)

                # Initialize the aisle list
                if aisleName not in data[store]["DEPARTMENTS"][dep]:
                    data[store]["DEPARTMENTS"][dep][aisleName] = []

                aisleCount += 1

    # Populate each aisle in the dictionary with items
    for store in data:
        itemsInStore = []

        # Get the size of the store and number of items in each aisle
        size = data[store]["SIZE"]
        itemsPerAisle = getRandInRange(storeSizeInfo[size]["ITEMS_PER_AISLE"])

        # Populate each department
        for department in data[store]["DEPARTMENTS"]:
            # Calculate the total number of items in the department
            numberOfAisles = len(data[store]["DEPARTMENTS"][department].keys())            
            numItems = itemsPerAisle * numberOfAisles

            # Get the list of possible items and their probabiltiies
            possibleItems = itemMap[department]["ITEMS"]
            probabilities = itemMap[department]["PROBABILITIES"]

            # Remove all items and their respective probabilities
            # for each item already in the store
            temp = zip(possibleItems, probabilities)
            noDups = [item for item in temp if item[0] not in itemsInStore]
            possibleItems, probabilities = list(zip(*(noDups)))

            # Normalize the probabilities
            probabilities = normSumOne(probabilities)

            # Get the items from the list
            items = getNItemsFromList(possibleItems, numItems, probs=probabilities)

            # Add the items to the aisle lists
            i = 0
            for aisle in data[store]["DEPARTMENTS"][department]:
                for _ in range(itemsPerAisle):
                    data[store]["DEPARTMENTS"][department][aisle].append(items[i])
                    i += 1

            # Save the added items
            itemsInStore += items

    return(data)

"""
genWithDups
Uses a store size info library more likely
to generate stores with duplicate items.
@input  None
@return None
"""
def genWithDups():
    sizeItemPool = 200
    sizeDepPool = 10
    sizeStorePool = 10

    """
    ITEMS_PER_AISLE = Range of number of items in each aisle
    AISLES_PER_DEPARTMENT = Range of number of aisles in each department
    DEPARTMENTS_PER_STORE = Range of number of departments in each store
    """
    storeSizeInfo = {
        "SMALL" : {
            "ITEMS_PER_AISLE" : [10, 10],
            "AISLES_PER_DEPARTMENT" : [1, 1],
            "DEPARTMENTS_PER_STORE" : [7, 7]
        }
    }

    """
    DEPARTMENT_LOC_WEIGHTS = Weight of each possible department for the items
    """
    itemLocInfo = {
        "DEPARTMENT_LOC_WEIGHTS" : [0.9, 0.1]
    }

    # Generate the data
    data = genData(sizeItemPool, sizeDepPool, sizeStorePool, storeSizeInfo, itemLocInfo)

    return(data)    

def defaultGen():
    sizeItemPool = 5600
    sizeDepPool = 20
    sizeStorePool = 20
    """
    ITEMS_PER_AISLE = Range of number of items in each aisle
    AISLES_PER_DEPARTMENT = Range of number of aisles in each department
    DEPARTMENTS_PER_STORE = Range of number of departments in each store
    """
    storeSizeInfo = {
        "SMALL" : {
            "ITEMS_PER_AISLE" : [5, 10],
            "AISLES_PER_DEPARTMENT" : [1, 1],
            "DEPARTMENTS_PER_STORE" : [5, 7]
        },
        "MEDIUM" : {
            "ITEMS_PER_AISLE" : [20, 40],
            "AISLES_PER_DEPARTMENT" : [1, 3],
            "DEPARTMENTS_PER_STORE" : [8, 12]
        },
        "LARGE" : {
            "ITEMS_PER_AISLE" : [30, 70],
            "AISLES_PER_DEPARTMENT" : [2, 4],
            "DEPARTMENTS_PER_STORE" : [10, 20]
        }
    }
    """
    DEPARTMENT_LOC_WEIGHTS = Weight of each possible department for the items
    """
    itemLocInfo = {
        "DEPARTMENT_LOC_WEIGHTS" : [0.9, 0.1]
    }
    # Generate the data
    data = genData(sizeItemPool, sizeDepPool, sizeStorePool, storeSizeInfo, itemLocInfo)

    return(data)

"""
loadInfo
Loads the yaml file at the given path and
places the data in a dictionary in the
format that the algorithm needs.
@input  pathToYaml  The path to the yaml file to parse
@return A list of the stores parsed from the yaml file
"""
def loadInfo(pathToYaml):
    data = {}

    # Write the generated data to a yaml file
    with open(pathToYaml, "r") as f:
        data = yaml.load(f, yaml.SafeLoader)

    stores = []

    for storeName in data:
        store = StoreObj.Store(storeName)

        for departmentName in data[storeName]["DEPARTMENTS"]:
            department = DepartmentObj.Department(departmentName)

            for aisleNum in data[storeName]["DEPARTMENTS"][departmentName]:
                num = int(aisleNum.split("_")[1])
                aisle = AisleObj.Aisle(num, [])                

                for itemName in data[storeName]["DEPARTMENTS"][departmentName][aisleNum]:
                    loc = ItemLocObj.ItemLoc(store, department, aisle)
                    item = ItemObj.Item(itemName, loc)

                    aisle.addItem(item)

                department.addAisle(aisle)

            store.addDepartment(department)

        stores.append(store)

    return(stores)

if __name__ == "__main__":
    data = genWithDups()

    # Write the generated data to a yaml file
    with open(FILE_NAME + YAML_EXTENSION, "w") as f:
        yaml.dump(data, f, sort_keys=False)

    # Write the generated data to a json file
    with open(FILE_NAME + JSON_EXTENSION, "w") as f:
        json.dump(data, f)