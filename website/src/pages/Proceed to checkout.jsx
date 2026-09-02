import { useState } from 'react'
import { getCart, saveCart } from '../../utils/cart'


function formatPrice(price) {
	return `₹${price.toLocaleString('en-IN')}`
}

function Checkout() {
	const [cart] = useState(() => getCart())
	const [submitted, setSubmitted] = useState(false)
	const [submitError, setSubmitError] = useState('')
	const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
	const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

	const handleSubmit = async (event) => {
		event.preventDefault()
		setSubmitError('')
		const formData = new FormData(event.currentTarget)
		const payload = {
			customer: { email: formData.get('email'), phone: formData.get('phone') },
			address: { name: formData.get('name'), line: formData.get('address'), city: formData.get('city'), state: formData.get('state'), pin: formData.get('pin') },
			paymentMethod: formData.get('payment'),
			items: cart.map((item) => ({ name: item.name, quantity: item.quantity })),
		}
		try {
			const apiUrl = import.meta.env.VITE_API_URL || '/api'
			const response = await fetch(`${apiUrl}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
			const responseText = await response.text()
			let result
			try {
				result = responseText ? JSON.parse(responseText) : {}
			} catch {
				throw new Error('The server returned an invalid response. Please restart the backend.')
			}
			if (!response.ok) throw new Error(result.message || 'Unable to place your order.')
			setSubmitted(true)
			saveCart([])
		} catch (error) {
			setSubmitError(error.message || 'Unable to place your order. Please try again.')
		}
	}

	if (submitted) {
		return (
			<div className="checkout-page"><div className="announcement">Free delivery across India <span>✦</span> Skin-first. Always.</div><header className="checkout-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a></header><main className="order-success"><p className="success-mark">✓</p><p className="eyebrow">Order received</p><h1>Thank you for<br /><em>choosing BareAya.</em></h1><p>Your order has been placed successfully. We will share delivery updates with you shortly.</p><a className="button button-dark" href="/shop/">Continue shopping <span>↗</span></a></main><footer className="checkout-footer"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /><span>© 2026 BareAya</span></footer></div>
		)
	}

	if (cart.length === 0) {
		return <div className="checkout-page"><div className="announcement">Free delivery across India <span>✦</span> Skin-first. Always.</div><header className="checkout-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a></header><main className="checkout-empty"><p className="eyebrow">Nothing to check out</p><h1>Your bag is empty.</h1><a className="button button-dark" href="/shop/">Explore the shop <span>↗</span></a></main></div>
	}

	return (
		<div className="checkout-page"><div className="announcement">Free delivery across India <span>✦</span> Skin-first. Always.</div><header className="checkout-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><div className="checkout-steps"><span className="active">01 Details</span><span>02 Payment</span></div><a className="checkout-back" href="/bag/">Back to bag</a></header><main className="checkout-content"><form className="checkout-form" onSubmit={handleSubmit}><div className="checkout-title"><p className="eyebrow">Complete your ritual</p><h1>Checkout</h1><p>We only need a few details to get your BareAya order moving.</p></div><fieldset><legend>Contact details</legend><div className="field-grid"><label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" required pattern="[0-9]{10}" placeholder="10 digit mobile number" /></label></div></fieldset><fieldset><legend>Delivery address</legend><div className="field-grid"><label>Full name<input name="name" type="text" required placeholder="Your name" /></label><label>Address<input name="address" type="text" required placeholder="House no. and street" /></label><label>City<input name="city" type="text" required placeholder="City" /></label><label>State<input name="state" type="text" required placeholder="State" /></label><label>PIN code<input name="pin" type="text" required pattern="[0-9]{6}" placeholder="6 digit PIN" /></label></div></fieldset><fieldset><legend>Payment method</legend><label className="payment-option"><input type="radio" name="payment" value="cod" defaultChecked /> <span><b>Cash on delivery</b><small>Pay when your order arrives</small></span></label><label className="payment-option"><input type="radio" name="payment" value="online" /> <span><b>Online payment</b><small>UPI, cards and net banking</small></span></label></fieldset><button className="place-order" type="submit">Place order <span>↗</span></button>{submitError && <p className="checkout-error" role="alert">{submitError}</p>}<p className="checkout-note">By placing your order, you agree to our terms and privacy policy.</p></form><aside className="checkout-summary"><p className="eyebrow">Order summary</p><div className="summary-items">{cart.map((item) => <div className="summary-item" key={item.name}><img src={item.image} alt="" /><div><h2>{item.name}</h2><p>Qty {item.quantity} · {item.size}</p></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><div className="summary-line"><span>Items ({itemCount})</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-line"><span>Delivery</span><strong>Free</strong></div><hr /><div className="summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div></aside></main><footer className="checkout-footer"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /><span>Secure checkout · © 2026 BareAya</span></footer></div>
	)
}

export default Checkout
