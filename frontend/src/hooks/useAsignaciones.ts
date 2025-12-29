// src/hooks/useAsignaciones.ts
import { useState, useEffect, useMemo } from 'react';
import { User } from '@auth0/auth0-react';

// Importaciones nuevas
import { asignacionesService } from '../services/asignacionesService';
import { CONFIG } from '../config/constants';
import type { IAsignacion, RolUsuario } from '../types/index';

interface UseAsignacionesReturn {
  rol: RolUsuario | null;
  asignaciones: IAsignacion[];
  isDataLoading: boolean;
  dataError: string | null;
  paginacion: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    setCurrentPage: (page: number) => void;
    ITEMS_PER_PAGE: number;
  };
  filtros: {
    depto: string; setDepto: (v: string) => void;
    turno: string; setTurno: (v: string) => void;
    estado: string; setEstado: (v: string) => void;
    search: string; setSearch: (v: string) => void;
    isSearching: boolean;
  };
  opciones: {
    departamentos: string[];
    turnos: string[];
  };
}

export const useAsignaciones = (isAuthenticated: boolean, user: User | undefined): UseAsignacionesReturn => {
  
  // --- ESTADOS ---
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [asignaciones, setAsignaciones] = useState<IAsignacion[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtros
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNombreDebounced, setFiltroNombreDebounced] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Opciones
  const [allDepartamentos, setAllDepartamentos] = useState<string[]>([]);
  const [allTurnos, setAllTurnos] = useState<string[]>([]);

  // --- EFECTOS ---

  // 1. Debounce
  useEffect(() => {
    setIsSearching(true);
    const timerId = setTimeout(() => {
      setFiltroNombreDebounced(searchTerm);
      setCurrentPage(1);
      setIsSearching(false);
    }, CONFIG.DEBOUNCE_DELAY); // Usando constante
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // 2. Carga de Datos (Usando el Servicio)
  useEffect(() => {
    const fetchDatos = async () => {
      if (!isAuthenticated || !user?.email) {
        setIsDataLoading(false);
        setRol(null);
        setAsignaciones([]);
        return;
      }

      setIsDataLoading(true);
      setDataError(null);

      try {
        // A. Obtener Rol desde el Servicio
        const { rol: userRole } = await asignacionesService.getRolUsuario(user.email);
        setRol(userRole);

        // B. Obtener Asignaciones desde el Servicio
        if (userRole === 'admin' || userRole === 'profesor') {
          const data = await asignacionesService.getAll({
            page: currentPage,
            limit: CONFIG.ITEMS_PER_PAGE, // Usando constante
            departamento: filtroDepto,
            turno: filtroTurno,
            estado_asignacion: filtroEstado,
            nombre_escuela: filtroNombreDebounced
          });
          
          setAsignaciones(data.asignaciones);
          setTotalItems(data.totalItems);
          setTotalPages(data.totalPages);
          setAllDepartamentos(data.allDepartamentos);
          setAllTurnos(data.allTurnos);
        }
      } catch (error) {
        console.error("Error en useAsignaciones:", error);
        setDataError("No se pudo cargar la información del servidor.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDatos();
  }, [isAuthenticated, user, currentPage, filtroDepto, filtroTurno, filtroEstado, filtroNombreDebounced]);

  // Memos
  const opcionesDepartamento = useMemo(() => [...new Set(allDepartamentos.filter(Boolean))], [allDepartamentos]);
  const opcionesTurno = useMemo(() => [...new Set(allTurnos.filter(Boolean))], [allTurnos]);

  return {
    rol,
    asignaciones,
    isDataLoading,
    dataError,
    paginacion: {
      currentPage, totalPages, totalItems, setCurrentPage, 
      ITEMS_PER_PAGE: CONFIG.ITEMS_PER_PAGE
    },
    filtros: {
      depto: filtroDepto, setDepto: setFiltroDepto,
      turno: filtroTurno, setTurno: setFiltroTurno,
      estado: filtroEstado, setEstado: setFiltroEstado,
      search: searchTerm, setSearch: setSearchTerm, isSearching
    },
    opciones: {
      departamentos: opcionesDepartamento,
      turnos: opcionesTurno
    }
  };
};