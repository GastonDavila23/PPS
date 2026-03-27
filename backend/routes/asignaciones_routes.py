from flask import Blueprint, jsonify, request, send_file
import pandas as pd
import math
import logging
from database import get_db_connection, verificar_rol_admin
from procesador_excel import procesar_archivos_y_actualizar
from services.asignacion_service import recalcular_y_guardar_asignaciones, construir_filtros_sql
from services.storage_service import registrar_nueva_carga, eliminar_carga_especifica, limpiar_todo
from services.reportes_service import generar_excel_estilizado

bp = Blueprint('asignaciones', __name__)
logger = logging.getLogger(__name__)

# --- ETAPA 1: CARGA Y NORMALIZACIÓN ---
@bp.route('/cargar-planillas', methods=['POST'])
def cargar():
    usuario_email = request.form.get('usuario_email')
    
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "Acceso denegado. Se requiere rol Admin."}), 403
    
    # Verificamos que lleguen archivos
    if 'planillas' not in request.files: 
        return jsonify({"error": "No se seleccionaron archivos para subir."}), 400
    
    files = request.files.getlist('planillas')
    
    nombres_archivos = [f.filename for f in files]
    logger.info(f"Iniciando carga de {len(files)} archivos: {nombres_archivos}")

    try:
        df_new = procesar_archivos_y_actualizar(files)
        
        if df_new is None or df_new.empty:
            return jsonify({"error": "Los archivos no contienen datos válidos o compatibles."}), 422

        # 2. Guardar en la base de datos
        conn = get_db_connection()
        try:
            # Registrar la carga en el historial primero
            from services.storage_service import registrar_nueva_carga
            id_carga = registrar_nueva_carga(
                usuario_email, 
                len(df_new), 
                f"Carga unificada de: {', '.join(nombres_archivos)}"
            )
            
            # Añadir el ID de carga a cada fila del DataFrame
            df_new['id_carga'] = id_carga
            
            # Guardar en escuelas_data
            df_new.to_sql('escuelas_data', conn, if_exists='append', index=False)
            conn.commit()
            
            return jsonify({
                "status": "success",
                "message": f"Se cargaron {len(df_new)} slots de escuelas correctamente.",
                "id_carga": id_carga
            }), 200
            
        except Exception as db_e:
            logger.error(f"Error de base de datos en carga: {db_e}")
            return jsonify({"error": "Error al guardar los datos en la base de datos."}), 500
        finally:
            conn.close()
            
    except ValueError as val_e:
        logger.warning(f"Validación de planilla fallida: {val_e}")
        return jsonify({"error": str(val_e)}), 400
    except Exception as e:
        logger.error(f"Error crítico en el proceso de carga: {str(e)}")
        return jsonify({"error": "Ocurrió un error inesperado al procesar las planillas."}), 500

# --- ETAPA 2: PROCESAMIENTO ---
@bp.route('/procesar-asignaciones', methods=['POST'])
def procesar():
    """
    PASO 2: Toma todos los datos de 'escuelas_data' y corre el motor de asignación.
    Este es el endpoint que el Admin disparará con el botón de 'Iniciar Cálculo'.
    """
    usuario_email = request.json.get('email')
    
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "No autorizado"}), 403

    try:
        # Ejecutamos el motor
        res_calculo = recalcular_y_guardar_asignaciones()
        
        return jsonify({
            "status": "success",
            "message": "Asignaciones calculadas correctamente.",
            "data": res_calculo
        }), 200
    except Exception as e:
        logger.error(f"Error en procesamiento: {str(e)}")
        return jsonify({"error": "Fallo en el motor de asignación."}), 500

# --- CONSULTAS Y REPORTES ---
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

# --- HISTORIAL DE CARGAS ---
@bp.route('/historial-cargas', methods=['GET'])
def get_historial():
    """Retorna el historial de todas las cargas realizadas."""
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email requerido"}), 400
        
    conn = get_db_connection()
    try:
        # Traemos todas las cargas ordenadas por fecha descendente
        cursor = conn.cursor()
        query = "SELECT id, fecha, usuario_email, registros_procesados, observaciones FROM historial_cargas ORDER BY fecha DESC"
        data = cursor.execute(query).fetchall()
        
        return jsonify({"historial": [dict(row) for row in data]})
    except Exception as e:
        logger.error(f"Error al obtener historial: {e}")
        return jsonify({"error": "No se pudo obtener el historial"}), 500
    finally:
        conn.close()

# --- ELIMINAR CARGA ESPECÍFICA ---   
@bp.route('/historial-cargas/<int:id_carga>', methods=['DELETE'])
def eliminar_carga(id_carga):
    """
    Elimina una carga específica por su ID.
    Esta es la ruta que está dando 404.
    """
    usuario_email = request.args.get('email')
    
    # Verificamos que sea admin
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "No autorizado"}), 403

    try:
        from services.storage_service import eliminar_carga_especifica
        
        if eliminar_carga_especifica(id_carga):
            return jsonify({
                "status": "success", 
                "message": f"Carga {id_carga} eliminada correctamente."
            }), 200
        
        return jsonify({"error": "No se encontró el registro en la base de datos."}), 404
    except Exception as e:
        logger.error(f"Error al eliminar carga {id_carga}: {e}")
        return jsonify({"error": "Error interno al intentar eliminar."}), 500

# --- DESCARGAR EXCEL ---
@bp.route('/descargar-excel', methods=['GET'])
def descargar():
    """Genera el reporte Excel basado en los filtros."""
    usuario_email = request.args.get('email')
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "No autorizado"}), 403

    # Capturamos los filtros
    filtros = {
        'departamento': request.args.get('departamento'),
        'turno': request.args.get('turno'),
        'estado': request.args.get('estado')
    }
    
    from services.asignacion_service import construir_filtros_sql
    from services.reportes_service import generar_excel_estilizado
    
    where_clause, params = construir_filtros_sql(filtros)
    conn = get_db_connection()
    try:
        # Query para traer los datos filtrados
        query = f"SELECT * FROM resultados_asignacion {where_clause}"
        df = pd.read_sql_query(query, conn, params=tuple(params))
        
        if df.empty:
            return jsonify({"error": "Sin datos"}), 404
            
        archivo = generar_excel_estilizado(df)
        return send_file(
            archivo, 
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
            as_attachment=True, 
            download_name='reporte_asignaciones.xlsx'
        )
    finally:
        conn.close()

# --- LIMPIAR SISTEMA ---     
@bp.route('/limpiar-escuelas', methods=['POST'])
def limpiar_datos_sistema():
    """
    Limpia historial, escuelas y resultados. 
    Mantiene la tabla de usuarios intacta.
    """
    data = request.json
    usuario_email = data.get('email')

    # Validación de seguridad
    if not verificar_rol_admin(usuario_email):
        return jsonify({"error": "No autorizado. Se requieren permisos de administrador."}), 403

    from services.storage_service import limpiar_todo
    
    if limpiar_todo():
        return jsonify({"message": "Sistema reseteado con éxito. Usuarios preservados."}), 200
    else:
        return jsonify({"error": "Error técnico al limpiar la base de datos."}), 500