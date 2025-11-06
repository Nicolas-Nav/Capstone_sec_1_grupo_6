"use client"

import { useAuth } from "@/hooks/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  getOverdueHitosByConsultant,
  getProcessCompletionStats,
  getProcessesByServiceType,
  getTimeToHireData,
  getCandidateSourceData,
  getConsultantPerformanceData,
  getAllProcesses,
} from "@/lib/mock-data"
import { solicitudService } from "@/lib/api"
import { Users, Clock, Target, TrendingUp, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

const COLORS = ["#00BCD4", "#1E3A8A", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#84cc16"]

export default function ReportesPage() {
  const { user } = useAuth()
  const [timePeriod, setTimePeriod] = useState("month")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [activeProcesses, setActiveProcesses] = useState<Record<string, number>>({})
  const [loadingActiveProcesses, setLoadingActiveProcesses] = useState(true)
  const [serviceTypeData, setServiceTypeData] = useState<Array<{ service: string; count: number; percentage: number }>>([])
  const [loadingServiceType, setLoadingServiceType] = useState(true)
  const [candidateSourceData, setCandidateSourceData] = useState<Array<{ source: string; candidates: number; hired: number }>>([])
  const [loadingCandidateSource, setLoadingCandidateSource] = useState(true)
  const [processStats, setProcessStats] = useState<{ activeProcesses: number; avgTimeToHire: number; totalCandidates: number }>({
    activeProcesses: 0,
    avgTimeToHire: 0,
    totalCandidates: 0
  })
  const [loadingProcessStats, setLoadingProcessStats] = useState(true)

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  // Cargar procesos activos por consultor desde la API (optimizado)
  useEffect(() => {
    const loadActiveProcesses = async () => {
      try {
        setLoadingActiveProcesses(true)
        const response = await solicitudService.getActiveProcessesByConsultant()
        if (response.success && response.data) {
          setActiveProcesses(response.data as Record<string, number>)
        } else {
          // Fallback a mock si falla la API
          const { getActiveProcessesByConsultant } = await import("@/lib/mock-data")
          setActiveProcesses(getActiveProcessesByConsultant())
        }
      } catch (error) {
        console.error("Error al cargar procesos activos:", error)
        // Fallback a mock si hay error
        const { getActiveProcessesByConsultant } = await import("@/lib/mock-data")
        setActiveProcesses(getActiveProcessesByConsultant())
      } finally {
        setLoadingActiveProcesses(false)
      }
    }

    loadActiveProcesses()
  }, [])

  // Cargar distribución por tipo de servicio desde la API (optimizado)
  useEffect(() => {
    const loadServiceTypeData = async () => {
      try {
        setLoadingServiceType(true)
        const response = await solicitudService.getProcessesByServiceType()
        if (response.success && response.data) {
          setServiceTypeData(response.data as Array<{ service: string; count: number; percentage: number }>)
        } else {
          // Fallback a mock si falla la API
          const { getProcessesByServiceType } = await import("@/lib/mock-data")
          setServiceTypeData(getProcessesByServiceType())
        }
      } catch (error) {
        console.error("Error al cargar distribución por tipo de servicio:", error)
        // Fallback a mock si hay error
        const { getProcessesByServiceType } = await import("@/lib/mock-data")
        setServiceTypeData(getProcessesByServiceType())
      } finally {
        setLoadingServiceType(false)
      }
    }

    loadServiceTypeData()
  }, [])

  // Cargar fuentes de candidatos desde la API (optimizado)
  useEffect(() => {
    const loadCandidateSourceData = async () => {
      try {
        setLoadingCandidateSource(true)
        const response = await solicitudService.getCandidateSourceData()
        if (response.success && response.data) {
          setCandidateSourceData(response.data as Array<{ source: string; candidates: number; hired: number }>)
        } else {
          // Fallback a mock si falla la API
          const { getCandidateSourceData } = await import("@/lib/mock-data")
          setCandidateSourceData(getCandidateSourceData())
        }
      } catch (error) {
        console.error("Error al cargar fuentes de candidatos:", error)
        // Fallback a mock si hay error
        const { getCandidateSourceData } = await import("@/lib/mock-data")
        setCandidateSourceData(getCandidateSourceData())
      } finally {
        setLoadingCandidateSource(false)
      }
    }

    loadCandidateSourceData()
  }, [])

  // Cargar estadísticas generales desde la API (optimizado)
  useEffect(() => {
    const loadProcessStats = async () => {
      try {
        setLoadingProcessStats(true)
        console.log('[FRONTEND] Cargando estadísticas de procesos...')
        const response = await solicitudService.getProcessStats()
        console.log('[FRONTEND] Respuesta de estadísticas:', response)
        if (response.success && response.data) {
          const stats = response.data as { activeProcesses: number; avgTimeToHire: number; totalCandidates: number }
          console.log('[FRONTEND] Estadísticas recibidas:', stats)
          setProcessStats(stats)
        } else {
          console.warn('[FRONTEND] Respuesta sin éxito o sin datos:', response)
          // Fallback: usar valores por defecto
          setProcessStats({ activeProcesses: 0, avgTimeToHire: 0, totalCandidates: 0 })
        }
      } catch (error) {
        console.error("[FRONTEND] Error al cargar estadísticas de procesos:", error)
        // Fallback: usar valores por defecto
        setProcessStats({ activeProcesses: 0, avgTimeToHire: 0, totalCandidates: 0 })
      } finally {
        setLoadingProcessStats(false)
      }
    }

    loadProcessStats()
  }, [])

  const overdueHitos = getOverdueHitosByConsultant()
  const completionStats = getProcessCompletionStats()
  const timeToHireData = getTimeToHireData()
  const performanceData = getConsultantPerformanceData()
  const allProcesses = getAllProcesses()

  const processStatusData = [
    { status: "Iniciado", count: allProcesses.filter((p) => p.status === "Iniciado").length, color: "#00BCD4" },
    { status: "En Progreso", count: allProcesses.filter((p) => p.status === "En Progreso").length, color: "#1E3A8A" },
    { status: "En Revisión", count: allProcesses.filter((p) => p.status === "En Revisión").length, color: "#10b981" },
    { status: "Completado", count: allProcesses.filter((p) => p.status === "Completado").length, color: "#3b82f6" },
    { status: "Pausado", count: allProcesses.filter((p) => p.status === "Pausado").length, color: "#f59e0b" },
  ]

  const getTemporalData = () => {
    if (timePeriod === "week") {
      return [
        { period: "Sem 1", iniciados: 3, completados: 2, enProgreso: 8 },
        { period: "Sem 2", iniciados: 5, completados: 3, enProgreso: 10 },
        { period: "Sem 3", iniciados: 2, completados: 4, enProgreso: 8 },
        { period: "Sem 4", iniciados: 4, completados: 3, enProgreso: 9 },
      ]
    } else if (timePeriod === "month") {
      return [
        { period: "Ene", iniciados: 12, completados: 8, enProgreso: 15 },
        { period: "Feb", iniciados: 15, completados: 10, enProgreso: 18 },
        { period: "Mar", iniciados: 10, completados: 12, enProgreso: 16 },
        { period: "Abr", iniciados: 14, completados: 9, enProgreso: 21 },
        { period: "May", iniciados: 11, completados: 13, enProgreso: 19 },
      ]
    } else {
      return [
        { period: "Q1", iniciados: 37, completados: 30, enProgreso: 49 },
        { period: "Q2", iniciados: 42, completados: 35, enProgreso: 56 },
        { period: "Q3", iniciados: 38, completados: 40, enProgreso: 54 },
        { period: "Q4", iniciados: 45, completados: 38, enProgreso: 62 },
      ]
    }
  }

  const activeProcessesData = Object.entries(activeProcesses).map(([name, count]) => ({
    name,
    procesos: count,
  }))

  const overdueData = Object.entries(overdueHitos).map(([name, count]) => ({
    name,
    vencidos: count,
  }))

  const completionData = completionStats.map((stat) => ({
    name: stat.consultant,
    completados: stat.completed,
    aTiempo: stat.onTime,
    retrasados: stat.delayed,
    porcentaje: stat.completionRate,
  }))

  const timeToHireByService = [
    { service: "Proceso Completo", days: 45, target: 60 },
    { service: "Long List", days: 25, target: 30 },
    { service: "Targeted Recruitment", days: 35, target: 45 },
    { service: "Evaluación Psicolaboral", days: 15, target: 20 },
  ]

  // Usar datos reales de la API para las estadísticas
  const avgTimeToHire = processStats.avgTimeToHire || 0
  const totalCandidates = processStats.totalCandidates || 0
  const totalActiveProcesses = processStats.activeProcesses || 0
  const totalProcesses = allProcesses.length
  const completedProcesses = processStatusData.find((p) => p.status === "Completado")?.count || 0
  const completionRate = Math.round((completedProcesses / totalProcesses) * 100)

  const getWeeksInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const weeks = []

    const currentDate = new Date(firstDay)
    let weekNumber = 1

    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)

      // Adjust if week extends beyond month
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime())
      }

      const startDay = weekStart.getDate()
      const endDay = weekEnd.getDate()

      weeks.push({
        number: weekNumber,
        label: `Semana ${weekNumber}`,
        start: startDay,
        end: endDay,
        dateRange: `${startDay} - ${endDay} ${monthNames[month]}`,
      })

      currentDate.setDate(currentDate.getDate() + 7)
      weekNumber++
    }

    return weeks
  }

  const getProcessesForPeriod = () => {
    const monthStart = new Date(selectedYear, selectedMonth, 1)
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0)

    let filteredProcesses = allProcesses.filter((process) => {
      const processDate = new Date(process.startDate)
      return processDate >= monthStart && processDate <= monthEnd
    })

    if (timePeriod === "week") {
      const weeks = getWeeksInMonth(selectedMonth, selectedYear)
      const selectedWeekData = weeks[selectedWeek - 1]

      if (selectedWeekData) {
        const weekStart = new Date(selectedYear, selectedMonth, selectedWeekData.start)
        const weekEnd = new Date(selectedYear, selectedMonth, selectedWeekData.end)

        filteredProcesses = filteredProcesses.filter((process) => {
          const processDate = new Date(process.startDate)
          return processDate >= weekStart && processDate <= weekEnd
        })
      }
    }

    return filteredProcesses
  }

  const getProcessesInProgress = () => {
    const periodProcesses = getProcessesForPeriod()
    return periodProcesses.filter(
      (process) =>
        process.status === "En Progreso" || process.status === "Iniciado" || process.status === "En Revisión",
    )
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      years.push(year)
    }
    return years
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes y KPIs</h1>
        <p className="text-muted-foreground">Análisis integral de rendimiento y métricas operativas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procesos Activos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingProcessStats ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalActiveProcesses}</div>
                <p className="text-xs text-muted-foreground">En curso actualmente</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingProcessStats ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{avgTimeToHire} días</div>
                <p className="text-xs text-muted-foreground">Time-to-hire promedio</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatos Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingProcessStats ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground">En todos los procesos</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="estados" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estados">Estados de Procesos</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="estados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Período</CardTitle>
              <CardDescription>Selecciona el período para analizar los procesos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => {
                      setSelectedYear(Number.parseInt(value))
                      setSelectedWeek(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mes</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => {
                      setSelectedMonth(Number.parseInt(value))
                      setSelectedWeek(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Semana</label>
                  <Select
                    value={selectedWeek.toString()}
                    onValueChange={(value) => setSelectedWeek(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getWeeksInMonth(selectedMonth, selectedYear).map((week) => (
                        <SelectItem key={week.number} value={week.number.toString()}>
                          {week.dateRange}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vista</label>
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Por Mes</SelectItem>
                      <SelectItem value="week">Por Semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total del Período</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getProcessesForPeriod().length}</div>
                <p className="text-xs text-muted-foreground">
                  {timePeriod === "week"
                    ? `Semana ${selectedWeek} de ${monthNames[selectedMonth]}`
                    : `${monthNames[selectedMonth]} ${selectedYear}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Curso</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{getProcessesInProgress().length}</div>
                <p className="text-xs text-muted-foreground">Procesos activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {getProcessesForPeriod().filter((p) => p.status === "Completado").length}
                </div>
                <p className="text-xs text-muted-foreground">Finalizados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pausados</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getProcessesForPeriod().filter((p) => p.status === "Pausado").length}
                </div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo de Proceso</CardTitle>
              <CardDescription>Análisis detallado por tipo de servicio en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-4">Procesos por Tipo</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={(() => {
                        const periodProcesses = getProcessesForPeriod()
                        const serviceTypes = [
                          { key: "Proceso Completo", label: "Proceso Completo" },
                          { key: "Long List", label: "Long List" },
                          { key: "Targeted Recruitment", label: "Targeted Recruitment" },
                          { key: "Evaluación Psicolaboral", label: "Evaluación Psicolaboral" },
                          { key: "Test Psicolaboral", label: "Test Psicolaboral" },
                        ]

                        return serviceTypes
                          .map((type) => {
                            const typeProcesses = periodProcesses.filter((p) => p.serviceType === type.key)
                            const inProgress = typeProcesses.filter(
                              (p) =>
                                p.status === "En Progreso" || p.status === "Iniciado" || p.status === "En Revisión",
                            ).length
                            const completed = typeProcesses.filter((p) => p.status === "Completado").length
                            const paused = typeProcesses.filter((p) => p.status === "Pausado").length

                            return {
                              type: type.label.length > 15 ? type.label.substring(0, 12) + "..." : type.label,
                              fullType: type.label,
                              total: typeProcesses.length,
                              enCurso: inProgress,
                              completados: completed,
                              pausados: paused,
                            }
                          })
                          .filter((item) => item.total > 0)
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} fontSize={12} interval={0} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => {
                          const item = (() => {
                            const periodProcesses = getProcessesForPeriod()
                            const serviceTypes = [
                              { key: "Proceso Completo", label: "Proceso Completo" },
                              { key: "Long List", label: "Long List" },
                              { key: "Targeted Recruitment", label: "Targeted Recruitment" },
                              { key: "Evaluación Psicolaboral", label: "Evaluación Psicolaboral" },
                              { key: "Test Psicolaboral", label: "Test Psicolaboral" },
                            ]

                            return serviceTypes
                              .map((type) => {
                                const typeProcesses = periodProcesses.filter((p) => p.serviceType === type.key)
                                return {
                                  type: type.label.length > 15 ? type.label.substring(0, 12) + "..." : type.label,
                                  fullType: type.label,
                                  total: typeProcesses.length,
                                }
                              })
                              .find((item) => item.type === label)
                          })()
                          return item?.fullType || label
                        }}
                      />
                      <Bar dataKey="enCurso" fill="#00BCD4" name="En Curso" />
                      <Bar dataKey="completados" fill="#10b981" name="Completados" />
                      <Bar dataKey="pausados" fill="#f59e0b" name="Pausados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4">Distribución Total</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          const periodProcesses = getProcessesForPeriod()
                          const serviceTypes = [
                            { key: "Proceso Completo", label: "Proceso Completo" },
                            { key: "Long List", label: "Long List" },
                            { key: "Targeted Recruitment", label: "Targeted Recruitment" },
                            { key: "Evaluación Psicolaboral", label: "Evaluación Psicolaboral" },
                            { key: "Test Psicolaboral", label: "Test Psicolaboral" },
                          ]

                          return serviceTypes
                            .map((type, index) => ({
                              name: type.label,
                              shortName: type.label.length > 12 ? type.label.substring(0, 10) + "..." : type.label,
                              value: periodProcesses.filter((p) => p.serviceType === type.key).length,
                              color: COLORS[index % COLORS.length],
                            }))
                            .filter((item) => item.value > 0)
                        })()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ shortName, value }) => `${shortName}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(() => {
                          const periodProcesses = getProcessesForPeriod()
                          const serviceTypes = [
                            { key: "Proceso Completo", label: "Proceso Completo" },
                            { key: "Long List", label: "Long List" },
                            { key: "Targeted Recruitment", label: "Targeted Recruitment" },
                            { key: "Evaluación Psicolaboral", label: "Evaluación Psicolaboral" },
                            { key: "Test Psicolaboral", label: "Test Psicolaboral" },
                          ]

                          return serviceTypes
                            .map((type, index) =>
                              periodProcesses.filter((p) => p.serviceType === type.key).length > 0 ? (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ) : null,
                            )
                            .filter(Boolean)
                        })()}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Detalle por Tipo de Proceso</h4>
                <div className="grid gap-3">
                  {(() => {
                    const periodProcesses = getProcessesForPeriod()
                    const serviceTypes = [
                      { key: "Proceso Completo", label: "Proceso Completo", color: "bg-blue-100 text-blue-800" },
                      { key: "Long List", label: "Long List", color: "bg-green-100 text-green-800" },
                      {
                        key: "Targeted Recruitment",
                        label: "Targeted Recruitment",
                        color: "bg-purple-100 text-purple-800",
                      },
                      {
                        key: "Evaluación Psicolaboral",
                        label: "Evaluación Psicolaboral",
                        color: "bg-orange-100 text-orange-800",
                      },
                      { key: "Test Psicolaboral", label: "Test Psicolaboral", color: "bg-pink-100 text-pink-800" },
                    ]

                    return serviceTypes
                      .map((type) => {
                        const typeProcesses = periodProcesses.filter((p) => p.serviceType === type.key)
                        if (typeProcesses.length === 0) return null

                        const inProgress = typeProcesses.filter(
                          (p) => p.status === "En Progreso" || p.status === "Iniciado" || p.status === "En Revisión",
                        ).length
                        const completed = typeProcesses.filter((p) => p.status === "Completado").length
                        const paused = typeProcesses.filter((p) => p.status === "Pausado").length

                        return (
                          <div
                            key={type.key}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={type.color}>
                                  {type.label}
                                </Badge>
                                <span className="text-sm font-medium">{typeProcesses.length} procesos</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {timePeriod === "week"
                                  ? `Semana ${selectedWeek} de ${monthNames[selectedMonth]} ${selectedYear}`
                                  : `${monthNames[selectedMonth]} ${selectedYear}`}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{inProgress}</div>
                                <div className="text-xs text-muted-foreground">En Curso</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{completed}</div>
                                <div className="text-xs text-muted-foreground">Completados</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">{paused}</div>
                                <div className="text-xs text-muted-foreground">Pausados</div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                      .filter(Boolean)
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estados</CardTitle>
                <CardDescription>Estados de procesos del período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getProcessesForPeriod().reduce(
                        (acc, process) => {
                          const existing = acc.find((item) => item.status === process.status)
                          if (existing) {
                            existing.count += 1
                          } else {
                            acc.push({
                              status: process.status,
                              count: 1,
                              color: processStatusData.find((p) => p.status === process.status)?.color || "#8884d8",
                            })
                          }
                          return acc
                        },
                        [] as Array<{ status: string; count: number; color: string }>,
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getProcessesForPeriod()
                        .reduce(
                          (acc, process) => {
                            const existing = acc.find((item) => item.status === process.status)
                            if (!existing) {
                              acc.push({
                                status: process.status,
                                count: 1,
                                color:
                                  processStatusData.find((p) => p.status === process.status)?.color ||
                                  COLORS[acc.length % COLORS.length],
                              })
                            }
                            return acc
                          },
                          [] as Array<{ status: string; count: number; color: string }>,
                        )
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolución Temporal</CardTitle>
                <CardDescription>Tendencia de procesos por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTemporalData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="iniciados" fill="#00BCD4" name="Iniciados" />
                    <Bar dataKey="enProgreso" fill="#1E3A8A" name="En Progreso" />
                    <Bar dataKey="completados" fill="#10b981" name="Completados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Procesos en Curso -{" "}
                {timePeriod === "week"
                  ? `Semana ${selectedWeek} de ${monthNames[selectedMonth]} ${selectedYear}`
                  : `${monthNames[selectedMonth]} ${selectedYear}`}
              </CardTitle>
              <CardDescription>Lista detallada de procesos activos en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              {getProcessesInProgress().length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No hay procesos en curso</h3>
                  <p className="text-muted-foreground">
                    No se encontraron procesos activos para el período seleccionado
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Posición</TableHead>
                      <TableHead>Tipo de Proceso</TableHead>
                      <TableHead>Consultor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Días Transcurridos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getProcessesInProgress().map((process) => {
                      const daysSinceStart = Math.floor(
                        (new Date().getTime() - new Date(process.startDate).getTime()) / (1000 * 60 * 60 * 24),
                      )

                      const getServiceTypeLabel = (serviceType: string) => {
                        const types = {
                          proceso_completo: "Proceso Completo",
                          long_list: "Long List",
                          targeted_recruitment: "Targeted Recruitment",
                          evaluacion_psicolaboral: "Evaluación Psicolaboral",
                          test_psicolaboral: "Test Psicolaboral",
                        }
                        return types[serviceType as keyof typeof types] || serviceType
                      }

                      return (
                        <TableRow key={process.id}>
                          <TableCell className="font-medium">{process.client}</TableCell>
                          <TableCell>{process.position}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {getServiceTypeLabel(process.serviceType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{process.consultant}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                process.status === "En Progreso"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : process.status === "Iniciado"
                                    ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                                    : "bg-purple-100 text-purple-800 border-purple-300"
                              }
                            >
                              {process.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(process.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={daysSinceStart > 60 ? "text-red-600 font-medium" : ""}>
                              {daysSinceStart} días
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {timePeriod === "month" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Resumen Semanal - {monthNames[selectedMonth]} {selectedYear}
                </CardTitle>
                <CardDescription>Distribución detallada de procesos por semana del mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {getWeeksInMonth(selectedMonth, selectedYear).map((week) => {
                    const weekProcesses = allProcesses.filter((process) => {
                      const processDate = new Date(process.startDate)
                      const weekStart = new Date(selectedYear, selectedMonth, week.start)
                      const weekEnd = new Date(selectedYear, selectedMonth, week.end)
                      return processDate >= weekStart && processDate <= weekEnd
                    })

                    const inProgress = weekProcesses.filter(
                      (p) => p.status === "En Progreso" || p.status === "Iniciado" || p.status === "En Revisión",
                    ).length

                    const completed = weekProcesses.filter((p) => p.status === "Completado").length
                    const paused = weekProcesses.filter((p) => p.status === "Pausado").length

                    return (
                      <div
                        key={week.number}
                        className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{week.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {week.start} - {week.end} de {monthNames[selectedMonth]} {selectedYear}
                          </p>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{weekProcesses.length}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
                            <div className="text-xs text-muted-foreground">En Curso</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{completed}</div>
                            <div className="text-xs text-muted-foreground">Completados</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{paused}</div>
                            <div className="text-xs text-muted-foreground">Pausados</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Carga Operativa por Consultor</CardTitle>
                <CardDescription>Procesos activos asignados</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingActiveProcesses ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Cargando datos...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(activeProcesses).map(([name, count]) => ({
                      name,
                      procesos: count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="procesos" fill="#00BCD4" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipo de Servicio Total (En Progreso, Cerrados, Congelados, Cancelados)</CardTitle>
                <CardDescription>Distribución de procesos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingServiceType ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Cargando datos...</p>
                    </div>
                  </div>
                ) : serviceTypeData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        startAngle={300}
                        endAngle={-130}
                        labelLine={true}
                        label={({ service, percentage }) => `${service}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-service-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as { service: string; count: number; percentage: number };
                            return (
                              <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                                <p className="font-semibold text-sm">{data.service}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">{data.count}</span> {data.count === 1 ? 'proceso' : 'procesos'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {data.percentage}% del total
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tiempo de Contratación vs Objetivo por Tipo de Servicio</CardTitle>
              <CardDescription>Comparación de tiempos reales vs objetivos por tipo de proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeToHireByService}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="days" fill="#00BCD4" name="Días Reales" />
                  <Bar dataKey="target" fill="#4b5563" name="Objetivo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fuentes de Candidatos</CardTitle>
              <CardDescription>Efectividad por canal de reclutamiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-4">Volumen de Candidatos por Fuente</h4>
                  {loadingCandidateSource ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Cargando datos...</p>
                      </div>
                    </div>
                  ) : candidateSourceData.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={candidateSourceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="candidates" fill="#00BCD4" name="Candidatos" />
                        <Bar dataKey="hired" fill="#10b981" name="Contratados" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-4">Distribución de Candidatos</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={candidateSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, candidates }) => `${source}: ${candidates}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="candidates"
                      >
                        {candidateSourceData.map((entry, index) => (
                          <Cell key={`cell-candidate-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Tasa de Éxito por Fuente</h4>
                <div className="grid gap-2">
                  {candidateSourceData.map((source) => {
                    const successRate = Math.round((source.hired / source.candidates) * 100)
                    return (
                      <div key={source.source} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{source.source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${successRate}%` }}></div>
                          </div>
                          <Badge variant="outline">{successRate}%</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Consultor</CardTitle>
              <CardDescription>Métricas de desempeño individual</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultor</TableHead>
                    <TableHead>Procesos Completados</TableHead>
                    <TableHead>Tiempo Promedio</TableHead>
                    <TableHead>Eficiencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((consultant) => (
                    <TableRow key={consultant.consultant}>
                      <TableCell className="font-medium">{consultant.consultant}</TableCell>
                      <TableCell>{consultant.processesCompleted}</TableCell>
                      <TableCell>{consultant.avgTimeToHire} días</TableCell>
                      <TableCell>
                        <Badge
                          variant={consultant.efficiency >= 85 ? "default" : "destructive"}
                          className={consultant.efficiency >= 85 ? "bg-green-100 text-green-800" : ""}
                        >
                          {consultant.efficiency}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cumplimiento de Plazos</CardTitle>
                <CardDescription>Análisis detallado por consultor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="aTiempo" fill="#10b981" name="A Tiempo" />
                    <Bar dataKey="retrasados" fill="#dc2626" name="Retrasados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retrasos por Consultor</CardTitle>
                <CardDescription>Hitos vencidos que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overdueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vencidos" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
