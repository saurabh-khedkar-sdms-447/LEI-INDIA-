#!/bin/bash
# Database Setup Helper Script

echo "🔧 Lei Indias Database Setup"
echo "=============================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL is not set"
    echo ""
    echo "Please create a .env file with:"
    echo "DATABASE_URL=postgresql://username:password@localhost:5432/leiindias"
    echo ""
    read -p "Do you want to create the database now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating database..."
        sudo -u postgres psql -c "CREATE DATABASE leiindias;" 2>/dev/null || createdb leiindias
        echo "✅ Database created (if it didn't exist)"
        echo ""
        echo "Now set DATABASE_URL in .env and run: pnpm db:setup"
    fi
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "Running database setup..."
echo ""

# Run setup
pnpm db:setup && echo "" && pnpm db:seed && echo "" && pnpm db:test

