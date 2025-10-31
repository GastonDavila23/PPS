import { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';

interface PanelDescargasProps {
  departamentos: string[];
  turnos: string[];
}

const opcionesEstadoAsignacion = [
  { value: '0-5km', label: 'Asignado (0-5 km)' },
  { value: '5-10km', label: 'Asignado (5-10 km)' },
  { value: '10-30km', label: 'Asignado (10-30 km)' },
  { value: 'no-asignadas', label: 'No Asignadas (Excepciones)' },
];

function PanelDescargas({ departamentos, turnos }: PanelDescargasProps) {
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [error, setError] = useState('');

  const handleDownload = (depto: string, turno: string, estado: string) => {
    setError('');
    let url = 'http://127.0.0.1:5000/api/descargar-excel?';
    
    const params = new URLSearchParams();
    if (depto !== 'todos') params.append('departamento', depto);
    if (turno !== 'todos') params.append('turno', turno);
    
    if (estado !== 'todos') {
      params.append('estado_asignacion', estado);
    }
    
    url += params.toString();

    axios.get(url, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const nombreArchivo = `reporte_asignaciones_${depto}_${turno}_${estado}.xlsx`
            .replace(/ /g, '_')
            .toLowerCase();
        link.setAttribute('download', nombreArchivo);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => {
        setError('No se encontraron datos con los filtros seleccionados.');
      });
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <h5>Descargas Rápidas por Estado</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button variant="outline-success" onClick={() => handleDownload('todos', 'todos', '0-5km')}>
          Asignados (0-5 km)
        </Button>
        <Button variant="outline-primary" onClick={() => handleDownload('todos', 'todos', '5-10km')}>
          Asignados (5-10 km)
        </Button>
        <Button variant="outline-warning" onClick={() => handleDownload('todos', 'todos', '10-30km')}>
          Asignados (10-30 km)
        </Button>
        <Button variant="outline-danger" onClick={() => handleDownload('todos', 'todos', 'no-asignadas')}>
          Todas las No Asignadas
        </Button>
      </div>
      
      <hr />

      <h5>Descarga Personalizada por Filtros</h5>
      <Row className="align-items-end g-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label><strong>Departamento</strong></Form.Label>
            <Form.Select value={filtroDepto} onChange={e => setFiltroDepto(e.target.value)}>
              <option value="todos">Todos</option>
              {departamentos.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Turno</strong></Form.Label>
            <Form.Select value={filtroTurno} onChange={e => setFiltroTurno(e.target.value)}>
              <option value="todos">Todos</option>
              {turnos.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Estado Asignación</strong></Form.Label>
            <Form.Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todos">Todas</option>
              {opcionesEstadoAsignacion.map(opcion => <option key={opcion.value} value={opcion.value}>{opcion.label}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Button 
            variant="primary" 
            className="w-100"
            onClick={() => handleDownload(filtroDepto, filtroTurno, filtroEstado)}
            disabled={filtroDepto === 'todos' && filtroTurno === 'todos' && filtroEstado === 'todos'}
          >
            Descargar
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default PanelDescargas;