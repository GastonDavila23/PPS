import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '@auth0/auth0-react';
import { asignacionesService } from '../services/asignacionesService';
import { CONFIG } from '../config/constants';
import type { IAsignacion, RolUsuario } from '../types/index';

interface UseAsignacionesReturn {
  rol: RolUsuario | null;
  asignaciones: IAsignacion[];
  isDataLoading: boolean;
  dataError: string | null;
  refetch: () => void;
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
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [asignaciones, setAsignaciones] = useState<IAsignacion[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const [refreshSignal, setRefreshSignal] = useState(0);
  const refetch = useCallback(() => setRefreshSignal(s => s + 1), []);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNombreDebounced, setFiltroNombreDebounced] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [allDepartamentos, setAllDepartamentos] = useState<string[]>([]);
  const [allTurnos, setAllTurnos] = useState<string[]>([]);

  useEffect(() => {
    setIsSearching(true);
    const timerId = setTimeout(() => {
      setFiltroNombreDebounced(searchTerm);
      setCurrentPage(1);
      setIsSearching(false);
    }, CONFIG.DEBOUNCE_DELAY);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

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
        const { rol: userRole } = await asignacionesService.getRolUsuario(user.email);
        setRol(userRole);

        if (userRole === 'admin' || userRole === 'profesor') {
          const data = await asignacionesService.getAll({
            page: currentPage,
            limit: CONFIG.ITEMS_PER_PAGE,
            departamento: filtroDepto.toLowerCase(),
            turno: filtroTurno.toLowerCase(),
            estado_asignacion: filtroEstado,
            nombre_escuela: filtroNombreDebounced.toUpperCase()
          });
          
          setAsignaciones(data.asignaciones);
          setTotalItems(data.totalItems);
          setTotalPages(data.totalPages);
          setAllDepartamentos(data.allDepartamentos);
          setAllTurnos(data.allTurnos);
        }
      } catch (error) {
        console.error("Error en useAsignaciones:", error);
        setDataError("Error de conexión con el servidor.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDatos();
  }, [isAuthenticated, user, currentPage, filtroDepto, filtroTurno, filtroEstado, filtroNombreDebounced, refreshSignal]);

  const opcionesDepartamento = useMemo(() => [...new Set(allDepartamentos.filter(Boolean))], [allDepartamentos]);
  const opcionesTurno = useMemo(() => [...new Set(allTurnos.filter(Boolean))], [allTurnos]);

  return {
    rol, asignaciones, isDataLoading, dataError, refetch,
    paginacion: { currentPage, totalPages, totalItems, setCurrentPage, ITEMS_PER_PAGE: CONFIG.ITEMS_PER_PAGE },
    filtros: { depto: filtroDepto, setDepto: setFiltroDepto, turno: filtroTurno, setTurno: setFiltroTurno, estado: filtroEstado, setEstado: setFiltroEstado, search: searchTerm, setSearch: setSearchTerm, isSearching },
    opciones: { departamentos: opcionesDepartamento, turnos: opcionesTurno }
  };
};