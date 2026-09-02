// Local cart state stored in browser storage so the storefront can keep items between page visits.
const CART_KEY = 'bareaya-cart'

/**
 * Reads the saved cart from localStorage.
 *
 * The function safely returns an empty array on parse failure so a broken cart entry does not crash the page.
 */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

// Persists the cart and broadcasts a custom event so all pages can refresh their bag counts.
export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  localStorage.setItem('bareaya-cart-count', String(cart.reduce((total, item) => total + item.quantity, 0)))
  window.dispatchEvent(new Event('bareaya-cart-updated'))
}

/**
 * Adds a product to the cart or increments the quantity when the same item is already present.
 *
 * The function returns the updated cart array so callers can immediately update the UI count.
 */
export function addToCart(product) {
  const cart = getCart()
  const existingItem = cart.find((item) => item.name === product.name)
  const nextCart = existingItem
    ? cart.map((item) => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
    : [...cart, { ...product, quantity: 1 }]
  saveCart(nextCart)
  return nextCart
}

export function updateCartQuantity(name, quantity) {
  const cart = getCart()
  const nextCart = quantity > 0
    ? cart.map((item) => item.name === name ? { ...item, quantity } : item)
    : cart.filter((item) => item.name !== name)
  saveCart(nextCart)
  return nextCart
}

export function removeFromCart(name) {
  return updateCartQuantity(name, 0)
}
