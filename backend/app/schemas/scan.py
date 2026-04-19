from pydantic import BaseModel
from typing import Any
import uuid
from datetime import datetime


class ScanResponse(BaseModel):
    id: uuid.UUID
    scan_type: str
    language_used: str | None
    result_json: dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True


class IngredientSafetyItem(BaseModel):
    name: str
    status: str
    concern: str | None = None
    regulatory: str | None = None


class ToxicologyReport(BaseModel):
    overall_score: str
    summary: str
    ingredients: list[IngredientSafetyItem]


class LabelScanResponse(BaseModel):
    product_name: str | None
    brand: str | None
    report: ToxicologyReport


class BarcodeScanResponse(BaseModel):
    product: dict[str, Any]
    report: ToxicologyReport


class PillIdentification(BaseModel):
    imprint: str | None = None
    color: str
    shape: str
    possible_medications: list[str]
    confidence: str
    note: str


class PillScanResponse(BaseModel):
    identification: PillIdentification


class TextScanResponse(BaseModel):
    report: ToxicologyReport
