from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db


async def get_context(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    return {"request": request, "db": db}
