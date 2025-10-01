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
