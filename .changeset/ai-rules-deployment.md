---
"@ilovecode33/ai-rules": patch
---

Add the deployment workflows rule: production deploys skip a push that still carries a pending
changeset, are dispatched for the version commit, and never overlap.
