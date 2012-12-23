###
  Particle system wrapper/helper
  
  @class bkcore.threejs.Particles
  @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class Particles

  ###
    Creates a new particle system using given parameters
    
    @param {Object{max, spawnRate, spawn, velocity, randomness,
    force, spawnRadius, life, friction, color, color2, tint,
    texture, size, blending, depthTest, transparent, opacity}} opts
  ###
  constructor: (opts)->
    
    @black = new THREE.Color(0x000000)
    @white = new THREE.Color(0xffffff)

    @material = new THREE.ParticleBasicMaterial(
      color: opts.tint ? 0xffffff
      map: opts.texture ? null
      size: opts.size ? 4
      blending: opts.blending ? THREE.AdditiveBlending
      depthTest: opts.depthTest ? false
      transparent: opts.transparent ? true
      vertexColors: true
      opacity: opts.opacity ? 1.0
      sizeAttenuation: true
    )

    @max = opts.max ? 1000
    @spawnRate = opts.spawnRate ? 0

    @spawn = opts.spawn ? new THREE.Vector3()
    @velocity = opts.velocity ? new THREE.Vector3()
    @randomness = opts.randomness ? new THREE.Vector3()
    @force = opts.force ? new THREE.Vector3()
    @spawnRadius = opts.spawnRadius ? new THREE.Vector3()
    @life = opts.life ? 60
    @ageing = 1 / @life
    @friction = opts.friction ? 1.0
    @color = new THREE.Color(opts.color ? 0xffffff)
    @color2 = if opts.color2? then new THREE.Color(opts.color2) else null

    @position = opts.position ? new THREE.Vector3()
    @rotation = opts.rotation ? new THREE.Vector3()
    @sort = opts.sort ? false

    @pool = []
    @buffer = []
    @geometry = null
    @system = null

    @build()

  ###
    Emits given number of particles
    @param  int count
  ###
  emit: (count)->

    emitable = Math.min(count, @pool.length)

    for i in [0..emitable]

      p = @pool.pop()
      p.available = false

      p.position.copy(@spawn).addSelf(
        @randomVector().multiplySelf(@spawnRadius)
      )
      p.velocity.copy(@velocity).addSelf(
        @randomVector().multiplySelf(@randomness)
      )
      p.force.copy(@force)
      p.basecolor.copy(@color)

      if @color2?
        p.basecolor.lerpSelf(@color2, Math.random())

      p.life = 1.0
  
  ###
    @private
  ###
  build: ()->

    @geometry = new THREE.Geometry()
    @geometry.dynamic = true

    @pool = []
    @buffer = []

    for i in [0..@max]

      p = new bkcore.threejs.Particle()
      @pool.push(p)
      @buffer.push(p)
      @geometry.vertices.push(p.position)
      @geometry.colors.push(p.color)

    @system = new THREE.ParticleSystem(@geometry, @material)
    @system.position = @position
    @system.rotation = @rotation
    @system.sort = @sort

  ###
    @private
  ###
  randomVector: ()->

    return new THREE.Vector3(
      Math.random()*2-1,
      Math.random()*2-1,
      Math.random()*2-1
    )

  ###
    Updates particles (should be call in a RAF loop)
    @param  float dt time delta ~1.0
  ###
  update: (dt)->

    df = new THREE.Vector3()
    dv = new THREE.Vector3()

    for i in [0..@buffer.length]

      p = @buffer[i]
      continue if p.available

      p.life -= @ageing

      if p.life <= 0
        p.reset()
        @pool.push(p)
        continue


      l = if p.life > 0.5 then 1.0 else p.life + 0.5
      p.color.setRGB(
        l * p.basecolor.r,
        l * p.basecolor.g,
        l * p.basecolor.b
      )

      if @friction != 1.0
        p.velocity.multiplyScalar(@friction)

      df.copy(p.force).multiplyScalar(dt)
      p.velocity.addSelf(df)

      dv.copy(p.velocity).multiplyScalar(dt)
      p.position.addSelf(dv)

    if @spawnRate > 0
      @emit(@spawnRate)

    @geometry.verticesNeedUpdate = true
    @geometry.colorsNeedUpdate = true

###
  Particle sub class
  
  @class bkcore.threejs.Particle
  @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
###
class Particle

  constructor: ()->

    @position = new THREE.Vector3(-10000,-10000,-10000)
    @velocity = new THREE.Vector3()
    @force = new THREE.Vector3()
    @color = new THREE.Color(0x000000)
    @basecolor = new THREE.Color(0x000000)
    @life = 0.0
    @available = true

  reset: ()->
    @position.set(0,-100000,0)
    @velocity.set(0,0,0)
    @force.set(0,0,0)
    @color.setRGB(0,0,0)
    @basecolor.setRGB(0,0,0)
    @life = 0.0
    @available = true

###
  Exports
  @package bkcore.threejs
###
exports = exports ? @
exports.bkcore ||= {}
exports.bkcore.threejs ||= {}
exports.bkcore.threejs.Particle = Particle
exports.bkcore.threejs.Particles = Particles
