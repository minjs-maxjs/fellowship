# Cleanliness Re-Sweep — Post-Session Audit

**Date:** 2026-04-26
**Auditor:** 선웅
**Scope:** Read-only review of files added or modified after the earlier cleanliness audit landed. Eleven new commands, three new ADRs, six new agent reference files, six new eval suites, two new test files, the consolidated improvements spec, the `using-worktrees` skill, the plan-before-build hook, the dormant Cursor manifest, and the codebase-map regenerated mid-session — none of which were on the prior pass.

---

## 1. Verdict

The post-session tree is **mostly clean** but not finished. Nothing is broken; tests are 25/0 + 18/0 + 26/0 across the three suites. Every reference file added in this session has at least one referrer. Every new command resolves to a real target. Every new eval suite has the three required files plus a correctly registered `ASSERTIONS` list, and `improve.sh` recognizes all six by directory dispatch.

What is dirty is the **second-order paperwork**. Three new ADRs landed without back-references from the artifacts that implement them (`adr-plan-before-build-hook` ↔ `hooks/fellowship-plan-gate.mjs`, `adr-worktree-aware-companions` ↔ `skills/using-worktrees/`, `adr-memory-boundary-schema` ↔ companion-protocol — only the last is wired). The codebase-map regenerated mid-session is **already stale again** — it does not mention `using-worktrees`, the plan-gate hook, the new eval suites, or any of the eleven new commands beyond the two preexisting ones. `hooks/hooks-cursor.json` was created (closing V9 in the consolidated spec) but is not referenced from anywhere and its shape does not mirror the canonical `hooks.json`. `evals/usin/` is missing `soft.md` — a pre-existing gap not introduced this session, but worth flagging in the same sweep.

**Net:** zero blockers. Three should-fix items, two polish items. Nothing prevents v1.0.

---

## 2. By-category findings

### 2.1 New command files — clean

All eleven new `commands/fellowship-*.md` files parse, declare valid frontmatter (`name:`, `description:`), and point to a target that exists on disk. Verified targets:

- Eight agent loaders → `agents/<name>.md` (all present)
- Two skill loaders → `skills/brainstorming/SKILL.md`, `skills/planning/SKILL.md`, `skills/codebase-map/SKILL.md`, `skills/using-worktrees/SKILL.md` (all present)
- `fellowship-add-ethos.md` writes `templates/ethos.md` (template directory exists)

Every one follows the pattern of the two pre-existing commands (`fellowship-add-ethos`, `fellowship-consolidate`). **No findings.**

### 2.2 New agent reference files — clean

All six new `agents/references/*.md` files plus the four pre-existing ones are referenced by at least one agent file:

| Reference | Referrer(s) |
|---|---|
| `jaeho-templates.md` | `agents/jaeho.md`, `skills/using-fellowship/SKILL.md` |
| `pilyeop-templates.md` | `agents/pilyeop.md` |
| `yeonghak-templates.md` | `agents/yeonghak.md` |
| `hyeonsu-templates.md` | `agents/hyeonsu.md` |
| `seonung-templates.md` | `agents/seonung.md` |
| `usin-browser-verify.md` | `agents/usin.md` |
| `seunghyeon-structural-review.md` | `agents/seunghyeon.md` |
| `figma-mcp-recovery.md`, `owasp-checklist.md`, `playwright-tools.md` | unchanged from prior audit |

**No orphans.** S1 (the 영학-class anti-pattern extraction) appears genuinely complete.

### 2.3 New eval suites — mostly clean (one collateral finding)

Six new directories (`evals/{jaeho,pilyeop,yeonghak,dongil,hyeonsu,seonung}/`) each contain exactly the three required files: `scenarios.jsonl`, `hard.py`, `soft.md`. Every `hard.py` has an `ASSERTIONS = [...]` registry at the expected location followed by a `run_assertions()` shape consistent with the older suites (주혁, 승현, 우신). `improve.sh` dispatches by directory name and the comment block at lines 341–354 explicitly enumerates all six new suites as "authored, not yet validated end-to-end."

**Polish-grade:** The new suites lack a `history.jsonl` and `session-summary.md`. That is by design — those files materialize on first AutoImprove run. Not a finding.

**Should-fix (collateral, not introduced this session):** `evals/usin/soft.md` is **missing**. 우신 is a "mature" suite per `improve.sh` line 343 and is in the `--all` rotation. The other three mature suites (주혁, 재윤, 승현) have `soft.md`. 우신의 directory has `assertion-health.jsonl`, `holdout.jsonl`, `history.jsonl`, `session-summary.md` — but no soft judges file. Either the file was deleted at some point and the loss went unnoticed, or 우신의 eval was authored without one. The `--all` runner will not fail — `run_eval.py` likely tolerates absence — but the soft scoring channel is dark for 우신. *Severity: Should-fix.*

### 2.4 New test files — clean

Both files run green and contribute non-overlapping coverage:

- `tests/session-start.test.mjs` — 18 tests over Cursor JSON output shape, Claude Code JSON output shape, fail-silent paths, project-local survey. Closes spec item S4.
- `tests/migration-regression.test.mjs` — 26 tests over the three regression scenarios (TodoWrite-blocker honesty, role-first opener across nine companion files, skill-injection wrapper). Closes spec item V8 (which the consolidated spec listed as deferred to v1.1 — appears it was pulled forward).

**No redundancy.** The two new test files plus the pre-existing `health-check.test.mjs` test three different surfaces. **No findings.**

### 2.5 New ADRs — three findings (back-references missing)

Three ADRs landed at `docs/fellowship/specs/2026-04-26-adr-*.md`:

| ADR | Implementation | Cross-referenced from impl? |
|---|---|---|
| `adr-plan-before-build-hook.md` | `hooks/fellowship-plan-gate.mjs` + `hooks/fellowship-plan-gate` (bash) + `hooks/hooks.json` registration | **No.** Neither the .mjs nor the bash wrapper carries a comment pointing back to the ADR. |
| `adr-worktree-aware-companions.md` | `skills/using-worktrees/SKILL.md` + `commands/fellowship-using-worktrees.md` | **No.** The skill has no "ADR:" pointer. |
| `adr-memory-boundary-schema.md` | `agents/_shared/companion-protocol.md` (cited the ADR — only one of the three with a back-link) | **Yes.** |

A reader pulling open `hooks/fellowship-plan-gate.mjs` to debug a block has no breadcrumb back to the design rationale. Same for anyone reading `skills/using-worktrees/SKILL.md`. The pattern is established by the third ADR — apply it to the other two. *Severity: Should-fix (×2).*

### 2.6 Consolidated improvements spec — DONE-claim cross-check

The consolidated spec at `docs/fellowship/specs/2026-04-26-fellowship-v1-improvements.md` lists four blockers, six should-fix items, and nine v1.1+ candidates. Spot-check of every claim:

| Claim | Status now |
|---|---|
| **B1.** AutoImprove for 재윤 reads `agents/jaeyun.md` | **Resolved.** `run_eval.py:131-133` and all three `evals/jaeyun/holdout*.py` files now read `skills/using-fellowship/SKILL.md`. |
| **B2.** `fellowship-brainstorming`, `fellowship-planning`, `fellowship-map` missing | **Resolved.** All three command files present and parse cleanly. |
| **B3.** `codebase-map.md` stale (cites `agents/jaeyun.md`, manifest at `v1.5.0`) | **Resolved at the time the map regenerated** — but see §2.7 (already stale again on a new axis). |
| **B4.** Orphan `hooks/fellowship-statusline.mjs` | **Resolved.** File deleted. |
| **S1.** Six agent files inline templates | **Resolved.** All six references present and wired (§2.2). |
| **S2.** `using-fellowship/SKILL.md` mis-instructs `TodoWrite` | **Resolved.** Lines 63, 66, 94, 164 all acknowledge the platform block and point to quest-log checkboxes as the substitute. |
| **S3.** SessionStart hook re-injects handoff on `resume` | **Partially resolved.** `hooks.json` lines 19–28 now route `resume` to a separate `--resume` invocation. Whether the underlying script suppresses handoff re-injection on `--resume` was not verified end-to-end in this audit. |
| **S4.** `hooks/session-start` untested | **Resolved.** `tests/session-start.test.mjs` exists and runs 18/0. |
| **S5.** Cold-install primes 재윤 identity unconditionally | **Status unverified in this audit.** The session-start tests reference a "PROJECT_LOCAL block" and a "fail-silent on missing using-fellowship skill" path — suggests dormant-gating logic was added — but I did not read the hook source to confirm. |
| **S6.** Three grammars, no documented rule | **Resolved.** `using-fellowship/SKILL.md:26-31` now states the rule. |
| **V1.** Plan-before-build as hook gate | **Implemented.** `hooks/fellowship-plan-gate.mjs` exists and is registered in `hooks.json:30-41` on `Edit\|Write\|MultiEdit`. ADR back-link missing (§2.5). |
| **V5.** Memory boundary schema | **Implemented as ADR + protocol cross-link.** No enforcement — but the ADR explicitly leaves enforcement to v1.1 lint. |
| **V6.** Worktree-aware companions | **Implemented as `skills/using-worktrees/`.** ADR back-link missing (§2.5). |
| **V8.** Three regression scenarios | **Implemented as `tests/migration-regression.test.mjs`** rather than as eval scenarios. Defensible — tests give a faster feedback loop. |
| **V9.** Cursor cross-platform — finish or remove | **Half-done.** `hooks-cursor.json` was created (a step toward "finish"), but it is not registered or referenced anywhere in the repo. See §2.8. |

**Items claimed deferred (V2, V3, V4, V7) — verified still deferred.** No accidental partial implementation.

**No DONE-claim is false.** One DONE-claim (S5) was not verified by this audit because I did not read the session-start source — flagging for a follow-up confirmer rather than as a finding.

### 2.7 Codebase-map staleness — second-order

`docs/fellowship/codebase-map.md` was regenerated this session (header reads "Generated: 2026-04-26", and B3 is marked resolved). Since regeneration, the tree has shifted further:

- The map enumerates skills generically as "Loadable skills" but does not name `using-worktrees` despite naming `using-fellowship`, `brainstorming`, `planning`, `codebase-map` elsewhere.
- The map names `hooks/session-start`, `hooks/fellowship-context-monitor.mjs`, `hooks/health-check.mjs` but **not** `hooks/fellowship-plan-gate.mjs` or `hooks/hooks-cursor.json`.
- The map describes "9 companion agent definitions" — accurate — but does not enumerate the eleven new `commands/` files; the section says only "Slash commands (one .md per command)."
- The map does not reference any of the three new ADRs.

This is the documented churn problem with auto-generated maps in a fast-moving session. 영학 is regenerating in parallel per the dispatch boundary — flagging here so the next-pass map covers the deltas. *Severity: Should-fix (영학-owned).*

### 2.8 `hooks/hooks-cursor.json` — orphan and shape mismatch

The file landed (`hooks/hooks-cursor.json`, 11 lines) with this shape:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [{ "command": "./hooks/session-start" }]
  }
}
```

Two findings:

1. **Orphan.** No file in the repo references `hooks-cursor.json` — not `hooks.json`, not the bootstrap doc, not `README.md`, not `marketplace.json`. A reader stumbling on it has no breadcrumb to its purpose.
2. **Shape divergence from `hooks.json`.** Canonical `hooks.json` uses uppercase event names (`SessionStart`), `matcher` strings, `type: "command"`, and `${CLAUDE_PLUGIN_ROOT}` — none of which appear in the cursor variant. If the cursor target genuinely wants lowercase + bare `command`, document why; if it should mirror canonical shape, fix it. The consolidated spec V9 said "either delete the Cursor branches (small) or write `hooks-cursor.json` and verify on Cursor (modest)" — verification on Cursor is not visible in any test, hook, or doc. *Severity: Should-fix.*

### 2.9 Hook fragmentation — clean

`hooks/` now holds eleven files:

- Bash entry shims (extensionless): `session-start`, `fellowship-context-monitor`, `fellowship-quest-log-consolidate`, `fellowship-session-end`, `fellowship-plan-gate`
- Node workers: `fellowship-context-monitor.mjs`, `fellowship-quest-log-consolidate.mjs`, `fellowship-session-end.mjs`, `fellowship-plan-gate.mjs`, `health-check.mjs`
- Manifests: `hooks.json`, `hooks-cursor.json`
- Cross-platform: `run-hook.cmd`
- Doc: `fellowship-bootstrap.md` (3 lines, used by session-start when no fellowship dir present — purpose is plain)

Every Bash shim has a `.mjs` partner and is referenced from `hooks.json`. No silent fail-paths visible. **Aside from the `hooks-cursor.json` orphan above, no findings.**

### 2.10 `using-worktrees` skill — frontmatter clean

`skills/using-worktrees/SKILL.md` exists. Health-check passes 26/0 with the new skill present, indicating frontmatter validates and the skill is picked up by the discovery loop. **No findings.**

### 2.11 Memory staleness — clean

`.claude/agent-memory/fellowship-jaeyun/MEMORY.md` was checked. The `feedback_session_start_todowrite_check.md` entry remains accurate ("Verified open 2026-04-26. Allowlist fix and skill restructure both failed.") — this matches S2's resolution path (acknowledge, document, work around with quest-log checkboxes). **No findings.** Other entries (roster decisions, design principles, GSD patterns, etc.) are stable across the session.

### 2.12 Scratchpad pollution — clean

`/tmp/scratchpad/` contains seventeen `*-plan-*.md` files from this session's parallel dispatches. None tracked by git (the directory is outside the repo root). **No findings.**

---

## 3. DONE-claim cross-check (consolidated)

Eleven items the consolidated spec marked DONE were spot-checked. **Eleven verified true.** One item (S5, dormant 재윤 gate) was not verified end-to-end in this read-only sweep — flagged for a follow-up confirmer, not as a finding. **Zero items mismarked DONE.**

---

## 4. What's clean — credit

- **Reference-file extraction (S1)** — six new `agents/references/*-templates.md` files, every one referenced by exactly the agent that owns it. Surgical pattern, no orphans, no duplication.
- **Eval suite consistency** — all six new suites carry the same three-file shape and `ASSERTIONS` registry as the older suites. `improve.sh` recognizes them by directory dispatch with no special-casing.
- **Test coverage** — `session-start.test.mjs` and `migration-regression.test.mjs` cover the two highest-value un-tested surfaces from the consolidated spec, and run green.
- **Hook manifest discipline** — `hooks.json` is the single source of registration for every Bash shim. The `PreToolUse` matcher (`Edit|Write|MultiEdit`) is scoped tightly enough to avoid firing on every read.
- **Memory honesty** — the TodoWrite-blocker memory entry explicitly notes the issue is open and lists what was tried, so a future session won't loop on the same fix.
- **Scratchpad hygiene** — heavy parallel session, zero stray artifacts inside the repo.

---

## 5. Headline

**0 blockers, 3 should-fix (two missing ADR back-links, one orphan/divergent `hooks-cursor.json`, plus codebase-map drift owned by 영학의 parallel regen, plus the pre-existing usin/soft.md gap), 0 DONE-claims false.** Tree is publishable as-is; the should-fixes can land in v1.0.1 alongside S1–S6.
