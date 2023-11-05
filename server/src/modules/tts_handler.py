import os
import re
import threading
from dotenv import load_dotenv
from elevenlabs import generate, set_api_key, play, stream
from typing import Callable, AsyncGenerator, List, Any

load_dotenv()
set_api_key(os.getenv("ELEVENLABS_API_KEY"))

WORDS_PER_CHUNK = 3

class TTSHandler:
    @classmethod
    def _sync_stream(cls, speak_queue: list, condition: threading.Condition) -> str:
        while True:
            with condition:
                while not speak_queue:  # wait until there's an item
                    condition.wait()
                item = speak_queue.pop(0)
            if item is None:
                break
            yield item

    @classmethod
    async def generate_audio_async(cls, text_stream_fn: Callable[[str], AsyncGenerator], done_event: threading.Event = None) -> AsyncGenerator[Any, Any]:
        speak_queue = []
        audio_queue = []
        condition = threading.Condition()

        def tts_thread_fn():
            audio_stream = generate(
                text=cls._sync_stream(speak_queue, condition),
                voice="Bella",
                model="eleven_monolingual_v1",
                stream=True
            )
            stream(audio_stream)

            for chunk in audio_stream:
                with condition:
                    audio_queue.append(chunk)
                    condition.notify()
                
            with condition:
                audio_queue.append(None) 
                condition.notify()

        threading.Thread(target=tts_thread_fn).start()

        sentence_buffer = ""
        full_text = ""
        async for text in text_stream_fn:
            sentence_buffer += text
            yield {'type': 'partial-text', "text": full_text}
            full_text += text
            while re.search(r'[.!?]', sentence_buffer):
                sentence, _, remainder = re.split(r'([.!?])', sentence_buffer, 1)
                sentence += _
                with condition:
                    speak_queue.append(sentence.strip())
                    condition.notify()
                sentence_buffer = remainder

        if sentence_buffer.strip():
            with condition:
                speak_queue.append(sentence_buffer.strip())
                condition.notify()

        with condition:
            speak_queue.append(None)  # Signal end of text
            condition.notify()
        
        yield {'type': 'text', 'text': full_text}
        while True:  # Yield audio chunks
            with condition:
                while not audio_queue: # wait until there's an item
                    condition.wait()
                audio_chunk = audio_queue.pop(0)
            if audio_chunk is None:  # Check for sentinel value
                if done_event:
                    done_event.set()
                break
            yield {'type': 'chunk', 'chunk': audio_chunk}
            
