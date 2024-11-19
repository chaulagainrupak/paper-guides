import os
import subprocess
from datetime import datetime

website_url = 'https://paperguides.xyz'  

# Specify the output XML file path
output_file = os.path.expanduser('~/paper-guides/static/sitemap.xml')

# Create the command to crawl the website and save URLs to a file
wget_command = [
    'wget',
    '--spider',  # Spider mode (do not download)
    '--recursive',  # Recursively follow links
    '--no-verbose',  # Less output
    '--no-parent',  # Do not ascend to the parent directory
    '--no-directories',  # Do not create directories
    '--level=inf',  # Follow links to any depth
    '--output-file=wget_output.txt',  # Log file for wget output
    website_url
]

# Run the wget command and suppress output
with open(os.devnull, 'w') as devnull:
    subprocess.run(wget_command, stdout=devnull, stderr=devnull)

# Parse the output file to extract URLs
urls = set()
with open('wget_output.txt', 'r') as f:
    for line in f:
        if line.startswith("2024") or line.startswith("URL:"):  # Check for lines that contain URLs
            parts = line.split("URL:")  # Split by the URL prefix
            if len(parts) > 1:  # Ensure there is a URL part
                url = parts[1].strip().split()[0]  # Extract the URL and strip whitespace
                urls.add(url)

# Create the XML sitemap structure
xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image.v1">\n'

# Get the current date in the required format
current_date = datetime.now().strftime('%Y-%m-%d')

for url in urls:
    xml_content += f'  <url>\n'
    xml_content += f'    <loc>{url}</loc>\n'
    xml_content += f'    <lastmod>{current_date}</lastmod>\n'  # Last modified date
    xml_content += f'    <changefreq>daily</changefreq>\n'  # Change frequency
    xml_content += f'    <priority>0.8</priority>\n'  # Priority (0.0 to 1.0)
    xml_content += f'  </url>\n'

xml_content += '</urlset>'

# Write the XML content to the output file
# This will overwrite the previous sitemap if it exists
with open(output_file, 'w') as f: 
    f.write(xml_content)

# Clean up the temporary wget output file
os.remove('wget_output.txt')

print(f'Sitemap saved to {output_file}')