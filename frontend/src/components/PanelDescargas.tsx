/**
 * ================================================================================
 * ARCHIVO: PanelDescargas.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este componente define la interfaz de usuario (UI) que se muestra dentro del
 * modal (ventana emergente) de "Descargar Reporte".
 *
 * MANEJA:
 * - La UI para seleccionar filtros de descarga (Departamento, Turno, Estado).
 * - Ofrece "Descargas Rápidas" (botones pre-filtrados) para los reportes más comunes.
 * - Mantiene el estado de los filtros seleccionados (`filtroDepto`, `filtroTurno`, etc.).
 * - Construye la URL de la API (GET /api/descargar-excel) con los parámetros
 * (filtros) seleccionados.
 * - Maneja la lógica de descarga de archivos:
 * - Llama a la API esperando un 'blob' (el archivo Excel).
 * - Crea un enlace (<a>) temporal en el navegador para simular un clic
 * y descargar el archivo con un nombre descriptivo.
 * ================================================================================
 */

// --- Importaciones ---
import { useState } from 'react'; // Hook de React para manejar el estado de los filtros.
import axios from 'axios'; // Para realizar la llamada (GET) a la API del backend.
// Componentes de React-Bootstrap para la UI
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';

/**
 * --- Definición de Props ---
 * Define las propiedades que este componente recibe de su padre (App.tsx).
 */
interface PanelDescargasProps {
  departamentos: string[]; // Lista de departamentos para el filtro.
  turnos: string[];        // Lista de turnos para el filtro.
}

/**
 * --- Constantes ---
 * Opciones fijas para el filtro de "Estado de Asignación".
 * Se definen aquí porque son estáticas y no dependen de la API.
 */
const opcionesEstadoAsignacion = [
  { value: '0-5km', label: 'Asignado (0-5 km)' },
  { value: '5-10km', label: 'Asignado (5-10 km)' },
  { value: '10-30km', label: 'Asignado (10-30 km)' },
  { value: 'no-asignadas', label: 'No Asignadas (Excepciones)' },
];

/**
 * --- Definición del Componente ---
 * @param {PanelDescargasProps} props - Las listas de departamentos y turnos.
 */
function PanelDescargas({ departamentos, turnos }: PanelDescargasProps) {
  
  // --- Estados Internos ---
  // Almacenan la selección actual de los filtros de descarga personalizada.
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  // Almacena un mensaje de error si la descarga falla (ej: 0 resultados).
  const [error, setError] = useState('');

  // --- Manejador de Eventos ---

  /**
   * Se activa cuando el usuario hace clic en CUALQUIER botón de descarga
   * (rápida o personalizada).
   * @param {string} depto - El filtro de departamento seleccionado.
   * @param {string} turno - El filtro de turno seleccionado.
   * @param {string} estado - El filtro de estado seleccionado.
   */
  const handleDownload = (depto: string, turno: string, estado: string) => {
    setError(''); // Limpia errores anteriores.
    
    // 1. Construir la URL base
    let url = 'http://127.0.0.1:5000/api/descargar-excel?';
    
    // 2. Añadir parámetros (filtros) a la URL de forma segura
    const params = new URLSearchParams();
    if (depto !== 'todos') params.append('departamento', depto);
    if (turno !== 'todos') params.append('turno', turno);
    if (estado !== 'todos') {
      params.append('estado_asignacion', estado);
    }
    
    // 3. Unir la URL base con los parámetros (ej: "...?departamento=MAIPU&turno=Mañana")
    url += params.toString();

    // 4. Llamar a la API con Axios
    axios.get(url, { 
      responseType: 'blob' // ¡MUY IMPORTANTE! Le dice a Axios que espere un archivo.
    })
      .then(response => {
        // 5. Manejar la Respuesta (el archivo 'blob')
        // Crea una URL temporal en el navegador para el archivo recibido.
        const url = window.URL.createObjectURL(new Blob([response.data]));
        // Crea un elemento <a> (enlace) invisible.
        const link = document.createElement('a');
        link.href = url;
        
        // Crea un nombre de archivo dinámico y limpio.
        const nombreArchivo = `reporte_asignaciones_${depto}_${turno}_${estado}.xlsx`
            .replace(/ /g, '_')
            .toLowerCase();
        // Asigna el nombre de archivo al enlace.
        link.setAttribute('download', nombreArchivo);
        
        // 6. Simular el clic para Iniciar la Descarga
        document.body.appendChild(link); // Añade el enlace al documento.
        link.click(); // Simula el clic.
        link.remove(); // Limpia y remueve el enlace.
      })
      .catch(() => {
        // 7. Manejar Error
        // Ocurre si la API devuelve un error (ej: 404 - Sin datos).
        setError('No se encontraron datos con los filtros seleccionados.');
      });
  };

  // --- Renderizado del Componente (UI) ---
  return (
    <>
      {/* Alerta condicional para mostrar feedback de error */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* --- Sección 1: Descargas Rápidas --- */}
      <h5>Descargas Rápidas por Estado</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {/* Cada botón llama a handleDownload con filtros predefinidos */}
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
      
      <hr /> {/* Línea divisoria */}

      {/* --- Sección 2: Descarga Personalizada --- */}
      <h5>Descarga Personalizada por Filtros</h5>
      <Row className="align-items-end g-3">
        {/* Filtro Departamento */}
        <Col md={4}>
          <Form.Group>
            <Form.Label><strong>Departamento</strong></Form.Label>
            <Form.Select value={filtroDepto} onChange={e => setFiltroDepto(e.target.value)}>
              <option value="todos">Todos</option>
              {/* Rellena el select con los departamentos pasados por props */}
              {departamentos.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        
        {/* Filtro Turno */}
        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Turno</strong></Form.Label>
            <Form.Select value={filtroTurno} onChange={e => setFiltroTurno(e.target.value)}>
              <option value="todos">Todos</option>
              {/* Rellena el select con los turnos pasados por props */}
              {turnos.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        
        {/* Filtro Estado */}
        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Estado Asignación</strong></Form.Label>
            <Form.Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todos">Todas</option>
              {/* Rellena el select con la constante local */}
              {opcionesEstadoAsignacion.map(opcion => <option key={opcion.value} value={opcion.value}>{opcion.label}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        
        {/* Botón de Descarga Personalizada */}
        <Col md={2}>
          <Button 
            variant="primary" 
            className="w-100" // Ocupa el 100% del ancho de su columna
            // Llama a handleDownload con los valores actuales de los estados
            onClick={() => handleDownload(filtroDepto, filtroTurno, filtroEstado)}
            // Deshabilitado si no se ha seleccionado ningún filtro (para evitar descargar todo)
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