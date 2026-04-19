import uuid
from sqlalchemy import Text, Boolean, ForeignKey, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class DrugIndia(Base):
    __tablename__ = "drugs_india"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_name: Mapped[str] = mapped_column(Text, nullable=False)
    generic_name: Mapped[str] = mapped_column(Text, nullable=False)
    salt_composition: Mapped[str | None] = mapped_column(Text)
    manufacturer: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(Text)
    drug_class: Mapped[str | None] = mapped_column(Text)
    cdsco_approved: Mapped[bool] = mapped_column(Boolean, default=True)
    schedule: Mapped[str | None] = mapped_column(Text)

    drug_interactions_as_drug1: Mapped[list["DrugDrugInteraction"]] = relationship(
        "DrugDrugInteraction", foreign_keys="DrugDrugInteraction.drug1_id", back_populates="drug1"
    )
    drug_interactions_as_drug2: Mapped[list["DrugDrugInteraction"]] = relationship(
        "DrugDrugInteraction", foreign_keys="DrugDrugInteraction.drug2_id", back_populates="drug2"
    )
    herb_drug_interactions: Mapped[list["HerbDrugInteraction"]] = relationship(
        "HerbDrugInteraction", back_populates="drug"
    )
    stack_items: Mapped[list["UserStack"]] = relationship("UserStack", back_populates="drug")  # noqa: F821


class DrugDrugInteraction(Base):
    __tablename__ = "drug_drug_interactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    drug1_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drugs_india.id"), nullable=False)
    drug2_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drugs_india.id"), nullable=False)
    severity: Mapped[str] = mapped_column(Text, nullable=False)
    mechanism: Mapped[str | None] = mapped_column(Text)
    clinical_effect: Mapped[str | None] = mapped_column(Text)
    management: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(Text)

    drug1: Mapped["DrugIndia"] = relationship("DrugIndia", foreign_keys=[drug1_id], back_populates="drug_interactions_as_drug1")
    drug2: Mapped["DrugIndia"] = relationship("DrugIndia", foreign_keys=[drug2_id], back_populates="drug_interactions_as_drug2")


class HerbDrugInteraction(Base):
    __tablename__ = "herb_drug_interactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    herb_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("herbs.id"), nullable=False)
    drug_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drugs_india.id"), nullable=False)
    severity: Mapped[str] = mapped_column(Text, nullable=False)
    mechanism: Mapped[str | None] = mapped_column(Text)
    clinical_effect: Mapped[str | None] = mapped_column(Text)
    management: Mapped[str | None] = mapped_column(Text)
    source_pubmed: Mapped[list[str] | None] = mapped_column(ARRAY(Text))

    herb: Mapped["Herb"] = relationship("Herb", back_populates="herb_drug_interactions")  # noqa: F821
    drug: Mapped["DrugIndia"] = relationship("DrugIndia", back_populates="herb_drug_interactions")


class NutrientInteraction(Base):
    __tablename__ = "nutrient_interactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nutrient1: Mapped[str] = mapped_column(Text, nullable=False)
    nutrient2: Mapped[str] = mapped_column(Text, nullable=False)
    interaction_type: Mapped[str | None] = mapped_column(Text)
    effect: Mapped[str | None] = mapped_column(Text)
    management: Mapped[str | None] = mapped_column(Text)
