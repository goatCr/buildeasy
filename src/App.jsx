import { useState } from 'react'
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const features = [
    { icon: '🎨', title: 'Drag & Drop Editor', desc: 'Build layouts by dragging 50+ pre-built components — navbars, cards, forms and more.' },
    { icon: '⚡', title: 'AI Layout Generator', desc: 'Describe your app in plain English and AI instantly creates a starter layout for you.' },
    { icon: '📱', title: 'Responsive by Default', desc: 'Every site auto-adapts to mobile, tablet and desktop. Preview any screen size in real time.' },
    { icon: '🔌', title: 'One-Click Integrations', desc: 'Connect Razorpay, Google Sheets, Mailchimp — zero code required.' },
    { icon: '🚀', title: 'Instant Deployment', desc: 'Publish with one click. Free subdomain, custom domain support, SSL included.' },
    { icon: '🧩', title: 'Custom Code Support', desc: 'Drop raw HTML, CSS or JavaScript into any component when you need more control.' },
  ]

  const steps = [
    { icon: '✍️', step: '01', title: 'Describe your idea', desc: 'Tell us what you want to build in plain English.' },
    { icon: '🏗️', step: '02', title: 'Customize the design', desc: 'Drag components, pick colors, adjust layouts visually.' },
    { icon: '🔗', step: '03', title: 'Connect your data', desc: 'Plug in your database, forms or payment integrations.' },
    { icon: '🌍', step: '04', title: 'Publish and share', desc: 'Go live instantly with a free domain and global CDN.' },
  ]

  return (
    <div className="app">

      <nav className="nav">
        <div className="nav-logo">⚡ BuildEasy</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#" className="btn btn-ghost">Sign in</a>
          <a href="#pricing" className="btn btn-primary">Start free</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">🚀 Now in public beta</div>
        <h1>Build apps and websites <span className="highlight">without code</span></h1>
        <p>Drag. Drop. Launch. Create a fully custom website or app in minutes — no coding skills required.</p>
        <div className="hero-cta">
          <a href="#pricing" className="btn btn-primary btn-lg">Start building for free</a>
          <a href="#how" className="btn btn-outline btn-lg">Watch demo</a>
        </div>
        <div className="hero-proof">
          <div className="avatars">
            <span className="av av1">SJ</span>
            <span className="av av2">AK</span>
            <span className="av av3">MR</span>
          </div>
          <span>Trusted by <strong>12,000+</strong> builders worldwide</span>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-label">Everything you need</div>
        <h2>Built for builders, not coders</h2>
        <p className="section-sub">From landing pages to full apps — go from idea to live product in one afternoon.</p>
        <div className="features-grid">
          {features.map(function(f, i) {
            return (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section how-section" id="how">
        <div className="section-label">Simple process</div>
        <h2>From idea to live in 4 steps</h2>
        <div className="steps-grid">
          {steps.map(function(s, i) {
            return (
              <div className="step" key={i}>
                <div className="step-num">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="section-label">Simple pricing</div>
        <h2>Start free, scale as you grow</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="plan-name">Free</div>
            <div className="plan-price">₹0 <span>/forever</span></div>
            <ul className="plan-features">
              <li>✓ 2 projects</li>
              <li>✓ BuildEasy subdomain</li>
              <li>✓ 50+ components</li>
              <li>✓ Community support</li>
            </ul>
            <a href="#" className="btn btn-outline plan-btn">Get started free</a>
          </div>
          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price">₹799 <span>/month</span></div>
            <ul className="plan-features">
              <li>✓ Unlimited projects</li>
              <li>✓ Custom domain</li>
              <li>✓ AI layout generator</li>
              <li>✓ Razorpay payments</li>
              <li>✓ Priority support</li>
            </ul>
            <a href="#" className="btn btn-white plan-btn">Start Pro trial</a>
          </div>
          <div className="pricing-card">
            <div className="plan-name">Team</div>
            <div className="plan-price">₹2,499 <span>/month</span></div>
            <ul className="plan-features">
              <li>✓ Everything in Pro</li>
              <li>✓ 5 team members</li>
              <li>✓ White-label export</li>
              <li>✓ Dedicated support</li>
            </ul>
            <a href="#" className="btn btn-outline plan-btn">Contact sales</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">⚡ BuildEasy</div>
        <p>The simplest way to build and launch custom websites and apps.</p>
        <p className="footer-copy">© 2026 BuildEasy. Made with love in Lucknow, India 🇮🇳</p>
      </footer>

    </div>
  )
}

export default App
