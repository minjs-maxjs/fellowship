# Workflows — Named Recipes Above the Cycles

Workflows are named compositions above the atomic cycles in `cycles.md`. Where cycles describe single review/testing/design loops, workflows describe end-to-end shapes of work — *what runs, in what order, with what conditions* — for the kinds of work that recur often enough to deserve a name.

민준수 invokes a workflow when his routing judgment encounters work that is (a) Tier 2 or higher and (b) shaped like one of the recipes named here. Tier 1 (typos, one-liners, two-three line changes) uses cycles alone; no workflow.

Read these as **reference patterns**, not scripts. Each recipe names its canonical shape, the companions involved, the conditional steps, the legitimate variations, and the cases where it is the *wrong* recipe. The recipe inspires the dispatch; it does not dictate it. *"The simplest path that serves the task — that is prudent. The elegant one that serves a future that hasn't arrived — that is folly."*

When 민준수 invokes a workflow, he populates `TaskCreate` with the recipe's canonical sequence upfront — 재호, 현수, 주혁, 승현, 우신, 영학 for `feature-flow`, conditioned to the actual situation (skipped steps get omitted, parallel steps get noted, variations get reflected). The user sees the planned shape before the first dispatch. Adaptations mid-flow update the task list so the visible plan stays current with the actual dispatch.

## Meta-rule

> *"Workflows name companions and modes where the mode is the orchestration move. Workflows do not name skills — each companion's toolkit lives in their agent file."*

Modes are legitimate orchestration moves: 우신의 *test-after*, *test-first*, *browser-verify*; 필엽의 *design-contract* compliance vs. *UX-audit*. Choosing among them affects when the companion runs, what input is needed, and what the next step is. Skill-naming is overreach — when a companion's methodology evolves, no workflow doc should follow.

## Transport

Recipes are transport-agnostic. Every Tier 2+ dispatch in any recipe selects its transport by the deference ladder in `dispatch-transport.md` — no recipe names a terminal, pane, or workspace. Parallel branches (승현 ‖ 동일, multi-track builds) compose through the handoff file contract — brief in, report out, observation by report file — never through transport-specific channels.

---

## `feature-flow`

**Canonical shape.** scope → architecture → build → review → test gaps → docs.

**When this applies.** Tier 2+ new feature, new module, or new capability. Multi-file change with meaningful logic. The user is asking for something the codebase does not yet do.

**Companions.**

| Companion | Step | Enter when… | Skip when… |
|---|---|---|---|
| 재호 | scope | scope is fuzzy, requirements not locked, or risk of scope creep | scope is locked, single well-defined ask |
| 현수 | architecture | a real architectural choice exists (data model, module boundary, interface contract) | architecture is obvious — single file, established pattern, no new boundary |
| 주혁 | build | always | never |
| 승현 | code review | always on Tier 2+ — this is the auto-cycle from `cycles.md` | never; 승현 runs whenever 주혁 reports DONE on meaningful logic |
| 우신 | test gaps | 승현 flags coverage thin, *or* user asked for tests up front (test-first inversion) | 승현 reports coverage adequate and no spec violation |
| 영학 | docs | the work has an external surface — README, changelog, public API | internal-only refactor or behind-the-scenes change |

**Sequence.** 재호 → 현수 → 주혁 → 승현 → (loop 우신 with 주혁 for fixes if needed) → 영학. Each arrow is conditional on the row above.

**Validation contract.** The plan carries a `## Validation Contract` (authored by the planning skill). At the review step, 승현 and 우신 score the assertions tagged with their name — PASS / FAIL / UNTESTABLE with evidence. The contract is part of their dispatch; see *Contract verdict composition* below for how their partial scores close the quest.

**Variations.**
- **Visual design.** 필엽 *before* 주혁 for visual exploration when the work has a user-facing face; 필엽 *after* 승현 for compliance check against her design contract.
- **Test-first inversion.** 우신 → 주혁 → 승현 when the spec can be expressed as failing assertions before any code exists.
- **Mid-build architecture loop.** If 주혁 reports the architecture doesn't hold mid-build, route back to 현수.
- **선웅 early.** When the feature has an infra dependency (Redis, env var, background job), 선웅 surfaces the requirement before 주혁 starts.

**When this is the wrong recipe.** Tier 1 work. Bug-fix work — use `bug-flow`. Pure refactor with no behavior change — same shape works, but 현수 leads, 우신 runs the existing test suite as the contract, 영학 skips.

---

## `bug-flow`

**Canonical shape.** investigate → root cause → fix → review → verify.

**When this applies.** Tier 2+ defect or unexpected behavior. The system is doing something it shouldn't, or not doing something it should. Distinct from `feature-flow` because *investigation precedes everything* — no fix without root cause.

**Companions.**

| Companion | Step | Enter when… | Skip when… |
|---|---|---|---|
| investigate (in-session, 민준수-led) | investigate | always — this is the discipline that distinguishes bug-flow from feature-flow | never; skipping investigation is how the wrong fix gets shipped |
| 우신 | reproducer test | bug can be expressed as a failing assertion; valuable for regression-proofing | bug is visual/UX and not test-expressible — use browser-verify after the fix instead |
| 주혁 | fix | always, *after* root cause is known | never; if no root cause, no 주혁 |
| 승현 | code review | always on Tier 2+ fixes touching meaningful logic | trivial fix path where the diff is one safe line and review-cycle would be ceremony |
| 우신 | verification | always — confirm the reproducer now passes, confirm no regressions | never on Tier 2+; verification is the close |

**Sequence.** Investigation (in-session, optionally with 우신 reproducing) → root cause confirmed → 주혁 fix → 승현 review → (loop fixes if needed) → 우신 verify → close.

**Validation contract.** Where the bug's plan carries a `## Validation Contract` — including the reproducer assertion as a P0 — 승현 and 우신 score the assertions tagged with their name at the review and verify steps. A P0 FAIL from 우신 at the verify step re-opens the close even after 승현의 review passed — the verify-step score gates independently. See *Contract verdict composition* below.

**Variations.**
- **Production incident.** 선웅 in parallel with investigation to surface infra signals — recent deploys, env changes, log volume.
- **Security-adjacent bug.** 동일 leads or co-leads investigation when the defect is or might be a vulnerability. If it is, the work converts to `security-flow` mid-stream.
- **Spec-was-wrong discovery.** If root cause is "spec is wrong," loop to 재호 for scope correction *before* any code change.
- **No reproducer.** UI/UX defects where 우신 reproducer isn't practical — skip the reproducer, use 우신 browser-verify after the fix.

**When this is the wrong recipe.** Trivial defect that can be fixed and verified in one breath. A "bug" that is actually a feature request — the system works as designed but the user wants different behavior — that is `feature-flow`.

---

## `security-flow`

**Canonical shape.** threat-model question → scope → architecture → build → parallel review (승현 + 동일) → reconcile → fix → re-review → verify.

**When this applies.** Work touching auth, payments, secrets, public API surface, data mutations with authorization implications, anything where the security boundary is the architecture. 동일 is the recipe's defining companion — he enters twice, and the parallel review is the recipe's defining move.

**Companions.**

| Companion | Step | Enter when… | Skip when… |
|---|---|---|---|
| 동일 | pre-build consultation | threat model is unclear, the change introduces a new boundary, or the work is greenfield in security terms | the threat model is established (e.g., adding a third OAuth provider to an existing auth system) |
| 재호 | scope | as in feature-flow | scope is locked |
| 현수 | architecture | nearly always in security work — the boundary *is* the architecture, even when the change feels small | one-line CSRF token addition or a similarly narrow patch on an established pattern |
| 주혁 | build | always | never |
| 승현 | code review | always, in parallel with 동일 | never |
| 동일 | post-build review | always, in parallel with 승현 — this is the recipe's defining move | only when the work is audit-only with no build (see variation) |
| 우신 | test gaps | nearly always for security work — threat-case assertions matter | when the security property can't be tested without breaking abstraction barriers, document why |

**Sequence.** Threat-model question (with 동일 if unclear) → 재호 scope → 현수 architecture → 주혁 build → **승현 ‖ 동일** (parallel) → consolidate findings → SendMessage 주혁 for fixes → re-dispatch both reviewers → 우신 verifies threat-case assertions → close.

**Validation contract.** The plan's `## Validation Contract` carries security-property assertions tagged `[동일]`; 동일 scores those in the parallel review, 승현 and 우신 score theirs. See *Contract verdict composition* below.

**Variations.**
- **Audit-only.** Existing code, no build — 동일 audits → findings → 주혁 fixes → 승현 + 동일 re-review. Skips 재호, 현수, the build step.
- **Established threat model.** Skip pre-build 동일 consultation when the boundary is well-understood. Keep the parallel post-build review.
- **Small-scope security patch.** Skip 현수 when scope is narrow on an established pattern. Keep parallel 승현 + 동일.
- **No 우신.** When the security property can't be tested cleanly, rely on 동일의 manual audit as the assurance. Document the why.

**When this is the wrong recipe.** Code that touches no security boundary. Visual changes inside a security-sensitive component that don't change security behavior. A bug *report* in a security-sensitive area starts as `bug-flow` and converts mid-stream only if the investigation surfaces a vulnerability.

---

## Contract verdict composition

When a flow carries a `## Validation Contract`, the validators return partial scores partitioned by the owner-validator tags. 민준수 composes them into the quest verdict by one rule:

> The contract passes when every P0 assertion is PASS with cited evidence and zero P0 assertions are FAIL. An UNTESTABLE on a P0 is an unscored gate, **not** a pass — 민준수 treats it as a hole to close: the assertion is rewritten so it can be scored, or 주인공 accepts the gap explicitly. P1/P2 FAILs and any UNTESTABLE-on-P0 become quest-log entries; P1/P2 do not gate.

This maps onto the existing status vocabulary — no new code. A P0 FAIL is a Critical finding (`CHANGES_REQUESTED` from 승현/동일, a Finding from 우신) routing into the review cycle exactly as today. The rule is mechanical; the scoring is judgment.

## Split trigger

Split into `references/workflows/` (one file per recipe + an index) when either the recipe count passes five or any single recipe passes ~200 lines. Trigger documented so future-us doesn't re-debate.
