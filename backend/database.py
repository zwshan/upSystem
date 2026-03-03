from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATA_DIR = Path(__file__).resolve().parent / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_URL = f"sqlite:///{(DATA_DIR / 'upsystem.db').as_posix()}"

engine = create_engine(DB_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# Ensure model metadata is registered on Base.metadata.
import models  # noqa: E402,F401
