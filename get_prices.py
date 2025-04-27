import requests
from bs4 import BeautifulSoup
from datetime import datetime
import csv
import subprocess

def load_state(state_file="state.csv"):
    state = {}
    try:
        with open(state_file, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                name, price = row
                state[name] = {"price": int(price), "in_stock": True}
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

def append_history(changes, history_file="history.csv"):
    if not changes:
        return
    with open(history_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(changes)

def main():
    url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
    subprocess.run(["git", "pull"])

    old_state = load_state()

    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    new_state = {
        c.find('p', class_='item-brand').get_text(strip=True):
        {"price": int(c.find('strong').get_text(strip=True)), "in_stock": True}
        for c in soup.find_all('div', class_='mobile-width')
    }

    changes = diff_states(old_state, new_state)
    append_history(changes)

    with open('state.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["name", "price"])
        for name, info in new_state.items():
            writer.writerow([name, info['price']])

    subprocess.run(["git", "add", "history.csv", "state.csv"])
    commit_msg = f"Update history & state {datetime.now().strftime('%Y-%m-%d')}"
    subprocess.run(["git", "commit", "-m", commit_msg])
    subprocess.run(["git", "push", "origin", "main"])

main()
