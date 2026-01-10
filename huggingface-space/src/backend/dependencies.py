"""
FastAPI dependencies for authentication and database
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.backend.core.database import get_db
from src.backend.core.security import decode_access_token

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> int:
    """Extract user ID from JWT bearer token.

    Args:
        credentials: HTTP Bearer credentials containing JWT token

    Returns:
        User ID extracted from token

    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return int(user_id)


# Type alias for dependency injection
UserIdDep = Annotated[int, Depends(get_current_user_id)]
DbDep = Annotated[Session, Depends(get_db)]
