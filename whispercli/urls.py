from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("get-list/", views.list_audio_documents, name="get-list"),
    path("set-model", views.set_model, name="set-model"),
    path("upload-audio-file/", views.upload_audio_file, name="upload-audio-file"),
    path("get-model-list/", views.get_model_list, name="get-model-list"),
    path("delete-audio-document/", views.delete_audio_document, name="delete-audio-document"),
    path("rename-audio-document/", views.rename_audio_document, name="rename-audio-document"),
    path("get-audio-for/<int:id>/", views.get_audio_for, name="get-audio-for"),
    path("about/", views.about, name="about"),
]
