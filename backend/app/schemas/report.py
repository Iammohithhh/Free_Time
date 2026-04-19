from pydantic import BaseModel
import uuid


class ChemicalResponse(BaseModel):
    id: uuid.UUID
    name: str
    cas_number: str | None
    pubchem_cid: int | None
    iupac_name: str | None
    synonyms: list[str] | None

    class Config:
        from_attributes = True


class DrugResponse(BaseModel):
    id: uuid.UUID
    brand_name: str
    generic_name: str
    salt_composition: str | None
    manufacturer: str | None
    category: str | None
    drug_class: str | None
    schedule: str | None

    class Config:
        from_attributes = True


class HerbResponse(BaseModel):
    id: uuid.UUID
    common_name_en: str
    common_name_hi: str | None
    common_name_kn: str | None
    common_name_te: str | None
    botanical_name: str | None
    active_compounds: list[str] | None
    traditional_use: str | None

    class Config:
        from_attributes = True
