"""
================================================================================
ARCHIVO: crear_admin.py
================================================================================
PROPÓSITO:
Este es un script de utilidad manual. NO es parte del servidor.

Su única función es conectarse a la base de datos 'asignador.db' y asegurar
que el usuario especificado en la variable 'ADMIN_EMAIL' exista y tenga el
rol de 'admin'.

Se puede ejecutar de forma segura múltiples veces.

MODO DE USO (desde la terminal, en la carpeta /backend):
> python crear_admin.py
================================================================================
"""

import sqlite3 # Importa la librería para conectarse a SQLite

# --- Configuración ---
ADMIN_EMAIL = "gastonn520@gmail.com" # El email que recibirá permisos de admin
DB_FILE = 'asignador.db'             # El archivo de la base de datos
# ---------------------

print(f"Intentando insertar al administrador '{ADMIN_EMAIL}' en la base de datos '{DB_FILE}'...")

try:
    # Intenta conectarse a la base de datos
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor() # Crea un 'cursor' para ejecutar comandos

    # --- Comando 1: INSERT OR IGNORE ---
    # Intenta insertar al usuario.
    # 'OR IGNORE' es clave: si el email ya existe, este comando no hace nada y no da error.
    # 'password_hash' se setea a 'auth0' como marcador, ya que la pass real la maneja Auth0.
    cursor.execute('''
        INSERT OR IGNORE INTO usuarios (email, password_hash, rol) 
        VALUES (?, ?, 'admin')
    ''', (ADMIN_EMAIL, 'auth0'))

    # --- Comando 2: UPDATE ---
    # Este comando es la segunda parte de la seguridad.
    # Si el usuario ya existía (creado por 'profesor-pendiente' o por el 'IGNORE' anterior),
    # este comando se asegura de que su 'rol' se actualice a 'admin'.
    cursor.execute('''
        UPDATE usuarios SET rol = 'admin' WHERE email = ?
    ''', (ADMIN_EMAIL,))

    # --- Guardar Cambios ---
    conn.commit() # Confirma y guarda todas las transacciones (INSERT y UPDATE) en la BD.

    # --- Verificación ---
    # Vuelve a consultar la BD para verificar que los cambios se aplicaron.
    cursor.execute("SELECT * FROM usuarios WHERE email=?", (ADMIN_EMAIL,))
    user = cursor.fetchone() # Obtiene el primer resultado

    # Imprime un mensaje de éxito con los datos del usuario
    print("\n¡Éxito!")
    print(f"El usuario con los siguientes datos ahora es administrador:")
    # user[0] es ID, user[1] es email, user[3] es rol (según tu crear_db.py)
    print(f"  - ID: {user[0]}")
    print(f"  - Email: {user[1]}")
    print(f"  - Rol: {user[3]}")

except sqlite3.Error as e:
    # Si algo falla (ej: la tabla 'usuarios' no existe), imprime el error
    print(f"\nOcurrió un error con la base de datos: {e}")
finally:
    # Este bloque se ejecuta SIEMPRE (haya éxito o error)
    if conn:
        # Se asegura de cerrar la conexión a la BD para no dejarla "abierta"
        conn.close()