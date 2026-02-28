import { useState } from 'react';
import { apiClient, asignacionesService } from '../services/asignacionesService'; // Usamos tu servicio centralizado
import { Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';

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
    setError('');
  };

  const handleSubmit = async () => {
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

    try {
      const data = await asignacionesService.uploadPlanillas(formData);
      setSuccess(data.mensaje || "Planillas procesadas correctamente.");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error al subir los archivos.";
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (success) window.location.reload();
    onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>Cargar Nuevas Planillas de Datos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">
          Suba los archivos de datos y coordenadas. El sistema los unificará automáticamente mediante el CUE.
        </p>

        <Form.Group controlId="formFiles" className="mb-3">
          <Form.Label>Archivos Excel o CSV</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx, .xls, .csv"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
          />
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
          {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</> : 'Procesar y Cargar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CargaPlanillasModal;