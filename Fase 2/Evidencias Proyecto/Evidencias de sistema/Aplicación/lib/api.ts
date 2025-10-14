// ===========================================
// CONFIGURACIÓN DE LA API
// ===========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ===========================================
// TIPOS DE DATOS
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ===========================================
// FUNCIÓN PRINCIPAL DE REQUEST
// ===========================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}

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
    const endpoint = queryString ? `/api/solicitudes?${queryString}` : '/api/solicitudes';
    return apiRequest(endpoint);
  },

  // Obtener solicitud por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}`);
  },

  // Obtener solicitudes por consultor
  async getByConsultor(rutUsuario: string): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/solicitudes/consultor/${rutUsuario}`);
  },

  // Crear solicitud
  async create(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/api/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar estado de solicitud
  async updateEstado(id: number, estado: string, razon?: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado, razon }),
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

  // Obtener etapas disponibles
  async getEtapas(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/solicitudes/etapas/disponibles');
  },

  // Obtener estados disponibles para solicitudes
  async getEstadosSolicitud(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/solicitudes/estados/disponibles');
  },

  // Cambiar estado de solicitud
  async cambiarEstado(id: number, estadoId: number, reason?: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ id_estado: estadoId, reason }),
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
  async create(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/api/candidatos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar candidato
  async update(id: number, data: any): Promise<ApiResponse<any>> {
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
};

// ===========================================
// SERVICIOS DE POSTULACIONES
// ===========================================

export const postulacionService = {
  // Obtener postulaciones por solicitud
  async getBySolicitud(idSolicitud: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/api/postulaciones/solicitud/${idSolicitud}`);
  },

  // Crear postulación
  async create(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/api/postulaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar estado de postulación
  async updateEstado(id: number, estado: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
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

  // Eliminar postulación
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/postulaciones/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===========================================
// SERVICIOS DE CLIENTES
// ===========================================

export const clienteService = {
  // Obtener todos los clientes
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/clientes');
  },

  // Obtener cliente por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/clientes/${id}`);
  },

  // Crear cliente
  async create(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar cliente
  async update(id: number, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar cliente
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/clientes/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener estadísticas de clientes
  async getStats(): Promise<ApiResponse<any>> {
    return apiRequest('/api/clientes/stats');
  },
};

// ===========================================
// SERVICIOS DE REGIONES
// ===========================================

export const regionService = {
  // Obtener todas las regiones
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/regiones');
  },
};

// ===========================================
// SERVICIOS DE COMUNAS
// ===========================================

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
// SERVICIOS DE RUBROS
// ===========================================

export const rubroService = {
  // Obtener todos los rubros
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/rubros');
  },
};

// ===========================================
// SERVICIOS DE NACIONALIDADES
// ===========================================

export const nacionalidadService = {
  // Obtener todas las nacionalidades
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/nacionalidades');
  },
};

// ===========================================
// SERVICIOS DE DESCRIPCIÓN DE CARGO
// ===========================================

export const descripcionCargoService = {
  // Obtener descripción de cargo por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}`);
  },

  // Obtener datos de Excel por ID de descripción de cargo
  async getExcelData(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}/excel`);
  },

  // Crear descripción de cargo
  async create(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/api/descripciones-cargo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar descripción de cargo
  async update(id: number, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar descripción de cargo
  async delete(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/descripciones-cargo/${id}`, {
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

  // Obtener publicación por ID
  async getById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/api/publicaciones/${id}`);
  },

  // Obtener portales disponibles
  async getPortales(): Promise<ApiResponse<any[]>> {
    return apiRequest('/api/publicaciones/portales');
  },

  // Crear publicación
  async create(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/api/publicaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar publicación
  async update(id: number, data: any): Promise<ApiResponse<any>> {
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
// FUNCIÓN PARA OBTENER CANDIDATOS POR PROCESO
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

// ===========================================
// UTILIDADES DE ERROR
// ===========================================

export const apiUtils = {
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.error) {
      return error.error;
    }
    return 'Ha ocurrido un error inesperado';
  },
};