import { useState } from 'react'
import { addToCart } from '../../utils/cart'

// Launch product detail page for the BareAya infrared and blue light protection item.
const product = {
  name: 'BareAya Infrared & Blue Light Protection',
  size: '100 ml',
  price: 645,
  category: 'Protection',
  tag: 'New protection ritual',
  image: '/infrared-blue-light-protection.jpeg',
  description: 'A fine mist made for the digital world. Lightweight, easy to carry and designed to help protect skin from infrared and blue light exposure.',
}

/**
 * Shows the new-product detail view and lets the user add one or more units to the bag.
 *
 * The page uses a small quantity control, then adds the unit count to the browser cart in a loop.
 */
function NewProduct() {
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  const handleAddToBag = () => {
    for (let index = 0; index < quantity; index += 1) addToCart(product)
    setMessage(`${quantity} item${quantity > 1 ? 's' : ''} added to your bag`)
    window.setTimeout(() => setMessage(''), 2200)
  }

  return (
    <div className="new-product-page">
      <div className="announcement">Free delivery across India <span></span> Skin-first. Always.</div>
      <header className="product-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><nav><a href="/">Home</a><a href="/shop/">Shop</a><a href="/our-story/">Our story</a></nav><a className="product-bag" href="/bag/">View bag ↗</a></header>
      <main>
        <div className="product-breadcrumb"><a href="/shop/">Shop</a><span>/</span>{product.name}</div>
        <section className="product-detail"><div className="product-feature-image"><img src={product.image} alt="BareAya Infrared and Blue Light Protection product feature" /></div><div className="product-copy"><p className="eyebrow">{product.tag}</p><h1>{product.name}</h1><p className="product-price">₹{product.price.toLocaleString('en-IN')} <span>· {product.size}</span></p><p className="product-lead">{product.description}</p><div className="product-highlights"><div><b>01</b><span>Infrared & blue light protection</span></div><div><b>02</b><span>Reduces eye strain</span></div><div><b>03</b><span>Ideal for all screens</span></div></div><div className="purchase-row"><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div><button className="product-add-button" onClick={handleAddToBag}>Add to bag <span>↗</span></button></div><p className="product-note">Fine mist · easy to apply · easy to carry</p></div></section>
        <section className="product-story"><p className="eyebrow">Your shield in a digital world</p><h2>Protection that<br /><em>moves with you.</em></h2><p>From your first screen to your last scroll, keep this lightweight mist close. A safe and gentle formula for the devices that shape your everyday.</p><a className="text-link" href="/shop/">Continue shopping <span>↗</span></a></section>
      </main>
      <footer className="product-footer"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /><span>© 2026 BareAya</span></footer>
      {message && <div className="cart-toast" role="status">{message} <span>✓</span></div>}
    </div>
  )
}

export default NewProduct
