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

def commit_and_push_changes():
    subprocess.run(["git", "add", "history.csv"])
    commit_message = "Update phone prices for " + datetime.now().strftime("%Y-%m-%d")
    subprocess.run(["git", "commit", "-m", commit_message])
    subprocess.run(["git", "push", "origin", "main"])

def read_last_snapshot(filename="history.csv"):
    with open(filename, newline='', encoding='utf-8') as f:
        rows = list(csv.reader(f))
    if rows and rows[0][0].lower() == "date" and rows[0][2].lower() == "price":
        rows = rows[1:]
    last_date = max(r[0] for r in rows)
    return [
        {"name": r[1], "price": int(r[2])}
        for r in rows if r[0] == last_date
    ]

def snapshots_equal(a, b):
    return {p["name"]: p["price"] for p in a} == \
           {p["name"]: p["price"] for p in b}

def append_snapshot(phones, filename="history.csv"):
    today = datetime.now().strftime("%Y-%m-%d")
    with open(filename, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for p in phones:
            writer.writerow([today, p["name"], p["price"]])

def main():
    url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
    subprocess.run(["git", "pull"])
    phones_today = get_all_phones(url)
    phones_last = read_last_snapshot()
    today_str = datetime.now().strftime("%Y-%m-%d")

    if snapshots_equal(phones_last, phones_today):
        print(f"No new changes for {today_str}.")
        return

    append_snapshot(phones_today)
    commit_and_push_changes()

if __name__ == "__main__":
    main()
