from voxtra.services.file_service.config import FileServiceConfig
from pathlib import Path


class FileService:
    def __init__(self, config: FileServiceConfig) -> None:
        self._config = config

    def save(self, filename: str, content: bytes) -> str:
        Path(self._config.audio_path).mkdir(parents=True, exist_ok=True)

        path = f"{self._config.audio_path}/{filename}"
        with open(path, "wb") as file:
            file.write(content)

        return path
