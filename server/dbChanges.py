import sqlite3
import zlib
import base64
import asyncio
from picPatcher import process_images

dbQuestionsPath = "./instance/paper-guides-questions.db"

class BlobFile:
    def __init__(self, data, name="db_image.png"):
        self.data = data
        self.filename = name

    async def read(self):
        return self.data

async def convertFiles():
    conn = sqlite3.connect(dbQuestionsPath)
    cur = conn.cursor()

    try:
        rows = cur.execute(
            "SELECT uuid, questionFile, solutionFile FROM questions"
        ).fetchall()

        for uuid, question, answer in rows:

            if question is None or answer is None:
                continue

            # Decode original compressed source
            q_bytes = zlib.decompress(base64.b64decode(question))
            a_bytes = zlib.decompress(base64.b64decode(answer))

            # Process with fake file objects
            qImg = await process_images([BlobFile(q_bytes)], padding=0)
            aImg = await process_images([BlobFile(a_bytes)], padding=0)

            if qImg is None or aImg is None:
                print(f"Skipping {uuid}: invalid image data")
                continue

            # Recompress processed images
            q_b64 = base64.b64encode(zlib.compress(qImg, level=9)).decode()
            a_b64 = base64.b64encode(zlib.compress(aImg, level=9)).decode()

            cur.execute(
                "UPDATE questions SET questionFile=?, solutionFile=? WHERE uuid=?",
                (q_b64, a_b64, uuid)
            )

            print(f"Updated {uuid}")

        conn.commit()

    except Exception as e:
        print("some error occured:", e)

    finally:
        conn.close()

asyncio.run(convertFiles())
