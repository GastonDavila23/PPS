import { X, InfoCircleFill, ExclamationTriangleFill } from 'react-bootstrap-icons';

interface GuiaFormatosOverlayProps {
  onClose: () => void;
}

function GuiaFormatosOverlay({ onClose }: GuiaFormatosOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Contenedor Principal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Compacto */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <InfoCircleFill size={16} className="text-blue-600" />
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-tighter">
              Guía de Estructura de Archivos
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>
        
        {/* Cuerpo con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white">
          
          {/* Alerta de Regla de Oro */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3 shadow-sm">
            <ExclamationTriangleFill size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-normal">
              <span className="font-black uppercase mr-1">Regla Crítica:</span>
              Los archivos deben contener todos los <strong className="font-bold">DATOS CLAVE</strong>. El sistema busca automáticamente la columna <strong className="font-bold underline">CUE</strong> para unificar datos.
            </p>
          </div>

          {/* Grilla de Opciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Opción A: Unificado */}
            <div className="flex flex-col border border-slate-100 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 text-center">
                <p className="font-black text-slate-700 text-[10px] uppercase tracking-wider">Opción A: Archivo Único</p>
              </div>
              <div className="p-3 bg-white">
                <p className="text-[10px] text-slate-500 mb-3 text-center italic">Datos y Coordenadas juntos</p>
                <div className="bg-slate-900 rounded-md p-3 overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[10px] font-mono text-emerald-400 whitespace-nowrap">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800 uppercase">
                        <th className="pb-1 pr-3">CUE</th>
                        <th className="pb-1 pr-3">N°</th>
                        <th className="pb-1 pr-3">Anexo</th>
                        <th className="pb-1 pr-3">Dpto</th>
                        <th className="pb-1 pr-3">Nombre</th>
                        <th className="pb-1 pr-3">Div</th>
                        <th className="pb-1 pr-3">Turno</th>
                        <th className="pb-1 text-blue-400">Lat/Lon</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pt-2 pr-3">5000123</td>
                        <td className="pt-2 pr-3">4-084</td>
                        <td className="pt-2 pr-3">4-084-1</td>
                        <td className="pt-2 pr-3">San Martín</td>
                        <td className="pt-2 pr-3">Carra</td>
                        <td className="pt-2 pr-3">C</td>
                        <td className="pt-2 pr-3">Mañana</td>
                        <td className="pt-2 text-blue-400">-32.8 / -68.8</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Opción B: Separados */}
            <div className="flex flex-col border border-blue-100 rounded-lg overflow-hidden ring-2 ring-blue-50 ring-inset">
              <div className="bg-blue-600 px-3 py-2 text-center text-white">
                <p className="font-black text-[10px] uppercase tracking-wider">Opción B: Separados (Recomendado)</p>
              </div>
              <div className="p-3 bg-white space-y-3">
                <div className="space-y-1">
                   <span className="text-[9px] font-bold text-slate-400 uppercase">1. Excel de Escuelas</span>
                   <div className="bg-slate-900 rounded p-2 text-[9px] font-mono text-emerald-400 overflow-x-auto">
                    CUE | N° | ANEXO | DPTO | NOMBRE | TURNO | DIVISION
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] font-bold text-slate-400 uppercase">2. Excel de Coordenadas</span>
                   <div className="bg-slate-900 rounded p-2 text-[9px] font-mono text-blue-300 overflow-x-auto">
                    CUE | LATITUD | LONGITUD
                   </div>
                </div>
                <p className="text-[9px] text-blue-600 font-bold text-center pt-1 italic">
                  * El sistema cruzará ambos archivos por el CUE.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-3 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}

export default GuiaFormatosOverlay;