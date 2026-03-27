import sqlite3
import json
import os
import re
import requests
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DB_PAPER = os.path.join(BASE_DIR, "instance", "paper-guides-papers.db")
DB_NOTES = os.path.join(BASE_DIR, "instance", "paper-guides-notes.db")
DB_QUESTIONS = os.path.join(BASE_DIR, "instance", "paper-guides-questions.db")
OUTPUT_DIR = os.path.join(BASE_DIR, "configs", "sitemaps")
os.makedirs(OUTPUT_DIR, exist_ok=True)
CONFIG_PATH = os.path.join(BASE_DIR, "configs", "configs.json")
BASE_URL = "https://paperguides.org"
TODAY = datetime.today().strftime("%Y-%m-%d")
CHUNK_SIZE = 1000

with open(CONFIG_PATH, "r") as f:
    configData = json.load(f)

def slugify(text: str, board: str = "") -> str:
    text = text.lower()
    text = re.sub(r"[()]", "", text)
    if "kathmandu university" in board.lower() or "a levels" in board.lower():
        text = text.replace(" - ", " ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text[:60].rstrip("-")

def parse_year_session(year_field):
    year_match = re.search(r"\d{4}", year_field)
    if not year_match:
        return None, None
    year = year_match.group(0)
    session = ""
    session_match = re.search(r"\((.*?)\)", year_field)
    if session_match:
        session = session_match.group(1)
    session = session.lower().strip().replace(" / ", "-").replace("/", "-").replace(" ", "-")
    session = re.sub(r"-+", "-", session)
    session = re.sub(r"[^a-z0-9\-]", "", session)
    return year, session

def build_topics(topics: list[str], board: str, notes_db, questions_db) -> list[dict]:
    result = []
    conn_n = sqlite3.connect(notes_db)
    cur_n = conn_n.cursor()
    conn_q = sqlite3.connect(questions_db)
    cur_q = conn_q.cursor()
    for topic in topics:
        topic_slug = slugify(topic, board)
        cur_n.execute(
            "SELECT uuid, subject || ' - ' || topic AS title FROM notes WHERE LOWER(topic)=LOWER(?) AND LOWER(board)=LOWER(?) AND approved=1",
            (topic, board)
        )
        notes = [{"slug": row[0], "title": row[1]} for row in cur_n.fetchall()]
        cur_q.execute(
            "SELECT uuid, question FROM questions WHERE LOWER(topic)=LOWER(?) AND LOWER(board)=LOWER(?) AND approved=1",
            (topic, board)
        )
        questions = [{"slug": row[0], "title": row[1]} for row in cur_q.fetchall()]
        result.append({
            "name": topic,
            "slug": topic_slug,
            "notes": notes,
            "questions": questions
        })
    conn_n.close()
    conn_q.close()
    return result

all_urls = []
seen = set()
subjectPages = set()
yearPages = set()
sessionPages = set()
boards = set()
paperIndex = {}

def add(loc, freq=None, pr=None):
    if not loc or loc in seen:
        return
    seen.add(loc)
    all_urls.append({"loc": loc, "lastmod": TODAY, "changefreq": freq, "priority": pr})

DEFAULT_PAGES = [
    ("/", "daily", 1.0),
    ("/about", "monthly", 0.7),
    ("/login", "monthly", 0.6),
    ("/pastpapers", "weekly", 0.85),
    ("/notes", "weekly", 0.9),
    ("/questions", "weekly", 0.9),
    ("/generator", "weekly", 0.85),
]

for path, freq, pr in DEFAULT_PAGES:
    add(f"{BASE_URL}{path}", freq, pr)

# Process papers from the database
conn = sqlite3.connect(DB_PAPER)
cur = conn.cursor()
rows = cur.execute("SELECT board, subject, year, component FROM papers WHERE approved = 1").fetchall()
for board, subject, year_field, component in rows:
    if not board or not subject or not year_field:
        continue
    boardSlug = slugify(board)
    subjectSlug = slugify(subject, board)
    boards.add(boardSlug)
    yearOnly, sessionSlug = parse_year_session(year_field)
    if not yearOnly:
        continue
    componentSlug = slugify(str(component))
    subjectPages.add((boardSlug, subjectSlug))
    yearPages.add((boardSlug, subjectSlug, yearOnly))
    if sessionSlug:
        sessionPages.add((boardSlug, subjectSlug, yearOnly, sessionSlug))
    qpSlug = f"{subjectSlug}-question-paper-{componentSlug}-{yearOnly}-{sessionSlug}"
    qpUrl = f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}/{yearOnly}/{qpSlug}"
    add(qpUrl, "weekly", 0.85)
    if boardSlug not in paperIndex:
        paperIndex[boardSlug] = {}
    if subjectSlug not in paperIndex[boardSlug]:
        paperIndex[boardSlug][subjectSlug] = {"name": subject, "years": {}}
    if yearOnly not in paperIndex[boardSlug][subjectSlug]["years"]:
        paperIndex[boardSlug][subjectSlug]["years"][yearOnly] = []
    paperIndex[boardSlug][subjectSlug]["years"][yearOnly].append(qpSlug)
conn.close()

# Process notes and questions from config
VALID_NOTES_BOARDS = ["A Levels", "Kathmandu University"]
for boardName, boardData in configData.items():
    if boardName not in VALID_NOTES_BOARDS:
        continue
    print(f"\nProcessing board: {boardName}")
    boardSlug = slugify(boardName)
    if boardSlug not in paperIndex:
        paperIndex[boardSlug] = {}
    for subject in boardData.get("subjects", []):
        subjectName = subject.get("name")
        if not subjectName:
            continue
        print(f"  Processing subject: {subjectName}")
        subjectSlug = slugify(subjectName, boardName)
        if subjectSlug not in paperIndex[boardSlug]:
            paperIndex[boardSlug][subjectSlug] = {"name": subjectName, "years": {}}
        topics = subject.get("topics", [])
        if not isinstance(topics, list):
            topics = []
        built = build_topics(topics, boardName, DB_NOTES, DB_QUESTIONS)
        paperIndex[boardSlug][subjectSlug]["topics"] = built
        for t in built:
            print(f"    Processing topic: {t['name']}")
            add(f"{BASE_URL}/notes/{boardSlug}/{subjectSlug}/{t['slug']}", "weekly", 0.9)
            add(f"{BASE_URL}/questions/{boardSlug}/{subjectSlug}/{t['slug']}", "weekly", 0.9)
            for q in t["questions"]:
                add(f"{BASE_URL}/questions/{boardSlug}/{subjectSlug}/{t['slug']}/{q['slug']}", "weekly", 0.85)

# Add all other URLs to the sitemap
for boardSlug in boards:
    add(f"{BASE_URL}/questions/{boardSlug}", "weekly", 0.85)
for boardSlug, subjectSlug in subjectPages:
    add(f"{BASE_URL}/questions/{boardSlug}/{subjectSlug}", "weekly", 0.85)
for boardSlug in boards:
    add(f"{BASE_URL}/subjects/{boardSlug}", "weekly", 0.95)
for boardSlug, subjectSlug in subjectPages:
    add(f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}", "daily", 0.95)
for boardSlug, subjectSlug, year in yearPages:
    add(f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}/{year}", "daily", 0.9)
for boardSlug, subjectSlug, year, session in sessionPages:
    add(f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}/{year}/{session}", "weekly", 0.85)

# Save and ping sitemaps
chunks = [all_urls[i:i + CHUNK_SIZE] for i in range(0, len(all_urls), CHUNK_SIZE)]
manifest = {"generatedAt": TODAY, "count": len(all_urls), "chunks": []}
for i, chunk in enumerate(chunks):
    filename = f"urls-{i}.json"
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w") as f:
        json.dump(chunk, f, separators=(",", ":"))
    manifest["chunks"].append({"id": i, "file": filename, "count": len(chunk)})

with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w") as f:
    json.dump(manifest, f, separators=(",", ":"))

with open(os.path.join(BASE_DIR, "configs", "paperPaths.json"), "w") as f:
    json.dump(paperIndex, f, separators=(",", ":"))

try:
    sitemap_index = f"{BASE_URL}/sitemap.xml"
    requests.get(f"https://www.google.com/ping?sitemap={sitemap_index}", timeout=5)
    requests.get(f"https://www.bing.com/ping?sitemap={sitemap_index}", timeout=5)
    for chunk in manifest["chunks"]:
        chunk_url = f"{BASE_URL}/urls-{chunk['id']}.xml"
        requests.get(f"https://www.google.com/ping?sitemap={chunk_url}", timeout=5)
        requests.get(f"https://www.bing.com/ping?sitemap={chunk_url}", timeout=5)
except:
    pass