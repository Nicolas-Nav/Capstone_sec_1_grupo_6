"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { serviceTypeLabels, processStatusLabels } from "@/lib/mock-data"
import { getCandidatesByProcess } from "@/lib/mock-data"
import { formatDate, getStatusColor, isProcessBlocked } from "@/lib/utils"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale, setDefaultLocale } from "react-datepicker"
import { es } from "date-fns/locale"

// Configurar español como idioma por defecto
registerLocale("es", es)
setDefaultLocale("es")
import { Building2, User, Calendar, Target, FileText, Download, Settings, FileSpreadsheet } from "lucide-react"
import type { Process, ProcessStatus, Candidate, WorkExperience, Education } from "@/lib/types"
import { useState, useEffect } from "react"
import { descripcionCargoService, solicitudService, regionService, comunaService, profesionService, rubroService, nacionalidadService, candidatoService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import CVViewerDialog from "./cv-viewer-dialog"
import { ProcessBlocked } from "./ProcessBlocked"

interface ProcessModule1Props {
  process: Process
  descripcionCargo?: any
}

export function ProcessModule1({ process, descripcionCargo }: ProcessModule1Props) {
  const { toast } = useToast()
  const [personalData, setPersonalData] = useState({
    name: "",
    rut: "",
    email: "",
    phone: "",
    birth_date: "",
    age: 0,
    region: "",
    comuna: "",
    nacionalidad: "",
    rubro: "",
    profession: "",
    has_disability_credential: false,
  })

  const [processStatus, setProcessStatus] = useState<ProcessStatus>((process.estado_solicitud || process.status) as ProcessStatus)
  const [statusChangeReason, setStatusChangeReason] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para listas desplegables
  const [regiones, setRegiones] = useState<any[]>([])
  const [todasLasComunas, setTodasLasComunas] = useState<any[]>([])
  const [comunasFiltradas, setComunasFiltradas] = useState<any[]>([])
  const [profesiones, setProfesiones] = useState<any[]>([])
  const [rubros, setRubros] = useState<any[]>([])
  const [nacionalidades, setNacionalidades] = useState<any[]>([])
  const [loadingLists, setLoadingLists] = useState(false)
  const [savingCandidate, setSavingCandidate] = useState(false)

  // Estados para experiencia laboral y educación
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [newWorkExperience, setNewWorkExperience] = useState({
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    comments: "",
    exit_reason: "",
  })
  const [newEducation, setNewEducation] = useState({
    type: "titulo" as "titulo" | "postgrado" | "capacitacion" | "curso",
    institution: "",
    title: "",
    start_date: "",
    completion_date: "",
    observations: "",
  })
  const [excelData, setExcelData] = useState<any>(null)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [estadosDisponibles, setEstadosDisponibles] = useState<any[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [showCVViewer, setShowCVViewer] = useState(false)

  const isEvaluationProcess =
    (process.service_type === "ES" || process.service_type === "TS")

  // Load candidates (para proceso de evaluación)
  useEffect(() => {
    if (isEvaluationProcess) {
      const loadCandidates = async () => {
        try {
          setIsLoading(true)
          const candidatesData = await getCandidatesByProcess(process.id)
          setCandidates(candidatesData)
        } catch (error) {
          console.error('❌ Error al cargar candidatos:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadCandidates()
    }
  }, [process.id, isEvaluationProcess])

  // Load estados disponibles
  useEffect(() => {
    const loadEstados = async () => {
      try {
        setLoadingEstados(true)
        const response = await solicitudService.getEstadosSolicitud()
        if (response.success && response.data) {
          setEstadosDisponibles(response.data)
        }
      } catch (error) {
        console.error("Error loading estados:", error)
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
  }, [])

  // Load Excel data if available
  useEffect(() => {
    const loadExcelData = async () => {
      // Verificar si existe datos_excel directamente en el proceso
      if (process.datos_excel) {
        setExcelData(process.datos_excel)
        return
      }

      // Si no, intentar cargar desde la API
      const descripcionCargoId = process.id_descripcion_cargo || process.id_descripcioncargo

      if (descripcionCargoId && descripcionCargoId > 0) {
        try {
          setLoadingExcel(true)
          const response = await descripcionCargoService.getExcelData(descripcionCargoId)

          if (response.success && response.data) {
            setExcelData(response.data)
          } else {
          }
        } catch (error) {
          console.error('❌ Error al cargar datos del Excel:', error)
        } finally {
          setLoadingExcel(false)
        }
      } else {
      }
    }
    loadExcelData()
  }, [process.id_descripcion_cargo, process.id_descripcioncargo, process.datos_excel])

  // For evaluation processes - track current candidate in accordion
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null)
  const currentCandidate = candidates.find(c => c.id === currentCandidateId)


  // Pre-llenar datos del candidato cuando se selecciona en el acordeón
  useEffect(() => {
    if (isEvaluationProcess && currentCandidate) {
      setPersonalData({
        name: currentCandidate.name || "",
        rut: currentCandidate.rut || "",
        email: currentCandidate.email || "",
        phone: currentCandidate.phone || "",
        birth_date: currentCandidate.birth_date || "",
        age: currentCandidate.age || 0,
        region: currentCandidate.region || "",
        comuna: currentCandidate.comuna || "",
        nacionalidad: currentCandidate.nacionalidad || "",
        rubro: currentCandidate.rubro || "",
        profession: currentCandidate.profession || "",
        has_disability_credential: currentCandidate.has_disability_credential || false,
      })

      // Pre-llenar experiencia laboral y educación
      setWorkExperience(currentCandidate.work_experience || [])
      setEducation(currentCandidate.education || [])
    }
  }, [isEvaluationProcess, currentCandidate])

  const handlePersonalDataSubmit = async () => {
    if (!currentCandidate) {
      toast({
        title: "Error",
        description: "No se encontró información del candidato",
        variant: "destructive",
      })
      return
    }

    // Validaciones de campos obligatorios
    if (!personalData.name?.trim()) {
      toast({
        title: "Campo obligatorio",
        description: "El nombre del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!personalData.email?.trim()) {
      toast({
        title: "Campo obligatorio",
        description: "El email del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(personalData.email)) {
      toast({
        title: "Campo obligatorio",
        description: "Ingresa un email válido (ej: candidato@ejemplo.com)",
        variant: "destructive",
      })
      return
    }

    if (!personalData.phone?.trim()) {
      toast({
        title: "Campo obligatorio",
        description: "El teléfono del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }

    // Validar formato de teléfono
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
    if (!phoneRegex.test(personalData.phone)) {
      toast({
        title: "Campo obligatorio",
        description: "Ingresa un teléfono válido (mínimo 8 dígitos)",
        variant: "destructive",
      })
      return
    }

    if (!personalData.rut?.trim()) {
      toast({
        title: "Campo obligatorio",
        description: "El RUT del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }

    // Validar formato de RUT chileno
    const rutRegex = /^[0-9]+-[0-9kK]$/
    if (!rutRegex.test(personalData.rut)) {
      toast({
        title: "Campo obligatorio",
        description: "Ingresa un RUT válido (ej: 12345678-9)",
        variant: "destructive",
      })
      return
    }

    if (!personalData.birth_date) {
      toast({
        title: "Campo obligatorio",
        description: "La fecha de nacimiento es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!personalData.region) {
      toast({
        title: "Campo obligatorio",
        description: "La región es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!personalData.comuna) {
      toast({
        title: "Campo obligatorio",
        description: "La comuna es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!personalData.nacionalidad) {
      toast({
        title: "Campo obligatorio",
        description: "La nacionalidad es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!personalData.rubro) {
      toast({
        title: "Campo obligatorio",
        description: "El rubro es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!personalData.profession) {
      toast({
        title: "Campo obligatorio",
        description: "La profesión es obligatoria",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingCandidate(true)

      // Preparar datos para actualizar el candidato
      const candidateData = {
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        rut: personalData.rut,
        birth_date: personalData.birth_date,
        age: personalData.age,
        region: personalData.region,
        comuna: personalData.comuna,
        nacionalidad: personalData.nacionalidad,
        rubro: personalData.rubro,
        profession: personalData.profession,
        has_disability_credential: personalData.has_disability_credential,
        work_experience: workExperience.length > 0
          ? workExperience.map(exp => ({
            company: exp.company,
            position: exp.position,
            start_date: exp.start_date,
            end_date: exp.end_date,
            description: exp.description,
          }))
          : undefined,
        education: education.length > 0
          ? education.map(edu => ({
            type: edu.type,
            institution: edu.institution,
            title: edu.title,
            start_date: edu.start_date,
            completion_date: edu.completion_date,
            observations: edu.observations,
          }))
          : undefined,
      }


      // Actualizar el candidato
      const response = await candidatoService.update(parseInt(currentCandidate.id), candidateData)

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: "Datos del candidato guardados exitosamente",
          variant: "default",
        })
        
        // Recargar candidatos para actualizar la información
        const candidatesData = await getCandidatesByProcess(process.id)
        setCandidates(candidatesData)
      } else {
        toast({
          title: "Error",
          description: response.message || "Error al guardar los datos del candidato",
          variant: "destructive",
        })
      }

    } catch (error) {
      console.error('Error saving candidate data:', error)
      toast({
        title: "Error",
        description: "Error al guardar los datos del candidato",
        variant: "destructive",
      })
    } finally {
      setSavingCandidate(false)
    }
  }

  const handleAddWorkExperience = () => {
    if (newWorkExperience.company && newWorkExperience.position) {
      const experience: WorkExperience = {
        id: Date.now().toString(),
        ...newWorkExperience,
      }
      setWorkExperience([...workExperience, experience])
      setNewWorkExperience({
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
        comments: "",
        exit_reason: "",
      })
    }
  }

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.title) {
      const educationItem: Education = {
        id: Date.now().toString(),
        type: newEducation.type as "titulo" | "postgrado" | "capacitacion" | "curso",
        institution: newEducation.institution,
        title: newEducation.title,
        start_date: newEducation.start_date,
        completion_date: newEducation.completion_date,
        observations: newEducation.observations,
      }
      setEducation([...education, educationItem])
      setNewEducation({
        type: "titulo" as "titulo" | "postgrado" | "capacitacion" | "curso",
        institution: "",
        title: "",
        start_date: "",
        completion_date: "",
        observations: "",
      })
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Cargar listas desplegables
  useEffect(() => {
    const loadLists = async () => {
      try {
        setLoadingLists(true)
        const [regionesRes, comunasRes, profesionesRes, rubrosRes, nacionalidadesRes] = await Promise.all([
          regionService.getAll(),
          comunaService.getAll(),
          profesionService.getAll(),
          rubroService.getAll(),
          nacionalidadService.getAll(),
        ])

        setRegiones(regionesRes.data || [])
        setTodasLasComunas(comunasRes.data || [])
        setProfesiones(profesionesRes.data || [])
        setRubros(rubrosRes.data || [])
        setNacionalidades(nacionalidadesRes.data || [])
      } catch (error) {
        console.error('Error loading lists:', error)
      } finally {
        setLoadingLists(false)
      }
    }

    loadLists()
  }, [])

  // Filtrar comunas cuando cambia la región
  useEffect(() => {
    if (personalData.region) {
      const regionSeleccionada = regiones.find(r => r.nombre_region === personalData.region)
      if (regionSeleccionada) {
        const filtradas = todasLasComunas.filter(
          c => c.id_region === regionSeleccionada.id_region
        )
        setComunasFiltradas(filtradas)
      }
    }
  }, [personalData.region, regiones, todasLasComunas])

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
          description: "Estado actualizado exitosamente",
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
          description: "Error al actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const handleAdvanceToModule2 = async () => {
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
      const response = await solicitudService.avanzarAModulo2(parseInt(process.id))

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: "Proceso avanzado al Módulo 2 exitosamente",
          variant: "default",
        })
        // Navegar al módulo 2 usando URL con parámetro
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('tab', 'modulo-2')
        window.location.href = currentUrl.toString()
      } else {
        toast({
          title: "Error",
          description: "Error al avanzar al Módulo 2",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al avanzar al Módulo 2:", error)
      toast({
        title: "Error",
        description: "Error al avanzar al Módulo 2",
        variant: "destructive",
      })
    }
  }

  // Verificar si el proceso está bloqueado (estado final)
  const isBlocked = isProcessBlocked(processStatus)

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Módulo 1 - Solicitud y Cargo</h2>
          <p className="text-muted-foreground">Información detallada del cargo y requisitos del proceso</p>
        </div>
        <Button
          onClick={handleAdvanceToModule2}
          className="bg-primary hover:bg-primary/90"
          disabled={isProcessBlocked(processStatus)}
        >
          Pasar a Módulo 2
        </Button>
      </div>

      {/* Componente de bloqueo si el proceso está en estado final */}
      <ProcessBlocked 
        processStatus={processStatus} 
        moduleName="Módulo 1" 
      />

      {/* Botón de cambio de estado al inicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cambiar Estado de la Solicitud
          </CardTitle>
          <CardDescription>
            Actualiza el estado actual del proceso de reclutamiento
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
              {loadingEstados ? "Cargando..." : "Cambiar Estado"}
            </Button>
          </div>

          {showStatusChange && (
            <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="new-estado">Nuevo Estado</Label>
                <Select
                  value={selectedEstado}
                  onValueChange={setSelectedEstado}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosDisponibles.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Motivo del Cambio (Opcional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Explica el motivo del cambio de estado..."
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

      {/* Excel Data - Descripción de Cargo Detallada (solo para procesos no psicolaborales) */}
      {!isEvaluationProcess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Descripción de Cargo Detallada (Datos del Excel)
            </CardTitle>
            <CardDescription>Información completa extraída del archivo Excel</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExcel ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Cargando datos del Excel...</span>
              </div>
            ) : excelData && Object.keys(excelData).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Campo</TableHead>
                    <TableHead>Información</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(excelData).map(([key, value]) => {
                    // Omitir campos vacíos o null
                    if (!value || value === '' || value === 'null') return null

                    // Formatear el nombre del campo
                    const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                    // Formatear el valor
                    let displayValue: any = value
                    if (typeof value === 'object' && value !== null) {
                      if (Array.isArray(value)) {
                        // Si es un array de objetos (como Competencias Psicolaborales)
                        if (value.length > 0 && typeof value[0] === 'object') {
                          displayValue = (
                            <div className="space-y-2">
                              {value.map((item, idx) => (
                                <div key={idx} className="border-l-2 border-primary pl-3 py-1">
                                  {Object.entries(item).map(([k, v]) => (
                                    <div key={k}>
                                      <span className="font-medium">{k}:</span> {String(v)}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )
                        } else {
                          // Array simple
                          displayValue = value.join(', ')
                        }
                      } else {
                        // Objeto simple
                        displayValue = JSON.stringify(value, null, 2)
                      }
                    }

                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium align-top">{fieldName}</TableCell>
                        <TableCell className="whitespace-pre-wrap">
                          {typeof displayValue === 'string' ? displayValue : displayValue}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No hay datos del Excel disponibles</p>
                <p className="text-sm mt-2">Los datos aparecerán aquí cuando se suba un archivo Excel</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}


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


      {/* Formulario de Datos del Candidato - Solo para procesos psicolaborales */}
      {isEvaluationProcess && candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidatos a Evaluar ({candidates.length})
            </CardTitle>
            <CardDescription>
              Expanda cada candidato para ver o completar sus datos personales y proceder con la evaluación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion 
              type="single" 
              collapsible 
              value={currentCandidateId || undefined}
              onValueChange={(value) => setCurrentCandidateId(value || null)}
            >
              {candidates.map((candidate) => (
                <AccordionItem key={candidate.id} value={candidate.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium text-left">{candidate.name}</span>
                      <Badge variant={candidate.cv_file ? "default" : "secondary"} className="ml-2">
                        {candidate.cv_file ? "✅ Tiene CV" : "📝 Datos básicos"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
            {/* CV Viewer - Solo si el candidato tiene CV */}
            {candidate.cv_file && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Curriculum Vitae</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCVViewer(true)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Ver CV
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Archivo:</strong> {candidate.cv_file}</p>
                  <p className="mt-1">Haz clic en "Ver CV" para visualizar el documento completo</p>
                </div>
              </div>
            )}

            {/* Mostrar formulario completo solo si tiene CV */}
            {candidate.cv_file ? (
              <>
              {/* Formulario de datos personales */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Datos Personales</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={personalData.name}
                    onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                    placeholder="Ingrese nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT <span className="text-red-500">*</span></Label>
                  <Input
                    id="rut"
                    value={personalData.rut}
                    onChange={(e) => setPersonalData({ ...personalData, rut: e.target.value })}
                    placeholder="12.345.678-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
                  <DatePicker
                    selected={personalData.birth_date ? new Date(personalData.birth_date) : null}
                    onChange={(date) => {
                      if (date) {
                        const age = calculateAge(date.toISOString().split('T')[0])
                        setPersonalData({
                          ...personalData,
                          birth_date: date.toISOString().split('T')[0],
                          age: age,
                        })
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="Selecciona fecha de nacimiento"
                    className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    maxDate={new Date()}
                    minDate={new Date("1900-01-01")}
                    yearDropdownItemNumber={100}
                    locale="es"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={personalData.age}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profesión <span className="text-red-500">*</span></Label>
                  <Select
                    value={personalData.profession}
                    onValueChange={(value) => setPersonalData({ ...personalData, profession: value })}
                    disabled={loadingLists || isBlocked}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione profesión" />
                    </SelectTrigger>
                    <SelectContent>
                      {profesiones.map((prof) => (
                        <SelectItem key={prof.id_profesion} value={prof.nombre_profesion}>
                          {prof.nombre_profesion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_disability_credential"
                    checked={personalData.has_disability_credential}
                    onChange={(e) => setPersonalData({ ...personalData, has_disability_credential: e.target.checked })}
                    disabled={isBlocked}
                  />
                  <Label htmlFor="has_disability_credential">Cuenta con credencial de discapacidad</Label>
                </div>
              </div>


              {/* Información adicional del candidato (editable) */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-lg mb-4">Información Adicional</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Región</Label>
                    <Select
                      value={personalData.region}
                      onValueChange={(value) => {
                        setPersonalData({ ...personalData, region: value, comuna: "" })
                      }}
                      disabled={loadingLists}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione región" />
                      </SelectTrigger>
                      <SelectContent>
                        {regiones.map((region) => (
                          <SelectItem key={region.id_region} value={region.nombre_region}>
                            {region.nombre_region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Select
                      value={personalData.comuna}
                      onValueChange={(value) => setPersonalData({ ...personalData, comuna: value })}
                      disabled={loadingLists || !personalData.region}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={personalData.region ? "Seleccione comuna" : "Primero seleccione región"} />
                      </SelectTrigger>
                      <SelectContent>
                        {comunasFiltradas.map((comuna) => (
                          <SelectItem key={comuna.id_comuna} value={comuna.nombre_comuna}>
                            {comuna.nombre_comuna}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nacionalidad">Nacionalidad</Label>
                    <Select
                      value={personalData.nacionalidad}
                      onValueChange={(value) => setPersonalData({ ...personalData, nacionalidad: value })}
                      disabled={loadingLists}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione nacionalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {nacionalidades.map((nac) => (
                          <SelectItem key={nac.id_nacionalidad} value={nac.nombre_nacionalidad}>
                            {nac.nombre_nacionalidad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rubro">Rubro</Label>
                    <Select
                      value={personalData.rubro}
                      onValueChange={(value) => setPersonalData({ ...personalData, rubro: value })}
                      disabled={loadingLists}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione rubro" />
                      </SelectTrigger>
                      <SelectContent>
                        {rubros.map((rubro) => (
                          <SelectItem key={rubro.id_rubro} value={rubro.nombre_rubro}>
                            {rubro.nombre_rubro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Experiencia Laboral */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-lg mb-4">Experiencia Laboral</h4>

                {/* Formulario para agregar experiencia */}
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <h5 className="font-medium">Agregar Experiencia</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Input
                        value={newWorkExperience.company}
                        onChange={(e) => setNewWorkExperience({ ...newWorkExperience, company: e.target.value })}
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input
                        value={newWorkExperience.position}
                        onChange={(e) => setNewWorkExperience({ ...newWorkExperience, position: e.target.value })}
                        placeholder="Título del cargo"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha Inicio</Label>
                      <DatePicker
                        selected={newWorkExperience.start_date ? new Date(newWorkExperience.start_date) : null}
                        onChange={(date) => {
                          if (date) {
                            setNewWorkExperience({ ...newWorkExperience, start_date: date.toISOString().split('T')[0] })
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="Selecciona fecha"
                        className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxDate={new Date()}
                        yearDropdownItemNumber={50}
                        locale="es"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Fin</Label>
                      <DatePicker
                        selected={newWorkExperience.end_date ? new Date(newWorkExperience.end_date) : null}
                        onChange={(date) => {
                          if (date) {
                            setNewWorkExperience({ ...newWorkExperience, end_date: date.toISOString().split('T')[0] })
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="Selecciona fecha"
                        className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxDate={new Date()}
                        minDate={newWorkExperience.start_date ? new Date(newWorkExperience.start_date) : undefined}
                        yearDropdownItemNumber={50}
                        disabled={newWorkExperience.is_current}
                        locale="es"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_current"
                      checked={newWorkExperience.is_current}
                      onChange={(e) => setNewWorkExperience({
                        ...newWorkExperience,
                        is_current: e.target.checked,
                        end_date: e.target.checked ? "" : newWorkExperience.end_date,
                      })}
                    />
                    <Label htmlFor="is_current">Trabajo actual</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción de Funciones</Label>
                    <Textarea
                      value={newWorkExperience.description}
                      onChange={(e) => setNewWorkExperience({ ...newWorkExperience, description: e.target.value })}
                      placeholder="Principales responsabilidades y logros"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleAddWorkExperience}
                    disabled={!newWorkExperience.company || !newWorkExperience.position}
                    size="sm"
                  >
                    Agregar Experiencia
                  </Button>
                </div>

                {/* Lista de experiencias */}
                {workExperience.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="font-medium">Experiencias Registradas</h5>
                    {workExperience.map((exp) => (
                      <div key={exp.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{exp.position} en {exp.company}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.start_date} - {exp.is_current ? 'Actual' : exp.end_date}
                            </p>
                            {exp.description && (
                              <p className="text-sm mt-1">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formación Académica */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-lg mb-4">Formación Académica</h4>

                {/* Formulario para agregar formación */}
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <h5 className="font-medium">Agregar Formación</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institución</Label>
                      <Input
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                        placeholder="Nombre de la institución"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={newEducation.title}
                        onChange={(e) => setNewEducation({ ...newEducation, title: e.target.value })}
                        placeholder="Título obtenido"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha Inicio</Label>
                      <DatePicker
                        selected={newEducation.start_date ? new Date(newEducation.start_date) : null}
                        onChange={(date) => {
                          if (date) {
                            setNewEducation({ ...newEducation, start_date: date.toISOString().split('T')[0] })
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="Selecciona fecha"
                        className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxDate={new Date()}
                        yearDropdownItemNumber={50}
                        locale="es"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Finalización</Label>
                      <DatePicker
                        selected={newEducation.completion_date ? new Date(newEducation.completion_date) : null}
                        onChange={(date) => {
                          if (date) {
                            setNewEducation({ ...newEducation, completion_date: date.toISOString().split('T')[0] })
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="Selecciona fecha"
                        className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxDate={new Date()}
                        minDate={newEducation.start_date ? new Date(newEducation.start_date) : undefined}
                        yearDropdownItemNumber={50}
                        locale="es"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea
                      value={newEducation.observations}
                      onChange={(e) => setNewEducation({ ...newEducation, observations: e.target.value })}
                      placeholder="Observaciones adicionales"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleAddEducation}
                    disabled={!newEducation.institution || !newEducation.title}
                    size="sm"
                  >
                    Agregar Formación
                  </Button>
                </div>

                {/* Lista de formación */}
                {education.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="font-medium">Formación Registrada</h5>
                    {education.map((edu) => (
                      <div key={edu.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{edu.title}</p>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.start_date} - {edu.completion_date}
                            </p>
                            {edu.observations && (
                              <p className="text-sm mt-1">{edu.observations}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handlePersonalDataSubmit}
                  disabled={savingCandidate}
                >
                  {savingCandidate ? "Guardando..." : "Guardar Datos del Candidato"}
                </Button>
              </div>
            </div>
              </>
            ) : (
              /* Vista simplificada sin CV - Solo datos básicos */
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Este candidato no tiene CV adjunto. Solo se muestran los datos básicos ingresados.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Datos Básicos</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Nombre Completo</Label>
                      <p className="font-medium">{candidate.name || 'No especificado'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{candidate.email || 'No especificado'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Teléfono</Label>
                      <p className="font-medium">{candidate.phone || 'No especificado'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">RUT</Label>
                      <p className="font-medium">{candidate.rut || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 Para completar más información, solicite al candidato que envíe su CV.
                    </p>
                  </div>
                </div>
              </div>
            )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* CV Viewer Dialog */}
      {showCVViewer && currentCandidate && (
        <CVViewerDialog
          candidate={currentCandidate}
          isOpen={showCVViewer}
          onClose={() => setShowCVViewer(false)}
        />
      )}
    </div>
  )
}