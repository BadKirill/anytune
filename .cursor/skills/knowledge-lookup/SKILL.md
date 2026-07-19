---
name: knowledge-lookup
description: >-
  Resolves AnyTune code-change tasks via the repo-local knowledge graph
  (docs/knowledge) with selective file reads, then updates the catalog and
  GitHub Wiki mirror. Use when the user asks to implement, fix, refactor,
  explore architecture, or change project structure — before scanning the whole
  codebase.
---

# Knowledge lookup agent

## Goal

Answer “what do I need to read/change?” from the knowledge tree so the session
avoids full-repo analysis and excess tokens.

## Workflow

Copy and track:

```
Knowledge lookup:
- [ ] 1. Read docs/knowledge/AGENT_PROTOCOL.md + INDEX.md
- [ ] 2. Pick tags for the user task
- [ ] 3. Read matched area page(s) only
- [ ] 4. Open listed source + tests
- [ ] 5. Implement / answer
- [ ] 6. If structure/contracts changed → npm run knowledge:refresh + edit areas
- [ ] 7. Run npm run knowledge:check
- [ ] 8. Run npm run knowledge:wiki (skip if only CI will sync on master)
```

### 1–2. Route

From the user request, choose tags (examples):

| User intent                     | Tags                           |
| ------------------------------- | ------------------------------ |
| Mic / pitch / stop listening    | `mic`, `worklet`, `pitchy`     |
| Cents / notes / Hz              | `music`, `cents`               |
| Needle jitter / lock            | `stabilizer`                   |
| Presets / My tunings / analyzer | `tuning`, `custom`, `analyzer` |
| Gauge / picker / copy           | `ui`, `gauge`, `strings`       |
| Save/load / migrate             | `storage`, `persist`           |
| Tests / CI                      | `test`, `ci`                   |
| New folder / architecture       | `architecture`, `patterns`     |

Open `docs/knowledge/areas/<page>.md` for each tag via INDEX routing.

### 3–4. Read narrowly

- Prefer area “Open when” / module tables over grepping the whole `src/`.
- For “where is X?”, use `areas/file-index.md`.
- Only widen search if the area page is missing the answer — then update the
  knowledge docs so the next agent finds it.

### 5. Implement

Follow `AGENTS.md` + `.cursor/rules/code-style.md`. Stay in the scoped layer.

### 6–8. Maintain mirror

Knowledge source of truth is **in-repo** under `docs/knowledge/`.

```bash
npm run knowledge:check   # links, graph, INDEX routes, src coverage
npm run knowledge:wiki    # Home, Agent-Index, areas, Graph, _Sidebar; drop stale pages
```

Wiki: https://github.com/BadKirill/anytune/wiki

**MCP note:** Cursor currently has no GitHub Wiki MCP server here. Do not block
waiting for MCP — use the script. If a wiki MCP is added later, it must write
the same pages from `docs/knowledge/` after local updates.

## Output shape (when reporting context)

Keep brief:

```markdown
## Knowledge context

- Tags: …
- Areas read: …
- Files to touch: …
- Constraints: …
```

Then proceed with the task.
