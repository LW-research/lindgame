import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOT_DIR = os.environ.get(
    "SCREENSHOT_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "playtest")
)
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1100, 'height': 820})
        page = await context.new_page()

        print("1. Navigating to http://localhost:8642...")
        await page.goto("http://localhost:8642")
        await page.wait_for_timeout(1000)

        # 1. Home screen with Teenieping Leader Companion
        print("Capturing 60_teenieping_home.png...")
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "60_teenieping_home.png"))

        # 2. Click companion avatar to hear cheer
        print("Clicking companion avatar...")
        await page.click("#tp-avatar-btn")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "61_teenieping_tapped.png"))

        # 3. Enter Math Missions -> The Moon
        print("Entering Math Missions...")
        await page.click("#btn-math")
        await page.wait_for_timeout(500)
        await page.click("#planet-moon")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "62_teenieping_mission_q1.png"))

        # Solve 3 questions to trigger automatic leader switch!
        for q in range(3):
            print(f"Solving question {q+1}...")
            label = await page.evaluate("document.querySelector('#column-sum').getAttribute('aria-label')")
            print(f"Question {q+1} label: {label}")
            parts = label.split()
            a, op, b = int(parts[0]), parts[1], int(parts[2])
            ans = a + b if op == 'plus' else a - b
            print(f"Answer: {ans}")
            digits = [int(c) for c in reversed(str(ans))] # ones first
            for d in digits:
                await page.click(f'button.key[data-key="{d}"]')
                await page.wait_for_timeout(200)
            await page.click('button.key[data-key="ok"]')
            await page.wait_for_timeout(1500)

            if q == 1:
                await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "63_teenieping_q2_cheer.png"))
            elif q == 2:
                # Question 3 solved! Auto tag-team switch triggers!
                print("Capturing tag-team banner and switch...")
                await page.wait_for_timeout(200)
                await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "64_teenieping_tag_team_switch.png"))

        await page.wait_for_timeout(2800)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "65_teenieping_new_leader_active.png"))

        # 4. Go to Story Time
        print("Navigating to Story Time...")
        await page.click("#btn-mission-back")
        await page.wait_for_timeout(400)
        await page.click("#btn-map-home")
        await page.wait_for_timeout(400)
        await page.click("#btn-stories")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "66_story_shelf_teenieping.png"))

        # 5. Open Teenieping Magic story
        print("Opening Teenieping Magic story...")
        await page.click("#story-teenieping")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "67_story_teenieping_reader.png"))

        # 6. Fill first blank
        print("Filling first blank in Teenieping story...")
        correct_word = await page.evaluate("window._articleState.parsed.blanks[0].correct")
        print(f"Correct word for blank 1: {correct_word}")
        await page.click(f'.bank-choice-btn[data-word="{correct_word}"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "68_story_blank_filled_cheer.png"))

        await browser.close()
        print("All playtest steps completed successfully!")

if __name__ == "__main__":
    asyncio.run(run())
