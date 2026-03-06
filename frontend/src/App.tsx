import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Spinner from 'react-bootstrap/Spinner';
import { 
  LayoutSidebarInset, 
  LayoutSidebar, 
  HourglassSplit
} from 'react-bootstrap-icons';
import { useAsignaciones } from './hooks/useAsignaciones';
import TablaAsignaciones from './components/TablaAsignaciones';
import AppHeader from './components/Header';
import PanelAdmin from './components/PanelAdmin';
import CargaPlanillasModal from './components/CargarPlanilla';
import PanelDescargas from './components/PanelDescargas';
import SidebarStats from './components/SidebarStats';
import CustomModal from './components/CustomModal';

function App() {
  const { isLoading: isAuthLoading, isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  
  const {
    rol,
    asignaciones,
    isDataLoading,
    paginacion,
    filtros,
    opciones
  } = useAsignaciones(isAuthenticated, user);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    paginacion.setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= paginacion.totalPages && !isDataLoading) {
      paginacion.setCurrentPage(p);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner animation="grow" variant="primary" size="sm" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-200">
          <h1 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter uppercase">Asignador DGE</h1>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            Entrar al Sistema
          </button>
        </div>
      </div>
    );
  }

  // --- BLOQUEO DE SEGURIDAD PARA ROLES PENDIENTES ---
  if (rol === 'profesor-pendiente') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-orange-100 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <HourglassSplit size={40} />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tighter">Acceso Pendiente</h1>
          <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">
            Tu cuenta ha sido registrada correctamente en el sistema de la <span className="text-blue-600 font-bold">DGE</span>. 
            Por seguridad, un administrador debe aprobar tu nivel de acceso antes de habilitar las consultas.
          </p>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans h-screen overflow-hidden">
      <header className="bg-white border-b border-slate-200 z-50 shrink-0">
        <div className="max-w-full mx-auto px-6">
          <AppHeader
            rol={rol}
            onShowAdminPanel={() => setShowAdminModal(true)}
            onShowUploadPanel={() => setShowUploadModal(true)}
            onShowDownloadPanel={() => setShowDownloadModal(true)}
            user={user}
            logout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside
          className={`transition-all duration-300 ease-in-out bg-white border-r border-slate-200 h-full overflow-hidden
            ${showSidebar ? 'w-[320px] opacity-100' : 'w-0 opacity-0'}`}
        >
          <SidebarStats
            totalItems={paginacion.totalItems}
            userName={user?.nickname}
            rol={rol}
            filtros={filtros}
            opciones={opciones}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <main className="flex-1 flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
          <div className="px-8 py-4 flex items-center justify-between shrink-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              {showSidebar ? <LayoutSidebarInset size={18} /> : <LayoutSidebar size={18} />}
              {showSidebar ? 'Contraer Panel' : 'Expandir Panel'}
            </button>

            <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Sistema de Gestión Territorial Docente <span className="text-slate-200 mx-2">|</span> <span className="text-blue-500">Mendoza</span>
              </p>
            </div>
          </div>

          <div className="flex-1 px-8 overflow-hidden flex flex-col">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {isDataLoading && asignaciones.length === 0 ? (
                <div className="flex items-center justify-center h-[480px]">
                  <Spinner animation="border" variant="primary" size="sm" />
                </div>
              ) : (
                <TablaAsignaciones
                  asignaciones={asignaciones}
                  isLoading={isDataLoading}
                  limit={10}
                />
              )}
            </div>

            {paginacion.totalPages > 1 && (
              <div className="py-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(paginacion.currentPage - 1)}
                  disabled={paginacion.currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-blue-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  Anterior
                </button>

                <div className="px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-200 uppercase tracking-widest">
                  Página {paginacion.currentPage} de {paginacion.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(paginacion.currentPage + 1)}
                  disabled={paginacion.currentPage === paginacion.totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-blue-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <CustomModal 
        show={showUploadModal} 
        onHide={() => setShowUploadModal(false)} 
        title="Cargar Planillas de Datos"
      >
        <CargaPlanillasModal onHide={() => setShowUploadModal(false)} usuarioEmail={user?.email} />
      </CustomModal>

      <CustomModal 
        show={showAdminModal} 
        onHide={() => setShowAdminModal(false)} 
        title="Administrar Usuarios"
        width="w-[60vw]"
      >
        <PanelAdmin usuarioEmail={user?.email} />
      </CustomModal>

      <CustomModal 
        show={showDownloadModal} 
        onHide={() => setShowDownloadModal(false)} 
        title="Exportar Reportes"
        width="w-[55vw]"
      >
        <PanelDescargas departamentos={opciones.departamentos} turnos={opciones.turnos} />
      </CustomModal>

    </div>
  );
}

export default App;