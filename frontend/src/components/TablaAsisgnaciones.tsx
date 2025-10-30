import Table from 'react-bootstrap/Table';
import type { IAsignacionFlat } from '../data/mockAsignaciones';

interface Props {
  asignaciones: IAsignacionFlat[];
}

function TablaAsignaciones({ asignaciones }: Props) {
  return (
    <Table striped bordered hover responsive>
      <thead className='text-center table-dark'>
        <tr>
          <th colSpan={6}>Escuela Origen (Presta Profesor)</th>
          <th colSpan={6}>Escuela Destino (Recibe Profesor)</th>
          <th rowSpan={2} className="align-middle">Distancia (KM)</th>
        </tr>
        <tr>
          <th>Departamento</th><th>CUE</th><th>N° Escuela</th><th>Anexo</th><th>Nombre</th><th>División</th>
          <th>Departamento</th><th>CUE</th><th>N° Escuela</th><th>Anexo</th><th>Nombre</th><th>División</th>
        </tr>
      </thead>
      <tbody className='text-center'>
        {asignaciones.map((asignacion, index) => (
          <tr key={index}>
            <td>{asignacion.origen_Departamento}</td>
            <td>{asignacion.origen_CUE}</td>
            <td>{asignacion.origen_Numero_Escuela}</td>
            <td>{asignacion.origen_Numero_Anexo}</td>
            <td className="text-start">{asignacion.origen_Nombre_Escuela}</td>
            <td>{asignacion.origen_Division}</td>

            <td>{asignacion.destino_Departamento}</td>
            <td>{asignacion.destino_CUE}</td>
            <td>{asignacion.destino_Numero_Escuela}</td>
            <td>{asignacion.destino_Numero_Anexo}</td>
            <td className="text-start">{asignacion.destino_Nombre_Escuela}</td>
            <td>{asignacion.destino_Division}</td>

            <td className="align-middle">{(asignacion.Distancia_KM || 0).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default TablaAsignaciones;