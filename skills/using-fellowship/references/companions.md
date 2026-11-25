# Companions

Each companion is an **agent** file (`agents/<name>.md`) with a thin `/fellowship:<name>` slash-command pointer in `commands/`. Loading the slash command surfaces the agent's craft — character, methodology, report format — into the current session without a dispatch; dispatching the agent runs the same craft in an isolated subagent context. Only 민준수 is the orchestrator skill (`skills/using-fellowship/`); the other nine companions are not dual skill+agent — the slash command is a convenience pointer, not a separate skill definition.

| Companion | Role | Skill (in session) | Agent (dispatched) |
|---|---|---|---|
| **재호** | Product Manager | `/jaeho` — product thinking, scope, requirements | Independent PRD analysis, requirement docs |
| **현수** | Technical Architect | `/hyeonsu` — system design, tradeoffs, data modeling | Independent architecture design |
| **주혁** | Engineer | Engineering standards reference | Implementation, building features |
| **승현** | Code Reviewer | `/seunghyeon` — quick code review lens | Review 주혁의 work for spec compliance + quality |
| **동일** | Security Engineer | `/dongil` — security review lens | Full security audit |
| **우신** | Test Engineer | `/usin` — testing methodology | Write and run tests |
| **선웅** | DevOps / Infrastructure | `/seonung` — infrastructure thinking, deployment, CI/CD | Pipeline setup, environment config, deployment automation |
| **필엽** | Senior Product Designer | `/pilyeop` — design thinking, design contract | Design Contract, UX audit, accessibility, Figma work, visual exploration |
| **영학** | Technical Writer | `/yeonghak` — documentation lens | README, changelog, inline docs, API reference |

**Skills enhance agents.** Multiple agents can load the same skill. 주혁 building UI loads the design skill. 승현 reviewing auth code loads the security skill.

## Skill hooks

- **User describes a bug** ("X is broken", "Y isn't working", "this keeps failing") → dispatch 주혁 with `fellowship:investigate` loaded. Investigation precedes fix.
- **User asks what you remember, or memory feels stale** ("what do you know about X", "have we done this before", "what did we decide about Y") → load `fellowship:learn` in session before responding.

## Project-Local Skills and Agents

At session start, the hook surveys `.claude/skills/` and `.claude/agents/` in the project root. If present, they surface in the `<PROJECT_LOCAL>` context block — you will see the inventory before any dispatch.

**Precedence on name collision: project-local wins.** If a project has `.claude/skills/planning/` and the plugin has a `planning` skill, the project's version is used. The project owner knows what they need better than the plugin does.

**When to load a project-local skill:** whenever you would have loaded the plugin version. The decision is the same; the source differs.

**What not to do:** do not assume the plugin set is complete. If a project has its own `.claude/agents/auth-specialist.md`, that is the intended dispatcher for auth work on that project — not 주혁 with generic auth instructions. Read the project-local agent file before routing.

## Model Routing

Pass a `model` parameter at dispatch based on the companion's role. Principle: companions following structured checklists run on sonnet; companions making judgment calls inherit the user's model.

| Companion | Default | Use `inherit` when | Use `sonnet` when |
|-----------|---------|-------------------|------------------|
| 주혁 | inherit | New features, critical paths, complex logic | Simple fixes, config changes, established patterns |
| 승현 | sonnet | Reviewing complex architecture decisions | Standard code review (most dispatches) |
| 우신 | sonnet | Complex test infrastructure setup | Writing tests from specs (most dispatches) |
| 현수 | inherit | Always — architecture decisions need strong reasoning | — |
| 재호 | inherit | Always — product strategy needs nuance | — |
| 동일 | sonnet | Novel security concerns | OWASP checklist audits (most dispatches) |
| 선웅 | sonnet | — | Infrastructure and deployment tasks (all dispatches) |
| 필엽 | sonnet | Greenfield design (Design Contract, new visual direction) | Compliance checks, audits, a11y passes (most dispatches) |
| 영학 | sonnet | — | Documentation passes (all dispatches) |

No frontmatter changes needed — model routing happens at dispatch time via the `model` parameter. Agent files keep `model: inherit` as default.

## Agent Teams compositions

When `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set and Tier 4 with independent streams:

| Scenario | Team | Why Teams helps |
|----------|------|-----------------|
| Parallel review | 승현 (code quality) + 동일 (security) | Two dimensions simultaneously, findings don't overlap |
| Cross-layer feature | 주혁 (backend) + 주혁 (frontend) | File ownership boundaries, parallel build |
| Parallel deployment review | 선웅 (infra) + 동일 (security) | CI/CD and security concerns in parallel before a release |
| Full feature cycle | 주혁 (build) + 승현 (review) | Review starts on early files while 주혁 builds later ones |

**Never default to Teams.** Most Tier 4 tasks are served by parallel subagents.
