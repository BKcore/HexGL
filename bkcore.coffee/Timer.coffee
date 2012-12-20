class Timer

  constructor: ()->

    @time =
      start: 0
      current: 0
      previous: 0
      elapsed: 0
      delta: 0

    @active = false

  start: ()->

    now = (new Date).getTime()

    @time.start = now
    @time.current = now
    @time.previous = now
    @time.elapsed = 0
    @time.delta = 0

    @active = true

  pause: (doPause)->

    @active = not doPause

  update: ()->

    if not active then return

    now = (new Date).getTime()

    @time.current = now
    @time.elapsed = @time.current - @time.start
    @time.delta = now - @time.previous
    @time.previous = now

  getElapsedTime: ()->

    return @constructor.msToTime(@time.elapsed)

  @msToTime: (t)->

    ms = t%1000
    s = Math.floor((t/1000)%60)
    m = Math.floor((t/60000)%60)
    h = Math.floor(t/3600000)

    return {h:h, m:m, s:s, ms,ms}

  @msToTimeString: (t)->

    time = @msToTime(t)

    time.h = @zfill(time.h, 2)
    time.m = @zfill(time.m, 2)
    time.s = @zfill(time.s, 2)
    time.ms = @zfill(time.ms, 4)

    return time

  @zfill: (num, size)->

    len = size - num.toString().length
    return if len > 0 then new Array(len+1).join('0') + num else num.toString()

exports = exports ? @
exports.bkcore.Timer = Timer