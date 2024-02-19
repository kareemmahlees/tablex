---
"@tablex/core": patch
---

## Modifications

### Backend

- Fix a bug while creating the connections file, previously it didn't create the parent directories before creating the file.
- Return empty Vector if there are not tables in the database

### Frontend

- Make creating a connection more verbose with toast info
