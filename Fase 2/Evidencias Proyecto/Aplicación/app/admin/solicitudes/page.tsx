"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/auth"
import { mockProcesses, serviceTypeLabels, processStatusLabels } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"
import { CreateProcessDialog } from "@/components/admin/create-process-dialog"
import { ProcessDetailsDialog } from "@/components/admin/process-details-dialog"
import type { Process } from "@/lib/types"

export default function SolicitudesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

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

  const filteredProcesses = mockProcesses.filter((process) => {
    const matchesSearch =
      process.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.consultant.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || process.status === statusFilter
    const matchesService = serviceFilter === "all" || process.service_type === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  const handleViewProcess = (process: Process) => {
    setSelectedProcess(process)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes</h1>
          <p className="text-muted-foreground">Gestiona todas las solicitudes de reclutamiento</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProcesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProcesses.filter((p) => p.status === "en_progreso").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProcesses.filter((p) => p.status === "completado").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProcesses.filter((p) => p.status === "creado").length}</div>
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
                  placeholder="Buscar por cargo, cliente o consultor..."
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
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                <SelectItem value="proceso_completo">Proceso Completo</SelectItem>
                <SelectItem value="long_list">Long List</SelectItem>
                <SelectItem value="targeted_recruitment">Targeted Recruitment</SelectItem>
                <SelectItem value="evaluacion_psicolaboral">Evaluación Psicolaboral</SelectItem>
                <SelectItem value="test_psicolaboral">Test Psicolaboral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Processes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitudes</CardTitle>
          <CardDescription>
            {filteredProcesses.length} de {mockProcesses.length} solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Servicio</TableHead>
                <TableHead>Consultor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium">{process.position_title}</TableCell>
                  <TableCell>{process.client.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{serviceTypeLabels[process.service_type]}</Badge>
                  </TableCell>
                  <TableCell>{process.consultant.name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(process.status)}>{processStatusLabels[process.status]}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(process.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewProcess(process)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Process Dialog */}
      <CreateProcessDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {/* Process Details Dialog */}
      {selectedProcess && (
        <ProcessDetailsDialog process={selectedProcess} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
      )}
    </div>
  )
}
