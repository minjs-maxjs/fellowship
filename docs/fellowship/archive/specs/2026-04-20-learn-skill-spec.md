# Spec: `skills/learn/` — Memory Curation

**Defined:** 2026-04-20
**Author:** 재호 (product)
**Builder:** 주혁 (next)

---

## Goal

Surface the per-agent native memory that accumulates across sessions in `.claude/agent-memory/fellowship-*/` so 준수 can review it, prune what is stale, and export a clean snapshot when he wants one. Dual-mode: user-invocable via `/fellowship:learn`, and 재윤-loadable when memory grows stale or 준수 asks "what do you remember?"

**The skill does not modify companion memory directly.** It reads, presents, and proposes. 준수 approves any deletion or edit. Memory is the companions' journal — the skill is a curator, not an author.

## Why this skill exists

- Per-agent memory (`.claude/agent-memory/fellowship-jaeyun/`, `fellowship-juhyeok/`, etc.) grows silently. Entries from two months ago may contradict current practice, reference deleted files, or simply no longer matter. There is no current way to see all of it in one place.
- 준수 sometimes asks "what do you remember about X?" or "have we solved this before?" Today each agent answers from its own memory in isolation. A cross-agent view is load-bearing at those moments.
- Memory hygiene is cross-cutting. Every companion writes to `.claude/agent-memory/fellowship-{agent}/`. One curation skill serves all.

## Scope

### In scope

- Read and surface all memory across `.claude/agent-memory/fellowship-*/` directories, grouped by agent.
- Four actions: **review** (show recent), **prune** (flag stale/contradictory, propose deletions), **export** (write a readable snapshot), **summarize** (collapse long-running entries into one).
- User-invocable via `/fellowship:learn` (and sub-commands: `/fellowship:learn prune`, `/fellowship:learn export`).
- 재윤-loadable when: 준수 asks "what do you remember?" / memory file count crosses a threshold / 재윤 notices memory referenced in a stale way during orchestration.
- Respect the companion memory format already in use — `MEMORY.md` index + per-memory files with frontmatter (name, description, type). Do not re-invent.

### Out of scope

| Excluded | Reason |
|---|---|
| Writing new memory entries on companions' behalf | Memory is each agent's journal. The curator does not forge entries. If 준수 wants to add something, he tells the agent. |
| Deleting memory without approval | User sovereignty. Skill proposes, 준수 approves. Every time. |
| Global (cross-project) memory management | Fellowship memory is per-project via `.claude/agent-memory/`. Out of scope for v1. |
| Telemetry, session preambles, branch-awareness | gstack's `/learn` carries all of this. None is ours. |
| Learnings as a separate concept from memory | gstack has a JSONL learnings store (`~/.gstack/projects/*/learnings.jsonl`) distinct from memory. We do not. Our companions already use native memory — that is the single source. |
| Automatic pruning on a schedule | Pruning is a 준수-initiated act. No daemons, no background writes. |

### Deferred (v2 candidates)

- **Semantic search** — "show me memories about auth decisions" would require grepping descriptions across agents. Possible in v2 if review-by-agent turns out to be insufficient.
- **Diff view** — "what memory has changed in the last 7 days" — file mtimes make this cheap. Add if 준수 finds himself asking the question.
- **재윤 auto-nudge** — the skill as 재윤-triggered today is reactive (재윤 loads it when it seems needed). A true auto-nudge ("memory has grown 40% since last review") can come later.

## Skill frontmatter

```yaml
---
name: learn
description: "Review, prune, export, or summarize per-agent memory across the Fellowship. Use when 준수 asks 'what do you remember?', when memory references feel stale, or on explicit /fellowship:learn invocation. Curator only — never modifies memory without 준수의 approval."
user-invocable: true
trigger: /fellowship:learn
---
```

Notes for 주혁:
- Matches `codebase-map` shape exactly (`user-invocable: true` + `trigger: /fellowship:...`). See `skills/codebase-map/SKILL.md` lines 1–6.
- The description must cover both invocation paths: user slash-command AND 재윤-auto-load. 재윤 needs enough signal in the description to know when to pull it in.
- Sub-commands (`prune`, `export`, `summarize`) are parsed from the user's message inside the skill, not encoded in frontmatter.

## Section outline

Target: **140–180 lines.** Four action modes keep this larger than `investigate` but still under the 200-line ceiling.

### 1. What this skill does (8–12 lines)

One paragraph: curator for per-agent memory. Reads `.claude/agent-memory/fellowship-*/`. Proposes changes. 준수 approves.

State the hard rule plainly: **the skill never modifies a companion's memory without explicit 준수 approval.**

### 2. Memory layout — what you are reading (10–15 lines)

A reminder of the structure 주혁 needs to read/write:

```
.claude/agent-memory/
  fellowship-jaeyun/
    MEMORY.md              # index
    user_karolus.md        # individual memory file
    feedback_xyz.md
    ...
  fellowship-juhyeok/
    MEMORY.md
    ...
```

Each individual file has frontmatter (`name`, `description`, `type`). `MEMORY.md` is a flat index of one-line pointers. Types: `user`, `feedback`, `project`, `reference`.

Point the builder at the canonical memory-format description which lives inside each agent's system prompt (e.g., `agents/jaeyun.md` "Persistent Agent Memory" section). Do not redefine the format.

### 3. Detect the command (5–8 lines)

Parse the user's invocation:

- `/fellowship:learn` → **Review** (default)
- `/fellowship:learn prune` → **Prune**
- `/fellowship:learn export` → **Export**
- `/fellowship:learn summarize` → **Summarize**

If loaded by 재윤 (not via slash command): default to **Review** unless 재윤의 loading context names a different mode.

### 4. Review (default mode — ~20 lines)

- Walk each `.claude/agent-memory/fellowship-*/` directory.
- For each agent, list: agent name, total memory count, and the 5 most recently modified entries (name + description line from frontmatter).
- Group by agent. Do not merge across agents — each companion's voice is preserved.
- Flag obvious concerns inline: "3 of 주혁의 12 memories reference files that no longer exist."
- Output is conversational, not a file. 준수 reads it, decides what to do next.

### 5. Prune (~25–30 lines — the longest section)

Two checks:

1. **File-existence check.** If a memory file mentions a path (in its content), confirm the path exists. Missing file = flag `STALE`.
2. **Contradiction check.** Scan for memories on the same topic with contradicting guidance (e.g., two `feedback` entries where one says "always X" and a later one says "never X"). Flag `CONFLICT`.

For each flagged entry, present the content and ask 준수 via AskUserQuestion:
- A) **Remove** — delete the file, remove from MEMORY.md
- B) **Keep** — do nothing
- C) **Edit** — 준수 tells me what to change; I propose the diff; he approves again before the write

After 준수 answers for one entry, move to the next. Do **not** batch-apply. One decision at a time.

When removing: delete the memory file, then update `MEMORY.md` to drop the pointer. If `MEMORY.md` ends up empty, leave the header but clear the pointers — do not delete the index itself.

### 6. Export (~15 lines)

Write a consolidated, human-readable snapshot of all memory to `docs/fellowship/memory-snapshot-YYYY-MM-DD.md`.

Format:

```markdown
# Fellowship Memory Snapshot — YYYY-MM-DD

## 재윤
### User
- [name] — [description]
  [body]

### Feedback
- ...

## 주혁
...
```

Group by agent, then by memory type (`user`, `feedback`, `project`, `reference`). This file is a read-only snapshot, useful for sharing, reviewing offline, or diffing against a future snapshot.

Does not modify live memory. It is a dump.

### 7. Summarize (~15–20 lines)

When an agent has accumulated many memories in one type (e.g., 8 `feedback` entries from 주혁), offer to collapse them into a single richer entry.

- Surface the candidate cluster to 준수.
- Show the proposed consolidated entry.
- Ask for approval before writing.
- If approved: write the new consolidated memory file, delete the old ones, update `MEMORY.md`.

This is the most destructive mode. Be conservative. Default to offering it only when >5 memories share a type for one agent.

### 8. 재윤 auto-load signals (5–8 lines)

Short note to 재윤: load this skill when
- 준수 asks "what do you remember?" / "what have we learned?"
- 재윤 notices a memory reference is stale mid-orchestration.
- Cross-project: 준수 explicitly invokes `/fellowship:learn`.

Do **not** load proactively on every session. That is noise.

### 9. Principles (5–8 lines)

Short list:
- Memory is the companion's journal. The curator proposes; 준수 decides.
- One change at a time. Never batch deletes.
- Preserve voice. Each agent's memory stays with that agent — exports group by agent, never merge.
- Additive over destructive. Export and summarize before prune.

## Prescriptive style notes for the builder

- **Frontmatter matches `codebase-map`.** Read `skills/codebase-map/SKILL.md` lines 1–6 and copy the shape. Do not improvise.
- **No character voice in the skill file.** The agents own voice; skills are prescriptive.
- **No AI filler.** Same discipline as `investigate`.
- **Commands run via standard tools.** `Read`, `Glob`, `Write`, `Edit`, `AskUserQuestion`. No bash-heavy preambles, no telemetry. Keep the tool list minimal. (Our project does not gate skill tools via frontmatter the way gstack does — tools are inherited from the caller.)
- **No emojis.**

## Open questions for 준수

1. **Export location.** Proposing `docs/fellowship/memory-snapshot-YYYY-MM-DD.md`. Alternatives: `.claude/agent-memory/_snapshots/` (lives with memory but hidden) or `docs/fellowship/snapshots/` (versioned, visible). *Counsel: `docs/fellowship/` — snapshots are for reading, not for the agents.*
2. **MEMORY.md after deletion.** When the last memory of an agent is deleted, do we delete `MEMORY.md` or leave the empty index? *Counsel: leave the empty index. Deleting it would signal "this agent has never remembered anything," which is false and confusing next session.*
3. **The summarize action — ship in v1 or defer?** It is the most destructive mode and also the least proven. Reasonable to defer to v2 and see whether 준수 actually needs it. *Counsel: defer. Ship review + prune + export in v1. Add summarize when a real memory-accumulation problem appears.*
4. **Do we gate 재윤의 auto-load behind any threshold?** E.g., "only load when total memory exceeds N entries." *Counsel: no threshold in v1. 재윤의 judgment on load is part of his voice — trust it. Add a threshold only if over-loading proves to be a real problem.*

## Acceptance criteria (for 승현 to verify)

- [ ] File exists at `skills/learn/SKILL.md`.
- [ ] Line count ≤200.
- [ ] Frontmatter includes `name`, `description`, `user-invocable: true`, `trigger: /fellowship:learn`.
- [ ] Four modes documented: review (default), prune, export, summarize — unless summarize is deferred per open question 3.
- [ ] Review mode groups output by agent, does not merge across agents.
- [ ] Prune mode requires 준수 approval on each entry; no batch deletions.
- [ ] Export mode writes to `docs/fellowship/memory-snapshot-YYYY-MM-DD.md` and does not modify live memory.
- [ ] Skill does not invent a new memory format — references the existing one documented in agent system prompts.
- [ ] 재윤 auto-load signals listed explicitly.
- [ ] No character voice, no AI vocabulary, no emojis.
