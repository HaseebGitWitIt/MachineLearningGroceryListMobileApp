import unittest
import os
import sys

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
sys.path.append(os.path.join(file_dir, ".."))

from YamlParser import parseTestYamlFile
from Algorithm import estimateLoc

"""
Test file for testing all methods in Algorithm.py
"""
class TestAlgorithmMethods(unittest.TestCase):
    """
    testParse

    Test that the yaml parser is working properly.
    The output from this test needs to be checked to ensure
    that the parser is working properly.
    """
    def testParse(self):
        stores = parseTestYamlFile(os.path.join(file_dir, "..", "TestParamFiles/Test1.yaml"))

        for store in stores:
            print(store)

    """
    testEstimateLoc

    Tests that the estimation of item location works properly.
    Output needs to be checked to ensure estimation is working.
    """
    def testEstimateLoc(self):
        stores = parseTestYamlFile(os.path.join(file_dir, "..", "TestParamFiles/Test1.yaml"))

        knownItems = []

        for store in stores:
            for item in store.getAllItems():
                knownItems.append(item)

        print(estimateLoc(knownItems, "ITEM_8"))


if __name__ == '__main__':
    unittest.main()