import { useAuth0 } from '@auth0/auth0-react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from '../assets/logo.png';

interface AppHeaderProps {
  rol: 'admin' | 'profesor' | 'profesor-pendiente' | null;
  onShowAdminPanel: () => void;
  onShowUploadPanel: () => void;
  onShowDownloadPanel: () => void;
}

function AppHeader({ rol, onShowAdminPanel, onShowUploadPanel, onShowDownloadPanel }: AppHeaderProps) {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <Navbar bg="light" expand="lg" className="mb-4 border-bottom pb-3">
      <Container fluid>
        <Navbar.Brand href="#">
          <img
            src={logo}
            height="100" 
            className="d-inline-block align-top"
            alt="Logo del Sistema de Asignación"
          />
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <div className="text-end">
            {isAuthenticated && user ? (
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <Navbar.Text>
                    {user.nickname} ({rol})
                  </Navbar.Text>
                </div>
                {rol === 'admin' && (
                  <NavDropdown title="Menú Administrador" id="admin-dropdown" className="me-5">
                    <NavDropdown.Item onClick={onShowAdminPanel}>
                      Administrar Roles
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={onShowUploadPanel}>
                      Cargar Planillas
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={onShowDownloadPanel}>
                      Descargar Excel
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
                <Button variant="outline-danger" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="lg" onClick={() => loginWithRedirect()}>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppHeader;