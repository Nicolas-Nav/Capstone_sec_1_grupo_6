"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ConsultorProcess {
  id: string
  cargo: string
  position_title?: string
  cliente: string
  tipo_servicio: string
  tipo_servicio_nombre: string
  consultor: string
  estado_solicitud: string
  status: string
  etapa: string
  fecha_creacion: string
  created_at?: string
  started_at?: string
  completed_at?: string
  vacancies?: number
  vacantes?: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useConsultorProcesses(consultorId: string | undefined) {
  // Estados de datos
  const [allProcesses, setAllProcesses] = useState<ConsultorProcess[]>([])
  const [pendingProcesses, setPendingProcesses] = useState<ConsultorProcess[]>([])
  const [otherProcesses, setOtherProcesses] = useState<ConsultorProcess[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados de filtros (solo para procesos no pendientes)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalProcesses, setTotalProcesses] = useState(0)
  
  // Estado para tipos de servicio
  const [allServiceTypes, setAllServiceTypes] = useState<string[]>([])
  
  // Estado para estadísticas (sin filtros)
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    en_progreso: 0,
    completados: 0,
    congelados: 0,
    cancelados: 0,
    cierre_extraordinario: 0
  })

  // Referencias para rastrear valores anteriores de filtros
  const prevSearchTerm = useRef(searchTerm)
  const prevStatusFilter = useRef(statusFilter)
  const prevServiceFilter = useRef(serviceFilter)

  // Función para obtener procesos pendientes (sin filtros, sin paginación)
  const fetchPendingProcesses = async () => {
    if (!consultorId) return

    try {
      const res = await fetch(
        `${API_URL}/api/solicitudes?consultor_id=${consultorId}&status=creado&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("llc_token")}`,
          },
        }
      )

      const data = await res.json()
      
      if (res.ok && data?.success) {
        const solicitudes = data.data?.solicitudes || data.data || []
        setPendingProcesses(solicitudes)
      }
    } catch (error) {
      console.error("Error fetching pending processes:", error)
    }
  }

  // Función para obtener procesos no pendientes (CON filtros y paginación)
  const fetchOtherProcesses = useCallback(async () => {
    if (!consultorId) return

    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        consultor_id: consultorId,
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
        exclude_status: "creado" // Excluir procesos pendientes (ahora soportado en backend)
      })

      // Agregar filtros solo si no son "all"
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (serviceFilter !== "all") {
        params.append("service_type", serviceFilter)
      }

      const res = await fetch(`${API_URL}/api/solicitudes?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("llc_token")}`,
        },
      })

      const data = await res.json()
      
      if (res.ok && data?.success) {
        const solicitudes = data.data?.solicitudes || data.data || []
        setOtherProcesses(solicitudes)
        setTotalProcesses(data.data?.pagination?.total || solicitudes.length)
        setTotalPages(data.data?.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching other processes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [consultorId, currentPage, pageSize, searchTerm, statusFilter, serviceFilter])

  // Función para obtener todos los procesos (para estadísticas)
  const fetchAllProcessesForStats = async () => {
    if (!consultorId) return

    try {
      const res = await fetch(
        `${API_URL}/api/solicitudes?consultor_id=${consultorId}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("llc_token")}`,
          },
        }
      )

      const data = await res.json()
      
      if (res.ok && data?.success) {
        const solicitudes = data.data?.solicitudes || data.data || []
        setAllProcesses(solicitudes)
        
        // Calcular estadísticas
        const newStats = {
          total: solicitudes.length,
          pendientes: solicitudes.filter((p: any) => 
            p.estado_solicitud === "Creado" || p.status === "creado"
          ).length,
          en_progreso: solicitudes.filter((p: any) => 
            p.estado_solicitud === "En Progreso" || p.status === "en_progreso"
          ).length,
          completados: solicitudes.filter((p: any) => 
            p.estado_solicitud === "Cerrado" || p.status === "cerrado"
          ).length,
          congelados: solicitudes.filter((p: any) => 
            p.estado_solicitud === "Congelado" || p.status === "congelado"
          ).length,
          cancelados: solicitudes.filter((p: any) => 
            p.estado_solicitud === "Cancelado" || p.status === "cancelado"
          ).length,
          cierre_extraordinario: solicitudes.filter((p: any) => 
            p.estado_solicitud === "Cierre Extraordinario" || p.status === "cierre_extraordinario"
          ).length
        }
        
        setStats(newStats)
        
        // Extraer tipos de servicio únicos
        const serviceTypes = Array.from(
          new Set(
            solicitudes
              .map((s: any) => s.tipo_servicio_nombre || s.tipo_servicio)
              .filter(Boolean)
          )
        ).sort() as string[]
        
        setAllServiceTypes(serviceTypes)
      }
    } catch (error) {
      console.error("Error fetching all processes for stats:", error)
    }
  }

  // Efecto inicial: cargar estadísticas, procesos pendientes y tipos de servicio
  useEffect(() => {
    if (consultorId) {
      fetchAllProcessesForStats()
      fetchPendingProcesses()
    }
  }, [consultorId])

  // Efecto para recargar procesos no pendientes cuando cambien los filtros o paginación
  useEffect(() => {
    if (!consultorId) return

    // Detectar si cambiaron los filtros (no la paginación)
    const searchChanged = prevSearchTerm.current !== searchTerm
    const statusChanged = prevStatusFilter.current !== statusFilter
    const serviceChanged = prevServiceFilter.current !== serviceFilter
    
    // Si cambiaron los filtros, resetear a página 1
    if ((searchChanged || statusChanged || serviceChanged) && currentPage !== 1) {
      setCurrentPage(1)
      return
    }
    
    // Actualizar las referencias después de verificar cambios
    prevSearchTerm.current = searchTerm
    prevStatusFilter.current = statusFilter
    prevServiceFilter.current = serviceFilter
    
    // Cargar datos inmediatamente (sin debounce)
    fetchOtherProcesses()
  }, [consultorId, currentPage, pageSize, searchTerm, statusFilter, serviceFilter, fetchOtherProcesses])

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page)
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
    setCurrentPage(1)
  }

  // Función para recargar datos (útil después de actualizar un proceso)
  const refreshData = async () => {
    await Promise.all([
      fetchAllProcessesForStats(),
      fetchPendingProcesses(),
      fetchOtherProcesses()
    ])
  }

  return {
    // Datos
    allProcesses,
    pendingProcesses,
    otherProcesses,
    isLoading,
    stats,
    serviceTypes: allServiceTypes,
    
    // Filtros
    searchTerm,
    statusFilter,
    serviceFilter,
    setSearchTerm,
    setStatusFilter,
    setServiceFilter,
    
    // Paginación
    currentPage,
    pageSize,
    totalPages,
    totalProcesses,
    goToPage,
    nextPage,
    prevPage,
    handlePageSizeChange,
    
    // Funciones
    refreshData
  }
}

