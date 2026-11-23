#!/usr/bin/env bash
# Installs this website's SEO agent on this server (site.conf says which site). Safe to run again.
#
#   cd <the frontend repo folder this site is built from>
#   git pull
#   bash seo-agent/install.sh
#
# Uses your Claude Pro/Max subscription through Claude Code: no API credit is needed.
set -euo pipefail

KIT="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
FE_GUESS="$(cd "$KIT/.." && pwd)"
# shellcheck disable=SC1091
source "$KIT/site.conf"
HOME_DIR="${SEO_AGENT_HOME:-$DEFAULT_HOME}"
CONF="$HOME_DIR/env"
mkdir -p "$HOME_DIR/state" "$HOME_DIR/logs"
chmod 700 "$HOME_DIR"

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  \033[32mok\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!!\033[0m %s\n' "$*"; }
ask() { # ask VAR "Question" "default"
  local var="$1" question="$2" default="${3:-}" answer
  read -r -p "  $question${default:+ [$default]}: " answer </dev/tty
  printf -v "$var" '%s' "${answer:-$default}"
}
ask_secret() { # ask_secret VAR "Question" (Enter keeps the current value)
  local var="$1" question="$2" answer
  read -r -s -p "  $question: " answer </dev/tty
  echo
  [ -n "$answer" ] && printf -v "$var" '%s' "$answer"
  return 0
}

ask_secret_lines() { # ask_secret_lines VAR "Question": a pasted secret may wrap over several lines
  local var="$1" question="$2" line all=""
  echo "  $question"
  echo "  (paste it, then press Enter on an empty line; nothing shows while pasting)"
  while IFS= read -r -s line </dev/tty; do
    line="$(printf '%s' "$line" | tr -d '[:space:]')"
    [ -z "$line" ] && break
    all+="$line"
  done
  echo
  [ -n "$all" ] && printf -v "$var" '%s' "$all"
  return 0
}

# Earlier answers become the defaults.
# shellcheck disable=SC1090
[ -f "$CONF" ] && source "$CONF"

bold "1/7 Checking the server"
for tool in git node npm curl flock timeout crontab; do
  command -v "$tool" >/dev/null || { warn "missing: $tool (install it, then run this again)"; exit 1; }
done
node_major="$(node -p 'process.versions.node.split(".")[0]')"
[ "$node_major" -ge 18 ] || { warn "Node $node_major is too old; need 18+"; exit 1; }
ok "git, node $(node -v), npm, curl, flock, cron"

bold "2/7 Claude Code"
export PATH="$HOME/.local/bin:$PATH"
if ! command -v claude >/dev/null; then
  echo "  Installing Claude Code (official installer, into ~/.local/bin, no sudo)..."
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
fi
command -v claude >/dev/null || { warn "Claude Code did not install; see https://docs.claude.com/en/docs/claude-code/setup"; exit 1; }
ok "claude $(claude --version 2>/dev/null | head -1)"

if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  cat <<'TXT'

  The agent signs in with your Claude Pro account (no API credit). It needs a login token:
    1. On your own computer (where your browser is), run:   claude setup-token
    2. Log in with your Claude Pro account in the browser that opens.
    3. Copy the token it prints (starts with sk-ant-oat01-, may wrap over several lines).
  Leave it empty (just press Enter) to try logging in from this server instead.
TXT
  ask_secret_lines CLAUDE_CODE_OAUTH_TOKEN "Paste the token:"
  if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
    echo "  Copy the WHOLE link it prints (it wraps over several lines), then paste the code back."
    claude setup-token </dev/tty || true
    ask_secret_lines CLAUDE_CODE_OAUTH_TOKEN "Paste the token (sk-ant-oat...):"
  fi
else
  ok "Claude login token already saved (run 'claude setup-token' again if it stops working)"
fi
# Spaces or line breaks picked up while copying a wrapped token.
CLAUDE_CODE_OAUTH_TOKEN="$(printf '%s' "${CLAUDE_CODE_OAUTH_TOKEN:-}" | tr -d '[:space:]')"
[[ "${CLAUDE_CODE_OAUTH_TOKEN:-}" == sk-ant-oat* ]] || warn "That doesn't look like a subscription token (should start with sk-ant-oat)."

bold "3/7 Where the site lives"
FE_DIR="${FE_DIR:-$FE_GUESS}"
if [ -z "${BE_DIR:-}" ]; then
  BE_DIR="$(find "$HOME" /var/www /srv /opt -maxdepth 4 -type d -name .git 2>/dev/null | while read -r g; do
    d="$(dirname "$g")"; git -C "$d" remote get-url origin 2>/dev/null | grep -q "$BE_REMOTE" && { echo "$d"; break; }
  done || true)"
fi
ask FE_DIR "Frontend repo (sm-fe) folder" "$FE_DIR"
ask BE_DIR "Backend repo ($BE_REMOTE) folder" "$BE_DIR"
for d in "$FE_DIR" "$BE_DIR"; do [ -d "$d/.git" ] || { warn "$d is not a git repo"; exit 1; }; done
ask SITE_URL "Live website" "${SITE_URL:-$DEFAULT_SITE_URL}"
ask PAYLOAD_URL "CMS (Payload) address" "${PAYLOAD_URL:-$DEFAULT_PAYLOAD_URL}"

bold "4/7 How each app is deployed"
pm() { # package manager of a repo
  # npm when the repo has its lockfile (what this server has used), else pnpm / yarn
  if [ -f "$1/package-lock.json" ]; then echo npm; elif [ -f "$1/pnpm-lock.yaml" ]; then echo pnpm; elif [ -f "$1/yarn.lock" ]; then echo yarn; else echo npm; fi
}
pm2_name() { # pm2 app whose folder is $1
  command -v pm2 >/dev/null || return 0
  pm2 jlist 2>/dev/null | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{
      const hit=JSON.parse(s).find(p=>require("path").resolve(p.pm2_env.pm_cwd||"")===require("path").resolve(process.argv[1]));
      if(hit)console.log(hit.name)}catch{}})' "$1"
}
default_cmd() {
  local dir="$1" name manager
  name="$(pm2_name "$dir")"; manager="$(pm "$dir")"
  if [ -n "$name" ]; then
    echo "$manager install && $manager run build && pm2 restart $name --update-env"
  else
    echo ""
  fi
}
[ -n "${FE_DEPLOY_CMD:-}" ] || FE_DEPLOY_CMD="$(default_cmd "$FE_DIR")"
[ -n "${BE_DEPLOY_CMD:-}" ] || BE_DEPLOY_CMD="$(default_cmd "$BE_DIR")"
[ -n "$FE_DEPLOY_CMD" ] && ok "found frontend in pm2" || warn "no pm2 app found for the frontend: type the command you use to rebuild and restart it"
ask FE_DEPLOY_CMD "Frontend build+restart command (runs inside $FE_DIR)" "$FE_DEPLOY_CMD"
[ -n "$BE_DEPLOY_CMD" ] && ok "found backend in pm2" || warn "no pm2 app found for the backend: type the command you use to rebuild and restart it"
ask BE_DEPLOY_CMD "Backend build+restart command (runs inside $BE_DIR)" "$BE_DEPLOY_CMD"
ask FE_HEALTH_URL "Frontend health check URL" "${FE_HEALTH_URL:-$SITE_URL/}"
ask BE_HEALTH_URL "Backend health check URL" "${BE_HEALTH_URL:-${PAYLOAD_URL%/}$BE_HEALTH_PATH}"

for d in "$FE_DIR" "$BE_DIR"; do
  if git -C "$d" push --dry-run origin HEAD >/dev/null 2>&1; then
    ok "can push to GitHub from $d"
  else
    warn "cannot push from $d. Give this server write access to the repo (a GitHub deploy key with"
    warn "'Allow write access', or 'gh auth login'), then run this installer again."
  fi
  if [ -z "$(git -C "$d" config user.email || true)" ]; then
    git -C "$d" config user.name "$SITE_NAME SEO Agent"
    git -C "$d" config user.email "seo-agent@noreply.${DEFAULT_SITE_URL#https://}"
  fi
done

bold "5/7 CMS access (lets the agent edit page text and SEO fields)"
echo "  In ${PAYLOAD_URL%/}/admin:"
printf '%s\n' "$CMS_ROLE_HELP" | fold -s -w 96 | sed 's/^/    /'
echo "  Press Enter to skip; the agent then only does code work and writes CMS suggestions for you."
ask_secret_lines PAYLOAD_API_KEY "Paste the SEO Agent API key (or just press Enter to keep the current one / skip):"
PAYLOAD_API_KEY="${PAYLOAD_API_KEY:-}"
if [ -n "$PAYLOAD_API_KEY" ]; then
  # /api/users/me answers 200 even for a wrong key ({"user":null}), so look at the body
  me="$(curl -s -H "Authorization: users API-Key $PAYLOAD_API_KEY" "${PAYLOAD_URL%/}/api/users/me")"
  case "$me" in *'"user":{'*) ok "API key works" ;; *) warn "API key not accepted (the CMS doesn't recognise it): make a new one and run this again" ;; esac
fi

bold "6/7 Google Search Console (optional, strongly recommended: real Google positions)"
cat <<'TXT'
  1. console.cloud.google.com → new project → enable "Google Search Console API".
  2. IAM → Service accounts → create one → Keys → Add key → JSON. Upload the file to this server.
  3. search.google.com/search-console → this site's property → Settings → Users and permissions →
     add the service account's email as a "Restricted" user.
TXT
ask GSC_KEY_FILE "Path to the JSON key on this server (Enter to skip)" "${GSC_KEY_FILE:-}"
ask GSC_SITE "Search Console property" "${GSC_SITE:-sc-domain:${DEFAULT_SITE_URL#https://}}"
[ -n "$GSC_KEY_FILE" ] && chmod 600 "$GSC_KEY_FILE" 2>/dev/null || true

bold "7/7 Schedule"
ask CLAUDE_MODEL "Model (sonnet uses less of your Pro limit; opus is stronger)" "${CLAUDE_MODEL:-sonnet}"
ask MAX_TURNS "Max steps per run" "${MAX_TURNS:-60}"
# Nightly at 02:30 Vietnam time, converted to this server's clock.
offset="$(date +%z)"; server_hours=$((10#${offset:1:2})); [ "${offset:0:1}" = "-" ] && server_hours=$((-server_hours))
hour=$(( (CRON_VN_HOUR - 7 + server_hours + 48) % 24 ))
ask CRON_SCHEDULE "Cron schedule (server time; default = $(printf '%02d:%02d' "$CRON_VN_HOUR" "$CRON_MINUTE") in Vietnam)" "${CRON_SCHEDULE:-$CRON_MINUTE $hour * * *}"

umask 077
{
  echo "# $SITE_NAME SEO agent settings. Re-run install.sh to change them."
  NODE_DIR="$(dirname "$(command -v node)")"
  for key in NODE_DIR CLAUDE_CODE_OAUTH_TOKEN FE_DIR BE_DIR SITE_URL PAYLOAD_URL PAYLOAD_API_KEY FE_DEPLOY_CMD BE_DEPLOY_CMD \
    FE_HEALTH_URL BE_HEALTH_URL GSC_KEY_FILE GSC_SITE CLAUDE_MODEL MAX_TURNS CRON_SCHEDULE; do
    printf '%s=%q\n' "$key" "${!key:-}"
  done
} > "$CONF"
chmod 600 "$CONF"
ok "settings saved to $CONF"

ln -sfn "$KIT" "$HOME_DIR/kit"
[ -f "$HOME_DIR/state/facts.md" ] || cp "$KIT/facts.template.md" "$HOME_DIR/state/facts.md"
[ -f "$HOME_DIR/state/keywords.txt" ] || cp "$KIT/keywords.default.txt" "$HOME_DIR/state/keywords.txt"
[ -f "$HOME_DIR/state/competitors.txt" ] || cp "$KIT/competitors.template.txt" "$HOME_DIR/state/competitors.txt"
touch "$HOME_DIR/state/journal.md" "$HOME_DIR/state/owner-todo.md"
git -C "$FE_DIR" rev-parse HEAD > "$HOME_DIR/state/last-good-fe"
git -C "$BE_DIR" rev-parse HEAD > "$HOME_DIR/state/last-good-be"

line="$CRON_SCHEDULE SEO_AGENT_HOME=$HOME_DIR $HOME_DIR/kit/run.sh >/dev/null 2>&1 # $CRON_TAG"
# Read the whole crontab first, then write it back with our line replaced (other jobs untouched)
current_cron="$(crontab -l 2>/dev/null || true)"
{ printf '%s\n' "$current_cron" | grep -v "# $CRON_TAG\$" | grep -v '^$' || true; echo "$line"; } | crontab -
ok "cron: $CRON_SCHEDULE (server time $(date +%Z))"

bold "Done"
cat <<TXT
  Add real facts (prices, intakes, certificates) here; the agent only writes facts it can verify:
      nano $HOME_DIR/state/facts.md
  What the agent did:   cat $HOME_DIR/state/journal.md
  Things for you to do: cat $HOME_DIR/state/owner-todo.md
  Logs:                 ls $HOME_DIR/logs
  Run now:              $HOME_DIR/kit/run.sh
  Pause / resume:       touch $HOME_DIR/PAUSED   /   rm $HOME_DIR/PAUSED
TXT
read -r -p "  Start the first run now? [y/N] " now </dev/tty
[[ "$now" =~ ^[Yy]$ ]] && exec "$HOME_DIR/kit/run.sh"
exit 0
