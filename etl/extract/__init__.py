"""Módulo de extracción de datos para el ETL DDNA."""
from .read_excel import read_excel

def find_data_files(category: str, data_files_map) -> list:
    """Return list of existing files for a category."""
    files = data_files_map.get(category, [])
    existing = [f for f in files if f.exists()]
    return existing

def clean_column_names(df):
    """Placeholder: return df unchanged."""
    return df

def read_excel_file(path):
    """Read Excel file and return dict of sheet -> DataFrame."""
    result = read_excel(path)
    if isinstance(result, dict):
        return result
    return {"Sheet1": result}

__all__ = ['read_excel', 'read_excel_file', 'find_data_files', 'clean_column_names']