# Phase Foundation — Key Decisions (March 19–23)

**Date:** 2026-03-24
**Supersedes:** 6 earlier design documents (2026-03-19 through 2026-03-23)
**Status:** Foundation complete — implementation phases 1–3 delivered

---

## Executive Summary

Before building the Fellowship plugin, we researched and designed the foundational architecture. This document consolidates the key decisions that shaped Phases 1–3.

## Key Decisions

### 1. 민준수 Is the Orchestrator (Not a Direct Agent)

**Decision:** 민준수 lives in `agents/minjunsu.md` and coordinates all work. He is the permanent guide, never dispatched.

**Entry points (four ways to activate):**
- Mid-session skill load: `/minjunsu` or `/fellowship`
- Project default: `{"agent": "fellowship:minjunsu"}` in settings.json
- One-off CLI: `claude --agent fellowship:minjunsu`
- Auto-dispatch: Implicit when companions match a task

**Why:** The orchestrator role is distinct from builder, reviewer, tester, architect. 민준수의 job is to route work, not execute it.

### 2. Skills + Agents Dual Architecture

**Decision:** Every companion exists as BOTH a skill (shared knowledge) and an agent (specialized worker).

- **Skills** live in `skills/<name>/SKILL.md` — methodology handbook
- **Agents** live in `agents/<name>.md` — personality, tools, boundaries, dispatch instructions

**Why:** Skills are reusable knowledge (주혁의 engineering skill can enhance 승현 when needed). Agents are personality + identity. Separation allows both to evolve independently.

### 3. Nine Companions (Not Ten)

**Decision:** The Fellowship includes 주인공 (the user). There are 8 agents: 재호, 현수, 주혁, 승현, 동일, 우신, 선웅, 필엽, 영학.

**Why:** 주인공 carries the Ring — owns the product. The companions serve 주인공의 vision. This asymmetry is central to the Fellowship metaphor and to solo dev reality.

### 4. 민준수의 Craft: Plan Before Dispatch

**Decision:** 민준수 brainstorms and plans in-session. Only dispatches agents when work is clear and scoped.

- Brainstorm (in-session) → Plan (in-session) → Dispatch (agents work independently)
- 현수 handles deep technical architecture; 재호 handles product scope
- 민준수 orchestrates the workflow, not the technical depth

**Why:** Planning in-session preserves conversation context. Dispatching agents preserves their focus. Two different skills.

### 5. Tier Scoring — Four Tiers with Signal Tables

**Decision:** Every task is classified before action:

| Score | Tier | Action |
|-------|------|--------|
| ≤ 0 | Tier 1 | 민준수 handles directly |
| 1–3 | Tier 2 | One skill or one agent dispatch |
| 4–6 | Tier 3 | Multi-step plan → sequential agents |
| ≥ 7 | Tier 4 | Parallel agents or Agent Teams |

Signals table with +/- scores drives classification. Scoring is a reasoning aid, not a rigid formula.

**Why:** Prevents over-parallelization (expensive) and under-scoping (ineffective). Aligns resource cost to task complexity.

### 6. Model Routing — Sonnet for Checklists, Inherit for Judgment

**Decision:** Companion dispatch can specify model override:

- **Sonnet** (fast, budget-friendly) — structured checklists (승현 code review, 동일 security audit, 우신 testing, 영학 docs)
- **Inherit** (user's default) — judgment calls (주혁 builds, 현수 architecture, 재호 scope, 필엽 design)

**Why:** 승현 running a code-quality checklist doesn't need reasoning depth. 주혁 building a feature does. Model routing matches reasoning cost to decision type.

### 7. Dual-Mode Execution: Subagents (Default) + Agent Teams (Experimental)

**Decision:** Fellowship supports two modes via opt-in environment variable:

- **Subagents** (default, stable): Tier 1–2 work, fire-and-forget, result-oriented
- **Agent Teams** (experimental, opt-in): Tier 3–4 work, sustained collaboration, peer communication

User enables with: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

**Why:** Subagents are cost-efficient for focused tasks. Teams enable deeper collaboration and peer debate on complex work — more lore-accurate to the Fellowship metaphor.

### 8. Verification Gate: DONE Means Proven

**Decision:** Companions report status. 민준수 verifies DONE reports before marking steps complete.

- DONE = task complete + verification output (test results, command output, screenshots)
- DONE_WITH_CONCERNS = complete but has doubts
- NEEDS_CONTEXT = blocked, needs more info
- BLOCKED = stuck, needs help

**Why:** "It should work" is not verification. Shortcuts here compound downstream. One verification step saves ten debugging sessions.

### 9. Engineering Discipline from Superpowers

**Decision:** Four "iron laws" inherited from Superpowers:

1. **TDD:** No production code without failing tests first
2. **Debugging:** No fixes without root cause investigation first
3. **Verification:** No completion claims without fresh verification evidence
4. **Review:** Two-stage code review (spec compliance + code quality)

**Why:** These practices prevented bugs and rework in Superpowers. They scale to multi-agent systems.

### 10. Health Check: Validate Wiring

**Decision:** Plugin includes `hooks/health-check.mjs` that validates:

- Plugin manifest (plugin.json valid, required fields present)
- Settings (settings.json valid, agent field resolves)
- Hook scripts (hooks.json valid, scripts exist and are executable)
- Agent frontmatter (YAML valid, skill refs point to real files)
- Skill directories (every referenced skill has SKILL.md)
- Cross-references (no orphan skills, no dangling refs)

**Why:** Small errors in YAML or file paths cause silent failures. A single automated check catches wiring mistakes as companions are added.

---

## What These Decisions Enabled

- **Phases 1–3** were built on this foundation:
  - Phase 1: Orchestration hardening (verification, tier scoring, model routing, context monitor hook)
  - Phase 2: First four agents (재호, 주혁, 승현, 동일) with personality and boundaries
  - Phase 3: Full roster (added 우신, 선웅, 필엽, 영학) — all consistent

- **Future phases** (Phase 4+) inherit this architecture:
  - New companions plug in with consistent identity
  - New skills reuse the dual-architecture pattern
  - Dispatch cycles follow proven 민준수 orchestration
  - No breaking changes to core wiring

---

## What's Not Here

- Specific companion methodology (see `agents/<name>.md` and `skills/<name>/SKILL.md`)
- Day-by-day implementation record (see `quest-log-archive.md`)
- Web research findings (see `research.md`)
- Reference implementations (see `reference-implementations.md`)

This document captures **why** we built Fellowship the way we did. The **how** lives in the implementation.
