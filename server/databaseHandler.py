import sqlite3
import uuid
import os
import zlib
import base64
import logging
from datetime import datetime
from dotenv import load_dotenv
import random 

load_dotenv('.env')

# Database paths
DB_PAST_PAPER_PATH = './instance/paper-guides-papers.db'
DB_QUESTION_GENERATOR_PATH = './instance/paper-guides-questions.db'
DB_NOTES_PATH = './instance/paper-guides-notes.db'

# Initialize logger
logger = logging.getLogger(__name__)

def initializeDatabase(db_path: str, create_queries: list):
    """Initialize database with required tables if they don't exist"""
    try:
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        for query in create_queries:
            cursor.execute(query)
        
        conn.commit()
        logger.info(f"Database initialized: {db_path}")
    except Exception as e:
        logger.error(f"Error initializing database {db_path}: {e}")
    finally:
        if conn:
            conn.close()

def initializeDatabases():
    """Initialize all three databases with required tables"""
    # Papers database schema
    papers_queries = [
        """CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY,
            uuid TEXT UNIQUE,
            subject TEXT,
            year INTEGER,
            component TEXT,
            board TEXT,
            level TEXT,
            questionFile BLOB,
            solutionFile BLOB,
            approved BOOLEAN DEFAULT 0,
            submittedBy TEXT,
            submittedFrom TEXT,
            submitDate DATE,
            approvedBy TEXT,
            approvedOn DATE
        )"""
    ]
    
    # Questions database schema
    questions_queries = [
        """CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY,
            uuid TEXT UNIQUE,
            subject TEXT,
            topic TEXT,
            difficulty INTEGER,
            board TEXT,
            level TEXT,
            component TEXT,
            questionFile BLOB,
            solutionFile BLOB,
            approved BOOLEAN DEFAULT 0,
            one INTEGER DEFAULT 0,
            two INTEGER DEFAULT 0,
            three INTEGER DEFAULT 0,
            four INTEGER DEFAULT 0,
            five INTEGER DEFAULT 0,
            submittedBy TEXT,
            submittedFrom TEXT,
            submitDate DATE,
            approvedBy TEXT,
            approvedOn DATE
        )""",
        """CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY,
            user_id TEXT,
            question_UUID TEXT,
            rating INTEGER
        )"""
    ]
    
    # Enhanced Notes database schema
    notes_queries = [
        """CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY,
            uuid TEXT UNIQUE,
            board TEXT,
            level TEXT,
            subject TEXT,
            topic TEXT,
            content TEXT,
            approved BOOLEAN DEFAULT 1,
            submittedBy TEXT,
            submitDate DATE,
            approvedBy TEXT,
            approvedOn DATE,
            views INTEGER DEFAULT 0,  -- Track popularity
            rating REAL DEFAULT 0  -- Average rating
        )""",
        """CREATE TABLE IF NOT EXISTS note_ratings (
            id INTEGER PRIMARY KEY,
            user_id TEXT,
            note_uuid TEXT,
            rating INTEGER
        )"""
    ]
    
    initializeDatabase(DB_PAST_PAPER_PATH, papers_queries)
    initializeDatabase(DB_QUESTION_GENERATOR_PATH, questions_queries)
    initializeDatabase(DB_NOTES_PATH, notes_queries)

# ======================
# PAPERS DATABASE FUNCTIONS
# ======================

def insertPaper(board: str, subject: str, year: str, level: str,
                component: str, questionFile: bytes, solutionFile: bytes, 
                user: str, ip: str) -> tuple[bool, str]:
    """Insert a new paper into the database"""
    try:
        uuidStr = str(uuid.uuid4())
        conn = sqlite3.connect(DB_PAST_PAPER_PATH)
        cursor = conn.cursor()

        # Compress and encode files
        q_compressed = zlib.compress(questionFile, level=9)
        s_compressed = zlib.compress(solutionFile, level=9)
        q_b64 = base64.b64encode(q_compressed).decode('utf-8')
        s_b64 = base64.b64encode(s_compressed).decode('utf-8')

        cursor.execute('''INSERT INTO papers
            (uuid, subject, year, board, level, component, questionFile, solutionFile, 
            submittedBy, submittedFrom, submitDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (uuidStr, subject, year, board, level, component,
             q_b64, s_b64, user, ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        conn.commit()
        logger.info(f"Paper inserted: {uuidStr}")
        return True, uuidStr
    except Exception as e:
        logger.error(f"Error inserting paper: {e}")
        return False, ""
    finally:
        if conn:
            conn.close()

def getYears(level: str, subject: str) -> list:
    """Get available years for a subject and level"""
    try:
        conn = sqlite3.connect(DB_PAST_PAPER_PATH)
        cursor = conn.cursor()
        
        if level.lower() in ["a level", "as level"]:
            query = '''SELECT DISTINCT substr(year, 1, 4) 
                    FROM papers 
                    WHERE board = ? AND subject = ? AND approved = 1'''
            cursor.execute(query, ("A Levels", subject))
        else:
            query = '''SELECT DISTINCT substr(year, 1, 4) 
                    FROM papers 
                    WHERE level = ? AND subject = ? AND approved = 1'''
            cursor.execute(query, (level, subject))
            
        years = sorted({row[0] for row in cursor.fetchall()}, reverse=True)
        return years if years else []
    except Exception as e:
        logger.error(f"Error getting years: {e}")
        return []
    finally:
        if conn:
            conn.close()

def getPaper(level: str, subject: str, year: str, component: str) -> tuple:
    """Get a specific paper's files"""
    try:
        conn = sqlite3.connect(DB_PAST_PAPER_PATH)
        cursor = conn.cursor()
        
        if level.lower() in ["a level", "as level"]:
            query = '''SELECT questionFile, solutionFile 
                    FROM papers 
                    WHERE board = ? AND lower(subject) = ? 
                    AND year = ? AND component = ? AND approved = 1'''
            cursor.execute(query, ("A Levels", subject, year, component))
        else:
            query = '''SELECT questionFile, solutionFile 
                    FROM papers 
                    WHERE level = ? AND lower(subject) = ? 
                    AND year = ? AND component = ? AND approved = 1'''
            cursor.execute(query, (level, subject, year, component))
        
        result = cursor.fetchone()
        if not result:
            return None, None
        
        
        # Decompress files
        q_b64, s_b64 = result
        question_data = zlib.decompress(base64.b64decode(q_b64))
        solution_data = zlib.decompress(base64.b64decode(s_b64))
        
        return [question_data, solution_data]
    except Exception as e:
        logger.error(f"Error getting paper: {e}")
        return [None, None]
    finally:
        if conn:
            conn.close()

def getPaperComponents(year: str, subject: str, level: str) -> list:
    """Get available components for a specific paper"""
    try:
        conn = sqlite3.connect(DB_PAST_PAPER_PATH)
        cursor = conn.cursor()
        
        if level.lower() in ["a level", "as level"]:
            query = '''SELECT year, component 
                    FROM papers 
                    WHERE board = ? AND subject = ? 
                    AND substr(year, 1, 4) = ? AND approved = 1'''
            cursor.execute(query, ("A Levels", subject, year))
        else:
            query = '''SELECT year, component 
                    FROM papers 
                    WHERE level = ? AND subject = ? 
                    AND year = ? AND approved = 1'''
            cursor.execute(query, (level, subject, year))
        
        components = [row for row in cursor.fetchall()]
        return list(set(components))  # Return unique components
    except Exception as e:
        logger.error(f"Error getting components: {e}")
        return []
    finally:
        if conn:
            conn.close()

# ======================
# QUESTIONS DATABASE FUNCTIONS
# ======================

def insertQuestion(board: str, subject: str, topic: str, difficulty: int, 
                  level: str, component: str, questionFile: bytes, 
                  solutionFile: bytes, user: str, ip: str) -> bool:
    """Insert a new question into the database"""
    try:
        uuidStr = str(uuid.uuid4())
        conn = sqlite3.connect(DB_QUESTION_GENERATOR_PATH)
        cursor = conn.cursor()

        # Compress and encode files
        q_compressed = zlib.compress(questionFile, level=9)
        s_compressed = zlib.compress(solutionFile, level=9)
        q_b64 = base64.b64encode(q_compressed).decode('utf-8')
        s_b64 = base64.b64encode(s_compressed).decode('utf-8')

        cursor.execute('''INSERT INTO questions
            (uuid, subject, topic, difficulty, board, level, component, 
            questionFile, solutionFile, submittedBy, submittedFrom, submitDate, approved, approvedBy,approvedOn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?)''',
            (uuidStr, subject, topic, difficulty, board, level, component,
             q_b64, s_b64, user, ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), True, user ,datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        conn.commit()
        logger.info(f"Question inserted: {uuidStr}")
        return True
    except Exception as e:
        logger.error(f"Error inserting question: {e}")
        return False
    finally:
        if conn:
            conn.close()

def giveRating(user_id: str, question_UUID: str, rating: int) -> bool:
    """Add or update a rating for a question"""
    try:
        conn = sqlite3.connect(DB_QUESTION_GENERATOR_PATH)
        cursor = conn.cursor()
        
        # Check existing rating
        cursor.execute('''SELECT rating FROM ratings 
                       WHERE user_id = ? AND question_UUID = ?''',
                    (user_id, question_UUID))
        existing = cursor.fetchone()
        
        # Update rating counts
        rating_str = convertRatingToString(rating)
        if existing:
            # Decrement previous rating
            prev_str = convertRatingToString(existing[0])
            cursor.execute(f'''UPDATE questions 
                            SET {prev_str} = {prev_str} - 1 
                            WHERE uuid = ?''', (question_UUID,))
            # Update existing rating
            cursor.execute('''UPDATE ratings SET rating = ? 
                           WHERE user_id = ? AND question_UUID = ?''',
                        (rating, user_id, question_UUID))
        else:
            # Insert new rating
            cursor.execute('''INSERT INTO ratings 
                           (user_id, question_UUID, rating) 
                           VALUES (?, ?, ?)''',
                        (user_id, question_UUID, rating))
        
        # Increment new rating
        cursor.execute(f'''UPDATE questions 
                        SET {rating_str} = {rating_str} + 1 
                        WHERE uuid = ?''', (question_UUID,))
        
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error giving rating: {e}")
        return False
    finally:
        if conn:
            conn.close()

def getQuestionsForGen(board, subject, level, topics, components, difficulties):
    try:
        conn = sqlite3.connect(DB_QUESTION_GENERATOR_PATH)
        cursor = conn.cursor()

        query = """
            SELECT * FROM questions
            WHERE board = ? AND subject = ? AND approved = 1
        """
        params = [board, subject]

        # Handle level filter for list or single string
        if isinstance(level, list) and level:
            placeholders = ",".join(["?"] * len(level))
            query += f" AND level IN ({placeholders})"
            params.extend(level)
        else:
            query += " AND level = ?"
            params.append(level if not isinstance(level, list) else level[0])

        def add_condition(field, values):
            if values and values != 'ALL':
                placeholders = ','.join(['?'] * len(values))
                return f" AND {field} IN ({placeholders})", values
            return "", []

        diff_cond, diff_params = add_condition("difficulty", difficulties)
        query += diff_cond
        params.extend(diff_params)

        topic_cond, topic_params = add_condition("topic", topics)
        query += topic_cond
        params.extend(topic_params)

        comp_cond, comp_params = add_condition("component", components)
        query += comp_cond
        params.extend(comp_params)

        query += " ORDER BY RANDOM() LIMIT 30"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()

        finalRows = []
        
        for item in rows:    
            itemList = list(item)
            itemList[8] = base64.b64encode(zlib.decompress(base64.b64decode(item[8]))).decode('utf-8')
            itemList[9] = base64.b64encode(zlib.decompress(base64.b64decode(item[9]))).decode('utf-8')

            finalRows.append(itemList)

        return finalRows if finalRows else []

    except Exception as e:
        logger.error(f"Error getting questions for generator: {e}")
        return []
    finally:
        if conn:
            conn.close()

# ======================
# NOTES DATABASE FUNCTIONS
# ======================

def insertNote(board: str, level: str, subject: str, topic: str, 
              content: str, user: str) -> bool:
    """Insert a new note into the database"""
    try:
        uuidStr = str(uuid.uuid4())
        conn = sqlite3.connect(DB_NOTES_PATH)
        cursor = conn.cursor()
        
        try:
            DBcontent = cursor.execute('''SELECT content FROM notes WHERE board = ? AND level = ? AND subject = ? AND  topic = ? ''', (board, level, subject, topic)).fetchone()
        except Exception as e:
            return False

        if DBcontent is not None and content.strip() == DBcontent[0].strip():
            print("Duplicate content found, not inserting.")
            return False


        else:

            cursor.execute('''INSERT INTO notes
                (uuid, board, level, subject, topic, content,
                submittedBy, submitDate, approvedBy, approvedOn)
                VALUES (?, ?, ?, ?, ?, ?, ?, ? , ?, ?)''',
                (uuidStr, board, level, subject, topic, content, 
                user, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), user, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
            
            conn.commit()
            logger.info(f"Note inserted: {uuidStr}")
            return True

    except Exception as e:
        logger.error(f"Error inserting note: {e}")
        return False
    finally:
        if conn:
            conn.close()

def getNote(subject: str, topic: str) -> dict:
    """Get a note by UUID"""
    try:
        conn = sqlite3.connect(DB_NOTES_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        DBcontent = cursor.execute('''SELECT content FROM notes WHERE subject = ? AND topic = ? order by submitDate DESC''', (subject, topic) ).fetchone()

        note = DBcontent[0]
        if note:
            return note +"\n\n---"
            
        # Increment view count
        # if note:
            # cursor.execute('''UPDATE notes SET views = views + 1 
                        #    WHERE uuid = ?''', (uuid,))
            # conn.commit()
        
        return "No Data!"
    except Exception as e:
        logger.error(f"Error getting note: {e}")
        return '''No Note Data found! Want to help curate notes for this topic? Join our \n!(<a href="https://discord.gg/U9fAnCgcu3" target="_blank" class="blue-highlight" >Discord Server</a>)'''

    finally:
        if conn:
            conn.close()

def rateNote(user_id: str, note_uuid: str, rating: int) -> bool:
    """Rate a note and update its average rating"""
    try:
        conn = sqlite3.connect(DB_NOTES_PATH)
        cursor = conn.cursor()
        
        # Check if user has already rated
        cursor.execute('''SELECT rating FROM note_ratings 
                       WHERE user_id = ? AND note_uuid = ?''',
                    (user_id, note_uuid))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing rating
            cursor.execute('''UPDATE note_ratings SET rating = ? 
                           WHERE user_id = ? AND note_uuid = ?''',
                        (rating, user_id, note_uuid))
        else:
            # Insert new rating
            cursor.execute('''INSERT INTO note_ratings 
                           (user_id, note_uuid, rating) 
                           VALUES (?, ?, ?)''',
                        (user_id, note_uuid, rating))
        
        # Calculate new average rating
        cursor.execute('''SELECT AVG(rating) FROM note_ratings 
                       WHERE note_uuid = ?''', (note_uuid,))
        avg_rating = cursor.fetchone()[0] or 0
        
        # Update note's average rating
        cursor.execute('''UPDATE notes SET rating = ? 
                       WHERE uuid = ?''', (avg_rating, note_uuid))
        
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error rating note: {e}")
        return False
    finally:
        if conn:
            conn.close()

def searchNotes(subject: str = None, topic: str = None, 
               min_rating: float = 0, min_views: int = 0) -> list:
    """Search for notes with filters"""
    try:
        conn = sqlite3.connect(DB_NOTES_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM notes WHERE approved = 1"
        params = []
        
        # Add filters
        if subject:
            query += " AND subject = ?"
            params.append(subject)
        if topic:
            query += " AND topic = ?"
            params.append(topic)
        if min_rating > 0:
            query += " AND rating >= ?"
            params.append(min_rating)
        if min_views > 0:
            query += " AND views >= ?"
            params.append(min_views)
        
        query += " ORDER BY rating DESC, views DESC"
        
        cursor.execute(query, params)
        return cursor.fetchall()
    except Exception as e:
        logger.error(f"Error searching notes: {e}")
        return []
    finally:
        if conn:
            conn.close()

# ======================
# UTILITY FUNCTIONS
# ======================

def convertRatingToString(rating: int) -> str:
    """Convert integer rating to string representation"""
    return {
        1: "one",
        2: "two",
        3: "three",
        4: "four",
        5: "five"
    }.get(rating, "unknown")
