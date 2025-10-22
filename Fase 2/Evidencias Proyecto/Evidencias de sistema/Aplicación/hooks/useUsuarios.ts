"use client"

import { useState, useEffect } from "react"
import type { User } from "../lib/types"
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface NewUserInput {
  rut: string
  nombre: string
  apellido: string
  email: string
  password: string
  role: "admin" | "consultor"
  status: "habilitado" | "inhabilitado"
}

type HookUser = User & {
  nombre?: string
  apellido?: string
  status?: "habilitado" | "inhabilitado"
  created_at?: string
}

export function useUsuarios() {
  const [users, setUsers] = useState<HookUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "habilitado" | "inhabilitado">("all")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "consultor">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [newUser, setNewUser] = useState<NewUserInput>({
    rut: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    role: "consultor",
    status: "habilitado",
  })

  // -------------------
  // Filtros - ahora manejados por la API
  // -------------------
  const filteredUsers = users // Los filtros se aplican en la API

  // Refetch cuando cambien los filtros o paginación
  useEffect(() => {
    fetchUsers()
  }, [searchTerm, statusFilter, roleFilter, currentPage, pageSize])

  // -------------------
  // CRUD
  // -------------------
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // Construir query params para filtros y paginación
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())
      
      const res = await fetch(`${API_URL}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("llc_token")}` },
      })
      const data = await res.json()
      if (data.success) {
        // Mapear la respuesta de la API al formato esperado
        const mappedUsers: HookUser[] = data.data.users.map((u: any) => ({
          id: u.rut_usuario,
          firstName: u.nombre_usuario,
          lastName: u.apellido_usuario,
          email: u.email_usuario,
          role: u.rol_usuario === 1 ? "admin" : "consultor",
          isActive: u.activo_usuario,
          // Campos de compatibilidad para filtros
          nombre: u.nombre_usuario,
          apellido: u.apellido_usuario,
          status: u.activo_usuario ? "habilitado" : "inhabilitado",
        }))
        setUsers(mappedUsers)
        
        // Actualizar información de paginación
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages)
          setTotalUsers(data.data.pagination.total)
        }
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("llc_token")}`,
        },
        body: JSON.stringify({
          rut_usuario: newUser.rut,
          nombre_usuario: newUser.nombre,
          apellido_usuario: newUser.apellido,
          email_usuario: newUser.email,
          rol_usuario: newUser.role === "admin" ? 1 : 2,
          activo_usuario: newUser.status === "habilitado",
          contrasena_usuario: newUser.password,
        }),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        const created = data.data
        setUsers([
          ...users,
          {
            id: created?.rut_usuario || newUser.rut,
            firstName: newUser.nombre,
            lastName: newUser.apellido,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.status === "habilitado",
            // Compatibility fields for filters that might use Spanish keys
            nombre: newUser.nombre,
            apellido: newUser.apellido,
            status: newUser.status,
            created_at: new Date().toISOString(),
          },
        ])
        setIsCreateDialogOpen(false)
        setNewUser({ rut: "", nombre: "", apellido: "", email: "", password: "", role: "consultor", status: "habilitado" })
        return { success: true, message: data?.message }
      } else {
        return { success: false, message: data?.message || "Error creando usuario" }
      }
    } catch (err) {
      console.error(err)
      return { success: false, message: "Error creando usuario" }
    }
  }

  const editUser = (user: HookUser) => {
    setEditingUser(user)
    setNewUser({
      rut: user.id,
      nombre: user.nombre || user.firstName,
      apellido: user.apellido || user.lastName,
      email: user.email,
      password: "", // No mostrar contraseña al editar por seguridad
      role: user.role,
      status: user.status ?? (user.isActive ? "habilitado" : "inhabilitado"),
    })
  }

  const updateUser = async (): Promise<{ success: boolean; message?: string }> => {
    if (!editingUser) return { success: false, message: "No hay usuario seleccionado para editar" }
    
    try {
      // Preparar datos de actualización
      const updateData: any = {
        rut_usuario: newUser.rut,
        nombre_usuario: newUser.nombre,
        apellido_usuario: newUser.apellido,
        email_usuario: newUser.email,
        rol_usuario: newUser.role === "admin" ? 1 : 2,
        activo_usuario: newUser.status === "habilitado",
      }
      
      // Solo incluir contraseña si se proporcionó una nueva
      if (newUser.password && newUser.password.trim() !== "") {
        updateData.contrasena_usuario = newUser.password
      }
      
      const res = await fetch(`${API_URL}/api/users/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("llc_token")}`,
        },
        body: JSON.stringify(updateData),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        // Actualizar la lista local con el usuario modificado
        setUsers(users.map((user) => 
          user.id === (editingUser as HookUser).id 
            ? {
                ...user,
                firstName: newUser.nombre,
                lastName: newUser.apellido,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.status === "habilitado",
                // Campos de compatibilidad
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                status: newUser.status,
              } as HookUser
            : user
        ))
        setEditingUser(null)
        setNewUser({ rut: "", nombre: "", apellido: "", email: "", password: "", role: "consultor", status: "habilitado" })
        return { success: true, message: data?.message }
      } else {
        return { success: false, message: data?.message || "Error actualizando usuario" }
      }
    } catch (err) {
      console.error(err)
      return { success: false, message: "Error actualizando usuario" }
    }
  }

  const toggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "habilitado" ? "inhabilitado" : "habilitado" }
          : user
      )
    )
  }

  const deleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const clearEditingUser = () => {
    setEditingUser(null)
    setNewUser({ rut: "", nombre: "", apellido: "", email: "", password: "", role: "consultor", status: "habilitado" })
  }

  return {
    users,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newUser,
    setNewUser,
    editingUser,
    editUser,
    createUser,
    updateUser,
    toggleStatus,
    deleteUser,
    fetchUsers,
    isLoading,
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    goToPage,
    nextPage,
    prevPage,
    handlePageSizeChange,
    clearEditingUser,
  }
}
