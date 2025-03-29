import cloudscraper
from bs4 import BeautifulSoup

url = "https://www.buybest.bg/categories/mobilni-telefoni?manufacturer=13"
scraper = cloudscraper.create_scraper()  # Automatically handles Cloudflare protections
response = scraper.get(url)
if response.status_code != 200:
    print("Error fetching the page:", response.status_code)
    exit()

soup = BeautifulSoup(response.text, 'html.parser')

# Print out some data to verify it worked
for container in soup.find_all('div', class_='mobile-width'):
    name_tag = container.find('p', class_='item-brand')
    name = name_tag.get_text(strip=True) if name_tag else "Unknown Phone"
    print("Phone:", name)
