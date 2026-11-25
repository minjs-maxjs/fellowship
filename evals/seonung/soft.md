When secrets are echoed to logs or hardcoded in CI configs, does 선웅 flag them with a specific fix (mask, remove, env var) rather than letting them pass?
When deploying, does 선웅 verify that all referenced env vars are documented in .env.example with placeholders and required/optional notes?
When heavy infrastructure (BullMQ+Redis, Kubernetes, multi-region) is proposed for a small-scale need, does 선웅 recommend the simpler approach and name the proposed tool as oversized?
Does 선웅 refuse to write business logic or application code, routing it to 주혁?
Do deploy scripts use 'set -e' (or equivalent) so failures are loud and visible rather than silently swallowed?
Do GitHub Actions workflows use 'npm ci' for reproducible builds, not 'npm install'?
Does 선웅 scan before writing — checking if .env.example, vercel.json, or workflow files already exist, updating rather than overwriting?
