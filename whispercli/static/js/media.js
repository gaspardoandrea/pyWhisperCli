let mediaManager = function ($) {
    let my = {}
    let that = {}
    my.playing = null

    my.rowFromAudio = function (audio) {
        return audio.parents("tr")
    }

    my.setNotPlaying = function (audio, stop) {
        let row = my.rowFromAudio(audio)
        row.removeClass('playing-now')
        if (stop) {
            row.find('.btn-stop-audio-document').addClass('disabled')
        }
        row.find('.btn-pause-audio-document').addClass('disabled')
    }

    my.setPlaying = function (audio) {
        let row = my.rowFromAudio(audio)
        row.addClass('playing-now')
        row.find('.btn-stop-audio-document').removeClass('disabled')
        row.find('.btn-pause-audio-document').removeClass('disabled')
    }

    my.fileNameFromAudio = function (audio) {
        // noinspection JSCheckFunctionSignatures
        return audio.parents('tr').find('.list-document-name').attr('title')
    }


    my.updatePlayingNow = function () {
        let currentTime = 0
        if (my.playing) {
            currentTime = my.playing[0].currentTime
        }
        my.playingNowTime.find('code').text(my.formatTime(currentTime))

        let val = Math.ceil(100 * currentTime / my.playing.data("duration"))
        my.progress.find('.progress-bar')
            .css("width", val + "%")
            .attr('aria-valuenow', val)
    }

    my.startTimer = function () {
        my.timer = setInterval(my.updatePlayingNow, 500)
        my.progress.removeClass("invisible")
    }

    my.stopTimer = function () {
        if (my.timer) {
            clearTimeout(my.timer)
        }
        my.progress.addClass("invisible")
    }

    my.playAudio = function (audio) {
        if (my.playing !== null) {
            my.setNotPlaying(my.playing, true)
            my.playing[0].pause()
        }
        if (!audio.data("duration")) {
            audio.on("loadedmetadata", function () {
                audio.data("duration", audio[0].duration)
                my.playingNowTotalTime.find('code').text(my.formatTime(audio.data("duration")))
            })
        }

        audio.on("ended", my.stopAudio)

        audio[0].play()
        my.playing = audio
        my.setPlaying(my.playing)
        my.playingNowTime.attr("title", my.fileNameFromAudio(my.playing))

        if (audio.data("duration")) {
            my.playingNowTotalTime.find('code').text(my.formatTime(audio.data("duration")))
        }
        my.startTimer()
    }

    my.formatTime = function (seconds) {
        const date = new Date(null)
        date.setSeconds(seconds)
        return date.toISOString().slice(11, 19);
    }

    my.stopAudio = function () {
        if (my.playing === null) {
            return;
        }
        my.pauseAudio(true)
        my.playing[0].currentTime = 0
        my.playingNowTime.attr("title", "")
        my.playingNowTotalTime.find('code').text(my.formatTime(0))
        my.stopTimer()
        my.playingNowTime.find('code').text(my.formatTime(0))
        my.updatePlayingNow()
    }

    my.pauseAudio = function (stop) {
        if (my.playing !== null) {
            my.setNotPlaying(my.playing, stop)
            my.playing[0].pause()
        }
    }

    my.playFromRow = function () {
        my.playAudio($(this).parent().find('audio'))
    }

    my.stopFromRow = function () {
        my.stopAudio()
    }

    my.pauseFromRow = function () {
        my.pauseAudio(false)
    }

    my.seekFromClick = function (event) {
        let total = $(this).width()
        let objLeft = $(this).offset().left;
        let clickOn = event.pageX - objLeft
        let perc = clickOn / total
        if (my.playing !== null) {
            my.playing[0].currentTime = my.playing.data("duration") * perc
        }
    }

    that.initEvents = function () {
        $(".btn-play-audio-document").click(my.playFromRow)
        $(".btn-stop-audio-document").click(my.stopFromRow)
        $(".btn-pause-audio-document").click(my.pauseFromRow)
    }

    my.init = function () {
        my.progress = $('.progress')
        my.playingNowTime = my.progress.parent().find('.playing-now-time')
        my.playingNowTotalTime = my.progress.parent().find('.playing-total-time')
        my.progress.click(my.seekFromClick)
    }

    $(my.init);

    return that
}(jQuery)