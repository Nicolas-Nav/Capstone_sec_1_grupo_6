"use client"

import type React from "react"

import { useState } from "react"
import { mockClients, mockUsers, serviceTypeLabels, predefinedPositions } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ServiceType } from "@/lib/types"

interface CreateProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProcessDialog({ open, onOpenChange }: CreateProcessDialogProps) {
  const [formData, setFormData] = useState({
    client_id: "",
    contact_id: "", // Added contact_id field
    service_type: "" as ServiceType,
    position_title: "",
    description: "",
    requirements: "",
    vacancies: 1,
    consultant_id: "",
    candidate_name: "",
    candidate_rut: "",
    cv_file: null as File | null,
  })

  const [showCustomPosition, setShowCustomPosition] = useState(false)
  const [customPosition, setCustomPosition] = useState("")

  const consultants = mockUsers.filter((user) => user.role === "consultor")

  const selectedClient = mockClients.find((client) => client.id === formData.client_id)
  const clientContacts = selectedClient?.contacts || []
  const hasMultipleContacts = clientContacts.length > 1

  const isEvaluationProcess =
    formData.service_type === "evaluacion_psicolaboral" || formData.service_type === "test_psicolaboral"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the process
    console.log("Creating process:", formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      client_id: "",
      contact_id: "", // Reset contact_id
      service_type: "" as ServiceType,
      position_title: "",
      description: "",
      requirements: "",
      vacancies: 1,
      consultant_id: "",
      candidate_name: "",
      candidate_rut: "",
      cv_file: null,
    })
    setShowCustomPosition(false)
    setCustomPosition("")
  }

  const handleClientChange = (value: string) => {
    setFormData({ ...formData, client_id: value, contact_id: "" })
  }

  const handlePositionChange = (value: string) => {
    if (value === "custom") {
      setShowCustomPosition(true)
      setFormData({ ...formData, position_title: "" })
    } else {
      setShowCustomPosition(false)
      setFormData({ ...formData, position_title: value })
    }
  }

  const handleCustomPositionChange = (value: string) => {
    setCustomPosition(value)
    setFormData({ ...formData, position_title: value })
  }

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, cv_file: file })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Reclutamiento</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una nueva solicitud de proceso de reclutamiento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={formData.client_id} onValueChange={handleClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasMultipleContacts && (
              <div className="space-y-2">
                <Label htmlFor="contact">Contacto del Cliente</Label>
                <Select
                  value={formData.contact_id}
                  onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {contact.position} - {contact.city}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={`space-y-2 ${hasMultipleContacts ? "col-span-2" : ""}`}>
              <Label htmlFor="service_type">Tipo de Servicio</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value as ServiceType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(serviceTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.contact_id && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Información del Contacto Seleccionado:</h4>
              {(() => {
                const selectedContact = clientContacts.find((c) => c.id === formData.contact_id)
                return selectedContact ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Nombre:</strong> {selectedContact.name}
                    </p>
                    <p>
                      <strong>Cargo:</strong> {selectedContact.position}
                    </p>
                    <p>
                      <strong>Ciudad:</strong> {selectedContact.city}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedContact.email}
                    </p>
                    <p>
                      <strong>Teléfono:</strong> {selectedContact.phone}
                    </p>
                  </div>
                ) : null
              })()}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position_title">Cargo</Label>
            {!showCustomPosition ? (
              <Select value={formData.position_title} onValueChange={handlePositionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cargo" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedPositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Agregar nuevo cargo</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customPosition}
                  onChange={(e) => handleCustomPositionChange(e.target.value)}
                  placeholder="Ingrese el nombre del cargo"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCustomPosition(false)
                    setFormData({ ...formData, position_title: "" })
                    setCustomPosition("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {isEvaluationProcess && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_name">Nombre del Candidato</Label>
                  <Input
                    id="candidate_name"
                    value={formData.candidate_name}
                    onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                    placeholder="Nombre completo del candidato"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate_rut">RUT del Candidato</Label>
                  <Input
                    id="candidate_rut"
                    value={formData.candidate_rut}
                    onChange={(e) => setFormData({ ...formData, candidate_rut: e.target.value })}
                    placeholder="12.345.678-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv_file">CV del Candidato</Label>
                <Input
                  id="cv_file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  required
                />
                <p className="text-xs text-muted-foreground">Sube el CV del candidato (PDF, DOC, DOCX)</p>
              </div>
            </>
          )}

          {!isEvaluationProcess && (
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Cargo</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las responsabilidades y funciones del cargo..."
                rows={3}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos y Condiciones</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Lista los requisitos técnicos, experiencia, habilidades..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vacancies">Número de Vacantes</Label>
              <Input
                id="vacancies"
                type="number"
                min="1"
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultant">Consultor Asignado</Label>
              <Select
                value={formData.consultant_id}
                onValueChange={(value) => setFormData({ ...formData, consultant_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isEvaluationProcess && (
            <div className="space-y-2">
              <Label htmlFor="excel_file">Archivo Excel (Opcional)</Label>
              <Input
                id="excel_file"
                type="file"
                accept=".xlsx,.xls"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">Sube un archivo Excel con información adicional del cargo</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Solicitud</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
