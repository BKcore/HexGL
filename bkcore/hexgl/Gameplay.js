 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.Gameplay = function(opts)
{
	var self = this;

	this.startDelay = opts.hud == null ? 0 : 1000;
	this.countDownDelay = opts.hud == null ? 1000 : 1500;

	this.active = false;
	this.timer = new bkcore.Timer();
	this.modes = {
		'timeattack':null,
		'survival':null,
		'replay':null
	};
	this.mode = opts.mode == undefined || !(opts.mode in this.modes) ? "timeattack" : opts.mode;
	this.step = 0;

	this.hud = opts.hud;
	this.shipControls = opts.shipControls;
	this.cameraControls = opts.cameraControls;
	this.track = opts.track;
	this.analyser = opts.analyser;
	this.pixelRatio = opts.pixelRatio;

	this.previousCheckPoint = -1;

	this.results = {
		FINISH: 1,
		DESTROYED: 2,
		WRONGWAY: 3,
		REPLAY: 4,
		NONE: -1
	};
	this.result = this.results.NONE;

	this.lap = 1;
	this.lapTimes = [];
	this.lapTimeElapsed = 0;
	this.maxLaps = 3;
	this.score = null;
	this.finishTime = null;
	this.onFinish = opts.onFinish == undefined ? function(){console.log("FINISH");} : opts.onFinish;

	this.raceData = null;

	this.modes.timeattack = function()
	{
		self.raceData.tick(this.timer.time.elapsed);

		self.hud != null && self.hud.updateTime(self.timer.getElapsedTime());
		var cp = self.checkPoint();

		if(cp == self.track.checkpoints.start && self.previousCheckPoint == self.track.checkpoints.last)
		{
			self.previousCheckPoint = cp;
			var t = self.timer.time.elapsed;
			self.lapTimes.push(t - self.lapTimeElapsed);
			self.lapTimeElapsed = t;

			if(self.lap == this.maxLaps)
			{
				self.end(self.results.FINISH);
			}
			else
			{
				self.lap++;
				self.hud != null && self.hud.updateLap(self.lap, self.maxLaps);

				if(self.lap == self.maxLaps)
					self.hud != null && self.hud.display("Final lap", 0.5);
			}
		}
		else if(cp != -1 && cp != self.previousCheckPoint)
		{
			self.previousCheckPoint = cp;
			//self.hud.display("Checkpoint", 0.5);
		}

		if(self.shipControls.destroyed == true)
		{
			self.end(self.results.DESTROYED);
		}
	};

	this.modes.replay = function()
	{
		self.raceData.applyInterpolated(this.timer.time.elapsed);

		if(self.raceData.seek == self.raceData.last)
		{
			self.end(self.result.REPLAY);
		}
	};
}

bkcore.hexgl.Gameplay.prototype.simu = function()
{
	this.lapTimes = [92300, 91250, 90365];
	this.finishTime = this.lapTimes[0]+this.lapTimes[1]+this.lapTimes[2];
	if(this.hud != null) this.hud.display("Finish");
	this.step = 100;
	this.result = this.results.FINISH;
	this.shipControls.active = false;
}

bkcore.hexgl.Gameplay.prototype.start = function(opts)
{
	this.finishTime = null;
	this.score = null;
	this.lap = 1;

	this.shipControls.reset(this.track.spawn, this.track.spawnRotation);
	this.shipControls.active = false;

	this.previousCheckPoint = this.track.checkpoints.start;

	this.raceData = new bkcore.hexgl.RaceData(this.track.name, this.mode, this.shipControls);
	if(this.mode == 'replay')
	{
		this.cameraControls.mode = this.cameraControls.modes.ORBIT;
		if(this.hud != null) this.hud.messageOnly = true;

		try {
			var d = localStorage['race-'+this.track.name+'-replay'];
			if(d == undefined)
			{
				console.error('No replay data for '+'race-'+this.track.name+'-replay'+'.');
				return false;
			}
			this.raceData.import(
				JSON.parse(d)
			);
		}
		catch(e) { console.error('Bad replay format : '+e); return false; }
	}

	this.active = true;
	this.step = 0;
	this.timer.start();
	if(this.hud != null)
	{
		this.hud.resetTime();
		this.hud.display("Get ready", 1);
		this.hud.updateLap(this.lap, this.maxLaps);
	}
}

bkcore.hexgl.Gameplay.prototype.end = function(result)
{
	this.score = this.timer.getElapsedTime();
	this.finishTime = this.timer.time.elapsed;
	this.timer.start();
	this.result = result;

	this.shipControls.active = false;

	if(result == this.results.FINISH)
	{
		if(this.hud != null) this.hud.display("Finish");
		this.step = 100;
	}
	else if(result == this.results.DESTROYED)
	{
		if(this.hud != null) this.hud.display("Destroyed");
		this.step = 100;
	}
}

bkcore.hexgl.Gameplay.prototype.update = function()
{
	if(!this.active) return;

	this.timer.update();
	
	if(this.step == 0 && this.timer.time.elapsed >= this.countDownDelay+this.startDelay)
	{
		if(this.hud != null) this.hud.display("3");
		this.step = 1;
	}
	else if(this.step == 1 && this.timer.time.elapsed >= 2*this.countDownDelay+this.startDelay)
	{
		if(this.hud != null) this.hud.display("2");
		this.step = 2;
	}
	else if(this.step == 2 && this.timer.time.elapsed >= 3*this.countDownDelay+this.startDelay)
	{
		if(this.hud != null) this.hud.display("1");
		this.step = 3;
	}
	else if(this.step == 3 && this.timer.time.elapsed >= 4*this.countDownDelay+this.startDelay)
	{
		if(this.hud != null) this.hud.display("Go", 0.5);
		this.step = 4;
		this.timer.start();
		
		if(this.mode != "replay")
			this.shipControls.active = true;
	}
	else if(this.step == 4)
	{
		this.modes[this.mode].call(this);
	}
	else if(this.step == 100 && this.timer.time.elapsed >= 2000)
	{
		this.active = false;
		this.onFinish.call(this);
	}
}

bkcore.hexgl.Gameplay.prototype.checkPoint = function()
{
	var x = Math.round(this.analyser.pixels.width/2 + this.shipControls.dummy.position.x * this.pixelRatio);
	var z = Math.round(this.analyser.pixels.height/2 + this.shipControls.dummy.position.z * this.pixelRatio);

	var color = this.analyser.getPixel(x, z);

	if(color.r == 255 && color.g == 255 && color.b < 250)
		return color.b;
	else
		return -1;
}