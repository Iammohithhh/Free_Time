import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, BigInteger, ARRAY, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Chemical(Base):
    __tablename__ = "chemicals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    cas_number: Mapped[str | None] = mapped_column(Text, unique=True)
    pubchem_cid: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    iupac_name: Mapped[str | None] = mapped_column(Text)
    synonyms: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    hazards: Mapped[list["ChemicalHazard"]] = relationship("ChemicalHazard", back_populates="chemical")


class ChemicalHazard(Base):
    __tablename__ = "chemical_hazards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chemical_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    hazard_type: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(Text, nullable=False)
    mechanism: Mapped[str | None] = mapped_column(Text)
    evidence_level: Mapped[str | None] = mapped_column(Text)
    iarc_class: Mapped[str | None] = mapped_column(Text)
    prop65_listed: Mapped[bool] = mapped_column(Boolean, default=False)
    eu_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    india_fssai_status: Mapped[str | None] = mapped_column(Text)
    source_refs: Mapped[list[str] | None] = mapped_column(ARRAY(Text))

    chemical: Mapped["Chemical"] = relationship("Chemical", back_populates="hazards")
