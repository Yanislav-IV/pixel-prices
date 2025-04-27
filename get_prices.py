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

def load_state(state_file="state.csv"):
    state = {}
    try:
        with open(state_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f, fieldnames=["name","price"])
            for row in reader:
                if row["name"] == "name":
                    continue
                state[row["name"]] = {
                    "price": int(row["price"]),
                    "in_stock": True
                }
    except FileNotFoundError:
        pass
    return state

def diff_states(old_state, new_state):
    today = datetime.now().strftime("%Y-%m-%d")
    changes = []
    tracked = set(old_state) | set(new_state)
    for name in tracked:
        old = old_state.get(name, {"price": None, "in_stock": False})
        new = new_state.get(name, {"price": None, "in_stock": False})
        if old["price"] != new["price"] or old["in_stock"] != new["in_stock"]:
            price_field = new["price"] if new["in_stock"] else ""
            in_stock_flag = int(new["in_stock"])
            changes.append([today, name, price_field, in_stock_flag])
    return changes

def main():
    url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
    subprocess.run(["git", "pull"])
    old_state = load_state()
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')
    new_state = {
        c.find('p', class_='item-brand').get_text(strip=True):
        {"price": int(c.find('strong').get_text(strip=True)), "in_stock": True}
        for c in soup.find_all('div', class_='mobile-width')
    }
    changes = diff_states(old_state, new_state)
    append_history(changes)
    with open('state.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for name, info in new_state.items():
            writer.writerow([name, info['price']])
    subprocess.run(["git", "add", "history.csv", "state.csv"])
    subprocess.run(["git", "commit", "-m", f"Update {datetime.now().strftime('%Y-%m-%d')}" ])
    subprocess.run(["git", "push", "origin", "main"])

main()
