import pandas as pd
import numpy as np

COLUMNAS_CONOCIDAS = {
    'CUE': ['CUE', 'cue', 'CUEAnexo'],
    'Numero_Escuela': ['Número_escuela', 'Numero_escuela', 'Numero Escuela'],
    'Numero_Anexo': ['Número_Anexo', 'Numero_Anexo', 'Numero Anexo'],
    'Nombre_Escuela': ['Nombre_Escuela', 'Nombre Escuela', 'Escuela'],
    'Departamento': ['Departamento'],
    'Division': ['División', 'Division'],
    'Turno': ['Turno'],
    'Matricula': ['Matrícula', 'Matricula'],
    'Latitud': ['latitud', 'Latitud', 'lat'],
    'Longitud': ['longitud', 'Longitud', 'lon', 'lng'],
    'ID_Escuela': ['ID_Escuela', 'ID Escuela', 'id_escuela'],
    'Curso': ['Curso', 'curso'],
    'Subcue': ['Subcue'],
    'Nivel': ['Nivel'],
    'Gestion': ['Gestion']
}

def normalizar_columnas(df):
    df_renombrado = df.copy()
    df_renombrado.columns = df_renombrado.columns.astype(str)
    mapeo_final = {}
    columnas_df = {col.lower().replace(" ", "").replace("_", ""): col for col in df_renombrado.columns}
    for nombre_estandar, posibles_nombres in COLUMNAS_CONOCIDAS.items():
        for nombre_posible in posibles_nombres:
            nombre_posible_norm = nombre_posible.lower().replace(" ", "").replace("_", "")
            if nombre_posible_norm in columnas_df:
                mapeo_final[columnas_df[nombre_posible_norm]] = nombre_estandar
                break
    df_renombrado.rename(columns=mapeo_final, inplace=True)
    return df_renombrado

def procesar_archivos_y_actualizar(lista_de_archivos, df_existente):
    data_files_dfs = []
    coord_files_dfs = []

    for archivo in lista_de_archivos:
        try:
            if archivo.filename.endswith('.csv'):
                df_nuevo = pd.read_csv(archivo, on_bad_lines='skip')
            else:
                df_sheets = pd.read_excel(archivo, sheet_name=None)
                df_nuevo = pd.concat(df_sheets.values(), ignore_index=True)
                
            df_nuevo_normalizado = normalizar_columnas(df_nuevo)
            
            if 'Latitud' in df_nuevo_normalizado.columns and 'Longitud' in df_nuevo_normalizado.columns:
                coord_files_dfs.append(df_nuevo_normalizado)
            else:
                data_files_dfs.append(df_nuevo_normalizado)
                    
        except Exception as e:
            print(f"ADVERTENCIA: No se pudo procesar el archivo '{archivo.filename}'. Error: {e}")
            continue

    if not data_files_dfs or not coord_files_dfs:
        print("ERROR: Se necesitan ambos tipos de archivos (datos de división/turno y datos de coordenadas) para procesar.")
        return pd.DataFrame()

    df_data = pd.concat(data_files_dfs, ignore_index=True)

    if 'CUE' in df_data.columns:
        df_data['CUE'] = df_data['CUE'].astype(str).str.split('.').str[0].str.strip()
        df_data['CUE'].replace(['nan', 'None', ''], np.nan, inplace=True)
    else:
        df_data['CUE'] = np.nan

    if 'Turno' in df_data.columns:
        turno_map = {'mañana': 'Mañana', 'tarde': 'Tarde'}
        df_data['Turno'] = df_data['Turno'].astype(str).str.lower().map(turno_map)

    df_data.dropna(subset=['CUE', 'Turno'], inplace=True)
    
    df_coords = pd.concat(coord_files_dfs, ignore_index=True)

    if 'CUE' in df_coords.columns:
        df_coords['CUE'] = df_coords['CUE'].astype(str).str.split('.').str[0].str.strip()
        df_coords['CUE'].replace(['nan', 'None', ''], np.nan, inplace=True)
    else:
        df_coords['CUE'] = np.nan
    
    if 'Latitud' in df_coords.columns:
        df_coords['Latitud'] = pd.to_numeric(df_coords['Latitud'], errors='coerce')
    if 'Longitud' in df_coords.columns:
        df_coords['Longitud'] = pd.to_numeric(df_coords['Longitud'], errors='coerce')
            
    df_coords_lookup = df_coords[['CUE', 'Latitud', 'Longitud']].copy()
    df_coords_lookup.dropna(inplace=True)
    df_coords_lookup.drop_duplicates(subset=['CUE'], keep='last', inplace=True)
    
    df_merged = pd.merge(df_data, df_coords_lookup, on='CUE', how='inner')

    formato_final_columnas = [
        'ID_Escuela', 'CUE', 'Subcue', 'Numero_Escuela', 'Numero_Anexo',
        'Nivel', 'Gestion', 'Nombre_Escuela', 'Departamento', 'Latitud',
        'Longitud', 'Curso', 'Division', 'Turno', 'Matricula'
    ]
    
    for col in formato_final_columnas:
        if col not in df_merged.columns:
            df_merged[col] = None

    df_merged.fillna({
        'Nivel': 'Primario', 'Gestion': 'Pública', 'Curso': '6°', 
        'Subcue': 0, 'ID_Escuela': 0, 'Matricula': 0, 'Numero_Anexo': 0
    }, inplace=True)
    
    print(f"Proceso de fusión completo. Total de 'slots' (filas) con datos y coordenadas: {len(df_merged)}")
    return df_merged[formato_final_columnas]