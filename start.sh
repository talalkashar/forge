#!/bin/bash
set -e
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
PORT="${PORT:-3001}"
echo "FORGE GYM → http://localhost:$PORT"
lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
sleep 1
rm -f /tmp/forge-catalog-cooldown
exec npm run dev -- -p "$PORT"
