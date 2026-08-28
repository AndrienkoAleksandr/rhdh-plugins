---
'@red-hat-developer-hub/backstage-plugin-bulk-import-backend': patch
---

Return the Express response from the orchestrator workflow create handler so audit logging can record the real status instead of crashing after a successful request.
