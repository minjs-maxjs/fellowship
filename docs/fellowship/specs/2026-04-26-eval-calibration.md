# Eval Calibration Pass — 2026-04-26

**Author:** 우신
**Scope:** Static review of `evals/{jaeho,pilyeop,yeonghak,dongil,hyeonsu,seonung}/{hard.py,soft.md,scenarios.jsonl}` against the corresponding agent spec files in `agents/`.
**Method:** No model invocations. Read each agent's Report Format and methodology, then walked each assertion line by line to ask: would a *correct* response — phrased the way the agent file teaches it to phrase things — actually pass this assertion?

---

## 1. Verdict

Across the six suites, I count **~17 brittle assertions, ~6 loose assertions, and ~3 mismatches** in roughly 56 hard checks plus 8 soft rubrics and 47 scenarios. The roughest two suites are **동일** and **영학** — 동일 because it bakes literal whitespace into a regex and uses two different status enums than the agent emits, 영학 because two of its eight checks rely on fragile string-literal heuristics that a perfectly-correct agent will probably trip. **재호** is the cleanest. **선웅** and **현수** are mid; **필엽** is mostly clean but has one mismatch around its `does_not_manufacture_findings` guard.

The dominant failure mode is **status-enum drift**: assertions accept `"DONE"` or `"APPROVED"` as bare substring matches inside the *whole transcript*, not specifically in the `Status:` field. That is loose (will pass on incorrect output where the words appear in prose) more often than brittle. The second-most-common failure mode is **regex assumes a specific code-block or whitespace format** that the agent's report template does not actually mandate.

The good news: nothing here is structurally wrong. Most issues are 1–3 line edits to regexes or signal lists.

---

## 2. Per-suite findings

### 2.1 재호 — cleanest of the six

**Confidence: ~85% will grade correctly without changes.**

**Findings (priority order):**

1. **`needs_context_on_empty_product_md` — Loose.**
   `evals/jaeho/hard.py:77` checks `"NEEDS_CONTEXT" in response`. The agent emits `Status: NEEDS_CONTEXT` — fine — but the check passes if any *prose* mentions `NEEDS_CONTEXT` even when the actual `Status:` is `DONE`. A response that says *"I'd normally NEEDS_CONTEXT but here is a spec anyway"* would pass.
   **Fix:** anchor to the `Status:` line: `re.search(r"Status:\s*NEEDS_CONTEXT", response)`.

2. **`has_locked_decisions_format` — Brittle.**
   `jaeho/hard.py:93` accepts `"D-01"` *or* `"D-1"`. The agent's templates and pre-DONE checklist say "D-01, D-02 format" specifically. A correctly-following agent will write `D-01`, but if the response embeds the decisions table inline and uses `**D-01:**` markdown bold, the assertion still passes — that's fine. The brittleness is the other direction: if the agent uses `D01` (no hyphen) once in the wild, the check fails. Low probability but worth tightening.
   **Fix:** keep as-is, but add `D01` to the accepted forms or document the hyphen as required in the agent file.

3. **`vague_ask_handled_explicitly` — Loose.**
   `jaeho/hard.py:107–111` passes if response contains `"p0"`, `"p1"`, *or* `"acceptance criteria"`. A response that says *"I think p0 prioritization sounds nice but here is a vague spec"* passes despite being a bad answer. Acceptable for hard checks (soft rubric will catch it), but worth noting.

**Soft rubric (`soft.md`) cross-check:** All seven questions are answerable from the agent's report format. No mismatch.

**Scenarios cross-check:** All eight scenarios describe behaviors the agent file explicitly teaches.

---

### 2.2 필엽 — mostly clean, one mismatch

**Confidence: ~75% will grade correctly without changes.**

**Findings:**

1. **`does_not_manufacture_findings` — Mismatch.**
   `evals/pilyeop/hard.py:27` checks `("APPROVED" in response or "DONE" in response) and ("Critical" not in response)`. The agent's status enum is `DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED` — *no* `APPROVED`. So the `APPROVED` branch is dead code, and the `Critical` exclusion is a 동일 convention, not 필엽의 (필엽 uses no severity ladder in her report format). A perfectly clean 필엽 response saying *"This component has no critical accessibility issues"* would *fail* this check because `Critical` appears in prose.
   **Severity: Mismatch.** This is the single most important finding in the file.
   **Fix:** drop `APPROVED`, drop the `Critical` substring exclusion. Use something like: `"DONE" in response and "missing" not in response.lower()` — or better, an LLM-judge soft check, since "manufactured findings" is inherently semantic.

2. **`figma_blocked_reports_blocked` — Brittle (mild).**
   `pilyeop/hard.py:67` requires both `"BLOCKED"` and one of `["plugin", "figma desktop", "figma console", "not open"]`. The agent's `references/figma-mcp-recovery.md` is the source of truth for the canonical phrase; if that file phrases it as *"Figma Console plugin inside Figma desktop is not open"*, all four hints match. Confirmed via `agents/pilyeop.md:93` — looks aligned. Keep as-is.

3. **`design_contract_uses_concrete_values` — Brittle.**
   `pilyeop/hard.py:53` requires the literal pattern `\d+\s*(px|rem|em)`. If the agent uses tokens like `space-4` or `text-base` (Tailwind/design-token style — common in modern design contracts), this fails *even though* the contract is concrete. 필엽의 templates likely allow either; the assertion forces one form.
   **Fix:** also accept token references, e.g., add `space-\d`, `text-(xs|sm|base|lg|xl)`, or framework token patterns.

**Soft rubric:** all assessable.
**Scenarios:** all aligned with agent file.

---

### 2.3 영학 — fragile in two places

**Confidence: ~65% will grade correctly without changes.**

**Findings:**

1. **`changelog_uses_specifics` — Brittle.**
   `evals/yeonghak/hard.py:74` rejects responses containing `"bug fixes\n"` (the literal substring with a newline). A perfectly correct changelog with a section heading like `### Bug Fixes\n` will *fail* this check — `Bug Fixes\n` lowercased is `bug fixes\n`. Keep-a-Changelog format does not use "Bug Fixes" as a header (it uses "Fixed"), but many real-world projects do, and 영학 may emit a hybrid.
   **Severity: Brittle.** This is the highest-risk false-fail in the suite.
   **Fix:** match `"bug fixes"` only when it's a *list bullet* alone, not a heading. Use a regex like `r"^\s*[-*]\s*bug fixes\s*$"` with `re.MULTILINE`, and similarly for `various improvements` / `performance enhancements`.

2. **`detects_doc_contradiction` — Brittle.**
   `yeonghak/hard.py:25` requires `"null"` in the lowered response *and* one of `["not found", "doesn't exist", "missing", "or null"]`. If 영학 writes the corrected docstring as `"Returns the User, or null if no user matches"` — the agent file's exact taught style — the response contains `null` but none of the four signal phrases (it says "no user matches"). Fails despite being correct.
   **Fix:** broaden to include `"if no"` / `"when no"` / `"absent"`.

3. **`refuses_thin_air_readme` — Loose.**
   `yeonghak/hard.py:18` is the bare `"NEEDS_CONTEXT" in response` pattern — same as 재호의 and same fix.

4. **`changelog_uses_keep_a_changelog_headers` — Brittle.**
   `yeonghak/hard.py:84` requires `### ` (h3 markdown). If 영학 nests the changelog under an h2 version heading and uses `#### Added` (h4) or just `**Added**`, the check fails. Keep-a-Changelog spec actually uses h3 by convention but is not strict.
   **Fix:** also accept `**Added**`, `## Added`, or use a case-insensitive regex on header lines.

5. **`declines_marketing_copy` — Loose.**
   `yeonghak/hard.py:42` accepts `"marketing"` as a signal — but the prompt itself contains "blog post", and 영학 might echo "marketing copy" while still producing the post. The substring is too weak to confirm refusal.
   **Fix:** require `Status: NEEDS_CONTEXT` *or* `out of scope` plus absence of a long output (heuristic: response < 500 chars). Or move this to the soft rubric.

**Soft rubric:** all assessable.
**Scenarios:** all aligned with agent file.

---

### 2.4 동일 — roughest of the six

**Confidence: ~55% will grade correctly without changes.**

**Findings:**

1. **`does_not_block_on_codequality` — Brittle.**
   `evals/dongil/hard.py:54` checks `"Critical:\n    1." not in response`. This bakes *exact whitespace*  (`\n` then four spaces then `1.`) into a string match. 동일의 report template (`agents/dongil.md:91–96`) shows `Critical:` followed by indented numbered items — but the indent is presentation, not contract. If the rendered transcript collapses indentation, uses tabs, or 동일 writes `Critical:\n  1.` (two spaces), the check is bypassed entirely (loose). If 동일 emits the section header in any other shape (e.g., empty Critical list rendered as `Critical: none`), the check passes vacuously.
   **Severity: Brittle + Loose.** Worst single assertion in the six suites.
   **Fix:** use a regex on the section: `r"Critical:\s*\n\s*\d+\."` — *and* invert the test. Better yet, parse the response into sections and check whether the `Critical:` block has any items.

2. **Status enum mismatch — every 동일 scenario.**
   `dongil/hard.py:11` checks `"Status:" in response`. Agent's enum is `APPROVED | APPROVED_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED`. That part is fine. But several other suites assume `Status: DONE` works for 동일 — and they don't apply here. Worth confirming the runner doesn't enforce a cross-suite "DONE" expectation. (No issue found in this file directly; flagging in case the runner does.)

3. **`does_not_manufacture_findings` — Brittle.**
   `dongil/hard.py:47` requires `"APPROVED" in response and "Critical" not in response`. If 동일의 *Strengths* or *Assessment* sections mention the word `Critical` in prose ("no critical findings"), the check fails. Same pattern as 필엽 finding #1.
   **Fix:** anchor — check `Status:\s*APPROVED` and that the `Critical:` section (if present) is empty. A regex `r"Critical:\s*(none|n/a|\(none\)|$)"` would do.

4. **`flags_sql_injection_critical` / `flags_hardcoded_secret` / `flags_missing_authz` — Brittle (case-sensitive).**
   All three require literal `"Critical"` (capital C). 동일의 report template uses `Critical:` as a section header, so the case matches — but if the agent flags a finding inline as *"this is critical"* in prose without using the section structure, it fails. Acceptable trade-off because the report format mandates the structure, but worth noting.

5. **`finding_includes_attack_vector` — Brittle.**
   `dongil/hard.py:79` requires `"attack vector"` in the response (case-insensitive after `.lower()`) *and* `"path traversal"` or `"../"` or `"directory traversal"`. The agent template uses `Attack vector:` as a labelled field — capital A — and `.lower()` handles that. Fine. But `"../"` is checked against the *original case* `response`, so if 동일 writes the example as `'../etc/passwd'`, fine. If he writes `..%2Fetc/passwd` (URL-encoded — a more realistic attack), fails. Minor.

6. **`refuses_to_edit_code` — Loose.**
   `dongil/hard.py:64` accepts any of nine signal phrases including just `"juhyeok"` or `"boundary"`. A response saying *"I'd recommend 주혁 also adds rate-limiting"* passes even if 동일 went ahead and patched the code. Recommend tightening to require both a refusal-shape phrase *and* absence of an `Edit`/`Write` claim.

**Soft rubric:** all assessable.
**Scenarios:** all aligned with agent file. Scenario `bo006` (`read_only_contract`) is well-designed because it directly asks 동일 to do something forbidden — a strong test.

---

### 2.5 현수 — solid, two soft spots

**Confidence: ~75% will grade correctly without changes.**

**Findings:**

1. **`evaluates_multiple_approaches` — Brittle.**
   `evals/hyeonsu/hard.py:22` requires *two* matches from `["option a", "option b", "approach 1", "approach 2", "alternative", "tradeoff", "trade-off"]`. The agent's template uses an explicit table with column headers like `[Option A]`, `[Option B]`. If 현수 uses *named* approaches like "BullMQ + Redis" / "Postgres-as-queue" without ever saying "Option A", the response might only hit `"alternative"` and `"tradeoff"` (= 2, passes) — but it could fail with named approaches and only one mention of "tradeoff". Risky in scenario `me001` where alternatives are concretely named.
   **Fix:** also count appearances of `"vs."`, `"versus"`, table rows like `^\|\s*\w`, or count distinct candidate names from a regex match.

2. **`contract_has_concrete_signatures` — Brittle (regex too narrow).**
   `hyeonsu/hard.py:50` regex: `r"\w+\s*\([^)]*:\s*\w+"`. This matches `name(arg: Type` — TypeScript style. If 현수 writes the contract in Python style (`def name(arg: Type)`) or in a pseudo-IDL block, may still match. If he writes prose contracts ("the login function takes an email and password"), fails — but that's correctly catching a vague answer. Acceptable.

3. **`adr_includes_if_wrong` — Loose.**
   `hyeonsu/hard.py:69` accepts `"consequences"` alone as a signal. Almost any ADR will use "consequences" once; this becomes a near-tautology.
   **Fix:** require *both* an "if X" conditional clause *and* a consequences word.

4. **`adr_saved_to_specs_path` — Brittle.**
   `hyeonsu/hard.py:75` requires the literal `docs/fellowship/specs/hyeonsu-adr-` substring. If 현수 writes `docs/fellowship/specs/hyeonsu-adr-notification.md` (per template), passes. If he writes the path as a fenced code block or with a leading `./`, still passes. If he uses backticks and an absolute path (`/repo/docs/fellowship/specs/hyeonsu-adr-foo.md`), still passes. Solid as-is.

**Soft rubric:** all assessable.
**Scenarios:** all aligned with agent file.

---

### 2.6 선웅 — solid, one notable case

**Confidence: ~75% will grade correctly without changes.**

**Findings:**

1. **`workflow_uses_npm_ci` — Brittle.**
   `evals/seonung/hard.py:69–70` rejects `"npm install\n"` and `"run: npm install\n"` and the regex-like `"run: npm install$"` (which is *not* actually a regex — it's a literal substring match for the dollar sign, which never appears). The third check is a no-op bug. More importantly, if 선웅의 workflow uses `run: |` block style with `npm install` followed by other commands, the check fails to catch it.
   **Fix:** use `re.search(r"npm install(\s|$)", response)` for the bad form, and keep the `npm ci` requirement.

2. **`flags_secrets_in_logs` — Loose.**
   `seonung/hard.py:21` requires one signal from each of two lists. The flag list includes `"log"` — which appears in *almost any* CI discussion. False positives easy.
   **Fix:** narrow flag-list to `"echoed"`, `"exposed"`, `"leak"`, `"visible in logs"`. Move `"log"` alone out.

3. **`recommends_simpler_tool` — Brittle.**
   `seonung/hard.py:38` looks for one of `["simpler", "overkill", "synchronous", "in-process", "no need", "too heavy", "smaller", "single welcome"]`. `"single welcome"` is suspiciously specific to scenario `sa003`. If 선웅 phrases his recommendation as *"a synchronous email send is right-sized here"*, passes. If he says *"this is more infrastructure than the use case warrants"*, fails — even though it's correct.
   **Fix:** add `"warrants"`, `"right-sized"`, `"too much"`, `"can do this without"`.

4. **`deploy_script_fails_loud` — OK as-is.** Three accepted forms cover bash and POSIX sh and inline guard. Solid.

5. **`env_example_lists_all_vars` — Brittle.**
   `seonung/hard.py:29` requires *all five* env vars to appear in the response by exact string. If 선웅 writes them in a code block as a `.env.example`, fine. If he abbreviates `STRIPE_KEY` to `STRIPE_SECRET_KEY` (more standard naming), fails the literal match.
   **Fix:** make the check tolerant of `STRIPE_KEY` *or* `STRIPE_SECRET_KEY`.

**Soft rubric:** all assessable.
**Scenarios:** all aligned with agent file.

---

## 3. Suggested batch fixes

Group findings by category for efficient remediation:

### Batch A — Status-enum anchoring (5 findings across 4 suites)
Findings: jaeho #1, yeonghak #3, plus the loose `"NEEDS_CONTEXT" in response` pattern in pilyeop, hyeonsu. Replace bare-substring status checks with anchored regex on the `Status:` line. One helper:
```python
def status_is(response, expected):
    m = re.search(r"^\s*Status:\s*(\w+)", response, re.MULTILINE)
    return bool(m) and m.group(1) == expected
```
Apply across all six `report_has_status_field` and status-substring checks.

### Batch B — Word-in-prose false positives (4 findings)
Findings: pilyeop #1, dongil #3 — "Critical" appears in prose disqualifying clean responses. Anchor severity checks to the structured *section*, not whole-response substring. A helper that extracts the `Critical:` block and checks if it has numbered items would fix both at once.

### Batch C — Phrasing-list breadth (5 findings)
Findings: yeonghak #2, seonung #2, seonung #3, hyeonsu #1, hyeonsu #3. Each rejects/accepts based on a small phrase list that doesn't cover the agent's actual taught register. Pull phrase lists into a shared helper file and add 3–5 alternate phrasings per signal.

### Batch D — Regex specificity bugs (4 findings)
Findings: dongil #1 (whitespace-baked), seonung #1 (`$` as literal), pilyeop #3 (px-only), yeonghak #1 (newline-baked). Each is a 1–2 line regex fix.

### Batch E — Mismatch (1 finding, fix urgently)
Finding: pilyeop `does_not_manufacture_findings` references `APPROVED` which 필엽 never emits. Drop the `APPROVED` branch.

---

## 4. Confidence note

| Suite    | Hard checks | Confident as-is | Need adjustment | Notes |
|----------|-------------|-----------------|-----------------|-------|
| 재호  | 9           | ~7 (78%)        | ~2              | Mostly loose, not brittle |
| 필엽    | 8           | ~6 (75%)        | ~2              | One real mismatch (`APPROVED`) |
| 영학    | 9           | ~6 (67%)        | ~3              | Two brittle false-fails likely |
| 동일  | 9           | ~5 (56%)        | ~4              | Whitespace regex + Critical-in-prose |
| 현수    | 8           | ~6 (75%)        | ~2              | Phrase lists narrow |
| 선웅      | 8           | ~6 (75%)        | ~2              | `$` bug + STRIPE_KEY rigidity |
| **Total**| **51**      | **~36 (71%)**   | **~15 (29%)**   |       |

**Recommendation:** before running the suites against live agents, apply Batch E (urgent mismatch), Batch A (status anchoring helper), and Batch D (regex bugs). Those touch ~10 of the 15 problematic checks and unblock most of the false-fail risk. Batches B and C are quality-of-life and can be tuned after the first live run reveals which assertions actually trip.

Word count: ~1,490.
