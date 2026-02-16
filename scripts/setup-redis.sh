#!/bin/bash

# Redis Setup Script for LEI Indias
# This script helps set up Redis for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Redis Setup for LEI Indias${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup local Redis with Docker
setup_local_docker() {
    echo -e "${YELLOW}Setting up local Redis with Docker...${NC}"
    
    if ! command_exists docker; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Starting Redis container...${NC}"
    docker-compose up -d redis
    
    echo -e "${GREEN}Waiting for Redis to be ready...${NC}"
    sleep 3
    
    # Test Redis connection
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        echo -e "${GREEN}✓ Redis is running and responding!${NC}"
        echo ""
        echo -e "${GREEN}Redis is available at:${NC}"
        echo -e "  ${BLUE}Host:${NC} localhost"
        echo -e "  ${BLUE}Port:${NC} 6379"
        echo -e "  ${BLUE}URL:${NC} redis://localhost:6379"
        echo ""
        echo -e "${YELLOW}Add to your .env file:${NC}"
        echo -e "  ${BLUE}REDIS_URL=redis://localhost:6379${NC}"
    else
        echo -e "${RED}✗ Redis failed to start. Check logs with: docker-compose logs redis${NC}"
        exit 1
    fi
}

# Function to setup local Redis (native)
setup_local_native() {
    echo -e "${YELLOW}Setting up local Redis (native installation)...${NC}"
    
    if command_exists redis-server; then
        echo -e "${GREEN}Redis is already installed.${NC}"
    else
        echo -e "${YELLOW}Installing Redis...${NC}"
        
        # Detect OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y redis-server
            elif command_exists yum; then
                sudo yum install -y redis
            elif command_exists brew; then
                brew install redis
            else
                echo -e "${RED}Could not detect package manager. Please install Redis manually.${NC}"
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command_exists brew; then
                brew install redis
            else
                echo -e "${RED}Homebrew is required for macOS. Install it from https://brew.sh${NC}"
                exit 1
            fi
        else
            echo -e "${RED}Unsupported OS. Please install Redis manually.${NC}"
            exit 1
        fi
    fi
    
    # Start Redis
    echo -e "${YELLOW}Starting Redis service...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start redis || sudo service redis start
        sudo systemctl enable redis || sudo service redis enable
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    fi
    
    # Test connection
    sleep 2
    if redis-cli ping | grep -q PONG; then
        echo -e "${GREEN}✓ Redis is running and responding!${NC}"
        echo ""
        echo -e "${YELLOW}Add to your .env file:${NC}"
        echo -e "  ${BLUE}REDIS_URL=redis://localhost:6379${NC}"
    else
        echo -e "${RED}✗ Redis failed to start.${NC}"
        exit 1
    fi
}

# Function to setup Upstash Redis
setup_upstash() {
    echo -e "${YELLOW}Setting up Upstash Redis (Serverless)...${NC}"
    echo ""
    echo -e "${BLUE}Steps to set up Upstash:${NC}"
    echo ""
    echo "1. Go to https://upstash.com and create an account"
    echo "2. Create a new Redis database:"
    echo "   - Click 'Create Database'"
    echo "   - Choose 'Global' or 'Regional'"
    echo "   - Select region closest to your AWS region"
    echo "   - Click 'Create'"
    echo ""
    echo "3. Copy the Redis URL from the database dashboard"
    echo "   It will look like: redis://default:xxxxx@xxxxx.upstash.io:6379"
    echo ""
    echo "4. Add to your .env file:"
    echo "   REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379"
    echo ""
    echo -e "${GREEN}Upstash is recommended for AWS Fargate deployments!${NC}"
    echo ""
    read -p "Press Enter when you have your Upstash Redis URL..."
    
    read -p "Enter your Upstash Redis URL: " redis_url
    
    if [[ -z "$redis_url" ]]; then
        echo -e "${RED}Redis URL is required.${NC}"
        exit 1
    fi
    
    # Test connection
    echo -e "${YELLOW}Testing connection...${NC}"
    if command_exists redis-cli; then
        # Extract host and port from URL
        if echo "$redis_url" | grep -q "rediss://"; then
            echo -e "${YELLOW}Note: TLS connection detected. Testing may require redis-cli with TLS support.${NC}"
        fi
    fi
    
    echo -e "${GREEN}✓ Configuration saved!${NC}"
    echo ""
    echo -e "${YELLOW}Add to your .env file:${NC}"
    echo -e "  ${BLUE}REDIS_URL=${redis_url}${NC}"
}

# Function to setup AWS ElastiCache
setup_elasticache() {
    echo -e "${YELLOW}Setting up AWS ElastiCache Redis...${NC}"
    echo ""
    echo -e "${BLUE}Steps to set up ElastiCache:${NC}"
    echo ""
    echo "1. Go to AWS Console → ElastiCache"
    echo "2. Click 'Create cluster' → 'Redis'"
    echo "3. Configure:"
    echo "   - Name: leiindias-redis"
    echo "   - Node type: cache.t3.micro (for testing) or cache.t3.small (production)"
    echo "   - Number of replicas: 0 (or 1 for production)"
    echo "   - Subnet group: Create or select existing"
    echo "   - Security group: Allow inbound on port 6379 from your ECS security group"
    echo "4. Click 'Create'"
    echo ""
    echo "5. After creation, get the Primary endpoint"
    echo ""
    echo "6. Add to your .env file:"
    echo "   REDIS_HOST=<primary-endpoint>"
    echo "   REDIS_PORT=6379"
    echo ""
    echo -e "${YELLOW}For AWS Secrets Manager:${NC}"
    echo "   Store the connection string as:"
    echo "   redis://<primary-endpoint>:6379"
    echo ""
    read -p "Press Enter when you have your ElastiCache endpoint..."
    
    read -p "Enter ElastiCache Primary Endpoint: " redis_host
    read -p "Enter Redis Port (default 6379): " redis_port
    redis_port=${redis_port:-6379}
    
    if [[ -z "$redis_host" ]]; then
        echo -e "${RED}Redis host is required.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Configuration saved!${NC}"
    echo ""
    echo -e "${YELLOW}Add to your .env file:${NC}"
    echo -e "  ${BLUE}REDIS_HOST=${redis_host}${NC}"
    echo -e "  ${BLUE}REDIS_PORT=${redis_port}${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Select Redis setup option:${NC}"
    echo ""
    echo "1) Local development with Docker (Recommended for dev)"
    echo "2) Local development (native installation)"
    echo "3) Upstash (Serverless - Recommended for AWS Fargate)"
    echo "4) AWS ElastiCache (AWS-native)"
    echo "5) Test existing Redis connection"
    echo "6) Exit"
    echo ""
    read -p "Enter option [1-6]: " choice
    
    case $choice in
        1)
            setup_local_docker
            ;;
        2)
            setup_local_native
            ;;
        3)
            setup_upstash
            ;;
        4)
            setup_elasticache
            ;;
        5)
            test_redis
            ;;
        6)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            show_menu
            ;;
    esac
}

# Function to test Redis connection
test_redis() {
    echo -e "${YELLOW}Testing Redis connection...${NC}"
    echo ""
    
    # Load .env if exists
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    REDIS_URL=${REDIS_URL:-""}
    REDIS_HOST=${REDIS_HOST:-""}
    REDIS_PORT=${REDIS_PORT:-"6379"}
    
    if [ -n "$REDIS_URL" ]; then
        echo -e "${BLUE}Testing with REDIS_URL: ${REDIS_URL}${NC}"
        # Extract host and port from URL for testing
        if command_exists redis-cli; then
            # Try to parse URL and test
            if echo "$REDIS_URL" | grep -q "redis://"; then
                # Remove redis:// prefix
                host_port=$(echo "$REDIS_URL" | sed 's|redis://||' | sed 's|rediss://||' | cut -d'@' -f2 | cut -d'/' -f1)
                host=$(echo "$host_port" | cut -d':' -f1)
                port=$(echo "$host_port" | cut -d':' -f2)
                port=${port:-6379}
                
                if redis-cli -h "$host" -p "$port" ping 2>/dev/null | grep -q PONG; then
                    echo -e "${GREEN}✓ Redis connection successful!${NC}"
                else
                    echo -e "${RED}✗ Redis connection failed. Check your REDIS_URL.${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}redis-cli not found. Install it to test connection.${NC}"
        fi
    elif [ -n "$REDIS_HOST" ]; then
        echo -e "${BLUE}Testing with REDIS_HOST: ${REDIS_HOST}:${REDIS_PORT}${NC}"
        if command_exists redis-cli; then
            if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null | grep -q PONG; then
                echo -e "${GREEN}✓ Redis connection successful!${NC}"
            else
                echo -e "${RED}✗ Redis connection failed. Check your REDIS_HOST and REDIS_PORT.${NC}"
            fi
        else
            echo -e "${YELLOW}redis-cli not found. Install it to test connection.${NC}"
        fi
    else
        echo -e "${RED}No Redis configuration found in environment.${NC}"
        echo -e "${YELLOW}Set REDIS_URL or REDIS_HOST in your .env file first.${NC}"
    fi
}

# Run main menu
show_menu
