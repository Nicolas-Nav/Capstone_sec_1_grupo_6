"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/auth"
import {
  getProcessesByConsultant,
  serviceTypeLabels,
  processStatusLabels,
  mockProcesses,
  getHitosByProcess,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Search, Eye, Calendar, Building2, Target, Clock, AlertTriangle } from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

function getCurrentProcessStage(processId: string): string {
  const hitos = getHitosByProcess(processId)

  if (hitos.length === 0) return "Sin hitos definidos"

  // Find the last completed hito
  const completedHitos = hitos
    .filter((h) => h.status === "completado")
    .sort(
      (a, b) => new Date(b.completed_date || b.due_date).getTime() - new Date(a.completed_date || a.due_date).getTime(),
    )

  // Find current in-progress hito
  const inProgressHito = hitos.find((h) => h.status === "en_progreso")

  if (inProgressHito) {
    return `En: ${inProgressHito.name}`
  }

  if (completedHitos.length > 0) {
    const lastCompleted = completedHitos[0]
    const nextHito = hitos.find((h) => h.status === "pendiente")
    if (nextHito) {
      return `Siguiente: ${nextHito.name}`
    }
    return `Completado: ${lastCompleted.name}`
  }

  // If no completed hitos, show first pending
  const firstPending = hitos.find((h) => h.status === "pendiente")
  if (firstPending) {
    return `Pendiente: ${firstPending.name}`
  }

  return "Etapa no definida"
}

export default function ConsultorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [startingProcess, setStartingProcess] = useState<string | null>(null)

  if (user?.role !== "consultor") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  const myProcesses = getProcessesByConsultant(user.id)

  const filteredProcesses = myProcesses.filter((process) => {
    const matchesSearch =
      process.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.client.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || process.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingProcesses = filteredProcesses.filter((p) => p.status === "creado")
  const activeProcesses = filteredProcesses.filter((p) => p.status === "iniciado" || p.status === "en_progreso")
  const completedProcesses = filteredProcesses.filter((p) => p.status === "completado")

  const handleStartProcess = async (processId: string) => {
    setStartingProcess(processId)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update process status in mock data
    const processIndex = mockProcesses.findIndex((p) => p.id === processId)
    if (processIndex !== -1) {
      mockProcesses[processIndex].status = "iniciado"
      mockProcesses[processIndex].started_at = new Date().toISOString()
    }

    setStartingProcess(null)

    // Navigate to process detail page
    router.push(`/consultor/proceso/${processId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Procesos</h1>
          <p className="text-muted-foreground">Gestiona tus procesos de reclutamiento asignados</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asignados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProcesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingProcesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{activeProcesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedProcesses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cargo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="creado">Creado</SelectItem>
                <SelectItem value="iniciado">Iniciado</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {pendingProcesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Procesos Pendientes de Iniciar
            </CardTitle>
            <CardDescription>Estos procesos están asignados pero aún no han sido iniciados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Servicio</TableHead>
                  <TableHead>Vacantes</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.position_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {process.client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {serviceTypeLabels[process.service_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{process.vacancies}</TableCell>
                    <TableCell>{formatDate(process.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleStartProcess(process.id)}
                        disabled={startingProcess === process.id}
                      >
                        {startingProcess === process.id ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeProcesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-cyan-600" />
              Procesos en Curso
            </CardTitle>
            <CardDescription>Procesos iniciados con su etapa actual específica</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Servicio</TableHead>
                  <TableHead>Estado Actual</TableHead>
                  <TableHead>Etapa Específica</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.position_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {process.client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {serviceTypeLabels[process.service_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(process.status)}>{processStatusLabels[process.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{getCurrentProcessStage(process.id)}</div>
                    </TableCell>
                    <TableCell>{process.started_at ? formatDate(process.started_at) : "-"}</TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/consultor/proceso/${process.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Gestionar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {completedProcesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Procesos Completados
            </CardTitle>
            <CardDescription>Procesos finalizados exitosamente</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Servicio</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Finalización</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.position_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {process.client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {serviceTypeLabels[process.service_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{process.started_at ? formatDate(process.started_at) : "-"}</TableCell>
                    <TableCell>{process.completed_at ? formatDate(process.completed_at) : "-"}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/consultor/proceso/${process.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredProcesses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron procesos</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "all"
                ? "Intenta ajustar los filtros para ver más resultados."
                : "No tienes procesos asignados en este momento."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
