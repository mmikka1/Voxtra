from uuid import UUID
from dishka import FromDishka
from dishka.integrations.fastapi import inject
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from voxtra.usecases.music_parties.get import GetMusicParty
from voxtra.usecases.music_parties.delete import DeleteMusicParty
from voxtra.usecases.music_parties.create import CreateMusicParty
from voxtra.web.schemas.music_party import CreateMusicPartySchema, EditMusicPartySchema, MusicPartySchema
from voxtra.usecases.music_parties.edit import EditMusicParty


router = APIRouter(prefix="/musicparties", tags=["musicparties"])


def party_to_schema(party: MusicPartySchema) -> MusicPartySchema:
    return MusicPartySchema(
        id=party.id,
        audio_path=f"/musicparties/audio/{party.id}",
        description=party.description,
        type=party.type,
        genre=party.genre,
        mood=party.mood,
        tempo=party.tempo,
        created_at=party.created_at
    )

@router.post("", status_code=201, response_model=MusicPartySchema)
@inject
async def create_music_party_handler(
    usecase: FromDishka[CreateMusicParty],
    data: CreateMusicPartySchema
) -> MusicPartySchema:
    party = await usecase(
        description=data.description,
        project_id=data.project_id,
        tempo=data.tempo,
        type=data.type,
        genre=data.genre,
        mood=data.mood
    )

    return party_to_schema(party)


@router.patch("", status_code=201)
@inject
async def edit_music_party_handler(
    usecase: FromDishka[EditMusicParty],
    data: EditMusicPartySchema
):
    party = await usecase(
        music_party_id=data.party_id,
        description=data.description,
        tempo=data.tempo,
        type=data.type,
        genre=data.genre,
        mood=data.mood
    )
    return party_to_schema(party)


@router.get("/audio/{musicparty_id}")
@inject
async def get_audio(
    musicparty_id: UUID,
    usecase: FromDishka[GetMusicParty]
) -> FileResponse:
    musicparty = await usecase(musicparty_id)
    file_path = musicparty.audio_path

    if not os.path.exists(file_path):
        raise HTTPException(404, "Audio not found")

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=f"{str(musicparty.id)}.mp3"
    )


@router.delete("/{musicparty_id}", status_code=204)
@inject
async def delete_music_party_handler(
    musicparty_id: UUID,
    usecase: FromDishka[DeleteMusicParty]
):
    return await usecase(musicparty_id)


@router.get("/{musicparty_id}", status_code=200)
@inject
async def get_music_party_handler(
    musicparty_id: UUID,
    usecase: FromDishka[GetMusicParty]
):
    party = await usecase(musicparty_id)
    return party_to_schema(party)