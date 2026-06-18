import json
import os
import re
import sqlite3
from pathlib import Path

BASE_DIR = os.path.dirname(__file__)
DB_PAPER = os.path.join(BASE_DIR, "instance", "paper-guides-papers.db")
DB_NOTES = os.path.join(BASE_DIR, "instance", "paper-guides-notes.db")
DB_QUESTIONS = os.path.join(BASE_DIR, "instance", "paper-guides-questions.db")
CONFIG_PATH = os.path.join(BASE_DIR, "configs", "configs.json")

with open(CONFIG_PATH, "r") as f:
    configData = json.load(f)

# slugify

_UNSAFE = re.compile(r"[^\w\s-]")
_WS_DASHES = re.compile(r"[\s_-]+")


def slugify(s: str) -> str:
    s = s.strip().strip("'\"")
    s = _UNSAFE.sub("-", s)
    s = _WS_DASHES.sub("-", s)
    return s.lower().strip("-")


# subject parsers

_ALEVEL_RE = re.compile(r"^(.*?)\s*\((\d{4})\)\s*$")
_KU_RE = re.compile(r"^(.*?)\s*-\s*(.+)$")


def parse_alevel_subject(subject: str):
    m = _ALEVEL_RE.match(subject.strip())
    if m:
        name = slugify(m.group(1))
        code = m.group(2).strip()
        slug = f"{name}-{code}"
        return slug, slug
    slug = slugify(subject)
    return slug, slug


def parse_ku_subject(subject: str):
    m = _KU_RE.match(subject.strip())
    if m:
        prefix = slugify(m.group(1))
        full = slugify(subject)
        return prefix, full
    slug = slugify(subject)
    return slug, slug


# year / session parser

_SESSION_MAP = {
    "january": "jan",
    "february": "feb",
    "march": "mar",
    "april": "apr",
    "may": "may",
    "june": "jun",
    "july": "jul",
    "august": "aug",
    "september": "sep",
    "october": "oct",
    "november": "nov",
    "december": "dec",
    "summer": "summer",
    "winter": "winter",
    "spring": "spring",
    "autumn": "autumn",
}


def parse_year_session(year_field: str):
    yr_match = re.search(r"(\d{4})", year_field)
    if not yr_match:
        return None, None
    yr = yr_match.group(1)

    paren = re.search(r"\(([^)]+)\)", year_field)
    if paren:
        parts = re.split(r"[\s/]+", paren.group(1).strip())
        tokens = [_SESSION_MAP.get(p.lower(), p.lower()) for p in parts if p]
        session = "-".join(tokens)
    else:
        session = ""

    return yr, session


# path builder


def build_paths(
    board: str, subject: str, year_field: str, component: str, file_type: str
):
    board_slug = slugify(board)
    yr, session = parse_year_session(year_field)
    if not yr:
        return None, None
    comp_slug = slugify(component)
    yr_session = f"{yr}-{session}" if session else yr

    if "a level" in board.lower():
        folder_subj, file_subj = parse_alevel_subject(subject)
    else:
        folder_subj, file_subj = parse_ku_subject(subject)

    fname = f"{file_subj}-{yr_session}-{comp_slug}-{file_type}.pdf"
    folder = Path(board_slug) / folder_subj / yr
    return folder, fname


# topics


def build_topics(topics: list[str], board: str, notes_db, questions_db) -> list[dict]:
    result = []
    conn_n = sqlite3.connect(notes_db)
    cur_n = conn_n.cursor()
    conn_q = sqlite3.connect(questions_db)
    cur_q = conn_q.cursor()

    for topic in topics:
        topic_slug = slugify(topic)

        cur_n.execute(
            "SELECT uuid, subject || ' - ' || topic AS title FROM notes "
            "WHERE LOWER(topic)=LOWER(?) AND LOWER(board)=LOWER(?) AND approved=1",
            (topic, board),
        )
        notes = [{"slug": row[0], "title": row[1]} for row in cur_n.fetchall()]

        cur_q.execute(
            "SELECT uuid, question, solution, keywords FROM questions "
            "WHERE LOWER(topic)=LOWER(?) AND LOWER(board)=LOWER(?) AND approved=1",
            (topic, board),
        )
        questions = []
        for row in cur_q.fetchall():
            questions.append(
                {
                    "slug": row[0],
                    "title": row[1],
                    "question": row[1],
                    "solution": row[2],
                    "keywords": json.loads(row[3]) if row[3] else [],
                }
            )

        result.append(
            {
                "name": topic,
                "slug": topic_slug,
                "notes": notes,
                "questions": questions,
            }
        )

    conn_n.close()
    conn_q.close()
    return result


# build index

paperIndex = {}

# papers
conn = sqlite3.connect(DB_PAPER)
cur = conn.cursor()
rows = cur.execute(
    "SELECT board, subject, year, component FROM papers WHERE approved = 1"
).fetchall()

for board, subject, year_field, component in rows:
    if not board or not subject or not year_field:
        continue

    yr, session = parse_year_session(year_field)
    if not yr:
        continue

    yr_session = f"{yr}-{session}" if session else yr
    board_slug = slugify(board)

    if "a level" in board.lower():
        folder_subj, file_subj = parse_alevel_subject(subject)
    else:
        folder_subj, file_subj = parse_ku_subject(subject)

    comp_slug = slugify(component)
    qpSlug = f"{file_subj}-{yr_session}-{comp_slug}-qp"

    folder_qp, fname_qp = build_paths(board, subject, year_field, component, "qp")
    folder_ms, fname_ms = build_paths(board, subject, year_field, component, "ms")

    if not folder_qp:
        continue

    if board_slug not in paperIndex:
        paperIndex[board_slug] = {}
    if file_subj not in paperIndex[board_slug]:
        paperIndex[board_slug][file_subj] = {"name": subject, "years": {}}
    if yr not in paperIndex[board_slug][file_subj]["years"]:
        paperIndex[board_slug][file_subj]["years"][yr] = []

    paperIndex[board_slug][file_subj]["years"][yr].append(
        {
            "slug": qpSlug,
            "qp_path": str(folder_qp / fname_qp),
            "ms_path": str(folder_ms / fname_ms),
        }
    )

conn.close()

# notes and questions
VALID_NOTES_BOARDS = ["A Levels", "Kathmandu University"]

for boardName, boardData in configData.items():
    if boardName not in VALID_NOTES_BOARDS:
        continue

    print(f"\nProcessing board: {boardName}")
    board_slug = slugify(boardName)

    if board_slug not in paperIndex:
        paperIndex[board_slug] = {}

    for subject in boardData.get("subjects", []):
        subjectName = subject.get("name")
        if not subjectName:
            continue

        print(f"  Subject: {subjectName}")

        if "a level" in boardName.lower():
            _, file_subj = parse_alevel_subject(subjectName)
        else:
            _, file_subj = parse_ku_subject(subjectName)

        if file_subj not in paperIndex[board_slug]:
            paperIndex[board_slug][file_subj] = {"name": subjectName, "years": {}}

        topics = subject.get("topics", [])
        if not isinstance(topics, list):
            topics = []

        built = build_topics(topics, boardName, DB_NOTES, DB_QUESTIONS)
        paperIndex[board_slug][file_subj]["topics"] = built

        for t in built:
            print(
                f"    {t['name']} — {len(t['questions'])} questions, {len(t['notes'])} notes"
            )

# write
with open(os.path.join(BASE_DIR, "configs", "paperPaths.json"), "w") as f:
    json.dump(paperIndex, f, separators=(",", ":"))

print("\nDone. paperPaths.json written.")
