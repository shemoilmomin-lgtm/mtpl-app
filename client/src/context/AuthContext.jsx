import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mtpl_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(userData, token) {
    localStorage.setItem('mtpl_token', token)
    localStorage.setItem('mtpl_user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('mtpl_token')
    localStorage.removeItem('mtpl_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}