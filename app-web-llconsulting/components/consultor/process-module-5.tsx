"use client"

import { useState } from "react"
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
import { getCandidatesByProcess } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, CheckCircle, User, Calendar, MessageSquare, Star, XCircle } from "lucide-react"
import type { Process, Candidate } from "@/lib/types"

interface ProcessModule5Props {
  process: Process
}

interface ContractedCandidate {
  id: string
  name: string
  contracted: boolean
  contract_date?: string
  continues: boolean
  observations?: string
  satisfaction_survey_pending: boolean
}

export function ProcessModule5({ process }: ProcessModule5Props) {
  // Incluir TODOS los candidatos del proceso, no solo los aprobados
  const [candidates, setCandidates] = useState(
    getCandidatesByProcess(process.id).filter((c) => 
      c.client_response === "aprobado" || c.client_response === "rechazado" || c.client_response === "observado"
    ),
  )

  const [contractedCandidates, setContractedCandidates] = useState<ContractedCandidate[]>([])
  const [showContractDialog, setShowContractDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showClosureDialog, setShowClosureDialog] = useState(false)
  const [closureReason, setClosureReason] = useState("")

  const handleContractSubmit = () => {
    if (!selectedCandidate) return

    const contractedCandidate: ContractedCandidate = {
      id: selectedCandidate.id,
      name: selectedCandidate.name,
      contracted: contractForm.contracted,
      contract_date: contractForm.contract_date,
      continues: contractForm.continues,
      observations: contractForm.observations,
      satisfaction_survey_pending: true,
    }

    // Verificar si ya existe un candidato contratado con este ID
    const existingIndex = contractedCandidates.findIndex((cc) => cc.id === selectedCandidate.id)
    
    if (existingIndex >= 0) {
      // Actualizar candidato existente
      const updatedContracted = [...contractedCandidates]
      updatedContracted[existingIndex] = contractedCandidate
      setContractedCandidates(updatedContracted)
    } else {
      // Agregar nuevo candidato
      setContractedCandidates([...contractedCandidates, contractedCandidate])
    }

    setShowContractDialog(false)
    setContractForm({
      contracted: false,
      contract_date: "",
      continues: true,
      observations: "",
    })
    setSelectedCandidate(null)
  }

  const openContractDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowContractDialog(true)
  }

  const isAlreadyProcessed = (candidateId: string) => {
    return contractedCandidates.some((c) => c.id === candidateId)
  }

  // Función para cambiar el estado de respuesta del cliente
  const handleClientResponseChange = (candidateId: string, newResponse: "aprobado" | "rechazado" | "observado") => {
    setCandidates(prevCandidates => 
      prevCandidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, client_response: newResponse }
          : candidate
      )
    )
    
    // Si el cliente rechaza, automáticamente marcar como no contratado
    if (newResponse === "rechazado") {
      setContractedCandidates(prevContracted => 
        prevContracted.map(contracted => 
          contracted.id === candidateId 
            ? { ...contracted, contracted: false }
            : contracted
        )
      )
    }
  }

  // Función para editar un candidato ya procesado
  const handleEditContractedCandidate = (candidate: Candidate) => {
    const contractedCandidate = contractedCandidates.find((cc) => cc.id === candidate.id)
    if (contractedCandidate) {
      setContractForm({
        contracted: contractedCandidate.contracted,
        contract_date: contractedCandidate.contract_date ?? "",
        continues: contractedCandidate.continues,
        observations: contractedCandidate.observations ?? "",
      })
    } else {
      setContractForm({
        contracted: false,
        contract_date: "",
        continues: true,
        observations: "",
      })
    }
    setSelectedCandidate(candidate)
    setShowContractDialog(true)
  }

  const handleProcessClosure = () => {
    console.log(`Proceso cerrado: ${closureType}`)
    console.log(`Vacantes llenas: ${contractedCount}/${totalVacancies}`)
    console.log(`Razón: ${closureReason}`)

    setShowClosureDialog(false)
    setClosureReason("")

    alert(`Proceso cerrado ${closureType === "completo" ? "completamente" : "parcialmente"}`)
  }

  // Lógica para determinar si se puede volver al Módulo 2
  const allCandidatesNotContracted = candidates.every((candidate) => {
    const contractedCandidate = contractedCandidates.find((cc) => cc.id === candidate.id)
    return !contractedCandidate || !contractedCandidate.contracted
  })
  
  const allCandidatesRejected = candidates.every((c) => c.client_response === "rechazado")
  
  // El botón se habilita si TODOS los candidatos están rechazados O no contratados
  const canReturnToModule2 = allCandidatesRejected || (allCandidatesNotContracted && candidates.length > 0)

  const hasContracted = contractedCandidates.some((c) => c.contracted)

  const contractedCount = contractedCandidates.filter((c) => c.contracted).length
  const totalVacancies = process.vacancies || 1
  const allVacanciesFilled = contractedCount >= totalVacancies
  const canClose = contractedCandidates.length > 0

  const closureType = allVacanciesFilled ? "completo" : "parcial"
  const closureButtonText = allVacanciesFilled ? "Cerrar Proceso" : "Cierre Parcial"
  const closureButtonVariant = allVacanciesFilled ? "default" : "secondary"

  const [contractForm, setContractForm] = useState({
    contracted: false,
    contract_date: "",
    continues: true,
    observations: "",
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Módulo 5 - Seguimiento y Control</h2>
        <p className="text-muted-foreground">Gestiona la contratación final y seguimiento de candidatos</p>
      </div>

      {canReturnToModule2 && (
        <Card className="border-cyan-200 bg-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-cyan-800">
                  {allCandidatesRejected 
                    ? "Todos los candidatos fueron rechazados" 
                    : "Proceso sin candidatos contratados"
                  }
                </h3>
                <p className="text-sm text-cyan-600">
                  {allCandidatesRejected 
                    ? "Puedes volver al Módulo 2 para gestionar nuevos candidatos" 
                    : "Puedes volver al Módulo 2 para continuar con el proceso de selección"
                  }
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
          <CardDescription>Registra la aprobación final del cliente y estado de contratación</CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Aprobación Cliente</TableHead>
                  <TableHead>Comentarios</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
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
                      <Select 
                        value={candidate.client_response || ""} 
                        onValueChange={(value: "aprobado" | "rechazado" | "observado") => 
                          handleClientResponseChange(candidate.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprobado">Sí</SelectItem>
                          <SelectItem value="rechazado">No</SelectItem>
                          <SelectItem value="observado">Observado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Comentarios del cliente..."
                        defaultValue={candidate.client_comments || ""}
                        rows={2}
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const contractedCandidate = contractedCandidates.find((cc) => cc.id === candidate.id)
                        
                        // Si el cliente rechazó, siempre mostrar "No contratado"
                        if (candidate.client_response === "rechazado") {
                          return (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-red-600 border-red-300">
                                <XCircle className="mr-1 h-3 w-3" />
                                No contratado
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditContractedCandidate(candidate)}
                              >
                                Editar
                              </Button>
                            </div>
                          )
                        }
                        
                        if (contractedCandidate) {
                          return contractedCandidate.contracted ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Contratado
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditContractedCandidate(candidate)}
                              >
                                Editar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">No contratado</Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditContractedCandidate(candidate)}
                              >
                                Editar
                              </Button>
                            </div>
                          )
                        } else {
                          return (
                            <Button size="sm" onClick={() => openContractDialog(candidate)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Contratación
                            </Button>
                          )
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay candidatos aprobados</h3>
              <p className="text-muted-foreground">
                Los candidatos aparecerán aquí cuando sean aprobados por el cliente en el Módulo 3.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {contractedCandidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Contrataciones</CardTitle>
            <CardDescription>Estado final de los candidatos no contratados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
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
                {canClose && (
                  <Button
                    variant={closureButtonVariant as any}
                    onClick={() => setShowClosureDialog(true)}
                    className={allVacanciesFilled ? "" : "border-cyan-300 text-cyan-700 hover:bg-cyan-100"}
                  >
                    {allVacanciesFilled ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {closureButtonText}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {contractedCandidates.map((candidate) => (
                <div key={candidate.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant={candidate.contracted ? "default" : "secondary"}>
                          {candidate.contracted ? "Contratado" : "No Contratado"}
                        </Badge>
                        {candidate.contracted && (
                          <Badge variant={candidate.continues ? "default" : "destructive"}>
                            {candidate.continues ? "Continúa" : "No Continúa"}
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
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Observaciones</p>
                          <p className="text-muted-foreground">{candidate.observations}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registro de Contratación</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Candidato: <strong>{selectedCandidate.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>¿Fue contratado?</Label>
              <Select
                value={contractForm.contracted.toString()}
                onValueChange={(value) => setContractForm({ ...contractForm, contracted: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí, fue contratado</SelectItem>
                  <SelectItem value="false">No fue contratado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contractForm.contracted && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contract_date">Fecha de Contratación</Label>
                  <Input
                    id="contract_date"
                    type="date"
                    value={contractForm.contract_date}
                    onChange={(e) => setContractForm({ ...contractForm, contract_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>¿Continúa en la empresa?</Label>
                  <Select
                    value={contractForm.continues.toString()}
                    onValueChange={(value) => setContractForm({ ...contractForm, continues: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí, continúa</SelectItem>
                      <SelectItem value="false">No continúa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={contractForm.observations}
                onChange={(e) => setContractForm({ ...contractForm, observations: e.target.value })}
                placeholder="Comentarios adicionales sobre el proceso..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContractSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{allVacanciesFilled ? "Cerrar Proceso" : "Cierre Parcial del Proceso"}</DialogTitle>
            <DialogDescription>
              {allVacanciesFilled ? (
                <>
                  Se han llenado todas las vacantes ({contractedCount}/{totalVacancies}). ¿Deseas cerrar el proceso
                  completamente?
                </>
              ) : (
                <>
                  Se han llenado {contractedCount} de {totalVacancies} vacantes. ¿Deseas realizar un cierre parcial del
                  proceso?
                </>
              )}
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
                  <strong>{contractedCandidates.filter((c) => c.contracted && c.continues).length}</strong>
                </p>
                <p>
                  Tipo de cierre: <strong>{closureType === "completo" ? "Completo" : "Parcial"}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closure_reason">
                {allVacanciesFilled ? "Comentarios finales (opcional)" : "Razón del cierre parcial"}
              </Label>
              <Textarea
                id="closure_reason"
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder={
                  allVacanciesFilled
                    ? "Comentarios adicionales sobre el proceso completado..."
                    : "Explica por qué se cierra parcialmente el proceso..."
                }
                rows={3}
                required={!allVacanciesFilled}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClosureDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleProcessClosure}
              variant={allVacanciesFilled ? "default" : "secondary"}
              disabled={!allVacanciesFilled && !closureReason.trim()}
            >
              {allVacanciesFilled ? "Cerrar Proceso" : "Cierre Parcial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
