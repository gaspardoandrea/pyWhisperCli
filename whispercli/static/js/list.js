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

let listManager = function ($) {
    let my = {}
    let that = {}

    my.modalHide = function () {
        $("div.modal").modal('hide')
    }

    my.buildModal = function (message, title, callback) {
        $("div.modal").remove()
        let modal = $("<div>").addClass("modal").attr("tabindex", -1).attr("role", "dialog")
        let modalDialog = $("<div>").addClass("modal-dialog").attr("role", "document").appendTo(modal)
        let modalContent = $("<div>").addClass("modal-content").appendTo(modalDialog)

        let modalHeader = $("<div>").addClass("modal-header").appendTo(modalContent)
        let modalBody = $("<div>").addClass("modal-body").appendTo(modalContent)
        let modalFooter = $("<div>").addClass("modal-footer").appendTo(modalContent)

        let ok = $('<button>').attr("type", "button").addClass("btn").addClass("btn-primary").append("Ok")
        let cancel = $('<button>').attr("type", "button").addClass("btn").addClass("btn-secondary").attr("data-dismiss", "modal").append("Cancel")

        ok.click(function () {
            callback()
            my.modalHide()
        })
        cancel.click(my.modalHide)

        modalFooter.append(ok)
        modalFooter.append(cancel)

        modalHeader.append($('<h5>').append(title))
        let dispose = $('<button>')
            .attr("type", "button").addClass("close").attr("data-dismiss", "modal").attr("aria-label", "Close")
            .append($("<span>").attr("aria-hidden", "true").append("&times;"))
        dispose.click(my.modalHide)
        modalHeader.append(dispose)

        $('nav').after(modal)
        modal.modalBody = modalBody
        return modal
    }


    my.showAlert = function (message, title, callback) {
        let modal = my.buildModal(message, title, callback)
        modal.modalBody.append($("<p>").append(message))
        modal.modal('show')
    }

    my.showInput = function (message, title, label, defaultValue, callback) {
        let modal = my.buildModal(message, title, callback)
        let form = $('<form>')
        let formGroup = $('<div>').addClass("form-group").appendTo(form)
        form.on('submit', function (event) {
            event.stopPropagation()
            event.preventDefault()
        })

        $('<label>')
            .attr("for", "formInput")
            .addClass("col-form-label")
            .append(label).appendTo(formGroup)
        let input = $('<input>')
            .attr("type", "text")
            .attr('id', 'formInput')
            .addClass("form-control")
            .val(defaultValue)
            .appendTo(formGroup)

        modal.modalBody.append(form)
        modal.modal('show')
        input.focus()
        input.on("keypress", function (event ) {
            if (event.keyCode === 13) {
                callback()
                my.modalHide()
            }
        });
    }

    that.reloadList = function () {
        $(".audio-file-list tbody").load('/get-list/', my.initTableEvents);
    }

    my.updateModel = function (event) {
        event.stopPropagation()
        event.preventDefault()
        window.csrftoken = $('[name="csrfmiddlewaretoken"]').val()
        let url = $(this).attr('href')
        let data = $(this).data('modelName')
        $.post(url, {'model': data}, function () {
            $(".nav-model-list").load('/get-model-list/', null, my.initModelEvents)
        })
    }

    my.deleteAudioDocument = function (event) {
        event.stopPropagation()
        event.preventDefault()
        let url = $(this).attr('href')
        let id = $(this).data('id')

        my.showAlert("Do you really want to remove this audio document?", "Confirm", function () {
            window.csrftoken = $('[name="csrfmiddlewaretoken"]').val()
            $.ajax(
                {
                    url: url,
                    method: "DELETE",
                    data: {'id': id},
                    success: that.reloadList
                })
        })
    }

    my.renameAudioDocument = function (event) {
        event.stopPropagation()
        event.preventDefault()
        let url = $(this).attr('href')
        let id = $(this).data('id')
        let currentName = $(this).parent().parent().find(".list-document-name").text()
        my.showInput("Please, specify the new document name", "Edit", "Document name", currentName, function () {
            window.csrftoken = $('[name="csrfmiddlewaretoken"]').val()
            $.ajax(
                {
                    url: url,
                    method: "PUT",
                    data: {'id': id, 'description': $('#formInput').val().trim()},
                    success: that.reloadList
                })
        })
    }

    my.initTableEvents = function () {
        $('.audio-file-list .btn-delete-audio-document').click(my.deleteAudioDocument)
        $('.audio-file-list .btn-rename-audio-document').click(my.renameAudioDocument)
        mediaManager.initEvents()
        whisperManager.initEvents()
    }

    my.initEvents = function () {
        my.initModelEvents()
        my.initTableEvents()
    }

    my.initModelEvents = function () {
        $(".model-list li a").click(my.updateModel)
    }

    $(my.initEvents)

    return that
}(jQuery)