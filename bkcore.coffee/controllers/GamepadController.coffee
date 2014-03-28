###
  GamepadController (Orientation + buttons) for touch devices
  
  @class bkcore.GamepadController
  @author Mahesh Kulkarni <http://twitter.com/maheshkk>
###
class GamepadController

  @isCompatible: ->
    return ('gamepadconnected' of window)

  ###
    Creates a new GamepadController
  ###
  constructor: ->
    @active = true
    @leftStickArray = []
    @rightStickArray = []

  ###
    @public
  ###
  updateAvailable: ->
    return false if not @active
    gamepads = navigator.getGamepads()
    return false if !gamepads?[0]

    # Left stick and Right sticks are button 10 and 11 respectively as per spec. 
    @leftStickValues = gamepads[0].buttons?[10]
    @rightStickValues = gamepads[0].buttons?[11]

    # We are only interested in leftStick up/down value and 
    # rightStick left/right value.
    @leftStick = @leftStickValues?[1]
    @rightStick = @rightStickValues?[1]
    true

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.GamepadController = GamepadController