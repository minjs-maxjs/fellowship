/**
 * v1.0 migration regression tests
 *
 * These three tests protect against silent regressions of v1.0 design
 * decisions that have no other automated guard:
 *
 *   1. TodoWrite-blocker honesty — the platform blocks 민준수 from calling
 *      TodoWrite. The using-fellowship skill must document this honestly so
 *      민준수 does not attempt the call. The eval scenario lives in
 *      evals/minjunsu/scenarios.jsonl; this test verifies both the scenario
 *      exists and the skill documents the constraint.
 *
 *   2. Role-first opener — every companion's agent file must open in
 *      role-first prose ("You define...", "You build...", "You audit...").
 *      None may contain dispatcher framing ("민준수 sends you",
 *      "민준수 dispatches you", "dispatched by 민준수") — that framing
 *      was removed in v1.0 to make agents user-invokable.
 *
 *   3. Skill-injection success — hooks/session-start must read
 *      skills/using-fellowship/SKILL.md and embed it inside the
 *      <EXTREMELY_IMPORTANT> wrapper. Without this, 민준수 identity does
 *      not establish at message one.
 *
 * If any of these fail, a v1.0 fix has reverted. Investigate before patching.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(import.meta.dirname, '..');
const AGENTS_DIR = join(REPO_ROOT, 'agents');
const SCENARIOS_PATH = join(REPO_ROOT, 'evals', 'minjunsu', 'scenarios.jsonl');
const SESSION_START_PATH = join(REPO_ROOT, 'hooks', 'session-start');
const SKILL_PATH = join(REPO_ROOT, 'skills', 'using-fellowship', 'SKILL.md');

// ---------------------------------------------------------------------------
// 1. TodoWrite-blocker honesty
// ---------------------------------------------------------------------------

describe('v1.0 regression — TodoWrite-blocker honesty', () => {
  it('evals/minjunsu/scenarios.jsonl includes a TodoWrite-blocker scenario', () => {
    const raw = readFileSync(SCENARIOS_PATH, 'utf8');
    const lines = raw.trim().split('\n').filter(Boolean);
    const scenarios = lines.map((l, i) => {
      try { return JSON.parse(l); }
      catch (e) { throw new Error(`scenarios.jsonl line ${i + 1} is invalid JSON: ${e.message}`); }
    });
    const todoScenario = scenarios.find(s =>
      (s.type && s.type.includes('todowrite')) ||
      (s.input && /track these three|track three items|tracking these/i.test(s.input)),
    );
    assert.ok(todoScenario,
      'Expected a scenario where the user asks 민준수 to track multiple items — required to guard the TodoWrite-blocker behavior');
  });

  it('skills/using-fellowship/SKILL.md or README documents the TodoWrite limitation', () => {
    // The skill itself or README must note that TodoWrite is blocked. We
    // accept either, since the limitation may live in either surface.
    const skill = readFileSync(SKILL_PATH, 'utf8');
    const readmePath = join(REPO_ROOT, 'README.md');
    const readme = readFileSync(readmePath, 'utf8');
    const combined = skill + '\n' + readme;
    const mentionsLimitation = /todowrite/i.test(combined) &&
      (/block/i.test(combined) || /limitation/i.test(combined) || /cannot/i.test(combined) || /quest.?log/i.test(combined));
    assert.ok(mentionsLimitation,
      'Either skills/using-fellowship/SKILL.md or README.md must document that TodoWrite is blocked and 민준수 uses quest-log.md instead');
  });

  it('evals/minjunsu/hard.py has an assertion that flags TodoWrite attempts', () => {
    const hardPy = readFileSync(join(REPO_ROOT, 'evals', 'minjunsu', 'hard.py'), 'utf8');
    assert.match(hardPy, /todowrite/i,
      'evals/minjunsu/hard.py should contain a TodoWrite-flagging assertion (e.g., no_todowrite_attempt) so eval runs catch the regression');
  });
});

// ---------------------------------------------------------------------------
// 2. Role-first opener regression-protection
// ---------------------------------------------------------------------------

describe('v1.0 regression — role-first opener across all companions', () => {
  const agentFiles = readdirSync(AGENTS_DIR)
    .filter(name => name.endsWith('.md'))
    .map(name => ({ name, path: join(AGENTS_DIR, name) }));

  it('finds the expected nine companion agent files', () => {
    const names = agentFiles.map(f => f.name).sort();
    const expected = [
      'jaeho.md', 'pilyeop.md', 'yeonghak.md', 'dongil.md',
      'juhyeok.md', 'seunghyeon.md', 'hyeonsu.md', 'usin.md', 'seonung.md',
    ];
    assert.deepEqual(names, expected,
      `Expected exactly the nine canonical agents. Got: ${names.join(', ')}`);
  });

  for (const agent of agentFiles) {
    it(`${agent.name} declares role in first-person ("You ...") under the Role section`, () => {
      const content = readFileSync(agent.path, 'utf8');
      // Find the ## Role section and inspect its first prose line.
      const roleMatch = content.match(/##\s+Role\s*\n([\s\S]*?)(?:\n##\s|\n---\s*\n|$)/);
      assert.ok(roleMatch,
        `${agent.name}: missing "## Role" section — required for v1.0 role-first structure`);
      const firstProseLine = roleMatch[1]
        .split('\n')
        .map(l => l.trim())
        .find(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*'));
      assert.ok(firstProseLine,
        `${agent.name}: ## Role section has no prose content`);
      assert.ok(/^You\b/.test(firstProseLine),
        `${agent.name}: first line under ## Role must begin with "You ..." (role-first prose). Got: "${firstProseLine.slice(0, 120)}..."`);
    });

    it(`${agent.name} contains no dispatcher-framing phrases`, () => {
      const content = readFileSync(agent.path, 'utf8');
      const forbidden = [
        /민준수 sends you/i,
        /민준수 dispatches you/i,
        /dispatched by 민준수/i,
      ];
      for (const pattern of forbidden) {
        assert.doesNotMatch(content, pattern,
          `${agent.name}: contains forbidden dispatcher framing matching ${pattern}. v1.0 removed this so agents are user-invokable.`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Skill-injection success
// ---------------------------------------------------------------------------

describe('v1.0 regression — skill-injection in hooks/session-start', () => {
  it('reads skills/using-fellowship/SKILL.md', () => {
    const hook = readFileSync(SESSION_START_PATH, 'utf8');
    assert.match(hook, /skills\/using-fellowship\/SKILL\.md/,
      'hooks/session-start must read skills/using-fellowship/SKILL.md to inject 민준수 identity');
  });

  it('wraps the skill content in <EXTREMELY_IMPORTANT>', () => {
    const hook = readFileSync(SESSION_START_PATH, 'utf8');
    assert.match(hook, /<EXTREMELY_IMPORTANT>/,
      'hook must wrap 민준수 identity injection in <EXTREMELY_IMPORTANT> so Claude treats it as load-bearing');
    assert.match(hook, /<\/EXTREMELY_IMPORTANT>/,
      'wrapper must be closed');
  });

  it('declares 민준수 identity in the wrapper preamble', () => {
    const hook = readFileSync(SESSION_START_PATH, 'utf8');
    assert.match(hook, /You are 민준수/,
      'hook must declare "You are 민준수" in the identity wrapper preamble — without this, the default agent does not inhabit 민준수 at message one');
  });

  it('places identity injection BEFORE project context blocks', () => {
    // Guards against a refactor that reorders blocks and breaks identity-first ordering.
    const hook = readFileSync(SESSION_START_PATH, 'utf8');
    const idIdx = hook.indexOf('<EXTREMELY_IMPORTANT>');
    const fellowshipIdx = hook.indexOf('<FELLOWSHIP_CONTEXT>');
    const questIdx = hook.indexOf('<QUEST_LOG>');
    assert.ok(idIdx >= 0, 'identity wrapper must exist in the script');
    assert.ok(fellowshipIdx >= 0, 'FELLOWSHIP_CONTEXT block must exist');
    assert.ok(idIdx < fellowshipIdx,
      'identity wrapper must be emitted before <FELLOWSHIP_CONTEXT>');
    if (questIdx > 0) {
      assert.ok(idIdx < questIdx,
        'identity wrapper must be emitted before <QUEST_LOG>');
    }
  });
});
