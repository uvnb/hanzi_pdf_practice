from pydantic import BaseModel

from app.schemas.hanzi import HanziSummary


class NotebookAddRequest(BaseModel):
    character: str


class NotebookEntry(HanziSummary):
    pass
