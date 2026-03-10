import sqlite3
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime
import re

DB_PAPER = "./instance/paper-guides-papers.db"
DB_NOTES = "./instance/paper-guides-notes.db"

baseUrl = "https://paperguides.org"
today = datetime.today().strftime("%Y-%m-%d")

mainLinks = [
    ("/", "weekly", 1.0),
    ("/pastpapers", "weekly", 0.9),
    ("/notes", "weekly", 0.9),
    ("/generator", "weekly", 0.8),
    ("/mcqs", "weekly", 0.8),
]

footerLinks = [
    ("/about", "monthly", 0.6),
]

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return text.strip("-")

def parse_year_session(year_field):
    year_match = re.search(r"\d{4}", year_field)
    year = year_match.group(0) if year_match else year_field

    session = ""
    session_match = re.search(r"\((.*?)\)", year_field)
    if session_match:
        session = session_match.group(1)

    session = session.lower()
    session = session.replace("/", "-")
    session = session.replace(" ", "")
    session = session.replace("--", "-")

    return year, session

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


urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

for path, freq, pri in mainLinks + footerLinks:
    fullUrl = f"{baseUrl}{path}"
    node = createUrlNode(fullUrl, today, freq, pri)
    if node:
        urlset.append(node)

subjectPages = set()
yearPages = set()

try:

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
        subjectSlug = slugify(subject)

        yearOnly, sessionSlug = parse_year_session(year_field)

        subjectPages.add((boardSlug, subjectSlug))
        yearPages.add((boardSlug, subjectSlug, yearOnly))

        questionSlug = f"{subjectSlug}-question-paper-{component}-{yearOnly}-{sessionSlug}"
        markSlug = f"{subjectSlug}-mark-scheme-{component}-{yearOnly}-{sessionSlug}"

        questionUrl = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}/{yearOnly}/{questionSlug}"
        markUrl = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}/{yearOnly}/{markSlug}"

        node1 = createUrlNode(questionUrl, today, "monthly", 0.8)
        node2 = createUrlNode(markUrl, today, "monthly", 0.8)

        if node1:
            urlset.append(node1)

        if node2:
            urlset.append(node2)

except Exception as e:
    print("Paper DB Error:", e)

for boardSlug, subjectSlug in subjectPages:

    url = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}"

    node = createUrlNode(url, today, "weekly", 0.9)

    if node:
        urlset.append(node)

for boardSlug, subjectSlug, year in yearPages:

    url = f"{baseUrl}/subjects/{boardSlug}/{subjectSlug}/{year}"

    node = createUrlNode(url, today, "weekly", 0.85)

    if node:
        urlset.append(node)

try:

    connNotes = sqlite3.connect(DB_NOTES)
    cur = connNotes.cursor()

    notes = cur.execute("""
        SELECT level, subject, topic
        FROM notes
        WHERE approved = 1
    """)

    for level, subject, topic in notes:

        if not (level and subject and topic):
            continue

        path = f"/notes/{urllib.parse.quote(level)}/{urllib.parse.quote(subject)}/{urllib.parse.quote(topic)}"

        noteUrl = f"{baseUrl}{path}"

        node = createUrlNode(noteUrl, today, "monthly", 0.75)

        if node:
            urlset.append(node)

except Exception as e:
    print("Notes DB Error:", e)

tree = ET.ElementTree(urlset)

tree.write("./configs/sitemap.xml", encoding="utf-8", xml_declaration=True)

print("✅ sitemap.xml generated.")