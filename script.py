import requests
from bs4 import BeautifulSoup

# URL with the manufacturer filter (manufacturer=13)
url = "https://www.buybest.bg/categories/mobilni-telefoni?manufacturer=13"

# Set headers to mimic a real browser
headers = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0.0.0 Safari/537.36"
    )
}

# Fetch the page
response = requests.get(url, headers=headers)
if response.status_code != 200:
    print("Error fetching the page:", response.status_code)
    exit()

# Parse the HTML content
soup = BeautifulSoup(response.text, 'html.parser')

# Find all phone containers
for container in soup.find_all('div', class_='mobile-width'):
    # Extract phone name
    name_tag = container.find('p', class_='item-brand')
    name = name_tag.get_text(strip=True) if name_tag else "Unknown Phone"

    # Extract new price
    new_price_tag = container.find('span', class_='new-price')
    new_price = (new_price_tag.find('strong').get_text(strip=True)
                 if new_price_tag and new_price_tag.find('strong')
                 else "N/A")

    # Print the extracted information
    print(f"Phone: {name}")
    print(f"  New Price: {new_price} лв.")
  
