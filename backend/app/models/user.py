import uuid
from datetime import datetime
from sqlalchemy import Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    language: Mapped[str] = mapped_column(Text, default="en")
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    stack: Mapped[list["UserStack"]] = relationship("UserStack", back_populates="user")
    scans: Mapped[list["Scan"]] = relationship("Scan", back_populates="user")  # noqa: F821


class UserStack(Base):
    __tablename__ = "user_stack"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    item_type: Mapped[str] = mapped_column(Text, nullable=False)
    drug_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("drugs_india.id"))
    herb_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("herbs.id"))
    custom_name: Mapped[str | None] = mapped_column(Text)
    added_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="stack")
    drug: Mapped["DrugIndia | None"] = relationship("DrugIndia", back_populates="stack_items")  # noqa: F821
    herb: Mapped["Herb | None"] = relationship("Herb", back_populates="stack_items")  # noqa: F821
