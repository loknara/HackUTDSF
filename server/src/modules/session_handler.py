import asyncio
import json
import base64
from typing import AsyncGenerator, Any, Dict

from src.modules.persistence import Persistence
from src.modules.onboard_chatbot import OnboardChatbot
from src.modules.claims_chatbot import ClaimsChatbot
from src.modules.tts_handler import TTSHandler


class SessionHandler:
    current_chatbot: ClaimsChatbot = None
    stage = "Onboarding"
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
    async def get_claim_chatbot_response(cls, query: str, done_event: asyncio.Event = asyncio.Event()) -> AsyncGenerator[Any, Any]:
        chatbot = cls.current_chatbot
        done_event.clear()
        max_question_count = 2

        if cls.question_count > max_question_count:
            return

        questions = [
            "Tell me you're sorry to hear that, but luckily my situation is covered by my policy and I'm in good hands. Ask me the date the incident happened and for a quick summary of the incident.",
            "Tell me to feel free to add any pictures to help State Farm understand my situation. Ask me if I have any other details to put into the claim.",
            "Tell me you generated a claim with number NBD37, and tell me to hang tight while you get on it. Then tell me thank you and to have a nice day."
            ""
        ]

        async for result in TTSHandler.generate_audio_async(chatbot.chat_completion(f"Answer: {query}. Next Instruction: {questions[cls.question_count]}"), done_event=done_event):
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
        print(cls.question_count)

        if cls.question_count > max_question_count:
            print("Finished claim")
            chatbot_msgs = chatbot.messages[1:]
            chat_messages = ""
            for row in chatbot_msgs:
                chat_messages += f"{'Lokesh: ' if row['role'] == 'user' else 'Agent: '}: {row['content']}\t\t\n\n"

            Persistence.insert_claim({
                "id": 'NBD37',
                "model": "Automated",
                "description": "Car accident",
                "date": "2023-11-05",
                "amount": 500,
                "status": "Open",
                "summary": "Lokesh's business vehicle broke down on the way to work. According to his policy, he has commercial auto which covers business-owned vehicles, so he is covered",
                "transcript": chat_messages,
            })
        await done_event.wait()

    @classmethod
    async def get_onboard_chatbot_response(cls, query: str, done_event: asyncio.Event = asyncio.Event()) -> AsyncGenerator[Any, Any]:
        chatbot = cls.current_chatbot
        done_event.clear()
        max_question_count = 5

        questions = [
            "Introduce yourself and say you're a state farm agent specializing in small business insurance. Ask me what my business does.",
            "Ask me if I have a business vehicle.",
            "Ask me if I have any employees.",
            "Ask me if I operate my business in a building",
            "Tell me my policy number is A78364 then choose two or three of the following policies based on my business needs and list them out and add a quick one sentence explanation on why I'm getting them. Policies: Business Owners Policy: Combines business property and liability insurance. Commercial Auto: Covers business-owned vehicles. Contractors Policy: Tailored insurance for contractors. Liability Umbrella: Additional liability coverage. Workers Compensation: Covers medical expenses and some lost wages for work-related injuries/illness. Surety & Fidelity Bonds: Protects financial interests. Equipment Policies: Commercial Auto Insurance: Covers vehicles for jobsite travel. Inland Marine Insurance: Covers transportable business property. Employee Policies: Workers' Compensation: Protection against work-related injuries/illness. Group Life Insurance: Life benefit for employee groups. Liability Policies: Professional Liability Insurance: Coverage against lawsuits for errors. Employment Practices Liability Insurance: Coverage for employment-related issues. Life Policies: Key Employee Insurance: Life insurance for key employees. Small Business Life Insurance: Covers unexpected loss of key employees or partners. Retirement Policies: Individual 401(k): Retirement plan for owner-only businesses. Small Business Retirement Plans: Helps plan for retirement and provides tax deductions for contributions to employee retirement funds. Finally I want you to give me a price and be firm on the price. Don't price each policy individually but as a summed total at the end based on every 6 months. Choose between a number from 2500 to 5000. Also only tell me the policy name and not the extra info.",
        ]

        async for result in TTSHandler.generate_audio_async(chatbot.chat_completion(f"Answer: {query}. Next Instruction: {questions[cls.question_count]}"), done_event=done_event):
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
        print(cls.question_count)

        if cls.question_count >= max_question_count:
            print("Moving onto claims")
            cls.question_count = 0
            cls.stage = "Claims"
            cls.current_chatbot = ClaimsChatbot()

        await done_event.wait()

    @classmethod
    async def send_message(cls, user_id: str, message: str) -> None:
        done_event = asyncio.Event()
        if cls.stage == "Onboarding":
            async for result in cls.get_onboard_chatbot_response(message, done_event):
                yield result
            await done_event.wait()
        else:
            async for result in cls.get_claim_chatbot_response(message, done_event):
                yield result
            await done_event.wait()

        pass

    @classmethod
    async def get_speech_from_text(cls, text: str) -> AsyncGenerator[Any, Any]:
        done_event = asyncio.Event()
        async for result in TTSHandler.generate_audio_async(text, done_event=done_event):
            yield json.dumps({
                'chunk': base64.b64encode(result['chunk']).decode('utf-8')
            })
        await done_event.wait()

    @classmethod
    async def create_claim(cls, user_id: str) -> AsyncGenerator[Any, Any]:
        user_details = Persistence.create_user()

        chatbot: OnboardChatbot = OnboardChatbot()
        cls.current_chatbot: OnboardChatbot = chatbot

        done_event = asyncio.Event()

        user_info = f"Name: {user_details['name']} , business_name: {user_details['business_name']}, email: {user_details['email']}, birthday: {user_details['birthday']}"
        chatbot.add_system_message(f"Insured info: {user_info}")

        async for result in cls.get_claim_chatbot_response(
            """
            Greet me with my name,
            Tell me you see I'm registered with policy number A78364, and ask what claim I'd like to make and ask what happened. 
            """, done_event):
            yield result

        print("Fulfilled creating claim session")

    @classmethod
    async def create_session(cls, user_id: str) -> AsyncGenerator[Any, Any]:
        user_details = Persistence.create_user()

        chatbot: OnboardChatbot = OnboardChatbot()
        cls.current_chatbot: OnboardChatbot = chatbot

        done_event = asyncio.Event()

        user_info = f"Name: {user_details['name']} , business_name: {user_details['business_name']}, email: {user_details['email']}, birthday: {user_details['birthday']}"
        chatbot.add_system_message(f"Insured info: {user_info}")

        async for result in cls.get_onboard_chatbot_response(
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
