"""
Lector genérico de archivos Excel/XLS para el ETL DDNA.

Soporta .xlsx (openpyxl) y .xls (xlrd), con detección
automática de hojas y manejo de errores de encoding.
"""
import logging
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)


def detect_engine(filepath: Path) -> str:
    """Detecta el motor de lectura según la extensión del archivo."""
    ext = filepath.suffix.lower()
    if ext == ".xlsx":
        return "openpyxl"
    if ext == ".xls":
        return "xlrd"
    raise ValueError(f"Extensión no soportada: {ext}")


def read_excel_file(
    filepath: Path,
    sheet_name: str | int | None = None,
    header: int = 0,
    **kwargs: Any,
) -> dict[str, pd.DataFrame]:
    """
    Lee un archivo Excel y retorna un diccionario {nombre_hoja: DataFrame}.

    Si sheet_name es None, lee todas las hojas.
    Si sheet_name es un string o entero, lee solo esa hoja.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {filepath}")

    engine = detect_engine(filepath)
    logger.info("Leyendo %s con motor %s", filepath.name, engine)

    try:
        if sheet_name is not None:
            df = pd.read_excel(
                filepath,
                sheet_name=sheet_name,
                engine=engine,
                header=header,
                **kwargs,
            )
            # Si sheet_name es string, retorna solo esa hoja
            if isinstance(sheet_name, str):
                sheet_label = sheet_name
            elif isinstance(sheet_name, int):
                xl = pd.ExcelFile(filepath, engine=engine)
                sheet_label = xl.sheet_names[sheet_name]
                xl.close()
            else:
                sheet_label = str(sheet_name)
            return {sheet_label: df}

        # Leer todas las hojas
        all_sheets: dict[str, pd.DataFrame] = pd.read_excel(
            filepath,
            sheet_name=None,
            engine=engine,
            header=header,
            **kwargs,
        )
        logger.info(
            "Leídas %d hojas de %s: %s",
            len(all_sheets),
            filepath.name,
            list(all_sheets.keys()),
        )
        return all_sheets

    except Exception as exc:
        logger.error("Error leyendo %s: %s", filepath.name, exc)
        raise


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia nombres de columnas: strip, lowercase, reemplaza espacios por guiones bajos.
    """
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(r"\s+", "_", regex=True)
        .str.replace(r"[^a-z0-9_]", "", regex=True)
        .str.strip("_")
    )
    # Eliminar columnas sin nombre (Unnamed)
    df = df.loc[:, df.columns != ""]
    return df


def inspect_file(filepath: Path) -> dict[str, Any]:
    """
    Inspecciona un archivo Excel y retorna su estructura.

    Retorna: {
        "file": str,
        "sheets": [{"name": str, "columns": list[str], "dtypes": dict, "rows": int, "preview": list[dict]}]
    }
    """
    if not filepath.exists():
        return {"file": str(filepath), "error": "Archivo no encontrado"}

    engine = detect_engine(filepath)
    result: dict[str, Any] = {"file": str(filepath), "sheets": []}

    try:
        xl = pd.ExcelFile(filepath, engine=engine)
        for sheet_name in xl.sheet_names:
            df = pd.read_excel(filepath, sheet_name=sheet_name, engine=engine)
            df = clean_column_names(df)

            # Filtrar filas completamente vacías
            df = df.dropna(how="all")

            sheet_info: dict[str, Any] = {
                "name": sheet_name,
                "columns": list(df.columns),
                "dtypes": {col: str(dt) for col, dt in df.dtypes.items()},
                "rows": len(df),
                "preview": df.head(5).to_dict(orient="records"),
            }
            result["sheets"].append(sheet_info)
        xl.close()
    except Exception as exc:
        result["error"] = str(exc)

    return result


def find_data_files(category: str, data_files_map: dict[str, list[Path]]) -> list[Path]:
    """Retorna la lista de archivos de datos existentes para una categoría."""
    files = data_files_map.get(category, [])
    existing = [f for f in files if f.exists()]
    if len(existing) < len(files):
        missing = [f for f in files if not f.exists()]
        logger.warning("Archivos no encontrados para %s: %s", category, missing)
    return existing