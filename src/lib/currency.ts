/**
 * Currency formatter for Libyan market
 */

export const CURRENCY_CODE = "LYD";
export const CURRENCY_SYMBOL = "د.ل";

/**
 * Format a price with the Libyan Dinar currency symbol
 */
export function formatPrice(price: number | undefined | null, currency: string = CURRENCY_CODE): string {
  const symbol = currency === "LYD" ? CURRENCY_SYMBOL : currency;
  if (price === undefined || price === null) return `0 ${symbol}`;
  return `${price.toLocaleString()} ${symbol}`;
}

/**
 * Get the display symbol for a currency code
 */
export function getCurrencySymbol(currency: string = CURRENCY_CODE): string {
  return currency === "LYD" ? CURRENCY_SYMBOL : currency;
}
