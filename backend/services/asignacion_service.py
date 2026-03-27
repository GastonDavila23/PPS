import pandas as pd
import logging
from database import get_db_connection
from .engine_service import ejecutar_algoritmo_matching

logger = logging.getLogger(__name__)

def recalcular_y_guardar_asignaciones():
    """
    Orquestador del proceso de asignación (Etapa 2).
    Extrae los datos ya normalizados de la DB, corre el motor optimizado
    y guarda los resultados finales.
    """
    conn = get_db_connection()
    try:
        # 1. Cargar datos desde la tabla de escuelas
        df_escuelas = pd.read_sql_query("SELECT * FROM escuelas_data", conn)
        
        if df_escuelas.empty:
            logger.info("No hay datos en 'escuelas_data' para procesar.")
            return {"status": "info", "message": "No hay escuelas cargadas. Suba una planilla primero."}

        # 2. Limpieza total de resultados previos
        conn.execute("DELETE FROM resultados_asignacion")
        conn.commit()

        logger.info(f"Iniciando motor de asignación para {len(df_escuelas)} registros...")

        # 3. Llamada al motor inteligente
        resultados = ejecutar_algoritmo_matching(df_escuelas)

        # 4. Guardado masivo de resultados
        if resultados:
            df_resultados = pd.DataFrame(resultados)
            
            # Guardamos en la tabla de resultados finales. 
            df_resultados.to_sql('resultados_asignacion', conn, if_exists='append', index=False)
            conn.commit()
            
            msg = f"Cálculo finalizado: {len(resultados)} asignaciones generadas."
            logger.info(msg)
            return {"status": "success", "message": msg}
        
        return {"status": "warning", "message": "El motor no pudo generar ninguna pareja válida."}

    except Exception as e:
        logger.error(f"Error en el orquestador: {str(e)}")
        return {"status": "error", "message": f"Fallo en el cálculo: {str(e)}"}
    finally:
        conn.close()

def construir_filtros_sql(filtros: dict):
    where_clause = " WHERE 1=1"
    params = []

    # ... (filtros de depto y turno que ya funcionan)
    if filtros.get('departamento') and filtros['departamento'] != 'todos':
        where_clause += " AND origen_Departamento = ?"
        params.append(filtros['departamento'].lower().strip())

    if filtros.get('turno') and filtros['turno'] != 'todos':
        where_clause += " AND origen_Turno = ?"
        params.append(filtros['turno'].upper().strip())

    estado = filtros.get('estado')
    if estado and estado != 'todos':
        if estado == '0-5km':
            # Buscamos tanto el rango <1 como el de 1-5
            where_clause += " AND (Observaciones LIKE '%< 1 km%' OR Observaciones LIKE '%1-5 km%')"
        elif estado == '5-10km':
            where_clause += " AND Observaciones LIKE '%5-10 km%'"
        elif estado == '10-30km':
            where_clause += " AND Observaciones LIKE '%10-30 km%'"
        elif estado == 'no-asignadas':
            # Atrapa cualquier variante de "No Asignada"
            where_clause += " AND Observaciones LIKE 'No Asignada%'"

    if filtros.get('nombre'):
        where_clause += " AND (origen_Nombre_Escuela LIKE ? OR origen_CUE LIKE ?)"
        busqueda = f"%{filtros['nombre'].upper()}%"
        params.extend([busqueda, busqueda])

    return where_clause, params