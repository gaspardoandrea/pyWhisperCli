import os
from mimetypes import guess_type

import simplejson
from django.http import HttpResponse
from django.shortcuts import render
from django.http import QueryDict

from PyWhisperCli.settings import BASE_DIR
from whispercli.models import Whispercli, Settings, MODELS, AudioDocument, AudioDocumentFormSet, Transcription
from whispercli.transcribe import Transcriber


def index(request):
    context = {'settings': Settings.get_settings(),
               'version': Whispercli.version,
               'models': MODELS,
               'uploadForm': AudioDocumentFormSet(),
               'audioDocuments': AudioDocument.objects.all()}
    return render(request, 'index.html', context)


def upload_audio_file(request):
    if request.method == "POST":
        form = AudioDocumentFormSet(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return render(request, 'uploaded.html', {'form': form})
        else:
            x = simplejson.dumps({'errors': form.errors})
            return HttpResponse(x)


def list_audio_documents(request):
    context = {'audioDocuments': AudioDocument.objects.all()}
    return render(request, 'list.html', context)


def set_model(request):
    if request.method == "POST":
        settings = Settings.get_settings()
        settings.current_model = request.POST.get('model')
        settings.save()
        x = simplejson.dumps('OK')
        return HttpResponse(x)


def get_model_list(request):
    return render(request, 'modelList.html', {'settings': Settings.get_settings(), 'models': MODELS})


def about(request):
    context = {'settings': Settings.get_settings(),
               'version': Whispercli.version,
               'models': MODELS,
               'disable_add_file': True
               }
    return render(request, 'about.html', context)


def delete_audio_document(request):
    if request.method == "DELETE":
        put = QueryDict(request.body)
        AudioDocument.objects.get(id=put.get('id')).delete()
        x = simplejson.dumps('OK')
        return HttpResponse(x)


def rename_audio_document(request):
    if request.method == "PUT":
        put = QueryDict(request.body)
        doc = AudioDocument.objects.get(id=put.get('id'))
        doc.description = put.get('description')
        doc.save()
        x = simplejson.dumps('OK')
        return HttpResponse(x)


def get_audio_for(request, doc_id):
    doc = AudioDocument.objects.get(id=doc_id)

    # If you want to respond local file
    with doc.uploaded_file.open('rb') as xl:
        binary_data = xl.read()

    response = HttpResponse(
        content_type=doc.get_mime_type(),
        headers={
            'Content-Disposition': 'inline',
            'accept-ranges': 'bytes',
            'Content-Length': str(len(binary_data)),
        },
    )
    response.write(binary_data)
    return response


def serve_static(request, file_path):
    file_path = os.path.join(BASE_DIR, "static", str(file_path).replace("/", "\\"))
    mime = guess_type(file_path, strict=True)[0]
    response = HttpResponse(
        content_type=mime,
        headers={'Content-Disposition': 'inline'},
    )
    f = open(file_path, 'rb')
    response.write(f.read())
    f.close()
    return response


def transcribe(request, doc_id):
    if request.method == "POST":
        doc = AudioDocument.objects.get(id=doc_id)
        t = Transcriber()
        x = simplejson.dumps({'id': t.transcribe(doc)})

        return HttpResponse(x)


def transcription(request, doc_id):
    settings = Settings.get_settings()
    model = settings.current_model
    tr = Transcription.objects.filter(model=model).filter(audio_document=doc_id).first()
    paragraphs = tr.get_paragraphs()
    context = {
        'audio_document': tr.audio_document,
        'settings': Settings.get_settings(),
        'version': Whispercli.version,
        'models': MODELS,
        'disable_add_file': True,
        'transcription': tr,
        'paragraphs': paragraphs,
    }

    return render(request, 'transcription.html', context)
