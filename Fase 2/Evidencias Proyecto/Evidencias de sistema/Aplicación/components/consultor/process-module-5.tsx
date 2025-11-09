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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCandidatesByProcess, estadoClienteM5Service, solicitudService } from "@/lib/api"
import { formatDate, isProcessBlocked } from "@/lib/utils"
import { ArrowLeft, CheckCircle, User, Calendar, MessageSquare, Star, XCircle, Pencil } from "lucide-react"
import type { Process, Candidate } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ProcessBlocked } from "./ProcessBlocked"

interface ProcessModule5Props {
  process: Process
}

// Estados de contratación
type HiringStatus = 
  | "en_espera_feedback"      // Candidato pasó módulo 4, esperando respuesta del cliente
  | "no_seleccionado"         // Cliente rechazó al candidato
  | "envio_carta_oferta"      // Cliente aprobó, se envió carta oferta
  | "aceptacion_carta_oferta" // Candidato aceptó la oferta
  | "rechazo_carta_oferta"    // Candidato rechazó la oferta
  | "contratado"              // Candidato contratado y trabajando
  | "no_contratado"           // Candidato no contratado (por cualquier razón)

interface ContractedCandidate {
  id: string
  name: string
  hiring_status: HiringStatus
  contract_date?: string
  client_response_date?: string | null  // Fecha de respuesta del cliente
  continues: boolean
  observations?: string
  satisfaction_survey_pending: boolean
  contratacion_status?: 'contratado' | 'no_contratado' | null
}

export function ProcessModule5({ process }: ProcessModule5Props) {
  const { toast } = useToast()
  // Incluir candidatos que pasaron el módulo 4 (aprobados por el consultor) o que fueron aprobados por el cliente
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar datos desde el backend
  const loadData = async () => {
    try {
      setIsLoading(true)
      // Obtener candidatos que están en el módulo 5 (avanzados desde módulo 4)
      const response = await estadoClienteM5Service.getCandidatosEnModulo5(Number(process.id))
      if (response.success && response.data) {
        setCandidates(response.data)
        
        // Cargar estados guardados en contractedCandidates
        const contractedData = response.data
          .filter((candidate: any) => candidate.hiring_status && candidate.hiring_status !== 'en_espera_feedback')
          .map((candidate: any) => ({
            id: candidate.id,
            name: candidate.name,
            hiring_status: candidate.hiring_status,
            contract_date: candidate.contract_date || '',
            client_response_date: candidate.client_response_date || '',
            continues: true,
            observations: candidate.observations || '',
            satisfaction_survey_pending: candidate.hiring_status === "contratado",
            contratacion_status: candidate.contratacion_status
          }))
        
        setContractedCandidates(contractedData)
      } else {
        console.error('Error al cargar candidatos del módulo 5:', response.message)
        setCandidates([])
      }
    } catch (error) {
      console.error('Error al cargar candidatos:', error)
      setCandidates([])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para recargar datos (sin mostrar loading)
  const reloadData = async () => {
    try {
      // Agregar timestamp para evitar caché del navegador
      const timestamp = new Date().getTime()
      // Obtener candidatos que están en el módulo 5 (avanzados desde módulo 4)
      const response = await estadoClienteM5Service.getCandidatosEnModulo5(Number(process.id))
      if (response.success && response.data) {
        console.log('[DEBUG FRONTEND] Datos recibidos del backend después de actualizar:', response.data)
        console.log('[DEBUG FRONTEND] Cantidad de candidatos:', response.data.length)
        
        // Actualizar el estado con los nuevos datos
        const nuevosCandidatos = response.data.map((candidate: any) => ({
          ...candidate,
          id_postulacion: candidate.id_postulacion || candidate.id
        }))
        
        console.log('[DEBUG FRONTEND] Candidatos mapeados:', nuevosCandidatos)
        setCandidates(nuevosCandidatos)
        
        // Cargar estados guardados en contractedCandidates
        const contractedData = response.data
          .filter((candidate: any) => candidate.hiring_status && candidate.hiring_status !== 'en_espera_feedback')
          .map((candidate: any) => ({
            id: candidate.id,
            name: candidate.name,
            hiring_status: candidate.hiring_status,
            contract_date: candidate.contract_date || '',
            client_response_date: candidate.client_response_date || '',
            continues: true,
            observations: candidate.observations || '',
            satisfaction_survey_pending: candidate.hiring_status === "contratado",
            contratacion_status: candidate.contratacion_status
          }))
        
        console.log('[DEBUG FRONTEND] Contracted candidates actualizados:', contractedData)
        setContractedCandidates(contractedData)
      } else {
        console.error('Error al recargar candidatos del módulo 5:', response.message)
      }
    } catch (error) {
      console.error('Error al recargar candidatos:', error)
    }
  }

  // Cargar datos reales desde el backend
  useEffect(() => {
    loadData()
  }, [process.id])

  // Cargar estados de solicitud disponibles para finalización
  useEffect(() => {
    const loadEstados = async () => {
      try {
        setLoadingEstados(true)
        const response = await solicitudService.getEstadosSolicitud()
        if (response.success && response.data) {
          // Filtrar solo estados finales (cerrado, congelado, cancelado, cierre extraordinario)
          const estadosFinales = response.data.filter((estado: any) => {
            const nombre = estado.nombre?.toLowerCase() || estado.nombre_estado_solicitud?.toLowerCase() || ""
            return nombre.includes('cerrado') || 
                   nombre.includes('congelado') || 
                   nombre.includes('cancelado') || 
                   nombre.includes('extraordinario')
          })
          setEstadosDisponibles(estadosFinales)
        }
      } catch (error) {
        console.error("Error al cargar estados de solicitud:", error)
      } finally {
        setLoadingEstados(false)
      }
    }
    loadEstados()
  }, [])

  const [contractedCandidates, setContractedCandidates] = useState<ContractedCandidate[]>([])
  const [showContractDialog, setShowContractDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showContratacionDialog, setShowContratacionDialog] = useState(false)
  
  // Estados para finalizar solicitud (similar a Longlist)
  const [processStatus, setProcessStatus] = useState<string>((process.estado_solicitud || process.status) as string)
  const [estadosDisponibles, setEstadosDisponibles] = useState<any[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [statusChangeReason, setStatusChangeReason] = useState("")
  const [contratacionForm, setContratacionForm] = useState({
    fecha_ingreso_contratacion: "",
    observaciones_contratacion: "",
  })
  const [contratacionAction, setContratacionAction] = useState<"contratado" | "no_contratado">("contratado")
  const [isSavingContratacion, setIsSavingContratacion] = useState(false)

  const handleContractSubmit = async () => {
    if (!selectedCandidate) return

    // Validar comentarios obligatorios para estados específicos
    const requiresComments = contractForm.hiring_status === "no_seleccionado" || contractForm.hiring_status === "rechazo_carta_oferta"
    if (requiresComments && (!contractForm.observations || contractForm.observations.trim() === "")) {
      setObservationsError("Los comentarios son obligatorios para este estado")
      return
    }
    setObservationsError("")

    try {
      // Llamar al API para actualizar el candidato en el backend
      const response = await estadoClienteM5Service.actualizarCandidatoModulo5(
        selectedCandidate.id_postulacion,
        {
          hiring_status: contractForm.hiring_status,
          client_response_date: contractForm.client_response_date || undefined,
          observations: contractForm.observations,
        }
      )

      if (response.success) {
        // Cerrar el diálogo primero
        setShowContractDialog(false)
        setObservationsError("")
        
        // Mostrar mensaje de éxito
        toast({
          title: "Éxito",
          description: "Estado del candidato actualizado exitosamente",
        })
        
        // Esperar un momento para asegurar que la transacción del backend terminó
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Recargar datos desde el backend para obtener la información actualizada
        await reloadData()
        
        // Forzar un re-render adicional
        setCandidates(prev => [...prev])
      } else {
        toast({
          title: "Error",
          description: response.message || "Error al actualizar el estado del candidato",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error al actualizar candidato:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el estado del candidato",
        variant: "destructive",
      })
    }

    setShowContractDialog(false)
    setContractForm({
      hiring_status: "en_espera_feedback",
      contract_date: "",
      client_response_date: null,
      continues: true,
      observations: "",
    })
    setObservationsError("")
    setSelectedCandidate(null)
  }

  const openContractDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Cargar datos existentes si el candidato ya tiene información guardada
    const existingData = contractedCandidates.find(c => c.id === candidate.id)
    if (existingData) {
      console.log('[DEBUG FRONTEND] Datos existentes del candidato:', existingData)
      console.log('[DEBUG FRONTEND] client_response_date:', existingData.client_response_date)
      setContractForm({
        hiring_status: existingData.hiring_status,
        contract_date: existingData.contract_date || "",
        client_response_date: existingData.client_response_date || null,
        continues: existingData.continues,
        observations: existingData.observations || "",
      })
    } else {
      // Si no hay datos, usar los datos del candidato si están disponibles
      const candidateData = candidate as any
      console.log('[DEBUG FRONTEND] Datos del candidato directo:', candidateData)
      console.log('[DEBUG FRONTEND] client_response_date del candidato:', candidateData.client_response_date)
      setContractForm({
        hiring_status: candidateData.hiring_status || "en_espera_feedback",
        contract_date: candidateData.contract_date || "",
        client_response_date: candidateData.client_response_date || null,
        continues: true,
        observations: candidateData.observations || "",
      })
    }
    
    setShowContractDialog(true)
  }

  const isAlreadyProcessed = (candidateId: string) => {
    return contractedCandidates.some((c) => c.id === candidateId)
  }


  // Función para editar un candidato ya procesado
  const handleEditContractedCandidate = (candidate: Candidate) => {
    const contractedCandidate = contractedCandidates.find((cc) => cc.id === candidate.id)
    if (contractedCandidate) {
      setContractForm({
        hiring_status: contractedCandidate.hiring_status,
        contract_date: contractedCandidate.contract_date ?? "",
        client_response_date: contractedCandidate.client_response_date ?? null,
        continues: contractedCandidate.continues,
        observations: contractedCandidate.observations ?? "",
      })
    } else {
      setContractForm({
        hiring_status: "en_espera_feedback",
        contract_date: "",
        client_response_date: null,
        continues: true,
        observations: "",
      })
    }
    setSelectedCandidate(candidate)
    setShowContractDialog(true)
  }

  // Verificar si el proceso está bloqueado (estado final)
  const isBlocked = isProcessBlocked(processStatus)

  // Función para obtener el label dinámico según el estado seleccionado
  const getReasonLabel = (): string => {
    if (!selectedEstado) {
      return "Motivo del Cambio (Opcional)"
    }

    const estadoSeleccionado = estadosDisponibles.find(
      (estado) => (estado.id || estado.id_estado_solicitud).toString() === selectedEstado
    )

    if (!estadoSeleccionado) {
      return "Motivo del Cambio (Opcional)"
    }

    const nombreEstado = (estadoSeleccionado.nombre || estadoSeleccionado.nombre_estado_solicitud || "").toLowerCase()

    if (nombreEstado.includes("cerrado") && !nombreEstado.includes("extraordinario")) {
      return "Motivo del cierre"
    }
    if (nombreEstado.includes("congelado")) {
      return "Motivo del porqué se congela"
    }
    if (nombreEstado.includes("cancelado")) {
      return "Motivo de la cancelación"
    }
    if (nombreEstado.includes("extraordinario") || nombreEstado.includes("cierre extraordinario")) {
      return "Motivo del cierre extraordinario"
    }

    return "Motivo del Cambio (Opcional)"
  }

  // Función para obtener el placeholder dinámico según el estado seleccionado
  const getReasonPlaceholder = (): string => {
    if (!selectedEstado) {
      return "Explica el motivo de finalización..."
    }

    const estadoSeleccionado = estadosDisponibles.find(
      (estado) => (estado.id || estado.id_estado_solicitud).toString() === selectedEstado
    )

    if (!estadoSeleccionado) {
      return "Explica el motivo de finalización..."
    }

    const nombreEstado = (estadoSeleccionado.nombre || estadoSeleccionado.nombre_estado_solicitud || "").toLowerCase()

    if (nombreEstado.includes("cerrado") && !nombreEstado.includes("extraordinario")) {
      return "Explica el motivo del cierre del proceso..."
    }
    if (nombreEstado.includes("congelado")) {
      return "Explica el motivo por el cual se congela el proceso..."
    }
    if (nombreEstado.includes("cancelado")) {
      return "Explica el motivo de la cancelación del proceso..."
    }
    if (nombreEstado.includes("extraordinario") || nombreEstado.includes("cierre extraordinario")) {
      return "Explica el motivo del cierre extraordinario del proceso..."
    }

    return "Explica el motivo de finalización..."
  }

  // Función para cambiar estado de la solicitud (finalizar)
  const handleProcessClosure = async () => {
    // Validar que el proceso no esté bloqueado
    if (isBlocked) {
      toast({
        title: "Acción Bloqueada",
        description: "No se puede cambiar el estado de un proceso finalizado",
        variant: "destructive",
      })
      return
    }

    if (!selectedEstado) {
      toast({
        title: "Error",
        description: "Debes seleccionar un estado",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await solicitudService.cambiarEstado(
        parseInt(process.id), 
        parseInt(selectedEstado),
        statusChangeReason || undefined
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

  // Función para abrir el dialog de contratación
  const handleOpenContratacionDialog = (candidate: Candidate | ContractedCandidate, action: "contratado" | "no_contratado") => {
    setSelectedCandidate(candidate as Candidate)
    setContratacionAction(action)
    
    // Si el candidato ya tiene información de contratación, pre-cargar los datos
    const contratacionStatus = (candidate as ContractedCandidate).contratacion_status
    if (contratacionStatus === "contratado" || contratacionStatus === "no_contratado") {
      setContratacionForm({
        fecha_ingreso_contratacion: candidate.contract_date || "",
        observaciones_contratacion: candidate.observations || "",
      })
    } else {
      // Si es nuevo, limpiar el formulario
      setContratacionForm({
        fecha_ingreso_contratacion: "",
        observaciones_contratacion: "",
      })
    }
    
    setShowContratacionDialog(true)
  }

  // Función para guardar la contratación
  const handleSaveContratacion = async () => {
    if (!selectedCandidate) return

    setIsSavingContratacion(true)

    try {
      console.log('[DEBUG] Guardando contratación:', {
        id_postulacion: selectedCandidate.id_postulacion,
        hiring_status: contratacionAction,
        fecha_ingreso_contratacion: contratacionForm.fecha_ingreso_contratacion,
        observaciones_contratacion: contratacionForm.observaciones_contratacion
      })

      const response = await estadoClienteM5Service.actualizarCandidatoModulo5(
        selectedCandidate.id_postulacion,
        {
          hiring_status: contratacionAction,
          fecha_ingreso_contratacion: contratacionForm.fecha_ingreso_contratacion || undefined,
          observaciones_contratacion: contratacionForm.observaciones_contratacion || undefined
        }
      )

      console.log('[DEBUG] Respuesta del backend:', response)

      if (response.success) {
        const mensajeExito = contratacionAction === "contratado" 
          ? "Candidato registrado como contratado exitosamente"
          : "Candidato registrado como no contratado exitosamente"
        
        toast({
          title: "Éxito",
          description: mensajeExito,
        })
        
        setShowContratacionDialog(false)
        setContratacionForm({
          fecha_ingreso_contratacion: "",
          observaciones_contratacion: "",
        })
        setSelectedCandidate(null)
        
        await reloadData()
      } else {
        toast({
          title: "Error",
          description: response.message || "Error al actualizar el estado del candidato",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('[ERROR] Error al guardar contratación:', error)
      toast({
        title: "Error",
        description: "Error al guardar la contratación",
        variant: "destructive",
      })
    } finally {
      setIsSavingContratacion(false)
    }
  }

  // Variables de conteo
  const contractedCount = contractedCandidates.filter((c) => c.hiring_status === "contratado").length
  const totalVacancies = process.vacancies || 1
  const hasContracted = contractedCandidates.some((c) => c.hiring_status === "contratado")

  // 🎯 LÓGICA PARA "VOLVER A MÓDULO 2" - SOLO PARA FLUJO COMPLETO
  // Verificar si el servicio es de flujo completo (PC, HS, TR)
  const isFullFlowService = ["PC", "HS", "TR"].includes(process.service_type)
  
  // Candidatos que YA llenaron vacantes (contratados)
  const candidatosContratados = contractedCandidates.filter(c => 
    (c as any).contratacion_status === 'contratado'
  ).length
  
  // Candidatos que AÚN PUEDEN llenar vacantes (en proceso)
  const candidatosEnProceso = contractedCandidates.filter(c => 
    c.hiring_status === 'en_espera_feedback' ||
    c.hiring_status === 'envio_carta_oferta' ||
    c.hiring_status === 'aceptacion_carta_oferta'
  ).length
  
  // Candidatos descartados (no pueden llenar vacantes)
  const candidatosDescartados = contractedCandidates.filter(c => 
    c.hiring_status === 'no_seleccionado' ||
    c.hiring_status === 'rechazo_carta_oferta' ||
    (c as any).contratacion_status === 'no_contratado'
  ).length
  
  // Máximo de vacantes que PUEDO llenar con candidatos actuales
  const maxVacantesQuePuedoLlenar = candidatosContratados + candidatosEnProceso
  
  // MOSTRAR BOTÓN si:
  // 1. Es servicio de flujo completo (PC, HS, TR)
  // 2. Y hay vacantes sin llenar (contractedCount < totalVacancies)
  // 3. Y hay candidatos descartados
  // 4. Y el número de candidatos en proceso es menor que las vacantes restantes
  const canReturnToModule2 = isFullFlowService && 
    contractedCount < totalVacancies && 
    candidatosDescartados > 0 && 
    candidatosEnProceso < (totalVacancies - contractedCount)
  
  const allVacanciesFilled = contractedCount >= totalVacancies

  const [contractForm, setContractForm] = useState({
    hiring_status: "en_espera_feedback" as HiringStatus,
    contract_date: "",
    client_response_date: null as string | null,
    continues: true,
    observations: "",
  })
  const [observationsError, setObservationsError] = useState<string>("")

  // Función para obtener los estados disponibles según el estado actual
  const getAvailableStates = (currentStatus: HiringStatus): HiringStatus[] => {
    const baseStates: HiringStatus[] = [
      "en_espera_feedback",
      "no_seleccionado", 
      "envio_carta_oferta",
      "aceptacion_carta_oferta",
      "rechazo_carta_oferta"
    ]
    
    console.log("Current status:", currentStatus) // Debug
    
    // Solo agregar estados finales si el estado actual es "envio_carta_oferta"
    if (currentStatus === "envio_carta_oferta") {
      console.log("Adding final states") // Debug
      return [...baseStates, "contratado", "no_contratado"]
    }
    
    console.log("Returning base states only") // Debug
    return baseStates
  }

  // Función para obtener el badge y estilo según el estado de contratación
  const getHiringStatusBadge = (status: HiringStatus) => {
    const statusConfig = {
      en_espera_feedback: {
        label: "En espera de feedback",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Calendar className="mr-1 h-3 w-3" />
      },
      no_seleccionado: {
        label: "No seleccionado",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-300",
        icon: <XCircle className="mr-1 h-3 w-3" />
      },
      envio_carta_oferta: {
        label: "Envío de carta oferta",
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <MessageSquare className="mr-1 h-3 w-3" />
      },
      aceptacion_carta_oferta: {
        label: "Aceptación de oferta",
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle className="mr-1 h-3 w-3" />
      },
      rechazo_carta_oferta: {
        label: "Rechazo de oferta",
        variant: "destructive" as const,
        className: "bg-orange-100 text-orange-800 border-orange-300",
        icon: <XCircle className="mr-1 h-3 w-3" />
      },
      contratado: {
        label: "Contratado",
        variant: "default" as const,
        className: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <CheckCircle className="mr-1 h-3 w-3" />
      },
      no_contratado: {
        label: "No contratado",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800 border-gray-300",
        icon: <XCircle className="mr-1 h-3 w-3" />
      }
    }

    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Módulo 5 - Seguimiento y Control</h2>
          <p className="text-muted-foreground">Gestiona la contratación final y seguimiento de candidatos</p>
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
        <h2 className="text-2xl font-bold mb-2">Módulo 5 - Seguimiento y Control</h2>
        <p className="text-muted-foreground">Gestiona la contratación final y seguimiento de candidatos</p>
      </div>

      {/* Componente de bloqueo si el proceso está en estado final */}
      <ProcessBlocked 
        processStatus={processStatus} 
        moduleName="Módulo 5" 
      />

      {canReturnToModule2 && (
        <Card className="border-cyan-200 bg-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-cyan-800">
                  Vacantes sin llenar: {totalVacancies - contractedCount} de {totalVacancies}
                </h3>
                <p className="text-sm text-cyan-600">
                  No hay suficientes candidatos disponibles para llenar las vacantes restantes. 
                  {candidatosDescartados > 0 && ` Candidatos descartados: ${candidatosDescartados}.`}
                  {' '}Puedes volver al Módulo 2 para gestionar nuevos candidatos.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-cyan-300 text-cyan-700 hover:bg-cyan-100 bg-transparent"
                onClick={() => {
                  // Aquí podrías implementar la navegación al Módulo 2
                  console.log("Navegando al Módulo 2...")
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Módulo 2
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Candidatos para Seguimiento</CardTitle>
          <CardDescription>Gestiona el estado de contratación de los candidatos aprobados</CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Estado del Informe</TableHead>
                  <TableHead>Estado de Contratación</TableHead>
                  <TableHead>Fecha Respuesta Cliente</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => {
                  const contractedCandidate = contractedCandidates.find((cc) => cc.id === candidate.id)
                  const candidateData = candidate as any
                  const estadoInforme = candidateData.estado_informe
                  // Asegurar que tenemos el hiring_status correcto
                  const hiringStatus = candidateData.hiring_status || candidate.hiring_status || "en_espera_feedback"
                  
                  console.log('[DEBUG RENDER] Candidato:', candidate.name, 'hiring_status:', hiringStatus, 'datos completos:', candidateData)
                  
                  return (
                    <TableRow key={`${candidate.id}-${hiringStatus}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {estadoInforme ? (
                          <Badge
                            variant={
                              estadoInforme === "Recomendable"
                                ? "outline"
                                : estadoInforme === "No recomendable"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              estadoInforme === "Recomendable"
                                ? "text-xs bg-green-100 text-green-800 border-green-300"
                                : "text-xs"
                            }
                          >
                            {estadoInforme === "Recomendable" && "✓ Recomendable"}
                            {estadoInforme === "No recomendable" && "✗ No Recomendable"}
                            {estadoInforme === "Recomendable con observaciones" && "⚠ Recomendable con Observaciones"}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getHiringStatusBadge(hiringStatus as HiringStatus)}
                      </TableCell>
                      <TableCell>
                        {candidate.client_response_date ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(candidate.client_response_date)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openContractDialog(candidate)}
                          >
                            {contractedCandidate ? "Editar" : "Gestionar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay candidatos aprobados</h3>
              <p className="text-muted-foreground">
                Los candidatos aparecerán aquí cuando sean aprobados por el consultor en el Módulo 4.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {contractedCandidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Contrataciones</CardTitle>
            <CardDescription>Estado detallado de todos los candidatos en proceso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Estado del Proceso</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      Vacantes:{" "}
                      <strong>
                        {contractedCount}/{totalVacancies}
                      </strong>
                    </span>
                    <Badge variant={allVacanciesFilled ? "default" : "secondary"}>
                      {allVacanciesFilled ? "Completo" : "Parcial"}
                    </Badge>
                  </div>
                </div>
                  <Button
                  variant="default"
                  className="hover:opacity-90 hover:scale-105 transition-all duration-200"
                  onClick={() => setShowStatusChange(!showStatusChange)}
                  disabled={isBlocked || loadingEstados}
                >
                  {loadingEstados ? "Cargando..." : "Finalizar Solicitud"}
                  </Button>
              </div>
            </div>

            <div className="space-y-4">
              {contractedCandidates.map((candidate) => (
                <div key={candidate.id} className="border border-border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getHiringStatusBadge(candidate.hiring_status)}
                        {candidate.contratacion_status && (
                          <Badge 
                            variant={candidate.contratacion_status === "contratado" ? "default" : "destructive"}
                            className={candidate.contratacion_status === "contratado" 
                              ? "bg-green-100 text-green-800 border-green-300" 
                              : "bg-orange-100 text-orange-800 border-orange-300"}
                          >
                            {candidate.contratacion_status === "contratado" ? "Contratado" : "No Contratado"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {candidate.satisfaction_survey_pending && (
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Encuesta de Satisfacción
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {candidate.client_response_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Fecha Respuesta Cliente</p>
                          <p className="text-muted-foreground">{formatDate(candidate.client_response_date)}</p>
                        </div>
                      </div>
                    )}
                    {candidate.contract_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Fecha de Contratación</p>
                          <p className="text-muted-foreground">{formatDate(candidate.contract_date)}</p>
                        </div>
                      </div>
                    )}
                    {candidate.observations && (
                      <div className="flex items-start gap-2 col-span-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Observaciones</p>
                          <p className="text-muted-foreground">{candidate.observations}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección de gestión de contratación para candidatos con "aceptacion_carta_oferta" */}
                  {candidate.hiring_status === "aceptacion_carta_oferta" && !candidate.contratacion_status && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                      <h4 className="font-medium text-green-800">Gestión de Contratación</h4>
                      <p className="text-sm text-green-600">El candidato ha aceptado la oferta. Define el estado final de contratación.</p>
                      
                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-100"
                          onClick={() => {
                            const fullCandidate = candidates.find(c => c.id === candidate.id)
                            if (fullCandidate) handleOpenContratacionDialog(fullCandidate, "contratado")
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Contratado
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-100"
                          onClick={() => {
                            const fullCandidate = candidates.find(c => c.id === candidate.id)
                            if (fullCandidate) handleOpenContratacionDialog(fullCandidate, "no_contratado")
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Marcar como No Contratado
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Sección de información de candidato contratado */}
                  {candidate.contratacion_status === "contratado" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-800">Candidato Contratado</h4>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-700 hover:text-green-800 hover:bg-green-100"
                          onClick={() => {
                            const fullCandidate = candidates.find(c => c.id === candidate.id)
                            if (fullCandidate) handleOpenContratacionDialog(fullCandidate, "contratado")
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        </div>
                      <p className="text-sm text-green-600">El candidato ha sido contratado exitosamente.</p>
                      
                      <div className="grid grid-cols-1 gap-4 mt-4">
                        {candidate.contract_date && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-green-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Fecha de Ingreso</p>
                              <p className="text-sm text-gray-600">{formatDate(candidate.contract_date)}</p>
                            </div>
                          </div>
                        )}
                        
                        {candidate.observations && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Observaciones</p>
                              <p className="text-sm text-gray-600">{candidate.observations}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sección de información de candidato no contratado */}
                  {candidate.contratacion_status === "no_contratado" && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-orange-600" />
                          <h4 className="font-medium text-orange-800">Candidato No Contratado</h4>
                        </div>
                            <Button 
                              size="sm" 
                          variant="ghost"
                          className="text-orange-700 hover:text-orange-800 hover:bg-orange-100"
                              onClick={() => {
                            const fullCandidate = candidates.find(c => c.id === candidate.id)
                            if (fullCandidate) handleOpenContratacionDialog(fullCandidate, "no_contratado")
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                      <p className="text-sm text-orange-600">El candidato no fue contratado.</p>
                      
                      {candidate.observations && (
                        <div className="flex items-start gap-2 mt-4">
                          <MessageSquare className="h-4 w-4 text-orange-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Razón</p>
                            <p className="text-sm text-gray-600">{candidate.observations}</p>
                      </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showContractDialog} onOpenChange={(open) => {
        setShowContractDialog(open)
        if (!open) {
          setObservationsError("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestión de Estado de Contratación</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Candidato: <strong>{selectedCandidate.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Estado de Contratación</Label>
              <Select
                value={contractForm.hiring_status}
                onValueChange={(value: HiringStatus) => {
                  setContractForm({ ...contractForm, hiring_status: value })
                  // Limpiar error cuando se cambia el estado
                  setObservationsError("")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_espera_feedback">En espera de feedback de cliente</SelectItem>
                  <SelectItem value="no_seleccionado">No seleccionado (cliente rechazó)</SelectItem>
                  <SelectItem value="envio_carta_oferta">Envío de carta oferta</SelectItem>
                  <SelectItem value="aceptacion_carta_oferta">Aceptación de carta oferta</SelectItem>
                  <SelectItem value="rechazo_carta_oferta">Rechazo de carta oferta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_response_date">Fecha de Respuesta del Cliente</Label>
              <Input
                id="client_response_date"
                type="date"
                value={contractForm.client_response_date || ''}
                onChange={(e) => setContractForm({ ...contractForm, client_response_date: e.target.value || null })}
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="observations">
                Observaciones del Módulo 5
                {(contractForm.hiring_status === "no_seleccionado" || contractForm.hiring_status === "rechazo_carta_oferta") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="observations"
                value={contractForm.observations}
                onChange={(e) => {
                  setContractForm({ ...contractForm, observations: e.target.value })
                  // Limpiar error cuando el usuario empiece a escribir
                  if (observationsError) setObservationsError("")
                }}
                placeholder={
                  contractForm.hiring_status === "no_seleccionado" || contractForm.hiring_status === "rechazo_carta_oferta"
                    ? "Ingrese los comentarios (obligatorio)..."
                    : "Comentarios adicionales sobre el proceso..."
                }
                rows={3}
              />
              {observationsError && (
                <p className="text-destructive text-sm">{observationsError}</p>
              )}
            </div>

            {/* Información contextual según el estado */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Información del Estado</h4>
              <p className="text-sm text-muted-foreground">
                {contractForm.hiring_status === "en_espera_feedback" && 
                  "El candidato pasó el módulo 4 y está esperando la respuesta del cliente sobre su contratación."
                }
                {contractForm.hiring_status === "no_seleccionado" && 
                  "El cliente ha rechazado al candidato después de revisar su perfil."
                }
                {contractForm.hiring_status === "envio_carta_oferta" && 
                  "El cliente aprobó al candidato y se ha enviado la carta oferta formal. Ahora puedes cambiar al estado 'Aceptación de carta oferta' o 'Rechazo de carta oferta' según la respuesta del candidato."
                }
                {contractForm.hiring_status === "aceptacion_carta_oferta" && 
                  "El candidato ha aceptado la oferta. Utiliza los botones de 'Gestión de Contratación' (abajo) para registrarlo como Contratado o No Contratado."
                }
                {contractForm.hiring_status === "rechazo_carta_oferta" && 
                  "El candidato rechazó la oferta laboral."
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContractSubmit}>Guardar Estado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para finalizar solicitud */}
      <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Solicitud</DialogTitle>
            <DialogDescription>
              Selecciona el estado final del proceso y proporciona una razón si es necesario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Resumen del Proceso</h4>
              <div className="space-y-1 text-sm">
                <p>
                  Total de vacantes: <strong>{totalVacancies}</strong>
                </p>
                <p>
                  Candidatos contratados: <strong>{contractedCount}</strong>
                </p>
                <p>
                  Candidatos que continúan:{" "}
                  <strong>{contractedCandidates.filter((c) => c.hiring_status === "contratado" && c.continues).length}</strong>
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="estado_solicitud">Estado Final</Label>
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
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
              <Label htmlFor="status_reason">{getReasonLabel()}</Label>
              <Textarea
                id="status_reason"
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder={getReasonPlaceholder()}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
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
            <Button
              onClick={handleProcessClosure}
              disabled={!selectedEstado || isBlocked}
            >
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Contratación */}
      <Dialog open={showContratacionDialog} onOpenChange={setShowContratacionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {(selectedCandidate as any)?.contratacion_status ? (
                // Modo edición
                contratacionAction === "contratado" ? "Editar Información de Contratación" : "Editar Información de No Contratado"
              ) : (
                // Modo crear nuevo
                contratacionAction === "contratado" ? "Registrar Contratación" : "Registrar Candidato No Contratado"
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Candidato: <strong>{selectedCandidate.name}</strong>
                  {contratacionAction === "no_contratado" && !(selectedCandidate as any)?.contratacion_status && (
                    <span className="block mt-2 text-orange-600">
                      Complete la información del candidato que no fue contratado
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {contratacionAction === "contratado" ? (
              // Formulario para CONTRATADO
              <>
                <div className="space-y-2">
                  <Label htmlFor="fecha_ingreso_contratacion_dialog">
                    Fecha de Ingreso
                  </Label>
                  <Input
                    id="fecha_ingreso_contratacion_dialog"
                    type="date"
                    value={contratacionForm.fecha_ingreso_contratacion}
                    onChange={(e) => setContratacionForm({ ...contratacionForm, fecha_ingreso_contratacion: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones_contratacion_dialog">
                    Observaciones <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Textarea
                    id="observaciones_contratacion_dialog"
                    value={contratacionForm.observaciones_contratacion}
                    onChange={(e) => setContratacionForm({ ...contratacionForm, observaciones_contratacion: e.target.value })}
                    placeholder="Ej: Cargo asignado, área de trabajo, condiciones especiales..."
                    rows={4}
                  />
                </div>
              </>
            ) : (
              // Formulario para NO CONTRATADO
              <>
                <div className="space-y-2">
                  <Label htmlFor="observaciones_contratacion_dialog">
                    Razón por la que no fue contratado <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Textarea
                    id="observaciones_contratacion_dialog"
                    value={contratacionForm.observaciones_contratacion}
                    onChange={(e) => setContratacionForm({ ...contratacionForm, observaciones_contratacion: e.target.value })}
                    placeholder="Ej: No cumplió con las expectativas del cargo, rechazó la oferta final, se encontró un candidato más adecuado..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowContratacionDialog(false)}
              disabled={isSavingContratacion}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveContratacion}
              disabled={isSavingContratacion}
              className={contratacionAction === "no_contratado" ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              {isSavingContratacion ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                (selectedCandidate as any)?.contratacion_status ? (
                  "Actualizar Información"
                ) : (
                  contratacionAction === "contratado" ? "Registrar Contratación" : "Confirmar No Contratado"
                )
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
