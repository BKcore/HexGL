###
  OrientationController (Orientation + buttons) for touch devices
  
  @class bkcore.OrientationController
  @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class OrientationController

  @isCompatible: ->
    return ('DeviceOrientationEvent' of window)

  ###
    Creates a new OrientationController

    @param dom DOMElement The element that will listen to touch events
    @param registerTouch bool Enable touch detection
    @param touchCallback function Callback for touches
  ###
  constructor: (@dom, @registerTouch=true, @touchCallback=null) ->
    @active = true
    @alpha = 0.0
    @beta = 0.0
    @gamma  = 0.0
    @dalpha = null
    @dbeta = null
    @dgamma = null
    @touches = null

    window.addEventListener('deviceorientation', ((e)=> @orientationChange(e)), false)
    if @registerTouch
      @dom.addEventListener('touchstart', ((e)=> @touchStart(e)), false)
      @dom.addEventListener('touchend', ((e)=> @touchEnd(e)), false)

  ###
    @private
  ###
  orientationChange: (event) ->
    return if not @active
    if(@dalpha == null)
      console.log "calbrate", event.beta 
      @dalpha = event.alpha
      @dbeta = event.beta
      @dgamma = event.gamma
    @alpha = event.alpha - @dalpha
    @beta = event.beta - @dbeta
    @gamma = event.gamma - @dgamma
    false

  ###
    @private
  ###
  touchStart: (event) ->
    return if not @active
    for touch in event.changedTouches
        @touchCallback?(on, touch, event)
    @touches = event.touches
    false

  ###
    @private
  ###
  touchEnd: (event) ->
    return if not @active
    for touch in event.changedTouches
        @touchCallback?(on, touch, event)
    @touches = event.touches
    false

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.OrientationController = OrientationController