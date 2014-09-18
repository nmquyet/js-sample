function Ruler(options) {

    this.options = {
        decimal: 2,
        color: "#FF0000",
        textColor: "#FF0000"
    };
    this.options = $.extend(this.options, options);

    // rotate config
    this.data = false;

    this.canvas = document.getElementById(options.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.save();
    this.tempPos = null; 
    this.currentDegree = null;
    this.centerX = this.canvas.width * 0.5;
    this.centerY = this.canvas.height * 0.5;

    this.init();
}


/**
 * Draw the image in the initial position
 */
Ruler.prototype.init = function() {
    _this = this;
    this.image = new Image();

    this.image.onload = function() {
        _this.drawBackground();
    };

    this.image.src = this.options.image;

    this.canvas.addEventListener('mousemove', function(e) { _this.drawMouseLine(e);});
    this.canvas.addEventListener('click', function(e) { _this.pickCallback(e);});
};

Ruler.prototype.drawBackground = function() {

    // decide which wheel to draw (enabled or disabled)
    // save canvas state
    this.ctx.save();

    // clear all graphic on canvas and move to the center point to draw the wheel
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.centerX, this.centerY);

    // draw the background
    this.ctx.drawImage(this.image, -this.centerX, -this.centerY, this.canvas.width, this.canvas.height);

    // restore the canvas
    this.ctx.restore();
};

Ruler.prototype.pickCallback = function(e) {
    if (undefined != this.options.onPick) {
        this.options.onPick(this.currentAngle);
    }
};

Ruler.prototype.drawMouseLine = function(e) {

    var mousePos = this.mousePos(e);

    this.drawBackground();

    this.ctx.save;

    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(mousePos.x ,mousePos.y);
    this.ctx.strokeStyle = this.options.color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    var angle = 90 + Math.atan2(mousePos.y - this.centerY, mousePos.x - this.centerX) * 180 / Math.PI;
    if (angle < 0) {
        angle = 360 + angle
    }
    angle = angle.toFixed(this.options.decimal);
    this.currentAngle = angle;

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.strokeStyle = this.options.textColor;
    this.ctx.font = "30px Courier";
    this.ctx.lineWidth = 1;
    this.ctx.fillText(angle, mousePos.x - 30, mousePos.y);
    this.ctx.strokeText(angle, mousePos.x - 30 , mousePos.y);

    this.ctx.restore();

    // window.requestAnimationFrame(this.drawMouseLine);
}

Ruler.prototype.mousePos = function(e) {

    var x = e.clientX;
    var y = e.clientY;

    x -= this.canvas.offsetLeft;
    y -= this.canvas.offsetTop;

    return {"x": x,"y": y};
}

