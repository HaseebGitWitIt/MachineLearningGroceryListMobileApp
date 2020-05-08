import sys
import json
import flask
import firebase_admin
import firebase_admin

from firebase_admin import db
from firebase_admin import credentials

sys.path.insert(1, './RecommendItemFiles')

from RecommendItems import getRules

firebase_admin.initialize_app(options = {
    "apiKey": "AIzaSyCxqsnU4HPKeMmWRH0rIyRV-Lg-o6lEglw",
    "authDomain": "grocerylist-dd21a.firebaseapp.com",
    "databaseURL": "https://grocerylist-dd21a.firebaseio.com",
    "projectId": "grocerylist-dd21a",
    "storageBucket": "grocerylist-dd21a.appspot.com",
    "messagingSenderId": "328195735241",
    "appId": "1:328195735241:web:204a3f948681e77d"
})

ITEMS_KEY = "items"
GEN_NAME_KEY = "genName"

def updateRules(event, context):
    # gcloud functions deploy updateRules --trigger-event providers/google.firebase.database/eventTypes/ref.write --trigger-resource projects/_/instances/grocerylist-dd21a/refs/lists/{lid}/items --runtime python37 --allow-unauthenticated 
    path = "/globals/listVals"

    listRef = db.reference(path)
    listVals = listRef.get()

    prevUpdateKey = "PREV_UPDATE"
    currCountKey = "CURR_COUNT"

    prevUpdate = 0
    currCount = 0

    if ((listVals) and (prevUpdateKey in listVals)):
        prevUpdate = listVals[prevUpdateKey]
        currCount = listVals[currCountKey]

    currCount += 1

    update = False
    if (currCount > prevUpdate * (1 + 0.1)):
        genRules(event)
        prevUpdate = currCount
        update = True

    newVals = {}
    newVals[prevUpdateKey] = prevUpdate
    newVals[currCountKey] = currCount

    db.reference(path).update(newVals)


def genRules(request):
    listRef = db.reference("/lists")
    lists = listRef.get()

    listItems = []
    for listId in lists:
        currItems = []
        currList = lists[listId]

        if ITEMS_KEY in currList:
            items = lists[listId][ITEMS_KEY]
            for itemId in items:
                currItems.append(itemId)
            listItems.append(currItems)

    rules, supportMap = getRules(listItems)
    finalRules = []

    for item in rules:
        for rule in rules[item]:
            db.reference("/recommendations/" + rule.getPrior()).push(rule.getAntecedent())
            finalRules.append((rule.getPrior(), rule.getAntecedent()))

    db.reference("/recommendations/topItems/").update(supportMap)

    return flask.jsonify(finalRules)