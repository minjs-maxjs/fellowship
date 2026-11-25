# The Fellowship

A LotR-themed multi-agent system for solo product development. Built as a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin.

You are 주인공. You carry the Ring — your product, your vision, your burden. The Fellowship exists to serve you on the quest.

## How it works

Open Claude Code in a project. 민준수 is already there. Before he writes a line, he reads the state of the repo — what you're building, what's open, where things stood when you last left off. *"Where shall we begin?"* he asks, and means it.

When you give him a task, he weighs it. A typo fix is a Tier 1 — he handles it himself. A new component is Tier 2 — he loads a skill or sends one companion. A multi-file refactor is Tier 3 — companions work in sequence. A whole feature is Tier 4 — 재호 first reviews the scope, then companions work in parallel. 민준수 is conservative; he never summons the full Fellowship when one will do.

Every companion has a craft. 재호 defines *what* to build. 현수 decides *how*. 주혁 builds it. 승현 reviews it. 동일 guards it. 우신 tests it. 선웅 ships it. 필엽 designs the surface. 영학 writes it down. They each have scoped tools, persistent memory, and a voice you'll come to recognize.

When 주혁 builds on a critical path, 승현 reviews. If issues surface, 주혁 fixes — 승현 re-reviews — repeat until approved. The cycle runs to completion; the work is worthy or it doesn't ship. *"That still only counts as one!"*

## Install

```
/plugin marketplace add minjs-maxjs/fellowship
/plugin install fellowship@fellowship
```

Open Claude Code in any project. 민준수 greets you and reads the state of the repo before anything else.

- **Fresh project:** he bootstraps `docs/fellowship/` and asks *"What are we building, and who is it for?"*
- **Existing project:** he picks up the thread from the quest log.

**Mid-session shortcuts:**

- `/fellowship:start` — 민준수 reads the repo and asks where to begin (also fires automatically on session start)
- `/fellowship:jaeho`, `/fellowship:hyeonsu`, `/fellowship:juhyeok`, `/fellowship:seunghyeon`, `/fellowship:dongil`, `/fellowship:usin`, `/fellowship:seonung`, `/fellowship:pilyeop`, `/fellowship:yeonghak` — load a specific companion's craft directly
- `/fellowship:brainstorming`, `/fellowship:planning`, `/fellowship:investigate`, `/fellowship:learn` — load a cross-cutting workflow skill
- `/fellowship:map`, `/fellowship:accessibility`, `/fellowship:ux-audit`, `/fellowship:using-worktrees` — codebase mapping, a11y audit, UX audit, parallel-worktree workflow

**Verify the install:** start a fresh Claude Code session in any project. 민준수 greets you in voice and reads the repo before doing anything else. If he doesn't, the plugin isn't loaded.

**Updating:**

```
/plugin update fellowship
```

## The Fellowship

Ten companions walk beside you. Each carries a distinct purpose — no two share the same blade.

| | 이름 (Name) | 역할 (Role) | 이 캐릭터를 배정한 이유 (Why this character) |
|---|---|---|---|
| 🧙 | **민준수** | 오케스트레이터 (Orchestrator) | KCI 임무대를 결성하고 갈 길을 정했으며, 언제 이끌고 언제 물러나야 할지 알았던 인물(민준수). 작업을 분배하고 복잡도를 분류하며, 사소한 일은 직접 처리합니다. |
| 👑 | **재호** | 프로덕트 매니저 (Product Manager) | 민준수의 오른팔(양재호) — 가장 어려운 결정을 내렸고, 다른 길이 남지 않았을 때 끝까지 우리를 지켜냈습니다. *무엇을*, 그리고 *왜* 만들지 결정합니다. |
| 🍺 | **현수** | 테크니컬 아키텍트 (Technical Architect) | 가장 학구적인 연구자 — 언제나 탐구하고 공부하며 연구소로 이직했습니다. *어떻게* 만들지 결정합니다. |
| 🪓 | **주혁** | 엔지니어 (Engineer) | 가장 처음 새로운 길을 개척해 내었습니다. 이주혁은 제일 먼저 이직한 사람입니다. 새로운 기능, 새로운 코드, 새로운 시스템을 구축합니다. |
| 🏹 | **승현** | 코드 리뷰어 (Code Reviewer) | 결코 놓치는 법이 없는 천재의 눈(배승현) — 미래의 위협을 포착하고, 외국계 대기업으로 이직하였습니다. 명세 준수 여부와 품질을 기준으로 코드를 리뷰합니다. |
| 🗡️ | **동일** | 보안 엔지니어 (Security Engineer) | 평생 KCI를 수호해 주는 인물(이동일). 문 하나를 경계하지 않고 비워 두었을 때 어떤 대가를 치르는지 누구보다 잘 압니다. |
| 🍄 | **우신** | 테스트 엔지니어 (Test Engineer) | 모든 위험 상황을 파악하고 있으며 본능적으로 위험을 피할 수 있는 인물(우신). 엉뚱해 보이는 호기심이 신중한 이들이 놓치는 허점을 찾아냅니다. |
| 🌻 | **선웅** | 데브옵스 / 인프라 (DevOps / Infrastructure) | 백 엔드(Bag End)의 정원사(선웅) — 다른 이들이 자라날 수 있도록 흙을 가꾸고, 매우 강한 힘으로 보급선을 유지했습니다. 화려하진 않지만 다른 모든 것이 살아 움직이게 만드는 기반 작업을 맡습니다. |
| 🌟 | **필엽** | 프로덕트 디자이너 (Product Designer) | KCI의 깃발을 수놓은 인물(이필엽) — 민준수가 왕권을 주장하기 전부터 그의 정체성을 디자인했습니다. 시각 언어와 사용자 흐름을 설계하고, UX·접근성·스타일 측면에서 완성도를 검수합니다. |
| 📖 | **영학** | 테크니컬 라이터 (Technical Writer) | 누구보다 논리적인 인물(고영학). 외로운 KCI 원정을 다시 수행할 수 있도록 지도를 만들었습니다. 명확한 글쓰기 역시 엔지니어링의 한 형태입니다. |

> *You (주인공) are the eleventh. You carry the weight. You make the final call. The Fellowship serves the Ring-bearer.*

## Architecture

**Skills** are cross-cutting workflow patterns — methodology any agent or the user can invoke mid-session. Brainstorming, planning, accessibility audits, codebase mapping, investigation.

**Agents** are self-contained companions. Each agent's craft methodology lives inline in their agent file — character, role, craft, behavioral contracts, and reporting format in one document. No cross-referencing, no drift.

민준수 is the orchestration skill loaded at session start by a SessionStart hook. The nine companions are agents.

### Tiered Routing

민준수 classifies every task by weight before assembling the party.

| Tier | What happens | Overhead |
|------|-------------|----------|
| **1** | 민준수 handles it alone | None |
| **2** | 민준수 loads a skill or dispatches one agent | Minimal |
| **3** | Sequential chain — agent output feeds the next | ~3-5 min |
| **4** | 재호 consulted on scope, then parallel agents | ~8-15 min |

민준수 is conservative — a solo dev's time is precious. Borderline cases err toward the lower tier. Before Tier 4 work, 민준수 consults 재호; scope that seems necessary in the moment often isn't.

### The Review Cycle

When 주혁 builds on critical paths (auth, payments, data mutations, public APIs), 승현 reviews. Inspired by [Superpowers](https://github.com/obra/superpowers)' subagent-driven-development.

```
민준수 → 주혁 builds, reports DONE
  → 민준수 dispatches 승현 to review
    → IF issues found:
        주혁 stays alive via SendMessage, fixes, reports DONE
        → 승현 re-reviews
        → repeat until approved
    → approved → task complete
```

- 민준수 decides whether to dispatch 승현 — not all work needs review.
- 승현 never edits code — findings flow back through 민준수 to 주혁.
- Once review starts, the cycle runs to completion.

Findings are categorized **Critical** (bugs, security, data loss), **Important** (architecture, missing features, test gaps), or **Minor** (style, optimization, docs).

### Agent Tool Scoping

Each agent gets only the tools they need.

| Agent | Tools | Why |
|---|---|---|
| **주혁** | Read, Write, Edit, Glob, Grep, Bash | Full implementation |
| **승현** | Read, Glob, Grep, Bash | Pure reviewer — never edits |
| **동일** | Read, Glob, Grep, Bash | Security audit — never modifies |
| **우신 / 선웅 / 영학 / 필엽** | Read, Write, Edit, Glob, Grep, Bash | Create and update artifacts |
| **재호 / 현수** | Read, Write, Glob, Grep, Bash | Create requirements and architecture docs |
| **필엽** | + Figma MCPs | Design artifact manipulation |

### Project Memory

The Fellowship remembers across sessions. `docs/fellowship/quest-log.md` carries the thread; per-agent memory accumulates domain knowledge; feedback you give a misbehaving companion silently becomes new eval scenarios for AutoImprove.

## What runs on your machine

The Fellowship is a local plugin — no network calls, no external services. When active, hooks fire on every Claude Code session in this project. 영학 would have you know exactly what runs, and when.

- **SessionStart** — fires on `startup`, `clear`, `compact`, and `resume`. Four hooks run in order:
  - `hooks/session-start` — reads `docs/fellowship/*.md` (quest-log, product context, debug-log, handoffs, codebase-map) and injects them into the model's context.
  - `hooks/fellowship-voice-session-start.mjs` — injects the voice persistence layer so 민준수 and the companions hold their register across long sessions. Single-layer since 2026-06-11: the per-turn UserPromptSubmit re-anchor was removed (it could not push past the additive-prompting ceiling the evals measured), so this SessionStart injection is the sole voice mechanism.
  - `hooks/fellowship-opener-session-start.mjs` — on second and later sessions, surfaces a short orientation derived from `git log -5`, the top open quest-log items, and in-flight project memory. First session is skipped (gated by a per-project history marker under `~/.claude/fellowship/state/` — never written into your project tree).
  - `hooks/fellowship-drift-check-session-start.mjs` — walks the top level of `docs/fellowship/` once per session and surfaces any files or folders outside the canonical tree.
- **PreToolUse** (`hooks/fellowship-plan-gate.mjs`) — runs on every `Edit`, `Write`, and `MultiEdit` tool call.
- **PostToolUse** (`hooks/fellowship-context-monitor.mjs`) — runs after every tool call to monitor context pressure.
- **SessionEnd** (`hooks/fellowship-session-end.mjs`) — runs when the session closes. Reconciles companion status frontmatter against repository state, sweeps any artifact marked `status: reviewed` into `archive/<type>/`, keeps `quest-log.md` under 50 entries (oldest 25 spill to `quest-log-archive.md`), and prints one summary line. The full design lives in `docs/fellowship/specs/2026-05-24-adr-cluster-d-hooks.md`; the contract it enforces is `docs/fellowship/specs/2026-05-15-project-state-contract.md`.

All hooks are pure-stdlib Node.js or bash. No network calls, no external dependencies. Treat any `.md` file under `docs/fellowship/` as trust-equivalent to your project source code — its content is injected into the model's context on every session start.

The eval harness (`evals/_runner/improve.sh`) invokes `claude --dangerously-skip-permissions` against a throwaway worktree. Do not run it on a repository containing secrets you are not willing to expose to a fully-permissioned Claude session.

## Known Limitations

**Coexistence with other identity-injecting plugins.** Fellowship's SessionStart hook injects a strong "you are 민준수" identity wrapper. If another orchestrator-as-skill plugin (Superpowers, GSD) is also active, both injections fire and the model receives competing personas. Mitigation: enable only one orchestrator plugin per Claude Code installation. Skill-only and agent-only plugins coexist cleanly.

## AutoImprove

A self-improvement loop for agent instruction files. Each agent has an eval suite (`scenarios.jsonl`, `holdout.jsonl`, `hard.py`, `soft.md`). The runner invokes fresh Claude instances per scenario, measures pass rate, proposes one change per cycle, commits improvements or reverts failures. A separate holdout set validates against overfitting.

```bash
./evals/_runner/improve.sh juhyeok --cycles 15
./evals/_runner/improve.sh --all --cycles 15  # ~3-5 hours
```

Currently covers all nine companions (재호, 현수, 주혁, 승현, 동일, 우신, 선웅, 필엽, 영학) plus 민준수 and a `voice-persistence` suite that exercises the voice hook end-to-end. Outer loop on Sonnet, inner workers on Haiku — ~$0.60–$1.50 per 15-cycle run, originally measured per single-agent target; the per-run figure should hold per target but `--all` runs scale linearly across twelve suites. Scope guardrail: the loop modifies only `agents/<target>.md` and `evals/<target>/`.

## Compared to Superpowers

The Fellowship is inspired by [Superpowers](https://github.com/obra/superpowers) (MIT) and adapts it for solo product development.

| Capability | Superpowers | Fellowship |
|---|---|---|
| Workflow skills | ✅ Mature, proven | ✅ Ported and extended |
| Specialized agents | 1 (code-reviewer) | 10 (scoped tools + memory) |
| Code review cycle | Two-stage, every task | Combined single-pass, 민준수의 judgment per task |
| Product / Security / Design / Docs / DevOps | — | ✅ 재호 / 동일 / 필엽 / 영학 / 선웅 |
| Project memory | — | ✅ Persistent across sessions |
| Agent memory | — | ✅ Domain-specific accumulation |
| Tool scoping | All to all | Scoped per agent |
| Identity | Generic skill names | Memorable characters, themed commands |

## Principles

- **The Ring must not grow heavier.** Scope is sacred. Every addition is a burden.
- **Not every quest needs the full Fellowship.** Most tasks need one companion, maybe two.
- **Agent craft lives in the agent.** Each agent is a complete document. Skills are for cross-cutting patterns.
- **Insight flows forward.** Each agent's output feeds the next — no work is lost.
- **Memory endures.** Key decisions persist across sessions.
- **Latency is the enemy.** Default conservative. Escalate only when the task demands it.
- **Start with 민준수.** Add agents one at a time, only when you feel the gap.

## Status

v1.0.0. All ten companions built; triple-audit passed before tag. The thing to validate now is real-project orchestration — finding the gaps that only appear when the stakes are real.

Battle-tested on Fellowship's own development; actively seeking feedback from first real-project users.

Research, design notes, and source list at [`docs/fellowship/research.md`](docs/fellowship/research.md).

## Feedback

Issues, ideas, and orchestration gaps welcome at [github.com/minjs-maxjs/fellowship/issues](https://github.com/minjs-maxjs/fellowship/issues). Real-project usage reports are especially valuable — the gaps that only appear when the stakes are real are exactly what v1.1 needs to find.

## Developers

- **wta**
- **민준수** — [github.com/minjs-maxjs](https://github.com/minjs-maxjs)

## License

MIT
