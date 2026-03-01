import React, { useState } from 'react';
import type { IAsignacion } from '../types';
import DetalleAsignacionModal from './DetalleAsignacionModal';

interface Props {
  asignaciones: IAsignacion[];
  isLoading?: boolean;
  limit?: number;
}

const TablaAsignaciones: React.FC<Props> = ({ asignaciones, isLoading = false, limit = 10 }) => {
  const [detalleSelected, setDetalleSelected] = useState<IAsignacion | null>(null);

  const datosVisibles = asignaciones.slice(0, limit);
  const filasFaltantes = Math.max(0, limit - datosVisibles.length);
  const filasVacias = Array.from({ length: filasFaltantes });

  const colWidths = {
    depto: '8%', cue: '7%', num: '5%', anexo: '6%', nombre: '18%', div: '4%', dist: '5%'
  };

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden relative">
      <table className="w-full border-collapse table-fixed">
        <thead className="sticky top-0 z-20">
          {/* Cabecera de Grupos */}
          <tr className="bg-slate-800 text-white border-b border-slate-700">
            <th colSpan={6} className="py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border-r border-slate-700 text-center">Escuela Origen</th>
            <th colSpan={6} className="py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border-r border-slate-700 text-center">Escuela Destino</th>
            <th className="w-[5%] bg-slate-900"></th>
          </tr>
          {/* Cabecera de Columnas */}
          <tr className="bg-slate-200 border-b border-slate-300 text-[10px] font-black uppercase text-slate-700 tracking-wider">
            <th style={{ width: colWidths.depto }} className="p-2 border-r border-slate-300 text-center">Depto</th>
            <th style={{ width: colWidths.cue }} className="p-2 border-r border-slate-300 text-center">CUE</th>
            <th style={{ width: colWidths.num }} className="p-2 border-r border-slate-300 text-center">Nº</th>
            <th style={{ width: colWidths.anexo }} className="p-2 border-r border-slate-300 text-center">Anexo</th>
            <th style={{ width: colWidths.nombre }} className="p-2 border-r border-slate-300 text-left pl-4">Nombre</th>
            <th style={{ width: colWidths.div }} className="p-2 border-r border-slate-400 text-center">Div</th>
            
            <th style={{ width: colWidths.depto }} className="p-2 border-r border-slate-300 text-center">Depto</th>
            <th style={{ width: colWidths.cue }} className="p-2 border-r border-slate-300 text-center">CUE</th>
            <th style={{ width: colWidths.num }} className="p-2 border-r border-slate-300 text-center">Nº</th>
            <th style={{ width: colWidths.anexo }} className="p-2 border-r border-slate-300 text-center">Anexo</th>
            <th style={{ width: colWidths.nombre }} className="p-2 border-r border-slate-300 text-left pl-4">Nombre</th>
            <th style={{ width: colWidths.div }} className="p-2 border-r border-slate-400 text-center">Div</th>
            <th style={{ width: colWidths.dist }} className="p-2 bg-slate-700 text-white text-center">KM</th>
          </tr>
        </thead>
        
        <tbody className={`transition-opacity duration-200 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          {datosVisibles.map((asig, i) => (
            <tr 
              key={`asig-${i}`} 
              onClick={() => setDetalleSelected(asig)}
              className={`border-b border-slate-200 cursor-pointer transition-all duration-150 h-[40px] text-slate-600 font-medium
                ${i % 2 === 0 ? 'bg-[#FAF9F6]' : 'bg-[#E5E7EB]'} 
                hover:bg-slate-600 hover:text-white`}
            >
              {/* ORIGEN */}
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_Departamento}</td>
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_CUE}</td>
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_Numero_Escuela}</td>
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_Numero_Anexo}</td>
              <td className="p-2 text-[11px] truncate pl-4 border-r border-slate-300/30 uppercase leading-none">{asig.origen_Nombre_Escuela}</td>
              <td className="p-2 text-[11px] text-center border-r border-slate-400 font-bold">{asig.origen_Division}</td>
              
              {/* DESTINO */}
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_Departamento || '-'}</td>
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_CUE || '-'}</td>
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_Numero_Escuela || '-'}</td>
              <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_Numero_Anexo || '-'}</td>
              <td className="p-2 text-[11px] truncate pl-4 border-r border-slate-300/30 uppercase leading-none">{asig.destino_Nombre_Escuela || '---'}</td>
              <td className="p-2 text-[11px] text-center border-r border-slate-400 font-bold">{asig.destino_Division || '-'}</td>
              
              {/* DISTANCIA */}
              <td className="p-2 text-[11px] font-black text-center bg-slate-900/5 group-hover:bg-transparent">
                {(asig.Distancia_KM || 0).toFixed(2)}
              </td>
            </tr>
          ))}

          {filasVacias.map((_, i) => {
            const indexFila = datosVisibles.length + i;
            return (
              <tr 
                key={`empty-${i}`} 
                className={`h-[40px] border-b border-slate-200 ${indexFila % 2 === 0 ? 'bg-[#FAF9F6]' : 'bg-[#E5E7EB]'}`}
              >
                <td colSpan={13}></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <DetalleAsignacionModal 
        show={!!detalleSelected} 
        onHide={() => setDetalleSelected(null)} 
        data={detalleSelected} 
      />
    </div>
  );
};

export default TablaAsignaciones;