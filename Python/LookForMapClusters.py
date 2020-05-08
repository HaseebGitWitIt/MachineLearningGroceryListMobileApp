import json
import sys

allMaps = {}
justMaps = []
names = []

DESIRED_NUM_CLUSTERS = 5
MAX_THRESHOLD = 100

with open("C:\\Users\\brams\\Downloads\\grocerylist-dd21a-export.json") as f:
    data = json.load(f)
    stores = data["stores"]
    for addr in stores:
        storesAtAddr = stores[addr]
        for store in storesAtAddr:
            maps = storesAtAddr[store]["maps"]
            for currMap in maps:
                if addr not in allMaps:
                    allMaps[addr] = {}
                if store not in allMaps[addr]:
                    allMaps[addr][store] = []
                allMaps[addr][store].append(currMap["map"])
                justMaps.append(currMap["map"])
                names.append(store + " - " + addr)

compDict = {}
for refMap in justMaps:
    compDict[str(refMap)] = {}
    for compMap in justMaps:
        score = 0

        refMapUnique = list(set(refMap) - set(compMap))
        compMapUnique = list(set(compMap) - set(refMap))

        refMapRem = [dep for dep in refMap if dep not in refMapUnique]
        compMapRem = [dep for dep in compMap if dep not in compMapUnique]

        meanDif = {}

        for i in range(len(refMapRem)):
            dep = refMapRem[i]
            if dep not in meanDif:
                meanDif[dep] = [i, -1]

        for i in range(len(compMapRem)):
            dep = compMapRem[i]
            if meanDif[dep][1] == -1:
                meanDif[dep][1] = i

        for key in meanDif:
            vals = meanDif[key]
            score += (vals[0] - vals[1]) ** 2

        score /= len(refMapRem)

        score += len(refMapUnique)
        score += len(compMapUnique)

        compDict[str(refMap)][str(compMap)] = score

for i in range(len(justMaps)):
    refMap = justMaps[i]
    currScores = []
    for j in range(len(justMaps)):
        compMap = justMaps[j]
        currScores.append(compDict[str(refMap)][str(compMap)])
    #print(names[i], currScores)

threshold = 0
currNumClusters = sys.maxint
clusters = []
while (threshold < MAX_THRESHOLD) and (currNumClusters > DESIRED_NUM_CLUSTERS):
    clusters = []
    for i in range(len(justMaps)):
        refMap = justMaps[i]
        currScores = []
        #print(names[i] + ": ")
        inCluster = False
        name1 = names[i]
        for j in range(len(justMaps)):
            compMap = justMaps[j]

            score = compDict[str(refMap)][str(compMap)]

            if (score != 0) and (score < threshold):
                #print("\t" + names[j])            
                name2 = names[j]
                found = False
                k = 0
                while (k < len(clusters)) and (not found):
                    if (name1 in clusters[k]) and (name2 not in clusters[k]):
                        clusters[k].add(name2)
                        found = True
                    elif (name1 not in clusters[k]) and (name2 in clusters[k]):
                        clusters[k].add(name1)
                        found = True
                    elif (name1 in clusters[k]) and (name2 in clusters[k]):
                        found = True     
                    k += 1

                if (not found):
                    newCluster = set([name1, name2])
                    clusters.append(newCluster)

                inCluster = True

        if (not inCluster):
            clusters.append({name1})

    currNumClusters = len(clusters)
    threshold += 1

if threshold < MAX_THRESHOLD:
    threshold -= 1

print(threshold, len(clusters))
for cluster in clusters:
    print(cluster)







