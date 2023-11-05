import json

from typing import Dict, Any, Optional, List

from fastapi import FastAPI, Query, UploadFile, File
from fastapi_socketio import SocketManager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import shutil
from pathlib import Path
from pydub import AudioSegment

from src.util.responsemodel import ResponseModel
from src.modules.persistence import Persistence
from src.modules.session_handler import SessionHandler
from src.modules.transcriptions import Transcriptions

app: FastAPI = FastAPI()

API_V1_ENDPOINT = "/api/v1"
UPLOAD_DIRECTORY = Path(__file__).parent / "uploads"
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

# Set up CORS
origins = ["*", "http://localhost:8080",]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = SocketManager(app=app)
app.mount("/ws", sio)


@app.get("/", response_model=ResponseModel)
async def default():
    return ResponseModel(success=True, message={"hi": "test"})


@app.get(f"{API_V1_ENDPOINT}/", response_model=ResponseModel)
async def test():
    return ResponseModel(success=True, message={"test": "passed"})


@app.get(f"{API_V1_ENDPOINT}/get_claims")
async def get_all():
    return ResponseModel(
        success=True,
        message={"claim_data": json.dumps(Persistence.get_all_claims())}
    )


@app.post(f"{API_V1_ENDPOINT}/create_user")
async def get_user(user_id: str = Query()):
    return ResponseModel(
        success=True,
        message={"user_data": Persistence.create_user(user_id)}
    )


@sio.on("connect")
async def connect(sid, environ):
    print("connect ", sid)


@sio.on("disconnect")
async def disconnect(sid):
    print("disconnect ", sid)


@sio.on("chatbot")
async def chatbot(sid, data: Dict[str, Any]):
    user_id: str = data.get("user_id")
    command: str = data.get("command")

    if command == "create_session":
        print("Creating session")
        async for result in SessionHandler.create_session(user_id=user_id):
            await sio.emit("chatbot", result, room=sid)
    elif command == "create_claim":
        print("Create claim")
        async for result in SessionHandler.create_claim(user_id=user_id):
            await sio.emit("chatbot", result, room=sid)
    elif command == "get_response":
        query: str = data.get("query")
        async for result in SessionHandler.send_message(user_id, query):
            await sio.emit("chatbot", result, room=sid)
    elif command == "speech_from_text":
        text: str = data.get("text")
        async for result in SessionHandler.get_speech_from_text(text=text):
            await sio.emit("chatbot", result, room=sid)


@app.get(f"{API_V1_ENDPOINT}/chat/create_session")
async def create_session(user_id: str = Query()):
    return StreamingResponse(SessionHandler.create_session(user_id=user_id))


@app.get(f"{API_V1_ENDPOINT}/chat/get_response")
async def get_response(user_id: str = Query(), query: str = Query()):
    return StreamingResponse(SessionHandler.get_chatbot_response(user_id=user_id, query=query))

# will need to return the streamingresponse as well as a true/false of whether to continue the test


@app.post(f"{API_V1_ENDPOINT}/upload_audio/")
async def upload_audio(file: UploadFile = File(...)):
    temp_path = UPLOAD_DIRECTORY / file.filename
    with temp_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    mp3_path = UPLOAD_DIRECTORY / "audio.mp3"

    AudioSegment.from_file(str(temp_path)).export(str(mp3_path), format="mp3")

    with open(mp3_path, "rb") as f:
        response = await Transcriptions.whisper_transcription(f)
        transcription = response['text']

    Path(temp_path).unlink()
    Path(mp3_path).unlink()

    return ResponseModel(
        success=True,
        message={"transcription": transcription}
    )

Persistence.initialize()
if __name__ == "__main__":
    Persistence.initialize()
