from fastapi import APIRouter, Request, HTTPException
from jose import jwt
import time
from picPatcher import process_images
from updater import sendWebhook
import os
from dotenv import load_dotenv
from databaseHandler import *
import sqlite3

load_dotenv(".env")
SECRET_KEY = os.getenv("SECRET_KEY")

adminRouter = APIRouter()
DATABASE_PATH = "instance/paper-guides.db"


def getDbConnection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def getUserFromRequest(request: Request):
    authHeader = request.headers.get("authorization")
    if not authHeader or not authHeader.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header"
        )

    token = authHeader.split(" ")[1]
    tokenData = jwt.decode(token, SECRET_KEY)

    if tokenData["exp"] < time.time():
        raise HTTPException(status_code=429, detail="Token expired")

    conn = getDbConnection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM users WHERE username = ? AND email = ?",
        (tokenData["username"], tokenData["email"]),
    )
    user = cur.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return user


def requireAdmin(user):
    if user["role"].lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


def requireModeratorOrAdmin(user):
    if user["role"].lower() not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Unauthorized")


@adminRouter.post("/submitPaper")
async def submitPaper(request: Request):
    try:
        user = getUserFromRequest(request)
        requireModeratorOrAdmin(user)

        form = await request.form()
        board = form.get("board")
        subject = form.get("subject")
        year = form.get("year")
        topic = form.get("topic") if not year else None
        paper_type = "yearly" if year else "topical"
        session = form.get("session")
        level = form.get("level")
        component = form.get("component")
        questionFile = await form.get("questionFile").read()
        solutionField = form.get("solutionFile")
        solutionFile = await solutionField.read() if solutionField else None

        formatted_year = year
        if session and year:
            session_display = {
                "specimen": "Specimen",
                "feb-mar": "Feb / Mar",
                "may-june": "May / June",
                "oct-nov": "Oct / Nov",
            }
            formatted_year = f"{year} ({session_display.get(session, session)})"

        if paper_type == "yearly":
            if not year:
                raise ValueError("Year is required for yearly papers")
            result = insertPaper(
                board,
                subject,
                formatted_year,
                level,
                component,
                questionFile,
                solutionFile,
                user=user["username"],
                ip=None,
            )
        elif paper_type == "topical":
            result = insertTopical(
                board,
                subject,
                topic,
                questionFile,
                solutionFile,
                user=user["username"],
                ip=None,
            )
        else:
            raise ValueError(f"Invalid paper type: {paper_type}")

        if result:
            return {"message": "got it"}, 200

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="internal server error")


@adminRouter.post("/submitQuestion")
async def submitQuestionToDb(request: Request):
    try:
        user = getUserFromRequest(request)
        requireModeratorOrAdmin(user)

        form = await request.form()
        board = form.get("board")
        subject = form.get("subject")
        topic = form.get("topic")
        component = form.get("component")
        difficulty = form.get("difficulty")
        level = form.get("level")

        processedQuestion = await process_images(form.getlist("questionImages"))
        processedSolution = await process_images(form.getlist("solutionImages"))

        successfulInsert = insertQuestion(
            board,
            subject,
            topic,
            difficulty,
            level,
            component,
            processedQuestion,
            processedSolution,
            approved=(user["role"].lower() == "admin"),
            user=user["username"],
            ip=None,
        )

        # now we only send a webhook when approved

        # if successfulInsert:
        #     sendWebhook(
        #         "question",
        #         {
        #             "subject": subject,
        #             "topic": topic,
        #             "difficulty": difficulty,
        #             "board": board,
        #             "level": level,
        #             "component": component,
        #             "username": user["username"],
        #         },
        #     )

        return {"message": "got it"}, 200

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="internal server error")


@adminRouter.post("/postNote")
async def postNote(request: Request):
    try:
        user = getUserFromRequest(request)
        requireModeratorOrAdmin(user)

        body = await request.json()
        board = body.get("board")
        level = body.get("level")
        subject = body.get("subject")
        topic = body.get("topic")
        content = body.get("content").strip()

        if len(content) < 1000:
            raise HTTPException(status_code=401, detail="Not enough content!")

        insertNote(
            board,
            level,
            subject,
            topic,
            content,
            approved=(user["role"].lower() == "admin"),
            user=user["username"],
        )

        return {"message": "got it"}, 200

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="internal server error")


@adminRouter.get("/getPaper/{uuid}")
def getSpecificPaper(request: Request, uuid: str):
    try:

        # user = getUserFromRequest(request)
        # requireAdmin(user)

        return getPaperUuid(uuid)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="internal server error")


@adminRouter.get("/getUnapproved")
async def getUnapproved(request: Request, q: str, count: int | None = 10):
    try:

        user = getUserFromRequest(request)
        requireAdmin(user)

        randomSample = True if count < 0 else False
        if q.lower() == "papers":
            papers = getUnapprovedPapers()
            return (
                random.sample(papers, len(papers))
                if randomSample
                else papers[: min(count, len(papers))]
            )
        elif q.lower() == "questions":
            questions = getUnapprovedQuestions()
            return (
                random.sample(questions, len(questions))
                if randomSample
                else questions[: min(count, len(questions))]
            )
        return []
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="internal server error")


# @adminRouter.post("/approve")
# async def approveQuestion(questionId: int, request: Request):
#     user = getUserFromRequest(request)
#     requireAdmin(user)

#     markQuestionAsApproved(questionId, approvedBy=user["username"])
#     return {"message": "approved"}, 200
