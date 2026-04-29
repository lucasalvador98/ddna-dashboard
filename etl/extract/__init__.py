"""Módulo de extracción de datos para el ETL DDNA."""
from .read_excel import read_excel, _import_pandas


def find_data_files(category: str, data_files_map) -> list:
    """Return list of existing files for a category."""
    files = data_files_map.get(category, [])
    existing = [f for f in files if f.exists()]
    return existing


def read_excel_file(path: str, sheet_name: str | None = None):
    """Return a dict of sheet name to DataFrame or fallback data."""
    pd = _import_pandas()
    if pd is None:
        # Use fallback
        return read_excel(path)

    try:
        # If a specific sheet is requested, read only that sheet
        if sheet_name:
            df = pd.read_excel(path, sheet_name=sheet_name)
            return {sheet_name: df}
        # Read all sheets from the workbook
        return pd.read_excel(path, sheet_name=None)
    except Exception as e:
        print(f"read_excel_file error: {e}")
        return read_excel(path)


def clean_column_names(df):
    """Placeholder: return df unchanged."""
    return df


__all__ = ['read_excel', 'read_excel_file', 'find_data_files', 'clean_column_names']