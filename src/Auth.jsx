import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      navigate('/dashboard')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.email.trim() || !form.password.trim()) {
      setMessage('Email and password are required.')
      return
    }

    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Account created successfully. Redirecting...')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Login successful. Redirecting...')
        navigate('/dashboard')
      }
    }

    setLoading(false)
  }

  const success =
    message.toLowerCase().includes('success') ||
    message.toLowerCase().includes('redirecting')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--hero-bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1120px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          minHeight: '700px',
          boxShadow: 'var(--shadow-soft)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            padding: 'var(--space-12)',
            background: 'var(--panel-gradient)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 800,
                marginBottom: '42px',
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>⚡</span>
              <span>BuildEasy</span>
            </Link>

            <div
              style={{
                display: 'inline-flex',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(229, 138, 31, 0.08)',
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                marginBottom: '22px',
                fontSize: '0.88rem',
              }}
            >
              Build and publish faster
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.6rem, 5vw, 4.1rem)',
                lineHeight: '1.05',
                margin: '0 0 16px',
                letterSpacing: '-0.04em',
                color: 'var(--text)',
              }}
            >
              Create websites and apps without touching code
            </h1>

            <p
              style={{
                color: 'var(--text-soft)',
                lineHeight: '1.8',
                maxWidth: '520px',
                fontSize: '1rem',
                marginBottom: '28px',
              }}
            >
              Manage projects, pages, design, and publishing from one modern builder workspace built for speed.
            </p>

            <div style={{ display: 'grid', gap: '14px', maxWidth: '480px' }}>
              {[
                'Multi-page site builder with live editing',
                'Publish to public slug-based pages instantly',
                'Clean dashboard, editor, and site experience',
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text)',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(229, 138, 31, 0.14)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '28px',
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
              color: 'var(--text-soft)',
              lineHeight: '1.7',
            }}
          >
            A polished builder should feel trustworthy before the user creates anything. This screen sets that tone.
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-elevated)',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '4px',
                  marginBottom: '22px',
                }}
              >
                <button
                  onClick={() => {
                    setMode('login')
                    setMessage('')
                  }}
                  style={{
                    background: mode === 'login' ? 'var(--accent)' : 'transparent',
                    color: mode === 'login' ? 'var(--accent-contrast)' : 'var(--text)',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    setMode('signup')
                    setMessage('')
                  }}
                  style={{
                    background: mode === 'signup' ? 'var(--accent)' : 'transparent',
                    color: mode === 'signup' ? 'var(--accent-contrast)' : 'var(--text)',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Up
                </button>
              </div>

              <h2
                style={{
                  fontSize: '2rem',
                  margin: '0 0 8px',
                  color: 'var(--text)',
                }}
              >
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>

              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                {mode === 'login'
                  ? 'Continue building and managing your projects.'
                  : 'Start building your first site or app in minutes.'}
              </p>
            </div>

            {message && (
              <div
                style={{
                  marginBottom: '18px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: success ? 'var(--success-bg)' : 'var(--error-bg)',
                  border: success
                    ? '1px solid var(--success-border)'
                    : '1px solid var(--error-border)',
                  color: success ? 'var(--success-text)' : 'var(--error-text)',
                }}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: 'var(--text-soft)',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '15px 16px',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: 'var(--text-soft)',
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '15px 16px',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '18px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '15px 18px',
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                {loading
                  ? mode === 'login'
                    ? 'Logging in...'
                    : 'Creating account...'
                  : mode === 'login'
                    ? 'Login'
                    : 'Create account'}
              </button>
            </form>

            <p
              style={{
                marginTop: '18px',
                color: 'var(--text-muted)',
                lineHeight: '1.7',
              }}
            >
              {mode === 'login' ? (
                <>
                  Don’t have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup')
                      setMessage('')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login')
                      setMessage('')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth