/**
 * Servicio para conectar con los endpoints de hitos del backend
 * Usa los endpoints existentes de hitoSolicitudService
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface HitoAlert {
  id_hito_solicitud: number
  nombre_hito: string
  descripcion: string
  fecha_limite: string
  dias_restantes: number
  estado: 'por_vencer' | 'vencido' | 'pendiente' | 'completado'
  debe_avisar: boolean
  solicitud?: {
    id_solicitud: number
    position_title: string
    client?: {
      nombre_cliente: string
    }
    usuario?: {
      nombre_usuario: string
    }
  }
}

export interface HitosDashboard {
  consultor_id: string
  resumen: {
    total: number
    completados: number
    pendientes: number
    por_vencer: number
    vencidos: number
    porcentaje_completados: number
  }
  hitos: {
    por_vencer: HitoAlert[]
    vencidos: HitoAlert[]
    pendientes: HitoAlert[]
    completados: HitoAlert[]
  }
  alertas_urgentes: HitoAlert[]
  timestamp: string
}

/**
 * Obtener alertas de hitos para un consultor específico
 */
export async function getHitosAlertas(consultorId: string): Promise<HitoAlert[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/hitos-solicitud/alertas?consultor_id=${consultorId}`)
    
    if (!response.ok) {
      throw new Error(`Error al obtener alertas: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Combinar hitos por vencer y vencidos
    const alertas: HitoAlert[] = []
    
    if (data.data?.por_vencer) {
      alertas.push(...data.data.por_vencer)
    }
    
    if (data.data?.vencidos) {
      alertas.push(...data.data.vencidos)
    }
    
    return alertas
  } catch (error) {
    console.error('Error al obtener alertas de hitos:', error)
    return []
  }
}

/**
 * Obtener dashboard completo de hitos para un consultor
 */
export async function getHitosDashboard(consultorId: string): Promise<HitosDashboard | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/hitos-solicitud/dashboard/${consultorId}`)
    
    if (!response.ok) {
      throw new Error(`Error al obtener dashboard: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error al obtener dashboard de hitos:', error)
    return null
  }
}

/**
 * Obtener hitos por solicitud específica
 */
export async function getHitosBySolicitud(solicitudId: number): Promise<HitoAlert[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/hitos-solicitud/solicitud/${solicitudId}`)
    
    if (!response.ok) {
      throw new Error(`Error al obtener hitos: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error al obtener hitos por solicitud:', error)
    return []
  }
}

/**
 * Completar un hito
 */
export async function completarHito(hitoId: number, fechaCumplimiento?: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/hitos-solicitud/${hitoId}/completar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fecha_cumplimiento: fechaCumplimiento || new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error al completar hito: ${response.statusText}`)
    }
    
    return true
  } catch (error) {
    console.error('Error al completar hito:', error)
    return false
  }
}

/**
 * Obtener estadísticas de hitos
 */
export async function getHitosEstadisticas() {
  try {
    const response = await fetch(`${API_BASE_URL}/hitos-solicitud/estadisticas`)
    
    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error al obtener estadísticas de hitos:', error)
    return null
  }
}

/**
 * Convertir hitos a notificaciones para compatibilidad con el sistema existente
 */
export function convertHitosToNotifications(hitos: HitoAlert[], userId: string) {
  return hitos.map((hito) => ({
    id: `hito-${hito.id_hito_solicitud}`,
    user_id: userId,
    process_id: hito.solicitud?.id_solicitud?.toString() || '',
    hito_id: hito.id_hito_solicitud.toString(),
    type: hito.estado === 'vencido' ? 'vencida' : 'proxima_vencer',
    title: getNotificationTitle(hito),
    message: getNotificationMessage(hito),
    created_at: new Date().toISOString(),
    read: false,
  }))
}

/**
 * Generar título de notificación basado en el hito
 */
function getNotificationTitle(hito: HitoAlert): string {
  if (hito.estado === 'vencido') {
    return `${hito.nombre_hito} vencido`
  } else if (hito.estado === 'por_vencer') {
    return `${hito.nombre_hito} próximo a vencer`
  } else {
    return hito.nombre_hito
  }
}

/**
 * Generar mensaje de notificación basado en el hito
 */
function getNotificationMessage(hito: HitoAlert): string {
  const proceso = hito.solicitud?.position_title || 'Proceso'
  const cliente = hito.solicitud?.client?.nombre_cliente || 'Cliente'
  
  if (hito.estado === 'vencido') {
    return `El hito "${hito.nombre_hito}" para "${proceso}" de ${cliente} está vencido`
  } else if (hito.estado === 'por_vencer') {
    const dias = hito.dias_restantes
    const diasTexto = dias === 1 ? '1 día' : `${dias} días`
    return `El hito "${hito.nombre_hito}" para "${proceso}" de ${cliente} vence en ${diasTexto}`
  } else {
    return `Hito "${hito.nombre_hito}" para "${proceso}" de ${cliente}`
  }
}
