var utils = {
    norm: function (value, min, max) {
        return (value - min) / (max - min);
    },

    lerp: function (norm, min, max) {
        return (max - min) * norm + min;
    },

    map: function (value, sourceMin, sourceMax, destMin, destMax) {
        return utils.lerp(utils.norm(value, sourceMin, sourceMax), destMin, destMax);
    },

    clamp: function (value, min, max) {
        return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
    },

    distance: function (p0, p1) {
        var dx = p1.x - p0.x,
            dy = p1.y - p0.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    distanceXY: function (x0, y0, x1, y1) {
        var dx = x1 - x0,
            dy = y1 - y0;
        return Math.sqrt(dx * dx + dy * dy);
    },

    circleCollision: function (c0, c1) {
        return utils.distance(c0, c1) <= c0.radius + c1.radius;
    },

    circlePointCollision: function (x, y, circle) {
        return utils.distanceXY(x, y, circle.x, circle.y) < circle.radius;
    },

    pointInRect: function (x, y, rect) {
        return utils.inRange(x, rect.x, rect.x + rect.radius) &&
            utils.inRange(y, rect.y, rect.y + rect.radius);
    },

    inRange: function (value, min, max) {
        return value >= Math.min(min, max) && value <= Math.max(min, max);
    },

    rangeIntersect: function (min0, max0, min1, max1) {
        return Math.max(min0, max0) >= Math.min(min1, max1) &&
            Math.min(min0, max0) <= Math.max(min1, max1);
    },

    rectIntersect: function (r0, r1) {
        return utils.rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
            utils.rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
    },

    degreesToRads: function (degrees) {
        return degrees / 180 * Math.PI;
    },

    radsToDegrees: function (radians) {
        return radians * 180 / Math.PI;
    },

    randomRange: function (min, max) {
        return min + Math.random() * (max - min);
    },

    randomInt: function (min, max) {
        return min + Math.random() * (max - min + 1);
    },

    getmiddle: function (p0, p1) {
        var x = p0.x,
            x2 = p1.x;
        middlex = (x + x2) / 2;
        var y = p0.y,
            y2 = p1.y;
        middley = (y + y2) / 2;
        pos = [middlex, middley];

        return pos;
    },

    getAngle: function (p0, p1) {
        var deltaX = p1.x - p0.x;
        var deltaY = p1.y - p0.y;
        var rad = Math.atan2(deltaY, deltaX);
        return rad;
    },
    inpercentW: function (size) {
        return (size * W) / 100;
    },

    inpercentH: function (size) {
        return (size * H) / 100;
    },

}

// basic setup  :)

canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
W = canvas.width = window.innerWidth;
H = canvas.height = window.innerHeight;

gridX = 5;
gridY = 5;

function shape(x, y, texte) {
    this.x = x;
    this.y = y;
    this.size = 120;

    this.text = texte;
    this.placement = [];
    this.vectors = [];

}

shape.prototype.getValue = function () {
    console.log("get black pixels position");

    // Draw the shape :^)

    ctx.textAlign = "center";
    ctx.font = "bold " + this.size + "px arial";
    ctx.fillText(this.text, this.x, this.y);


    var idata = ctx.getImageData(0, 0, W, H);

    var buffer32 = new Uint32Array(idata.data.buffer);

    for (var y = 0; y < H; y += gridY) {
        for (var x = 0; x < W; x += gridX) {

            if (buffer32[y * W + x]) {
                this.placement.push(new particle(x, y));
            }
        }
    }
    ctx.clearRect(0, 0, W, H);

}
colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722'
];

function particle(x, y, type) {
    this.radius = 1.1;
    this.futurRadius = utils.randomInt(radius, radius + 3);


    this.rebond = utils.randomInt(1, 5);
    this.x = x;
    this.y = y;

    this.dying = false;

    this.base = [x, y]

    this.vx = 0;
    this.vy = 0;
    this.type = type;
    this.friction = .99;
    this.gravity = gravity;
    this.color = colors[Math.floor(Math.random() * colors.length)];

    this.getSpeed = function () {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    };

    this.setSpeed = function (speed) {
        var heading = this.getHeading();
        this.vx = Math.cos(heading) * speed;
        this.vy = Math.sin(heading) * speed;
    };

    this.getHeading = function () {
        return Math.atan2(this.vy, this.vx);
    };

    this.setHeading = function (heading) {
        var speed = this.getSpeed();
        this.vx = Math.cos(heading) * speed;
        this.vy = Math.sin(heading) * speed;
    };

    this.angleTo = function (p2) {
        return Math.atan2(p2.y - this.y, p2.x - this.x);

    };

    this.update = function (heading) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += gravity;

        this.vx *= this.friction;
        this.vy *= this.friction;

        if (this.radius < this.futurRadius && this.dying === false) {
            this.radius += duration;
        } else {
            this.dying = true;
        }

        if (this.dying === true) {
            this.radius -= duration;
        }
        ctx.beginPath();

        ctx.fillStyle = this.color;

        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

        if (this.y < 0 || this.radius < 1) {
            this.x = this.base[0];
            this.dying = false;
            this.y = this.base[1];
            this.radius = 1.1;
            this.setSpeed(speed);
            this.futurRadius = utils.randomInt(radius, radius + 3);
            this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));
        }

    };

    this.setSpeed(utils.randomInt(.1, .5));
    this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));

}

// element2 = document.getElementById("2");
// element3 = document.getElementById("3");
// element4 = document.getElementById("4");
// element5 = document.getElementById("5");
// element6 = document.getElementById("6");
fieldvalue = document.getElementById("message");
// gravity = parseFloat(element2.value);
// duration =  parseFloat(element3.value);
// resolution = parseFloat(element4.value);
// speed = parseFloat(element5.value);
// radius = parseFloat(element5.value);
//
// console.log(gravity,duration,resolution,speed,radius)

gravity = 0;
duration = .4;
resolution = 5;
speed = .1;
radius = .1;

var message = new shape(W / 2, H / 9, fieldvalue.value);

message.getValue();

update();


function change() {
    ctx.clearRect(0, 0, W, H);
    gridX = 5;
    gridY = 5;
    message.placement = [];
    message.text = fieldvalue.value;
    message.getValue();
}


function changeV() {
    gravity = parseFloat(element2.value);
    duration = parseFloat(element3.value);
    speed = parseFloat(element5.value);
    radius = parseFloat(element6.value);
}

var fps = 100;

function update() {
    setTimeout(function () {
        ctx.clearRect(0, 0, W, H);


        for (var i = 0; i < message.placement.length; i++) {
            message.placement[i].update();
        }

        requestAnimationFrame(update);
    }, 1000 / fps);
}


var canvas;
var context;
var proton;
var renderer;
var emitter;
var stats;

main();

function main() {
    canvas = document.getElementById("yhCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
//        context.globalCompositeOperation = "lighter";
    addStats();

    createProton();
    tick();
}

function addStats() {
    stats = new Stats();
    stats.setMode(2);
    stats.domElement.style.position = 'absolute';
    // document.body.appendChild(stats.domElement);
}

function createProton(image) {
    proton = new Proton;
    emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(1, 3), 1);

    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(2, 4));
    emitter.addInitialize(new Proton.P(new Proton.LineZone(10, canvas.height, canvas.width - 10, canvas.height)));
    emitter.addInitialize(new Proton.Life(1, 1.5));
    emitter.addInitialize(new Proton.V(new Proton.Span(4, 6), new Proton.Span(0, 0, true), 'polar'));

    emitter.addBehaviour(new Proton.Gravity(1));
    emitter.addBehaviour(new Proton.Color('#ff0000', 'random'));
    emitter.emit();
    proton.addEmitter(emitter);

    renderer = new Proton.CanvasRenderer(canvas);
    renderer.onProtonUpdate = function () {
        context.fillStyle = "rgba(0, 0, 0, 0.1)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    };
    proton.addRenderer(renderer);

    ////NOTICE :you can only use two emitters do this effect.In this demo I use more emitters want to test the emtter's life
    proton.addEventListener(Proton.PARTICLE_DEAD, function (particle) {
        if (Math.random() < .7)
            createFirstEmitter(particle);
        else
            createSecendEmitter(particle);
    });
}

function createFirstEmitter(particle) {
    var subemitter = new Proton.Emitter();
    subemitter.rate = new Proton.Rate(new Proton.Span(250, 300), 1);
    subemitter.addInitialize(new Proton.Mass(1));
    subemitter.addInitialize(new Proton.Radius(1, 2));
    subemitter.addInitialize(new Proton.Life(1, 3));
    subemitter.addInitialize(new Proton.V(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'));

    subemitter.addBehaviour(new Proton.RandomDrift(10, 10, .05));
    subemitter.addBehaviour(new Proton.Alpha(1, 0));
    subemitter.addBehaviour(new Proton.Gravity(3));
    var color = Math.random() > .3 ? Proton.MathUtils.randomColor() : 'random';
    subemitter.addBehaviour(new Proton.Color(color));

    subemitter.p.x = particle.p.x;
    subemitter.p.y = particle.p.y;
    subemitter.emit('once', true);
    proton.addEmitter(subemitter);
}

function createSecendEmitter(particle) {
    var subemitter = new Proton.Emitter();
    subemitter.rate = new Proton.Rate(new Proton.Span(100, 120), 1);

    subemitter.addInitialize(new Proton.Mass(1));
    subemitter.addInitialize(new Proton.Radius(4, 8));
    subemitter.addInitialize(new Proton.Life(1, 2));
    subemitter.addInitialize(new Proton.V([1, 2], new Proton.Span(0, 360), 'polar'));

    subemitter.addBehaviour(new Proton.Alpha(1, 0));
    subemitter.addBehaviour(new Proton.Scale(1, .1));
    subemitter.addBehaviour(new Proton.Gravity(1));
    var color = Proton.MathUtils.randomColor();
    subemitter.addBehaviour(new Proton.Color(color));

    subemitter.p.x = particle.p.x;
    subemitter.p.y = particle.p.y;
    subemitter.emit('once', true);
    proton.addEmitter(subemitter);
}

function tick() {
    requestAnimationFrame(tick);
    stats.begin();
    proton.update();
    stats.end();
}



var messages = ['小宝贝', '大宝贝', '一周年啦'];
var activeIndex = 0;
//YWL
(function () {
        updateStatus();
})();

function updateStatus() {
    setTimeout(function () {
        var messageInput = document.getElementById('message');
        messageInput.setAttribute('value', messages[activeIndex]);
        change();
        activeIndex = (activeIndex + 1) % messages.length;
        updateStatus();
    }, 3000);
}

