from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict


class ApiError(BaseModel):
    code: str
    message: str
    details: Any = None


class UTCModel(BaseModel):
    model_config = ConfigDict(
        json_encoders={
            datetime: lambda value: value.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        }
    )
