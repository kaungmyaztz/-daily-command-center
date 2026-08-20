Daily Command Center V7
=======================

This folder is the Home Screen / PWA-ready build of the dashboard.

Files:
- index.html: dashboard
- manifest.webmanifest: app metadata
- service-worker.js: offline caching
- icons/: Home Screen icons

To publish it, upload the CONTENTS of this folder to any static web host (Netlify, Cloudflare Pages, GitHub Pages, etc.).
After it has a normal https:// web address:
1. Open the address in Safari on iPhone/iPad.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch Daily Command Center from the new icon.

Current storage behavior:
- Big 3 checkboxes, IFIC removal, and Quick Note are saved locally on each device.
- Cross-device sync requires a small cloud backend, which is intentionally not included yet.
