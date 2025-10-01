"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Calendar, Briefcase, Save, Edit, Upload, FileText, Download, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockUsers } from "@/lib/mock-data"
import type { ConsultantDocument } from "@/lib/types"

export default function PerfilPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+56 9 1234 5678",
    address: "Santiago, Chile",
    bio: "Consultor especializado en reclutamiento de perfiles tecnológicos con más de 5 años de experiencia.",
    joined_date: "2020-03-15",
    department: user?.role === "admin" ? "Administración" : "Consultoría",
  })

  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    file: null as File | null,
  })

  // Get current user's documents
  const currentUser = mockUsers.find((u) => u.id === user?.id)
  const userDocuments = currentUser?.documents || []

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    console.log("Saving profile data:", profileData)
    setIsEditing(false)
  }

  const handleUploadDocument = () => {
    if (!newDocument.file || !newDocument.name) return

    const document: ConsultantDocument = {
      id: `doc-${Date.now()}`,
      name: newDocument.name,
      file_path: `/documents/${user.id}/${newDocument.file.name}`,
      file_size: newDocument.file.size,
      uploaded_at: new Date().toISOString(),
      description: newDocument.description,
    }

    // In a real app, this would upload to server
    console.log("Uploading document:", document)

    // Reset form
    setNewDocument({ name: "", description: "", file: null })
    setIsUploadDialogOpen(false)
  }

  const handleDownloadDocument = (doc: ConsultantDocument) => {
    // In a real app, this would download from server
    console.log("Downloading document:", doc.name)
    // Simulate download
    const link = document.createElement("a")
    link.href = "#"
    link.download = doc.name
    link.click()
  }

  const handleDeleteDocument = (docId: string) => {
    // In a real app, this would delete from server
    console.log("Deleting document:", docId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
        </div>
        <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar" : "Editar"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {`${user.firstName} ${user.lastName}`.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-muted-foreground capitalize">{user.role}</p>
                <Badge variant="outline" className="mt-2">
                  {profileData.department}
                </Badge>
              </div>
              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Desde marzo 2020</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información de contacto y datos personales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
                placeholder="Describe tu experiencia y especialidades..."
              />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mis Documentos
              </CardTitle>
              <CardDescription>Gestiona tus documentos profesionales y certificaciones</CardDescription>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Subir Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Subir Nuevo Documento</DialogTitle>
                  <DialogDescription>Agrega un nuevo documento a tu perfil profesional</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Nombre del Documento</Label>
                    <Input
                      id="doc-name"
                      value={newDocument.name}
                      onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                      placeholder="Ej: CV_Actualizado_2024.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-description">Descripción (Opcional)</Label>
                    <Textarea
                      id="doc-description"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                      placeholder="Breve descripción del documento..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Archivo</Label>
                    <Input
                      id="doc-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files?.[0] || null })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos permitidos: PDF, DOC, DOCX, JPG, PNG. Máximo 10MB.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUploadDocument} disabled={!newDocument.file || !newDocument.name}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Documento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {userDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
              <p className="text-muted-foreground mb-4">
                Aún no has subido ningún documento. Comienza agregando tu CV o certificaciones.
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Subir Primer Documento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground">{doc.description || "Sin descripción"}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>Subido el {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Estadísticas de Actividad
          </CardTitle>
          <CardDescription>Resumen de tu actividad en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user.role === "admin" ? "12" : "8"}</div>
              <p className="text-sm text-muted-foreground">
                {user.role === "admin" ? "Solicitudes Creadas" : "Procesos Asignados"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.role === "admin" ? "8" : "5"}</div>
              <p className="text-sm text-muted-foreground">
                {user.role === "admin" ? "Procesos Completados" : "Procesos Finalizados"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.role === "admin" ? "24" : "18"}</div>
              <p className="text-sm text-muted-foreground">
                {user.role === "admin" ? "Reportes Generados" : "Candidatos Gestionados"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">95%</div>
              <p className="text-sm text-muted-foreground">
                {user.role === "admin" ? "Eficiencia General" : "Tasa de Éxito"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cuenta</CardTitle>
          <CardDescription>Gestiona la configuración y preferencias de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificaciones por Email</h4>
              <p className="text-sm text-muted-foreground">Recibe alertas de hitos y actualizaciones por correo</p>
            </div>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cambiar Contraseña</h4>
              <p className="text-sm text-muted-foreground">Actualiza tu contraseña de acceso</p>
            </div>
            <Button variant="outline" size="sm">
              Cambiar
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Preferencias de Idioma</h4>
              <p className="text-sm text-muted-foreground">Configura el idioma de la interfaz</p>
            </div>
            <Badge variant="outline">Español</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
