from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models.chemical import Chemical, ChemicalHazard
from app.services import pubchem_service, claude_service

router = APIRouter(prefix="/chemical", tags=["chemical"])


@router.get("/search/{name}")
async def search_chemical(name: str, language: str = "en", db: AsyncSession = Depends(get_db)):
    """Search chemical by name — checks DB first, then PubChem, then Claude explains it."""
    # Check local DB
    result = await db.execute(
        select(Chemical).where(
            or_(
                Chemical.name.ilike(f"%{name}%"),
                Chemical.synonyms.any(name.lower()),
            )
        )
    )
    chemical = result.scalar_one_or_none()

    if chemical:
        hazard_result = await db.execute(
            select(ChemicalHazard).where(ChemicalHazard.chemical_id == chemical.id)
        )
        hazards = hazard_result.scalars().all()
        return {
            "source": "local_db",
            "chemical": {
                "id": str(chemical.id),
                "name": chemical.name,
                "cas_number": chemical.cas_number,
                "pubchem_cid": chemical.pubchem_cid,
                "iupac_name": chemical.iupac_name,
            },
            "hazards": [
                {
                    "type": h.hazard_type,
                    "severity": h.severity,
                    "mechanism": h.mechanism,
                    "iarc_class": h.iarc_class,
                    "prop65_listed": h.prop65_listed,
                    "eu_banned": h.eu_banned,
                }
                for h in hazards
            ],
        }

    # Fallback to PubChem + Claude
    pubchem_data = await pubchem_service.get_chemical_safety(name)
    explanation = await claude_service.explain_ingredient(name, language)

    return {
        "source": "pubchem_claude",
        "pubchem": pubchem_data,
        "explanation": explanation,
    }
