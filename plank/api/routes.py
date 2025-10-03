"""API routes for items."""

from fastapi import APIRouter, HTTPException
from plank.db.connection import db
from plank.db.models import Item, ItemCreate

router = APIRouter(prefix="/api", tags=["items"])


@router.get("/items", response_model=list[Item])
async def get_items():
    """Get all items."""
    rows = await db.fetch("SELECT * FROM items ORDER BY created_at DESC")
    return [dict(row) for row in rows]


@router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """Get a specific item by ID."""
    row = await db.fetchrow("SELECT * FROM items WHERE id = $1", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return dict(row)


@router.post("/items", response_model=Item, status_code=201)
async def create_item(item: ItemCreate):
    """Create a new item."""
    row = await db.fetchrow(
        """
        INSERT INTO items (name, value)
        VALUES ($1, $2)
        RETURNING *
        """,
        item.name,
        item.value,
    )
    return dict(row)


@router.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemCreate):
    """Update an existing item."""
    row = await db.fetchrow(
        """
        UPDATE items
        SET name = $1, value = $2
        WHERE id = $3
        RETURNING *
        """,
        item.name,
        item.value,
        item_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return dict(row)


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    """Delete an item."""
    result = await db.execute("DELETE FROM items WHERE id = $1", item_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Item not found")

