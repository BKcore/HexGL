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
    @acceleration = gp.buttons[0]
    @lstickx = gp.axes[0]
    @ltrigger = gp.buttons[6]
    @rtrigger = gp.buttons[7]
    @select = gp.buttons[8]
    @buttonPressCallback this
    true

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.GamepadController = GamepadController
