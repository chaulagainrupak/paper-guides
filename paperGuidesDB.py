import sqlite3
import uuid
import os
import zlib
import json
import base64
import random
import requests
from datetime import datetime
from dotenv import load_dotenv
import hashlib

load_dotenv()
from logHandler import getCustomLogger

logger = getCustomLogger(__name__)

dbPath = './instance/paper-guides-resources.db'

def createDatabase():
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()


        # Create papers table
        db.execute('''CREATE TABLE IF NOT EXISTS papers
        (id INTEGER PRIMARY KEY,
        uuid TEXT UNIQUE,
        subject TEXT,
        year INTEGER,
        component TEXT,
        board TEXT,
        level INTEGER,
        questionFile BLOB,
        solutionFile BLOB ,
        approved DEFAULT False)''')


        # Create questions table
        db.execute('''CREATE TABLE IF NOT EXISTS questions
        (id INTEGER PRIMARY KEY,
        uuid TEXT UNIQUE,
        subject TEXT,
        topic TEXT,
        difficulty INTEGER,
        board TEXT,
        level INTEGER,
        component TEXT,
        questionFile BLOB,
        solutionFile BLOB,
        approved DEFAULT False,
        one INTEGER DEFAULT 0,
        two INTEGER DEFAULT 0,
        three INTEGER DEFAULT 0,
        four INTEGER DEFAULT 0,
        five INTEGER DEFAULT 0)''')

        # Create the topicals table

        db.execute(''' CREATE TABLE IF NOT EXISTS topicals
        (id INTEGER PRIMARY KEY,
        uuid TEXT UNIQUE,
        subject TEXT,
        board TEXT,
        questionFile BLOB,
        solutionFile BLOB )''')


        # Create the ratings table
        db.execute('''
            CREATE TABLE IF NOT EXISTS ratings (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                question_UUID TEXT,
                rating INTEGER
            )
        ''')

        connection.commit()


    except sqlite3.Error as e:
        logger.error(f"An error occurred while creating database: {e}")
    finally:
        if connection:
            connection.close()

def insertQuestion(board, subject, topic, difficulty, level, component, questionFile, solutionFile):
    try:
        uuidStr = str(uuid.uuid4())
        connection = sqlite3.connect(dbPath)

        db = connection.cursor()

        # Compress the questionFile and solutionFile
        compressedQuestionFile = zlib.compress(questionFile, level=9)
        compressedSolutionFile = zlib.compress(solutionFile, level=9)

        # Encode the compressed data in base64
        encodedQuestionFile = base64.b64encode(compressedQuestionFile).decode('utf-8')
        encodedSolutionFile = base64.b64encode(compressedSolutionFile).decode('utf-8')

        db.execute('''INSERT INTO questions
            (uuid, subject, topic, difficulty, board, level, component, questionFile, solutionFile)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (uuidStr, subject, topic, difficulty, board, level, component, encodedQuestionFile, encodedSolutionFile))
        connection.commit()
        connection.close()
        logger.info(f"Question inserted successfully. UUID: {uuidStr}")
        return True
    except sqlite3.Error as e:
        logger.error(f"Error inserting question into database: {e}")
        return False

def insertPaper(board: str, subject: str, year: str, level: str,
                component: str, questionFile: bytes, solutionFile: bytes) -> bool:
    """
    Insert a paper into the database with proper compression and encoding.

    Args:
        board: Exam board
        subject: Subject name
        year: Year of paper
        level: Education level
        component: Paper component
        questionFile: Raw bytes of the question paper PDF
        solutionFile: Raw bytes of the solution paper PDF

    Returns:
        bool: True if insertion was successful, False otherwise
    """
    try:
        uuidStr = str(uuid.uuid4())
        connection = sqlite3.connect(dbPath)

        # Compress the files
        questionFile_compressed = zlib.compress(questionFile, level=9)
        solutionFile_compressed = zlib.compress(solutionFile, level=9)

        # Convert compressed binary to base64 for storage
        questionFile_b64 = base64.b64encode(questionFile_compressed).decode('utf-8')
        solutionFile_b64 = base64.b64encode(solutionFile_compressed).decode('utf-8')

        db = connection.cursor()
        db.execute('''INSERT INTO papers
            (uuid, subject, year, board, level, component, questionFile, solutionFile)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (uuidStr, subject, year, board, level, component,
             questionFile_b64, solutionFile_b64))
        connection.commit()
        connection.close()
        logger.info(f"Paper inserted successfully. UUID: {uuidStr}")
        return True
    except Exception as e:
        logger.error(f"Error inserting paper into database: {e}")
        return False

def insertTopical(board, subject, questionFile, solutionFile):
    try:
        uuidStr = str(uuid.uuid4())
        connection = sqlite3.connect(dbPath)


        questionFile = zlib.compress(questionFile)
        solutionFile = zlib.compress(solutionFile)


        db = connection.cursor()
        db.execute('''INSERT INTO topicals
            (uuid, subject, board, questionFile, solutionFile)
            VALUES (?, ?, ?, ?, ?)''',
            (uuidStr, subject, board, questionFile, solutionFile))
        connection.commit()
        connection.close()
        logger.info(f"Topical paper inserted successfully. UUID: {uuidStr}")
        return True
    except sqlite3.Error as e:
        logger.error(f"Error inserting topical paper into database: {e}")
        return False

def getYears(level , subjectName):
    try:
        total_years = []
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        # Execute the query and fetch all results
        rows = db.execute('SELECT year FROM papers WHERE level = ? AND subject = ? AND approved = 1', (level, subjectName)).fetchall()

        # Extract the years from the query result
        years = list(set([row[0] for row in rows]))

        for year in years:
            total_years.append(str(year)[:4])

        if total_years == []:
            logger.warning(f"No years found for level {level} and subject {subjectName}")
            return False

        logger.info(f"Years retrieved successfully for level {level} and subject {subjectName}")
        return total_years
    except sqlite3.Error as e:
        logger.error(f"An error occurred while getting years: {e}")
        return None
    finally:
        # Close the connection
        connection.close()


def getQuestions(level, subject_name, year):
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()
        
        # Get rows where the first 4 characters match, but retrieve the full year string
        rows = db.execute('''
            SELECT component, year 
            FROM papers 
            WHERE level = ? 
            AND subject = ? 
            AND substr(year, 1, 4) = ? 
            AND approved = 1
        ''', (level, subject_name, str(year))).fetchall()
        
        components = [row[0] for row in rows]
        full_years = [row[1] for row in rows]  # Get the full year strings from database
        question_name = []
        
        for component, full_year in zip(components, full_years):
            question_name.append(f'{subject_name}, {component}, Year: {full_year} question paper')
            
        logger.info(f"Questions retrieved successfully for level {level}, subject {subject_name}, year {year}")
        return question_name
        
    except sqlite3.Error as e:
        logger.error(f"An error occurred while getting questions: {e}")
        return None
        
    finally:
        # Close the connection
        connection.close()


def renderQuestion(level, subject_name, year, component):
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()
        
        # Modified queries to use substr for year comparison
        rows = db.execute('''
            SELECT questionFile 
            FROM papers 
            WHERE level = ? 
            AND subject = ? 
            AND year = ? 
            AND component = ? 
            AND approved = 1
        ''', (level, subject_name, year, component)).fetchall()
        
        id = db.execute('''
            SELECT uuid 
            FROM papers 
            WHERE level = ? 
            AND subject = ? 
            AND year = ? 
            AND component = ? 
            AND approved = 1
        ''', (level, subject_name, year, component)).fetchall()
        
        # Extract the compressed data from the query result
        compressedData = [row[0] for row in rows]
        compressedData.append(id)
        
        if not compressedData:
            logger.warning(f"No data found for level {level}, subject {subject_name}, year {year}, component {component}")
            return None
            
        logger.info(f"Question rendered successfully for level {level}, subject {subject_name}, year {year}, component {component}")
        return compressedData
        
    except sqlite3.Error as e:
        logger.error(f"An error occurred while rendering question: {e}")
        return None
        
    finally:
        connection.close()



def giveRating(user_id, question_UUID, rating):
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        # Check if the user has already rated this question
        previousRating = db.execute('SELECT rating FROM ratings WHERE user_id = ? AND question_UUID = ?', (user_id, question_UUID)).fetchall()

        if previousRating:
            previousRatingValue = previousRating[0][0]  # Extract the rating value

            previousRatingStr = convertRatingToString(previousRatingValue)

            # Update the rating for the user and question
            db.execute('UPDATE ratings SET rating = ? WHERE user_id = ? AND question_UUID = ?', (rating, user_id, question_UUID))
            # Decrease the previous rating count for the given question (assuming it's another table)
            db.execute(f'UPDATE questions SET {previousRatingStr} = {previousRatingStr} - 1 WHERE uuid = ?', (question_UUID,))
        else:
            # Insert new rating for the user and question
            db.execute('INSERT INTO ratings (user_id, question_UUID, rating) VALUES (?, ?, ?)', (user_id, question_UUID, rating))

        # Increase the new rating count for the given question
        newRatingStr = convertRatingToString(rating)
        db.execute(f'UPDATE questions SET {newRatingStr} = {newRatingStr} + 1 WHERE uuid = ?', (question_UUID,))


        # Commit the changes to the database
        connection.commit()
        logger.info(f"Rating {rating} given by user {user_id} for question {question_UUID}")
        return True

    except sqlite3.Error as e:
        logger.error(f'DB error while updating/inserting rating: {e}')
        return False
    finally:
        connection.close()


def getComponents(year, subjectName):
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        # Convert year to string if necessary
        year = str(year)

        # Execute the query and fetch all results
        rows = db.execute('SELECT component FROM papers WHERE subject = ? AND year = ?', (subjectName, year)).fetchall()


        # Extract the components from the query result
        components = [row[0] for row in rows]


        logger.info(f"Components retrieved successfully for subject {subjectName} and year {year}")
        return components
    except sqlite3.Error as e:
        logger.error(f"An error occurred while getting components: {e}")
        return None
    finally:
        # Close the connection
        connection.close()


def getQuestionsForGen(board, subject, level, topics, components, difficulties):
    """
    Get questions based on selected criteria from the questions table.
    
    Args:
        board (str): Board name (e.g., "Board1")
        subject (str): Subject name
        level (int): Education level
        topics (list): List of selected topics
        components (str|list): 'ALL' or list of specific components
        difficulties (list): List of difficulty levels
    
    Returns:
        list: List of question rows matching the criteria
    """
    connection = None
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()
        
        # Base query parts
        query = """
            SELECT *
            FROM questions
            WHERE
            board = ? 
            AND subject = ? 
            AND level = ?
            AND approved = True
        """
        
        # Build difficulty condition
        difficultyCondition = " OR ".join([f"difficulty = ?" for _ in difficulties]) if difficulties else ""
        
        # Build topic condition
        topicCondition = " OR ".join([f"topic = ?" for _ in topics]) if topics else ""
        
        # Build the query and parameters dynamically
        params = [board, subject, level] 

        # Add difficulty condition
        if difficulties:
            query += f" AND ({difficultyCondition})"
            params.extend(difficulties)

        # Add topic condition
        if topics:
            query += f" AND ({topicCondition})"
            params.extend(topics)

        # Add components condition
        if components != 'ALL':
            componentCondition = " OR ".join([f"component = ?" for _ in components]) if components else ""
            query += f" AND ({componentCondition})"
            params.extend(components)
        
        # Execute the query
        cursor = db.execute(query, params)
        rows = cursor.fetchall()
        
        # Process results
        if rows:
            # If more than 12 questions, randomly select 12
            if len(rows) > 12:
                rows = random.sample(rows, 12)
            else:
                random.shuffle(rows)
            
            # Example processed rows, you can customize this part
            processed_rows = rows
            logger.info(f"Successfully retrieved {len(processed_rows)} questions for {subject} level {level}")
            return processed_rows
        else:
            logger.warning(f"No questions found for {subject} level {level}")
            return []
            
    except sqlite3.Error as e:
        logger.error(f"Database error in getQuestionsForGen: {str(e)}")
        raise Exception(f"Database error occurred: {str(e)}")
    except Exception as e:
        logger.error(f"General error in getQuestionsForGen: {str(e)}")
        raise Exception(f"An error occurred while retrieving questions: {str(e)}")
    finally:
        if connection:
            connection.close()


def dbDump():
    output_json_file = './instance/db-dump.json'
    output_text_file = './instance/db-dump.txt'

    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        # Fetch all rows from the 'papers' table
        rows = db.execute('SELECT id, uuid, subject, year, component, board, level FROM papers').fetchall()

        data = [row for row in rows]

        json_data = []

        for data in data:
            subject_name = data[2]
            component = data[4]
            year = data[3]
            level = data[6]
            board = data[5]

            json_data.append(f'Grade: {level}, Subject: {subject_name}, Province: {component}, Year: {year} question paper. ({board})')
            print(f'Grade: {level}, Subject: {subject_name}, Province: {component}, Year: {year} question paper. ({board})')


        # Write to JSON file
        with open(output_json_file, 'w') as json_file:
            json.dump(json_data, json_file, indent=4)

        # Write to text file
        with open(output_text_file, 'w') as text_file:
            for name in data:
                text_file.write(f"{name}\n")

        logger.info("Database dump completed successfully")
        return data

    except sqlite3.Error as e:
        logger.error(f"An error occurred during database dump: {e}")
        return None
    finally:
        # Close the connection
        if connection:
            connection.close()



# ADMIN USAGE


def dict_factory(cursor, row):
    """Convert database row objects into a dict"""
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}

def get_unapproved_questions():
    """Get all unapproved questions from the database"""
    try:
        connection = sqlite3.connect(dbPath)
        connection.row_factory = dict_factory
        db = connection.cursor()

        questions = db.execute('''
            SELECT id, uuid, subject, topic, difficulty, board, level, component,
                   questionFile, solutionFile
            FROM questions
            WHERE approved = False
        ''').fetchall()

        return questions
    except sqlite3.Error as e:
        logger.error(f"Error fetching unapproved questions: {e}")
        return []
    finally:
        if connection:
            connection.close()

def get_unapproved_papers():
    """Get all unapproved papers from the database"""
    try:
        connection = sqlite3.connect(dbPath)
        connection.row_factory = dict_factory
        db = connection.cursor()

        papers = db.execute('''
            SELECT id, uuid, subject, year, component, board, level,
                   questionFile, solutionFile
            FROM papers
            WHERE approved = False
        ''').fetchall()

        return papers
    except sqlite3.Error as e:
        logger.error(f"Error fetching unapproved papers: {e}")
        return []
    finally:
        if connection:
            connection.close()

def approve_question(uuid: str) -> bool:
    """Approve a question by UUID"""
    connection = None
    try:
        logger.info(
            f"Starting approval process for question UUID: {uuid}",
            extra={'http_request': True}
        )
        connection = sqlite3.connect(dbPath)

        # Get question data before updating
        question_data = get_item_data(connection, "question", uuid)
        if not question_data:
            logger.error(f"Question {uuid} not found", extra={'http_request': True})
            return False

        # Update approval status
        cursor = connection.cursor()
        cursor.execute('UPDATE questions SET approved = 1 WHERE uuid = ?', (uuid,))
        connection.commit()

        # Send webhook notification
        send_to_discord("question", question_data)

        return True
    except sqlite3.Error as e:
        logger.error(f"Error approving question {uuid}: {e}",
                    extra={'http_request': True})
        return False
    finally:
        if connection:
            connection.close()

def approve_paper(uuid: str) -> bool:
    """Approve a paper by UUID"""
    connection = None
    try:
        logger.info(
            f"Starting approval process for paper UUID: {uuid}",
            extra={'http_request': True}
        )
        connection = sqlite3.connect(dbPath)

        # Get paper data before updating
        paper_data = get_item_data(connection, "paper", uuid)
        if not paper_data:
            logger.error(f"Paper {uuid} not found", extra={'http_request': True})
            return False

        # Update approval status
        cursor = connection.cursor()
        cursor.execute('UPDATE papers SET approved = True WHERE uuid = ?', (uuid,))
        connection.commit()

        # Send webhook notification
        send_to_discord("paper", paper_data)

        return True
    except sqlite3.Error as e:
        logger.error(f"Error approving paper {uuid}: {e}",
                    extra={'http_request': True})
        return False
    finally:
        if connection:
            connection.close()

def delete_question(uuid: str) -> bool:
    """Delete a question by UUID"""
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        db.execute('DELETE FROM questions WHERE uuid = ?', (uuid,))
        connection.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error deleting question {uuid}: {e}")
        return False
    finally:
        if connection:
            connection.close()

def delete_paper(uuid: str) -> bool:
    """Delete a paper by UUID"""
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        db.execute('DELETE FROM papers WHERE uuid = ?', (uuid,))
        connection.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error deleting paper {uuid}: {e}")
        return False
    finally:
        if connection:
            connection.close()

def get_question(uuid: str):
    """Get a single question by UUID"""
    try:
        connection = sqlite3.connect(dbPath)
        connection.row_factory = dict_factory
        db = connection.cursor()

        question = db.execute('''
            SELECT * FROM questions WHERE uuid = ?
        ''', (uuid,)).fetchone()

        return question
    except sqlite3.Error as e:
        logger.error(f"Error fetching question {uuid}: {e}")
        return None
    finally:
        if connection:
            connection.close()
def get_paper(uuid: str):
    """Get a single paper by UUID"""
    try:
        connection = sqlite3.connect(dbPath)
        connection.row_factory = dict_factory
        db = connection.cursor()

        paper = db.execute('''
            SELECT * FROM papers WHERE uuid = ?
        ''', (uuid,)).fetchone()
        print(paper)
        return paper
    except sqlite3.Error as e:
        logger.error(f"Error fetching paper {uuid}: {e}")
        return None
    finally:
        if connection:
            connection.close()

def update_question(uuid: str, data) -> bool:
    """Update a question's details"""
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        db.execute('''
            UPDATE questions
            SET subject = ?, topic = ?, difficulty = ?, board = ?,
                level = ?, component = ?
            WHERE uuid = ?
        ''', (
            data['subject'],
            data['topic'],
            data['difficulty'],
            data['board'],
            data['level'],
            data['component'],
            uuid
        ))
        connection.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error updating question {uuid}: {e}")
        return False
    finally:
        if connection:
            connection.close()




# Discord web hook so the users are notified when a question is approved

def send_to_discord(item_type: str, data: dict) -> bool:
    """Send approval notification to Discord"""
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        logger.error("Discord webhook URL not found", extra={'http_request': True})
        return False

    if item_type == "question":
        embed = {
            "title": "✅ New Question Approved!",
            "color": 3066993,  # Green
            "fields": [
                {"name": "Subject", "value": data.get('subject', 'N/A'), "inline": True},
                {"name": "Topic", "value": data.get('topic', 'N/A'), "inline": True},
                {"name": "Difficulty", "value": f"{data.get('difficulty', 'N/A')}/5", "inline": True},
                {"name": "Board", "value": data.get('board', 'N/A'), "inline": True},
                {"name": "Level", "value": data.get('level', 'N/A'), "inline": True},
                {"name": "Component", "value": data.get('component', 'N/A'), "inline": True}
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    else:  # paper
        embed = {
            "title": "📝 New Past Paper Approved!",
            "color": 3447003,  # Blue
            "fields": [
                {"name": "Subject", "value": data.get('subject', 'N/A'), "inline": True},
                {"name": "Year", "value": str(data.get('year', 'N/A')), "inline": True},
                {"name": "Board", "value": data.get('board', 'N/A'), "inline": True},
                {"name": "Level", "value": data.get('level', 'N/A'), "inline": True},
                {"name": "Component", "value": data.get('component', 'N/A'), "inline": True}
            ],
            "timestamp": datetime.utcnow().isoformat()
        }

    try:
        response = requests.post(webhook_url, json={"embeds": [embed]})
        response.raise_for_status()
        logger.info(f"Discord webhook sent successfully for {item_type} {data.get('uuid')}",
                   extra={'http_request': True})
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send Discord webhook: {str(e)}",
                    extra={'http_request': True})
        return False



def get_item_data(connection: sqlite3.Connection, item_type: str, uuid: str) -> dict:
    """Get question or paper data before approval"""
    cursor = connection.cursor()
    if item_type == "question":
        cursor.execute('''
            SELECT uuid, subject, topic, difficulty, board, level, component
            FROM questions
            WHERE uuid = ?
        ''', (uuid,))
    else:  # paper
        cursor.execute('''
            SELECT uuid, subject, year, board, level, component
            FROM papers
            WHERE uuid = ?
        ''', (uuid,))

    row = cursor.fetchone()
    if not row:
        return {}

    # Convert row to dictionary based on item type
    if item_type == "question":
        return {
            'uuid': row[0],
            'subject': row[1],
            'topic': row[2],
            'difficulty': row[3],
            'board': row[4],
            'level': row[5],
            'component': row[6]
        }
    else:  # paper
        return {
            'uuid': row[0],
            'subject': row[1],
            'year': row[2],
            'board': row[3],
            'level': row[4],
            'component': row[5]
        }


import sqlite3

def getStat(config):
    try:
        # Connect to the SQLite database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        # Initialize the stats dictionary
        stats = {
            "overall": {
                "questions": {
                    "approved": 0,
                    "unapproved": 0
                },
                "papers": {
                    "approved": 0,
                    "unapproved": 0
                }
            },
            "byBoard": {}
        }

        # Loop through each board in the config
        for boardName, boardConfig in config.items():
            boardStats = {
                "levels": {},
                "subjects": {}
            }
            stats["byBoard"][boardName] = boardStats

            # Handle overall approved/unapproved question count for this board
            for level in boardConfig["levels"]:
                boardStats["levels"][level] = {
                    "approvedQuestions": db.execute("SELECT COUNT(*) FROM questions WHERE level = ? AND approved = ?", (level, True)).fetchone()[0],
                    "unapprovedQuestions": db.execute("SELECT COUNT(*) FROM questions WHERE level = ? AND approved = ?", (level, False)).fetchone()[0],
                    "subjects": {}
                }

                # Loop through each subject in the board
                for subject in boardConfig["subjects"]:
                    subjectName = subject["name"]
                    boardStats["levels"][level]["subjects"][subjectName] = {
                        "approved": db.execute("SELECT COUNT(*) FROM questions WHERE level = ? AND subject = ? AND approved = ?", (level, subjectName, True)).fetchone()[0],
                        "unapproved": db.execute("SELECT COUNT(*) FROM questions WHERE level = ? AND subject = ? AND approved = ?", (level, subjectName, False)).fetchone()[0],
                    }


            # Why are we doing this twice when we could have added the count directly to the json? 
            # Because I can and makes the code a bit more redable

            # Update overall board-level stats
            approvedQuestionsCount = db.execute(
                "SELECT COUNT(*) FROM questions WHERE approved = ?", (True,)
            ).fetchone()[0]
            unapprovedQuestionsCount = db.execute(
                "SELECT COUNT(*) FROM questions WHERE approved = ?", (False,)
            ).fetchone()[0]

            # Update the JSON
            stats["overall"]["questions"]["approved"] = approvedQuestionsCount
            stats["overall"]["questions"]["unapproved"] = unapprovedQuestionsCount

            approvedPapersCount = db.execute(
                "SELECT COUNT(*) FROM papers WHERE approved = ?", (True,)
            ).fetchone()[0]
            unapprovedPapersCount = db.execute(
                "SELECT COUNT(*) FROM papers WHERE approved = ?", (False,)
            ).fetchone()[0]

            # Update the JSON
            stats["overall"]["papers"]["approved"] = approvedPapersCount
            stats["overall"]["papers"]["unapproved"] = unapprovedPapersCount


 
        # Close the connection
        connection.close()

        return stats

    except sqlite3.Error as e:
        logger.error(f"Error gathering stats: {e}")
        return {"error": "Failed to retrieve stats"}


def getHash(encodedData):
    # Decode base64 to get compressed binary data
    compressedData = base64.b64decode(encodedData)
    # Decompress to get the original file data
    originalData = zlib.decompress(compressedData)
    # Return the SHA-256 hash
    return hashlib.sha256(originalData).hexdigest()

def convertRatingToString(rating):
    # Convert integer rating to string representation ('one', 'two', etc.)
    if rating == 1:
        return 'one'
    elif rating == 2:
        return 'two'
    elif rating == 3:
        return 'three'
    elif rating == 4:
        return 'four'
    elif rating == 5:
        return 'five'
    else:
        return 'unknown'
