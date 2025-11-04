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
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
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
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
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
        setWorkReferences(prev => ({
          ...prev,
          [candidateId]: response.data
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
                testsData[candidate.id] = evaluation.tests.map((test: any) => ({
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

  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  const [showInterviewDialog, setShowInterviewDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showEditTestDialog, setShowEditTestDialog] = useState(false)
  const [showReferencesDialog, setShowReferencesDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
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
    
    setShowInterviewDialog(true)
  }

  const openTestDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Siempre abrir con formulario limpio para agregar nuevo test
    setTestForm({
      tests: [{ test_name: "", result: "" }],
    })
    
    setShowTestDialog(true)
  }

  const handleSaveInterview = async () => {
    if (!selectedCandidate) return
    
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
    }
  }

  const handleSaveTest = async () => {
    if (!selectedCandidate) return
    
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
    } catch (error) {
      console.error('Error al actualizar test:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el test",
        variant: "destructive",
      })
    }
  }

  const openReferencesDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowReferencesDialog(true)
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

    try {
      const response = await referenciaLaboralService.create({
        nombre_referencia: newReference.nombre_referencia,
        cargo_referencia: newReference.cargo_referencia,
        empresa_referencia: newReference.empresa_referencia,
        telefono_referencia: newReference.telefono_referencia,
        email_referencia: newReference.email_referencia,
        id_candidato: Number(selectedCandidate.id),
        relacion_postulante_referencia: newReference.relacion_postulante_referencia,
        comentario_referencia: newReference.comentario_referencia,
      })

      if (response.success) {
        // Recargar las referencias del candidato
        await loadReferencesForCandidate(Number(selectedCandidate.id))
        
        // Limpiar el formulario
    setNewReference({
          nombre_referencia: "",
          cargo_referencia: "",
          relacion_postulante_referencia: "",
          empresa_referencia: "",
          telefono_referencia: "",
          email_referencia: "",
          comentario_referencia: "",
        })

        toast({
          title: "Referencia guardada",
          description: "La referencia laboral se ha guardado exitosamente.",
        })
      } else {
        throw new Error(response.message || 'Error al guardar la referencia')
      }
    } catch (error) {
      console.error('Error al guardar referencia:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la referencia",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReference = (candidateId: string, referenceId: string) => {
    const reference = workReferences[candidateId]?.find(r => r.id === referenceId)
    setDeleteConfirm({
      type: 'reference',
      candidateId,
      referenceId,
      referenceName: reference?.nombre_referencia || 'esta referencia'
    })
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
                      disabled={!canAdvanceToModule5}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Avanzar al Módulo 5
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
                                {candidateReferences.map((reference) => (
                                  <Card key={reference.id} className="bg-background">
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
                                ))}
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
                                {candidateTestsList.map((test, index) => (
                                  <Card key={index} className="bg-background">
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
                                ))}
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
                  onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                />
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
            <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveInterview}>Guardar</Button>
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
                    <Label htmlFor={`test_result_${index}`}>Resultado</Label>
                    <Textarea
                      id={`test_result_${index}`}
                      value={test.result}
                      onChange={(e) => handleTestChange(index, "result", e.target.value)}
                      placeholder="Ej: Alto dominio en habilidades de liderazgo, muestra capacidad para..."
                      rows={4}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
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
                  <Label htmlFor={`edit_test_result_${index}`}>Resultado</Label>
                  <Textarea
                    id={`edit_test_result_${index}`}
                    value={test.result}
                    onChange={(e) => handleTestChange(index, "result", e.target.value)}
                    placeholder="Ingresa el resultado del test"
                    rows={4}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTestDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditTest}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReferencesDialog} onOpenChange={setShowReferencesDialog}>
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
            {/* Add New Reference Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Agregar Nueva Referencia</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    // Agregar nueva referencia vacía
                    setNewReference({
                      nombre_referencia: "",
                      cargo_referencia: "",
                      relacion_postulante_referencia: "",
                      empresa_referencia: "",
                      telefono_referencia: "",
                      email_referencia: "",
                      comentario_referencia: "",
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar otra referencias
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_referencia">Nombre de la Referencia</Label>
                    <Input
                      id="nombre_referencia"
                      value={newReference.nombre_referencia}
                      onChange={(e) => setNewReference({ ...newReference, nombre_referencia: e.target.value })}
                      placeholder="Nombre completo de la referencia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo_referencia">Cargo de la Referencia</Label>
                    <Input
                      id="cargo_referencia"
                      value={newReference.cargo_referencia}
                      onChange={(e) => setNewReference({ ...newReference, cargo_referencia: e.target.value })}
                      placeholder="Cargo que ocupa la referencia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relacion_postulante_referencia">Relación con el Postulante</Label>
                    <Input
                      id="relacion_postulante_referencia"
                      value={newReference.relacion_postulante_referencia}
                      onChange={(e) => setNewReference({ ...newReference, relacion_postulante_referencia: e.target.value })}
                      placeholder="Ej: Jefe directo, compañero de trabajo, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa_referencia">Empresa</Label>
                    <Input
                      id="empresa_referencia"
                      value={newReference.empresa_referencia}
                      onChange={(e) => setNewReference({ ...newReference, empresa_referencia: e.target.value })}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono_referencia">Teléfono (Opcional)</Label>
                    <Input
                      id="telefono_referencia"
                      value={newReference.telefono_referencia}
                      onChange={(e) => setNewReference({ ...newReference, telefono_referencia: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_referencia">Email (Opcional)</Label>
                    <Input
                      id="email_referencia"
                      type="email"
                      value={newReference.email_referencia}
                      onChange={(e) => setNewReference({ ...newReference, email_referencia: e.target.value })}
                      placeholder="referencia@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comentario_referencia">Comentarios Adicionales (Opcional)</Label>
                  <Textarea
                    id="comentario_referencia"
                    value={newReference.comentario_referencia}
                    onChange={(e) => setNewReference({ ...newReference, comentario_referencia: e.target.value })}
                    placeholder="Observaciones, comentarios o información adicional sobre la referencia"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleAddReference}
                  disabled={
                    !newReference.nombre_referencia ||
                    !newReference.cargo_referencia ||
                    !newReference.relacion_postulante_referencia ||
                    !newReference.empresa_referencia
                  }
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Referencia
                </Button>
              </CardContent>
            </Card>

            {/* Existing References List */}
            {selectedCandidate &&
              workReferences[selectedCandidate.id] &&
              workReferences[selectedCandidate.id].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Referencias Registradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workReferences[selectedCandidate.id].map((reference) => (
                        <Card key={reference.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-lg">{reference.nombre_referencia}</h4>
                                  <p className="text-sm text-muted-foreground">{reference.cargo_referencia}</p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Relación:</strong> {reference.relacion_postulante_referencia}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">{reference.empresa_referencia}</p>
                                  {reference.telefono_referencia && (
                                    <p className="text-sm text-muted-foreground">
                                      <Phone className="inline h-3 w-3 mr-1" />
                                      {reference.telefono_referencia}
                                    </p>
                                  )}
                                  {reference.email_referencia && (
                                    <p className="text-sm text-muted-foreground">{reference.email_referencia}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReference(selectedCandidate.id, reference.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {reference.comentario_referencia && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Comentarios:</strong> {reference.comentario_referencia}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
    </div>
  )
}
