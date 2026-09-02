import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { initializeDatabase, pool } from './db.js'
import { sendOrderEmail } from './mailer.js'
import { createRateLimiter, readRateLimitConfig } from './rateLimit.js'

// BareAya backend API.
// This service exposes product and order endpoints, validates incoming order data,
// stores the information in MySQL, and sends a notification email for each order.
const app = express()
const port = globalThis.process?.env.PORT || 3001
const rateLimits = readRateLimitConfig(globalThis.process?.env)
const authLimiter = createRateLimiter(rateLimits.auth)
const publicLimiter = createRateLimiter(rateLimits.public)
const userLimiter = createRateLimiter(rateLimits.user)

const products = [
  { name: 'BareAya Infrared & Blue Light Protection', price: 645, size: '100 ml', category: 'Protection' },
  { name: 'Midnight Removing Balm', price: 1150, size: '50 gm', category: 'Clarity' },
  { name: 'Under Eye Balm', price: 600, size: '15 ml', category: 'Hydration' },
  { name: 'Lip Balm Beetroot', price: 300, size: '8 gm jar', category: 'Hydration' },
  { name: 'Lip Balm Kesar', price: 300, size: '8 gm jar', category: 'Hydration' },
  { name: 'Night Balm', price: 999, size: '50 gm', category: 'Hydration' },
  { name: 'Dry Face Wash', price: 850, size: '50 gm', category: 'Clarity' },
  { name: 'BareAya Hydra Blast', price: 799, size: '50 gm', category: 'Hydration' },
  { name: 'Aloe Activator', price: 300, size: '38 ml', category: 'Hydration' },
  { name: 'Skin Tonic', price: 300, size: '50 gm', category: 'Protection' },
]

app.use(cors())
app.use(express.json())

// Apply rate limits to sensitive and public API groups before the route handlers fire.
app.use('/api/auth', authLimiter)
app.use('/api/health', publicLimiter)
app.use('/api/products', publicLimiter)
app.use('/api/orders', userLimiter)

// Default landing endpoint used for smoke testing the backend and listing the main routes.
app.get('/', (_request, response) => response.json({ name: 'BareAya API', status: 'running', frontend: 'http://localhost:5173', endpoints: ['/api/health', '/api/products', '/api/orders'] }))

// Health check for deployment and local startup validation.
app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1')
    return response.json({ status: 'ok', database: 'mysql' })
  } catch {
    return response.status(503).json({ status: 'error', database: 'unavailable' })
  }
})

// Returns the product catalog stored in MySQL for the Storefront UI.
app.get('/api/products', async (_request, response) => {
  const [rows] = await pool.query('SELECT id, name, price, size, category FROM products ORDER BY id')
  return response.json(rows)
})

// Creates a new order after validating the customer details, delivery address, and cart items.
app.post('/api/orders', async (request, response) => {
  const { customer, address, paymentMethod, items } = request.body
  if (!customer?.email || !customer?.phone || !address?.name || !address?.line || !address?.city || !address?.state || !address?.pin || !Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ message: 'Complete customer, address, and cart details are required.' })
  }

  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || !item.name)) return response.status(400).json({ message: 'One or more cart items are invalid.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const names = items.map((item) => item.name)
    const placeholders = names.map(() => '?').join(', ')
    const [productsInOrder] = await connection.query(`SELECT id, name, price, size, category FROM products WHERE name IN (${placeholders})`, names)
    if (productsInOrder.length !== items.length) return response.status(400).json({ message: 'One or more cart items are invalid.' })
    const orderItems = items.map((item) => {
      const product = productsInOrder.find((entry) => entry.name === item.name)
      return { ...product, quantity: item.quantity, lineTotal: Number(product.price) * item.quantity }
    })
    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const orderId = `BA-${Date.now()}`
    await connection.query('INSERT INTO orders (id, customer_email, customer_phone, address_name, address_line, address_city, address_state, address_pin, payment_method, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [orderId, customer.email, customer.phone, address.name, address.line, address.city, address.state, address.pin, paymentMethod || 'cod', total])
    for (const item of orderItems) await connection.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)', [orderId, item.id, item.name, item.quantity, item.price, item.lineTotal])
    await connection.commit()
    let emailSent = false
    try {
      emailSent = await sendOrderEmail({ id: orderId, customer, address, paymentMethod: paymentMethod || 'cod', items: orderItems, total })
    } catch (error) {
      console.error('Order email sending failed after order was saved:', error)
    }
    return response.status(201).json({ orderId, total, status: 'received', emailSent })
  } catch (error) {
    await connection.rollback()
    return response.status(500).json({ message: 'Unable to create order.', detail: error.message })
  } finally {
    connection.release()
  }
})

// Lists all saved orders together with the ordered items for an admin or internal dashboard view.
app.get('/api/orders', async (_request, response) => {
  const [orders] = await pool.query('SELECT id, customer_email, customer_phone, address_name, address_line, address_city, address_state, address_pin, payment_method, total, status, created_at FROM orders ORDER BY created_at DESC')
  const [items] = await pool.query('SELECT order_id, product_name AS name, quantity, unit_price AS price, line_total AS lineTotal FROM order_items')
  return response.json(orders.map((order) => ({ ...order, items: items.filter((item) => item.order_id === order.id) })))
})

// Fetches a single order and its line items using the generated order ID.
app.get('/api/orders/:orderId', async (request, response) => {
  const [orders] = await pool.query('SELECT id, customer_email, customer_phone, address_name, address_line, address_city, address_state, address_pin, payment_method, total, status, created_at FROM orders WHERE id = ?', [request.params.orderId])
  if (!orders.length) return response.status(404).json({ message: 'Order not found.' })
  const [items] = await pool.query('SELECT product_name AS name, quantity, unit_price AS price, line_total AS lineTotal FROM order_items WHERE order_id = ?', [request.params.orderId])
  return response.json({ ...orders[0], items })
})

// Attempt to initialize database with retry logic
async function startServer() {
  let dbConnected = false
  let retryCount = 0
  const maxRetries = 5

  while (!dbConnected && retryCount < maxRetries) {
    try {
      await initializeDatabase(products)
      dbConnected = true
      console.log('✓ Database connection established')
    } catch (error) {
      retryCount++
      console.warn(`⚠ Database connection attempt ${retryCount}/${maxRetries} failed:`, error.message)
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds before retrying
      }
    }
  }

  if (!dbConnected) {
    console.warn('⚠ Could not connect to MySQL database. Server will start, but database operations may fail.')
    console.warn('⚠ Make sure MySQL is running and accessible at the configured host and port.')
  }

  app.listen(port, () => {
    console.log(`✓ BareAya API running at http://localhost:${port}`)
    if (!dbConnected) {
      console.warn('⚠ Database is not connected. Please verify MySQL is running.')
    }
  })
}

startServer().catch((error) => {
  console.error('Fatal error:', error.message)
  globalThis.process.exitCode = 1
})
