from flask import Blueprint, jsonify, request
from database import get_db_connection

bp = Blueprint('usuarios', __name__)

@bp.route("/rol", methods=['GET'])
def get_role():
    email = request.args.get('email')
    if not email: return jsonify({"error": "Email faltante"}), 400
    
    conn = get_db_connection()
    try:
        user = conn.execute('SELECT rol FROM usuarios WHERE email = ?', (email,)).fetchone()
        if user:
            return jsonify({"rol": user['rol']})
        
        conn.execute("INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)", (email, 'auth0', 'profesor-pendiente'))
        conn.commit()
        return jsonify({"rol": "profesor-pendiente"})
    finally:
        conn.close()

@bp.route("", methods=['GET'])
def get_all():
    conn = get_db_connection()
    try:
        users = conn.execute("SELECT id, email, rol FROM usuarios").fetchall()
        return jsonify([dict(u) for u in users])
    finally:
        conn.close()

@bp.route("/cambiar-rol", methods=['POST'])
def change_role():
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute("UPDATE usuarios SET rol = ? WHERE id = ?", (data.get('rol'), data.get('id')))
        conn.commit()
        return jsonify({"mensaje": "Rol actualizado"})
    finally:
        conn.close()