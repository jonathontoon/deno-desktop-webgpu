#!/bin/sh
# Turn on the commit checks and set the real user for this repository.
# See "Commit history" in AGENTS.md.

set -eu

git config core.hooksPath .githooks
git config user.name "Jonathon Toon"
git config user.email "1197942+jonathontoon@users.noreply.github.com"
echo "Commit checks are on. The git user is $(git config user.name)."
