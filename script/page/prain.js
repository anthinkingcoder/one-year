function xipai(sources) {
    var newSources = [];
    var isPuts = sources.map(function (t) {
        t = 0;
        return t;
    });
    var length = 0;
    while (1) {
        if (length === sources.length) {
            break;
        }
        var index = parseInt(Math.random() * sources.length);
        if (isPuts[index] === 0) {
            isPuts[index] = 1;
            newSources.push(sources[index]);
            length++;
        }
    }
    return newSources;
}

function Prain(options) {
    this.isStop = true;
    this.options = $.extend(true, {}, {
        sources: [],
        colors: [],
        duration: '4s',
        baseTimeout: 500,
        lefts: []
    }, options);
    this.sourceIndex = 0;
}

Prain.prototype.sendRainItemView = function (postionIndex) {
    if (this.sourceIndex >= this.options.sources.length) {
        this.sourceIndex = 0;
        this.options.sources = xipai(this.options.sources);
    }
    var $rainItemView = $(document.createElement('div'));
    $rainItemView.addClass('prain-item');
    $rainItemView.css({
        top: 0,
        left: lefts[postionIndex],
        width: '1.5rem',
        height: '2rem',
        background: 'url(' + '../img/ys/' + this.options.sources[this.sourceIndex++] + ')' + ' no-repeat center',
        backgroundSize: 'cover',
        borderRadius: '6px',
        transition: 'all ' + this.options.duration + ' ease-in',
        transform: 'translate3d(0,-100%,0)',
        outline: '10px solid' + ' ' + this.options.bcolors[parseInt(Math.random() * this.options.bcolors.length)]
    });

    document.body.appendChild($rainItemView[0]);
    setTimeout(function () {
        $rainItemView.css({
            transform: 'translate3d(0,' + window.innerHeight + 'px' + ',0)'
        });
    });
    setTimeout(function () {
        $rainItemView.remove();
    }, 4000);
};


Prain.prototype.tipPlay = function (tips) {
    var self = this;
    var tipView = document.createElement('tip');
    var tipIndex = 0;
    $(tipView).addClass('rain-tip');
    document.body.appendChild(tipView);
    tip();

    function tip() {
        setTimeout(function () {
            if (tipIndex < tips.length) {
                $(tipView).text(tips[tipIndex++]);
                tip();
            } else {
                $(tipView).remove();
                self.play();
            }
        }, 1000);
    }

};

Prain.prototype.tip = function (fuc, tips) {
    var self = this;
    var tipView = document.createElement('tip');
    var tipIndex = 0;
    $(tipView).addClass('rain-tip');
    document.body.appendChild(tipView);
    preview();

    function preview() {
        setTimeout(function () {
            if (tipIndex < tips.length) {
                var tip = tips[tipIndex];
                console.info(typeof  tip);
                if (typeof tip === 'function') {
                    tip.call(self);
                } else {
                    $(tipView).text(tip);
                }
                tipIndex++;
                preview();
            } else {
                $(tipView).remove();
                fuc.call(self);
            }
        }, 1000);
    }
};


Prain.prototype.play = function () {
    var self = this;
    this.isStop = false;
    setTimeout(function () {
        if (!self.isStop) {
            var index = parseInt(lefts.length * Math.random());
            self.sendRainItemView(index);
            self.play(false);
        }
    }, this.options.baseTimeout + this.options.baseTimeout * Math.random());
};

Prain.prototype.stop = function () {
    this.isStop = true;
};

Prain.prototype.isStop = function () {
    return this.isStop;
};


var W = window.innerWidth;
var lefts = [20, W / 4 + 10, W / 4 * 2 + 10, W / 4 * 3 + 10];

var colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722'
];
var sources = [
    '1.JPG',
    '2.JPG',
    '3.JPG',
    '4.JPG',
    '5.JPG',
    '6.JPG',
    '7.JPG',
    '8.JPG',
    '9.JPG',
    '10.JPG',
    '11.JPG',
    '12.JPG',
    '13.JPG',
    '14.JPG'
];

var tips = ['一大波照片即将袭来', '3', '2', '1', '开始'];
var stopTips = ['第二波惊喜要来啰' ,secondSurprise];


var $ywl;
(function () {
    //第二波惊喜初始化
    $ywl = $('<div style="display: none"><div class="ywl-layer"></div><div class="zl-cf"></div><div class="ywl-cf"></div><div class="bind-cf"></div><div class="g-cf"></div><div class="gj-cf"></div><div class="i-cf"></div><div class="bind-cf"></div><div class="nice-cf" id="nice"></div></div>');
    var prain = new Prain({
        sources: sources,
        bcolors: colors,
        lefts: lefts
    });

    $('#startRainBtn').on('click', function () {
        if (prain.isStop) {
            $('body').append($ywl);
            prain.tip(prain.play, tips);
            $(this).text('第二波惊喜');
            //设置bg透明 让烟花出现
            $('#ywlBg').addClass('bg-o');
        } else {
            $(this).text('第一波惊喜');
            prain.tip(prain.stop, stopTips);

        }
    });
})();






function secondSurprise() {
    $ywl.fadeIn('slow');
    setTimeout(function () {
        $('#nice').fadeIn();
    }, 6000);
    setTimeout(function () {
        $ywl.fadeOut('slow');
        //取消bg透明
        $('#ywlBg').removeClass('bg-o');
        setTimeout(function () {
            $('#nice').hide();
            $ywl.remove();
        },500)
    }, 10000);
}

