#!/bin/sh
# Check each commit in a range for an agent name.
# Usage: check-history.sh <revision-range>
# Example: check-history.sh origin/main..HEAD
# See "Commit history" in AGENTS.md.

set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: check-history.sh <revision-range>" >&2
  exit 2
fi

PATTERN="$(cat "$(dirname "$0")/agent-pattern")"
FAILED=0

for COMMIT in $(git rev-list "$1"); do
  # Author name, author email, committer name, committer email, then the message.
  if git log -1 --format='%an%n%ae%n%cn%n%ce%n%B' "$COMMIT" |
    grep -E -i -q "$PATTERN"; then
    echo "Agent name found in commit $(git log -1 --format='%h %s' "$COMMIT")" >&2
    FAILED=1
  fi
done

if [ "$FAILED" -ne 0 ]; then
  echo "Remove each agent name from the history. See AGENTS.md." >&2
  exit 1
fi
echo "No agent name found in $1."
