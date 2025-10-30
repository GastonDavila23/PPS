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
  observaciones: string[];
}

function PanelDescargas({ departamentos, turnos, observaciones }: PanelDescargasProps) {
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroObs, setFiltroObs] = useState('todos');
  const [error, setError] = useState('');

  const handleDownload = (depto: string, turno: string, obs: string) => {
    setError('');
    let url = 'http://127.0.0.1:5000/api/descargar-excel?';
    
    const params = new URLSearchParams();
    if (depto !== 'todos') params.append('departamento', depto);
    if (turno !== 'todos') params.append('turno', turno);
    if (obs !== 'todos') params.append('observaciones', obs);
    
    url += params.toString();

    axios.get(url, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_asignaciones.xlsx`);
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
      
      <h5>Descargas Rápidas por Observación</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button variant="outline-success" onClick={() => handleDownload('todos', 'todos', 'Asignado a escuela cercana')}>
          Descargar Asignados
        </Button>
        <Button variant="outline-warning" onClick={() => handleDownload('todos', 'todos', 'Excepción: sin candidatos disponibles')}>
          Descargar Sin Candidatos
        </Button>
        <Button variant="outline-danger" onClick={() => handleDownload('todos', 'todos', 'Excepcion: no asignada por falta de datos')}>
          Descargar Con Datos Faltantes
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
            <Form.Label><strong>Observación</strong></Form.Label>
            <Form.Select value={filtroObs} onChange={e => setFiltroObs(e.target.value)}>
              <option value="todos">Todas</option>
              {observaciones.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Button 
            variant="primary" 
            className="w-100"
            onClick={() => handleDownload(filtroDepto, filtroTurno, filtroObs)}
            disabled={filtroDepto === 'todos' && filtroTurno === 'todos' && filtroObs === 'todos'}
          >
            Descargar
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default PanelDescargas;