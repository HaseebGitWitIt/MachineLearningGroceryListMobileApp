import os
import sys

import ItemObj

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)

"""
Aisle object used to simulate Aisles from grocery stores.
Aisles are identified using a number and list of tags.
Tags are the words you see on the signs above aisles
detailing the types of item in the aisle.
Finally, each aisle is contains a list of items found
inside of the aisle.
"""
class Aisle(object):
	"""
	init
	Initialize a new Aisle object.
	@input	aisleNum	The number of this aisle
	@input	tags		The list of tags for this aisle
	@return	None
	"""					
	def __init__(self, aisleNum, tags):
		if type(tags) != list:
			raise ValueError("Error in AisleObj: tags parameter must be a list")

		self.setNumber(aisleNum)

		self.aisleTags = []
		for tag in tags:
			self.addTag(tag)

		self.items = []
	
	"""
	addTag
	Adds the given tag to this aisle's list of tags.
	@input	newTag	The tag to add to the list
	@return	None
	"""
	def addTag(self, newTag):
		if type(aisleNum) != str:
			raise ValueError("Error in AisleObj: tags must be Strings")

		self.aisleTags.append(newTag)
		
	"""
	getTags
	Returns this aisle's list of tags.
	@input	None
	@return	The list of tags
	"""
	def getTags(self):
		return(self.aisleTags)

	"""
	addItem
	Adds the given item to this aisle's list of items
	@input	newItem	The item to add to the list
	@return	None
	"""
	def addItem(self, newItem):
		if type(newItem) != ItemObj.Item:
			raise ValueError("Error in AisleObj: items must be Item objects")

		self.items.append(newItem)

	"""
	getNumber
	Returns this aisle's number
	@input	None
	@return	This aisle's number
	"""
	def getNumber(self):
		return(self.aisleNum)

	def setNumber(self, newNum):
		if type(newNum) != int:
			raise ValueError("Error in AisleObj: aisleNum parameter must be an integer")

		self.aisleNum = newNum

	"""
	str
	Returns a string describing this aisle
	@input	None
	@return	String describing this aisle
	"""
	def __str__(self):
		strToRet = ("Aisle Number: %d, Tags: %s" % (self.aisleNum, self.aisleTags))

		for item in self.items:
			strToRet += "\n\t"
			strToRet += item.__str__().replace("\n", "\n\t")

		return(strToRet)

	"""
	getAllItems
	Returns the list of items inside of this aisle
	@input	None
	@return	List of items in this aisle
	"""
	def getAllItems(self):
		return(self.items)