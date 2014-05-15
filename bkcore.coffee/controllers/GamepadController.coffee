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
    return false if !gamepads?[0]

    # We are only interested in leftStick up/down value and 
    # rightStick left/right value.
    @leftStick = gamepads[0].axes?[1]
    @rightStick = gamepads[0].axes?[2]
    @pause = gamepads[0].buttons?[1]
    @restart = gamepads[0].buttons?[0]
    @buttonPressCallback(@leftStick, @restart, @pause)

    true

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.GamepadController = GamepadController
