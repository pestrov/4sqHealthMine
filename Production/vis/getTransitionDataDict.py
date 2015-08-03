import json
from VisDataGenerator import getDataFor
def getTransitionDataDict(clusterId=0, category='', debug=0):
    if debug:
        testDataFileName = 'var/www/FlaskHello/FlaskHello/testData.json'
        with open(testDataFileName,'r') as testDataFile:
            data = json.load(testDataFile)
            return json.dumps(data)
    else:
        testDataFileName = 'var/www/FlaskHello/FlaskHello/testData.json'
        with open(testDataFileName, 'wb') as testDataFile:
            data = getDataFor(clusterId, category)
            json.dump(data, testDataFile)
            return json.dumps(data)
