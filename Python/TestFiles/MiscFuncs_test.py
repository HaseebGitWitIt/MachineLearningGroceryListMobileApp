import unittest
import os
import sys

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
sys.path.append(os.path.join(file_dir, ".."))

from MiscFuncs import distBetweenPoints, getHighestNKeysInDict

"""
This file containts tests for testing all methods
in the MiscFuncs file.
"""
class TestAlgorithmMethods(unittest.TestCase):
    """
    testDistanceBetweenPoints

    Tests that the distBetweenPoints method works properly.
    """
    def testDistanceBetweenPoints(self):
        self.assertEqual(distBetweenPoints([0, 0], [0, 0]), 0)
        self.assertEqual(distBetweenPoints([8, 3], [4, 6]), 5.0)

    """
    testGetHighestNKeysInDict

    Tests that the getHighestNKeysInDict method works properly.
    """
    def testGetHighestNKeysInDict(self):
        testDict = {"A" : 5, "B" : -6, "C" : 17}

        self.assertEqual(getHighestNKeysInDict(testDict, 1), ["C"])
        self.assertEqual(getHighestNKeysInDict(testDict, 2), ["C", "A"])
        self.assertEqual(getHighestNKeysInDict(testDict, 3), ["C", "A", "B"])


if __name__ == '__main__':
    unittest.main()