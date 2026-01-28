#!/bin/bash
# Quick script to set PostgreSQL password for stark user

echo "Setting password for PostgreSQL user 'stark'..."
sudo -u postgres psql -c "ALTER USER stark WITH PASSWORD 'stark123';"

if [ $? -eq 0 ]; then
    echo "✅ Password set successfully"
    echo ""
    echo "Updating .env file..."
    cat > .env << 'EOF'
DATABASE_URL=postgresql://stark:stark123@localhost:5432/leiindias
JWT_SECRET=your-secret-key-here
NODE_ENV=development
EOF
    echo "✅ .env file updated"
    echo ""
    echo "You can now run: pnpm db:setup"
else
    echo "❌ Failed to set password. Please run manually:"
    echo "sudo -u postgres psql -c \"ALTER USER stark WITH PASSWORD 'stark123';\""
fi
