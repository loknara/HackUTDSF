import asyncio
import json
import base64
from typing import AsyncGenerator, Any, Dict

from src.modules.persistence import Persistence
from src.modules.chatbot import Chatbot
from src.modules.tts_handler import TTSHandler


class SessionHandler:
    chatbot_sessions: Dict[str, Chatbot] = {}
    question_count = 0

    @classmethod
    async def process_first_chunk_only(audio_chunks_async, done_event):
        first_chunk_handled = False
        async for chunk in audio_chunks_async:
            if not first_chunk_handled and 'chunk' in chunk:
                # Process the first chunk
                first_chunk_handled = True
                yield json.dumps({
                    'type': 'chunk',
                    'chunk': base64.b64encode(chunk['chunk']).decode('utf-8')
                })
            else:
                # Just print the other chunks
                if 'text' in chunk:
                    print(chunk)
                elif 'chunk' in chunk:
                    print(f"Chunk received with length {len(chunk['chunk'])}")

    @classmethod
    async def get_chatbot_response(cls, user_id: str, query: str, done_event: asyncio.Event = asyncio.Event()) -> AsyncGenerator[Any, Any]:
        if user_id not in cls.chatbot_sessions:
            yield "User not found"
            return
        chatbot = cls.chatbot_sessions[user_id]
        if cls.question_count > 3:
            return

        if cls.question_count == 3:
            done_event.clear()
            async for answer in chatbot.chat_completion(f"{query}. That's my last question. Say thank and give a quote price, and don't mention you're an AI. Pretend like you're a professional and give me decisive answers. Say what policies I would be best suited for and alos give me a quote.The policies for general Business are" +
                                                        " Business Owners Policy: Combines business property and liability insurance. Commercial Auto: Covers business-owned vehicles. Contractors Policy: Tailored insurance for contractors. Liability Umbrella: Additional liability coverage. Workers Compensation: Covers medical expenses and some lost wages for work-related injuries/illness. Surety & Fidelity Bonds: Protects financial interests. Equipment Policies: Commercial Auto Insurance: Covers vehicles for jobsite travel. Inland Marine Insurance: Covers transportable business property. Employee Policies: Workers' Compensation: Protection against work-related injuries/illness. Group Life Insurance: Life benefit for employee groups. Liability Policies: Professional Liability Insurance: Coverage against lawsuits for errors. Employment Practices Liability Insurance: Coverage for employment-related issues. Life Policies: Key Employee Insurance: Life insurance for key employees. Small Business Life Insurance: Covers unexpected loss of key employees or partners. Retirement Policies: Individual 401(k): Retirement plan for owner-only businesses. Small Business Retirement Plans: Helps plan for retirement and provides tax deductions for contributions to employee retirement funds. Choose 4 or 5 based on business needs."):
                async for result in TTSHandler.generate_audio_async(chatbot.chat_completion(f"{answer}. Summarize the answer and just give me the policy names that are in the answer as well as a price value as my quote"), done_event=done_event):
                    if 'text' in result:
                        print(result)
                        yield json.dumps({"type": "text", "text": result['text']})
                    if 'partial-text' in result:
                        yield json.dumps({"type": "partial-text", "text": result['partial-text']})
                    elif 'chunk' in result:
                        yield json.dumps({
                            'type': 'chunk',
                            'chunk': base64.b64encode(result['chunk']).decode('utf-8')
                        })

            yield json.dumps({'type': 'status', "status": "success"})
            yield json.dumps({'type': 'ending', "status": "success"})
            cls.question_count += 1
            await done_event.wait()
            return

        done_event.clear()
        async for result in TTSHandler.generate_audio_async(chatbot.chat_completion(query), done_event=done_event):
            if 'text' in result:
                print(result)
                yield json.dumps({"type": "text", "text": result['text']})
            elif 'chunk' in result:
                yield json.dumps({
                    'type': 'chunk',
                    'chunk': base64.b64encode(result['chunk']).decode('utf-8')
                })
        cls.question_count += 1
        yield json.dumps({'type': 'status', "status": "success"})
        await done_event.wait()

    @classmethod
    async def send_message(cls, message: str) -> None:
        done_event = asyncio.Event()
        async for result in cls.get_chatbot_response(message, done_event):
            yield result
        await done_event.wait()

    @classmethod
    async def get_speech_from_text(cls, text: str) -> AsyncGenerator[Any, Any]:
        done_event = asyncio.Event()
        async for result in TTSHandler.generate_audio_async(text, done_event=done_event):
            yield json.dumps({
                'chunk': base64.b64encode(result['chunk']).decode('utf-8')
            })
        await done_event.wait()

    @classmethod
    async def create_session(cls, user_id: str) -> AsyncGenerator[Any, Any]:
        user_details = Persistence.get_user(user_id=user_id)
        if not user_details:
            yield "User not found"
            return
        chatbot: Chatbot = Chatbot()
        cls.chatbot_sessions[user_id] = chatbot

        done_event = asyncio.Event()

        user_info = f"Name: {user_details['first_name']} {user_details['last_name']}, Age: {user_details['age']}, City: {user_details['city']}, Phone: {user_details['phone']}"
        chatbot.add_system_message(f"Patient info: {user_info}")

        async for result in cls.get_chatbot_response(
            user_id,
            """
            Greet me with my name,
            welcome me and tell me something along the lines of you're looking forward to getting started with the qoute estimation and policy options and let's begin. 
            Begin the Insurance test now. Let's start the session. Start asking me questions, one at a time so I can respond. Ask me if I'm ready. 
            """, done_event):
            yield result

        print("Fulfilled creating session")


if __name__ == "__main__":
    async def main():
        await SessionHandler.create_session({"name": "Raghav"})

    asyncio.run(main())
