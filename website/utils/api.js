// Shared frontend helper for product requests.
// It uses the configured API base URL when available, otherwise it falls back to the same-origin /api route.
const apiUrl = import.meta.env.VITE_API_URL || '/api'

/**
 * Fetches the product catalog from the Express backend.
 *
 * The UI uses this function to populate the catalog page and to replace static placeholder data
 * when the API is available. If the request fails, the caller should handle the error gracefully.
 */
export async function fetchProducts() {
  const response = await fetch(`${apiUrl}/products`)
  if (!response.ok) throw new Error('Unable to load products from the server.')
  return response.json()
}
