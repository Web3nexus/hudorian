#!/usr/bin/env bash
#
# HUDORIAN — build the React + Vite frontend and publish it to a web root.
#
#   ./scripts/deploy.sh                 # build, then show what would change
#   ./scripts/deploy.sh ~/public_html   # build, then publish to that directory
#
# The repository deliberately does not contain the built site. Run this
# script to produce it. Publishing is a copy, never a move, so the build
# stays on disk for the next run and for local inspection.
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"
OUT_DIR="$FRONTEND_DIR/dist"

TARGET="${1:-}"

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
info()  { printf '  %s\n' "$*"; }
fail()  { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------------
# 1. Build
# ---------------------------------------------------------------------
bold "Building the frontend"
command -v npm >/dev/null 2>&1 || fail "npm is not on PATH"

[ -d "$FRONTEND_DIR/node_modules" ] || fail "run 'npm install' in frontend/ first"

( cd "$FRONTEND_DIR" && npm run build )

[ -f "$OUT_DIR/index.html" ] || fail "build finished but $OUT_DIR/index.html is missing"

info "build ready: $OUT_DIR"

# ---------------------------------------------------------------------
# 2. Report or publish
# ---------------------------------------------------------------------
if [ -z "$TARGET" ]; then
    bold "No target given — nothing published."
    info "Run './scripts/deploy.sh <web-root>' to copy the export into your"
    info "document root (for example 'public_html')."
    info ""
    info "Contents that would be published:"
    ( cd "$OUT_DIR" && find . -type f | sed 's|^\./||' | sort | head -20 )
    total=$( cd "$OUT_DIR" && find . -type f | wc -l | tr -d ' ' )
    [ "$total" -gt 20 ] && info "... and $((total - 20)) more"
    exit 0
fi

[ -d "$TARGET" ] || fail "target directory does not exist: $TARGET"
case "$TARGET" in
    */backend|*/backend/) fail "refusing to publish into backend/" ;;
esac

# rsync --delete against a target that contains the repository would wipe
# frontend/, backend/ and .git. Refuse outright rather than rely on --exclude.
TARGET_ABS="$(cd "$TARGET" && pwd)"
if [ "$TARGET_ABS" = "$REPO_ROOT" ] \
   || [ -d "$TARGET_ABS/backend" ] || [ -d "$TARGET_ABS/frontend" ]; then
    fail "refusing to publish into $TARGET_ABS

    That directory holds the repository itself, and --delete would destroy
    backend/ and frontend/.

    To refresh a site served straight from the repository root, publish
    additively instead:

        rsync -a --exclude='backend/' --exclude='frontend/' \\
              --exclude='.git/' --exclude='node_modules/' \\
              frontend/out/ ./
    "
fi

bold "Publishing to $TARGET"

# --delete removes stale chunks from the previous build. Without it the
# document root accumulates every hash ever published.
rsync -a --delete \
      --exclude='.htaccess' \
      --exclude='backend/' \
      "$OUT_DIR/" "$TARGET/"

# The web root config is version controlled at the repo root and is not
# part of the build output, so it is copied separately.
if [ -f "$REPO_ROOT/.htaccess" ]; then
    cp "$REPO_ROOT/.htaccess" "$TARGET/.htaccess"
    info "copied .htaccess"
fi

bold "Done."
info "Site files : $TARGET"
info "Laravel    : upload backend/ separately to $TARGET/backend"
info "Web config : $TARGET/.htaccess"
info ""
info "Reminder: backend/.env must exist on the server. Never commit it."
