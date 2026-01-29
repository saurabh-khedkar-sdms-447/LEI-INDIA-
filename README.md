# Lei Indias

A modern e-commerce platform built with Next.js 14, featuring product management, RFQ (Request for Quote) system, blog, careers, and comprehensive admin dashboard.

## 🚀 Features

- **Product Management**: Browse, filter, and compare products with advanced search capabilities
- **RFQ System**: Request for Quote functionality for bulk orders
- **User Authentication**: Secure JWT-based authentication for customers and admins
- **Admin Dashboard**: Comprehensive admin panel for managing products, categories, blogs, careers, and more
- **Blog & Resources**: Content management system for blogs and resources
- **Career Management**: Job posting and application system
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components
- **Database**: PostgreSQL with Prisma schema
- **Security**: CSRF protection, rate limiting, input sanitization

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 9.0.0 (package manager)
- **PostgreSQL** 12+ database
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/leiindias.git
cd leiindias
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values (see [Environment Variables](#environment-variables) section).

### 4. Set Up Database

1. Create a PostgreSQL database:
```bash
createdb leiindias
```

2. Run the database schema:
```bash
psql -d leiindias -f prisma/schema.sql
```

3. (Optional) Grant permissions:
```bash
psql -d leiindias -f prisma/grant-permissions.sql
```

4. Initialize the database (if needed):
```bash
# The app will auto-initialize on first run, or you can run:
node -r dotenv/config src/initDatabase.ts
```

### 5. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000` (or the port specified in your `.port` file).

## 🔧 Environment Variables

Create a `.env` file with the following variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/leiindias

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
```

### Optional Variables

```env
# Public URLs (for production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Logging
LOG_LEVEL=info

# Error Reporting (Sentry)
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

## 📜 Available Scripts

- `pnpm dev` - Start development server with custom port handling
- `pnpm dev:fixed` - Start development server on default port 3000
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server with custom port handling
- `pnpm start:fixed` - Start production server on default port 3000
- `pnpm start:prod` - Start production server with NODE_ENV=production
- `pnpm lint` - Run ESLint
- `pnpm check:console-logs` - Check for console.log statements

## 🏗️ Project Structure

```
leiindias/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin routes
│   ├── (site)/            # Public site routes
│   └── api/               # API routes
├── components/            # React components
│   ├── features/          # Feature-specific components
│   ├── shared/            # Shared components
│   ├── ui/                # UI primitives (Radix UI)
│   └── widgets/           # Widget components
├── lib/                   # Utility libraries
├── store/                 # Zustand state management
├── hooks/                 # Custom React hooks
├── prisma/                # Database schema
├── public/                # Static assets
└── scripts/               # Build and utility scripts
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t leiindias .
```

### Run Docker Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/leiindias \
  -e JWT_SECRET=your-jwt-secret \
  -e NODE_ENV=production \
  leiindias
```

### Docker Compose (Example)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/leiindias
      - JWT_SECRET=your-jwt-secret
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=leiindias
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## ☁️ Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

### Railway

1. Push your code to GitHub
2. Create a new project in [Railway](https://railway.app)
3. Add a PostgreSQL database service
4. Add your application service
5. Connect your GitHub repository
6. Add environment variables
7. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- **Render**: Connect GitHub repo and add environment variables
- **DigitalOcean App Platform**: Similar setup to Railway
- **AWS/Azure/GCP**: Use container services or serverless functions

## 🔐 Security Features

- **CSRF Protection**: Token-based CSRF protection for state-changing operations
- **Rate Limiting**: In-memory rate limiting to prevent abuse
- **Input Sanitization**: HTML sanitization for user-generated content
- **JWT Authentication**: Secure token-based authentication
- **Security Headers**: Comprehensive security headers in Next.js config
- **Password Hashing**: bcryptjs for secure password storage

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Check for console logs
pnpm check:console-logs
```

## 📝 Database Management

### Initialize Database

The database will auto-initialize on first API call, or you can manually initialize:

```bash
node -r dotenv/config src/initDatabase.ts
```

### Database Schema

The schema is defined in `prisma/schema.sql`. Key tables include:
- `User` - Customer accounts
- `Admin` - Admin accounts
- `Product` - Product catalog
- `Category` - Product categories
- `Order` - Customer orders
- `Inquiry` - RFQ inquiries
- `Blog` - Blog posts
- `Career` - Job postings

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration. See `.github/workflows/` for workflow definitions.

- **CI Workflow**: Runs on every push/PR (lint, build, type check)
- **Deploy Workflow**: Deploys to production on main branch (if configured)

---

Built with ❤️ using Next.js, TypeScript, and PostgreSQL
