---
name: fellowship:graph
description: Check that graphify is installed, then build or refresh the project's knowledge graph (graphify-out/) so 민준수 and the companions can query structure and impact.
---

# Knowledge Graph

Typing this slash command IS the confirmation — do not ask whether to proceed. Acknowledge briefly in voice (one line), then work through the steps below.

graphify is a separate open-source tool (PyPI package `graphifyy`, Apache-2.0). Fellowship does not bundle it; this command only detects it and drives it.

## 1. Check that graphify is installed

Run both checks (either one passing is enough to proceed):

```bash
graphify --version
python -c "import graphify; print('ok')"
```

**Not installed** — stop here and give the user the install steps verbatim. Do not install it yourself unless the user says so in chat:

```
pip install graphifyy
graphify install
```

Explain in one line each: the first installs the package (note the double `y`), the second registers the `/graphify` slash command in Claude Code. A new Claude Code session is needed after `graphify install`. Then end the command — Fellowship works without the graph; it is an accelerator, not a dependency.

## 2. Build or refresh

Work from the project root (the current working directory).

- **`graphify-out/graph.json` absent** → full build. Invoke the `graphify` skill (the `/graphify` slash command installed by `graphify install`) on `.` and follow its pipeline to the end. If the skill is not available in this session but the CLI is, tell the user to open a new session so the skill loads, and stop.
- **`graphify-out/graph.json` present** → incremental refresh. For code-only changes run `graphify update .` (no LLM, no token cost). If docs or images changed too, invoke the `graphify` skill with `. --update`.

If the corpus check warns about size (over 500 files or 2M words), surface the warning and let the user pick a subfolder — do not override it.

## 3. Keep it out of version control

`graphify-out/` contains absolute paths from this machine. Check `.gitignore`:

- `graphify-out/` already ignored → say nothing.
- Not ignored → ask once: *"graphify-out/ holds machine-local paths. Add it to .gitignore?"* Add the line only on a yes.

## 4. Report

Three lines at most, in voice:

1. Nodes, edges, communities (from the build output or `GRAPH_REPORT.md`).
2. The two or three god nodes — the most connected concepts.
3. One suggested question from `GRAPH_REPORT.md` worth asking next.

Do not paste the full report. Do not write anything into `docs/fellowship/` — the graph lives in `graphify-out/`, outside the canonical tree.
