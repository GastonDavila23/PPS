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
> py crear_admin.py
================================================================================
"""

import sqlite3

# --- Configuración Interactiva ---
print("\n=== ASIGNACIÓN DE ROL DE ADMINISTRADOR ===")
print("Instrucciones: Ingrese el email con el que se registró en el sistema.")
ADMIN_EMAIL = input("Email del supervisor: ").strip()

DB_FILE = 'asignador.db'

if not ADMIN_EMAIL:
    print("Error: No ingresaste ningún email. El programa se cerrará.")
    exit()

print(f"\nIntentando hacer ADMIN a: '{ADMIN_EMAIL}' en la base de datos...")

try:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 1. Asegurar que el usuario exista (si no, lo crea con un placeholder)
    cursor.execute('''
        INSERT OR IGNORE INTO usuarios (email, password_hash, rol) 
        VALUES (?, ?, 'admin')
    ''', (ADMIN_EMAIL, 'auth0'))

    # 2. Si ya existía, forzar la actualización del rol a 'admin'
    cursor.execute('''
        UPDATE usuarios SET rol = 'admin' WHERE email = ?
    ''', (ADMIN_EMAIL,))

    conn.commit()
    
    # 3. Verificación
    cursor.execute("SELECT * FROM usuarios WHERE email=?", (ADMIN_EMAIL,))
    user = cursor.fetchone()

    print("\n" + "="*40)
    print(" ¡ÉXITO! USUARIO ACTUALIZADO")
    print("="*40)
    print(f"  - ID: {user[0]}")
    print(f"  - Email: {user[1]}")
    print(f"  - Rol Actual: {user[2]}") # Ojo: revisa si en tu tabla el rol es índice 2 o 3
    print("="*40)
    print("Ya puedes iniciar sesión en el sistema con privilegios completos.\n")

except sqlite3.Error as e:
    print(f"\n[ERROR] Ocurrió un problema con la base de datos: {e}")
finally:
    if conn:
        conn.close()
    input("Presiona ENTER para salir...")