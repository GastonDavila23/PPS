import sqlite3

def get_db_connection():
    """
    Función de utilidad para crear y retornar una conexión a la base de datos.
    """
    conn = sqlite3.connect('asignador.db')
    conn.row_factory = sqlite3.Row
    return conn