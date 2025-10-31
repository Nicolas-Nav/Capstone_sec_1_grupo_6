"use client"

import { useAuth } from "@/hooks/auth"
import { useNotifications } from "@/hooks/useNotifications"
import { Bell, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export function AppHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const { 
    unreadCount, 
    getRecentNotifications, 
    notifications,
    markAsRead,
    loadNotifications,
    loading 
  } = useNotifications(user?.id)
  
  const hasShownLoginToast = useRef(false)
  const lastUnreadCount = useRef(0)

  // Resetear el flag cuando cambia el usuario
  useEffect(() => {
    hasShownLoginToast.current = false
    lastUnreadCount.current = 0
  }, [user?.id])

  // Mostrar toast automático cuando hay notificaciones nuevas (no leídas)
  useEffect(() => {
    if (!loading && user && unreadCount > 0) {
      // Solo mostrar toast si el número de no leídas aumentó (nuevas notificaciones)
      if (unreadCount > lastUnreadCount.current && !hasShownLoginToast.current) {
        const timer = setTimeout(() => {
          const recentNotifications = getRecentNotifications(5)
          const unreadNotifications = recentNotifications.filter(n => !n.read)
          const vencidas = unreadNotifications.filter(n => n.hito.estado === 'vencido').length
          const porVencer = unreadNotifications.filter(n => n.hito.estado === 'por_vencer').length
          
          if (vencidas > 0 && porVencer > 0) {
            toast.warning(
              `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} nueva${unreadCount !== 1 ? 's' : ''}`,
              {
                description: `${vencidas} vencida${vencidas !== 1 ? 's' : ''} y ${porVencer} por vencer. Haz click en la campana para ver.`,
                duration: 6000,
              }
            )
          } else if (vencidas > 0) {
            toast.error(
              `Tienes ${vencidas} notificación${vencidas !== 1 ? 'es' : ''} nueva${vencidas !== 1 ? 's' : ''}`,
              {
                description: `${vencidas} hito${vencidas !== 1 ? 's' : ''} vencido${vencidas !== 1 ? 's' : ''}. Haz click en la campana para ver.`,
                duration: 6000,
              }
            )
          } else if (porVencer > 0) {
            toast.success(
              `Tienes ${porVencer} notificación${porVencer !== 1 ? 'es' : ''} nueva${porVencer !== 1 ? 's' : ''}`,
              {
                description: `${porVencer} hito${porVencer !== 1 ? 's' : ''} próximo${porVencer !== 1 ? 's' : ''} a vencer. Haz click en la campana para ver.`,
                duration: 6000,
              }
            )
          }
          
          hasShownLoginToast.current = true
          lastUnreadCount.current = unreadCount
        }, 1500) // Esperar 1.5 segundos después de cargar
        
        return () => clearTimeout(timer)
      }
    }
    lastUnreadCount.current = unreadCount
  }, [loading, user, unreadCount, getRecentNotifications])

  if (!user) return null

  const recentNotifications = getRecentNotifications(5)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleDropdownOpen = (open: boolean) => {
    console.log('🔔 [HEADER] Dropdown abierto:', open)
    if (open && unreadCount > 0) {
      // Marcar como leídas al abrir el dropdown
      console.log('🔔 [HEADER] Marcando notificaciones como leídas')
      markAsRead()
      // Recargar notificaciones después de marcarlas
      setTimeout(() => {
        loadNotifications()
      }, 300)
    }
  }

  const handleButtonClick = () => {
    console.log('🔔 [HEADER] Botón de notificaciones clickeado')
    setPopoverOpen(!popoverOpen)
    if (!popoverOpen && unreadCount > 0) {
      // Marcar como leídas al abrir
      console.log('🔔 [HEADER] Marcando notificaciones como leídas')
      markAsRead()
      // Recargar notificaciones después de marcarlas
      setTimeout(() => {
        loadNotifications()
      }, 300)
    }
  }

  const handleNotificationClick = (hitoId: number) => {
    console.log('🔔 [HEADER] Click en notificación:', hitoId)
    // Ir a la página de alertas al hacer click
    setPopoverOpen(false)
    router.push('/alertas')
  }

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (popoverOpen && !target.closest('[data-notifications-container]')) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [popoverOpen])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <SidebarTrigger className="mr-4" />

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {user.role === "admin" ? "Panel de Administración" : "Panel de Consultor"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Dropdown Menu (intento principal) */}
            <DropdownMenu onOpenChange={handleDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 z-[100]" style={{ zIndex: 9999 }}>
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificaciones</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading ? (
                  <DropdownMenuItem disabled className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
                  </DropdownMenuItem>
                ) : recentNotifications.length > 0 ? (
                  <>
                    {recentNotifications.map((notification) => {
                      const hito = notification.hito
                      const isVencido = hito.estado === 'vencido'
                      const isPorVencer = hito.estado === 'por_vencer'
                      
                      return (
                        <DropdownMenuItem 
                          key={notification.id} 
                          className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                          onClick={() => handleNotificationClick(hito.id_hito_solicitud)}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {isVencido ? (
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-orange-600" />
                                )}
                                <p className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                  {hito.nombre_hito}
                                </p>
                                {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {hito.descripcion}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                {hito.solicitud?.descripcionCargo?.titulo_cargo && (
                                  <span className="truncate max-w-[120px]">
                                    {hito.solicitud.descripcionCargo.titulo_cargo}
                                  </span>
                                )}
                                {hito.fecha_limite && (
                                  <span>• {formatDateTime(hito.fecha_limite)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <DropdownMenuItem disabled className="flex items-center justify-center p-4">
                    <span className="text-sm text-muted-foreground">No hay notificaciones</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/alertas" className="w-full text-center text-sm font-medium">
                    Ver todas las alertas
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón alternativo con div controlado (solución simple y confiable) */}
            <div className="relative" data-notifications-container>
              <Button 
                variant="outline" 
                size="sm" 
                className="relative" 
                title="Ver notificaciones"
                onClick={handleButtonClick}
              >
                <Bell className="h-4 w-4 mr-2" />
                {unreadCount > 0 && (
                  <>
                    <span className="text-xs">Alertas</span>
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  </>
                )}
                {unreadCount === 0 && <span className="text-xs">Alertas</span>}
              </Button>
              
              {/* Panel de notificaciones */}
              {popoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[500px] overflow-y-auto bg-popover border rounded-md shadow-lg z-[9999] p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Notificaciones</h4>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="border-t pt-2">
                      {loading ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
                        </div>
                      ) : recentNotifications.length > 0 ? (
                        <div className="space-y-2">
                          {recentNotifications.map((notification) => {
                            const hito = notification.hito
                            const isVencido = hito.estado === 'vencido'
                            const isPorVencer = hito.estado === 'por_vencer'
                            
                            return (
                              <div
                                key={notification.id}
                                className="p-3 rounded-md border cursor-pointer hover:bg-accent transition-colors"
                                onClick={() => handleNotificationClick(hito.id_hito_solicitud)}
                              >
                                <div className="flex items-start gap-2">
                                  {isVencido ? (
                                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                        {hito.nombre_hito}
                                      </p>
                                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {hito.descripcion}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                      {hito.solicitud?.descripcionCargo?.titulo_cargo && (
                                        <span className="truncate max-w-[120px]">
                                          {hito.solicitud.descripcionCargo.titulo_cargo}
                                        </span>
                                      )}
                                      {hito.fecha_limite && (
                                        <span>• {formatDateTime(hito.fecha_limite)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          <div className="pt-2 border-t">
                            <Link 
                              href="/alertas" 
                              className="block text-center text-sm font-medium text-primary hover:underline"
                              onClick={() => setPopoverOpen(false)}
                            >
                              Ver todas las alertas
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-4">
                          <span className="text-sm text-muted-foreground">No hay notificaciones</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
