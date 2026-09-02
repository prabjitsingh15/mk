import 'dotenv/config'
import mysql from 'mysql2/promise'

// Shared MySQL connection pool for the BareAya backend.
// The app uses this pool to read products, save orders, and create
// the required tables when the server starts.
export const pool = mysql.createPool({
  host: globalThis.process?.env.DB_HOST || 'localhost',
  port: Number(globalThis.process?.env.DB_PORT || 3306),
  user: globalThis.process?.env.DB_USER || 'root',
  password: globalThis.process?.env.DB_PASSWORD || '',
  database: globalThis.process?.env.DB_NAME || 'bareaya',
  waitForConnections: true,
  connectionLimit: 10,
})

/**
 * Creates the required product, order, and order item tables if they do not exist.
 *
 * The function also seeds the product catalog from the in-memory product list.
 * ON DUPLICATE KEY UPDATE keeps the database entries aligned with the current catalog
 * without creating duplicate rows when the server is restarted.
 */
export async function initializeDatabase(products) {
  const connection = await pool.getConnection()
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        size VARCHAR(40) NOT NULL,
        category VARCHAR(40) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(32) PRIMARY KEY,
        customer_email VARCHAR(190) NOT NULL,
        customer_phone VARCHAR(30) NOT NULL,
        address_name VARCHAR(160) NOT NULL,
        address_line VARCHAR(255) NOT NULL,
        address_city VARCHAR(100) NOT NULL,
        address_state VARCHAR(100) NOT NULL,
        address_pin VARCHAR(12) NOT NULL,
        payment_method VARCHAR(30) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(32) NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(160) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        line_total DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)
    for (const product of products) {
      await connection.query(
        'INSERT INTO products (name, price, size, category) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE price = VALUES(price), size = VALUES(size), category = VALUES(category)',
        [product.name, product.price, product.size, product.category],
      )
    }
  } finally {
    connection.release()
  }
}
