"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Trash2, Loader2, Upload } from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"
import { CreateProcessDialog } from "@/components/admin/create-process-dialog"
import { UploadExcelDialog } from "@/components/admin/upload-excel-dialog"
import { solicitudService } from "@/lib/api"
import { toast } from "sonner"

interface Solicitud {
  id: number
  cargo: string
  cliente: string
  tipo_servicio: string
  tipo_servicio_nombre: string
  consultor: string
  estado: string
  fecha_creacion: string
  id_descripcion_cargo: number
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showExcelDialog, setShowExcelDialog] = useState(false)
  const [selectedDescripcionCargoId, setSelectedDescripcionCargoId] = useState<number | null>(null)

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    loadSolicitudes()
  }, [])

  const loadSolicitudes = async () => {
    try {
      setIsLoading(true)
      const response = await solicitudService.getAll()
      
      if (response.success && response.data) {
        setSolicitudes(response.data)
      } else {
        toast.error('Error al cargar las solicitudes')
      }
    } catch (error) {
      console.error('Error loading solicitudes:', error)
      toast.error('Error al cargar las solicitudes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
      return
    }

    try {
      const response = await solicitudService.delete(id)
      
      if (response.success) {
        toast.success('Solicitud eliminada exitosamente')
        loadSolicitudes()
      } else {
        toast.error(response.message || 'Error al eliminar la solicitud')
      }
    } catch (error: any) {
      console.error('Error deleting solicitud:', error)
      toast.error(error.message || 'Error al eliminar la solicitud')
    }
  }

  const handleUploadExcel = (descripcionCargoId: number) => {
    setSelectedDescripcionCargoId(descripcionCargoId)
    setShowExcelDialog(true)
  }

  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const matchesSearch =
      solicitud.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.consultor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || solicitud.estado === statusFilter
    const matchesService = serviceFilter === "all" || solicitud.tipo_servicio === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  // Calcular estadísticas
  const stats = {
    total: solicitudes.length,
    en_progreso: solicitudes.filter(s => s.estado === 'En Progreso').length,
    completadas: solicitudes.filter(s => s.estado === 'Completado').length,
    pendientes: solicitudes.filter(s => s.estado === 'Creada').length,
  }

  // Obtener tipos de servicio únicos
  const serviceTypes = Array.from(new Set(solicitudes.map(s => s.tipo_servicio)))

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
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.en_progreso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendientes}</div>
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
                <SelectItem value="Creada">Creada</SelectItem>
                <SelectItem value="En Progreso">En Progreso</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Solicitudes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitudes</CardTitle>
          <CardDescription>
            {filteredSolicitudes.length} de {solicitudes.length} solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredSolicitudes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {solicitudes.length === 0 
                ? "No hay solicitudes creadas. Crea una nueva solicitud para comenzar."
                : "No se encontraron solicitudes con los filtros aplicados."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                {filteredSolicitudes.map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell className="font-mono text-sm">{solicitud.id}</TableCell>
                    <TableCell className="font-medium">{solicitud.cargo}</TableCell>
                    <TableCell>{solicitud.cliente}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{solicitud.tipo_servicio_nombre}</Badge>
                    </TableCell>
                    <TableCell>{solicitud.consultor}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(solicitud.estado)}>
                        {solicitud.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(solicitud.fecha_creacion)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUploadExcel(solicitud.id_descripcion_cargo)}
                          title="Cargar datos de Excel"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(solicitud.id)}
                          title="Eliminar solicitud"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Process Dialog */}
      <CreateProcessDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />

      {/* Upload Excel Dialog */}
      {selectedDescripcionCargoId && (
        <UploadExcelDialog
          open={showExcelDialog}
          onOpenChange={setShowExcelDialog}
          descripcionCargoId={selectedDescripcionCargoId}
        />
      )}
    </div>
  )
}
