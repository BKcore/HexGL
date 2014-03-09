 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License.
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.ShipEffects = function(opts)
{
	this.scene = opts.scene;
	this.shipControls = opts.shipControls;

	this.booster = opts.booster;
	this.boosterLight = opts.boosterLight;
	this.boosterSprite = opts.boosterSprite;

	this.useParticles = opts.useParticles;

	if(this.useParticles)
	{
		this.pVel = new THREE.Vector3(0.5,0,0);
		this.pOffset = new THREE.Vector3(-3,-0.3,0);
		this.pRad = new THREE.Vector3(0,0,1.5);

		this.shipVelocity = new THREE.Vector3();

		this.pVelS = this.pVel.length();
		this.pOffsetS = this.pOffset.length();
		this.pRadS = this.pRad.length();

		this.pVel.normalize();
		this.pOffset.normalize();
		this.pRad.normalize();

		this.particles = {

			leftSparks: new bkcore.threejs.Particles(
			{
				randomness: new THREE.Vector3(0.4,0.4,0.4),
				tint: 0xffffff,
				color: 0xffc000,
				color2: 0xffffff,
				texture: opts.textureSpark,
				size: 2,
				life: 60,
				max: 200
			}),

			leftClouds: new bkcore.threejs.Particles(
			{
				opacity: 0.8,
				tint: 0xffffff,
				color: 0x666666,
				color2: 0xa4f1ff,
				texture: opts.textureCloud,
				size: 6,
				blending: THREE.NormalBlending,
				life: 60,
				max: 200,
				spawn: new THREE.Vector3(3,-0.3,0),
				spawnRadius: new THREE.Vector3(1,1,2),
				velocity: new THREE.Vector3(0,0,-0.4),
				randomness: new THREE.Vector3(0.05,0.05,0.1)
			}),

			rightSparks: new bkcore.threejs.Particles(
			{
				randomness: new THREE.Vector3(0.4,0.4,0.4),
				tint: 0xffffff,
				color: 0xffc000,
				color2: 0xffffff,
				texture: opts.textureSpark,
				size: 2,
				life: 60,
				max: 200
			}),

			rightClouds: new bkcore.threejs.Particles(
			{
				opacity: 0.8,
				tint: 0xffffff,
				color: 0x666666,
				color2: 0xa4f1ff,
				texture: opts.textureCloud,
				size: 6,
				blending: THREE.NormalBlending,
				life: 60,
				max: 200,
				spawn: new THREE.Vector3(-3,-0.3,0),
				spawnRadius: new THREE.Vector3(1,1,2),
				velocity: new THREE.Vector3(0,0,-0.4),
				randomness: new THREE.Vector3(0.05,0.05,0.1)
			})
		};

		this.shipControls.mesh.add(this.particles.leftClouds.system);
		this.shipControls.mesh.add(this.particles.rightClouds.system);
		this.scene.add(this.particles.leftSparks.system);
		this.scene.add(this.particles.rightSparks.system);
	}
}

bkcore.hexgl.ShipEffects.prototype.update = function(dt)
{
	var boostRatio, opacity, scale, intensity, random;

	if(this.shipControls.destroyed)
	{
		opacity = 0;
		scale = 0;
		intensity = 0;
		random = 0;
	}
	else
	{
		boostRatio = this.shipControls.getBoostRatio();
		opacity = this.shipControls.key.forward ? 0.8 : 0.3 + boostRatio * 0.4;
		scale = (this.shipControls.key.forward ? 1.0 : 0.8) + boostRatio * 0.5;
		intensity = this.shipControls.key.forward ? 4.0 : 2.0;
		random = Math.random()*0.2;
	}

	if(this.booster)
	{
		this.booster.rotation.z += 1;
		this.booster.scale.set(scale, scale, scale);
		this.booster.material.opacity = random+opacity;
		this.boosterSprite.opacity = random+opacity;
		this.boosterLight.intensity = intensity*(random+0.8);
	}

	// PARTICLES
	if(this.useParticles)
	{
		this.shipVelocity.copy(this.shipControls.currentVelocity).multiplyScalar(0.7);

		this.particles.rightSparks.velocity.copy(this.pVel);
		this.particles.rightSparks.spawnRadius.copy(this.pRad);
		this.particles.rightSparks.spawn.copy(this.pOffset);

		this.particles.leftSparks.velocity.copy(this.pVel).x *= -1;
		this.particles.leftSparks.spawn.copy(this.pOffset).x *= -1;

		if(this.shipControls.mesh)
		{
			// RIGHT
			this.shipControls.mesh.matrix.rotateAxis(this.particles.rightSparks.spawn);
			this.particles.rightSparks.spawn.multiplyScalar(this.pOffsetS).addSelf(this.shipControls.dummy.position);

			this.shipControls.mesh.matrix.rotateAxis(this.particles.rightSparks.velocity);
			this.particles.rightSparks.velocity.multiplyScalar(this.pVelS).addSelf(this.shipVelocity);

			this.shipControls.mesh.matrix.rotateAxis(this.particles.rightSparks.spawnRadius);
			this.particles.rightSparks.spawnRadius.multiplyScalar(this.pRadS);

			// LEFT
			this.shipControls.mesh.matrix.rotateAxis(this.particles.leftSparks.spawn);
			this.particles.leftSparks.spawn.multiplyScalar(this.pOffsetS).addSelf(this.shipControls.dummy.position);

			this.shipControls.mesh.matrix.rotateAxis(this.particles.leftSparks.velocity);
			this.particles.leftSparks.velocity.multiplyScalar(this.pVelS).addSelf(this.shipVelocity);

			this.particles.leftSparks.spawnRadius.copy(this.particles.rightSparks.spawnRadius);
		}

		if(this.shipControls.collision.right)
		{
			this.particles.rightSparks.emit(10);
			this.particles.rightClouds.emit(5);
		}

		if(this.shipControls.collision.left)
		{
			this.particles.leftSparks.emit(10);
			this.particles.leftClouds.emit(5);
		}

		this.particles.rightSparks.update(dt);
		this.particles.rightClouds.update(dt);
		this.particles.leftSparks.update(dt);
		this.particles.leftClouds.update(dt);
	}
}
