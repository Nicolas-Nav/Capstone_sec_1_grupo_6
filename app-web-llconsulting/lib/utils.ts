import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount)
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Process statuses
    creado: "bg-gray-100 text-gray-800",
    iniciado: "bg-blue-100 text-blue-800",
    en_progreso: "bg-cyan-100 text-cyan-800",
    completado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",

    // Candidate statuses
    postulado: "bg-gray-100 text-gray-800",
    filtrado: "bg-blue-100 text-blue-800",
    presentado: "bg-purple-100 text-purple-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
    contratado: "bg-emerald-100 text-emerald-800",

    // Hito statuses
    pendiente: "bg-gray-100 text-gray-800",
    vencido: "bg-red-100 text-red-800",

    // Client responses
    observado: "bg-cyan-100 text-cyan-800",
  }

  return statusColors[status] || "bg-gray-100 text-gray-800"
}

export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isOverdue(dueDate: string): boolean {
  return calculateDaysUntilDue(dueDate) < 0
}

export function isNearDue(dueDate: string, anticipationDays = 2): boolean {
  const daysUntil = calculateDaysUntilDue(dueDate)
  return daysUntil <= anticipationDays && daysUntil >= 0
}
