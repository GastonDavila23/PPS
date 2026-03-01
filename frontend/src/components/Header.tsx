import {
  ShieldLock,
  CloudArrowUp,
  FileEarmarkArrowDown,
  BoxArrowRight
} from 'react-bootstrap-icons';

const AppHeader = ({ rol, onShowAdminPanel, onShowUploadPanel, onShowDownloadPanel, user, logout }: any) => {
  return (
    <div className="flex items-center justify-between py-3">

      {/* SECCIÓN IZQUIERDA: LOGO DGE Y TÍTULO */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-1">
          <img
            src="/logo.ico"
            alt="DGE Mendoza"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none">
            Asignador DE PROFESORES
          </h1>
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
            Dirección General de Escuelas · Mendoza
          </span>
        </div>
      </div>

      {/* SECCIÓN CENTRAL */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">

        {/* BOTÓN CARGAR */}
        <button
          onClick={onShowUploadPanel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
        >
          <CloudArrowUp size={16} />
          <span>Importar</span>
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* BOTÓN REPORTES */}
        <button
          onClick={onShowDownloadPanel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all"
        >
          <FileEarmarkArrowDown size={16} />
          <span>Reportes</span>
        </button>

        {rol === 'admin' && (
          <>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            {/* BOTÓN ADMIN */}
            <button
              onClick={onShowAdminPanel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
            >
              <ShieldLock size={16} />
              <span>Usuarios</span>
            </button>
          </>
        )}
      </div>

      {/* SECCIÓN DERECHA: PERFIL Y LOGOUT */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
            {user?.nickname || 'Usuario'}
          </span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {rol}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
          title="Cerrar Sesión"
        >
          <BoxArrowRight size={18} />
        </button>
      </div>

    </div>
  );
};

export default AppHeader;