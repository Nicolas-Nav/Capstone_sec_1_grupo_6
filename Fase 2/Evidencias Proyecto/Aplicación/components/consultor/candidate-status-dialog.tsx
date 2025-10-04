"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { candidatoService } from "@/lib/api"
import { toast } from "sonner"
import { UserCheck, AlertCircle, XCircle } from "lucide-react"
import type { Candidate } from "@/lib/types"

interface CandidateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  onSuccess?: () => void
}

export function CandidateStatusDialog({ open, onOpenChange, candidate, onSuccess }: CandidateStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    status: "",
    comment: ""
  })

  // Cargar datos del candidato cuando se abre el diálogo
  useEffect(() => {
    if (open && candidate) {
      setFormData({
        status: candidate.presentation_status || "no_presentado",
        comment: candidate.rejection_reason || ""
      })
    }
  }, [open, candidate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!candidate) return

    // Validar que si es "no_presentado" o "rechazado" debe tener comentario
    if ((formData.status === "no_presentado" || formData.status === "rechazado") && !formData.comment.trim()) {
      toast.error(`Debe agregar un comentario para el estado "${formData.status === "no_presentado" ? "No Presentado" : "Rechazado"}"`)
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await candidatoService.updateStatus(
        parseInt(candidate.id),
        formData.status as "presentado" | "no_presentado" | "rechazado",
        formData.comment || undefined
      )

      if (response.success) {
        toast.success("Estado del candidato actualizado correctamente")
        onSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(response.message || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      toast.error("No se pudo actualizar el estado del candidato")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value,
      // Limpiar comentario si cambia a "presentado"
      comment: value === "presentado" ? "" : prev.comment
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "presentado":
        return <UserCheck className="h-4 w-4 text-green-600" />
      case "no_presentado":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "rechazado":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "presentado":
        return "Presentado"
      case "no_presentado":
        return "No Presentado"
      case "rechazado":
        return "Rechazado"
      default:
        return "Sin Estado"
    }
  }

  const getCommentPlaceholder = (status: string) => {
    switch (status) {
      case "no_presentado":
        return "Ingrese la razón por la cual el candidato no fue presentado..."
      case "rechazado":
        return "Ingrese el motivo del rechazo del candidato..."
      default:
        return "Comentario adicional (opcional)..."
    }
  }

  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(formData.status)}
            Cambiar Estado del Candidato
          </DialogTitle>
          <DialogDescription>
            Actualizar el estado de <strong>{candidate.name}</strong> en el proceso de selección.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado del Candidato</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presentado">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    Presentado
                  </div>
                </SelectItem>
                <SelectItem value="no_presentado">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    No Presentado
                  </div>
                </SelectItem>
                <SelectItem value="rechazado">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Rechazado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              Comentario
              {(formData.status === "no_presentado" || formData.status === "rechazado") && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Textarea
              id="comment"
              placeholder={getCommentPlaceholder(formData.status)}
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
              className="resize-none"
            />
            {(formData.status === "no_presentado" || formData.status === "rechazado") && (
              <p className="text-xs text-muted-foreground">
                El comentario es obligatorio para este estado.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
