import sys, time
import undetected_chromedriver as uc
from bs4 import BeautifulSoup

print("Hello World")
sys.stdout.flush()

driver = uc.Chrome()
driver.get("https://www.buybest.bg/manufacturers/google?category=1&per-page=24")
time.sleep(10)
html = driver.page_source
print(html)
sys.stdout.flush()
driver.quit()
