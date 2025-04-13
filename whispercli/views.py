import os
from idlelib.browser import file_open
from mimetypes import guess_type

import simplejson
from django.http import HttpResponse
from django.shortcuts import render
from django.http import QueryDict

from PyWhisperCli.settings import BASE_DIR
from whispercli.models import Whispercli, Settings, MODELS, AudioDocument, AudioDocumentFormSet


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


def get_audio_for(request, id):
    doc = AudioDocument.objects.get(id=id)

    # If you want to respond local file
    with doc.uploaded_file.open('rb') as xl:
        binary_data = xl.read()

    file_name = doc.original_file_name

    response = HttpResponse(
        content_type=doc.get_mime_type(),
        headers={'Content-Disposition': f'attachment; filename="{file_name}"'},
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
