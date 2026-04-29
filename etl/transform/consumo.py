"""
Transformación de datos de consumo (ENCuesta de Consumo Alimentario 2022).
"""
import json
import logging
from typing import Any

import pandas as pd

from etl.extract import read_csv_file, clean_column_names, find_data_files
from etl.config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_consumo() -> list[dict[str, Any]]:
    """Transforma los archivos de consumo."""
    files = find_data_files("consumo", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para consumo")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de consumo: %s", filepath.name)
        try:
            df = read_csv_file(filepath)
        except Exception as exc:
            logger.error("Error leyendo %s: %s", filepath.name, exc)
            continue

        df = clean_column_names(df)
        df = df.dropna(how="all")
        if df.empty:
            continue

        records.extend(_transform_consumo(df, filepath.name))

    return records


def _transform_consumo(df: pd.DataFrame, filename: str) -> list[dict[str, Any]]:
    """Transforma datos de la encuesta de consumo."""
    records: list[dict[str, Any]] = []

    col_map = {
        "CANT_MIEMBROS_HOGAR": "Miembros del hogar",
        "CANT_PERSONAS0A17": "Menores de 18 años",
        "CLIMA_EDUCATIVO": "Clima educativo",
        "J_NIVEL_EDUCATIVO": "Nivel educativo del jefe",
        "EDAD_SEL": "Edad del seleccionado",
    }

    for _, row in df.iterrows():
        for col, label in col_map.items():
            if col in df.columns:
                valor = row.get(col)
                if pd.notna(valor):
                    try:
                        val_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": label,
                        "categoria": "consumo",
                        "valor": val_float,
                        "periodo": "2022",
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "fuente": "Encuesta de Consumo Alimentario",
                            "archivo": filename,
                        }),
                        "unidad": "hab" if "miembros" in label.lower() or "edad" in label.lower() else "casos",
                    })

    return records