
# coding: utf-8
import pandas as pd
import numpy as np
import json
import datetime
from sys import stdout
import collections
from itertools import tee, izip
import os
import math
import dataPreprocessing

def progress(i, n):
    stdout.write("\r%f%%" % (i*100/float(n)))
    stdout.flush()
    if i == n-1:
        stdout.write("\r100%")
        print("\r\n")

# In[26]:

def getCategoryPredcessorsCounter(categoryName, categoryPairs):
    predcessorsByUser = [[transitionTuple[0][0] for transitionTuple in userTransitions if transitionTuple[0][1] == categoryName and transitionTuple[1] < 60*6] for userTransitions in categoryPairs]
    predcessorsList = [item for sublist in predcessorsByUser for item in sublist]
    return collections.Counter(predcessorsList)

def getCategorySuccessorsCounter(categoryName, categoryPairs):
    successorsByUser = [[transitionTuple[0][1] for transitionTuple in userTransitions if transitionTuple[0][0] == categoryName and transitionTuple[1] < 60*6] for userTransitions in categoryPairs]
    successorsList =  [item for sublist in successorsByUser for item in sublist]
    return collections.Counter(successorsList)


# In[21]:

def getTopSuccessorsNames(categoryName, categoryPairs, nTop = 10):
    topNames = [commonTuple[0] for commonTuple in  getCategoryPredcessorsCounter(categoryName, categoryPairs).most_common(nTop)]
    return topNames

def getTopSuccessorsColorsDict(categoryName, categoryPairs, nTop = 10):
    topNames = getTopSuccessorsNames(categoryName, categoryPairs, nTop)
    topColors = ['#cd3d08', '#ec8f00', '#6dae29', '#683f92', '#b60275', '#2058a5', '#00a592', '#009d3c', '#378974', #'#b5cf6b',
    '#ffca00']
    dictOfColors = [dict(zip(['name', 'color'], row)) for row in izip(topNames, topColors)]
    return dictOfColors


# In[22]:

def getMatrixForTopSuccessors(categoryName, categoryPairs, nTop = 10, withOthers = 1):
    #Get the counter and list of successors
    categoryCounter = getCategorySuccessorsCounter(categoryName, categoryPairs)
    categoryTopSuccessors = categoryCounter.most_common(nTop)
    topSuccessorsNames = [commonTuple[0] for commonTuple in categoryTopSuccessors]

    #Calculate total sums of inputs/outputs
    totalOut = sum(categoryCounter.values())
    totalTopCatsInterOut = 0
    totalIn = sum(getCategoryPredcessorsCounter(categoryName, categoryPairs).values())

    #+1 for Others section
    adjMatrix = [[] for i in range(nTop + withOthers)]

    #Fill the first element with the self value
    adjMatrix[0] = [0 for i in range(nTop + withOthers)]
    adjMatrix[0][0] = categoryCounter[categoryName]

    index = 1
    for commonTuple in  categoryTopSuccessors:
        successorCategory = commonTuple[0]
        if successorCategory != categoryName:
            #Count of transitions from source category
            adjMatrix[0][index] = commonTuple[1]

            successorCategoryCounter = getCategorySuccessorsCounter(successorCategory, categoryPairs)
            #Counts for all the important categories
            adjRow = [0 for i in range(nTop)]
            adjRow[0] = successorCategoryCounter[categoryName]
            adjRow[1:] = [successorCategoryCounter[catName] for catName in topSuccessorsNames if catName!=categoryName]
            #Others set to 0
            if withOthers:
                adjRow.append(0)
            adjMatrix[index] = adjRow
            totalTopCatsInterOut  = totalTopCatsInterOut + sum(adjRow)
            index = index + 1
    if withOthers:
        adjMatrix[0][nTop] = totalOut - sum(adjMatrix[0])
        adjMatrix[nTop] = [0 for i in range(nTop + withOthers)]
        adjMatrix[nTop][0] = totalIn - sum(row[0] for row in adjMatrix)

    #Normalize
    total = sum([sum(sublist) for sublist in adjMatrix])
    normMatrix = [[float(count)/total for count in adjRow] for adjRow in adjMatrix]
    return normMatrix

def filterCheckinsWithCategories(venuePairsGroupedByUser, categoriesArray):
    filteredVenuePairs = {}
    categoryNames = [cat["name"] for cat in categoriesArray]

    for categoryName in categoryNames:
        filteredVenuePairs[categoryName] = []

    for userVenues in venuePairsGroupedByUser:
        filteredUserVenuePairs = {cat:[venueTuple for venueTuple in userVenues if venueTuple[0]['cat'][0] == cat and venueTuple[0]['cat'][1] in categoryNames] for cat in categoryNames}
        for categoryName in categoryNames:
            filteredVenuePairs[categoryName].extend(filteredUserVenuePairs[categoryName])

    return filteredVenuePairs


def getDataFor(clusterId, categoryName):
    global rootDir
    rootDir = '/var/www/FlaskHello/FlaskHello/dataScripts'
    #rootDir = '.'
    nTop = 10

    visitedVenuesNames = dataPreprocessing.readVisitedVenuesNames(clusterId, rootDir + '/' + 'julyLDA')
    #TODO: just read it from the server
    categoryNames = dataPreprocessing.readCategoriesNames(rootDir + '/' + 'julyLDA')

    (venuePairsGroupedByUser, categoryPairsGroupedByUser, userIds) = dataPreprocessing.getSavedSequences(clusterId, rootDir + '/' + 'julyLDA')

    matrix = getMatrixForTopSuccessors(categoryName, categoryPairsGroupedByUser, nTop, 0)
    categoriesArray = getTopSuccessorsColorsDict(categoryName, categoryPairsGroupedByUser, nTop)
    filteredVenuePairs = filterCheckinsWithCategories(venuePairsGroupedByUser, categoriesArray)

    return {'matrix':matrix,
           'categories':categoriesArray,
           'checkins':filteredVenuePairs,
           'categoryNames':categoryNames}

# with open('testChecks.json', 'w') as outfile:
#     json.dump(getDataFor(1, '4bf58dd8d48988d163941735')['checkins'], outfile)
