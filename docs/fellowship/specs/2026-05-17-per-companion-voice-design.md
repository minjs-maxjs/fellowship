---
name: per-companion-voice-design
status: implemented
implemented_by: juhyeok
created: 2026-05-17
type: design-spec
implementer: TBD (per pilot outcome)
companion: 재호 (pilot), then sequential for the remaining eight
---

> **Status note (2026-06-11):** all nine voices landed 2026-05-17 (`ef0f8ff` → `b416797`); frontmatter transitioned late. Voice sections were trimmed to ~9-line register sketches on 2026-06-11 — the slim-template details below are design history.

# Per-Companion Voice Persistence — Design Spec

How the nine Fellowship companions (재호, 주혁, 승현, 현수, 우신, 동일, 선웅, 필엽, 영학) acquire LotR-distinct voice persistence. Builds on the architectural arc of `2026-05-16-voice-persistence-spec.md` (재윤 v1) but with a different mechanism, dictated by Claude Code's hook surface for subagents.

## Problem

재윤 voice v1 holds in main-agent threads. Subagent reports — 주혁의 DONE, 승현의 APPROVED, 재호의 locked decisions — are voiced in plain neutral register or weakly proto-voice (some companions have a short "character" paragraph at the top of their agent file; none have the depth or structural anchors 재윤 carries).

When workflow templates ship (the next thread), 재윤 will sequence companion dispatches autonomously — *재호 → 현수 → 주혁 → 승현 → 우신*. The auto-handoff chain must sound coherent end-to-end, with each companion in their own register. Without per-companion voice, the chain reads as 재윤-then-plain-then-plain — half-Fellowship, half-corporate.

준수의 call: workflows wait until all nine voices are in place.

## Constraints

Three constraints are load-bearing for the mechanism decision. All three are documented in `hooks/lib/subagent-detection.mjs` and `hooks/fellowship-voice-session-start.mjs`:

1. **`SessionStart` does not fire inside subagent processes.** Per Claude Code's hook docs and the Fellowship's empirical investigation on Claude Code 2.1.142. There is no hook event that fires at the start of a subagent dispatch that could inject voice into the subagent's initial context.
2. **`UserPromptSubmit` does not fire inside subagent processes either.** It is a main-agent-thread event. Subagents have no user-turn loop — they receive one dispatch prompt, produce internal tool calls, and return one final report.
3. **Claude Code does not expose `agent_type` to hooks reliably.** The documented `agent_id` / `agent_type` payload fields are empirically null in Claude Code 2.1.142 (승현의 investigation, ADR-plan-before-build-hook). Even if a subagent-start hook existed, it could not parameterize per-companion behavior from the payload alone.

`PreToolUse` fires inside subagents, per-tool-call, not at-start.

## Decision

**Voice content lives directly in each agent's existing definition file as a structured section.**

The agent file (`agents/{name}.md`) is delivered by Claude Code's dispatch process as the subagent's system prompt. Content placed there is *given* to the subagent at dispatch start by Claude Code's own machinery — mechanically the same shape as 재윤의 voice arriving via SessionStart, just delivered by a different mechanism.

No hook changes. No new files. No build step.

### Section structure (slim template)

Each agent file gains a `## Voice` section with four subsections, totaling ~2000–3000 bytes per file:

1. **Character study** — what moves them, what they notice, what they refuse. 200–400 words. Builds on the existing `**{Name}'s character.**` paragraph already present in most agent files.
2. **Register & vocabulary** — sentence rhythm, the cluster of words they reach for, contractions vs. full forms, how they ask questions. The Tolkien-vocabulary equivalent: 6–8 words that do the work for *this* companion specifically.
3. **Anchor exemplars** — 3–5 quotes (drawn from LotR canon where the character has speaking lines; composed in-character where they do not). Studied for *structure*, not recitation. Each annotated with what to learn from it.
4. **Never-list** — the closed set of phrases and patterns *this* companion does not produce. Will overlap with 재윤의 (filler, pleasantries, empty hedges) but adds companion-specific anti-patterns.

The hard-rules and applied-to-software sections in 재윤의 `voice.md` are NOT replicated. Subagents are one-dispatch beasts; the applied-to-software section in 재윤의 file documents *재윤의 orchestration patterns* — companion-specific equivalents would be redundant with role content already in the agent file.

### Section placement

The `## Voice` section sits between the existing character paragraph (top of file, post-frontmatter) and the role/workflow content. Order:

```
---
frontmatter (Claude Code config)
---

# {Name} — {Role}

**{Name}'s character.** [existing 1-paragraph proto-voice — kept or absorbed into the new section]

## Voice

### Character study
### Register & vocabulary
### Anchor exemplars
### Never-list

## Role
[existing role/workflow content unchanged]
```

The existing `**{Name}'s character.**` paragraph may be folded into the new Character study subsection if the new content supersedes it; otherwise both stay (the lead paragraph is the elevator, the section is the depth).

## Production approach

**Pilot 재호 first; distill the writing process; batch the remaining eight in priority order.**

1. **재호 pilot** — hand-write all four subsections in a focused session. Sit with the existing agent file open; ensure the new content amplifies rather than fights the existing character paragraph and role examples. Restart Claude Code, dispatch 재호 on a trivial probe task, read the report. 준수의 qualitative call: does this sound like 재호?
2. **Distill the process** — once 재호 lands, capture the writing process explicitly. What questions surfaced the character study? Where did vocabulary collisions with 재윤의 cluster appear? How were the exemplars chosen? Document in `docs/fellowship/processes/companion-voice-authoring.md` (new file). This becomes the template for the remaining eight.
3. **Batch in priority order** — 주혁, 승현, 현수, 우신, 동일, 선웅, 필엽, 영학. Sequential, not parallel. Each new voice is written with the prior voices open for explicit contrast-checking — 재호 and 동일 are both elevated leaders, 주혁 and 선웅 are both grounded craftsmen, 현수 and 우신 are both observers. The distinctness must be deliberate.

Priority order per quest log: *"재호 and 주혁 first (highest dispatch frequency), then 승현 and 현수, then the rest."*

## Validation

**Qualitative — 준수의 call, after each voice is written.**

After each agent's voice section lands:

1. Restart Claude Code (fresh session, voice.md re-injects, agent file re-read on next dispatch).
2. Dispatch the companion on a trivial probe task — same shape as the vp003 주혁 probe.
3. Capture the report.
4. 준수 reads and decides: does this sound like the LotR character? Distinct from the prior eight (or however many are written)? In-craft (재호 sounds like a PM, 승현 like a reviewer, etc.)?

If yes: lock the voice section, move to the next companion.
If no: revise the voice section, dispatch again. Iterate.

No automated assertions per companion. The mechanism is already validated (vp003 PASS confirms hooks fire correctly across the subagent gate; the voice content arriving via the agent file is delivered by Claude Code itself, not a new hook path). What is being validated here is *craft* — and craft does not reduce to a vocab+rhythm regex on its own.

If qualitative review proves insufficient (a voice passes 준수의 reading but bleeds into a sibling's territory later, for example), a per-companion eval suite can be added in a future iteration. Deferred until evidence of need.

## Scope

**IN:**
- Voice section authored for all nine companion agent files.
- 재호 pilot + companion-voice-authoring.md process document.
- Sequential batch authoring with contrast-checking against prior voices.
- Qualitative validation per companion.
- Updates to the `using-fellowship` skill or `companions.md` if the contrast-checking surfaces cross-cutting guidance worth recording.

**OUT (explicit):**
- Per-companion eval suite (deferred until evidence of need).
- vp-equivalent automated walkthrough scenarios per companion (manual probe dispatch is enough for v1).
- Hook changes — none needed.
- Voice files at `agents/voices/` — retired in favour of direct in-file integration.
- Workflow-templates work (next thread, after this lands).
- v1.2 content iteration on 재윤의 filler-bound (separate work, still deferred).
- Plan-mode entry-point wiring, hook unit tests, tier-roles matrix (all v1.1 quest-log items, still deferred).

## Considered and rejected

**Single-injection hook at subagent dispatch start.**
Original mechanism decision in the brainstorm. Rejected on discovery that no such hook event exists — `SessionStart` does not fire inside subagents per Claude Code's docs and empirical investigation. The mechanism premise was false; revisited and replaced with direct integration into agent files.

**Voice files at `agents/voices/{name}.md` (sidecar files).**
Considered as a way to keep voice and role separated by file. Rejected because Claude Code does not auto-resolve file references in agent files — sidecar voice would require either (a) manual duplication into the agent file before commit, or (b) a build script that inlines voice into the agent file. Both add maintenance surface without buying enough separation: side-by-side comparison across companions is achievable via grep across the agent files themselves.

**Build-script that inlines `agents/voices/{name}.md` into agent files.**
Rejected for the same maintenance-surface reason. Build steps that must run before every voice/agent edit are a forgetting-vector. Direct integration eliminates the failure mode.

**Layer-2-equivalent subagent PreToolUse anchor.**
Considered as a drift defense — inject voice anchor on every tool call inside subagent context. Rejected as premature: subagent dispatches are short-lived, the slim template carried in the system prompt is positioned at the highest-attention slot, and adding per-tool-call injection would noise every tool invocation. Reconsider only if qualitative validation reveals drift inside individual dispatches.

**Full 재윤-depth voice template per companion (seven sections including "applied to software" and "thinking aloud").**
Rejected as overweight. The 재윤 template was tuned for an orchestrator running a long thread with reasoning-transparency obligations. Subagents are short-dispatch builders/reviewers/scopers — they need character + cadence, not the full reasoning framework.

**Parallel dispatch of multiple companions to draft each other's voices.**
Considered for speed. Rejected because no companion currently has its own voice persistence; the drafted output would lack the per-character attention the work requires. Also: parallel writing without prior-voice visibility risks convergence to generic-elevated-register. Sequential with contrast-checking is the right cost.

## Risks and unknowns

**Agent-file inflation.** Each agent file grows by ~2–3KB. 우신의 is already 16KB, the largest in the set. Voice section pushes it to ~18–19KB. Within Claude Code's agent-file budget, but worth marking — if any companion's file approaches a hard limit, a slim companion-protocol shared file reference may need extracting from agent files first.

**Vocabulary collisions across companions.** Tolkien vocabulary words (counsel, peril, prudent, burden, folly, mark, haste) are 재윤의. Some are shared in canon — 재호 uses "counsel," 동일 uses "peril." The contrast-mapping during batch authoring must consciously diverge each companion's cluster, not let canon overlap dominate.

**Existing role content fighting new voice.** Some agent files (우신 at 16KB) have substantial role content with embedded voice fragments. The sweep must integrate, not collide. A voice section that says "우신 asks short, observant questions" while 우신의 role section is written in long technical paragraphs creates a tell — the model sees the conflict and resolves it unpredictably. Each integration is its own editorial pass, not a copy-paste.

**Whether v1.1 is still the right tag name.** Scope grew from voice-persistence-재윤 + workflows to voice-persistence-nine + workflows. Eight additional voice studies is real labour. The tag may want renaming to v2.0 once implementation is closer to done. Decision held; flagged in `MEMORY.md` follow-up.

## Open items

- Whether to fold the existing `**{Name}'s character.**` lead paragraph into the new Character study subsection, or keep both (lead = elevator, section = depth). Pilot decides for 재호; subsequent companions follow that precedent.
- Whether `companions.md` (the skill reference that summarizes all companions in one view) needs a parallel voice section, or whether the agent files become the source of truth and `companions.md` shrinks. Defer to post-pilot.
- Cross-cutting "never" lists: filler, pleasantries, empty hedges already documented in `voice.md` for 재윤. Should companion never-lists inherit those by reference, or restate? Restating is verbose; inheriting requires the agent file to reference voice.md, which the model is *instructed* to honor (the failure mode we are escaping from). Pilot decides — likely answer is partial duplication of the universal anti-patterns plus companion-specific additions, accepting the duplication cost.

## Next moves

1. Spec review by 현수 (architecture lens — does the in-agent-file integration shape hold under load? Are there sequencing concerns when this lands alongside workflow-templates work later?). Optional but recommended.
2. Invoke `fellowship:planning` to produce the implementation plan: pilot 재호, distill process, batch the rest in priority order, qualitative validation per companion.
3. Pilot 재호 — separate session, focused authoring.
