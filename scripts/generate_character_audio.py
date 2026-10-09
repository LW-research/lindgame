import asyncio
import os
import json
import edge_tts

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "audio", "teenieping")
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHARACTERS = [
    {
        "id": "heartsping",
        "name": "Heartsping",
        "voice": "en-US-AnaNeural",
        "pitch": "+26Hz",
        "rate": "+4%",
        "clips": {
            "greeting": "Hi there! I am Heartsping! Let's fill today with love and sparkles, chuping!",
            "catchphrase": "Heart power! Chuping!",
            "cheer_1": "Heart power! You did it, chuping!",
            "cheer_2": "Wonderful job! Your heart shines so bright!",
            "tag": "Heart power! Heartsping is here for you!",
            "hint": "Let's think with a happy heart! We can do it together, chuping!"
        }
    },
    {
        "id": "lalaping",
        "name": "Lalaping",
        "voice": "en-US-AnaNeural",
        "pitch": "+38Hz",
        "rate": "+8%",
        "clips": {
            "greeting": "Hello, superstar! Lalaping is here! Let's make learning sing with joy, lala!",
            "catchphrase": "Lala! Sing with joy!",
            "cheer_1": "Lala! That answer was music to my ears!",
            "cheer_2": "Super star dancer! You got it right, lala!",
            "tag": "Music time! Lalaping is ready to sing and play, lala!",
            "hint": "Listen to the rhythm! Lalaping is singing for you, lala!"
        }
    },
    {
        "id": "chachaping",
        "name": "Chachaping",
        "voice": "en-US-AvaNeural",
        "pitch": "+18Hz",
        "rate": "-2%",
        "clips": {
            "greeting": "Hello, little friend! Chachaping is here! Hope always blooms bright, chacha!",
            "catchphrase": "Hope blooms! Chacha!",
            "cheer_1": "Hope bloomed right on target, chacha!",
            "cheer_2": "Wonderful! You grew smarter with every step!",
            "tag": "Lucky clover power! Chachaping tagged in, chacha!",
            "hint": "Let your mind rest like gentle grass. Hope is always here, chacha!"
        }
    },
    {
        "id": "gogoping",
        "name": "Gogoping",
        "voice": "en-US-AnaNeural",
        "pitch": "+8Hz",
        "rate": "+6%",
        "clips": {
            "greeting": "Aza! Gogoping reporting for duty! Brave heroes never give up, gogo!",
            "catchphrase": "Never give up! Gogo!",
            "cheer_1": "Aza! High five! Brave and brilliant, gogo!",
            "cheer_2": "Powerful thinking! You smashed that challenge!",
            "tag": "Hero power! Gogoping tagged in! Full speed ahead!",
            "hint": "Stand tall and take courage! We tackle big numbers together, gogo!"
        }
    },
    {
        "id": "dadaping",
        "name": "Dadaping",
        "voice": "en-US-AvaNeural",
        "pitch": "+6Hz",
        "rate": "-3%",
        "clips": {
            "greeting": "Greetings! Dadaping is at your service. Let us learn with wisdom and care, dada!",
            "catchphrase": "Proper and neat! Dada!",
            "cheer_1": "Proper, neat, and correct! Wonderfully done, dada!",
            "cheer_2": "Splendid logic! Your mind is razor sharp!",
            "tag": "Wisdom and logic! Dadaping has joined the team, dada!",
            "hint": "Check each column carefully, step by step, dada!"
        }
    },
    {
        "id": "happyping",
        "name": "Happyping",
        "voice": "en-US-AnaNeural",
        "pitch": "+28Hz",
        "rate": "+6%",
        "clips": {
            "greeting": "Yaaaay! Happyping has arrived! Pop, pop, bubbles of happiness everywhere!",
            "catchphrase": "Bubbles of happiness! Happyping!",
            "cheer_1": "Pop, pop! That answer popped with happiness!",
            "cheer_2": "Sparkly happy smiles for you! You got it!",
            "tag": "Bubble pop! Happyping is tagged in! Woohoo!",
            "hint": "Do not worry, be happy! Pop a magic bubble and try again!"
        }
    }
]

async def generate_clip(text, voice, pitch, rate, dest_file):
    communicate = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)
    await communicate.save(dest_file)

async def main():
    manifest = {
        "characters": {},
        "version": "1.0"
    }

    print("Generating authentic Teenieping character voice clips...")
    for char in CHARACTERS:
        char_dir = os.path.join(OUTPUT_DIR, char["id"])
        os.makedirs(char_dir, exist_ok=True)
        manifest["characters"][char["id"]] = {}

        for clip_id, text in char["clips"].items():
            dest_file = os.path.join(char_dir, f"{clip_id}.mp3")
            rel_path = f"audio/teenieping/{char['id']}/{clip_id}.mp3"
            print(f"  [{char['name']}] generating {clip_id}: '{text}'...")
            await generate_clip(text, char["voice"], char["pitch"], char["rate"], dest_file)
            manifest["characters"][char["id"]][clip_id] = {
                "file": rel_path,
                "text": text
            }

    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Manifest written to {manifest_path}")
    print("All voice clips generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
