"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/auth"
import { solicitudService, descripcionCargoService } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Building2, User, Calendar, Target, FileText, Users, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { ProcessTimeline } from "@/components/consultor/process-timeline"
import { ProcessModule1 } from "@/components/consultor/process-module-1"
import { ProcessModule2 } from "@/components/consultor/process-module-2"
import { ProcessModule3 } from "@/components/consultor/process-module-3"
import { ProcessModule4 } from "@/components/consultor/process-module-4"
import { ProcessModule5 } from "@/components/consultor/process-module-5"
import { notFound } from "next/navigation"
import { toast } from "sonner"

const serviceTypeLabels: Record<string, string> = {
  PC: "Proceso Completo",
  LL: "Long List",
  HH: "Head Hunting",
  TS: "Test Psicolaboral",
  ES: "Evaluación Psicolaboral"
}

const processStatusLabels: Record<string, string> = {
  creado: "Creado",
  en_progreso: "En Progreso",
  cerrado: "Cerrado",
  congelado: "Congelado"
}

interface ProcessPageProps {
  params: {
    id: string
  }
}

export default function ProcessPage({ params }: ProcessPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("modulo-1")
  const [process, setProcess] = useState<any>(null)
  const [descripcionCargo, setDescripcionCargo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Leer parámetro tab de la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['modulo-1', 'modulo-2', 'modulo-3', 'modulo-4', 'modulo-5'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadProcessData()
    }
  }, [params.id, user])

  const loadProcessData = async () => {
    try {
      setIsLoading(true)
      
      // Validar que el ID sea un número válido
      const processId = parseInt(params.id)
      if (isNaN(processId)) {
        console.error('ID de proceso inválido:', params.id)
        toast.error("ID de proceso inválido")
        notFound()
        return
      }
      
      const response = await solicitudService.getById(processId)
      
      if (response.success && response.data) {
        setProcess(response.data)
        
        // Cargar descripción de cargo si existe
        if (response.data.id_descripcion_cargo) {
          const dcResponse = await descripcionCargoService.getById(response.data.id_descripcion_cargo)
          if (dcResponse.success) {
            setDescripcionCargo(dcResponse.data)
          }
        }
      } else {
        toast.error("No se pudo cargar la solicitud")
        notFound()
      }
    } catch (error) {
      console.error("Error loading process:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.role !== "consultor") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando proceso...</p>
        </div>
      </div>
    )
  }

  if (!process) {
    notFound()
  }

  // Determine which modules are available based on service type and current stage
  const getAvailableModules = () => {
    const modules = []
    const serviceType = process.tipo_servicio || process.service_type
    const currentStage = process.etapa || process.stage

    // Módulo 1 - Siempre disponible
    modules.push({ 
      id: "modulo-1", 
      label: "Solicitud y Cargo", 
      icon: FileText, 
      enabled: true,
      isActive: activeTab === "modulo-1"
    })


    // Módulo 2 - Disponible si se ha avanzado al Módulo 2 o posterior
    const module2Enabled = currentStage === "Módulo 2: Publicación y Registro de Candidatos" || 
                           currentStage === "Módulo 3: Presentación de Candidatos" ||
                           currentStage === "Módulo 4: Evaluación Psicolaboral" ||
                           currentStage === "Módulo 5: Seguimiento Posterior a la Evaluación Psicolaboral"
    
    if (serviceType === "PC" || serviceType === "LL" || serviceType === "HH") {
      modules.push({ 
        id: "modulo-2", 
        label: "Publicación y Registro de Candidatos", 
        icon: Users, 
        enabled: module2Enabled,
        isActive: activeTab === "modulo-2"
      })
      modules.push({ 
        id: "modulo-3", 
        label: "Presentación de Candidatos", 
        icon: Target, 
        enabled: currentStage === "Módulo 3: Presentación de Candidatos",
        isActive: activeTab === "modulo-3"
      })
    }

    if (serviceType === "PC" || serviceType === "TS" || serviceType === "ES") {
      modules.push({ 
        id: "modulo-4", 
        label: "Evaluación Psicolaboral", 
        icon: CheckCircle, 
        enabled: currentStage === "Módulo 4: Evaluación Psicolaboral",
        isActive: activeTab === "modulo-4"
      })
    }

    if (serviceType === "PC") {
      modules.push({ 
        id: "modulo-5", 
        label: "Seguimiento Posterior a la Evaluación Psicolaboral", 
        icon: Clock, 
        enabled: currentStage === "Módulo 5: Seguimiento Posterior a la Evaluación Psicolaboral",
        isActive: activeTab === "modulo-5"
      })
    }

    modules.push({ 
      id: "timeline", 
      label: "Línea de Tiempo", 
      icon: Calendar, 
      enabled: true,
      isActive: activeTab === "timeline"
    })

    return modules
  }

  const availableModules = getAvailableModules()

  const handleAdvanceToModule2 = async () => {
    try {
      const response = await solicitudService.avanzarAModulo2(parseInt(params.id))
      
      if (response.success) {
        toast.success("Proceso avanzado al Módulo 2 exitosamente")
        // Recargar datos del proceso
        await loadProcessData()
        // Cambiar al módulo 2
        setActiveTab("modulo-2")
      } else {
        toast.error("Error al avanzar al Módulo 2")
      }
    } catch (error) {
      console.error("Error al avanzar al Módulo 2:", error)
      toast.error("Error al avanzar al Módulo 2")
    }
  }

  return (
    <div className="space-y-6">
      {/* Process Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{process.cargo || process.position_title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{process.cliente}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{process.contact?.name || 'Sin contacto'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Creado {formatDate(process.fecha_creacion || process.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{serviceTypeLabels[process.tipo_servicio] || process.tipo_servicio_nombre}</Badge>
          <Badge className={getStatusColor(process.status)}>{process.estado_solicitud || processStatusLabels[process.status]}</Badge>
        </div>
      </div>

      {/* Process Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacantes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{process.vacancies || process.vacantes || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapa Actual</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-primary">
              {process.etapa || 'Sin etapa'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {process.estado_solicitud || 'Abierto'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Servicio</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {serviceTypeLabels[process.tipo_servicio] || process.tipo_servicio_nombre}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Modules */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 h-auto p-0 bg-transparent">
                {availableModules.map((module) => {
                  return (
                    <button
                      key={module.id}
                      onClick={() => module.enabled && setActiveTab(module.id)}
                      disabled={!module.enabled}
                      className={`flex flex-col items-center gap-1 p-2 sm:p-4 rounded-none border-b-2 transition-colors ${
                        module.isActive 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : module.enabled 
                            ? 'hover:bg-primary/10 text-primary border-transparent' 
                            : 'opacity-50 cursor-not-allowed text-muted-foreground border-transparent'
                      }`}
                    >
                      <module.icon className="h-4 w-4" />
                      <span className="text-xs sm:text-sm text-center leading-tight">{module.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="modulo-1" className="mt-0">
                <ProcessModule1 process={process} descripcionCargo={descripcionCargo} />
              </TabsContent>

              {(process.tipo_servicio === "PC" || process.tipo_servicio === "LL" || process.tipo_servicio === "HH") && (
                <TabsContent value="modulo-2" className="mt-0">
                  <ProcessModule2 process={process} />
                </TabsContent>
              )}

              {(process.tipo_servicio === "PC" || process.tipo_servicio === "LL" || process.tipo_servicio === "HH") && (
                <TabsContent value="modulo-3" className="mt-0">
                  <ProcessModule3 process={process} />
                </TabsContent>
              )}

              {(process.tipo_servicio === "PC" || process.tipo_servicio === "TS" || process.tipo_servicio === "ES") && (
                <TabsContent value="modulo-4" className="mt-0">
                  <ProcessModule4 process={process} />
                </TabsContent>
              )}

              {process.tipo_servicio === "PC" && (
                <TabsContent value="modulo-5" className="mt-0">
                  <ProcessModule5 process={process} />
                </TabsContent>
              )}

              <TabsContent value="timeline" className="mt-0">
                <ProcessTimeline process={process} hitos={[]} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
