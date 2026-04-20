"""Módulo de extracción de datos para el ETL DDNA."""
from .read_excel import read_excel

def clean_column_names(df):
    """Placeholder: return df unchanged."""
    return df

def find_data_files(category, data_files):
    """Return list of existing files for a category."""
    files = data_files.get(category, [])
    existing = [f for f in files if f.exists()]
    return existing

def read_excel_file(path: str):
    """Return a dict of sheet name to DataFrame or fallback data."""
    result = read_excel(path)
    if isinstance(result, dict):
        return result
    return {"Sheet1": result}