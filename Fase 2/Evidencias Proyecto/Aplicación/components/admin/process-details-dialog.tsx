"use client"

import { serviceTypeLabels, processStatusLabels, getCandidatesByProcess, getHitosByProcess } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Building2, User, Calendar, FileText, Users, Target } from "lucide-react"
import type { Process } from "@/lib/types"

interface ProcessDetailsDialogProps {
  process: Process
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProcessDetailsDialog({ process, open, onOpenChange }: ProcessDetailsDialogProps) {
  const candidates = getCandidatesByProcess(process.id)
  const hitos = getHitosByProcess(process.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {process.position_title}
          </DialogTitle>
          <DialogDescription>Detalles completos del proceso de reclutamiento</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cliente</p>
                    <p className="text-sm text-muted-foreground">{process.client.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Consultor</p>
                    <p className="text-sm text-muted-foreground">{process.consultant.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tipo de Servicio</p>
                    <Badge variant="outline">{serviceTypeLabels[process.service_type]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <Badge className={getStatusColor(process.status)}>{processStatusLabels[process.status]}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Descripción del Cargo</p>
                  <p className="text-sm text-muted-foreground">{process.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Requisitos y Condiciones</p>
                  <p className="text-sm text-muted-foreground">{process.requirements}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Vacantes</p>
                    <p className="text-2xl font-bold text-primary">{process.vacancies}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fecha Creación</p>
                    <p className="text-sm text-muted-foreground">{formatDate(process.created_at)}</p>
                  </div>
                  {process.started_at && (
                    <div>
                      <p className="text-sm font-medium">Fecha Inicio</p>
                      <p className="text-sm text-muted-foreground">{formatDate(process.started_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Persona de Contacto</p>
                  <p className="text-sm text-muted-foreground">{process.client.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{process.client.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{process.client.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Summary */}
          {candidates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidatos ({candidates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {candidates.filter((c) => c.status === "postulado").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Postulados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {candidates.filter((c) => c.status === "filtrado").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Filtrados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {candidates.filter((c) => c.status === "presentado").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Presentados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {candidates.filter((c) => c.status === "aprobado").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Aprobados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hitos Summary */}
          {hitos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de Hitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hitos.map((hito) => (
                    <div key={hito.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{hito.name}</p>
                        <p className="text-xs text-muted-foreground">{hito.description}</p>
                      </div>
                      <Badge className={getStatusColor(hito.status)}>{hito.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
