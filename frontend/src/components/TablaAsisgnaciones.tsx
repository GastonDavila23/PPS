import Table from 'react-bootstrap/Table';
import type { IAsignacionFlat } from '../data/mockAsignaciones';

interface Props {
  asignaciones: IAsignacionFlat[];
}

function getVariantForObservacion(observacion: string) {
  if (!observacion) return '';

  if (observacion.startsWith('Asignado (0-5 km)')) {
    return 'table-success';
  }
  if (observacion.startsWith('Asignado (5-10 km)')) {
    return 'table-primary';
  }
  if (observacion.startsWith('Asignado (10-30 km)')) {
    return 'table-warning';
  }
  if (observacion.startsWith('No Asignada')) {
    return 'table-danger';
  }
  return '';
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
        {asignaciones.map((asignacion, index) => {
          
          const isNotAsignada = asignacion.Observaciones.startsWith('No Asignada');
          const variant = getVariantForObservacion(asignacion.Observaciones);
          const destinoClass = isNotAsignada ? 'text-muted fst-italic' : '';

          return (
            <tr key={index} className={variant}>
              <td>{asignacion.origen_Departamento}</td>
              <td>{asignacion.origen_CUE}</td>
              <td>{asignacion.origen_Numero_Escuela}</td>
              <td>{asignacion.origen_Numero_Anexo}</td>
              <td className="text-start">{asignacion.origen_Nombre_Escuela}</td>
              <td>{asignacion.origen_Division}</td>
              <td className={destinoClass}>
                {isNotAsignada ? '-' : asignacion.destino_Departamento}
              </td>
              <td className={destinoClass}>
                {isNotAsignada ? '-' : asignacion.destino_CUE}
              </td>
              <td className={destinoClass}>
                {isNotAsignada ? '-' : asignacion.destino_Numero_Escuela}
              </td>
              <td className={destinoClass}>
                {isNotAsignada ? '-' : asignacion.destino_Numero_Anexo}
              </td>
              <td className={`text-start ${destinoClass}`}>
                {isNotAsignada ? 'N/A' : asignacion.destino_Nombre_Escuela}
              </td>
              <td className={destinoClass}>
                {isNotAsignada ? '-' : asignacion.destino_Division}
              </td>

              <td className="align-middle">{(asignacion.Distancia_KM || 0).toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default TablaAsignaciones;