import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime
from time import time
from pathlib import Path

def generate_sitemap_xml(domain: str) -> str:
    """Generate sitemap XML for entire site
    
    Args:
        domain: Website domain to crawl
    """
    # Run wget to get all pages
    wget_process = subprocess.Popen([
        'wget',
        '--spider',
        '--recursive',
        '--no-verbose',
        '--reject', '*.css,*.js,*.png,*.jpg,*.jpeg,*.gif,*.svg,*.woff,*.woff2,*.ttf,*.eot',
        '--no-check-certificate',  # Skip SSL verification for faster crawling
        '--output-file=/tmp/wget.log',
        domain
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    wget_process.wait()
    
    # Extract URLs using grep
    grep_process = subprocess.Popen([
        'grep',
        '-o',
        f'https://[^ ]*',
        '/tmp/wget.log'
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    output, _ = grep_process.communicate()
    urls = set(url for url in output.decode().split('\n') if url and url.startswith(domain))
    
    # Create sitemap XML
    urlset = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    
    for url in urls:
        url_elem = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url_elem, 'loc')
        loc.text = url
        lastmod = ET.SubElement(url_elem, 'lastmod')
        lastmod.text = datetime.now().strftime('%Y-%m-%d')
        changefreq = ET.SubElement(url_elem, 'changefreq')
        changefreq.text = 'daily'
        priority = ET.SubElement(url_elem, 'priority')
        priority.text = '0.8'
    
    # Convert to string with pretty printing
    ET.indent(urlset, space="  ")
    return ET.tostring(urlset, encoding='unicode', xml_declaration=True)
