from pydantic import BaseModel
import uuid
from datetime import datetime


class AddStackItem(BaseModel):
    item_type: str
    drug_id: uuid.UUID | None = None
    herb_id: uuid.UUID | None = None
    custom_name: str | None = None


class StackItemResponse(BaseModel):
    id: uuid.UUID
    item_type: str
    drug_id: uuid.UUID | None
    herb_id: uuid.UUID | None
    custom_name: str | None
    added_at: datetime

    class Config:
        from_attributes = True


class InteractionAlert(BaseModel):
    severity: str
    items_involved: list[str]
    what_happens: str
    what_to_do: str


class InteractionReport(BaseModel):
    risk_level: str
    summary: str
    alerts: list[InteractionAlert]
    schedule: str | None = None


class StackInteractionsResponse(BaseModel):
    interactions: list[dict]
    report: InteractionReport
