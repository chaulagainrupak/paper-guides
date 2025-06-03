from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from config import loadConfig

config = loadConfig('./configs/configs.json')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://paperguides.org", "https://beta.paperguides.org"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/pastpapers')
def pastpapers():

    data = {
        "NEB":{
            "levels": ["10", "11", "12"]
        },
        "A Levels":{
            "levels": ["As Level", "A Level"]
        }
    }
    return data


@app.get('/subjects/{board}/')
@app.get('/subjects/{board}/{optional_level}')
async def getSubjects(board: str, optional_level = None):
    
    if board.lower() in ["a levels", "as level", "a level", "as levels"]:
        return config["A Levels"]["subjects"]
    else:
        for key in config:
            if key.lower() == board.lower():
                return config[key]["subjects"]


@app.get('/getAds')
def pastpapers():

    data = {
        "Title": "YouTube",
        "Image": None,
    }
    return data
