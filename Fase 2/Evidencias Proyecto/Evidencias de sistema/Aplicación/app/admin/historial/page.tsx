"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/auth"
import { logService, userService, type LogCambio, type LogEstadisticas } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, History, User, FileText, Calendar, Loader2 } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

// Interfaces para enriquecimiento de datos
interface LogEnriquecido extends LogCambio {
  usuarioNombre?: string;
}

interface Usuario {
  rut_usuario: string;
  nombre_usuario: string;
  apellido_usuario?: string;
}

export default function HistorialPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<LogEnriquecido[]>([])
  const [stats, setStats] = useState<LogEstadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tablaFilter, setTablaFilter] = useState<string>("all")
  const [accionFilter, setAccionFilter] = useState<string>("all")
  const [usuarioFilter, setUsuarioFilter] = useState<string>("all")
  const [usuariosMap, setUsuariosMap] = useState<Map<string, string>>(new Map())

  // Cargar datos al montar el componente
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Cargar logs y estadísticas en paralelo
        const [logsResponse, statsResponse] = await Promise.all([
          logService.getLogs({ limit: 500 }),
          logService.getEstadisticas()
        ])

        if (logsResponse.success && logsResponse.data) {
          const logsData = logsResponse.data

          // Enriquecer con nombres de usuario (Opción 1.5)
          const rutUnicos = [...new Set(logsData.map((log: LogCambio) => log.usuario_responsable))]
          
          // Función para normalizar RUT (quitar puntos y guiones)
          const normalizarRut = (rut: string): string => {
            return rut.replace(/[.\-]/g, '').toLowerCase()
          }
          
          try {
            const usuariosResponse = await userService.getAll()
            if (usuariosResponse.success && usuariosResponse.data) {
              // La API puede devolver data.users como array o data directamente
              const responseData: any = usuariosResponse.data
              const usuariosData = responseData.users || responseData
              const rutToNombre = new Map<string, string>()
              
              usuariosData.forEach((u: any) => {
                // Construir nombre completo
                const nombreCompleto = `${u.nombre_usuario || ''} ${u.apellido_usuario || ''}`.trim()
                // Normalizar el RUT para hacer match correcto
                const rutNormalizado = normalizarRut(u.rut_usuario)
                rutToNombre.set(rutNormalizado, nombreCompleto)
              })
              
              setUsuariosMap(rutToNombre)
              
              // Enriquecer logs con nombres
              const logsEnriquecidos: LogEnriquecido[] = logsData.map((log: LogCambio) => ({
                ...log,
                usuarioNombre: rutToNombre.get(normalizarRut(log.usuario_responsable))
              }))
              
              setLogs(logsEnriquecidos)
            } else {
              // Si falla cargar usuarios, usar solo logs
              setLogs(logsData)
            }
          } catch (err) {
            console.error('Error cargando usuarios para enriquecer:', err)
            // Si falla cargar usuarios, usar solo logs
            setLogs(logsData)
          }
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      } catch (err: any) {
        console.error('Error cargando historial:', err)
        setError(err.message || 'Error al cargar el historial de cambios')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin") {
      loadData()
    }
  }, [user])

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

  // Funciones auxiliares para formateo
  const formatTabla = (tabla: string): string => {
    const nombres: Record<string, string> = {
      'solicitud': 'Solicitud',
      'candidato': 'Candidato',
      'postulacion': 'Postulación',
      'hito_solicitud': 'Hito',
      'cliente': 'Cliente',
      'contacto': 'Contacto',
      'usuario': 'Usuario'
    }
    return nombres[tabla] || tabla.charAt(0).toUpperCase() + tabla.slice(1)
  }

  const getAccionBadgeVariant = (accion: string): "default" | "secondary" | "destructive" | "outline" => {
    if (accion === 'INSERT') return 'default'
    if (accion === 'UPDATE') return 'secondary'
    if (accion === 'DELETE') return 'destructive'
    return 'outline'
  }

  const formatRut = (rut: string): string => {
    // Formatear RUT: 209942917 → 20.994.291-7
    const cleaned = rut.replace(/[^\dkK]/g, '')
    if (cleaned.length <= 1) return cleaned
    
    const dv = cleaned.slice(-1)
    const number = cleaned.slice(0, -1)
    const reversed = number.split('').reverse().join('')
    const formatted = reversed.match(/.{1,3}/g)?.join('.').split('').reverse().join('') || reversed
    
    return `${formatted}-${dv}`
  }

  // Filtrar logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.detalle_cambio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tabla_afectada.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id_registro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.usuarioNombre && log.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.usuario_responsable.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTabla = tablaFilter === "all" || log.tabla_afectada === tablaFilter
    const matchesAccion = accionFilter === "all" || log.accion === accionFilter
    const matchesUsuario = usuarioFilter === "all" || log.usuario_responsable === usuarioFilter

    return matchesSearch && matchesTabla && matchesAccion && matchesUsuario
  })

  // Obtener valores únicos para filtros
  const tablasUnicas = [...new Set(logs.map(log => log.tabla_afectada))].sort()
  const accionesUnicas: ('INSERT' | 'UPDATE' | 'DELETE')[] = ['INSERT', 'UPDATE', 'DELETE']
  const usuariosUnicos = [...new Set(logs.map(log => log.usuario_responsable))].sort()

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando historial de cambios...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error al cargar historial</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

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
            <div className="text-2xl font-bold">{stats?.total_logs || logs.length}</div>
            <p className="text-xs text-muted-foreground">Registros en sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.usuarios_activos || new Set(logs.map(log => log.usuario_responsable)).size}
            </div>
            <p className="text-xs text-muted-foreground">Con actividad registrada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tablas Afectadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.tablas_afectadas || tablasUnicas.length}
            </div>
            <p className="text-xs text-muted-foreground">Con cambios registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Acción</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accionesUnicas.length}</div>
            <p className="text-xs text-muted-foreground">INSERT, UPDATE, DELETE</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra y busca en el historial de cambios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por tabla, usuario, detalle o ID de registro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={tablaFilter} onValueChange={setTablaFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tabla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tablas</SelectItem>
                  {tablasUnicas.map((tabla) => (
                    <SelectItem key={tabla} value={tabla}>
                      {formatTabla(tabla)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={accionFilter} onValueChange={setAccionFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  {accionesUnicas.map((accion) => (
                    <SelectItem key={accion} value={accion}>
                      {accion === 'INSERT' ? 'Creación' : accion === 'UPDATE' ? 'Actualización' : 'Eliminación'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={usuarioFilter} onValueChange={setUsuarioFilter}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Usuario">
                    {usuarioFilter === "all" ? (
                      "Todos los usuarios"
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {usuariosMap.get(usuarioFilter.replace(/[.\-]/g, '').toLowerCase()) || formatRut(usuarioFilter)}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Todos los usuarios</span>
                    </div>
                  </SelectItem>
                  {usuariosUnicos.map((rut) => {
                    const normalizarRut = (rutStr: string): string => {
                      return rutStr.replace(/[.\-]/g, '').toLowerCase()
                    }
                    const nombreUsuario = usuariosMap.get(normalizarRut(rut))
                    return (
                      <SelectItem key={rut} value={rut}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            {nombreUsuario ? (
                              <>
                                <span className="font-medium truncate">{nombreUsuario}</span>
                                <span className="text-xs text-muted-foreground font-mono">{formatRut(rut)}</span>
                              </>
                            ) : (
                              <span className="font-mono">{formatRut(rut)}</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
          <CardDescription>
            {filteredLogs.length} de {logs.length} movimientos
            {filteredLogs.length === 0 && " (sin resultados con los filtros actuales)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron registros</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Tabla</TableHead>
                    <TableHead className="w-[100px]">Registro ID</TableHead>
                    <TableHead className="w-[120px]">Acción</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs
                    .sort((a, b) => new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime())
                    .map((log) => (
                      <TableRow key={log.id_log}>
                        <TableCell className="font-mono text-sm">
                          {formatDateTime(log.fecha_cambio)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {log.usuarioNombre ? (
                              <>
                                <span className="text-sm font-medium">{log.usuarioNombre}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {formatRut(log.usuario_responsable)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-mono">
                                {formatRut(log.usuario_responsable)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {formatTabla(log.tabla_afectada)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.id_registro}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getAccionBadgeVariant(log.accion)}>
                            {log.accion === 'INSERT' ? 'Crear' : 
                             log.accion === 'UPDATE' ? 'Actualizar' : 
                             'Eliminar'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[400px] truncate" title={log.detalle_cambio}>
                            {log.detalle_cambio}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
