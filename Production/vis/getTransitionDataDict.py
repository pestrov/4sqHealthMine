import json
from VisDataGenerator import getDataFor
def getTransitionDataDict(clusterId=0, category=''):
    return json.dumps(getDataFor(clusterId, category))
