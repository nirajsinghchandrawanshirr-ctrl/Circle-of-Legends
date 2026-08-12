# Weather Dashboard (Open‑Meteo demo)

This is a small static weather dashboard demo that uses Open‑Meteo's free APIs (no API key required).

How it works
- City search → Open‑Meteo Geocoding API (returns lat/lon)
- Forecast → Open‑Meteo Forecast API (current, hourly, daily)
- Lightweight, client‑side only (vanilla JS)

Run locally
1. Clone or copy files to a folder.
2. Serve with a static server (recommended):
   - python3 -m http.server 8000
   - Open http://localhost:8000/weather/

Notes & next steps
- If you want prettier charts, I can integrate Chart.js for an hourly temperature graph.
- For production you may want:
  - Server-side caching or proxying
  - A nicer icon set (weather icons SVG sprite)
  - Geolocation (ask user for permission to auto-detect)
- If you want this added to your existing site (Circle-of-Legends), tell me where to place files and I can create a PR and integrate the UI.

APIs used
- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Forecast: https://api.open-meteo.com/v1/forecast

License: MIT (you can modify and reuse)
