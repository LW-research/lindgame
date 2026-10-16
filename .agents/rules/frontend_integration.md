---
name: frontend-integration-guardrails
description: Guardrails for vanilla JavaScript web development to prevent runtime exceptions, cache desyncs, and isolated listener bugs when adding features.
---

# Frontend Integration Guardrails

When adding or refactoring UI features, game modes, or client scripts:

## 1. Verify API Contracts Across Modules
- Check the exported surface of any global module (`window.*` / IIFE exports) before calling helper methods.
- Provide defensive fallbacks when accessing properties or methods across modules (e.g., `typeof Module.fn === 'function' ? Module.fn() : fallback`).
- If an assumed helper does not exist, export it cleanly from the source module rather than silently relying on undefined behavior.

## 2. Co-Locate Related Event Listeners
- Group new mode, screen, or navigation handlers directly alongside existing sibling handlers (e.g., attach `#btn-race` right next to `#btn-math`, `#btn-words`, `#btn-stories`).
- Avoid scattering related UI bindings at the bottom of long script files.

## 3. Cache Invalidation Discipline
- In vanilla JS/CSS web applications, ensure local development servers send `Cache-Control: no-store, no-cache, must-revalidate` for non-media assets.
- Increment or append version query strings on `<script>` and `<link>` tags (e.g., `js/app.js?v=...`) whenever modifying frontend logic.

## 4. End-to-End Browser Interaction Verification
- Do not rely solely on headless unit tests that mock the DOM or test modules in Node.js.
- For new interactive buttons, screens, or modal flows, verify in an actual browser or automated browser script:
  1. Click triggers the expected screen transition.
  2. No uncaught `TypeError` or `ReferenceError` appears in the browser console.
  3. Re-entering or navigating back and forth does not cause state corruption.
