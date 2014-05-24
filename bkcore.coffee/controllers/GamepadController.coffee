###
  GamepadController (Orientation + buttons) for touch devices

  @class bkcore.GamepadController
  @author Mahesh Kulkarni <http://twitter.com/maheshkk>
###
class GamepadController

  @isCompatible: ->
    return ('getGamepads' of navigator) or ('webkitGetGamepads' of navigator)

  ###
    Creates a new GamepadController
  ###
  constructor: (@buttonPressCallback) ->
    @active = true
    @leftStickArray = []
    @rightStickArray = []

  ###
    @public
  ###
  updateAvailable: ->
    return false if not @active
    gamepads = if navigator.getGamepads then navigator.getGamepads() else navigator.webkitGetGamepads()
    return false if not gamepads?[0]
    gp = gamepads[0]
    return if not gp.buttons? or not gp.axes?
    @lstickx = gp.axes[0]
    accel = gp.buttons[0]
    lt = gp.buttons[6]
    rt = gp.buttons[7]
    sel = gp.buttons[8]
    # API fallback
    @acceleration = accel.pressed ? accel
    @ltrigger = lt.pressed ? lt
    @rtrigger = rt.pressed ? rt
    @select = sel.pressed ? sel
    @buttonPressCallback this
    true

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.GamepadController = GamepadController
