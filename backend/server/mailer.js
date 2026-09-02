import nodemailer from 'nodemailer'

// Email delivery is optional and only used when Gmail SMTP credentials are configured.
// This allows the storefront to notify the admin when a customer places an order.
const mailUser = globalThis.process?.env.MAIL_USER
const mailPassword = globalThis.process?.env.MAIL_APP_PASSWORD?.otbwdczsssoemvgy.replace(/\s+/g, '')
const notificationEmail = globalThis.process?.env.NOTIFICATION_EMAIL

if (!mailUser || !mailPassword || !notificationEmail) {
  console.warn('Mail credentials missing: set MAIL_USER, MAIL_APP_PASSWORD, and NOTIFICATION_EMAIL.')
}

const transporter = mailUser && mailPassword && notificationEmail
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: mailUser, pass: mailPassword } })
  : null

if (transporter) {
  transporter.verify()
    .then(() => console.log('Gmail SMTP connection verified'))
    .catch((error) => console.error('Gmail SMTP verification failed:', error.message, error.code || ''))
}

/**
 * Sends a formatted order notification email to the configured admin inbox.
 *
 * The function returns false when email credentials are missing so the order still saves
 * successfully and the storefront does not fail if mail is not configured.
 */
export async function sendOrderEmail(order) {
  if (!transporter) {
    console.warn('Order email skipped because mail configuration is incomplete.')
    return false
  }

  console.log(`Attempting to send order email for ${order.id}`)
  try {
    const itemRows = order.items.map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${item.lineTotal.toLocaleString('en-IN')}</td></tr>`).join('')
    await transporter.sendMail({
      from: `BareAya Orders <${mailUser}>`,
      to: notificationEmail,
      subject: `New BareAya order ${order.id}`,
      html: `<h2>New BareAya order</h2><p><strong>Order ID:</strong> ${order.id}</p><p><strong>Customer:</strong> ${order.customer.email}<br><strong>Phone:</strong> ${order.customer.phone}</p><p><strong>Delivery:</strong> ${order.address.name}, ${order.address.line}, ${order.address.city}, ${order.address.state} - ${order.address.pin}</p><table border="1" cellpadding="8" cellspacing="0"><thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table><p><strong>Payment:</strong> ${order.paymentMethod}<br><strong>Order total:</strong> ₹${order.total.toLocaleString('en-IN')}</p>`,
    })
    console.log(`Order email sent successfully for ${order.id}`)
    return true
  } catch (error) {
    console.error(`Order email sending failed for ${order.id}:`, error.message, error.code || '', error.responseCode || '')
    return false
  }
}
