// ===========================================
// CONFIGURACIÓN DE API
// ===========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ===========================================
// TIPOS DE RESPUESTA
// ===========================================

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ===========================================
// FUNCIÓN BASE PARA LLAMADAS HTTP
// ===========================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('llc_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ===========================================
// SERVICIOS DE CLIENTES
// ===========================================

export const clientService = {
  // Obtener todos los clientes
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/clientes');
  },

  // Obtener un cliente por ID
  async getById(id: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/clientes/${id}`);
  },

  // Crear nuevo cliente
  async create(clientData: {
    name: string;
    contacts: Array<{
      name: string;
      email: string;
      phone: string;
      position: string;
      city: string;
      is_primary: boolean;
    }>;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  // Actualizar cliente
  async update(id: string, clientData: {
    name: string;
    contacts: Array<{
      id?: string;
      name: string;
      email: string;
      phone: string;
      position: string;
      city: string;
      is_primary: boolean;
    }>;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  // Eliminar cliente
  async delete(id: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/clientes/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener estadísticas
  async getStats(): Promise<ApiResponse<any>> {
    return apiRequest('/api/clientes/stats');
  },
};

// ===========================================
// UTILIDADES
// ===========================================

// ===========================================
// SERVICIOS DE REGIONES Y COMUNAS
// ===========================================

export const regionService = {
  // Obtener todas las regiones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/regiones');
  },
};

export const comunaService = {
  // Obtener todas las comunas
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/comunas');
  },

  // Obtener comunas por región
  async getByRegion(regionId: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/comunas/region/${regionId}`);
  },
};

// ===========================================
// SERVICIOS DE DESCRIPCIONES DE CARGO
// ===========================================

export const descripcionCargoService = {
  // Obtener todas las descripciones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/descripciones-cargo');
  },

  // Obtener descripción por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}`);
  },

  // Crear descripción de cargo
  async create(data: {
    cargo: string;
    ciudad: string;
    descripcion_cargo?: string;
    requisitos_y_condiciones?: string;
    num_vacante?: number;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/descripciones-cargo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar descripción de cargo
  async update(id: number, data: {
    cargo?: string;
    ciudad?: string;
    descripcion_cargo?: string;
    requisitos_y_condiciones?: string;
    num_vacante?: number;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Agregar datos de Excel
  async addExcelData(id: number, excelData: any): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}/excel`, {
      method: 'POST',
      body: JSON.stringify({ datos_excel: excelData }),
    });
  },

  // Obtener datos de Excel
  async getExcelData(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}/excel`);
  },

  // Eliminar descripción de cargo
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener datos para el formulario
  async getFormData(): Promise<ApiResponse<any>> {
    return apiRequest('/api/descripciones-cargo/form-data');
  },
};

// ===========================================
// SERVICIOS DE SOLICITUDES
// ===========================================

export const solicitudService = {
  // Obtener todas las solicitudes
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/solicitudes');
  },

  // Obtener solicitud por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}`);
  },

  // Obtener solicitudes por consultor
  async getByConsultor(rutUsuario: string): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/solicitudes/consultor/${rutUsuario}`);
  },

  // Crear solicitud (crea automáticamente la descripción de cargo)
  async create(data: {
    contact_id: string;
    service_type: string;
    position_title: string;
    ciudad: string;
    description?: string;
    requirements?: string;
    vacancies?: number;
    consultant_id: string;
    deadline_days?: number;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar estado de solicitud
  async updateEstado(id: number, estado: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  },

  // Eliminar solicitud
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===========================================
// SERVICIOS DE CANDIDATOS
// ===========================================

export const candidatoService = {
  // Obtener todos los candidatos
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/candidatos');
  },

  // Obtener candidato por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}`);
  },

  // Obtener candidato por email
  async getByEmail(email: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/email/${email}`);
  },

  // Crear candidato
  async create(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    rut?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    id_comuna?: number;
    id_nacionalidad?: number;
    id_rubro?: number;
    has_driving_license?: boolean;
    experiences?: Array<{
      company: string;
      position: string;
      start_date: string;
      end_date?: string;
      description?: string;
    }>;
    education?: Array<{
      id_postgrado_capacitacion: number;
      id_institucion?: number;
      completion_date?: string;
    }>;
    professions?: string[];
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/candidatos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar candidato
  async update(id: number, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    rut?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    id_comuna?: number;
    id_nacionalidad?: number;
    id_rubro?: number;
    has_driving_license?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar candidato
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener experiencias de un candidato
  async getExperiences(id: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/candidatos/${id}/experiencias`);
  },

  // Agregar experiencia a un candidato
  async addExperience(id: number, experience: {
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}/experiencias`, {
      method: 'POST',
      body: JSON.stringify(experience),
    });
  },

  // Actualizar experiencia
  async updateExperience(idCandidato: number, idExp: number, experience: {
    company?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${idCandidato}/experiencias/${idExp}`, {
      method: 'PUT',
      body: JSON.stringify(experience),
    });
  },

  // Eliminar experiencia
  async deleteExperience(idCandidato: number, idExp: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${idCandidato}/experiencias/${idExp}`, {
      method: 'DELETE',
    });
  },

  // Agregar educación a un candidato
  async addEducation(id: number, education: {
    id_postgrado_capacitacion: number;
    id_institucion?: number;
    completion_date?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}/educacion`, {
      method: 'POST',
      body: JSON.stringify(education),
    });
  },

  // Agregar profesión a un candidato
  async addProfession(id: number, data: {
    nombre_profesion: string;
    nombre_institucion?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}/profesion`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ===========================================
// SERVICIOS DE POSTULACIONES
// ===========================================

export const postulacionService = {
  // Obtener todas las postulaciones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/postulaciones');
  },

  // Obtener postulación por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}`);
  },

  // Obtener postulaciones por solicitud
  async getBySolicitud(idSolicitud: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/postulaciones/solicitud/${idSolicitud}`);
  },

  // Crear postulación (con CV opcional)
  async create(data: {
    id_candidato: number;
    id_solicitud: number;
    id_portal_postulacion: number;
    cv_file?: File;
  }): Promise<ApiResponse<any>> {
    // Si hay archivo CV, usar FormData
    if (data.cv_file) {
      const formData = new FormData();
      formData.append('id_candidato', data.id_candidato.toString());
      formData.append('id_solicitud', data.id_solicitud.toString());
      formData.append('id_portal_postulacion', data.id_portal_postulacion.toString());
      formData.append('cv', data.cv_file);

      const token = localStorage.getItem('llc_token');
      const response = await fetch(`${API_BASE_URL}/api/postulaciones`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return await response.json();
    }

    // Sin archivo, usar JSON normal
    return apiRequest('/api/postulaciones', {
      method: 'POST',
      body: JSON.stringify({
        id_candidato: data.id_candidato,
        id_solicitud: data.id_solicitud,
        id_portal_postulacion: data.id_portal_postulacion,
      }),
    });
  },

  // Actualizar estado de postulación
  async updateEstado(id: number, idEstado: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ id_estado_candidato: idEstado }),
    });
  },

  // Subir/Actualizar CV
  async uploadCV(id: number, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('cv', file);

    const token = localStorage.getItem('llc_token');
    const response = await fetch(`${API_BASE_URL}/api/postulaciones/${id}/cv`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    return await response.json();
  },

  // Descargar CV
  async downloadCV(id: number): Promise<{ blob: Blob; filename: string }> {
    const token = localStorage.getItem('llc_token');
    const response = await fetch(`${API_BASE_URL}/api/postulaciones/${id}/cv`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar CV');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'CV.pdf';

    return { blob, filename };
  },

  // Eliminar postulación
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===========================================
// SERVICIOS DE PUBLICACIONES
// ===========================================

export const publicacionService = {
  // Obtener todas las publicaciones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/publicaciones');
  },

  // Obtener publicaciones por solicitud
  async getBySolicitud(idSolicitud: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/publicaciones/solicitud/${idSolicitud}`);
  },

  // Crear publicación
  async create(data: {
    id_solicitud: number;
    id_portal: number;
    fecha_publicacion?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/publicaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar publicación
  async update(id: number, data: {
    id_portal?: number;
    fecha_publicacion?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/publicaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar publicación
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/publicaciones/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===========================================
// SERVICIOS DE PORTALES
// ===========================================

export const portalService = {
  // Obtener todos los portales
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/portales');
  },
};

// ===========================================
// SERVICIOS DE NACIONALIDAD
// ===========================================

export const nacionalidadService = {
  // Obtener todas las nacionalidades
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/nacionalidades');
  },
};

// ===========================================
// SERVICIOS DE RUBROS
// ===========================================

export const rubroService = {
  // Obtener todos los rubros
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/rubros');
  },
};

// ===========================================
// UTILIDADES
// ===========================================

export const apiUtils = {
  // Verificar si hay un token válido
  isAuthenticated(): boolean {
    const token = localStorage.getItem('llc_token');
    return !!token;
  },

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('llc_token');
  },

  // Manejar errores de API
  handleError(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Ha ocurrido un error inesperado';
  },
};
