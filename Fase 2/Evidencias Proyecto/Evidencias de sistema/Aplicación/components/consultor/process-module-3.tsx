"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCandidatesByProcess } from "@/lib/api"
import { candidateStatusLabels, processStatusLabels } from "@/lib/utils"
import { estadoClienteService, solicitudService } from "@/lib/api"
import { getStatusColor, formatCurrency, isProcessBlocked } from "@/lib/utils"
import { ChevronDown, ChevronRight, ArrowLeft, User, Mail, Phone, DollarSign, Calendar, Save, Loader2, Settings, CheckCircle, AlertCircle } from "lucide-react"
import type { Process, Candidate, ProcessStatus } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ProcessBlocked } from "./ProcessBlocked"

interface ProcessModule3Props {
  process: Process
}

export function ProcessModule3({ process }: ProcessModule3Props) {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [estadosCliente, setEstadosCliente] = useState<any[]>([])
  const [savingState, setSavingState] = useState<Record<string, boolean>>({})
  
  // Estado para el modal de actualización
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updatingCandidate, setUpdatingCandidate] = useState<Candidate | null>(null)
  const [updateFormData, setUpdateFormData] = useState({
    client_response: "pendiente" as "pendiente" | "aprobado" | "observado" | "rechazado",
    presentation_date: "",
    client_feedback_date: "",
    client_comments: ""
  })
  const [feedbackDateError, setFeedbackDateError] = useState<string>("")

  // Estados para finalizar solicitud (solo Long List)
  const [processStatus, setProcessStatus] = useState<ProcessStatus>((process.estado_solicitud || process.status) as ProcessStatus)
  const [estadosDisponibles, setEstadosDisponibles] = useState<any[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [statusChangeReason, setStatusChangeReason] = useState("")
  
  // Verificar si el proceso está bloqueado (estado final)
  const isBlocked = isProcessBlocked(processStatus)

  // Cargar datos reales desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Cargar candidatos
        const allCandidates = await getCandidatesByProcess(process.id)
        const filteredCandidates = allCandidates.filter((c: Candidate) => c.presentation_status === "presentado")
        setCandidates(filteredCandidates)
        
        // Cargar estados de cliente
        const estadosResponse = await estadoClienteService.getAll()
        if (estadosResponse.success && estadosResponse.data) {
          setEstadosCliente(estadosResponse.data)
        }
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [process.id])

  // Cargar estados de solicitud disponibles para finalización (solo Long List)
  useEffect(() => {
    const loadEstados = async () => {
      // Solo cargar estados si es Long List
      const serviceType = (process.service_type as string)?.toLowerCase() || ""
      const isLongList = serviceType === "long_list" || serviceType === "ll"
      
      if (!isLongList) {
        return
      }

      try {
        setLoadingEstados(true)
        const response = await solicitudService.getEstadosSolicitud()
        if (response.success && response.data) {
          // Filtrar solo estados de cierre: Cerrado, Congelado, Cancelado, Cierre Extraordinario
          const estadosCierre = response.data.filter((estado: any) => {
            const nombre = estado.nombre?.toLowerCase() || estado.nombre_estado_solicitud?.toLowerCase() || ""
            return nombre === "cerrado" || 
                   nombre === "congelado" || 
                   nombre === "cancelado" || 
                   nombre === "cierre extraordinario"
          })
          setEstadosDisponibles(estadosCierre)
        }
      } catch (error) {
        console.error("Error al cargar estados de solicitud:", error)
        toast({
          title: "Error",
          description: "Error al cargar estados disponibles",
          variant: "destructive",
        })
      } finally {
        setLoadingEstados(false)
      }
    }
    loadEstados()
  }, [process.service_type])

  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})


  // Validar que los comentarios sean obligatorios para observado y rechazado
  const validateCandidateResponse = (candidateId: string, response: string, comments: string) => {
    const errors: Record<string, string> = {}
    
    if ((response === "observado" || response === "rechazado") && !comments.trim()) {
      errors[candidateId] = `Los comentarios son obligatorios para el estado "${response}"`
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOpenUpdateModal = (candidate: Candidate) => {
    setUpdatingCandidate(candidate)
    const clientResponse = candidate.client_response || "pendiente"
    const clientFeedbackDate = candidate.client_feedback_date?.split("T")[0] || ""
    
    setUpdateFormData({
      client_response: clientResponse,
      presentation_date: candidate.presentation_date?.split("T")[0] || "",
      client_feedback_date: clientFeedbackDate,
      client_comments: candidate.client_comments || ""
    })
    
    // Validar si hay fecha pero el estado es pendiente
    if (clientFeedbackDate && clientResponse === "pendiente") {
      setFeedbackDateError("Debe actualizar la respuesta del cliente antes de agregar la fecha de feedback")
    } else {
      setFeedbackDateError("")
    }
    
    setShowUpdateModal(true)
  }

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false)
    setUpdatingCandidate(null)
    setUpdateFormData({
      client_response: "pendiente",
      presentation_date: "",
      client_feedback_date: "",
      client_comments: ""
    })
    setFeedbackDateError("")
  }

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Validar fecha de feedback si se está actualizando
      if (field === "client_feedback_date") {
        if (value && prev.client_response === "pendiente") {
          setFeedbackDateError("Debe actualizar la respuesta del cliente antes de agregar la fecha de feedback")
        } else {
          setFeedbackDateError("")
        }
      }
      
      // Limpiar error de fecha si se cambia el estado del cliente
      if (field === "client_response") {
        if (value !== "pendiente" && prev.client_feedback_date) {
          setFeedbackDateError("")
        } else if (value === "pendiente" && prev.client_feedback_date) {
          setFeedbackDateError("Debe actualizar la respuesta del cliente antes de agregar la fecha de feedback")
        }
      }
      
      return newData
    })
  }

  const handleUpdateCandidateState = async () => {
    if (!updatingCandidate) return

    // Validar que el proceso no esté bloqueado
    if (isBlocked) {
      toast({
        title: "Acción Bloqueada",
        description: "No se puede actualizar candidatos en un proceso finalizado",
        variant: "destructive",
      })
      return
    }

    // Validar fecha de feedback si existe pero el estado es pendiente
    if (updateFormData.client_feedback_date && updateFormData.client_response === "pendiente") {
      setFeedbackDateError("Debe actualizar la respuesta del cliente antes de agregar la fecha de feedback")
      return
    }
    
    // Validar comentarios si es necesario
    if ((updateFormData.client_response === "observado" || updateFormData.client_response === "rechazado") && !updateFormData.client_comments?.trim()) {
      toast({
        title: "Validación requerida",
        description: `Los comentarios son obligatorios para el estado "${updateFormData.client_response}"`,
        variant: "destructive",
      })
      return
    }

    // Encontrar el estado de cliente correspondiente
    const estadoCliente = estadosCliente.find(estado => 
      estado.nombre_estado.toLowerCase() === updateFormData.client_response.toLowerCase()
    )

    if (!estadoCliente) {
      console.error('Estado de cliente no encontrado:', updateFormData.client_response)
      toast({
        title: "Error",
        description: "Estado de cliente no encontrado",
        variant: "destructive",
      })
      return
    }

    setSavingState(prev => ({ ...prev, [updatingCandidate.id]: true }))

    try {
      // Guardar en la base de datos
      const responseData = await estadoClienteService.cambiarEstado(
        parseInt((updatingCandidate as any).id_postulacion || updatingCandidate.id),
        {
          id_estado_cliente: estadoCliente.id_estado_cliente,
          comentarios: updateFormData.client_comments || undefined,
          fecha_presentacion: updateFormData.presentation_date || undefined,
          fecha_feedback_cliente: updateFormData.client_feedback_date || undefined
        }
      )

      if (responseData.success) {
        console.log('Estado de cliente guardado exitosamente:', responseData.data)
        
        // Sincronizar con Módulo 2 si es rechazado
        if (updateFormData.client_response === "rechazado") {
          const syncData = {
            candidateId: updatingCandidate.id,
            status: "rechazado",
            presentation_status: "rechazado",
            rejection_reason: updateFormData.client_comments || "Rechazado por el cliente",
            timestamp: Date.now()
          }
          localStorage.setItem(`candidate_sync_${updatingCandidate.id}`, JSON.stringify(syncData))
          
          // Disparar evento personalizado para sincronización en la misma pestaña
          window.dispatchEvent(new CustomEvent('candidateSync', { detail: syncData }))
          
          console.log(
            `[SYNC] Candidate ${updatingCandidate.name} rejected by client - status synchronized with Module 2 as "rechazado"`,
          )
        }

        // Recargar datos desde la base de datos para reflejar los cambios reales
        // Agregar un pequeño delay para asegurar que el backend haya completado la transacción
        await new Promise(resolve => setTimeout(resolve, 300))
        const allCandidates = await getCandidatesByProcess(process.id)
        const filteredCandidates = allCandidates.filter((c: Candidate) => c.presentation_status === "presentado")
        setCandidates(filteredCandidates)
        // Forzar re-render
        setCandidates(prev => [...prev])

        // Cerrar modal
        handleCloseUpdateModal()

        // Mostrar toast de éxito
        toast({
          title: "¡Éxito!",
          description: `Estado del candidato ${updatingCandidate.name} actualizado correctamente`,
          variant: "default",
        })
      } else {
        console.error('Error al guardar estado de cliente:', responseData.message)
        toast({
          title: "Error",
          description: responseData.message || "No se pudo actualizar el estado del candidato",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error al guardar estado de cliente:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado del candidato",
        variant: "destructive",
      })
    } finally {
      setSavingState(prev => ({ ...prev, [updatingCandidate.id]: false }))
    }
  }

  const handleMultipleCandidateDecision = () => {
    const approvedCandidates = candidates.filter((c) => c.client_response === "aprobado")
    const rejectedCandidates = candidates.filter((c) => c.client_response === "rechazado")

    if (approvedCandidates.length === 1 && rejectedCandidates.length >= 1) {
      console.log(
        `[v0] Client accepted ${approvedCandidates[0].name} and rejected ${rejectedCandidates.length} other candidate(s)`,
      )

      const updatedCandidates = candidates.map((candidate) => {
        if (candidate.client_response === "rechazado") {
          return {
            ...candidate,
            status: "rechazado" as any,
            presentation_status: "rechazado" as "rechazado",
            rejection_reason: candidate.client_comments || "Rechazado por el cliente",
          }
        }
        return candidate
      })
      setCandidates(updatedCandidates)
    }
  }

  useEffect(() => {
    handleMultipleCandidateDecision()
  }, [candidates.map((c) => c.client_response).join(",")])

  // Función para avanzar al módulo 4
  const handleAdvanceToModule4 = async () => {
    // Validar que el proceso no esté bloqueado
    if (isBlocked) {
      toast({
        title: "Acción Bloqueada",
        description: "No se puede avanzar un proceso finalizado",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await solicitudService.avanzarAModulo4(parseInt(process.id))

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: "Proceso avanzado al Módulo 4 exitosamente",
          variant: "default",
        })
        // Navegar al módulo 4 usando URL con parámetro
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('tab', 'modulo-4')
        window.location.href = currentUrl.toString()
      } else {
        toast({
          title: "Error",
          description: "Error al avanzar al Módulo 4",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al avanzar al Módulo 4:", error)
      toast({
        title: "Error",
        description: "Error al avanzar al Módulo 4",
        variant: "destructive",
      })
    }
  }

  // Función para cambiar estado de la solicitud (finalizar)
  const handleStatusChange = async (estadoId: string) => {
    // Validar que el proceso no esté bloqueado
    if (isBlocked) {
      toast({
        title: "Acción Bloqueada",
        description: "No se puede cambiar el estado de un proceso finalizado",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await solicitudService.cambiarEstado(
        parseInt(process.id), 
        parseInt(estadoId)
      )

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: "Solicitud finalizada exitosamente",
          variant: "default",
        })
        setShowStatusChange(false)
        setSelectedEstado("")
        setStatusChangeReason("")
        // Recargar la página para reflejar el cambio
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: "Error al finalizar la solicitud",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: "Error al finalizar la solicitud",
        variant: "destructive",
      })
    }
  }

  const allRejected = candidates.every((c) => c.client_response === "rechazado")
  const hasApproved = candidates.some((c) => c.client_response === "aprobado")

  // Verificar tipo de servicio (código o nombre)
  const serviceType = (process.service_type as string)?.toLowerCase() || ""
  
  // Para procesos PC, HS, TR: verificar que candidatos aprobados tengan client_feedback_date
  const approvedCandidates = candidates.filter((c) => c.client_response === "aprobado")
  const hasApprovedWithoutFeedback = approvedCandidates.some((c) => !c.client_feedback_date)
  
  const canAdvanceToModule4 = (serviceType === "proceso_completo" || serviceType === "pc" || 
                              serviceType === "headhunting" || serviceType === "hs" || 
                              serviceType === "talent_retention" || serviceType === "tr") && 
                              hasApproved && !hasApprovedWithoutFeedback
  const processEndsHere = serviceType === "long_list" || serviceType === "ll"
  
  // Debug: mostrar el tipo de servicio
  console.log("🔍 Module 3 - Service Type:", {
    original: process.service_type,
    normalized: serviceType,
    processEndsHere,
    canAdvanceToModule4,
    hasApproved,
    hasApprovedWithoutFeedback,
    approvedCandidatesCount: approvedCandidates.length
  })

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Módulo 3 - Presentación de Candidatos</h2>
          <p className="text-muted-foreground">
            Registra la presentación de candidatos al cliente y gestiona sus respuestas
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando datos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Módulo 3 - Presentación de Candidatos</h2>
        <p className="text-muted-foreground">
          Registra la presentación de candidatos al cliente y gestiona sus respuestas
        </p>
      </div>

      {/* Componente de bloqueo si el proceso está en estado final */}
      <ProcessBlocked 
        processStatus={processStatus} 
        moduleName="Módulo 3" 
      />

      {/* Navigation Actions */}
      {allRejected && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-800">Todos los candidatos fueron rechazados</h3>
                <p className="text-sm text-red-600">
                  Los estados se han sincronizado con el Módulo 2. Necesitas agregar más candidatos.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                onClick={() => {
                  const currentUrl = new URL(window.location.href)
                  currentUrl.searchParams.set('tab', 'modulo-2')
                  window.location.href = currentUrl.toString()
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Módulo 2
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canAdvanceToModule4 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Candidatos aprobados</h3>
                <p className="text-sm text-blue-600">
                  Estados sincronizados. Puedes avanzar al Módulo 4 para evaluación psicolaboral.
                </p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAdvanceToModule4}
                disabled={isBlocked}
              >
                Avanzar a Módulo 4
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasApproved && hasApprovedWithoutFeedback && (serviceType === "proceso_completo" || serviceType === "pc" || 
       serviceType === "headhunting" || serviceType === "hs" || 
       serviceType === "talent_retention" || serviceType === "tr") && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">Falta información de feedback</h3>
                <p className="text-sm text-orange-600">
                  Hay candidatos aprobados sin fecha de feedback del cliente. 
                  Completa esta información antes de avanzar al Módulo 4.
                </p>
              </div>
              <div className="text-orange-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finalizar Solicitud - Solo para Long List */}
      {processEndsHere && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalizar Solicitud
            </CardTitle>
            <CardDescription>
              Una vez que hayas finalizado la revisión de candidatos, puedes cerrar la solicitud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="estado-select">Estado Actual: </Label>
                <Badge className={getStatusColor(processStatus)}>
                  {processStatusLabels[processStatus] || processStatus}
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowStatusChange(!showStatusChange)}
                disabled={loadingEstados}
              >
                {loadingEstados ? "Cargando..." : "Finalizar Solicitud"}
              </Button>
            </div>

            {showStatusChange && (
              <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="new-estado">Estado Final</Label>
                  <Select
                    value={selectedEstado}
                    onValueChange={setSelectedEstado}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosDisponibles.map((estado) => (
                        <SelectItem 
                          key={estado.id || estado.id_estado_solicitud} 
                          value={(estado.id || estado.id_estado_solicitud).toString()}
                        >
                          {estado.nombre || estado.nombre_estado_solicitud}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">Motivo del Cambio (Opcional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explica el motivo de finalización..."
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(selectedEstado)}
                    disabled={!selectedEstado}
                  >
                    Actualizar Estado
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStatusChange(false)
                      setSelectedEstado("")
                      setStatusChangeReason("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Candidates Presentation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos Presentados al Cliente</CardTitle>
          <CardDescription>
            Visualiza las fechas de envío y respuestas del cliente. Los estados se sincronizan automáticamente con el
            Módulo 2. Para modificar la información, usa el botón "Actualizar" de cada candidato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Fecha Envío</TableHead>
                    <TableHead>Respuesta Cliente</TableHead>
                    <TableHead>Fecha Feedback Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-32">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <>
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <Collapsible>
                            <CollapsibleTrigger
                              onClick={() =>
                                setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)
                              }
                            >
                              {expandedCandidate === candidate.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </CollapsibleTrigger>
                          </Collapsible>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {candidate.presentation_date?.split("T")[0] || "No registrada"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge 
                              variant={
                                candidate.client_response === "aprobado" ? "default" :
                                candidate.client_response === "rechazado" ? "destructive" :
                                candidate.client_response === "observado" ? "secondary" :
                                "outline"
                              }
                              className="w-fit"
                            >
                              {candidate.client_response === "pendiente" && "Pendiente"}
                              {candidate.client_response === "aprobado" && "Aprobado"}
                              {candidate.client_response === "observado" && "Observado"}
                              {candidate.client_response === "rechazado" && "Rechazado"}
                              {!candidate.client_response && "Pendiente"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {candidate.client_feedback_date?.split("T")[0] || "No registrada"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidateStatusLabels[candidate.status as keyof typeof candidateStatusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleOpenUpdateModal(candidate)}
                            disabled={savingState[candidate.id] || isBlocked}
                            size="sm"
                            className="w-full"
                          >
                            {savingState[candidate.id] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Actualizar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedCandidate === candidate.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30">
                            <Collapsible open={expandedCandidate === candidate.id}>
                              <CollapsibleContent>
                                <div className="p-4 space-y-4">
                                  <h4 className="font-semibold">Detalles del Candidato</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">Nombre</p>
                                        <p className="text-sm text-muted-foreground">{candidate.name}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">Teléfono</p>
                                        <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                                      </div>
                                    </div>
                                    {candidate.salary_expectation && (
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm font-medium">Expectativa Salarial</p>
                                          <p className="text-sm text-muted-foreground">
                                            {formatCurrency(candidate.salary_expectation)}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {candidate.motivation && (
                                    <div>
                                      <p className="text-sm font-medium mb-1">Motivación</p>
                                      <p className="text-sm text-muted-foreground">{candidate.motivation}</p>
                                    </div>
                                  )}

                                  {(candidate.client_response === "observado" ||
                                    candidate.client_response === "rechazado") && (
                                    <div
                                      className={`border rounded-lg p-4 ${
                                        candidate.client_response === "observado"
                                          ? "bg-yellow-50 border-yellow-200"
                                          : "bg-red-50 border-red-200"
                                      }`}
                                    >
                                      <Label
                                        htmlFor={`reason-${candidate.id}`}
                                        className={`text-sm font-medium ${
                                          candidate.client_response === "observado" ? "text-yellow-800" : "text-red-800"
                                        }`}
                                      >
                                        {candidate.client_response === "observado"
                                          ? "⚠️ Observaciones del Cliente (OBLIGATORIO)"
                                          : "❌ Razón del Rechazo (OBLIGATORIO)"}
                                      </Label>
                                      <Textarea
                                        id={`reason-${candidate.id}`}
                                        value={candidate.client_comments || ""}
                                        readOnly
                                        placeholder={
                                          candidate.client_response === "observado"
                                            ? "No hay observaciones registradas"
                                            : "No hay razón de rechazo registrada"
                                        }
                                        rows={3}
                                        className={`mt-2 bg-gray-50 ${
                                          candidate.client_response === "observado"
                                            ? "border-yellow-300"
                                            : "border-red-300"
                                        }`}
                                      />
                                      <p
                                        className={`text-xs mt-1 ${
                                          candidate.client_response === "observado" ? "text-yellow-600" : "text-red-600"
                                        }`}
                                      >
                                        💡 Esta información se sincroniza automáticamente con el Módulo 2
                                        {candidate.client_response === "rechazado" && " y actualiza el estado del candidato"}
                                        <br />
                                        📝 Para modificar esta información, usa el botón "Actualizar" en la tabla
                                      </p>
                                    </div>
                                  )}

                                  {candidate.client_response !== "observado" &&
                                    candidate.client_response !== "rechazado" && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <Label
                                          htmlFor={`comments-${candidate.id}`}
                                          className="text-sm font-medium text-blue-800"
                                        >
                                          💬 Comentarios Generales del Cliente
                                        </Label>
                                        <Textarea
                                          id={`comments-${candidate.id}`}
                                          value={candidate.client_comments || ""}
                                          readOnly
                                          placeholder="No hay comentarios registrados"
                                          rows={2}
                                          className="mt-2 border-blue-300 bg-gray-50"
                                        />
                                      </div>
                                    )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay candidatos presentados</h3>
              <p className="text-muted-foreground">
                Primero debes marcar candidatos como "presentado" en el Módulo 2 para poder registrar las respuestas del
                cliente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Actualización */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Candidato</DialogTitle>
            <DialogDescription>
              Modifica el estado, fechas y comentarios del candidato {updatingCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Respuesta del Cliente */}
            <div className="space-y-2">
              <Label htmlFor="client_response">Respuesta del Cliente</Label>
              <Select
                value={updateFormData.client_response}
                onValueChange={(value: "pendiente" | "aprobado" | "observado" | "rechazado") => 
                  handleUpdateFormChange("client_response", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar respuesta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="observado">Observado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de Presentación */}
            <div className="space-y-2">
              <Label htmlFor="presentation_date">Fecha de Envío al Cliente</Label>
              <Input
                id="presentation_date"
                type="date"
                value={updateFormData.presentation_date}
                onChange={(e) => handleUpdateFormChange("presentation_date", e.target.value)}
              />
            </div>

            {/* Fecha de Feedback del Cliente */}
            <div className="space-y-2">
              <Label htmlFor="client_feedback_date">Fecha de Feedback del Cliente</Label>
              <Input
                id="client_feedback_date"
                type="date"
                value={updateFormData.client_feedback_date}
                onChange={(e) => handleUpdateFormChange("client_feedback_date", e.target.value)}
                className={feedbackDateError ? "border-red-500 focus:border-red-500" : ""}
              />
              {feedbackDateError && (
                <p className="text-destructive text-sm">
                  {feedbackDateError}
                </p>
              )}
            </div>

            {/* Comentarios */}
            <div className="space-y-2">
              <Label htmlFor="client_comments">
                Comentarios del Cliente
                {(updateFormData.client_response === "observado" || updateFormData.client_response === "rechazado") && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="client_comments"
                value={updateFormData.client_comments}
                onChange={(e) => handleUpdateFormChange("client_comments", e.target.value)}
                placeholder={
                  updateFormData.client_response === "observado"
                    ? "Ingrese las observaciones del cliente..."
                    : updateFormData.client_response === "rechazado"
                    ? "Ingrese la razón del rechazo..."
                    : "Comentarios adicionales del cliente..."
                }
                rows={4}
                className={
                  updateFormData.client_response === "observado"
                    ? "border-yellow-300 focus:border-yellow-500"
                    : updateFormData.client_response === "rechazado"
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }
              />
              {(updateFormData.client_response === "observado" || updateFormData.client_response === "rechazado") && (
                <p className="text-xs text-muted-foreground">
                  Los comentarios son obligatorios para este estado
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUpdateModal}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCandidateState}
              disabled={savingState[updatingCandidate?.id || '']}
            >
              {savingState[updatingCandidate?.id || ''] ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
