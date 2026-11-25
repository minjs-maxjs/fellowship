# Workflow Cycles — Review, Testing, Design

## Review Cycle (주혁 → 승현)

After 주혁 DONE on critical paths, dispatch 승현. Cycle runs to completion once started.

**When to dispatch:**
- Always: auth, payments, data mutations, public APIs, security-sensitive code
- Usually: new features with meaningful logic, multi-file changes
- Skip: config, copy, one-line fixes, non-code artifacts

**Cycle:**
1. Dispatch 승현 with 주혁의 report + original spec + git SHAs + content of `docs/fellowship/codebase-map.md` if it exists.
2. 승현 reports: APPROVED / APPROVED_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED.
3. On Critical or Important findings: SendMessage to 주혁 with filtered list, 주혁 fixes, re-dispatch 승현.
4. Repeat until APPROVED.

**Rails:**
- Never skip re-review after fixes. Worth fixing = worth verifying.
- 주혁 stays alive via SendMessage — preserves build context. Never spawn fresh 주혁 mid-cycle.
- 승현 never edits code. Findings flow through you.
- Filter findings: send 주혁 Critical + Important. Note Minor, don't burn a round trip.
- Cap at three iterations. If Critical or Important findings remain after three rounds, escalate to 주인공 with both the implementation and the accumulated findings — a fourth round usually means the spec is wrong, not the code.

**Statuses:**

| Status | Action |
|---|---|
| APPROVED | Mark complete. Proceed. |
| APPROVED_WITH_CONCERNS | Correctness → 주혁. Observation → note and proceed. |
| NEEDS_CONTEXT | Add missing info, re-dispatch. |
| BLOCKED | Too large → incremental commits. Unfamiliar domain → 동일 or 우신. |

---

## Testing Cycle (우신)

우신 writes tests from the spec, not the implementation. That independence is his value — he catches what the builder misses.

**When to dispatch:**
- **Test-after (most common):** After 승현 flags gaps, or after 주혁 completes non-trivial logic.
- **Test-first (complex logic):** Before 주혁 builds, when the spec can be expressed as assertions. 우신 writes failing tests; 주혁 implements against them.
- **Test infrastructure:** Frameworks, fixtures, CI config. Goes on the quest log like any feature.
- **Browser verification:** After 승현 approves a UI feature. 우신 walks flows, checks console + failed API calls, reports.

**Test-after workflow:**
1. 주혁 DONE → 승현 flags gaps (or you identify them).
2. Dispatch 우신 with original spec (source of truth), what 주혁 built (files, interfaces), specific gaps if flagged.
3. 우신 writes tests from spec, runs, reports: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT (spec ambiguous) / BLOCKED (no infra).
4. Spec violations in tests → SendMessage 주혁; 주혁 fixes; re-dispatch 승현 if significant.

**Test-first workflow:**
1. Dispatch 우신 with spec → failing tests (red), DONE.
2. Dispatch 주혁 with task + 우신의 test files: *"Implement against these tests — they define the contract."* → green, DONE.
3. Dispatch 승현 to review both tests and implementation.

**Browser verification workflow:**
1. 승현 approves UI feature (APPROVED or APPROVED_WITH_CONCERNS). Assess: user-visible flow worth verifying? Yes → dispatch 우신 browser-verify. No (backend, config, refactor, quick fix) → skip.
2. Dispatch 우신 with `"Mode: browser-verify"`, exact flows (routes, components, interactions, starting URL), expected behavior at each step, files 주혁 built. Be specific — 우신 does not guess.
3. 우신 reports: DONE / DONE_WITH_CONCERNS / BLOCKED (MCP not registered, dev server unreachable, page won't load).
4. Issues found: Blocker/major → SendMessage 주혁 → fix → re-dispatch 우신 (same flow). Minor/cosmetic → quest log; user decides priority.

**Rails:**
- 우신 reads the spec, not the code. Dispatch must include task description or spec — not just "write tests for auth.ts".
- Spec violations are findings, not test errors. Code diverges from spec → report to 주혁, not a test fix.
- Critical paths → dispatch 승현 to review 우신의 test files too.
- Browser verification requires the Playwright MCP. Confirm registration before dispatching browser-verify. If not: *"Browser verification needs the Playwright MCP — register it with: `claude mcp add playwright -- npx @playwright/mcp@latest --caps vision`"*
- Browser verification is for UI flows only. Backend, API, refactors, config → test-after instead.

---

## Design Review (필엽)

필엽 reviews design quality — 승현 reviews code quality. Complementary. 승현 is automatic on critical code paths; **필엽 is dispatched on judgment.** Not every 주혁 build has a visible face worth auditing.

**When to dispatch:**
- **Design contract exists** — 주혁 built against 필엽의 spec. Compliance check, not a full audit.
- **Task is user-facing and significant** — new page, new flow, redesigned component. Not a label tweak.
- **User signals it** — "make this accessible," "careful with the UX," "review the design."
- **Visual exploration before building** — 필엽 produces HTML/CSS mockups; user picks direction; dispatch 주혁 with the chosen mockup as design contract. 필엽의 HTML is input, not final deliverable.

**Do not dispatch 필엽** for backend, API routes, config, or anything without a visible interface. Not automatically after every 주혁 build.

**Design contract compliance (most common):**
1. 주혁 builds against contract, DONE.
2. Dispatch 필엽 with contract path + what 주혁 built (files, screenshots if available).
3. 필엽 reports: DONE / DONE_WITH_CONCERNS (drift) / NEEDS_CONTEXT (can't assess without running UI).
4. Deviations → SendMessage 주혁 with specifics → corrects, DONE.

**Full UX audit / WCAG audit (on request):** Dispatch with `"Run a full UX audit"` or `"Run an accessibility audit"` only when explicitly requested. Deep passes — 6-pillar audit, full WCAG 2.2. Reserve for pre-launch, significant releases, user-reported a11y issues.

**Rails:**
- 필엽 never edits code. Findings flow through you to 주혁.
- Compliance ≠ full audit. Compliance is fast, full audit is expensive. Don't conflate.
- 승현 and 필엽 can run in parallel when a 주혁 build warrants both.
- Figma work requires MCP. Confirm figma-console MCP is connected before dispatching 필엽 on Figma. If 필엽 reports BLOCKED on MCP availability: *"Figma MCPs aren't reaching 필엽 through the plugin. Copy `agents/pilyeop.md` to `.claude/agents/pilyeop.md` in this project — project-level agents don't have the same MCP restrictions as plugin agents."*
