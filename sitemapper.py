import os
import subprocess
from datetime import datetime
import re

def generate_sitemap(website_url):
    try:
        # Ensure ./logs and ./static directories exist
        os.makedirs('./logs', exist_ok=True)
        os.makedirs('./static', exist_ok=True)

        output_file = './static/sitemap.xml'

        # Wget command to crawl the website
        wget_command = [
            'wget',
            '--spider',  # Spider mode (do not download)
            '--recursive',  # Recursively follow links
            '--no-verbose',  # Less output
            '--no-parent',  # Do not ascend to the parent directory
            '--level=inf',  # Follow links to any depth
            '--no-directories',  # Do not create directories
            '--reject=jpg,jpeg,png,gif,svg,css,js,ico,pdf,zip,xml,mp4,mp3',  # Reject unnecessary file types
            '--output-file=wget_output.txt',  # Log file for wget output
            website_url
        ]

        # Run wget command
        subprocess.run(wget_command, capture_output=True, text=True)

        # Parse URLs from wget output
        urls = set()
        url_pattern = re.compile(r'URL:(https?://[^\s]+)\s')
        
        with open('wget_output.txt', 'r') as f:
            for line in f:
                matches = url_pattern.findall(line)
                urls.update(matches)

        # Create XML sitemap
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for url in sorted(urls):
            xml_content += f' <url>\n'
            xml_content += f'   <loc>{url}</loc>\n'
            xml_content += f'   <lastmod>{current_date}</lastmod>\n'
            xml_content += f'   <changefreq>daily</changefreq>\n'
            xml_content += f'   <priority>0.8</priority>\n'
            xml_content += f' </url>\n'
        
        xml_content += '</urlset>'

        # Write sitemap
        with open(output_file, 'w') as f:
            f.write(xml_content)

        # Create log file
        log_file = './logs/sitemap_generator.log'
        with open(log_file, 'a') as log:
            log.write(f"{datetime.now()} - Sitemap generated for {website_url} with {len(urls)} URLs\n")

        # Clean up temporary output file
        os.remove('wget_output.txt')

        return f'Sitemap generated successfully with {len(urls)} URLs.'
    
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    # Configuration
    website_url = 'https://paperguides.xyz'
    
    # Generate sitemap
    generate_sitemap(website_url)