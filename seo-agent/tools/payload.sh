#!/usr/bin/env bash
# Calls the Payload CMS REST API with the agent's API key, which never leaves this script.
# Usage:
#   payload.sh GET    '/api/news?limit=50&depth=0'
#   payload.sh POST   /api/news            body.json     (create)
#   payload.sh PATCH  /api/news/<id>       body.json     (update)
#   payload.sh POST   /api/globals/home-page body.json   (update a global)
set -euo pipefail
KIT="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
# shellcheck disable=SC1091
source "$KIT/site.conf"
# shellcheck disable=SC1091
source "${SEO_AGENT_HOME:-$DEFAULT_HOME}/env"
method="${1:?method}"
path="${2:?path}"
body="${3:-}"
case "$method" in GET | POST | PATCH) ;; *) echo "Only GET, POST and PATCH are allowed (nothing is ever deleted)." >&2; exit 2 ;; esac
[[ "$path" == /api/* ]] || { echo "Path must start with /api/" >&2; exit 2; }
# Accounts, permissions and anything holding customers' personal data are off limits.
case "$path" in
  /api/users* | /api/roles* | /api/customers* | /api/reservations* | /api/contact-messages* | /api/contact-submissions* | \
  /api/vouchers* | /api/voucher-reasons* | /api/spin-history* | /api/audit-logs* | /api/payload-preferences* | /api/graphql*)
    echo "Off limits: accounts, roles and customer data (${path%%\?*})." >&2; exit 2 ;;
esac
[ -n "${PAYLOAD_API_KEY:-}" ] || { echo "PAYLOAD_API_KEY is not set in ~/.seo-agent/env; CMS writes are disabled." >&2; [ "$method" = GET ] || exit 3; }
args=(-sS -g --fail-with-body -X "$method" -H "Content-Type: application/json")
[ -n "${PAYLOAD_API_KEY:-}" ] && args+=(-H "Authorization: ${PAYLOAD_AUTH_COLLECTION:-users} API-Key $PAYLOAD_API_KEY")
[ -n "$body" ] && args+=(--data-binary "@$body")
curl "${args[@]}" "${PAYLOAD_URL%/}$path"
echo
