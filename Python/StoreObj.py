import numpy
import os
import sys

import DepartmentObj

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)

"""
Store object used to model grocery stores.
Stores have a name, width, length, and departments.
"""
class Store(object):
	"""
	init
	Initializes a new Store object
	@input	name	The name of the store
	@input	width	The width of the store (Default = STORE_WIDTH)
	@input	length	The length of the store (Default = STORE_LENGTH)
	@return	None
	"""
	def __init__(self, name):
		self.setName(name)
		self.departments = []

	"""
	str
	Returns a string describing the Store object
	@input	None
	@return	A string describing the Store object
	"""
	def __str__(self):
		retStr = ("Store Name: %s" % (self.name))
		for department in self.departments:
			retStr += "\n\t"
			retStr += self.departments.__str__().replace("\n", "\n\t")

		return(retStr)

	"""
	addDepartment
	Adds the given Department to the Store
	@input	departmentObj	The Department to add to the list
	@return	None
	"""
	def addDepartment(self, departmentObj):
		if type(departmentObj) != DepartmentObj.Department:
			raise ValueError("Error in StoreObj: departmentObj parameter must be a Department object")

		self.departments.append(departmentObj)

	"""
	getDepartments
	Returns the diictionary of Departments in the store
	@input	None
	@return	The dictionary of Departments in the store
	"""
	def getDepartments(self):
		return(self.departments)

	"""
	getAllItems
	Returns a list of all the items in the Store. Does this by getting
	all the items in each Department.
	@input	None
	@return	The list of all items in the Store
	"""
	def getAllItems(self):
		items = []

		for department in self.departments:
			for item in department.getAllItems():
				items.append(item)

		return(items)

	"""
	getName
	Returns the name of the Store
	@input	None
	@return	The name of the Store
	"""
	def getName(self):
		return(self.name)

	"""
	setName
	Sets the name of the object to the given name
	@input	newName	The new name of the object
	@return	None
	"""
	def setName(self, newName):
		if type(newName) != str:
			raise ValueError("Error in StoreObj: newName parameter must be a string")
	
		self.name = newName

	"""
	getItem
	Returns the item in the store with the given name
	@input	itemName	The name of the item to look for
	@return	The item if found, None otherwise
	"""
	def getItem(self, itemName):
		items = self.getAllItems()

		for item in items:
			if item.getName() == itemName:
				return(item)

		return(None)