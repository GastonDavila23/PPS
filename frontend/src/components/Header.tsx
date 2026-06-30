import { ShieldLock, CloudArrowUp, FileEarmarkArrowDown, BoxArrowRight } from 'react-bootstrap-icons';
import './../index.css';

const AppHeader = ({ rol, onShowAdminPanel, onShowUploadPanel, onShowDownloadPanel, user, logout }: any) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">

      {/* SECCIÓN IZQUIERDA: LOGO Y TÍTULO */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
          <img
            src="/logo.ico"
            alt="DGE Mendoza"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-sm md:text-lg font-black text-slate-800 tracking-tighter uppercase leading-none">
            Asignador <span className="hidden sm:inline">DE PROFESORES</span>
          </h1>
          <span className="text-[7px] md:text-[8px] font-black text-blue-600 uppercase tracking-[0.15em] md:tracking-[0.2em] mt-1">
            DGE · Mendoza
          </span>
        </div>
      </div>

      {/* SECCIÓN CENTRAL: BOTONES DINÁMICOS */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner w-full md:w-auto justify-center">
        {rol === 'admin' ? (
          <div className="flex items-center w-full justify-around md:justify-start">
            {/* BOTÓN CARGAR */}
            <button
              onClick={onShowUploadPanel}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:text-blue-600 transition-all"
            >
              <CloudArrowUp size={16} />
              <span className="hidden lg:inline">Importar</span>
            </button>

            <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

            {/* BOTÓN REPORTES */}
            <button
              onClick={onShowDownloadPanel}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:text-emerald-600 transition-all"
            >
              <FileEarmarkArrowDown size={16} />
              <span className="hidden lg:inline">Reportes</span>
            </button>

            <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

            {/* BOTÓN USUARIOS */}
            <button
              onClick={onShowAdminPanel}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:text-indigo-600 transition-all"
            >
              <ShieldLock size={16} />
              <span className="hidden lg:inline">Usuarios</span>
            </button>
          </div>
        ) : (
          <div className="px-4 md:px-8 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-center">
            Panel de Consulta <span className="hidden sm:inline">de Profesores</span>
          </div>
        )}
      </div>

      {/* SECCIÓN DERECHA: PERFIL */}
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-end">
        <div className="flex flex-col items-end leading-none">
          <span className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase tracking-tighter truncate max-w-[100px]">
            {user?.nickname || 'Usuario'}
          </span>
          <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {rol}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
          title="Cerrar Sesión"
        >
          <BoxArrowRight size={18} />
        </button>
      </div>

    </div>
  );
};

export default AppHeader;