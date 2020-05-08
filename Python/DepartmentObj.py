import os
import sys

import AisleObj

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)

"""
Department object used to model real life departments found
in grocery stores. Departments have a name, four coordinates
showing where the department is in the store, a length and
width, and a list of aisles.
"""
class Department(object):
    """
    init
    Initializes a new Department object.
    @input  name        The name of the Department
    @input  topLeft     The top left coordinate of the Department
    @input  bottomRight The bottom right coordinate of the Department
    @return None
    """
    def __init__(self, name):
        self.setName(name)

        self.aisles = []
	
    """
    getName
    Returns the name of this Department.
    @input  None
    @return The name of this Department
    """
    def getName(self):
        return(self.name)

    def setName(self, newName):
        if type(newName) != str:
			raise ValueError("Error in DepartmentObj: newName parameter must be a String")

        self.name = newName


    """
    addAisle
    Adds the given aisle to the list of aisles
    @input  aisleToAdd  The aisle object to add to the list
    @return None
    """
    def addAisle(self, aisleToAdd):
        if type(aisleToAdd) != AisleObj.Aisle:
			raise ValueError("Error in DepartmentObj: aisle parameter must be an Aisle object")

        self.aisles.append(aisleToAdd)

    """
    getAllItems
    
    Returns a list of all items found inside of this Department
    in all of its internal aisles.
    @input  None
    @return A list of all items found inside of this Department
    """
    def getAllItems(self):
        items  = []

        for aisle in self.aisles:
            for item in aisle.getAllItems():
                items.append(item)

        return(items)

    """
    str
    Returns a string describing this Department object
    @input  None
    @return String describing this Department object
    """
    def __str__(self):
        strToRet = ("Department Name: %s" % (self.name))

        for aisle in self.aisles:
            strToRet += "\n\t"
            strToRet += aisle.__str__().replace("\n", "\n\t")

        return(strToRet)