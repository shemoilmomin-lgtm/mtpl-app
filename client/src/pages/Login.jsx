import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const TAGLINES = [
  "One team. One goal. Unstoppable.",
  "Excellence is a standard, not an achievement.",
  "The best version of this company starts with you.",
  "Hard work today builds the legacy of tomorrow.",
  "Every effort you put in is an investment in something bigger.",
  "Winning is a habit. Build it every single day.",
  "Do the work no one sees. Get the results everyone wishes for.",
  "Small consistent actions lead to extraordinary outcomes.",
  "Champions aren't born — they're built in moments like this.",
  "A good attitude shapes the team's altitude.",
  "Together we are stronger than any challenge ahead.",
  "Greatness doesn't happen by accident.",
  "Every day is a chance to outperform yesterday.",
  "Discipline separates the good from the exceptional.",
  "Don't count the days — make the days count.",
  "Success is a team sport. Play your part.",
  "The effort you give is the culture you create.",
  "Pressure creates diamonds. Polishing makes it worthy.",
  "Work with purpose. Lead with integrity.",
  "Believe in the mission. Trust the team.",
  "Nothing great was ever built by those who gave up.",
  "Push harder. The goal is closer than you think.",
  "Your best work is always ahead of you.",
  "Build something today that the next of you will be proud of.",
  "There is no shortcut to lasting success.",
  "Strive not to be the best on the team — make the team the best.",
  "Making the team best, makes you best of the team.",
  "Commit fully. Execute relentlessly. Enjoy the outcome.",
  "Every task done well is a vouch for who we are.",
  "The company grows when the people in it do.",
]

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const tagline = useMemo(
    () => TAGLINES[Math.floor(Math.random() * TAGLINES.length)],
    []
  )

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Invalid credentials')
        return
      }
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 px-16 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #07a588 0%, #253d8e 70%, #2e3191 100%)',
        }}
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full opacity-5 bg-white" />

        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <img
            src="/logo-color.svg"
            alt="MTPL"
            className="w-96 max-w-full"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="mt-10 w-16 h-px bg-white/30" />
          <p className="mt-6 text-white/90 text-lg font-medium leading-snug max-w-sm">
            {tagline}
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center flex-1 bg-background px-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="flex justify-center mb-10 lg:hidden">
            <img src="/logo-color.svg" alt="MTPL" className="h-12" />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-base text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-xs font-semibold text-foreground uppercase">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full h-12 px-4 text-base rounded-lg border bg-background text-foreground placeholder:text-muted-foreground outline-none transition-all"
                style={{
                  borderColor: 'oklch(var(--border))',
                  boxShadow: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#93a8d4'}
                onBlur={e => e.target.style.borderColor = 'oklch(var(--border))'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold text-foreground uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12 px-4 pr-11 text-base rounded-lg border bg-background text-foreground placeholder:text-muted-foreground outline-none transition-all"
                  style={{
                    borderColor: 'oklch(var(--border))',
                    boxShadow: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#93a8d4'}
                  onBlur={e => e.target.style.borderColor = 'oklch(var(--border))'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 mt-2 rounded-lg text-sm font-bold uppercase text-white transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #4f8ef7 0%, #1a3fa8 100%)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
