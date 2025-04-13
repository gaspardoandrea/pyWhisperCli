from datetime import datetime

import whisperx
from django.db.models import DateTimeField

from PyWhisperCli.settings import WHISPER_MODEL_DIR
from whispercli.models import AudioDocument, Settings, Transcription


class Transcriber:
    def __init__(self):
        pass

    @staticmethod
    def transcribe(audio_document: AudioDocument):
        model = Settings.get_settings().current_model

        transcription = Transcription(audio_document=audio_document)
        transcription.started_at = datetime.now()
        transcription.model = model
        transcription.save()

        batch_size = 16
        compute_type = "float32"
        device = "cpu"
        lang = "it"
        model_dir = WHISPER_MODEL_DIR

        model = whisperx.load_model(model, device, compute_type=compute_type, download_root=model_dir)
        audio = whisperx.load_audio(audio_document.uploaded_file.path)
        result = model.transcribe(audio, batch_size=batch_size, language=lang)

        transcription.json_data = result
        transcription.ended_at = datetime.now()
        transcription.save()

        return result