import sys
from playwright.sync_api import sync_playwright

def verify_cloud_persistence():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        print("Navigating to app...")
        try:
            page.goto("http://localhost:5173", timeout=30000, wait_until="domcontentloaded")
        except Exception as e:
            print(f"Error navigating: {e}")
            return False

        # Open Admin Panel
        print("Opening Admin Panel...")
        try:
            # Click the settings button in the header
            settings_btn = page.locator("header button").last
            settings_btn.click()

            # Wait for the modal
            modal = page.locator("text=CMS Olami Dashboard")
            modal.wait_for(state="visible", timeout=10000)

            # Check for Cloud Indicator
            print("Checking for indicators...")
            cloud_indicator = page.get_by_text("Облако")

            if cloud_indicator.is_visible():
                print("SUCCESS: Cloud indicator found. App is in Cloud Mode despite potential Auth failure.")
                page.screenshot(path="cloud_fallback_success.png")
                return True
            else:
                print("FAILURE: Cloud indicator NOT found. App fell back to Local Mode.")
                return False

        except Exception as e:
            print(f"Error checking features: {e}")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    if verify_cloud_persistence():
        sys.exit(0)
    else:
        sys.exit(1)
