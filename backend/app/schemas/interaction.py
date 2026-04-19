from pydantic import BaseModel
import uuid


class DrugDrugInteractionResponse(BaseModel):
    id: uuid.UUID
    drug1_id: uuid.UUID
    drug2_id: uuid.UUID
    severity: str
    mechanism: str | None
    clinical_effect: str | None
    management: str | None

    class Config:
        from_attributes = True


class HerbDrugInteractionResponse(BaseModel):
    id: uuid.UUID
    herb_id: uuid.UUID
    drug_id: uuid.UUID
    severity: str
    mechanism: str | None
    clinical_effect: str | None
    management: str | None

    class Config:
        from_attributes = True
