import sys, requests

print("Hello World")
sys.stdout.flush()

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"}
url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"

response = requests.get(url, headers=headers)
print("Status Code:", response.status_code)
sys.stdout.flush()

html = response.text
print(html)
sys.stdout.flush()
