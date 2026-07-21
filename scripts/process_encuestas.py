import openpyxl
from collections import Counter
import json

wb = openpyxl.load_workbook(
    r'C:\Users\20409409009\Desktop\01. Monitoreo\TABLEROS Y BASES\Encuestas 2024\form encuestas 2024\Encuesta adultos y  NyN 12 a 18 Años 2024 (Responses).xlsx',
    data_only=True
)
ws = wb.active

# Columnas verificadas manualmente (openpyxl 1-based)
# Formato: (columna, label, tipo, limite_respuestas)
questions = [
    # ADULTOS
    (5, "Hacinamiento", "adultos", 0),
    (6, "Hogar come 4 comidas", "adultos", 0),
    (8, "Situacion laboral", "adultos", 10),
    (9, "Ayuda alimentaria", "adultos", 0),
    (10, "Frecuencia afecto a hijos", "adultos", 0),
    (11, "Tiempo recreativo con hijos", "adultos", 0),
    (15, "Quien prepara comida", "adultos", 10),
    (22, "Lectura de cuentos", "adultos", 0),
    (23, "Ultimo abrazo a hijos", "adultos", 0),
    (25, "Quien cuida hijos enfermos", "adultos", 0),
    # JOVENES
    (28, "Grado escolar", "jovenes", 0),
    (29, "Con quien vives", "jovenes", 0),
    (30, "Feliz en casa", "jovenes", 0),
    (31, "Adultos muestran carino", "jovenes", 0),
    (32, "Tiempo recreativo propio", "jovenes", 0),
    (34, "Tiempo solo en casa", "jovenes", 0),
    (35, "Comparte comidas en familia", "jovenes", 0),
    (36, "Dificultad para ir a la escuela", "jovenes", 0),
    (37, "Ultimo abrazo recibido", "jovenes", 0),
    (43, "Estado emocional", "jovenes", 0),
    (44, "Estres por estudios", "jovenes", 0),
    (46, "Ha visto consumo en pares", "jovenes", 0),
    (47, "Opinion sobre consumo", "jovenes", 0),
    (48, "Presion para consumir", "jovenes", 0),
    (49, "Escuela como contencion", "jovenes", 0),
    (50, "Estado de animo general", "jovenes", 0),
    (51, "Tiene amigos de confianza", "jovenes", 0),
    (52, "Contencion en amigos", "jovenes", 0),
]

indicator_groups = []
total_indicators = 0

for col_idx, label, survey_type, max_answers in questions:
    responses = []
    for row in ws.iter_rows(min_row=2, min_col=col_idx, max_col=col_idx, values_only=True):
        val = row[0]
        if val is not None and str(val).strip():
            responses.append(str(val).strip())

    if not responses:
        print(f"  SKIP: {label} (col {col_idx}) - sin respuestas")
        continue

    counter = Counter(responses)
    total = len(responses)
    base_name = f"Encuesta 2024 - {label}"
    
    answers = []
    for ans_val, count in counter.most_common():
        if max_answers > 0 and len(answers) >= max_answers:
            break
        pct = round(count / total * 100, 1)
        answers.append((ans_val, pct))

    indicator_groups.append({
        'question': base_name,
        'total': total,
        'survey_type': survey_type,
        'answers': answers
    })
    total_indicators += len(answers)
    
    print(f"  OK: {label} ({survey_type}, n={total}) -> {len(answers)} respuestas")
    for ans, pct in answers[:3]:
        a = ans[:55] if len(ans) > 55 else ans
        print(f"      {a}: {pct}%")
    if len(answers) > 3:
        print(f"      ... y {len(answers)-3} mas")

print(f"\nTotal: {len(indicator_groups)} grupos, {total_indicators} indicadores")

# Generate SQL
sql_lines = []
sql_lines.append("-- Encuestas 2024 - Datos cargados desde Excel de respuestas")
sql_lines.append("-- Fecha: 2024, Encuesta a adultos y jovenes de Cordoba")
sql_lines.append("")

sql_lines.append("INSERT INTO fuentes_datos (nombre, categoria, tipo, descripcion, fuente_oficial, frecuencia, estado)")
sql_lines.append("VALUES ('Encuesta Bienestar 2024', 'encuestas_2024', 'manual',")
sql_lines.append("  'Encuesta a adultos y jovenes sobre bienestar, alimentacion, vinculos y salud emocional',")
sql_lines.append("  'Defensoria de los Derechos de NNyA de Cordoba', 'ad-hoc', 'cargado');")
sql_lines.append("")

sql_lines.append("ALTER TABLE indicadores DROP CONSTRAINT IF EXISTS indicadores_categoria_check;")
sql_lines.append("ALTER TABLE indicadores ADD CONSTRAINT indicadores_categoria_check")
sql_lines.append("  CHECK (categoria = ANY (ARRAY[")
sql_lines.append("    'salud', 'educacion', 'pobreza', 'seguridad', 'inversion',")
sql_lines.append("    'demografia', 'anuario_educacion', 'aprender', 'consumo', 'deis',")
sql_lines.append("    'salud_adolescente', 'encuestas_2024'")
sql_lines.append("  ]));")
sql_lines.append("")

for grp in indicator_groups:
    for ans_val, pct in grp['answers']:
        clean_ans = ans_val.replace("'", "''")
        clean_q = grp['question'].replace("'", "''")
        desglose = json.dumps({
            "tipo_encuesta": grp['survey_type'],
            "respuesta": ans_val,
            "total_respondentes": grp['total']
        }).replace("'", "''")

        sql_lines.append(
            f"INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)"
        )
        sql_lines.append(
            f"VALUES ('{clean_q} - {clean_ans}', 'encuestas_2024', {pct}, '%', 2024, 'Cordoba',"
        )
        sql_lines.append(
            f"  '{desglose}'::jsonb,"
        )
        sql_lines.append(
            f"  'Encuesta Bienestar 2024 - DDNA', true);"
        )
    sql_lines.append("")

output_path = r'C:\Users\20409409009\Desktop\ddna-dashboard\scripts\encuestas_2024_load.sql'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"SQL guardado en: {output_path}")
wb.close()
