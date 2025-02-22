from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ResearchRequest(BaseModel):
    query: str
    breadth: Optional[int] = 4
    depth: Optional[int] = 2

class ResearchResponse(BaseModel):
    id: str
    query: str
    breadth: int
    depth: int
    status: str
    created_at: datetime
    updated_at: datetime
    results: Optional[List[str]] = None

class ErrorResponse(BaseModel):
    detail: str
    status_code: int
    timestamp: datetime = Field(default_factory=datetime.utcnow) 