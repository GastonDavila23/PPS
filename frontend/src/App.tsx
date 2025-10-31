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

type RolUsuario = 'admin' | 'profesor' | 'profesor-pendiente';

const opcionesEstadoAsignacion = [
  { value: '0-5km', label: 'Asignado (0-5 km)' },
  { value: '5-10km', label: 'Asignado (5-10 km)' },
  { value: '10-30km', label: 'Asignado (10-30 km)' },
  { value: 'no-asignadas', label: 'No Asignadas (Excepciones)' },
];

function App() {
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth0();

  // --- Estados de la aplicación ---
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [asignaciones, setAsignaciones] = useState<IAsignacionFlat[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // --- NUEVOS ESTADOS DE FILTROS MÚLTIPLES ---
  const [filtroDepto, setFiltroDepto] = useState<string>('todos');
  const [filtroTurno, setFiltroTurno] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const [allDepartamentos, setAllDepartamentos] = useState<string[]>([]);
  const [allTurnos, setAllTurnos] = useState<string[]>([]);
  
  // --- Estados para Modales ---
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Hook de Efecto para cargar datos
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
        // 1. Obtener Rol
        const rolResponse = await axios.get(`http://127.0.0.1:5000/api/usuarios/rol?email=${user.email}`);
        const userRole: RolUsuario = rolResponse.data.rol;
        setRol(userRole);

        // 2. Si tiene permiso, obtener asignaciones con los filtros
        if (userRole === 'admin' || userRole === 'profesor') {
          const response = await axios.get("http://127.0.0.1:5000/api/asignaciones", {
            params: { 
              page: currentPage, 
              limit: ITEMS_PER_PAGE,
              // Envío de filtros independientes
              departamento: filtroDepto,
              turno: filtroTurno,
              estado_asignacion: filtroEstado
            }
          });
          setAsignaciones(response.data.asignaciones);
          setTotalItems(response.data.totalItems);
          setTotalPages(response.data.totalPages);
          
          setAllDepartamentos(response.data.allDepartamentos);
          setAllTurnos(response.data.allTurnos);
        }
      } catch (error) {
        setDataError("No se pudo cargar la información. Es posible que no haya datos cargados en el sistema.");
        setAsignaciones([]);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    getDatosYRol();
  }, [isAuthenticated, user, currentPage, filtroDepto, filtroTurno, filtroEstado]);
  // Listas de opciones para los menús desplegables
  const opcionesDepartamento = useMemo(() => [...new Set(allDepartamentos.filter(Boolean))], [allDepartamentos]);
  const opcionesTurno = useMemo(() => [...new Set(allTurnos.filter(Boolean))], [allTurnos]);

  // Manejador genérico para cambiar filtros y resetear la paginación
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            <Row className="mb-3 bg-light p-3 rounded align-items-end g-3">
              <Col md={4}>
                <Form.Group controlId="filtroDepto">
                  <Form.Label><strong>Departamento de Origen</strong></Form.Label>
                  <Form.Select value={filtroDepto} onChange={(e) => handleFilterChange(setFiltroDepto, e.target.value)}>
                    <option value="todos">Todos</option>
                    {opcionesDepartamento.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group controlId="filtroTurno">
                  <Form.Label><strong>Turno</strong></Form.Label>
                  <Form.Select value={filtroTurno} onChange={(e) => handleFilterChange(setFiltroTurno, e.target.value)}>
                    <option value="todos">Todos</option>
                    {opcionesTurno.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="filtroEstado">
                  <Form.Label><strong>Estado de Asignación</strong></Form.Label>
                  <Form.Select value={filtroEstado} onChange={(e) => handleFilterChange(setFiltroEstado, e.target.value)}>
                    <option value="todos">Todos</option>
                    {opcionesEstadoAsignacion.map(opcion => (<option key={opcion.value} value={opcion.value}>{opcion.label}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
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
          <PanelDescargas 
            departamentos={opcionesDepartamento} 
            turnos={opcionesTurno} 
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;