#!/bin/bash
# FORGE local launcher — Mac browser + iPhone on same Wi‑Fi.
set -e
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

PORT="${PORT:-3001}"
HOST="${HOST:-0.0.0.0}"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

echo ""
echo "FORGE GYM"
echo "  Mac:    http://localhost:$PORT"
if [[ -n "$LAN_IP" ]]; then
  echo "  iPhone: http://$LAN_IP:$PORT"
  echo "  (same Wi‑Fi as this Mac; keep this terminal running)"
else
  echo "  iPhone: join same Wi‑Fi, then use http://<this-mac-ip>:$PORT"
fi
echo ""

lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
sleep 0.5
rm -f /tmp/forge-catalog-cooldown

# -H 0.0.0.0 lets phones on the LAN reach the dev server (localhost alone does not).
exec npm run dev -- -H "$HOST" -p "$PORT"
