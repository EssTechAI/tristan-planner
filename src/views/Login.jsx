import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await signIn(email, password)
    if (authError) setError(authError.message)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#1a1a2e', fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{ background: '#ffffff', borderRadius: '10px' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-10 h-10 rounded-[8px] flex items-center justify-center text-white font-black text-lg mb-3"
            style={{ background: 'linear-gradient(135deg, #7c5cbf, #4e9af1)' }}
          >
            P
          </div>
          <h1 className="text-[20px] font-extrabold" style={{ color: '#1a1a2e' }}>
            My Planner
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 text-[13px] rounded-[6px] outline-none"
            style={{
              border: '1px solid #e3e5e8',
              color: '#3d3f4e',
              fontFamily: 'inherit',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 text-[13px] rounded-[6px] outline-none"
            style={{
              border: '1px solid #e3e5e8',
              color: '#3d3f4e',
              fontFamily: 'inherit',
            }}
          />

          {error && (
            <p className="text-[12px]" style={{ color: '#e53e3e' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-[13px] font-semibold text-white rounded-[6px] transition-opacity"
            style={{
              background: '#7c5cbf',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              border: 'none',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
