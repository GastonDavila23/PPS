import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import type { IAsignacionFlat } from './data/mockAsignaciones';
import PanelAdmin from './components/PanelAdmin';
import AppHeader from './components/Header';
import CargaPlanillasModal from './components/CargarPlanilla';
import PanelDescargas from './components/PanelDescargas';
import TablaAsignaciones from './components/TablaAsisgnaciones';

type TipoFiltro = 'ninguno' | 'departamento' | 'turno' | 'observaciones';
type RolUsuario = 'admin' | 'profesor' | 'profesor-pendiente';

function App() {
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth0();

  // --- Estados de la aplicación ---
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [asignaciones, setAsignaciones] = useState<IAsignacionFlat[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // --- Estados de Paginación y Filtros ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 15;
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('ninguno');
  const [valorFiltro, setValorFiltro] = useState<string>('todos');

  // --- Estados para Modales ---
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    const getDatosYRol = async () => {
      if (!isAuthenticated || !user?.email) {
        setIsDataLoading(false);
        setRol(null);
        setAsignaciones([]);
        return;
      }

      setIsDataLoading(true);
      setDataError(null);

      try {
        const rolResponse = await axios.get(`http://127.0.0.1:5000/api/usuarios/rol?email=${user.email}`);
        const userRole: RolUsuario = rolResponse.data.rol;
        setRol(userRole);

        if (userRole === 'admin' || userRole === 'profesor') {
          const response = await axios.get("http://127.0.0.1:5000/api/asignaciones", {
            params: { 
              page: currentPage, 
              limit: ITEMS_PER_PAGE,
              tipoFiltro: tipoFiltro,
              valorFiltro: valorFiltro 
            }
          });
          setAsignaciones(response.data.asignaciones);
          setTotalItems(response.data.totalItems);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        setDataError("No se pudo cargar la información. Es posible que no haya datos cargados en el sistema.");
        setAsignaciones([]);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    getDatosYRol();
  }, [isAuthenticated, user, currentPage, tipoFiltro, valorFiltro]);

  const opcionesDepartamento = useMemo(() => [...new Set(asignaciones.map(a => a.origen_Departamento).filter(Boolean))], [asignaciones]);
  const opcionesTurno = useMemo(() => [...new Set(asignaciones.map(a => a.origen_Turno).filter(Boolean))], [asignaciones]);
  const opcionesObservaciones = useMemo(() => [...new Set(asignaciones.map(a => a.Observaciones).filter(Boolean))], [asignaciones]);

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoFiltro(e.target.value as TipoFiltro);
    setValorFiltro('todos');
    setCurrentPage(1);
  };
  
  const handleFilterValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValorFiltro(e.target.value);
    setCurrentPage(1); 
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderizarFiltroDeValor = () => {
    if (tipoFiltro === 'ninguno') return null;

    let opciones: string[] = [];
    let etiqueta = 'Seleccioná un valor';
    switch (tipoFiltro) {
      case 'departamento': opciones = opcionesDepartamento; etiqueta = 'Departamento de Origen'; break;
      case 'turno': opciones = opcionesTurno; etiqueta = 'Turno'; break;
      case 'observaciones': opciones = opcionesObservaciones; etiqueta = 'Observaciones'; break;
    }
    return (
      <Col md={4}>
        <Form.Group controlId="filtroDeValor">
          <Form.Label><strong>{etiqueta}</strong></Form.Label>
          <Form.Select value={valorFiltro} onChange={handleFilterValueChange}>
            <option value="todos">Todos</option>
            {opciones.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
          </Form.Select>
        </Form.Group>
      </Col>
    );
  };
  
  const renderizarContenidoPrincipal = () => {
    if (isAuthLoading) {
      return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    }
    if (!isAuthenticated) {
      return <Alert variant="info" className="text-center mt-4"><h2>Por favor, iniciá sesión para ver el sistema.</h2></Alert>;
    }
    if (isDataLoading) {
      return <div className="text-center mt-5"><Spinner animation="border" /><p className="mt-2">Cargando asignaciones...</p></div>;
    }
    
    switch (rol) {
      case 'admin':
      case 'profesor':
        if (dataError) return <Alert variant="danger" className="text-center mt-4">{dataError}</Alert>;
        return (
          <>
            <div className="text-center mb-4">
              <h2>Panel de Asignaciones</h2>
              <p className="lead">Visualiza las asignaciones de profesores entre escuelas y filtra los resultados.</p>
            </div>
            <Row className="mb-3 bg-light p-3 rounded align-items-end">
              <Col md={4}>
                <Form.Group controlId="tipoDeFiltro">
                  <Form.Label><strong>Filtrar por</strong></Form.Label>
                  <Form.Select value={tipoFiltro} onChange={handleFilterTypeChange}>
                    <option value="ninguno">Sin filtro</option>
                    <option value="departamento">Departamento de Origen</option>
                    <option value="turno">Turno</option>
                    <option value="observaciones">Observaciones</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {renderizarFiltroDeValor()}
            </Row>
            <p className="text-muted">Mostrando {asignaciones.length} de {totalItems} resultados.</p>
            <TablaAsignaciones asignaciones={asignaciones} />
          </>
        );
      case 'profesor-pendiente':
        return <Alert variant="warning" className="text-center mt-4"><h2>Tu cuenta está pendiente de aprobación.</h2></Alert>;
      default:
        return <p className="text-center">Verificando permisos...</p>;
    }
  };

  return (
    <>
      <Container fluid className="mt-4 p-4">
        <AppHeader 
          rol={rol} 
          onShowAdminPanel={() => setShowAdminModal(true)} 
          onShowUploadPanel={() => setShowUploadModal(true)}
          onShowDownloadPanel={() => setShowDownloadModal(true)}
        />
        <main>
          {renderizarContenidoPrincipal()}
          {(rol === 'admin' || rol === 'profesor') && totalPages > 1 &&
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                <Pagination.Item active>{`Página ${currentPage} de ${totalPages}`}</Pagination.Item>
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          }
        </main>
      </Container>
      
      {/* Modales */}
      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Panel de Administración de Roles</Modal.Title></Modal.Header>
        <Modal.Body><PanelAdmin /></Modal.Body>
      </Modal>

      <CargaPlanillasModal show={showUploadModal} onHide={() => setShowUploadModal(false)} />
      
      <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Descargar Datos en Excel</Modal.Title></Modal.Header>
        <Modal.Body>
          <PanelDescargas departamentos={opcionesDepartamento} turnos={opcionesTurno} observaciones={opcionesObservaciones} />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;