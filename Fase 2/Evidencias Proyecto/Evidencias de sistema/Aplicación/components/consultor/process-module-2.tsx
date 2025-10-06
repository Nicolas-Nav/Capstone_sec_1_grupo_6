 "use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { getPublicationsByProcess, getCandidatesByProcess } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"
import { Plus, Edit, Trash2, Star, Globe, Settings } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { Process, Publication, Candidate, WorkExperience, Education, PortalResponses } from "@/lib/types"
import { regionService, comunaService, profesionService, rubroService, nacionalidadService, candidatoService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProcessModule2Props {
  process: Process
}

export function ProcessModule2({ process }: ProcessModule2Props) {
  const { toast } = useToast()
  
  // Estados ahora inicializan vacíos y se llenan con useEffect
  const [publications, setPublications] = useState<Publication[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para listas desplegables
  const [regiones, setRegiones] = useState<any[]>([])
  const [todasLasComunas, setTodasLasComunas] = useState<any[]>([])
  const [comunasFiltradas, setComunasFiltradas] = useState<any[]>([])
  const [profesiones, setProfesiones] = useState<any[]>([])
  const [rubros, setRubros] = useState<any[]>([])
  const [nacionalidades, setNacionalidades] = useState<any[]>([])
  const [loadingLists, setLoadingLists] = useState(true)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [showAddPublication, setShowAddPublication] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [showEditCandidate, setShowEditCandidate] = useState(false)
  const [viewingCV, setViewingCV] = useState<Candidate | null>(null)
  const [showViewCV, setShowViewCV] = useState(false)
  const [showCandidateDetails, setShowCandidateDetails] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [currentStep, setCurrentStep] = useState<"basic" | "education" | "experience" | "portal_responses">("basic")

  // Cargar datos reales desde el backend
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
        console.error('Error al cargar listas:', error)
      } finally {
        setLoadingLists(false)
      }
    }
    loadLists()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [publicationsData, candidatesData] = await Promise.all([
          getPublicationsByProcess(process.id),
          getCandidatesByProcess(process.id),
        ])
        setPublications(publicationsData)
        setCandidates(candidatesData)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [process.id])

  const [showPortalManager, setShowPortalManager] = useState(false)
  const [customPortals, setCustomPortals] = useState<string[]>([
    "LinkedIn",
    "GetOnBoard",
    "Indeed",
    "Trabajando.com",
    "Laborum",
    "Behance",
  ])
  const [newPortalName, setNewPortalName] = useState("")

  const [newPublication, setNewPublication] = useState({
    portal: "",
    publication_date: "",
    status: "activa" as "activa" | "cerrada",
    url: "",
  })

  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    cv_file: null as File | null,
    motivation: "",
    salary_expectation: "",
    availability: "",
    source_portal: "",
    consultant_rating: 3,
    birth_date: "",
    age: 0,
    region: "",
    comuna: "",
    nacionalidad: "",
    rubro: "",
    profession: "",
    consultant_comment: "",
    has_disability_credential: false,
    work_experience: [] as WorkExperience[],
    education: [] as Education[],
    portal_responses: {
      motivation: "",
      salary_expectation: "",
      availability: "",
      family_situation: "",
      rating: 3,
      english_level: "",
      has_driving_license: false,
      software_tools: "",
    } as PortalResponses,
  })

  // Filtrar comunas cuando cambia la región en newCandidate
  useEffect(() => {
    if (newCandidate.region) {
      const regionSeleccionada = regiones.find(r => r.nombre_region === newCandidate.region)
      if (regionSeleccionada) {
        const filtradas = todasLasComunas.filter(
          c => c.id_region === regionSeleccionada.id_region
        )
        setComunasFiltradas(filtradas)
      }
    } else {
      setComunasFiltradas([])
    }
  }, [newCandidate.region, regiones, todasLasComunas])

  const [candidateDetails, setCandidateDetails] = useState({
    birth_date: "",
    age: 0,
    comuna: "",
    profession: "",
    consultant_comment: "",
    has_disability_credential: false,
    work_experience: [] as WorkExperience[],
    education: [] as Education[],
    portal_responses: {
      motivation: "",
      salary_expectation: "",
      availability: "",
      family_situation: "",
      rating: 3,
      english_level: "",
      has_driving_license: false,
      software_tools: "",
    } as PortalResponses,
  })

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
    type: "titulo" as "postgrado" | "capacitacion" | "titulo" | "curso",
    institution: "",
    title: "",
    start_date: "",
    completion_date: "",
    observations: "",
  })

  // Listener para sincronización con Módulo 3
  useEffect(() => {
    const checkForSyncData = () => {
      const syncKeys = Object.keys(localStorage).filter(key => key.startsWith('candidate_sync_'))
      
      syncKeys.forEach(key => {
        try {
          const syncData = JSON.parse(localStorage.getItem(key) || '{}')
          if (syncData.candidateId && syncData.status === "rechazado") {
            setCandidates((prevCandidates: Candidate[]) => {
              const existingCandidate = prevCandidates.find((c: Candidate) => c.id === syncData.candidateId)

              if (existingCandidate) {
                return prevCandidates.map((candidate: Candidate) =>
                  candidate.id === syncData.candidateId
                    ? {
                        ...candidate,
                        status: "rechazado" as const,
                        presentation_status: "rechazado" as const,
                        rejection_reason: syncData.rejection_reason
                      } as Candidate
                    : candidate
                )
              } else {
                // NOTA: getCandidatesByProcess ahora es async, no se puede usar aquí
                // Con la API real, se recargarán los datos automáticamente
                return prevCandidates
              }
            })
            localStorage.removeItem(key)
          }
        } catch (error) {
          console.error('Error processing sync data:', error)
        }
      })
    }

    // Check for sync data every 500ms
    const interval = setInterval(checkForSyncData, 500)

    return () => {
      clearInterval(interval)
    }
  }, [process.id])

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

  const handleAddPublication = () => {
    const publication: Publication = {
      id: Date.now().toString(),
      process_id: process.id,
      portal: newPublication.portal,
      publication_date: newPublication.publication_date,
      status: newPublication.status,
      url: newPublication.url,
    }
    setPublications([...publications, publication])
    setNewPublication({ portal: "", publication_date: "", status: "activa", url: "" })
    setShowAddPublication(false)
  }

  const handleAddCandidate = async () => {
    console.log('=== INICIANDO handleAddCandidate ===')
    console.log('Datos del formulario:', newCandidate)
    
    try {
      // Validar campos requeridos
      if (!newCandidate.name || !newCandidate.email || !newCandidate.phone) {
        console.log('Validación falló - campos vacíos')
        toast({
          title: "Error",
          description: "Por favor completa los campos obligatorios (Nombre, Email, Teléfono)",
          variant: "destructive",
        })
        return
      }

      console.log('Validación OK - preparando datos...')

      // Preparar datos para enviar al backend
      const candidateData = {
        name: newCandidate.name,
        email: newCandidate.email,
        phone: newCandidate.phone,
        birth_date: newCandidate.birth_date || undefined,
        comuna: newCandidate.comuna || undefined,
        nacionalidad: newCandidate.nacionalidad || undefined,
        rubro: newCandidate.rubro || undefined,
        profession: newCandidate.profession || undefined,
        english_level: newCandidate.portal_responses?.english_level || undefined,
        software_tools: newCandidate.portal_responses?.software_tools || undefined,
        has_disability_credential: newCandidate.has_disability_credential,
        work_experience: newCandidate.work_experience.length > 0 
          ? newCandidate.work_experience.map(exp => ({
              company: exp.company,
              position: exp.position,
              start_date: exp.start_date,
              end_date: exp.end_date,
              description: exp.description,
            }))
          : undefined,
        education: newCandidate.education.length > 0
          ? newCandidate.education.map(edu => ({
              id_postgrado_capacitacion: Number(edu.title),
              id_institucion: edu.institution ? Number(edu.institution) : undefined,
              completion_date: edu.completion_date,
            }))
          : undefined,
      }

      console.log('Datos preparados para enviar:', candidateData)
      console.log('Llamando al API...')

      // Llamar al API
      const response = await candidatoService.create(candidateData)
      
      console.log('Respuesta del API:', response)

      if (response.success) {
        console.log('¡Candidato creado exitosamente!')
        toast({
          title: "¡Éxito!",
          description: "Candidato agregado correctamente",
        })

        // Recargar la lista de candidatos
        console.log('Recargando lista de candidatos...')
        const candidatesData = await getCandidatesByProcess(process.id)
        setCandidates(candidatesData)

        // Limpiar formulario
        setNewCandidate({
          name: "",
          email: "",
          phone: "",
          cv_file: null,
          motivation: "",
          salary_expectation: "",
          availability: "",
          source_portal: "",
          consultant_rating: 3,
          birth_date: "",
          age: 0,
          region: "",
          comuna: "",
          nacionalidad: "",
          rubro: "",
          profession: "",
          consultant_comment: "",
          has_disability_credential: false,
          work_experience: [],
          education: [],
          portal_responses: {
            motivation: "",
            salary_expectation: "",
            availability: "",
            family_situation: "",
            rating: 3,
            english_level: "",
            has_driving_license: false,
            software_tools: "",
          },
        })
        setShowAddCandidate(false)
        console.log('Proceso completado')
      } else {
        console.error('La respuesta no fue exitosa:', response)
        toast({
          title: "Error",
          description: response.message || "Error al guardar candidato",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('=== ERROR EN handleAddCandidate ===')
      console.error('Tipo de error:', error)
      console.error('Mensaje:', error.message)
      console.error('Stack:', error.stack)
      
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el candidato. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate({
      ...candidate,
      // Asegurar que todos los campos opcionales estén definidos
      address: candidate.address || "",
      has_disability_credential: candidate.has_disability_credential || false,
      education: candidate.education || [],
      work_experience: candidate.work_experience || [],
      portal_responses: {
        motivation: candidate.portal_responses?.motivation || "",
        salary_expectation: candidate.portal_responses?.salary_expectation || "",
        availability: candidate.portal_responses?.availability || "",
        family_situation: candidate.portal_responses?.family_situation || "",
        rating: candidate.portal_responses?.rating || 3,
        english_level: candidate.portal_responses?.english_level || "",
        has_driving_license: candidate.portal_responses?.has_driving_license || false,
        software_tools: candidate.portal_responses?.software_tools || "",
      }
    })
    setShowEditCandidate(true)
  }

  const handleSaveEditedCandidate = () => {
    if (!editingCandidate) return

    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === editingCandidate.id ? editingCandidate : candidate,
    )
    setCandidates(updatedCandidates)
    setEditingCandidate(null)
    setShowEditCandidate(false)
  }

  const handleViewCV = (candidate: Candidate) => {
    setViewingCV(candidate)
    setShowViewCV(true)
  }

  const handleDeleteCandidate = (candidateId: string) => {
    const updatedCandidates = candidates.filter((candidate) => candidate.id !== candidateId)
    setCandidates(updatedCandidates)
    setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId))
  }

  const handleCandidateSelection = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId])
    } else {
      setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId))
    }
  }

  const handleFilterCandidates = () => {
    const updatedCandidates = candidates.map((candidate) =>
      selectedCandidates.includes(candidate.id) ? { ...candidate, status: "presentado" as const } : candidate,
    )
    setCandidates(updatedCandidates)
    setSelectedCandidates([])
  }

  const handleRatingChange = (candidateId: string, rating: number) => {
    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, consultant_rating: rating } : candidate,
    )
    setCandidates(updatedCandidates)
  }

  const renderStars = (rating: number, candidateId: string, editable = true) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${editable ? "cursor-pointer" : ""}`}
            onClick={editable ? () => handleRatingChange(candidateId, star) : undefined}
          />
        ))}
      </div>
    )
  }

  const handleAddPortal = () => {
    if (newPortalName.trim() && !customPortals.includes(newPortalName.trim())) {
      setCustomPortals([...customPortals, newPortalName.trim()])
      setNewPortalName("")
    }
  }

  const handleDeletePortal = (portalName: string) => {
    // Don't allow deletion of default portals
    const defaultPortals = ["LinkedIn", "GetOnBoard", "Indeed", "Trabajando.com", "Laborum", "Behance"]
    if (!defaultPortals.includes(portalName)) {
      setCustomPortals(customPortals.filter((portal) => portal !== portalName))
    }
  }

  const handleEnterCandidateData = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setCandidateDetails({
      birth_date: candidate.birth_date || "",
      age: candidate.age || 0,
      comuna: candidate.comuna || "",
      profession: candidate.profession || "",
      consultant_comment: candidate.consultant_comment || "",
      has_disability_credential: candidate.has_disability_credential || false,
      work_experience: candidate.work_experience || [],
      education: candidate.education || [],
      portal_responses: candidate.portal_responses || {
        motivation: "",
        salary_expectation: "",
        availability: "",
        family_situation: "",
        rating: 3,
        english_level: "",
        has_driving_license: false,
        software_tools: "",
      },
    })
    setCurrentStep("basic")
    setShowCandidateDetails(true)
  }

  const handleSaveCandidateDetails = () => {
    if (!selectedCandidate) return

    const updatedCandidate = {
      ...selectedCandidate,
      birth_date: candidateDetails.birth_date,
      age: candidateDetails.age,
      comuna: candidateDetails.comuna,
      profession: candidateDetails.profession,
      consultant_comment: candidateDetails.consultant_comment,
      has_disability_credential: candidateDetails.has_disability_credential,
      work_experience: candidateDetails.work_experience,
      education: candidateDetails.education,
      portal_responses: candidateDetails.portal_responses,
    }

    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === selectedCandidate.id ? updatedCandidate : candidate,
    )
    setCandidates(updatedCandidates)
    setShowCandidateDetails(false)
    setSelectedCandidate(null)
  }

  const handleAddWorkExperience = () => {
    const experience: WorkExperience = {
      id: Date.now().toString(),
      ...newWorkExperience,
    }
    setCandidateDetails({
      ...candidateDetails,
      work_experience: [...candidateDetails.work_experience, experience],
    })
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

  const handleAddEducation = () => {
    const education: Education = {
      id: Date.now().toString(),
      ...newEducation,
    }
    setCandidateDetails({
      ...candidateDetails,
      education: [...candidateDetails.education, education],
    })
    setNewEducation({
      type: "titulo",
      institution: "",
      title: "",
      start_date: "",
      completion_date: "",
      observations: "",
    })
  }

  const handleTogglePresentationStatus = (candidateId: string, currentStatus?: string) => {
    const newStatus = currentStatus === "presentado" ? "no_presentado" : "presentado"
    const updatedCandidates = candidates.map((candidate) => {
      if (candidate.id === candidateId) {
        const updatedCandidate: Candidate = {
          ...candidate,
          presentation_status: newStatus as "presentado" | "no_presentado" | "rechazado",
          rejection_reason: newStatus === "presentado" ? undefined : candidate.rejection_reason,
        }

        if (newStatus === "no_presentado") {
          // Keep them in current status but mark as not presented - they don't advance to Module 3
          updatedCandidate.status = candidate.status
        } else if (newStatus === "presentado") {
          // Only presented candidates can advance to Module 3
          updatedCandidate.status = "presentado"
        }

        return updatedCandidate
      }
      return candidate
    })
    setCandidates(updatedCandidates)
  }

  const handleRejectionReason = (candidateId: string, reason: string) => {
    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, rejection_reason: reason } : candidate,
    )
    setCandidates(updatedCandidates)
  }

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Módulo 2 - Búsqueda y Registro de Candidatos</h2>
          <p className="text-muted-foreground">Gestiona la búsqueda de candidatos y publicaciones en portales</p>
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
        <h2 className="text-2xl font-bold mb-2">Módulo 2 - Búsqueda y Registro de Candidatos</h2>
        <p className="text-muted-foreground">Gestiona la búsqueda de candidatos y publicaciones en portales</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gestión de Portales
              </CardTitle>
              <CardDescription>Administra los portales de publicación disponibles</CardDescription>
            </div>
            <Dialog open={showPortalManager} onOpenChange={setShowPortalManager}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Gestionar Portales
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gestión de Portales de Publicación</DialogTitle>
                  <DialogDescription>
                    Agrega nuevos portales o gestiona los existentes para las publicaciones
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="new_portal">Nuevo Portal</Label>
                      <Input
                        id="new_portal"
                        value={newPortalName}
                        onChange={(e) => setNewPortalName(e.target.value)}
                        placeholder="Nombre del portal (ej: CompuTrabajo, ZonaJobs)"
                        onKeyPress={(e) => e.key === "Enter" && handleAddPortal()}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddPortal} disabled={!newPortalName.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Portales Disponibles</Label>
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                      {customPortals.length > 0 ? (
                        <div className="space-y-2">
                          {customPortals.map((portal) => {
                            const isDefault = [
                              "LinkedIn",
                              "GetOnBoard",
                              "Indeed",
                              "Trabajando.com",
                              "Laborum",
                              "Behance",
                            ].includes(portal)
                            return (
                              <div key={portal} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{portal}</span>
                                  {isDefault && (
                                    <Badge variant="secondary" className="text-xs">
                                      Por defecto
                                    </Badge>
                                  )}
                                </div>
                                {!isDefault && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePortal(portal)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No hay portales configurados</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowPortalManager(false)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{customPortals.length}</p>
              <p className="text-sm text-muted-foreground">Portales Disponibles</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Settings className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {
                  customPortals.filter(
                    (p) => !["LinkedIn", "GetOnBoard", "Indeed", "Trabajando.com", "Laborum", "Behance"].includes(p),
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Portales Personalizados</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge className="h-8 w-8 text-green-500 mx-auto mb-2 flex items-center justify-center">
                {publications.filter((p) => p.status === "activa").length}
              </Badge>
              <p className="text-2xl font-bold">{publications.filter((p) => p.status === "activa").length}</p>
              <p className="text-sm text-muted-foreground">Publicaciones Activas</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="secondary" className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
                {publications.filter((p) => p.status === "cerrada").length}
              </Badge>
              <p className="text-2xl font-bold">{publications.filter((p) => p.status === "cerrada").length}</p>
              <p className="text-sm text-muted-foreground">Publicaciones Cerradas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Publicaciones en Portales
              </CardTitle>
              <CardDescription>Registra dónde se ha publicado la oferta de trabajo</CardDescription>
            </div>
            <Dialog open={showAddPublication} onOpenChange={setShowAddPublication}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Publicación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Publicación</DialogTitle>
                  <DialogDescription>Registra una nueva publicación en portal de empleo</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="portal">Portal</Label>
                    <Select
                      value={newPublication.portal}
                      onValueChange={(value) => setNewPublication({ ...newPublication, portal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar portal" />
                      </SelectTrigger>
                      <SelectContent>
                        {customPortals.map((portal) => (
                          <SelectItem key={portal} value={portal}>
                            {portal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publication_url">URL de la Publicación</Label>
                    <Input
                      id="publication_url"
                      value={newPublication.url}
                      onChange={(e) => setNewPublication({ ...newPublication, url: e.target.value })}
                      placeholder="https://ejemplo.com/oferta-trabajo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publication_date">Fecha de Publicación</Label>
                    <Input
                      id="publication_date"
                      type="date"
                      value={newPublication.publication_date}
                      onChange={(e) => setNewPublication({ ...newPublication, publication_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={newPublication.status}
                      onValueChange={(value: "activa" | "cerrada") =>
                        setNewPublication({ ...newPublication, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activa">Activa</SelectItem>
                        <SelectItem value="cerrada">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPublication(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddPublication}>Agregar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {publications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portal</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Fecha Publicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((publication) => (
                  <TableRow key={publication.id}>
                    <TableCell className="font-medium">{publication.portal}</TableCell>
                    <TableCell>
                      {publication.url ? (
                        <a
                          href={publication.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver publicación
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No especificada</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(publication.publication_date)}</TableCell>
                    <TableCell>
                      <Badge variant={publication.status === "activa" ? "default" : "secondary"}>
                        {publication.status === "activa" ? "Activa" : "Cerrada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay publicaciones registradas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Candidatos</CardTitle>
              <CardDescription>Gestiona los candidatos postulados al proceso</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Candidato
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl min-w-[800px] w-[90vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nuevo Candidato</DialogTitle>
                    <DialogDescription>
                      Registra un nuevo candidato para el proceso con toda su información
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Información Básica */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Información Básica</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="candidate_name">Nombre Completo</Label>
                          <Input
                            id="candidate_name"
                            value={newCandidate.name}
                            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                            placeholder="Nombre del candidato"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="candidate_email">Email</Label>
                          <Input
                            id="candidate_email"
                            type="email"
                            value={newCandidate.email}
                            onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="candidate_phone">Teléfono</Label>
                          <Input
                            id="candidate_phone"
                            value={newCandidate.phone}
                            onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                            placeholder="+56 9 1234 5678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                          <Input
                            id="birth_date"
                            type="date"
                            value={newCandidate.birth_date}
                            onChange={(e) => {
                              const age = calculateAge(e.target.value)
                              setNewCandidate({
                                ...newCandidate,
                                birth_date: e.target.value,
                                age: age,
                              })
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Edad</Label>
                          <Input id="age" type="number" value={newCandidate.age} readOnly className="bg-muted" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="region">Región</Label>
                          <Select
                            value={newCandidate.region}
                            onValueChange={(value) => {
                              setNewCandidate({ ...newCandidate, region: value, comuna: "" })
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
                            value={newCandidate.comuna}
                            onValueChange={(value) => setNewCandidate({ ...newCandidate, comuna: value })}
                            disabled={loadingLists || !newCandidate.region}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={newCandidate.region ? "Seleccione comuna" : "Primero seleccione región"} />
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
                            value={newCandidate.nacionalidad}
                            onValueChange={(value) => setNewCandidate({ ...newCandidate, nacionalidad: value })}
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rubro">Rubro</Label>
                          <Select
                            value={newCandidate.rubro}
                            onValueChange={(value) => setNewCandidate({ ...newCandidate, rubro: value })}
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
                        <div className="space-y-2">
                          <Label htmlFor="profession">Profesión</Label>
                          <Select
                            value={newCandidate.profession}
                            onValueChange={(value) => setNewCandidate({ ...newCandidate, profession: value })}
                            disabled={loadingLists}
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="source_portal">Portal de Origen</Label>
                          <Select
                            value={newCandidate.source_portal}
                            onValueChange={(value) => setNewCandidate({ ...newCandidate, source_portal: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar portal" />
                            </SelectTrigger>
                            <SelectContent>
                              {customPortals.map((portal) => (
                                <SelectItem key={portal} value={portal}>
                                  {portal}
                                </SelectItem>
                              ))}
                              <SelectItem value="Referido">Referido</SelectItem>
                              <SelectItem value="Directo">Contacto Directo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cv_file">CV (Archivo)</Label>
                          <Input
                            id="cv_file"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setNewCandidate({ ...newCandidate, cv_file: e.target.files?.[0] || null })}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_disability_credential"
                          checked={newCandidate.has_disability_credential}
                          onChange={(e) => setNewCandidate({ ...newCandidate, has_disability_credential: e.target.checked })}
                        />
                        <Label htmlFor="has_disability_credential">Cuenta con credencial de discapacidad</Label>
                      </div>
                    </div>

                    {/* Formación Académica */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Formación Académica (Opcional)</h3>

                      {/* Add Education Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Agregar Formación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select
                                value={newEducation.type}
                                onValueChange={(value: any) => setNewEducation({ ...newEducation, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="titulo">Título Profesional</SelectItem>
                                  <SelectItem value="postgrado">Postgrado</SelectItem>
                                  <SelectItem value="curso">Curso</SelectItem>
                                  <SelectItem value="capacitacion">Capacitación</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Institución</Label>
                              <Input
                                value={newEducation.institution}
                                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                placeholder="Universidad, instituto, etc."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Título/Nombre</Label>
                            <Input
                              value={newEducation.title}
                              onChange={(e) => setNewEducation({ ...newEducation, title: e.target.value })}
                              placeholder="Nombre del título, curso o capacitación"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Fecha Inicio</Label>
                              <Input
                                type="date"
                                value={newEducation.start_date}
                                onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha Término</Label>
                              <Input
                                type="date"
                                value={newEducation.completion_date}
                                onChange={(e) => setNewEducation({ ...newEducation, completion_date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea
                              value={newEducation.observations}
                              onChange={(e) => setNewEducation({ ...newEducation, observations: e.target.value })}
                              placeholder="Notas adicionales sobre la formación"
                              rows={2}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              if (newEducation.institution && newEducation.title) {
                                const education: Education = {
                                  id: Date.now().toString(),
                                  ...newEducation,
                                }
                                setNewCandidate({
                                  ...newCandidate,
                                  education: [...newCandidate.education, education],
                                })
                                setNewEducation({
                                  type: "titulo",
                                  institution: "",
                                  title: "",
                                  start_date: "",
                                  completion_date: "",
                                  observations: "",
                                })
                              }
                            }}
                            disabled={!newEducation.institution || !newEducation.title}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Formación
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Education List */}
                      {newCandidate.education.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Formaciones Agregadas</h4>
                          {newCandidate.education.map((edu, index) => (
                            <Card key={edu.id}>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline">{edu.type}</Badge>
                                      <span className="font-medium">{edu.title}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    {(edu.start_date || edu.completion_date) && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {edu.start_date && formatDate(edu.start_date)}
                                        {edu.start_date && edu.completion_date && " - "}
                                        {edu.completion_date && formatDate(edu.completion_date)}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedEducation = newCandidate.education.filter((_, i) => i !== index)
                                      setNewCandidate({ ...newCandidate, education: updatedEducation })
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                                          {/* Experiencia Laboral */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Experiencia Laboral (Opcional)</h3>

                      {/* Add Work Experience Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Agregar Experiencia</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Empresa</Label>
                              <Input
                                value={newWorkExperience.company}
                                onChange={(e) =>
                                  setNewWorkExperience({ ...newWorkExperience, company: e.target.value })
                                }
                                placeholder="Nombre de la empresa"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Cargo</Label>
                              <Input
                                value={newWorkExperience.position}
                                onChange={(e) =>
                                  setNewWorkExperience({ ...newWorkExperience, position: e.target.value })
                                }
                                placeholder="Título del cargo"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Fecha Inicio</Label>
                              <Input
                                type="date"
                                value={newWorkExperience.start_date}
                                onChange={(e) =>
                                  setNewWorkExperience({ ...newWorkExperience, start_date: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha Fin</Label>
                              <Input
                                type="date"
                                value={newWorkExperience.end_date}
                                onChange={(e) =>
                                  setNewWorkExperience({ ...newWorkExperience, end_date: e.target.value })
                                }
                                disabled={newWorkExperience.is_current}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="is_current_new"
                              checked={newWorkExperience.is_current}
                              onChange={(e) =>
                                setNewWorkExperience({
                                  ...newWorkExperience,
                                  is_current: e.target.checked,
                                  end_date: e.target.checked ? "" : newWorkExperience.end_date,
                                })
                              }
                            />
                            <Label htmlFor="is_current_new">Trabajo actual</Label>
                          </div>
                          <div className="space-y-2">
                            <Label>Descripción de Funciones</Label>
                            <Textarea
                              value={newWorkExperience.description}
                              onChange={(e) =>
                                setNewWorkExperience({ ...newWorkExperience, description: e.target.value })
                              }
                              placeholder="Principales responsabilidades y logros"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Comentarios</Label>
                            <Textarea
                              value={newWorkExperience.comments}
                              onChange={(e) => setNewWorkExperience({ ...newWorkExperience, comments: e.target.value })}
                              placeholder="Observaciones adicionales"
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Motivo de Salida (Opcional)</Label>
                            <Input
                              value={newWorkExperience.exit_reason}
                              onChange={(e) => setNewWorkExperience({ ...newWorkExperience, exit_reason: e.target.value })}
                              placeholder="Razón por la cual dejó el trabajo"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              if (newWorkExperience.company && newWorkExperience.position) {
                                const experience: WorkExperience = {
                                  id: Date.now().toString(),
                                  ...newWorkExperience,
                                }
                                setNewCandidate({
                                  ...newCandidate,
                                  work_experience: [...newCandidate.work_experience, experience],
                                })
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
                            }}
                            disabled={!newWorkExperience.company || !newWorkExperience.position}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Experiencia
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Work Experience List */}
                      {newCandidate.work_experience.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Experiencias Agregadas</h4>
                          {newCandidate.work_experience.map((exp, index) => (
                            <Card key={exp.id}>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{exp.position}</span>
                                      {exp.is_current && <Badge variant="default">Actual</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDate(exp.start_date)} -{" "}
                                      {exp.is_current
                                        ? "Presente"
                                        : exp.end_date
                                          ? formatDate(exp.end_date)
                                          : "No especificada"}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedExperience = newCandidate.work_experience.filter(
                                        (_, i) => i !== index,
                                      )
                                      setNewCandidate({ ...newCandidate, work_experience: updatedExperience })
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Respuestas del Portal */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Respuestas del Portal (Opcional)</h3>
                      <p className="text-sm text-muted-foreground">
                        Información adicional proporcionada por el candidato en el portal de empleo
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Motivación</Label>
                          <Textarea
                            value={newCandidate.portal_responses.motivation}
                            onChange={(e) =>
                              setNewCandidate({
                                ...newCandidate,
                                portal_responses: { ...newCandidate.portal_responses, motivation: e.target.value },
                              })
                            }
                            placeholder="¿Por qué está interesado en esta posición?"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expectativa de Renta</Label>
                            <Input
                              value={newCandidate.portal_responses.salary_expectation}
                              onChange={(e) =>
                                setNewCandidate({
                                  ...newCandidate,
                                  portal_responses: {
                                    ...newCandidate.portal_responses,
                                    salary_expectation: e.target.value,
                                  },
                                })
                              }
                              placeholder="Ej: $2.500.000 - $3.000.000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Disponibilidad del Postulante</Label>
                            <Select
                              value={newCandidate.portal_responses.availability}
                              onValueChange={(value) =>
                                setNewCandidate({
                                  ...newCandidate,
                                  portal_responses: { ...newCandidate.portal_responses, availability: value },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar disponibilidad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inmediata">Inmediata</SelectItem>
                                <SelectItem value="1 semana">1 semana</SelectItem>
                                <SelectItem value="2 semanas">2 semanas</SelectItem>
                                <SelectItem value="1 mes">1 mes</SelectItem>
                                <SelectItem value="2 meses">2 meses</SelectItem>
                                <SelectItem value="A convenir">A convenir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Situación Familiar</Label>
                          <Textarea
                            value={newCandidate.portal_responses.family_situation}
                            onChange={(e) =>
                              setNewCandidate({
                                ...newCandidate,
                                portal_responses: {
                                  ...newCandidate.portal_responses,
                                  family_situation: e.target.value,
                                },
                              })
                            }
                            placeholder="Información sobre situación familiar que pueda afectar la disponibilidad"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Manejo de Inglés (Nivel)</Label>
                            <Input
                              value={newCandidate.portal_responses.english_level}
                              onChange={(e) =>
                                setNewCandidate({
                                  ...newCandidate,
                                  portal_responses: { ...newCandidate.portal_responses, english_level: e.target.value },
                                })
                              }
                              placeholder="Ej: Básico, Intermedio, Avanzado"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Software o Herramientas</Label>
                            <Input
                              value={newCandidate.portal_responses.software_tools}
                              onChange={(e) =>
                                setNewCandidate({
                                  ...newCandidate,
                                  portal_responses: { ...newCandidate.portal_responses, software_tools: e.target.value },
                                })
                              }
                              placeholder="Ej: Excel, Photoshop, AutoCAD"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_driving_license"
                            checked={newCandidate.portal_responses.has_driving_license}
                            onChange={(e) =>
                              setNewCandidate({
                                ...newCandidate,
                                portal_responses: { ...newCandidate.portal_responses, has_driving_license: e.target.checked },
                              })
                            }
                          />
                          <Label htmlFor="has_driving_license">Licencia de Conducir</Label>
                        </div>

                      </div>
                    </div>


                    {/* Evaluación del Consultor */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Evaluación del Consultor</h3>

                      <div className="space-y-2">
                        <Label>Comentario del Consultor</Label>
                        <Textarea
                          value={newCandidate.consultant_comment}
                          onChange={(e) => setNewCandidate({ ...newCandidate, consultant_comment: e.target.value })}
                          placeholder="Observaciones y comentarios sobre el candidato"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Valoración del Consultor</Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-6 w-6 cursor-pointer ${
                                star <= newCandidate.consultant_rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              onClick={() => setNewCandidate({ ...newCandidate, consultant_rating: star })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddCandidate(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCandidate}>Agregar Candidato</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {candidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Portal Origen</TableHead>
                  <TableHead>Valoración</TableHead>
                  <TableHead>Estado Módulo 2</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow 
                    key={candidate.id}
                    className={candidate.status === "rechazado" ? "bg-red-50/50 border-l-4 border-l-red-400" : ""}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.source_portal || "No especificado"}</TableCell>
                    <TableCell>{renderStars(candidate.consultant_rating, candidate.id)}</TableCell>
                    <TableCell>
                      {candidate.status === "rechazado" ? (
                        <div className="flex flex-col gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                              Rechazado
                            </Badge>
                            <span className="text-xs text-red-600 font-medium">
                              Módulo 3
                            </span>
                          </div>
                          {candidate.rejection_reason && (
                            <div className="text-xs text-red-700 bg-red-100 p-2 rounded border-l-2 border-red-300">
                              <strong>Motivo:</strong> {candidate.rejection_reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Select
                            value={candidate.presentation_status || "no_presentado"}
                            onValueChange={(value: "presentado" | "no_presentado") => {
                              const updatedCandidates = candidates.map((c) =>
                                c.id === candidate.id ? { ...c, presentation_status: value } : c,
                              )
                              setCandidates(updatedCandidates)
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="presentado">Presentado</SelectItem>
                              <SelectItem value="no_presentado">No Presentado</SelectItem>
                            </SelectContent>
                          </Select>
                          {candidate.presentation_status === "no_presentado" && (
                            <Textarea
                              placeholder="Razón de no presentación"
                              value={candidate.rejection_reason || ""}
                              onChange={(e) => handleRejectionReason(candidate.id, e.target.value)}
                              className="text-xs"
                              rows={2}
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate">{candidate.consultant_comment || "Sin comentarios"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCandidate(candidate)}
                          title="Editar candidato"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          title="Eliminar candidato"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay candidatos registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Candidate Dialog */}
      <Dialog open={showEditCandidate} onOpenChange={setShowEditCandidate}>
        <DialogContent className="max-w-6xl min-w-[800px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Candidato</DialogTitle>
            <DialogDescription>Modifica la información del candidato</DialogDescription>
          </DialogHeader>
          {editingCandidate && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_candidate_name">Nombre Completo</Label>
                    <Input
                      id="edit_candidate_name"
                      value={editingCandidate.name}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_candidate_email">Email</Label>
                    <Input
                      id="edit_candidate_email"
                      type="email"
                      value={editingCandidate.email}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_candidate_phone">Teléfono</Label>
                    <Input
                      id="edit_candidate_phone"
                      value={editingCandidate.phone}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_candidate_birth_date">Fecha de Nacimiento</Label>
                    <Input
                      id="edit_candidate_birth_date"
                      type="date"
                      value={editingCandidate.birth_date}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, birth_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_source_portal">Portal de Origen</Label>
                    <Select
                      value={editingCandidate.source_portal || ""}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, source_portal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar portal" />
                      </SelectTrigger>
                      <SelectContent>
                        {customPortals.map((portal) => (
                          <SelectItem key={portal} value={portal}>
                            {portal}
                          </SelectItem>
                        ))}
                        <SelectItem value="Referido">Referido</SelectItem>
                        <SelectItem value="Directo">Contacto Directo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_candidate_address">Dirección</Label>
                    <Input
                      id="edit_candidate_address"
                      value={editingCandidate.address || ""}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_has_disability_credential"
                    checked={editingCandidate.has_disability_credential || false}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, has_disability_credential: e.target.checked })}
                  />
                  <Label htmlFor="edit_has_disability_credential">Cuenta con credencial de discapacidad</Label>
                </div>
              </div>

              {/* Formación Académica */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Formación Académica</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEducation = {
                        id: Date.now().toString(),
                        type: "titulo" as const,
                        institution: "",
                        title: "",
                        start_date: "",
                        completion_date: "",
                        observations: "",
                      }
                      setEditingCandidate({
                        ...editingCandidate,
                        education: [...(editingCandidate.education || []), newEducation]
                      })
                    }}
                  >
                    Agregar Educación
                  </Button>
                </div>
                {editingCandidate.education?.map((edu, index) => (
                  <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Educación {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCandidate({
                            ...editingCandidate,
                            education: editingCandidate.education?.filter(e => e.id !== edu.id) || []
                          })
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Educación</Label>
                        <Select
                          value={edu.type}
                          onValueChange={(value) => {
                            const updatedEducation = editingCandidate.education?.map(education =>
                              education.id === edu.id ? { ...education, type: value as "postgrado" | "capacitacion" | "titulo" | "curso" } : education
                            )
                            setEditingCandidate({ ...editingCandidate, education: updatedEducation })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="titulo">Título</SelectItem>
                            <SelectItem value="postgrado">Postgrado</SelectItem>
                            <SelectItem value="capacitacion">Capacitación</SelectItem>
                            <SelectItem value="curso">Curso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Institución</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => {
                            const updatedEducation = editingCandidate.education?.map(education =>
                              education.id === edu.id ? { ...education, institution: e.target.value } : education
                            )
                            setEditingCandidate({ ...editingCandidate, education: updatedEducation })
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={edu.title}
                        onChange={(e) => {
                          const updatedEducation = editingCandidate.education?.map(education =>
                            education.id === edu.id ? { ...education, title: e.target.value } : education
                          )
                          setEditingCandidate({ ...editingCandidate, education: updatedEducation })
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha de Inicio</Label>
                        <Input
                          type="date"
                          value={edu.start_date}
                          onChange={(e) => {
                            const updatedEducation = editingCandidate.education?.map(education =>
                              education.id === edu.id ? { ...education, start_date: e.target.value } : education
                            )
                            setEditingCandidate({ ...editingCandidate, education: updatedEducation })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de Finalización</Label>
                        <Input
                          type="date"
                          value={edu.completion_date}
                          onChange={(e) => {
                            const updatedEducation = editingCandidate.education?.map(education =>
                              education.id === edu.id ? { ...education, completion_date: e.target.value } : education
                            )
                            setEditingCandidate({ ...editingCandidate, education: updatedEducation })
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Observaciones</Label>
                      <Textarea
                        value={edu.observations || ""}
                        onChange={(e) => {
                          const updatedEducation = editingCandidate.education?.map(education =>
                            education.id === edu.id ? { ...education, observations: e.target.value } : education
                          )
                          setEditingCandidate({ ...editingCandidate, education: updatedEducation })
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Experiencia Laboral */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Experiencia Laboral</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newExperience = {
                        id: Date.now().toString(),
                        company: "",
                        position: "",
                        start_date: "",
                        end_date: "",
                        is_current: false,
                        description: "",
                        comments: "",
                        exit_reason: "",
                      }
                      setEditingCandidate({
                        ...editingCandidate,
                        work_experience: [...(editingCandidate.work_experience || []), newExperience]
                      })
                    }}
                  >
                    Agregar Experiencia
                  </Button>
                </div>
                {editingCandidate.work_experience?.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experiencia {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCandidate({
                            ...editingCandidate,
                            work_experience: editingCandidate.work_experience?.filter(e => e.id !== exp.id) || []
                          })
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Empresa</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const updatedExperience = editingCandidate.work_experience?.map(experience =>
                              experience.id === exp.id ? { ...experience, company: e.target.value } : experience
                            )
                            setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => {
                            const updatedExperience = editingCandidate.work_experience?.map(experience =>
                              experience.id === exp.id ? { ...experience, position: e.target.value } : experience
                            )
                            setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha de Inicio</Label>
                        <Input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => {
                            const updatedExperience = editingCandidate.work_experience?.map(experience =>
                              experience.id === exp.id ? { ...experience, start_date: e.target.value } : experience
                            )
                            setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de Finalización</Label>
                        <Input
                          type="date"
                          value={exp.end_date}
                          onChange={(e) => {
                            const updatedExperience = editingCandidate.work_experience?.map(experience =>
                              experience.id === exp.id ? { ...experience, end_date: e.target.value } : experience
                            )
                            setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                          }}
                          disabled={exp.is_current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit_current_${exp.id}`}
                        checked={exp.is_current}
                        onChange={(e) => {
                          const updatedExperience = editingCandidate.work_experience?.map(experience =>
                            experience.id === exp.id ? { ...experience, is_current: e.target.checked } : experience
                          )
                          setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                        }}
                      />
                      <Label htmlFor={`edit_current_${exp.id}`}>Trabajo actual</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción del Trabajo</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => {
                          const updatedExperience = editingCandidate.work_experience?.map(experience =>
                            experience.id === exp.id ? { ...experience, description: e.target.value } : experience
                          )
                          setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                        }}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Comentarios</Label>
                      <Textarea
                        value={exp.comments}
                        onChange={(e) => {
                          const updatedExperience = editingCandidate.work_experience?.map(experience =>
                            experience.id === exp.id ? { ...experience, comments: e.target.value } : experience
                          )
                          setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                        }}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Motivo de Salida (Opcional)</Label>
                      <Input
                        value={exp.exit_reason}
                        onChange={(e) => {
                          const updatedExperience = editingCandidate.work_experience?.map(experience =>
                            experience.id === exp.id ? { ...experience, exit_reason: e.target.value } : experience
                          )
                          setEditingCandidate({ ...editingCandidate, work_experience: updatedExperience })
                        }}
                        placeholder="Razón por la cual dejó el trabajo"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Respuestas del Portal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Respuestas del Portal</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Motivación</Label>
                    <Textarea
                      value={editingCandidate.portal_responses?.motivation || ""}
                      onChange={(e) => setEditingCandidate({
                        ...editingCandidate,
                        portal_responses: { ...editingCandidate.portal_responses, motivation: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expectativa Salarial</Label>
                      <Input
                        value={editingCandidate.portal_responses?.salary_expectation || ""}
                        onChange={(e) => setEditingCandidate({
                          ...editingCandidate,
                          portal_responses: { ...editingCandidate.portal_responses, salary_expectation: e.target.value }
                        })}
                        placeholder="Ej: $1,500,000 - $2,000,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Disponibilidad</Label>
                      <Input
                        value={editingCandidate.portal_responses?.availability || ""}
                        onChange={(e) => setEditingCandidate({
                          ...editingCandidate,
                          portal_responses: { ...editingCandidate.portal_responses, availability: e.target.value }
                        })}
                        placeholder="Ej: Inmediata, 2 semanas"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Situación Familiar</Label>
                    <Textarea
                      value={editingCandidate.portal_responses?.family_situation || ""}
                      onChange={(e) => setEditingCandidate({
                        ...editingCandidate,
                        portal_responses: { ...editingCandidate.portal_responses, family_situation: e.target.value }
                      })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Manejo de Inglés (Nivel)</Label>
                      <Input
                        value={editingCandidate.portal_responses?.english_level || ""}
                        onChange={(e) => setEditingCandidate({
                          ...editingCandidate,
                          portal_responses: { ...editingCandidate.portal_responses, english_level: e.target.value }
                        })}
                        placeholder="Ej: Básico, Intermedio, Avanzado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Software o Herramientas</Label>
                      <Input
                        value={editingCandidate.portal_responses?.software_tools || ""}
                        onChange={(e) => setEditingCandidate({
                          ...editingCandidate,
                          portal_responses: { ...editingCandidate.portal_responses, software_tools: e.target.value }
                        })}
                        placeholder="Ej: Excel, Photoshop, AutoCAD"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_has_driving_license"
                      checked={editingCandidate.portal_responses?.has_driving_license || false}
                      onChange={(e) => setEditingCandidate({
                        ...editingCandidate,
                        portal_responses: { ...editingCandidate.portal_responses, has_driving_license: e.target.checked }
                      })}
                    />
                    <Label htmlFor="edit_has_driving_license">Licencia de Conducir</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Valoración del Consultor</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= editingCandidate.consultant_rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => setEditingCandidate({ ...editingCandidate, consultant_rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCandidate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditedCandidate}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
