import StoreObj
import DepartmentObj
import AisleObj

"""
ItemLoc object used to store the locations
of each Item. Each ItemLoc object belongs to one
and only one Item. The ItemLoc object has a
Store, Department, and Aisle.
"""
class ItemLoc(object):
	"""
	init	
	Initializes a new ItemLoc object.
	@input	storeObj		The Store for this ItemLoc
	@input	departmentObj	The Department for this ItemLoc
	@input	aisleObj		The Aisle for this ItemLoc
	@return	None
	"""
	def __init__(self, store, department, aisle):
		self.setStore(store)
		self.setDepartment(department)
		self.setAisle(aisle)

	"""
	str
	Returns the string representation of this object
	@input	None
	@return	The string representation of this object
	"""
	def __str__(self):
		storeName = "None"
		departmentName = "None"
		aisleNum = -1

		store = self.store
		if (store != None):
			storeName = store.getName()

		department = self.department
		if (department != None):
			departmentName = department.getName()

		aisle = self.aisle
		if (aisle != None):
			aisleNum = self.aisle.getNumber()

		return("STORE: %s, DEPARTMENT: %s, AISLE: %d" % (storeName, departmentName, aisleNum))
		
	"""
	getStore
	Returns the Store for this ItemLoc
	@input	None
	
	@return	The Store for this ItemLoc
	"""
	def getStore(self):
		return(self.store)

	def setStore(self, newStore):
		if type(newStore) != StoreObj.Store:
			raise ValueError("Error in ItemLocObj: newStore parameter must be a Store object")

		self.store = newStore
		
		
	"""
	getDepartment
	Returns the Department for this ItemLoc
	@input	None
	@return	The Department for this ItemLoc
	"""
	def getDepartment(self):
		return(self.department)

	def setDepartment(self, newDepartment):
		if type(newDepartment) != DepartmentObj.Department:
			raise ValueError("Error in ItemLocObj: newDepartment parameter must be a Department object")

		self.department = newDepartment

		
	"""
	getAisle
	Returns the Aisle for this ItemLoc
	@input	None
	@return	The Aisle for this ItemLoc
	"""
	def getAisle(self):
		return(self.aisle)

	"""
	setAisle
	Sets the aisle of this object to the given value
	@input	newAisle	The new aisle of the object
	@return	None
	"""
	def setAisle(self, newAisle):
		if type(newAisle) != AisleObj.Aisle:
			raise ValueError("Error in ItemLocObj: newAisle parameter must be an Aisle object")

		self.aisle = newAisle