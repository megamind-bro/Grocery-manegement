#!/usr/bin/env bash
set -euo pipefail

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Prevent running as root
if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  echo -e "${RED}Error: Do not run this script as root.${NC}"
  exit 1
fi

# Check for required commands
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}Error: $1 is not installed. Please install it and try again.${NC}"
    exit 1
  fi
}

# Initialize variables
BACKEND_PID=0
FRONTEND_PID=0

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  
  # Kill backend if running
  if [ $BACKEND_PID -ne 0 ]; then
    echo -e "${BLUE}Stopping backend (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
  fi
  
  # Kill frontend if running
  if [ $FRONTEND_PID -ne 0 ]; then
    echo -e "${BLUE}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

# Set up trap
trap cleanup INT TERM EXIT

# Main function
main() {
  # Check for required commands
  check_command node
  check_command npm
  check_command python3
  check_command pip3

  echo -e "${YELLOW}Starting development environment...${NC}"
  
  # Set environment variables
  export FLASK_APP=app:app
  export FLASK_ENV=development
  export PYTHONPATH="${PROJECT_ROOT}/server:${PYTHONPATH:-}"
  
  # Set up Python virtual environment
  setup_python_env
  
  # Install Node dependencies
  setup_node_deps
  
  # Initialize database
  init_database
  
  # Start services
  start_backend &
  BACKEND_PID=$!
  
  start_frontend &
  FRONTEND_PID=$!
  
  echo -e "\n${GREEN}Development servers started successfully!${NC}"
  echo -e "${BLUE}Backend:    http://localhost:5001${NC}"
  echo -e "${BLUE}Frontend:   http://localhost:3000${NC}"
  echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"
  
  # Wait for all background processes
  wait $BACKEND_PID $FRONTEND_PID
}

# Setup Python environment
setup_python_env() {
  echo -e "${YELLOW}Setting up Python environment...${NC}"
  
  local VENV_DIR="${PROJECT_ROOT}/server/env"
  
  if [ ! -d "$VENV_DIR" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
  fi
  
  # Activate virtual environment
  source "${VENV_DIR}/bin/activate"
  
  echo -e "${BLUE}Installing/updating Python dependencies...${NC}"
  pip install --upgrade pip
  pip install -r "${PROJECT_ROOT}/server/requirements.txt"
  
  deactivate
}

# Setup Node dependencies
setup_node_deps() {
  echo -e "${YELLOW}Setting up Node.js environment...${NC}"
  
  if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${BLUE}Installing Node dependencies...${NC}"
    cd "${PROJECT_ROOT}" && npm install
  fi
}

# Initialize database
init_database() {
  echo -e "${YELLOW}Initializing database...${NC}"
  
  local DB_FILE="${PROJECT_ROOT}/server/grocery.db"
  local DB_BACKUP="${DB_FILE}.bak"
  
  # Backup existing database if it exists
  if [ -f "$DB_FILE" ]; then
    echo -e "${BLUE}Backing up existing database...${NC}"
    cp "$DB_FILE" "$DB_BACKUP"
  fi
  
  # Activate virtual environment
  source "${PROJECT_ROOT}/server/env/bin/activate"
  
  # Initialize database
  cd "${PROJECT_ROOT}/server"
  python3 -c "
from db import Base, engine
print('Creating database tables...')
Base.metadata.create_all(engine)

# Create admin user if not exists
from sqlalchemy.orm import sessionmaker
from db import User, SessionLocal
from werkzeug.security import generate_password_hash

db = SessionLocal()
try:
    admin = db.query(User).filter(User.username == 'admin').first()
    if not admin:
        print('Creating admin user...')
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            name='Admin User',
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print('Admin user created with username: admin, password: admin123')
    else:
        print('Admin user already exists')
finally:
    db.close()
"
  
  deactivate
  
  echo -e "${GREEN}Database initialized successfully!${NC}"
}

# Start backend server
start_backend() {
  echo -e "${YELLOW}Starting backend server...${NC}"
  
  # Activate virtual environment
  cd "${PROJECT_ROOT}/server"
  source "${PROJECT_ROOT}/server/env/bin/activate"
  
  # Run Flask with auto-reload
  python -m flask run --host=0.0.0.0 --port=5001 --debug
  
  # Keep the process running
  while true; do sleep 1; done
}

# Start frontend server
start_frontend() {
  echo -e "${YELLOW}Starting frontend development server...${NC}"
  
  cd "${PROJECT_ROOT}"
  npm run dev:client
  
  # Keep the process running
  while true; do sleep 1; done
}

# Run main function
main "$@"


