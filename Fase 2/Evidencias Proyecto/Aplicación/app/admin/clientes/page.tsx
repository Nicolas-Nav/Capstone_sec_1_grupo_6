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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building, Users, Phone, Mail, MapPin, User, X, Loader2 } from "lucide-react"
import { mockProcesses } from "@/lib/mock-data"
import { clientService, comunaService, apiUtils } from "@/lib/api"
import type { Client, ClientContact, Comuna } from "@/lib/types"
import { toast } from "sonner"

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comunas, setComunas] = useState<Comuna[]>([])
  const [formData, setFormData] = useState({
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
    ] as ClientContact[],
  })

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.contacts.some(
        (contact) =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.position.toLowerCase().includes(searchLower) ||
          contact.city.toLowerCase().includes(searchLower),
      )
    )
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    loadClients()
    loadAllComunas()
  }, [])


  const loadClients = async () => {
    try {
      setIsLoading(true)
      const response = await clientService.getAll()
      if (response.success && response.data) {
        setClients(response.data)
      } else {
        toast.error('Error al cargar los clientes')
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error(apiUtils.handleError(error))
    } finally {
      setIsLoading(false)
    }
  }

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
    return mockProcesses.filter((process) => process.client_id === clientId).length
  }

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [
        ...formData.contacts,
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
    if (formData.contacts.length > 1) {
      const newContacts = formData.contacts.filter((_, i) => i !== index)
      // If we removed the primary contact, make the first one primary
      if (formData.contacts[index].is_primary && newContacts.length > 0) {
        newContacts[0].is_primary = true
      }
      setFormData({ ...formData, contacts: newContacts })
    }
  }

  const updateContact = (index: number, field: keyof ClientContact, value: string | boolean) => {
    const newContacts = [...formData.contacts]
    if (field === "is_primary" && value === true) {
      // Only one contact can be primary
      newContacts.forEach((contact, i) => {
        contact.is_primary = i === index
      })
    } else {
      ;(newContacts[index] as any)[field] = value
    }
    setFormData({ ...formData, contacts: newContacts })
  }


  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la empresa es requerido')
      return false
    }

    for (let i = 0; i < formData.contacts.length; i++) {
      const contact = formData.contacts[i]
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
      const response = await clientService.create({
      name: formData.name,
        contacts: formData.contacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position,
          city: contact.city,
          is_primary: contact.is_primary || false
        }))
      })
      
      if (response.success && response.data) {
        toast.success('Cliente creado exitosamente')
        setClients([...clients, response.data])
        resetForm()
        setIsCreateDialogOpen(false)
      } else {
        toast.error(response.message || 'Error al crear el cliente')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error(apiUtils.handleError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
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
    if (!selectedClient || !validateForm()) return

    try {
      setIsSubmitting(true)
      const response = await clientService.update(selectedClient.id, {
        name: formData.name,
        contacts: formData.contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position,
          city: contact.city,
          is_primary: contact.is_primary || false
        }))
      })
      
      if (response.success && response.data) {
        toast.success('Cliente actualizado exitosamente')
    const updatedClients = clients.map((client) =>
          client.id === selectedClient.id ? response.data : client
    )
    setClients(updatedClients)
        resetForm()
    setSelectedClient(null)
    setIsEditDialogOpen(false)
      } else {
        toast.error(response.message || 'Error al actualizar el cliente')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error(apiUtils.handleError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return

    try {
      const response = await clientService.delete(clientId)
      
      if (response.success) {
        toast.success('Cliente eliminado exitosamente')
    setClients(clients.filter((client) => client.id !== clientId))
      } else {
        toast.error(response.message || 'Error al eliminar el cliente')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error(apiUtils.handleError(error))
    }
  }

  const openEditDialog = (client: Client) => {
    setSelectedClient(client)
    setFormData({
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                {formData.contacts.map((contact, index) => (
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
                      {formData.contacts.length > 1 && (
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
                              <SelectItem key={comuna.id_ciudad} value={comuna.nombre_comuna}>
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
                placeholder="Buscar por empresa, contacto, cargo, ciudad o email..."
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
            {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""} encontrado
            {filteredClients.length !== 1 ? "s" : ""}
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
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente y sus contactos
              {selectedClient && ` - Cliente: ${selectedClient.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre de la Empresa</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              {formData.contacts.map((contact, index) => (
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
                    {formData.contacts.length > 1 && (
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
                            <SelectItem key={comuna.id_ciudad} value={comuna.nombre_comuna}>
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
    </div>
  )
}
