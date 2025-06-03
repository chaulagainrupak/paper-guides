import json 

def loadConfig(PATH):
    with open(PATH, 'r') as config:
        config = json.load(config)
    return config