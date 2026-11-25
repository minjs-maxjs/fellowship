# Fellowship Real-Usage Improvements

**Defined:** 2026-04-22
**Author:** 재호 (PRD) — priorities to be locked by 주인공 (Karolus)
**Locked decisions:** none yet

---

## Context

Karolus is now running Fellowship on 3–4 real projects in parallel. The orchestration instincts work — 민준수 routes correctly, 재호 writes PRDs when scope needs naming, 현수 handles ARDs, Tier 1 direct fixes keep the solo-dev loop fast. Background/foreground judgment holds.

Six problems surfaced under real use. This document names them, re-orders by compound cost, and defines acceptance criteria for each. It does not prescribe architecture — 현수 will translate these into technical design before 주혁 builds.

**Principles that must not be violated:**
- The Ring must not grow heavier. No new companions. No speculative mechanisms.
- 주인공 carries the Ring. This document recommends; Karolus locks priorities.
- Preserve what works — 민준수 routing, Tier 1 directness, background/foreground defaults.

---

## Research Findings

### Native Claude Code APIs (P1 blocker)

- **`TodoWrite` is real.** Superpowers uses it extensively (`skills/subagent-driven-development/SKILL.md`, `skills/using-superpowers/SKILL.md`, `skills/executing-plans/SKILL.md`). It is the native Claude Code tool for publishing a live checklist the user can see tick.
- **`TaskCreate` is not a real tool.** 민준수의 agent file references `TaskCreate` in five places (lines 186, 428, and example text). This is a naming error — the real API is `TodoWrite`. The instruction has likely been silently failing or being interpreted as "write a markdown checklist somewhere," which explains the user's observation that dispatched agents have no visible progress.
- **Running background agents cannot publish progress to the user mid-flight.** This is a Claude Code platform constraint, not a Fellowship bug. The workable pattern: 민준수 publishes a top-level `TodoWrite` checklist before dispatch — one item per companion, one sub-item per step where useful — and updates items on each DONE report. Individual agents cannot update 민준수의 TodoWrite from inside their own context.
- **No native "send message to a running background agent" API.** Mid-flight correction is not available. Karolus must either wait for DONE or cancel.

### Superpowers patterns worth adopting

- **TodoWrite as the visible spine of execution.** Every multi-step workflow in Superpowers opens with a TodoWrite listing all tasks. User watches items flip `in_progress` → `completed`.
- **Two-stage review after each task** (spec reviewer, then code quality reviewer). Fellowship's 승현 conflates these. Worth noting but not in scope for this batch.
- **Project-local skills:** Superpowers treats `.superpowers/skills/` in a project as first-class — the `using-superpowers` skill explicitly surveys project skills at session start. Fellowship does not do this.

### gsd-get-shit-done patterns

- **Wave execution + codebase-mapper agent.** Gsd dispatches a `codebase-mapper` at project init and re-runs on drift. This is close to Fellowship's `codebase-map` skill, but Fellowship never auto-feeds the map to 승현. A structural reviewer without the map is blind — this explains P2.
- **Explicit phase/milestone state in one file.** Gsd has one canonical location for current work. Fellowship has two (`specs/` and `plans/`) plus an archive, which is the root of P4.

### Our current state

- **민준수 (563 lines):** bootstraps `docs/fellowship/specs/`, `plans/`, `quest-log.md`, `product.md`, `templates/ethos.md`. Ethos injection is specified for Tier 3+ dispatches (line 396–400). Nothing in 민준수, the session-start hook, or health-check.mjs checks for existing projects missing `templates/ethos.md` or surveys project-local skills.
- **승현 (331 lines):** Structural review is present but shallow. Line 135: *"Did this change create bloated files, or significantly grow existing ones?"* — but 승현 receives only the git diff and the task prompt. He is never given the codebase map, a file-size snapshot, or a duplication signal. He cannot compare the changed file to sibling files he has not read.
- **Session-start hook:** Injects `quest-log.md` and `product.md` at session open. Does not enforce updates to either during or after work. `fellowship-session-end.mjs` appends one log line per session but does not nudge quest-log / product.md freshness.
- **Bootstrap:** Specified in 민준수 lines 150–167. Creates `templates/ethos.md`. No migration path for projects where `docs/fellowship/` exists but `templates/ethos.md` does not.
- **Specs vs plans convention:** 민준수 line 424 says *"save to `docs/fellowship/plans/`"* (planning skill output). Line 479 groups specs + plans as "design specs and plans". No rule documents the distinction. The current `docs/fellowship/plans/` directory is **empty**, while `specs/` holds 6 files of mixed types (feature specs, skill specs, compression spec). This matches what Karolus reported.

---

## Prioritized Problems

Reordered by **impact × compound cost**. Compound-over-time pain (code quality decay, doc rot) outweighs one-time friction.

| Rank | Problem | Original | Why this rank |
|---|---|---|---|
| **1** | Agent progress visibility | P1 | Daily friction across every dispatch. Also a correctness bug (`TaskCreate` doesn't exist). High impact, low effort. |
| **2** | 승현 structural blindness | P2 | Compound cost is permanent — bad structure becomes harder to fix the longer it sits. This is the Ring growing heavier. |
| **3** | docs/fellowship structure chaos | P4 | Touches every project, every session. Cheap to fix once, saves mental overhead forever. |
| **4** | Ethos not added for existing projects | P5 | One-time migration per project. Important but bounded. |
| **5** | product.md and quest-log staleness | P6 | Quiet decay. Matters, but depends on fixing P4 first (where to write what). |
| **6** | Project-local skills ignored | P3 | Real problem, but lowest frequency — only affects projects that already have their own `.claude/`. Do last. |

---

## Problem 1 — Agent Progress Visibility

### What's broken
- 민준수의 agent file instructs `TaskCreate` to publish a checklist before Tier 3+ dispatch. **`TaskCreate` is not a real Claude Code tool name** — the native tool is `TodoWrite`. Instructions likely degrade to "write a checklist somewhere" or silently no-op.
- Foreground dispatches (주혁 on feature builds) should show live progress. Background dispatches (승현, 우신, 동일, 선웅, 필엽, 영학) finish without any visible signal to the user that they're done.
- No clear report surfaces when a background agent completes. The user has to ask or check logs.
- Mid-flight correction is not possible (platform constraint — document it, don't fight it).

### Why it matters
Every Tier 3+ quest suffers. The user cannot tell a running agent from a stalled one; cannot tell a finished agent from a silent one. This is the most frequent friction in Fellowship use.

### Proposed fix (direction, not design)
- Rename `TaskCreate` → `TodoWrite` throughout `agents/minjunsu.md`. Verify the tool is available to 민준수 (it is a Claude Code built-in).
- Require 민준수 to publish a TodoWrite checklist **before every Tier 3+ dispatch** (this is already specified — fix the tool name and enforce it).
- On each companion DONE: 민준수 marks the item `completed` and surfaces a one-line status to the user (*"승현: APPROVED_WITH_CONCERNS — 1 minor finding."*).
- Document the mid-flight correction limitation explicitly in 민준수 so the user isn't surprised.
- **Out of scope:** per-agent live streaming from inside a background dispatch. Platform does not support it.

### Acceptance criteria
- [ ] `rg -n "TaskCreate" agents/` returns zero results.
- [ ] `agents/minjunsu.md` references `TodoWrite` at every place a pre-dispatch checklist is described (Tier 3 dispatch, Tier 4 dispatch, Planning section).
- [ ] 민준수의 dispatch procedure explicitly states: "Before first dispatch on Tier 3+, call `TodoWrite` with one item per companion step." (observable in the agent file).
- [ ] On receipt of any background companion DONE, 민준수 is instructed to surface a single-line status to the user AND mark the TodoWrite item complete.
- [ ] 민준수 contains one sentence acknowledging the mid-flight correction limit: background agents cannot receive updates after dispatch.
- [ ] Manual verification on one real Tier 3 quest: user watches the TodoWrite tick through each companion.

### Scope: IN / OUT
- **IN:** 민준수 agent file edits; naming fix; behavior specification.
- **OUT:** New hook, new command, new companion. No platform work.

### Effort estimate
- **Tier 1 (민준수 direct fix)** — 30-min edit pass on `agents/minjunsu.md`. Plus one real-quest verification.

### Dependencies
None. Ship first.

---

## Problem 2 — 승현 Structural Blindness

### What's broken
승현 spots line-level mistakes but does not see the repo as a system. He has no file-size signal, no cross-file duplication signal, no structural neighbor context. When Karolus says *"make sure the code is scalable, correctly structured and split,"* 승현 has no artifact to check it against. He reads the diff and the task prompt and nothing else.

### Why it matters
This is the Ring growing heavier. Every review that misses a structural rot lets the rot compound. Two months in, Karolus is carrying technical debt 승현 could have named on day one.

### Proposed fix (direction, not design)
Two complementary moves:

1. **Feed 승현 the codebase map.** Fellowship already has a `codebase-map` skill and `docs/fellowship/codebase-map.md` convention. 민준수 already conditionally includes it for Tier 3+ (`minjunsu.md:483`). Extend: **always** include it when dispatching 승현, if it exists. Instruct 승현 to use it for structural comparison.

2. **Add a structural review checklist to 승현.** Explicit items he must check on every review:
   - File size: did this change push any file above [threshold — 현수 decides]?
   - Single responsibility: does the changed file still have one clear job?
   - Duplication: does this file's logic echo another file in the codebase? (Grep for near-duplicates of new functions.)
   - Placement: is this file in the right directory given the codebase map?
   - Module boundaries: does this change cross a boundary that existed?

   These become a Structural section in 승현의 review format, sitting alongside Correctness / Security / Testing.

### Acceptance criteria
- [ ] `agents/minjunsu.md` dispatch rule: when dispatching 승현, always include `docs/fellowship/codebase-map.md` content if the file exists; if absent and the project has ≥20 source files, prompt the user to run `/fellowship:map` first.
- [ ] `agents/seunghyeon.md` contains a "Structural Review" subsection under How to Review with the five explicit checks above (or equivalent, locked after 현수의 ARD).
- [ ] `agents/seunghyeon.md` report format includes a `Structural:` findings category (or explicit routing of structural findings into Critical / Important / Minor with a structural tag).
- [ ] 승현의 `Anti-Paralysis Guard` is updated — reading the codebase map does not count toward the 5-consecutive-Read limit.
- [ ] Manual verification: one test case where a new file clearly duplicates existing logic. 승현 flags it.

### Scope: IN / OUT
- **IN:** 승현 agent file; 민준수 dispatch rule for 승현; leverage existing `codebase-map` skill.
- **OUT:** Building a codebase map auto-refresh hook (separate spec). Changing 현수의 or 주혁의 behavior. Making 승현 fix things (stays review-only).

### Effort estimate
- **Tier 2** — 현수 writes a short ARD (what thresholds? how to detect duplication without reading every file?), then 주혁 edits `seunghyeon.md` and `minjunsu.md`. 우신 adds an eval scenario for the duplication case.

### Dependencies
None hard. But **should wait until P3 (docs structure) is locked** so `docs/fellowship/codebase-map.md` has a clear home.

---

## Problem 3 — docs/fellowship Structure Chaos

### What's broken
- `docs/fellowship/specs/` holds feature specs, skill specs, and a compression spec — all under one roof.
- `docs/fellowship/plans/` is empty. The planning skill is supposed to write here (`minjunsu.md:424`). It isn't happening or isn't being enforced.
- No rule anywhere says what goes in `specs/` vs `plans/`. Wireframes are rumored to live in `plans/` in random places (per Karolus).
- Old, completed specs mix with active ones. No archive convention for specs.

### Why it matters
Every session, Karolus loses micro-time deciding where to write something or where to find something. Multiplied across 3–4 projects, this is steady tax on every interaction.

### Proposed fix (direction, not design)
Lock a single rule. Recommendation (주인공 decides):

- **`docs/fellowship/specs/`** — PRDs (재호), ARDs (현수), formal scope + design artifacts. One file per feature. Naming: `YYYY-MM-DD-{slug}.md`. On completion, move to `docs/fellowship/specs/archive/`.
- **`docs/fellowship/plans/`** — execution plans from the `planning` skill (step-by-step, who does what, file-level tasks). One file per quest. Naming: `YYYY-MM-DD-{slug}-plan.md`. Archive on quest completion.
- **Wireframes / visual artifacts** — `docs/fellowship/design/` (new subdir). Do not sprinkle them into plans.
- **Document the rule in one place**: a short `docs/fellowship/README.md` that says what lives where. 민준수 reads this and enforces it.

### Acceptance criteria
- [ ] `docs/fellowship/README.md` exists and documents the directory structure with one line per directory.
- [ ] `agents/minjunsu.md` bootstrap step creates `docs/fellowship/README.md` and `docs/fellowship/specs/archive/` and `docs/fellowship/design/` (new).
- [ ] `agents/minjunsu.md` planning section references the specs-vs-plans rule and saves planning artifacts only to `plans/`.
- [ ] `agents/jaeho.md` and `agents/hyeonsu.md` write only to `specs/` (unchanged for 재호, verify for 현수).
- [ ] On quest completion, 민준수 archives the relevant plan to `plans/archive/` silently.
- [ ] One-time migration of this repo's existing `specs/` — old completed specs moved to `specs/archive/`. (Karolus approves each move.)

### Scope: IN / OUT
- **IN:** README, bootstrap update, agent file updates for 재호/현수 write destinations, archive folders.
- **OUT:** Renaming existing spec files retroactively (leave them as-is, just move the completed ones). Changing the `templates/` directory structure.

### Effort estimate
- **Tier 1 (민준수 direct)** — 20-min edit + one migration pass with Karolus. No agent dispatch needed.

### Dependencies
Blocks P2 (decides where codebase map and design artifacts live) and P5 (quest-log / product.md freshness ties into doc discipline).

---

## Problem 4 — Ethos Not Added for Existing Projects

### What's broken
Bootstrap now creates `templates/ethos.md` (v1.2.1, landed today). But existing Fellowship projects — created before the fix — have no ethos file. Also unclear whether the ethos injection (`minjunsu.md:396–400`) is actually firing at dispatch time. Karolus has no way to verify.

### Why it matters
Ethos is the constraint that keeps companions consistent across dispatches. A project without it drifts. Multiply across 3–4 projects and the character consistency guarantee breaks silently.

### Proposed fix (direction, not design)
- **Migration check at session start.** The session-start hook already reads `docs/fellowship/`. Extend it to: *if `docs/fellowship/` exists AND `templates/ethos.md` does not, surface a one-line notice — "Ethos missing. Run `/fellowship:bootstrap-ethos` to add."* Do not auto-write silently; Karolus may have intentionally removed it.
- **Verification of ethos injection.** Add a simple, observable signal: when 민준수 dispatches Tier 3+, the prepended `## Fellowship Principles` block should be visible in the dispatch prompt. One eval scenario in `evals/minjunsu/` that confirms it.
- **Optional:** a `/fellowship:bootstrap-ethos` command that writes the template into an existing project's `templates/` directory.

### Acceptance criteria
- [ ] `hooks/session-start` (or equivalent) detects missing `templates/ethos.md` when `docs/fellowship/` exists and prints a one-line notice.
- [ ] An eval scenario exists under `evals/minjunsu/` that verifies Tier 3+ dispatch prompts include the `## Fellowship Principles` block.
- [ ] Manual verification on one existing project: notice shows, fix applied, next dispatch includes ethos.

### Scope: IN / OUT
- **IN:** Session-start hook extension; one eval; optional small command.
- **OUT:** Rewriting the ethos itself; changing what the four principles are; auto-writing ethos without user consent.

### Effort estimate
- **Tier 2** — 선웅 updates the session-start hook; 우신 writes the eval.

### Dependencies
None hard.

---

## Problem 5 — product.md and Quest-Log Staleness

### What's broken
- `product.md` rarely updates from ongoing conversations. Decisions, shipped features, new stakeholders — none of it lands in product.md automatically.
- Quest-log updates sometimes get missed entirely. Parts of a quest are lost because 민준수 forgets to move them to Recently Completed.

### Why it matters
`product.md` is the ground truth every Tier 3+ dispatch rests on. A stale product.md means 재호 is writing PRDs against outdated context. A missed quest-log update means next session has no memory of what happened.

### Proposed fix (direction, not design)
Three moves, increasing in teeth:

1. **Lightest:** Extend 민준수의 "Before You Dispatch" and "Memory" sections. Explicit rule: *"On any locked decision that changes product scope, stakeholders, or constraints → update `product.md` inline before dispatching. Silently. No announcement."*

2. **Medium:** On session end (`fellowship-session-end.mjs`), if the quest log's `Current` has items marked `[x]` not yet moved to `Recently Completed`, auto-consolidate OR surface a one-line reminder.

3. **Heaviest (optional):** A scheduled check — if `product.md` has not been edited in 30 days AND quest-log has seen ≥10 completions in that window, 민준수 prompts at session start: *"product.md looks stale. Want me to review recent quests against it?"*

Move 1 is mandatory. Move 2 is strongly recommended. Move 3 is optional.

### Acceptance criteria
- [ ] `agents/minjunsu.md` Memory section contains an explicit rule on when to update `product.md`, with named triggers (locked scope decision, major ship, stakeholder change, constraint change).
- [ ] `hooks/fellowship-session-end.mjs` (or session-start) detects unconsolidated quest-log state and surfaces a one-line reminder.
- [ ] One eval scenario where a user describes a scope decision in chat; 민준수 updates product.md in the same turn.
- [ ] Optional: staleness prompt implemented if 주인공 wants it.

### Scope: IN / OUT
- **IN:** 민준수 instruction, session-end hook extension, one eval.
- **OUT:** Automatic rewrites of product.md without user visibility. LLM-summarizing the transcript into product.md (too much magic, too little trust).

### Effort estimate
- **Tier 2** — 민준수 edit (Tier 1) + hook extension (선웅, Tier 1 each).

### Dependencies
Depends on P3 (docs structure) being locked so the writes have a stable destination.

---

## Problem 6 — Project-Local Skills Ignored

### What's broken
Some of Karolus's projects ship with their own `.claude/`, `.agents/`, or skills directories. Fellowship doesn't survey these. 민준수 assumes the plugin's companions are the full set, ignoring what the project already has.

### Why it matters
Wrong assumption of authority. A project that already has `.claude/skills/auth-playbook/` is telling Fellowship *"use this first."* Ignoring it means the user gets generic work when a project-tuned skill exists.

### Proposed fix (direction, not design)
- At session start, survey `.claude/skills/` and `.claude/agents/` in the project root (alongside the plugin's). Surface a one-line list to 민준수: *"Project-local: 2 skills, 1 agent — [names]."*
- Add a rule to 민준수: *"Project-local skills take precedence over plugin skills when names overlap."* Name collision → project wins.
- Document in the new `docs/fellowship/README.md` (from P3) how to add a project-local skill.

### Acceptance criteria
- [ ] `agents/minjunsu.md` contains a section "Project-Local Skills and Agents" documenting precedence and survey behavior.
- [ ] Session-start hook surfaces a single-line inventory of project-local skills/agents when they exist.
- [ ] One eval: project with a local skill whose name matches a plugin skill — 민준수 loads the local one.
- [ ] `docs/fellowship/README.md` explains how to add project-local skills.

### Scope: IN / OUT
- **IN:** Survey at session start; precedence rule in 민준수; docs entry.
- **OUT:** Merging plugin + project skills into a unified registry; modifying plugin.json to read project directories; any cross-project skill sharing.

### Effort estimate
- **Tier 2** — 선웅 extends session-start; 민준수 edit.

### Dependencies
Depends on P3 for the README location.

---

## Execution Order

**Recommended order — smallest, highest-leverage moves first; structural fixes before the rot compounds.**

1. **Problem 1 — Agent progress visibility (Tier 1, 30 min).** Pure bug fix (`TaskCreate` → `TodoWrite`) with immediate daily impact. Ship first, independently, today if possible.

2. **Problem 3 — docs/fellowship structure (Tier 1, 20 min + migration).** Unblocks P2, P5, P6. Cheap and foundational. Do second.

3. **Problem 2 — 승현 structural review (Tier 2).** The compound-cost fix. Requires 현수의 ARD on thresholds and duplication detection. Start 현수 after P3 lands.

4. **Problem 5 — product.md / quest-log staleness (Tier 2).** Once P3 gives the doc structure, the staleness rules have a clean home. 민준수 edit + one hook extension.

5. **Problem 4 — Ethos migration (Tier 2).** Independent, not urgent. Slot it alongside P5.

6. **Problem 6 — Project-local skills (Tier 2).** Lowest frequency. Do last, with P3's README already in place.

**Parallel opportunity:** P4 and P6 can run in the same 선웅 dispatch (both are session-start hook extensions) after P3 lands.

---

## Out of Scope

The Ring must not grow heavier. These are tempting and excluded:

| Tempting addition | Why excluded |
|---|---|
| Per-agent live streaming during background dispatch | Platform does not support it. Do not fight Claude Code. |
| Mid-flight "send message to running agent" | Same — platform constraint. Document the limit, don't simulate it. |
| Auto-summarizing transcripts into product.md | Magic that breaks trust. User must see and approve scope writes. |
| A new companion for "meta-observer" / "progress reporter" | Ten companions. No more. |
| Rewriting 승현 to also fix code | 승현 reviews; 주혁 fixes. The separation is load-bearing. |
| Merging plugin + project skills into one unified registry | Precedence rule is enough. A registry is infrastructure we don't need. |
| Auto-archiving old specs without user confirmation | One-time migration is fine; ongoing auto-moves are not. |
| Rewriting 민준수 end-to-end | He is 563 lines and mostly right. Surgical edits only. |

---

## Open Questions for 주인공

- [ ] **P1:** Do you want the per-DONE one-line status surfaced automatically, or only on request? (Recommendation: automatic, one line, in voice.)
- [ ] **P2:** What file-size threshold triggers a Structural finding? (현수 will propose in the ARD — 300 / 500 / 800 lines?)
- [ ] **P3:** Do you accept the specs-vs-plans split as proposed, or do you want a simpler single-directory convention?
- [ ] **P3:** Should `docs/fellowship/design/` exist as a dedicated home for wireframes, or keep them in `specs/`?
- [ ] **P4:** If ethos is missing, surface a one-line notice (lighter) or auto-create with user confirmation (heavier)? Recommendation: notice only.
- [ ] **P5:** Move 3 (30-day staleness prompt) — in or out for this batch?
- [ ] **P6:** Are there specific projects where you already rely on project-local skills that would inform the precedence rule?

---

## Cross-Agent Change Flags

Flagging for Karolus's awareness — these problems touch multiple agents:

- **P1:** 민준수 only. Safe.
- **P2:** 민준수 (dispatch rule) + 승현 (review methodology). Two-agent change.
- **P3:** 민준수 (bootstrap + planning) + 재호 (write destinations) + 현수 (write destinations). Three-agent, but trivial edits.
- **P4:** 민준수 + one hook. Low risk.
- **P5:** 민준수 + one hook. Low risk.
- **P6:** 민준수 + one hook. Low risk.

No change in this batch requires editing every companion — the pattern holds: 민준수 plus targeted surgical edits.

---

## Platform-Dependent Items

These are the only places we're waiting on something outside our control:

- **Mid-flight background agent messaging.** Not available. P1's "cannot interrupt mid-flight" is documented as a platform limit, not fixed.
- **Everything else is within our control.** No other problem in this batch blocks on a Claude Code feature we don't have.
