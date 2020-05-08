import os
import sys

import ItemObj

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)

class GrocList(object):
	def __init__(self, name, items=[]):
		if type(items) != list:
			raise ValueError("Error in GrocListObj: items parameter must be a list")

		self.setName(name)

		self.items = []
		for item in items:
			self.addItem(item)

	"""
	str
	Returns a string describing the Store object
	@input	None
	@return	A string describing the Store object
	"""
	def __str__(self):
		retStr = "%s:\n" % (self.name)

		for item in self.items:
			retStr += "\t%s\n" % (item.getName())

		return(retStr)

	"""
	setName
	Sets the name of the object to given name
	@input	newName	The new name of the object
	@return None
	"""
	def setName(self, newName):
		if type(newName) != str:
			raise ValueError("Error in GrocListObj: name parameter must be a string")

		self.name = newName

	"""
	getName
	Returns the name of the object
	@input	None
	@return	The name of the object
	"""
	def getName(self):
		return(self.name)

	"""
	addItem
	Adds the given item to the list of items
	@input	newItem	The item to add to the list
	@return	None
	"""
	def addItem(self, newItem):
		if type(newItem) != ItemObj.Item:
			raise ValueError("Error in GrocListObj: items must be Item objects")

		self.items.append(newItem)

	"""
	getItems
	Returns the current list of items
	@input	None
	@return	The current list of items
	"""
	def getItems(self):
		return(self.items)