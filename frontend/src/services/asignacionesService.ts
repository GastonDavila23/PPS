import axios from 'axios';
import { CONFIG } from '../config/constants';
import type { AsignacionesParams, AsignacionesResponse, RolUsuario, IUser } from '../types/index';

export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const asignacionesService = {
  // --- ASIGNACIONES ---
  getAll: async (params: AsignacionesParams): Promise<AsignacionesResponse> => {
    const response = await apiClient.get<AsignacionesResponse>('/asignaciones', { params });
    return response.data;
  },

  // --- CARGAS E HISTORIAL ---
  uploadPlanillas: async (formData: FormData) => {
    const response = await apiClient.post('/cargar-planillas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async obtenerHistorial(email: string) {
    const response = await apiClient.get('/historial-cargas', { params: { email } });
    return response.data;
  },

  async eliminarCarga(idCarga: number, email: string) {
    const response = await apiClient.delete(`/historial-cargas/${idCarga}`, {
      params: { email }
    });
    return response.data;
  },

  async limpiarBaseDatos(email: string) {
    const response = await apiClient.post('/limpiar-escuelas', { email });
    return response.data;
  },

  getRolUsuario: async (email: string): Promise<{ rol: RolUsuario }> => {
    const response = await apiClient.get('/usuarios/rol', { params: { email } });
    return response.data;
  },

  async obtenerUsuarios(adminEmail: string): Promise<IUser[]> {
    const response = await apiClient.get('/usuarios', {
      params: { admin_email: adminEmail }
    });
    return response.data;
  },

  async cambiarRol(userId: number, nuevoRol: RolUsuario, adminEmail: string) {
    const response = await apiClient.post('/usuarios/cambiar-rol',
      { id: userId, rol: nuevoRol },
      { headers: { 'X-Admin-Email': adminEmail } }
    );
    return response.data;
  },

  async eliminarUsuario(emailBorrar: string, adminEmail: string) {
    const response = await apiClient.delete(`/usuarios/${emailBorrar}`, {
      params: { admin_email: adminEmail }
    });
    return response.data;
  },

  async iniciarProcesamiento(email: string) {
    const response = await apiClient.post('/procesar-asignaciones', { email });
    return response.data;
  }
};

export default asignacionesService;