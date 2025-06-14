import sqlite3

dbPapersPath = './instance/paper-guides-papers.db'
dbQuestionsPath = './instance/paper-guides-questions.db'

def moveQuestionsTable():
    try:
        connOld = sqlite3.connect(dbPapersPath)
        connNew = sqlite3.connect(dbQuestionsPath)
        cursorOld = connOld.cursor()
        cursorNew = connNew.cursor()

        cursorOld.execute("SELECT * FROM questions;")
        rows = cursorOld.fetchall()
        if rows:
            colCount = len(rows[0])
            placeholders = ",".join(["?"] * colCount)
            cursorNew.executemany(f"INSERT INTO questions VALUES ({placeholders})", rows)
            connNew.commit()
            print(f"Copied {len(rows)} rows to new DB 'questions' table.")
        else:
            print("No rows found in old 'questions' table.")

    except Exception as e:
        print(f"Error during moveQuestionsTable: {e}")
    finally:
        connOld.close()
        connNew.close()

moveQuestionsTable()
