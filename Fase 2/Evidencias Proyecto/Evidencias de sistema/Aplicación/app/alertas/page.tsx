"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/auth"
import { getNotificationsByUser, mockProcesses, mockUsers, serviceTypeLabels } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/utils"
import { Bell, AlertTriangle, Clock, Search, Filter, CheckCircle, Calendar, User, Briefcase } from "lucide-react"

export default function AlertasPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [consultantFilter, setConsultantFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")

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

  const userNotifications = getNotificationsByUser(user.id)

  // Mock additional notifications for better demonstration
  const allNotifications = [
    ...userNotifications,
    {
      id: "demo-1",
      user_id: user.id,
      process_id: "1",
      hito_id: "4",
      type: "proxima_vencer" as const,
      title: "Evaluación Psicolaboral próxima a vencer",
      message: "La evaluación psicolaboral para 'Desarrollador Full Stack Senior' vence en 1 día",
      created_at: "2024-02-01T09:00:00Z",
      read: false,
    },
    {
      id: "demo-2",
      user_id: user.id,
      process_id: "2",
      hito_id: "5",
      type: "proxima_vencer" as const,
      title: "Búsqueda de candidatos próxima a vencer",
      message: "La búsqueda de candidatos para 'Diseñador UX/UI' vence en 2 días",
      created_at: "2024-02-01T08:00:00Z",
      read: false,
    },
    {
      id: "demo-3",
      user_id: user.id,
      process_id: "6",
      hito_id: "7",
      type: "vencida" as const,
      title: "Hito vencido",
      message: "El hito 'Búsqueda de candidatos' para 'Analista de Datos' está vencido hace 2 días",
      created_at: "2024-01-30T10:00:00Z",
      read: false,
    },
    {
      id: "demo-4",
      user_id: user.id,
      process_id: "3",
      hito_id: "6",
      type: "proxima_vencer" as const,
      title: "Programar evaluación próxima a vencer",
      message: "Debes programar la evaluación para 'Gerente de Ventas' en las próximas 24 horas",
      created_at: "2024-02-01T14:00:00Z",
      read: true,
    },
  ]

  const filteredNotifications = allNotifications.filter((notification) => {
    const process = mockProcesses.find((p) => p.id === notification.process_id)
    if (!process) return false

    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.position_title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesConsultant = consultantFilter === "all" || process.consultant_id === consultantFilter
    const matchesService = serviceFilter === "all" || process.service_type === serviceFilter

    return matchesSearch && matchesConsultant && matchesService
  })

  const proximasVencer = filteredNotifications.filter((n) => n.type === "proxima_vencer")
  const vencidas = filteredNotifications.filter((n) => n.type === "vencida")
  const unreadCount = filteredNotifications.filter((n) => !n.read).length

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

  const NotificationCard = ({ notification }: { notification: (typeof allNotifications)[0] }) => {
    const process = mockProcesses.find((p) => p.id === notification.process_id)
    if (!process) return null

    return (
      <Card className={`${!notification.read ? "border-l-4 border-l-primary" : ""} hover:shadow-md transition-shadow`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                  {getNotificationBadge(notification.type)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{process.position_title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{process.client.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDateTime(notification.created_at)}</span>
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
            <div className="text-2xl font-bold">{filteredNotifications.length}</div>
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
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, mensaje o proceso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {user.role === "admin" && (
              <Select value={consultantFilter} onValueChange={setConsultantFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Consultor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los consultores</SelectItem>
                  {mockUsers
                    .filter((u) => u.role === "consultor")
                    .map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        {consultant.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
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
                  Todas ({filteredNotifications.length})
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
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((notification) => <NotificationCard key={notification.id} notification={notification} />)
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
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((notification) => <NotificationCard key={notification.id} notification={notification} />)
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
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((notification) => <NotificationCard key={notification.id} notification={notification} />)
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
    </div>
  )
}
