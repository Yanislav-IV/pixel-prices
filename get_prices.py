#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import csv
import os
import subprocess

def extract_price(c):
    price_text = c.find('strong').get_text(strip=True)
    return int(price_text)

def parse_phone(c):
    name = c.find('p', class_='item-brand').get_text(strip=True)
    price = extract_price(c.find('span', class_='total-price new-price'))
    return {"name": name, "price": price}

def get_all_phones(url):
    r = requests.get(url)
    r.raise_for_status()
    soup = BeautifulSoup(r.content, 'html.parser')
    return [parse_phone(c) for c in soup.find_all('div', class_='mobile-width')]

def commit_and_push_changes():
    subprocess.run(["git", "add", "history.csv", "state.csv"], check=True)
    msg = "Update phone prices for " + datetime.now().strftime("%Y-%m-%d")
    subprocess.run(["git", "commit", "-m", msg], check=True)
    subprocess.run(["git", "push", "origin", "main"], check=True)

def read_state(filename="state.csv"):
    state = {}
    if os.path.isfile(filename):
        with open(filename, newline='', encoding='utf-8') as f:
            for name, price in csv.reader(f):
                state[name] = int(price)
    return state

def write_state(new_state, filename="state.csv"):
    old_state = read_state(filename)
    all_names = set(old_state) | set(new_state.keys())
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for name in sorted(all_names, reverse=True):
            price = new_state.get(name, 0)
            writer.writerow([name, price])

def make_events(old, new):
    today = datetime.now().strftime("%Y-%m-%d")
    evs = []
    for name, pnew in new.items():
        pold = old.get(name, 0)
        if pnew != pold:
            evs.append((today, name, pnew))
    for name, pold in old.items():
        if name not in new and pold > 0:
            evs.append((today, name, 0))

    return evs

def append_events(events, filename="history.csv"):
    with open(filename, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(events)

def main():
    url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
    subprocess.run(["git", "pull"], check=True)

    phones = get_all_phones(url)
    new_state = {p["name"]: p["price"] for p in phones}

    old_state = read_state()

    events = make_events(old_state, new_state)
    if not events:
        print("No new changes for today.")
        return

    append_events(events)
    write_state(new_state)

    commit_and_push_changes()

if __name__ == "__main__":
    main()
