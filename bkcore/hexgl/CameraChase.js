 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.CameraChase = function(opts)
{
	this.dir = new THREE.Vector3(0,0,1);
	this.up = new THREE.Vector3(0,1,0);
	this.target = new THREE.Vector3();
	this.speedOffset = 0;
	this.speedOffsetMax = 10;
	this.speedOffsetStep = 0.05;

	this.modes = {
		CHASE: 0,
		ORBIT: 1
	}
	this.mode = this.modes.CHASE;

	this.camera = opts.camera;
	this.targetObject = opts.target;
	this.cameraCube = opts.cameraCube == undefined ? null : opts.cameraCube;

	this.yoffset = opts.yoffest == undefined ? 8.0 : opts.yoffest;
	this.zoffset = opts.zoffset == undefined ? 10.0 : opts.zoffset;
	this.viewOffset = opts.viewOffset == undefined ? 10.0 : opts.viewOffset;
	this.orbitOffset = 12;
	this.lerp = opts.lerp == undefined ? 0.5 : opts.lerp;
	this.time = 0.0;
}

bkcore.hexgl.CameraChase.prototype.update = function(dt, ratio)
{
	if(this.mode == this.modes.CHASE)
	{
		this.dir.set(0,0,1);
		this.up.set(0,1,0);

		this.targetObject.matrix.rotateAxis(this.up);
		this.targetObject.matrix.rotateAxis(this.dir);

		this.speedOffset += (this.speedOffsetMax*ratio - this.speedOffset) * Math.min(1, 0.3*dt);

		this.target.copy(this.targetObject.position);
		this.target.subSelf(this.dir.multiplyScalar(this.zoffset + this.speedOffset));
		this.target.addSelf(this.up.multiplyScalar(this.yoffset));
		this.target.y += -this.up.y + this.yoffset;
		this.camera.position.copy(this.target);
		
		this.camera.lookAt(this.dir.normalize().multiplyScalar(this.viewOffset).addSelf(this.targetObject.position));
	}
	else if(this.mode == this.modes.ORBIT)
	{
		this.time += dt*.008;
		this.dir.set(
			Math.cos(this.time)*this.orbitOffset,
			this.yoffset/2,
			Math.sin(this.time)*this.orbitOffset
		);
		this.target.copy(this.targetObject.position).addSelf(this.dir);
		this.camera.position.copy(this.target);
		this.camera.lookAt(this.targetObject.position);
	}

	if(this.cameraCube != null)
		this.cameraCube.rotation.copy(this.camera.rotation);
}