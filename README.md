# 💖 Catch! Teenieping Magic Academy (캐치! 티니핑)

An enchanting educational web game featuring the beloved **Catch! Teenieping (캐치! 티니핑)** cartoon fairy characters, designed for a **first grader / 6-year-old** to learn and practice:

- **Randomly generated addition and subtraction up to 4-digit numbers**, progressing from 2-digit no-carrying up to 4-digit numbers with full carrying and borrowing (always $\le 9999$).
- **Randomly generated reading stories for first graders**: **Word Hunt** (Dolch sight words & picture matching) and **Story Time** (dynamic multi-paragraph stories with **randomized cloze blanks** and a special **Teenieping Magic** adventure).
- **Dynamic Teenieping Companion, Manual Character Switcher & Tag-Team Auto-Switching**:
  - **Manual Switch Button & Character Picker**: A dedicated `🔄 Switch` button in the companion dock opens a child-friendly popup dialog displaying all 6 Teenieping fairy cards with their vector portraits, titles, and catchphrases, or lets the child tap "Surprise Me! 🎲" to instantly pick a new friend anytime.
  - **Tag-Team Auto-Switching**: The companion also automatically tags in a new fairy leader after every 3 solved questions with an animated drop-in banner and tag voice line.
- **Teenieping Character Voice Reading All Questions**: Studio-grade neural cartoon voices read all dynamic questions aloud in the current leader's voice—including math word problems, equation steps, sight words, prompts, and 4-paragraph reading stories with **real-time word-by-word read-along highlighting**.
- **Authentic Pre-Recorded Voice Clips**: 36 pre-rendered cartoon sound clips (`greeting.mp3`, `catchphrase.mp3`, `cheer.mp3`, `tag.mp3`, `hint.mp3`) across all 6 Teenieping characters.
- **Smart Disk Caching & Offline Fallback**: Spoken sentences and sight words cache instantly on disk for 0ms replay. If running without the local server, the game seamlessly falls back to the browser's Web Speech API with tuned character pitch.

Zero external asset dependencies. Built with pure HTML5, CSS, and Vanilla JavaScript with SVG vector badges, local neural TTS server ([server.py](server.py)), and Web Audio API chimes.

---

## 🧚 The Teenieping Leaders & Vocal Profiles

| Character | Korean | Element | Accent | Audio Voice Model | Catchphrase Audio Clip | Voice Reading Style |
|---|---|---|---|---|---|---|
| **Heartsping** | 하츄핑 | Love 💖 | `#ff6b9d` | `en-US-AnaNeural` (+26Hz, +4%) | *"Heart power! Chuping!"* | Sweet, bright, and loving fairy voice |
| **Lalaping** | 라라핑 | Joy & Music 🎵 | `#ffc83b` | `en-US-AnaNeural` (+38Hz, +8%) | *"Lala! Sing with joy!"* | Musical, singing, high-spirited fairy voice |
| **Chachaping** | 차차핑 | Hope 🍀 | `#40c97b` | `en-US-AvaNeural` (+18Hz, -2%) | *"Hope blooms! Chacha!"* | Warm, gentle, and calming companion voice |
| **Gogoping** | 아자핑 | Courage 🔥 | `#ff7b47` | `en-US-AnaNeural` (+8Hz, +6%) | *"Never give up! Gogo!"* | Energetic, brave, and adventurous boyish voice |
| **Dadaping** | 바로핑 | Wisdom 📖 | `#4ea8de` | `en-US-AvaNeural` (+6Hz, -3%) | *"Proper and neat! Dada!"* | Polite, thoughtful, and steady scholar voice |
| **Happyping** | 해피핑 | Happiness 🫧 | `#d668ff` | `en-US-AnaNeural` (+28Hz, +6%) | *"Bubbles of happiness! Happyping!"* | Bubbly, giggly, and cheerful voice |

---

## ▶️ How to Run & Play (1-Click Launch Options)

You have multiple convenient ways to launch the server and game page together:

### Option 1: Double-Click `LindGame.app` (macOS 1-Click App — Recommended 🌟)
- In macOS Finder, simply **double-click** [LindGame.app](LindGame.app).
- It silently starts the local voice server in the background and opens the game directly in your default web browser—no terminal required!

### Option 2: Double-Click `Play.command` (macOS Terminal Launcher)
- In macOS Finder, **double-click** [Play.command](Play.command).
- Opens Terminal, launches the server with the configured Python environment, and immediately opens the game in your default web browser! Keep the window open while playing, and close it when done.

### Option 3: Command Line (`python3 server.py` or `npm start`)
```bash
python3 server.py
# or: npm start
```
- Starts the server securely bound to `127.0.0.1:8642` and **automatically opens the game page** at `http://localhost:8642` in your default browser. (Pass `--no-browser` if running headlessly or in automated test scripts).

### Option 4: Direct `index.html` Opening & Smart Detection
- If you double-click [index.html](index.html) (`file:///` protocol):
  - **If the server is running**: It automatically and transparently redirects to `http://localhost:8642` so you enjoy the full neural cartoon voice experience!
  - **If the server is offline**: It displays a child-friendly Teenieping banner reminding you to double-click [Play.command](Play.command) or [LindGame.app](LindGame.app), while continuing to let the child play seamlessly with Web Speech API audio!

---

## 💻 Running on Another Mac (Portability Guide)

**Yes! You can copy the entire `LindGame` folder to any other Mac and run it immediately.**

### Why It's Fully Portable:
1. **Self-Contained Assets**: 100% of HTML, CSS, JavaScript, inline SVG vector graphics, 36 authentic Teenieping character MP3 audio clips (`audio/teenieping/`), and pre-cached neural voice files (`audio/cache/`) live directly in this folder. No external CDNs, web fonts, or remote asset downloads are needed.
2. **Auto-Detecting Python Launchers**: Both [LindGame.app](LindGame.app) and [Play.command](Play.command) dynamically detect whatever Python environment exists on the target Mac (system `python3`, Homebrew, Conda, Pyenv, etc.) using generic `$HOME` lookups with zero hardcoded personal paths.
3. **Zero-Setup Offline Fallback**: Even if the other Mac has no Python installed, double-clicking [index.html](index.html) in Safari or Chrome plays immediately using the browser's built-in Web Speech API alongside all 36 authentic character voice clips!

### How to Copy & Run on Another Mac:
1. **Copy the Folder**:
   - Transfer `LindGame` via AirDrop, USB drive, or as a `.zip` archive.
2. **Launch on the Other Mac**:
   - **Method A (Easiest 🌟)**: Double-click [LindGame.app](LindGame.app).
     > *macOS Gatekeeper Tip*: When opening an app copied from another computer, macOS may ask to confirm. Simply **Right-Click (or Control-Click) -> Open**, and click **Open**.
   - **Method B (Terminal Launcher)**: Double-click [Play.command](Play.command).
     > *If file permissions were stripped by a FAT32 USB drive*: Open Terminal and run: `chmod +x Play.command LindGame.app/Contents/MacOS/LindGame`
   - **Method C (Browser Direct)**: Double-click [index.html](index.html) in Finder.
3. **Optional (For Full Neural Cartoon Voice Generation)**:
   - If Python is installed, install `edge-tts`:
     ```bash
     pip install edge-tts
     ```
   - *Note*: If `edge-tts` is omitted, [server.py](server.py) still runs and serves the game, and the front-end automatically falls back to Apple's high-quality built-in voices with character pitch tuning.

## 🎮 Game Modes & Features

| Mode / Feature | What the child does | Pedagogical focus |
|---|---|---|
| **🔄 Character Switcher** | Taps `🔄 Switch` in the companion dock to open the fairy modal and choose any character (Heartsping, Lalaping, Chachaping, Gogoping, Dadaping, Happyping) or pick randomly | Agency, customization, emotional connection to favorite characters |
| **🔢 Math Missions** | Solves **randomly generated 1–4 digit** addition and subtraction problems using a vertical column algorithm | Place value (ones, tens, hundreds, thousands), column arithmetic, mental math |
| **📖 Word Hunt** | Alternates between "Listen & tap the word" and "Read the word & tap the picture" | Dolch sight-word auditory recognition and independent silent reading |
| **📚 Story Time** | Reads **freshly generated 4-paragraph stories** in a spacious side-by-side layout (article on the left, answers on the right) and fills in missing words from a focused word bank | Grade 1 reading fluency, sentence context clues, vocabulary decoding |
| **💖 Teenieping Magic Story** | Reads about Princess Romi, Harmony Town, Heartsping, and the magic catch cube | Immersive cartoon storytelling connecting reading with favorite characters |
| **🔊 Read to Me / Tap Word** | Hears whole stories read aloud in character voice with live word highlighting, or taps any word to hear it | Phonemic decoding, speech-text synchronization, reading confidence |
| **💡 Base-Ten Helper** | Visualizes numbers as place-value blocks (thousands cubes, hundreds flats, tens rods, ones cubes) with spoken steps in Teenieping's voice | Concrete-to-abstract transition, eliminating math anxiety |
| **⭐ Stars & Rocket Fuel** | Earns stars across all 3 modes to unlock outer planets and library badges | Intrinsic motivation, self-directed learning, goal progression |

---

## 🎙️ Character Voice Architecture: Dual-Layer Audio Engine

The game combines pre-recorded cartoon voice clips with a local neural TTS API:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LindGame Web Application                               │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼ Pre-rendered clips                          ▼ Dynamic questions & stories
         ┌───────────────────────────────┐             ┌───────────────────────────────┐
         │ TeeniepingAudio.playClip()    │             │ TeeniepingAudio.speakText()   │
         │ (greetings, cheers, tags)     │             │ (word problems, story reading)│
         └───────────────┬───────────────┘             └───────────────┬───────────────┘
                         │                                             │
                         ▼                                             ▼
         ┌───────────────────────────────┐             ┌───────────────────────────────┐
         │ HTML5 Audio: audio/teenieping/│             │ GET /api/tts?char=...&text=...│
         │ (36 pre-rendered MP3 assets)  │             └───────────────┬───────────────┘
         └───────────────────────────────┘                             │
                                                ┌──────────────────────┴──────────────────────┐
                                                ▼ (server.py online)                          ▼ (offline / fallback)
                                ┌───────────────────────────────┐             ┌───────────────────────────────┐
                                │ server.py (Port 8642)         │             │ window.speechSynthesis        │
                                │ 1. Check audio/cache/<md5>.mp3│             │ with tuned pitch & rate       │
                                │ 2. edge-tts Neural Generation │             └───────────────────────────────┘
                                │ 3. Stream MP3 + Word Tracking │
                                └───────────────────────────────┘
```

1. **Character Action Moments (`audio/teenieping/<id>/`)**:
   - `greeting.mp3`: Voiced when selected or introducing themselves.
   - `catchphrase.mp3`: Voiced when the companion avatar is tapped.
   - `cheer_1.mp3` & `cheer_2.mp3`: Voiced when problems or blanks are solved.
   - `tag.mp3`: Voiced when tagged in during a tag-team switch.
   - `hint.mp3`: Voiced when the child requests help.
2. **Dynamic Question Reading (`server.py` `/api/tts`)**:
   - Uses `edge-tts` character profiles matching each Teenieping fairy.
   - Caches every synthesized utterance in `audio/cache/` by MD5 hash for **instant 0ms replay**.
   - Word boundary tracker computes word positions and triggers `onBoundary(charIndex)` during audio playback so words in math problems and reading stories highlight in real time!
3. **Graceful Offline Fallback**:
   - If `server.py` is stopped or unreachable, `TeeniepingAudio.speakText()` automatically delegates to `Speech.say()` with character pitch and rate.

---

## 🗺️ Code Flow Chart

```
           ┌───────────────────────────────┐   ┌───────────────────────────────┐
           │     Double-click LindGame.app │   │    Double-click Play.command  │
           │  (Native 1-click macOS app)   │   │  (Runs in macOS Terminal)     │
           └───────────────┬───────────────┘   └───────────────┬───────────────┘
                           │                                   │
                           └─────────────────┬─────────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────────┐
                               │       python3 server.py       │
                               │ 1. Start server on port 8642  │
                               │ 2. Automatically open browser │
                               └─────────────┬─────────────────┘
                                             │
                   ┌─────────────────────────┴─────────────────────────┐
                   ▼ (http://localhost:8642)                           ▼ (file:/// direct double-click)
       ┌───────────────────────────────┐                   ┌───────────────────────────────┐
       │     LindGame Web App Loads    │                   │ Check if localhost:8642 open? │
       │ Full Teenieping Neural Voice  │                   └───────┬───────────────┬───────┘
       └───────────────┬───────────────┘                   YES     │               │ NO
                       │                                   ┌───────┘               └───────┐
                       │                                   ▼                               ▼
                       │                    Redirect to http://localhost:8642/  Show launcher tip bar
                       │                                   │                    (Offline fallback mode)
                       └───────────────────┬───────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────────────────┐
                                │        initTeenieping() Boot         │
                                │ • Pick random leader companion       │
                                │ • Preload audio clips in manifest    │
                                │ • Set palette theme & avatar frame   │
                                └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                      HOME SCREEN                                       │◄─────────────────────────────┐
│  • Teenieping Companion Dock                                                           │                              │
│    - Tap avatar -> TeeniepingAudio.playCatchphrase()                                   │                              │
│    - Tap "🔄 Switch" -> Opens Character Picker Dialog (#tp-picker-dialog)               │                              │
│      ┌─────────────────────────────────────────────────────┐                           │                              │
│      │ Character Picker Modal (all 6 fairies + Surprise Me)│                           │                              │
│      │ Tap fairy card or "Surprise Me!" -> switchLeader()  ├────────┐                  │                              │
│      └─────────────────────────────────────────────────────┘        │                  │                              │
│  • Stars + Rocket Fuel Bar                                          │                  │                              │
└───┬──────────────────────────────┬──────────────────────────────────┼──────────────┬───┘                              │
    │ Math Missions                │ Word Hunt                        │              │ Story Time                       │
    ▼                              ▼                                  │              ▼                                  │
┌─────────────────────────┐   ┌─────────────────────────┐             │   ┌─────────────────────────┐                   │
│       PLANET MAP        │   │      LEVEL PICKER       │             │   │       STORY SHELF       │                   │
│  7 levels (2-4 digits)  │   │ Little / Bigger / Big   │             │   │ 7 themes (Teenieping)   │                   │
└───────────┬─────────────┘   └───────────┬─────────────┘             │   └───────────┬─────────────┘                   │
            │ pick planet                 │ pick level                │               │ pick theme                      │
            ▼                             ▼                           │               ▼                                 │
┌─────────────────────────┐   ┌─────────────────────────┐             │   ┌─────────────────────────┐                   │
│ MathEngine.makeProblem  │   │ Word Hunt (8 rounds)    │             │   │ StoryGen.makeArticle()  │                   │
│  random 1-4 digit op    │   │  even: LISTEN -> tap wrd│             │   │  random cast & 4 paras  │                   │
│  "Read to me" voiced    │   │  odd : READ -> tap pic  │             │   │  cloze blank extraction │                   │
│  by active Teenieping!  │   │  target spoken in voice │             │   │  word-tap pronunciations│                   │
└───────────┬─────────────┘   └───────────┬─────────────┘             │   └───────────┬─────────────┘                   │
            │                             │                           │               │                                 │
     answer correct?               choice correct?                    │               ▼                                 │
    ┌───────┴───────┐             ┌───────┴───────┐                   │   ┌─────────────────────────┐                   │
    │ yes           │ no          │ yes           │ no                │   │ Story Reader (2 Columns)│                   │
    ▼               ▼             ▼               ▼                   │   │ Left : Article reader   │                   │
┌──────────────┐  tries=1: hint ┌──────────────┐ shake & retry        │   │ Right: Answer word bank │                   │
│ addStar()    │  tries=2:      │ addStar()    │ Teenieping voice     │   │ • tap word to hear it   │                   │
│ confetti()   │  helper blocks │ confetti()   │ hint                 │   └───────────┬─────────────┘                   │
└───────┬──────┘  tries=3: reveal└──────┬──────┘                      │               │ blank word chosen?              │
        │                               │                             │       ┌───────┴───────┐                         │
        │                               │                             │       ▼ correct       ▼ no                      │
        │                               │                             │  ┌─────────────────┐    shake & retry           │
        │                               │                             │  │ capsule locks in│    character voice hint    │
        │                               │                             │  │ confetti & chime│                            │
        ▼                               ▼                             │  └────────┬────────┘                            │
┌────────────────────────────────────────────────────────┐            │           │                                     │
│               Teenieping.stepQuestion()                │            │           │                                     │
│            Counter increments (+1 of 3)                │◄───────────┼───────────┘                                     │
└───────────────────────────────┬────────────────────────┘            │                                                 │
                                │                                     │                                                 │
                      Counter >= 3 solved?                            │                                                 │
                     ┌──────────┴──────────┐                          │                                                 │
                     ▼ YES                 ▼ NO                       │                                                 │
                     │          ┌─────────────────────────────────────┴────────┐                                        │
                     │          │ TeeniepingAudio.playCheerWithSpeech()        │                                        │
                     │          │ 1. Real character audio cheer clip!          │                                        │
                     │          │ 2. Equation or story confirmation speech     │                                        │
                     │          │    in Teenieping's cartoon neural voice!     │                                        │
                     │          └──────────────────────────────────────────────┘                                        │
                     ▼                                                                                                  │
        ┌────────────────────────────────────────────────────────┐                                                      │
        │  Teenieping.switchLeader(targetId?)                    │◄─────────────────────────────────────────────────────┘
        │  (Manual Switch via Dialog OR Auto Tag after 3 Qs)     │
        │ • Sets selected fairy (or random different fairy)      │
        │ • Updates theme & palette; resets counter to 0         │
        │ • #tp-tag-banner drops in; plays voiced tag clip!      │
        └───────────────────────┬────────────────────────────────┘
                                │
                                ▼
      Advance to next question (read in new Teenieping leader's voice!)
                        │ (mission / round / story complete)
                        ▼
        ┌────────────────────────────────────────────────────────┐
        │                     REWARD DIALOG                      │
        │  Stars awarded + Fanfare + Teenieping Victory Speech   │─────────────── save & return to map/shelf ───────────┘
        └────────────────────────────────────────────────────────┘
```

---

## 📁 Project Architecture & Files

| File | Type | Description |
|---|---|---|
| [LindGame.app](LindGame.app) | macOS App | Native double-clickable macOS 1-click launcher application bundle that starts the voice server and opens the browser |
| [Play.command](Play.command) | Launcher | Double-clickable macOS shell launcher that starts the server with Terminal output and opens the game |
| [server.py](server.py) | Server | Python HTTP server hosting static files securely on port 8642 with `GET /api/tts` neural character voice generation, smart disk caching, and automatic browser opening |
| [package.json](package.json) | Config | Standard project scripts configuration (`npm start` to run server & browser, `npm test` for tests) |
| [index.html](index.html) | Markup | Single-page UI containing Home, Teenieping Companion Dock with manual switch button, Character Picker dialog, Tag-Team Banner, Planet Map, Math Mission, Word Hunt, Story Time Reader, and Reward Dialog |
| [css/styles.css](css/styles.css) | Styles | Custom design system: dark space theme, glassmorphism, responsive column grid (`--cols`), place-value colors, base-ten block shapes (cubes, rods, flats, kilos), side-by-side Story Time layout (left article / right word bank), stationery layout, Teenieping character badges, animated tag-team banner, manual switch button, Character Picker modal grid, launcher tip bar, and read-along word highlights |
| [js/teenieping.js](js/teenieping.js) | Characters | Catch! Teenieping character definitions (Heartsping, Lalaping, Chachaping, Gogoping, Dadaping, Happyping), vector SVG avatars, voice profiles (`pitch`/`rate`), tag-team auto-switch counter, and event emitter |
| [js/teenieping-audio.js](js/teenieping-audio.js) | Audio Engine | Manages real character clips and routes dynamic question reading through `/api/tts` with word boundary tracking and Web Speech fallback |
| [audio/teenieping/](audio/teenieping/) | Audio Assets | 36 studio-quality MP3 voice clips across all 6 Teenieping characters + [manifest.json](audio/teenieping/manifest.json) |
| [audio/cache/](audio/cache/) | Cache Assets | Smart disk cache storing dynamically spoken sentences and sight words for 0ms repeated playback (`.gitkeep` tracked; MP3 cache ignored via `.gitignore`) |
| [scripts/generate_character_audio.py](scripts/generate_character_audio.py) | Audio Generator | Python script using Edge neural cartoon voice models to generate and update character voice clips |
| [js/data.js](js/data.js) | Data & Logic | Planet progression configs ([PLANETS](js/data.js#L18-L26)), Dolch sight-word levels, Teenieping magical items & friends, and cloze parser [parseArticle](js/data.js#L82-L114) |
| [js/stories.js](js/stories.js) | Story Generator | First-grade random story generator ([makeArticle](js/stories.js#L173-L198)) with 7 themes including Teenieping Magic, dynamic character casts, sentence variants, and cloze distractors |
| [js/math.js](js/math.js) | Math Engine | Random arithmetic generator ([makeProblem](js/math.js#L49-L61)), carrying/borrowing detection ([needsRegroup](js/math.js#L35-L37)), mission sequencer, and place-value hints ([hintSteps](js/math.js#L88-L136)) for up to 4 digits ($\le 9999$) |
| [js/audio.js](js/audio.js) | Speech Synthesis | Web Speech API speech synthesis prioritizing clear female voices with per-character `pitch` and `rate` control, plus Web Audio API synthesized chimes, clicks, and fanfare |
| [js/app.js](js/app.js) | App State | Global state management (`localStorage`), screen router, Teenieping companion controller with manual switch modal ([renderCharacterPicker](js/app.js#L264-L290)), tag-team switch listener, multi-column Math Mission controller, Word Hunt loop, and Story Time article controller |
| [tests/tts-endpoint.test.js](tests/tts-endpoint.test.js) | Tests | Unit test suite verifying `/api/health`, `/api/tts` voice synthesis, security protections, input validation, and disk caching with automated server lifecycle management |
| [tests/teenieping-audio.test.js](tests/teenieping-audio.test.js) | Tests | Unit test suite verifying audio clip paths, manifest integrity, file existence, clip resolution, `computeWordOffsets`, and Node.js fallback safety |
| [tests/teenieping.test.js](tests/teenieping.test.js) | Tests | Unit test suite verifying all 6 Teenieping characters, SVG markup, pitch/rate vocal profiles, manager switching, and auto-switching after 3 questions |
| [tests/math.test.js](tests/math.test.js) | Tests | Unit test suite testing 1–4 digit addition and subtraction, carry/borrow constraints, and multi-column hint steps |
| [tests/article.test.js](tests/article.test.js) | Tests | Unit test suite testing story generation across all 7 themes (including Teenieping), cast variation, blank extractions, distractor sets, and complete text reconstruction |

---

## 🔒 Security & Public Repository Hardening

This codebase has been audited and hardened for safe publication as a public open-source repository:

1. **Local Loopback Network Binding (`127.0.0.1`)**:
   - `server.py` binds by default to loopback `127.0.0.1` rather than `0.0.0.0`. This prevents unintended network exposure to other machines on local Wi-Fi or public networks.
   - For optional custom deployments, host binding can be configured via `--host <ip>` or the `LINDGAME_HOST` environment variable.
2. **Directory Browsing Prevention & File Isolation**:
   - Directory listing is disabled (`list_directory` returns HTTP 404), preventing reconnaissance of cache directories or file listings.
   - Access to hidden files (dotfiles such as `.git`, `.DS_Store`, `.env`) is strictly rejected.
   - Access to internal development scripts and configuration files (`server.py`, `package.json`, `tests/`, `scratch/`, `scripts/`) is blocked via HTTP, ensuring only web assets (`index.html`, `css/`, `js/`, `audio/`) are served.
3. **Denial of Service (DoS) Mitigation & Input Validation**:
   - `/api/tts` enforces a maximum query text length of 300 characters (`MAX_TEXT_LEN`), rejecting oversized payloads with HTTP 400.
   - Character identifiers are validated against an allowed whitelist (`VOICE_PROFILES`), safely defaulting to `heartsping` for unknown character names.
   - Asynchronous speech generation is protected by a 10-second timeout (`TTS_TIMEOUT_SECONDS`) to prevent dangling asyncio worker threads or socket exhaustion.
4. **Information Disclosure & Error Sanitization**:
   - Internal exception messages and Python tracebacks are logged to server stderr and never exposed in HTTP error responses (returns generic sanitized error messages).
5. **CORS Hardening**:
   - Restricts `Access-Control-Allow-Origin` to verified local origins (`localhost`, `127.0.0.1`, and `null` for `file://` local files), preventing unauthorized cross-origin access from external web domains.
6. **Privacy & Git Hygiene**:
   - All launcher scripts (`Play.command`, `LindGame.app`) use generic `$HOME` path resolution without any hardcoded personal usernames or local filesystem paths.
   - `.gitignore` prevents committing OS metadata (`.DS_Store`), Python bytecode (`__pycache__`), virtual environments, and dynamic runtime audio caches (`audio/cache/*.mp3`).

---

## 🧪 Automated Testing

Run the full Node.js test suite across all 5 test files:

```bash
npm test
# or: node --test tests/*.test.js
```

All 33 tests execute in under 1 second:
- `tests/tts-endpoint.test.js` (Automated server management & security verification):
  - `/api/health` status 200 and health payload
  - `/api/tts` 400 validation on missing parameters
  - `/api/tts` 400 rejection on text exceeding 300 character limit
  - Safe fallback handling for unknown character names
  - Valid MP3 generation across character voices
  - Smart disk caching fast response verification (< 100ms)
  - Directory listing prevention (returns 404 for folder paths)
  - Hidden dotfile blocking (returns 404 for `/.DS_Store`, `/.git`)
  - Server and test file isolation (returns 404 for `/server.py`, `/package.json`)
  - Web asset serving verification (`index.html`, `styles.css`)
- `tests/teenieping-audio.test.js`:
  - Audio clip mapping across all 6 characters
  - Non-empty MP3 asset verification for all registered clips
  - Audio manifest accuracy and character coverage
  - URL resolver and cheer randomization
  - Word boundary calculation and monotonic fractions (`computeWordOffsets`)
  - Node.js runtime fallback safety for `speakText`
- `tests/teenieping.test.js`:
  - 6 main characters with required Korean names, SVG avatars, pitch, rate, cheers, and hints
  - Current leader retrieval and cheer generator
  - Random switching avoiding duplicate consecutive leaders
  - Specific ID selection
  - Auto-switching every 3 solved questions
  - Change event subscription
- `tests/math.test.js`:
  - 2-digit addition without carrying
  - 2-digit addition with carrying
  - 2-digit subtraction without borrowing
  - 2-digit subtraction with borrowing
  - 3-digit and 4-digit addition and subtraction (up to 4-digit numbers, $\le 9999$)
  - Mission unique problem generation
  - Multi-column hint steps and spoken strings
- `tests/article.test.js`:
  - Theme structure and metadata (7 themes)
  - Randomized first-grade article generation
  - Cloze blank and distractor extraction
  - Full passage text reconstruction
