/**
 * ================================================================================
 * ARCHIVO: Header.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este componente define la barra de navegación (Navbar) principal de la
 * aplicación. Es la cabecera que se muestra en la parte superior de la página.
 *
 * MANEJA:
 * - Mostrar el logo y el título del sistema.
 * - La lógica de autenticación visual:
 * - Si el usuario NO está logueado, muestra el botón "Iniciar Sesión".
 * - Si el usuario SÍ está logueado, muestra los botones de acción
 * (Cargar, Descargar, Admin) según el 'rol' del usuario.
 * - Muestra el menú desplegable del usuario (con su email, rol y botón
 * de "Cerrar Sesión").
 * - Llama a las funciones 'onShow...' (pasadas como props desde App.tsx)
 * para abrir los diferentes modales (ventanas emergentes).
 * ================================================================================
 */

// --- Importaciones ---
import { useAuth0 } from '@auth0/auth0-react'; // Hook de Auth0 para saber si el usuario está logueado.
// Componentes de React-Bootstrap para construir la UI
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Image from 'react-bootstrap/Image';
import logoDGE from '../assets/logo.png'; // Logo de la DGE
// Iconos de la librería react-bootstrap-icons
import { Upload, Download, GearFill, PersonCircle, BoxArrowRight, BoxArrowInRight } from 'react-bootstrap-icons';

/**
 * --- Definición de Props ---
 * Define las propiedades (props) que este componente espera recibir de su
 * componente padre (en este caso, App.tsx).
 */
interface Props {
  // El rol actual del usuario (ej: 'admin'), o 'null' si aún no se ha cargado.
  rol: 'admin' | 'profesor' | 'profesor-pendiente' | null;
  // Función (callback) que se ejecuta para abrir el modal de Admin.
  onShowAdminPanel: () => void;
  // Función (callback) que se ejecuta para abrir el modal de Carga.
  onShowUploadPanel: () => void;
  // Función (callback) que se ejecuta para abrir el modal de Descarga.
  onShowDownloadPanel: () => void;
}

/**
 * --- Definición del Componente ---
 * @param {Props} props - Las propiedades recibidas (rol, onShowAdminPanel, etc.).
 */
function AppHeader({ rol, onShowAdminPanel, onShowUploadPanel, onShowDownloadPanel }: Props) {
  
  // --- Hooks ---
  // Obtiene el estado de autenticación y las funciones de Auth0.
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  // --- Renderizado del Componente (UI) ---
  return (
    // 'sticky="top"' mantiene el header pegado arriba al hacer scroll.
    <Navbar bg="light" expand="lg" className="mb-4 p-2" sticky="top" style={{ borderBottom: '1px solid #dee2e6' }}>
      <Container fluid>
        
        {/* --- 1. Logo y Título del Sistema --- */}
        <Navbar.Brand href="#">
          <Image src={logoDGE} alt="Logo DGE" style={{ height: '40px', marginRight: '10px' }} />
          <span className="fw-bold">Sistema de Asignador</span>
          <small className="text-muted d-none d-md-inline ms-2">| Dirección General de Escuelas</small>
        </Navbar.Brand>
        
        {/* Botón "hamburguesa" para colapsar el menú en pantallas chicas (móviles) */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        {/* Contenido colapsable del Navbar */}
        <Navbar.Collapse id="basic-navbar-nav">
          {/* 'ms-auto' alinea todo el contenido de 'Nav' a la derecha */}
          <Nav className="ms-auto align-items-center">
            
            {/* --- 2. Lógica de Renderizado Condicional --- */}
            
            {/* CASO A: El usuario SÍ está autenticado */}
            {isAuthenticated && user ? (
              <>
                {/* --- 2A.1. Botones de Acción (según el rol) --- */}
                
                {/* Muestra estos 3 botones SÓLO si el rol es 'admin' */}
                {rol === 'admin' && (
                  <>
                    <Button variant="outline-primary" onClick={onShowUploadPanel} className="me-2 mb-2 mb-lg-0 d-flex align-items-center">
                      <Upload className="me-2" /> Cargar Planillas
                    </Button>
                    <Button variant="outline-success" onClick={onShowDownloadPanel} className="me-2 mb-2 mb-lg-0 d-flex align-items-center">
                      <Download className="me-2" /> Descargar Reporte
                    </Button>
                    <Button variant="outline-secondary" onClick={onShowAdminPanel} className="me-2 mb-2 mb-lg-0 d-flex align-items-center">
                      <GearFill className="me-2" /> Admin Roles
                    </Button>
                  </>
                )}
                
                {/* Muestra este botón SÓLO si el rol es 'profesor' */}
                {rol === 'profesor' && (
                  <Button variant="outline-success" onClick={onShowDownloadPanel} className="me-2 mb-2 mb-lg-0 d-flex align-items-center">
                    <Download className="me-2" /> Descargar Reporte
                  </Button>
                )}
                {/* Nota: Si el rol es 'profesor-pendiente', no se muestra ningún botón de acción. */}

                {/* --- 2A.2. Menú Desplegable del Usuario --- */}
                <NavDropdown 
                  // El 'title' del dropdown es un <span> personalizado para
                  // incluir el ícono y el email en una sola "caja" clickeable.
                  title={
                    <span className="d-flex align-items-center">
                      <PersonCircle className="me-2" />
                      {user.email}
                    </span>
                  } 
                  id="basic-nav-dropdown" 
                  align="end" // Alinea el menú a la derecha
                >
                  {/* Muestra el rol del usuario (solo texto, no clickeable) */}
                  <NavDropdown.ItemText className="text-muted small px-3">
                    Rol: <span className="fw-bold">{rol || '...'}</span>
                  </NavDropdown.ItemText>
                  
                  <NavDropdown.Divider /> {/* Línea separadora */}
                  
                  {/* Botón para cerrar sesión */}
                  <NavDropdown.Item onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                    <BoxArrowRight className="me-2" /> Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            
            ) : (
              
            /* CASO B: El usuario NO está autenticado */
            // Muestra únicamente el botón para iniciar sesión.
              <Button 
                variant="primary" 
                onClick={() => loginWithRedirect()}
                className="d-flex align-items-center"
              >
                <BoxArrowInRight className="me-2" /> Iniciar Sesión
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppHeader;