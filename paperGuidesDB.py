import sqlite3
import uuid
import os
import zlib
import json
import base64
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


        logger.info("Database created successfully.")
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
        
        # Compress the questionFile and solutionFile (assuming they are in bytes)
        compressedQuestionFile = zlib.compress(questionFile)  # Assuming questionFile is binary data
        compressedSolutionFile = zlib.compress(solutionFile)  # Assuming solutionFile is binary data

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

def insertPaper(board, subject, year, level, component, questionFile, solutionFile):
    try:
        uuidStr = str(uuid.uuid4())
        connection = sqlite3.connect(dbPath)

        questionFile = zlib.compress(questionFile)
        solutionFile = zlib.compress(solutionFile)

        
        db = connection.cursor()
        db.execute('''INSERT INTO papers
            (uuid, subject, year, board, level, component, questionFile, solutionFile)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (uuidStr, subject, year, board, level, component, questionFile, solutionFile))
        connection.commit()
        connection.close()
        logger.info(f"Paper inserted successfully. UUID: {uuidStr}")
        return True
    except sqlite3.Error as e:
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
        years = list(set([row[0] for row in rows]))
        

        if years == []:
            logger.warning(f"No years found for level {level} and subject {subjectName}")
            return False
        # Print the results for debugging purposes
        print(f"Extracted Years: {years}")
        
        logger.info(f"Years retrieved successfully for level {level} and subject {subjectName}")
        return years
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
                
        rows = db.execute('SELECT component FROM papers WHERE level = ? AND subject = ? AND year = ? ', (level,subject_name,year)).fetchall()

        components = [row[0] for row in rows]

        question_name = []
        # print(components)

        for component in components:
            question_name.append(f'{subject_name}, {component}, Year: {year} question paper')

        # print(question_name)
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
        
        # Execute the query
        rows = db.execute('SELECT questionFile FROM papers WHERE level = ? AND subject = ? AND year = ? AND component = ?', 
                          (level, subject_name, year, component)).fetchall()
        

        # Extract the compressed data from the query result
        compressedData = [row[0] for row in rows]
        
        if not compressedData:
            logger.warning(f"No data found for level {level}, subject {subject_name}, year {year}, component {component}")
            print("No data found for the given criteria.")
            return None
        
        # Encode the data in base64
        encodedData = [base64.b64encode(data).decode('utf-8') for data in compressedData]
        
        print("Data successfully fetched and encoded.")
        logger.info(f"Question rendered successfully for level {level}, subject {subject_name}, year {year}, component {component}")
        return encodedData

    except sqlite3.Error as e:
        logger.error(f"An error occurred while rendering question: {e}")
        return None
    
    except zlib.error as e:
        logger.error(f"Decompression error: {e}")
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
        
        logger.info(f"Components retrieved successfully for subject {subjectName} and year {year}")
        return components
    except sqlite3.Error as e:
        logger.error(f"An error occurred while getting components: {e}")
        return None
    finally:
        # Close the connection
        connection.close()


def getQuestionsForGen(subject, level, topics, components, difficulties):
    rowsList = []
    try:
        # Connect to the database
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        # Convert lists to comma-separated placeholders
        topics_placeholder = ', '.join('?' for _ in topics)
        difficulties_placeholder = ', '.join('?' for _ in difficulties)

        # Prepare the components placeholder and value
        if components == 'ALL':
            components_condition = ''  # No additional condition for components
            values = [subject, level] + topics + difficulties
        else:
            components_placeholder = ', '.join('?' for _ in components)
            components_condition = f'AND component IN ({components_placeholder})'
            values = [subject, level] + topics + difficulties + components

        # Create the query string with the appropriate conditions
        query = f'''
            SELECT * FROM questions 
            WHERE subject = ? AND level = ? 
            AND topic IN ({topics_placeholder}) 
            AND difficulty IN ({difficulties_placeholder}) 
            {components_condition}
        '''

        # Print the query and values for debugging
        print(f"Executing query: {query}")
        print(f"With values: {values}")

        # Execute the query
        row = db.execute(query, values)
        rows = row.fetchall()  # Fetch all the results

        # Close the database connection
        connection.close()

        logger.info(f"Questions for generation retrieved successfully for subject {subject}, level {level}")
        return rows  # Return the fetched results

    except sqlite3.Error as e:
        logger.error(f"An error occurred while getting questions for generation: {e}")
        raise Exception(f"An internal server error occurred: {e}")  # Raise exception to be handled by the route
    finally:
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

        # Print for debugging 
        print(data)


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