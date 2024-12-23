import os
import subprocess
from datetime import datetime
import re

def generate_sitemap(website_url):
    try:
        # Base directory path
        basePath = os.path.expanduser('~/paper-guides')
        
        # Ensure logs and static directories exist
        os.makedirs(os.path.join(basePath, 'logs'), exist_ok=True)
        os.makedirs(os.path.join(basePath, 'static'), exist_ok=True)

        outputFile = os.path.join(basePath, 'static', 'sitemap.xml')

        # Wget command to crawl the website
        wgetOutputFile = os.path.join(basePath, 'logs', 'wget_output.txt')
        wgetCommand = [
            'wget',
            '--spider',  # Spider mode (do not download)
            '--recursive',  # Recursively follow links
            '--no-verbose',  # Less output
            '--no-parent',  # Do not ascend to the parent directory
            '--level=inf',  # Follow links to any depth
            '--no-directories',  # Do not create directories
            '--reject=jpg,jpeg,png,gif,svg,css,js,ico,pdf,zip,xml,mp4,mp3',  # Reject unnecessary file types
            '--output-file', wgetOutputFile,  # Log file for wget output
            website_url
        ]

        # Run wget command
        subprocess.run(wgetCommand, capture_output=True, text=True)

        # Parse URLs from wget output
        urls = set()
        urlPattern = re.compile(r'URL:(https?://[^\s]+)\s')
        
        with open(wgetOutputFile, 'r') as f:
            for line in f:
                matches = urlPattern.findall(line)
                urls.update(matches)

        # Create XML sitemap
        currentDate = datetime.now().strftime('%Y-%m-%d')
        
        xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for url in sorted(urls):
            xmlContent += f' <url>\n'
            xmlContent += f'   <loc>{url}</loc>\n'
            xmlContent += f'   <lastmod>{currentDate}</lastmod>\n'
            xmlContent += f'   <changefreq>daily</changefreq>\n'
            xmlContent += f'   <priority>0.8</priority>\n'
            xmlContent += f' </url>\n'
        
        xmlContent += '</urlset>'

        # Write sitemap
        with open(outputFile, 'w') as f:
            f.write(xmlContent)

        # Create log file
        logFile = os.path.join(basePath, 'logs', 'sitemap_generator.log')
        with open(logFile, 'a') as log:
            log.write(f"{datetime.now()} - Sitemap generated for {website_url} with {len(urls)} URLs\n")

        # Clean up temporary output file
        os.remove(wgetOutputFile)

        return f'Sitemap generated successfully with {len(urls)} URLs.'
    
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    # Configuration

    print("\nPress [1] for .xyz")
    print("\nPress [2] for .org")

    option = int(input("\nOption: "))

    if option == 1:
        websiteUrl = 'https://paperguides.xyz'
    elif option == 2:
        websiteUrl = 'https://paperguides.org'
    else:
        print("Invalid option exiting...")
        quit()
    # Generate sitemap
    print(generate_sitemap(websiteUrl))
