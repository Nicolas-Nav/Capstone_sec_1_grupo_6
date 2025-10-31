import { useState, useEffect, useCallback } from "react"
import { getHitosAlertas, HitoAlert } from "@/lib/api-hitos"

interface Notification {
  id: string
  hito: HitoAlert
  read: boolean
  created_at: string
}

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Cargar IDs de notificaciones leídas desde localStorage
  const getReadNotificationIds = useCallback((): Set<string> => {
    if (!userId) return new Set()
    try {
      const stored = localStorage.getItem(`llc_notifications_read_${userId}`)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  }, [userId])

  // Guardar IDs de notificaciones leídas en localStorage
  const saveReadNotificationIds = useCallback((ids: Set<string>) => {
    if (!userId) return
    try {
      localStorage.setItem(`llc_notifications_read_${userId}`, JSON.stringify([...ids]))
    } catch (error) {
      console.error('Error al guardar notificaciones leídas:', error)
    }
  }, [userId])

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('🔔 [NOTIFICATIONS] Cargando notificaciones para usuario:', userId)
      
      const hitos = await getHitosAlertas(userId)
      console.log('🔔 [NOTIFICATIONS] Hitos recibidos:', hitos.length)
      
      const readIds = getReadNotificationIds()
      
      // Convertir hitos a notificaciones
      const newNotifications: Notification[] = hitos.map((hito) => {
        const id = `hito-${hito.id_hito_solicitud}`
        return {
          id,
          hito,
          read: readIds.has(id),
          created_at: hito.fecha_limite || new Date().toISOString(),
        }
      })

      // Ordenar por fecha (más recientes primero)
      newNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      const unread = newNotifications.filter(n => !n.read).length
      
      console.log('🔔 [NOTIFICATIONS] Notificaciones totales:', newNotifications.length, 'No leídas:', unread)
      
      setNotifications(newNotifications)
      setUnreadCount(unread)
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error al cargar notificaciones:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [userId, getReadNotificationIds])

  const markAsRead = useCallback(() => {
    if (!userId) return
    
    console.log('🔔 [NOTIFICATIONS] markAsRead llamado, notificaciones actuales:', notifications.length)
    
    // Marcar todas las notificaciones actuales como leídas
    const readIds = new Set<string>()
    notifications.forEach(n => {
      readIds.add(n.id)
      console.log('🔔 [NOTIFICATIONS] Marcando como leída:', n.id)
    })
    
    saveReadNotificationIds(readIds)
    
    // Actualizar estado inmediatamente
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      console.log('🔔 [NOTIFICATIONS] Estado actualizado, todas marcadas como leídas')
      return updated
    })
    setUnreadCount(0)
    
    console.log('🔔 [NOTIFICATIONS] Todas las notificaciones marcadas como leídas, contador:', 0)
  }, [userId, notifications, saveReadNotificationIds])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (!userId) return
    
    const readIds = getReadNotificationIds()
    readIds.add(notificationId)
    saveReadNotificationIds(readIds)
    
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [userId, getReadNotificationIds, saveReadNotificationIds])

  useEffect(() => {
    if (userId) {
      loadNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
    }
  }, [userId, loadNotifications])

  // Obtener solo las notificaciones más recientes (no leídas primero)
  const getRecentNotifications = useCallback((limit: number = 5) => {
    const unread = notifications.filter(n => !n.read)
    const read = notifications.filter(n => n.read)
    
    return [...unread, ...read].slice(0, limit)
  }, [notifications])

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markNotificationAsRead,
    getRecentNotifications,
  }
}

