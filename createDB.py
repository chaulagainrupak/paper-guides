

import sqlite3

def createDatabases():
    connection = sqlite3.connect('./instance/paper-guides-resources.db')
    db = connection.cursor()

    # Create table
    db.execute('''CREATE TABLE IF NOT EXISTS papers
                 (id INTEGER PRIMARY KEY, name TEXT, subject TEXT,  date DATE, board TEXT, level INTEGER, file BLOB )''')


    db.execute('''CREATE TABLE IF NOT EXISTS questions
                 (id INTEGER PRIMARY KEY, subject TEXT, topic TEXT,  difficulty  INTEGER, board TEXT, level TEXT, file BLOB )''')


    example_question = ('Mathematics', 'Straight Lines', 3, 'A', 'AS', './instance/image.png')
    insertQuestion(db, example_question)

    connection.commit()
    connection.close()

def insertQuestion(db, question):
    subject, topic, difficulty, board, level, file_path = question

    # Read the file as binary
    with open(file_path, 'rb') as file:
        file_data = file.read()

    # Insert into the questions table
    db.execute('''INSERT INTO questions (subject, topic, difficulty, board, level, file)
                  VALUES (?, ?, ?, ?, ?, ?)''', (subject, topic, difficulty, board, level, file_data))
    

def retrieveQuestions():
    connection = sqlite3.connect('./instance/paper-guides-resources.db')
    db = connection.cursor()

    # Select all rows from the questions table
    db.execute('''SELECT * FROM questions''')
    questions = db.fetchall()

    connection.close()

    return questions

