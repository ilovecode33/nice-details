---
"@ilovecode33/okr-web": patch
---

Stop the About page from offering an update right after loading the newest build: compare the
deployed build id as well as the version, ignore the first service worker install, and only name a
"latest version" when it is actually newer. Production deploys now skip the intermediate build of a
push that still carries a pending changeset (the version commit deploys next) and never run
concurrently, so new content is no longer published under the previous version number.
