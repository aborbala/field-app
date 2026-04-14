# Claude Code — Project Instructions

> This file is the canonical instruction source for Claude Code in this project.
> It is also referenced by `.clauderc`.

## Cross-Agent Protocol

All agents operating in this repository must follow these rules:

1. **Check `docs/plans/` for active tasks before editing any code.**
   - If a plan file exists and is marked in-progress, read it first and align your work with it.
2. **Log all architectural decisions in `docs/decisions/`.**
   - One Markdown file per decision. Use the format: `YYYY-MM-DD-short-title.md`.
   - Decisions include: library choices, API design changes, schema changes, major refactors.

## Skill Loading Order

1. Project-local overrides at `.claude/skills/<skill-name>/SKILL.md`
2. Shared skills at `.agent/skills/<skill-name>/SKILL.md`
3. User-global skills at `~/.claude/skills/<skill-name>/SKILL.md`

All shared skills live in `.agent/skills/` — available to both Claude Code and Antigravity. Only add to `.claude/skills/` if you need a Claude Code-specific override.

## Core Conventions

- Tech stack: Vanilla JS (ES Modules), LeafletJS, Vite, Vitest
- Source code lives in `src/`; tests live in `tests/`
- Never store user data remotely — this is a local-export-only app
- Read `DESIGN_SYSTEM.md` before touching any CSS or UI components

## Verification Before Completion

Before declaring a task done:
1. Run the relevant test suite (`npm test`)
2. Confirm there are no console errors in the preview
3. Update the active plan in `docs/plans/`
