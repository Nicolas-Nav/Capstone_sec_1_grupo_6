"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { serviceTypeLabels, getCandidatesByProcess, processStatusLabels } from "@/lib/mock-data"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Building2, User, Calendar, Target, FileText, Download, Settings } from "lucide-react"
import type { Process, ProcessStatus, Candidate } from "@/lib/types"
import { useState, useEffect } from "react"

interface ProcessModule1Props {
  process: Process
  descripcionCargo?: any
}

export function ProcessModule1({ process, descripcionCargo }: ProcessModule1Props) {
  const [personalData, setPersonalData] = useState({
    name: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
  })

  const [processStatus, setProcessStatus] = useState<ProcessStatus>(process.status)
  const [statusChangeReason, setStatusChangeReason] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos reales desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const candidatesData = await getCandidatesByProcess(process.id)
        setCandidates(candidatesData)
      } catch (error) {
        console.error('Error al cargar candidatos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [process.id])

  const isEvaluationProcess =
    process.service_type === "evaluacion_psicolaboral" || process.service_type === "test_psicolaboral"

  // For evaluation processes, find the candidate with CV
  const candidateWithCV = candidates.find((c) => c.cv_file && c.rut)

  const handlePersonalDataSubmit = () => {
    console.log("Saving personal data:", personalData)
    // Here you would save the personal data and proceed to module 4
  }

  const handleStatusChange = (newStatus: ProcessStatus) => {
    setProcessStatus(newStatus)
    console.log(`Process status changed to: ${newStatus}`)
    console.log(`Reason: ${statusChangeReason}`)
    // Here you would save the status change to the backend
  }

  const canChangeStatus = (currentStatus: ProcessStatus, newStatus: ProcessStatus) => {
    // No se puede cambiar a "completado" desde el módulo 1
    if (newStatus === "completado") return false
    
    // No se puede cambiar de "cancelado" o "congelado" a estados activos sin razón
    if ((currentStatus === "cancelado" || currentStatus === "congelado") && 
        (newStatus === "iniciado" || newStatus === "en_progreso")) {
      return statusChangeReason.trim().length > 0
    }
    
    return true
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Módulo 1 - Solicitud y Cargo</h2>
        <p className="text-muted-foreground">Información detallada del cargo y requisitos del proceso</p>
      </div>

      {/* Process Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información del Proceso
          </CardTitle>
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
                <p className="text-sm font-medium">Contacto</p>
                <p className="text-sm text-muted-foreground">{process.client.contacts[0]?.name || 'Sin contacto'}</p>
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
                <p className="text-sm font-medium">Fecha Creación</p>
                <p className="text-sm text-muted-foreground">{formatDate(process.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Cargo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{process.position_title}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vacantes</p>
                <p className="text-2xl font-bold text-primary">{process.vacancies}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge className={getStatusColor(processStatus)}>
                  {processStatusLabels[processStatus]}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Descripción del Cargo</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{process.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Requisitos y Condiciones</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{process.requirements}</p>
          </div>

          {process.excel_file && (
            <div>
              <h4 className="font-medium mb-2">Archivo Adjunto</h4>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar {process.excel_file}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Persona de Contacto</p>
              <p className="text-sm text-muted-foreground">{process.client.contacts[0]?.name || 'Sin contacto'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{process.client.contacts[0]?.email || 'Sin email'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Teléfono</p>
              <p className="text-sm text-muted-foreground">{process.client.contacts[0]?.phone || 'Sin teléfono'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestión del Estado del Proceso
          </CardTitle>
          <CardDescription>
            Cambia el estado del proceso según sea necesario. Disponible para todos los tipos de proceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current-status">Estado Actual</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(processStatus)}>
                  {processStatusLabels[processStatus]}
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="new-status">Nuevo Estado</Label>
              <Select
                value={processStatus}
                onValueChange={(value: ProcessStatus) => {
                  if (canChangeStatus(process.status, value)) {
                    setProcessStatus(value)
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creado">Creado</SelectItem>
                  <SelectItem value="iniciado">Iniciado</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="congelado">Congelado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(processStatus === "cancelado" || processStatus === "congelado") && (
            <div className="space-y-2">
              <Label htmlFor="status-reason">
                {processStatus === "cancelado" ? "Motivo de Cancelación" : "Motivo de Congelamiento"}
              </Label>
              <Textarea
                id="status-reason"
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder={
                  processStatus === "cancelado" 
                    ? "Describe el motivo por el cual se cancela el proceso..."
                    : "Describe el motivo por el cual se congela el proceso..."
                }
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {processStatus !== process.status && (
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => handleStatusChange(processStatus)}
                variant={processStatus === "cancelado" ? "destructive" : "default"}
                className={
                  processStatus === "cancelado" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : processStatus === "congelado"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : ""
                }
              >
                {processStatus === "cancelado" ? "Cancelar Proceso" : 
                 processStatus === "congelado" ? "Congelar Proceso" : 
                 "Actualizar Estado"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setProcessStatus(process.status)
                  setStatusChangeReason("")
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Status Information */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Información sobre Estados:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><strong>Congelado:</strong> Pausa temporal del proceso. Se puede reactivar más tarde.</li>
              <li><strong>Cancelado:</strong> Termina definitivamente el proceso. Requiere motivo.</li>
              <li><strong>En Progreso:</strong> El proceso está activo y en desarrollo.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Personal Data Form for Evaluation Processes */}
      {isEvaluationProcess && candidateWithCV && (
        <Card>
          <CardHeader>
            <CardTitle>Completar Datos Personales</CardTitle>
            <CardDescription>
              CV del candidato disponible. Complete los datos personales para proceder con la evaluación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">CV Disponible:</span>
                <span className="text-sm">{candidateWithCV.cv_file}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Candidato:</strong> {candidateWithCV.name}
                </p>
                <p>
                  <strong>RUT:</strong> {candidateWithCV.rut}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={personalData.name}
                  onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                  placeholder="Ingrese nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  value={personalData.rut}
                  onChange={(e) => setPersonalData({ ...personalData, rut: e.target.value })}
                  placeholder="12.345.678-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={personalData.phone}
                  onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={personalData.address}
                onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                placeholder="Ingrese dirección completa"
                rows={2}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handlePersonalDataSubmit}>Guardar y Continuar a Evaluación</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
