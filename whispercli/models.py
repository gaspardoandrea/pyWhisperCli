import datetime
from mimetypes import guess_type
from datetime import datetime, timedelta

from django.db import models
from django.db.models import UniqueConstraint
from django.forms import ModelForm

MODELS = [
    ("tiny", "Tiny"),
    ("base", "Base"),
    ("turbo", "Turbo"),
    ("small", "Small"),
    ("medium", "Medium"),
    ("large-v3", "Large"),
]


class Whispercli:
    version = "0.9"


class Settings(models.Model):
    current_model = models.CharField(max_length=10, choices=MODELS, default="large-v3", blank=False, null=False)

    def get_model_name(self):
        return [a for a in MODELS if a[0] == self.current_model][0][1]

    @staticmethod
    def get_settings():
        settings = Settings.objects.first()
        if settings is None:
            settings = Settings()
            settings.save()
        return settings


class AudioDocument(models.Model):
    # noinspection PyMethodMayBeStatic
    def calc_name(self, filename: str):
        dt = datetime.now()
        # noinspection PyArgumentList
        ts = int(datetime.timestamp(dt))
        if self.description is None:
            self.description = filename.split('/')[-1].split('.')[0]

        self.original_file_name = filename.split('/')[-1]

        return 'uploads/' + str(ts) + "-" + filename.split('/')[-1]

    uploaded_file = models.FileField(upload_to=calc_name, blank=False, null=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, null=True)
    original_file_name = models.CharField(max_length=255, null=True)

    def get_label(self):
        if self.description is None:
            return self.uploaded_file.name
        else:
            return self.description

    def get_mime_type(self):
        return guess_type(self.uploaded_file.url, strict=True)[0]

    def get_resource_link(self):
        return "/get-audio-for/" + str(self.id) + "/"

    def has_transcription(self):
        return self.has_transcription_for_model(Settings.get_settings().current_model)

    def has_transcription_done(self):
        return self.has_transcription_done_for_model(Settings.get_settings().current_model)

    def has_transcription_for_model(self, model):
        tr = Transcription.objects.filter(model=model).filter(audio_document=self.id)
        return tr.count() > 0

    def has_transcription_done_for_model(self, model):
        tr = Transcription.objects.filter(model=model).filter(audio_document=self.id).filter(json_data__isnull=False)
        return tr.count() > 0

class Segment:
    def __init__(self, is_first: bool, start: float, end: float, text: str):
        self.is_first = is_first
        self.start = start
        self.end = end
        self.text = text.strip()

        if self.starts_with_lower():
            if is_first:
                self.text = "(...) " + self.text

    def capitalize(self):
        self.text = self.text[0].upper() + self.text[1:]

    def ends_paragraph(self):
        return self.text.endswith('.') or self.text.endswith('?') or self.text.endswith('!')

    def starts_with_lower(self):
        # noinspection PyUnresolvedReferences
        return self.text[0].islower()

    def get_formatted_start(self):
        rv = str(timedelta(seconds=round(self.start)))
        if rv.startswith("0:"): rv = rv[2:]
        if rv.startswith("0"): rv = rv[1:]
        return rv

class Paragraph(list):
    def append(self, __object: Segment):
        if not self and __object.starts_with_lower():
            __object.capitalize()

        super().append(__object)


class Transcription(models.Model):
    audio_document = models.ForeignKey(AudioDocument, on_delete=models.CASCADE, null=False, blank=False)
    started_at = models.DateTimeField(auto_now_add=True, null=False)
    ended_at = models.DateTimeField(null=True, blank=True)
    json_data = models.JSONField("TranscriptionData", null=True, blank=True)
    model = models.CharField(max_length=10, choices=MODELS, blank=False, null=False)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=("audio_document_id", "model"), name="unique_transcription"
            ),
        ]

    def get_paragraphs(self):
        rv = []
        first = True
        p = Paragraph()
        for t in self.json_data['segments']:
            s = Segment(first, t["start"], t["end"], t["text"])
            p.append(s)
            if s.ends_paragraph():
                rv.append(p)
                p = Paragraph()
            first = False

        return rv


class AudioDocumentFormSet(ModelForm):
    class Meta:
        model = AudioDocument
        fields = ["uploaded_file"]
