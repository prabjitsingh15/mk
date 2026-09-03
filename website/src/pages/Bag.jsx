import { useEffect, useState } from 'react'
import { getCart, removeFromCart, updateCartQuantity } from '../../utils/cart'

// Shopping bag page.
// It reads the saved cart state, lets users change quantities, and shows the order subtotal.
function formatPrice(price) {
	return `₹${price.toLocaleString('en-IN')}`
}

/**
 * Renders the current bag contents and allows the user to adjust quantities or remove items.
 *
 * The page listens for cart update events so the bag stays synchronized across the app.
 */
function Bag() {
	const [cart, setCart] = useState(() => getCart())

	useEffect(() => {
		const syncCart = () => setCart(getCart())
		window.addEventListener('bareaya-cart-updated', syncCart)
		return () => window.removeEventListener('bareaya-cart-updated', syncCart)
	}, [])

	const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
	const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

	const changeQuantity = (name, quantity) => setCart(updateCartQuantity(name, quantity))
	const removeItem = (name) => setCart(removeFromCart(name))

	return (
		<div className="bag-page">
			<div className="announcement">Free delivery across India <span></span> Skin-first. Always.</div>
			<header className="bag-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><nav><a href="/">Home</a><a href="/shop/">Shop</a><a href="/our-story/">Our story</a></nav><span className="bag-count">Bag ({itemCount})</span></header>
			<main className="bag-content">
				<div className="bag-title"><p className="eyebrow">Your selection</p><h1>Your bag <em>({itemCount})</em></h1></div>
				{cart.length === 0 ? <section className="bag-empty"><p className="empty-mark">✦</p><h2>Your bag is waiting.</h2><p>Bring a little more care to your daily ritual.</p><a className="button button-dark" href="/shop/">Explore the shop <span>↗</span></a></section> : <section className="bag-layout"><div className="bag-items">{cart.map((item) => <article className="bag-item" key={item.name}><div className="bag-item-image"><img src={item.image} alt={item.name} /></div><div className="bag-item-details"><div><p className="bag-item-label">{item.category || item.tag}</p><h2>{item.name}</h2><p>{item.size}</p></div><button className="remove-button" onClick={() => removeItem(item.name)}>Remove</button></div><div className="bag-item-actions"><div className="quantity-control"><button onClick={() => changeQuantity(item.name, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.name, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><strong>{formatPrice(item.price * item.quantity)}</strong></div></article>)}</div><aside className="bag-summary"><p className="eyebrow">Order summary</p><div><span>Items ({itemCount})
					</span><strong>{formatPrice(subtotal)}
					</strong></div><div><span>Delivery</span><strong>Free</strong></div><hr /><div className="bag-total">
					<span>Total</span>
				<strong>{formatPrice(subtotal)}</strong>
				</div><a className="checkout-button" href="/checkout/">Proceed to checkout <span>↗</span></a>
				<p className="secure-note">Secure checkout · COD available across India</p></aside></section>}
			</main>
			<footer className="bag-footer"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /><span>© 2026 BareAya</span></footer>
		</div>
	)
}

export default Bag
