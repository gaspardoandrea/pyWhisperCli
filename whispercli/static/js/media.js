let mediaManager = function ($) {
    let my = {}
    let that = {}
    my.playing = null

    my.rowFromAudio = function (audio) {
        return audio.parents("tr")
    }

    my.setNotPlaying = function (audio) {
        let row = my.rowFromAudio(audio)
        row.removeClass('playing-now')
        row.find('.btn-stop-audio-document').addClass('disabled')
        row.find('.btn-pause-audio-document').addClass('disabled')
    }

    my.setPlaying = function (audio) {
        let row = my.rowFromAudio(audio)
        row.addClass('playing-now')
        row.find('.btn-stop-audio-document').removeClass('disabled')
        row.find('.btn-pause-audio-document').removeClass('disabled')
    }

    my.fileNameFromAudio = function (audio) {
        return audio.parents('tr').find('.list-document-name').attr('title')
    }

    my.playAudio = function (audio) {
        if (my.playing !== null) {
            my.setNotPlaying(my.playing)
            my.playing[0].pause()
        }
        audio[0].play()
        my.playing = audio
        my.setPlaying(my.playing)
        $('nav .playing-now span').text(my.fileNameFromAudio(my.playing))
    }

    my.stopAudio = function () {
        if (my.playing !== null) {
            my.pauseAudio()
            my.playing[0].currentTime = 0
        }
    }

    my.pauseAudio = function () {
        if (my.playing !== null) {
            my.setNotPlaying(my.playing)
            my.playing[0].pause()
            $('nav .playing-now span').html("&hellip;")
        }
    }

    my.playFromRow = function () {
        my.playAudio($(this).parent().find('audio'))
    }

    my.stopFromRow = function () {
        my.stopAudio()
    }

    my.pauseFromRow = function () {
        my.pauseAudio()
    }

    that.initEvents = function () {
        $(".btn-play-audio-document").click(my.playFromRow)
        $(".btn-stop-audio-document").click(my.stopFromRow)
        $(".btn-pause-audio-document").click(my.pauseFromRow)
    }

    my.init = function () {
    }

    $(my.init);

    return that
}(jQuery)