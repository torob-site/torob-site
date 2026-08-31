/**
 * Format a price number to Persian locale with "تومان" suffix
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "";
  return `${price.toLocaleString("fa-IR")} تومان`;
}

/**
 * Format a price number to Persian locale without "تومان" suffix
 */
export function formatPriceNumber(price: number | null | undefined): string {
  if (price == null) return "";
  return price.toLocaleString("fa-IR");
}

/**
 * Format a date string to Persian date
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fa-IR");
}

/**
 * Format a date string to Persian time (HH:mm)
 */
export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
