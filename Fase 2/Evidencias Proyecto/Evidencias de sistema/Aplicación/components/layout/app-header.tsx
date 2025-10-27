"use client"

import { useAuth } from "@/hooks/auth"
import { getNotificationsByUser } from "@/lib/mock-data"
import { getHitosAlertas, convertHitosToNotifications } from "@/lib/api-hitos"
import { Bell } from "lucide-react"
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
import { useEffect, useState } from "react"

export function AppHeader() {
  const { user } = useAuth()
  const [hitosAlertas, setHitosAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadHitosAlertas()
    }
  }, [user])

  const loadHitosAlertas = async () => {
    if (!user) return
    
    try {
      const alertas = await getHitosAlertas(user.id)
      setHitosAlertas(alertas)
    } catch (error) {
      console.error('Error al cargar alertas de hitos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const userNotifications = getNotificationsByUser(user.id)
  const hitosNotifications = convertHitosToNotifications(hitosAlertas, user.id)
  
  // Combinar notificaciones
  const allNotifications = [...userNotifications, ...hitosNotifications]
  const unreadCount = allNotifications.filter((n) => !n.read).length

  // Usar notificaciones reales en lugar de mock
  const recentNotifications = allNotifications.slice(0, 3)

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificaciones</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} nuevas
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentNotifications.slice(0, 3).map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(notification.created_at)}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/alertas" className="w-full text-center text-sm font-medium">
                    Ver todas las alertas
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
