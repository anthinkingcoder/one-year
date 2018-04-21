function YZN(id, options) {
    this.$contanier = $(id);
    this.options = $.extend(true, {}, {
        autoPlay: false,
        duration: 2000,
        isWaitLoading: true,
        loop: false,
        onplay: 0,
        onpause: 0,
        onload: 0
    }, options);
    this.$step = this.$contanier.find('.step');
    this.activeIndex = -1;
    this.init();
    if (this.options.autoPlay) {
        this.autoPlay();
    }

    this.playing = false;
}

YZN.prototype.autoPlay = function () {
    var self = this;
    if (this.options.autoPlay) {
        setTimeout(function () {
            self.next();
            self.autoPlay();
        }, this.options.duration);
    }
};

YZN.prototype.complete = function () {
    return this.playing;
};
YZN.prototype.init = function () {
    var self = this;
    var imgLoadNum = this.$step.length;


    this.$step.each(function () {
        var $el = $(this);
        $el.hide();
        //设置fade transitionend event
        this.addEventListener('transitionend', function (e) {
            self.playing = false;
            var $el = $(e.target);
            console.info($el[0].className);
            if (/enter-active/i.test($el[0].className)) {
                $el.removeClass('fade-enter-active fade-enter-to');
            } else if (/leave-active/i.test($el[0].className)) {
                $el.removeClass('fade-leave-active fade-leave-to');
                self.hide($el);
            }

        });
        //等所有图片加载完后播放第一张
        if (self.options.isWaitLoading) {
            var $img = $el.find('img').first();
            if ($img[0]) {
                if ($img[0].complete) {
                    imgLoadNum--;
                    if (imgLoadNum === 0) {
                        console.info('可以播放了');
                        if (self.options.onload !== 0) {
                            self.options.onload.call(self);
                        }
                        self.next();
                    }
                }
                $img[0].onload = function () {
                    console.info(imgLoadNum);
                    imgLoadNum--;
                    if (imgLoadNum === 0) {
                        console.info('可以播放了');
                        if (self.options.onload !== 0) {
                            self.options.onload.call(self);
                        }
                        self.next();
                    }
                }
            } else {
                imgLoadNum--;
            }

        }
    });


    //滑动播放
    var startX, startY;
    document.body.addEventListener('touchstart', function (e) {
        startY = e.changedTouches[0].pageY;

    });

    document.body.addEventListener('touchmove', function (e) {
        var endY = e.changedTouches[0].pageY;
        if (startY - endY > 100) {
            self.next();
        }
        if (startY - endY < -100) {
            self.pre();
        }
    });

};

YZN.prototype.play = function (index) {
    if (!this.complete()) {
        this.playing = true;
        if (this.activeIndex !== index) {
            this.fadeOut($(this.$step[this.activeIndex]));
        }
        this.fadeIn($(this.$step[index]));

        var self = this;

        var beforeIndex = this.activeIndex;
        //notify
        if (this.options.onplay !== 0) {
            setTimeout(function () {
                var before = beforeIndex === -1 ? null : self.$step[beforeIndex];
                self.options.onplay.call(this, self.$step[index], before);
            }, 500);
        }

        this.activeIndex = index;


    }
};

YZN.prototype.pause = function () {

};


YZN.prototype.next = function () {

    //最后一张
    if (this.activeIndex + 1 === this.$step.length) {
        if (!this.options.loop) {
            return;
        }
    }
    var index = (this.activeIndex + 1) % this.$step.length;
    this.play(index);
};

YZN.prototype.pre = function () {
    //first
    if (this.activeIndex === 0) {
        if (!this.options.loop) {
            return;
        }
    }
    var index = (this.activeIndex - 1) % this.$step.length;
    this.play(index);
};

YZN.prototype.fadeIn = function ($el) {
    var self = this;
    self.show($el);
    $el.addClass('fade-enter-active fade-enter');
    setTimeout(function () {
        $el.removeClass('fade-enter');
        $el.addClass('fade-enter-to');
    }, 100);


};

YZN.prototype.fadeOut = function ($el) {
    var self = this;
    $el.addClass('fade-leave-active fade-leave');
    setTimeout(function () {
        $el.removeClass('fade-leave');
        $el.addClass('fade-leave-to');
    });
};


YZN.prototype.show = function ($el) {
    $el.css({
        display: 'block'
    })
};

YZN.prototype.hide = function ($el) {
    $el.css({
        display: 'none'
    })

};


(function () {
    var laoding = new Loading('精彩马上开始');
    laoding.show();
    var yzn = new YZN('#wrapper', {
        onplay: function (step, beforeStep) {
            if (beforeStep) {
                var $beforeStepFrame1 = $(beforeStep).find('.step-frame1').first();
                var $beforeStepFrame2 = $(beforeStep).find('.step-frame2').first();
                $beforeStepFrame1.removeClass('step-frame1-active');
                $beforeStepFrame2.removeClass('step-frame2-active');
            }
            var $stepFrame1 = $(step).find('.step-frame1').first();
            $stepFrame1.addClass('step-frame1-active');
            //播放第二帧
            var $stepFrame2 = $(step).find('.step-frame2').first();
            $stepFrame1.on('transitionend', function (e) {
                $stepFrame2.addClass('step-frame2-active');
            });
        },
        onload: function () {
            laoding.hide();
            $('#wrapper').show();
        }
    });
})();