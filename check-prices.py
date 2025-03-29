import sys, time
import undetected_chromedriver as uc
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

print("Hello World")
sys.stdout.flush()

options = uc.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_argument("--disable-infobars")
options.binary_location = "/usr/bin/google-chrome-stable"

driver = uc.Chrome(options=options)
print("Driver started")
sys.stdout.flush()

url = "https://www.buybest.bg/manufacturers/google?category=1&per-page=24"
driver.get(url)
print("Page requested, waiting for challenge resolution...")
sys.stdout.flush()

time.sleep(30)  # Increased wait time

html = driver.page_source
print("HTML length:", len(html))
soup = BeautifulSoup(html, 'html.parser')
print("Page title:", soup.title.string if soup.title else "No title")
sys.stdout.flush()

driver.quit()
