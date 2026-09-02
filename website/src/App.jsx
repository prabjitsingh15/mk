import { useEffect, useState } from 'react'
import './App.css'
import Shop from './pages/Shop.jsx'
import Bag from './pages/Bag.jsx'
import NewProduct from './pages/New product.jsx'
import OurStory from './pages/Our story.jsx'
import Checkout from './pages/Proceed to checkout.jsx'
import { addToCart, getCart } from '../utils/cart.js'
import { fetchProducts } from '../utils/api.js'

// Home page and route switcher for the BareAya storefront.
// It renders the landing page, product collections, and routes to the dedicated pages
// for shopping, the bag, checkout, story, and the launch product.
const products = [
  { name: 'BareAya Infrared & Blue Light Protection', size: '100 ml', price: '₹645', tag: 'Protection', description: 'A fine mist made for the digital world, designed to help protect skin from infrared and blue light exposure.', image: '/infrared-blue-light-protection.jpeg' },
  { name: 'Midnight Removing Balm', size: '50 gm', price: '₹1,150', tag: 'Clarity', description: 'A gentle cleansing balm that melts away makeup, sunscreen and impurities while keeping skin soft and nourished.', image: '/Screenshot%202026-08-23%20135609.png' },
  { name: 'Under Eye Balm', size: '15 ml', price: '₹600', tag: 'Hydration', description: 'Reduces dark circles and puffiness while keeping the under-eye area hydrated and refreshed.', image: '/Screenshot%202026-08-23%20135843.png' },
  { name: 'Lip Balm Beetroot', size: '8 gm jar', price: '₹300', tag: 'Hydration', description: 'Tinted lip balm enriched with beetroot extract that deeply nourishes, hydrates and gives a natural pink tint.', image: '/Screenshot%202026-08-23%20140042.png' },
  { name: 'Lip Balm Kesar', size: '8 gm jar', price: '₹300', tag: 'Hydration', description: 'Tinted lip balm enriched with kesar that nourishes, hydrates and gives a natural glow to your lips.', image: '/Screenshot%202026-08-23%20140213.png' },
  { name: 'Night Balm', size: '50 gm', price: '₹999', tag: 'Hydration', description: 'A nourishing night balm for a soft, comfortable skin ritual while you sleep.', image: '/Screenshot%202026-08-23%20141130.png' },
  { name: 'Dry Face Wash', size: '50 gm', price: '₹850', tag: 'Clarity', description: 'A chemical-free powder cleanser enriched with botanical ingredients for a gentle, balanced cleanse.', image: '/Screenshot%202026-08-23%20141329.png' },
  { name: 'BareAya Hydra Blast', size: '50 gm', price: '₹799', tag: 'Hydration', description: 'Deep hydration cream enriched with shea butter, aloe and botanical oils for long-lasting moisture.', image: '/Screenshot%202026-08-23%20141522.png' },
  { name: 'Aloe Activator', size: '38 ml', price: '₹300', tag: 'Hydration', description: 'Lightweight aloe-based hydrator enriched with rose water and vitamin E for everyday nourishment.', image: '/Screenshot%202026-08-23%20141701.png' },
  { name: 'Skin Tonic', size: '50 gm', price: '₹300', tag: 'Protection', description: 'A refreshing botanical tonic that hydrates, balances and revitalizes skin for a healthy, radiant look.', image: '/Screenshot%202026-08-23%20141829.png' },
]

const benefits = [
  ['01', 'All skin types', 'Thoughtful formulas that meet your skin where it is.'],         
  ['02', 'Pure organic', 'Clean, considered ingredients with nothing unnecessary.'],
  ['03', 'Natural care', 'Nature-led rituals made for a healthy, lasting glow.'],
]

/**
 * Formats a numeric price into the Indian currency style used throughout the storefront.
 *
 * The value is preserved as a string when the data already comes from the server in a formatted form.
 */
function displayPrice(price) {
  return typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price
}

// Carousel content for the home-page product launch section.
const launchSlides = [
  { kicker: 'Just launched', title: 'Your shield in a digital world.', copy: 'Meet our fine mist for infrared and blue light protection. Easy to apply, easy to carry.', image: '/WhatsApp%20Image%202026-07-24%20at%206.14.10%20PM%20(3).jpeg' },
  { kicker: 'For every screen', title: 'Stay protected. Stay confident.', copy: 'A safe and gentle formula made for your everyday devices, from morning laptop to last scroll.', image: '/WhatsApp%20Image%202026-07-24%20at%206.14.10%20PM%20(3).jpeg' },
  { kicker: 'Fine mist. Maximum protection.', title: 'Protection that moves with you.', copy: 'Keep your skin ritual close with BareAya Infrared & Blue Light Protection.', image: '/WhatsApp%20Image%202026-07-24%20at%206.14.10%20PM%20(3).jpeg' },
]

/**
 * Renders the main BareAya landing page and chooses the correct page view based on the current URL.
 *
 * The component also keeps the bag count in sync with the browser cart, loads product data from the API,
 * and rotates the hero launch carousel automatically.
 */
function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [bagCount, setBagCount] = useState(() => getCart().reduce((total, item) => total + item.quantity, 0))
  const [catalogProducts, setCatalogProducts] = useState(products)
  const [launchSlide, setLaunchSlide] = useState(0)
  useEffect(() => {
    fetchProducts().then((serverProducts) => {
      const localProducts = new Map(products.map((product) => [product.name, product]))
      setCatalogProducts(serverProducts.map((product) => ({ ...localProducts.get(product.name), ...product, price: Number(product.price), tag: product.category })))
    }).catch(() => {})
  }, [])
  useEffect(() => {
    const timer = window.setInterval(() => setLaunchSlide((slide) => (slide + 1) % launchSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [])
  if (window.location.pathname.startsWith('/bag')) {
    return <Bag />
  }
  if (window.location.pathname.startsWith('/checkout')) {
    return <Checkout />
  }
  if (window.location.pathname.startsWith('/new-product')) {
    return <NewProduct />
  }
  if (window.location.pathname.startsWith('/our-story')) {
    return <OurStory />
  }
  if (window.location.pathname.startsWith('/shop')) {
    return <Shop />
  }

  const filters = ['All', 'Hydration', 'Clarity', 'Protection']
  const visibleProducts = (activeFilter === 'All' ? catalogProducts : catalogProducts.filter((product) => product.tag === activeFilter)).slice(0, 4)
  const addToBag = (product) => {
    const nextCart = addToCart({ ...product, price: typeof product.price === 'number' ? product.price : Number(product.price.replace(/[₹,]/g, '')) })
    setBagCount(nextCart.reduce((total, item) => total + item.quantity, 0))
  }
  const moveLaunchSlide = (direction) => setLaunchSlide((slide) => (slide + direction + launchSlides.length) % launchSlides.length)

  return (
    <div className="site-shell">
      <div className="announcement">Free delivery across India <span>✦</span> Skin-first. Always.</div>
      <header className="header"><a className="logo-link" href="#top" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Main navigation"><a href="/shop/" onClick={() => setMenuOpen(false)}>Shop</a><a href="/our-story/" onClick={() => setMenuOpen(false)}>Our story</a><a href="#ritual" onClick={() => setMenuOpen(false)}>Skin rituals</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></nav><div className="header-actions"><a href="/bag/" aria-label="Shopping bag">Bag ({bagCount})</a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button></div></header>
      <main id="top">
        <section className="hero-section"><div className="hero-copy"><p className="eyebrow">Nature, made personal</p><h1>Good skin<br /><em>starts here.</em></h1><p className="hero-text">Clean, uncomplicated skincare that brings out the skin you already have.</p><a className="button button-dark" href="#shop">Explore the edit <span>↗</span></a></div><div className="hero-visual"><div className="hero-sticker">gentle<br />by nature</div><img src="https://bareaya.in/wp-content/uploads/2021/08/skin-cleanser-template-gallery-img-6.jpg" alt="BareAya skincare ritual" /></div><div className="hero-note">01 <span>of</span> 04<br /><b>Consciously created<br />for daily rituals</b></div></section>
        <section className="launch-carousel" aria-label="New product launch"><div className="launch-track" style={{ transform: `translateX(-${launchSlide * 100}%)` }}>{launchSlides.map((slide) => <article className="launch-slide" key={slide.title}><div className="launch-copy"><p className="eyebrow">{slide.kicker}</p><h2>{slide.title}</h2><p>{slide.copy}</p><a className="button button-light" href="/new-product/">Discover the launch <span>↗</span></a></div><div className="launch-image"><img src={slide.image} alt="BareAya Infrared and Blue Light Protection" /></div></article>)}</div><div className="launch-controls"><button onClick={() => moveLaunchSlide(-1)} aria-label="Previous launch slide">←</button><div>{launchSlides.map((slide, index) => <button className={launchSlide === index ? 'launch-dot active' : 'launch-dot'} key={slide.title} onClick={() => setLaunchSlide(index)} aria-label={`Show launch slide ${index + 1}`} />)}</div><button onClick={() => moveLaunchSlide(1)} aria-label="Next launch slide">→</button></div></section>
        <section className="promise-bar"><span>Formulated in India</span><span>•</span><span>Cruelty free</span><span>•</span><span>Made with care</span><span>•</span><span>For every kind of skin</span></section>
        <section className="shop-section section-pad" id="shop"><div className="section-heading"><div><p className="eyebrow">The good stuff</p><h2>Best sellers</h2></div><a className="text-link" href="/shop/">Shop all <span>↗</span></a></div><div className="filters">{filters.map((filter) => <button className={activeFilter === filter ? 'filter active' : 'filter'} key={filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}><div className="product-image"><span className="product-tag">{product.tag}</span><img src={product.image} alt={product.name} /><button onClick={() => addToBag(product)} aria-label={`Add ${product.name} to bag`}>+</button></div><div className="product-info"><div><h3>{product.name}</h3><small>{product.size}</small></div><p>{displayPrice(product.price)}</p></div><p className="product-description">{product.description}</p></article>)}</div></section>
        <section className="story-section section-pad" id="story"><div className="story-image"><img src="https://bareaya.in/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-22-at-1.59.22-PM.jpeg" alt="Chandni Anand, founder of BareAya" /></div><div className="story-copy"><p className="eyebrow">A little more human</p><h2>Meet the founder</h2><p>BareAya was born from a simple belief: skincare should gently nourish, heal, and enhance your skin’s natural glow. We pair clean beauty with nature-led care to make everyday rituals feel fresh, honest, and yours.</p><p className="signature">Chandni Anand</p><a className="text-link" href="/our-story/">Read our story <span>↗</span></a></div></section>
        <section className="benefit-section section-pad" id="ritual"><div className="section-heading"><div><p className="eyebrow">The BareAya way</p><h2>Simple care.<br /><em>Real results.</em></h2></div><p className="heading-aside">A considered approach to your skin, from the first cleanse to the last drop.</p></div><div className="benefit-grid">{benefits.map(([number, title, text]) => <div className="benefit" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
        <section className="testimonial"><p className="eyebrow">Kind words</p><blockquote>“My skin feels hydrated, smooth and refreshed. The quality, texture and results are amazing.”</blockquote><p className="quote-author">Harneet Kaur <span>★★★★★</span></p></section><section className="cta-section"><div><p className="eyebrow">Your skin, understood</p><h2>Find your<br /><em>perfect ritual.</em></h2></div><a className="button button-light" href="https://forms.gle/hnXaa2f2Dnn5TdAG7" target="_blank" rel="noreferrer">Start skin analysis <span>↗</span></a></section>
      </main><footer id="contact"><div className="footer-brand"><a className="logo-link" href="#top"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><p>Natural care for skin that feels like you.</p></div><div className="footer-links"><a href="#shop">Shop</a><a href="#story">About</a><a href="https://bareaya.in/contact/">Contact</a><a href="https://www.instagram.com/bareaya.skin/">Instagram ↗</a></div><p className="copyright">© 2026 BareAya</p></footer>
    </div>
  )
}

export default App
