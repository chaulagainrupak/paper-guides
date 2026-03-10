import sqlite3
import xml.etree.ElementTree as ET
from datetime import datetime
import re
import json
import os

BASE_DIR = os.path.dirname(__file__)

DB_PAPER = os.path.join(BASE_DIR, "instance", "paper-guides-papers.db")

baseUrl = "https://paperguides.org"
today = datetime.today().strftime("%Y-%m-%d")

# ---------------- SLUGIFY ----------------


def slugify(text: str, board: str = "") -> str:

    text = text.lower()

    # remove brackets
    text = re.sub(r"[()]", "", text)

    # KU subjects contain " - "
    if "kathmandu university" in board.lower():
        text = text.replace(" - ", " ")

    text = re.sub(r"[^a-z0-9]+", "-", text)

    text = text.strip("-")

    return text


# ---------------- YEAR + SESSION PARSER ----------------


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

    # normalize Cambridge sessions
    session = session.replace(" / ", "-")
    session = session.replace("/", "-")
    session = session.replace(" ", "-")

    # collapse multiple hyphens
    session = re.sub(r"-+", "-", session)

    # remove anything unsafe
    session = re.sub(r"[^a-z0-9\-]", "", session)

    return year, session


# ---------------- XML HELPER ----------------


def createUrlNode(loc, lastmod=None, changefreq=None, priority=None):

    if not loc:
        return None

    url = ET.Element("url")

    ET.SubElement(url, "loc").text = loc

    if lastmod:
        ET.SubElement(url, "lastmod").text = lastmod

    if changefreq:
        ET.SubElement(url, "changefreq").text = changefreq

    if priority:
        ET.SubElement(url, "priority").text = str(priority)

    return url


# ---------------- ROOT XML ----------------

urlset = ET.Element(
    "urlset",
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9",
)

# ---------------- INDEX STRUCTURES ----------------

subjectPages = set()
yearPages = set()

paperIndex = {}

# ---------------- PAPERS ----------------

conn = sqlite3.connect(DB_PAPER)
cur = conn.cursor()

rows = cur.execute(
    """
SELECT board, subject, year, component
FROM papers
WHERE approved = 1
"""
)

for board, subject, year_field, component in rows:

    if not board or not subject or not year_field:
        continue

    boardSlug = slugify(board)
    subjectSlug = slugify(subject, board)

    yearOnly, sessionSlug = parse_year_session(year_field)

    if not yearOnly:
        continue

    componentSlug = slugify(str(component))

    subjectPages.add((boardSlug, subjectSlug))
    yearPages.add((boardSlug, subjectSlug, yearOnly))

    qpSlug = f"{subjectSlug}-question-paper-{componentSlug}-{yearOnly}-{sessionSlug}"

    qpUrl = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}/{yearOnly}/{qpSlug}"

    node = createUrlNode(qpUrl, today, "monthly", 0.8)

    if node:
        urlset.append(node)

    # -------- BUILD INDEX FOR ASTRO --------

    if boardSlug not in paperIndex:
        paperIndex[boardSlug] = {}

    if subjectSlug not in paperIndex[boardSlug]:
        paperIndex[boardSlug][subjectSlug] = {"name": subject, "years": {}}

    if yearOnly not in paperIndex[boardSlug][subjectSlug]["years"]:
        paperIndex[boardSlug][subjectSlug]["years"][yearOnly] = []

    paperIndex[boardSlug][subjectSlug]["years"][yearOnly].append(qpSlug)


# ---------------- SUBJECT PAGES ----------------

for boardSlug, subjectSlug in subjectPages:

    url = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}"

    node = createUrlNode(url, today, "weekly", 0.9)

    if node:
        urlset.append(node)


# ---------------- YEAR PAGES ----------------

for boardSlug, subjectSlug, year in yearPages:

    url = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}/{year}"

    node = createUrlNode(url, today, "weekly", 0.85)

    if node:
        urlset.append(node)


# ---------------- WRITE SITEMAP ----------------

tree = ET.ElementTree(urlset)

sitemap_path = os.path.join(BASE_DIR, "configs", "sitemap.xml")

tree.write(sitemap_path, encoding="utf-8", xml_declaration=True)

# ---------------- WRITE PAPER INDEX ----------------

paper_index_path = os.path.join(BASE_DIR, "configs", "paperPaths.json")

with open(paper_index_path, "w") as f:
    json.dump(paperIndex, f, separators=(",", ":"))

print("✅ sitemap.xml generated")
print("✅ paperPaths.json generated")
