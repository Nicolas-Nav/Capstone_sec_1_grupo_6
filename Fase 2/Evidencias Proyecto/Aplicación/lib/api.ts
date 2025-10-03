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

  // Actualizar estado de solicitud
  async updateEstado(id: number, status: string): Promise<ApiResponse<any>> {
    return apiRequest(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
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
