import os
import subprocess
from datetime import datetime
import re

def generate_sitemap(localUrl, productionDomain, minDelay=0.5, maxDelay=1, forceCrawl=False):
    """
    Generate a sitemap by crawling localhost or using an existing wget output file, 
    then replacing local URLs with the production domain.
    
    Args:
        localUrl (str): The local URL to crawl (e.g., http://localhost:3000).
        productionDomain (str): The production domain to use in the final sitemap.
        minDelay (float): Minimum delay between requests in seconds.
        maxDelay (float): Maximum delay between requests in seconds.
        forceCrawl (bool): Force crawling regardless of existing output file.
    """
    try:
        # Base directory path
        basePath = os.path.expanduser('~/paper-guides')
        os.makedirs(os.path.join(basePath, 'logs'), exist_ok=True)
        os.makedirs(os.path.join(basePath, 'static'), exist_ok=True)
        
        outputFile = os.path.join(basePath, 'static', 'sitemap.xml')
        wgetOutputFile = os.path.join(basePath, 'logs', 'wget_output.txt')
        
        # Wget command for local crawling
        wgetCommand = [
            'wget',
            '--spider',
            '--recursive',
            '--no-verbose',
            '--no-parent',
            '--level=inf',
            '--no-directories',
            '--wait=0.5',
            '--reject=jpg,jpeg,png,gif,svg,css,js,ico,pdf,zip,xml,mp4,mp3',
            '--output-file', wgetOutputFile,
            localUrl
        ]
        
        # Check if crawling is necessary
        if forceCrawl or not os.path.exists(wgetOutputFile):
            print(f"Output file not found or forced crawl enabled. Crawling {localUrl}...")
            subprocess.run(wgetCommand, capture_output=True, text=True)
        else:
            print(f"Using existing wget output file: {wgetOutputFile}")
        
        # Parse URLs and replace localhost with production domain
        urls = set()
        urlPattern = re.compile(r'URL:(http?://[^\s]+)\s')
        with open(wgetOutputFile, 'r') as f:
            for line in f:
                parsedUrls = urlPattern.findall(line)
                for url in parsedUrls:
                    urls.add(url.replace(localUrl, productionDomain))
        
        # Create XML sitemap
        currentDate = datetime.now().strftime('%Y-%m-%d')
        xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        for url in sorted(urls):
            xmlContent += f'  <url>\n'
            xmlContent += f'    <loc>{url}</loc>\n'
            xmlContent += f'    <lastmod>{currentDate}</lastmod>\n'
            xmlContent += f'    <changefreq>monthly</changefreq>\n'
            xmlContent += f'    <priority>0.8</priority>\n'
            xmlContent += f'  </url>\n'
        xmlContent += '</urlset>'
        
        # Write sitemap to file
        with open(outputFile, 'w') as f:
            f.write(xmlContent)
        
        # Log the operation
        logFile = os.path.join(basePath, 'logs', 'sitemap_generator.log')
        with open(logFile, 'a') as log:
            log.write(f"{datetime.now()} - Sitemap generated for {productionDomain} with {len(urls)} URLs\n")
        
        print(f"Sitemap generated successfully with {len(urls)} URLs.")
        return "Sitemap generation completed."
    
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == '__main__':
    print("\nPress [1] for .xyz")
    print("Press [2] for .org")
    option = int(input("\nOption: "))
    
    port = int(input("\nEnter local port number (e.g., 3000): "))
    localUrl = f'http://localhost:{port}'
    
    if option == 1:
        productionDomain = 'https://paperguides.xyz'
    elif option == 2:
        productionDomain = 'https://paperguides.org'
    else:
        print("Invalid option, exiting...")
        quit()
    
    # Base directory and wget output file
    basePath = os.path.expanduser('~/paper-guides')
    wgetOutputFile = os.path.join(basePath, 'logs', 'wget_output.txt')
    
    # Ask if the user wants to clean up the existing wget output file
    if os.path.exists(wgetOutputFile):
        cleanup = input(f"Do you want to delete the existing wget output file ({wgetOutputFile})? [y/N]: ").strip().lower()
        if cleanup == 'y':
            os.remove(wgetOutputFile)
            print(f"{wgetOutputFile} deleted.")
        else:
            print(f"{wgetOutputFile} retained.")
    else:
        print(f"No existing wget output file found.")
    
    # Ask if the user wants to crawl
    shouldCrawl = input("Do you want to crawl the local URL? [y/N]: ").strip().lower()
    forceCrawl = shouldCrawl == 'y'
    
    # Generate sitemap
    print(generate_sitemap(localUrl, productionDomain, forceCrawl=forceCrawl))
