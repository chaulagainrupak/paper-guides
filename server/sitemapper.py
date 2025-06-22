import sqlite3
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime

# DB Paths
DB_PAPER = "./instance/paper-guides-papers.db"
DB_NOTES = "./instance/paper-guides-notes.db"

# Constants
today = datetime.today().strftime("%Y-%m-%d")
baseUrl = "https://paperguides.org"
seasons = ["feb-mar", "may-june", "oct-nov"]

mainLinks = [
    ("/", "weekly", 1.0),
    ("/pastpapers", "weekly", 0.9),
    ("/notes", "weekly", 0.9),
    ("/generator", "weekly", 0.8),
]

footerLinks = [
    ("/about", "yearly", 0.6),
]

def createUrlNode(loc, lastmod=None, changefreq=None, priority=None):
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
    urlset.append(createUrlNode(fullUrl, today, freq, pri))

try:
    connPaper = sqlite3.connect(DB_PAPER)
    cur = connPaper.cursor()
    rows = cur.execute("SELECT * FROM papers")
    for row in rows:
        if "insert" in row[3].lower():
            continue
        for season in seasons:
            paperUrl = f"{baseUrl}/subjects/{row[5]}/{row[2]}/{row[3][:4]}/{row[2].lower()}-question-paper-{row[4]}-{row[3][:4]}-{season}".replace(" ", "%20")
            urlset.append(createUrlNode(paperUrl, changefreq="yearly", priority=0.6))
except Exception as e:
    print("Paper DB Error:", e)

# Add notes
try:
    connNotes = sqlite3.connect(DB_NOTES)
    cur = connNotes.cursor()
    notes = cur.execute("SELECT level, subject, topic FROM notes WHERE approved = 1")
    for level, subject, topic in notes:
        if not (level and subject and topic):
            continue
        path = f"/notes/{urllib.parse.quote(level)}/{urllib.parse.quote(subject)}/{urllib.parse.quote(topic)}"
        noteUrl = f"{baseUrl}{path}".replace(" ", "%20")
        urlset.append(createUrlNode(noteUrl, changefreq="monthly", priority=0.8))
except Exception as e:
    print("Notes DB Error:", e)

# Write to file
tree = ET.ElementTree(urlset)
tree.write("./configs/sitemap.xml", encoding="utf-8", xml_declaration=True)
tree.write("../client/public/sitemap.xml", encoding="utf-8", xml_declaration=True)

print("✅ sitemap.xml generated.")
