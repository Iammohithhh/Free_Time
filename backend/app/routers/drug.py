from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models.drug import DrugIndia, HerbDrugInteraction
from app.models.herb import Herb
from app.services import claude_service

router = APIRouter(tags=["drug_herb"])


@router.get("/drug/search")
async def search_drug(q: str = Query(..., min_length=2), db: AsyncSession = Depends(get_db)):
    """Search drugs by brand name or generic name."""
    result = await db.execute(
        select(DrugIndia).where(
            or_(
                DrugIndia.brand_name.ilike(f"%{q}%"),
                DrugIndia.generic_name.ilike(f"%{q}%"),
                DrugIndia.salt_composition.ilike(f"%{q}%"),
            )
        ).limit(20)
    )
    drugs = result.scalars().all()
    return {
        "results": [
            {
                "id": str(d.id),
                "brand_name": d.brand_name,
                "generic_name": d.generic_name,
                "salt_composition": d.salt_composition,
                "drug_class": d.drug_class,
                "category": d.category,
                "schedule": d.schedule,
                "manufacturer": d.manufacturer,
            }
            for d in drugs
        ]
    }


@router.get("/drug/{drug_id}")
async def get_drug(drug_id: str, language: str = "en", db: AsyncSession = Depends(get_db)):
    """Get drug details including its known interactions."""
    import uuid
    result = await db.execute(select(DrugIndia).where(DrugIndia.id == uuid.UUID(drug_id)))
    drug = result.scalar_one_or_none()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    # Fetch herb-drug interactions for this drug
    hdi_result = await db.execute(
        select(HerbDrugInteraction).where(HerbDrugInteraction.drug_id == drug.id)
    )
    herb_interactions = hdi_result.scalars().all()

    return {
        "drug": {
            "id": str(drug.id),
            "brand_name": drug.brand_name,
            "generic_name": drug.generic_name,
            "salt_composition": drug.salt_composition,
            "drug_class": drug.drug_class,
            "category": drug.category,
            "schedule": drug.schedule,
            "manufacturer": drug.manufacturer,
            "cdsco_approved": drug.cdsco_approved,
        },
        "herb_interactions": [
            {
                "herb_id": str(h.herb_id),
                "severity": h.severity,
                "clinical_effect": h.clinical_effect,
                "mechanism": h.mechanism,
                "management": h.management,
            }
            for h in herb_interactions
        ],
    }


@router.get("/herb/search")
async def search_herb(q: str = Query(..., min_length=2), db: AsyncSession = Depends(get_db)):
    """Search herbs by any name (English, Hindi, Kannada, Telugu, botanical)."""
    result = await db.execute(
        select(Herb).where(
            or_(
                Herb.common_name_en.ilike(f"%{q}%"),
                Herb.common_name_hi.ilike(f"%{q}%"),
                Herb.common_name_kn.ilike(f"%{q}%"),
                Herb.common_name_te.ilike(f"%{q}%"),
                Herb.sanskrit_name.ilike(f"%{q}%"),
                Herb.botanical_name.ilike(f"%{q}%"),
            )
        ).limit(20)
    )
    herbs = result.scalars().all()
    return {
        "results": [
            {
                "id": str(h.id),
                "common_name_en": h.common_name_en,
                "common_name_hi": h.common_name_hi,
                "common_name_kn": h.common_name_kn,
                "common_name_te": h.common_name_te,
                "botanical_name": h.botanical_name,
                "active_compounds": h.active_compounds,
            }
            for h in herbs
        ]
    }


@router.get("/herb/{herb_id}")
async def get_herb(herb_id: str, language: str = "en", db: AsyncSession = Depends(get_db)):
    """Get herb details including known drug interactions."""
    import uuid
    result = await db.execute(select(Herb).where(Herb.id == uuid.UUID(herb_id)))
    herb = result.scalar_one_or_none()
    if not herb:
        raise HTTPException(status_code=404, detail="Herb not found")

    hdi_result = await db.execute(
        select(HerbDrugInteraction).where(HerbDrugInteraction.herb_id == herb.id)
    )
    interactions = hdi_result.scalars().all()

    return {
        "herb": {
            "id": str(herb.id),
            "common_name_en": herb.common_name_en,
            "common_name_hi": herb.common_name_hi,
            "common_name_kn": herb.common_name_kn,
            "common_name_te": herb.common_name_te,
            "sanskrit_name": herb.sanskrit_name,
            "botanical_name": herb.botanical_name,
            "active_compounds": herb.active_compounds,
            "traditional_use": herb.traditional_use,
        },
        "drug_interactions": [
            {
                "drug_id": str(i.drug_id),
                "severity": i.severity,
                "clinical_effect": i.clinical_effect,
                "mechanism": i.mechanism,
                "management": i.management,
            }
            for i in interactions
        ],
    }
