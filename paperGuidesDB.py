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
        subject TEXT,
        year INTEGER,
        component TEXT,
        board TEXT,
        level INTEGER,
        questionFile BLOB UNIQUE,
        solutionFile BLOB UNIQUE, 
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
        questionFile BLOB UNIQUE,
        solutionFile BLOB UNIQUE, 
        approved DEFAULT False,
        one INTEGER DEFAULT 0,
        two INTEGER DEFAULT 0,
        three INTEGER DEFAULT 0,
        four INTEGER DEFAULT 0,
        five INTEGER DEFAULT 0)''')
        
        
        connection.commit()


        print("Database created successfully.")
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        if connection:
            connection.close()

def insertQuestion(board, subject, topic, difficulty, level, component, questionFile, solutionFile):
    try:
        # Generate a unique UUID for the question
        uuidStr = str(uuid.uuid4())

        # Compress the uploaded file data
        qFile = questionFile.read()
        sFile = solutionFile.read()

        qCompressed = zlib.compress(qFile)
        sCompressed = zlib.compress(sFile)

        # Insert data into SQLite database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        db.execute('''INSERT INTO questions
                          (uuid, subject, topic, difficulty, board, level, component, questionFile, solutionFile)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                       (uuidStr, subject, topic, difficulty, board, level, component, qCompressed, sCompressed))
        connection.commit()
        connection.close()

        return True  # Return True indicating successful insertion

    except sqlite3.Error as e:
        print(f"Error inserting question into database: {e}")
        return False  # Return False indicating failure



def getYears(level , subjectName):
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()
        
        # Debugging: Print the subject name
        print(f"Subject Name: {subjectName}")
        
        # Execute the query and fetch all results
        rows = db.execute('SELECT year FROM papers WHERE level = ? AND subject = ?', (level, subjectName)).fetchall()
        
        # Debugging: Print the raw query result
        print(f"Query Result: {rows}")
        
        # Extract the years from the query result
        years = [row[0] for row in rows]
        
        # Print the results for debugging purposes
        print(f"Extracted Years: {years}")
        
        return years
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        # Close the connection
        connection.close()


def getQuestions(level, subject_name, year):
    
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()
        
        rows = db.execute('SELECT questionFile FROM papers WHERE level = ? AND subject = ? AND year = ? ', (level,subject_name,year)).fetchall()



        # Debugging: Print the raw query result
        print(f"Query Result: {rows}")
        
        # Extract the data from the query result
        questions = [row[0] for row in rows]
        
        # Print the results for debugging purposes
        print(f"Extracted question: {questions}")

        rows = db.execute('SELECT component FROM papers WHERE level = ? AND subject = ? AND year = ? ', (level,subject_name,year)).fetchall()

        components = [row[0] for row in rows]

        question_name = []
        print(components)

        for component in components:
            question_name.append(f'{subject_name}, {component}, Year: {year} question paper')

        print(question_name)
        return question_name , questions

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        # Close the connection
        connection.close()


def getComponents(year, subjectName):
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        
        # Debugging: Print the subject name
        print(f"Subject Name: {subjectName}")
        print(f"Year: {year}")
        
        # Convert year to string if necessary
        year = str(year)
        
        # Execute the query and fetch all results
        rows = db.execute('SELECT component FROM papers WHERE subject = ? AND year = ?', (subjectName, year)).fetchall()
        
        # Debugging: Print the raw query result
        print(f"Query Result: {rows}")
        
        # Extract the components from the query result
        components = [row[0] for row in rows]
        
        # Print the results for debugging purposes
        print(f"Extracted Components: {components}")
        
        return components
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        # Close the connection
        connection.close()



