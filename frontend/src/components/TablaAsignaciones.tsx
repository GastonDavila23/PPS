/**
 * ================================================================================
 * ARCHIVO: TablaAsignaciones.tsx
 * ================================================================================
 * PROPÓSITO:
 * Componente presentacional para renderizar la tabla de resultados.
 * * ADAPTACIÓN:
 * - Usa el tipo global IAsignacion.
 * - Mantiene la altura fija (rellenando filas vacías) para evitar saltos (SPA feel).
 * - Maneja la opacidad durante la carga (isLoading).
 * ================================================================================
 */

// --- Importaciones ---
import Table from 'react-bootstrap/Table';
// CORRECCIÓN: Importamos el tipo desde la definición centralizada
import type { IAsignacion } from '../types';

interface Props {
  asignaciones: IAsignacion[];
  isLoading?: boolean;
  limit?: number;
}

/**
 * Función de Ayuda para estilos de fila
 */
function getVariantForObservacion(observacion: string): string {
  if (!observacion) return '';

  if (observacion.startsWith('Asignado (0-5 km)')) return 'table-success'; // Verde
  if (observacion.startsWith('Asignado (5-10 km)')) return 'table-primary'; // Azul
  if (observacion.startsWith('Asignado (10-30 km)')) return 'table-warning'; // Amarillo
  if (observacion.startsWith('No Asignada')) return 'table-danger'; // Rojo
  
  return '';
}

function TablaAsignaciones({ asignaciones, isLoading = false, limit = 12 }: Props) {
  
  // --- LÓGICA DE ESTABILIDAD VISUAL ---
  // Calculamos cuántas filas faltan para llenar la página (ej: si hay 5 datos y el límite es 12, faltan 7)
  // Esto evita que el paginador "salte" hacia arriba cuando hay pocos resultados.
  const filasFaltantes = Math.max(0, limit - asignaciones.length);
  const filasVacias = Array.from({ length: filasFaltantes });

  return (
    <div style={{ position: 'relative', minHeight: '400px' }}>
      <Table 
        striped 
        bordered 
        hover 
        responsive
        // LÓGICA VISUAL: Si está cargando, bajamos la opacidad suavemente
        style={{ 
            opacity: isLoading ? 0.5 : 1, 
            transition: 'opacity 0.2s ease-in-out',
            marginBottom: 0 
        }}
      >
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
          {/* A. DATOS REALES */}
          {asignaciones.map((asignacion, index) => {
            const isNotAsignada = asignacion.Observaciones.startsWith('No Asignada');
            const variant = getVariantForObservacion(asignacion.Observaciones);
            const destinoClass = isNotAsignada ? 'text-muted fst-italic' : '';

            return (
              <tr key={`row-${index}`} className={variant}>
                <td>{asignacion.origen_Departamento}</td>
                <td>{asignacion.origen_CUE}</td>
                <td>{asignacion.origen_Numero_Escuela}</td>
                <td>{asignacion.origen_Numero_Anexo}</td>
                <td className="text-start">{asignacion.origen_Nombre_Escuela}</td>
                <td>{asignacion.origen_Division}</td>
                
                <td className={destinoClass}>{isNotAsignada ? '-' : asignacion.destino_Departamento}</td>
                <td className={destinoClass}>{isNotAsignada ? '-' : asignacion.destino_CUE}</td>
                <td className={destinoClass}>{isNotAsignada ? '-' : asignacion.destino_Numero_Escuela}</td>
                <td className={destinoClass}>{isNotAsignada ? '-' : asignacion.destino_Numero_Anexo}</td>
                <td className={`text-start ${destinoClass}`}>{isNotAsignada ? 'N/A' : asignacion.destino_Nombre_Escuela}</td>
                <td className={destinoClass}>{isNotAsignada ? '-' : asignacion.destino_Division}</td>

                <td className="align-middle">{(asignacion.Distancia_KM || 0).toFixed(2)}</td>
              </tr>
            );
          })}

          {/* B. FILAS DE RELLENO (Para mantener altura fija) */}
          {filasVacias.map((_, index) => (
            <tr key={`empty-${index}`} style={{ height: '41px' }}> 
              {/* 13 columnas vacías con un espacio (&nbsp;) para que renderice el borde */}
              <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TablaAsignaciones;