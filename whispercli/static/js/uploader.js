// noinspection SpellCheckingInspection
window.csrftoken = "";

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// noinspection JSUnusedGlobalSymbols
jQuery.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", window.csrftoken);
        }
    }
});

let fileUploader = function ($) {
    let my = {}
    let that = {}

    my.validateFile = function (file) {
        if (!my.allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type (' + file.type + '). Please upload an audio file.')
        }
        if (file.size > my.maxSize) {
            throw new Error('File too large. Maximum size is 5MB.')
        }
    }


    my.showError = function (message) {
        my.errorMessage.text(message)
        my.errorMessage.removeClass('d-none')
    }

    my.hideError = function () {
        my.errorMessage.addClass('d-none')
    }

    my.init = function (selector) {
        my.elDiv = $(selector)
        my.dropZone = my.elDiv.find('.dropZone')
        my.formFile = my.elDiv.find('.uploaded_file')
        my.errorMessage = my.elDiv.find('.errorMessage')
        my.uploadForm = my.elDiv.find('form')
        my.dropMessage = my.elDiv.find('.dropMessage')
        my.addButton = $('.add-file')

        my.dnd = my.dropZone

        // noinspection SpellCheckingInspection
        my.allowedTypes = ['audio/mpeg',
            'audio/mp4',
            'audio/x-aiff',
            'audio/x-mpegurl',
            'audio/ogg',
            'audio/vorbis',
            'audio/vnd.wav',
            'audio/wav']
        my.maxSize = 200 * 1024 * 1024 // 5MB

        my.addButton.click(function () {
            my.formFile.click()
        })

        $('html').on('dragenter', function (e) {
            e.preventDefault();
            e.stopPropagation();
            my.dropZone.removeClass('d-none')
        })

        my.dnd.on('dragover', function (e) {
            console.log('dnd dragover')
            e.preventDefault();
            e.stopPropagation();
            my.dropMessage.removeClass("d-none")
        })

        // noinspection JSUnusedLocalSymbols
        my.dropMessage.on('dragleave', function (e) {
            console.log('dropMessage dragleave')
            e.preventDefault();
            e.stopPropagation();
            my.dropMessage.addClass("d-none")
            my.dropZone.addClass('d-none')
        })
        my.dropMessage.on('drop', function (e) {
            console.log('dropMessage drop')
            e.preventDefault();
            e.stopPropagation();
            my.dropMessage.addClass("d-none")
            my.dropZone.addClass('d-none')
            my.hideError()

            try {
                const file = e.originalEvent.dataTransfer.files[0]
                my.validateFile(file)
                my.formFile[0].files = e.originalEvent.dataTransfer.files
                my.uploadForm.submit()
            } catch (error) {
                my.showError(error.message)
            }
        })

        my.formFile.change(function () {
            my.hideError()
            try {
                if (my.formFile[0].files.length > 0) {
                    my.validateFile(my.formFile[0].files[0])
                    my.uploadForm.submit()
                }
            } catch (error) {
                my.showError(error.message)
                my.formFile[0].value = ''
            }
        })

        my.uploadForm.submit(function (e) {
            e.preventDefault(); // avoid to execute the actual submit of the form.
            let form = $(this);
            let actionUrl = form.attr('action');
            // noinspection SpellCheckingInspection
            window.csrftoken = my.uploadForm.find('[name="csrfmiddlewaretoken"]').val()

            // noinspection JSUnusedGlobalSymbols
            $.ajax({
                type: "POST",
                url: actionUrl,
                data: new FormData(form[0]),
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data === "OK") {
                        listManager.reloadList()
                    } else {
                        my.errorMessage(data)
                    }
                }
            })
        })
    }

    that.init = function (selector) {
        my.init(selector)
    }

    return that
}(jQuery)