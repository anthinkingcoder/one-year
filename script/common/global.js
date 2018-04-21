/**
 * loading
 * @author zhoulin
 */

function Loading(content) {
    content = content ? content : '';
    this.$el = $(createLoadingView());

    function createLoadingView() {
        if (content) {
            return '<div class="ia-loading-box" style="display:none;"><div class="ia-loading-wrapper"><div class="ia-loading ia-loading-large"></div><div class="ia-loading-content">' + content + '</div></div></div>';
        } else {
            return '<div class="ia-loading-box" style="display:none;"><div class="ia-loading-wrapper"><div class="ia-loading ia-loading-large"></div></div></div>';
        }
    }
}

Loading.prototype.show = function () {
    var self = this;
    $('body').append(this.$el, {});
    setTimeout(function () {
        self.$el.fadeIn(500);
    })
};


Loading.prototype.hide = function () {
    var self = this;
    this.$el.fadeOut(500);
    setTimeout(function () {
        self.$el.remove();
    }, 500);
};


(function () {
    $('#musicAudio').on('ended', function () {
       $(this).attr('src','http://fs.open.kugou.com/2e9145b6d30d22cefefc186548c4c68f/5a828051/G002/M08/02/13/ooYBAFT-JiqABNIaAEBvMGDr7qI119.mp3');
       playMusic();
    });
    //播放音乐
    $('#musicPlayBtn').on('click', function () {
        playMusic();
    });

    $('html').one('touchstart', function () {
        playMusic();
    });
})();



var pause = false;

function playMusic() {
    var $audio = $('#musicAudio');
    if (!pause) {
        $('#musicPlayBtn').addClass('playing');
        pause = true;
        $audio[0].play();
    } else {
        pause = false;
        $audio[0].pause();
        $('#musicPlayBtn').removeClass('playing');
    }


}


//禁止ios端滑动
$(document).ready(function () {
    function stopScrolling(touchEvent) {
        touchEvent.preventDefault();
    }

    document.addEventListener('touchmove', stopScrolling, false);
});