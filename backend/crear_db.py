import sqlite3

conn = sqlite3.connect('asignador.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('admin', 'profesor', 'profesor-pendiente'))
);
''')
print("Tabla 'usuarios' creada.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS escuelas_data (
    ID_Escuela INTEGER, CUE TEXT, Subcue INTEGER, Numero_Escuela TEXT,
    Numero_Anexo TEXT, Nivel TEXT, Gestion TEXT, Nombre_Escuela TEXT,
    Departamento TEXT, Latitud REAL, Longitud REAL, Curso TEXT,
    Division TEXT, Turno TEXT, Matricula REAL
);
''')
print("Tabla 'escuelas_data' (flexible) creada.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS resultados_asignacion (
    origen_Departamento TEXT, origen_CUE TEXT, origen_Numero_Escuela TEXT,
    origen_Numero_Anexo TEXT, origen_Nombre_Escuela TEXT, origen_Division TEXT, origen_Turno TEXT,
    destino_Departamento TEXT, destino_CUE TEXT, destino_Numero_Escuela TEXT,
    destino_Numero_Anexo TEXT, destino_Nombre_Escuela TEXT, destino_Division TEXT, destino_Turno TEXT,
    Distancia_KM REAL, Observaciones TEXT
);
''')
print("Tabla 'resultados_asignacion' (flexible) creada.")

conn.commit()
conn.close()
print("\nBase de datos y tablas listas (esquema flexible).")