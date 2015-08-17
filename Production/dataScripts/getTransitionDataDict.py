import json
from VisDataGenerator import getDataFor
def getTransitionDataDict(clusterId=0, category='', debug=0, projectName = 'julyLDA'):
    if debug:
        testDataFileName = 'var/www/FlaskHello/FlaskHello/testData.json'
        with open(testDataFileName,'r') as testDataFile:
            data = json.load(testDataFile)
            return json.dumps(data)
    else:
        data = getDataFor(clusterId, category, projectName)
        return json.dumps(data)
