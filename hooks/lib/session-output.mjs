// Platform-aware SessionStart output for the Node hooks.
//
// Claude Code injects plain SessionStart stdout into context, so the Node
// hooks write text. Cursor's sessionStart contract only reads a JSON object
// with `additional_context`; plain stdout is ignored there. Detection mirrors
// hooks/session-start: CURSOR_PLUGIN_ROOT present → Cursor.

/** Write SessionStart context in the shape the host platform reads. */
export function emitSessionStart(text) {
  if (process.env.CURSOR_PLUGIN_ROOT) {
    process.stdout.write(JSON.stringify({ additional_context: text }) + '\n');
  } else {
    process.stdout.write(text);
  }
}
