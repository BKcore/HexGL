###
  TouchController (stick + buttons) for touch devices
  Based on the touch demo by Seb Lee-Delisle <http://seb.ly/>
  
  @class bkcore.controllers.TouchController
  @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class TouchController

  @isCompatible: ->
    return ('ontouchstart' of document.documentElement);

  ###
    Creates a new TouchController

    @param dom DOMElement The element that will listen to touch events
    @param stickMargin int The left margin in px for stick detection
    @param buttonCallback function Callback for non-stick touches
  ###
  constructor: (@dom, @stickMargin=200, @buttonCallback=null) ->
    @active = true
    @touches = null
    @stickID = -1
    @stickPos = new Vec2(0, 0)
    @stickStartPos = new Vec2(0, 0)
    @stickVector = new Vec2(0, 0)

    @dom.addEventListener('touchstart', ((e)=> @touchStart(e)), false)
    @dom.addEventListener('touchmove', ((e)=> @touchMove(e)), false)
    @dom.addEventListener('touchend', ((e)=> @touchEnd(e)), false)

  ###
    @private
  ###
  touchStart: (event) ->
    return if not @active
    for touch in event.changedTouches
      if @stickID < 0 and touch.clientX < @stickMargin
        @stickID = touch.identifier
        @stickStartPos.set(touch.clientX, touch.clientY)
        @stickPos.copy(@stickStartPos)
        @stickVector.set(0, 0)
        continue
      else
        @buttonCallback?(on, touch, event)
    @touches = event.touches
    false

  ###
    @private
  ###
  touchMove: (event) ->
    event.preventDefault()
    return if not @active
    for touch in event.changedTouches
      if @stickID is touch.identifier and touch.clientX < @stickMargin
        @stickPos.set(touch.clientX, touch.clientY)
        @stickVector.copy(@stickPos).substract(@stickStartPos)
        break
    @touches = event.touches
    false

  ###
    @private
  ###
  touchEnd: (event) ->
    return if not @active
    @touches = event.touches
    for touch in event.changedTouches
      if @stickID is touch.identifier
        @stickID = -1
        @stickVector.set(0, 0)
        break
      else
        @buttonCallback?(off, touch, event)
    false

###
  Internal class used for vector2
  @class Vec2
  @private
###
class Vec2

  constructor: (@x = 0, @y = 0) ->

  substract: (vec) ->
    @x -= vec.x
    @y -= vec.y
    @

  copy: (vec) ->
    @x = vec.x
    @y = vec.y
    @

  set: (x, y) ->
    @x = x
    @y = y
    @
	
###
  Exports
  @package bkcore
###
exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.TouchController = TouchController