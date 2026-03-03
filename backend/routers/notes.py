import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Note
from schemas import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix='/api/v1/notes', tags=['notes'])


def _parse_tags(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except json.JSONDecodeError:
        pass
    return []


def _to_note_read(note: Note) -> NoteRead:
    return NoteRead(
        id=note.id,
        title=note.title,
        content=note.content,
        tags=_parse_tags(note.tags),
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get('', response_model=list[NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[NoteRead]:
    notes = db.execute(select(Note).order_by(Note.updated_at.desc(), Note.id.desc())).scalars().all()
    return [_to_note_read(note) for note in notes]


@router.post('', status_code=status.HTTP_201_CREATED, response_model=NoteRead)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    now = datetime.utcnow()
    note = Note(
        title=payload.title,
        content=payload.content,
        tags=json.dumps(payload.tags, ensure_ascii=False),
        created_at=now,
        updated_at=now,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return _to_note_read(note)


@router.put('/{note_id}', response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail='Note not found')

    if payload.title is not None:
        note.title = payload.title
    if payload.content is not None:
        note.content = payload.content
    if payload.tags is not None:
        note.tags = json.dumps(payload.tags, ensure_ascii=False)
    note.updated_at = datetime.utcnow()

    db.add(note)
    db.commit()
    db.refresh(note)
    return _to_note_read(note)


@router.delete('/{note_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> Response:
    note = db.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail='Note not found')

    db.delete(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
