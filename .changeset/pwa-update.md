---
'@ilovecode33/okr-web': minor
---

Add an Updates row to the About card so installed PWAs and Safari home-screen bookmarks have an explicit refresh path: it checks the service worker on demand (and when the app becomes visible), shows "A new version is ready" when one is waiting, and reloads the app to apply it.
