import { useState } from 'react'
import { supabase } from './supabase'
import './Auth.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Logged in successfully! Redirecting...')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Check your email to confirm your account.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ BuildEasy</div>
        <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-sub">{isLogin ? 'Sign in to continue building' : 'Start building for free today'}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={function(e) { setEmail(e.target.value) }}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={function(e) { setPassword(e.target.value) }}
              required
            />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}
          {message && <div className="auth-success">✓ {message}</div>}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign in →' : 'Create account →')}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={function() { setIsLogin(!isLogin); setError(''); setMessage('') }}>
            {isLogin ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth
