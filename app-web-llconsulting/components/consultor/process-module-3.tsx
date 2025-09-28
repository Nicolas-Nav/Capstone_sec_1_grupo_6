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
import { getCandidatesByProcess, candidateStatusLabels } from "@/lib/mock-data"
import { getStatusColor, formatCurrency } from "@/lib/utils"
import { ChevronDown, ChevronRight, ArrowLeft, User, Mail, Phone, DollarSign, Calendar } from "lucide-react"
import type { Process, Candidate } from "@/lib/types"

interface ProcessModule3Props {
  process: Process
}

export function ProcessModule3({ process }: ProcessModule3Props) {
  const [candidates, setCandidates] = useState(
    getCandidatesByProcess(process.id).filter((c) => c.presentation_status === "presentado"),
  )
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

  const handlePresentationDateChange = (candidateId: string, date: string) => {
    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, presentation_date: date } : candidate,
    )
    setCandidates(updatedCandidates)
  }

  const handleClientFeedbackDateChange = (candidateId: string, date: string) => {
    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, client_feedback_date: date } : candidate,
    )
    setCandidates(updatedCandidates)
  }

  const handleClientResponseChange = (
    candidateId: string,
    response: "pendiente" | "aprobado" | "observado" | "rechazado",
  ) => {
    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate) return

    // Validar comentarios si es necesario
    const newValidationErrors = { ...validationErrors }
    if ((response === "observado" || response === "rechazado") && !candidate.client_comments?.trim()) {
      newValidationErrors[candidateId] = `Los comentarios son obligatorios para el estado "${response}"`
    } else {
      // Limpiar error de validación si hay comentarios
      delete newValidationErrors[candidateId]
    }
    setValidationErrors(newValidationErrors)

    // Expandir automáticamente el candidato si se selecciona observado o rechazado
    if (response === "observado" || response === "rechazado") {
      setExpandedCandidate(candidateId)
    }

    const updatedCandidates = candidates.map((candidate) => {
      if (candidate.id === candidateId) {
        let newStatus = candidate.status
        let newPresentationStatus = candidate.presentation_status

        if (response === "rechazado") {
          newStatus = "rechazado"
          newPresentationStatus = "rechazado"
          
          // Sincronizar con Módulo 2 usando localStorage y evento personalizado
          const syncData = {
            candidateId,
            status: "rechazado",
            presentation_status: "rechazado",
            rejection_reason: candidate.client_comments || "Rechazado por el cliente",
            timestamp: Date.now()
          }
          localStorage.setItem(`candidate_sync_${candidateId}`, JSON.stringify(syncData))
          
          // Disparar evento personalizado para sincronización en la misma pestaña
          window.dispatchEvent(new CustomEvent('candidateSync', { detail: syncData }))
          
        } else if (response === "aprobado") {
          newStatus = "aprobado"
        }

        return {
          ...candidate,
          client_response: response,
          status: newStatus as any,
          presentation_status: newPresentationStatus,
        }
      }
      return candidate
    })
    setCandidates(updatedCandidates)

    if (response === "rechazado") {
      console.log(
        `[SYNC] Candidate ${candidate.name} rejected by client - status synchronized with Module 2 as "rechazado"`,
      )
    }
  }

  const handleClientCommentsChange = (candidateId: string, comments: string) => {
    const updatedCandidates = candidates.map((candidate) => {
      if (candidate.id === candidateId) {
        const updatedCandidate = { ...candidate, client_comments: comments }

        if (candidate.client_response === "rechazado" || candidate.client_response === "observado") {
          updatedCandidate.rejection_reason = comments
        }

        return updatedCandidate
      }
      return candidate
    })
    setCandidates(updatedCandidates)

    // Limpiar error de validación si se agregan comentarios
    if (comments.trim()) {
      const newValidationErrors = { ...validationErrors }
      delete newValidationErrors[candidateId]
      setValidationErrors(newValidationErrors)
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

  const allRejected = candidates.every((c) => c.client_response === "rechazado")
  const hasApproved = candidates.some((c) => c.client_response === "aprobado")

  const canAdvanceToModule4 = process.service_type === "proceso_completo" && hasApproved
  const processEndsHere = process.service_type === "long_list"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Módulo 3 - Presentación de Candidatos</h2>
        <p className="text-muted-foreground">
          Registra la presentación de candidatos al cliente y gestiona sus respuestas
        </p>
      </div>

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
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Módulo 2
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {processEndsHere && hasApproved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-green-800 mb-2">Proceso Long List Completado</h3>
              <p className="text-sm text-green-600 mb-4">
                El cliente ha aprobado candidatos. Los candidatos rechazados han sido actualizados en el Módulo 2.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">Finalizar Proceso</Button>
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
              <Button className="bg-blue-600 hover:bg-blue-700">Avanzar a Módulo 4</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates Presentation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos Presentados al Cliente</CardTitle>
          <CardDescription>
            Registra las fechas de envío y respuestas del cliente. Los estados se sincronizan automáticamente con el
            Módulo 2.
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
                            <Input
                              type="date"
                              value={candidate.presentation_date?.split("T")[0] || ""}
                              onChange={(e) => handlePresentationDateChange(candidate.id, e.target.value)}
                              className="w-40"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Select
                              value={candidate.client_response || "pendiente"}
                              onValueChange={(value: "pendiente" | "aprobado" | "observado" | "rechazado") =>
                                handleClientResponseChange(candidate.id, value)
                              }
                            >
                              <SelectTrigger className={`w-32 ${validationErrors[candidate.id] ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Respuesta" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="aprobado">Aprobado</SelectItem>
                                <SelectItem value="observado">Observado</SelectItem>
                                <SelectItem value="rechazado">Rechazado</SelectItem>
                              </SelectContent>
                            </Select>
                            {validationErrors[candidate.id] && (
                              <p className="text-xs text-red-600">{validationErrors[candidate.id]}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              value={candidate.client_feedback_date?.split("T")[0] || ""}
                              onChange={(e) => handleClientFeedbackDateChange(candidate.id, e.target.value)}
                              className="w-40"
                              disabled={!candidate.client_response || candidate.client_response === "pendiente"}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidateStatusLabels[candidate.status as keyof typeof candidateStatusLabels]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expandedCandidate === candidate.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
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
                                        onChange={(e) => handleClientCommentsChange(candidate.id, e.target.value)}
                                        placeholder={
                                          candidate.client_response === "observado"
                                            ? "Ingrese las observaciones del cliente (campo obligatorio)..."
                                            : "Ingrese la razón del rechazo (campo obligatorio)..."
                                        }
                                        rows={3}
                                        className={`mt-2 ${
                                          candidate.client_response === "observado"
                                            ? "border-yellow-300 focus:border-yellow-500"
                                            : "border-red-300 focus:border-red-500"
                                        } ${validationErrors[candidate.id] ? 'border-red-500' : ''}`}
                                        required
                                      />
                                      <p
                                        className={`text-xs mt-1 ${
                                          candidate.client_response === "observado" ? "text-yellow-600" : "text-red-600"
                                        }`}
                                      >
                                        💡 Esta información se sincroniza automáticamente con el Módulo 2
                                        {candidate.client_response === "rechazado" && " y actualiza el estado del candidato"}
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
                                          onChange={(e) => handleClientCommentsChange(candidate.id, e.target.value)}
                                          placeholder="Comentarios adicionales del cliente..."
                                          rows={2}
                                          className="mt-2 border-blue-300 focus:border-blue-500"
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
    </div>
  )
}
