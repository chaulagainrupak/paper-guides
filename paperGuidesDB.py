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
        
        db.execute('''
            CREATE TABLE IF NOT EXISTS ratings (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                question_UUID TEXT,
                rating INTEGER
            )
        ''')
        
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
                
        rows = db.execute('SELECT component FROM papers WHERE level = ? AND subject = ? AND year = ? ', (level,subject_name,year)).fetchall()

        components = [row[0] for row in rows]

        question_name = []
        # print(components)

        for component in components:
            question_name.append(f'{subject_name}, {component}, Year: {year} question paper')

        # print(question_name)
        return question_name

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        # Close the connection
        connection.close()


def renderQuestion(level, subject_name, year, component):

    try:
        # print('got here')
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()


        rows = db.execute('SELECT questionFile FROM papers WHERE level = ? AND subject = ? AND year = ?  AND component = ?', (level,subject_name,year, component)).fetchall()



        # Debugging: Print the raw query result
        # print(f"Query Result: {rows}")
        
        # Extract the data from the query result
        question = [row[0] for row in rows]

        # print(question[0])

        return question
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
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

        print('got here')
        # Increase the new rating count for the given question
        newRatingStr = convertRatingToString(rating)
        db.execute(f'UPDATE questions SET {newRatingStr} = {newRatingStr} + 1 WHERE uuid = ?', (question_UUID,))


        # Commit the changes to the database
        connection.commit()

    except sqlite3.Error as e:
        print(f'DB error while updating/inserting rating: {e}')
        return None
    finally:
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