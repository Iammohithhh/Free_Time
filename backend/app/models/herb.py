import uuid
from sqlalchemy import Text, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Herb(Base):
    __tablename__ = "herbs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    common_name_en: Mapped[str] = mapped_column(Text, nullable=False)
    common_name_hi: Mapped[str | None] = mapped_column(Text)
    common_name_kn: Mapped[str | None] = mapped_column(Text)
    common_name_te: Mapped[str | None] = mapped_column(Text)
    sanskrit_name: Mapped[str | None] = mapped_column(Text)
    botanical_name: Mapped[str | None] = mapped_column(Text)
    active_compounds: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    traditional_use: Mapped[str | None] = mapped_column(Text)

    herb_drug_interactions: Mapped[list["HerbDrugInteraction"]] = relationship(  # noqa: F821
        "HerbDrugInteraction", back_populates="herb"
    )
    stack_items: Mapped[list["UserStack"]] = relationship("UserStack", back_populates="herb")  # noqa: F821
