from fastapi import FastAPI, Form, HTTPException, Depends, Request, Form, File,  UploadFile

from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from datetime import datetime, timedelta
import sqlite3
import bcrypt
from werkzeug.security import check_password_hash

from config import loadConfig
from databaseHandler import * 
from turnstileVerify import verifyTurnstileToken
import base64
import time

from picPatcher import process_images

# Load configuration
CONFIG_PATH = './configs/configs.json'
CONFIG = loadConfig('./configs/configs.json')

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

initializeDatabases()

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


@app.get('/config')
def config():
    return CONFIG

@app.get('/pastpapers')
def pastpapers():
    data = {
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

@app.get('/getYears/{subjectName}')
async def geatYearsForSubject(subjectName: str):

    try:
        list = getYears('A Level', subjectName)
        return {'years': list}, 200  
    except Exception as e:
        print(e)
        raise HTTPException(status_code=503, detail="No data found")


@app.get('/getPapers/{subjectName}/{year}')
async def getPapers(year: str, subjectName: str):

    try:
        list = getPaperComponents( year, subjectName , 'a level')
        return {'components': list}, 200  
    except Exception as e:
        print(e)
        raise HTTPException(status_code=503, detail="No data found")

@app.get("/getData/{details}")
async def getData(details: str):
    try:
        isInsert = False

        details.replace('%20', ' ')
        #    Because subjectSlug itself may contain "%20" but not a literal hyphen.
        parts = details.split("-", 1)
        if len(parts) < 2:
            raise ValueError("Expected at least one '-' in details.")
        subjectSlug, remainder = parts[0], parts[1]

        subjectName = subjectSlug

        if 'insert' in remainder:
            isInsert = True
            remainder = remainder.replace("-insert-paper", '')
            print(remainder)

        if remainder.startswith("question-paper-"):
            paperTypeDisplay = "Question Paper"
            remainder = remainder[len("question-paper-"):]
        elif remainder.startswith("mark-scheme-"):
            paperTypeDisplay = "Mark Scheme"
            remainder = remainder[len("mark-scheme-"):]
        else:
            raise ValueError("Expected 'question-paper-' or 'mark-scheme-' prefix.")

        rem_parts = remainder.split("-")
        if len(rem_parts) != 4:
            raise ValueError("Expected remainder in form 'XX-YYYY-sss-sss'.")
        componentCode = rem_parts[0]  
        yearStr = rem_parts[1]       
        sessionSlug = rem_parts[2] + "-" + rem_parts[3] 

        session_map = {
            "feb-mar": "Feb / Mar",
            "may-june": "May / June",
            "oct-nov": "Oct / Nov",
        }
        sessionDisplay = session_map.get(sessionSlug.lower())
        if not sessionDisplay:
            raise ValueError(f"Unknown session slug '{sessionSlug}'.")

        yearForGetPaper = f"{yearStr} ({sessionDisplay})"
        componentForGetPaper = f"{componentCode}"

        if isInsert:
            print(f'{yearForGetPaper} Insert Paper')
            data = getPaper(
            "a level", subjectName, f"{yearForGetPaper} Insert Paper" , componentForGetPaper
            )

        data = getPaper(
            "a level", subjectName, yearForGetPaper, componentForGetPaper
        )



        return {
            "questionName": f"{subjectName.capitalize()}, {yearForGetPaper}, {componentForGetPaper}",
            "questionData": base64.b64encode(data[0]),
            "markSchemeData": base64.b64encode(data[1]),
        }, 200

    except ValueError as ve:
        # Bad format in details
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Any other failure
        print("Error in getData:", e)
        raise HTTPException(status_code=503, detail="No data found")

        
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
    isValid =  verifyTurnstileToken(token)
    if not isValid:
        raise HTTPException(status_code=400, detail="Turnstile Captcha verification failed, reload the page and try again!")
    
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
    isValid =  verifyTurnstileToken(token)
    if not isValid:
        raise HTTPException(status_code=400, detail="Turnstile Captcha verification failed, reload the page and try again!")

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

        token = data["accessToken"]
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
            return {"message": "token verified", "user": username, "role" : user["role"]   }, 200
    except Exception as e:
        print(e)
        return {"message": "token verification failed"}, 429




@app.post('/submitQuestion')
async def submitQuestionToDb(request: Request):

    try:
        conn = getDbConnection()
        cur = conn.cursor()
        
        authHeader = request.headers.get("authorization")

        if not authHeader or not authHeader.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

        token = authHeader.split(" ")[1]


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
        if user["role"].lower() != 'admin':
            raise HTTPException(status_code=401, detail="Unauthorized")

        form = await request.form()

        board = form.get("board")
        subject = form.get("subject")
        topic = form.get("topic")
        component = form.get("component")
        difficulty = form.get("difficulty")
        level = form.get("level")

        processedQuestion = await process_images(form.getlist("questionImages"))
        processedSolution = await process_images(form.getlist("solutionImages"))

        insertQuestion(board, subject, topic, difficulty,  level, component, processedQuestion, processedSolution, username, ip=None)
        return {"message": "got it"}, 200

    except Exception as e:
        print(e)
        return {'message': e}



def getClientIp(request):
    # Try to get the IP from the 'X-Forwarded-For' header (Cloudflare/proxy header)
    return request.headers.get('X-Forwarded-For', request.remote_addr)