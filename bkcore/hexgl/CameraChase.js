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

	this.camera = opts.camera;
	this.targetObject = opts.target;
	this.cameraCube = opts.cameraCube == undefined ? null : opts.cameraCube;

	this.yoffset = opts.yoffest == undefined ? 8.0 : opts.yoffest;
	this.zoffset = opts.zoffset == undefined ? 10.0 : opts.zoffset;
	this.viewOffset = opts.viewOffset == undefined ? 10.0 : opts.viewOffset;
	this.lerp = opts.lerp == undefined ? 0.5 : opts.lerp;
}

bkcore.hexgl.CameraChase.prototype.update = function(dt, ratio)
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
	this.camera.position.copy(this.target, this.lerp);
	
	this.camera.lookAt(this.dir.normalize().multiplyScalar(this.viewOffset).addSelf(this.targetObject.position));

	if(this.cameraCube != null)
		this.cameraCube.rotation.copy(this.camera.rotation);
}