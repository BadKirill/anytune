# Wiki sync reference

## Source → Wiki mapping

| Repo path                   | Wiki page                           |
| --------------------------- | ----------------------------------- |
| `docs/knowledge/CATALOG.md` | `Home.md`                           |
| `docs/knowledge/INDEX.md`   | `Agent-Index.md`                    |
| `docs/knowledge/areas/*.md` | Title-Case page (`ci-cd` → `CI-CD`) |
| `docs/knowledge/graph.json` | `Graph.md` (JSON fenced)            |
| generated                   | `_Sidebar.md`                       |

Sync also **deletes** unmanaged `.md` wiki pages (keeps `_Footer.md` if present).
Banners link to `origin/<branch>` only when the file exists there; otherwise
path-only (no broken `master` link).

## Commands

```bash
npm run knowledge:check
npm run knowledge:wiki
```

Implementation: `scripts/sync-knowledge-wiki.mjs`, `scripts/check-knowledge.mjs`.
Requires git credentials with wiki write access for sync.
