"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getCandidatesByProcess } from "@/lib/api"
import { evaluacionPsicolaboralService, referenciaLaboralService, estadoClienteM5Service, solicitudService } from "@/lib/api"
import { formatDate, processStatusLabels, getStatusColor } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ProcessBlocked } from "@/components/consultor/ProcessBlocked"
import { useFormValidation, validationSchemas } from "@/hooks/useFormValidation"
import { ValidationErrorDisplay } from "@/components/ui/ValidatedFormComponents"
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  Building,
  Phone,
  Mail,
  Trash2,
  Upload,
  Send,
  AlertCircle,
  Edit,
  Save,
  Loader2,
  RotateCcw,
} from "lucide-react"
import type { Process, Candidate } from "@/lib/types"

interface WorkReference {
  id: string
  candidate_id: string
  nombre_referencia: string
  cargo_referencia: string
  relacion_postulante_referencia: string
  empresa_referencia: string
  telefono_referencia?: string
  email_referencia?: string
  comentario_referencia?: string
}

interface CandidateReport {
  candidate_id: string
  report_status: "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | null
  report_observations?: string
  report_sent_date?: string
}

interface ProcessModule4Props {
  process: Process
}

export function ProcessModule4({ process }: ProcessModule4Props) {
  const { toast } = useToast()
  const { errors, validateField, validateAllFields, clearAllErrors, setFieldError, clearError } = useFormValidation()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdvancingToModule5, setIsAdvancingToModule5] = useState(false)
  
  // Función para calcular días hábiles
  const addBusinessDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    let addedDays = 0
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      // Excluir sábados (6) y domingos (0)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++
      }
    }
    
    return result
  }

  // Función para obtener evaluación psicolaboral desde API real
  const getEvaluationByCandidate = async (candidate: Candidate) => {
    try {
      const response = await evaluacionPsicolaboralService.getByPostulacion(Number(candidate.id_postulacion))
      return response.data?.[0] || undefined
    } catch (error) {
      console.error('Error al obtener evaluación psicolaboral:', error)
      return undefined
    }
  }

  const loadReferencesForCandidate = async (candidateId: number) => {
    try {
      const response = await referenciaLaboralService.getByCandidato(candidateId)
      if (response.success && response.data) {
        // Asegurar que todas las referencias tengan un ID único
        const referencesWithId = response.data.map((ref: any, index: number) => {
          const referenceId = ref.id_referencia_laboral || ref.id
          return {
            ...ref,
            id: referenceId ? String(referenceId) : `ref_${candidateId}_${index}_${Date.now()}`
          }
        })
        setWorkReferences(prev => ({
          ...prev,
          [candidateId]: referencesWithId
        }))
      }
    } catch (error) {
      console.error(`Error al cargar referencias para candidato ${candidateId}:`, error)
    }
  }

  // Cargar datos reales desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Usar endpoint optimizado para evitar consultas innecesarias a institución
        const { postulacionService } = await import('@/lib/api')
        const response = await postulacionService.getBySolicitudOptimized(Number(process.id))
        const allCandidates = response.data || []
        
        // Filtrar candidatos según el tipo de proceso
        let candidatesToShow: Candidate[]
        if (process.service_type === "ES" || process.service_type === "TS") {
          candidatesToShow = allCandidates
        } else {
          candidatesToShow = allCandidates.filter((c: Candidate) => c.client_response === "aprobado")
        }
        setCandidates(candidatesToShow)

        // Cargar evaluaciones psicolaborales para cada candidato filtrado
        const evaluationsData: { [candidateId: string]: any } = {}
        const interviewsData: { [candidateId: string]: any } = {}
        const testsData: { [candidateId: string]: any[] } = {}
        const reportsData: { [candidateId: string]: CandidateReport } = {}
        
        for (const candidate of candidatesToShow) {
          try {
            const evaluation = await getEvaluationByCandidate(candidate)
            if (evaluation) {
              evaluationsData[candidate.id] = evaluation
              
              // También actualizar candidateInterviews para la visualización
              interviewsData[candidate.id] = {
                interview_date: evaluation.fecha_evaluacion ? new Date(evaluation.fecha_evaluacion) : null,
                interview_status: evaluation.estado_evaluacion,
              }
              
              // Mapear estado_informe a report_status para candidateReports
              let reportStatus: "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | null = null
              if (evaluation.estado_informe === "Recomendable") {
                reportStatus = "recomendable"
              } else if (evaluation.estado_informe === "No recomendable") {
                reportStatus = "no_recomendable"
              } else if (evaluation.estado_informe === "Recomendable con observaciones") {
                reportStatus = "recomendable_con_observaciones"
              }
              
              reportsData[candidate.id] = {
                candidate_id: candidate.id,
                report_status: reportStatus,
                report_observations: evaluation.conclusion_global || undefined,
                report_sent_date: evaluation.fecha_envio_informe ? new Date(evaluation.fecha_envio_informe).toISOString().split('T')[0] : undefined
              }
              
              // Cargar tests de la evaluación
              if (evaluation.tests && evaluation.tests.length > 0) {
                testsData[candidate.id] = evaluation.tests.map((test: any, idx: number) => ({
                  id: test.id_test_psicolaboral ? String(test.id_test_psicolaboral) : `test_${candidate.id}_${idx}_${Date.now()}`,
                  test_name: test.nombre_test_psicolaboral,
                  result: test.EvaluacionTest?.resultado_test || ''
                }))
              }
            }
          } catch (error) {
            console.error(`Error al cargar evaluación para candidato ${candidate.id}:`, error)
          }
        }
        setEvaluations(evaluationsData)
        setCandidateInterviews(interviewsData)
        setCandidateTests(testsData)
        setCandidateReports(reportsData)

        // Cargar tests disponibles
        const { testPsicolaboralService } = await import('@/lib/api')
        const testsResponse = await testPsicolaboralService.getAll()
        setAvailableTests(testsResponse.data || [])

        // Cargar referencias laborales para cada candidato
        for (const candidate of candidatesToShow) {
          await loadReferencesForCandidate(Number(candidate.id))
        }
      } catch (error) {
        console.error('Error al cargar candidatos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [process.id, process.service_type])

  // Cargar estado del proceso y estados disponibles para finalización (solo ES y TS)
  useEffect(() => {
    // Inicializar estado desde el proceso
    const initialStatus = (process.estado_solicitud || process.status || "") as string
    setProcessStatus(initialStatus)

    const loadProcessStatus = async () => {
      try {
        const response = await solicitudService.getById(Number(process.id))
        if (response.success && response.data) {
          setProcessStatus(response.data.estado_solicitud || response.data.status || response.data.estado || "")
        }
      } catch (error) {
        console.error("Error al cargar estado del proceso:", error)
      }
    }

    const loadEstados = async () => {
      // Solo cargar estados si es ES o TS
      const serviceType = (process.service_type as string)?.toUpperCase() || ""
      const isEvaluationProcess = serviceType === "ES" || serviceType === "TS"
      
      if (!isEvaluationProcess) {
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

    loadProcessStatus()
    loadEstados()
  }, [process.id, process.service_type])

  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  const [showInterviewDialog, setShowInterviewDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showEditTestDialog, setShowEditTestDialog] = useState(false)
  const [showReferencesDialog, setShowReferencesDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isSavingInterview, setIsSavingInterview] = useState(false)
  const [candidateConclusions, setCandidateConclusions] = useState<{ [key: string]: string }>({})

  const [candidateReports, setCandidateReports] = useState<{ [candidateId: string]: CandidateReport }>({})
  const [evaluations, setEvaluations] = useState<{ [candidateId: string]: any }>({})

  const [workReferences, setWorkReferences] = useState<{ [candidateId: string]: WorkReference[] }>({})
  const [candidateTests, setCandidateTests] = useState<{ [candidateId: string]: any[] }>({})
  
  // Estados para el módulo 5
  const [canAdvanceToModule5, setCanAdvanceToModule5] = useState(false)
  const [candidatesWithRealizedInterview, setCandidatesWithRealizedInterview] = useState<Candidate[]>([])
  const [candidateInterviews, setCandidateInterviews] = useState<{ [candidateId: string]: any }>({})
  const [availableTests, setAvailableTests] = useState<any[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'test' | 'reference' | null;
    candidateId?: string;
    testIndex?: number;
    referenceId?: string;
    testName?: string;
    referenceName?: string;
  }>({ type: null })
  const [newReference, setNewReference] = useState({
    nombre_referencia: "",
    cargo_referencia: "",
    relacion_postulante_referencia: "",
    empresa_referencia: "",
    telefono_referencia: "",
    email_referencia: "",
    comentario_referencia: "",
  })
  
  // Estado para múltiples formularios de referencias (similar a profesiones)
  // referenceId es el ID de la base de datos (si existe), id es el ID temporal del formulario
  const [referenceForms, setReferenceForms] = useState<Array<{
    id: string
    referenceId?: string // ID de la BD si es una referencia existente
    markedForDeletion?: boolean // Marca si la referencia debe eliminarse al guardar
    nombre_referencia: string
    cargo_referencia: string
    relacion_postulante_referencia: string
    empresa_referencia: string
    telefono_referencia: string
    email_referencia: string
    comentario_referencia: string
  }>>([{
    id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nombre_referencia: "",
    cargo_referencia: "",
    relacion_postulante_referencia: "",
    empresa_referencia: "",
    telefono_referencia: "",
    email_referencia: "",
    comentario_referencia: "",
  }])
  
  const [hasAttemptedSubmitReference, setHasAttemptedSubmitReference] = useState(false)
  const [isSavingReference, setIsSavingReference] = useState(false)

  // Estados para finalizar solicitud (solo ES y TS)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState("")
  const [statusChangeReason, setStatusChangeReason] = useState("")
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [estadosDisponibles, setEstadosDisponibles] = useState<any[]>([])
  const [processStatus, setProcessStatus] = useState<string>("")

  // Función para convertir datetime-local a Date preservando la hora local exacta (sin conversión UTC)
  const parseLocalDateTime = (dateTimeString: string): Date => {
    // Formato: "YYYY-MM-DDTHH:mm"
    const [datePart, timePart] = dateTimeString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);
    // Crear Date usando constructor local (no UTC)
    return new Date(year, month - 1, day, hour, minute);
  }

  // Función para convertir Date a formato datetime-local preservando hora local (sin conversión UTC)
  const formatDateForInput = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Usar métodos locales (getFullYear, getMonth, etc.) para obtener componentes en hora local
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hour = String(dateObj.getHours()).padStart(2, '0');
    const minute = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  const [interviewForm, setInterviewForm] = useState({
    interview_date: "",
    interview_status: "programada" as "programada" | "realizada" | "cancelada",
  })

  const [testForm, setTestForm] = useState({
    tests: [{ test_name: "", result: "" }],
  })
  const [editingTest, setEditingTest] = useState<{ test: any; index: number } | null>(null)

  const [reportForm, setReportForm] = useState({
    report_status: "" as "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | "",
    report_observations: "",
    report_sent_date: "",
  })
  const [reportSentDateError, setReportSentDateError] = useState<string>("")

  // Verificar si el proceso está bloqueado (estado final)
  const isProcessBlocked = (status: string): boolean => {
    const finalStates = ['cerrado', 'congelado', 'cancelado', 'cierre extraordinario']
    return finalStates.some(state => 
      status.toLowerCase().includes(state.toLowerCase())
    )
  }

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

    if (!estadoId) {
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
        parseInt(estadoId),
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

  // Determinar si es proceso de evaluación
  const isEvaluationProcess = process.service_type === "ES" || process.service_type === "TS"

  // Detectar candidatos con estado de informe definido (no pendiente) para habilitar botón de módulo 5
  useEffect(() => {
    if (!isEvaluationProcess && candidates.length > 0) {
      const candidatesWithReportStatus = candidates.filter(candidate => {
        const evaluation = evaluations[candidate.id]
        const estadoInforme = evaluation?.estado_informe
        // Solo avanzan los que tienen estado: Recomendable, No recomendable, o Recomendable con observaciones
        return estadoInforme === "Recomendable" || 
               estadoInforme === "No recomendable" || 
               estadoInforme === "Recomendable con observaciones"
      })
      
      setCandidatesWithRealizedInterview(candidatesWithReportStatus)
      setCanAdvanceToModule5(candidatesWithReportStatus.length > 0)
    } else {
      setCandidatesWithRealizedInterview([])
      setCanAdvanceToModule5(false)
    }
  }, [candidates, evaluations, isEvaluationProcess])

  const handleAddTest = () => {
    setTestForm({
      ...testForm,
      tests: [...testForm.tests, { test_name: "", result: "" }],
    })
  }

  const handleTestChange = (index: number, field: "test_name" | "result", value: string) => {
    const updatedTests = testForm.tests.map((test, i) => (i === index ? { ...test, [field]: value } : test))
    setTestForm({ ...testForm, tests: updatedTests })
    
    // Validar el campo resultado si se está modificando
    if (field === "result") {
      const testData = updatedTests[index]
      validateField(`test_result_${index}`, value, validationSchemas.module4TestForm, { result: value })
    }
  }


  const openInterviewDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Cargar datos existentes desde evaluaciones de BD
    const existingEvaluation = evaluations[candidate.id]
    if (existingEvaluation) {
      // Convertir estado de evaluación a formato del formulario
      let statusValue: "programada" | "realizada" | "cancelada" = "programada"
      if (existingEvaluation.estado_evaluacion === "Realizada") statusValue = "realizada"
      else if (existingEvaluation.estado_evaluacion === "Cancelada") statusValue = "cancelada"
      else statusValue = "programada" // Para "Sin programar" y "Programada"

      setInterviewForm({
        interview_date: existingEvaluation.fecha_evaluacion 
          ? formatDateForInput(existingEvaluation.fecha_evaluacion)
          : "",
        interview_status: statusValue,
      })
    } else {
      setInterviewForm({
      interview_date: "",
      interview_status: "programada",
      })
    }
    
    // Limpiar errores previos
    clearAllErrors()
    
    setShowInterviewDialog(true)
  }

  const openTestDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Siempre abrir con formulario limpio para agregar nuevo test
    setTestForm({
      tests: [{ test_name: "", result: "" }],
    })
    
    // Limpiar errores previos
    clearAllErrors()
    
    setShowTestDialog(true)
  }

  const handleSaveInterview = async () => {
    if (!selectedCandidate) return
    
    // Validar todos los campos usando useFormValidation
    const isValid = validateAllFields(interviewForm, validationSchemas.module4InterviewForm)
    
    if (!isValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }
    
    setIsSavingInterview(true)
    try {
      // Verificar si ya existe una evaluación para este candidato
      const existingEvaluation = evaluations[selectedCandidate.id]
      
      if (existingEvaluation) {
        // Actualizar evaluación existente
        // NO actualizar fecha_envio_informe aquí - solo se actualiza cuando se gestiona el estado del informe
        // Mantener la fecha existente si ya existe, no prellenar ni calcular
        const updateData = {
          fecha_evaluacion: interviewForm.interview_date || undefined,
          estado_evaluacion: interviewForm.interview_status === "programada" ? "Programada" : 
                            interviewForm.interview_status === "realizada" ? "Realizada" :
                            interviewForm.interview_status === "cancelada" ? "Cancelada" : "Sin programar",
          // NO incluir fecha_envio_informe aquí - solo se actualiza en el diálogo de "Estado del Informe"
        }
        
        await evaluacionPsicolaboralService.update(existingEvaluation.id_evaluacion_psicolaboral, updateData as any)
      } else {
        // Crear nueva evaluación
        // NO prellenar fecha_envio_informe - debe estar en blanco hasta que el consultor la ingrese al gestionar el estado del informe
        const createData = {
          fecha_evaluacion: interviewForm.interview_date || undefined,
          fecha_envio_informe: null, // No prellenar - el consultor la ingresará al gestionar el estado del informe
          estado_evaluacion: interviewForm.interview_status === "programada" ? "Programada" : 
                            interviewForm.interview_status === "realizada" ? "Realizada" :
                            interviewForm.interview_status === "cancelada" ? "Cancelada" : "Sin programar",
          estado_informe: "Pendiente",
          conclusion_global: "",
          id_postulacion: Number(selectedCandidate.id_postulacion)
        }
        
        await evaluacionPsicolaboralService.create(createData as any)
      }
      
      // Actualizar estado local con fechas convertidas a Date
      setCandidateInterviews({
        ...candidateInterviews,
        [selectedCandidate.id]: {
          interview_date: interviewForm.interview_date ? new Date(interviewForm.interview_date) : null,
          interview_status: interviewForm.interview_status === "programada" ? "Programada" : 
                            interviewForm.interview_status === "realizada" ? "Realizada" :
                            interviewForm.interview_status === "cancelada" ? "Cancelada" : "Sin programar",
        }
      })
      
      // Recargar evaluaciones
      const updatedEvaluation = await getEvaluationByCandidate(selectedCandidate)
      if (updatedEvaluation) {
        setEvaluations({
          ...evaluations,
          [selectedCandidate.id]: updatedEvaluation
        })
      }
      
      setShowInterviewDialog(false)
      setInterviewForm({
        interview_date: "",
        interview_status: "programada",
    })
    setSelectedCandidate(null)
    clearAllErrors()
      
      toast({
        title: "¡Éxito!",
        description: "Estado de entrevista actualizado correctamente",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al guardar entrevista:", error)
      toast({
        title: "Error",
        description: "Error al guardar el estado de entrevista",
        variant: "destructive",
      })
    } finally {
      setIsSavingInterview(false)
    }
  }

  const handleSaveTest = async () => {
    if (!selectedCandidate) return

    // Validar todos los campos de resultado de los tests (siempre validar, incluso si está vacío)
    let hasErrors = false
    testForm.tests.forEach((test, index) => {
      // Validar cada campo individualmente para mostrar errores específicos
      validateField(`test_result_${index}`, test.result || "", validationSchemas.module4TestForm, { result: test.result || "" })
      
      // Verificar si hay errores después de validar
      const isValid = validateAllFields({ result: test.result || "" }, validationSchemas.module4TestForm)
      if (!isValid) {
        hasErrors = true
      }
    })

    if (hasErrors) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }
    
    try {
      const { evaluacionPsicolaboralService } = await import('@/lib/api')
      
      // Obtener la evaluación psicolaboral del candidato
      const evaluation = evaluations[selectedCandidate.id]
      if (!evaluation) {
        toast({
          title: "Error",
          description: "No se encontró evaluación psicolaboral para este candidato",
          variant: "destructive",
        })
        return
      }

      // Guardar cada test
      for (const test of testForm.tests) {
        if (test.test_name && test.result) {
          await evaluacionPsicolaboralService.addTest(
            evaluation.id_evaluacion_psicolaboral,
            parseInt(test.test_name), // id_test_psicolaboral
            test.result
          )
        }
      }

      // Actualizar el estado local
      const updatedTests = testForm.tests
        .filter(test => test.test_name && test.result)
        .map(test => {
          const testInfo = availableTests.find(t => t.id_test_psicolaboral.toString() === test.test_name)
          return {
            id: testInfo?.id_test_psicolaboral || `test_${selectedCandidate.id}_${test.test_name}`,
            test_name: testInfo?.nombre_test_psicolaboral || test.test_name,
            result: test.result
          }
        })

      setCandidateTests({
        ...candidateTests,
        [selectedCandidate.id]: updatedTests
      })

      toast({
        title: "Éxito",
        description: "Tests guardados correctamente",
      })

      setShowTestDialog(false)
      setTestForm({
        tests: [{ test_name: "", result: "" }],
      })
      setSelectedCandidate(null)
      clearAllErrors()
    } catch (error) {
      console.error('Error al guardar tests:', error)
      toast({
        title: "Error",
        description: "Error al guardar los tests",
        variant: "destructive",
      })
    }
  }

  const openEditTestDialog = (candidate: Candidate, test: any, index: number) => {
    setSelectedCandidate(candidate)
    setEditingTest({ test, index })
    
    // Encontrar el ID del test en availableTests
    const testInfo = availableTests.find(t => t.nombre_test_psicolaboral === test.test_name)
    
    setTestForm({
      tests: [{ 
        test_name: testInfo?.id_test_psicolaboral.toString() || "", 
        result: test.result 
      }],
    })
    
    // Limpiar errores previos
    clearAllErrors()
    
    setShowEditTestDialog(true)
  }

  const handleDeleteTest = (candidate: Candidate, test: any, index: number) => {
    setDeleteConfirm({
      type: 'test',
      candidateId: candidate.id,
      testIndex: index,
      testName: test.test_name
    })
  }

  const confirmDeleteTest = async () => {
    if (!deleteConfirm.candidateId || deleteConfirm.testIndex === undefined) return

    try {
      const { evaluacionPsicolaboralService } = await import('@/lib/api')
      
      // Obtener la evaluación psicolaboral del candidato
      const evaluation = evaluations[deleteConfirm.candidateId]
      if (!evaluation) {
        toast({
          title: "Error",
          description: "No se encontró evaluación psicolaboral para este candidato",
          variant: "destructive",
        })
        return
      }

      // Encontrar el ID del test
      const testInfo = availableTests.find(t => t.nombre_test_psicolaboral === deleteConfirm.testName)
      if (!testInfo) {
        toast({
          title: "Error",
          description: "No se encontró información del test",
          variant: "destructive",
        })
        return
      }

      // Eliminar de la BD
      await evaluacionPsicolaboralService.deleteTest(
        evaluation.id_evaluacion_psicolaboral,
        testInfo.id_test_psicolaboral
      )

      // Actualizar estado local
      const updatedTests = candidateTests[deleteConfirm.candidateId].filter((_, i) => i !== deleteConfirm.testIndex)
      setCandidateTests({
        ...candidateTests,
        [deleteConfirm.candidateId]: updatedTests
      })

      // Limpiar confirmación
      setDeleteConfirm({ type: null })

      toast({
        title: "Éxito",
        description: "Test eliminado correctamente",
      })
    } catch (error) {
      console.error('Error al eliminar test:', error)
      toast({
        title: "Error",
        description: "Error al eliminar el test",
        variant: "destructive",
      })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ type: null })
  }

  const handleSaveEditTest = async () => {
    if (!selectedCandidate || !editingTest) return

    // Validar el campo de resultado (siempre validar, incluso si está vacío)
    const test = testForm.tests[0]
    // Validar el campo individualmente para mostrar el error específico
    validateField(`test_result_${0}`, test.result || "", validationSchemas.module4TestForm, { result: test.result || "" })
    
    const isValid = validateAllFields({ result: test.result || "" }, validationSchemas.module4TestForm)
    if (!isValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }
    
    try {
      const { evaluacionPsicolaboralService } = await import('@/lib/api')
      
      // Obtener la evaluación psicolaboral del candidato
      const evaluation = evaluations[selectedCandidate.id]
      if (!evaluation) {
        toast({
          title: "Error",
          description: "No se encontró evaluación psicolaboral para este candidato",
          variant: "destructive",
        })
        return
      }

      const test = testForm.tests[0]
      if (!test.test_name || !test.result) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        })
        return
      }

      // Actualizar en la BD
      await evaluacionPsicolaboralService.addTest(
        evaluation.id_evaluacion_psicolaboral,
        parseInt(test.test_name),
        test.result
      )

      // Actualizar estado local
      const testInfo = availableTests.find(t => t.id_test_psicolaboral.toString() === test.test_name)
      const updatedTests = [...candidateTests[selectedCandidate.id]]
      updatedTests[editingTest.index] = {
        id: testInfo?.id_test_psicolaboral || updatedTests[editingTest.index]?.id || `test_${selectedCandidate.id}_${test.test_name}`,
        test_name: testInfo?.nombre_test_psicolaboral || test.test_name,
        result: test.result
      }

      setCandidateTests({
        ...candidateTests,
        [selectedCandidate.id]: updatedTests
      })

      toast({
        title: "Éxito",
        description: "Test actualizado correctamente",
      })

      setShowEditTestDialog(false)
      setEditingTest(null)
      setTestForm({
        tests: [{ test_name: "", result: "" }],
      })
      setSelectedCandidate(null)
      clearAllErrors()
    } catch (error) {
      console.error('Error al actualizar test:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el test",
        variant: "destructive",
      })
    }
  }

  const openReferencesDialog = async (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Cargar referencias existentes del candidato
    try {
      const response = await referenciaLaboralService.getByCandidato(Number(candidate.id))
      
      if (response.success && response.data && response.data.length > 0) {
        // Convertir referencias existentes en formularios editables (sin agregar uno vacío)
        const existingForms = response.data.map((ref: any) => {
          // El ID puede venir como 'id' o 'id_referencia_laboral' dependiendo de cómo Sequelize lo devuelva
          const referenceId = ref.id_referencia_laboral || ref.id
          return {
            id: `ref_${referenceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            referenceId: String(referenceId), // ID de la BD (convertir a string para consistencia)
            nombre_referencia: ref.nombre_referencia || "",
            cargo_referencia: ref.cargo_referencia || "",
            relacion_postulante_referencia: ref.relacion_postulante_referencia || "",
            empresa_referencia: ref.empresa_referencia || "",
            telefono_referencia: ref.telefono_referencia || "",
            email_referencia: ref.email_referencia || "",
            comentario_referencia: ref.comentario_referencia || "",
          }
        })
        
        setReferenceForms(existingForms)
      } else {
        // Si no hay referencias, inicializar con un formulario vacío
        setReferenceForms([{
          id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre_referencia: "",
          cargo_referencia: "",
          relacion_postulante_referencia: "",
          empresa_referencia: "",
          telefono_referencia: "",
          email_referencia: "",
          comentario_referencia: "",
        }])
      }
    } catch (error) {
      console.error('Error al cargar referencias:', error)
      // En caso de error, inicializar con un formulario vacío
      setReferenceForms([{
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nombre_referencia: "",
        cargo_referencia: "",
        relacion_postulante_referencia: "",
        empresa_referencia: "",
        telefono_referencia: "",
        email_referencia: "",
        comentario_referencia: "",
      }])
    }
    
    setHasAttemptedSubmitReference(false)
    clearAllErrors()
    
    setShowReferencesDialog(true)
  }

  // Funciones para manejar múltiples formularios de referencias
  const addReferenceForm = () => {
    const newForm = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nombre_referencia: "",
      cargo_referencia: "",
      relacion_postulante_referencia: "",
      empresa_referencia: "",
      telefono_referencia: "",
      email_referencia: "",
      comentario_referencia: "",
    }
    setReferenceForms([...referenceForms, newForm])
  }
  
  const removeReferenceForm = (id: string) => {
    // Limpiar errores del formulario que se elimina
    const form = referenceForms.find(f => f.id === id)
    if (form) {
      clearError(`reference_${id}_nombre_referencia`)
      clearError(`reference_${id}_cargo_referencia`)
      clearError(`reference_${id}_relacion_postulante_referencia`)
      clearError(`reference_${id}_empresa_referencia`)
      clearError(`reference_${id}_telefono_referencia`)
      clearError(`reference_${id}_email_referencia`)
      clearError(`reference_${id}_comentario_referencia`)
    }
    
    setReferenceForms(forms => forms.filter(form => form.id !== id))
  }

  const updateReferenceForm = (id: string, field: string, value: string) => {
    setReferenceForms(forms => {
      const updatedForms = forms.map(form => 
        form.id === id ? { ...form, [field]: value } : form
      )
      
      const updatedForm = updatedForms.find(f => f.id === id)
      
      if (updatedForm) {
        validateReferenceField(id, field, value, updatedForm)
      }
      
      return updatedForms
    })
  }


  // Función para validar un campo de referencia
  const validateReferenceField = (formId: string, field: string, value: string, formData: any) => {
    const fieldKey = `reference_${formId}_${field}`
    
    // Validar campos opcionales (teléfono, email, comentario) siempre, independientemente de otros campos
    if (field === 'telefono_referencia' || field === 'email_referencia' || field === 'comentario_referencia') {
      // Si el campo está vacío, limpiar el error (es opcional)
      if (!value || !value.trim()) {
        clearError(fieldKey)
      } else {
        // Si tiene valor, validar directamente usando la lógica del esquema
        const schemaFieldName = field // 'telefono_referencia', 'email_referencia', etc.
        const rule = validationSchemas.module4ReferenceForm[schemaFieldName]
        
        if (rule) {
          let errorMessage: string | null = null
          
          // Ejecutar validación personalizada si existe (para teléfono y email)
          if ('custom' in rule && rule.custom) {
            errorMessage = rule.custom(value)
          }
          // Validación de longitud máxima (para comentarios)
          else if ('maxLength' in rule && rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
            errorMessage = rule.message || `No puede exceder ${rule.maxLength} caracteres`
          }
          
          // Actualizar el error con el fieldKey correcto para mostrarlo en el UI
          if (errorMessage) {
            setFieldError(fieldKey, errorMessage)
          } else {
            clearError(fieldKey)
          }
        }
      }
    }
    
    // Validar relacion_postulante_referencia siempre (es opcional pero tiene límite de caracteres)
    if (field === 'relacion_postulante_referencia') {
      const fieldValue = value?.trim() || ''
      if (fieldValue.length > 300) {
        setFieldError(fieldKey, `La relación con el postulante no puede exceder 300 caracteres`)
      } else {
        clearError(fieldKey)
      }
    }
    
    // Verificar si hay al menos un campo obligatorio con valor
    // Nota: relacion_postulante_referencia no es obligatorio según la BD (no tiene NOT NULL)
    const hasAnyRequiredField = !!(
      formData.nombre_referencia?.trim() || 
      formData.cargo_referencia?.trim() || 
      formData.empresa_referencia?.trim()
    )
    
    if (!hasAnyRequiredField) {
      // Si todos los campos obligatorios están vacíos, limpiar errores de campos obligatorios
      clearError(`reference_${formId}_nombre_referencia`)
      clearError(`reference_${formId}_cargo_referencia`)
      clearError(`reference_${formId}_empresa_referencia`)
      // No retornar aquí, permitir que continúe para validar campos opcionales
    }
    
    // Validar longitud máxima de campos obligatorios siempre (incluso antes de enviar)
    if (field === 'nombre_referencia' || field === 'cargo_referencia' || field === 'empresa_referencia') {
      const fieldValue = value?.trim() || ''
      if (fieldValue.length > 100) {
        setFieldError(fieldKey, `El campo no puede exceder 100 caracteres`)
      } else {
        clearError(fieldKey)
      }
    }
    
    // Solo mostrar errores obligatorios si se ha intentado enviar
    if (hasAttemptedSubmitReference) {
      if (!formData.nombre_referencia?.trim()) {
        setFieldError(`reference_${formId}_nombre_referencia`, 'El nombre de la referencia es obligatorio')
      } else if (formData.nombre_referencia.trim().length > 100) {
        setFieldError(`reference_${formId}_nombre_referencia`, 'El nombre de la referencia no puede exceder 100 caracteres')
      } else {
        clearError(`reference_${formId}_nombre_referencia`)
      }
      
      if (!formData.cargo_referencia?.trim()) {
        setFieldError(`reference_${formId}_cargo_referencia`, 'El cargo de la referencia es obligatorio')
      } else if (formData.cargo_referencia.trim().length > 100) {
        setFieldError(`reference_${formId}_cargo_referencia`, 'El cargo de la referencia no puede exceder 100 caracteres')
      } else {
        clearError(`reference_${formId}_cargo_referencia`)
      }
      
      if (formData.relacion_postulante_referencia?.trim() && formData.relacion_postulante_referencia.trim().length > 300) {
        setFieldError(`reference_${formId}_relacion_postulante_referencia`, 'La relación con el postulante no puede exceder 300 caracteres')
      } else {
        clearError(`reference_${formId}_relacion_postulante_referencia`)
      }
      
      if (!formData.empresa_referencia?.trim()) {
        setFieldError(`reference_${formId}_empresa_referencia`, 'El nombre de la empresa es obligatorio')
      } else if (formData.empresa_referencia.trim().length > 100) {
        setFieldError(`reference_${formId}_empresa_referencia`, 'El nombre de la empresa no puede exceder 100 caracteres')
      } else {
        clearError(`reference_${formId}_empresa_referencia`)
      }
    } else {
      // Si no se ha intentado enviar, solo validar longitud máxima y limpiar errores cuando se completan campos
      if (field === 'nombre_referencia' && value?.trim() && value.trim().length <= 100) {
        clearError(fieldKey)
      }
      if (field === 'cargo_referencia' && value?.trim() && value.trim().length <= 100) {
        clearError(fieldKey)
      }
      if (field === 'relacion_postulante_referencia' && value?.trim() && value.trim().length <= 300) {
        clearError(fieldKey)
      }
      if (field === 'empresa_referencia' && value?.trim() && value.trim().length <= 100) {
        clearError(fieldKey)
      }
    }
  }

  const handleDiscardSingleReference = (formId: string) => {
    if (referenceForms.length > 1) {
      removeReferenceForm(formId)
    } else {
      // Si solo hay un formulario, limpiar sus campos
      setReferenceForms([{
        id: formId,
        nombre_referencia: "",
        cargo_referencia: "",
        relacion_postulante_referencia: "",
        empresa_referencia: "",
        telefono_referencia: "",
        email_referencia: "",
        comentario_referencia: "",
      }])
      
      // Limpiar errores
      clearError(`reference_${formId}_nombre_referencia`)
      clearError(`reference_${formId}_cargo_referencia`)
      clearError(`reference_${formId}_relacion_postulante_referencia`)
      clearError(`reference_${formId}_empresa_referencia`)
      clearError(`reference_${formId}_telefono_referencia`)
      clearError(`reference_${formId}_email_referencia`)
      clearError(`reference_${formId}_comentario_referencia`)
    }
  }

  const openReportDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Buscar la evaluación existente para este candidato
    const existingEvaluation = evaluations[candidate.id]
    
    if (existingEvaluation) {
      // Mapear los valores del backend al frontend
      let reportStatus = ""
      if (existingEvaluation.estado_informe === "Recomendable") {
        reportStatus = "recomendable"
      } else if (existingEvaluation.estado_informe === "No recomendable") {
        reportStatus = "no_recomendable"
      } else if (existingEvaluation.estado_informe === "Recomendable con observaciones") {
        reportStatus = "recomendable_con_observaciones"
      }
      
      setReportForm({
        report_status: reportStatus as "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | "",
        report_observations: existingEvaluation.conclusion_global || "",
        // Si ya existe fecha, mostrarla, pero si no existe, dejar en blanco (NO prellenar con fecha de hoy)
        report_sent_date: existingEvaluation.fecha_envio_informe ? new Date(existingEvaluation.fecha_envio_informe).toISOString().split('T')[0] : "",
      })
    } else {
      // Si no existe evaluación, limpiar el formulario (fecha en blanco, NO prellenar)
      setReportForm({
        report_status: "",
        report_observations: "",
        report_sent_date: "",
      })
    }
    setReportSentDateError("")
    setShowReportDialog(true)
  }

  const handleSaveReport = async () => {
    if (!selectedCandidate) return

    // Validar que la fecha de envío del informe sea obligatoria
    if (!reportForm.report_sent_date || reportForm.report_sent_date.trim() === "") {
      setReportSentDateError("Debe ingresarse la fecha de envío del informe")
      return
    }
    setReportSentDateError("")

    try {
      // Buscar la evaluación existente para este candidato
      const existingEvaluation = evaluations[selectedCandidate.id]
      
      if (!existingEvaluation) {
        toast({
          title: "Error",
          description: "No se encontró una evaluación para este candidato",
          variant: "destructive",
        })
        return
      }

      // Mapear los valores del frontend al backend
      let estadoInforme = ""
      if (reportForm.report_status === "recomendable") {
        estadoInforme = "Recomendable"
      } else if (reportForm.report_status === "no_recomendable") {
        estadoInforme = "No recomendable"
      } else if (reportForm.report_status === "recomendable_con_observaciones") {
        estadoInforme = "Recomendable con observaciones"
      }

      // Actualizar el informe completo (estado + conclusión + fecha de envío)
      const response = await evaluacionPsicolaboralService.updateInformeCompleto(
        existingEvaluation.id_evaluacion_psicolaboral,
        estadoInforme,
        reportForm.report_observations,
        reportForm.report_sent_date
      )

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Estado del informe actualizado correctamente",
        })

        // Recargar las evaluaciones para mostrar los cambios
        const evaluation = await getEvaluationByCandidate(selectedCandidate)
        if (evaluation) {
          setEvaluations(prev => ({
            ...prev,
            [selectedCandidate.id]: evaluation
          }))
          
          // También actualizar candidateInterviews para la visualización
          setCandidateInterviews(prev => ({
            ...prev,
            [selectedCandidate.id]: {
              interview_date: evaluation.fecha_evaluacion ? new Date(evaluation.fecha_evaluacion) : null,
              interview_status: evaluation.estado_evaluacion,
            }
          }))
          
          // Actualizar candidateReports con el nuevo estado del informe
          let reportStatus: "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | null = null
          if (evaluation.estado_informe === "Recomendable") {
            reportStatus = "recomendable"
          } else if (evaluation.estado_informe === "No recomendable") {
            reportStatus = "no_recomendable"
          } else if (evaluation.estado_informe === "Recomendable con observaciones") {
            reportStatus = "recomendable_con_observaciones"
          }
          
          setCandidateReports(prev => ({
            ...prev,
            [selectedCandidate.id]: {
              candidate_id: selectedCandidate.id,
              report_status: reportStatus,
              report_observations: evaluation.conclusion_global || undefined,
              report_sent_date: evaluation.fecha_envio_informe ? new Date(evaluation.fecha_envio_informe).toISOString().split('T')[0] : undefined
            }
          }))
        }

    setShowReportDialog(false)
    setReportForm({
      report_status: "",
      report_observations: "",
      report_sent_date: "",
    })
    setReportSentDateError("")
    setSelectedCandidate(null)
      } else {
        throw new Error(response.message || "Error al actualizar el informe")
      }
    } catch (error) {
      console.error("Error al guardar informe:", error)
      toast({
        title: "Error",
        description: `Error al guardar informe: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      })
    }
  }


  const handleAddReference = async () => {
    if (!selectedCandidate) return

    setHasAttemptedSubmitReference(true)

    // Validar todos los formularios de referencias
    let hasErrors = false
    referenceForms.forEach(form => {
      // Nota: relacion_postulante_referencia no es obligatorio según la BD (no tiene NOT NULL)
      const hasAnyRequiredField = !!(
        form.nombre_referencia?.trim() || 
        form.cargo_referencia?.trim() || 
        form.empresa_referencia?.trim()
      )
      
      if (hasAnyRequiredField) {
        // Validar todos los campos obligatorios
        validateReferenceField(form.id, 'nombre_referencia', form.nombre_referencia || '', form)
        validateReferenceField(form.id, 'cargo_referencia', form.cargo_referencia || '', form)
        validateReferenceField(form.id, 'empresa_referencia', form.empresa_referencia || '', form)
        
        // Validar relacion_postulante_referencia si tiene valor (es opcional)
        if (form.relacion_postulante_referencia?.trim()) {
          validateReferenceField(form.id, 'relacion_postulante_referencia', form.relacion_postulante_referencia, form)
        }
        
        // Validar campos opcionales si tienen valor
        if (form.telefono_referencia?.trim()) {
          validateReferenceField(form.id, 'telefono_referencia', form.telefono_referencia, form)
        }
        if (form.email_referencia?.trim()) {
          validateReferenceField(form.id, 'email_referencia', form.email_referencia, form)
        }
        if (form.comentario_referencia?.trim()) {
          validateReferenceField(form.id, 'comentario_referencia', form.comentario_referencia, form)
        }
        
        // Verificar directamente si los campos obligatorios están completos
        // Nota: relacion_postulante_referencia no es obligatorio según la BD
        if (!form.nombre_referencia?.trim() || 
            !form.cargo_referencia?.trim() || 
            !form.empresa_referencia?.trim() ||
            (form.nombre_referencia?.trim() && form.nombre_referencia.trim().length > 100) ||
            (form.cargo_referencia?.trim() && form.cargo_referencia.trim().length > 100) ||
            (form.empresa_referencia?.trim() && form.empresa_referencia.trim().length > 100) ||
            (form.relacion_postulante_referencia?.trim() && form.relacion_postulante_referencia.trim().length > 300)) {
          hasErrors = true
        }
      }
    })

    if (hasErrors) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    // Filtrar solo formularios con al menos un campo obligatorio completado
    // Nota: relacion_postulante_referencia no es obligatorio según la BD
    // Excluir formularios marcados para eliminación
    const validForms = referenceForms.filter(form => 
      !form.markedForDeletion && (
        form.nombre_referencia?.trim() || 
        form.cargo_referencia?.trim() || 
        form.empresa_referencia?.trim()
      )
    )

    if (validForms.length === 0) {
      toast({
        title: "Error",
        description: "Debe completar al menos un formulario de referencia",
        variant: "destructive",
      })
      return
    }

    setIsSavingReference(true)

    try {
      // Primero, eliminar las referencias marcadas para eliminación
      const referencesToDelete = referenceForms.filter(form => form.markedForDeletion && form.referenceId)
      for (const form of referencesToDelete) {
        if (form.referenceId) {
          const response = await referenciaLaboralService.delete(Number(form.referenceId))
          if (!response.success) {
            throw new Error(response.message || 'Error al eliminar la referencia')
          }
        }
      }

      // Filtrar las referencias marcadas para eliminación antes de procesar
      const formsToProcess = validForms.filter(form => !form.markedForDeletion)

      // Procesar todas las referencias válidas (actualizar existentes o crear nuevas)
      for (const form of formsToProcess) {
        const referenceData = {
          nombre_referencia: form.nombre_referencia,
          cargo_referencia: form.cargo_referencia,
          empresa_referencia: form.empresa_referencia,
          telefono_referencia: form.telefono_referencia || "",
          email_referencia: form.email_referencia || "",
          relacion_postulante_referencia: form.relacion_postulante_referencia,
          comentario_referencia: form.comentario_referencia || undefined,
        }
        
        if (form.referenceId) {
          // Actualizar referencia existente
          const response = await referenciaLaboralService.update(Number(form.referenceId), referenceData)
          if (!response.success) {
            throw new Error(response.message || 'Error al actualizar la referencia')
          }
        } else {
          // Crear nueva referencia
          const response = await referenciaLaboralService.create({
            ...referenceData,
            id_candidato: Number(selectedCandidate.id),
          })
          if (!response.success) {
            throw new Error(response.message || 'Error al guardar la referencia')
          }
        }
      }

      // Recargar las referencias del candidato
      await loadReferencesForCandidate(Number(selectedCandidate.id))
      
      // Recargar el diálogo con las referencias actualizadas (sin agregar formulario vacío)
      const updatedResponse = await referenciaLaboralService.getByCandidato(Number(selectedCandidate.id))
      
      if (updatedResponse.success && updatedResponse.data && updatedResponse.data.length > 0) {
        // Convertir referencias existentes en formularios editables
        const existingForms = updatedResponse.data.map((ref: any) => {
          // El ID puede venir como 'id' o 'id_referencia_laboral' dependiendo de cómo Sequelize lo devuelva
          const referenceId = ref.id_referencia_laboral || ref.id
          return {
            id: `ref_${referenceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            referenceId: String(referenceId), // ID de la BD (convertir a string para consistencia)
            nombre_referencia: ref.nombre_referencia || "",
            cargo_referencia: ref.cargo_referencia || "",
            relacion_postulante_referencia: ref.relacion_postulante_referencia || "",
            empresa_referencia: ref.empresa_referencia || "",
            telefono_referencia: ref.telefono_referencia || "",
            email_referencia: ref.email_referencia || "",
            comentario_referencia: ref.comentario_referencia || "",
          }
        })
        
        setReferenceForms(existingForms)
      } else {
        // Si no hay referencias, inicializar con un formulario vacío
        setReferenceForms([{
          id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre_referencia: "",
          cargo_referencia: "",
          relacion_postulante_referencia: "",
          empresa_referencia: "",
          telefono_referencia: "",
          email_referencia: "",
          comentario_referencia: "",
        }])
      }
      
      setHasAttemptedSubmitReference(false)
      clearAllErrors()

      const savedCount = formsToProcess.length
      const deletedCount = referencesToDelete.length
      let description = ""
      if (savedCount > 0 && deletedCount > 0) {
        description = `Se han guardado ${savedCount} referencia(s) y eliminado ${deletedCount} referencia(s) exitosamente.`
      } else if (savedCount > 0) {
        description = `Se han guardado ${savedCount} referencia(s) laboral(es) exitosamente.`
      } else if (deletedCount > 0) {
        description = `Se han eliminado ${deletedCount} referencia(s) exitosamente.`
      } else {
        description = "No se realizaron cambios."
      }

      toast({
        title: "Referencias guardadas",
        description,
      })
    } catch (error) {
      console.error('Error al guardar referencias:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar las referencias",
        variant: "destructive",
      })
    } finally {
      setIsSavingReference(false)
    }
  }

  const handleDeleteReference = (candidateId: string, referenceId: string) => {
    // Si estamos en el diálogo de referencias, marcar para eliminación
    if (showReferencesDialog && selectedCandidate?.id === candidateId) {
      // Marcar la referencia para eliminación (no eliminar inmediatamente)
      setReferenceForms(forms => 
        forms.map(form => 
          form.referenceId === referenceId 
            ? { ...form, markedForDeletion: true }
            : form
        )
      )
    } else {
      // Si no estamos en el diálogo, usar el flujo de confirmación
      const reference = workReferences[candidateId]?.find(r => r.id === referenceId)
      setDeleteConfirm({
        type: 'reference',
        candidateId,
        referenceId,
        referenceName: reference?.nombre_referencia || 'esta referencia'
      })
    }
  }

  const confirmDeleteReference = async () => {
    if (!deleteConfirm.candidateId || !deleteConfirm.referenceId) return

    try {
      const response = await referenciaLaboralService.delete(Number(deleteConfirm.referenceId))
      
      if (response.success) {
        // Recargar las referencias del candidato
        await loadReferencesForCandidate(Number(deleteConfirm.candidateId))
        
        // Limpiar confirmación
        setDeleteConfirm({ type: null })
        
        toast({
          title: "Referencia eliminada",
          description: "La referencia laboral se ha eliminado exitosamente.",
        })
      } else {
        throw new Error(response.message || 'Error al eliminar la referencia')
      }
    } catch (error) {
      console.error('Error al eliminar referencia:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la referencia",
        variant: "destructive",
      })
    }
  }

  // Función para avanzar candidatos al módulo 5
  const handleAdvanceToModule5 = async () => {
    if (candidatesWithRealizedInterview.length === 0) {
      toast({
        title: "Error",
        description: "No hay candidatos con entrevista realizada para avanzar",
        variant: "destructive",
      })
      return
    }

    setIsAdvancingToModule5(true)
    try {
      // Primero, actualizar la etapa de la solicitud al módulo 5
      try {
        const etapaResponse = await solicitudService.avanzarAModulo5(Number(process.id))
        if (!etapaResponse.success) {
          console.warn('Advertencia: No se pudo actualizar la etapa de la solicitud:', etapaResponse.message)
        }
      } catch (error) {
        console.error('Error al actualizar etapa de solicitud:', error)
        // Continuar aunque falle la actualización de etapa, ya que los candidatos pueden avanzar
      }

      // Avanzar cada candidato con entrevista realizada
      const promises = candidatesWithRealizedInterview.map(async (candidate) => {
        try {
          const response = await estadoClienteM5Service.avanzarAlModulo5(
            Number(candidate.id_postulacion)
          )
          
          if (!response.success) {
            throw new Error(response.message || 'Error al cambiar estado')
          }
          
          return { candidate, success: true }
        } catch (error) {
          console.error(`Error al avanzar candidato ${candidate.id}:`, error)
          return { candidate, success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
        }
      })

      const results = await Promise.all(promises)
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (successful.length > 0) {
        toast({
          title: "Candidatos avanzados",
          description: `${successful.length} candidato(s) avanzado(s) al módulo 5 exitosamente`,
        })
        
        // Navegar automáticamente al módulo 5 después de 2 segundos
        setTimeout(() => {
          window.location.href = `/consultor/proceso/${process.id}?tab=modulo-5`
        }, 2000)
      }

      if (failed.length > 0) {
        toast({
          title: "Algunos candidatos no pudieron avanzar",
          description: `${failed.length} candidato(s) no pudieron avanzar: ${failed.map(f => f.error).join(', ')}`,
          variant: "destructive",
        })
        setIsAdvancingToModule5(false)
      }

      // Actualizar estado local para reflejar los cambios
      setCandidatesWithRealizedInterview([])
      setCanAdvanceToModule5(false)
      
      // Recargar candidatos para obtener datos actualizados
      const updatedCandidates = await getCandidatesByProcess(process.id)
      if (Array.isArray(updatedCandidates)) {
        setCandidates(updatedCandidates)
      }

    } catch (error) {
      console.error('Error al avanzar candidatos al módulo 5:', error)
      toast({
        title: "Error",
        description: "Error al avanzar candidatos al módulo 5",
        variant: "destructive",
      })
      setIsAdvancingToModule5(false)
    }
  }

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Módulo 4 - Evaluación Psicolaboral</h2>
          <p className="text-muted-foreground">
            {isEvaluationProcess
              ? "Gestiona las evaluaciones psicológicas de los candidatos"
              : "Realiza evaluaciones psicolaborales a candidatos aprobados por el cliente"}
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
        <h2 className="text-2xl font-bold mb-2">Módulo 4 - Evaluación Psicolaboral</h2>
        <p className="text-muted-foreground">
          {isEvaluationProcess
            ? "Gestiona las evaluaciones psicológicas de los candidatos"
            : "Realiza evaluaciones psicolaborales a candidatos aprobados por el cliente"}
        </p>
      </div>

      {/* Componente de bloqueo si el proceso está en estado final */}
      <ProcessBlocked 
        processStatus={processStatus} 
        moduleName="Módulo 4" 
      />

      {/* Finalizar Solicitud - Solo para ES y TS */}
      {isEvaluationProcess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalizar Solicitud
            </CardTitle>
            <CardDescription>
              Una vez que hayas finalizado la evaluación de candidatos, puedes cerrar la solicitud
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
                variant="default"
                className="hover:opacity-90 hover:scale-105 transition-all duration-200"
                onClick={() => setShowStatusChange(!showStatusChange)}
                disabled={loadingEstados || isBlocked}
              >
                {loadingEstados ? "Cargando..." : "Finalizar Solicitud"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Header for Evaluation Processes */}
      {isEvaluationProcess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información del Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="font-semibold">{process.client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                <p className="font-semibold">{process.position_title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <Badge variant="outline">
                  {process.service_type === "ES" ? "Evaluación Psicolaboral" : "Test Psicolaboral"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEvaluationProcess ? "Candidatos para Evaluación" : "Candidatos Aprobados para Evaluación"}
          </CardTitle>
          <CardDescription>
            {isEvaluationProcess
              ? "Programa y registra evaluaciones psicológicas"
              : "Candidatos que pasaron la presentación al cliente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length > 0 ? (
            <div className="space-y-6">
              {/* Botón para avanzar al Módulo 5 */}
              {!isEvaluationProcess && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Avanzar al Módulo 5</h3>
                      <p className="text-sm text-blue-700">
                        Los candidatos con estado de informe definido pueden avanzar al módulo de feedback del cliente
                      </p>
                      {candidatesWithRealizedInterview.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {candidatesWithRealizedInterview.length} candidato(s) listo(s) para avanzar
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handleAdvanceToModule5}
                      disabled={!canAdvanceToModule5 || isAdvancingToModule5}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {isAdvancingToModule5 ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Avanzando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Avanzar al Módulo 5
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {candidates.map((candidate) => {
                const evaluation = evaluations[candidate.id]
                const candidateReferences = workReferences[candidate.id] || []
                const candidateReport = candidateReports[candidate.id]
                const candidateInterview = candidateInterviews[candidate.id]
                const candidateTestsList = candidateTests[candidate.id] || []
                return (
                  <Card key={candidate.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {/* Candidate Basic Info - Always Visible */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-2">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground">RUT: {candidate.rut || "No especificado"}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {candidateReport?.report_status && (
                              <Badge
                                variant={
                                  candidateReport.report_status === "recomendable"
                                    ? "outline"
                                    : candidateReport.report_status === "no_recomendable"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className={
                                  candidateReport.report_status === "recomendable"
                                    ? "text-xs bg-green-100 text-green-800 border-green-300"
                                    : "text-xs"
                                }
                              >
                                {candidateReport.report_status === "recomendable" && "✓ Recomendable"}
                                {candidateReport.report_status === "no_recomendable" && "✗ No Recomendable"}
                                {candidateReport.report_status === "recomendable_con_observaciones" &&
                                  "⚠ Recomendable con Observaciones"}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">Fecha Entrevista</p>
                              {candidateInterview?.interview_date ? (
                                <div className="text-xs text-muted-foreground">
                                  <p className="font-medium">{new Date(candidateInterview.interview_date).toLocaleDateString('es-CL', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                  })}</p>
                                  <p className="text-xs opacity-75">{new Date(candidateInterview.interview_date).toLocaleTimeString('es-CL', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No programada</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Estado Entrevista</p>
                              <Badge
                                variant={
                                  candidateInterview?.interview_status === "Realizada"
                                    ? "default"
                                    : candidateInterview?.interview_status === "Programada"
                                      ? "secondary"
                                      : candidateInterview?.interview_status === "Cancelada"
                                        ? "destructive"
                                        : "outline"
                                }
                                className="text-xs"
                              >
                                {candidateInterview?.interview_status === "Programada" && "Programada"}
                                {candidateInterview?.interview_status === "Realizada" && "Realizada"}
                                {candidateInterview?.interview_status === "Cancelada" && "Cancelada"}
                                {(!candidateInterview?.interview_status || candidateInterview?.interview_status === "Sin programar") && "Sin programar"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Estado Informe</p>
                              {candidateReport?.report_status ? (
                                <Badge
                                  variant={
                                    candidateReport.report_status === "recomendable"
                                      ? "outline"
                                      : candidateReport.report_status === "no_recomendable"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className={
                                    candidateReport.report_status === "recomendable"
                                      ? "text-xs bg-green-100 text-green-800 border-green-300"
                                      : "text-xs"
                                  }
                                >
                                  {candidateReport.report_status === "recomendable" && "Recomendable"}
                                  {candidateReport.report_status === "no_recomendable" && "No Recomendable"}
                                  {candidateReport.report_status === "recomendable_con_observaciones" &&
                                    "Con Observaciones"}
                                </Badge>
                              ) : (
                                <p className="text-sm text-muted-foreground">Pendiente</p>
                              )}
                            </div>
                          </div>


                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Tests</p>
                              <p className="text-sm text-muted-foreground">{candidateTestsList.length} realizados</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Referencias</p>
                              <p className="text-sm text-muted-foreground">{candidateReferences.length} laborales</p>
                            </div>
                          </div>
                        </div>

                        {/* Acordeón para información detallada */}
                        <Collapsible>
                          <CollapsibleTrigger
                            className="flex items-center gap-2 text-sm font-medium hover:text-primary p-2 hover:bg-muted/50 rounded-md transition-colors w-full"
                            onClick={() =>
                              setExpandedCandidate(
                                expandedCandidate === `${candidate.id}-details`
                                  ? null
                                  : `${candidate.id}-details`
                              )
                            }
                          >
                            {expandedCandidate === `${candidate.id}-details` ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            Ver información detallada
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4 space-y-6">
                        {candidateReport && (candidateReport.report_status || candidateReport.report_sent_date) && (
                          <div className="bg-muted/20 rounded-lg p-4 border-l-4 border-l-primary">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Información del Informe
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {candidateReport.report_status && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                  <Badge
                                    variant={
                                      candidateReport.report_status === "recomendable"
                                        ? "outline"
                                        : candidateReport.report_status === "no_recomendable"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                    className={
                                      candidateReport.report_status === "recomendable"
                                        ? "mt-1 bg-green-100 text-green-800 border-green-300"
                                        : "mt-1"
                                    }
                                  >
                                    {candidateReport.report_status === "recomendable" && "✓ Recomendable"}
                                    {candidateReport.report_status === "no_recomendable" && "✗ No Recomendable"}
                                    {candidateReport.report_status === "recomendable_con_observaciones" &&
                                      "⚠ Recomendable con Observaciones"}
                                  </Badge>
                                </div>
                              )}
                              {candidateReport.report_sent_date && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Fecha de Envío</p>
                                  <p className="text-sm font-semibold mt-1 flex items-center gap-1">
                                    <Send className="h-3 w-3" />
                                    {formatDate(candidateReport.report_sent_date)}
                                  </p>
                                </div>
                              )}
                            </div>
                            {candidateReport.report_observations && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  {candidateReport.report_status === "no_recomendable"
                                    ? "Motivos del rechazo"
                                    : "Observaciones"}
                                </p>
                                <p className="text-sm text-muted-foreground bg-background/50 p-2 rounded">
                                  {candidateReport.report_observations}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Referencias Laborales - Dentro de información detallada */}
                        {candidateReferences.length > 0 && (
                          <div className="ml-4 border-l-2 border-muted pl-4">
                          <Collapsible>
                            <CollapsibleTrigger
                              className="flex items-center gap-2 text-sm font-medium hover:text-primary p-2 hover:bg-muted/50 rounded-md transition-colors"
                              onClick={() =>
                                setExpandedCandidate(
                                  expandedCandidate === `${candidate.id}-references`
                                    ? null
                                      : `${candidate.id}-references`
                                )
                              }
                            >
                              {expandedCandidate === `${candidate.id}-references` ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                                <Building className="h-4 w-4" />
                                Referencias Laborales ({candidateReferences.length})
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                {candidateReferences.map((reference, refIndex) => {
                                  const refKey = reference.id ? String(reference.id) : `ref-${candidate.id}-${refIndex}`
                                  return (
                                  <Card key={refKey} className="bg-background">
                                    <CardContent className="pt-4">
                                      <div className="space-y-4">
                                        {/* Información principal - alineada horizontalmente */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre de la referencia</p>
                                            <p className="text-sm font-medium">{reference.nombre_referencia}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relación con el postulante</p>
                                            <p className="text-sm">{reference.relacion_postulante_referencia}</p>
                                          </div>
                                        </div>
                                        
                                        {/* Información secundaria - alineada horizontalmente */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cargo</p>
                                            <p className="text-sm">{reference.cargo_referencia}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Empresa</p>
                                            <p className="text-sm">{reference.empresa_referencia}</p>
                                          </div>
                                        </div>

                                        {/* Campos opcionales - solo si tienen valor */}
                                        {(reference.telefono_referencia || reference.email_referencia) && (
                                          <div className="pt-3 border-t border-muted/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              {reference.telefono_referencia && (
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</p>
                                                  <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-sm">{reference.telefono_referencia}</p>
                                                  </div>
                                                </div>
                                              )}
                                              {reference.email_referencia && (
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                                                  <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-sm">{reference.email_referencia}</p>
                                                  </div>
                                                </div>
                                          )}
                                        </div>
                                      </div>
                                        )}

                                        {/* Comentarios - al final si existen */}
                                        {reference.comentario_referencia && (
                                          <div className="pt-3 border-t border-muted/50">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Comentarios</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {reference.comentario_referencia}
                                          </p>
                                        </div>
                                      )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                  )
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                          </div>
                        )}

                        {/* Tests Realizados - Dentro de información detallada */}
                        {candidateTestsList.length > 0 && (
                          <div className="ml-4 border-l-2 border-muted pl-4">
                          <Collapsible>
                            <CollapsibleTrigger
                              className="flex items-center gap-2 text-sm font-medium hover:text-primary p-2 hover:bg-muted/50 rounded-md transition-colors"
                              onClick={() =>
                                  setExpandedCandidate(
                                    expandedCandidate === `${candidate.id}-tests`
                                      ? null
                                      : `${candidate.id}-tests`
                                  )
                                }
                              >
                                {expandedCandidate === `${candidate.id}-tests` ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                                <FileText className="h-4 w-4" />
                                Tests Realizados ({candidateTestsList.length})
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                {candidateTestsList.map((test, index) => {
                                  const testKey = test.id ? String(test.id) : `test-${candidate.id}-${index}-${test.test_name || 'unknown'}`
                                  return (
                                  <Card key={testKey} className="bg-background">
                                    <CardContent className="pt-4">
                                  <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1 space-y-2">
                                            <div>
                                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre del test</p>
                                              <p className="text-sm font-medium">{test.test_name}</p>
                                        </div>
                                            <div>
                                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resultado</p>
                                              <p className="text-sm">{test.result}</p>
                                      </div>
                                  </div>
                                          <div className="flex gap-2 ml-4">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => openEditTestDialog(candidate, test, index)}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleDeleteTest(candidate, test, index)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                </div>
                                </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  )
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                          </div>
                        )}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Botones de acción - Siempre visibles */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                          <Button onClick={() => openInterviewDialog(candidate)} size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Editar Estado de Entrevista
                          </Button>
                          <Button onClick={() => openTestDialog(candidate)} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Test
                          </Button>
                          <Button variant="outline" onClick={() => openReferencesDialog(candidate)} size="sm">
                            <Building className="mr-2 h-4 w-4" />
                            Agregar Referencias
                          </Button>
                          {(() => {
                            const evaluation = evaluations[candidate.id]
                            const candidateInterview = candidateInterviews[candidate.id]
                            // Verificar en ambas fuentes: evaluations y candidateInterviews
                            const interviewStatus = evaluation?.estado_evaluacion || candidateInterview?.interview_status
                            // Comparar con ambos formatos posibles: "Realizada" (del backend) o "realizada" (del frontend)
                            const isRealized = interviewStatus === "Realizada" || interviewStatus === "realizada"
                            const reportButton = (
                              <Button 
                                variant="outline" 
                                onClick={() => openReportDialog(candidate)} 
                                size="sm"
                                disabled={!isRealized}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Gestionar Estado del Informe
                              </Button>
                            )
                            
                            if (!isRealized) {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    {reportButton}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Solo los candidatos con entrevista realizada pueden gestionar el estado del informe</p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            }
                            
                            return reportButton
                          })()}
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isEvaluationProcess ? "No hay candidatos para evaluar" : "No hay candidatos aprobados"}
              </h3>
              <p className="text-muted-foreground">
                {isEvaluationProcess
                  ? "Los candidatos aparecerán aquí cuando se complete el Módulo 1"
                  : "Primero deben ser aprobados por el cliente en el Módulo 3"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="!max-w-[50vw] !w-[50vw] max-h-[90vh] overflow-y-auto" style={{ maxWidth: '50vw', width: '50vw' }}>
          <DialogHeader>
            <DialogTitle>Editar Estado de Entrevista</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Candidato: <strong>{selectedCandidate.name}</strong>
                  {selectedCandidate.rut && (
                    <>
                      {" "}
                      - RUT: <strong>{selectedCandidate.rut}</strong>
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interview_date">Fecha de Entrevista</Label>
                <Input
                  id="interview_date"
                  type="datetime-local"
                  value={interviewForm.interview_date}
                  onChange={(e) => {
                    setInterviewForm({ ...interviewForm, interview_date: e.target.value })
                    validateField('interview_date', e.target.value, validationSchemas.module4InterviewForm, { ...interviewForm, interview_date: e.target.value })
                  }}
                  max={new Date().toISOString().slice(0, 16)}
                  className={errors.interview_date ? "border-destructive" : ""}
                />
                <ValidationErrorDisplay error={errors.interview_date} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview_status">Estado de la Entrevista</Label>
                <Select
                  value={interviewForm.interview_status}
                  onValueChange={(value: "programada" | "realizada" | "cancelada") =>
                    setInterviewForm({ ...interviewForm, interview_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowInterviewDialog(false)
                clearAllErrors()
              }}
              disabled={isSavingInterview}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveInterview}
              disabled={isSavingInterview}
            >
              {isSavingInterview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSavingInterview ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="!max-w-[50vw] !w-[60vw] max-h-[100vh] overflow-y-auto" style={{ maxWidth: '60vw', width: '60vw' }}>
          <DialogHeader>
            <DialogTitle>Agregar Test</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Candidato: <strong>{selectedCandidate.name}</strong>
                  {selectedCandidate.rut && (
                    <>
                      {" "}
                      - RUT: <strong>{selectedCandidate.rut}</strong>
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lista de Test/Pruebas</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddTest}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Test
                </Button>
              </div>

              {testForm.tests.map((test, index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr] gap-2 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`test_name_${index}`}>Nombre del Test</Label>
                    <Select
                      value={test.test_name}
                      onValueChange={(value) => handleTestChange(index, "test_name", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar test" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTests.map((test) => (
                          <SelectItem key={test.id_test_psicolaboral} value={test.id_test_psicolaboral.toString()}>
                            {test.nombre_test_psicolaboral}
                        </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`test_result_${index}`}>Resultado <span className="text-red-500">*</span></Label>
                    <Textarea
                      id={`test_result_${index}`}
                      value={test.result}
                      onChange={(e) => handleTestChange(index, "result", e.target.value)}
                      placeholder="Ej: Alto dominio en habilidades de liderazgo, muestra capacidad para..."
                      rows={4}
                      maxLength={300}
                      className={`min-h-[100px] ${errors[`test_result_${index}`] ? "border-destructive" : ""}`}
                    />
                    <div className="text-sm text-muted-foreground text-right">
                      {(test.result || "").length}/300 caracteres
                    </div>
                    <ValidationErrorDisplay error={errors[`test_result_${index}`]} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTestDialog(false)
              clearAllErrors()
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTest}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={showEditTestDialog} onOpenChange={setShowEditTestDialog}>
        <DialogContent className="!max-w-[50vw] !w-[65vw] max-h-[100vh] overflow-y-auto" style={{ maxWidth: '60vw', width: '60vw' }}>
          <DialogHeader>
            <DialogTitle>Editar Test</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Candidato: <strong>{selectedCandidate.name}</strong>
                  {selectedCandidate.rut && (
                    <>
                      {" "}
                      - RUT: <strong>{selectedCandidate.rut}</strong>
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {testForm.tests.map((test, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr] gap-2 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor={`edit_test_name_${index}`}>Nombre del Test</Label>
                  <Select
                    value={test.test_name}
                    onValueChange={(value) => handleTestChange(index, "test_name", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar test" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTests.map((test) => (
                        <SelectItem key={test.id_test_psicolaboral} value={test.id_test_psicolaboral.toString()}>
                          {test.nombre_test_psicolaboral}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_test_result_${index}`}>Resultado <span className="text-red-500">*</span></Label>
                  <Textarea
                    id={`edit_test_result_${index}`}
                    value={test.result}
                    onChange={(e) => handleTestChange(index, "result", e.target.value)}
                    placeholder="Ingresa el resultado del test"
                    rows={4}
                    maxLength={300}
                    className={`min-h-[100px] ${errors[`test_result_${index}`] ? "border-destructive" : ""}`}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {(test.result || "").length}/300 caracteres
                  </div>
                  <ValidationErrorDisplay error={errors[`test_result_${index}`]} />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditTestDialog(false)
              clearAllErrors()
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditTest}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReferencesDialog} onOpenChange={(open) => {
        setShowReferencesDialog(open)
        if (!open) {
          clearAllErrors()
          setHasAttemptedSubmitReference(false)
          // Limpiar las marcas de eliminación al cerrar sin guardar
          setReferenceForms(forms => 
            forms.map(form => ({ ...form, markedForDeletion: false }))
          )
        }
      }}>
        <DialogContent className="!max-w-[60vw] !w-[690vw] max-h-[95vh] overflow-y-auto" style={{ maxWidth: '70vw', width: '70vw' }}>
          <DialogHeader>
            <DialogTitle>Referencias Laborales</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Gestiona las referencias laborales de: <strong>{selectedCandidate.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Reference Forms */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Agregar Referencias Laborales</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addReferenceForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Otra Referencia
                </Button>
              </div>

              {referenceForms.map((form, index) => {
                const hasFormFields = !!(
                  form.nombre_referencia?.trim() || 
                  form.cargo_referencia?.trim() || 
                  form.empresa_referencia?.trim() ||
                  form.relacion_postulante_referencia?.trim() ||
                  form.telefono_referencia?.trim() ||
                  form.email_referencia?.trim() ||
                  form.comentario_referencia?.trim()
                )
                const isExistingReference = !!form.referenceId
                
                // Lógica para mostrar el botón de descartar/eliminar:
                // - Si es una referencia existente: siempre mostrar (se puede eliminar)
                // - Si es una nueva referencia: mostrar si tiene campos completados O si hay más de un formulario
                const showDiscardButton = isExistingReference 
                  ? true 
                  : (hasFormFields || referenceForms.length > 1)
                
                const isMarkedForDeletion = form.markedForDeletion === true
                
                return (
                  <Card key={form.id} className={`${isExistingReference ? "border-l-4 border-l-blue-500" : ""} ${isMarkedForDeletion ? "opacity-50 bg-gray-100" : ""}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {isMarkedForDeletion ? (
                            <span className="text-destructive line-through">
                              {isExistingReference ? `Referencia ${referenceForms.filter(f => f.referenceId).indexOf(form) + 1} (Existente) - Se eliminará al guardar` : `Nueva Referencia ${referenceForms.filter(f => !f.referenceId).indexOf(form) + 1} - Se eliminará al guardar`}
                            </span>
                          ) : (
                            <>
                              {isExistingReference ? `Referencia ${referenceForms.filter(f => f.referenceId).indexOf(form) + 1} (Existente)` : `Nueva Referencia ${referenceForms.filter(f => !f.referenceId).indexOf(form) + 1}`}
                            </>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {isMarkedForDeletion ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Deshacer la eliminación
                                setReferenceForms(forms => 
                                  forms.map(f => 
                                    f.id === form.id 
                                      ? { ...f, markedForDeletion: false }
                                      : f
                                  )
                                )
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Deshacer
                            </Button>
                          ) : showDiscardButton ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (isExistingReference && form.referenceId) {
                                  // Si es una referencia existente, marcarla para eliminación
                                  handleDeleteReference(selectedCandidate?.id || "", form.referenceId)
                                } else {
                                  // Si es una nueva referencia, solo remover el formulario
                                  handleDiscardSingleReference(form.id)
                                }
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isExistingReference ? "Eliminar" : "Descartar"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className={`space-y-4 ${isMarkedForDeletion ? "pointer-events-none" : ""}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`reference_${form.id}_nombre_referencia`}>
                            Nombre de la Referencia <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`reference_${form.id}_nombre_referencia`}
                            value={form.nombre_referencia}
                            onChange={(e) => updateReferenceForm(form.id, "nombre_referencia", e.target.value)}
                            placeholder="Nombre completo de la referencia"
                            maxLength={100}
                            className={errors[`reference_${form.id}_nombre_referencia`] ? "border-destructive" : ""}
                          />
                          <ValidationErrorDisplay error={errors[`reference_${form.id}_nombre_referencia`]} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`reference_${form.id}_cargo_referencia`}>
                            Cargo de la Referencia <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`reference_${form.id}_cargo_referencia`}
                            value={form.cargo_referencia}
                            onChange={(e) => updateReferenceForm(form.id, "cargo_referencia", e.target.value)}
                            placeholder="Cargo que ocupa la referencia"
                            maxLength={100}
                            className={errors[`reference_${form.id}_cargo_referencia`] ? "border-destructive" : ""}
                          />
                          <ValidationErrorDisplay error={errors[`reference_${form.id}_cargo_referencia`]} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`reference_${form.id}_relacion_postulante_referencia`}>
                            Relación con el Postulante (Opcional)
                          </Label>
                          <Input
                            id={`reference_${form.id}_relacion_postulante_referencia`}
                            value={form.relacion_postulante_referencia}
                            onChange={(e) => updateReferenceForm(form.id, "relacion_postulante_referencia", e.target.value)}
                            placeholder="Ej: Jefe directo, compañero de trabajo, etc."
                            maxLength={300}
                            className={errors[`reference_${form.id}_relacion_postulante_referencia`] ? "border-destructive" : ""}
                          />
                          <ValidationErrorDisplay error={errors[`reference_${form.id}_relacion_postulante_referencia`]} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`reference_${form.id}_empresa_referencia`}>
                            Empresa <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`reference_${form.id}_empresa_referencia`}
                            value={form.empresa_referencia}
                            onChange={(e) => updateReferenceForm(form.id, "empresa_referencia", e.target.value)}
                            placeholder="Nombre de la empresa"
                            maxLength={100}
                            className={errors[`reference_${form.id}_empresa_referencia`] ? "border-destructive" : ""}
                          />
                          <ValidationErrorDisplay error={errors[`reference_${form.id}_empresa_referencia`]} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`reference_${form.id}_telefono_referencia`}>Teléfono (Opcional)</Label>
                          <Input
                            id={`reference_${form.id}_telefono_referencia`}
                            value={form.telefono_referencia}
                            onChange={(e) => updateReferenceForm(form.id, "telefono_referencia", e.target.value)}
                            placeholder="+56 9 1234 5678"
                            maxLength={12}
                            className={errors[`reference_${form.id}_telefono_referencia`] ? "border-destructive" : ""}
                          />
                          <ValidationErrorDisplay error={errors[`reference_${form.id}_telefono_referencia`]} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`reference_${form.id}_email_referencia`}>Email (Opcional)</Label>
                          <Input
                            id={`reference_${form.id}_email_referencia`}
                            type="email"
                            value={form.email_referencia}
                            onChange={(e) => updateReferenceForm(form.id, "email_referencia", e.target.value)}
                            placeholder="referencia@empresa.com"
                            maxLength={256}
                            className={errors[`reference_${form.id}_email_referencia`] ? "border-destructive" : ""}
                          />
                          <ValidationErrorDisplay error={errors[`reference_${form.id}_email_referencia`]} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`reference_${form.id}_comentario_referencia`}>Comentarios Adicionales (Opcional)</Label>
                        <Textarea
                          id={`reference_${form.id}_comentario_referencia`}
                          value={form.comentario_referencia}
                          onChange={(e) => updateReferenceForm(form.id, "comentario_referencia", e.target.value)}
                          placeholder="Observaciones, comentarios o información adicional sobre la referencia"
                          rows={3}
                          maxLength={800}
                          className={errors[`reference_${form.id}_comentario_referencia`] ? "border-destructive" : ""}
                        />
                        <div className="text-sm text-muted-foreground text-right">
                          {(form.comentario_referencia || "").length}/800 caracteres
                        </div>
                        <ValidationErrorDisplay error={errors[`reference_${form.id}_comentario_referencia`]} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAddReference}
                disabled={isSavingReference}
                className="w-full sm:w-auto"
              >
                {isSavingReference ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Referencias
                  </>
                )}
              </Button>
            </div>

          </div>

          <DialogFooter>
            <Button onClick={() => setShowReferencesDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={(open) => {
        setShowReportDialog(open)
        if (!open) {
          setReportSentDateError("")
        }
      }}>
        <DialogContent className="!max-w-[50vw] !w-[50vw] max-h-[90vh] overflow-y-auto" style={{ maxWidth: '50vw', width: '50vw' }}>
          <DialogHeader>
            <DialogTitle>Estado del Informe</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Gestiona el estado del informe para: <strong>{selectedCandidate.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report_status">Estado del Informe</Label>
                <Select
                  value={reportForm.report_status}
                  onValueChange={(value: "recomendable" | "no_recomendable" | "recomendable_con_observaciones") =>
                    setReportForm({ ...reportForm, report_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado del informe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recomendable">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Recomendable
                      </div>
                    </SelectItem>
                    <SelectItem value="no_recomendable">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        No Recomendable
                      </div>
                    </SelectItem>
                    <SelectItem value="recomendable_con_observaciones">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Recomendable con Observaciones
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_sent_date">
                  Fecha de Envío del Informe al Cliente
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="report_sent_date"
                  type="date"
                  value={reportForm.report_sent_date}
                  onChange={(e) => {
                    setReportForm({ ...reportForm, report_sent_date: e.target.value })
                    // Limpiar error cuando el usuario empiece a ingresar la fecha
                    if (reportSentDateError) setReportSentDateError("")
                  }}
                />
                {reportSentDateError && (
                  <p className="text-destructive text-sm">{reportSentDateError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_observations">Conclusión Global del Informe</Label>
                <Textarea
                  id="report_observations"
                  value={reportForm.report_observations}
                  onChange={(e) => setReportForm({ ...reportForm, report_observations: e.target.value })}
                  placeholder="Ingrese su conclusión sobre el informe..."
                  rows={6}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Describe la evaluación completa del candidato.
                </p>
                      </div>

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveReport} 
              disabled={!reportForm.report_status}
            >
              Guardar Estado del Informe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteConfirm.type !== null} onOpenChange={cancelDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              {deleteConfirm.type === 'test' && (
                <>¿Estás seguro de que quieres eliminar el test <strong>"{deleteConfirm.testName}"</strong>?</>
              )}
              {deleteConfirm.type === 'reference' && (
                <>¿Estás seguro de que quieres eliminar la referencia de <strong>"{deleteConfirm.referenceName}"</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelDelete}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteConfirm.type === 'test' ? confirmDeleteTest : confirmDeleteReference}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para finalizar solicitud (solo ES y TS) */}
      {isEvaluationProcess && (
        <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Solicitud</DialogTitle>
              <DialogDescription>
                Selecciona el estado final del proceso y proporciona una razón si es necesario.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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
                <Label htmlFor="reason">{getReasonLabel()}</Label>
                <Textarea
                  id="reason"
                  placeholder={getReasonPlaceholder()}
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
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
                onClick={() => handleStatusChange(selectedEstado)}
                disabled={!selectedEstado}
              >
                Actualizar Estado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
