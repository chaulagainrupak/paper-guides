import sqlite3
import json
import os
import re
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DB_PAPER = os.path.join(BASE_DIR, "instance", "paper-guides-papers.db")

OUTPUT_DIR = os.path.join(BASE_DIR, "configs", "sitemaps")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "https://paperguides.org"
TODAY = datetime.today().strftime("%Y-%m-%d")
CHUNK_SIZE = 1000


def slugify(text: str, board: str = "") -> str:
    text = text.lower()
    text = re.sub(r"[()]", "", text)
    if "kathmandu university" in board.lower():
        text = text.replace(" - ", " ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def parse_year_session(year_field):
    year_match = re.search(r"\d{4}", year_field)
    if not year_match:
        return None, None

    year = year_match.group(0)

    session = ""
    session_match = re.search(r"\((.*?)\)", year_field)
    if session_match:
        session = session_match.group(1)

    session = session.lower().strip()
    session = session.replace(" / ", "-")
    session = session.replace("/", "-")
    session = session.replace(" ", "-")
    session = re.sub(r"-+", "-", session)
    session = re.sub(r"[^a-z0-9\-]", "", session)

    return year, session


all_urls = []
subjectPages = set()
yearPages = set()
boards = set()
paperIndex = {}


def add(loc, freq=None, pr=None):
    if not loc:
        return
    all_urls.append({
        "loc": loc,
        "lastmod": TODAY,
        "changefreq": freq,
        "priority": pr
    })


DEFAULT_PAGES = [
    ("/", "weekly", 1.0),
    ("/about", "monthly", 0.7),
    ("/login", "monthly", 0.6),
    ("/pastpapers", "yearly", 0.3),
]

for path, freq, pr in DEFAULT_PAGES:
    add(f"{BASE_URL}{path}", freq, pr)

add(f"{BASE_URL}/subjects", "weekly", 1.0)

conn = sqlite3.connect(DB_PAPER)
cur = conn.cursor()

rows = cur.execute("""
SELECT board, subject, year, component
FROM papers
WHERE approved = 1
""")

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

    qpSlug = f"{subjectSlug}-question-paper-{componentSlug}-{yearOnly}-{sessionSlug}"
    qpUrl = f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}/{yearOnly}/{qpSlug}"

    add(qpUrl, "monthly", 0.8)

    if boardSlug not in paperIndex:
        paperIndex[boardSlug] = {}

    if subjectSlug not in paperIndex[boardSlug]:
        paperIndex[boardSlug][subjectSlug] = {"name": subject, "years": {}}

    if yearOnly not in paperIndex[boardSlug][subjectSlug]["years"]:
        paperIndex[boardSlug][subjectSlug]["years"][yearOnly] = []

    paperIndex[boardSlug][subjectSlug]["years"][yearOnly].append(qpSlug)

for boardSlug in boards:
    add(f"{BASE_URL}/subjects/{boardSlug}", "weekly", 0.95)

for boardSlug, subjectSlug in subjectPages:
    add(f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}", "weekly", 0.9)

for boardSlug, subjectSlug, year in yearPages:
    add(f"{BASE_URL}/subjects/{boardSlug}/{subjectSlug}/{year}", "weekly", 0.85)

chunks = [
    all_urls[i:i + CHUNK_SIZE]
    for i in range(0, len(all_urls), CHUNK_SIZE)
]

manifest = {
    "generatedAt": TODAY,
    "count": len(all_urls),
    "chunks": []
}

for i, chunk in enumerate(chunks):
    filename = f"urls-{i}.json"
    path = os.path.join(OUTPUT_DIR, filename)

    with open(path, "w") as f:
        json.dump(chunk, f, separators=(",", ":"))

    manifest["chunks"].append({
        "id": i,
        "file": filename,
        "count": len(chunk)
    })

with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w") as f:
    json.dump(manifest, f, separators=(",", ":"))

with open(os.path.join(BASE_DIR, "configs", "paperPaths.json"), "w") as f:
    json.dump(paperIndex, f, separators=(",", ":"))

print(f"total urls: {len(all_urls)}")
print(f"chunks: {len(chunks)}")
print("done")