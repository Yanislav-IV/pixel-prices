#!/usr/bin/env python3
import csv
import sys
from datetime import datetime

def load_state(path):
    state = {}
    try:
        with open(path, newline='', encoding='utf-8') as f:
            for row in csv.reader(f):
                if len(row) < 2:
                    continue
                name, price = row[0], row[1]
                try:
                    state[name] = {'price': int(price), 'in_stock': True}
                except ValueError:
                    continue
    except FileNotFoundError:
        pass
    return state

def diff_states(old_state, new_state, date=None):
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    changes = []
    for name in sorted(set(old_state) | set(new_state)):
        old = old_state.get(name, {'price': None, 'in_stock': False})
        new = new_state.get(name, {'price': None, 'in_stock': False})
        if old['price'] != new['price'] or old['in_stock'] != new['in_stock']:
            price_field = new['price'] if new['in_stock'] else ''
            in_stock = int(new['in_stock'])
            changes.append([date, name, price_field, in_stock])
    return changes

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print('Usage: ingest_history.py <old_state.csv> <new_state.csv> <history.csv> [<date>]')
        sys.exit(1)
    old_path, new_path, history_path = sys.argv[1:4]
    date = sys.argv[4] if len(sys.argv) >= 5 else None

    old_state = load_state(old_path)
    new_state = load_state(new_path)  # treats new as in-stock snapshot

    changes = diff_states(old_state, new_state, date)
    if changes:
        with open(history_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(changes)
        print(f'Appended {len(changes)} change events to {history_path}')
    else:
        print('No changes detected, no history appended.')

