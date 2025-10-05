"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building, Users, Phone, Mail, MapPin, User, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { CustomAlertDialog } from "@/components/CustomAlertDialog"
import { clientService, comunaService, apiUtils } from "@/lib/api"
import type { Client, ClientContact, Comuna } from "@/lib/types"
import { toast } from "sonner"
import { useClientes } from "@/hooks/useClientes"

export default function ClientesPage() {
  const {
    clients,
    isLoading,
    searchTerm,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    totalPages,
    totalClients,
    newClient,
    editingClient,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    setNewClient,
    setEditingClient,
    createClient,
    updateClient,
    deleteClient,
    goToPage,
    nextPage,
    prevPage,
    handlePageSizeChange,
  } = useClientes()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [resultSuccess, setResultSuccess] = useState<boolean>(false)
  const [resultMessage, setResultMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comunas, setComunas] = useState<Comuna[]>([])
  
  // Estado para confirmación de eliminación
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)

  // Los clientes ya vienen filtrados del servidor, no necesitamos filtrar en el cliente

  // Cargar comunas al montar el componente
  useEffect(() => {
    loadAllComunas()
  }, [])

  const loadAllComunas = async () => {
    try {
      const response = await comunaService.getAll()
      if (response.success && response.data) {
        setComunas(response.data)
      }
    } catch (error) {
      console.error('Error loading comunas:', error)
    }
  }

  const getClientProcessCount = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.processCount || 0
  }

  const addContact = () => {
    setNewClient({
      ...newClient,
      contacts: [
        ...newClient.contacts,
        {
          id: `contact-${Date.now()}`,
          name: "",
          email: "",
          phone: "",
          position: "",
          city: "",
          is_primary: false,
        },
      ],
    })
  }

  const removeContact = (index: number) => {
    if (newClient.contacts.length > 1) {
      const newContacts = newClient.contacts.filter((_, i) => i !== index)
      // If we removed the primary contact, make the first one primary
      if (newClient.contacts[index].is_primary && newContacts.length > 0) {
        newContacts[0].is_primary = true
      }
      setNewClient({ ...newClient, contacts: newContacts })
    }
  }

  const updateContact = (index: number, field: keyof ClientContact, value: string | boolean) => {
    const newContacts = [...newClient.contacts]
    if (field === "is_primary" && value === true) {
      // Only one contact can be primary
      newContacts.forEach((contact, i) => {
        contact.is_primary = i === index
      })
    } else {
      ;(newContacts[index] as any)[field] = value
    }
    setNewClient({ ...newClient, contacts: newContacts })
  }


  const validateForm = () => {
    if (!newClient.name.trim()) {
      toast.error('El nombre de la empresa es requerido')
      return false
    }

    for (let i = 0; i < newClient.contacts.length; i++) {
      const contact = newClient.contacts[i]
      if (!contact.name.trim()) {
        toast.error(`El nombre del contacto ${i + 1} es requerido`)
        return false
      }
      if (!contact.email.trim()) {
        toast.error(`El email del contacto ${i + 1} es requerido`)
        return false
      }
      if (!contact.phone.trim()) {
        toast.error(`El teléfono del contacto ${i + 1} es requerido`)
        return false
      }
    }

    return true
  }

  const handleCreateClient = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const result = await createClient()
      
      if (result.success) {
        setResultSuccess(true)
        setResultMessage(result.message || 'Cliente creado exitosamente')
        setIsCreateDialogOpen(false)
      } else {
        setResultSuccess(false)
        setResultMessage(result.message || 'Error al crear el cliente')
      }
      setIsResultOpen(true)
    } catch (error) {
      console.error('Error creating client:', error)
      setResultSuccess(false)
      setResultMessage('Error al crear el cliente')
      setIsResultOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewClient({
      name: "",
      contacts: [
        {
          id: "",
          name: "",
          email: "",
          phone: "",
          position: "",
          city: "",
          is_primary: true,
        },
      ],
    })
  }

  const handleEditClient = async () => {
    if (!editingClient || !validateForm()) return

    try {
      setIsSubmitting(true)
      const result = await updateClient()
      
      if (result.success) {
        setResultSuccess(true)
        setResultMessage(result.message || 'Cliente actualizado exitosamente')
        setIsEditDialogOpen(false)
      } else {
        setResultSuccess(false)
        setResultMessage(result.message || 'Error al actualizar el cliente')
      }
      setIsResultOpen(true)
    } catch (error) {
      console.error('Error updating client:', error)
      setResultSuccess(false)
      setResultMessage('Error al actualizar el cliente')
      setIsResultOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      const result = await deleteClient(clientToDelete)
      
      if (result.success) {
        setResultSuccess(true)
        setResultMessage(result.message || 'Cliente eliminado exitosamente')
      } else {
        setResultSuccess(false)
        setResultMessage(result.message || 'Error al eliminar el cliente')
      }
      setIsResultOpen(true)
    } catch (error) {
      console.error('Error deleting client:', error)
      setResultSuccess(false)
      setResultMessage('Error al eliminar el cliente')
      setIsResultOpen(true)
    } finally {
      setClientToDelete(null)
    }
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client as any)
    setNewClient({
      name: client.name,
      contacts: [...(client.contacts || [])],
    })
    setIsEditDialogOpen(true)
  }

  const getPrimaryContact = (client: Client) => {
    if (!client.contacts || client.contacts.length === 0) {
      return null
    }
    return client.contacts.find((contact) => contact.is_primary) || client.contacts[0]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra la información de contacto de tus clientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cliente</DialogTitle>
              <DialogDescription>Ingresa la información del nuevo cliente y sus contactos</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ej: Empresa ABC S.A."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Contactos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addContact}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Contacto
                  </Button>
                </div>

                {newClient.contacts.map((contact, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Contacto {index + 1}</span>
                        {contact.is_primary && (
                          <Badge variant="secondary" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      {newClient.contacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor={`contact-name-${index}`}>Nombre</Label>
                        <Input
                          id={`contact-name-${index}`}
                          value={contact.name}
                          onChange={(e) => updateContact(index, "name", e.target.value)}
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`contact-position-${index}`}>Cargo</Label>
                        <Input
                          id={`contact-position-${index}`}
                          value={contact.position}
                          onChange={(e) => updateContact(index, "position", e.target.value)}
                          placeholder="Ej: Gerente de RRHH"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`contact-email-${index}`}>Correo Electrónico</Label>
                        <Input
                          id={`contact-email-${index}`}
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, "email", e.target.value)}
                          placeholder="contacto@empresa.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`contact-phone-${index}`}>Teléfono</Label>
                        <Input
                          id={`contact-phone-${index}`}
                          value={contact.phone}
                          onChange={(e) => updateContact(index, "phone", e.target.value)}
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`contact-city-${index}`}>Comuna</Label>
                        <Select
                          value={contact.city || ""}
                          onValueChange={(value) => updateContact(index, "city", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una comuna" />
                          </SelectTrigger>
                          <SelectContent>
                            {comunas.map((comuna) => (
                              <SelectItem key={comuna.id_comuna} value={comuna.nombre_comuna}>
                                {comuna.nombre_comuna}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id={`contact-primary-${index}`}
                          checked={contact.is_primary}
                          onChange={(e) => updateContact(index, "is_primary", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`contact-primary-${index}`} className="text-sm">
                          Contacto principal
                        </Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Cliente'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((client) => getClientProcessCount(client.id) > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((total, client) => total + client.contacts.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, contacto, cargo, comuna o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {totalClients} cliente{totalClients !== 1 ? "s" : ""} encontrado
            {totalClients !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando clientes...</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto Principal</TableHead>
                <TableHead>Total Contactos</TableHead>
                <TableHead>Procesos</TableHead>
                <TableHead className="w-[70px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                const primaryContact = getPrimaryContact(client)
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                          {primaryContact ? (
                      <div className="space-y-1">
                        <div className="font-medium">{primaryContact.name}</div>
                        <div className="text-sm text-muted-foreground">{primaryContact.position}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {primaryContact.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {primaryContact.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {primaryContact.city}
                        </div>
                      </div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">
                              Sin contactos
                            </div>
                          )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                            {client.contacts?.length || 0} contacto{(client.contacts?.length || 0) !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getClientProcessCount(client.id)} proceso{getClientProcessCount(client.id) !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(client)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                          </Button>
                          </div>
                    </TableCell>
                  </TableRow>
                )
                  })
                )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Controles de Paginación */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize">Filas por página:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalClients)} de {totalClients} clientes
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente y sus contactos
              {editingClient && ` - Cliente: ${editingClient.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre de la Empresa</Label>
              <Input
                id="edit-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Contactos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Contacto
                </Button>
              </div>

              {newClient.contacts.map((contact, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Contacto {index + 1}</span>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          Principal
                        </Badge>
                      )}
                    </div>
                    {newClient.contacts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`edit-contact-name-${index}`}>Nombre</Label>
                      <Input
                        id={`edit-contact-name-${index}`}
                        value={contact.name}
                        onChange={(e) => updateContact(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edit-contact-position-${index}`}>Cargo</Label>
                      <Input
                        id={`edit-contact-position-${index}`}
                        value={contact.position}
                        onChange={(e) => updateContact(index, "position", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edit-contact-email-${index}`}>Correo Electrónico</Label>
                      <Input
                        id={`edit-contact-email-${index}`}
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact(index, "email", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edit-contact-phone-${index}`}>Teléfono</Label>
                      <Input
                        id={`edit-contact-phone-${index}`}
                        value={contact.phone}
                        onChange={(e) => updateContact(index, "phone", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edit-contact-city-${index}`}>Comuna</Label>
                      <Select
                        value={contact.city || ""}
                        onValueChange={(value) => updateContact(index, "city", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una comuna" />
                        </SelectTrigger>
                        <SelectContent>
                          {comunas.map((comuna) => (
                            <SelectItem key={comuna.id_comuna} value={comuna.nombre_comuna}>
                              {comuna.nombre_comuna}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id={`edit-contact-primary-${index}`}
                        checked={contact.is_primary}
                        onChange={(e) => updateContact(index, "is_primary", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`edit-contact-primary-${index}`} className="text-sm">
                        Contacto principal
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditClient} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alertas */}
      
      {/* Resultado de operaciones (crear/editar/eliminar) */}
      <CustomAlertDialog
        open={isResultOpen}
        onOpenChange={setIsResultOpen}
        type={resultSuccess ? "success" : "error"}
        title={resultSuccess ? "Operación exitosa" : "Error en la operación"}
        description={resultMessage}
        confirmText="Aceptar"
      />

      {/* Confirmación de eliminación */}
      <CustomAlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        type="confirm"
        title="¿Eliminar cliente?"
        description="Esta acción no se puede deshacer. Se eliminará el cliente y todos sus contactos asociados permanentemente del sistema."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteClient}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  )
}
