import sqlite3
import uuid
import os
import zlib

dbPath = './instance/paper-guides-resources.db'

def createDatabase():
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()


        # Create papers table
        db.execute('''CREATE TABLE IF NOT EXISTS papers
        (id INTEGER PRIMARY KEY,
        uuid TEXT UNIQUE,
        name TEXT,
        subject TEXT,
        year INTEGER,
        component TEXT,
        board TEXT,
        level INTEGER,
        file BLOB UNIQUE)''')


        # Create questions table
        db.execute('''CREATE TABLE IF NOT EXISTS questions
        (id INTEGER PRIMARY KEY,
        uuid TEXT UNIQUE,
        subject TEXT,
        topic TEXT,
        difficulty INTEGER,
        board TEXT,
        level TEXT,
        component TEXT,
        file BLOB UNIQUE)''')
        connection.commit()


        print("Database created successfully.")
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        if connection:
            connection.close()

def insertQuestion(board, subject, topic, difficulty, level, component, file):
    try:
        # Generate a unique UUID for the question
        uuidStr = str(uuid.uuid4())

        # Compress the uploaded file data
        fileData = file.read()
        compressedData = zlib.compress(fileData)

        # Insert data into SQLite database
        conn = sqlite3.connect(dbPath)
        cursor = conn.cursor()

        cursor.execute('''INSERT INTO questions
                          (uuid, subject, topic, difficulty, board, level, component, file)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                       (uuidStr, subject, topic, difficulty, board, level, component, compressedData))
        conn.commit()
        conn.close()

        return True  # Return True indicating successful insertion

    except sqlite3.Error as e:
        print(f"Error inserting question into database: {e}")
        return False  # Return False indicating failure

def retrieveQuestions():
    ...