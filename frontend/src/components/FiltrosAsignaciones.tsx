import React from 'react';
import { Card, Form, Row, Col, FloatingLabel, InputGroup, Spinner } from 'react-bootstrap';
import { OPCIONES_ESTADO } from '../config/constants';

interface Props {
  filtros: {
    depto: string; setDepto: (v: string) => void;
    turno: string; setTurno: (v: string) => void;
    estado: string; setEstado: (v: string) => void;
    search: string; setSearch: (v: string) => void;
    isSearching: boolean;
  };
  opciones: {
    departamentos: string[];
    turnos: string[];
  };
  onFilterChange: (setter: (v: string) => void, value: string) => void;
}

const FiltrosAsignaciones: React.FC<Props> = ({ filtros, opciones, onFilterChange }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5" className="bg-light">Filtros de Búsqueda</Card.Header>
      <Card.Body>
        <Form>
          <Row className="g-3 align-items-center">
            
            {/* Departamento */}
            <Col md={3}>
              <FloatingLabel controlId="floatingDepto" label="Departamento">
                <Form.Select 
                  value={filtros.depto} 
                  onChange={(e) => onFilterChange(filtros.setDepto, e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {opciones.departamentos.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>
            
            {/* Turno */}
            <Col md={2}>
              <FloatingLabel controlId="floatingTurno" label="Turno">
                <Form.Select 
                  value={filtros.turno} 
                  onChange={(e) => onFilterChange(filtros.setTurno, e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {opciones.turnos.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>

            {/* Estado de Asignación */}
            <Col md={3}>
              <FloatingLabel controlId="floatingEstado" label="Estado">
                <Form.Select 
                  value={filtros.estado} 
                  onChange={(e) => onFilterChange(filtros.setEstado, e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {OPCIONES_ESTADO.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>
            
            {/* Buscador */}
            <Col md={4}>
              <InputGroup>
                <FloatingLabel controlId="floatingNombre" label="Buscar escuela...">
                  <Form.Control
                    type="text"
                    placeholder="Nombre..."
                    value={filtros.search}
                    onChange={(e) => filtros.setSearch(e.target.value)}
                  />
                </FloatingLabel>
                {filtros.isSearching && (
                  <InputGroup.Text><Spinner animation="border" size="sm" /></InputGroup.Text>
                )}
              </InputGroup>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FiltrosAsignaciones;