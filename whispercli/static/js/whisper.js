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

    my.setWorking = function (el, working) {
        if (working) {
            el.parents('tr').addClass("whisper-working")
        } else {
            el.parents('tr').removeClass("whisper-working")
        }
    }

    my.startTranscribe = function (event) {
        my.setWorking($(this), true)
        event.stopPropagation()
        event.preventDefault()
        window.csrftoken = $('[name="csrfmiddlewaretoken"]').val()
        $.post($(this).attr('href'), {}, function (results) {
            listManager.reloadList()
            console.log(results)
            my.setWorking($(this), false)
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