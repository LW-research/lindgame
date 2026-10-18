/* Catch! Teenieping Authentic Character Voice Engine
   Preloads and manages real character voice clips for Heartsping, Lalaping,
   Chachaping, Gogoping, Dadaping, and Happyping.
   Works in browser (window.TeeniepingAudio) and Node.js (module.exports). */
(function (root) {
  'use strict';

  const CLIP_MAP = {
    heartsping: {
      greeting: 'audio/teenieping/heartsping/greeting.mp3',
      catchphrase: 'audio/teenieping/heartsping/catchphrase.mp3',
      cheers: [
        'audio/teenieping/heartsping/cheer_1.mp3',
        'audio/teenieping/heartsping/cheer_2.mp3',
      ],
      tag: 'audio/teenieping/heartsping/tag.mp3',
      hint: 'audio/teenieping/heartsping/hint.mp3',
    },
    lalaping: {
      greeting: 'audio/teenieping/lalaping/greeting.mp3',
      catchphrase: 'audio/teenieping/lalaping/catchphrase.mp3',
      cheers: [
        'audio/teenieping/lalaping/cheer_1.mp3',
        'audio/teenieping/lalaping/cheer_2.mp3',
      ],
      tag: 'audio/teenieping/lalaping/tag.mp3',
      hint: 'audio/teenieping/lalaping/hint.mp3',
    },
    chachaping: {
      greeting: 'audio/teenieping/chachaping/greeting.mp3',
      catchphrase: 'audio/teenieping/chachaping/catchphrase.mp3',
      cheers: [
        'audio/teenieping/chachaping/cheer_1.mp3',
        'audio/teenieping/chachaping/cheer_2.mp3',
      ],
      tag: 'audio/teenieping/chachaping/tag.mp3',
      hint: 'audio/teenieping/chachaping/hint.mp3',
    },
    gogoping: {
      greeting: 'audio/teenieping/gogoping/greeting.mp3',
      catchphrase: 'audio/teenieping/gogoping/catchphrase.mp3',
      cheers: [
        'audio/teenieping/gogoping/cheer_1.mp3',
        'audio/teenieping/gogoping/cheer_2.mp3',
      ],
      tag: 'audio/teenieping/gogoping/tag.mp3',
      hint: 'audio/teenieping/gogoping/hint.mp3',
    },
    dadaping: {
      greeting: 'audio/teenieping/dadaping/greeting.mp3',
      catchphrase: 'audio/teenieping/dadaping/catchphrase.mp3',
      cheers: [
        'audio/teenieping/dadaping/cheer_1.mp3',
        'audio/teenieping/dadaping/cheer_2.mp3',
      ],
      tag: 'audio/teenieping/dadaping/tag.mp3',
      hint: 'audio/teenieping/dadaping/hint.mp3',
    },
    happyping: {
      greeting: 'audio/teenieping/happyping/greeting.mp3',
      catchphrase: 'audio/teenieping/happyping/catchphrase.mp3',
      cheers: [
        'audio/teenieping/happyping/cheer_1.mp3',
        'audio/teenieping/happyping/cheer_2.mp3',
      ],
      tag: 'audio/teenieping/happyping/tag.mp3',
      hint: 'audio/teenieping/happyping/hint.mp3',
    },
  };

  class TeeniepingAudioEngine {
    constructor() {
      this.enabled = true;
      this.cache = new Map();
      this.currentAudio = null;
    }

    getClipUrl(charId, type) {
      const charClips = CLIP_MAP[charId];
      if (!charClips) return null;
      if (type === 'cheer') {
        const list = charClips.cheers;
        return list[Math.floor(Math.random() * list.length)];
      }
      return charClips[type] || null;
    }

    computeWordOffsets(text) {
      if (!text) return [];
      const words = [];
      const regex = /\S+/g;
      let match;
      let totalWeight = 0;
      while ((match = regex.exec(text)) !== null) {
        const word = match[0];
        const isPunct = /[.,!?;:]$/.test(word);
        const weight = Math.max(word.length, 2) + (isPunct ? 3 : 0);
        words.push({
          text: word,
          charIndex: match.index,
          weight,
          startFrac: 0,
        });
        totalWeight += weight;
      }
      let accum = 0;
      for (const w of words) {
        w.startFrac = totalWeight > 0 ? accum / totalWeight : 0;
        accum += w.weight;
      }
      return words;
    }

    // Stop currently playing clip or neural TTS speech
    stop() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
      if (this._cancelCurrent) {
        this._cancelCurrent();
        this._cancelCurrent = null;
      }
      if (this.currentAudio) {
        const a = this.currentAudio;
        this.currentAudio = null;
        try {
          a.onplay = null;
          a.ontimeupdate = null;
          a.onended = null;
          a.onerror = null;
          a.pause();
          a.currentTime = 0;
          a.src = '';
        } catch (_) {}
      }
      if (typeof root.Speech !== 'undefined' && root.Speech.stop) {
        root.Speech.stop();
      }
    }

    // Play a character clip with automatic fallback to Web Speech API
    playClip(charId, type, onEnd) {
      if (!this.enabled || typeof window === 'undefined') {
        onEnd?.();
        return false;
      }

      const url = this.getClipUrl(charId, type);
      if (!url) {
        onEnd?.();
        return false;
      }

      this.stop();

      try {
        let audio = this.cache.get(url);
        if (!audio) {
          audio = new Audio(url);
          this.cache.set(url, audio);
        }

        audio.currentTime = 0;
        this.currentAudio = audio;

        let handled = false;
        const finish = () => {
          if (handled) return;
          handled = true;
          this.currentAudio = null;
          onEnd?.();
        };

        audio.onended = finish;
        audio.onerror = () => {
          console.warn(`[TeeniepingAudio] Could not load ${url}, falling back`);
          finish();
        };

        const playPromise = audio.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch((err) => {
            console.warn('[TeeniepingAudio] Play interrupted or blocked:', err);
            finish();
          });
        }
        return true;
      } catch (err) {
        console.error('[TeeniepingAudio] Play error:', err);
        onEnd?.();
        return false;
      }
    }

    // Speak arbitrary dynamic text (math equations, questions, reading passages)
    // using the Teenieping Neural TTS endpoint with automatic read-along word boundary tracking
    // and instant fallback to Web Speech API.
    speakText(text, { charId, onBoundary, onEnd, pitch, rate } = {}) {
      if (!this.enabled || !text) {
        onEnd?.();
        return false;
      }

      this.stop();

      const resolvedChar = (charId || root.Teenieping?.getLeader?.()?.id || 'heartsping').toLowerCase();
      const leader = root.Teenieping?.getLeader?.();
      const resolvedPitch = pitch ?? (leader?.pitch || 1.35);
      const resolvedRate = rate ?? (leader?.rate || 0.88);

      const fallback = () => {
        if (typeof root.Speech !== 'undefined' && root.Speech.say) {
          root.Speech.say(text, {
            pitch: resolvedPitch,
            rate: resolvedRate,
            onBoundary,
            onEnd,
          });
        } else {
          onEnd?.();
        }
      };

      if (typeof window === 'undefined' || this.ttsEndpointAvailable === false) {
        fallback();
        return true;
      }

      try {
        const url = `/api/tts?char=${encodeURIComponent(resolvedChar)}&text=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        this.currentAudio = audio;

        let handled = false;
        let stallTimeout = null;

        this._cancelCurrent = () => {
          handled = true;
          if (stallTimeout) {
            clearTimeout(stallTimeout);
            stallTimeout = null;
          }
          if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
          }
        };

        const finish = (usedFallback = false) => {
          if (handled) return;
          handled = true;
          this._cancelCurrent = null;
          if (stallTimeout) {
            clearTimeout(stallTimeout);
            stallTimeout = null;
          }
          if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
          }
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
          if (usedFallback) {
            this.ttsEndpointAvailable = false;
            fallback();
          } else {
            onEnd?.();
          }
        };

        // If network audio doesn't start playing within 2000ms, instantly switch to Web Speech API
        stallTimeout = setTimeout(() => {
          if (!handled && audio.paused) {
            console.warn('[TeeniepingAudio] Network TTS stalled, switching to native Web Speech API.');
            try { audio.src = ''; } catch (_) {}
            finish(true);
          }
        }, 2000);

        const words = onBoundary ? this.computeWordOffsets(text) : [];
        let lastWordIdx = -1;

        const updateBoundary = () => {
          if (!onBoundary || words.length === 0 || !audio.duration || audio.duration <= 0) return;
          const frac = Math.min(Math.max(audio.currentTime / audio.duration, 0), 1);
          let currentIdx = 0;
          for (let i = 0; i < words.length; i++) {
            if (words[i].startFrac <= frac) currentIdx = i;
            else break;
          }
          if (currentIdx !== lastWordIdx) {
            lastWordIdx = currentIdx;
            onBoundary(words[currentIdx].charIndex);
          }
        };

        audio.onplay = () => {
          if (stallTimeout) {
            clearTimeout(stallTimeout);
            stallTimeout = null;
          }
          if (onBoundary && words.length > 0) {
            lastWordIdx = 0;
            onBoundary(words[0].charIndex);
            this.progressTimer = setInterval(updateBoundary, 40);
          }
        };

        audio.ontimeupdate = updateBoundary;
        audio.onended = () => finish(false);
        audio.onerror = () => {
          if (handled) return;
          this.ttsEndpointAvailable = false;
          console.warn(`[TeeniepingAudio] TTS endpoint failed for "${text.slice(0, 30)}...", falling back to Web Speech.`);
          finish(true);
        };

        const playPromise = audio.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch((err) => {
            if (handled || err.name === 'AbortError') return;
            this.ttsEndpointAvailable = false;
            console.warn('[TeeniepingAudio] TTS play interrupted or blocked:', err);
            finish(true);
          });
        }
        return true;
      } catch (err) {
        this.ttsEndpointAvailable = false;
        console.error('[TeeniepingAudio] TTS error:', err);
        fallback();
        return false;
      }
    }

    playGreeting(charId, onEnd) {
      return this.playClip(charId, 'greeting', onEnd);
    }

    playCatchphrase(charId, onEnd) {
      return this.playClip(charId, 'catchphrase', onEnd);
    }

    playCheer(charId, onEnd) {
      return this.playClip(charId, 'cheer', onEnd);
    }

    playTag(charId, onEnd) {
      return this.playClip(charId, 'tag', onEnd);
    }

    playHint(charId, onEnd) {
      return this.playClip(charId, 'hint', onEnd);
    }

    // Play real character cheer audio, followed by character voice speech for confirmation
    playCheerWithSpeech(charIdOrText, speechTextOrOpts, speechParams = {}, onEnd) {
      let resolvedChar = charIdOrText;
      let resolvedText = speechTextOrOpts;
      let resolvedParams = speechParams || {};
      let resolvedOnEnd = onEnd;

      // Defensive normalization if called as (speechText, { charId, ... }, onEnd)
      if (typeof speechTextOrOpts === 'object' && speechTextOrOpts !== null) {
        resolvedText = charIdOrText;
        resolvedParams = speechTextOrOpts;
        resolvedChar = speechTextOrOpts.charId || root.Teenieping?.getLeader?.()?.id || 'heartsping';
        if (typeof speechParams === 'function') resolvedOnEnd = speechParams;
      }

      const speechFn = () => {
        if (resolvedText && typeof resolvedText === 'string') {
          this.speakText(resolvedText, {
            charId: resolvedChar,
            pitch: resolvedParams.pitch,
            rate: resolvedParams.rate,
            onEnd: resolvedOnEnd,
          });
        } else {
          resolvedOnEnd?.();
        }
      };

      const played = this.playCheer(resolvedChar, speechFn);
      if (!played) {
        speechFn();
      }
    }
  }

  const engine = new TeeniepingAudioEngine();

  const api = {
    CLIP_MAP,
    engine,
    computeWordOffsets: (text) => engine.computeWordOffsets(text),
    playClip: (id, type, fn) => engine.playClip(id, type, fn),
    playGreeting: (id, fn) => engine.playGreeting(id, fn),
    playCatchphrase: (id, fn) => engine.playCatchphrase(id, fn),
    playCheer: (id, fn) => engine.playCheer(id, fn),
    playTag: (id, fn) => engine.playTag(id, fn),
    playHint: (id, fn) => engine.playHint(id, fn),
    playCheerWithSpeech: (id, text, params, fn) => engine.playCheerWithSpeech(id, text, params, fn),
    speakText: (text, opts) => engine.speakText(text, opts),
    say: (text, opts) => engine.speakText(text, opts),
    stop: () => engine.stop(),
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TeeniepingAudio = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
