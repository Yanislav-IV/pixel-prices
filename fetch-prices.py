import requests
from bs4 import BeautifulSoup
from datetime import datetime
import csv
import os
import subprocess

def extract_price(c):
    ip = c.find('strong').get_text(strip=True)
    dp = c.find('sup').get_text(strip=True)
    return float(ip + "." + dp)

def parse_phone(c):
    name = c.find('p', class_='item-brand').get_text(strip=True)
    link = c.find('a', href=True)['href']
    price = extract_price(c.find('span', class_='total-price new-price'))
    return {"name": name, "link": link, "price": price}

def get_all_phones(url):
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')
    return [parse_phone(c) for c in soup.find_all('div', class_='mobile-width')]

def update_csv(phones, filename="phone_prices.csv"):
    file_exists = os.path.isfile(filename)
    today = datetime.now().strftime("%Y-%m-%d")
    with open(filename, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["date", "name", "link", "price"])  # Write header if file is new
        for phone in phones:
            writer.writerow([today, phone["name"], phone["link"], phone["price"]])

def commit_and_push_changes():
    # Stage the updated CSV file
    subprocess.run(["git", "add", "phone_prices.csv"])
    # Commit the changes with a message that includes the date
    commit_message = "Update phone prices for " + datetime.now().strftime("%Y-%m-%d")
    subprocess.run(["git", "commit", "-m", commit_message])
    # Push the changes using HTTPS (ensure your credentials or PAT are configured)
    subprocess.run(["git", "push", "origin", "main"])

def main():
    url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
    phones = get_all_phones(url)
    update_csv(phones)
    commit_and_push_changes()

if __name__ == "__main__":
    main()
