 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.HUD = function(opts)
{
	var self = this;

	this.visible = true;
	this.messageOnly = false;

	this.width = opts.width;
	this.height = opts.height;

	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height;

	this.ctx = this.canvas.getContext('2d');
	this.ctx.textAlign = "center";

	this.bg = opts.bg;//"textures/hud/hud-bg.png";

	this.fgspeed = opts.speed;//"textures/hud/hud-fg-speed.png";

	this.fgshield = opts.shield;//"textures/hud/hud-fg-shield.png";

	this.speedFontRatio = 24;
	this.speedBarRatio = 2.91;
	this.shieldFontRatio = 64;
	this.shieldBarYRatio = 34;
	this.shieldBarWRatio = 18.3;
	this.shieldBarHRatio = 14.3;
	this.timeMarginRatio = 18;
	this.timeFontRatio = 19.2;

	this.font = opts.font || "Arial";

	this.time = "";

	this.message = "";
	this.previousMessage = "";
	this.messageTiming = 0;
	this.messagePos = 0.0;
	this.messagePosTarget = 0.0;
	this.messagePosTargetRatio = 12;
	this.messageA = 1.0;
	this.messageAS = 1.0;
	this.messageDuration = 2*60;
	this.messageDurationD = 2*60;
	this.messageDurationS = 30;
	this.messageYRatio = 34;
	this.messageFontRatio = 10;
	this.messageFontRatioStart = 6;
	this.messageFontRatioEnd = 10;
	this.messageFontLerp = 0.4;
	this.messageLerp = 0.4;
	this.messageFontAlpha = 0.8;

	this.lapMarginRatio = 14;
	this.lap = "";
	this.lapSeparator = "/";

	this.timeSeparators = ["","'", "''",""];

	this.step = 0;
	this.maxStep = 2;
};

bkcore.hexgl.HUD.prototype.resize = function(w, h)
{
	this.width = w;
	this.height = h;
	this.canvas.width = w;
	this.canvas.height = h;
}

bkcore.hexgl.HUD.prototype.display = function(msg, duration)
{
	this.messageTiming = 0;

	if(this.message != "")
	{
		this.messageA = this.messageFontAlpha;
		this.messagePos = 0.0;
		this.messagePosTarget = this.width/this.messagePosTargetRatio;
		this.previousMessage = this.message;
	}

	this.messageFontRatio = this.messageFontRatioStart;
	this.messageAS = 0.0;
	this.message = msg;
	this.messageDuration = duration == undefined ? this.messageDurationD : duration*60;
}

bkcore.hexgl.HUD.prototype.updateLap = function(current, total)
{
	this.lap = current + this.lapSeparator + total;
}

bkcore.hexgl.HUD.prototype.resetLap = function()
{
	this.lap = "";
}

bkcore.hexgl.HUD.prototype.updateTime = function(time)
{
	this.time = this.timeSeparators[0] + time.m + this.timeSeparators[1] + time.s + this.timeSeparators[2] + time.ms + this.timeSeparators[3];
}

bkcore.hexgl.HUD.prototype.resetTime = function()
{
	this.time = "";
}

bkcore.hexgl.HUD.prototype.update = function(speed, speedRatio, shield, shieldRatio)
{
	var SCREEN_WIDTH = this.width;
	var SCREEN_HEIGHT = this.height;

	var SCREEN_HW = SCREEN_WIDTH / 2;
	var SCREEN_HH = SCREEN_HEIGHT / 2;

	if(!this.visible)
	{
		this.ctx.clearRect(0 , 0 , SCREEN_WIDTH , SCREEN_HEIGHT);
		return;
	}

	var w = this.bg.width;
	var h = this.bg.height;
	var r = h/w;
	var nw = SCREEN_WIDTH;
	var nh = nw*r;
	var oh = SCREEN_HEIGHT - nh;
	var o = 0;
	//speedbar
	var ba = nh;
	var bl = SCREEN_WIDTH/this.speedBarRatio;
	var bw = bl * speedRatio;
	//shieldbar
	var sw = SCREEN_WIDTH/this.shieldBarWRatio;
	var sho = SCREEN_WIDTH/this.shieldBarHRatio;
	var sh = sho*shieldRatio;
	var sy = (SCREEN_WIDTH/this.shieldBarYRatio)+sho-sh;
	

	if(this.step == 0)
	{
		this.ctx.clearRect(0 , oh , SCREEN_WIDTH , nh);

		if(!this.messageOnly)
		{
		    this.ctx.drawImage(this.bg, o, oh, nw, nh);

		    this.ctx.save();
			this.ctx.beginPath();
			this.ctx.moveTo(bw+ba+SCREEN_HW, oh);
			this.ctx.lineTo(-(bw+ba)+SCREEN_HW, oh);
			this.ctx.lineTo(-bw+SCREEN_HW, SCREEN_HEIGHT);
			this.ctx.lineTo(bw+SCREEN_HW, SCREEN_HEIGHT);
			this.ctx.lineTo(bw+ba+SCREEN_HW, oh);
			this.ctx.clip();
		    this.ctx.drawImage(this.fgspeed, o, oh, nw, nh);
			this.ctx.restore();

		    this.ctx.save();
			this.ctx.beginPath();
			this.ctx.moveTo(-sw+SCREEN_HW, oh+sy);
			this.ctx.lineTo(sw+SCREEN_HW, oh+sy);
			this.ctx.lineTo(sw+SCREEN_HW, oh+sh+sy);
			this.ctx.lineTo(-sw+SCREEN_HW, oh+sh+sy);
			this.ctx.lineTo(-sw+SCREEN_HW, oh+sh);
			this.ctx.clip();
		    this.ctx.drawImage(this.fgshield, o, oh, nw, nh);
			this.ctx.restore();

			// SPEED
			this.ctx.font = (SCREEN_WIDTH/this.speedFontRatio)+"px "+this.font;
		    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		    this.ctx.fillText(speed, SCREEN_HW, SCREEN_HEIGHT - nh*0.57);

		    // SHIELD
			this.ctx.font = (SCREEN_WIDTH/this.shieldFontRatio)+"px "+this.font;
		    this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
		    this.ctx.fillText(shield, SCREEN_HW, SCREEN_HEIGHT - nh*0.44);
		}
	}
	else if(this.step == 1)
	{
		this.ctx.clearRect(0 , 0 , SCREEN_WIDTH , oh);

		// TIME
	    if(this.time != "")
	    {
			this.ctx.font = (SCREEN_WIDTH/this.timeFontRatio)+"px "+this.font;
		    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		    this.ctx.fillText(this.time, SCREEN_HW, SCREEN_WIDTH/this.timeMarginRatio);
		}

		// LAPS
		if(this.lap != "")
		{
			this.ctx.font = (SCREEN_WIDTH/this.timeFontRatio)+"px "+this.font;
		    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		    this.ctx.fillText(this.lap, SCREEN_WIDTH-SCREEN_WIDTH/this.lapMarginRatio, SCREEN_WIDTH/this.timeMarginRatio);
		}

	    // MESSAGE
	    var my = SCREEN_HH-SCREEN_WIDTH/this.messageYRatio;

	    if(this.messageTiming > this.messageDuration+2000)
		{
			this.previousMessage = "";
			this.message = "";
			this.messageA = 0.0;
		}
		else if(this.messageTiming > this.messageDuration && this.message != "")
		{
			this.previousMessage = this.message;
			this.message = "";
			this.messagePos = 0.0;
			this.messagePosTarget = SCREEN_WIDTH/this.messagePosTargetRatio;
			this.messageA = this.messageFontAlpha;
		}

		if(this.previousMessage != "")
		{
			if(this.messageA < 0.001)
				this.messageA = 0.0;
			else
				this.messageA += (0.0 - this.messageA) * this.messageLerp;

			this.messagePos += (this.messagePosTarget - this.messagePos) * this.messageLerp;

			this.ctx.font = (SCREEN_WIDTH/this.messageFontRatioEnd)+"px "+this.font;
		    this.ctx.fillStyle = "rgba(255, 255, 255, "+this.messageA+")";
		    this.ctx.fillText(this.previousMessage, SCREEN_HW, my+this.messagePos);
		}

		if(this.message != "")
		{
			if(this.messageTiming < this.messageDurationS)
			{
				this.messageAS += (this.messageFontAlpha - this.messageAS) * this.messageFontLerp;
				this.messageFontRatio += (this.messageFontRatioEnd - this.messageFontRatio) * this.messageFontLerp;
			}
			else
			{
				this.messageAS = this.messageFontAlpha;
				this.messageFontRatio = this.messageFontRatioEnd;
			}

			this.ctx.font = (SCREEN_WIDTH/this.messageFontRatio)+"px "+this.font;
		    this.ctx.fillStyle = "rgba(255, 255, 255, "+this.messageAS+")";
		    this.ctx.fillText(this.message, SCREEN_HW, my);
		}
	}
	
	this.messageTiming++;

	this.step++;
	if(this.step == this.maxStep) this.step = 0;
}