#!/bin/bash

# Script to fix database permissions
# This script will grant necessary permissions to the database user

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Database Permissions Fix Script${NC}"
echo "=================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL before running this script"
    exit 1
fi

# Parse DATABASE_URL to extract connection details
# Format: postgresql://user:password@host:port/database
DB_URL="$DATABASE_URL"

# Extract components using sed/awk or python
# For simplicity, we'll use a more robust approach
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p' || echo "$USER")
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p' || echo "localhost")
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p' || echo "5432")
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

# If parsing failed, try alternative method
if [ -z "$DB_NAME" ]; then
    # Try with python if available
    if command -v python3 &> /dev/null; then
        DB_USER=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$DB_URL').username or '$USER')" 2>/dev/null || echo "$USER")
        DB_HOST=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$DB_URL').hostname or 'localhost')" 2>/dev/null || echo "localhost")
        DB_PORT=$(python3 -c "from urllib.parse import urlparse; p=urlparse('$DB_URL'); print(p.port or 5432)" 2>/dev/null || echo "5432")
        DB_NAME=$(python3 -c "from urllib.parse import urlparse; print(urlparse('$DB_URL').path.lstrip('/').split('?')[0])" 2>/dev/null)
    fi
fi

if [ -z "$DB_NAME" ]; then
    echo -e "${RED}Error: Could not parse database name from DATABASE_URL${NC}"
    echo "DATABASE_URL format should be: postgresql://user:password@host:port/database"
    exit 1
fi

echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo ""

# Prompt for postgres superuser password
echo -e "${YELLOW}This script needs to connect as a PostgreSQL superuser to grant permissions.${NC}"
echo "Please enter the PostgreSQL superuser password (usually 'postgres' user):"
read -s POSTGRES_PASSWORD

# Create a temporary SQL file with the grant commands
TEMP_SQL=$(mktemp)
cat > "$TEMP_SQL" <<EOF
-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "$DB_USER";

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "$DB_USER";

-- Also grant to PUBLIC as a fallback (less secure but ensures access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- Grant specific permissions on each table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "User" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Admin" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Category" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Product" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Order" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "OrderItem" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Inquiry" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ContactInfo" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Blog" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Career" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Resource" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "PasswordResetToken" TO "$DB_USER", PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "HeroSlide" TO "$DB_USER", PUBLIC;
EOF

echo "Granting permissions..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -d "$DB_NAME" -f "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Permissions granted successfully!${NC}"
    rm -f "$TEMP_SQL"
else
    echo -e "${RED}✗ Failed to grant permissions${NC}"
    echo "You may need to run the SQL commands manually as a superuser"
    echo "SQL file saved at: $TEMP_SQL"
    exit 1
fi
