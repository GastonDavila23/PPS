import React, { useState } from 'react';
import type { IAsignacion } from '../types';
import DetalleAsignacionModal from './DetalleAsignacionModal';
import './../index.css';

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

  // PROTECCIÓN DE ANCHOS: Esto es lo único que agregamos para la responsividad.
  // Definimos anchos mínimos en píxeles para que no se colapsen en notebooks.
  const colStyles = {
    depto: { minWidth: '100px', width: '8%' },
    cue: { minWidth: '80px', width: '7%' },
    num: { minWidth: '60px', width: '5%' },
    anexo: { minWidth: '60px', width: '6%' },
    nombre: { minWidth: '220px', width: '18%' }, // Más ancho para el nombre
    div: { minWidth: '45px', width: '4%' },
    dist: { minWidth: '60px', width: '5%' }
  };

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden relative border border-slate-200 shadow-sm rounded-xl">
      
      {/* CONTENEDOR CON SCROLL HORIZONTAL: La clave de la responsividad en PC */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse table-fixed min-w-[1250px]">
          {/* min-w-[1250px] asegura que la tabla nunca se "apriete" más de lo legible */}
          
          <thead className="sticky top-0 z-20">
            {/* Cabecera de Grupos - MANTENEMOS ESTILOS ORIGINALES */}
            <tr className="bg-slate-800 text-white border-b border-slate-700">
              <th colSpan={6} className="py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border-r border-slate-700 text-center">
                Escuela Origen
              </th>
              <th colSpan={6} className="py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border-r border-slate-700 text-center">
                Escuela Destino
              </th>
              <th className="w-[5%] bg-slate-900"></th>
            </tr>
            {/* Cabecera de Columnas - MANTENEMOS ESTILOS ORIGINALES */}
            <tr className="bg-slate-200 border-b border-slate-300 text-[10px] font-black uppercase text-slate-700 tracking-wider">
              <th style={colStyles.depto} className="p-2 border-r border-slate-300 text-center">Depto</th>
              <th style={colStyles.cue} className="p-2 border-r border-slate-300 text-center">CUE</th>
              <th style={colStyles.num} className="p-2 border-r border-slate-300 text-center">Nº</th>
              <th style={colStyles.anexo} className="p-2 border-r border-slate-300 text-center">Anexo</th>
              <th style={colStyles.nombre} className="p-2 border-r border-slate-300 text-left pl-4">Nombre</th>
              <th style={colStyles.div} className="p-2 border-r border-slate-400 text-center">Div</th>
              
              <th style={colStyles.depto} className="p-2 border-r border-slate-300 text-center">Depto</th>
              <th style={colStyles.cue} className="p-2 border-r border-slate-300 text-center">CUE</th>
              <th style={colStyles.num} className="p-2 border-r border-slate-300 text-center">Nº</th>
              <th style={colStyles.anexo} className="p-2 border-r border-slate-300 text-center">Anexo</th>
              <th style={colStyles.nombre} className="p-2 border-r border-slate-300 text-left pl-4">Nombre</th>
              <th style={colStyles.div} className="p-2 border-r border-slate-400 text-center">Div</th>
              <th style={colStyles.dist} className="p-2 bg-slate-700 text-white text-center">KM</th>
            </tr>
          </thead>
          
          <tbody className={`transition-opacity duration-200 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
            {datosVisibles.map((asig, i) => (
              <tr 
                key={`asig-${i}`} 
                onClick={() => setDetalleSelected(asig)}
                className={`border-b border-slate-200 cursor-pointer transition-all duration-150 h-[40px] text-slate-600 font-medium
                  ${i % 2 === 0 ? 'bg-[#FAF9F6]' : 'bg-[#E5E7EB]'} 
                  hover:bg-slate-600 hover:text-white group`} // Agregué 'group' para el KM
              >
                {/* ORIGEN */}
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_Departamento}</td>
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_CUE}</td>
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_Numero_Escuela}</td>
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.origen_Numero_Anexo}</td>
                <td className="p-2 text-[11px] truncate pl-4 border-r border-slate-300/30 uppercase leading-none font-bold">{asig.origen_Nombre_Escuela}</td>
                <td className="p-2 text-[11px] text-center border-r border-slate-400 font-black">{asig.origen_Division}</td>
                
                {/* DESTINO */}
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_Departamento || '-'}</td>
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_CUE || '-'}</td>
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_Numero_Escuela || '-'}</td>
                <td className="p-2 text-[11px] text-center truncate border-r border-slate-300/30">{asig.destino_Numero_Anexo || '-'}</td>
                <td className="p-2 text-[11px] truncate pl-4 border-r border-slate-300/30 uppercase leading-none font-bold">{asig.destino_Nombre_Escuela || '---'}</td>
                <td className="p-2 text-[11px] text-center border-r border-slate-400 font-black">{asig.destino_Division || '-'}</td>
                
                {/* DISTANCIA - MANTENIENDO CONTRASTE EN HOVER */}
                <td className="p-2 text-[11px] font-black text-center bg-slate-900/5 group-hover:bg-transparent group-hover:text-white">
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
      </div>

      <DetalleAsignacionModal 
        show={!!detalleSelected} 
        onHide={() => setDetalleSelected(null)} 
        data={detalleSelected} 
      />
    </div>
  );
};

export default TablaAsignaciones;