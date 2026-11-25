# Dual-Mode Architecture & Tier Scoring — Design Spec

**Date:** 2026-03-23
**Status:** Approved — implementation plan at `docs/fellowship/plans/2026-03-23-core-solidification.md`
**Goal:** Add objective Tier scoring to task classification, and support both subagent and Agent Teams execution modes with Teams reserved for Tier 4.

---

## Problem

Two gaps in the current orchestration:

1. **Tier classification is subjective.** 민준수 assigns Tiers 1-4 based on judgment with no anchors. The same task could be classified differently across sessions. There's no vocabulary for explaining *why* a task is a certain tier.

2. **No Agent Teams support.** All companion dispatch uses subagents (sequential, report-back-to-민준수). Tier 4 tasks that involve parallel, independent work streams have no coordination model beyond "dispatch multiple subagents and wait."

---

## Part 1: Tier Scoring System

### Signals

Signals are characteristics of a task that push the classification up or down. 민준수 evaluates these before classifying.

**Signals that push UP (toward higher tiers):**

| Signal | Score | Examples |
|--------|-------|---------|
| Multiple files affected | +2 | Feature spanning 3+ files |
| Touches critical path (auth, payments, data mutations, public APIs) | +3 | Auth middleware, payment webhook, database migration |
| Cross-domain (frontend + backend, or code + infrastructure) | +2 | API route + UI component + database schema |
| New feature (not fix/tweak) | +2 | New page, new API, new workflow |
| Complex logic / many edge cases | +2 | State machine, data transformation pipeline |
| User signals thoroughness ("careful", "thorough", "review this") | +2 | Explicit quality request |
| Spec exists with multiple requirements | +1 | Written plan with 5+ tasks |

**Signals that push DOWN (toward lower tiers):**

| Signal | Score | Examples |
|--------|-------|---------|
| Single file | -2 | One component, one config file |
| Config / copy / styling only | -3 | Tailwind classes, env var, button text |
| Clear fix with known solution | -2 | Bug with obvious cause, documented pattern |
| User signals speed ("quick", "just", "simple") | -2 | "just fix the typo" |
| Similar work done recently (pattern exists) | -1 | Second API endpoint following established pattern |
| No tests needed (pure cosmetic) | -1 | Color change, spacing adjustment |

### Thresholds

| Score | Tier | Mode | What happens |
|-------|------|------|-------------|
| <= 0 | **Tier 1 — Direct** | 민준수 handles | No agents. Quick fix, question, brainstorm, simple edit. |
| 1-3 | **Tier 2 — One specialist** | One subagent | Load a skill or dispatch one companion. |
| 4-6 | **Tier 3 — Sequential chain** | Multiple subagents | Plan first. 주혁 -> 승현 -> 우신 cycle. |
| >= 7 | **Tier 4 — Parallel / Teams** | Subagents or Agent Teams | Plan first. Parallel branches. Teams mode when enabled and beneficial. |

### How 민준수 uses scoring

Scoring is **a reasoning aid, not a formula.** 민준수 evaluates signals mentally and arrives at a tier. He doesn't need to write out the math every time — but when explaining a classification to the user, he can reference specific signals:

> "This is Tier 3 — multiple files (+2), touches auth (+3), new feature (+2) gives us 7, but there's an established pattern to follow (-1) so we're at 6. Sequential chain: 주혁 builds, 승현 reviews."

For borderline cases (score near a threshold), 민준수 uses judgment to break the tie. **Always err toward the lower tier** — a solo dev's time is precious.

### What scoring does NOT do

- Replace judgment — it anchors it
- Require calculation in every response — just when classification matters
- Apply to user-overridden tiers — if the user says "just do it quick," that's Tier 1 regardless of signals

---

## Part 2: Dual-Mode Execution

### Architecture

The plugin supports two execution modes for companion dispatch. Mode selection is based on Tier classification and feature availability.

```
Tier 1-2: 민준수 handles directly or dispatches one subagent
Tier 3:   Sequential subagent chain (current model, unchanged)
Tier 4:   Agent Teams (when enabled) OR parallel subagents (fallback)
```

### Mode: Subagent (default, all tiers)

Current model. 민준수 dispatches companions via `Agent()`. They execute, report back with structured status (DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED). 민준수 coordinates handoffs.

**Characteristics:**
- Sequential or parallel dispatch (parallel = `run_in_background: true`)
- Companions report only to 민준수
- Lower token cost
- 민준수 maintains full visibility and control

### Mode: Agent Teams (Tier 4, opt-in)

Uses Claude Code's experimental Agent Teams feature. 민준수 acts as team lead. Companions become teammates that coordinate via shared task list and direct messaging.

**Characteristics:**
- Teammates communicate directly (승현 can message 주혁 without 민준수 relaying)
- Shared task list with dependency tracking and self-claiming
- Higher token cost (each teammate = separate Claude instance)
- 민준수 as lead: decomposes work, assigns file ownership, synthesizes results

**When Teams mode activates:**
1. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` env var is set to `1`
2. Task is classified as Tier 4
3. Task has genuinely independent parallel work streams

If any condition is false, fall back to parallel subagents.

### Agent dual-mode communication

Each companion's agent definition includes a COMMUNICATION MODE section:

```markdown
## Communication Mode

**Teammate mode** (Agent Teams): Communicate with other teammates via
SendMessage for coordination. Write substantial output to files. Send
brief completion message to the lead when done. Never call TeamCreate.

**Subagent mode** (default): Report back to 민준수 using the standard
reporting protocol (Status, What was built, Files changed, Verification,
Concerns).
```

The companion doesn't need to check which mode it's in — the context makes it clear. If spawned with `team_name` parameter, it's a teammate. Otherwise, it's a subagent.

### 민준수의 team-lead behavior

When operating in Teams mode, 민준수의 orchestration changes:

1. **Task decomposition with file ownership** — each teammate gets exclusive file boundaries. No two teammates touch the same file.
2. **Interface contracts first** — if teammates share boundaries (e.g., 주혁 builds API, another instance builds frontend), define the contract (types, response shapes) before spawning.
3. **Spawn teammates** — `Agent(team_name="...", subagent_type="fellowship:juhyeok", prompt="...")`
4. **Monitor via task list** — teammates claim and complete tasks. 민준수 checks progress, redirects if needed.
5. **Synthesize results** — when all teammates complete, 민준수 reviews the combined output.
6. **Cleanup** — shut down teammates, clean up team resources.

### Teams mode use cases for Fellowship

| Scenario | Team composition | Why Teams helps |
|----------|-----------------|----------------|
| **Parallel review** | 승현 (code quality) + 동일 (security) | Two review dimensions simultaneously, findings don't overlap |
| **Cross-layer feature** | 주혁 (backend) + 주혁 (frontend) | File ownership boundaries, parallel build |
| **Research sprint** | 선웅 x3 (different questions) | Parallel web research, findings shared |
| **Full feature cycle** | 주혁 (build) + 승현 (review) + 우신 (test) | Review can start on early files while 주혁 builds later ones |

### What changes per file

| File | Change |
|------|--------|
| `skills/orchestration/SKILL.md` | Add Tier scoring signals + thresholds. Add Teams mode section with team-lead behavior. |
| `agents/minjunsu.md` | Add note about dual-mode support in description. |
| `agents/juhyeok.md` | Add COMMUNICATION MODE section. |
| `agents/seunghyeon.md` | Add COMMUNICATION MODE section. |
| `agents/usin.md` | Add COMMUNICATION MODE section. |
| Future agents | Include COMMUNICATION MODE section from the start. |

### What does NOT change

- Agent skills (code-review, testing, engineering) — mode-independent
- Hook system — no new hooks needed for MVP (quality gate hooks are a future enhancement)
- Plugin manifest — no structural changes
- Subagent dispatch for Tier 1-3 — completely unchanged

---

## Implementation Plan

### Phase 1: Tier scoring (can ship independently)
1. Update `skills/orchestration/SKILL.md` with scoring signals and thresholds
2. Test: 민준수 classifies 5 sample tasks and explains scoring

### Phase 2: Dual-mode agent definitions
1. Add COMMUNICATION MODE section to all active agent files (juhyeok, seunghyeon, usin)
2. Update `agents/minjunsu.md` description to mention team-lead capability
3. Test: Agents work identically in subagent mode (no regression)

### Phase 3: Orchestration skill Teams section
1. Add Teams mode section to `skills/orchestration/SKILL.md`
2. Cover: when to use, team-lead behavior, file ownership, spawn pattern, cleanup
3. Test: 민준수 can explain when it would use Teams vs subagents

### Phase 4: Live Teams test (requires feature flag)
1. Enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
2. Run a Tier 4 task with actual Teams mode
3. Document findings, adjust orchestration guidance

---

## Reference implementations

- **barkain/workflow-orchestration** — dual-mode with scoring (`examples/barkain-workflow/`). Key files: `CLAUDE.md` (architecture), agent files (COMMUNICATION MODE sections).
- **wshobson/agents** — Teams-focused plugin (`examples/wshobson-agents/plugins/agent-teams/`). Key files: `README.md`, skills (`team-composition-patterns`, `task-coordination-strategies`).
- **Superpowers** — subagent-only, but strong verification and review patterns (`examples/superpowers/`).

See `docs/fellowship/reference-implementations.md` for full analysis.

---

## Part 3: Model Routing per Companion

### Principle

Keep `model: inherit` as the default in all agent definitions. 민준수 chooses the model per-dispatch based on task complexity, not static config. This ties to Tier scoring — lower-tier dispatches use cheaper/faster models, higher-tier dispatches inherit the user's model.

### Routing guidance

| Companion | Default model | When to use opus/inherit | When to use sonnet |
|-----------|--------------|--------------------------|-------------------|
| **주혁** | inherit | New features, critical paths, complex logic | Simple fixes, config changes, following established patterns |
| **승현** | sonnet | Reviewing complex architecture decisions | Standard code review (most dispatches) |
| **우신** | sonnet | Complex test infrastructure setup | Writing tests from specs (most dispatches) |
| **현수** | inherit | Always — architecture decisions need strong reasoning | — |
| **재호** | inherit | Always — product strategy needs nuance | — |
| **동일** | sonnet | Novel security concerns | OWASP checklist audits (most dispatches) |
| **선웅** | sonnet | — | Research is breadth, not depth (all dispatches) |
| **필엽** | sonnet | Complex design system decisions | Design audits, a11y checks (most dispatches) |
| **영학** | sonnet | — | Copy polish (all dispatches) |

**Pattern:** Companions that follow checklists and structured protocols run on sonnet. Companions that make judgment calls inherit the user's model.

### Implementation

민준수 uses the `model` parameter at dispatch time:
```
Agent(fellowship:usin, model: "sonnet")
```

No changes to agent frontmatter needed. The orchestration skill documents the routing guidance.

---

## Part 4: Agent Color Coding

Add a `color` field to each agent's frontmatter for visual distinction in Teams mode tmux panes.

| Companion | Color | Rationale |
|-----------|-------|-----------|
| **민준수** | — | Lead session, default color |
| **주혁** | red | Builder, action |
| **승현** | green | Reviewer, approval |
| **우신** | yellow | Testing, caution |
| **현수** | blue | Architecture, planning |
| **재호** | magenta | Product, strategy |
| **동일** | red | Security, warnings |
| **선웅** | cyan | Research, exploration |
| **필엽** | magenta | Design, creativity |
| **영학** | cyan | Writing, communication |

Added to agent frontmatter as:
```yaml
---
name: juhyeok
color: red
---
```

No functional impact in subagent mode — only visible in Teams mode split panes.

---

## Open questions

1. **Should 민준수 log tier scores?** Even informally — "Tier 3 (score: 5)" in the quest log — to build a record of classification decisions we can review later.
2. **Teams mode hooks?** `TaskCompleted` hook for verification gates, `TeammateIdle` for reassignment. Valuable but not needed for MVP.
3. **Direct mode interaction during Teams?** If 민준수 is running a team and the user wants to talk to 필엽 directly in another terminal, does that create conflicts? Probably not — they'd be separate sessions — but worth considering.
