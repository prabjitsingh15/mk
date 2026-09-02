import { useEffect, useState } from 'react'
import { addToCart,getCart } from '../../utils/cart'
import { fetchProducts } from '../../utils/api'

// Storefront catalog page for browsing the BareAya product range.
// It supports search, category filtering, sorting, and adding products to the bag.
const products = [
  { name: 'BareAya Infrared & Blue Light Protection', size: '100 ml', price: 645, category: 'Protection', label: 'New protection ritual', image: '/infrared-blue-light-protection.jpeg', description: 'A fine mist made for the digital world, designed to help protect skin from infrared and blue light exposure.' },
  { name: 'Midnight Removing Balm', size: '50 gm', price: 1150, category: 'Clarity', label: 'Night ritual', image: '/dist/Screenshot%202026-08-23%20135609.png', description: 'A gentle cleansing balm that melts away makeup, sunscreen and impurities.' },
  { name: 'Under Eye Balm', size: '15 ml', price: 600, category: 'Hydration', label: 'Care for eyes', image: '/dist/Screenshot%202026-08-23%20135843.png', description: 'Keeps the under-eye area hydrated and refreshed.' },
  { name: 'Lip Balm Beetroot', size: '8 gm jar', price: 300, category: 'Hydration', label: 'A soft tint', image: '/dist/Screenshot%202026-08-23%20140042.png', description: 'A nourishing beetroot tint for naturally soft, rosy lips.' },
  { name: 'Lip Balm Kesar', size: '8 gm jar', price: 300, category: 'Hydration', label: 'A natural glow', image: '/dist/Screenshot%202026-08-23%20140213.png', description: 'Kesar enriched care that nourishes and hydrates your lips.' },
  { name: 'Night Balm', size: '50 gm', price: 999, category: 'Hydration', label: 'While you sleep', image: '/dist/Screenshot%202026-08-23%20141130.png', description: 'A nourishing balm for a soft, comfortable night-time ritual.' },
  { name: 'Dry Face Wash', size: '50 gm', price: 850, category: 'Clarity', label: 'Gentle cleanse', image: '/dist/Screenshot%202026-08-23%20141329.png', description: 'A botanical powder cleanser for a gentle, balanced cleanse.' },
  { name: 'BareAya Hydra Blast', size: '50 gm', price: 799, category: 'Hydration', label: 'Deep hydration', image: '/dist/Screenshot%202026-08-23%20141522.png', description: 'Shea butter, aloe and botanical oils for lasting moisture.' },
  { name: 'Aloe Activator', size: '38 ml', price: 300, category: 'Hydration', label: 'Everyday aloe', image: '/dist/Screenshot%202026-08-23%20141701.png', description: 'A lightweight aloe hydrator with rose water and vitamin E.' },
  { name: 'Skin Tonic', size: '50 gm', price: 300, category: 'Protection', label: 'Botanical balance', image: '/dist/Screenshot%202026-08-23%20141829.png', description: 'A refreshing tonic that hydrates, balances and revitalizes.' },
]

const categories = ['All products', 'Hydration', 'Clarity', 'Protection']

/**
 * Converts a numeric product price into the storefront's standard Indian rupee format.
 */
function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`
}

/**
 * Displays the catalog and supports product search, filtering, sorting, and add-to-bag behavior.
 *
 * The page loads server product data when available and falls back to the local catalog list.
 */
function Shop() {
  const [catalogProducts, setCatalogProducts] = useState(products)
  const [category, setCategory] = useState('All products')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [bagCount, setBagCount] = useState(() => getCart().reduce((total, item) => total + item.quantity, 0))
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    fetchProducts().then((serverProducts) => {
      const localProducts = new Map(products.map((product) => [product.name, product]))
      setCatalogProducts(serverProducts.map((product) => ({ ...localProducts.get(product.name), ...product, price: Number(product.price), category: product.category })))
    }).catch(() => {})
  }, [])

  const addToBag = (productName) => {
    const nextCart = addToCart(catalogProducts.find((product) => product.name === productName))
    setBagCount(nextCart.reduce((total, item) => total + item.quantity, 0))
    setCartMessage(`${productName} added to your bag`)
    window.setTimeout(() => setCartMessage(''), 2200)
  }

  const visibleProducts = (() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'All products' || product.category === category
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
    return [...filtered].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : 0)
  })()

  return (
    <div className="shop-page">
      <div className="announcement">Free delivery across India <span>✦</span> Skin-first. Always.</div>
      <header className="shop-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><nav><a href="/">Home</a><a className="current" href="/shop/">Shop</a><a href="/our-story/">Our story</a></nav><a className="shop-bag" href="/bag/" aria-label="Shopping bag">Bag ({bagCount})</a></header>
      <main id="bag">
        <section className="shop-hero"><p className="eyebrow">The BareAya edit</p><h1>Skincare that<br /><em>feels like you.</em></h1><p>Thoughtful, chemical-free formulas for the rituals you return to every day.</p></section>
        <section className="catalog-wrap"><div className="catalog-top"><p><strong>{visibleProducts.length}</strong> products</p><label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" /></label><label className="sort-field">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div><div className="catalog-content"><aside className="catalog-nav"><p className="eyebrow">Browse by</p>{categories.map((item) => <button className={category === item ? 'catalog-filter active' : 'catalog-filter'} key={item} onClick={() => setCategory(item)}>{item}<span>→</span></button>)}<div className="catalog-note"><span>✦</span><p>Clean care,<br />made in India.</p></div></aside><div className="catalog-grid">{visibleProducts.length ? visibleProducts.map((product) => <article className="catalog-card" key={product.name}><div className="catalog-image"><span>{product.label}</span><img src={product.image} alt={product.name} /><button onClick={() => addToBag(product.name)} aria-label={`Add ${product.name} to bag`}>Add to bag <b>+</b></button></div><div className="catalog-info"><div><h2>{product.name}</h2><p>{product.size} <i>·</i> {product.description}</p></div><strong>{formatPrice(product.price)}</strong></div></article>) : <p className="empty-state">No products match your search.</p>}</div></div></section>
        <section className="shop-promise"><p className="eyebrow">Feel good about your routine</p><h2>Pure ingredients.<br /><em>Quiet confidence.</em></h2><a className="button button-light" href="/">Back to home <span>↗</span></a></section>{cartMessage && <div className="cart-toast" role="status">{cartMessage} <span>✓</span></div>}
      </main>
      <footer className="shop-footer"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /><p>Natural care for skin that feels like you.</p><span>© 2026 BareAya</span></footer>
    </div>
  )
}

export default Shop
