# Database Setup Scripts

This directory contains scripts for setting up and managing the database.

## Prerequisites

1. **PostgreSQL Database**: Make sure PostgreSQL is installed and running
2. **Environment Variable**: Set `DATABASE_URL` in your `.env` file
   ```bash
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

## Quick Start

### 1. Create Database (if not exists)

```bash
# Connect to PostgreSQL and create database
createdb leiindias
# Or using psql:
psql -U postgres -c "CREATE DATABASE leiindias;"
```

### 2. Setup Database Schema

This will create all tables and indexes:

```bash
pnpm db:setup
# Or directly:
node scripts/setup-db.mjs
```

### 3. Seed Dummy Data

This will populate the database with test data:

```bash
pnpm db:seed
# Or directly:
node scripts/seed-data.mjs
```

### 4. Test Database

Verify that everything is set up correctly:

```bash
pnpm db:test
# Or directly:
node scripts/test-db.mjs
```

### 5. Reset Database (Setup + Seed)

Run both setup and seed in one command:

```bash
pnpm db:reset
```

## Available Scripts

- `pnpm db:setup` - Create database tables and indexes
- `pnpm db:seed` - Add dummy/test data to database
- `pnpm db:test` - Test database connection and display data counts
- `pnpm db:reset` - Reset database (setup + seed)
- `pnpm seed:admin` - Seed admin user only

## Test Data Credentials

After seeding, you can use these credentials:

### Admin Users
- **Username**: `admin`
- **Password**: `Admin@123`
- **Username**: `superadmin`
- **Password**: `Admin@123`

### Regular Users
- **Email**: `john.doe@example.com`
- **Password**: `User@123`
- **Email**: `jane.smith@example.com`
- **Password**: `User@123`
- **Email**: `bob.johnson@example.com`
- **Password**: `User@123`

## What Gets Seeded

- **2 Admin users** (admin, superadmin)
- **3 Regular users** (customers)
- **4 Categories** (Connectors, Cables, Terminals, Switches)
- **5 Products** (various electrical components)
- **2 Orders** with order items
- **2 Inquiries** (contact form submissions)
- **1 Contact info** entry
- **3 Blog posts** (2 published, 1 draft)
- **2 Career listings**
- **3 Resources** (document links)

## Troubleshooting

### Database Connection Error

If you get a connection error:
1. Verify PostgreSQL is running: `pg_isready` or `sudo systemctl status postgresql`
2. Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
3. Ensure database exists: `psql -l` to list databases

### Permission Errors

If you get permission errors:
1. Check PostgreSQL user permissions
2. Ensure the database user has CREATE privileges
3. Try connecting manually: `psql $DATABASE_URL`

### Port Already in Use

If port 5432 is in use:
1. Check what's using it: `sudo lsof -i :5432`
2. Update DATABASE_URL with correct port
3. Or stop conflicting service
