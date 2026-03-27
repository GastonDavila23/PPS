// src/types/index.ts

export type RolUsuario = 'admin' | 'profesor' | 'profesor-pendiente';

export interface IAsignacion {
  origen_Departamento: string;
  origen_CUE: string;
  origen_Numero_Escuela: string;
  origen_Numero_Anexo: string;
  origen_Nombre_Escuela: string;
  origen_Division: string;
  origen_Turno: string;
  destino_Departamento: string;
  destino_CUE: string;
  destino_Numero_Escuela: string;
  destino_Numero_Anexo: string;
  destino_Nombre_Escuela: string;
  destino_Division: string;
  destino_Turno: string;
  Distancia_KM: number;
  Observaciones: string;
}

export interface AsignacionesParams {
  page: number;
  limit: number;
  departamento?: string;
  turno?: string;
  estado_asignacion?: string;
  nombre_escuela?: string;
}

export interface AsignacionesResponse {
  asignaciones: IAsignacion[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  allDepartamentos: string[];
  allTurnos: string[];
}

// Nueva interfaz para usuarios en el front
export interface IUser {
  id: number;
  email: string;
  rol: RolUsuario;
}