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
    'Longitud': ['longitud', 'Longitud', 'lon', 'lng']
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
    dataframes_procesados = [df_existente.copy()] if not df_existente.empty else []

    for archivo in lista_de_archivos:
        try:
            df_sheets = pd.read_excel(archivo, sheet_name=None)
            df_nuevo = pd.concat(df_sheets.values(), ignore_index=True)
            df_nuevo_normalizado = normalizar_columnas(df_nuevo)
            
            if 'CUE' in df_nuevo_normalizado.columns:
                dataframes_procesados.append(df_nuevo_normalizado)
        except Exception as e:
            print(f"ADVERTENCIA: No se pudo procesar el archivo '{archivo.filename}'. Error: {e}")
            continue

    if not dataframes_procesados:
        return pd.DataFrame()

    df_combinado = pd.concat(dataframes_procesados, ignore_index=True)
    
    if 'CUE' in df_combinado.columns:
        df_combinado['CUE'] = df_combinado['CUE'].astype(str).str.strip()
        df_combinado.dropna(subset=['CUE'], inplace=True)
        df_combinado = df_combinado[df_combinado['CUE'] != 'nan']
        df_final = df_combinado.groupby('CUE').last().reset_index()
    else:
        df_final = df_combinado
        
    if 'Latitud' in df_final.columns:
        df_final['Latitud'] = pd.to_numeric(df_final['Latitud'], errors='coerce')
        df_final.loc[~df_final['Latitud'].between(-90, 90), 'Latitud'] = np.nan

    if 'Longitud' in df_final.columns:
        df_final['Longitud'] = pd.to_numeric(df_final['Longitud'], errors='coerce')
        df_final.loc[~df_final['Longitud'].between(-180, 180), 'Longitud'] = np.nan
    
    formato_final_columnas = [
        'ID_Escuela', 'CUE', 'Subcue', 'Numero_Escuela', 'Numero_Anexo',
        'Nivel', 'Gestion', 'Nombre_Escuela', 'Departamento', 'Latitud',
        'Longitud', 'Curso', 'Division', 'Turno', 'Matricula'
    ]
    
    for col in formato_final_columnas:
        if col not in df_final.columns:
            df_final[col] = None

    df_final.fillna({
        'Nivel': 'Primario', 'Gestion': 'Pública', 'Curso': '6°', 
        'Subcue': 0, 'ID_Escuela': 0, 'Matricula': 0
    }, inplace=True)
    
    print(f"Proceso de actualización completo. Total de registros únicos: {len(df_final)}")
    return df_final[formato_final_columnas]