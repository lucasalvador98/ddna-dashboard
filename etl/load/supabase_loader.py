"""
Cargador directo a Supabase vía API REST.

NOTA: Requiere SUPABASE_SERVICE_ROLE_KEY para escritura.
Sin la clave, se puede generar SQL para ejecutar manualmente.
"""
import json
import logging
from typing import Any

import httpx

from config import SUPABASE_URL, SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

BATCH_SIZE = 100


class SupabaseLoader:
    """Cargador de datos a Supabase vía API REST."""

    def __init__(
        self,
        url: str = SUPABASE_URL,
        service_role_key: str = SERVICE_ROLE_KEY,
    ) -> None:
        self.url = url.rstrip("/")
        self.service_role_key = service_role_key
        if not self.service_role_key:
            logger.warning(
                "SUPABASE_SERVICE_ROLE_KEY no configurada. "
                "Las operaciones de escritura no estarán disponibles. "
                "Use --method sql en su lugar."
            )

    @property
    def headers(self) -> dict[str, str]:
        return {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation,resolution=merge-duplicates",
        }

    def _check_key(self) -> None:
        """Verifica que la service role key esté configurada."""
        if not self.service_role_key:
            raise ValueError(
                "SUPABASE_SERVICE_ROLE_KEY no configurada. "
                "Establezca la variable de entorno o use --method sql."
            )

    def insert_indicadores(self, indicadores: list[dict[str, Any]]) -> int:
        """Inserta indicadores en lotes. Retorna la cantidad insertada."""
        self._check_key()
        inserted = 0

        for i in range(0, len(indicadores), BATCH_SIZE):
            batch = indicadores[i : i + BATCH_SIZE]
            response = httpx.post(
                f"{self.url}/rest/v1/indicadores",
                headers=self.headers,
                json=batch,
                timeout=30.0,
            )
            if response.status_code in (200, 201):
                inserted += len(batch)
                logger.info("Insertados %d indicadores (lote %d)", len(batch), i // BATCH_SIZE + 1)
            else:
                logger.error(
                    "Error insertando indicadores (lote %d): %s %s",
                    i // BATCH_SIZE + 1,
                    response.status_code,
                    response.text,
                )

        return inserted

    def insert_datos(self, datos: list[dict[str, Any]]) -> int:
        """Inserta datos de indicadores en lotes. Retorna la cantidad insertada."""
        self._check_key()
        inserted = 0

        for i in range(0, len(datos), BATCH_SIZE):
            batch = datos[i : i + BATCH_SIZE]
            response = httpx.post(
                f"{self.url}/rest/v1/datos_indicadores",
                headers=self.headers,
                json=batch,
                timeout=30.0,
            )
            if response.status_code in (200, 201):
                inserted += len(batch)
                logger.info("Insertados %d datos (lote %d)", len(batch), i // BATCH_SIZE + 1)
            else:
                logger.error(
                    "Error insertando datos (lote %d): %s %s",
                    i // BATCH_SIZE + 1,
                    response.status_code,
                    response.text,
                )

        return inserted

    def get_indicadores(self) -> list[dict[str, Any]]:
        """Obtiene todos los indicadores existentes."""
        self._check_key()
        response = httpx.get(
            f"{self.url}/rest/v1/indicadores?select=id,nombre,categoria,unidad",
            headers=self.headers,
            timeout=30.0,
        )
        if response.status_code == 200:
            return response.json()
        logger.error("Error obteniendo indicadores: %s %s", response.status_code, response.text)
        return []

    def dry_run(self, records: list[dict[str, Any]], table: str = "datos_indicadores") -> dict[str, Any]:
        """
        Modo dry-run: valida los datos sin insertar.
        Retorna un resumen de lo que se insertaría.
        """
        return {
            "table": table,
            "total_records": len(records),
            "batch_size": BATCH_SIZE,
            "batches": (len(records) + BATCH_SIZE - 1) // BATCH_SIZE,
            "sample": records[:3] if records else [],
            "categories": list(set(r.get("categoria", "unknown") for r in records)),
            "periods": sorted(set(r.get("periodo", "unknown") for r in records)),
        }