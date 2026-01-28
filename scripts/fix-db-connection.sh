#!/bin/bash
# Helper script to fix PostgreSQL connection issues

echo "🔧 PostgreSQL Connection Setup Helper"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env file..."
    cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres@localhost:5432/leiindias
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF
    echo "✅ Created .env file"
    echo ""
fi

echo "Current DATABASE_URL from .env:"
grep DATABASE_URL .env || echo "DATABASE_URL not found in .env"
echo ""

echo "Choose an option:"
echo "1. Create PostgreSQL user 'stark' for peer authentication (recommended)"
echo "2. Set password for postgres user"
echo "3. Use existing connection string"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Creating PostgreSQL user 'stark'..."
        sudo -u postgres psql << 'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'stark') THEN
    CREATE USER stark WITH CREATEDB;
    ALTER USER stark WITH SUPERUSER;
  END IF;
END
$$;
GRANT ALL PRIVILEGES ON DATABASE leiindias TO stark;
SQL
        if [ $? -eq 0 ]; then
            echo "✅ User 'stark' created"
            echo "Updating .env to use peer authentication..."
            sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://stark@localhost:5432/leiindias|' .env
            echo "✅ Updated .env file"
        else
            echo "❌ Failed to create user. You may need to run manually:"
            echo "sudo -u postgres psql -c \"CREATE USER stark WITH CREATEDB;\""
        fi
        ;;
    2)
        echo ""
        read -sp "Enter password for postgres user: " password
        echo ""
        echo "Updating .env..."
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:${password}@localhost:5432/leiindias|" .env
        echo "✅ Updated .env with password"
        ;;
    3)
        echo ""
        read -p "Enter DATABASE_URL: " db_url
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=${db_url}|" .env
        echo "✅ Updated .env"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Testing connection..."
if pnpm db:test 2>&1 | grep -q "connection successful"; then
    echo "✅ Connection successful!"
else
    echo "⚠️  Connection test failed. Check your DATABASE_URL in .env"
fi
