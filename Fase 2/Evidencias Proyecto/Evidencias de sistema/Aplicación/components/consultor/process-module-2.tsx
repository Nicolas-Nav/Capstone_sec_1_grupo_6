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

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale, setDefaultLocale } from "react-datepicker"
import { es } from "date-fns/locale"

// Configurar español como idioma por defecto
registerLocale("es", es)
setDefaultLocale("es")
import { Plus, Edit, Trash2, Star, Globe, Settings, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

import type { Process, Publication, Candidate, WorkExperience, Education, PortalResponses } from "@/lib/types"

import { regionService, comunaService, profesionService, rubroService, nacionalidadService, candidatoService, publicacionService, postulacionService, institucionService, solicitudService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { AddPublicationDialog } from "./add-publication-dialog"
import CVViewerDialog from "./cv-viewer-dialog"
import { CandidateStatusDialog } from "./candidate-status-dialog"


interface ProcessModule2Props {

  process: Process

}



export function ProcessModule2({ process }: ProcessModule2Props) {

  console.log('=== ProcessModule2 RENDERIZADO ===')
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

  const [instituciones, setInstituciones] = useState<any[]>([])

  const [postgrados, setPostgrados] = useState<any[]>([])

  const [loadingLists, setLoadingLists] = useState(true)


  // Estados para diálogos
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  const [showAddPublication, setShowAddPublication] = useState(false)

  const [showAddCandidate, setShowAddCandidate] = useState(false)

  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)

  const [showEditCandidate, setShowEditCandidate] = useState(false)

  // Estados para formularios múltiples de editar candidato
  const [editWorkExperienceForms, setEditWorkExperienceForms] = useState<any[]>([])
  const [editEducationForms, setEditEducationForms] = useState<any[]>([])

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

        const [regionesRes, comunasRes, profesionesRes, rubrosRes, nacionalidadesRes, portalesRes, institucionesRes] = await Promise.all([
          regionService.getAll(),

          comunaService.getAll(),

          profesionService.getAll(),

          rubroService.getAll(),

          nacionalidadService.getAll(),

          publicacionService.getPortales(), // Cargar portales de BD
          institucionService.getAll(), // Cargar instituciones

        ])

        setRegiones(regionesRes.data || [])

        setTodasLasComunas(comunasRes.data || [])

        setProfesiones(profesionesRes.data || [])

        setRubros(rubrosRes.data || [])

        setNacionalidades(nacionalidadesRes.data || [])

        setInstituciones(institucionesRes.data || [])

        setPortalesDB(portalesRes.data || [])
      } catch (error) {

        console.error('Error al cargar listas:', error)

      } finally {

        setLoadingLists(false)

      }

    }

    loadLists()

  }, [])



  useEffect(() => {

    if (process?.id && !isNaN(parseInt(process.id))) {
      loadData()
    }
  }, [process.id])

  // Efecto para configurar comunas filtradas cuando se abre el formulario de editar
  useEffect(() => {
    console.log('🔍 useEffect edit candidate:', { showEditCandidate, editingCandidateRegion: editingCandidate?.region, regionesLength: regiones.length, todasLasComunasLength: todasLasComunas.length })
    if (showEditCandidate && editingCandidate?.region) {
      const regionId = regiones.find(r => r.nombre_region === editingCandidate.region)?.id_region
      console.log('🔍 ID de región en useEffect:', regionId)
      if (regionId) {
        const comunasDeRegion = todasLasComunas.filter(comuna => comuna.id_region === regionId)
        console.log('🔍 Comunas filtradas en useEffect:', comunasDeRegion)
        setComunasFiltradas(comunasDeRegion)
      }
    }
  }, [showEditCandidate, editingCandidate?.region, regiones, todasLasComunas])

    const loadData = async () => {

      try {

        setIsLoading(true)

      
      // Validar que process.id sea válido
      const processId = parseInt(process.id)
      if (isNaN(processId)) {
        console.error('ID de proceso inválido en ProcessModule2:', process.id)
        return
      }
      
      // Cargar publicaciones desde el backend
      const publicationsResponse = await publicacionService.getAll({ solicitud_id: processId })
      const publicationsData = publicationsResponse.success && publicationsResponse.data ? publicationsResponse.data : []
      
      // Cargar candidatos desde el backend (postulaciones)
      const candidatesResponse = await postulacionService.getBySolicitud(processId)
      const candidatesData = candidatesResponse.success && candidatesResponse.data ? candidatesResponse.data : []
      
        setPublications(publicationsData)

        setCandidates(candidatesData)

      } catch (error) {

        console.error('Error al cargar datos:', error)

      toast({
        title: "Error",
        description: "Error al cargar datos del módulo",
        variant: "destructive",
      })
      } finally {

        setIsLoading(false)

      }

    }



  const [showPortalManager, setShowPortalManager] = useState(false)

  const [customPortals, setCustomPortals] = useState<string[]>([

    "LinkedIn",

    "GetOnBoard",

    "Indeed",

    "Trabajando.com",

    "Laborum",

    "Behance",

  ])

  const [portalesDB, setPortalesDB] = useState<any[]>([]) // Portales de la BD
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

    profession_institution: "",

    profession_date: "",

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



  // Formularios antiguos eliminados - ahora se usan workExperienceForms y educationForms

  // Estados para múltiples formularios de experiencia y educación
  const [workExperienceForms, setWorkExperienceForms] = useState<any[]>([
    {
      id: '1',
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    }
  ])
  const [educationForms, setEducationForms] = useState<any[]>([
    {
      id: '1',
      institution: '',
      title: '',
      start_date: '',
      completion_date: ''
    }
  ])

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

    console.log('Validando campos obligatorios...')
    
    // Validar que process.id sea válido
    const processId = parseInt(process.id)
    if (isNaN(processId)) {
      console.error('ID de proceso inválido en handleAddCandidate:', process.id)
        toast({

          title: "Error",

        description: "ID de proceso inválido",
          variant: "destructive",

        })

        return

      }



    // Validar campos requeridos con mensajes específicos (FUERA del try)
    console.log('Validando nombre:', newCandidate.name)
    if (!newCandidate.name || newCandidate.name.trim() === "") {
      console.log('❌ Nombre vacío - mostrando error')
      toast({
        title: "Campo obligatorio",
        description: "El nombre del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }
    console.log('✅ Nombre válido')
    
    console.log('Validando email:', newCandidate.email)
    if (!newCandidate.email || newCandidate.email.trim() === "") {
      console.log('❌ Email vacío - mostrando error')
      toast({
        title: "Campo obligatorio",
        description: "El email del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }
    console.log('✅ Email válido')
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newCandidate.email.trim())) {
      toast({
        title: "Campo obligatorio",
        description: "Ingresa un email válido (ej: candidato@ejemplo.com)",
        variant: "destructive",
      })
      return
    }
    
    // console.log('Validando teléfono:', newCandidate.phone)
    if (!newCandidate.phone || newCandidate.phone.trim() === "") {
      // console.log('❌ Teléfono vacío - mostrando error')
      toast({
        title: "Campo obligatorio",
        description: "El teléfono del candidato es obligatorio",
        variant: "destructive",
      })
      return
    }
    // console.log('✅ Teléfono válido')
    
    // Validar formato de teléfono (mínimo 8 dígitos)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
    if (!phoneRegex.test(newCandidate.phone.trim())) {
      toast({
        title: "Campo obligatorio",
        description: "Ingresa un teléfono válido (mínimo 8 dígitos)",
        variant: "destructive",
      })
      return
    }
    
    // Validar que se haya seleccionado un portal
    // console.log('Validando portal:', newCandidate.source_portal)
    if (!newCandidate.source_portal || newCandidate.source_portal.trim() === "") {
      // console.log('❌ Portal vacío - mostrando error')
      toast({
        title: "Campo obligatorio",
        description: "El portal de origen es obligatorio",
        variant: "destructive",
      })
      return
    }
    // console.log('✅ Portal válido')
    
    try {
      
      // Validar archivo CV si existe
      if (newCandidate.cv_file) {
        // Validar formato de archivo CV
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessorml.document']
        if (!allowedTypes.includes(newCandidate.cv_file.type)) {
          toast({
            title: "Campo obligatorio",
            description: "El CV debe ser un archivo PDF o Word (.pdf, .doc, .docx)",
            variant: "destructive",
          })
          return
        }
        
        // Validar tamaño del archivo (máximo 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (newCandidate.cv_file.size > maxSize) {
          toast({
            title: "Campo obligatorio",
            description: "El archivo CV no puede superar los 5MB",
            variant: "destructive",
          })
          return
        }
      }

      // console.log('Validación OK - preparando datos...')


      // Preparar datos para enviar al backend
      console.log('📊 Datos de experiencia (workExperienceForms):', workExperienceForms);
      console.log('📊 Datos de educación (educationForms):', educationForms);
      console.log('📊 Longitud de workExperienceForms:', workExperienceForms.length);
      console.log('📊 Longitud de educationForms:', educationForms.length);

      const candidateData = {

        name: newCandidate.name,

        email: newCandidate.email,

        phone: newCandidate.phone,

        birth_date: newCandidate.birth_date || undefined,

        comuna: newCandidate.comuna || undefined,

        nacionalidad: newCandidate.nacionalidad || undefined,

        rubro: newCandidate.rubro || undefined,

        // ✅ CORREGIDO: Enviar nombre de profesión, no ID
        profession: newCandidate.profession || undefined,

        // ✅ CORREGIDO: Enviar nombre de institución, no ID
        profession_institution: newCandidate.profession_institution || undefined,

        profession_date: newCandidate.profession_date || undefined,

        english_level: newCandidate.portal_responses?.english_level || undefined,

        software_tools: newCandidate.portal_responses?.software_tools || undefined,

        has_disability_credential: newCandidate.has_disability_credential,

        work_experience: workExperienceForms.length > 0 

          ? workExperienceForms
            .filter(exp => exp.company && exp.position) // Solo enviar formularios con datos válidos
            .map(exp => ({

              company: exp.company,

              position: exp.position,

              start_date: exp.start_date,

              end_date: exp.end_date,

              description: exp.description,

            }))

          : undefined,

        // ✅ CORREGIDO: Enviar título e institución como nombres, no IDs
        education: educationForms.length > 0

          ? educationForms
            .filter(edu => edu.title && edu.institution) // Solo enviar formularios con datos válidos
            .map(edu => ({

              title: edu.title, // ✅ Título del postgrado/capacitación

              institution: edu.institution, // ✅ Nombre de la institución

              completion_date: edu.completion_date,

            }))

          : undefined,

      }



      console.log('Datos preparados para enviar:', candidateData)

      console.log('Llamando al API...')



      // Llamar al API
      console.log('📊 Datos finales del candidato:', JSON.stringify(candidateData, null, 2));

      const response = await candidatoService.create(candidateData)

      

      console.log('Respuesta del API:', response)



      if (response.success && response.data) {
        console.log('¡Candidato creado exitosamente!', response.data)
        
        // Crear la postulación asociada
        try {
          console.log('Creando postulación...')
          // Asegurar que processId esté disponible
          const processIdForPostulation = parseInt(process.id)
          const postulacionData = {
            id_candidato: parseInt(response.data.id),
            id_solicitud: processIdForPostulation,
            id_portal_postulacion: newCandidate.source_portal ? parseInt(newCandidate.source_portal) : 1, // Por defecto: 1 = LinkedIn
            id_estado_candidato: 1, // 1 = "Presentado" (estado inicial)
            motivacion: newCandidate.portal_responses?.motivation || newCandidate.motivation,
            expectativa_renta: newCandidate.portal_responses?.salary_expectation 
              ? parseFloat(newCandidate.portal_responses.salary_expectation) 
              : (newCandidate.salary_expectation ? parseFloat(newCandidate.salary_expectation.toString()) : undefined),
            disponibilidad_postulacion: newCandidate.portal_responses?.availability || newCandidate.availability,
            valoracion: newCandidate.consultant_rating,
            comentario_no_presentado: newCandidate.consultant_comment,
            // Campos adicionales de postulación
            comentario_rech_obs_cliente: newCandidate.portal_responses?.rejection_reason || undefined,
            comentario_modulo5_cliente: newCandidate.portal_responses?.module5_comment || undefined,
            situacion_familiar: newCandidate.portal_responses?.family_situation || undefined,
            cv_file: newCandidate.cv_file || undefined // El archivo CV se maneja por separado
          }
          
          const postulacionResponse = await postulacionService.create(postulacionData)
          
          if (postulacionResponse.success) {
            // console.log('¡Postulación creada exitosamente!')
        toast({

          title: "¡Éxito!",

              description: "¡Candidato y postulación creados correctamente!",
              variant: "default",
            })
          } else {
            console.error('Error al crear postulación:', postulacionResponse)
            toast({
              title: "Campo obligatorio",
              description: "Candidato creado, pero hubo un error al crear la postulación",
              variant: "destructive",
            })
          }
        } catch (postError) {
          console.error('Error al crear postulación:', postError)
          toast({
            title: "Campo obligatorio",
            description: "Candidato creado, pero hubo un error al crear la postulación",
            variant: "destructive",
          })
        }

        // Recargar la lista de candidatos desde el backend
        // console.log('Recargando lista de candidatos...')
        await loadData()


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

          profession_institution: "",

          profession_date: "",

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

        // console.log('Proceso completado')
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

    console.log('🔍 Candidato para editar:', candidate)
    console.log('🔍 Región del candidato:', candidate.region)
    console.log('🔍 Comuna del candidato:', candidate.comuna)
    
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


    // Filtrar comunas basándose en la región del candidato
    if (candidate.region) {
      const regionId = regiones.find(r => r.nombre_region === candidate.region)?.id_region
      console.log('🔍 ID de región encontrado:', regionId)
      if (regionId) {
        const comunasDeRegion = todasLasComunas.filter(comuna => comuna.id_region === regionId)
        console.log('🔍 Comunas filtradas:', comunasDeRegion)
        setComunasFiltradas(comunasDeRegion)
      }
    }

    // Inicializar formularios múltiples con datos del candidato
    const workExperienceForms = candidate.work_experience && candidate.work_experience.length > 0
      ? candidate.work_experience.map((exp, index) => ({
        id: exp.id || `exp-${index}`,
        company: exp.company || '',
        position: exp.position || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        description: exp.description || ''
      }))
      : [{
        id: '1',
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: ''
      }]

    const educationForms = candidate.education && candidate.education.length > 0
      ? candidate.education.map((edu, index) => ({
        id: edu.id || `edu-${index}`,
        institution: edu.institution || '',
        title: edu.title || '',
        start_date: edu.start_date || '',
        completion_date: edu.completion_date || ''
      }))
      : [{
        id: '1',
        institution: '',
        title: '',
        start_date: '',
        completion_date: ''
      }]

    setEditWorkExperienceForms(workExperienceForms)
    setEditEducationForms(educationForms)

    setShowEditCandidate(true)

  }



  const handleSaveEditedCandidate = async () => {
    if (!editingCandidate) return



    try {
      console.log('Guardando cambios del candidato y postulación:', editingCandidate)

      // 1. Actualizar datos del CANDIDATO
      const candidateData = {
        name: editingCandidate.name,
        email: editingCandidate.email,
        phone: editingCandidate.phone,
        birth_date: editingCandidate.birth_date || undefined,
        comuna: editingCandidate.comuna || undefined,
        nacionalidad: editingCandidate.nacionalidad || undefined,
        rubro: editingCandidate.rubro || undefined,
        profession: editingCandidate.profession || undefined,
        english_level: editingCandidate.portal_responses?.english_level || undefined,
        software_tools: editingCandidate.portal_responses?.software_tools || undefined,
        has_disability_credential: editingCandidate.has_disability_credential,
        work_experience: editWorkExperienceForms.length > 0
          ? editWorkExperienceForms
            .filter(exp => exp.company && exp.position) // Solo enviar formularios con datos válidos
            .map(exp => ({
              company: exp.company,
              position: exp.position,
              start_date: exp.start_date,
              end_date: exp.end_date,
              description: exp.description,
            }))
          : undefined,
        education: editEducationForms.length > 0
          ? editEducationForms
            .filter(edu => edu.title && edu.institution) // Solo enviar formularios con datos válidos
            .map(edu => ({
              title: edu.title,
              institution: edu.institution,
              completion_date: edu.completion_date,
            }))
          : undefined,
      }

      const candidateResponse = await candidatoService.update(parseInt(editingCandidate.id), candidateData)

      if (!candidateResponse.success) {
        toast({
          title: "Error",
          description: candidateResponse.message || 'Error al actualizar candidato',
          variant: "destructive",
        })
        return
      }

      // 2. Actualizar datos de la POSTULACIÓN (motivacion, expectativa_renta, etc.)
      // Necesitamos buscar el id de la postulación
      const processId = parseInt(process.id)
      if (isNaN(processId)) {
        console.error('ID de proceso inválido en handleSaveEditedCandidate:', process.id)
        return
      }
      const postulaciones = await postulacionService.getBySolicitud(processId)
      
      // Buscar postulación por id_candidato (el "id" del objeto es el id_candidato)
      const postulacion = postulaciones.data?.find((p: any) => 
        p.id_candidato?.toString() === editingCandidate.id?.toString() || 
        p.id?.toString() === editingCandidate.id?.toString()
      )

      if (postulacion && postulacion.id_postulacion) {
        const postulacionData = {
          motivacion: editingCandidate.portal_responses?.motivation || editingCandidate.motivation,
          expectativa_renta: editingCandidate.portal_responses?.salary_expectation 
            ? parseFloat(editingCandidate.portal_responses.salary_expectation) 
            : (editingCandidate.salary_expectation ? parseFloat(editingCandidate.salary_expectation.toString()) : undefined),
          disponibilidad_postulacion: editingCandidate.portal_responses?.availability || editingCandidate.availability,
          valoracion: editingCandidate.consultant_rating,
          comentario_no_presentado: editingCandidate.consultant_comment
        }

        console.log('📤 Datos de postulación a enviar:', postulacionData)
        console.log('📤 ID de postulación:', postulacion.id_postulacion)
        console.log('📤 Valoración enviada:', postulacionData.valoracion)

        const postulacionResponse = await postulacionService.updateValoracion(postulacion.id_postulacion, postulacionData)
        
        console.log('📤 Respuesta del backend:', postulacionResponse)
        
        if (!postulacionResponse.success) {
          console.warn('❌ Error al actualizar postulación:', postulacionResponse.message)
        } else {
          console.log('✅ Postulación actualizada correctamente')
        }
      }

      toast({
        title: "¡Éxito!",
        description: "Candidato y postulación actualizados exitosamente",
        variant: "default",
      })
      
      // Recargar los candidatos desde el backend
      await loadData()

    setEditingCandidate(null)

    setShowEditCandidate(false)

    } catch (error: any) {
      console.error('Error al actualizar:', error)
      toast({
        title: "Error",
        description: error.message || 'Error al actualizar',
        variant: "destructive",
      })
    }
  }



  const handleViewCV = (candidate: Candidate) => {

    console.log('🔍 handleViewCV - Candidato seleccionado:', candidate)
    console.log('🔍 handleViewCV - candidate.id:', candidate.id)
    console.log('🔍 handleViewCV - candidate.cv_file:', candidate.cv_file)
    setViewingCV(candidate)

    setShowViewCV(true)

  }

  const handleAdvanceToModule3 = async () => {
    try {
      const response = await solicitudService.avanzarAModulo3(parseInt(process.id))

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: "Proceso avanzado al Módulo 3 exitosamente",
          variant: "default",
        })
        // Navegar al módulo 3 usando URL con parámetro
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('tab', 'modulo-3')
        window.location.href = currentUrl.toString()
      } else {
        toast({
          title: "Error",
          description: "Error al avanzar al Módulo 3",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al avanzar al Módulo 3:", error)
      toast({
        title: "Error",
        description: "Error al avanzar al Módulo 3",
        variant: "destructive",
      })
    }
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

            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"

            } ${editable ? "cursor-pointer" : ""}`}

            onClick={editable ? () => handleRatingChange(candidateId, star) : undefined}

          />

        ))}

      </div>

    )

  }



  const handleAddPortal = () => {

    // Validaciones
    if (!newPortalName || newPortalName.trim() === "") {
      toast({
        title: "Campo obligatorio",
        description: "El nombre del portal es obligatorio",
        variant: "destructive",
      })
      return
    }
    
    const portalName = newPortalName.trim()
    
    // Validar longitud mínima
    if (portalName.length < 3) {
      toast({
        title: "Nombre muy corto",
        description: "El nombre del portal debe tener al menos 3 caracteres",
        variant: "destructive",
      })
      return
    }
    
    // Validar que no exista
    if (customPortals.includes(portalName)) {
      toast({
        title: "Portal duplicado",
        description: "Este portal ya existe en la lista",
        variant: "destructive",
      })
      return
    }
    
    // Validar que no sea un portal por defecto
    const defaultPortals = ["LinkedIn", "GetOnBoard", "Indeed", "Trabajando.com", "Laborum", "Behance"]
    if (defaultPortals.includes(portalName)) {
      toast({
        title: "Portal por defecto",
        description: "Este portal ya está disponible por defecto",
        variant: "destructive",
      })
      return
    }
    
    // Agregar portal
    setCustomPortals([...customPortals, portalName])
    setNewPortalName("")
    
    toast({
      title: "¡Éxito!",
      description: `Portal "${portalName}" agregado correctamente`,
      variant: "default",
    })
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



  // Funciones antiguas eliminadas - ahora se usan workExperienceForms y educationForms

  // Funciones para manejar múltiples formularios de experiencia
  const addWorkExperienceForm = () => {
    const newForm = {
      id: Date.now().toString(),
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: ""
    }
    setWorkExperienceForms([...workExperienceForms, newForm])
  }

  const updateWorkExperienceForm = (id: string, field: string, value: string) => {
    setWorkExperienceForms(forms => 
      forms.map(form => 
        form.id === id ? { ...form, [field]: value } : form
      )
    )
  }

  const removeWorkExperienceForm = (id: string) => {
    setWorkExperienceForms(forms => forms.filter(form => form.id !== id))
  }

  // Funciones para manejar múltiples formularios de educación
  const addEducationForm = () => {
    const newForm = {
      id: Date.now().toString(),
      institution: "",
      title: "",
      start_date: "",
      completion_date: ""
    }
    setEducationForms([...educationForms, newForm])
  }

  const updateEducationForm = (id: string, field: string, value: string) => {
    setEducationForms(forms => 
      forms.map(form => 
        form.id === id ? { ...form, [field]: value } : form
      )
    )
  }

  const removeEducationForm = (id: string) => {
    setEducationForms(forms => forms.filter(form => form.id !== id))
  }

  // Funciones para manejar formularios múltiples de editar candidato
  const addEditWorkExperienceForm = () => {
    const newForm = {
      id: Date.now().toString(),
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    }
    setEditWorkExperienceForms([...editWorkExperienceForms, newForm])
  }

  const updateEditWorkExperienceForm = (id: string, field: string, value: string) => {
    setEditWorkExperienceForms(forms =>
      forms.map(form =>
        form.id === id ? { ...form, [field]: value } : form
      )
    )
  }

  const removeEditWorkExperienceForm = (id: string) => {
    setEditWorkExperienceForms(forms => forms.filter(form => form.id !== id))
  }

  const addEditEducationForm = () => {
    const newForm = {
      id: Date.now().toString(),
      institution: '',
      title: '',
      start_date: '',
      completion_date: ''
    }
    setEditEducationForms([...editEducationForms, newForm])
  }

  const updateEditEducationForm = (id: string, field: string, value: string) => {
    setEditEducationForms(forms =>
      forms.map(form =>
        form.id === id ? { ...form, [field]: value } : form
      )
    )
  }

  const removeEditEducationForm = (id: string) => {
    setEditEducationForms(forms => forms.filter(form => form.id !== id))
  }

  const handleOpenStatusDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setStatusDialogOpen(true)
  }

  const handleStatusChangeSuccess = () => {
    // Recargar los candidatos para obtener los datos actualizados
    loadData()
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



  const handleRejectionReason = async (candidateId: string, reason: string) => {
    try {
      // Actualizar el estado local primero
    const updatedCandidates = candidates.map((candidate) =>

      candidate.id === candidateId ? { ...candidate, rejection_reason: reason } : candidate,

    )

    setCandidates(updatedCandidates)


      // Actualizar también en la API
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate && candidate.presentation_status && (candidate.presentation_status === "no_presentado" || candidate.presentation_status === "rechazado")) {
        const response = await candidatoService.updateStatus(
          parseInt(candidateId), 
          candidate.presentation_status, 
          reason
        );

        if (!response.success) {
          throw new Error(response.message || 'Error al actualizar comentario');
        }
      }
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el comentario",
        variant: "destructive",
      })
    }
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Módulo 2 - Búsqueda y Registro de Candidatos</h2>
          <p className="text-muted-foreground">Gestiona la búsqueda de candidatos y publicaciones en portales</p>
        </div>
        <Button
          onClick={handleAdvanceToModule3}
          className="bg-primary hover:bg-primary/90"
        >
          Pasar a Módulo 3
        </Button>
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

                      <Label htmlFor="new_portal">Nuevo Portal <span className="text-red-500">*</span></Label>
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

                {publications.filter((p: any) => p.estado_publicacion === "Activa").length}
              </Badge>

              <p className="text-2xl font-bold">{publications.filter((p: any) => p.estado_publicacion === "Activa").length}</p>
              <p className="text-sm text-muted-foreground">Publicaciones Activas</p>

            </div>

            <div className="text-center p-4 border rounded-lg">

              <Badge variant="secondary" className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">

                {publications.filter((p: any) => p.estado_publicacion === "Cerrada").length}
              </Badge>

              <p className="text-2xl font-bold">{publications.filter((p: any) => p.estado_publicacion === "Cerrada").length}</p>
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

            <Button onClick={() => setShowAddPublication(true)}>
                  <Plus className="mr-2 h-4 w-4" />

                  Agregar Publicación

                </Button>


            {/* Diálogo de Nueva Publicación */}
            <AddPublicationDialog
              open={showAddPublication}
              onOpenChange={setShowAddPublication}
              solicitudId={parseInt(process.id) || 0}
              onSuccess={loadData}
            />
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

                {publications.map((publication: any) => (
                  <TableRow key={publication.id}>

                    <TableCell className="font-medium">{publication.portal?.nombre || 'Portal no especificado'}</TableCell>
                    <TableCell>

                      {publication.url_publicacion ? (
                        <a

                          href={publication.url_publicacion}
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

                    <TableCell>{formatDate(publication.fecha_publicacion)}</TableCell>
                    <TableCell>

                      <Badge variant={publication.estado_publicacion === "Activa" ? "default" : "secondary"}>
                        {publication.estado_publicacion || 'Sin estado'}
                      </Badge>

                    </TableCell>

                    <TableCell>

                      <div className="flex items-center gap-2">

                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await publicacionService.delete(publication.id)
                              if (response.success) {
                                toast({
                                  title: "¡Éxito!",
                                  description: "Publicación eliminada",
                                  variant: "default",
                                })
                                loadData()
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Error al eliminar publicación",
                                variant: "destructive",
                              })
                            }
                          }}
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

                          <Label htmlFor="candidate_name">Nombre Completo <span className="text-red-500">*</span></Label>
                          <Input

                            id="candidate_name"

                            value={newCandidate.name}

                            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}

                            placeholder="Nombre del candidato"

                          />

                        </div>

                        <div className="space-y-2">

                          <Label htmlFor="candidate_email">Email <span className="text-red-500">*</span></Label>
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

                          <Label htmlFor="candidate_phone">Teléfono <span className="text-red-500">*</span></Label>
                          <Input

                            id="candidate_phone"

                            value={newCandidate.phone}

                            onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}

                            placeholder="+56 9 1234 5678"

                          />

                        </div>

                        <div className="space-y-2">

                          <Label htmlFor="birth_date">Fecha de Nacimiento</Label>

                          <DatePicker
                            selected={newCandidate.birth_date ? new Date(newCandidate.birth_date) : null}
                            onChange={(date) => {
                              if (date) {
                                const age = calculateAge(date.toISOString().split('T')[0])
                              setNewCandidate({

                                ...newCandidate,

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


                      </div>



                      <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-2">

                          <Label htmlFor="source_portal">
                            Portal de Origen <span className="text-red-500">*</span>
                          </Label>
                          <Select

                            value={newCandidate.source_portal}

                            onValueChange={(value) => setNewCandidate({ ...newCandidate, source_portal: value })}

                            disabled={loadingLists}
                          >

                            <SelectTrigger>

                              <SelectValue placeholder={loadingLists ? "Cargando portales..." : "Seleccionar portal"} />
                            </SelectTrigger>

                            <SelectContent>

                              {portalesDB.map((portal) => (
                                <SelectItem key={portal.id} value={portal.id.toString()}>
                                  {portal.nombre}
                                </SelectItem>

                              ))}

                            </SelectContent>

                          </Select>

                          <p className="text-xs text-muted-foreground">
                            Portal desde donde proviene el candidato
                          </p>
                        </div>

                        <div className="space-y-2">

                          <Label htmlFor="cv_file">CV (Archivo) <span className="text-red-500">*</span></Label>
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



                    {/* Profesión */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Profesión (Opcional)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profession">Profesión</Label>
                          <Input
                            id="profession"
                            value={newCandidate.profession || ''}
                            onChange={(e) => setNewCandidate({ ...newCandidate, profession: e.target.value })}
                            placeholder="Ej: Ingeniero en Sistemas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profession_institution">Institución</Label>
                          <Select
                            value={newCandidate.profession_institution || ''}
                            onValueChange={(value) => setNewCandidate({ ...newCandidate, profession_institution: value })}
                            disabled={loadingLists}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione institución" />
                            </SelectTrigger>
                            <SelectContent>
                              {instituciones.map((inst) => (
                                <SelectItem key={inst.id_institucion} value={inst.nombre_institucion}>
                                  {inst.nombre_institucion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profession_date">Fecha de Obtención</Label>
                        <DatePicker
                          selected={newCandidate.profession_date ? new Date(newCandidate.profession_date) : null}
                          onChange={(date) => {
                            if (date) {
                              setNewCandidate({ ...newCandidate, profession_date: date.toISOString().split('T')[0] })
                            }
                          }}
                          dateFormat="dd/MM/yyyy"
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                          placeholderText="Selecciona fecha de obtención"
                          className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          maxDate={new Date()}
                          minDate={new Date("1900-01-01")}
                          yearDropdownItemNumber={100}
                          locale="es"
                        />
                      </div>
                    </div>



                    {/* Formación Académica */}

                    <div className="space-y-4">

                      <div className="flex items-center justify-between">

                        <h3 className="text-lg font-semibold border-b pb-2">Postgrados o Capacitaciones (Opcional)</h3>

                        <Button

                          type="button"

                          variant="outline"

                          size="sm"

                          onClick={addEducationForm}

                        >

                          <Plus className="mr-2 h-4 w-4" />

                          Agregar Otra Capacitación

                        </Button>

                      </div>



                      {/* Multiple Education Forms */}

                      {educationForms.map((form, index) => (

                        <Card key={form.id}>

                          <CardHeader>

                            <div className="flex items-center justify-between">

                              <CardTitle className="text-base">

                                Capacitación {index + 1}

                              </CardTitle>

                              {educationForms.length > 1 && (

                                <Button

                                  type="button"

                                  variant="ghost"

                                  size="sm"

                                  onClick={() => removeEducationForm(form.id)}

                                >

                                  <Trash2 className="h-4 w-4" />

                                </Button>

                              )}

                            </div>

                          </CardHeader>

                          <CardContent className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">

                              <div className="space-y-2">

                                <Label>Nombre del Postgrado/Capacitación</Label>

                                <Input

                                  value={form.title}

                                  onChange={(e) => updateEducationForm(form.id, 'title', e.target.value)}

                                  placeholder="Ej: Magíster en Administración"

                                />

                              </div>

                              <div className="space-y-2">

                                <Label>Institución</Label>

                                <Select

                                  value={form.institution}

                                  onValueChange={(value) => updateEducationForm(form.id, 'institution', value)}

                                  disabled={loadingLists}

                                >

                                  <SelectTrigger>

                                    <SelectValue placeholder="Seleccione institución" />

                                  </SelectTrigger>

                                  <SelectContent>

                                    {instituciones.map((inst) => (

                                      <SelectItem key={inst.id_institucion} value={inst.nombre_institucion}>

                                        {inst.nombre_institucion}

                                      </SelectItem>

                                    ))}

                                  </SelectContent>

                                </Select>

                              </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                              <div className="space-y-2">

                                <Label>Fecha de Inicio</Label>

                                <DatePicker
                                  selected={form.start_date ? new Date(form.start_date) : null}
                                  onChange={(date) => {
                                    if (date) {
                                      updateEducationForm(form.id, 'start_date', date.toISOString().split('T')[0])
                                    }
                                  }}
                                  dateFormat="dd/MM/yyyy"
                                  showYearDropdown
                                  showMonthDropdown
                                  dropdownMode="select"
                                  placeholderText="Selecciona fecha de inicio"
                                  className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  maxDate={new Date()}
                                  minDate={new Date("1900-01-01")}
                                  yearDropdownItemNumber={100}
                                  locale="es"
                                />

                              </div>

                              <div className="space-y-2">

                                <Label>Fecha Final</Label>

                                <DatePicker
                                  selected={form.completion_date ? new Date(form.completion_date) : null}
                                  onChange={(date) => {
                                    if (date) {
                                      updateEducationForm(form.id, 'completion_date', date.toISOString().split('T')[0])
                                    }
                                  }}
                                  dateFormat="dd/MM/yyyy"
                                  showYearDropdown
                                  showMonthDropdown
                                  dropdownMode="select"
                                  placeholderText="Selecciona fecha final"
                                  className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  maxDate={new Date()}
                                  minDate={form.start_date ? new Date(form.start_date) : new Date("1900-01-01")}
                                  yearDropdownItemNumber={100}
                                  locale="es"
                                />

                              </div>

                            </div>

                          </CardContent>

                        </Card>

                      ))}

                      {/* Formulario antiguo de educación eliminado - ahora se usan educationForms */}

                      {/* 
                      <Card>

                        <CardHeader>

                          <CardTitle className="text-base">Agregar Formación</CardTitle>

                        </CardHeader>

                        <CardContent className="space-y-4">

                          <div className="space-y-2">

                            <Label>Institución</Label>

                            <Select

                              value={newEducation.institution}

                              onValueChange={(value) => setNewEducation({ ...newEducation, institution: value })}

                              disabled={loadingLists}

                            >

                              <SelectTrigger>

                                <SelectValue placeholder="Seleccione institución" />

                              </SelectTrigger>

                              <SelectContent>

                                {instituciones.map((inst) => (

                                  <SelectItem key={inst.id_institucion} value={inst.nombre_institucion}>

                                    {inst.nombre_institucion}

                                  </SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

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

                              <Label>Fecha Término</Label>

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

                                  institution: "",

                                  title: "",

                                  start_date: "",

                                  completion_date: "",

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

                      <div className="flex items-center justify-between">

                        <h3 className="text-lg font-semibold border-b pb-2">Experiencia Laboral (Opcional)</h3>

                        <Button

                          type="button"

                          variant="outline"

                          size="sm"

                          onClick={addWorkExperienceForm}

                        >

                          <Plus className="mr-2 h-4 w-4" />

                          Agregar Otra Experiencia

                        </Button>

                      </div>



                      {/* Multiple Work Experience Forms */}

                      {workExperienceForms.map((form, index) => (

                        <Card key={form.id}>

                          <CardHeader>

                            <div className="flex items-center justify-between">

                              <CardTitle className="text-base">

                                Experiencia {index + 1}

                              </CardTitle>

                              {workExperienceForms.length > 1 && (

                                <Button

                                  type="button"

                                  variant="ghost"

                                  size="sm"

                                  onClick={() => removeWorkExperienceForm(form.id)}

                                >

                                  <Trash2 className="h-4 w-4" />

                                </Button>

                              )}

                            </div>

                          </CardHeader>

                          <CardContent className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">

                              <div className="space-y-2">

                                <Label>Empresa</Label>

                                <Input

                                  value={form.company}

                                  onChange={(e) => updateWorkExperienceForm(form.id, 'company', e.target.value)}

                                  placeholder="Nombre de la empresa"

                                />

                              </div>

                              <div className="space-y-2">

                                <Label>Cargo</Label>

                                <Input

                                  value={form.position}

                                  onChange={(e) => updateWorkExperienceForm(form.id, 'position', e.target.value)}

                                  placeholder="Título del cargo"

                                />

                              </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                              <div className="space-y-2">

                                <Label>Fecha Inicio</Label>

                                <DatePicker
                                  selected={form.start_date ? new Date(form.start_date) : null}
                                  onChange={(date) => {
                                    if (date) {
                                      updateWorkExperienceForm(form.id, 'start_date', date.toISOString().split('T')[0])
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
                                  selected={form.end_date ? new Date(form.end_date) : null}
                                  onChange={(date) => {
                                    if (date) {
                                      updateWorkExperienceForm(form.id, 'end_date', date.toISOString().split('T')[0])
                                    }
                                  }}
                                  dateFormat="dd/MM/yyyy"
                                  showYearDropdown
                                  showMonthDropdown
                                  dropdownMode="select"
                                  placeholderText="Selecciona fecha"
                                  className="w-full p-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  maxDate={new Date()}
                                  minDate={form.start_date ? new Date(form.start_date) : undefined}
                                  yearDropdownItemNumber={50}
                                  locale="es"
                                />

                              </div>

                            </div>

                            <div className="space-y-2">

                              <Label>Descripción de Funciones</Label>

                              <Textarea

                                value={form.description}

                                onChange={(e) => updateWorkExperienceForm(form.id, 'description', e.target.value)}

                                placeholder="Principales responsabilidades y logros"

                                rows={3}

                              />

                            </div>

                          </CardContent>

                        </Card>

                      ))}

                      {/* Add Work Experience Form */}

                      {/* Formulario antiguo de experiencia eliminado - ahora se usan workExperienceForms */}
                      {/* 
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

                                locale="es"
                              />

                            </div>

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

                                  description: "",

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


                                    </div>

                                    <p className="text-sm text-muted-foreground">{exp.company}</p>

                                    <p className="text-xs text-muted-foreground mt-1">

                                      {formatDate(exp.start_date)} -{" "}

                                      {exp.end_date

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



                      <div className="space-y-2">

                        <Label>Valoración del Consultor</Label>

                        <div className="flex gap-1">

                          {[1, 2, 3, 4, 5].map((star) => (

                            <Star

                              key={star}

                              className={`h-6 w-6 cursor-pointer ${star <= newCandidate.consultant_rating

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

                      <div className="flex flex-col gap-2">
                        {/* Mostrar estado actual */}
                          <div className="flex items-center gap-2">

                          {candidate.presentation_status === "presentado" && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Presentado
                            </Badge>
                          )}
                          {candidate.presentation_status === "rechazado" && (
                            <Badge variant="destructive" className="text-xs">

                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>

                              Rechazado

                            </Badge>

                          )}
                          {candidate.presentation_status === "no_presentado" && (

                            <Badge variant="secondary" className="text-xs">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                              No Presentado
                            </Badge>
                          )}
                          {!candidate.presentation_status && (
                            <Badge variant="outline" className="text-xs">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                              Sin Estado
                            </Badge>
                          )}
                        </div>

                        {/* Botón para cambiar estado */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusDialog(candidate)}
                          className="text-xs h-7"
                        >
                          Cambiar Estado
                        </Button>

                      </div>
                    </TableCell>

                    <TableCell>

                      <div className="flex items-center gap-2">

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCV(candidate)}
                          title="Ver CV"
                          disabled={!candidate.cv_file}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
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

              {/* Información Básica - IGUAL QUE CREAR CANDIDATO */}
              <div className="space-y-4">

                <h3 className="text-lg font-semibold border-b pb-2">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label htmlFor="edit_candidate_name">Nombre Completo</Label>

                    <Input

                      id="edit_candidate_name"

                      value={editingCandidate.name}

                      onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}

                      placeholder="Nombre del candidato"
                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="edit_candidate_email">Email</Label>

                    <Input

                      id="edit_candidate_email"

                      type="email"

                      value={editingCandidate.email}

                      onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}

                      placeholder="correo@ejemplo.com"
                    />

                  </div>

                </div>



                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">

                    <Label htmlFor="edit_candidate_phone">Teléfono</Label>

                    <Input

                      id="edit_candidate_phone"

                      value={editingCandidate.phone}

                      onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })}

                      placeholder="+56 9 1234 5678"
                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="edit_birth_date">Fecha de Nacimiento</Label>
                     <DatePicker
                       selected={editingCandidate.birth_date ? new Date(editingCandidate.birth_date) : null}
                       onChange={(date) => {
                         if (date) {
                           const age = calculateAge(date.toISOString().split('T')[0])
                           setEditingCandidate({
                             ...editingCandidate,
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
                    <Label htmlFor="edit_age">Edad</Label>
                    <Input id="edit_age" type="number" value={editingCandidate.age} readOnly className="bg-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_region">Región</Label>
                    <Select
                      value={editingCandidate.region || ""}
                      onValueChange={(value) => {
                        console.log('🔍 Región seleccionada:', value)
                        setEditingCandidate({ ...editingCandidate, region: value })
                        // Filtrar comunas por región seleccionada
                        const comunasDeRegion = todasLasComunas.filter(comuna => 
                          comuna.id_region === regiones.find(r => r.nombre_region === value)?.id_region
                        )
                        setComunasFiltradas(comunasDeRegion)
                      }}
                      disabled={loadingLists}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione región">
                          {editingCandidate.region || "Seleccione región"}
                        </SelectValue>
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
                    <Label htmlFor="edit_candidate_comuna">Comuna</Label>
                    <Select
                      value={editingCandidate.comuna || ""}
                      onValueChange={(value) => {
                        console.log('🔍 Comuna seleccionada:', value)
                        setEditingCandidate({ ...editingCandidate, comuna: value })
                      }}
                      disabled={loadingLists}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione comuna">
                          {editingCandidate.comuna || "Seleccione comuna"}
                        </SelectValue>
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
                    <Label htmlFor="edit_nacionalidad">Nacionalidad</Label>
                    <Select
                      value={editingCandidate.nacionalidad || ""}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, nacionalidad: value })}
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

                    <Label htmlFor="edit_rubro">Rubro</Label>
                    <Select
                      value={editingCandidate.rubro || ""}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, rubro: value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_source_portal">
                      Portal de Origen <span className="text-red-500">*</span>
                    </Label>
                    <Select

                      value={editingCandidate.source_portal || ""}

                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, source_portal: value })}

                      disabled={loadingLists}
                    >

                      <SelectTrigger>

                        <SelectValue placeholder={loadingLists ? "Cargando portales..." : "Seleccionar portal"} />
                      </SelectTrigger>

                      <SelectContent>

                        {portalesDB.map((portal) => (
                          <SelectItem key={portal.id} value={portal.id.toString()}>
                            {portal.nombre}
                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                    <p className="text-xs text-muted-foreground">Portal desde donde proviene el candidato</p>
                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="edit_cv_file">CV (Archivo)</Label>
                    <Input

                      id="edit_cv_file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, cv_file: e.target.files?.[0]?.name || editingCandidate.cv_file })}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
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



              {/* Profesión (Opcional) */}

              <div className="space-y-4">

                <h3 className="text-lg font-semibold border-b pb-2">Profesión (Opcional)</h3>

                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label htmlFor="edit_profession">Profesión</Label>

                    <Input

                      id="edit_profession"

                      value={editingCandidate.profession || ''}

                      onChange={(e) => setEditingCandidate({ ...editingCandidate, profession: e.target.value })}

                      placeholder="Ej: Ingeniero en Sistemas"

                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="edit_profession_institution">Institución</Label>

                    <Select

                      value={(editingCandidate as any).profession_institution || ''}

                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, profession_institution: value } as any)}

                      disabled={loadingLists}

                    >

                      <SelectTrigger>

                        <SelectValue placeholder="Seleccione institución" />

                      </SelectTrigger>

                      <SelectContent>

                        {instituciones.map((inst) => (

                          <SelectItem key={inst.id_institucion} value={inst.nombre_institucion}>

                            {inst.nombre_institucion}

                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label htmlFor="edit_profession_date">Fecha de Obtención</Label>

                    <Input

                      id="edit_profession_date"

                      type="date"

                      value={(editingCandidate as any).profession_date || ''}

                      onChange={(e) => setEditingCandidate({ ...editingCandidate, profession_date: e.target.value } as any)}

                    />

                  </div>

                </div>

              </div>



              {/* Formación Académica - Sistema Nuevo de Formularios Múltiples */}

              <div className="space-y-4">

                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-semibold">Formación Académica</h3>

                      <Button

                        type="button"

                        variant="outline"

                        size="sm"

                    onClick={addEditEducationForm}

                  >

                    Agregar Educación

                  </Button>

                </div>

                {/* Multiple Education Forms */}
                {editEducationForms.map((form, index) => (

                  <Card key={form.id}>

                    <CardHeader>

                      <div className="flex justify-between items-center">

                        <CardTitle className="text-base">

                          Formación {index + 1}

                        </CardTitle>

                        {editEducationForms.length > 1 && (

                          <Button

                            type="button"

                            variant="outline"

                            size="sm"

                            onClick={() => removeEditEducationForm(form.id)}

                      >

                        Eliminar

                      </Button>

                        )}

                    </div>

                    </CardHeader>

                    <CardContent className="space-y-4">

                      <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">

                        <Label>Institución</Label>

                          <Select

                            value={form.institution}

                            onValueChange={(value) => updateEditEducationForm(form.id, 'institution', value)}

                            disabled={loadingLists}

                          >

                            <SelectTrigger>

                              <SelectValue placeholder="Seleccione institución" />

                            </SelectTrigger>

                            <SelectContent>

                              {instituciones.map((inst) => (

                                <SelectItem key={inst.id_institucion} value={inst.nombre_institucion}>

                                  {inst.nombre_institucion}

                                </SelectItem>

                              ))}

                            </SelectContent>

                          </Select>

                        </div>

                        <div className="space-y-2">

                          <Label>Título/Nombre</Label>

                          <Input

                            value={form.title}

                            onChange={(e) => updateEditEducationForm(form.id, 'title', e.target.value)}

                            placeholder="Nombre del título, curso o capacitación"

                          />

                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">

                          <Label>Fecha Inicio</Label>

                        <Input

                          type="date"

                            value={form.start_date}

                            onChange={(e) => updateEditEducationForm(form.id, 'start_date', e.target.value)}

                        />

                      </div>

                      <div className="space-y-2">

                          <Label>Fecha Término</Label>

                        <Input

                          type="date"

                            value={form.completion_date}

                            onChange={(e) => updateEditEducationForm(form.id, 'completion_date', e.target.value)}

                        />

                      </div>

                    </div>

                    </CardContent>

                  </Card>

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

                    onClick={addEditWorkExperienceForm}

                  >

                    Agregar Experiencia

                  </Button>

                </div>

                {/* Multiple Work Experience Forms */}
                {editWorkExperienceForms.map((form, index) => (

                  <Card key={form.id}>

                    <CardHeader>

                    <div className="flex justify-between items-center">

                        <CardTitle className="text-base">

                          Experiencia {index + 1}

                        </CardTitle>

                        {editWorkExperienceForms.length > 1 && (

                      <Button

                        type="button"

                        variant="outline"

                        size="sm"

                            onClick={() => removeEditWorkExperienceForm(form.id)}

                      >

                        Eliminar

                      </Button>

                        )}

                    </div>

                    </CardHeader>

                    <CardContent className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">

                        <Label>Empresa</Label>

                        <Input

                            value={form.company}

                            onChange={(e) => updateEditWorkExperienceForm(form.id, 'company', e.target.value)}

                            placeholder="Nombre de la empresa"

                        />

                      </div>

                      <div className="space-y-2">

                        <Label>Cargo</Label>

                        <Input

                            value={form.position}

                            onChange={(e) => updateEditWorkExperienceForm(form.id, 'position', e.target.value)}

                            placeholder="Título del cargo"

                        />

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">

                          <Label>Fecha Inicio</Label>

                        <Input

                          type="date"

                            value={form.start_date}

                            onChange={(e) => updateEditWorkExperienceForm(form.id, 'start_date', e.target.value)}

                        />

                      </div>

                      <div className="space-y-2">

                        <Label>Fecha de Finalización</Label>

                        <Input

                          type="date"

                            value={form.end_date}

                            onChange={(e) => updateEditWorkExperienceForm(form.id, 'end_date', e.target.value)}


                        />

                      </div>

                    </div>


                    <div className="space-y-2">

                        <Label>Descripción de Funciones</Label>

                      <Textarea

                          value={form.description}

                          onChange={(e) => updateEditWorkExperienceForm(form.id, 'description', e.target.value)}

                          placeholder="Principales responsabilidades y logros"

                        rows={3}

                      />

                    </div>

                    </CardContent>

                  </Card>

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

                          className={`h-6 w-6 cursor-pointer ${star <= editingCandidate.consultant_rating

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


      {/* Dialog para ver CV */}
      <CVViewerDialog
        candidate={viewingCV}
        isOpen={showViewCV}
        onClose={() => setShowViewCV(false)}
      />

      {/* Diálogo para cambiar estado del candidato */}
      <CandidateStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        candidate={selectedCandidate}
        onSuccess={handleStatusChangeSuccess}
      />
    </div>

  )

}

