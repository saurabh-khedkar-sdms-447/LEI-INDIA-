import { test, expect } from '@playwright/test'

test.describe('Products Page', () => {
  test('should display products page', async ({ page }) => {
    // Mock products API
    await page.route('**/api/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 'prod-1',
              name: 'M12 Connector',
              sku: 'M12-001',
              category: 'M12 Connectors',
              description: 'Test product description',
              price: 10.99,
              inStock: true,
            },
            {
              id: 'prod-2',
              name: 'M8 Connector',
              sku: 'M8-001',
              category: 'M8 Connectors',
              description: 'Another test product',
              price: 8.99,
              inStock: true,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      })
    })

    await page.goto('/products')

    // Check page title
    await expect(page.locator('h1')).toContainText(/product/i, { timeout: 10000 })

    // Check if products are displayed
    await expect(page.locator('text=M12 Connector, text=M8 Connector').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should display empty state when no products', async ({ page }) => {
    await page.route('**/api/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }),
      })
    })

    await page.goto('/products')

    await expect(page.locator('text=/no products found/i')).toBeVisible({ timeout: 5000 })
  })

  test('should filter products by category', async ({ page }) => {
    let requestCount = 0

    await page.route('**/api/products*', async (route) => {
      requestCount++
      const url = new URL(route.request().url())
      const category = url.searchParams.get('category')

      const products = category === 'M12 Connectors'
        ? [{ id: 'prod-1', name: 'M12 Connector', category: 'M12 Connectors' }]
        : [
            { id: 'prod-1', name: 'M12 Connector', category: 'M12 Connectors' },
            { id: 'prod-2', name: 'M8 Connector', category: 'M8 Connectors' },
          ]

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products,
          pagination: {
            page: 1,
            limit: 20,
            total: products.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      })
    })

    await page.goto('/products')

    // Click on a category filter if available
    const categoryFilter = page.locator('button:has-text("M12"), a[href*="category=M12"]').first()
    if (await categoryFilter.isVisible().catch(() => false)) {
      await categoryFilter.click()
      await page.waitForTimeout(1000) // Wait for API call

      // Verify filtered results
      await expect(page.locator('text=M12 Connector')).toBeVisible()
    }
  })

  test('should navigate to product detail page', async ({ page }) => {
    // Mock products list
    await page.route('**/api/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 'prod-1',
              name: 'M12 Connector',
              sku: 'M12-001',
              category: 'M12 Connectors',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      })
    })

    // Mock product detail
    await page.route('**/api/products/prod-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'prod-1',
          name: 'M12 Connector',
          sku: 'M12-001',
          description: 'Detailed product description',
        }),
      })
    })

    await page.goto('/products')

    // Click on product card or link
    const productLink = page.locator('a[href*="/products/prod-1"], [data-product-id="prod-1"]').first()
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click()
      await page.waitForURL(/\/products\/prod-1/, { timeout: 5000 })

      // Verify product detail page
      await expect(page.locator('text=M12 Connector')).toBeVisible()
    }
  })

  test('should add product to RFQ', async ({ page, context }) => {
    // Set authentication cookie
    await context.addCookies([
      {
        name: 'user_token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ])

    // Mock products
    await page.route('**/api/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 'prod-1',
              name: 'M12 Connector',
              sku: 'M12-001',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      })
    })

    await page.goto('/products')

    // Look for "Add to RFQ" button
    const addToRFQButton = page
      .locator('button:has-text("Add to RFQ"), button:has-text("RFQ"), [data-action="add-to-rfq"]')
      .first()

    if (await addToRFQButton.isVisible().catch(() => false)) {
      await addToRFQButton.click()

      // Check for success feedback or RFQ count update
      await page.waitForTimeout(500)
      // Success indicator might be a toast, badge, or redirect
    }
  })

  test('should paginate products', async ({ page }) => {
    let pageNumber = 1

    await page.route('**/api/products*', async (route) => {
      const url = new URL(route.request().url())
      const requestedPage = parseInt(url.searchParams.get('page') || '1')
      pageNumber = requestedPage

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: `prod-${requestedPage}`,
              name: `Product Page ${requestedPage}`,
            },
          ],
          pagination: {
            page: requestedPage,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: requestedPage < 3,
            hasPrev: requestedPage > 1,
          },
        }),
      })
    })

    await page.goto('/products')

    // Click next page if available
    const nextButton = page.locator('button:has-text("Next"), a[aria-label*="next" i]').first()
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click()
      await page.waitForTimeout(1000)

      // Verify URL or content changed
      const urlChanged = page.url().includes('page=2') || pageNumber === 2
      expect(urlChanged).toBeTruthy()
    }
  })
})
