import { useState, useEffect } from 'react';
import { asignacionesService } from '../services/asignacionesService';
import { 
  FileEarmarkSpreadsheet, 
  CheckCircleFill, 
  ExclamationTriangleFill,
  InfoCircleFill,
  CpuFill
} from 'react-bootstrap-icons';
import GuiaFormatosOverlay from './GuiaFormatosOverlay';
import { io } from 'socket.io-client';

interface CargaPlanillasModalProps {
  onHide: () => void;
  usuarioEmail?: string;
}

function CargaPlanillasModal({ onHide, usuarioEmail }: CargaPlanillasModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Esperando archivos...');

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("progreso_matching", (data) => {
      setProgreso(data.porcentaje);
      setStatusMsg(data.mensaje);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setError('');
    setProgreso(0);
    setStatusMsg('Archivos seleccionados listos.');
  };

  const handleSubmit = async () => {
    if (!files || files.length === 0) {
      setError('Por favor, selecciona al menos un archivo.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setProgreso(5);
    setStatusMsg('Subiendo planillas al servidor...');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('planillas', files[i]);
    }
    formData.append('usuario_email', usuarioEmail || '');

    try {
      const res = await asignacionesService.uploadPlanillas(formData);
      setSuccess(`Éxito: ${res.message}`);
      setProgreso(100);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      const msgError = err.response?.data?.error || 'Error al procesar los archivos.';
      setError(msgError);
      setIsLoading(false);
      setProgreso(0);
    }
  };

  const handleClose = () => {
    if (success) window.location.reload();
    if (!isLoading) onHide();
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
          Sube archivos Excel o CSV. El sistema unificará los datos.
        </p>
        <button 
          onClick={() => setShowTutorial(true)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
        >
          <InfoCircleFill size={14} />
          Ver Formato Correcto
        </button>
      </div>

      {!isLoading ? (
        <div className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4
          ${files ? 'border-blue-500 bg-blue-50/50 shadow-inner' : 'border-slate-300 bg-white hover:border-slate-400'}`}>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            multiple 
            onChange={handleFileChange}
            disabled={isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <FileEarmarkSpreadsheet size={48} className={`transition-colors duration-300 ${files ? 'text-blue-500' : 'text-slate-300'}`} />
          <div className="text-center">
            <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
              {files ? `${files.length} archivos listos` : 'Arrastra tus archivos o haz clic aquí'}
            </p>
          </div>
        </div>
      ) : (
        /* VISTA DE PROGRESO WEBSOCKET */
        <div className="p-12 border-2 border-blue-100 bg-blue-50/30 rounded-[2rem] flex flex-col items-center gap-6 animate-in fade-in zoom-in">
          <div className="relative w-24 h-24 flex items-center justify-center">
             <CpuFill size={40} className="text-blue-600 animate-pulse" />
             <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-600">
              <span>{statusMsg}</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700">
          <ExclamationTriangleFill size={18} />
          <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-700 animate-bounce">
          <CheckCircleFill size={18} />
          <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
        <button 
          onClick={handleClose}
          disabled={isLoading}
          className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!files || files.length === 0 || isLoading}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all
            ${isLoading ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white shadow-slate-200'}`}
        >
          {isLoading ? 'Calculando Matriz...' : 'Procesar y Cargar'}
        </button>
      </div>

      {showTutorial && <GuiaFormatosOverlay onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

export default CargaPlanillasModal;