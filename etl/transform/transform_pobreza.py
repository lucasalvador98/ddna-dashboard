"""
Transformar datos de pobreza del Excel para cargar a Supabase.
"""
import pandas as pd
import json
from pathlib import Path

def transform_pobreza_data():
    """Lee el Excel de pobreza y transforma a formato indicadores."""
    
    xlsx_path = Path("../datos/raw/pobreza/cuadros_informe_pobreza_09_24 (1).xlsx")
    output_dir = Path("../etl/output")
    output_dir.mkdir(exist_ok=True)
    
    indicadores = []
    
    # ===== 1. POBREZA GENERAL =====
    df_pobreza = pd.read_excel(xlsx_path, sheet_name='Pobreza')
    
    # Columnas de semestres (saltar la primera columna que es "Indicador")
    semester_cols = df_pobreza.columns[1:].tolist()
    
    # Procesar cada fila (indicador)
    for _, row in df_pobreza.iterrows():
        indicador = row['Indicador']
        
        for col in semester_cols:
            valor = row[col]
            if pd.isna(valor):
                continue
                
            # Extraer año del nombre de la columna
            col_clean = col.replace('(1)', '').replace('(2)', '').strip()
            
            # Parsear semestre y año
            if '1er. semestre' in col_clean:
                semestre = 1
                anio = int(col_clean.replace('1er. semestre', '').strip())
            elif '2do. semestre' in col_clean:
                semestre = 2
                anio = int(col_clean.replace('2do. semestre', '').strip())
            else:
                continue
            
            periodo = anio
            
            # Determinar categoria e indicador
            if 'Pobreza Hogares' in indicador:
                nombre = "Pobreza hogares"
                unidad = "%"
            elif 'Pobreza Personas' in indicador:
                nombre = "Pobreza personas"
                unidad = "%"
            elif 'Indigencia Hogares' in indicador:
                nombre = "Indigencia hogares"
                unidad = "%"
            elif 'Indigencia Personas' in indicador:
                nombre = "Indigencia personas"
                unidad = "%"
            else:
                continue
            
            indicadores.append({
                "indicador_nombre": nombre,
                "categoria": "pobreza",
                "valor": float(valor),
                "unidad": unidad,
                "periodo": periodo,
                "region": "Córdoba",
                "fuente": "EPH-INDEC / Dirección de Estadísticas",
                "desglose": {
                    "semestre": semestre,
                    "tipo": indicador
                }
            })
    
    # ===== 2. POBREZA INFANTIL 0-17 =====
    df_infantil = pd.read_excel(xlsx_path, sheet_name='pobreza 0 a 17')
    
    for _, row in df_infantil.iterrows():
        edad = row['Grupos de edad']
        semestre = row['Semestre']
        
        if pd.isna(semestre):
            continue
            
        # Parsear semestre y año
        if '1er. semestre' in str(semestre):
            sem_num = 1
            anio = int(str(semestre).replace('1er. semestre', '').strip())
        elif '2do. semestre' in str(semestre):
            sem_num = 2
            anio = int(str(semestre).replace('2do. semestre', '').strip())
        else:
            continue
        
        # Agregar cada tipo de pobreza
        for col, nombre in [
            ('Total de pobres', 'Pobreza infantil'),
            ('Pobres indigentes', 'Indigencia infantil'),
            ('No pobres', 'No pobre infantil'),
        ]:
            valor = row[col]
            if pd.isna(valor):
                continue
                
            indicadores.append({
                "indicador_nombre": nombre,
                "categoria": "pobreza",
                "valor": float(valor),
                "unidad": "%",
                "periodo": anio,
                "region": "Córdoba",
                "fuente": "EPH-INDEC / Dirección de Estadísticas",
                "desglose": {
                    "semestre": sem_num,
                    "grupo_edad": edad,
                    "tipo": "infantil"
                }
            })
    
    # Guardar JSON transformado
    output_file = output_dir / "pobreza_transformed.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(indicadores, f, ensure_ascii=False, indent=2)
    
    print(f"Transformados {len(indicadores)} registros de pobreza")
    print(f"  - Pobreza general: {len(df_pobreza.columns) * 4} registros")
    print(f"  - Pobreza infantil: {len(df_infantil)} registros")
    
    return indicadores


def generate_sql_inserts(indicadores):
    """Genera SQL INSERT statements."""
    
    sql_lines = []
    
    for ind in indicadores:
        desglose = json.dumps(ind.get('desglose', {}))
        sql = f"""INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, fuente, desglose)
VALUES ('{ind['indicador_nombre']}', '{ind['categoria']}', {ind['valor']}, '{ind['unidad']}', {ind['periodo']}, '{ind['region']}', '{ind['fuente']}', '{desglose.replace("'", "''")}');"""
        sql_lines.append(sql)
    
    # Guardar SQL
    output_file = Path("../etl/output/pobreza_inserts.sql")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(sql_lines))
    
    print(f"SQL generado: {output_file}")
    
    return sql_lines


if __name__ == "__main__":
    indicadores = transform_pobreza_data()
    generate_sql_inserts(indicadores)
    
    # Preview
    print("\n=== Preview primeros 3 registros ===")
    for i, ind in enumerate(indicadores[:3]):
        print(f"{i+1}. {ind['indicador_nombre']} | {ind['periodo']} | {ind['valor']}% | {ind.get('desglose', {})}")
