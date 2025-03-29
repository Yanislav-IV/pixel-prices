import requests
from bs4 import BeautifulSoup

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"}

def extract_price(c):
    return float(c.find('strong').get_text(strip=True) + "." + c.find('sup').get_text(strip=True))

def parse_phone(c):
    name = c.find('p', class_='item-brand').get_text(strip=True)
    link = c.find('a', href=True)['href']
    price = extract_price(c.find('span', class_='total-price new-price'))
    return {"name": name, "link": link, "price": price}

def get_all_phones(url):
    soup = BeautifulSoup(requests.get(url, headers=headers).content, 'html.parser')
    return [parse_phone(c) for c in soup.find_all('div', class_='mobile-width')]

url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
phones = get_all_phones(url)
for phone in phones:
    print("Name:", phone["name"])
    print("Link:", phone["link"])
    print("Price:", phone["price"])
    print("-" * 40)
