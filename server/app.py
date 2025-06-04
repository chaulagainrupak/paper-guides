from fastapi import FastAPI, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from datetime import datetime, timedelta
import sqlite3
import bcrypt
from werkzeug.security import check_password_hash

from config import loadConfig
from turnstileVerify import verifyTurnstileToken

import time

# Load configuration
config = loadConfig('./configs/configs.json')

# Constants
SECRET_KEY = "super-secret-key"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

DATABASE_PATH = "instance/paper-guides.db"

# Init FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://paperguides.org", "https://beta.paperguides.org"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Utility Functions ----------
def getDbConnection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def createAccessToken(data: dict, expiresDelta: timedelta = None):
    toEncode = data.copy()
    expire = datetime.utcnow() + (expiresDelta or timedelta(minutes=720))
    toEncode.update({"exp": expire})
    return jwt.encode(toEncode, SECRET_KEY, algorithm=ALGORITHM)


def verifyPassword(plainPassword, hashedPassword):
    if isinstance(hashedPassword, bytes):
        hashedPassword = hashedPassword.decode()

    #detect our old password format and allow them to log in 
    if hashedPassword.startswith("pbkdf2:") or hashedPassword.startswith("scrypt:"):
        try:
            return check_password_hash(hashedPassword, plainPassword)
        except Exception:
            return False
    else:
        try:
            return bcrypt.checkpw(plainPassword.encode(), hashedPassword.encode())
        except Exception:
            return False


def hashPassword(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())



@app.get('/pastpapers')
def pastpapers():
    data = {
        "NEB": {
            "levels": ["10", "11", "12"]
        },
        "A Levels": {
            "levels": ["As Level", "A Level"]
        }
    }
    return data


@app.get('/subjects/{board}/')
@app.get('/subjects/{board}/{optional_level}')
async def getSubjects(board: str, optional_level=None):
    if board.lower() in ["a levels", "as level", "a level", "as levels"]:
        return config["A Levels"]["subjects"]
    else:
        for key in config:
            if key.lower() == board.lower():
                return config[key]["subjects"]
    raise HTTPException(status_code=404, detail="Board not found")


@app.get('/getAds')
def getAds():
    data = {
        "Title": "YouTube",
        "Image": None,
    }
    return data


@app.post('/signup')
async def signup(body: Request):
    conn = getDbConnection()
    cur = conn.cursor()

    data = await body.json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    token = data.get("token") 

    # Verify Turnstile token
    isValid = await verifyTurnstileToken(token)
    if not isValid:
        raise HTTPException(status_code=400, detail="Turnstile verification failed")
    
    cur.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, email))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists")

    hashedPw = hashPassword(password)
    cur.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (username, email, hashedPw))
    conn.commit()
    conn.close()

    return {"message": "User created successfully"}


@app.post('/login')
async def login(body: Request):
    conn = getDbConnection()
    cur = conn.cursor()

    data = await body.json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    token = data.get("token") 

    # Verify Turnstile token
    isValid = await verifyTurnstileToken(token)
    if not isValid:
        raise HTTPException(status_code=400, detail="Turnstile verification failed")

    cur.execute("SELECT * FROM users WHERE username = ? AND email  = ? ", (username,email))
    user = cur.fetchone()
    conn.close()

    if not user or not verifyPassword(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    accessToken = createAccessToken(
        data={"username": user["username"], "email": user["email"]},
        expiresDelta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "accessToken": accessToken,
        "tokenType": "bearer"
    }


@app.post('/validateToken')
async def validateToken(body: Request):


    try:
        conn = getDbConnection()
        cur = conn.cursor()
        data = await body.json()

        token = data.get("accessToken")
        tokenData = jwt.decode(token, SECRET_KEY)

        username = tokenData["username"]
        email = tokenData["email"]
        exp = tokenData["exp"]


        if exp < time.time():
            return {"message": "token expired"}, 429

        cur.execute("SELECT * FROM users WHERE username = ? AND email  = ? ", (username,email))
        user = cur.fetchone()
        conn.close()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        else:
            return {"message": "token verified"}, 200
    except Exception as e:
        print(e)
        return {"message": "token verification failed"}, 429


