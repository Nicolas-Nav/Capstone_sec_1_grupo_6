"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { mockUsers } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, History, User, FileText, Calendar } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

// Mock audit log data
const mockAuditLog = [
  {
    id: "1",
    process_id: "1",
    process_title: "Desarrollador Full Stack Senior",
    user_id: "2",
    user_name: "Carlos Rodríguez",
    action: "Candidato agregado",
    details: "Agregó candidato: Alejandro Ruiz",
    timestamp: "2024-01-17T10:30:00Z",
  },
  {
    id: "2",
    process_id: "1",
    process_title: "Desarrollador Full Stack Senior",
    user_id: "2",
    user_name: "Carlos Rodríguez",
    action: "Estado actualizado",
    details: "Cambió estado de candidato a 'Presentado'",
    timestamp: "2024-01-20T14:00:00Z",
  },
  {
    id: "3",
    process_id: "2",
    process_title: "Diseñador UX/UI",
    user_id: "1",
    user_name: "Ana García",
    action: "Proceso creado",
    details: "Creó nueva solicitud de reclutamiento",
    timestamp: "2024-01-20T14:30:00Z",
  },
  {
    id: "4",
    process_id: "2",
    process_title: "Diseñador UX/UI",
    user_id: "3",
    user_name: "María López",
    action: "Proceso iniciado",
    details: "Marcó el proceso como iniciado",
    timestamp: "2024-01-22T08:00:00Z",
  },
  {
    id: "5",
    process_id: "1",
    process_title: "Desarrollador Full Stack Senior",
    user_id: "2",
    user_name: "Carlos Rodríguez",
    action: "Publicación realizada",
    details: "Publicó en LinkedIn y GetOnBoard",
    timestamp: "2024-01-16T14:30:00Z",
  },
  {
    id: "6",
    process_id: "3",
    process_title: "Gerente de Ventas",
    user_id: "1",
    user_name: "Ana García",
    action: "Consultor asignado",
    details: "Asignó proceso a Carlos Rodríguez",
    timestamp: "2024-01-25T11:15:00Z",
  },
  {
    id: "7",
    process_id: "1",
    process_title: "Desarrollador Full Stack Senior",
    user_id: "2",
    user_name: "Carlos Rodríguez",
    action: "Respuesta cliente",
    details: "Cliente aprobó candidato: Alejandro Ruiz",
    timestamp: "2024-01-21T16:30:00Z",
  },
  {
    id: "8",
    process_id: "4",
    process_title: "Analista de Riesgos",
    user_id: "1",
    user_name: "Ana García",
    action: "Proceso creado",
    details: "Creó solicitud para test psicológico",
    timestamp: "2024-01-28T16:45:00Z",
  },
]

export default function HistorialPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

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

  const filteredAuditLog = mockAuditLog.filter((entry) => {
    const matchesSearch =
      entry.process_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesUser = userFilter === "all" || entry.user_id === userFilter
    const matchesAction = actionFilter === "all" || entry.action.toLowerCase().includes(actionFilter.toLowerCase())

    return matchesSearch && matchesUser && matchesAction
  })

  const uniqueActions = [...new Set(mockAuditLog.map((entry) => entry.action))]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Movimientos</h1>
          <p className="text-muted-foreground">Trazabilidad completa de todas las acciones del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAuditLog.length}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(mockAuditLog.map((entry) => entry.user_id)).size}</div>
            <p className="text-xs text-muted-foreground">Con actividad reciente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procesos Afectados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(mockAuditLog.map((entry) => entry.process_id)).size}</div>
            <p className="text-xs text-muted-foreground">Con movimientos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones Únicas</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueActions.length}</div>
            <p className="text-xs text-muted-foreground">Tipos de movimientos</p>
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
                  placeholder="Buscar por proceso, usuario, acción o detalles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action.toLowerCase()}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
          <CardDescription>
            {filteredAuditLog.length} de {mockAuditLog.length} movimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Proceso</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditLog
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">{formatDateTime(entry.timestamp)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {entry.user_name.charAt(0)}
                        </div>
                        <span className="text-sm">{entry.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={entry.process_title}>
                        {entry.process_title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={entry.details}>
                      {entry.details}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
