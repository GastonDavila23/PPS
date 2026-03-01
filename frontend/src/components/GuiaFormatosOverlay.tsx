import { XCircleFill, InfoCircleFill, ExclamationTriangleFill } from 'react-bootstrap-icons';

interface GuiaFormatosOverlayProps {
  onClose: () => void;
}

function GuiaFormatosOverlay({ onClose }: GuiaFormatosOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* 90% ancho y 85% alto para darle respiro */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-[90vw] lg:w-[85vw] h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Compacto */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <InfoCircleFill size={20} className="text-blue-600" />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">
              Estructura de Archivos
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <XCircleFill size={24} />
          </button>
        </div>
        
        {/* Cuerpo Principal: Devolvemos overflow-y-auto para que si la pantalla es muy enana, haga scroll PERO NO SE TAPE con el botón */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 bg-slate-50/50 custom-scrollbar">
          
          {/* Regla de Oro - Corta y al pie */}
          <div className="bg-blue-100/80 border border-blue-300 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
            <ExclamationTriangleFill size={20} className="text-blue-700 shrink-0 hidden sm:block" />
            <p className="text-sm text-blue-900 leading-tight">
              <span className="font-black text-blue-800 tracking-widest uppercase mr-2">Regla de Oro:</span>
              Títulos obligatorios en la <strong className="font-black text-blue-950">FILA 1</strong>. La columna <strong className="font-black text-blue-950 bg-blue-200 px-1.5 rounded">CUE</strong> es indispensable.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
            
            {/* Opción A */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="shrink-0 mb-3">
                <p className="font-black text-slate-800 text-sm uppercase tracking-wide">Opción A: Un Solo Archivo</p>
                <p className="text-xs text-slate-500 mt-0.5">Datos y coordenadas en la misma hoja de cálculo.</p>
              </div>
              
              <div className="bg-slate-900 text-green-400 p-3 rounded-xl font-mono text-[11px] overflow-hidden flex flex-col justify-center border border-slate-800 flex-1 shadow-inner">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-700 text-white text-[10px] tracking-wider">
                        <th className="p-1.5">DEPTO</th>
                        <th className="p-1.5">CUE</th>
                        <th className="p-1.5">N°</th>
                        <th className="p-1.5">ANEXO</th>
                        <th className="p-1.5">NOMBRE</th>
                        <th className="p-1.5">DIV</th>
                        <th className="p-1.5">TURNO</th>
                        <th className="p-1.5 text-blue-300">Latitud</th>
                        <th className="p-1.5 text-blue-300">Longitud</th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      <tr>
                        <td className="p-1.5">San Martín</td>
                        <td className="p-1.5">5000123</td>
                        <td className="p-1.5">1-001</td>
                        <td className="p-1.5">0</td>
                        <td className="p-1.5">Esc. San Martín</td>
                        <td className="p-1.5">1ra</td>
                        <td className="p-1.5">Mañana</td>
                        <td className="p-1.5 text-blue-300">-32.8894</td>
                        <td className="p-1.5 text-blue-300">-68.8458</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Opción B */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="shrink-0 mb-3">
                <p className="font-black text-slate-800 text-sm uppercase tracking-wide">Opción B: Separados <span className="text-blue-600">(Recomendado)</span></p>
                <p className="text-xs text-slate-500 mt-0.5">El sistema unirá los dos Excel usando el CUE.</p>
              </div>
              
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex-1 flex flex-col min-h-0">
                  <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1 shrink-0">1. Datos</p>
                  <div className="bg-slate-900 text-green-400 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto overflow-y-hidden flex items-center border border-slate-800 whitespace-nowrap shadow-inner flex-1 custom-scrollbar">
                    | DEPTO | CUE | N° | ANEXO | NOMBRE | DIV | TURNO |<br/>
                    | San Martín | 5000123 | 1-001 | 0 | Esc. San Martín | 1ra | Mañana |
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1 shrink-0">2. Coordenadas</p>
                  <div className="bg-slate-900 text-blue-300 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto overflow-y-hidden flex items-center border border-slate-800 whitespace-nowrap shadow-inner flex-1 custom-scrollbar">
                    | CUE | Latitud | Longitud |<br/>
                    | 5000123 | -32.8894 | -68.8458 |
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-3 md:p-4 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs md:text-sm py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
          >
            Entendido, ya puedo cargar las planillas
          </button>
        </div>

      </div>
    </div>
  );
}

export default GuiaFormatosOverlay;