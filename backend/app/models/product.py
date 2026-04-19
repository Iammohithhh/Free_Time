import uuid
from datetime import datetime
from sqlalchemy import Text, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barcode: Mapped[str | None] = mapped_column(Text, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    brand: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(Text)
    raw_ingredient_text: Mapped[str | None] = mapped_column(Text)
    country_of_origin: Mapped[str] = mapped_column(Text, default="IN")
    last_updated: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    ingredients: Mapped[list["ProductIngredient"]] = relationship("ProductIngredient", back_populates="product")


class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), primary_key=True)
    chemical_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chemicals.id"), primary_key=True)
    position: Mapped[int | None] = mapped_column(Integer)

    product: Mapped["Product"] = relationship("Product", back_populates="ingredients")
    chemical: Mapped["Chemical"] = relationship("Chemical")  # noqa: F821
