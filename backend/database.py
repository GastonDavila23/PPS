import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'asignador.db')

def get_db_connection():
    """Establece la conexión con SQLite y activa las claves foráneas."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute('PRAGMA foreign_keys = ON;') 
    conn.row_factory = sqlite3.Row
    return conn

def verificar_rol_admin(email):
    """Valida si un email tiene rango de administrador."""
    if not email: return False
    conn = get_db_connection()
    try:
        user = conn.execute('SELECT rol FROM usuarios WHERE email = ?', (email,)).fetchone()
        return user is not None and user['rol'] == 'admin'
    finally:
        conn.close()

def inicializar_db():
    """Crea la estructura de tablas desde cero si no existen."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = ON;')

    # 1. Tabla de Usuarios
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('admin', 'profesor', 'profesor-pendiente'))
    );
    ''')

    # 2. Historial de Cargas (Tabla Maestra)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS historial_cargas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        fecha DATETIME DEFAULT (datetime('now', 'localtime')),
        registros_procesados INTEGER,
        observaciones TEXT
    );
    ''')

    # 3. Datos de Escuelas (Etapa 1: Carga Bruta)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS escuelas_data (
        id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
        id_carga INTEGER,
        CUE TEXT, 
        Nombre_Escuela TEXT,
        Departamento TEXT, 
        Numero_Escuela TEXT,
        Numero_Anexo TEXT, 
        Division TEXT, 
        Turno TEXT, 
        Latitud REAL, 
        Longitud REAL, 
        FOREIGN KEY (id_carga) REFERENCES historial_cargas(id) ON DELETE CASCADE
    );
    ''')

    # 4. Resultados de Asignación (Etapa 2: Resultado del Motor)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resultados_asignacion (
        id_resultado INTEGER PRIMARY KEY AUTOINCREMENT,
        id_carga INTEGER,
        origen_Departamento TEXT, origen_CUE TEXT, origen_Numero_Escuela TEXT,
        origen_Numero_Anexo TEXT, origen_Nombre_Escuela TEXT, origen_Division TEXT, origen_Turno TEXT,
        destino_Departamento TEXT, destino_CUE TEXT, destino_Numero_Escuela TEXT,
        destino_Numero_Anexo TEXT, destino_Nombre_Escuela TEXT, destino_Division TEXT, destino_Turno TEXT,
        Distancia_KM REAL, 
        Observaciones TEXT,
        FOREIGN KEY (id_carga) REFERENCES historial_cargas(id) ON DELETE CASCADE
    );
    ''')

    conn.commit()
    conn.close()
    print("✓ Estructura de Base de Datos inicializada (Tablas separadas para etapas).")

if __name__ == "__main__":
    inicializar_db()