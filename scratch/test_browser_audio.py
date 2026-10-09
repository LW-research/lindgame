import asyncio
from playwright.async_api import async_playwright

async def test_audio():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        context = await browser.new_context()
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        failed_requests = []
        page.on("requestfailed", lambda req: failed_requests.append(req.url))

        print("Navigating to http://localhost:8642...")
        await page.goto("http://localhost:8642")
        await page.wait_for_timeout(1000)

        # Check TeeniepingAudio object on window
        audio_available = await page.evaluate("typeof window.TeeniepingAudio !== 'undefined'")
        print(f"TeeniepingAudio on window: {audio_available}")
        assert audio_available, "TeeniepingAudio must be available on window"

        # Test audio clip playback in browser context
        result = await page.evaluate("""
            new Promise((resolve) => {
                const leader = Teenieping.getLeader();
                const played = TeeniepingAudio.playCatchphrase(leader.id, () => {
                    resolve({ played: true, completed: true, leader: leader.name });
                });
                if (!played) resolve({ played: false, completed: false, leader: leader.name });
                setTimeout(() => resolve({ played, completed: false, timeout: true }), 4000);
            })
        """)
        print(f"Playback result for catchphrase: {result}")

        # Click the avatar button in DOM
        await page.click("#tp-avatar-btn")
        await page.wait_for_timeout(1000)

        # Go to math mission and test cheer
        await page.click("#btn-math")
        await page.wait_for_timeout(400)
        await page.click("#planet-moon")
        await page.wait_for_timeout(600)

        cheer_result = await page.evaluate("""
            new Promise((resolve) => {
                const leader = Teenieping.getLeader();
                TeeniepingAudio.playCheerWithSpeech(leader.id, "10 plus 10 equals 20", { pitch: 1.2 }, () => {
                    resolve({ cheerFinished: true, leader: leader.name });
                });
                setTimeout(() => resolve({ cheerFinished: false, timeout: true }), 4000);
            })
        """)
        print(f"Cheer result: {cheer_result}")

        # Check tag switch playback
        tag_result = await page.evaluate("""
            new Promise((resolve) => {
                TeeniepingAudio.playTag("lalaping", () => {
                    resolve({ tagFinished: true });
                });
                setTimeout(() => resolve({ tagFinished: false, timeout: true }), 4000);
            })
        """)
        print(f"Tag audio result: {tag_result}")

        print(f"Failed requests: {failed_requests}")
        print(f"Page errors: {errors}")

        assert len(errors) == 0, f"Page had errors: {errors}"
        audio_404s = [u for u in failed_requests if "audio/teenieping" in u]
        assert len(audio_404s) == 0, f"Audio files 404: {audio_404s}"

        await browser.close()
        print("Browser audio playtest PASSED with 0 errors!")

if __name__ == "__main__":
    asyncio.run(test_audio())
