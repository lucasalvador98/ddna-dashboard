"""
Transformacion de datos de inversion social.
"""
import json
import logging
from pathlib import Path
from typing import Any

import pandas as pd

from etl.extract import read_excel, clean_column_names, find_data_files, read_excel_file
from etl.config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_inversion() -> list[dict[str, Any]]:
    """
    Transforma los archivos de inversion social en registros de datos_indicadores.
    """
    files = find_data_files("inversion", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para inversion")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de inversion: %s", filepath.name)

        try:
            sheets = read_excel_file(filepath)
        except Exception as exc:
            logger.error("Error leyendo %s: %s", filepath.name, exc)
            continue

        for sheet_name, df in sheets.items():
            df = clean_column_names(df)
            df = df.dropna(how="all")

            if df.empty:
                continue

            records.extend(_transform_inversion(df, filepath.name, sheet_name))

    logger.info("Transformacion de inversion completa: %d registros", len(records))
    return records


def _transform_inversion(df, filename, sheet_name):
    """Transforma un DataFrame de inversion social."""
    records = []
    cols = list(df.columns)
    logger.info("Columnas en %s / %s (%d cols)", filename, sheet_name, len(cols))

    # Map columns de Presupuesto/Gestion
    col_map = {}
    for col in cols:
        col_lower = col.lower().strip().replace("ñ", "n").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
        if "año" in col_lower:
            col_map["año"] = col
        elif "programa" in col_lower:
            col_map["programa"] = col
        elif "jurisdiccion" in col_lower:
            col_map["jurisdiccion"] = col
        elif "devengado" in col_lower:
            col_map["devengado"] = col
        elif "pagado" in col_lower:
            col_map["pagado"] = col
        elif "compromiso" in col_lower:
            col_map["compromiso"] = col
        elif "presupuesto vigente" in col_lower:
            col_map["presupuesto"] = col
        elif "ponderador" in col_lower:
            col_map["ponderador"] = col
        elif "categoria" in col_lower:
            col_map["categoria"] = col
        elif "subcategoria" in col_lower:
            col_map["subcategoria"] = col

    año_col = col_map.get("año")
    prog_col = col_map.get("programa")
    jur_col = col_map.get("jurisdiccion")
    dev_col = col_map.get("devengado")
    pag_col = col_map.get("pagado")
    cat_col = col_map.get("categoria")
    subcat_col = col_map.get("subcategoria")

    # Si tenemos columnas, procesar
    if dev_col or pag_col:
        for _, row in df.iterrows():
            if row.isna().all():
                continue

            año = str(int(row[año_col])) if año_col and pd.notna(row[año_col]) else "2024"
            programa = str(row[prog_col]) if prog_col and pd.notna(row[prog_col]) else "Sin programa"
            jurisdiccion = str(row[jur_col]) if jur_col and pd.notna(row[jur_col]) else "Córdoba"

            devengado = _extract_number(row[dev_col]) if dev_col and pd.notna(row[dev_col]) else 0
            pagado = _extract_number(row[pag_col]) if pag_col and pd.notna(row[pag_col]) else 0

            # Solo guardar si tienen valores > 0
            if devengado is None and pagado is None:
                continue
            valor = devengado if devengado else pagado
            if valor == 0:
                continue

            desglose = {
                "programa": programa[:100],
                "jurisdiccion": jurisdiccion[:100],
            }
            if cat_col and pd.notna(row[cat_col]):
                desglose["categoria"] = str(row[cat_col])[:50]
            if subcat_col and pd.notna(row[subcat_col]):
                desglose["subcategoria"] = str(row[subcat_col])[:50]

            records.append({
                "indicador_nombre": "Inversion social en infancia",
                "categoria": "inversion",
                "valor": valor,
                "periodo": año,
                #region": "Córdoba",  # Usamos jurisdiccion como region
                "region": jurisdiccion[:50] if jurisdiccion else "Córdoba",
                "unidad": "Md",
                "desglose": json.dumps(desglose),
            })

    logger.info(" Transformados %d registros de inversion", len(records))
    return records


def _extract_number(val):
    """Extrae un numero de various formatos."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None

    if isinstance(val, (int, float)):
        return float(val)

    val_str = str(val).strip()
    val_str = val_str.replace("$", "").replace(".", "").replace(",", ".").replace(" ", "")

    try:
        return float(val_str)
    except ValueError:
        return None