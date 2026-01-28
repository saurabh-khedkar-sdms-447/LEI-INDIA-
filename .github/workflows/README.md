# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## CI Workflow (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches:

1. **Linting**: Runs `pnpm lint` to check code quality
2. **Unit Tests**: Runs Jest unit tests with coverage reporting
3. **Build**: Verifies the application builds successfully
4. **E2E Tests**: Runs Playwright end-to-end tests

### Requirements

- PostgreSQL service (provided by GitHub Actions)
- Node.js 20
- pnpm 9.0.0

### Environment Variables

The workflow uses the following environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time

### Test Artifacts

Test results and reports are uploaded as artifacts and retained for 30 days.
