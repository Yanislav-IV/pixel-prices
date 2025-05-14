#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import csv
import os
import subprocess

URL          = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
HISTORY_FILE = "history.csv"
STATE_FILE   = "state.csv"

TODAY       = datetime.now().date()
TODAY_STR   = TODAY.strftime("%Y-%m-%d")
TOMORROW    = TODAY + timedelta(days=1)
TOMORROW_STR = TOMORROW.strftime("%Y-%m-%d")

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
    subprocess.run(["git", "add", HISTORY_FILE, STATE_FILE], check=True)
    msg = f"Update phone prices for {TOMORROW_STR}"
    subprocess.run(["git", "commit", "-m", msg], check=True)
    subprocess.run(["git", "push", "origin", "main"], check=True)

def read_state(filename=STATE_FILE):
    state = {}
    if os.path.isfile(filename):
        with open(filename, newline='', encoding='utf-8') as f:
            for name, price in csv.reader(f):
                state[name] = int(price)
    return state

def write_state(new_state, filename=STATE_FILE):
    old_state = read_state(filename)
    all_names = set(old_state) | set(new_state.keys())
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for name in sorted(all_names, reverse=True):
            price = new_state.get(name, 0)
            writer.writerow([name, price])

def make_events(old, new):
    evs = []
    for name, new_price in new.items():
        old_price = old.get(name, 0)
        if new_price != old_price:
            evs.append((TODAY_STR, name, new_price))
    for name, old_price in old.items():
        if name not in new and old_price > 0:
            evs.append((TODAY_STR, name, 0))
    return evs

def append_events(events, filename=HISTORY_FILE):
    with open(filename, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(events)

def remove_last_n_lines(n, filename=HISTORY_FILE):
    with open(filename, newline='', encoding='utf-8') as f:
        lines = f.readlines()
    if not lines:
        return
    header = []
    data = lines
    if lines[0].lower().startswith("date,"):
        header = [lines[0]]
        data = lines[1:]
    trimmed = data[:-n] if n <= len(data) else []
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        f.writelines(header + trimmed)

def read_state_ordered(filename=STATE_FILE):
    ordered = []
    if os.path.isfile(filename):
        with open(filename, newline='', encoding='utf-8') as f:
            for name, price in csv.reader(f):
                ordered.append((name, int(price)))
    return ordered

def main():
    subprocess.run(["git", "pull"], check=True)

    old_state = read_state()
    num_prev_available = sum(1 for price in old_state.values() if price > 0)
    remove_last_n_lines(num_prev_available)

    phones = get_all_phones(URL)
    new_state = {p["name"]: p["price"] for p in phones}

    events = make_events(old_state, new_state)
    if events:
        append_events(events)
    else:
        print("No new changes for today.")

    write_state(new_state)

    state_ordered = read_state_ordered()
    padding = [
        (TOMORROW_STR, name, price)
        for name, price in state_ordered
        if price > 0
    ]
    append_events(padding)

    commit_and_push_changes()

if __name__ == "__main__":
    main()
