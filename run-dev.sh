#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from the project root
cd "$(dirname "$0")"

# Colors
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Prevent running as root (sudo breaks npm PATH and local binaries)
if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  echo -e "${RED}Do not run this script with sudo. Run it as your normal user.${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting backend (Flask) and frontend (Vite) together...${NC}"

# Trap to cleanup background jobs on exit
cleanup() {
  echo -e "${YELLOW}Shutting down services...${NC}"
  jobs -p | xargs -r kill
}
trap cleanup EXIT INT TERM

# Ensure node dependencies are installed (vite binary)
if [ ! -d node_modules ]; then
  echo -e "${YELLOW}Installing Node dependencies...${NC}"
  npm install --silent
fi

# Start backend
(
  cd server
  if [ -x "./env/bin/python" ]; then
    ./env/bin/python -m app
  else
    # fallback to system python if venv missing
    python3 -m app
  fi
) &

# Start frontend (Vite)
(
  npm run dev:client
) &

# Wait on background jobs
wait


