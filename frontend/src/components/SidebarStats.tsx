import React from 'react';
import { Funnel, DatabaseCheck } from 'react-bootstrap-icons';
import FiltrosAsignaciones from './FiltrosAsignaciones';
import './../index.css';

interface SidebarStatsProps {
  totalItems: number;
  userName?: string;
  rol: string | null;
  filtros: any;
  opciones: any;
  onFilterChange: (setter: (v: string) => void, value: string) => void;
}

const SidebarStats: React.FC<SidebarStatsProps> = ({ 
  totalItems,
  filtros, 
  opciones, 
  onFilterChange 
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-200">
      {/* KPIs */}
      <div className="p-5">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <DatabaseCheck className="text-blue-500" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registros</span>
          </div>
          <span className="text-xl font-black text-slate-800">{totalItems}</span>
        </div>
      </div>

      {/* Panel de Filtros en Columna */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex items-center gap-2 mb-5">
          <Funnel className="text-slate-400" size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Búsqueda y Filtros</span>
        </div>
        <FiltrosAsignaciones 
          filtros={filtros} 
          opciones={opciones} 
          onFilterChange={onFilterChange} 
        />
      </div>
    </div>
  );
};

export default SidebarStats;