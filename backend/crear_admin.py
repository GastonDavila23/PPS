import sqlite3
import sys

def configurar_admin():
    print("\n" + "="*60)
    print("        SISTEMA DGE - CONFIGURACIÓN DE ADMINISTRADOR")
    print("="*60)
    print("\nInstrucciones: Ingrese el email exacto con el que el supervisor")
    print("se registrará en el sistema (el mismo de su cuenta de Auth0).")

    email_admin = input("\n➤ Email del supervisor: ").strip()

    if not email_admin:
        print("\n[ERROR] No ingresaste ningún email. El proceso se canceló.")
        return 

    db_file = 'asignador.db'

    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR IGNORE INTO usuarios (email, password_hash, rol) 
            VALUES (?, ?, 'admin')
        ''', (email_admin, 'auth0'))

        cursor.execute('''
            UPDATE usuarios SET rol = 'admin' WHERE email = ?
        ''', (email_admin,))

        conn.commit()
        
        cursor.execute("SELECT email, rol FROM usuarios WHERE email=?", (email_admin,))
        user = cursor.fetchone()

        if user:
            print("\n" + "✅" + "-"*58)
            print(" ¡CONFIGURACIÓN COMPLETADA CON ÉXITO!")
            print("-"*60)
            print(f"  Usuario: {user[0]}")
            print(f"  Nivel de Acceso: {user[1].upper()}")
            print("-"*60)
            print("El supervisor ya puede entrar al sistema con control total.\n")
        else:
            print("\n[!] Error: El usuario se creó pero no se pudo verificar.")

    except sqlite3.Error as e:
        print(f"\n❌ [ERROR DE BASE DE DATOS]: {e}")
        print("Asegúrese de que 'crear_db.py' se haya ejecutado antes.")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    configurar_admin()