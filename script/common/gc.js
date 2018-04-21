var GestureCipherMode = {
    'SETTING': 1,
    'VALID': 2
};
var GestureCipherCommonStatus = {
    'LENGTH_ERROR': 31
};
var GestureCipherValidModeStatus = {
    'VALID_SUCCESS': 21,
    'VALID_ERROR': 22
};

var GestureCipherSettingModeStatus = {
    'SETTING_FIRST': 11,
    'SETTING_AGAIN': 13,
    'SETTING_ERROR': 14,
    'SETTING_SUCCESS': 15
};

function GestureCipher(id, options) {
    this.$container = $(id);
    this.options = $.extend(true, {}, {
        row: 3,
        column: 3,
        size: 64,
        gutter: 40,
        showInsideCircle: true, //是否展示内圆
        lineWidth: 6,
        lineCircleSize: '36',
        lineIsOutSide: true,
        borderWidth: 2,
        insideCircleSize: 24,
        unActive: {
            borderColor: '#c4c5c7'
        },
        active: {
            borderColor: '#d8a266',
            lineColor: '#f9c782',
            lineCircleColor: '#f9c782'
        },
        errorSwitch: true,
        error: {
            borderColor: 'red',
            lineColor: '#F93FA5',
            lineCircleColor: '#F93FA5'
        },
        mode: GestureCipherMode.SETTING,
        settingStatus: GestureCipherSettingModeStatus.SETTING_FIRST,
        validStatus: null,
        validCountSwitch: true,
        validCount: 3,
        secret: null,
        minLinkNum: 4
    }, options);
    this.init();
    this.reset();
}

/**
 * 公共状态改变回调
 * @type {number}
 */
GestureCipher.prototype.oncommon = 0;
/**
 * function 设置模式状态改变回调
 * @type {number}
 */
GestureCipher.prototype.onsetting = 0;

/**
 * function 验证模式状态改变回调
 * @type {number}
 */
GestureCipher.prototype.onvalid = 0;
/**
 * 设置手势模式 1.设置密码 2.验证密码
 * @param mode
 * @param secret 验证密码必传字段
 */
GestureCipher.prototype.setMode = function (mode, secret) {
    if (mode) {
        if (mode === GestureCipherMode.SETTING) {
            this.options.mode = GestureCipherMode.SETTING;
            this.options.settingStatus = GestureCipherSettingModeStatus.SETTING_FIRST;
        } else if (mode === GestureCipherMode.VALID) {
            if (!secret) {
                return;
            }
            this.options.mode = GestureCipherMode.VALID;
            this.options.secret = secret;
        }
    }
};


GestureCipher.prototype.getSecret = function () {
    return this.secrets;
};
GestureCipher.prototype.init = function () {
    this.canvas = document.createElement('canvas');
    //画笔
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = (this.options.column) * (this.options.size + this.options.gutter) + this.options.gutter;
    this.canvas.height = (this.options.row) * (this.options.size + this.options.gutter) + this.options.gutter;
    this.$container.append(this.canvas);

    //密保
    this.secrets = [];

    //手势点
    this.gcItems = [];

    //手指touch坐标
    this.fingerX = 0;
    this.fingerY = 0;

    //线
    this.activeLines = [];

    //未激活线
    this.unActiveLine = null;

    //设置状态临时密码
    this.secrets1 = [];


    this.isError = false;

    var self = this;
    $(this.canvas).on('touchstart', function (e) {
        var touch = e.changedTouches[0];
        var cd = self.getFingerRelateElCoordinate(touch.pageX, touch.pageY, self.$container[0]);
        var startX = cd.X;
        var startY = cd.Y;
        var gcItem = self.getFingerTouchItem(startX, startY);
        self.fingerX = startX;
        self.fingerY = startY;
        if (gcItem) {
            self.unActiveLine = self.newLine(gcItem.centerX, gcItem.centerY, gcItem.id);
            self.activeItem(gcItem);
            self.repaint();
        }
    });
    $(this.canvas).on('touchmove', function (e) {
        var touch = e.changedTouches[0];
        var cd = self.getFingerRelateElCoordinate(touch.pageX, touch.pageY, self.$container[0]);
        self.fingerX = cd.X;
        self.fingerY = cd.Y;
        var gcItem = self.getFingerTouchItem(self.fingerX, self.fingerY);

        //如果手势点未激活
        if (!self.itemIsActive(gcItem)) {
            //如果连接点可以激活,连接两手势点。
            if (self.lineIsCanActive(gcItem)) {
                self.activeLine(gcItem.centerX, gcItem.centerY, gcItem.id);
            } else if (self.unActiveLine) {
                //更新未激活连接线的end坐标
                self.unActiveLine.endX = self.fingerX;
                self.unActiveLine.endY = self.fingerY;
            }
            self.activeItem(gcItem);
        }

        self.repaint();
    });
    $(this.canvas).on('touchend', function () {
        self.handleTouchEnd();
    });
};

GestureCipher.prototype.resetWithTip = function () {
    var self = this;
    if (this.options.errorSwitch && this.isError) {
        this.repaint();
        setTimeout(function () {
            self.reset();
        }, 1000);
    } else {
        self.reset();
    }
};

GestureCipher.prototype.handleTouchEnd = function () {
    var self = this;
    this.unActiveLine = null;
    this.repaint();
    //作连接点个数判断
    if (this.secrets.length < this.options.minLinkNum) {
        if (this.oncommon !== 0) {
            this.oncommon.call(this, GestureCipherCommonStatus.LENGTH_ERROR, '少于连接点个数');
        }
        this.isError = true;
        this.resetWithTip();
        return;
    }
    if (this.options.mode === GestureCipherMode.VALID) {
        validHandle();
    } else if (this.options.mode === GestureCipherMode.SETTING) {
        settingHandle();
    }

    function settingHandle() {
        var status = self.options.settingStatus;
        if (status === GestureCipherSettingModeStatus.SETTING_FIRST) {
            self.secrets1 = self.secrets;
            self.secrets = [];
            self.options.settingStatus = GestureCipherSettingModeStatus.SETTING_AGAIN;
        } else if (status === GestureCipherSettingModeStatus.SETTING_AGAIN) {
            var firstSecret = self.secrets1.join('');
            var secondSecret = self.secrets.join('');
            if (firstSecret === secondSecret) {
                self.options.settingStatus = GestureCipherSettingModeStatus.SETTING_SUCCESS;
                if (self.onsetting !== 0) {
                    self.onsetting.call(this, self.options.settingStatus, '设置成功', firstSecret);
                }
            } else {
                self.options.settingStatus = GestureCipherSettingModeStatus.SETTING_ERROR;
                if (self.onsetting !== 0) {
                    self.isError = true;
                    self.onsetting.call(self, self.options.settingStatus, '两次密码输入不一致');
                }
                self.setMode(GestureCipherMode.SETTING);
            }
        }
        self.resetWithTip();
    }

    function validHandle() {
        var secret = self.options.secret;
        var inputSecret = self.secrets.join('');
        if (self.options.validCountSwitch && self.options.validCount <= 0) {
            self.onvalid.call(this, self.options.validStatus, '没有更多的验证机会');
            return;
        }
        if (secret !== inputSecret) {
            self.options.validStatus = GestureCipherValidModeStatus.VALID_ERROR;
            self.isError = true;
            if (self.onvalid !== 0) {
                if (self.options.validCountSwitch) {
                    self.options.validCount--;
                    self.onvalid.call(this, self.options.validStatus, '验证错误,还有' + self.options.validCount + '机会', self.options.validCount);
                }
            } else {
                self.onvalid.call(this, self.options.validStatus, '验证错误');
            }
        }
        else {
            self.options.validStatus = GestureCipherValidModeStatus.VALID_SUCCESS;
            if (self.onvalid !== 0) {
                self.onvalid.call(this, self.options.validStatus, '验证成功');
            }
        }
    }

    self.resetWithTip();
}
;


GestureCipher.prototype.newLine = function (startX, startY, startItemId) {
    return {
        startX: startX,
        startY: startY,
        startItemId: startItemId
    }
};


GestureCipher.prototype.activeLine = function (endX, endY, endItemId) {
    if (this.unActiveLine) {
        this.unActiveLine.endX = endX;
        this.unActiveLine.endY = endY;
        this.unActiveLine.endItemId = endItemId;
        var line = this.unActiveLine;
        this.activeLines.push(line);
        this.unActiveLine = this.newLine(endX, endY, endItemId);
    }
};

GestureCipher.prototype.lineIsCanActive = function (gcItem) {
    return this.unActiveLine && gcItem && this.unActiveLine.startItemId !== gcItem.id;
};

GestureCipher.prototype.itemIsActive = function (gcItem) {
    return gcItem && gcItem.active;
};
/**
 * 获取当前手指所在的手势点区域
 * @param fingerX
 * @param fingerY
 * return gcItem
 */
GestureCipher.prototype.getFingerTouchItem = function (fingerX, fingerY) {
    var self = this;
    var radius = this.options.size / 2;
    var row = this.options.row;
    var column = this.options.column;
    for (var i = 0; i < row; i++) {
        for (var j = 0; j < column; j++) {
            var gcItem = self.gcItems[i][j];
            if (self.checkFingerIsInsideArc(fingerX, fingerY, gcItem.centerX, gcItem.centerY, radius)) {
                return gcItem;
            }
        }
    }
    return null;
};
/**
 * 判断手指是否在圆内
 * @param fingerX
 * @param fingerY
 * @param arcX
 * @param arcY
 * @param radius
 * @returns {boolean}
 */
GestureCipher.prototype.checkFingerIsInsideArc = function (fingerX, fingerY, arcX, arcY, radius) {
    // (x-a)²+(y-b)²=r²
    var r2 = (fingerX - arcX) * (fingerX - arcX) + (fingerY - arcY) * (fingerY - arcY);
    return radius * radius >= r2;
};


GestureCipher.prototype.activeItem = function (gcItem) {
    if (gcItem && !gcItem.active) {
        gcItem.active = true;
        this.secrets.push(gcItem.id);
    }
};
/**
 * 获取手指相对于元素的坐标值。
 */
GestureCipher.prototype.getFingerRelateElCoordinate = function (fingerX, fingerY, el) {
    var rect = el.getBoundingClientRect();
    return {
        X: fingerX - rect.left,
        Y: fingerY - rect.top
    }
};


GestureCipher.prototype.repaint = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var options = this.options;
    var row = options.row;
    var column = options.column;
    var ctx = this.ctx;
    var unActiveStyle = options.unActive;
    var activeStyle = options.active;
    var radius = options.size / 2;


    var lineColor, borderColor;
    //如果开启了发生错误的情况下 颜色更替提示
    if (options.errorSwitch && this.isError) {
        lineColor = options.error.lineColor;
        borderColor = options.error.borderColor;
    } else {
        lineColor = activeStyle.lineColor;
        borderColor = activeStyle.borderColor;
    }

    //绘制已激活的连接线
    ctx.lineWidth = options.lineWidth;
    ctx.strokeStyle = lineColor;


    ctx.beginPath();
    if (this.activeLines) {
        this.activeLines.forEach(function (line) {
            ctx.moveTo(line.startX, line.startY);
            ctx.lineTo(line.endX, line.endY);
        })
    }
    //绘制未激活的连接线
    if (this.unActiveLine) {
        ctx.moveTo(this.unActiveLine.startX, this.unActiveLine.startY);
        ctx.lineTo(this.unActiveLine.endX, this.unActiveLine.endY);
    }
    ctx.stroke();

    //绘制手势点
    for (var i = 0; i < row; i++) {
        for (var j = 0; j < column; j++) {
            var gcItem = this.gcItems[i][j];
            ctx.lineWidth = options.borderWidth;
            if (gcItem.active) {
                ctx.strokeStyle = lineColor;
                ctx.fillStyle = borderColor;

                //绘制圈背景
                if (options.lineIsOutSide) {
                    //绘制外圈
                    ctx.beginPath();
                    ctx.arc(gcItem.centerX, gcItem.centerY, radius, 0, Math.PI * 2, true);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.fillStyle = '#fff';
                    ctx.arc(gcItem.centerX, gcItem.centerY, radius - options.borderWidth, 0, Math.PI * 2, true);
                    ctx.fill();
                } else {
                    //绘制外圈
                    ctx.beginPath();
                    ctx.arc(gcItem.centerX, gcItem.centerY, radius, 0, Math.PI * 2, true);
                    ctx.stroke();
                }

                //绘制内圈
                if (this.options.showInsideCircle) {
                    ctx.fillStyle = borderColor;
                    ctx.beginPath();
                    ctx.arc(gcItem.centerX, gcItem.centerY, options.insideCircleSize / 2, 0, Math.PI * 2, true);
                    ctx.fill();
                }

            } else {
                ctx.strokeStyle = unActiveStyle.borderColor;
                //绘制外圈
                ctx.beginPath();
                ctx.arc(gcItem.centerX, gcItem.centerY, radius, 0, Math.PI * 2, true);
                ctx.stroke();
            }


        }
    }
};
GestureCipher.prototype.reset = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.secrets = [];
    this.unActiveLine = null;
    this.activeLines = [];
    this.gcItems = [];
    this.isError = false;
    var row = this.options.row;
    var column = this.options.column;
    var ctx = this.ctx;
    var unActiveStyle = this.options.unActive;
    var gutter = this.options.gutter;
    ctx.strokeStyle = unActiveStyle.borderColor;
    ctx.lineWidth = this.options.borderWidth;
    var radius = this.options.size / 2;
    var startX = radius + gutter;
    var startY = radius + gutter;
    var x = startX;
    var y = startY;
    var id = 0;
    for (var i = 0; i < row; i++) {
        var rowItems = [];
        for (var j = 0; j < column; j++) {
            rowItems[j] = {
                centerX: x,
                centerY: y,
                active: false,
                id: id
            };
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.stroke();
            x += radius * 2 + gutter;
            id++;
        }
        x = startX;
        y += radius * 2 + gutter;
        this.gcItems[i] = rowItems;
    }
};


//禁止ios端滑动
$(document).ready(function () {
    function stopScrolling(touchEvent) {
        touchEvent.preventDefault();
    }

    document.addEventListener('touchmove', stopScrolling, false);
});



