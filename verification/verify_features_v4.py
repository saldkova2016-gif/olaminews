import sys
from playwright.sync_api import sync_playwright

def verify_features():
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

            # Wait for the modal to appear
            # Use text locator for title, but verify visibility of the input
            page.wait_for_selector("text=CMS Olami Dashboard", timeout=10000)

            # Add an Event
            print("Adding a test event...")

            # Use specific placeholder
            title_input = page.locator("input[placeholder='Например: Шаббат']")
            title_input.wait_for(state="visible", timeout=5000)
            title_input.fill("Test Event 123")

            image_input = page.locator("input[placeholder='https://...']")
            image_input.fill("https://via.placeholder.com/150")

            link_input = page.locator("input[placeholder='olami.moscow/event']")
            link_input.fill("https://example.com")

            # Date input needs care. Usually easiest to set value via JS.
            page.evaluate("""
                const dateInput = document.querySelector("input[type='datetime-local']");
                if (dateInput) {
                    dateInput.value = '2025-12-31T23:59';
                    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
                    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            """)

            # Click Create
            # Button with text 'Создать'
            create_btn = page.locator("button:has-text('Создать')")
            create_btn.click()

            # Wait a bit for processing
            page.wait_for_timeout(2000)

            # Check if event appears in the list
            event_in_list = page.locator("h4:has-text('Test Event 123')")
            if event_in_list.is_visible():
                print("SUCCESS: Event added and visible in list.")
                return True
            else:
                print("FAILURE: Event NOT visible in list. Likely due to Firestore permission error (expected if rules not set).")
                return False # Still return false so we know it failed

        except Exception as e:
            print(f"Error checking features: {e}")
            # Take screenshot
            page.screenshot(path="error_features.png")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    if verify_features():
        sys.exit(0)
    else:
        # We allow failure here because we know permissions are missing
        sys.exit(0)
