import sys, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

print("Hello World")
sys.stdout.flush()

options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service("/usr/bin/chromedriver")
driver = webdriver.Chrome(service=service, options=options)
url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
driver.get(url)
time.sleep(10)
html = driver.page_source
print(html)
sys.stdout.flush()
driver.quit()
