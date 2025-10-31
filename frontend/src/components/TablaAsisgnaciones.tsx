/**
 * ================================================================================
 * ARCHIVO: TablaAsignaciones.tsx
 * ================================================================================
 * PROPÓSITO:
 * Este componente define la tabla principal donde se muestran los resultados
 * de las asignaciones.
 *
 * Es un "componente tonto" (dumb component) porque solo se dedica a renderizar
 * los datos que recibe a través de sus `props`. No busca datos por sí mismo.
 *
 * MANEJA:
 * - La renderización del encabezado complejo de la tabla (Origen/Destino).
 * - La iteración sobre la lista de 'asignaciones' para crear cada fila.
 * - La lógica de estilo condicional para colorear las filas (verde, rojo, etc.)
 * y atenuar las celdas de destino en las filas "No Asignadas".
 * ================================================================================
 */

// --- Importaciones ---
import Table from 'react-bootstrap/Table'; // Componente de tabla de React-Bootstrap
// Importa el "tipo" (definición de estructura) de una asignación.
// 'IAsignacionFlat' es la versión "plana" del objeto, lista para mostrar en la tabla.
import type { IAsignacionFlat } from '../data/mockAsignaciones';

/**
 * --- Definición de Props ---
 * Define las propiedades que este componente espera recibir de su padre (App.tsx).
 */
interface Props {
  // Un array (lista) de objetos de asignación que se deben renderizar.
  asignaciones: IAsignacionFlat[];
}

/**
 * --- Función de Ayuda (Helper Function) ---
 * Determina qué clase de color de Bootstrap (table-success, table-danger, etc.)
 * debe aplicarse a una fila, basándose en el texto de la 'Observacion'.
 *
 * @param {string} observacion - El texto de observación (ej: "Asignado (0-5 km)").
 * @returns {string} El nombre de la clase de Bootstrap (ej: "table-success").
 */
function getVariantForObservacion(observacion: string): string {
  if (!observacion) return ''; // Si no hay observación, no devuelve clase.

  if (observacion.startsWith('Asignado (0-5 km)')) {
    return 'table-success'; // Verde
  }
  if (observacion.startsWith('Asignado (5-10 km)')) {
    return 'table-primary'; // Azul
  }
  if (observacion.startsWith('Asignado (10-30 km)')) {
    return 'table-warning'; // Amarillo
  }
  if (observacion.startsWith('No Asignada')) {
    return 'table-danger'; // Rojo
  }
  return ''; // Color por defecto (blanco/gris de la tabla rayada)
}

/**
 * --- Definición del Componente ---
 * @param {Props} props - Las propiedades recibidas (la lista de 'asignaciones').
 */
function TablaAsignaciones({ asignaciones }: Props) {
  
  // --- Renderizado del Componente (UI) ---
  return (
    // 'striped' = filas intercaladas (blanco/gris)
    // 'bordered' = con bordes
    // 'hover' = resalta la fila al pasar el mouse
    // 'responsive' = permite scroll horizontal en pantallas chicas
    <Table striped bordered hover responsive>
      
      {/* --- Encabezado de la Tabla --- */}
      <thead className='text-center table-dark'>
        {/* Fila 1 del Encabezado */}
        <tr>
          {/* 'colSpan={6}' = esta celda ocupa el espacio de 6 columnas */}
          <th colSpan={6}>Escuela Origen (Presta Profesor)</th>
          <th colSpan={6}>Escuela Destino (Recibe Profesor)</th>
          {/* 'rowSpan={2}' = esta celda ocupa el espacio de 2 filas (para centrarse verticalmente) */}
          <th rowSpan={2} className="align-middle">Distancia (KM)</th>
        </tr>
        {/* Fila 2 del Encabezado (Sub-columnas) */}
        <tr>
          {/* Columnas de Origen */}
          <th>Departamento</th><th>CUE</th><th>N° Escuela</th><th>Anexo</th><th>Nombre</th><th>División</th>
          {/* Columnas de Destino */}
          <th>Departamento</th><th>CUE</th><th>N° Escuela</th><th>Anexo</th><th>Nombre</th><th>División</th>
        </tr>
      </thead>
      
      {/* --- Cuerpo de la Tabla --- */}
      <tbody className='text-center'>
        {/* Itera (map) sobre el array 'asignaciones' recibido por props.
            Por cada 'asignacion' en la lista, crea una fila <tr> */}
        {asignaciones.map((asignacion, index) => {
          
          // --- Lógica de Estilo para esta fila ---
          // Verifica si la observación es del tipo "No Asignada"
          const isNotAsignada = asignacion.Observaciones.startsWith('No Asignada');
          // Obtiene la clase de color (ej: 'table-danger')
          const variant = getVariantForObservacion(asignacion.Observaciones);
          // Define la clase para atenuar celdas: si no está asignada, usa clases de Bootstrap
          // 'text-muted' (gris) y 'fst-italic' (cursiva). Si está asignada, no usa clase ('').
          const destinoClass = isNotAsignada ? 'text-muted fst-italic' : '';

          // Devuelve el JSX para la fila
          return (
            // 'key={index}' es requerido por React para identificar cada fila.
            // 'className={variant}' aplica el color (rojo, verde, etc.) a toda la fila.
            <tr key={index} className={variant}>
              
              {/* --- Celdas de Origen (Siempre se muestran normal) --- */}
              <td>{asignacion.origen_Departamento}</td>
              <td>{asignacion.origen_CUE}</td>
              <td>{asignacion.origen_Numero_Escuela}</td>
              <td>{asignacion.origen_Numero_Anexo}</td>
              {/* 'text-start' alinea el nombre a la izquierda por legibilidad */}
              <td className="text-start">{asignacion.origen_Nombre_Escuela}</td>
              <td>{asignacion.origen_Division}</td>
              
              {/* --- Celdas de Destino (Condicionales) --- */}
              {/* 'className={destinoClass}' aplica el estilo atenuado si es 'No Asignada' */}
              
              <td className={destinoClass}>
                {/* Operador ternario: Si no está asignada, muestra '-', sino, muestra el dato. */}
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
              {/* Se combinan clases: alineación izquierda + atenuado condicional */}
              <td className={`text-start ${destinoClass}`}>
                {isNotAsignada ? 'N/A' : asignacion.destino_Nombre_Escuela}
              </td>
              <td className={destinoClass}>
                {isNotAsignada ? '-' : asignacion.destino_Division}
              </td>

              {/* Celda de Distancia */}
              <td className="align-middle">
                {/* Muestra la distancia con 2 decimales. Usa '|| 0' (o cero) por si el valor es nulo. */}
                {(asignacion.Distancia_KM || 0).toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default TablaAsignaciones;