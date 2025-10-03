"""Database models and schemas."""

from datetime import datetime

from pydantic import BaseModel


class ItemCreate(BaseModel):
    """Schema for creating an item."""

    name: str
    value: int


class Item(BaseModel):
    """Item model."""

    id: int
    name: str
    value: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

