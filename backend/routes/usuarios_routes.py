from flask import Blueprint, jsonify, request
from database import get_db_connection, verificar_rol_admin

bp = Blueprint('usuarios', __name__)

@bp.route("/rol", methods=['GET'])
def get_role():
    email = request.args.get('email')
    if not email: return jsonify({"error": "Email faltante"}), 400
    
    conn = get_db_connection()
    try:
        # Verificamos si es el primer usuario del sistema
        total_users = conn.execute("SELECT COUNT(*) FROM usuarios").fetchone()[0]
        
        user = conn.execute('SELECT rol FROM usuarios WHERE email = ?', (email,)).fetchone()
        
        if user:
            return jsonify({"rol": user['rol']})
        
        # Lógica de auto-registro
        nuevo_rol = 'admin' if total_users == 0 else 'profesor-pendiente'
        
        conn.execute("INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)", 
                     (email, 'auth0', nuevo_rol))
        conn.commit()
        
        return jsonify({"rol": nuevo_rol})
    finally:
        conn.close()

@bp.route("", methods=['GET'])
def get_all():
    admin_email = request.args.get('admin_email')
    if not verificar_rol_admin(admin_email):
        return jsonify({"error": "No autorizado"}), 403

    conn = get_db_connection()
    try:
        users = conn.execute("SELECT id, email, rol FROM usuarios").fetchall()
        return jsonify([dict(u) for u in users])
    finally:
        conn.close()

@bp.route("/cambiar-rol", methods=['POST'])
def change_role():
    data = request.json
    # Usamos el email del admin desde los headers o el body para validar
    admin_email = request.headers.get('X-Admin-Email') 
    
    if not verificar_rol_admin(admin_email):
        return jsonify({"error": "No autorizado"}), 403
    
    conn = get_db_connection()
    try:
        conn.execute("UPDATE usuarios SET rol = ? WHERE id = ?", (data.get('rol'), data.get('id')))
        conn.commit()
        return jsonify({"mensaje": "Rol actualizado con éxito"})
    finally:
        conn.close()