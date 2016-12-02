###
  BmwController (Orientation + Gas Pedal) for BMW i3 Input

  @class bkcore.BmwController
  @author Frank Blechschmidt <http://twitter.com/frable90>
###
class BmwController

  @isCompatible: ->
    return 'bmwConnector' of navigator

  ###
    Creates a new BmwController
  ###
  constructor: (@actionCallback) ->
    @active = true

  ###
    @public
  ###
  updateAvailable: ->
    bmwConnector = navigator.bmwConnector
    return false if not @active or not bmwConnector
    @steeringAngle = bmwConnector.steeringAngle / 100 #-1.0(left)...+1.0(right)
    console.log(bmwConnector.steeringAngle)
    @accelerationPedal = bmwConnector.accelerationPedal / 100 #0...1
    @actionCallback this
    true

exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.controllers ||= {}
exports.bkcore.controllers.BmwController = BmwController
