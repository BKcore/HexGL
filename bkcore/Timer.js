/*!
 * @class bkcore.Timer
 *
 * new Date().getTime() wrapper to use as timers.
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 */

/*!
 * @package bkcore
 */
var bkcore = bkcore || {};

/*!
 * Creates a new timer, inactive by default.
 * Call Timer.start() to activate.
 */
bkcore.Timer = function()
{
	this.time = {
		start: 0,
		current: 0,
		previous: 0,
		elapsed: 0,
		delta: 0
	}

	this.active = false;
}

/*!
 * Starts/restarts the timer.
 */
bkcore.Timer.prototype.start = function()
{
	var now = new Date().getTime();

	this.time.start = now;
	this.time.current = now;
	this.time.previous = now;
	this.time.elapsed = 0;
	this.time.delta = 0;

	this.active = true;
}

/*!
 * Pauses(true)/Unpauses(false) the timer.
 *
 * @param bool Do pause
 */
bkcore.Timer.prototype.pause = function(bool)
{
	this.active = !bool;
}

/*!
 * Update method to be called inside a RAF loop
 */
bkcore.Timer.prototype.update = function()
{
	if(!this.active) return;

	var now = new Date().getTime();

	this.time.current = now;
	this.time.elapsed = this.time.current - this.time.start;
	this.time.delta = now - this.time.previous;
	this.time.previous = now;
}

/*!
 * Returns a formatted version of the current elapsed time using msToTime().
 */
bkcore.Timer.prototype.getElapsedTime = function()
{
	return bkcore.Timer.msToTime(this.time.elapsed);
}

/*!
 * Formats a millisecond integer into a h/m/s/ms object
 * 
 * @param x int In milliseconds
 * @return Object{h,m,s,ms}
 */
bkcore.Timer.msToTime = function(t)
{
	var ms, s, m, h;
	
	ms = t%1000;

	s = Math.floor((t/1000)%60);

	m = Math.floor((t/60000)%60);
	h = Math.floor((t/3600000));

	return {h:h, m:m, s:s, ms:ms};
}

/*!
 * Formats a millisecond integer into a h/m/s/ms object with prefix zeros
 * 
 * @param x int In milliseconds
 * @return Object<string>{h,m,s,ms}
 */
bkcore.Timer.msToTimeString = function(t)
{
	var ms, s, m, h;
	
	ms = t%1000;
	if(ms < 10) ms = "00"+ms;
	else if(ms < 100) ms = "0"+ms;

	s = Math.floor((t/1000)%60);
	if(s < 10) s = "0"+s;

	m = Math.floor((t/60000)%60);
	h = Math.floor((t/3600000));

	return {h:h, m:m, s:s, ms:ms};
}