import sqlite3

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

    cursor.execute('''
        INSERT OR IGNORE INTO usuarios (email, password_hash, rol) 
        VALUES (?, ?, 'admin')
    ''', (ADMIN_EMAIL, 'auth0'))

    cursor.execute('''
        UPDATE usuarios SET rol = 'admin' WHERE email = ?
    ''', (ADMIN_EMAIL,))

    conn.commit()
    
    cursor.execute("SELECT * FROM usuarios WHERE email=?", (ADMIN_EMAIL,))
    user = cursor.fetchone()

    print("\n" + "="*40)
    print(" ¡ÉXITO! USUARIO ACTUALIZADO")
    print("="*40)
    print(f"  - ID: {user[0]}")
    print(f"  - Email: {user[1]}")
    print(f"  - Rol Actual: {user[2]}")
    print("="*40)
    print("Ya puedes iniciar sesión en el sistema con privilegios completos.\n")

except sqlite3.Error as e:
    print(f"\n[ERROR] Ocurrió un problema con la base de datos: {e}")
finally:
    if conn:
        conn.close()
    input("Presiona ENTER para salir...")