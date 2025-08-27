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
            (uuid, subject, topic, points, board, component, 
            question, answers, options, explanation,submittedFrom, submittedBy,submitDate, approved, approvedBy,approvedOn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?, ?)""",
            (
                uuidStr,
                subject.lower(),
                topic.lower(),
                points,
                board.lower(),
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


# i've removed levels too
def generateMcqTest(
    subjects: list,
    board: str,
    totalPoints: int,
    topics: list,
    generatedBy: str,
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
        # if level:
        #     query += " AND level = ?"
        #     params.append(level.lower())
        if topics:
            query += f" AND topic IN ({', '.join([f'\'{topic.lower()}\'' for topic in topics])})"

        cursor.execute(query, params)
        rows = cursor.fetchall()

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
            questionObj["options"] = testOptions

            testAnswers.append({"questionUuid": uuidStr, "answer": correctOption})
            testOptions = []
        
            selectedQuestions.append(questionObj)
            accumulatedPoints += points

        testUuid = str(uuid.uuid4())
        testGenTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        testJson = {
            "testUuid": testUuid,
            "subjects": subjects,
            "board": board,
            # "level": level,
            "topics": topics,
            "requestedPoints": totalPoints,
            "finalPoints": accumulatedPoints,
            "generatedOn": testGenTime,
            "questions": selectedQuestions,
        }

        answerJson = {
            "testUuid": testUuid,
            "subjects": subjects,
            "board": board,
            # "level": level,
            "topics": topics,
            "requestedPoints": totalPoints,
            "finalPoints": accumulatedPoints,
            "generatedOn": testGenTime,
            "answers": testAnswers,
        }
        
        #  Lets not save the generated things yet as we don;t have much data and writing costs precious CPU time 
        
        # cursor.execute(
        #     """ INSERT INTO generated_mcq_questions (uuid, generatedTest, answerKey, generatedBy, generatedOn) VALUES (?,?,?,?,?)""",
        #     (testUuid, str(testJson), str(answerJson), generatedBy, testGenTime),
        # )
        conn.commit()
        return {"questionSheet": testJson, "answerSheet": answerJson}

    except Exception as e:
        print("Error generating test:", e)
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


# insertMcqQuestion("A Levels", "Mathematics (9709)", "Binomial Expansion", 2, "12", "Expand as dasdthis thing man...", ["correct1", "correct2", "correct3"], ["wronfg3", "wronfg2", "wronfg1", "wronfg4", "wronfg5"], "As this is the most bullshit thing and what not", "0.0.0.0", "usera")

# insertMcqQuestion("A Levels", "Mathematics (9709)", "Binomial Expansion", 2, "12", "Expand  9012380 this thing man...", ["correct1", "correct2", "correct3"], ["wronfg3", "wronfg2", "wronfg1", "wronfg4", "wronfg5"], "As this is the most bullshit thing and what not", "0.0.0.0", "usera")

# insertMcqQuestion("A Levels", "Mathematics (9709)", "Binomial Expansion", 2, "12", "Expand  this thing man... 12903801928 ", ["correct1", "correct2", "correct3"], ["wronfg3", "wronfg2", "wronfg1", "wronfg4", "wronfg5"], "As this is the most bullshit thing and what not", "0.0.0.0", "usera")

# test = generateMcqTest(
#     ["Mathematics (9709)"],
#     "A Levels",
#     6,
#     ["Binomial Expansion"],
#     "StupidGut",
# )
# print(test)
