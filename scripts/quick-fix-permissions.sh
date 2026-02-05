#!/bin/bash
# Quick fix for Admin table permissions
# This script extracts the database user from DATABASE_URL and grants permissions

set -e

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Extract database name from DATABASE_URL
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p' || python3 -c "from urllib.parse import urlparse; print(urlparse('$DATABASE_URL').path.lstrip('/').split('?')[0])" 2>/dev/null)

if [ -z "$DB_NAME" ]; then
    echo "❌ Error: Could not parse database name from DATABASE_URL"
    exit 1
fi

# Extract database user from DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p' || python3 -c "from urllib.parse import urlparse; print(urlparse('$DATABASE_URL').username or '')" 2>/dev/null)

if [ -z "$DB_USER" ]; then
    echo "❌ Error: Could not parse database user from DATABASE_URL"
    echo "Please run the SQL commands manually (see instructions below)"
    exit 1
fi

echo "🔧 Fixing permissions for user: $DB_USER on database: $DB_NAME"
echo ""
echo "Please enter the PostgreSQL superuser password (usually 'postgres' user):"
read -s POSTGRES_PASSWORD

echo ""
echo "Granting permissions..."

PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -d "$DB_NAME" <<EOF
-- Grant schema usage
GRANT USAGE ON SCHEMA public TO "$DB_USER";
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- Grant permissions on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$DB_USER";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- Grant permissions on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$DB_USER";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Explicitly grant on Admin table (the one causing the error)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Admin" TO "$DB_USER";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Admin" TO PUBLIC;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Permissions granted successfully!"
    echo "   You can now try logging in again."
else
    echo ""
    echo "❌ Failed to grant permissions"
    echo ""
    echo "You can also run the SQL commands manually:"
    echo "  psql -U postgres -d $DB_NAME"
    echo ""
    echo "Then run:"
    echo "  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"$DB_USER\";"
    echo "  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"$DB_USER\";"
    echo "  GRANT USAGE ON SCHEMA public TO \"$DB_USER\";"
    echo "  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE \"Admin\" TO \"$DB_USER\";"
    exit 1
fi
