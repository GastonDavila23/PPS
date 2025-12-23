"""
================================================================================
ARCHIVO: crear_db.py
================================================================================
PROPÓSITO:
Este es un script de utilidad manual, NO es parte del servidor.

Su única función es crear el archivo de la base de datos 'asignador.db'
(si no existe) y definir la estructura (esquema) de todas las tablas
necesarias para que el sistema funcione:
1. 'usuarios': Para la gestión de roles y permisos.
2. 'escuelas_data': Donde se almacenan los datos limpios de los Excel cargados.
3. 'resultados_asignacion': Donde se guardan los resultados del cálculo.

MODO DE USO (desde la terminal, en la carpeta /backend):
> py crear_db.py
================================================================================
"""

import sqlite3 # Importa la librería para conectarse a SQLite

# Se conecta al archivo 'asignador.db'.
# Si el archivo no existe, SQLite lo crea automáticamente en este paso.
conn = sqlite3.connect('asignador.db')
cursor = conn.cursor() # Crea un 'cursor' para ejecutar comandos SQL

# --- Tabla de Usuarios ---
# Almacena los usuarios y sus roles (admin, profesor, pendiente)
cursor.execute('''
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Un ID numérico único que se genera solo
    email TEXT UNIQUE NOT NULL,          -- El email del usuario (debe ser único)
    password_hash TEXT NOT NULL,         -- Un campo para el hash (aunque Auth0 lo maneja)
    rol TEXT NOT NULL CHECK(rol IN ('admin', 'profesor', 'profesor-pendiente')) -- El rol, con una regla que solo permite esos 3 valores
);
''')
# 'IF NOT EXISTS' es clave: evita errores si el script se ejecuta varias veces.
print("Tabla 'usuarios' creada o ya existente.")

# --- Tabla de Datos de Escuelas ---
# Esta es la tabla "fuente de verdad".
# Almacena todos los datos limpios y unificados de las planillas Excel cargadas.
# El script 'asignador.py' lee de aquí para hacer los cálculos.
cursor.execute('''
CREATE TABLE IF NOT EXISTS escuelas_data (
    ID_Escuela INTEGER, CUE TEXT, Subcue INTEGER, Numero_Escuela TEXT,
    Numero_Anexo TEXT, Nivel TEXT, Gestion TEXT, Nombre_Escuela TEXT,
    Departamento TEXT, Latitud REAL, Longitud REAL, Curso TEXT,
    Division TEXT, Turno TEXT, Matricula REAL
);
''')
# Se define como "flexible" (la mayoría son TEXT o REAL) para aceptar
# los datos variables que puedan venir de los Excel.
print("Tabla 'escuelas_data' (flexible) creada o ya existente.")

# --- Tabla de Resultados ---
# Esta es la tabla "producto".
# Almacena el resultado final del cálculo de asignaciones.
# El frontend (React) lee de esta tabla para mostrar la información.
# El reporte Excel se genera a partir de esta tabla.
cursor.execute('''
CREATE TABLE IF NOT EXISTS resultados_asignacion (
    origen_Departamento TEXT, origen_CUE TEXT, origen_Numero_Escuela TEXT,
    origen_Numero_Anexo TEXT, origen_Nombre_Escuela TEXT, origen_Division TEXT, origen_Turno TEXT,
    
    destino_Departamento TEXT, destino_CUE TEXT, destino_Numero_Escuela TEXT,
    destino_Numero_Anexo TEXT, destino_Nombre_Escuela TEXT, destino_Division TEXT, destino_Turno TEXT,
    
    Distancia_KM REAL, 
    Observaciones TEXT -- Aquí se guarda si fue "Asignado (0-5km)", "No Asignada", etc.
);
''')
print("Tabla 'resultados_asignacion' (flexible) creada o ya existente.")

# --- Finalizar ---
conn.commit() # Confirma y guarda todos los cambios (creación de tablas) en la BD.
conn.close()  # Cierra la conexión.

print("\nBase de datos y tablas listas (esquema flexible).")