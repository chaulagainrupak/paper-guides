import sqlite3
import uuid
import os
import zlib
import base64
import logging
from datetime import datetime
from dotenv import load_dotenv

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
            subject TEXT,
            topic TEXT,
            title TEXT,  -- Added for better display
            description TEXT,  -- Added for better display
            content TEXT,
            approved BOOLEAN DEFAULT 0,
            submittedBy TEXT,
            submittedFrom TEXT,
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
            questionFile, solutionFile, submittedBy, submittedFrom, submitDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (uuidStr, subject, topic, difficulty, board, level, component,
             q_b64, s_b64, user, ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
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

def getQuestionsForGen(board: str, subject: str, level: str, topics: list, 
                      components: list, difficulties: list) -> list:
    """Get questions for question generator"""
    try:
        conn = sqlite3.connect(DB_QUESTION_GENERATOR_PATH)
        cursor = conn.cursor()

        # Base query
        query = """
            SELECT * FROM questions
            WHERE board = ? AND subject = ? AND level = ? AND approved = 1
        """
        params = [board, subject, level]

        # Add conditions for filters
        def add_condition(field, values):
            if values and values != 'ALL':
                placeholders = ','.join(['?'] * len(values))
                return f" AND {field} IN ({placeholders})", values
            return "", []

        # Add difficulty condition
        diff_cond, diff_params = add_condition("difficulty", difficulties)
        query += diff_cond
        params.extend(diff_params)

        # Add topic condition
        topic_cond, topic_params = add_condition("topic", topics)
        query += topic_cond
        params.extend(topic_params)

        # Add components condition
        comp_cond, comp_params = add_condition("component", components)
        query += comp_cond
        params.extend(comp_params)

        # Execute query
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # Process results
        if rows:
            return rows
        return []

    except Exception as e:
        logger.error(f"Error getting questions for generator: {e}")
        return []
    finally:
        if conn:
            conn.close()

# ======================
# NOTES DATABASE FUNCTIONS
# ======================

def insertNote(subject: str, topic: str, title: str, description: str, 
              content: str, user: str, ip: str) -> tuple[bool, str]:
    """Insert a new note into the database"""
    try:
        uuidStr = str(uuid.uuid4())
        conn = sqlite3.connect(DB_NOTES_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''INSERT INTO notes
            (uuid, subject, topic, title, description, content, 
            submittedBy, submittedFrom, submitDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (uuidStr, subject, topic, title, description, content, 
             user, ip, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        conn.commit()
        logger.info(f"Note inserted: {uuidStr}")
        return True, uuidStr
    except Exception as e:
        logger.error(f"Error inserting note: {e}")
        return False, ""
    finally:
        if conn:
            conn.close()

def getNote(uuid: str) -> dict:
    """Get a note by UUID"""
    try:
        conn = sqlite3.connect(DB_NOTES_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''SELECT * FROM notes WHERE uuid = ?''', (uuid,))
        note = cursor.fetchone()
        
        # Increment view count
        if note:
            cursor.execute('''UPDATE notes SET views = views + 1 
                           WHERE uuid = ?''', (uuid,))
            conn.commit()
        
        return note
    except Exception as e:
        logger.error(f"Error getting note: {e}")
        return None
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
