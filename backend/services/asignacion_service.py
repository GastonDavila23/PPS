import pandas as pd
from geopy.distance import geodesic
from database import get_db_connection

# --- Constantes de Observaciones (Centralizadas) ---
OBS_FALTA_DATOS = "No Asignada (Faltan Datos Geo)"
OBS_SIN_CANDIDATOS = "No Asignada (Sin Candidatos)"
OBS_MAYOR_30KM = "No Asignada (Candidatos > 30km)"
OBS_0_5KM = "Asignado (0-5 km)"
OBS_5_10KM = "Asignado (5-10 km)"
OBS_10_30KM = "Asignado (10-30 km)"

def construir_filtros_sql(filtros):
    """
    Recibe un diccionario de filtros y construye la cláusula WHERE.
    DRY: Usado tanto por la vista de tabla como por la descarga de Excel.
    """
    where_clause = " WHERE 1=1"
    params = []

    if filtros.get('departamento') and filtros['departamento'] != 'todos':
        where_clause += " AND origen_Departamento = ?"
        params.append(filtros['departamento'])
        
    if filtros.get('turno') and filtros['turno'] != 'todos':
        where_clause += " AND origen_Turno = ?"
        params.append(filtros['turno'])

    estado = filtros.get('estado')
    if estado and estado != 'todos':
        if estado == '0-5km': where_clause += " AND Observaciones = ?"
        elif estado == '5-10km': where_clause += " AND Observaciones = ?"
        elif estado == '10-30km': where_clause += " AND Observaciones = ?"
        elif estado == 'no-asignadas': where_clause += " AND Observaciones LIKE 'No Asignada%'"
        
        # Agregamos el valor exacto al param para evitar inyección y hardcoding en string
        if estado in ['0-5km', '5-10km', '10-30km']:
            val_map = {'0-5km': OBS_0_5KM, '5-10km': OBS_5_10KM, '10-30km': OBS_10_30KM}
            params.append(val_map[estado])

    nombre = filtros.get('nombre')
    if nombre:
        where_clause += " AND (origen_Nombre_Escuela LIKE ? OR destino_Nombre_Escuela LIKE ?)"
        params.extend([f"%{nombre}%", f"%{nombre}%"])

    return where_clause, params

def recalcular_y_guardar_asignaciones():
    """
    Lógica de negocio original: Lee escuelas, calcula geodésicas y guarda.
    """
    conn = get_db_connection()
    try:
        df = pd.read_sql_query("SELECT * FROM escuelas_data", conn)
        if df.empty:
            conn.execute("DELETE FROM resultados_asignacion")
            conn.commit()
            return {"status": "info", "message": "No hay datos, se limpiaron asignaciones."}
    except Exception as e:
        return {"status": "error", "message": f"Error BD: {e}"}
    finally:
        conn.close()

    destinos_disponibles = df.copy()
    lista_resultados = []

    for _, profesor_origen in df.iterrows():
        origen_info = profesor_origen.to_dict()
        
        # Validación Geo
        if pd.isna(origen_info.get('Latitud')) or pd.isna(origen_info.get('Longitud')):
            lista_resultados.append({
                "origen": origen_info, "destino": origen_info,
                "Distancia_KM": 0.0, "Observaciones": OBS_FALTA_DATOS
            })
            continue
        
        # Buscar Candidatos
        candidatos = []
        for _, posible_destino in destinos_disponibles.iterrows():
            if (pd.notna(posible_destino.get('Latitud')) and 
                origen_info.get('CUE') != posible_destino.get('CUE') and
                origen_info.get('Turno') == posible_destino.get('Turno')):
                
                dist = geodesic(
                    (origen_info['Latitud'], origen_info['Longitud']),
                    (posible_destino['Latitud'], posible_destino['Longitud'])
                ).kilometers
                candidatos.append({'destino_serie': posible_destino, 'distancia': dist, 'index': posible_destino.name})
        
        if not candidatos:
            lista_resultados.append({
                "origen": origen_info, "destino": origen_info,
                "Distancia_KM": 0.0, "Observaciones": OBS_SIN_CANDIDATOS
            })
            continue

        mejor_opcion = sorted(candidatos, key=lambda x: x['distancia'])[0]
        distancia_final = mejor_opcion['distancia']
        
        # Clasificación
        if distancia_final < 5: observacion = OBS_0_5KM
        elif 5 <= distancia_final < 10: observacion = OBS_5_10KM
        elif 10 <= distancia_final <= 30: observacion = OBS_10_30KM
        else:
            lista_resultados.append({
                "origen": origen_info, "destino": origen_info,
                "Distancia_KM": 0.0, "Observaciones": OBS_MAYOR_30KM
            })
            continue
        
        # Asignación Exitosa
        destino_info = mejor_opcion['destino_serie'].to_dict()
        lista_resultados.append({
            "origen": origen_info, "destino": destino_info,
            "Distancia_KM": distancia_final, "Observaciones": observacion
        })
        destinos_disponibles.drop(mejor_opcion['index'], inplace=True, errors='ignore')

    # Guardar en BD
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
    
    conn = get_db_connection()
    try:
        pd.DataFrame(datos_para_db).to_sql('resultados_asignacion', conn, if_exists='replace', index=False)
        conn.commit()
        return {"status": "success", "message": f"Procesadas {len(datos_para_db)} asignaciones."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()