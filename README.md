# Focus Redirect

A browser extension that sends you back to your work pages when you wander onto distracting sites.

## Features

- **Redirects distractions.** Opening a blocked site switches you to an open work tab (and closes the distraction), or loads your main work page in that tab.
- **Catches in-site navigation.** Also works on single-page apps like YouTube. Subdomains are blocked too (`m.youtube.com`, `old.reddit.com`).
- **Timed focus sessions.** 25, 50 or 90 minutes, then it turns itself off.
- **One-click setup.** "Block this site" and "Set as work page" buttons in the popup.
- **Redirect counter** and an "ON" badge while focus mode is active.

Default blocked sites: YouTube, Reddit, X/Twitter, Facebook, Instagram, TikTok, Netflix. Change them in Settings.

## Install

### Firefox (115+)

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `firefox/manifest.json`.

Temporary add-ons are removed when Firefox closes. To keep it installed, zip the *contents* of the `firefox` folder and get it signed as an unlisted add-on at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/), then install the signed `.xpi`.

### Chrome / Edge / Brave

1. Go to `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select the `chrome` folder.

## Project layout

```
chrome/    Manifest V3 build for Chromium browsers (service worker background)
firefox/   Manifest V3 build for Firefox (event-page background, gecko ID)
```

The two folders share the same code; only `manifest.json` differs.
