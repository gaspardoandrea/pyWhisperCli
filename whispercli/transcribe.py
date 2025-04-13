import whisperx

from PyWhisperCli.settings import WHISPER_MODEL_DIR
from whispercli.models import AudioDocument, Settings


class Transcriber:
    def __init__(self):
        pass

    def transcribe(self, audio_document: AudioDocument):
        batch_size = 16
        compute_type = "float32"
        model = Settings.get_settings().current_model
        device = "cpu"
        lang = "it"
        model_dir = WHISPER_MODEL_DIR

        model = whisperx.load_model(model, device, compute_type=compute_type, download_root=model_dir)
        audio = whisperx.load_audio(audio_document.uploaded_file.path)
        result = model.transcribe(audio, batch_size=batch_size, language=lang)

        return result