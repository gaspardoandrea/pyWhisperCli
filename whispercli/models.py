import datetime
from mimetypes import guess_type
from datetime import datetime

from django.db import models
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
    def calc_name(self, filename):
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

class AudioDocumentFormSet(ModelForm):
    class Meta:
        model = AudioDocument
        fields = ["uploaded_file"]