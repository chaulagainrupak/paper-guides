import sqlite3
from datetime import datetime
import uuid 
import random
from databaseHandler import DB_OBJECTIVE_QUESTIONS_PATH 

def insertMcqQuestion(board: str, subject: str, topic: str, points: int, 
                  level: str, component: str, question: str, 
                  answers: list, options: list, ip: str, user: str) -> bool:
    """Insert a new question into the database"""
    try:
        uuidStr = str(uuid.uuid4())
        conn = sqlite3.connect(DB_OBJECTIVE_QUESTIONS_PATH)
        cursor = conn.cursor()
        
        db_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute('''INSERT INTO mcq_questions
            (uuid, subject, topic, points, board, level, component, 
            question, answers, options, submittedFrom, submitDate, approved, approvedBy,approvedOn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?)''',
            (uuidStr, subject, topic, points, board, level, component,
             question, str(answers), str(options), ip, db_time, True, user,db_time))
        
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


def generateMcqTest(subject: str, board: str, level: str, totalPoints: int, topic: str = None, mode: str = "test"):
    conn = None
    try:
        conn = sqlite3.connect(DB_OBJECTIVE_QUESTIONS_PATH)
        cursor = conn.cursor()

        query = "SELECT uuid, question, points, answers, options, topic FROM mcq_questions WHERE approved = 1"
        params = []

        if subject:
            query += " AND subject = ?"
            params.append(subject)
        if board:
            query += " AND board = ?"
            params.append(board)
        if level:
            query += " AND level = ?"
            params.append(level)
        if topic:
            query += " AND topic = ?"
            params.append(topic)

        cursor.execute(query, params)
        rows = cursor.fetchall()

        if not rows:
            return {"error": "No questions found for given filters."}

        random.shuffle(rows)

        selectedQuestions = []
        accumulatedPoints = 0

        for row in rows:
            uuidStr, question, points, answers, options, topic = row
            if accumulatedPoints >= totalPoints:
                break

            questionObj = {
                "uuid": uuidStr,
                "question": question,
                "options": eval(options),
                "points": points,
                "topic": topic
            }

            if mode == "practice":
                questionObj["answers"] = eval(answers)

            selectedQuestions.append(questionObj)
            accumulatedPoints += points

        testUuid = str(uuid.uuid4())
        testJson = {
            "testUuid": testUuid,
            "subject": subject,
            "board": board,
            "level": level,
            "requestedPoints": totalPoints,
            "finalPoints": accumulatedPoints,
            "generatedOn": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "mode": mode,
            "questions": selectedQuestions
        }

        return testJson

    except Exception as e:
        print("Error generating test:", e)
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


test = generateMcqTest("chem", "something" ,"A levels", 10, mode="practice")
print(test)