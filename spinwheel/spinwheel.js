function SpinWheel(options) {

    this.spinning = false;
    this.options = options;

    // rotate config
    this.maxRotateAngel = 12;     // Max step angel on re-draw
    this.minRotateAngel = 0.02;   // Min step angel on re-draw
    this.totalRotateRound = 6;    // Additional number of round to spin until completely stop
    this.rotateInterval = Math.floor(1000 / this.options.fps);
    this.animationGraph = [];
    this._currentAngel = 0;
    this.data = false;

    // animated message config
    this.messageFillColor = "#C11800";
    this.messageShadowColor = "#C11800";
    this.messageStrokeColor = "#FFFFFF";

    this.canvas = document.getElementById(options.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.save();
    var _this = this;
    this.canvas.addEventListener('click', function() { _this.onClick(); });

    this.disabled = this.options.disabled;

    this.init();
}

/**
 * Canvas onclick trigger
 */
SpinWheel.prototype.onClick = function() {
    if (this.spinning != true && this.disabled != true && this.options.click != undefined) {
        this.options.click();
    } else if (this.options.click == undefined) {
        // this.spin(Math.floor(Math.random() * 360) + 1, function() {});
        // window.requestAnimationFrame(this.spin);
        this.spin();
    }
};

/**
 * Disable canvas click action
 */
SpinWheel.prototype.disable = function() {
    if (this.disabled == false) {
        this.disabled = true;
        this.canvas.style.cursor = "auto";
        this.drawWheel();
    }
};

/**
 * Draw the image in the initial position
 */
SpinWheel.prototype.init = function() {
    _this = this;
    this.startImage = new Image();
    this.startImage.src = this.options.startImage, 
    this.image = new Image();
    this.disabledImage = new Image();

    if (this.disabled == false) {
        this.image.onload = function() {
            _this.drawWheel();
        };
    } else {

        this.disabledImage.onload = function() {
            _this.drawWheel();
        };
    }

    this.image.src = this.options.image;
    this.disabledImage.src = this.options.disabledImage;
};

SpinWheel.prototype.drawWheel = function() {

    // decide which wheel to draw (enabled or disabled)
    var _wheel = null;
    if (this.disabled == true) {
        _wheel = this.disabledImage;
    } else {
        _wheel = this.image;
    }

    // save canvas state
    this.ctx.save();

    // clear all graphic on canvas and move to the center point to draw the wheel
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);

    // if we have an saved angel, rotate canvas to that angel
    if (this._currentAngel != undefined) {
        this.ctx.rotate(this._currentAngel * Math.PI/180);
    }

    // draw the wheel
    this.ctx.drawImage(_wheel, this.canvas.width * -0.5, this.canvas.height * -0.5, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.startImage, -this.startImage.width/2, -this.startImage.width/2);

    // restore the canvas
    this.ctx.restore();
}

SpinWheel.prototype.drawPrize = function(prizeImageSrc) {
    var prizeImage = new Image();
    var _this = this;
    prizeImage.onload = function() {
        // save canvas state
        _this.ctx.save();

        // clear all graphic on canvas and move to the center point to draw the wheel
        _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        _this.ctx.translate(_this.canvas.width * 0.5, _this.canvas.height * 0.5);

        _this.ctx.rotate(-_this.animationGraph[0] * Math.PI/180);
        // if we have an saved angel, rotate canvas to that angel
        if (_this._currentAngel != undefined) {
            _this.ctx.rotate(_this._currentAngel * Math.PI/180);
        }

        // draw the wheel
        _this.ctx.drawImage(prizeImage, -prizeImage.width/2, -prizeImage.width/2);

        // restore the canvas
        _this.ctx.restore();
    };
    prizeImage.src = prizeImageSrc;
}

SpinWheel.prototype._spin = function() {
    // do not spin when canvas is disabled
    if (this.disabled == true || this.data ) {
        this._currentAngel = 0;
        return;
    }

    // save the canvas state before translate and rotate
    this.ctx.save();

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    
    // move to center of canvas
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    
    // Next wheel angel
    this._currentAngel += this.maxRotateAngel;

    // rotate canvas
    this.ctx.rotate(this._currentAngel * Math.PI/180);

    // draw image on the rotated canvas
    this.ctx.drawImage(this.image, -this.canvas.width * 0.5, -this.canvas.height * 0.5, this.canvas.width, this.canvas.height);

    // restore canvas to previous saved state
    this.ctx.restore();
    this.ctx.save();

    // Rotate canvas in reversed direction to draw the start button (it is fixed, not spinning)
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.ctx.drawImage(this.startImage, this.startImage.width * -0.5, this.startImage.height * -0.5, this.startImage.width, this.startImage.height);

    this.ctx.restore();

    _this = this;
    window.requestAnimationFrame(function() {_this._spin(); });
    //setTimeout(function() { _this._spin(); }, _this.rotateInterval);
}

SpinWheel.prototype.spin = function() {
    _this = this;
    // this._spin();
    window.requestAnimationFrame(function() {_this._spin(); });
}

/**
 * Spin to won prize
 */
SpinWheel.prototype.spinToEnd = function(destinationDeg, onComplete) {

    // do not spin when canvas is disabled
    if (this.disabled == true || this.spinning == true) {
        return;
    }

    // change flag to spinning to prevent any actions
    // when wheel is spinning
    this.spinning = true;

    // redraw the wheel in ininital state
    this.drawWheel();

    // calculate animation steps 
    this.calculateAnimation(destinationDeg);
    // Prevent regular spinning
    this.data = true;

    this.onSpinComplete = onComplete;

    // start rotating
    this.rotate();

};

/**
 * Rotate the image every some miliseconds.
 * To increase the rotate speed, set the
 * options.rotateInterval to a smaller value.
 */
SpinWheel.prototype.rotate = function() {

    // no more degree to rotate, stop the animation
    if (this.step < 0) {
        // change flag to not spinning for another actions
        // can take place from now
        this.spinning = false;

        // call complete trigger
        this.onSpinComplete();
        this.onSpinComplete = null;
        this.data = false;

        return;
    }

    // save the canvas state before translate and rotate
    this.ctx.save();

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    
    // move to center of canvas
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    
    // rotate canvas
    this.ctx.rotate(this.animationGraph[this.step] * Math.PI/180);

    // save current rotated angle
    this._currentAngel = this.animationGraph[this.step];

    // draw image on the rotated canvas
    this.ctx.drawImage(this.image, -this.canvas.width * 0.5, -this.canvas.height * 0.5, this.canvas.width, this.canvas.height);

    this.step--;

    // restore canvas to previous saved state
    this.ctx.restore();
    this.ctx.save();

    // Rotate canvas in reversed direction to draw the start button (it is fixed, not spinning)
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.ctx.drawImage(this.startImage, this.startImage.width * -0.5, this.startImage.height * -0.5, this.startImage.width, this.startImage.height);

    this.ctx.restore();

    _this = this;
    window.requestAnimationFrame(function() { _this.rotate(); });
    // setTimeout(function() { _this.rotate(); }, this.rotateInterval);
};

SpinWheel.prototype.showAnimatedMessage = function(message) {

    if (message == undefined || this.spinning == true) {
        return;
    }

    this.message = message;
    this.messageStep = 0;
    this.totalMessageStep = 7;
    this.messageAddScale =  1 / this.totalMessageStep;

    this.ctx.fillStyle = this.messageFillColor;
    this.ctx.strokeStyle = this.messageStrokeColor;//C11800
    this.ctx.lineWidth = 2;
    this.ctx.font = "bold italic 28px Tahoma";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // measure message width, height metric with current font setting
    this._messageLines = this.message.split(/<br>|<br \/>|<br\/>/);

    // calculate number of line need to display message within the wheel width
    this._messageCenterIndex = Math.ceil((this._messageLines.length + 1) / 2);

    this.animateMessage();
};

SpinWheel.prototype.animateMessage = function() {
    this.messageStep++;

    // draw the wheel at previous stopped angel
    this.drawWheel(); 

    // save canvas state
    this.ctx.save();

    // move to center 
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);

    // scale the canvas
    this.ctx.scale(this.messageStep * this.messageAddScale, this.messageStep * this.messageAddScale);

    // config message shadow
    this.ctx.shadowColor = this.messageShadowColor;
    this.ctx.shadowBlur = 3;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    var i, y = 0;
    // draw the message
    for(i = 0; i < this._messageLines.length; i++) {
        y = 0;
        if (i + 1 < this._messageCenterIndex) {
            y = (i + 1 - this._messageCenterIndex)  * 32;
        } else if (i + 1 > this._messageCenterIndex) {
            y = (this._messageCenterIndex - i + 1) * 32;
        } 
        this.ctx.fillText(this._messageLines[i], 0, y);
        this.ctx.strokeText(this._messageLines[i], 0, y);
    }

    // restore canvas state
    this.ctx.restore();

    // if not the final step, call this method again for animation effect after a period
    if (this.messageStep < this.totalMessageStep) {
        _this = this;
        requestAnimationFrame(function() { _this.animateMessage(); });
        // setTimeout(function() { _this.animateMessage(); }, this.rotateInterval);
    }
};

SpinWheel.prototype.calculateAnimation = function(destinationDeg) {

    var finalDest = (this.totalRotateRound * 360) + destinationDeg;
    var speed = this.minRotateAngel ;
    var index = 0;

    while (finalDest > 0) {
        this.animationGraph[index++] = finalDest;
        finalDest = finalDest - speed;
        if (speed + this.minRotateAngel < this.maxRotateAngel) {
            speed = speed + this.minRotateAngel ;    
        }
    }
    this.step = index - 1;
};