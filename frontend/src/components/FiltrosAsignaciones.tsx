import React from 'react';
import { Spinner } from 'react-bootstrap';
import { OPCIONES_ESTADO } from '../config/constants';
import { Search } from 'react-bootstrap-icons';
import './../index.css';

interface Props {
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
  onFilterChange: (setter: (v: string) => void, value: string) => void;
}

const FiltrosAsignaciones: React.FC<Props> = ({ filtros, opciones, onFilterChange }) => {
  return (
    <div className="space-y-5">
      {/* Buscador */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 ml-1 italic">Palabra clave</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={14} />
          </div>
          <input 
            type="text"
            placeholder="Nombre o CUE..."
            value={filtros.search}
            onChange={(e) => filtros.setSearch(e.target.value)}
            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
          />
          {filtros.isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Spinner animation="border" size="sm" variant="primary" className="opacity-30" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Departamento */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 ml-1 italic">Departamento</label>
          <select 
            value={filtros.depto} 
            onChange={(e) => onFilterChange(filtros.setDepto, e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-slate-300 transition-all"
          >
            <option value="todos">Todos los departamentos</option>
            {opciones.departamentos.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        {/* Turno */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 ml-1 italic">Turno</label>
          <select 
            value={filtros.turno} 
            onChange={(e) => onFilterChange(filtros.setTurno, e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-slate-300 transition-all"
          >
            <option value="todos">Todos los turnos</option>
            {opciones.turnos.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 ml-1 italic">Estado de asignación</label>
          <select 
            value={filtros.estado} 
            onChange={(e) => onFilterChange(filtros.setEstado, e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-slate-300 transition-all"
          >
            <option value="todos">Todos los estados</option>
            {OPCIONES_ESTADO.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltrosAsignaciones;