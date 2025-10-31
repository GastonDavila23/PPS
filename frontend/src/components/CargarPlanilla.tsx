/**
 * ================================================================================
 * ARCHIVO: CargaPlanilla.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este archivo define un componente React (en TypeScript) que renderiza el
 * modal (ventana emergente) para "Cargar Nuevas Planillas".
 *
 * MANEJA:
 * - La interfaz de usuario (UI) para seleccionar uno o múltiples archivos.
 * - El estado interno:
 * - Los archivos seleccionados (`files`).
 * - El estado de carga (`isLoading`) para mostrar un spinner.
 * - Los mensajes de éxito (`success`) o (`error`).
 * - La lógica de envío de archivos al backend:
 * - Construye un objeto `FormData` (necesario para enviar archivos).
 * - Llama al endpoint (ruta) '/api/cargar-planillas' del backend (Flask).
 * - La lógica de post-carga: Muestra un mensaje de éxito y recarga la página
 * automáticamente para que el usuario vea los nuevos datos procesados.
 * ================================================================================
 */

// --- Importaciones ---
import { useState } from 'react'; // Hook de React para manejar el estado interno.
import axios from 'axios'; // Para realizar la llamada (POST) a la API del backend.
// Importaciones de componentes de React-Bootstrap para la UI
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

// --- Definición de Props ---
// Define qué "props" (propiedades) espera recibir este componente desde su padre (App.tsx).
interface CargaPlanillasModalProps {
  show: boolean;      // `true` si el modal debe mostrarse, `false` si debe ocultarse.
  onHide: () => void; // La función que se debe llamar (en App.tsx) cuando el modal se cierra.
}

// --- Definición del Componente ---
function CargaPlanillasModal({ show, onHide }: CargaPlanillasModalProps) {
  
  // --- Estados Internos del Componente ---

  // Almacena la lista de archivos que el usuario seleccionó en el <input type="file">.
  const [files, setFiles] = useState<FileList | null>(null);
  // Controla si se está procesando una carga (true = muestra spinner, deshabilita botones).
  const [isLoading, setIsLoading] = useState(false);
  // Almacena el mensaje de error si la API falla.
  const [error, setError] = useState('');
  // Almacena el mensaje de éxito si la API responde correctamente.
  const [success, setSuccess] = useState('');

  // --- Manejador de Eventos ---
  
  /**
   * Se activa cada vez que el usuario selecciona o cambia los archivos
   * en el input de tipo "file".
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files); // Actualiza el estado 'files' con los archivos seleccionados.
  };

  /**
   * Se activa cuando el usuario hace clic en el botón "Procesar y Cargar".
   */
  const handleSubmit = () => {
    // 1. Validación: Si no hay archivos, muestra un error y detiene la ejecución.
    if (!files || files.length === 0) {
      setError('Por favor, selecciona al menos un archivo.');
      return;
    }

    // 2. Preparar el estado de carga
    setIsLoading(true); // Activa el spinner
    setError('');       // Limpia errores anteriores
    setSuccess('');     // Limpia éxitos anteriores

    // 3. Preparar los datos para el envío
    // Se debe usar 'FormData' para enviar archivos (multipart/form-data).
    const formData = new FormData();
    // Añade todos los archivos seleccionados al 'formData'.
    // Es importante que la clave ('planillas') coincida con la que espera el backend (Flask).
    for (let i = 0; i < files.length; i++) {
        formData.append('planillas', files[i]);
    }

    // 4. Realizar la llamada a la API (Backend)
    axios.post('http://127.0.0.1:5000/api/cargar-planillas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // Header necesario para FormData
    })
    .then(response => {
      // 5. Manejar el Éxito
      
      // (Esta línea es de una versión anterior de caché, ahora la recarga es suficiente)
      localStorage.removeItem('asignacionesData');
      
      // Muestra el mensaje de éxito (ej: "Datos procesados...")
      setSuccess(response.data.mensaje + " La página se recargará para mostrar los nuevos datos.");
      
      // Inicia un temporizador de 2 segundos...
      setTimeout(() => {
        // ...y luego recarga toda la página.
        // Esto fuerza a App.tsx a volver a pedir los datos (ya actualizados) al backend.
        window.location.reload();
      }, 2000); 
    })
    .catch(err => {
      // 6. Manejar el Error
      // Intenta obtener el mensaje de error específico del backend, o usa uno genérico.
      const errorMsg = err.response?.data?.error || 'Ocurrió un error en el servidor.';
      setError(errorMsg);
      setIsLoading(false); // Detiene el spinner
    });
  };

  /**
   * Se activa cuando el usuario cierra el modal (con la 'X' o el botón 'Cerrar').
   */
  const handleClose = () => {
      // Si la carga fue exitosa y el usuario cierra el modal antes
      // de los 2 segundos, recarga la página inmediatamente.
      if (success) {
          window.location.reload();
      }
      onHide(); // Llama a la función del padre (App.tsx) para ocultar el modal.
  }

  // --- Renderizado del Componente (UI) ---
  return (
    // El 'onHide' se activa con la 'X' o al hacer clic fuera del modal
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cargar Nuevas Planillas de Datos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Selecciona uno o varios archivos Excel para procesar y actualizar la base de datos. 
          El sistema extraerá la información útil y la unificará. Este proceso actualizará los datos existentes.
        </p>

        {/* Input de selección de archivos */}
        <Form.Group controlId="formFiles" className="mb-3">
          <Form.Label>Archivos de Planillas (.xlsx, .xls)</Form.Label>
          <Form.Control 
            type="file" 
            accept=".xlsx, .xls" // Restringe la selección a archivos Excel
            multiple // Permite seleccionar más de un archivo
            onChange={handleFileChange} 
          />
        </Form.Group>
        
        {/* Alertas condicionales para mostrar feedback */}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cerrar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          // Deshabilita el botón si no hay archivos o si ya está cargando
          disabled={!files || files.length === 0 || isLoading}
        >
          {/* Muestra Spinner o Texto según el estado 'isLoading' */}
          {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Procesar y Cargar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CargaPlanillasModal;