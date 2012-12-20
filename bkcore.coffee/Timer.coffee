###
 new Date().getTime() wrapper to use as timer.

 @class bkcore.Timer
 @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class Timer

  ###
    Creates a new timer, inactive by default.
    Call Timer.start() to activate.
  ###
  constructor: ()->

    @time =
      start: 0
      current: 0
      previous: 0
      elapsed: 0
      delta: 0

    @active = false

  ###
    Starts/restarts the timer.
  ###
  start: ()->

    now = (new Date).getTime()

    @time.start = now
    @time.current = now
    @time.previous = now
    @time.elapsed = 0
    @time.delta = 0

    @active = true

  ###
    Pauses(true)/Unpauses(false) the timer.

    @param bool Do pause
  ###
  pause: (doPause)->

    @active = not doPause

  ###
    Update method to be called inside a RAF loop
  ###
  update: ()->

    if not @active then return

    now = (new Date).getTime()

    @time.current = now
    @time.elapsed = @time.current - @time.start
    @time.delta = now - @time.previous
    @time.previous = now

  ###
    Returns a formatted version of the current elapsed time using msToTime().
  ###
  getElapsedTime: ()->

    return @constructor.msToTime(@time.elapsed)

  ###
    Formats a millisecond integer into a h/m/s/ms object
    
    @param x int In milliseconds
    @return Object{h,m,s,ms}
  ###
  @msToTime: (t)->

    ms = t%1000
    s = Math.floor((t/1000)%60)
    m = Math.floor((t/60000)%60)
    h = Math.floor(t/3600000)

    return {h:h, m:m, s:s, ms,ms}

  ###
    Formats a millisecond integer into a h/m/s/ms object with prefix zeros
    
    @param x int In milliseconds
    @return Object<string>{h,m,s,ms}
  ###
  @msToTimeString: (t)->

    time = @msToTime(t)

    time.h = @zfill(time.h, 2)
    time.m = @zfill(time.m, 2)
    time.s = @zfill(time.s, 2)
    time.ms = @zfill(time.ms, 4)

    return time

  ###
    Convert given integer to string and fill with heading zeros

    @param num int Number to convert/fill
    @param size int Desired string size
  ###
  @zfill: (num, size)->

    len = size - num.toString().length
    return if len > 0 then new Array(len+1).join('0') + num else num.toString()

###
  Exports
  @package bkcore
###
exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.Timer = Timer