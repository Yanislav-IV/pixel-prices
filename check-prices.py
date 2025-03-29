import sys, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

print("Hello World")
sys.stdout.flush()

options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=options, executable_path="/usr/bin/chromedriver")
url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
driver.get(url)
time.sleep(10)  # wait 10 seconds for the challenge to be solved
html = driver.page_source
print(html)
sys.stdout.flush()
driver.quit()
