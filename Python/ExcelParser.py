import re
import xlrd
from xlrd.sheet import ctype_text
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import copy
import json

"""
Item Needs:
    - Generic Name *
    - Specific Name
    - Size
    - Size Unit
    - Price
Store Needs:
    - Store Name *
    - Address *
    - Map *
    - Franchise Name
Location Needs:
    - Generic Name
    - Specific Name
    - Store Name
    - Address
    - Aisle Number
    - Item Department
"""

filename = "../Item Information (Manual Data Collection).xlsx"
storeInfoPage = "Store Information"

xlWorkbook = xlrd.open_workbook(filename)
sheetNames = xlWorkbook.sheet_names()
storeSheet = xlWorkbook.sheet_by_name(storeInfoPage)

sheetNames.remove(storeInfoPage)

def parseStrForDeps(strToParse):
    strToParse = strToParse[1:]
    strToParse = strToParse[:-1]
    strToParse = strToParse.replace("\n", "")

    regex = re.compile("[\(\[].*?[\)\]]")

    while "[" in strToParse:
        strToParse = re.sub(regex, "", strToParse)

    parts = strToParse.split(",")

    parts = [part.strip() for part in parts]

    return(parts)

def getVal(sheet, row, col):
    cellObj = sheet.cell(row, col)
    return(cellObj.value)

def parseSize(size):
    size = str(size)
    if ((size == "N/A") or (size.strip() == "")):
        return None, None
    else:
        unit = ""
        if "Kg" in size:
            unit = "Kg"
        elif "g" in size:
            unit = "g"
        elif "mL" in size:
            unit = "mL"
        elif "L" in size:
            unit = "L"
        elif "lb" in size:
            unit = "lb"

        size = size.replace(unit, "")
        size = float(size)

        return size, unit


def parseStrForTags(strToParse):
    strToParse = strToParse.replace("\n", " ")

    parts = strToParse.split(" - ")
    parts = [part for part in parts if "[" in part]
    tags = []
    for part in parts:
        tempTags = []

        strTags = part[part.find("[") + 1:part.find("]")]
        strTags = strTags.split(", ")

        for strTag in strTags:
            tempTags.append(strTag)

        tags.insert(0, tempTags)

    return(tags)


STORE_NAME_TAG = "storeName"
ADDRESS_TAG = "address"
MAP_TAG = "map"
AISLE_TAGS_TAG = "aisleTags"

rowStart = 2
rowEnd = 9

stores = []

while (rowStart <= rowEnd):
    vals = {
        STORE_NAME_TAG : getVal(storeSheet, rowStart, 0),
        ADDRESS_TAG : getVal(storeSheet, rowStart, 1),
        "franchiseName" : getVal(storeSheet, rowStart, 2),
        MAP_TAG : getVal(storeSheet, rowStart, 3),
        AISLE_TAGS_TAG : getVal(storeSheet, rowStart, 4)
    }

    vals[MAP_TAG] = parseStrForDeps(vals[MAP_TAG])
    vals[AISLE_TAGS_TAG] = parseStrForTags(vals[AISLE_TAGS_TAG])

    stores.append(vals)

    rowStart += 1

GENERIC_NAME_TAG = "genericName"
SPECIFIC_NAME_TAG = "specificName"
DEPARTMENT_TAG = "department"
AISLE_NUM_TAG = "aisleNum"
SIZE_TAG = "size"
SIZE_UNIT_TAG = "sizeUnit"

items = []
locs = []

for i in range(len(sheetNames)):
    sheetName = sheetNames[i]
    currSheet = xlWorkbook.sheet_by_name(sheetName)

    rowStart = 2
    rowEnd = 51

    while ((rowStart <= rowEnd) and (rowStart < currSheet.nrows)):
        item = {
            GENERIC_NAME_TAG : getVal(currSheet, rowStart, 0),
            SPECIFIC_NAME_TAG : getVal(currSheet, rowStart, 1),
            "price" : getVal(currSheet, rowStart, 6),
            SIZE_TAG : getVal(currSheet, rowStart, 7),
            SIZE_UNIT_TAG : None
        }

        loc = {
            GENERIC_NAME_TAG : getVal(currSheet, rowStart, 0),
            SPECIFIC_NAME_TAG : getVal(currSheet, rowStart, 1),
            STORE_NAME_TAG : getVal(currSheet, rowStart, 2),
            ADDRESS_TAG : getVal(currSheet, rowStart, 3),
            DEPARTMENT_TAG : getVal(currSheet, rowStart, 4),
            AISLE_NUM_TAG : getVal(currSheet, rowStart, 5)
        }

        size, unit = parseSize(item[SIZE_TAG])
        item[SIZE_TAG] = size
        item[SIZE_UNIT_TAG] = unit

        for key in item:
            val = str(item[key])
            if ((val == "N/A") or (val.strip() == "")):
                item[key] = None

        for key in loc:
            val = str(loc[key])
            if ((val == "N/A") or (val.strip() == "")):
                loc[key] = None

        items.append(item)
        locs.append(loc)

        rowStart += 1

for locNum in range(len(locs)):
    loc = locs[locNum]    

    itemCheck = False
    storeCheck = False

    keepStore = None

    for itemNum in range(len(items)):
        item = items[itemNum]
        
        if ((item[GENERIC_NAME_TAG] == loc[GENERIC_NAME_TAG]) and
            (item[SPECIFIC_NAME_TAG] == loc[SPECIFIC_NAME_TAG])):
            itemCheck = True
            break

    if (not itemCheck):
        print("Invalid item in item check")
        break

    for storeNum in range(len(stores)):
        store = stores[storeNum]

        #print(store[STORE_NAME_TAG], store[ADDRESS_TAG])
        
        if ((store[STORE_NAME_TAG] == loc[STORE_NAME_TAG]) and
            (store[ADDRESS_TAG] == loc[ADDRESS_TAG])):
            keepStore = store
        
        if ((store[STORE_NAME_TAG] == loc[STORE_NAME_TAG]) and
            (store[ADDRESS_TAG] == loc[ADDRESS_TAG]) and
            ((loc[DEPARTMENT_TAG] == None) or (loc[DEPARTMENT_TAG] in store[MAP_TAG])) and
            ((loc[AISLE_NUM_TAG] == None) or (loc[AISLE_NUM_TAG] <= len(store[AISLE_TAGS_TAG])))):
            storeCheck = True
            break

    if (not storeCheck):
        print("Invalid store in store check")
        #print(loc)
        #print(keepStore)
        break

data = {
    "ITEMS" : items,
    "STORES" : stores,
    "LOCS" : locs
}

filePath = "../Application/collectedInfo.json"
with open(filePath, 'w') as f:
    json.dump(data, f)


