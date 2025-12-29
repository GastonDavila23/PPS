import pandas as pd
import io
from openpyxl.styles import PatternFill, Font, Border, Side, Alignment
from openpyxl.utils import get_column_letter

def generar_excel_estilizado(df):
    """
    Recibe un DataFrame y devuelve un objeto BytesIO con el Excel formateado.
    """
    # 1. Renombrar Columnas
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

    # 2. Reordenar
    cols = [
        'Origen - Departamento', 'Origen - CUE', 'Origen - N° Escuela', 'Origen - Anexo',
        'Origen - Nombre', 'Origen - División', 'Origen - Turno',
        'Destino - Departamento', 'Destino - CUE', 'Destino - N° Escuela', 'Destino - Anexo',
        'Destino - Nombre', 'Destino - División', 'Destino - Turno',
        'Distancia (KM)', 'Observaciones'
    ]
    df = df[[c for c in cols if c in df.columns]]

    # 3. Generar Excel
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Asignaciones')
        worksheet = writer.sheets['Asignaciones']

        # Estilos
        header_fill = PatternFill(start_color="70AD47", end_color="70AD47", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)
        header_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
        banded_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
        thin_border = Border(left=Side(style='thin', color='BFBFBF'), right=Side(style='thin', color='BFBFBF'), 
                             top=Side(style='thin', color='BFBFBF'), bottom=Side(style='thin', color='BFBFBF'))
        
        max_lengths = {}

        for row_idx, row in enumerate(worksheet.iter_rows(), 1):
            if row_idx == 1:
                for cell in row:
                    cell.fill = header_fill
                    cell.font = header_font
                    cell.alignment = header_align
                    cell.border = thin_border
                    max_lengths[cell.column] = len(str(cell.value))
                continue

            for cell in row:
                cell.border = thin_border
                if row_idx % 2 == 0: cell.fill = banded_fill
                
                # Alineación según tu lógica original
                col_name = worksheet.cell(row=1, column=cell.column).value
                if col_name in ['Origen - Nombre', 'Destino - Nombre', 'Observaciones']:
                    cell.alignment = Alignment(horizontal="left", vertical="center")
                elif col_name == 'Distancia (KM)':
                    cell.alignment = Alignment(horizontal="right", vertical="center")
                else:
                    cell.alignment = Alignment(horizontal="center", vertical="center")

                max_lengths[cell.column] = max(max_lengths.get(cell.column, 0), len(str(cell.value)))

        for col_idx, max_len in max_lengths.items():
            worksheet.column_dimensions[get_column_letter(col_idx)].width = min(max_len + 2, 50)

    output.seek(0)
    return output