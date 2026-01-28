# Testing Guide

This project uses Jest for unit tests and Playwright for end-to-end tests.

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug
```

## Test Structure

### Unit Tests

Unit tests are located alongside the code they test:
- `lib/__tests__/` - Library function tests
- `app/api/**/__tests__/` - API route tests

### E2E Tests

E2E tests are located in the `e2e/` directory:
- `e2e/login.spec.ts` - Login flow tests
- `e2e/rfq.spec.ts` - RFQ submission flow tests
- `e2e/products.spec.ts` - Product browsing and filtering tests

## Writing Tests

### Unit Test Example

```typescript
import { generateToken, verifyToken } from '../jwt'

describe('JWT Library', () => {
  it('should generate and verify token', () => {
    const token = generateToken('user@example.com', 'customer')
    const decoded = verifyToken(token)
    expect(decoded?.username).toBe('user@example.com')
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/rfq')
})
```

## Test Coverage

The project aims for:
- **70% coverage** for branches, functions, lines, and statements
- Coverage reports are generated in the `coverage/` directory

## CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

See `.github/workflows/ci.yml` for the complete CI configuration.
