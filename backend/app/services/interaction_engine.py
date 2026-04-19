import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.drug import DrugDrugInteraction, HerbDrugInteraction, NutrientInteraction
from app.models.user import UserStack
from app.models.drug import DrugIndia
from app.models.herb import Herb

SEVERITY_RANK = {"major": 3, "moderate": 2, "minor": 1}


async def get_stack_interactions(user_id: str, db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(UserStack).where(UserStack.user_id == uuid.UUID(user_id))
    )
    items = result.scalars().all()

    drug_ids = [i.drug_id for i in items if i.drug_id]
    herb_ids = [i.herb_id for i in items if i.herb_id]

    interactions: list[dict] = []

    # Drug-drug interactions
    if len(drug_ids) > 1:
        result = await db.execute(
            select(DrugDrugInteraction).where(
                or_(
                    DrugDrugInteraction.drug1_id.in_(drug_ids),
                    DrugDrugInteraction.drug2_id.in_(drug_ids),
                )
            )
        )
        for row in result.scalars():
            if row.drug1_id in drug_ids and row.drug2_id in drug_ids:
                interactions.append({
                    "type": "drug_drug",
                    "severity": row.severity,
                    "clinical_effect": row.clinical_effect,
                    "mechanism": row.mechanism,
                    "management": row.management,
                    "drug1_id": str(row.drug1_id),
                    "drug2_id": str(row.drug2_id),
                })

    # Herb-drug interactions
    if herb_ids and drug_ids:
        result = await db.execute(
            select(HerbDrugInteraction).where(
                HerbDrugInteraction.herb_id.in_(herb_ids),
                HerbDrugInteraction.drug_id.in_(drug_ids),
            )
        )
        for row in result.scalars():
            interactions.append({
                "type": "herb_drug",
                "severity": row.severity,
                "clinical_effect": row.clinical_effect,
                "mechanism": row.mechanism,
                "management": row.management,
                "herb_id": str(row.herb_id),
                "drug_id": str(row.drug_id),
            })

    return sorted(interactions, key=lambda x: SEVERITY_RANK.get(x["severity"], 0), reverse=True)


async def get_stack_names(user_id: str, db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(UserStack).where(UserStack.user_id == uuid.UUID(user_id))
    )
    items = result.scalars().all()
    names: list[str] = []

    for item in items:
        if item.custom_name:
            names.append(item.custom_name)
        elif item.drug_id:
            drug_result = await db.execute(select(DrugIndia).where(DrugIndia.id == item.drug_id))
            drug = drug_result.scalar_one_or_none()
            if drug:
                names.append(f"{drug.brand_name} ({drug.generic_name})")
        elif item.herb_id:
            herb_result = await db.execute(select(Herb).where(Herb.id == item.herb_id))
            herb = herb_result.scalar_one_or_none()
            if herb:
                names.append(herb.common_name_en)

    return names


async def check_new_item_interactions(
    user_id: str,
    new_drug_id: uuid.UUID | None,
    new_herb_id: uuid.UUID | None,
    db: AsyncSession,
) -> list[dict]:
    """Check interactions when user adds a new item to their stack."""
    result = await db.execute(
        select(UserStack).where(UserStack.user_id == uuid.UUID(user_id))
    )
    items = result.scalars().all()
    existing_drug_ids = [i.drug_id for i in items if i.drug_id]
    existing_herb_ids = [i.herb_id for i in items if i.herb_id]

    interactions: list[dict] = []

    if new_drug_id and existing_drug_ids:
        result = await db.execute(
            select(DrugDrugInteraction).where(
                or_(
                    (DrugDrugInteraction.drug1_id == new_drug_id) & DrugDrugInteraction.drug2_id.in_(existing_drug_ids),
                    (DrugDrugInteraction.drug2_id == new_drug_id) & DrugDrugInteraction.drug1_id.in_(existing_drug_ids),
                )
            )
        )
        for row in result.scalars():
            interactions.append({
                "type": "drug_drug",
                "severity": row.severity,
                "clinical_effect": row.clinical_effect,
                "mechanism": row.mechanism,
                "management": row.management,
            })

    if new_drug_id and existing_herb_ids:
        result = await db.execute(
            select(HerbDrugInteraction).where(
                HerbDrugInteraction.drug_id == new_drug_id,
                HerbDrugInteraction.herb_id.in_(existing_herb_ids),
            )
        )
        for row in result.scalars():
            interactions.append({
                "type": "herb_drug",
                "severity": row.severity,
                "clinical_effect": row.clinical_effect,
                "mechanism": row.mechanism,
                "management": row.management,
            })

    if new_herb_id and existing_drug_ids:
        result = await db.execute(
            select(HerbDrugInteraction).where(
                HerbDrugInteraction.herb_id == new_herb_id,
                HerbDrugInteraction.drug_id.in_(existing_drug_ids),
            )
        )
        for row in result.scalars():
            interactions.append({
                "type": "herb_drug",
                "severity": row.severity,
                "clinical_effect": row.clinical_effect,
                "mechanism": row.mechanism,
                "management": row.management,
            })

    return sorted(interactions, key=lambda x: SEVERITY_RANK.get(x["severity"], 0), reverse=True)
