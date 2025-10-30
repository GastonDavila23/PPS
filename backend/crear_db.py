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
print("Tabla 'escuelas_data' creada.")

cursor.execute('''
CREATE TABLE IF NOT EXISTS resultados_asignacion (
    "Origen - Departamento" TEXT, "Origen - CUE" TEXT, "Origen - N° Escuela" TEXT,
    "Origen - Nombre" TEXT, "Origen - División" TEXT, "Origen - Turno" TEXT,
    "Destino - Departamento" TEXT, "Destino - CUE" TEXT, "Destino - N° Escuela" TEXT,
    "Destino - Nombre" TEXT, "Destino - División" TEXT, "Destino - Turno" TEXT,
    "Distancia (KM)" REAL, "Observaciones" TEXT
);
''')
print("Tabla 'resultados_asignacion' creada.")

conn.commit()
conn.close()
print("\nBase de datos y tablas listas.")