---
"@tablex/core": patch
---

## Backend Changes

### New

- `ColumnProps` returns a new prop `has_fk_relations`.
- A new Tauri command `fk_relations`.

### Refactor

- gather all enums and structs into `types.rs`.

## Frontend Changes

### New

- Dropdown menu with tabs for table names and a Table for related rows.

### Refactor

- Split `useQuery` hooks into custom hooks.
