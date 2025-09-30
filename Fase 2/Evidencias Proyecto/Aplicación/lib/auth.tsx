"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("llc_user")
    const storedToken = localStorage.getItem("llc_token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

const login = async (email: string, password: string): Promise<boolean> => {
  setIsLoading(true)
  try {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    console.log("Response status:", res.status, res.statusText) // <- aquí
    const data = await res.json()
    console.log("Data recibida del backend:", data) // <- y aquí

    if (!res.ok) {
      setIsLoading(false)
      return false
    }

    // Guardar token y usuario en localStorage
    localStorage.setItem("llc_token", data.data.token)

    const loggedUser: User = {
      id: data.data.usuario.rut_usuario,
      name: data.data.usuario.nombre,
      email,
      role: data.data.usuario.rol,
      status: "habilitado" // o deshabilitado según tu API
    }

    setUser(loggedUser)
    localStorage.setItem("llc_user", JSON.stringify(loggedUser))
    setIsLoading(false)
    return true
  } catch (error) {
    console.error("Error en login:", error)
    setIsLoading(false)
    return false
  }
}

  const logout = () => {
    setUser(null)
    localStorage.removeItem("llc_user")
    localStorage.removeItem("llc_token")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
