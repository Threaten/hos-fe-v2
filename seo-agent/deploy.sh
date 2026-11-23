#!/usr/bin/env bash
# Deploys the frontend or backend from its repo on this server, then checks the site still answers.
# If the build or the health check fails, the commits since the last good deploy are reverted
# (a new commit, pushed), the old version is rebuilt, and an alert is written for the owner.
# Usage: deploy.sh fe|be
set -euo pipefail
KIT="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
# shellcheck disable=SC1091
source "$KIT/site.conf"
HOME_DIR="${SEO_AGENT_HOME:-$DEFAULT_HOME}"
# shellcheck disable=SC1091
source "$HOME_DIR/env"
target="${1:?usage: deploy.sh fe|be}"
case "$target" in
  fe) dir="$FE_DIR"; cmd="$FE_DEPLOY_CMD"; health="$FE_HEALTH_URL" ;;
  be) dir="$BE_DIR"; cmd="$BE_DEPLOY_CMD"; health="$BE_HEALTH_URL" ;;
  *) echo "usage: deploy.sh fe|be" >&2; exit 2 ;;
esac
cd "$dir"
good_file="$HOME_DIR/state/last-good-$target"
current="$(git rev-parse HEAD)"
previous="$(cat "$good_file" 2>/dev/null || git rev-parse HEAD~1)"
log() { echo "[deploy $target $(date '+%F %T')] $*"; }

healthy() {
  for _ in $(seq 1 30); do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$health" || true)"
    [ "$code" = 200 ] && return 0
    sleep 4
  done
  return 1
}

log "deploying $current (last good: $previous)"
if bash -c "$cmd" && healthy; then
  echo "$current" > "$good_file"
  log "OK: $health answers 200"
  exit 0
fi

log "FAILED, rolling back to $previous"
{
  echo "## $(date '+%F %T') deploy of $target failed"
  echo "Commit $current did not build or $health stopped answering. Rolled back to $previous."
} >> "$HOME_DIR/state/ALERT.md"
if [ "$current" != "$previous" ] && git revert --no-edit "$previous..$current"; then
  git push origin HEAD || log "push of the revert failed; push it by hand"
else
  git revert --abort 2>/dev/null || true
  log "automatic revert impossible; checking out $previous files"
  git checkout "$previous" -- . && git commit -m "Roll back to $previous after a failed deploy" && git push origin HEAD || true
fi
bash -c "$cmd" && healthy && log "rolled back, site is up" || {
  echo "Rollback did not bring $health back. Needs a human." >> "$HOME_DIR/state/ALERT.md"
  touch "$HOME_DIR/PAUSED"
  log "site still down after rollback; agent paused"
}
exit 1
