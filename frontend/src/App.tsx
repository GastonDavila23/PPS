/**
 * ================================================================================
 * ARCHIVO: App.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este es el componente RAÍZ y PRINCIPAL de la aplicación React.
 *
 * MANEJA:
 * 1.  **Orquestación de Componentes:** Importa y renderiza todos los componentes
 * principales (Header, TablaAsignaciones, Modales, etc.).
 * 2.  **Gestión de Estado Global:** Utiliza `useState` para manejar casi todo el
 * estado de la aplicación (filtros, paginación, datos de la tabla,
 * rol del usuario, visibilidad de los modales).
 * 3.  **Lógica de Datos (Fetching):** Contiene el `useEffect` principal que
 * llama a la API del backend (/api/asignaciones) cada vez que un filtro,
 * la página actual o el estado de autenticación cambia.
 * 4.  **Autenticación y Roles:** Interactúa con Auth0 para obtener el estado
 * de autenticación y luego llama a la API (/api/usuarios/rol) para
 * obtener el rol específico (admin, profesor, etc.).
 * 5.  **Renderizado Condicional:** Decide qué se muestra en la pantalla
 * (Spinner de carga, Alerta de "iniciar sesión", Alerta de "pendiente",
 * o la aplicación principal con la tabla de datos).
 * ================================================================================
 */

// --- Importaciones de React y Hooks ---
import { useState, useEffect, useMemo } from 'react';
// --- Importaciones de API y Autenticación ---
import axios from 'axios'; // Para hacer llamadas a la API (backend)
import { useAuth0 } from '@auth0/auth0-react'; // Hook de Auth0 para autenticación
// --- Importaciones de UI (React-Bootstrap) ---
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
// --- Importaciones de Tipos y Componentes Locales ---
import type { IAsignacionFlat } from './data/mockAsignaciones'; // Define la estructura de datos
import PanelAdmin from './components/PanelAdmin';
import AppHeader from './components/Header';
import CargaPlanillasModal from './components/CargarPlanilla';
import PanelDescargas from './components/PanelDescargas';
import TablaAsignaciones from './components/TablaAsisgnaciones';

// --- Tipos Locales ---
// Define los roles de usuario posibles que puede devolver la API.
type RolUsuario = 'admin' | 'profesor' | 'profesor-pendiente';

// --- Constantes ---
// Opciones estáticas para el filtro de "Estado de Asignación".
const opcionesEstadoAsignacion = [
  { value: '0-5km', label: 'Asignado (0-5 km)' },
  { value: '5-10km', label: 'Asignado (5-10 km)' },
  { value: '10-30km', label: 'Asignado (10-30 km)' },
  { value: 'no-asignadas', label: 'No Asignadas (Excepciones)' },
];

// --- Definición del Componente Principal ---
function App() {
  
  // --- Hooks de Autenticación ---
  // Obtiene el estado de carga de Auth0, si está logueado, y los datos del usuario.
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth0();

  // --- ESTADOS DE LA APLICACIÓN ---

  // Estado de Autorización (Rol)
  const [rol, setRol] = useState<RolUsuario | null>(null); // Rol del usuario (admin, profesor)

  // Estado de Datos Principales
  const [asignaciones, setAsignaciones] = useState<IAsignacionFlat[]>([]); // Los datos de la tabla
  const [isDataLoading, setIsDataLoading] = useState(true); // ¿Estamos cargando datos de la API?
  const [dataError, setDataError] = useState<string | null>(null); // Mensaje de error de la API

  // Estado de Paginación
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(0); // Total de páginas (viene de la API)
  const [totalItems, setTotalItems] = useState(0); // Total de resultados (viene de la API)
  const ITEMS_PER_PAGE = 20; // Cuántos items mostrar por página

  // Estado de Filtros (Selects)
  const [filtroDepto, setFiltroDepto] = useState<string>('todos');
  const [filtroTurno, setFiltroTurno] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Estado de Búsqueda (Input de texto con "debounce")
  const [searchTerm, setSearchTerm] = useState<string>(''); // El valor del input (instantáneo)
  const [filtroNombreDebounced, setFiltroNombreDebounced] = useState<string>(''); // El valor para la API (con retraso)
  const [isSearching, setIsSearching] = useState(false); // ¿Está el "debounce" esperando? (para el spinner)

  // Estado de Datos para Filtros
  const [allDepartamentos, setAllDepartamentos] = useState<string[]>([]); // Para llenar el <select> de Deptos
  const [allTurnos, setAllTurnos] = useState<string[]>([]); // Para llenar el <select> de Turnos

  // Estado de Visibilidad de Modales
  const [showAdminModal, setShowAdminModal] = useState(false); // ¿Modal de Admin visible?
  const [showUploadModal, setShowUploadModal] = useState(false); // ¿Modal de Carga visible?
  const [showDownloadModal, setShowDownloadModal] = useState(false); // ¿Modal de Descarga visible?

  // --- HOOKS DE EFECTO (useEffect) ---

  /**
   * Hook de "Debounce" para el campo de búsqueda.
   * Espera 500ms después de que el usuario deja de escribir en `searchTerm`
   * antes de actualizar `filtroNombreDebounced`, lo cual dispara la
   * recarga de datos de la API.
   */
  useEffect(() => {
    setIsSearching(true); // Muestra el spinner junto al input
    const timerId = setTimeout(() => {
      setFiltroNombreDebounced(searchTerm); // Actualiza el filtro "real"
      setCurrentPage(1); // Resetea a la página 1
      setIsSearching(false); // Oculta el spinner
    }, 500); // 500ms de retraso

    // Función de limpieza: se ejecuta si el usuario vuelve a escribir
    // antes de que pasen los 500ms, cancelando el timer anterior.
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]); // Se dispara CADA VEZ que 'searchTerm' (el input) cambia.

  /**
   * Hook de Carga de Datos Principal.
   * Se ejecuta al cargar el componente y CADA VEZ que una dependencia
   * (filtros, página actual, usuario) cambia.
   */
  useEffect(() => {
    // Función asíncrona interna para poder usar 'await'
    const getDatosYRol = async () => {
      
      // Si no está logueado, no hace nada.
      if (!isAuthenticated || !user?.email) {
        setIsDataLoading(false);
        setRol(null);
        setAsignaciones([]);
        return;
      }

      // Inicia la carga
      setIsDataLoading(true);
      setDataError(null);

      try {
        // 1. Obtener Rol del Usuario
        const rolResponse = await axios.get(`http://127.0.0.1:5000/api/usuarios/rol?email=${user.email}`);
        const userRole: RolUsuario = rolResponse.data.rol;
        setRol(userRole); // Guarda el rol en el estado

        // 2. Si tiene permiso (no es 'pendiente'), busca los datos de asignaciones.
        if (userRole === 'admin' || userRole === 'profesor') {
          const response = await axios.get("http://127.0.0.1:5000/api/asignaciones", {
            // Envía TODOS los estados de filtros y paginación al backend
            params: { 
              page: currentPage, 
              limit: ITEMS_PER_PAGE,
              departamento: filtroDepto,
              turno: filtroTurno,
              estado_asignacion: filtroEstado,
              nombre_escuela: filtroNombreDebounced // Usa el filtro con retraso
            }
          });
          // 3. Actualiza el estado con la respuesta de la API
          setAsignaciones(response.data.asignaciones);
          setTotalItems(response.data.totalItems);
          setTotalPages(response.data.totalPages);
          
          setAllDepartamentos(response.data.allDepartamentos); // Actualiza opciones de filtros
          setAllTurnos(response.data.allTurnos);
        }
      } catch (error) {
        // 4. Maneja Errores de API
        setDataError("No se pudo cargar la información. Es posible que no haya datos cargados en el sistema.");
        setAsignaciones([]);
      } finally {
        // 5. Finaliza la Carga (siempre)
        setIsDataLoading(false);
      }
    };
    
    getDatosYRol(); // Llama a la función
  
  // Array de Dependencias:
  // Este useEffect se re-ejecutará si CUALQUIERA de estos valores cambia.
  }, [isAuthenticated, user, currentPage, filtroDepto, filtroTurno, filtroEstado, filtroNombreDebounced]);
  
  // --- Hooks de Optimización (useMemo) ---
  
  /**
   * Optimización: Evita recalcular las listas para los filtros en cada renderizado.
   * Solo se recalculan si los datos de la API (`allDepartamentos` o `allTurnos`) cambian.
   * `[...new Set(...)]` crea un array de valores únicos.
   */
  const opcionesDepartamento = useMemo(() => [...new Set(allDepartamentos.filter(Boolean))], [allDepartamentos]);
  const opcionesTurno = useMemo(() => [...new Set(allTurnos.filter(Boolean))], [allTurnos]);

  // --- Manejadores de Eventos ---

  /**
   * Manejador genérico para los filtros <select> (Departamento, Turno, Estado).
   * @param setter La función `set` del estado a cambiar (ej: setFiltroDepto).
   * @param value El nuevo valor del <select>.
   */
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value); // Actualiza el estado del filtro
    setCurrentPage(1); // Resetea a la página 1 (porque los resultados cambiarán)
  };

  /**
   * Manejador para los clics en la paginación.
   * @param page El número de página al que se quiere mover.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // --- Lógica de Renderizado Principal ---

  /**
   * Función de ayuda que decide QUÉ contenido principal mostrar
   * basado en el estado (auth, rol, carga).
   */
  const renderizarContenidoPrincipal = () => {
    // 1. Cargando Autenticación (Auth0)
    if (isAuthLoading) {
      return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    }
    // 2. No Autenticado
    if (!isAuthenticated) {
      return <Alert variant="info" className="text-center mt-4">
        <h2>Por favor, inicia sesión para ver las asignaciones.</h2>
        <h3>Esta información es confidencial.</h3>
        </Alert>;
    }
    // 3. Cargando Datos de API (y no hay datos "viejos" para mostrar)
    if (isDataLoading && asignaciones.length === 0) { 
      return <div className="text-center mt-5"><Spinner animation="border" /><p className="mt-2">Cargando asignaciones...</p></div>;
    }
    
    // 4. Autenticado: decide según el ROL
    switch (rol) {
      // 4A. Roles con Permiso para ver datos
      case 'admin':
      case 'profesor':
        // Si la API dio error y no hay datos, muestra el error.
        if (dataError && asignaciones.length === 0) return <Alert variant="danger" className="text-center mt-4">{dataError}</Alert>;
        
        // ¡Vista Principal de la Aplicación!
        return (
          <>
            <div className="text-center mb-4">
              <h2>Panel de Asignaciones</h2>
              <p className="lead">Visualiza las asignaciones de profesores entre escuelas y filtra los resultados.</p>
            </div>

            {/* --- Tarjeta de Filtros --- */}
            <Card className="mb-4">
              <Card.Header as="h5">Filtros de Búsqueda</Card.Header>
              <Card.Body>
                <Form>
                  <Row className="g-3 align-items-center"> {/* g-3 = gap 3 (espaciado) */}
                    
                    {/* Filtro Departamento (Select) */}
                    <Col md={3}>
                      {/* FloatingLabel es el estilo de "etiqueta flotante" */}
                      <FloatingLabel controlId="floatingDepto" label="Departamento">
                        <Form.Select 
                          aria-label="Departamento de Origen"
                          value={filtroDepto} 
                          // Usa el manejador genérico
                          onChange={(e) => handleFilterChange(setFiltroDepto, e.target.value)}
                        >
                          <option value="todos">Todos los Departamentos</option>
                          {/* Rellena la lista con los datos memorizados */}
                          {opcionesDepartamento.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>
                    
                    {/* Filtro Turno (Select) */}
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

                    {/* Filtro Estado (Select) */}
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
                    
                    {/* Filtro Nombre (Input de Búsqueda) */}
                    <Col md={4}>
                      <InputGroup>
                        <FloatingLabel controlId="floatingNombre" label="Buscar por Nombre de Escuela...">
                          <Form.Control
                            type="text"
                            placeholder="Buscar por Nombre de Escuela..."
                            value={searchTerm} // Controlado por el estado instantáneo
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </FloatingLabel>
                        {/* Muestra el spinner si el 'debounce' está activo */}
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
            
            {/* Feedback de resultados (ej: "Mostrando 12 de 150 resultados") */}
            <p className="text-muted">Mostrando {isDataLoading ? '...' : asignaciones.length} de {isDataLoading ? '...' : totalItems} resultados.</p>
            {/* Muestra un spinner pequeño si está recargando datos (ej: al cambiar de pág) */}
            {isDataLoading && <div className="text-center mt-3"><Spinner animation="border" size="sm" /></div>}
            {/* Muestra la tabla SÓLO si no está cargando Y hay asignaciones */}
            {!isDataLoading && asignaciones.length > 0 && <TablaAsignaciones asignaciones={asignaciones} />}
            {/* Muestra un alerta SÓLO si no está cargando Y no hay resultados */}
            {!isDataLoading && asignaciones.length === 0 && <Alert variant="secondary">No se encontraron resultados para los filtros seleccionados.</Alert>}
          </>
        );
      
      // 4B. Rol Pendiente de Aprobación
      case 'profesor-pendiente':
        return <Alert variant="warning" className="text-center mt-4"><h2>Tu cuenta está pendiente de aprobación.</h2></Alert>;
      
      // 4C. Rol desconocido o aún cargando
      default:
        return <p className="text-center">Verificando permisos...</p>;
    }
  };

  // --- Renderizado del Componente Padre (Layout) ---
  return (
    <>
      <Container fluid className="mt-4 p-4">
        
        {/* --- 1. El Header (Barra de Navegación) --- */}
        <AppHeader 
          // Pasa el estado del rol
          rol={rol} 
          // Pasa las funciones para ABRIR los modales
          onShowAdminPanel={() => setShowAdminModal(true)} 
          onShowUploadPanel={() => setShowUploadModal(true)}
          onShowDownloadPanel={() => setShowDownloadModal(true)}
        />
        
        {/* --- 2. El Contenido Principal (decidido por renderizarContenidoPrincipal) --- */}
        <main>
          {renderizarContenidoPrincipal()}
          
          {/* --- 3. La Paginación --- */}
          {/* Se muestra solo si tiene permiso Y hay más de 1 página Y no está cargando */}
          {(rol === 'admin' || rol === 'profesor') && totalPages > 1 && !isDataLoading &&
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {/* Deshabilita botones si está cargando o si es la primera/última pág */}
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
      
      {/* --- 4. Los Modales (Ventanas Emergentes) --- */}
      {/* Están "declarados" aquí, pero ocultos. Se muestran/ocultan
          cambiando los estados 'showAdminModal', 'showUploadModal', etc. */}
      
      {/* Modal de Admin */}
      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Panel de Administración de Roles</Modal.Title></Modal.Header>
        <Modal.Body><PanelAdmin /></Modal.Body>
      </Modal>

      {/* Modal de Carga */}
      <CargaPlanillasModal show={showUploadModal} onHide={() => setShowUploadModal(false)} />
      
      {/* Modal de Descarga */}
      <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Descargar Datos en Excel</Modal.Title></Modal.Header>
        <Modal.Body>
          {/* Pasa las listas de opciones de filtros al componente del panel */}
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