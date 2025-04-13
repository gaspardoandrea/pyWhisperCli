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

let whisperManager = function ($) {
    let my = {}
    let that = {}

    my.startTranscribe = function (event) {
        event.stopPropagation()
        event.preventDefault()
        window.csrftoken = $('[name="csrfmiddlewaretoken"]').val()
        $.post($(this).attr('href'), {}, function (results) {
            console.log(results)
        })

    }

    that.initEvents = function () {
        $(".btn-transcribe-audio-document").click(my.startTranscribe)
    }

    my.init = function () {
    }

    $(my.init);

    return that
}(jQuery)