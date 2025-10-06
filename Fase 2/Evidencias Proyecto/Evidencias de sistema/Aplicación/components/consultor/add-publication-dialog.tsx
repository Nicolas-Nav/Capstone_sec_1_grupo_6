"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { publicacionService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Globe } from "lucide-react"

interface AddPublicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudId: number
  onSuccess?: () => void
}

export function AddPublicationDialog({ open, onOpenChange, solicitudId, onSuccess }: AddPublicationDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [portales, setPortales] = useState<any[]>([])
  const [loadingPortales, setLoadingPortales] = useState(false)
  const [formData, setFormData] = useState({
    id_portal_postulacion: "",
    url_publicacion: "",
    estado_publicacion: "Activa",
    fecha_publicacion: new Date().toISOString().split('T')[0]
  })

  // Cargar portales cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadPortales()
    }
  }, [open])

  const loadPortales = async () => {
    try {
      setLoadingPortales(true)
      const response = await publicacionService.getPortales()
      
      if (response.success && response.data) {
        setPortales(response.data)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar portales de postulación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cargar portales:", error)
      toast({
        title: "Error",
        description: "Error al cargar portales de postulación",
        variant: "destructive",
      })
    } finally {
      setLoadingPortales(false)
    }
  }

  const handleSubmit = async () => {
    // Validaciones con mensajes específicos
    if (!formData.id_portal_postulacion) {
      toast({
        title: "Campo obligatorio",
        description: "El portal de postulación es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.url_publicacion?.trim()) {
      toast({
        title: "Campo obligatorio",
        description: "La URL de la publicación es obligatoria",
        variant: "destructive",
      })
      return
    }

    // Validar formato URL
    try {
      new URL(formData.url_publicacion)
    } catch (error) {
      toast({
        title: "Campo obligatorio",
        description: "Ingresa una URL válida (ej: https://ejemplo.com)",
        variant: "destructive",
      })
      return
    }
    
    // Validar que la URL tenga protocolo
    if (!formData.url_publicacion.startsWith('http://') && !formData.url_publicacion.startsWith('https://')) {
      toast({
        title: "Campo obligatorio",
        description: "La URL debe comenzar con http:// o https://",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await publicacionService.create({
        id_solicitud: solicitudId,
        id_portal_postulacion: parseInt(formData.id_portal_postulacion),
        url_publicacion: formData.url_publicacion,
        estado_publicacion: formData.estado_publicacion
      })

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: "¡Publicación creada exitosamente!",
          variant: "default",
        })
        
        // Limpiar formulario
        setFormData({
          id_portal_postulacion: "",
          url_publicacion: "",
          estado_publicacion: "Activa",
          fecha_publicacion: new Date().toISOString().split('T')[0]
        })

        // Cerrar diálogo
        onOpenChange(false)

        // Ejecutar callback de éxito
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Error al crear publicación",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al crear publicación:", error)
      toast({
        title: "Error",
        description: error.message || "Error al crear publicación",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nueva Publicación
          </DialogTitle>
          <DialogDescription>
            Publica la oferta laboral en un portal de postulación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Portal de Postulación */}
          <div className="space-y-2">
            <Label htmlFor="portal">
              Portal de Postulación <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.id_portal_postulacion}
              onValueChange={(value) => setFormData({ ...formData, id_portal_postulacion: value })}
              disabled={loadingPortales}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPortales ? "Cargando portales..." : "Selecciona un portal"} />
              </SelectTrigger>
              <SelectContent>
                {portales.map((portal) => (
                  <SelectItem key={portal.id} value={portal.id.toString()}>
                    {portal.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL de Publicación */}
          <div className="space-y-2">
            <Label htmlFor="url">
              URL de la Publicación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url_publicacion}
              onChange={(e) => setFormData({ ...formData, url_publicacion: e.target.value })}
              placeholder="https://ejemplo.com/oferta/12345"
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado_publicacion}
              onValueChange={(value) => setFormData({ ...formData, estado_publicacion: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activa">Activa</SelectItem>
                <SelectItem value="Pausada">Pausada</SelectItem>
                <SelectItem value="Cerrada">Cerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha de Publicación */}
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de Publicación</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha_publicacion}
              onChange={(e) => setFormData({ ...formData, fecha_publicacion: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

