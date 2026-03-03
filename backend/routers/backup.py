from fastapi import APIRouter

from services.backup_service import perform_manual_backup

router = APIRouter(prefix='/api/v1/backup', tags=['backup'])


@router.post('/manual')
def manual_backup() -> dict[str, str]:
    return perform_manual_backup()
