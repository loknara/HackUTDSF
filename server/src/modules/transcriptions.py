import openai
from typing import Dict, Any

class Transcriptions:
    @classmethod
    async def whisper_transcription(cls, audio_file: str) -> Dict[str, Any]:
        response: openai.Audio = openai.Audio.transcribe("whisper-1", audio_file)
        return response