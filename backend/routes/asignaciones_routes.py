from flask import Blueprint, jsonify, request, send_file
import pandas as pd
import math
import logging
from database import get_db_connection
from procesador_excel import procesar_archivos_y_actualizar
from services.asignacion_service import recalcular_y_guardar_asignaciones, construir_filtros_sql
from services.reportes_service import generar_excel_estilizado

bp = Blueprint('asignaciones', __name__)
logger = logging.getLogger(__name__)

def verificar_rol_admin(email):
    """Función auxiliar para validar si un email tiene rango de administrador."""
    if not email:
        return False
    conn = get_db_connection()
    try:
        user = conn.execute('SELECT rol FROM usuarios WHERE email = ?', (email,)).fetchone()
        return user is not None and user['rol'] == 'admin'
    finally:
        conn.close()

@bp.route("/asignaciones", methods=['GET'])
def get_asignaciones():
    # Esta ruta es de consulta, permitida para Admin y Profesores (ya filtrado en el front)
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 15, type=int)
    offset = (page - 1) * limit
    
    filtros = {
        'departamento': request.args.get('departamento'),
        'turno': request.args.get('turno'),
        'estado': request.args.get('estado_asignacion'),
        'nombre': request.args.get('nombre_escuela')
    }

    where_clause, params = construir_filtros_sql(filtros)
    conn = get_db_connection()
    try:
        total = conn.execute(f"SELECT COUNT(*) FROM resultados_asignacion {where_clause}", params).fetchone()[0]
        query = f"SELECT * FROM resultados_asignacion {where_clause} LIMIT ? OFFSET ?"
        data = conn.execute(query, (*params, limit, offset)).fetchall()
        
        deptos = [r[0] for r in conn.execute("SELECT DISTINCT origen_Departamento FROM resultados_asignacion WHERE origen_Departamento IS NOT NULL ORDER BY 1")]
        turnos = [r[0] for r in conn.execute("SELECT DISTINCT origen_Turno FROM resultados_asignacion WHERE origen_Turno IS NOT NULL ORDER BY 1")]

        return jsonify({
            'totalItems': total,
            'asignaciones': [dict(row) for row in data],
            'totalPages': math.ceil(total / limit),
            'currentPage': page,
            'allDepartamentos': deptos,
            'allTurnos': turnos
        })
    finally:
        conn.close()

@bp.route('/cargar-planillas', methods=['POST'])
def cargar():
    usuario_email = request.form.get('usuario_email')
    
    # --- BLOQUEO DE SEGURIDAD ---
    if not verificar_rol_admin(usuario_email):
        logger.warning(f"Intento de carga no autorizado por parte de: {usuario_email}")
        return jsonify({"error": "Acceso denegado. Se requieren permisos de administrador."}), 403
    
    if 'planillas' not in request.files: 
        return jsonify({"error": "No se subieron archivos"}), 400
    
    files = request.files.getlist('planillas')
    
    try:
        df_new = procesar_archivos_y_actualizar(files)
        
        if df_new is None or df_new.empty:
            return jsonify({"error": "No se pudo cruzar la información de los archivos."}), 422

        conn = get_db_connection()
        try:
            df_new.to_sql('escuelas_data', conn, if_exists='replace', index=False)
            res = recalcular_y_guardar_asignaciones()
            
            conn.execute(
                "INSERT INTO historial_cargas (usuario_email, registros_procesados, observaciones) VALUES (?, ?, ?)",
                (usuario_email, len(df_new), res.get('message'))
            )
            conn.commit()
            
            return jsonify({
                "status": "success",
                "message": "Carga exitosa",
                "detalle": {
                    "total_escuelas": len(df_new),
                    "asignaciones_info": res.get('message')
                }
            }), 200
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Error crítico en carga: {str(e)}")
        return jsonify({"error": f"Error crítico: {str(e)}"}), 500

@bp.route('/descargar-excel', methods=['GET'])
def descargar():
    # Para descargar reportes también validamos que sea admin
    usuario_email = request.args.get('email')
    
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "No tienes permiso para descargar reportes."}), 403

    filtros = {
        'departamento': request.args.get('departamento'),
        'turno': request.args.get('turno'),
        'estado': request.args.get('estado_asignacion')
    }
    where_clause, params = construir_filtros_sql(filtros)
    conn = get_db_connection()
    try:
        df = pd.read_sql_query(f"SELECT * FROM resultados_asignacion {where_clause}", conn, params=tuple(params))
    finally:
        conn.close()
    
    if df.empty: return jsonify({"error": "Sin datos"}), 404
    archivo = generar_excel_estilizado(df)
    return send_file(archivo, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name='reporte_asignaciones.xlsx')

@bp.route('/historial-cargas', methods=['GET'])
def get_historial():
    # El historial de auditoría solo debería verlo el administrador
    usuario_email = request.args.get('email')
    
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "Acceso denegado."}), 403

    conn = get_db_connection()
    try:
        query = """
            SELECT id, usuario_email, 
            datetime(fecha) as fecha, 
            registros_procesados, observaciones 
            FROM historial_cargas 
            ORDER BY id DESC LIMIT 10
        """
        data = conn.execute(query).fetchall()
        
        historial = [dict(row) for row in data]
        return jsonify({"historial": historial}), 200
    except Exception as e:
        logger.error(f"Error obteniendo historial: {e}")
        return jsonify({"error": "No se pudo obtener el historial"}), 500
    finally:
        conn.close()