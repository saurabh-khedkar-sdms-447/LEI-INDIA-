import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page correctly', async ({ page }) => {
    await expect(page.locator('h1, [role="heading"]')).toContainText(/login/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    // Try to submit empty form
    await page.locator('button[type="submit"]').click()

    // Check for email validation error
    const emailError = page.locator('text=/email/i').first()
    await expect(emailError).toBeVisible()

    // Enter invalid email
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('input[type="password"]').fill('123')
    await page.locator('button[type="submit"]').click()

    // Should show validation errors
    await expect(page.locator('text=/valid email/i')).toBeVisible()
    await expect(page.locator('text=/at least 6/i')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Mock API response for invalid credentials
    await page.route('**/api/users/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password' }),
      })
    })

    await page.locator('input[type="email"]').fill('wrong@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('text=/invalid email or password/i')).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/users/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
          },
        }),
        headers: {
          'Set-Cookie': 'user_token=mock-token; Path=/; HttpOnly',
        },
      })
    })

    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()

    // Should redirect to RFQ page or home
    await page.waitForURL(/\/(rfq|$)/, { timeout: 5000 })
  })

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]')
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toContainText(/register/i)
  })

  test('should have forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.locator('a[href*="password"], a:has-text("Forgot")')
    await expect(forgotPasswordLink.first()).toBeVisible()
  })
})
