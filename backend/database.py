import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'asignador.db')

def get_db_connection():
    """Crea una conexión a la base de datos con row_factory para acceso por nombre de columna."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ejecutar_query(query, params=(), commit=False):
    """Función utilitaria para ejecutar queries rápidas sin repetir código de conexión."""
    conn = get_db_connection()
    try:
        cursor = conn.execute(query, params)
        if commit:
            conn.commit()
        return cursor.fetchall()
    finally:
        conn.close()