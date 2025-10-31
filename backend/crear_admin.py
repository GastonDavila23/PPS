import sqlite3

ADMIN_EMAIL = "gastonn520@gmail.com"

DB_FILE = 'asignador.db'

print(f"Intentando insertar al administrador '{ADMIN_EMAIL}' en la base de datos '{DB_FILE}'...")

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

    print("\n¡Éxito!")
    print(f"El usuario con los siguientes datos ahora es administrador:")
    print(f"  - ID: {user[0]}")
    print(f"  - Email: {user[1]}")
    print(f"  - Rol: {user[3]}")

except sqlite3.Error as e:
    print(f"\nOcurrió un error con la base de datos: {e}")
finally:
    if conn:
        conn.close()