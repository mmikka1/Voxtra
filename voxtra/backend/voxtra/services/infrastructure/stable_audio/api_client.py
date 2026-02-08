import httpx
from voxtra.services.audio_generator import AudioGenerator
from voxtra.models.audio import Genre, Mood, Tempo, MusicPartyType
from voxtra.services.infrastructure.stable_audio.config import StableAudioConfig
from voxtra.models.audio import AudioFormatEnum, GeneratedAudio
from voxtra.models.exceptions import NoGenerateCredits

from transformers import MarianMTModel, MarianTokenizer


class TranslateService:
    def __init__(self) -> None:    
        self.nlp_model_name = "Helsinki-NLP/opus-mt-ru-en"
        self.nlp_tokenizer = MarianTokenizer.from_pretrained(self.nlp_model_name)
        self.nlp_model = MarianMTModel.from_pretrained(self.nlp_model_name)

    def translate_ru_to_en(self, text: str) -> str:
        tokens = self.nlp_tokenizer(text, return_tensors="pt", padding=True)
        translated = self.nlp_model.generate(**tokens)
        return self.nlp_tokenizer.decode(translated[0], skip_special_tokens=True)


class StableAudioGenerator(AudioGenerator):
    def __init__(
        self,
        config: StableAudioConfig,
        session: httpx.AsyncClient,
        translate_service: TranslateService
    ) -> None:
        self._session = session
        self._config = config
        self._translate_service = translate_service

    def __generate_prompt(
        self,
        description: str,
        type: MusicPartyType,
        genre: Genre,
        mood: Mood,
        tempo: Tempo,
    ) -> str:
        return f"""
        Create a {genre} composition featuring {type}.
        Mood: {mood}.
        Tempo: {tempo}.
        Description: {self._translate_service.translate_ru_to_en(description)}.

        Minimalistic composition, expressive performance,
        high quality studio recording, professional music production,
        clean mix, balanced dynamics, spacious reverb.
        """

    async def generate(
        self,
        description: str,
        type: MusicPartyType,
        genre: Genre,
        mood: Mood,
        tempo: Tempo,
        output_format: AudioFormatEnum = AudioFormatEnum.mp3,
        duration: int = 30
    ) -> GeneratedAudio:
      #  try:
            prompt = self.__generate_prompt(
                description=description,
                type=type,
                genre=genre,
                mood=mood,
                tempo=tempo
            )

            print(prompt)

            response = await self._session.post(
                self._config.api_url,
                headers={
                    "authorization": f"Bearer {self._config.api_key}",
                    "accept": f"audio/*",
                },
                files={"none": ""},
                data={
                    "prompt": prompt,
                    "output_format": output_format.value,
                    "duration": duration,
                    "model": self._config.model,
                },
            )
            
            if response.status_code == 200:
                audio_content = response.read()

                return GeneratedAudio(
                    content=audio_content,
                    format=output_format,
                    duration=duration
                )
            elif response.status_code == 402:
                raise NoGenerateCredits("You lack sufficient credits to make this request")

            else:
                try:
                    error_data = await response.json()
                    error_msg = str(error_data)
                except:
                    error_msg = f"HTTP {response.status_code}: {response.text}"

                raise Exception(f"Audio generation failed: {error_msg}")

        #except Exception as e:
       #     raise Exception(f"Unexpected error during audio generation: {str(e)}")
