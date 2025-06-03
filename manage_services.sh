#!/bin/bash

# Project Root Directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service Ports
DJANGO_PORT=8000
REACT_PORT=5176
EXPO_PORT=8081

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 > /dev/null 2>&1
}

# Stop a service by port
stop_service() {
    local port=$1
    local service_name=$2
    
    if port_in_use $port; then
        echo -e "${YELLOW}Stopping $service_name (port $port)...${NC}"
        lsof -ti:$port | xargs kill -9
        sleep 2
        
        if ! port_in_use $port; then
            echo -e "${GREEN}$service_name stopped successfully.${NC}"
        else
            echo -e "${RED}Failed to stop $service_name.${NC}"
        fi
    else
        echo -e "${GREEN}$service_name is not running.${NC}"
    fi
}

# Start a service
start_service() {
    local service=$1
    local working_dir=$2
    local start_command=$3
    local port=$4
    
    echo -e "${YELLOW}Starting $service...${NC}"
    cd "$working_dir"
    $start_command &
    sleep 3
    
    if port_in_use $port; then
        echo -e "${GREEN}$service started successfully.${NC}"
    else
        echo -e "${RED}Failed to start $service.${NC}"
    fi
}

# Monitor service health
monitor_services() {
    echo -e "${YELLOW}Checking service health...${NC}"
    
    # Django Backend
    if port_in_use $DJANGO_PORT; then
        echo -e "${GREEN}✓ Django Backend (port $DJANGO_PORT): Running${NC}"
    else
        echo -e "${RED}✗ Django Backend (port $DJANGO_PORT): Not Running${NC}"
    fi
    
    # React Frontend
    if port_in_use $REACT_PORT; then
        echo -e "${GREEN}✓ React Frontend (port $REACT_PORT): Running${NC}"
    else
        echo -e "${RED}✗ React Frontend (port $REACT_PORT): Not Running${NC}"
    fi
    
    # Expo Mobile
    if port_in_use $EXPO_PORT; then
        echo -e "${GREEN}✓ Expo Mobile (port $EXPO_PORT): Running${NC}"
    else
        echo -e "${RED}✗ Expo Mobile (port $EXPO_PORT): Not Running${NC}"
    fi
}

# Main command router
case "$1" in
    stop)
        stop_service $DJANGO_PORT "Django Backend"
        stop_service $REACT_PORT "React Frontend"
        stop_service $EXPO_PORT "Expo Mobile"
        ;;
    
    start)
        # Kill any existing processes on the ports
        lsof -ti:$DJANGO_PORT | xargs kill -9 2>/dev/null
        lsof -ti:$REACT_PORT | xargs kill -9 2>/dev/null
        lsof -ti:$EXPO_PORT | xargs kill -9 2>/dev/null
        
        # Wait for ports to be freed
        sleep 2
        
        # Django Backend (FIRST)
        start_service "Django Backend" "$PROJECT_ROOT/backend" "bash start_server.sh" $DJANGO_PORT
        
        # Wait for backend to fully initialize
        sleep 5
        
        # React Frontend (SECOND)
        start_service "React Frontend" "$PROJECT_ROOT/frontend/web" "npm run dev -- --port $REACT_PORT" $REACT_PORT
        
        # Wait for frontend to start
        sleep 3
        
        # Expo Mobile (LAST)
        start_service "Expo Mobile" "$PROJECT_ROOT/frontend/mobile" "npx expo start" $EXPO_PORT
        ;;
    
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    
    status)
        monitor_services
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
esac

exit 0
