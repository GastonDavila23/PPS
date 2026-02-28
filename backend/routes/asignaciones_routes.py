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

@bp.route("/asignaciones", methods=['GET'])
def get_asignaciones():
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
    if 'planillas' not in request.files: 
        return jsonify({"error": "No se subieron archivos"}), 400
    
    files = request.files.getlist('planillas')
    
    try:
        # Procesamos sin depender de df_old para la primera carga
        df_new = procesar_archivos_y_actualizar(files, pd.DataFrame())
        
        if df_new is None or df_new.empty:
            return jsonify({"error": "El procesador devolvió un set de datos vacío. Verifique los CUE."}), 422
        
        conn = get_db_connection()
        # Aseguramos que la tabla se cree/reemplace correctamente
        df_new.to_sql('escuelas_data', conn, if_exists='replace', index=False)
        conn.close()
        
        # Ejecutamos la lógica de asignación
        res = recalcular_y_guardar_asignaciones()
        
        if res.get('status') == 'error':
            return jsonify({"error": res.get('message')}), 500
            
        return jsonify(res), 200
    except Exception as e:
        # Esto imprimirá el error real en tu consola de VS Code/Terminal
        print(f"ERROR CRÍTICO: {str(e)}") 
        return jsonify({"error": str(e)}), 500

@bp.route('/descargar-excel', methods=['GET'])
def descargar():
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