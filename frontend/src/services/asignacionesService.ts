// src/services/asignacionesService.ts
import axios from 'axios';
import { CONFIG } from '../config/constants';
import type { AsignacionesParams, AsignacionesResponse, RolUsuario } from '../types/index';

/**
 * Instancia de axios configurada centralmente.
 * Se exporta para que cualquier componente (como CargarPlanilla.tsx) 
 * use la misma configuración de base y headers.
 */
export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const asignacionesService = {
  /**
   * Obtiene la lista de asignaciones filtrada y paginada.
   */
  getAll: async (params: AsignacionesParams): Promise<AsignacionesResponse> => {
    // axios.get adjunta automáticamente los params como query string (?page=1&limit=15...)
    const response = await apiClient.get<AsignacionesResponse>('/asignaciones', { params });
    return response.data;
  },

  /**
   * Obtiene el rol del usuario basado en su email.
   */
  getRolUsuario: async (email: string): Promise<{ rol: RolUsuario }> => {
    const response = await apiClient.get('/usuarios/rol', { params: { email } });
    return response.data;
  },

  /**
   * Sube los archivos Excel/CSV al backend para el proceso de ETL.
   * Maneja la configuración necesaria para el envío de archivos (FormData).
   */
  uploadPlanillas: async (formData: FormData) => {
    const response = await apiClient.post('/cargar-planillas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};