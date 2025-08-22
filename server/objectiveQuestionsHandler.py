import sqlite3
from datetime import datetime
import uuid
import random
from databaseHandler import DB_OBJECTIVE_QUESTIONS_PATH
import hashlib


def insertMcqQuestion(
    board: str,
    subject: str,
    topic: str,
    points: int,
    level: str,
    component: str,
    question: str,
    answers: list,
    options: list,
    explanation: str,
    ip: str,
    user: str,
) -> bool:
    try:
        uuidStr = str(uuid.uuid4())
        conn = sqlite3.connect(DB_OBJECTIVE_QUESTIONS_PATH)
        cursor = conn.cursor()

        db_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            """INSERT INTO mcq_questions
            (uuid, subject, topic, points, board, level, component, 
            question, answers, options, explanation,submittedFrom, submittedBy,submitDate, approved, approvedBy,approvedOn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?, ?)""",
            (
                uuidStr,
                subject.lower(),
                topic.lower(),
                points.lower(),
                board.lower(),
                level.lower(),
                component,
                question,
                str(answers),
                str(options),
                explanation,
                ip,
                user,
                db_time,
                True,
                user,
                db_time,
            ),
        )

        conn.commit()
        # logger.info(f"Question inserted: {uuidStr}")
        return True
    except Exception as e:
        # logger.error(f"Error inserting question: {e}")
        print(e)
        return False
    finally:
        if conn:
            conn.close()


def generateMcqTest(
    subjects: list,
    board: str,
    level: str,
    totalPoints: int,
    topics: list = None,
    mode: str = "test",
):
    conn = None
    try:
        conn = sqlite3.connect(DB_OBJECTIVE_QUESTIONS_PATH)
        cursor = conn.cursor()

        query = "SELECT uuid, question, points, answers, options, topic FROM mcq_questions WHERE approved = 1"
        params = []

        if subjects:
            query += f" AND subject IN ({', '.join([f'\'{subject.lower()}\'' for subject in subjects])})"
        if board:
            query += " AND board = ?"
            params.append(board.lower())
        if level:
            query += " AND level = ?"
            params.append(level.lower())
        if topics:
            query += f" AND topic IN ({', '.join([f'\'{topic.lower()}\'' for topic in topics])})"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        print(query, params)

        if not rows:
            return {"error": "No questions found for given filters."}

        random.shuffle(rows)
        selectedQuestions = []
        testAnswers = []
        accumulatedPoints = 0
        testOptions = []

        for row in rows:
            uuidStr, question, points, answers, options, topic = row
            if accumulatedPoints >= totalPoints:
                break

            questionObj = {
                "uuid": uuidStr,
                "question": question,
                "points": points,
                "topic": topic,
            }

            if mode == "practice":
                questionObj["options"] = eval(options)
                questionObj["answers"] = eval(answers)
            elif mode == "test":
                testOptions.extend(
                    random.sample(
                        eval(options),
                        (
                            3
                            if len(eval(options)) >= 3
                            else 2 if len(eval(options)) == 2 else 1
                        ),
                    )
                )
                correctOption = random.sample(eval(answers), 1)
                testOptions.extend(correctOption)
                random.shuffle(testOptions)
                questionObj["options"] =  testOptions

                testAnswers.append({"questionUuid": uuidStr, "answer": correctOption})
                testOptions = []

            selectedQuestions.append(questionObj)
            accumulatedPoints += points

        testUuid = str(uuid.uuid4())
        testJson = {
            "testUuid": testUuid,
            "subject": subjects,
            "board": board,
            "level": level,
            "topics": topics,
            "requestedPoints": totalPoints,
            "finalPoints": accumulatedPoints,
            "generatedOn": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": mode,
            "questions": selectedQuestions,
        }

        answerJson = {
            "testUuid": testUuid,
            "subject": subjects,
            "board": board,
            "level": level,
            "topics": topics,
            "requestedPoints": totalPoints,
            "finalPoints": accumulatedPoints,
            "generatedOn": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": mode,
            "answers": testAnswers,
        }
        testHash = hashlib.sha256(str(testJson).encode())

        print(answerJson)
        return testJson

    except Exception as e:
        print("Error generating test:", e)
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


# insertMcqQuestion("A Levels", "Mathematics (9709)", "Binomial Expansion", 2, "AS level", 12, "Expand  this thing man...", ["correct1", "correct2", "correct3"], ["wronfg3", "wronfg2", "wronfg1", "wronfg4", "wronfg5"], "As this is the most bullshit thing and what not", "0.0.0.0", "usera")

test = generateMcqTest(
    ["Mathematics (9709)"],
    "A Levels",
    "AS level",
    10,
    topics=["Binomial Expansion"],
    mode="test",
)
print(test)
