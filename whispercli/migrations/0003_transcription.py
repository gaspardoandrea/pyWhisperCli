# Generated by Django 4.2.20 on 2025-04-13 15:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('whispercli', '0002_audiodocument_original_file_name_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transcription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('json_data', models.TextField(blank=True, null=True)),
            ],
        ),
    ]
