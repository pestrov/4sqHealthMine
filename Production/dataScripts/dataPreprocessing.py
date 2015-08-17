import pandas as pd
import numpy as np
import json
import datetime
from sys import stdout
import collections
from itertools import tee, izip
import os
import math
import time

def generateDataForDataFrame(checkinsDF, folder):
    createFoldersStructure(folder)

    start = time.clock()
    maps = buildMaps(checkinsDF, folder)

    print 'Building indexes: ', (time.clock() - start)
    start = current = time.clock()

    clusterIds = np.unique(checkinsDF['clusterId'].tolist())

    for clusterId in clusterIds:
        relevantCheckins = checkinsDF[checkinsDF.clusterId == clusterId]
        (venuePairsGroupedByUser, categoryPairsGroupedByUser, userIds, visitedVenueIds) = getSequencesFromCheckins(relevantCheckins, maps)
        saveVisitedVenuesNames(visitedVenueIds, clusterId, visitedVenuesFldr(folder), maps['venueNames'])
        saveVenuePairs(venuePairsGroupedByUser, clusterId, clustersFldr(folder))
        saveCategoryPairs(categoryPairsGroupedByUser, clusterId, clustersFldr(folder))
        saveCheckinsHeatmap(relevantCheckins, clusterId, checkinsHeatFldr(folder))

        print 'Building cluster: ', clusterId, (time.clock() - start)
        start = current = time.clock()


def buildMaps(checkinsDF, folder):
    try:
        with open(folder + '/maps.json', 'r') as infile:
            maps = json.read(infile)
    except:
        maps = {}
        maps['venuesCategories'] = getCategoryForVenueDict(checkinsDF)
        maps['categoriesNames'] = getCategoryNameForIdDict(checkinsDF)
        (latDict, lngDict) = getVenueLocationForIdDict(checkinsDF)
        maps['lng'] = latDict
        maps['lat'] = lngDict
        maps['venueNames'] = getVenueNameForIdDict(checkinsDF)

        with open(folder + '/maps.json', 'w') as outfile:
            json.dump(maps, outfile)
        with open(folder + '/categoryNames.json', 'w') as outfile:
            json.dump(maps['categoriesNames'], outfile)
    return maps

#Building indexes
def getCheckinsDataFrame(projectDir, filename):
    return pd.read_csv(projectDir + "/" + filename, sep="\t", encoding="utf-8")

def getDataForSavedDF(fileName, projectName):
    #projectDir = '/var/www/FlaskHello/FlaskHello/dataScripts/data/' + projectName
    projectDir = 'data/' + projectName
    checkinsDF = getCheckinsDataFrame(projectDir, fileName)
    generateDataForDataFrame(checkinsDF, projectDir)

def getCategoryForVenueDict(checkinsDF):
    return checkinsDF[['venueId', 'categoryId']].set_index('venueId').to_dict()['categoryId']

def getCategoryNameForIdDict(checkinsDF):
    return checkinsDF[['categoryId', 'categoryName']].set_index('categoryId').to_dict()['categoryName']

def getVenueLocationForIdDict(checkinsDF):
    locationsDict = checkinsDF[['venueId', 'lat','lng']].set_index('venueId').to_dict()
    return (locationsDict['lat'], locationsDict['lng'])

def getVenueNameForIdDict(checkinsDF):
    return checkinsDF[['venueId', 'name']].set_index('venueId').to_dict()['name']

#Main function
def getSequencesFromCheckins(checkinsDF, maps):
    checkinsGroupedByUser = checkinsDF.groupby('userId')
    venuePairsGroupedByUser = []
    categoryPairsGroupedByUser = []
    userIds = []
    count = len(checkinsGroupedByUser)
    visitedVenueIds = set()

    for index, group in enumerate(checkinsGroupedByUser):
        sortedCheckins = group[1].sort("createdAt")

        venuePairs = []
        categoryPairs = []

        for venue1, venue2 in pairwise(sortedCheckins['venueId'].tolist()):
            categoryPair = (maps["venuesCategories"][venue1], maps["venuesCategories"][venue2])
            venuePairs.append({'id':(venue1, venue2),
                                'loc':((maps['lng'][venue1], maps['lat'][venue1]), (maps['lng'][venue2], maps['lat'][venue2])),
                                'name':(maps["venueNames"][venue1], maps["venueNames"][venue2]),
                                'cat':categoryPair})
            visitedVenueIds.update([venue1, venue2]);
            categoryPairs.append(categoryPair)

        timeDiffs = []
        for checkin1, checkin2 in pairwise(sortedCheckins['createdAt'].tolist()):
            timeDiffs.append((checkin2-checkin1)/60)

        venuePairsGroupedByUser.append(zip(venuePairs,timeDiffs))
        categoryPairsGroupedByUser.append(zip(categoryPairs,timeDiffs))
        userIds.append(group[0])
    return (venuePairsGroupedByUser, categoryPairsGroupedByUser, userIds, visitedVenueIds)

#Work with files
def saveCheckinsHeatmap(relevantCheckins, clusterId, clusterFolder):
    checkinsCountGrouped = []
    for group in relevantCheckins.groupby(['hour','weekday']):
        checkinsCountGrouped.append({'key':group[0],
                                    'value':len(group[1])})
    with open(clusterFolder + '/checkinsHeat' + str(clusterId) + '.json', 'w') as outfile:
        json.dump(checkinsCountGrouped, outfile)

def saveVenuePairs(venuePairsGroupedByUser, clusterId, clusterFolder):
    with open(clusterFolder + '/venuePairs' + str(clusterId) + '.json', 'w') as outfile:
        json.dump(venuePairsGroupedByUser, outfile)

def saveCategoryPairs(categoryPairsGroupedByUser, clusterId, clusterFolder):
    with open(clusterFolder + '/categoryPairs' + str(clusterId) + '.json', 'w') as outfile:
        json.dump(categoryPairsGroupedByUser, outfile)

def saveVisitedVenuesNames(visitedVenueIds, clusterId, clusterFolder, venueNames):
    with open(clusterFolder + '/visitedVenues' + str(clusterId) + '.json', 'w') as outfile:
        json.dump({venueId: venueNames[venueId] for venueId in visitedVenueIds}, outfile)

def readVenuePairs(clusterId, clusterFolder):
    with open(clusterFolder + '/venuePairs' + str(clusterId) + '.json', 'r') as infile:
        return json.load(infile)

def readCategoryPairs(clusterId, clusterFolder):
    with open(clusterFolder + '/categoryPairs' + str(clusterId) + '.json', 'r') as infile:
        return json.load(infile)

def readVisitedVenuesNames(clusterId, projectFolder):
    with open(visitedVenuesFldr(projectFolder) + '/visitedVenues' + str(clusterId) + '.json', 'r') as infile:
        return json.load(infile)

def readCategoriesNames(folder):
    with open(folder + '/categoryNames.json', 'r') as infile:
        return json.load(infile)

def getSavedSequences(clusterId, projectFolder):
    venuePairsGroupedByUser = readVenuePairs(clusterId, clustersFldr(projectFolder))
    categoryPairsGroupedByUser = readCategoryPairs(clusterId, clustersFldr(projectFolder))
    return (venuePairsGroupedByUser, categoryPairsGroupedByUser, [])

def clustersFldr(folder):
    return folder + "/clusterSequences"
def checkinsHeatFldr(folder):
    return folder + "/checkinsHeat"
def visitedVenuesFldr(folder):
    return folder + "/visitedVenues"

def createFoldersStructure(folder):
    if not os.path.exists(folder):
        os.makedirs(folder)
    if not os.path.exists(clustersFldr(folder)):
        os.makedirs(clustersFldr(folder))
    if not os.path.exists(checkinsHeatFldr(folder)):
        os.makedirs(checkinsHeatFldr(folder))
    if not os.path.exists(visitedVenuesFldr(folder)):
        os.makedirs(visitedVenuesFldr(folder))

def pairwise(iterable):
    a, b = tee(iterable)
    next(b, None)
    return izip(a, b)
# getDataForSavedDF()
#getDataForSavedDF('LDAClusteredCheckins.tsv', 'test')
