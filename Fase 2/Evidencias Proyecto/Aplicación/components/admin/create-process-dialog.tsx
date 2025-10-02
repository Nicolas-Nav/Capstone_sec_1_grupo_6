"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { ServiceType } from "@/lib/types"
import { descripcionCargoService, solicitudService } from "@/lib/api"
import * as XLSX from 'xlsx'

interface CreateProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormDataApi {
  clientes: Array<{
    id: string;
    nombre: string;
    contactos: Array<{
      id: string;
      nombre: string;
      email: string;
    }>;
  }>;
  tipos_servicio: Array<{
    codigo: string;
    nombre: string;
  }>;
  consultores: Array<{
    rut: string;
    nombre: string;
  }>;
  cargos: string[];
  comunas: string[];
}

export function CreateProcessDialog({ open, onOpenChange }: CreateProcessDialogProps) {
  const [formData, setFormData] = useState({
    client_id: "",
    contact_id: "",
    service_type: "" as ServiceType,
    position_title: "",
    ciudad: "",
    description: "",
    requirements: "",
    vacancies: 1,
    consultant_id: "",
    candidate_name: "",
    candidate_rut: "",
    cv_file: null as File | null,
    excel_file: null as File | null,
  })

  const [showCustomPosition, setShowCustomPosition] = useState(false)
  const [customPosition, setCustomPosition] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiData, setApiData] = useState<FormDataApi | null>(null)

  // Cargar datos del formulario cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadFormData()
    }
  }, [open])

  const loadFormData = async () => {
    try {
      setIsLoading(true)
      const response = await descripcionCargoService.getFormData()
      
      if (response.success && response.data) {
        setApiData(response.data)
      } else {
        toast.error('Error al cargar los datos del formulario')
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Error al cargar los datos del formulario')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para procesar el archivo Excel
  const processExcelFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[1]
          const sheet = workbook.Sheets[sheetName]

          // Funciones auxiliares
          const leerCelda = (celda: string): string => {
            const cell = sheet[celda]
            return cell ? String(cell.v || '').trim() : ''
          }

          const leerRango = (columna: string, inicio: number, fin: number): string[] => {
            const valores: string[] = []
            for (let i = inicio; i <= fin; i++) {
              const valor = leerCelda(`${columna}${i}`)
              if (valor) valores.push(valor)
            }
            return valores
          }

          const leerRangoDoble = (col1: string, col2: string, inicio: number, fin: number): Array<{col1: string, col2: string}> => {
            const valores: Array<{col1: string, col2: string}> = []
            for (let i = inicio; i <= fin; i++) {
              const valor1 = leerCelda(`${col1}${i}`)
              const valor2 = leerCelda(`${col2}${i}`)
              if (valor1 || valor2) valores.push({ col1: valor1, col2: valor2 })
            }
            return valores
          }

          // Extraer datos del Excel
          const excelData = {
            nombre_cargo: leerCelda("C4"),
            tipo_contrato: leerCelda("C6"),
            tipo_jornada: leerCelda("C7"),
            jornada_trabajo: leerCelda("C8"),
            ubicacion_principal: leerCelda("C9"),
            modalidad_trabajo: leerCelda("C10"),
            supervisor_directo: leerCelda("C11"),
            subordinados: leerCelda("C12"),
            equipo_area: leerCelda("C13"),
            formacion_academica: leerCelda("E6"),
            anos_experiencia: leerCelda("E7"),
            tipo_experiencia: leerCelda("E8"),
            herramientas_idiomas: leerCelda("E9"),
            otro_requisitos: leerCelda("E10"),
            renta_liquida: leerCelda("E12"),
            beneficios: leerCelda("E13"),
            objetivo_principal: leerCelda("C16"),
            funciones_principales: leerRango("C", 17, 20),
            competencias_psicolaborales: leerRangoDoble("C", "D", 23, 27),
            numero_vacantes: leerCelda("C30"),
            motivo_solicitud: leerCelda("C31"),
            confidencialidad: leerCelda("C32"),
            plazo_estimado_ingreso: leerCelda("C33"),
            jefatura: leerCelda("C34"),
            principales_desafios: leerCelda("C35"),
            decisiones_autonomia: leerCelda("C36"),
            grado_autonomia: leerCelda("C37"),
            expectativas_colaboradores: leerCelda("C38"),
            estilo_comunicacion: leerCelda("C39"),
            clima_laboral: leerCelda("C40"),
            sexo: leerCelda("E30"),
            rango_etario: leerCelda("E31"),
            nacionalidad: leerCelda("E32"),
            comuna_residencia: leerCelda("E33"),
            discapacidad: leerCelda("E34"),
            tipo_persona_equipo: leerCelda("E35"),
            valores_conductas: leerCelda("E36"),
            posibilidades_crecimiento: leerCelda("E37"),
            aprendizajes_perfil: leerCelda("E38")
          }

          resolve(excelData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)

      // Validar campos requeridos
      if (!formData.client_id || !formData.contact_id || !formData.service_type || 
          !formData.position_title || !formData.ciudad || !formData.consultant_id) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }

      // Crear la solicitud (que automáticamente crea la descripción de cargo)
      const response = await solicitudService.create({
        contact_id: formData.contact_id,
        service_type: formData.service_type,
        position_title: formData.position_title,
        ciudad: formData.ciudad,
        description: formData.description || undefined,
        requirements: formData.requirements || undefined,
        vacancies: formData.vacancies,
        consultant_id: formData.consultant_id,
        deadline_days: 30 // Por defecto 30 días
      })

      if (response.success) {
        // Si hay archivo Excel, procesarlo y enviarlo
        if (formData.excel_file) {
          try {
            toast.info('Procesando archivo Excel...')
            const excelData = await processExcelFile(formData.excel_file)
            
            // Obtener el ID de la descripción de cargo creada
            const descripcionCargoId = response.data.id_descripcion_cargo
            
            if (descripcionCargoId) {
              const excelResponse = await descripcionCargoService.addExcelData(descripcionCargoId, excelData)
              
              if (excelResponse.success) {
                toast.success('Solicitud y datos de Excel guardados exitosamente')
              } else {
                toast.warning('Solicitud creada, pero hubo un error al guardar los datos del Excel')
              }
            }
          } catch (excelError: any) {
            console.error('Error processing Excel:', excelError)
            toast.warning('Solicitud creada, pero hubo un error al procesar el Excel: ' + excelError.message)
          }
        } else {
          toast.success('Solicitud creada exitosamente')
        }
        
    // Reset form
    setFormData({
      client_id: "",
          contact_id: "",
      service_type: "" as ServiceType,
      position_title: "",
          ciudad: "",
      description: "",
      requirements: "",
      vacancies: 1,
      consultant_id: "",
      candidate_name: "",
      candidate_rut: "",
      cv_file: null,
          excel_file: null,
    })
    setShowCustomPosition(false)
    setCustomPosition("")
        
        // Cerrar el diálogo
        onOpenChange(false)
        
        // Recargar la página para ver la nueva solicitud
        window.location.reload()
      } else {
        toast.error(response.message || 'Error al crear la solicitud')
      }
    } catch (error: any) {
      console.error('Error creating request:', error)
      toast.error(error.message || 'Error al crear la solicitud')
    } finally {
      setIsSubmitting(false)
    }
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

  const selectedClient = apiData?.clientes.find((client) => client.id === formData.client_id)
  const clientContacts = selectedClient?.contactos || []

  const isEvaluationProcess =
    formData.service_type === "evaluacion_psicolaboral" || formData.service_type === "test_psicolaboral"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Solicitud de Proceso</DialogTitle>
          <DialogDescription>Complete la información para iniciar un nuevo proceso de selección.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
                  <Select value={formData.client_id} onValueChange={handleClientChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                      {apiData?.clientes.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                          {client.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

                {formData.client_id && clientContacts.length > 0 && (
              <div className="space-y-2">
                    <Label htmlFor="contact">Contacto</Label>
                <Select
                  value={formData.contact_id}
                  onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
                      required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                            {contact.nombre} - {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

                <div className={`space-y-2 ${formData.client_id && clientContacts.length > 0 ? "col-span-2" : ""}`}>
              <Label htmlFor="service_type">Tipo de Servicio</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value as ServiceType })}
                    required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                      {apiData?.tipos_servicio.map((tipo) => (
                        <SelectItem key={tipo.codigo} value={tipo.codigo}>
                          {tipo.nombre}
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
                          <strong>Nombre:</strong> {selectedContact.nombre}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedContact.email}
                    </p>
                  </div>
                ) : null
              })()}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position_title">Cargo</Label>
            {!showCustomPosition ? (
                  <Select value={formData.position_title} onValueChange={handlePositionChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cargo" />
                </SelectTrigger>
                <SelectContent>
                      {apiData?.cargos.map((cargo) => (
                        <SelectItem key={cargo} value={cargo}>
                          {cargo}
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

              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad/Comuna</Label>
                <Select value={formData.ciudad} onValueChange={(value) => setFormData({ ...formData, ciudad: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiData?.comunas.map((comuna) => (
                      <SelectItem key={comuna} value={comuna}>
                        {comuna}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        placeholder="Nombre completo"
                        required={isEvaluationProcess}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="candidate_rut">RUT del Candidato</Label>
                  <Input
                    id="candidate_rut"
                    value={formData.candidate_rut}
                    onChange={(e) => setFormData({ ...formData, candidate_rut: e.target.value })}
                    placeholder="12.345.678-9"
                        required={isEvaluationProcess}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv_file">CV del Candidato</Label>
                <Input
                  id="cv_file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                      onChange={(e) => setFormData({ ...formData, cv_file: e.target.files?.[0] || null })}
                      required={isEvaluationProcess}
                />
                    <p className="text-xs text-muted-foreground">Formatos aceptados: PDF, DOC, DOCX</p>
              </div>
            </>
          )}

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del cargo o proceso"
                rows={3}
              />
            </div>

          <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Requisitos y condiciones"
              rows={3}
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
                    onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultant">Consultor Asignado</Label>
              <Select
                value={formData.consultant_id}
                onValueChange={(value) => setFormData({ ...formData, consultant_id: value })}
                    required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar consultor" />
                </SelectTrigger>
                <SelectContent>
                      {apiData?.consultores.map((consultor) => (
                        <SelectItem key={consultor.rut} value={consultor.rut}>
                          {consultor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

            <div className="space-y-2">
                <Label htmlFor="excel_file">Archivo Excel de Descripción de Cargo (Opcional)</Label>
              <Input
                id="excel_file"
                type="file"
                accept=".xlsx,.xls"
                  onChange={(e) => setFormData({ ...formData, excel_file: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-muted-foreground">
                  Si tienes un archivo Excel con los detalles del cargo, puedes subirlo aquí. 
                  Los datos serán procesados automáticamente. Formatos aceptados: .xlsx, .xls
                </p>
                {formData.excel_file && (
                  <p className="text-sm text-green-600">
                    ✓ Archivo seleccionado: {formData.excel_file.name}
                  </p>
                )}
            </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Solicitud"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
