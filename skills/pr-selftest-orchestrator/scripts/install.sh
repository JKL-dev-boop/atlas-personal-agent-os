#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SKILL_NAME="pr-selftest-orchestrator"

if [ "${1:-}" != "" ]; then
  TARGET_ROOT=$1
elif [ "${CODEX_HOME:-}" != "" ]; then
  TARGET_ROOT="$CODEX_HOME/skills"
else
  TARGET_ROOT="$HOME/.codex/skills"
fi

DESTINATION="$TARGET_ROOT/$SKILL_NAME"
if [ -e "$DESTINATION" ]; then
  echo "Destination already exists; refusing to overwrite: $DESTINATION" >&2
  exit 1
fi

mkdir -p "$TARGET_ROOT"
cp -R "$SOURCE_ROOT" "$DESTINATION"
echo "Installed $SKILL_NAME to $DESTINATION"
echo "Next: run scripts/init_project.py in the target repository."

