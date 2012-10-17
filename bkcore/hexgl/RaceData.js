 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.RaceData = function(track, mode, shipControls)
{
	this.track = track;
	this.mode = mode;
	this.shipControls = shipControls;

	this.data = [];
	this.last = 0;
	this.seek = 0;

	this._p = new THREE.Vector3();
	this._q = new THREE.Quaternion();
}

bkcore.hexgl.RaceData.prototype.load = function(data)
{
	this.data = data;
	this.last = data.length - 1;
}

bkcore.hexgl.RaceData.prototype.tick = function(time)
{
	this.data.push(new bkcore.hexgl.RaceTick(
		time,
		this.shipControls.getPosition(),
		this.shipControls.getQuaternion()
	));
	++this.last;
}

bkcore.hexgl.RaceData.prototype.applyInterpolated = function(time)
{
	while(this.seek < this.last && this.data[this.seek+1].time < time)
		++this.seek;

	var prev = this.data[this.seek];

	// no interpolation
	if(this.seek == this.last && time >= prev.time
		|| this.seek == 0)
		this.shipControls.teleport(prev.position, prev.quaternion);

	// interpolation
	var next = this.data[this.seek+1];
	var t = (time-prev.time) / (next.time-prev.time);
	this._p.copy(prev.position).lerpSelf(next.position, t);
	this._q.copy(prev.quaternion).slerpSelf(next.quaternion, t);
	
	this.shipControls.teleport(this._p, this._q);
}

bkcore.hexgl.RaceData.prototype.reset = function()
{
	this.seek = 0;
}

bkcore.hexgl.RaceTick = function(time, position, quaternion)
{
	this.time = time;
	this.position = position;
	this.quaternion = quaternion;
}