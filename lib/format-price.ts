/**
 * Format price in Indian Rupees (₹)
 * @param price - The price value (number)
 * @param priceType - Optional price type (per_unit, per_pack, per_bulk)
 * @returns Formatted price string with ₹ symbol
 */
export function formatPrice(price: number | string | null | undefined, priceType?: string): string {
  if (price == null) {
    return 'N/A'
  }

  try {
    const priceNum = typeof price === 'number' 
      ? price 
      : parseFloat(String(price))
    
    if (isNaN(priceNum) || !isFinite(priceNum)) {
      return 'N/A'
    }

    // Format with Indian number system (lakhs, crores)
    // For simplicity, using standard formatting with ₹ symbol
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceNum)

    // Add price type suffix if provided
    if (priceType) {
      const typeLabels: Record<string, string> = {
        per_unit: 'per unit',
        per_pack: 'per pack',
        per_bulk: 'per bulk',
      }
      const label = typeLabels[priceType] || priceType
      return `${formatted} (${label})`
    }

    return formatted
  } catch {
    return 'N/A'
  }
}

/**
 * Format price as simple string with ₹ symbol (without currency formatting)
 * Useful for cases where you want more control over formatting
 */
export function formatPriceSimple(price: number | string | null | undefined): string {
  if (price == null) {
    return 'N/A'
  }

  try {
    const priceNum = typeof price === 'number' 
      ? price 
      : parseFloat(String(price))
    
    if (isNaN(priceNum) || !isFinite(priceNum)) {
      return 'N/A'
    }

    // Format with 2 decimal places and ₹ symbol
    return `₹${priceNum.toFixed(2)}`
  } catch {
    return 'N/A'
  }
}
