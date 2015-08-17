
# coding: utf-8

import pandas as pd
import numpy as np
import json
from datetime import datetime
import os

def checkRequiredKeys(csvKeys):
    requiredKeys = ['categoryId', 'categoryName', 'checkinId', 'createdAt', 'lat', 'lng', 'name', 'userId', 'venueId']
    for requiredKey in requiredKeys:
        if requiredKey not in csvKeys:
            return False
    return True

def createFoldersStructure(folder):
    if not os.path.exists(folder):
        os.makedirs(folder)
    return folder + "/"

def runLDA(projectName, fileName, minUsersPerVenueForLDA = 10, topicsNumber = 20):
    folderRelativePath = createFoldersStructure('data/' + projectName)
    checkinsCSVPath = folderRelativePath + fileName

    allCheckins = pd.read_csv(checkinsCSVPath, sep='\t')
    if not checkRequiredKeys(allCheckins.keys()):
        print "Missing required keys"

    allCheckins = allCheckins.drop_duplicates(subset = ['checkinId'])
    allCheckins.drop('Unnamed: 0', axis=1, inplace=True)

    print "Unique users: ", len(np.unique(allCheckins.userId.tolist()))
    print "Unique checkins: ", len(allCheckins)

    userVenueGroups = []
    for venueId, group in allCheckins.groupby('venueId'):
        if len(group.groupby('userId'))>minUsersPerVenueForLDA:
            userVenueGroups.append(venueId)

    #Make lists of users check-in venues
    multiUserCheckins = allCheckins[allCheckins.venueId.isin(userVenueGroups)]
    groupedUsers = multiUserCheckins.groupby('userId')
    userVenuesList = []
    userIds = []
    for index, group in enumerate(groupedUsers):
            userVenuesList.append(group[1]['venueId'].tolist())
            userIds.append(group[0])

    print "Venues in LDA:", len(userVenueGroups)

    venuesByUser = []
    for userList in userVenuesList:
        venuesByUser.append(' '.join(userList))


    import sklearn
    from sklearn.feature_extraction.text import CountVectorizer

    cv = sklearn.feature_extraction.text.CountVectorizer()
    mat = cv.fit_transform(venuesByUser).toarray()
    print('Done Document matrix')

    venuesVocab = cv.get_feature_names()

    # In[37]:

    import lda
    model = lda.LDA(n_topics=topicsNumber, n_iter=2000, random_state=1,alpha = 0.001)
    model.fit(mat)  # model.fit_transform(X) is also available
    topic_word = model.topic_word_  # model.components_ also works
    print('Done LDA fitting')

    # In[38]:

    n_top_venues = 10
    for i, venues_dist in enumerate(topic_word):
        indicies = np.argsort(venues_dist)[::-1]
        topic_venues = np.array(venuesVocab)[indicies]
        topic_probs = venues_dist[indicies]
        #print np.sort(venues_dist)[:-n_top_venues:-1]
        print('Cluster {}:'.format(i+1))
        for venueId, topicProb in zip(topic_venues, topic_probs):
            if topicProb>=0.01:
                print("{}, {} users {:.2f}%").format(venueNameFromId(allCheckins, venueId),countUsersAtVenue(venueId),topicProb*100)
            else:
                break
        print ''


    # # Create LDA users clusters
    clustersLDA = [[] for i in range(topicsNumber)]
    for index, userTopics in enumerate(model.ndz_):
        clustersLDA[np.argmax(userTopics)].append(userIds[index])

    # In[39]:

    def exportLDATopVenues(venues_clusters, allCheckins):
        topVenuesLDA = []
        for clustedId, venues_dist in enumerate(venues_clusters):
            indicies = np.argsort(venues_dist)[::-1]

            topic_venues = np.array(venuesVocab)[indicies]
            topic_probs = venues_dist[indicies]

            topVenuesIds =  [venueId for venueId, topicProb in zip(topic_venues, topic_probs) if topicProb>=0.01]
            topVenuesLDA.extend(topVenuesIds)

        return topVenuesLDA


    LDATopVenues = exportLDATopVenues(topic_word, allCheckins)

    LDAclusteredUsersDF = pd.DataFrame()
    for clusterId, clusterLDA in enumerate(clustersLDA):
        clusterCheckins = allCheckins[allCheckins.userId.isin(clusterLDA)]
        clusterCheckins["clusterId"] = clusterId + 1
        LDAclusteredUsersDF = LDAclusteredUsersDF.append(clusterCheckins)

    def extractComponents(row):
        date = datetime.utcfromtimestamp(row.createdAt+180*60)
        hours.append(date.hour)
        weekdays.append(date.weekday())

    hours = []
    weekdays = []

    LDAclusteredUsersDF.apply(extractComponents, axis=1)
    LDAclusteredUsersDF['hour'] = hours
    LDAclusteredUsersDF['weekday'] = weekdays

    LDAclusteredUsersDF.to_csv(folderRelativePath + 'LDAClusteredCheckins.tsv', sep="\t", encoding="utf-8")

    venueByCluster = [0 for i in range(topicsNumber)]
    for clusterCheckins in LDAclusteredUsersDF.groupby('clusterId'):
        names =  list(np.unique(clusterCheckins[1]['name'].tolist()))
        ids = list(np.unique(clusterCheckins[1]['venueId'].tolist()))
        venueByCluster[clusterCheckins[0] - 1] = {"names": names,
                                             "ids":ids}

    with open(folderRelativePath +'clustersTopVenues.json', 'w') as outfile:
            json.dump(venueByCluster, outfile)

    categoryByCluster = [[] for i in range(topicsNumber)]
    for clusterCheckins in LDAclusteredUsersDF.groupby('clusterId'):
        print clusterCheckins[0]
        for categoryId, group in clusterCheckins[1].groupby('categoryName').agg('size').order(ascending = False).iteritems():
            categoryByCluster[clusterCheckins[0]-1].append(categoryId)

    for index, category in enumerate(categoryByCluster):
        categoryByCluster[index] = categoryByCluster[index][:10]

    with open(folderRelativePath + 'clustersTopCategories.json', 'w') as outfile:
            json.dump(categoryByCluster, outfile)

venuesDict = {}
def venueNameFromId(allCheckins, venueId):
    if venueId not in venuesDict.keys():
        venuesDict[venueId] = allCheckins[allCheckins.venueId == venueId].iloc[0]['name']
    return venuesDict[venueId]

def countUsersAtVenue(allCheckins, venuedId):
    return len(np.unique(allCheckins[allCheckins.venueId == venueId]['userId'].tolist()))

projectName = 'test'
fileName = 'currentExtendedCheckinsHistory.tsv'
runLDA(projectName, fileName,10, 20)
