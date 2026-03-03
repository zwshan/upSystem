import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from database import DB_URL


def _sqlite_path() -> Path:
    prefix = 'sqlite:///'
    if not DB_URL.startswith(prefix):
        raise ValueError('Only sqlite backend is supported for backup service')
    return Path(DB_URL[len(prefix) :])


def perform_manual_backup() -> dict[str, str]:
    db_path = _sqlite_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    db_path.touch(exist_ok=True)

    backup_dir = db_path.parent / 'backups'
    backup_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    db_backup = backup_dir / f'upsystem-{ts}.db'
    json_backup = backup_dir / f'upsystem-{ts}.json'

    shutil.copy2(db_path, db_backup)
    json_backup.write_text(
        json.dumps({'timestamp': ts, 'db_backup': str(db_backup), 'source_db': str(db_path)}, ensure_ascii=False),
        encoding='utf-8',
    )

    return {'status': 'success', 'backup_path': str(db_backup)}
