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
    @acceleration = gamepads[0].buttons?[7]
    @leftStick = gamepads[0].axes?[0]
    @buttonPressCallback(@acceleration, gamepads[0].buttons?[1])

    true

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.GamepadController = GamepadController
