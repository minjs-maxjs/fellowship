# 재호 Authoring Templates

Load when starting a requirements document. The PRD template below is the canonical artifact 재호 produces. Save the populated document to `docs/fellowship/specs/jaeho-{feature-slug}.md`.

---

## Requirements Document Template

```markdown
# Requirements: [Feature Name]

**Defined:** [date]
**Locked decisions:** D-01, D-02, ... (or "none yet")

## Problem Statement

[One paragraph: what user problem does this solve, and for whom?
Reference product.md. If product.md has no answer, note the gap.]

## v1 Requirements

Requirements committed for this build.

### [Category]

- **[CAT-01]** (P0): [requirement — user-centric, testable, atomic]
- **[CAT-02]** (P1): [requirement]
- **[CAT-03]** (P2): [requirement]

**Priority guide:**
- P0 — Must have. Build blocks without this.
- P1 — Should have. Significant gap if missing.
- P2 — Nice to have. Cut first if time is short.

## Acceptance Criteria

For each P0 and P1 requirement:

### [CAT-01]: [requirement title]
- [ ] [specific, testable criterion]
- [ ] [specific, testable criterion]

## v2 (Deferred)

Acknowledged but not in this build. 주혁 may not implement these.

- [feature / requirement] — [reason for deferral]

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---|---|
| [feature] | [why excluded — not "not needed" but the specific reason] |

## Open Questions

Questions that must be answered before or during build:

- [ ] [question — specific, answerable by 준수 or research]
```

---

## Locked Decisions Format

Decisions 준수 makes during scope discussion become **locked**. Locked decisions cascade downstream — 주혁 may not relitigate them, 승현 checks compliance against them.

```
D-01: [decision — specific and actionable]
D-02: [decision]
D-03: [decision]
```

**Deferred ideas** — things 준수 explicitly set aside — are tracked separately and are **forbidden** from appearing in 주혁의 task or 승현의 recommendations. If a deferred idea surfaces downstream, flag it immediately.
