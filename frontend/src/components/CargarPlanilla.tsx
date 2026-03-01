import { useState } from 'react';
import { asignacionesService } from '../services/asignacionesService';
import { 
  FileEarmarkSpreadsheet, 
  CheckCircleFill, 
  ExclamationTriangleFill,
  InfoCircleFill
} from 'react-bootstrap-icons';
import GuiaFormatosOverlay from './GuiaFormatosOverlay';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setError('');
  };

  const handleSubmit = async () => {
    if (!files || files.length === 0) {
      setError('Por favor, selecciona al menos un archivo.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // LÓGICA ORIGINAL INTACTA
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('planillas', files[i]);
    }
    
    // Agregamos el email para el historial en la base de datos
    if (usuarioEmail) {
        formData.append('usuario_email', usuarioEmail);
    }

    try {
      const data = await asignacionesService.uploadPlanillas(formData);
      setSuccess(data.mensaje || "Planillas procesadas correctamente.");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error al subir los archivos.";
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (success) window.location.reload();
    if (!isLoading) onHide();
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      
      {/* CABECERA CON BOTÓN DE TUTORIAL */}
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

      {/* ZONA DE CARGA INTERACTIVA */}
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
          {files && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {Array.from(files).map((f, i) => (
                <span key={i} className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded-md uppercase tracking-tighter">
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK DE ESTADO */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 animate-in slide-in-from-top-2">
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

      {/* ACCIONES (FOOTER INTERNO) */}
      <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
        <button 
          onClick={handleClose}
          disabled={isLoading}
          className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all"
        >
          Cancelar
        </button>
        
        <button 
          onClick={handleSubmit}
          disabled={!files || files.length === 0 || isLoading}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-3
            ${isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </>
          ) : (
            'Procesar y Cargar'
          )}
        </button>
      </div>

      {/* OVERLAY DEL TUTORIAL */}
      {showTutorial && (
        <GuiaFormatosOverlay onClose={() => setShowTutorial(false)} />
      )}

    </div>
  );
}

export default CargaPlanillasModal;