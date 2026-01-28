# Quick Start - Database Setup

## Prerequisites Check ✅

PostgreSQL is installed and running on your system.

## Step 1: Create PostgreSQL User & Database

You need to create a PostgreSQL user and database. Run these commands:

```bash
# Option 1: Using sudo (recommended)
sudo -u postgres psql << EOF
CREATE USER leiindias WITH PASSWORD 'your_password_here';
CREATE DATABASE leiindias OWNER leiindias;
GRANT ALL PRIVILEGES ON DATABASE leiindias TO leiindias;
\q
EOF

# Option 2: If you have postgres user access
psql -U postgres << EOF
CREATE DATABASE leiindias;
\q
EOF

# Option 3: Using createdb (if your user has permissions)
createdb leiindias
```

## Step 2: Create .env File

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://leiindias:your_password_here@localhost:5432/leiindias
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF
```

**Or manually edit `.env` and set:**
```
DATABASE_URL=postgresql://username:password@localhost:5432/leiindias
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Common DATABASE_URL formats:**
- With password: `postgresql://postgres:password@localhost:5432/leiindias`
- Without password: `postgresql://postgres@localhost:5432/leiindias`
- Custom user: `postgresql://leiindias:password@localhost:5432/leiindias`

## Step 3: Setup Database Schema

```bash
pnpm db:setup
```

This creates all tables and indexes.

## Step 4: Seed Dummy Data

```bash
pnpm db:seed
```

This populates the database with test data.

## Step 5: Test Database

```bash
pnpm db:test
```

This verifies everything is working and shows data counts.

## All-in-One Command

If you want to do setup + seed in one go:

```bash
pnpm db:reset
```

Or use the combined script:

```bash
pnpm db:init
```

## Test Credentials

After seeding, you can login with:

**Admin:**
- Username: `admin`
- Password: `Admin@123`

**User:**
- Email: `john.doe@example.com`
- Password: `User@123`

## Troubleshooting

### "role does not exist"
Create the PostgreSQL user first (see Step 1).

### "database does not exist"
Create the database (see Step 1).

### "password authentication failed"
Check your DATABASE_URL credentials in `.env`.

### "connection refused"
- Check if PostgreSQL is running: `pg_isready`
- Verify port 5432 is correct
- Check PostgreSQL is listening: `sudo netstat -tlnp | grep 5432`

### "permission denied"
Grant privileges to your user:
```sql
GRANT ALL PRIVILEGES ON DATABASE leiindias TO your_username;
```

## Available Scripts

- `pnpm db:setup` - Create database tables
- `pnpm db:seed` - Add dummy/test data
- `pnpm db:test` - Test and display data
- `pnpm db:reset` - Setup + seed
- `pnpm db:init` - Quick setup + basic seed
- `pnpm seed:admin` - Seed admin user only
