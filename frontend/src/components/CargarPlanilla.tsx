import { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

interface CargaPlanillasModalProps {
  show: boolean;
  onHide: () => void;
}

function CargaPlanillasModal({ show, onHide }: CargaPlanillasModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = () => {
    if (!files || files.length === 0) {
      setError('Por favor, selecciona al menos un archivo.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('planillas', files[i]);
    }

    axios.post('http://127.0.0.1:5000/api/cargar-planillas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(response => {
      localStorage.removeItem('asignacionesData');
      
      setSuccess(response.data.mensaje + " La página se recargará para mostrar los nuevos datos.");
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    })
    .catch(err => {
      const errorMsg = err.response?.data?.error || 'Ocurrió un error en el servidor.';
      setError(errorMsg);
      setIsLoading(false);
    });
  };

  const handleClose = () => {
      if (success) {
          window.location.reload();
      }
      onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cargar Nuevas Planillas de Datos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Selecciona uno o varios archivos Excel para procesar y actualizar la base de datos. 
          El sistema extraerá la información útil y la unificará. Este proceso actualizará los datos existentes.
        </p>

        <Form.Group controlId="formFiles" className="mb-3">
          <Form.Label>Archivos de Planillas (.xlsx, .xls)</Form.Label>
          <Form.Control type="file" accept=".xlsx, .xls" multiple onChange={handleFileChange} />
        </Form.Group>
        
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
          disabled={!files || files.length === 0 || isLoading}
        >
          {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Procesar y Cargar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CargaPlanillasModal;