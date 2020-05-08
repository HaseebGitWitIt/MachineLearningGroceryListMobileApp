import os
import sys

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)

import ItemLocObj

"""
Item object used to model real life items
found inside of grocery stores. Each Item
has a name and a location given using an
ItemLoc object.
"""
class Item(object):
    """
    init
    Intitializes a new Item object.
    @input  name    The name of the Item
    @input  locationObj The location of the Item
    @return None
    """
    def __init__(self, name, locationObj):
        self.setName(name)
        self.setLoc(locationObj)

    """
    str
    Returns a string describing this Item object.
    @input  None
    @return A string describing this Item object.
    """
    def __str__(self):
        return("Item Name: %s" % (self.name))

    """
    getName
    Returns the name of this Item
    @input  None
    @return The name of the Item
    """
    def getName(self):
        return(self.name)

    def setName(self, newName):
        if type(newName) != str:
            raise ValueError("Error in ItemObj: newName parameter must be a string")

        self.name = newName
		
    """
    getLoc
    Returns the location of this Item
    @input  None
    @return The location of the Item
    """
    def getLoc(self):
        return(self.location)

    """
    setLoc
    Sets the location of this object to the given location
    @input  newLoc  The new location of the object
    @return None
    """
    def setLoc(self, newLoc):
        if (type(newLoc) != ItemLocObj.ItemLoc) and \
            (newLoc != None):
            raise ValueError("Error in ItemObj: newLoc parameter must be an ItemLoc object")

        self.location = newLoc