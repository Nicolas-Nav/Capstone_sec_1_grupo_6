"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { mockProcesses, serviceTypeLabels, processStatusLabels, getHitosByProcess } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Building2, User, Calendar, Target, FileText, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { ProcessTimeline } from "@/components/consultor/process-timeline"
import { ProcessModule1 } from "@/components/consultor/process-module-1"
import { ProcessModule2 } from "@/components/consultor/process-module-2"
import { ProcessModule3 } from "@/components/consultor/process-module-3"
import { ProcessModule4 } from "@/components/consultor/process-module-4"
import { ProcessModule5 } from "@/components/consultor/process-module-5"
import { notFound } from "next/navigation"

interface ProcessPageProps {
  params: {
    id: string
  }
}

export default function ProcessPage({ params }: ProcessPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("modulo-1")

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

  const process = mockProcesses.find((p) => p.id === params.id && p.consultant_id === user.id)

  if (!process) {
    notFound()
  }


  const hitos = getHitosByProcess(process.id)

  // Determine which modules are available based on service type
  const getAvailableModules = () => {
    const modules = [{ id: "modulo-1", label: "Solicitud y Cargo", icon: FileText }]

    if (process.service_type === "proceso_completo" || process.service_type === "long_list") {
      modules.push({ id: "modulo-2", label: "Publicación y Candidatos", icon: Users })
      modules.push({ id: "modulo-3", label: "Presentación", icon: Target })
    }

    if (
      process.service_type === "proceso_completo" ||
      process.service_type === "evaluacion_psicolaboral" ||
      process.service_type === "test_psicolaboral"
    ) {
      modules.push({ id: "modulo-4", label: "Evaluación Psicolaboral", icon: CheckCircle })
    }

    if (process.service_type === "proceso_completo") {
      modules.push({ id: "modulo-5", label: "Seguimiento y Control", icon: Clock })
    }

    modules.push({ id: "timeline", label: "Línea de Tiempo", icon: Calendar })

    return modules
  }

  const availableModules = getAvailableModules()

  return (
    <div className="space-y-6">
      {/* Process Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{process.position_title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{process.client.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{process.client.contact_person}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Creado {formatDate(process.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{serviceTypeLabels[process.service_type]}</Badge>
          <Badge className={getStatusColor(process.status)}>{processStatusLabels[process.status]}</Badge>
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
            <div className="text-2xl font-bold">{process.vacancies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hitos Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {hitos.filter((h) => h.status === "completado").length}
            </div>
            <p className="text-xs text-muted-foreground">de {hitos.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {hitos.filter((h) => h.status === "en_progreso").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{hitos.filter((h) => h.status === "vencido").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Process Modules */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-6 h-auto p-0 bg-transparent">
                {availableModules.map((module) => (
                  <TabsTrigger
                    key={module.id}
                    value={module.id}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <module.icon className="h-4 w-4" />
                    <span className="text-xs text-center">{module.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="modulo-1" className="mt-0">
                <ProcessModule1 process={process} />
              </TabsContent>

              {(process.service_type === "proceso_completo" || process.service_type === "long_list") && (
                <TabsContent value="modulo-2" className="mt-0">
                  <ProcessModule2 process={process} />
                </TabsContent>
              )}

              {(process.service_type === "proceso_completo" || process.service_type === "long_list") && (
                <TabsContent value="modulo-3" className="mt-0">
                  <ProcessModule3 process={process} />
                </TabsContent>
              )}

              {(process.service_type === "proceso_completo" ||
                process.service_type === "evaluacion_psicolaboral" ||
                process.service_type === "test_psicolaboral") && (
                <TabsContent value="modulo-4" className="mt-0">
                  <ProcessModule4 process={process} />
                </TabsContent>
              )}

              {process.service_type === "proceso_completo" && (
                <TabsContent value="modulo-5" className="mt-0">
                  <ProcessModule5 process={process} />
                </TabsContent>
              )}

              <TabsContent value="timeline" className="mt-0">
                <ProcessTimeline process={process} hitos={hitos} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
