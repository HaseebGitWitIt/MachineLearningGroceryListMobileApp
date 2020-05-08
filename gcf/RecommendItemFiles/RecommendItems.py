from FPTreeObj import FPTree
from RuleObj import Rule
from copy import copy

from itertools import chain, combinations

from collections import Counter

MIN_SUPPORT = 2

def calcSupport(itemSubset, allTransactions):
    numIncludes = 0

    for currTransaction in allTransactions:
        if (itemSubset.issubset(currTransaction)):
            numIncludes += 1

    support = float(numIncludes) / len(allTransactions)

    return support

def calcConfidence(ruleToCheck, allTransactions):
    prior = ruleToCheck.getPrior()
    antecedent = ruleToCheck.getAntecedent()

    union = antecedent.union(prior)

    numerator = calcSupport(union, allTransactions)
    denominator = calcSupport(prior, allTransactions)

    confidence = numerator / denominator

    return confidence

def getSupportMap(allTransactions):
    supportMap = {}

    for currTransaction in allTransactions:
        for item in currTransaction:
            if item not in supportMap:
                supp = calcSupport(set([item]), allTransactions)
                supportMap[item] = supp

    return(supportMap)

def constructFPtree(allTransactions, supportMap = None):
    if (supportMap == None):
        supportMap = getSupportMap(allTransactions)

    descOrder = list(reversed(sorted(supportMap, key=lambda item: supportMap[item])))

    tree = FPTree()

    for currTransaction in allTransactions:
        sortedItem = sorted(currTransaction, key=lambda item: descOrder.index(item))

        tree.addPath(sortedItem)

    return(tree)

def powerset(iterable):
    s = list(iterable)
    return chain.from_iterable(combinations(s, r) for r in range(1, len(s)+1))

def mineTree(tree, root = True, currPath = None):
    paths = {}

    item = tree.getItem()
    count = tree.getCount()

    if (currPath == None):
        currPath = []
        temp = currPath
    else:
        temp = copy(currPath)
        temp.append(item)

    if (root == False):
        if (item not in paths):
            paths[item] = []

        paths[item].append((tree.getCount(), currPath))

    children = tree.getChildren()
    for child in children:
        tempPaths = mineTree(child, root=False, currPath=temp)
        for item in tempPaths:
            if item in paths:
                paths[item] += tempPaths[item]
            else:
                paths[item] = tempPaths[item]

    if (root == False):
        return(paths)
    else:
        rules = {}
        for item in paths:
            rules[item] = {}
            for currList in paths[item]:
                for subItem in currList[1]:
                    if subItem not in rules[item]:
                        rules[item][subItem] = 0

                    rules[item][subItem] += currList[0]

        for item in rules:
            rules[item] = [Rule(item, k) for k, v in rules[item].items() if v >= MIN_SUPPORT]

        return(rules)

def formatTransactions(allTransactions):
    newTransactions = []
    for transaction in allTransactions:
        newTransactions.append(set(transaction))
    return(newTransactions)

def getRules(allTransactions):
    transactions = formatTransactions(allTransactions)
    supportMap = getSupportMap(transactions)
    tree = constructFPtree(transactions, supportMap = supportMap)
    rules = mineTree(tree)
    return (rules, supportMap)

if __name__ == "__main__":
    transactions = [["B", "E", "A", "D"],
                    ["B", "C", "E"],
                    ["A", "B", "D", "E"],
                    ["A", "B", "C", "E"],
                    ["A", "B", "C", "D", "E"],
                    ["B", "C", "D"]]

    #transactions = [["one", "two", "four"],
    #                ["one", "two", "three"]]

    rules, supportMap = getRules(transactions)

    for item in rules:
        for rule in rules[item]:
            print(item, rule.__str__())

    print(supportMap)