"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/auth"
import { getHitosAlertas, getHitosDashboard, HitoAlert, HitosDashboard } from "@/lib/api-hitos"
import { serviceTypeLabels } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/utils"
import { Bell, AlertTriangle, Clock, Search, Filter, CheckCircle, Calendar, User, Briefcase, Table, Eye } from "lucide-react"
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AlertasPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [hitosAlertas, setHitosAlertas] = useState<HitoAlert[]>([])
  const [dashboard, setDashboard] = useState<HitosDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  useEffect(() => {
    if (user) {
      loadHitosData()
    }
  }, [user])

  const loadHitosData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🔍 Cargando hitos para usuario:', user.id)
      
      // Obtener alertas de hitos para el usuario actual
      const alertas = await getHitosAlertas(user.id)
      console.log('📊 Hitos cargados:', alertas.length, alertas)
      setHitosAlertas(alertas)
      
      // Obtener dashboard completo
      const dashboardData = await getHitosDashboard(user.id)
      console.log('📈 Dashboard cargado:', dashboardData)
      setDashboard(dashboardData)
    } catch (error) {
      console.error('❌ Error al cargar datos de hitos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">Debes iniciar sesión para ver las alertas.</p>
        </div>
      </div>
    )
  }

  // Filtrar hitos reales del backend
  const filteredHitosAlertas = hitosAlertas.filter(hito => {
    const matchesSearch = 
      hito.nombre_hito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hito.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hito.solicitud?.descripcionCargo?.titulo_cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hito.solicitud?.contacto?.cliente?.nombre_cliente || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesService = serviceFilter === "all" || hito.codigo_servicio === serviceFilter

    return matchesSearch && matchesService
  })

  const proximasVencer = filteredHitosAlertas.filter((h) => h.estado === 'por_vencer')
  const vencidas = filteredHitosAlertas.filter((h) => h.estado === 'vencido')
  const unreadCount = filteredHitosAlertas.length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vencida":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "proxima_vencer":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "vencida":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Vencida
          </Badge>
        )
      case "proxima_vencer":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Próxima a Vencer
          </Badge>
        )
      default:
        return <Badge variant="outline">Información</Badge>
    }
  }

  const NotificationCard = ({ hito }: { hito: HitoAlert }) => {
    return (
      <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {hito.estado === 'vencido' ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {hito.nombre_hito}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{hito.descripcion}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {getNotificationBadge(hito.estado === 'vencido' ? 'vencida' : 'proxima_vencer')}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{hito.solicitud?.descripcionCargo?.titulo_cargo || 'Sin cargo'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{hito.solicitud?.contacto?.cliente?.nombre_cliente || 'Sin cliente'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{hito.fecha_limite ? formatDateTime(hito.fecha_limite) : 'Sin fecha'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertas y Notificaciones</h1>
            <p className="text-muted-foreground">Gestiona hitos próximos a vencer y vencidos</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {unreadCount} sin leer
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredHitosAlertas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{proximasVencer.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{vencidas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Leer</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Vista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por hito, descripción, cargo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {Object.entries(serviceTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                title="Vista de tarjetas"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md ${viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                title="Vista de tabla"
              >
                <Table className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="todas" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-3 h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="todas"
                  className="flex items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Bell className="h-4 w-4" />
                  Todas ({filteredHitosAlertas.length})
                </TabsTrigger>
                <TabsTrigger
                  value="proximas"
                  className="flex items-center gap-2 p-4 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4" />
                  Próximas a Vencer ({proximasVencer.length})
                </TabsTrigger>
                <TabsTrigger
                  value="vencidas"
                  className="flex items-center gap-2 p-4 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Vencidas ({vencidas.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="todas" className="mt-0">
                <div className="space-y-4">
                  {filteredHitosAlertas.length > 0 ? (
                    filteredHitosAlertas
                      .sort((a, b) => {
                        const dateA = a.fecha_limite ? new Date(a.fecha_limite).getTime() : 0
                        const dateB = b.fecha_limite ? new Date(b.fecha_limite).getTime() : 0
                        return dateB - dateA
                      })
                      .map((hito) => (
                        <Card key={hito.id_hito_solicitud} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                {hito.estado === 'vencido' ? (
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Clock className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{hito.nombre_hito}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{hito.descripcion}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {hito.estado === 'vencido' ? (
                                      <Badge variant="destructive" className="bg-red-100 text-red-800">Vencida</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Próxima a Vencer</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{hito.solicitud?.descripcionCargo?.titulo_cargo || 'Sin cargo'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{hito.fecha_limite ? formatDateTime(hito.fecha_limite) : 'Sin fecha'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{hito.dias_restantes} días {hito.estado === 'vencido' ? 'atrasado' : 'restantes'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay alertas</h3>
                      <p className="text-muted-foreground">No se encontraron alertas con los filtros aplicados.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="proximas" className="mt-0">
                <div className="space-y-4">
                  {proximasVencer.length > 0 ? (
                    proximasVencer
                      .sort((a, b) => {
                        const dateA = a.fecha_limite ? new Date(a.fecha_limite).getTime() : 0
                        const dateB = b.fecha_limite ? new Date(b.fecha_limite).getTime() : 0
                        return dateB - dateA
                      })
                      .map((hito) => (
                        <Card key={hito.id_hito_solicitud} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                <Clock className="h-5 w-5 text-yellow-500" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{hito.nombre_hito}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{hito.descripcion}</p>
                                  </div>
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Próxima a Vencer</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{hito.solicitud?.descripcionCargo?.titulo_cargo || 'Sin cargo'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{hito.fecha_limite ? formatDateTime(hito.fecha_limite) : 'Sin fecha'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{hito.dias_restantes} días restantes</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay hitos próximos a vencer</h3>
                      <p className="text-muted-foreground">Todos los hitos están al día.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vencidas" className="mt-0">
                <div className="space-y-4">
                  {vencidas.length > 0 ? (
                    vencidas
                      .sort((a, b) => {
                        const dateA = a.fecha_limite ? new Date(a.fecha_limite).getTime() : 0
                        const dateB = b.fecha_limite ? new Date(b.fecha_limite).getTime() : 0
                        return dateB - dateA
                      })
                      .map((hito) => (
                        <Card key={hito.id_hito_solicitud} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{hito.nombre_hito}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{hito.descripcion}</p>
                                  </div>
                                  <Badge variant="destructive" className="bg-red-100 text-red-800">Vencida</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{hito.solicitud?.descripcionCargo?.titulo_cargo || 'Sin cargo'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{hito.fecha_limite ? formatDateTime(hito.fecha_limite) : 'Sin fecha'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{Math.abs(hito.dias_restantes)} días atrasado</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">¡Excelente trabajo!</h3>
                      <p className="text-muted-foreground">No tienes hitos vencidos.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tabla Completa de Hitos */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Tabla Completa de Hitos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Todos los campos de los hitos del consultor {user.id}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando hitos...</p>
                </div>
              </div>
            ) : filteredHitosAlertas.length > 0 ? (
              <div className="overflow-x-auto">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Hito</TableHead>
                      <TableHead>Nombre Hito</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Tipo Ancla</TableHead>
                      <TableHead>Duración (días)</TableHead>
                      <TableHead>Avisar Antes (días)</TableHead>
                      <TableHead>Código Servicio</TableHead>
                      <TableHead>Fecha Base</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead>Fecha Cumplimiento</TableHead>
                      <TableHead>Días Restantes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>ID Solicitud</TableHead>
                      <TableHead>Título Cargo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Consultor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHitosAlertas.map((hito) => (
                      <TableRow key={hito.id_hito_solicitud}>
                        <TableCell className="font-medium">
                          {hito.id_hito_solicitud}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {hito.nombre_hito}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={hito.descripcion}>
                          {hito.descripcion}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{hito.tipo_ancla}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {hito.duracion_dias}
                        </TableCell>
                        <TableCell className="text-center">
                          {hito.avisar_antes_dias}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{hito.codigo_servicio}</Badge>
                        </TableCell>
                        <TableCell>
                          {hito.fecha_base ? formatDateTime(hito.fecha_base) : '-'}
                        </TableCell>
                        <TableCell>
                          {hito.fecha_limite ? formatDateTime(hito.fecha_limite) : '-'}
                        </TableCell>
                        <TableCell>
                          {hito.fecha_cumplimiento ? formatDateTime(hito.fecha_cumplimiento) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold ${
                            hito.dias_restantes && hito.dias_restantes < 0 
                              ? 'text-red-600' 
                              : hito.dias_restantes && hito.dias_restantes <= 3 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {hito.dias_restantes !== null ? hito.dias_restantes : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {hito.estado === 'vencido' ? (
                            <Badge variant="destructive">Vencido</Badge>
                          ) : hito.estado === 'por_vencer' ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Por Vencer
                            </Badge>
                          ) : hito.estado === 'completado' ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Completado
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pendiente</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {hito.solicitud?.id_solicitud || '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={hito.solicitud?.descripcionCargo?.titulo_cargo}>
                          {hito.solicitud?.descripcionCargo?.titulo_cargo || '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={hito.solicitud?.contacto?.cliente?.nombre_cliente}>
                          {hito.solicitud?.contacto?.cliente?.nombre_cliente || '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={hito.solicitud?.contacto?.nombre_contacto}>
                          {hito.solicitud?.contacto?.nombre_contacto || '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {hito.solicitud?.usuario ? 
                            `${hito.solicitud.usuario.nombre_usuario} ${hito.solicitud.usuario.apellido_usuario}` : 
                            '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>
            ) : (
              <div className="text-center py-12">
                <Table className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay hitos</h3>
                <p className="text-muted-foreground">
                  No se encontraron hitos para el consultor {user.id} con los filtros aplicados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
