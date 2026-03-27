import { useState } from 'react';
import axios from 'axios';
import { CloudDownload, FileEarmarkExcel, Funnel, LightningCharge, ExclamationCircle } from 'react-bootstrap-icons';

interface PanelDescargasProps {
  departamentos: string[];
  turnos: string[];
  usuarioEmail?: string;
}

const opcionesEstadoAsignacion = [
  { value: '0-5km', label: 'Asignado (0-5 km)', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: '5-10km', label: 'Asignado (5-10 km)', color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: '10-30km', label: 'Asignado (10-30 km)', color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'no-asignadas', label: 'No Asignadas', color: 'text-rose-600', bg: 'bg-rose-50' },
];

function PanelDescargas({ departamentos, turnos, usuarioEmail }: PanelDescargasProps) {
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const generarNombreArchivo = (depto: string, turno: string, estado: string) => {
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    const partDepto = depto !== 'todos' ? `_zona-${depto}` : '_toda-la-provincia';
    const partTurno = turno !== 'todos' ? `_turno-${turno}` : '';
    const partEstado = estado !== 'todos' ? `_estado-${estado}` : '';
    
    return `reporte_dge${partDepto}${partTurno}${partEstado}_${fecha}.xlsx`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
  };

  const handleDownload = (depto: string, turno: string, estado: string) => {
    setError('');
    setIsDownloading(true);
    
    const params = new URLSearchParams();
    if (usuarioEmail) params.append('email', usuarioEmail);
    if (depto !== 'todos') params.append('departamento', depto);
    if (turno !== 'todos') params.append('turno', turno);
    if (estado !== 'todos') params.append('estado', estado);

    const url = `http://127.0.0.1:5000/api/descargar-excel?${params.toString()}`;

    axios.get(url, { responseType: 'blob' })
      .then(response => {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        
        link.setAttribute('download', generarNombreArchivo(depto, turno, estado));
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
        setIsDownloading(false);
      })
      .catch((err) => {
        console.error("Error descarga:", err);
        setError('No se encontraron datos para los filtros seleccionados o hubo un error en el servidor.');
        setIsDownloading(false);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SECCIÓN DE ACCESOS DIRECTOS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LightningCharge className="text-amber-500" size={14} />
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accesos Directos</h5>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {opcionesEstadoAsignacion.map((opt) => (
            <button 
              key={opt.value} 
              disabled={isDownloading}
              onClick={() => handleDownload('todos', 'todos', opt.value)}
              className={`flex items-center justify-between p-4 rounded-xl border border-slate-100 transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${opt.bg}`}
            >
              <div className="flex flex-col text-left">
                <span className={`text-[10px] font-black uppercase tracking-widest ${opt.color}`}>{opt.label}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Descarga Directa</span>
              </div>
              <CloudDownload className={opt.color} size={16} />
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-slate-200 w-full" />

      {/* SECCIÓN DE PERSONALIZACIÓN */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Funnel className="text-blue-500" size={14} />
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personalizar Reporte</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector Zona */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Zona</label>
            <select 
              value={filtroDepto} 
              onChange={e => setFiltroDepto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="todos">Toda la Provincia</option>
              {departamentos.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>

          {/* Selector Turno */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Franja Horaria</label>
            <select 
              value={filtroTurno} 
              onChange={e => setFiltroTurno(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="todos">Todos los Turnos</option>
              {turnos.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>

          {/* Selector Estado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
            <select 
              value={filtroEstado} 
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="todos">Todas las Asignaciones</option>
              {opcionesEstadoAsignacion.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={() => handleDownload(filtroDepto, filtroTurno, filtroEstado)}
          disabled={isDownloading}
          className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
        >
          <FileEarmarkExcel size={18} className="text-emerald-400" />
          {isDownloading ? 'Preparando archivo...' : 'Generar Documento Excel'}
        </button>
      </section>

      {/* ALERTAS DE ERROR */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
          <ExclamationCircle size={16} />
          <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
        </div>
      )}
    </div>
  );
}

export default PanelDescargas;