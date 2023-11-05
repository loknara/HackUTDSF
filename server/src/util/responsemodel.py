from pydantic import BaseModel
from typing import Dict, Any

class ResponseModel(BaseModel):
    success: bool
    message: str | Dict[str, Any]