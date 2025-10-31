import pandas as pd
import sqlite3
import io
import math
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from geopy.distance import geodesic
from procesador_excel import procesar_archivos_y_actualizar
import numpy as np

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Establece conexión con la base de datos SQLite."""
    conn = sqlite3.connect('asignador.db')
    conn.row_factory = sqlite3.Row
    return conn

def recalcular_y_guardar_asignaciones():
    """
    Lee los datos de las escuelas, calcula las asignaciones basadas en la cercanía
    y guarda los resultados en la base de datos, clasificándolos por rangos de distancia.
    Lógica de Slots: Compara por Turno, no por División.
    """
    try:
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT * FROM escuelas_data", conn)
        if df.empty:
            conn.execute("DELETE FROM resultados_asignacion")
            conn.commit()
            print("INFO: No hay datos de escuelas, se han limpiado las asignaciones existentes.")
            return
    except Exception as e:
        print(f"ERROR: No se pudo leer la tabla de escuelas. {e}")
        return
    finally:
        if conn:
            conn.close()

    destinos_disponibles = df.copy()
    lista_resultados = []
    
    OBS_FALTA_DATOS = "No Asignada (Faltan Datos Geo)"
    OBS_SIN_CANDIDATOS = "No Asignada (Sin Candidatos)"
    OBS_MAYOR_30KM = "No Asignada (Candidatos > 30km)"
    OBS_0_5KM = "Asignado (0-5 km)"
    OBS_5_10KM = "Asignado (5-10 km)"
    OBS_10_30KM = "Asignado (10-30 km)"

    for _, profesor_origen in df.iterrows():
        origen_info = profesor_origen.to_dict()
        
        if pd.isna(origen_info.get('Latitud')) or pd.isna(origen_info.get('Longitud')):
            resultado = {
                "origen": origen_info, "destino": origen_info,
                "Distancia_KM": 0.0, "Observaciones": OBS_FALTA_DATOS
            }
            lista_resultados.append(resultado)
            continue
            
        candidatos = []
        for _, posible_destino in destinos_disponibles.iterrows():

            if (pd.notna(posible_destino.get('Latitud')) and pd.notna(posible_destino.get('Longitud')) and
                origen_info.get('CUE') != posible_destino.get('CUE') and
                origen_info.get('Turno') == posible_destino.get('Turno')):
                
                dist = geodesic(
                    (origen_info['Latitud'], origen_info['Longitud']),
                    (posible_destino['Latitud'], posible_destino['Longitud'])
                ).kilometers
                candidatos.append({'destino_serie': posible_destino, 'distancia': dist, 'index': posible_destino.name})
        
        if not candidatos:
            resultado = {
                "origen": origen_info, "destino": origen_info,
                "Distancia_KM": 0.0, "Observaciones": OBS_SIN_CANDIDATOS
            }
            lista_resultados.append(resultado)
            continue

        mejor_opcion = sorted(candidatos, key=lambda x: x['distancia'])[0]
        distancia_final = mejor_opcion['distancia']
        
        if distancia_final < 5:
            observacion = OBS_0_5KM
        elif 5 <= distancia_final < 10:
            observacion = OBS_5_10KM
        elif 10 <= distancia_final <= 30:
            observacion = OBS_10_30KM
        else:
            resultado = {
                "origen": origen_info, "destino": origen_info,
                "Distancia_KM": 0.0, "Observaciones": OBS_MAYOR_30KM
            }
            lista_resultados.append(resultado)
            continue
        
        destino_info = mejor_opcion['destino_serie'].to_dict()
        resultado = {
            "origen": origen_info, "destino": destino_info,
            "Distancia_KM": distancia_final, "Observaciones": observacion
        }
        destinos_disponibles.drop(mejor_opcion['index'], inplace=True, errors='ignore')
        lista_resultados.append(resultado)

    datos_para_db = []
    for r in lista_resultados:
        fila = {
            'origen_Departamento': r['origen'].get('Departamento'), 'origen_CUE': r['origen'].get('CUE'),
            'origen_Numero_Escuela': r['origen'].get('Numero_Escuela'), 'origen_Numero_Anexo': r['origen'].get('Numero_Anexo'),
            'origen_Nombre_Escuela': r['origen'].get('Nombre_Escuela'), 'origen_Division': r['origen'].get('Division'),
            'origen_Turno': r['origen'].get('Turno'), 'destino_Departamento': r['destino'].get('Departamento'),
            'destino_CUE': r['destino'].get('CUE'), 'destino_Numero_Escuela': r['destino'].get('Numero_Escuela'),
            'destino_Numero_Anexo': r['destino'].get('Numero_Anexo'), 
            'destino_Nombre_Escuela': r['destino'].get('Nombre_Escuela'),
            'destino_Division': r['destino'].get('Division'), 'destino_Turno': r['destino'].get('Turno'),
            'Distancia_KM': round(r.get('Distancia_KM', 0), 2), 'Observaciones': r.get('Observaciones')
        }
        datos_para_db.append(fila)
    
    df_resultados = pd.DataFrame(datos_para_db)
    
    conn = get_db_connection()
    try:
        df_resultados.to_sql('resultados_asignacion', conn, if_exists='replace', index=False)
        conn.commit()
        print(f"INFO: Se han recalculado y guardado {len(df_resultados)} asignaciones.")
    except Exception as e:
        print(f"ERROR: No se pudieron guardar las asignaciones en la BD. {e}")
    finally:
        conn.close()
        
@app.route("/api/asignaciones", methods=['GET'])
def get_asignaciones():
    """
    Devuelve las asignaciones de forma paginada y con filtros MÚLTIPLES aplicados.
    """
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 15, type=int)
    offset = (page - 1) * limit
    
    filtro_depto = request.args.get('departamento')
    filtro_turno = request.args.get('turno')
    filtro_estado = request.args.get('estado_asignacion')

    filtro_nombre = request.args.get('nombre_escuela') 

    conn = get_db_connection()
    
    base_query = "FROM resultados_asignacion"
    where_clause = " WHERE 1=1"
    params = []

    if filtro_depto and filtro_depto != 'todos':
        where_clause += " AND origen_Departamento = ?"
        params.append(filtro_depto)
        
    if filtro_turno and filtro_turno != 'todos':
        where_clause += " AND origen_Turno = ?"
        params.append(filtro_turno)

    if filtro_estado and filtro_estado != 'todos':
        if filtro_estado == '0-5km':
            where_clause += " AND Observaciones = 'Asignado (0-5 km)'"
        elif filtro_estado == '5-10km':
            where_clause += " AND Observaciones = 'Asignado (5-10 km)'"
        elif filtro_estado == '10-30km':
            where_clause += " AND Observaciones = 'Asignado (10-30 km)'"
        elif filtro_estado == 'no-asignadas':
            where_clause += " AND Observaciones LIKE 'No Asignada%'"

    if filtro_nombre:
        where_clause += " AND (origen_Nombre_Escuela LIKE ? OR destino_Nombre_Escuela LIKE ?)"
        params.append(f"%{filtro_nombre}%")
        params.append(f"%{filtro_nombre}%")

    try:
        total_items_query = f"SELECT COUNT(*) {base_query}{where_clause}"
        total_items = conn.execute(total_items_query, params).fetchone()[0]
        
        data_query = f"SELECT * {base_query}{where_clause} LIMIT ? OFFSET ?"
        query_results = conn.execute(data_query, (*params, limit, offset)).fetchall()
        
        departamentos_rows = conn.execute("SELECT DISTINCT origen_Departamento FROM resultados_asignacion WHERE origen_Departamento IS NOT NULL ORDER BY origen_Departamento").fetchall()
        turnos_rows = conn.execute("SELECT DISTINCT origen_Turno FROM resultados_asignacion WHERE origen_Turno IS NOT NULL ORDER BY origen_Turno").fetchall()
        
        all_departamentos = [row[0] for row in departamentos_rows]
        all_turnos = [row[0] for row in turnos_rows]

        return jsonify({
            'totalItems': total_items,
            'asignaciones': [dict(row) for row in query_results],
            'totalPages': math.ceil(total_items / limit),
            'currentPage': page,
            'allDepartamentos': all_departamentos,
            'allTurnos': all_turnos
        })
    except Exception as e:
        print(f"ERROR al obtener asignaciones: {e}")
        return jsonify({"error": "No se pudieron obtener las asignaciones."}), 500
    finally:
        conn.close()

@app.route('/api/cargar-planillas', methods=['POST'])
def cargar_planillas():
    """Recibe archivos Excel, los procesa y recalcula las asignaciones."""
    if 'planillas' not in request.files:
        return jsonify({"error": "No se encontraron archivos."}), 400
    
    lista_archivos = request.files.getlist('planillas')
    if not lista_archivos:
        return jsonify({"error": "La lista de archivos está vacía."}), 400
    
    conn = get_db_connection()
    try:
        df_existente = pd.read_sql_query("SELECT * FROM escuelas_data", conn)
    except pd.io.sql.DatabaseError:
        df_existente = pd.DataFrame()
        print("INFO: Tabla 'escuelas_data' no encontrada. Se creará una nueva.")
    finally:
        conn.close()

    df_actualizado = procesar_archivos_y_actualizar(lista_archivos, df_existente)

    if df_actualizado is not None and not df_actualizado.empty:
        conn = get_db_connection()
        try:
            df_actualizado.to_sql('escuelas_data', conn, if_exists='replace', index=False)
            conn.commit()
            recalcular_y_guardar_asignaciones()
            return jsonify({"mensaje": "Éxito: Datos procesados y asignaciones recalculadas."}), 200
        except Exception as e:
            return jsonify({"error": f"Error al guardar o recalcular: {e}"}), 500
        finally:
            if conn: conn.close()
    else:
        print("ADVERTENCIA: El procesamiento de archivos no generó datos válidos.")
        return jsonify({"error": "El procesamiento de los archivos falló o no contenían datos válidos."}), 400

@app.route('/api/descargar-excel', methods=['GET'])
def descargar_excel():
    """
    Genera y devuelve un archivo Excel con las asignaciones, aplicando filtros.
    """
    departamento = request.args.get('departamento')
    turno = request.args.get('turno')
    estado_asignacion = request.args.get('estado_asignacion')

    conn = get_db_connection()
    try:
        query = "SELECT * FROM resultados_asignacion WHERE 1=1"
        params = []

        if departamento and departamento != 'todos':
            query += " AND origen_Departamento = ?"
            params.append(departamento)
        if turno and turno != 'todos':
            query += " AND origen_Turno = ?"
            params.append(turno)
        
        if estado_asignacion and estado_asignacion != 'todos':
            if estado_asignacion == '0-5km':
                query += " AND Observaciones = 'Asignado (0-5 km)'"
            elif estado_asignacion == '5-10km':
                query += " AND Observaciones = 'Asignado (5-10 km)'"
            elif estado_asignacion == '10-30km':
                query += " AND Observaciones = 'Asignado (10-30 km)'"
            elif estado_asignacion == 'no-asignadas':
                query += " AND Observaciones LIKE 'No Asignada%'"
            
        df = pd.read_sql_query(query, conn, params=tuple(params))
        
        if df.empty:
            return jsonify({"error": "No hay datos para exportar con los filtros seleccionados."}), 404

        df.rename(columns={
            'origen_Departamento': 'Origen - Departamento', 'origen_CUE': 'Origen - CUE',
            'origen_Numero_Escuela': 'Origen - N° Escuela', 'origen_Numero_Anexo': 'Origen - Anexo',
            'origen_Nombre_Escuela': 'Origen - Nombre', 'origen_Division': 'Origen - División', 'origen_Turno': 'Origen - Turno',
            'destino_Departamento': 'Destino - Departamento', 'destino_CUE': 'Destino - CUE',
            'destino_Numero_Escuela': 'Destino - N° Escuela', 'destino_Numero_Anexo': 'Destino - Anexo',
            'destino_Nombre_Escuela': 'Destino - Nombre',
            'destino_Division': 'Destino - División', 'destino_Turno': 'Destino - Turno',
            'Distancia_KM': 'Distancia (KM)', 'Observaciones': 'Observaciones'
        }, inplace=True)

        columnas_excel = [
            'Origen - Departamento', 'Origen - CUE', 'Origen - N° Escuela', 'Origen - Anexo',
            'Origen - Nombre', 'Origen - División', 'Origen - Turno',
            'Destino - Departamento', 'Destino - CUE', 'Destino - N° Escuela', 'Destino - Anexo',
            'Destino - Nombre', 'Destino - División', 'Destino - Turno',
            'Distancia (KM)', 'Observaciones'
        ]
        
        columnas_existentes = [col for col in columnas_excel if col in df.columns]
        df = df[columnas_existentes]


        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Asignaciones')
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='reporte_asignaciones.xlsx'
        )
    except Exception as e:
        print(f"Error al generar el Excel: {e}")
        return jsonify({"error": "No se pudo generar el archivo Excel."}), 500
    finally:
        if conn: conn.close()

@app.route("/api/usuarios/rol", methods=['GET'])
def get_user_role():
    user_email = request.args.get('email')
    if not user_email: return jsonify({"error": "Email no proporcionado"}), 400
    conn = get_db_connection()
    try:
        user = conn.execute('SELECT rol FROM usuarios WHERE email = ?', (user_email,)).fetchone()
        if user:
            return jsonify({"rol": user['rol']})
        else:
            conn.execute("INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)", (user_email, 'auth0', 'profesor-pendiente'))
            conn.commit()
            return jsonify({"rol": "profesor-pendiente"})
    finally:
        conn.close()

@app.route("/api/usuarios", methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    try:
        users = conn.execute("SELECT id, email, rol FROM usuarios").fetchall()
        return jsonify([dict(user) for user in users])
    finally:
        conn.close()

@app.route("/api/usuarios/cambiar-rol", methods=['POST'])
def change_user_role():
    data = request.json
    user_id = data.get('id')
    new_role = data.get('rol')
    conn = get_db_connection()
    try:
        conn.execute("UPDATE usuarios SET rol = ? WHERE id = ?", (new_role, user_id))
        conn.commit()
        return jsonify({"mensaje": f"Rol del usuario {user_id} actualizado a {new_role}."})
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)