import { useAuth0 } from '@auth0/auth0-react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Image from 'react-bootstrap/Image';
import logoDGE from '../assets/logo.png';
import { Upload, Download, GearFill, PersonCircle, BoxArrowRight, BoxArrowInRight } from 'react-bootstrap-icons';

interface Props {
  rol: 'admin' | 'profesor' | 'profesor-pendiente' | null;
  onShowAdminPanel: () => void;
  onShowUploadPanel: () => void;
  onShowDownloadPanel: () => void;
}

function AppHeader({ rol, onShowAdminPanel, onShowUploadPanel, onShowDownloadPanel }: Props) {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <Navbar bg="light" expand="lg" className="mb-4 p-2" sticky="top" style={{ borderBottom: '1px solid #dee2e6' }}>
      <Container fluid>
        <Navbar.Brand href="#">
          <Image src={logoDGE} alt="Logo DGE" style={{ height: '40px', marginRight: '10px' }} />
          <span className="fw-bold">Sistema de Asignador</span>
          <small className="text-muted d-none d-md-inline ms-2">| Dirección General de Escuelas</small>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuthenticated && user ? (
              <>
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
                {rol === 'profesor' && (
                  <Button variant="outline-success" onClick={onShowDownloadPanel} className="me-2 mb-2 mb-lg-0 d-flex align-items-center">
                    <Download className="me-2" /> Descargar Reporte
                  </Button>
                )}

                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      <PersonCircle className="me-2" />
                      {user.email}
                    </span>
                  } 
                  id="basic-nav-dropdown" 
                  align="end"
                >
                  <NavDropdown.ItemText className="text-muted small px-3">
                    Rol: <span className="fw-bold">{rol || '...'}</span>
                  </NavDropdown.ItemText>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                    <BoxArrowRight className="me-2" /> Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
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