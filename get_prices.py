import requests
from bs4 import BeautifulSoup
from datetime import datetime
import csv
import os
import subprocess

def extract_price(c):
    price = c.find('strong').get_text(strip=True)
    return int(price)

def parse_phone(c):
    name = c.find('p', class_='item-brand').get_text(strip=True)
    price = extract_price(c.find('span', class_='total-price new-price'))
    return {"name": name, "price": price}

def get_all_phones(url):
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')
    return [parse_phone(c) for c in soup.find_all('div', class_='mobile-width')]

def update_csv(phones, filename="history.csv"):
    file_exists = os.path.isfile(filename)
    today = datetime.now().strftime("%Y-%m-%d")
    with open(filename, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for phone in phones:
            writer.writerow([today, phone["name"], phone["price"]])

def commit_and_push_changes():
    subprocess.run(["git", "add", "history.csv"])
    commit_message = "Update phone prices for " + datetime.now().strftime("%Y-%m-%d")
    subprocess.run(["git", "commit", "-m", commit_message])
    subprocess.run(["git", "push", "origin", "main"])

def main():
    url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
    subprocess.run(["git", "pull"])
    phones = get_all_phones(url)
    update_csv(phones)
    commit_and_push_changes()

if __name__ == "__main__":
    main()
