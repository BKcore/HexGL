###
  Various useful methods
  
  @class bkcore.Utils
  @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class Utils

  ###
    Creates a bkcore.threejs.Shaders["normalV"|"normal"] material
    with given parameters
  ###
  @createNormalMaterial = (opts)->

    opts ?= {}
    opts.ambient ?= 0x444444
    opts.normalScale ?= 1.0
    opts.reflectivity ?= 0.9
    opts.shininess ?= 42
    opts.metal ?= false

    shadername = if opts.perPixel then "normalV" else "normal"
    shader = bkcore.threejs.Shaders[shadername]
    uniforms = THREE.UniformsUtils.clone(shader.uniforms)

    uniforms["enableDiffuse"].value = true
    uniforms["enableSpecular"].value = true
    uniforms["enableReflection"].value = !!opts.cube
    uniforms["tNormal"].texture = opts.normal
    uniforms["tDiffuse"].texture = opts.diffuse
    uniforms["tSpecular"].texture = opts.specular
    uniforms["uAmbientColor"].value.setHex(opts.ambient)
    uniforms["uAmbientColor"].value.convertGammaToLinear()
    uniforms["uNormalScale"].value = opts.normalScale

    if opts.cube?
      uniforms["tCube"].texture = opts.cube
      uniforms["uReflectivity"].value = opts.reflectivity

    parameters = {
      fragmentShader: shader.fragmentShader
      vertexShader: shader.vertexShader
      uniforms: uniforms
      lights: true
      fog: false
    }

    material = new THREE.ShaderMaterial(parameters)
    material.perPixel = true
    material.metal = opts.metal

    return material

  ###
    Projects an object origin vector to screen using given camera
    @param  THREE.Object3D object The object which origin you want to project
    @param  THREE.Camera camera The camera of the projection
    @return THEE.Vector3 Projected verctor
  ###
  @projectOnScreen: (object, camera)->

    mat = new THREE.Matrix4()
    mat.multiply(camera.matrixWorldInverse, object.matrixWorld)
    mat.multiply(camera.projectionMatrix , mat)

    c = mat.n44
    lPos = new THREE.Vector3(mat.n14/c, mat.n24/c, mat.n34/c)
    return lPos.multiplyScalar(0.5).addScalar(0.5)

  ###
    Get an url parameter
    @param  String name Parameter slug
    @return Mixed
  ###
  @URLParameters: null
  @getURLParameter: (name)->

    if !@URLParameters?
      @URLParameters = {}
      window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, val)=>
        @URLParameters[key] = val
      )

    return @URLParameters[name]

  ###
    Get top offset of an element
    @param obj HTMLElement
  ###
  @getOffsetTop: (obj)->

    curtop = obj.offsetTop

    if obj.offsetParent
      while obj = obj.offsetParent
        curtop += obj.offsetTop

    return curtop

  ###
    Scrolls page to given element id
    @param  string id The ID of the element
  ###
  @scrollTo: (id)->

    window.scroll(0, @getOffsetTop(document.getElementById(id)))

  ###
    Add or remove a class from an element
    @param  string id       [description]
    @param  string cssclass [description]
    @param  bool active   [description]
  ###
  @updateClass: (id, cssclass, active)->

    e = document.getElementById(id)
    return unless e?
    
    if active
      e.classList.add(cssclass)
    else
      e.classList.remove(cssclass)

  ###
    Performs an XMLHttpRequest
    @param  string   url      [description]
    @param  bool   postData true = POST, false = GET
    @param  {Function} callback [description]
    @param  {Object}   data     [description]
  ###
  @request: (url, postData, callback, data)->

    XMLHttpFactories = [
      ()-> return new XMLHttpRequest()
      ()-> return new ActiveXObject("Msxml2.XMLHTTP")
      ()-> return new ActiveXObject("Msxml3.XMLHTTP")
      ()-> return new ActiveXObject("Microsoft.XMLHTTP")
    ]

    createXMLHTTPObject = () ->

      xmlhttp = false

      for i in [0..XMLHttpFactories.length]
        try
          xmlhttp = XMLHttpFactories[i]()
        catch e
          continue
        break

      return xmlhttp

    req = createXMLHTTPObject()
    return unless req?
    
    method = if postData? then "POST" else "GET"

    qdata = "o=bk"
    if data?
      for i, val of data
        qdata += "&"+i+"="+val
        url += "?"+qdata if postData?

    req.open(method,url,true)

    if postData?
      req.setRequestHeader('Content-type','application/x-www-form-urlencoded')

    req.onreadystatechange = () ->
      return unless req.readyState is 4
      return unless req.status is 200 or req.status is 304
      callback?(req)

    req.send(qdata)
  
    return req

  ###
    Checks whether the device supports Touch input
  ###
  @isTouchDevice: ()->

    return ('ontouchstart' of window) or
        (navigator.MaxTouchPoints > 0) or
        (navigator.msMaxTouchPoints > 0)

###
  Exports
  @package bkcore
###
exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.Utils = Utils