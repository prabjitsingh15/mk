// Brand story page.
// This view explains the BareAya philosophy, founder story, and the principles behind the skincare line.
function OurStory() {
  return (
    <div className="story-page">
      <div className="announcement">Free delivery across India <span>✦</span> Skin-first. Always.</div>
      <header className="story-header"><a className="logo-link" href="/" aria-label="BareAya home"><img className="brand-logo logo-dark" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /></a><nav><a href="/">Home</a><a href="/shop/">Shop</a><a className="current" href="/our-story/">Our story</a></nav><a className="story-bag" href="/bag/">Bag ↗</a></header>
      <main>
        <section className="story-hero"><div><p className="eyebrow">A little more human</p><h1>Care that<br /><em>feels personal.</em></h1><p>BareAya is a return to the simple things: thoughtful ingredients, gentle rituals, and skin that feels at home in itself.</p></div><div className="story-hero-image"><img src="https://bareaya.in/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-22-at-1.59.22-PM.jpeg" alt="Chandni Anand, founder of BareAya" /><span>01 / our beginning</span></div></section>
        <section className="story-intro"><p className="eyebrow">Why BareAya</p><h2>Skincare should<br /><em>give back.</em></h2><div><p>We believe the best routines are the ones you look forward to. BareAya was created to make everyday skincare feel fresh, honest, and uncomplicated.</p><p>Every formula is inspired by the quiet intelligence of nature and made with the belief that healthy skin does not need to be chased. It needs to be understood.</p></div></section>
        <section className="founder-section"><div className="founder-copy"><p className="eyebrow">The person behind the ritual</p><h2>Meet<br /><em>Chandni.</em></h2><p>“BareAya began with a desire to make skincare that is kind to the skin and kind to the everyday. Products that feel good to use, and even better to come back to.”</p><p className="signature">Chandni Anand</p></div><div className="founder-image"><img src="https://bareaya.in/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-22-at-1.59.22-PM-300x300.jpeg" alt="Chandni Anand" /></div></section>
        <section className="principles-section"><div className="principles-heading"><p className="eyebrow">What guides us</p><h2>Three small<br /><em>promises.</em></h2></div><div className="principles-list"><article><span>01</span><h3>Gentle by nature</h3><p>Our care is designed to nourish and support your skin, never overwhelm it.</p></article><article><span>02</span><h3>Honest ingredients</h3><p>We choose purposeful ingredients and keep the unnecessary out of your ritual.</p></article><article><span>03</span><h3>Made for real life</h3><p>Simple formulas and easy rituals that belong in your everyday, not just on a shelf.</p></article></div></section>
        <section className="story-quote"><p>“Your skin is already beautiful.<br /><em>We are here to care for it.</em>”</p><a className="button button-dark" href="/shop/">Explore our products <span>↗</span></a></section>
      </main>
      <footer className="story-footer"><img className="brand-logo" src="/BAREAYA%20LOGO%20(1).png" alt="BareAya" /><span>© 2026 BareAya</span></footer>
    </div>
  )
}

export default OurStory
