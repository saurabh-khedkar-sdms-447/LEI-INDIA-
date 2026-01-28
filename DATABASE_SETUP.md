# Database Setup Guide

Follow these steps to set up and test your database.

## Step 1: Install PostgreSQL (if not installed)

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

## Step 2: Create Database

```bash
# Switch to postgres user (Linux)
sudo -u postgres psql

# Or connect directly (macOS/if you have a postgres user)
psql -U postgres

# Then create database:
CREATE DATABASE leiindias;
\q
```

## Step 3: Set Environment Variable

Create a `.env` file in the project root:

```bash
# Copy this to .env file
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/leiindias
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Note**: Replace `your_password` with your PostgreSQL password. If no password is set, use:
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/leiindias
```

## Step 4: Setup Database Schema

```bash
pnpm db:setup
```

This will create all tables and indexes defined in `prisma/schema.sql`.

## Step 5: Seed Dummy Data

```bash
pnpm db:seed
```

This will populate the database with test data including:
- Admin users
- Regular users
- Categories
- Products
- Orders
- Inquiries
- Blog posts
- Career listings
- Resources

## Step 6: Test Database

```bash
pnpm db:test
```

This will display:
- Connection status
- Record counts for each table
- Sample data from key tables

## Quick Reset

To reset everything (setup + seed):

```bash
pnpm db:reset
```

## Test Credentials

After seeding, use these credentials:

**Admin:**
- Username: `admin`
- Password: `Admin@123`

**User:**
- Email: `john.doe@example.com`
- Password: `User@123`

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `pg_isready` or `sudo systemctl status postgresql`
- Check if port 5432 is correct in DATABASE_URL

### Authentication Failed
- Verify username/password in DATABASE_URL
- Check PostgreSQL authentication settings in `pg_hba.conf`

### Database Does Not Exist
- Create it manually: `createdb leiindias` or use `psql` to create it

### Permission Denied
- Ensure your PostgreSQL user has CREATE privileges
- Try: `GRANT ALL PRIVILEGES ON DATABASE leiindias TO postgres;`
