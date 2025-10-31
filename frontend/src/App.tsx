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
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
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

  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [asignaciones, setAsignaciones] = useState<IAsignacionFlat[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;

  const [filtroDepto, setFiltroDepto] = useState<string>('todos');
  const [filtroTurno, setFiltroTurno] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroNombreDebounced, setFiltroNombreDebounced] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const [allDepartamentos, setAllDepartamentos] = useState<string[]>([]);
  const [allTurnos, setAllTurnos] = useState<string[]>([]);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timerId = setTimeout(() => {
      setFiltroNombreDebounced(searchTerm);
      setCurrentPage(1);
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

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
              departamento: filtroDepto,
              turno: filtroTurno,
              estado_asignacion: filtroEstado,
              nombre_escuela: filtroNombreDebounced
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
  }, [isAuthenticated, user, currentPage, filtroDepto, filtroTurno, filtroEstado, filtroNombreDebounced]);
  
  const opcionesDepartamento = useMemo(() => [...new Set(allDepartamentos.filter(Boolean))], [allDepartamentos]);
  const opcionesTurno = useMemo(() => [...new Set(allTurnos.filter(Boolean))], [allTurnos]);

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
    if (isDataLoading && asignaciones.length === 0) { 
      return <div className="text-center mt-5"><Spinner animation="border" /><p className="mt-2">Cargando asignaciones...</p></div>;
    }
    
    switch (rol) {
      case 'admin':
      case 'profesor':
        if (dataError && asignaciones.length === 0) return <Alert variant="danger" className="text-center mt-4">{dataError}</Alert>;
        return (
          <>
            <div className="text-center mb-4">
              <h2>Panel de Asignaciones</h2>
              <p className="lead">Visualiza las asignaciones de profesores entre escuelas y filtra los resultados.</p>
            </div>

            <Card className="mb-4">
              <Card.Header as="h5">Filtros de Búsqueda</Card.Header>
              <Card.Body>
                <Form>
                  <Row className="g-3 align-items-center">
                    
                    {/* --- Filtro Departamento --- */}
                    <Col md={3}>
                      <FloatingLabel controlId="floatingDepto" label="Departamento">
                        <Form.Select 
                          aria-label="Departamento de Origen"
                          value={filtroDepto} 
                          onChange={(e) => handleFilterChange(setFiltroDepto, e.target.value)}
                        >
                          <option value="todos">Todos los Departamentos</option>
                          {opcionesDepartamento.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>
                    
                    {/* --- Filtro Turno --- */}
                    <Col md={2}>
                      <FloatingLabel controlId="floatingTurno" label="Turno">
                        <Form.Select 
                          aria-label="Turno"
                          value={filtroTurno} 
                          onChange={(e) => handleFilterChange(setFiltroTurno, e.target.value)}
                        >
                          <option value="todos">Todos los Turnos</option>
                          {opcionesTurno.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>

                    {/* --- Filtro Estado --- */}
                    <Col md={3}>
                      <FloatingLabel controlId="floatingEstado" label="Estado">
                        <Form.Select 
                          aria-label="Estado de Asignación"
                          value={filtroEstado} 
                          onChange={(e) => handleFilterChange(setFiltroEstado, e.target.value)}
                        >
                          <option value="todos">Todos los Estados</option>
                          {opcionesEstadoAsignacion.map(opcion => (<option key={opcion.value} value={opcion.value}>{opcion.label}</option>))}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>
                    
                    {/* --- Filtro Nombre --- */}
                    <Col md={4}>
                      <InputGroup>
                        <FloatingLabel controlId="floatingNombre" label="Buscar por Nombre de Escuela...">
                          <Form.Control
                            type="text"
                            placeholder="Buscar por Nombre de Escuela..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </FloatingLabel>
                        {isSearching && (
                          <InputGroup.Text>
                            <Spinner animation="border" size="sm" />
                          </InputGroup.Text>
                        )}
                      </InputGroup>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
            
            <p className="text-muted">Mostrando {isDataLoading ? '...' : asignaciones.length} de {isDataLoading ? '...' : totalItems} resultados.</p>
            {isDataLoading && <div className="text-center mt-3"><Spinner animation="border" size="sm" /></div>}
            {!isDataLoading && asignaciones.length > 0 && <TablaAsignaciones asignaciones={asignaciones} />}
            {!isDataLoading && asignaciones.length === 0 && <Alert variant="secondary">No se encontraron resultados para los filtros seleccionados.</Alert>}
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
          {(rol === 'admin' || rol === 'profesor') && totalPages > 1 && !isDataLoading &&
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1 || isDataLoading} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isDataLoading} />
                <Pagination.Item active>{`Página ${currentPage} de ${totalPages}`}</Pagination.Item>
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isDataLoading} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || isDataLoading} />
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