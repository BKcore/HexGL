$ = (_) -> document.getElementById _

init = (controlType, quality, hud, godmode) ->
  hexGL = new bkcore.hexgl.HexGL(
    document: document
    width: window.innerWidth
    height: window.innerHeight
    container: $ 'main'
    overlay: $ 'overlay'
    gameover: $ 'step-5'
    quality: quality
    difficulty: 0
    hud: hud is 1
    controlType: controlType
    godmode: godmode
    track: 'Cityscape'
  )
  window.hexGL=hexGL

  progressbar = $ 'progressbar'
  hexGL.load(
    onLoad: ->
      console.log 'LOADED.'
      hexGL.init()
      $('step-3').style.display = 'none'
      $('step-4').style.display = 'block'
      hexGL.start()
    onError: (s) ->
      console.error "Error loading #{ s }."
    onProgress: (p, t, n) ->
      console.log("LOADED "+t+" : "+n+" ( "+p.loaded+" / "+p.total+" ).")
      progressbar.style.width = "#{ p.loaded / p.total * 100 }%"
  )

u = bkcore.Utils.getURLParameter

defaultControls = if bkcore.Utils.isTouchDevice() then 1 else 0

s = [
  ['controlType', ['KEYBOARD', 'TOUCH', 'LEAP MOTION CONTROLLER',
    'GAMEPAD'], defaultControls, defaultControls, 'Controls: ']
  ['quality', ['LOW', 'MID', 'HIGH', 'VERY HIGH'], 3, 3, 'Quality: ']
  ['hud', ['OFF', 'ON'], 1, 1, 'HUD: ']
  ['godmode', ['OFF', 'ON'], 0, 1, 'Godmode: ']
]

for a in s
  do(a)->
    a[3] = u(a[0]) ? a[2]
    e = $ "s-#{a[0]}"
    (f = -> e.innerHTML = a[4]+a[1][a[3]])()
    e.onclick = -> f(a[3] = (a[3]+1)%a[1].length)
$('step-2').onclick = ->
  $('step-2').style.display = 'none'
  $('step-3').style.display = 'block'
  init s[0][3], s[1][3], s[2][3], s[3][3]
$('step-5').onclick = ->
  window.location.reload()
$('s-credits').onclick = ->
  $('step-1').style.display = 'none'
  $('credits').style.display = 'block'
$('credits').onclick = ->
  $('step-1').style.display = 'block'
  $('credits').style.display = 'none'

hasWebGL = ->
  gl = null
  canvas = document.createElement('canvas');
  try
    gl = canvas.getContext("webgl")
  if not gl?
    try
      gl = canvas.getContext("experimental-webgl")
  return gl?

if not hasWebGL()
  getWebGL = $('start')
  getWebGL.innerHTML = 'WebGL is not supported!'
  getWebGL.onclick = ->
    window.location.href = 'http://get.webgl.org/'
else
  $('start').onclick = ->
    $('step-1').style.display = 'none'
    $('step-2').style.display = 'block'
    $('step-2').style.backgroundImage = "url(css/help-#{s[0][3]}.png)"
