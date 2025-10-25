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
  async getAll(params?: { status?: string; service_type?: string; consultor_id?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.service_type) queryParams.append('service_type', params.service_type);
    if (params?.consultor_id) queryParams.append('consultor_id', params.consultor_id);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/solicitudes?${queryString}` : '/api/solicitudes';
    
    return apiRequest(url);
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

  // Actualizar solicitud
  async update(id: number, data: {
    contact_id?: string;
    service_type?: string;
    position_title?: string;
    ciudad?: string;
    description?: string;
    requirements?: string;
    vacancies?: number;
    consultant_id?: string;
    deadline_days?: number;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Actualizar estado de solicitud
  async updateEstado(id: number, status: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Cambiar estado de solicitud por ID
  async cambiarEstado(id: number, id_estado: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ id_estado }),
    });
  },

  // Eliminar solicitud
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}`, {
      method: 'DELETE',
    });
  },

  // Avanzar al módulo 2
  async avanzarAModulo2(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/avanzar-modulo2`, {
      method: 'PUT',
    });
  },

  // Avanzar al módulo 3
  async avanzarAModulo3(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/avanzar-modulo3`, {
      method: 'PUT',
    });
  },

  // Avanzar al módulo 4
  async avanzarAModulo4(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/avanzar-modulo4`, {
      method: 'PUT',
    });
  },

  // Obtener etapas disponibles
  async getEtapas(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/solicitudes/etapas/disponibles');
  },

  // Obtener estados de solicitud disponibles
  async getEstadosSolicitud(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/solicitudes/estados/disponibles');
  },

  // Cambiar etapa de solicitud
  async cambiarEtapa(id: number, id_etapa: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/etapa`, {
      method: 'PUT',
      body: JSON.stringify({ id_etapa }),
    });
  },
};

// ===========================================
// SERVICIOS DE ESTADO CLIENTE
// ===========================================

export const estadoClienteService = {
  // Obtener todos los estados de cliente
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/estado-cliente');
  },

  // Cambiar estado de cliente para una postulación
  async cambiarEstado(id_postulacion: number, data: {
    id_estado_cliente: number;
    comentarios?: string;
    fecha_presentacion?: string;
    fecha_feedback_cliente?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/estado-cliente/postulacion/${id_postulacion}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Obtener historial de cambios de estado para una postulación
  async getHistorial(id_postulacion: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/estado-cliente/postulacion/${id_postulacion}/historial`);
  },
};

// ===========================================
// SERVICIOS DE ESTADO CLIENTE MÓDULO 5
// ===========================================

export const estadoClienteM5Service = {
  // Obtener todos los estados del módulo 5
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/estado-cliente-m5');
  },

  // Obtener estado por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/estado-cliente-m5/${id}`);
  },

  // Cambiar estado de cliente para una postulación (Módulo 5)
  async cambiarEstado(id_postulacion: number, data: {
    id_estado_cliente_postulacion_m5: number;
    fecha_cambio_estado_cliente_m5: string;
    comentario_modulo5_cliente?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/estado-cliente-m5/postulacion/${id_postulacion}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Avanzar candidato al módulo 5 (desde módulo 4)
  async avanzarAlModulo5(id_postulacion: number, comentario?: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/estado-cliente-m5/postulacion/${id_postulacion}/avanzar`, {
      method: 'PUT',
      body: JSON.stringify({
        comentario_modulo5_cliente: comentario
      }),
    });
  },

  // Obtener historial de cambios de estado para una postulación
  async getHistorial(id_postulacion: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/estado-cliente-m5/postulacion/${id_postulacion}/historial`);
  },

  // Obtener el último estado de una postulación
  async getUltimoEstado(id_postulacion: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/estado-cliente-m5/postulacion/${id_postulacion}/ultimo`);
  },

  // Obtener candidatos que están en el módulo 5
  async getCandidatosEnModulo5(id_proceso: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/estado-cliente-m5/proceso/${id_proceso}/candidatos`);
  },

  // Actualizar información completa del candidato en módulo 5
  async actualizarCandidatoModulo5(id_postulacion: number, data: {
    hiring_status: string;
    client_response_date?: string;
    observations?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/estado-cliente-m5/postulacion/${id_postulacion}/actualizar`, {
      method: 'PUT',
      body: JSON.stringify(data),
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
    name: string;
    email: string;
    phone: string;
    rut?: string;
    birth_date?: string;
    comuna?: string;
    nacionalidad?: string;
    rubro?: string;
    profession?: string;
    english_level?: string;
    software_tools?: string;
    has_disability_credential?: boolean;
    work_experience?: Array<{
      company: string;
      position: string;
      start_date: string;
      end_date?: string;
      description?: string;
    }>;
    education?: Array<{
      title: string;
      institution: string;
      start_date?: string;
      completion_date?: string;
    }>;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/candidatos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar candidato
  async update(id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    rut?: string;
    birth_date?: string;
    comuna?: string;
    nacionalidad?: string;
    rubro?: string;
    profession?: string;
    english_level?: string;
    software_tools?: string;
    has_disability_credential?: boolean;
    work_experience?: any[];
    education?: any[];
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

  // Actualizar estado del candidato
  async updateStatus(id: number, status: 'presentado' | 'no_presentado' | 'rechazado', comment?: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/candidatos/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
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

  // Obtener postulaciones optimizadas (sin datos de formación académica)
  async getBySolicitudOptimized(idSolicitud: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/postulaciones/solicitud/${idSolicitud}/optimized`);
  },

  // Crear postulación (con CV opcional)
  async create(data: {
    id_candidato: number;
    id_solicitud: number;
    id_portal_postulacion?: number; // Opcional para evaluación/test psicolaboral
    id_estado_candidato?: number; // Estado inicial del candidato (1=Presentado, 2=No presentado, 3=Rechazado)
    cv_file?: File;
    motivacion?: string;
    expectativa_renta?: number;
    disponibilidad_postulacion?: string;
    valoracion?: number;
    comentario_no_presentado?: string;
    // Campos adicionales de postulación
    comentario_rech_obs_cliente?: string;
    comentario_modulo5_cliente?: string;
    situacion_familiar?: string;
  }): Promise<ApiResponse<any>> {
    // Si hay archivo CV, usar FormData
    if (data.cv_file) {
      const formData = new FormData();
      formData.append('id_candidato', data.id_candidato.toString());
      formData.append('id_solicitud', data.id_solicitud.toString());
      if (data.id_portal_postulacion) {
        formData.append('id_portal_postulacion', data.id_portal_postulacion.toString());
      }
      formData.append('id_estado_candidato', (data.id_estado_candidato || 1).toString()); // Por defecto: 1 = Presentado
      formData.append('cv_file', data.cv_file);
      
      if (data.motivacion) formData.append('motivacion', data.motivacion);
      if (data.expectativa_renta) formData.append('expectativa_renta', data.expectativa_renta.toString());
      if (data.disponibilidad_postulacion) formData.append('disponibilidad_postulacion', data.disponibilidad_postulacion);
      if (data.valoracion) formData.append('valoracion', data.valoracion.toString());
      if (data.comentario_no_presentado) formData.append('comentario_no_presentado', data.comentario_no_presentado);
      if (data.comentario_rech_obs_cliente) formData.append('comentario_rech_obs_cliente', data.comentario_rech_obs_cliente);
      if (data.comentario_modulo5_cliente) formData.append('comentario_modulo5_cliente', data.comentario_modulo5_cliente);
      if (data.situacion_familiar) formData.append('situacion_familiar', data.situacion_familiar);

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
    const payload: any = {
      id_candidato: data.id_candidato,
      id_solicitud: data.id_solicitud,
      id_estado_candidato: data.id_estado_candidato || 1, // Por defecto: 1 = Presentado
    };
    
    // Solo agregar id_portal_postulacion si está presente
    if (data.id_portal_postulacion) {
      payload.id_portal_postulacion = data.id_portal_postulacion;
    }
    
    // Agregar campos opcionales si existen
    if (data.motivacion) payload.motivacion = data.motivacion;
    if (data.expectativa_renta) payload.expectativa_renta = data.expectativa_renta;
    if (data.disponibilidad_postulacion) payload.disponibilidad_postulacion = data.disponibilidad_postulacion;
    if (data.valoracion) payload.valoracion = data.valoracion;
    if (data.comentario_no_presentado) payload.comentario_no_presentado = data.comentario_no_presentado;
    if (data.comentario_rech_obs_cliente) payload.comentario_rech_obs_cliente = data.comentario_rech_obs_cliente;
    if (data.comentario_modulo5_cliente) payload.comentario_modulo5_cliente = data.comentario_modulo5_cliente;
    if (data.situacion_familiar) payload.situacion_familiar = data.situacion_familiar;
    
    return apiRequest('/api/postulaciones', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Actualizar estado de postulación
  async updateEstado(id: number, idEstado: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ id_estado_candidato: idEstado }),
    });
  },

  // Actualizar valoración y otros campos de postulación
  async updateValoracion(id: number, data: {
    motivacion?: string;
    expectativa_renta?: number;
    disponibilidad_postulacion?: string;
    valoracion?: number;
    comentario_no_presentado?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}/valoracion`, {
      method: 'PUT',
      body: JSON.stringify(data),
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
// SERVICIOS DE PROFESIONES
// ===========================================

export const profesionService = {
  // Obtener todas las profesiones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/profesiones');
  },
};

// ===========================================
// SERVICIOS DE INSTITUCIONES
// ===========================================

export const institucionService = {
  // Obtener todas las instituciones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/instituciones');
  },
};

// ===========================================
// SERVICIOS DE PUBLICACIONES
// ===========================================

export const publicacionService = {
  // Obtener todas las publicaciones
  async getAll(filters?: { solicitud_id?: number; portal_id?: number; estado?: string }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.solicitud_id) params.append('solicitud_id', filters.solicitud_id.toString());
    if (filters?.portal_id) params.append('portal_id', filters.portal_id.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    
    const queryString = params.toString();
    return apiRequest(`/api/publicaciones${queryString ? `?${queryString}` : ''}`);
  },

  // Obtener una publicación por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/publicaciones/${id}`);
  },

  // Obtener todos los portales de postulación
  async getPortales(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/publicaciones/portales');
  },

  // Crear una nueva publicación
  async create(data: {
    id_solicitud: number;
    id_portal_postulacion: number;
    url_publicacion: string;
    estado_publicacion?: string;
    fecha_publicacion?: Date;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/publicaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar una publicación
  async update(id: number, data: {
    url_publicacion?: string;
    estado_publicacion?: string;
    fecha_publicacion?: Date;
  }): Promise<ApiResponse<any>> {
    return apiRequest(`/api/publicaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar una publicación
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/publicaciones/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===========================================
// FUNCIONES HELPER PARA OBTENER DATOS POR PROCESO
// ===========================================

export async function getCandidatesByProcess(processId: string): Promise<any[]> {
  try {
    const response = await postulacionService.getBySolicitud(parseInt(processId));
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener candidatos por proceso:', error);
    return [];
  }
}

export async function getPublicationsByProcess(processId: string): Promise<any[]> {
  try {
    const response = await publicacionService.getAll({ solicitud_id: parseInt(processId) });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener publicaciones por proceso:', error);
    return [];
  }
}

// ===========================================
// UTILIDADES
// ===========================================

// ===========================================
// EVALUACIÓN PSICOLABORAL SERVICE
// ===========================================

export const evaluacionPsicolaboralService = {
  // Obtener evaluación por postulación
  async getByPostulacion(idPostulacion: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/postulacion/${idPostulacion}`, {
      method: 'GET',
    });
  },

  // Crear evaluación
  async create(data: {
    fecha_evaluacion?: Date | null;
    fecha_envio_informe: Date;
    estado_evaluacion: string;
    estado_informe: string;
    conclusion_global: string;
    id_postulacion: number;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/evaluaciones-psicolaborales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar evaluación
  async update(id: number, data: Partial<{
    fecha_evaluacion: Date | null;
    fecha_envio_informe: Date;
    estado_evaluacion: string;
    estado_informe: string;
    conclusion_global: string;
  }>): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Agregar test a evaluación
  async addTest(idEvaluacion: number, idTest: number, resultado: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/${idEvaluacion}/tests`, {
      method: 'POST',
      body: JSON.stringify({
        id_test: idTest,
        resultado: resultado
      }),
    });
  },

  // Actualizar estado del informe
  async updateEstadoInforme(id: number, estadoInforme: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/${id}/estado-informe`, {
      method: 'PUT',
      body: JSON.stringify({
        estado_informe: estadoInforme
      }),
    });
  },

  // Eliminar test de evaluación
  async deleteTest(idEvaluacion: number, idTest: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/${idEvaluacion}/tests/${idTest}`, {
      method: 'DELETE',
    });
  },

  // Actualizar conclusión global del informe
  async updateConclusionGlobal(id: number, conclusionGlobal: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/${id}/conclusion-global`, {
      method: 'PUT',
      body: JSON.stringify({
        conclusion_global: conclusionGlobal
      }),
    });
  },

  // Actualizar informe completo (estado + conclusión + fecha de envío)
  async updateInformeCompleto(id: number, estadoInforme: string, conclusionGlobal: string, fechaEnvioInforme?: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/evaluaciones-psicolaborales/${id}/informe-completo`, {
      method: 'PUT',
      body: JSON.stringify({
        estado_informe: estadoInforme,
        conclusion_global: conclusionGlobal,
        fecha_envio_informe: fechaEnvioInforme
      }),
    });
  }
};

// Servicio para Tests Psicolaborales
export const testPsicolaboralService = {
  // Obtener todos los tests disponibles
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/tests-psicolaborales', {
      method: 'GET',
    });
  },

  // Obtener un test por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/tests-psicolaborales/${id}`, {
      method: 'GET',
    });
  }
};

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

// Referencias Laborales Service
export const referenciaLaboralService = {
  async getByCandidato(idCandidato: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/referencias-laborales/candidato/${idCandidato}`, {
      method: 'GET',
    });
  },

  async create(data: {
    nombre_referencia: string;
    cargo_referencia: string;
    empresa_referencia: string;
    telefono_referencia: string;
    email_referencia: string;
    id_candidato: number;
    relacion_postulante_referencia: string;
    comentario_referencia?: string;
  }): Promise<ApiResponse<any>> {
    return apiRequest('/api/referencias-laborales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<{
    nombre_referencia: string;
    cargo_referencia: string;
    empresa_referencia: string;
    telefono_referencia: string;
    email_referencia: string;
    relacion_postulante_referencia: string;
    comentario_referencia: string;
  }>): Promise<ApiResponse<any>> {
    return apiRequest(`/api/referencias-laborales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/referencias-laborales/${id}`, {
      method: 'DELETE',
    });
  }
};
