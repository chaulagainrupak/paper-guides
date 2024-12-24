import os
import subprocess
from datetime import datetime
import re
import time
import random
from urllib.parse import urlparse

def generate_sitemap(local_url, production_domain, min_delay=0.5, max_delay=1):
    """
    Generate a sitemap by crawling localhost and then replacing with production domain.
    
    Args:
        local_url (str): The local URL to crawl (e.g., http://localhost:3000)
        production_domain (str): The production domain to use in final sitemap
        min_delay (float): Minimum delay between requests in seconds
        max_delay (float): Maximum delay between requests in seconds
    """
    try:
        # Base directory path
        base_path = os.path.expanduser('~/paper-guides')
        os.makedirs(os.path.join(base_path, 'logs'), exist_ok=True)
        os.makedirs(os.path.join(base_path, 'static'), exist_ok=True)
        
        output_file = os.path.join(base_path, 'static', 'sitemap.xml')
        wget_output_file = os.path.join(base_path, 'logs', 'wget_output.txt')
        
        # Parse the URLs for later replacement
        local_parsed = urlparse(local_url)
        prod_parsed = urlparse(f"https://{production_domain}")
        
        # Faster wget command for local crawling
        wget_command = [
            'wget',
            '--spider',
            '--recursive',
            '--no-verbose',
            '--no-parent',
            '--level=inf',
            '--no-directories',
            '--wait=0.5',  # Reduced wait time for local crawling
            '--reject=jpg,jpeg,png,gif,svg,css,js,ico,pdf,zip,xml,mp4,mp3',
            '--output-file', wget_output_file,
            local_url
        ]
        
        print(f"Starting local crawl of {local_url}...")
        subprocess.run(wget_command, capture_output=True, text=True)
        
        # Parse URLs and replace localhost with production domain
        urls = set()
        url_pattern = re.compile(r'URL:(http?://[^\s]+)\s')
        
        with open(wget_output_file, 'r') as f:
            for line in f:
                matches = url_pattern.findall(line)
                for match in matches:
                    # Replace localhost URL with production domain
                    prod_url = match.replace(
                        f"{local_parsed.scheme}://{local_parsed.netloc}",
                        f"{prod_parsed.scheme}://{prod_parsed.netloc}"
                    )
                    urls.add(prod_url)
                # Minimal delay between processing chunks
                time.sleep(random.uniform(min_delay, max_delay))
        
        # Create XML sitemap
        current_date = datetime.now().strftime('%Y-%m-%d')
        xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for url in sorted(urls):
            xml_content += f'  <url>\n'
            xml_content += f'    <loc>{url}</loc>\n'
            xml_content += f'    <lastmod>{current_date}</lastmod>\n'
            xml_content += f'    <changefreq>monthly</changefreq>\n'
            xml_content += f'    <priority>0.8</priority>\n'
            xml_content += f'  </url>\n'
        
        xml_content += '</urlset>'
        
        # Write sitemap
        with open(output_file, 'w') as f:
            f.write(xml_content)
        
        # Create log file
        log_file = os.path.join(base_path, 'logs', 'sitemap_generator.log')
        with open(log_file, 'a') as log:
            log.write(f"{datetime.now()} - Sitemap generated for {production_domain} with {len(urls)} URLs\n")
        
        # Clean up temporary output file
        os.remove(wget_output_file)
        return f'Sitemap generated successfully with {len(urls)} URLs.'
    
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    print("\nPress [1] for .xyz")
    print("Press [2] for .org")
    option = int(input("\nOption: "))
    
    port = int(input("\nEnter local port number (e.g., 3000): "))
    local_url = f'http://localhost:{port}'
    
    if option == 1:
        production_domain = 'paperguides.xyz'
    elif option == 2:
        production_domain = 'paperguides.org'
    else:
        print("Invalid option exiting...")
        quit()
    
    # Generate sitemap
    print(generate_sitemap(local_url, production_domain))