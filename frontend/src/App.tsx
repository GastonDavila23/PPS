import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// UI Components (React-Bootstrap)
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

// Custom Hooks & Components
import { useAsignaciones } from './hooks/useAsignaciones';
import FiltrosAsignaciones from './components/FiltrosAsignaciones';
import TablaAsignaciones from './components/TablaAsignaciones';
import AppHeader from './components/Header';
import PanelAdmin from './components/PanelAdmin';
import CargaPlanillasModal from './components/CargarPlanilla';
import PanelDescargas from './components/PanelDescargas';

function App() {
  // 1. Auth0 Hook
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth0();
  
  // 2. Custom Hook de Lógica de Negocio (Ahora usa Services y Types internamente)
  const { 
    rol, 
    asignaciones, 
    isDataLoading, 
    dataError, 
    paginacion, 
    filtros, 
    opciones 
  } = useAsignaciones(isAuthenticated, user);

  // 3. Estados locales de UI (Solo visibilidad de modales)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Helper para reiniciar página al filtrar (UI Logic)
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    paginacion.setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    // Protección simple para no pedir páginas inválidas
    if (p >= 1 && p <= paginacion.totalPages && !isDataLoading) {
      paginacion.setCurrentPage(p);
    }
  };

  // --- RENDERIZADO DEL CONTENIDO PRINCIPAL ---
  const renderContenido = () => {
    // A. Cargando autenticación
    if (isAuthLoading) {
      return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }
    
    // B. No autenticado
    if (!isAuthenticated) {
      return (
        <Alert variant="info" className="mt-4 text-center">
          <h2>Inicia sesión para ver los datos.</h2>
        </Alert>
      );
    }
    
    // C. Cargando sistema (primera vez, sin datos previos)
    if (isDataLoading && asignaciones.length === 0 && !dataError) {
        return <div className="text-center mt-5"><Spinner animation="border" /><p>Cargando sistema...</p></div>;
    }

    // D. Renderizado según Rol
    switch (rol) {
      case 'admin':
      case 'profesor':
        // Error crítico
        if (dataError && asignaciones.length === 0) {
          return <Alert variant="danger" className="text-center mt-4">{dataError}</Alert>;
        }

        return (
          <>
            <div className="text-center mb-4">
              <h2>Panel de Asignaciones</h2>
              <p className="lead">Gestión de asignaciones geográficas.</p>
            </div>

            {/* Componente de Filtros (Ahora usa constantes globales) */}
            <FiltrosAsignaciones 
              filtros={filtros} 
              opciones={opciones} 
              onFilterChange={handleFilterChange} 
            />

            <div className="mb-2 text-muted">
              Total: {paginacion.totalItems} resultados
            </div>

            {/* Tabla SPA (Sin saltos de pantalla) */}
            {asignaciones.length > 0 ? (
              <TablaAsignaciones 
                asignaciones={asignaciones} 
                isLoading={isDataLoading} 
                limit={paginacion.ITEMS_PER_PAGE} 
              />
            ) : (
               !isDataLoading && <Alert variant="secondary">No se encontraron resultados.</Alert>
            )}
          </>
        );

      case 'profesor-pendiente':
        return <Alert variant="warning" className="text-center mt-4"><h2>Cuenta pendiente de aprobación.</h2></Alert>;
      
      default:
        return <p className="text-center">Verificando permisos...</p>;
    }
  };

  return (
    <>
      <Container fluid className="mt-4 p-4">
        {/* Header Global */}
        <AppHeader 
          rol={rol} 
          onShowAdminPanel={() => setShowAdminModal(true)} 
          onShowUploadPanel={() => setShowUploadModal(true)}
          onShowDownloadPanel={() => setShowDownloadModal(true)}
        />
        
        <main>
          {renderContenido()}
          
          {/* Paginación */}
          {(rol === 'admin' || rol === 'profesor') && paginacion.totalPages > 1 &&
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={paginacion.currentPage === 1 || isDataLoading} 
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(paginacion.currentPage - 1)} 
                  disabled={paginacion.currentPage === 1 || isDataLoading} 
                />
                
                <Pagination.Item active>{paginacion.currentPage}</Pagination.Item>
                
                <Pagination.Next 
                  onClick={() => handlePageChange(paginacion.currentPage + 1)} 
                  disabled={paginacion.currentPage === paginacion.totalPages || isDataLoading} 
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(paginacion.totalPages)} 
                  disabled={paginacion.currentPage === paginacion.totalPages || isDataLoading} 
                />
              </Pagination>
            </div>
          }
        </main>
      </Container>
      
      {/* --- Modales Globales --- */}
      
      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Administración</Modal.Title></Modal.Header>
        <Modal.Body><PanelAdmin /></Modal.Body>
      </Modal>

      <CargaPlanillasModal show={showUploadModal} onHide={() => setShowUploadModal(false)} />
      
      <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Descargar Excel</Modal.Title></Modal.Header>
        <Modal.Body>
          <PanelDescargas 
            departamentos={opciones.departamentos} 
            turnos={opciones.turnos} 
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;