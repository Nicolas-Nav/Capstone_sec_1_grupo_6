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
import { getCandidatesByProcess, getPsychologicalEvaluationByCandidate } from "@/lib/mock-data"
import { formatDate, isProcessBlocked } from "@/lib/utils"
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
  Trash2,
  Upload,
  Send,
  AlertCircle,
} from "lucide-react"
import type { Process, Candidate } from "@/lib/types"
import { ProcessBlocked } from "./ProcessBlocked"

interface WorkReference {
  id: string
  candidate_id: string
  reference_name: string
  reference_position: string
  direct_supervisor: string
  company: string
  phone?: string
  email?: string
  notes?: string
}

interface CandidateReport {
  candidate_id: string
  report_status: "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | null
  report_observations?: string
  report_sent_date?: string
  psychological_report_file?: File | null
}

interface ProcessModule4Props {
  process: Process
}

export function ProcessModule4({ process }: ProcessModule4Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estado del proceso para verificar bloqueo
  const [processStatus, setProcessStatus] = useState<string>((process.estado_solicitud || process.status) as string)
  
  // Verificar si el proceso está bloqueado (estado final)
  const isBlocked = isProcessBlocked(processStatus)

  // Cargar datos reales desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const allCandidates = await getCandidatesByProcess(process.id)
        if (process.service_type === "evaluacion_psicolaboral" || process.service_type === "test_psicolaboral") {
          setCandidates(allCandidates)
        } else {
          const filteredCandidates = allCandidates.filter((c: Candidate) => c.client_response === "aprobado")
          setCandidates(filteredCandidates)
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
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false)
  const [showReferencesDialog, setShowReferencesDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [candidateConclusions, setCandidateConclusions] = useState<{ [key: string]: string }>({})

  const [candidateReports, setCandidateReports] = useState<{ [candidateId: string]: CandidateReport }>({})

  const [workReferences, setWorkReferences] = useState<{ [candidateId: string]: WorkReference[] }>({})
  const [newReference, setNewReference] = useState({
    reference_name: "",
    reference_position: "",
    direct_supervisor: "",
    company: "",
    phone: "",
    email: "",
    notes: "",
  })

  const [evaluationForm, setEvaluationForm] = useState({
    interview_date: "",
    interview_status: "programada" as "programada" | "realizada" | "cancelada",
    report_due_date: "",
    tests: [{ test_name: "", result: "" }],
  })

  const [reportForm, setReportForm] = useState({
    report_status: "" as "recomendable" | "no_recomendable" | "recomendable_con_observaciones" | "",
    report_observations: "",
    report_sent_date: "",
    psychological_report_file: null as File | null,
  })

  const handleAddTest = () => {
    setEvaluationForm({
      ...evaluationForm,
      tests: [...evaluationForm.tests, { test_name: "", result: "" }],
    })
  }

  const handleTestChange = (index: number, field: "test_name" | "result", value: string) => {
    const updatedTests = evaluationForm.tests.map((test, i) => (i === index ? { ...test, [field]: value } : test))
    setEvaluationForm({ ...evaluationForm, tests: updatedTests })
  }

  const handleSaveEvaluation = () => {
    console.log("Saving evaluation for candidate:", selectedCandidate?.id, evaluationForm)
    setShowEvaluationDialog(false)
    setEvaluationForm({
      interview_date: "",
      interview_status: "programada",
      report_due_date: "",
      tests: [{ test_name: "", result: "" }],
    })
    setSelectedCandidate(null)
  }

  const openEvaluationDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowEvaluationDialog(true)
  }

  const openReferencesDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowReferencesDialog(true)
  }

  const openReportDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    const existingReport = candidateReports[candidate.id]
    if (existingReport) {
      setReportForm({
        report_status: existingReport.report_status || "",
        report_observations: existingReport.report_observations || "",
        report_sent_date: existingReport.report_sent_date || "",
        psychological_report_file: existingReport.psychological_report_file || null,
      })
    }
    setShowReportDialog(true)
  }

  const handleSaveReport = () => {
    if (!selectedCandidate) return

    setCandidateReports({
      ...candidateReports,
      [selectedCandidate.id]: {
        candidate_id: selectedCandidate.id,
        report_status: reportForm.report_status as
          | "recomendable"
          | "no_recomendable"
          | "recomendable_con_observaciones",
        report_observations: reportForm.report_observations,
        report_sent_date: reportForm.report_sent_date,
        psychological_report_file: reportForm.psychological_report_file,
      },
    })

    setShowReportDialog(false)
    setReportForm({
      report_status: "",
      report_observations: "",
      report_sent_date: "",
      psychological_report_file: null,
    })
    setSelectedCandidate(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReportForm({ ...reportForm, psychological_report_file: file })
    }
  }

  const handleAddReference = () => {
    if (!selectedCandidate) return

    const reference: WorkReference = {
      id: Date.now().toString(),
      candidate_id: selectedCandidate.id,
      ...newReference,
    }

    const candidateReferences = workReferences[selectedCandidate.id] || []
    setWorkReferences({
      ...workReferences,
      [selectedCandidate.id]: [...candidateReferences, reference],
    })

    setNewReference({
      reference_name: "",
      reference_position: "",
      direct_supervisor: "",
      company: "",
      phone: "",
      email: "",
      notes: "",
    })
  }

  const handleDeleteReference = (candidateId: string, referenceId: string) => {
    const candidateReferences = workReferences[candidateId] || []
    setWorkReferences({
      ...workReferences,
      [candidateId]: candidateReferences.filter((ref) => ref.id !== referenceId),
    })
  }

  const isEvaluationProcess =
    process.service_type === "evaluacion_psicolaboral" || process.service_type === "test_psicolaboral"

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
                  {process.service_type === "evaluacion_psicolaboral" ? "Evaluación Psicolaboral" : "Test Psicolaboral"}
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
              {candidates.map((candidate) => {
                const evaluation = getPsychologicalEvaluationByCandidate(candidate.id)
                const candidateReferences = workReferences[candidate.id] || []
                const candidateReport = candidateReports[candidate.id]
                return (
                  <Card key={candidate.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {/* Candidate Basic Info */}
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
                                    ? "default"
                                    : candidateReport.report_status === "no_recomendable"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {candidateReport.report_status === "recomendable" && "✓ Recomendable"}
                                {candidateReport.report_status === "no_recomendable" && "✗ No Recomendable"}
                                {candidateReport.report_status === "recomendable_con_observaciones" &&
                                  "⚠ Recomendable con Observaciones"}
                              </Badge>
                            )}
                            {candidateReport?.report_sent_date && (
                              <Badge variant="outline" className="text-xs">
                                <Send className="mr-1 h-3 w-3" />
                                Enviado {formatDate(candidateReport.report_sent_date)}
                              </Badge>
                            )}
                            {candidateReport?.psychological_report_file && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="mr-1 h-3 w-3" />
                                Informe adjunto
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Fecha Entrevista</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {evaluation?.interview_date ? formatDate(evaluation.interview_date) : "No programada"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Estado Entrevista</p>
                              <Badge
                                variant={
                                  evaluation?.interview_status === "realizada"
                                    ? "default"
                                    : evaluation?.interview_status === "programada"
                                      ? "secondary"
                                      : evaluation?.interview_status === "cancelada"
                                        ? "destructive"
                                        : "outline"
                                }
                                className="text-xs"
                              >
                                {evaluation?.interview_status === "programada" && "Programada"}
                                {evaluation?.interview_status === "realizada" && "Realizada"}
                                {evaluation?.interview_status === "cancelada" && "Cancelada"}
                                {!evaluation?.interview_status && "Sin programar"}
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
                                      ? "default"
                                      : candidateReport.report_status === "no_recomendable"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {candidateReport.report_status === "recomendable" && "Recomendable"}
                                  {candidateReport.report_status === "no_recomendable" && "No Recomendable"}
                                  {candidateReport.report_status === "recomendable_con_observaciones" &&
                                    "Con Observaciones"}
                                </Badge>
                              ) : (
                                <p className="text-sm text-muted-foreground">Sin definir</p>
                              )}
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
                                        ? "default"
                                        : candidateReport.report_status === "no_recomendable"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                    className="mt-1"
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

                        <div className="flex flex-wrap gap-3">
                          <Button onClick={() => openEvaluationDialog(candidate)} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Tests y Fechas
                          </Button>
                          <Button variant="outline" onClick={() => openReferencesDialog(candidate)} size="sm">
                            <Building className="mr-2 h-4 w-4" />
                            Referencias
                          </Button>
                          <Button variant="outline" onClick={() => openReportDialog(candidate)} size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Estado del Informe
                          </Button>
                        </div>

                        {candidateReferences.length > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger
                              className="flex items-center gap-2 text-sm font-medium hover:text-primary p-2 hover:bg-muted/50 rounded-md transition-colors"
                              onClick={() =>
                                setExpandedCandidate(
                                  expandedCandidate === `${candidate.id}-references`
                                    ? null
                                    : `${candidate.id}-references`,
                                )
                              }
                            >
                              {expandedCandidate === `${candidate.id}-references` ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              Ver Referencias Laborales ({candidateReferences.length})
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                {candidateReferences.map((reference) => (
                                  <Card key={reference.id} className="bg-background">
                                    <CardContent className="pt-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <p className="font-medium">{reference.reference_name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {reference.reference_position}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            <strong>Jefatura:</strong> {reference.direct_supervisor}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">{reference.company}</p>
                                          {reference.phone && (
                                            <p className="text-sm text-muted-foreground">
                                              <Phone className="inline h-3 w-3 mr-1" />
                                              {reference.phone}
                                            </p>
                                          )}
                                          {reference.email && (
                                            <p className="text-sm text-muted-foreground">{reference.email}</p>
                                          )}
                                        </div>
                                      </div>
                                      {reference.notes && (
                                        <div className="mt-2 pt-2 border-t">
                                          <p className="text-sm text-muted-foreground">
                                            <strong>Notas:</strong> {reference.notes}
                                          </p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}

                        {evaluation && evaluation.tests.length > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger
                              className="flex items-center gap-2 text-sm font-medium hover:text-primary p-2 hover:bg-muted/50 rounded-md transition-colors"
                              onClick={() =>
                                setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)
                              }
                            >
                              {expandedCandidate === candidate.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              Ver Tests Aplicados ({evaluation.tests.length})
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                                <div>
                                  <h4 className="font-medium mb-3">Tests Aplicados</h4>
                                  <div className="space-y-3">
                                    {evaluation.tests.map((test, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start justify-between p-4 bg-background rounded-lg border"
                                      >
                                        <div className="flex-1">
                                          <span className="font-medium">{test.test_name}</span>
                                          {test.result && test.result.trim() !== "" && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                              <strong>Resultado:</strong> {test.result}
                                            </p>
                                          )}
                                          {(!test.result || test.result.trim() === "") && (
                                            <p className="text-sm text-muted-foreground mt-2 italic">
                                              Sin resultado registrado
                                            </p>
                                          )}
                                        </div>
                                        <Badge variant="default">Aplicado</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-3">Conclusión del Candidato</h4>
                                  <Textarea
                                    className="min-h-[100px] resize-none"
                                    placeholder="Ingresa una conclusión específica para este candidato..."
                                    defaultValue={candidateConclusions[candidate.id] || ""}
                                    onChange={(e) =>
                                      setCandidateConclusions({
                                        ...candidateConclusions,
                                        [candidate.id]: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
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

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Test y Fecha de Evaluación</DialogTitle>
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
                  value={evaluationForm.interview_date}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, interview_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview_status">Estado de la Entrevista</Label>
                <Select
                  value={evaluationForm.interview_status}
                  onValueChange={(value: "programada" | "realizada" | "cancelada") =>
                    setEvaluationForm({ ...evaluationForm, interview_status: value })
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

            <div className="space-y-2">
              <Label htmlFor="report_due_date">Plazo de Envío del Informe</Label>
              <Input
                id="report_due_date"
                type="date"
                value={evaluationForm.report_due_date}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, report_due_date: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lista de Test/Pruebas</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddTest}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Test
                </Button>
              </div>

              {evaluationForm.tests.map((test, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
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
                        <SelectItem value="Test de Liderazgo">Test de Liderazgo</SelectItem>
                        <SelectItem value="Evaluación de Competencias Comerciales">
                          Evaluación de Competencias Comerciales
                        </SelectItem>
                        <SelectItem value="Test de Análisis Cuantitativo">Test de Análisis Cuantitativo</SelectItem>
                        <SelectItem value="Evaluación de Personalidad 16PF">Evaluación de Personalidad 16PF</SelectItem>
                        <SelectItem value="Test de Inteligencia Emocional">Test de Inteligencia Emocional</SelectItem>
                        <SelectItem value="Evaluación de Competencias Técnicas">
                          Evaluación de Competencias Técnicas
                        </SelectItem>
                        <SelectItem value="Test de Trabajo en Equipo">Test de Trabajo en Equipo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`test_result_${index}`}>Resultado</Label>
                    <Input
                      id={`test_result_${index}`}
                      value={test.result}
                      onChange={(e) => handleTestChange(index, "result", e.target.value)}
                      placeholder="Ej: Alto dominio en habilidades de liderazgo, muestra capacidad para..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvaluationDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvaluation}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReferencesDialog} onOpenChange={setShowReferencesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <CardTitle className="text-lg">Agregar Nueva Referencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference_name">Nombre de la Referencia</Label>
                    <Input
                      id="reference_name"
                      value={newReference.reference_name}
                      onChange={(e) => setNewReference({ ...newReference, reference_name: e.target.value })}
                      placeholder="Nombre completo de la referencia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference_position">Cargo de la Referencia</Label>
                    <Input
                      id="reference_position"
                      value={newReference.reference_position}
                      onChange={(e) => setNewReference({ ...newReference, reference_position: e.target.value })}
                      placeholder="Cargo que ocupa la referencia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="direct_supervisor">Jefatura Directa</Label>
                    <Input
                      id="direct_supervisor"
                      value={newReference.direct_supervisor}
                      onChange={(e) => setNewReference({ ...newReference, direct_supervisor: e.target.value })}
                      placeholder="Nombre del jefe directo de la referencia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={newReference.company}
                      onChange={(e) => setNewReference({ ...newReference, company: e.target.value })}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <Input
                      id="phone"
                      value={newReference.phone}
                      onChange={(e) => setNewReference({ ...newReference, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newReference.email}
                      onChange={(e) => setNewReference({ ...newReference, email: e.target.value })}
                      placeholder="referencia@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={newReference.notes}
                    onChange={(e) => setNewReference({ ...newReference, notes: e.target.value })}
                    placeholder="Observaciones, comentarios o información adicional sobre la referencia"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleAddReference}
                  disabled={
                    !newReference.reference_name ||
                    !newReference.reference_position ||
                    !newReference.direct_supervisor ||
                    !newReference.company
                  }
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Referencia
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
                                  <h4 className="font-semibold text-lg">{reference.reference_name}</h4>
                                  <p className="text-sm text-muted-foreground">{reference.reference_position}</p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Jefatura:</strong> {reference.direct_supervisor}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">{reference.company}</p>
                                  {reference.phone && (
                                    <p className="text-sm text-muted-foreground">
                                      <Phone className="inline h-3 w-3 mr-1" />
                                      {reference.phone}
                                    </p>
                                  )}
                                  {reference.email && (
                                    <p className="text-sm text-muted-foreground">{reference.email}</p>
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
                            {reference.notes && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notas:</strong> {reference.notes}
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

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

              {(reportForm.report_status === "no_recomendable" ||
                reportForm.report_status === "recomendable_con_observaciones") && (
                <div className="space-y-2">
                  <Label htmlFor="report_observations">
                    {reportForm.report_status === "no_recomendable" ? "Motivos del rechazo" : "Observaciones"}
                  </Label>
                  <Textarea
                    id="report_observations"
                    value={reportForm.report_observations}
                    onChange={(e) => setReportForm({ ...reportForm, report_observations: e.target.value })}
                    placeholder={
                      reportForm.report_status === "no_recomendable"
                        ? "Describe los motivos por los cuales no se recomienda al candidato..."
                        : "Describe las observaciones o consideraciones especiales..."
                    }
                    rows={4}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="report_sent_date">Fecha de Envío del Informe al Cliente</Label>
                <Input
                  id="report_sent_date"
                  type="date"
                  value={reportForm.report_sent_date}
                  onChange={(e) => setReportForm({ ...reportForm, report_sent_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="psychological_report">Informe Psicológico</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Adjuntar Informe Psicológico</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX hasta 10MB</p>
                    </div>
                    <Input
                      id="psychological_report"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="mt-4"
                    />
                    {reportForm.psychological_report_file && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium">Archivo seleccionado:</p>
                        <p className="text-sm text-muted-foreground">{reportForm.psychological_report_file.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReport} disabled={!reportForm.report_status}>
              Guardar Estado del Informe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
