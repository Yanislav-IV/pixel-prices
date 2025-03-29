import requests
from bs4 import BeautifulSoup

def extract_price(c):
    ip = c.find('strong').get_text(strip=True)
    dp = c.find('sup').get_text(strip=True)
    return float(ip + "." + dp)

def parse_phone(c):
    name = c.find('p', class_='item-brand').get_text(strip=True)
    price = extract_price(c.find('span', class_='total-price new-price'))
    return {"name": name, "price": price}

def get_all_phones(url):
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')
    return [parse_phone(c) for c in soup.find_all('div', class_='mobile-width')]

url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
phones = get_all_phones(url)
for phone in phones:
    print("Name:", phone["name"])
    print("Price:", phone["price"])
    print()
