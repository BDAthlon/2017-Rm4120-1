"""

Authors: Leandro Watanabe and Tramy Nguyen

"""

import sys
import getopt
import xml.etree.ElementTree as ET
import json
import requests


class Drug:
    """
    This class is used to encapsulate a drug along with its properties and interactions to other drugs.
    """
    def __init__(self):
        self.__id = None
        self.__name = None
        self.__unii = None
        self.__interactions = []
        self.__containsInteractions = set()

    @property
    def id(self):
        return self.__id;    

    @id.setter
    def id(self, value):
        if value != None:
            value = int(value[2:])
        self.__id = value

    @property
    def name(self):
        return self.__name;

    @name.setter   
    def name(self, value):
        if value != None:
            value = value.lower()
        self.__name = value

    @property
    def unii(self):
        return self.__unii;

    @unii.setter   
    def unii(self, value):
        if value != None:
            value = value.lower()
        self.__unii = value
    
    def addInteraction(self, value, limit):
        if value != None:
            value = int(value[2:])
            if value <= limit:
                if not (value in self.__containsInteractions):
                    self.__interactions.append(value)
                    self.__containsInteractions.add(value)

    def __repr__(self):
        dict = self.__dict__
        del dict['_Drug__containsInteractions']
        return json.dumps(dict)
    
class DrugTreatment:
    """
    This class is used to track a drug and its usage.
    """
    def __init__(self, id):
        self.__id = id
        self.__prevent = []
        self.__treat = []
    def addTreatment(self, type, value):
        if type == 'may_treat':
            self.__treat.append(value.lower())
        elif type == 'may_prevent':
            self.__prevent.append(value.lower())

    def __repr__(self):
        return json.dumps(self.__dict__)
    
class DrugSideEffects:
    """
    This class is used to track a drug and its usage.
    """
    def __init__(self, id):
        self.__id = id
        self.__sideEffects = []
        

    def addSideEffect(self, value, count):
        self.__sideEffects.append({"label":value.lower(), "count": count})
        
    def __repr__(self):
        return json.dumps(self.__dict__)
    
class DrugStatistics:
    """
    This class is used to track statistics about a drug.
    """
    def __init__(self, id):
        self.__id = id
        self.__sex = [{"count":0, "label": "male"},{"count":0, "label": "female"}]
        self.__weight = [{"count":0, "label": "< 60"}, {"count":0, "label": "60-69"}, {"count":0, "label": "70-79"}, {"count":0, "label": "80-89"},
                         {"count":0, "label": "90-99"}, {"count":0, "label": "100-109"}, {"count":0, "label": "110-119"}, {"count":0, "label": "120-129"}, {"count":0, "label": "130-139"},
                         {"count":0, "label": "140-149"}, {"count":0, "label": "> 149"}]
        self.__age = [{"count":0, "label": "< 10"}, {"count":0, "label": "10-19"}, {"count":0, "label": "20-29"}, {"count":0, "label": "30-39"}, {"count":0, "label": "40-49"},
                      {"count":0, "label": "50-59"},{"count":0, "label": "60-69"}, {"count":0, "label": "70-79"}, {"count":0, "label": "80-89"}, {"count":0, "label": "90-99"},
                      {"count":0, "label": "> 99"}]

    def addSex(self, sex_type, value):
        if sex_type == 1:
            self.__sex[0]["count"] += value
        elif sex_type == 2:
             self.__sex[1]["count"] += value
             
    def addWeight(self, weight_type, value):
        if weight_type <= 50:
            self.__weight[0]["count"] += value
        elif weight_type >= 150:
            self.__weight[10]["count"] += value
        else:
            index =  int((weight_type - 50) / 10)
            self.__weight[index]["count"] += value

    def addAge(self,age_type, value):
            if age_type > 100:
                index = 10
            else:
                index =  int(age_type / 10)
            self.__age[index]["count"] += value
            
    def __repr__(self):
        return json.dumps(self.__dict__)
                                                                
def writeJson(filename, obj):
    """
    This function is used to write a json file given a collection of items
    """
    with open(filename, 'w') as f:
        f.write(str(obj))

def getSearchStatsURL(base_url, search_type, drug_name):
    """
    This function is used to construct the URL to retrive the count of occurences of a certain drug.
    """
    unii_search = 'patient.drug.activesubstance.activesubstancename:' +drug.name.replace(' ', '+')
    type_count = 'count=' + search_type
    url = base_url + '+AND+' +  unii_search + '&' + type_count
    return url
                
def queryStatistics(drug):
    """
    This function is used to retrieve the statistics of a certain drug.
    """
    if drug.name == None:
        return None

    drug_stats = DrugStatistics(drug.id)
    
    base_url = 'https://api.fda.gov/drug/event.json?search=receivedate:[20040101+TO+20161021]'
    key = 'results'
    
    search_sex = 'patient.patientsex'
    search_weight = 'patient.patientweight'
    search_age = 'patient.patientonsetage'
    
    request_sex = requests.get(getSearchStatsURL(base_url, search_sex, drug.name))
    request_weight = requests.get(getSearchStatsURL(base_url, search_weight, drug.name))
    request_age = requests.get(getSearchStatsURL(base_url, search_age, drug.name))

    if request_sex.ok:
        data = request_sex.json()
        if key in data:
            for entry in data[key]:
                drug_stats.addSex(entry['term'], entry['count'])

    if request_weight.ok:
        data = request_weight.json()
        if key in data:
            for entry in data[key]:
                drug_stats.addWeight(entry['term'], entry['count'])
                
    if request_age.ok:
        data = request_age.json()
        if key in data:
            for entry in data[key]:
                drug_stats.addAge(entry['term'], entry['count'])
                
    return drug_stats

def querySideEffects(drug):
    """
    This function is used to query information about a drug and some reported side effects.
    """
    if drug.name == None:
        return None

    sideEffect = DrugSideEffects(drug.id)
    base_url = 'https://api.fda.gov/drug/event.json?search=receivedate:[20040101+TO+20161021]'
    key = 'results'
    search_side = 'patient.reaction.reactionmeddrapt.exact'  
    request = requests.get(getSearchStatsURL(base_url, search_side, drug.name))

    if request.ok:
        data = request.json()
        if key in data:
            for entry in data[key]:
                sideEffect.addSideEffect(entry['term'],entry['count'])
    return sideEffect
           
def queryTreatment(drug):
    """
    This function is used to query information about a drug and its used usage.
    """
    if drug.name == None:
        return None

    url = 'https://rxnav.nlm.nih.gov/REST/rxclass/class/byDrugName.json'
    drug_treatment = DrugTreatment(drug.id)
    drug_name = drug.name.replace(' ', '+')
    payload = {'drugName' : drug_name}
    request = requests.get(url, params=payload)

    if request.ok:
        data = request.json();
        if 'rxclassDrugInfoList' in data and 'rxclassDrugInfo' in data['rxclassDrugInfoList']:
            for drug_info in data['rxclassDrugInfoList']['rxclassDrugInfo']:
                drug_type = drug_info['rela']
                drug_value = drug_info['rxclassMinConceptItem']['className']
                drug_treatment.addTreatment(drug_type, drug_value)

    return drug_treatment
                           
if __name__ == "__main__":
    argv = sys.argv[1:]
    verbose = False
    drug_limit = float("inf")
    c = 1
    try:
        opts, args = getopt.getopt(argv,"hvn:")
    except getopt.GetoptError:
        print('Run using data_retrieve.py [-h -v -n <value>]')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('This script is used to retrieve information about different types of drugs')
            print('Arguments:')
            print('-v: verbose option')
            print('-n <value>: set limit of drugs for the dataset')
            sys.exit()
        elif opt in ("-v"):
            verbose = True
        elif opt in ("-n"):
            drug_limit = int(arg)

    if verbose:
        print('Parsing dataset from the DrugBank dataset')
    
    tree = ET.parse('../resources/data/drug_bank.xml')
    root = tree.getroot()
    ns = "{http://www.drugbank.ca}"
    drugs = []
    treatments = []
    stats = []
    sideEffects = []

    
    if verbose:
        print('Finished parsing dataset from the DrugBank dataset')
        
    for child in root:

        if c > drug_limit:
            break
        
        drug = Drug()
        drugs.append(drug)

        if verbose:
            print('Parsing drug ' + str(c))
        
        drug.id = child.find(ns+'drugbank-id').text
        drug.name = child.find(ns+'name').text
        drug.unii = child.find(ns+'unii').text

        if verbose:
            print('Corresponds to drug ' + str(drug.name))

        if verbose:
            print('Querying drug usage')   
        drug_treatment = queryTreatment(drug)

        if verbose:
            print('Querying drug statistics')
        drug_statistics = queryStatistics(drug)
        
        if verbose:
            print('Querying drug side effects')
        drug_sideEffect = querySideEffects(drug)
        
        if drug_treatment != None:
            treatments.append(drug_treatment)

        if drug_statistics != None:
            stats.append(drug_statistics)
            
        if drug_sideEffect != None:
            sideEffects.append(drug_sideEffect)

        if verbose:
            print('Querying interactions')
            
        for interaction in child.iter(ns+'drug-interaction'):
            drug_interaction = interaction.find(ns+'drugbank-id').text
            drug.addInteraction(drug_interaction, drug_limit)
        c+=1
          
    if verbose:
        print('Finished. Writing JSON files')
        
    writeJson('../resources/data/drugs.json',  drugs)
    writeJson('../resources/data/treatments.json',  treatments)
    writeJson('../resources/data/statistics.json',  stats)
    writeJson('../resources/data/sideeffects.json',  sideEffects)

    if verbose:
        print('All done!')
