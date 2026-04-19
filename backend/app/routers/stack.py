from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.services import interaction_engine, claude_service
from app.services.schedule_optimizer import generate_dosing_schedule
from app.schemas.stack import AddStackItem, StackItemResponse
from app.models.user import UserStack, User
from app.models.drug import DrugIndia
from app.models.herb import Herb
import uuid

router = APIRouter(prefix="/stack", tags=["stack"])


@router.post("/user")
async def create_user(language: str = "en", db: AsyncSession = Depends(get_db)):
    """Create an anonymous user and return their ID."""
    user = User(language=language)
    db.add(user)
    await db.flush()
    return {"user_id": str(user.id), "language": user.language}


@router.get("/{user_id}")
async def get_stack(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get all items in user's medication/supplement stack."""
    result = await db.execute(
        select(UserStack).where(UserStack.user_id == uuid.UUID(user_id))
    )
    items = result.scalars().all()

    stack_items = []
    for item in items:
        entry = {
            "id": str(item.id),
            "item_type": item.item_type,
            "custom_name": item.custom_name,
            "added_at": item.added_at.isoformat(),
        }
        if item.drug_id:
            drug_result = await db.execute(select(DrugIndia).where(DrugIndia.id == item.drug_id))
            drug = drug_result.scalar_one_or_none()
            if drug:
                entry["drug"] = {
                    "id": str(drug.id),
                    "brand_name": drug.brand_name,
                    "generic_name": drug.generic_name,
                    "drug_class": drug.drug_class,
                }
        if item.herb_id:
            herb_result = await db.execute(select(Herb).where(Herb.id == item.herb_id))
            herb = herb_result.scalar_one_or_none()
            if herb:
                entry["herb"] = {
                    "id": str(herb.id),
                    "name_en": herb.common_name_en,
                    "name_hi": herb.common_name_hi,
                    "name_kn": herb.common_name_kn,
                    "name_te": herb.common_name_te,
                    "botanical_name": herb.botanical_name,
                }
        stack_items.append(entry)

    return {"user_id": user_id, "stack": stack_items, "count": len(stack_items)}


@router.post("/{user_id}/add")
async def add_to_stack(
    user_id: str,
    item: AddStackItem,
    language: str = "en",
    db: AsyncSession = Depends(get_db),
):
    """Add drug/herb/supplement to user's stack. Returns immediate interaction check."""
    # Validate IDs exist if provided
    if item.drug_id:
        result = await db.execute(select(DrugIndia).where(DrugIndia.id == item.drug_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Drug not found")
    if item.herb_id:
        result = await db.execute(select(Herb).where(Herb.id == item.herb_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Herb not found")

    # Check interactions with existing stack before adding
    new_interactions = await interaction_engine.check_new_item_interactions(
        user_id, item.drug_id, item.herb_id, db
    )

    # Add to stack
    stack_item = UserStack(
        user_id=uuid.UUID(user_id),
        item_type=item.item_type,
        drug_id=item.drug_id,
        herb_id=item.herb_id,
        custom_name=item.custom_name,
    )
    db.add(stack_item)
    await db.flush()

    stack_names = await interaction_engine.get_stack_names(user_id, db)

    interaction_report = None
    if new_interactions:
        interaction_report = await claude_service.generate_interaction_report(
            new_interactions, stack_names, language
        )

    return {
        "added": str(stack_item.id),
        "new_interactions_found": len(new_interactions),
        "interaction_report": interaction_report,
    }


@router.delete("/{user_id}/remove/{item_id}")
async def remove_from_stack(user_id: str, item_id: str, db: AsyncSession = Depends(get_db)):
    """Remove an item from the user's stack."""
    result = await db.execute(
        select(UserStack).where(
            UserStack.id == uuid.UUID(item_id),
            UserStack.user_id == uuid.UUID(user_id),
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Stack item not found")
    await db.delete(item)
    return {"removed": item_id}


@router.get("/{user_id}/interactions")
async def get_interactions(
    user_id: str,
    language: str = "en",
    db: AsyncSession = Depends(get_db),
):
    """Get all interactions in the user's current stack with a full Claude-generated report."""
    interactions = await interaction_engine.get_stack_interactions(user_id, db)
    stack_names = await interaction_engine.get_stack_names(user_id, db)

    if not stack_names:
        return {"message": "Stack is empty", "interactions": [], "report": None}

    report = await claude_service.generate_interaction_report(interactions, stack_names, language)
    schedule = await generate_dosing_schedule(stack_names, interactions, language)

    return {
        "stack_names": stack_names,
        "interactions": interactions,
        "report": report,
        "optimized_schedule": schedule,
    }
