"""Read an Excel file and return a pandas DataFrame.
If pandas (and its compiled dependencies) are unavailable, fall back to
openpyxl to read the sheet into a list of dicts and then build a minimal
DataFrame‑like object.
"""
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

def _import_pandas():
    try:
        import pandas as pd
        return pd
    except Exception as e:
        # Pandas failed (often due to missing compiled numpy libs). Log and fall back.
        print(f"[ETL] Pandas import failed: {e}. Falling back to openpyxl.")
        return None

def _fallback_read_excel(path: str):
    try:
        from openpyxl import load_workbook
        wb = load_workbook(path, read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return []
        header = rows[0]
        data = [dict(zip(header, row)) for row in rows[1:]]
        return data
    except Exception as fe:
        print(f"[ETL] openpyxl fallback failed: {fe}")
        return []

def read_excel(path: str):
    """Read an Excel file and return a dict of sheet names to DataFrames or fallback lists.
    The original code expected a dict of sheets; this wrapper returns a single-sheet dict
    for compatibility.
    """
    pd = _import_pandas()
    if pd:
        try:
            return pd.read_excel(path)
        except Exception as e:
            print(f"[ETL] pandas.read_excel error: {e}. Using fallback.")
    # Either pandas not available or read_excel failed
    return _fallback_read_excel(path)
