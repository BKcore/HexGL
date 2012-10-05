/*!
 * @class bkcore.threejs.Particles
 *
 * Particle system wrapper/helper
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 */

/*!
 * @package bkcore.threejs
 */ 
var bkcore = bkcore || {};
bkcore.threejs = bkcore.threejs || {};

/**
 * Creates a new particle system using given parameters
 * @param {Object{max, spawnRate, spawn, velocity, randomness, force, spawnRadius, life, friction, color, color2, tint, texture, size, blending, depthTest, transparent, opacity}} opts 
 */
bkcore.threejs.Particles = function(opts)
{
	this.black = new THREE.Color(0x000000);
	this.white = new THREE.Color(0xffffff);

	this.material = new THREE.ParticleBasicMaterial({
		color: opts.tint == undefined ? 0xffffff : opts.tint,
		map: opts.texture == undefined ? null : opts.texture,
		size: opts.size == undefined ? 4 : opts.size,
		blending: opts.blending == undefined ? THREE.AdditiveBlending : opts.blending,
		depthTest: opts.depthTest == undefined ? false : opts.depthTest,
		transparent: opts.transparent == undefined ? true : opts.transparent,
		vertexColors: true,
		opacity: opts.opacity == undefined ? 1.0 : opts.opacity,
		sizeAttenuation: true
	});

	this.max = opts.max == undefined ? 1000 : opts.max;
	this.spawnRate = opts.spawnRate == undefined ? 0 : opts.spawnRate;

	this.spawn = opts.spawn == undefined ? new THREE.Vector3() : opts.spawn;
	this.velocity = opts.velocity == undefined ? new THREE.Vector3() : opts.velocity;
	this.randomness = opts.randomness == undefined ? new THREE.Vector3() : opts.randomness;
	this.force = opts.force == undefined ? new THREE.Vector3() : opts.force;
	this.spawnRadius = opts.spawnRadius == undefined ? new THREE.Vector3() : opts.spawnRadius;
	this.life = opts.life == undefined ? 60 : opts.life;
	this.ageing = 1 / this.life;
	this.friction = opts.friction == undefined ? 1.0 : opts.friction;
	this.color = new THREE.Color(opts.color == undefined ? 0xffffff : opts.color);
	this.color2 = opts.color2 == undefined ? null : new THREE.Color(opts.color2);

	this.position = opts.position == undefined ? new THREE.Vector3() : opts.position;
	this.rotation = opts.rotation == undefined ? new THREE.Vector3() : opts.rotation;
	this.sort = opts.sort == undefined ? false : opts.sort;

	this.pool = [];
	this.buffer = [];
	this.geometry = null;
	this.system = null;

	this.build();
}

bkcore.threejs.Particles.prototype.build = function()
{
	this.geometry = new THREE.Geometry();
	this.geometry.dynamic = true;

	this.pool = [];
	this.buffer = [];

	for(var i = 0; i < this.max; ++i)
	{
		var p = new bkcore.threejs.Particle();
		this.pool.push(p);
		this.buffer.push(p);
		this.geometry.vertices.push(p.position);
		this.geometry.colors.push(p.color);
	}

	this.system = new THREE.ParticleSystem(this.geometry, this.material);
	this.system.position = this.position;
	this.system.rotation = this.rotation;
	this.system.sort = this.sort;
}

/**
 * Emits given number of particles
 * @param  int count
 */
bkcore.threejs.Particles.prototype.emit = function(count)
{
	var emitable = Math.min(count, this.pool.length);
	for(var i = 0; i < emitable; ++i)
	{
		var p = this.pool.pop();
		p.available = false;
		p.position.copy(this.spawn)
			.addSelf(
				this.randomVector()
				.multiplySelf(this.spawnRadius)
			);
		p.velocity.copy(this.velocity)
			.addSelf(
				this.randomVector()
				.multiplySelf(this.randomness)
			);
		p.force.copy(this.force);
		p.basecolor.copy(this.color);
		if(this.color2 != undefined) p.basecolor.lerpSelf(this.color2, Math.random());
		p.life = 1.0;
	}
}

bkcore.threejs.Particles.prototype.randomVector = function()
{
	return new THREE.Vector3(
			Math.random()*2-1,
			Math.random()*2-1,
			Math.random()*2-1
		);
}

/**
 * Updates particles (should be call in a RAF loop)
 * @param  float dt time delta ~1.0
 */
bkcore.threejs.Particles.prototype.update = function(dt)
{
	var p, l;
	var df = new THREE.Vector3();
	var dv = new THREE.Vector3();
	for(var i = 0; i < this.buffer.length; ++i)
	{

		p = this.buffer[i];

		if(p.available) continue;

		p.life -= this.ageing;

		if(p.life <= 0 && !p.available)
		{
			p.reset();
			this.pool.push(p);
			continue;
		}

		l = p.life > 0.5 ? 1.0 : p.life + 0.5;
		p.color.setRGB(
			l * p.basecolor.r, 
			l * p.basecolor.g, 
			l * p.basecolor.b
		);

		if(this.friction != 1.0)
			p.velocity.multiplyScalar(this.friction);

		df.copy(p.force).multiplyScalar(dt);
		p.velocity.addSelf(df);

		dv.copy(p.velocity).multiplyScalar(dt);
		p.position.addSelf(dv);
	}

	if(this.spawnRate > 0)
		this.emit(this.spawnRate);

	this.geometry.verticesNeedUpdate = true;
	this.geometry.colorsNeedUpdate = true;
}

bkcore.threejs.Particle = function()
{
	this.position = new THREE.Vector3(-10000,-10000,-10000);
	this.velocity = new THREE.Vector3();
	this.force = new THREE.Vector3();
	this.color = new THREE.Color(0x000000);
	this.basecolor = new THREE.Color(0x000000);
	this.life = 0.0;
	this.available = true;
}

bkcore.threejs.Particle.prototype.reset = function()
{
	this.position.set(0,-100000,0);
	this.velocity.set(0,0,0);
	this.force.set(0,0,0);
	this.color.setRGB(0,0,0);
	this.basecolor.setRGB(0,0,0);
	this.life = 0.0;
	this.available = true;
}