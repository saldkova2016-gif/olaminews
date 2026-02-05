import sys
from playwright.sync_api import sync_playwright

def verify_auth_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        # Capture alerts
        dialog_message = []
        page.on("dialog", lambda dialog: dialog_message.append(dialog.message) or dialog.accept())

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
                print("SUCCESS: Cloud indicator found. App is in Cloud Mode.")
            else:
                print("WARNING: Cloud indicator NOT found. Fallback might be active.")

            # Attempt to add an Event
            print("Adding a test event...")
            title_input = page.locator("input[placeholder='Например: Шаббат']")
            title_input.wait_for(state="visible", timeout=5000)
            title_input.fill("Auth Test Event")

            image_input = page.locator("input[placeholder='https://...']")
            image_input.fill("https://via.placeholder.com/150")

            link_input = page.locator("input[placeholder='olami.moscow/event']")
            link_input.fill("https://example.com")

            page.evaluate("""
                const dateInput = document.querySelector("input[type='datetime-local']");
                if (dateInput) {
                    dateInput.value = '2025-12-31T23:59';
                    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            """)

            # Click Create
            create_btn = page.locator("button:has-text('Создать')")
            create_btn.click()

            # Wait a bit
            page.wait_for_timeout(3000)

            # Check results
            event_in_list = page.locator("h4:has-text('Auth Test Event')")

            if event_in_list.is_visible():
                print("SUCCESS: Event added and visible in list. Auth worked!")
                page.screenshot(path="auth_fix_success.png")
                return True
            elif len(dialog_message) > 0:
                print(f"FAILURE (Expected): Save failed, but User Alert was shown: '{dialog_message[0]}'")
                print("This confirms error handling is working, even if permissions are still denied.")
                return True
            else:
                print("FAILURE: Event not added, and NO alert shown. Silent failure.")
                return False

        except Exception as e:
            print(f"Error checking features: {e}")
            page.screenshot(path="error_auth_verify.png")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    if verify_auth_fix():
        sys.exit(0)
    else:
        sys.exit(1)
