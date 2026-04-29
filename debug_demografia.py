import sys
sys.path.insert(0, 'etl')
import pandas as pd
from etl.extract import read_excel_file
from etl.transform.demografia import _transform_censo_poblacion, _process_censo_cba, _process_censo_agrupado, _process_censo_nacional
from pathlib import Path

filepath = Path('datos/raw/censo-2022/demografia/censo poblacion.xlsx')
print('File exists:', filepath.exists())

# Test read_excel_file
sheets = read_excel_file(str(filepath))
print('Sheets from read_excel_file:', list(sheets.keys()))
for sheet_name, df in sheets.items():
    print(f'  {sheet_name}: {df.shape}')

# Test _transform_censo_poblacion
records = _transform_censo_poblacion(filepath)
print('Records from _transform_censo_poblacion:', len(records))
if records:
    print('First record:', records[0])

# Test each sheet processing
for sheet_name in ['Censo_cba', 'censo_agrupado', 'Totales nacion']:
    if sheet_name in sheets:
        df = sheets[sheet_name]
        print(f'\nProcessing sheet: {sheet_name}')
        print(f'  Shape: {df.shape}')
        if sheet_name == 'Censo_cba':
            recs = _process_censo_cba(df, filepath.name, sheet_name)
        elif sheet_name == 'censo_agrupado':
            recs = _process_censo_agrupado(df, filepath.name, sheet_name)
        elif sheet_name == 'Totales nacion':
            recs = _process_censo_nacional(df, filepath.name, sheet_name)
        print(f'  Records generated: {len(recs)}')
        if recs:
            print(f'  First record: {recs[0]}')
