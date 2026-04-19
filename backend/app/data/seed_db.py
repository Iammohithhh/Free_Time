"""
Run this script once after creating the database to seed herbs and interactions.
Usage: python -m app.data.seed_db
"""
import asyncio
import json
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

DATA_DIR = Path(__file__).parent


async def seed(db_url: str):
    engine = create_async_engine(db_url)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    # Import models after engine is created
    from app.models.herb import Herb
    from app.models.drug import DrugIndia, HerbDrugInteraction, NutrientInteraction
    from app.database import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with Session() as session:
        # Seed herbs
        herbs_data = json.loads((DATA_DIR / "herbs_seed.json").read_text())
        herb_map: dict[str, Herb] = {}

        for h in herbs_data:
            existing = await session.execute(
                select(Herb).where(Herb.common_name_en == h["common_name_en"])
            )
            if existing.scalar_one_or_none():
                print(f"  Herb already exists: {h['common_name_en']}")
                result = await session.execute(select(Herb).where(Herb.common_name_en == h["common_name_en"]))
                herb_map[h["common_name_en"]] = result.scalar_one()
                continue

            herb = Herb(
                common_name_en=h["common_name_en"],
                common_name_hi=h.get("common_name_hi"),
                common_name_kn=h.get("common_name_kn"),
                common_name_te=h.get("common_name_te"),
                sanskrit_name=h.get("sanskrit_name"),
                botanical_name=h.get("botanical_name"),
                active_compounds=h.get("active_compounds"),
                traditional_use=h.get("traditional_use"),
            )
            session.add(herb)
            await session.flush()
            herb_map[h["common_name_en"]] = herb
            print(f"  Seeded herb: {herb.common_name_en}")

        await session.commit()
        print(f"Herbs seeded: {len(herb_map)}")

        # Seed nutrient interactions
        nutrient_data = json.loads((DATA_DIR / "nutrient_interactions.json").read_text())
        for ni in nutrient_data:
            existing = await session.execute(
                select(NutrientInteraction).where(
                    NutrientInteraction.nutrient1 == ni["nutrient1"],
                    NutrientInteraction.nutrient2 == ni["nutrient2"],
                )
            )
            if existing.scalar_one_or_none():
                continue
            nutrient = NutrientInteraction(
                nutrient1=ni["nutrient1"],
                nutrient2=ni["nutrient2"],
                interaction_type=ni.get("interaction_type"),
                effect=ni.get("effect"),
                management=ni.get("management"),
            )
            session.add(nutrient)

        await session.commit()
        print("Nutrient interactions seeded")

        # Seed herb-drug interactions
        # First create placeholder drugs so FK is valid
        hdi_data = json.loads((DATA_DIR / "herb_drug_interactions.json").read_text())
        for herb_entry in hdi_data:
            herb_name = herb_entry["herb"]
            # Match by common_name_en (may have notes after comma)
            herb = None
            for key, h in herb_map.items():
                if herb_name.split("(")[0].strip().lower() in key.lower() or key.lower() in herb_name.lower():
                    herb = h
                    break

            if not herb:
                print(f"  WARNING: Herb not found in map: {herb_name}")
                continue

            for interaction in herb_entry["interactions"]:
                # Create/find drug entries for each generic drug name
                for drug_name in interaction.get("drug_generic_names", []):
                    existing_drug = await session.execute(
                        select(DrugIndia).where(DrugIndia.generic_name == drug_name)
                    )
                    drug = existing_drug.scalar_one_or_none()
                    if not drug:
                        drug = DrugIndia(
                            brand_name=drug_name.title(),
                            generic_name=drug_name,
                            drug_class=interaction.get("drug_class"),
                            category="prescription",
                        )
                        session.add(drug)
                        await session.flush()

                    # Check if interaction already exists
                    existing_hdi = await session.execute(
                        select(HerbDrugInteraction).where(
                            HerbDrugInteraction.herb_id == herb.id,
                            HerbDrugInteraction.drug_id == drug.id,
                        )
                    )
                    if existing_hdi.scalar_one_or_none():
                        continue

                    hdi = HerbDrugInteraction(
                        herb_id=herb.id,
                        drug_id=drug.id,
                        severity=interaction["severity"],
                        mechanism=interaction.get("mechanism"),
                        clinical_effect=interaction.get("clinical_effect"),
                        management=interaction.get("management"),
                        source_pubmed=interaction.get("source_pubmed", []),
                    )
                    session.add(hdi)

        await session.commit()
        print("Herb-drug interactions seeded")
        print("Database seeding complete!")

    await engine.dispose()


if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/veda")
    asyncio.run(seed(db_url))
