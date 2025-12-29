// src/services/asignacionesService.ts
import axios from 'axios';
import { CONFIG } from '../config/constants';
import type { AsignacionesParams, AsignacionesResponse, RolUsuario } from '../types/index';

// Creamos una instancia de axios para no repetir la URL base siempre
const apiClient = axios.create({
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
    // axios.get(url, { params: { ... } }) se encarga de armar el query string
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

  // Aquí podrías agregar métodos futuros, ej:
  // uploadPlanillas: (formData) => ...
};