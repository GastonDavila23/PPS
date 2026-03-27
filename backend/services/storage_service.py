import pandas as pd
import logging
from database import get_db_connection

logger = logging.getLogger(__name__)

def registrar_nueva_carga(usuario_email, registros_procesados, observaciones):
    """Registra una nueva entrada en el historial y retorna su ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO historial_cargas (usuario_email, registros_procesados, observaciones) VALUES (?, ?, ?)",
            (usuario_email, registros_procesados, observaciones)
        )
        carga_id = cursor.lastrowid
        conn.commit()
        return carga_id
    finally:
        conn.close()

def eliminar_carga_especifica(id_carga):
    """
    Elimina una carga. El ON DELETE CASCADE en la DB 
    limpiará escuelas_data y resultados_asignacion vinculados.
    """
    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM historial_cargas WHERE id = ?", (id_carga,))
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error al eliminar carga: {e}")
        return False
    finally:
        conn.close()

def obtener_coordenadas_existentes():
    """Busca coordenadas previas para enriquecer nuevas cargas sin geo."""
    conn = get_db_connection()
    try:
        query = "SELECT DISTINCT CUE, Latitud, Longitud FROM escuelas_data WHERE Latitud IS NOT NULL"
        df = pd.read_sql_query(query, conn)
        if df.empty: return {}
        return df.drop_duplicates('CUE').set_index('CUE')[['Latitud', 'Longitud']].to_dict('index')
    except Exception as e:
        logger.warning(f"No hay coordenadas previas: {e}")
        return {}
    finally:
        conn.close()

def limpiar_todo():
    """Resetea las tablas de datos sin tocar la tabla 'usuarios'."""
    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM resultados_asignacion")
        conn.execute("DELETE FROM escuelas_data")
        conn.execute("DELETE FROM historial_cargas")
        conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('resultados_asignacion', 'escuelas_data', 'historial_cargas')")
        
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error en limpieza total: {e}")
        return False
    finally:
        conn.close()