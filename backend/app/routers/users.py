from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.hanzi import HanziCharacter
from app.models.user import User, UserNotebook
from app.schemas.users import NotebookAddRequest, NotebookEntry
from app.security import get_current_user

router = APIRouter(prefix="/api/users/me/notebook", tags=["users"])


@router.get("", response_model=list[NotebookEntry])
async def list_notebook(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[HanziCharacter]:
    result = await session.scalars(
        select(HanziCharacter)
        .join(UserNotebook, UserNotebook.character_id == HanziCharacter.id)
        .where(UserNotebook.user_id == user.id)
        .order_by(UserNotebook.added_at.desc())
    )
    return list(result)


@router.post("", response_model=NotebookEntry, status_code=201)
async def add_to_notebook(
    payload: NotebookAddRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> HanziCharacter:
    character = await session.scalar(
        select(HanziCharacter).where(HanziCharacter.character == payload.character)
    )
    if character is None:
        raise HTTPException(status_code=404, detail="Character metadata not found")

    existing = await session.get(UserNotebook, (user.id, character.id))
    if existing is None:
        session.add(UserNotebook(user_id=user.id, character_id=character.id))
        await session.commit()
    return character


@router.delete("/{character}", status_code=204)
async def remove_from_notebook(
    character: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    character_id = await session.scalar(
        select(HanziCharacter.id).where(HanziCharacter.character == character)
    )
    if character_id is not None:
        await session.execute(
            delete(UserNotebook).where(
                UserNotebook.user_id == user.id,
                UserNotebook.character_id == character_id,
            )
        )
        await session.commit()
    return Response(status_code=204)
