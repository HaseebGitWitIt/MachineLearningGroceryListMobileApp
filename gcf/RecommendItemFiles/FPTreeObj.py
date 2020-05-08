"""
FPTree

Tree object where each node has a count for its
occurance count
"""
class FPTree(object):
    START_COUNT = 1
    
    def __init__(self, item = None):
        self.item = item

        self.count = self.START_COUNT
        self.children = []
    
    def addChild(self, childItem):
        newChild = FPTree(childItem)
        self.children.append(newChild)
        return(newChild)

    def getChildren(self):
        return self.children

    def getItem(self):
        return self.item

    def getCount(self):
        return self.count

    def getChildWithValue(self, item):
        for i in range(len(self.children)):
            child = self.children[i]
            if (child.getItem() == item):
                return child
        return None

    def incCount(self):
        self.count += 1

    def addPath(self, listOfItems):
        if (len(listOfItems) > 0):
            currVal = listOfItems[0]
            child = self.getChildWithValue(currVal)
            if (child != None):
                child.incCount()
            else:
                child = self.addChild(currVal)
            child.addPath(listOfItems[1:])        

    def __str__(self, level = 1):
        retStr = ""
        retStr += ("\t" * level) + "(" + str(self.item) + ", " + str(self.count) + ")\n"
        if (len(self.children) > 0):
            retStr += ("\t" * level) + "Children:\n"
            for child in self.children:
                retStr += child.__str__(level + 1)
        return(retStr)