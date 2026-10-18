#!/usr/bin/env python3
"""
LindGame Local Server with Teenieping Neural TTS API
Serves static game files securely on localhost (port 8642) and provides
/api/tts endpoint for on-demand character voice generation with smart disk caching.
"""
import os
import sys
import json
import asyncio
import hashlib
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

EDGE_TTS_WORKING = True
DEFAULT_HOST = "127.0.0.1"
PORT = 8642
MAX_TEXT_LEN = 300
TTS_TIMEOUT_SECONDS = 5.0
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(BASE_DIR, "audio", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

VOICE_PROFILES = {
    "heartsping": {"voice": "en-US-AnaNeural", "pitch": "+26Hz", "rate": "+4%"},
    "lalaping": {"voice": "en-US-AnaNeural", "pitch": "+38Hz", "rate": "+8%"},
    "chachaping": {"voice": "en-US-AvaNeural", "pitch": "+18Hz", "rate": "-2%"},
    "gogoping": {"voice": "en-US-AnaNeural", "pitch": "+8Hz", "rate": "+6%"},
    "dadaping": {"voice": "en-US-AvaNeural", "pitch": "+6Hz", "rate": "-3%"},
    "happyping": {"voice": "en-US-AnaNeural", "pitch": "+28Hz", "rate": "+6%"},
}

async def generate_speech(text, profile, out_path):
    communicate = edge_tts.Communicate(
        text,
        profile["voice"],
        pitch=profile["pitch"],
        rate=profile["rate"]
    )
    await communicate.save(out_path)

class TeeniepingGameHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def is_safe_path(self, clean_path):
        """Block directory traversal, hidden dotfiles, and non-asset internal project files."""
        try:
            rel = os.path.relpath(clean_path, BASE_DIR)
        except ValueError:
            return False

        if rel == ".":
            return True

        if rel.startswith("..") or os.path.isabs(rel):
            return False

        parts = [p for p in rel.split(os.sep) if p]
        # Disallow dotfiles / hidden folders (.git, .DS_Store, etc.)
        if any(p.startswith(".") for p in parts):
            return False

        # Disallow access to developer scripts, test files, scratch directories, or source code
        blocked_dirs = {"tests", "scratch", "scripts", ".git"}
        if parts[0] in blocked_dirs:
            return False

        blocked_files = {"server.py", "package.json", "Play.command"}
        if rel in blocked_files:
            return False

        return True

    def list_directory(self, path):
        """Disable directory listing to prevent information disclosure."""
        self.send_error(404, "File not found")
        return None

    def send_head(self):
        parsed = urlparse(self.path)
        clean_path = super().translate_path(parsed.path)

        if not self.is_safe_path(clean_path):
            self.send_error(404, "File not found")
            return None

        # Block direct browsing of directories that do not contain index.html
        if os.path.isdir(clean_path) and not os.path.exists(os.path.join(clean_path, "index.html")):
            self.send_error(404, "File not found")
            return None

        return super().send_head()

    def end_headers(self):
        """Prevent browser caching of development assets (HTML, CSS, JS) while keeping audio cached."""
        if hasattr(self, 'path') and not self.path.startswith("/audio/"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def set_cors_headers(self):
        """Restrict CORS to local origins and file:// scheme."""
        origin = self.headers.get("Origin")
        if origin:
            try:
                parsed = urlparse(origin)
                if parsed.hostname in ("localhost", "127.0.0.1") or origin == "null":
                    self.send_header("Access-Control-Allow-Origin", origin)
                    self.send_header("Vary", "Origin")
            except Exception:
                pass
        else:
            self.send_header("Access-Control-Allow-Origin", "*")

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        global EDGE_TTS_WORKING
        parsed = urlparse(self.path)

        if parsed.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "tts": HAS_EDGE_TTS and EDGE_TTS_WORKING,
                "cached": len(os.listdir(CACHE_DIR))
            }).encode("utf-8"))
            return

        if parsed.path == "/api/tts":
            params = parse_qs(parsed.query)
            text = params.get("text", [""])[0].strip()
            char = params.get("char", ["heartsping"])[0].strip().lower()

            if not text:
                self.send_response(400)
                self.set_cors_headers()
                self.end_headers()
                self.wfile.write(b"Missing text parameter")
                return

            if len(text) > MAX_TEXT_LEN:
                self.send_response(400)
                self.set_cors_headers()
                self.end_headers()
                self.wfile.write(b"Text exceeds maximum allowed length")
                return

            if char not in VOICE_PROFILES:
                char = "heartsping"

            profile = VOICE_PROFILES[char]
            key_src = f"{char}_{profile['voice']}_{profile['pitch']}_{profile['rate']}_{text}"
            cache_key = hashlib.md5(key_src.encode("utf-8")).hexdigest()
            cache_file = os.path.join(CACHE_DIR, f"{cache_key}.mp3")

            # Validate cache: remove corrupt 0-byte files
            if os.path.exists(cache_file) and os.path.getsize(cache_file) == 0:
                try:
                    os.remove(cache_file)
                except OSError:
                    pass

            # If not in cache, check TTS availability and generate dynamically
            if not os.path.exists(cache_file):
                if not HAS_EDGE_TTS or not EDGE_TTS_WORKING:
                    self.send_response(503)
                    self.set_cors_headers()
                    self.end_headers()
                    self.wfile.write(b"TTS engine not available")
                    return

                try:
                    asyncio.run(asyncio.wait_for(
                        generate_speech(text, profile, cache_file),
                        timeout=TTS_TIMEOUT_SECONDS
                    ))
                except TimeoutError:
                    print(f"[TTS Timeout] Request timed out for character {char}", file=sys.stderr)
                    if os.path.exists(cache_file) and os.path.getsize(cache_file) == 0:
                        try:
                            os.remove(cache_file)
                        except OSError:
                            pass
                    self.send_response(504)
                    self.set_cors_headers()
                    self.end_headers()
                    self.wfile.write(b"TTS generation timed out")
                    return
                except Exception as e:
                    print(f"[TTS Error] {e}", file=sys.stderr)
                    if os.path.exists(cache_file) and os.path.getsize(cache_file) == 0:
                        try:
                            os.remove(cache_file)
                        except OSError:
                            pass
                    # Trip circuit breaker on connection / 403 failure
                    EDGE_TTS_WORKING = False
                    self.send_response(503)
                    self.set_cors_headers()
                    self.end_headers()
                    self.wfile.write(b"TTS generation failed")
                    return

            try:
                with open(cache_file, "rb") as f:
                    audio_data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(audio_data)))
                self.set_cors_headers()
                self.send_header("Cache-Control", "public, max-age=86400")
                self.end_headers()
                self.wfile.write(audio_data)
                return
            except Exception as e:
                print(f"[Cache Read Error] {e}", file=sys.stderr)
                self.send_response(500)
                self.set_cors_headers()
                self.end_headers()
                self.wfile.write(b"Failed to read audio cache")
                return

        super().do_GET()

def main():
    host = os.environ.get("LINDGAME_HOST", DEFAULT_HOST)
    port = PORT

    for i, arg in enumerate(sys.argv):
        if arg == "--host" and i + 1 < len(sys.argv):
            host = sys.argv[i + 1]
        elif arg == "--port" and i + 1 < len(sys.argv):
            try:
                port = int(sys.argv[i + 1])
            except ValueError:
                pass

    server = ThreadingHTTPServer((host, port), TeeniepingGameHandler)
    url = f"http://{host}:{port}"
    print(f"Teenieping Game Server with Neural TTS running at {url}")

    if "--no-browser" not in sys.argv:
        import webbrowser
        import threading
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
