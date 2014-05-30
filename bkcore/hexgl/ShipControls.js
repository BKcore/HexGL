 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License.
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.ShipControls = function(ctx)
{
	var self = this;
	var domElement = ctx.document;

	this.active = true;
	this.destroyed = false;
	this.falling = false;

	this.dom = domElement;
	this.mesh = null;

	this.epsilon = 0.00000001;
	this.zero = new THREE.Vector3(0,0,0);
	this.airResist = 0.02;
	this.airDrift = 0.1;
	this.thrust = 0.02;
	this.airBrake = 0.02;
	this.maxSpeed = 7.0;
	this.boosterSpeed = this.maxSpeed * 0.2;
	this.boosterDecay = 0.01;
	this.angularSpeed = 0.005;
	this.airAngularSpeed = 0.0065;
	this.repulsionRatio = 0.5;
	this.repulsionCap = 2.5;
	this.repulsionLerp = 0.1;
	this.collisionSpeedDecrease = 0.8;
	this.collisionSpeedDecreaseCoef = 0.8;
	this.maxShield = 1.0;
	this.shieldDelay = 60;
	this.shieldTiming = 0;
	this.shieldDamage = 0.25;
	this.driftLerp = 0.35;
	this.angularLerp = 0.35;

	this.movement = new THREE.Vector3(0,0,0);
	this.rotation = new THREE.Vector3(0,0,0);
	this.roll = 0.0;
	this.rollAxis = new THREE.Vector3();
	this.drift = 0.0;
	this.speed = 0.0;
	this.speedRatio = 0.0;
	this.boost = 0.0;
	this.shield = 1.0;
	this.angular = 0.0;

	this.currentVelocity = new THREE.Vector3();

	this.quaternion = new THREE.Quaternion();

	this.dummy = new THREE.Object3D();
	this.dummy.useQuaternion = true;

	this.collisionMap = null;
	this.collisionPixelRatio = 1.0;
	this.collisionDetection = false;
	this.collisionPreviousPosition = new THREE.Vector3();

	this.heightMap = null;
	this.heightPixelRatio = 1.0;
	this.heightBias = 0.0;
	this.heightLerp = 0.4;
	this.heightScale = 1.0;

	this.rollAngle = 0.6;
	this.rollLerp = 0.08;
	this.rollDirection = new THREE.Vector3(0,0,1);

	this.gradient = 0.0;
	this.gradientTarget = 0.0;
	this.gradientLerp = 0.05;
	this.gradientScale = 4.0;
	this.gradientVector = new THREE.Vector3(0,0,5);
	this.gradientAxis = new THREE.Vector3(1,0,0);

	this.tilt = 0.0;
	this.tiltTarget = 0.0;
	this.tiltLerp = 0.05;
	this.tiltScale = 4.0;
	this.tiltVector = new THREE.Vector3(5,0,0);
	this.tiltAxis = new THREE.Vector3(0,0,1);

	this.repulsionVLeft = new THREE.Vector3(1,0,0);
	this.repulsionVRight = new THREE.Vector3(-1,0,0);
	this.repulsionVFront = new THREE.Vector3(0,0,1);
	this.repulsionVScale = 4.0;
	this.repulsionAmount = 0.0;
	this.repulsionForce = new THREE.Vector3();

	this.fallVector = new THREE.Vector3(0,-20,0);

	this.resetPos = null;
	this.resetRot = null;

	this.key = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		ltrigger: false,
		rtrigger: false,
		use: false
	};

	this.collision = {
		front: false,
		left: false,
		right: false
	};

	this.touchController = null;
	this.orientationController = null;
	this.gamepadController = null

	if(ctx.controlType == 1 && bkcore.controllers.TouchController.isCompatible())
	{
		this.touchController = new bkcore.controllers.TouchController(
			domElement, ctx.width/2,
			function(state, touch, event){
				if(event.touches.length >= 4)
					window.location.reload(false);
				else if(event.touches.length == 3)
					ctx.restart();
				// touch was on the right-hand side of the screen
				else if (touch.clientX > (ctx.width / 2)) {
					if (event.type === 'touchend')
						self.key.forward = false;
					else
						self.key.forward = true;
				}
			});
	}
	else if(ctx.controlType == 4 && bkcore.controllers.OrientationController.isCompatible())
	{
		this.orientationController = new bkcore.controllers.OrientationController(
			domElement, true,
			function(state, touch, event){
				if(event.touches.length >= 4)
					window.location.reload(false);
				else if(event.touches.length == 3)
					ctx.restart();
				else if(event.touches.length < 1)
					self.key.forward = false;
				else
					self.key.forward = true;
			});
	}
	else if(ctx.controlType == 3 && bkcore.controllers.GamepadController.isCompatible())
	{
		this.gamepadController = new bkcore.controllers.GamepadController(
      function(controller){
        if (controller.select)
          ctx.restart();
        else
          self.key.forward = controller.acceleration > 0;
          self.key.ltrigger = controller.ltrigger > 0;
          self.key.rtrigger = controller.rtrigger > 0;
          self.key.left = controller.lstickx < -0.1;
          self.key.right = controller.lstickx > 0.1;
      });
	}
	else if(ctx.controlType == 2)
	{
		if(Leap == null)
			throw new Error("Unable to reach LeapJS!");

		var leapInfo = this.leapInfo = document.getElementById('leapinfo');
		isServerConnected = false;
		var lb = this.leapBridge = {
			isConnected: true,
			hasHands: false,
			palmNormal: [0, 0, 0]
		};

		function updateInfo()
		{
			if(!isServerConnected)
			{
				leapInfo.innerHTML = 'Waiting for the Leap Motion Controller server...'
				leapInfo.style.display = 'block';
			}
			else if(lb.isConnected && lb.hasHands)
			{
				leapInfo.style.display = 'none';
			}
			else if(!lb.isConnected)
			{
				leapInfo.innerHTML = 'Please connect your Leap Motion Controller.'
				leapInfo.style.display = 'block';
			}
			else if(!lb.hasHands)
			{
				leapInfo.innerHTML = 'Put your hand over the Leap Motion Controller to play.'
				leapInfo.style.display = 'block';
			}
		}
		updateInfo();

		var lc = this.leapController =  new Leap.Controller({enableGestures: false});
		lc.on('connect', function()
		{
			isServerConnected = true;
			updateInfo();
		});
		lc.on('deviceConnected', function()
		{
			lb.isConnected = true;
			updateInfo();
		});
		lc.on('deviceDisconnected', function()
		{
			lb.isConnected = false;
			updateInfo();
		});
		lc.on('frame', function(frame)
		{
			if(!lb.isConnected) return;
		  hand = frame.hands[0];
			if(typeof hand === 'undefined')
			{
				if(lb.hasHands)
				{
					lb.hasHands = false;
					updateInfo();
				}
				lb.palmNormal = [0, 0, 0];
			}
			else
			{
				if(!lb.hasHands)
				{
					lb.hasHands = true;
					updateInfo();
				}
				lb.palmNormal = hand.palmNormal;
			}
		});
		lc.connect();
	}

	function onKeyDown(event)
	{
		switch(event.keyCode)
		{
			case 38: /*up*/	self.key.forward = true; break;

			case 40: /*down*/self.key.backward = true; break;

			case 37: /*left*/self.key.left = true; break;

			case 39: /*right*/self.key.right = true; break;

			case 81: /*Q*/self.key.ltrigger = true; break;
			case 65: /*A*/self.key.ltrigger = true; break;

			case 68: /*D*/self.key.rtrigger = true; break;
			case 69: /*E*/self.key.rtrigger = true; break;
		}
	};

	function onKeyUp(event)
	{
		switch(event.keyCode)
		{
			case 38: /*up*/	self.key.forward = false; break;

			case 40: /*down*/self.key.backward = false; break;

			case 37: /*left*/self.key.left = false; break;

			case 39: /*right*/self.key.right = false; break;

			case 81: /*Q*/self.key.ltrigger = false; break;
			case 65: /*A*/self.key.ltrigger = false; break;

			case 68: /*D*/self.key.rtrigger = false; break;
			case 69: /*E*/self.key.rtrigger = false; break;
		}
	};

	domElement.addEventListener('keydown', onKeyDown, false);
	domElement.addEventListener('keyup', onKeyUp, false);
};

bkcore.hexgl.ShipControls.prototype.control = function(threeMesh)
{
	this.mesh = threeMesh;
	this.mesh.martixAutoUpdate = false;
	this.dummy.position = this.mesh.position;
};

bkcore.hexgl.ShipControls.prototype.reset = function(position, rotation)
{
	this.resetPos = position;
	this.resetRot = rotation;
	this.movement.set(0,0,0);
	this.rotation.copy(rotation);
	this.roll = 0.0;
	this.drift = 0.0;
	this.speed = 0.0;
	this.speedRatio = 0.0;
	this.boost = 0.0;
	this.shield = this.maxShield;
	this.destroyed = false;

	this.dummy.position.copy(position);
	this.quaternion.set(rotation.x, rotation.y, rotation.z, 1).normalize();
	this.dummy.quaternion.set(0,0,0,1);
	this.dummy.quaternion.multiplySelf(this.quaternion);

	this.dummy.matrix.setPosition(this.dummy.position);
	this.dummy.matrix.setRotationFromQuaternion(this.dummy.quaternion);

	this.mesh.matrix.identity();
	this.mesh.applyMatrix(this.dummy.matrix);
}

bkcore.hexgl.ShipControls.prototype.terminate = function()
{
	this.destroy();

	if(this.leapController != null)
	{
		this.leapController.disconnect();
		this.leapInfo.style.display = 'none';
	}
}

bkcore.hexgl.ShipControls.prototype.destroy = function()
{
	this.active = false;
	this.destroyed = true;
	this.collision.front = false;
	this.collision.left = false;
	this.collision.right = false;
}

bkcore.hexgl.ShipControls.prototype.fall = function()
{
	this.active = false;
	this.collision.front = false;
	this.collision.left = false;
	this.collision.right = false;
	this.falling = true;
	_this = this;
	setTimeout(function(){
		_this.destroyed = true;
	}, 1500);
}

bkcore.hexgl.ShipControls.prototype.update = function(dt)
{
	if(this.falling)
	{
		this.mesh.position.addSelf(this.fallVector);
		return;
	}

	this.rotation.y = 0;
	this.movement.set(0,0,0);
	this.drift += (0.0 - this.drift) * this.driftLerp;
	this.angular += (0.0 - this.angular) * this.angularLerp * 0.5;

	var rollAmount = 0.0;
	var angularAmount = 0.0;
	var yawLeap = 0.0;

	if(this.leapBridge != null && this.leapBridge.hasHands)
	{
		rollAmount -= this.leapBridge.palmNormal[0] * 3.5 * this.rollAngle;
		yawLeap = -this.leapBridge.palmNormal[2] * 0.6;
	}

	if(this.active)
	{

		if(this.touchController != null)
		{
			angularAmount -= this.touchController.stickVector.x/100 * this.angularSpeed * dt;
			rollAmount += this.touchController.stickVector.x/100 * this.rollAngle;
		}
		else if(this.orientationController != null)
		{
			angularAmount += this.orientationController.beta/45 * this.angularSpeed * dt;
			rollAmount -= this.orientationController.beta/45 * this.rollAngle;
		}
		else if(this.gamepadController != null && this.gamepadController.updateAvailable())
		{
			angularAmount -= this.gamepadController.lstickx * this.angularSpeed * dt;
			rollAmount += this.gamepadController.lstickx * this.rollAngle;
		}
		else if(this.leapBridge != null && this.leapBridge.hasHands)
		{
			angularAmount += this.leapBridge.palmNormal[0] * 2 * this.angularSpeed * dt;
			this.speed += Math.max(0.0, (0.5 + this.leapBridge.palmNormal[2])) * 3 * this.thrust * dt;
		}
		else
		{
			if(this.key.left)
			{
				angularAmount += this.angularSpeed * dt;
				rollAmount -= this.rollAngle;
			}
			if(this.key.right)
			{
				angularAmount -= this.angularSpeed * dt;
				rollAmount += this.rollAngle;
			}
		}

		if(this.key.forward)
			this.speed += this.thrust * dt;
		else
			this.speed -= this.airResist * dt;
		if(this.key.ltrigger)
		{
			if(this.key.left)
				angularAmount += this.airAngularSpeed * dt;
			else
				angularAmount += this.airAngularSpeed * 0.5 * dt;
			this.speed -= this.airBrake * dt;
			this.drift += (this.airDrift - this.drift) * this.driftLerp;
			this.movement.x += this.speed * this.drift * dt;
			if(this.drift > 0.0)
				this.movement.z -= this.speed * this.drift * dt;
			rollAmount -= this.rollAngle * 0.7;
		}
		if(this.key.rtrigger)
		{
			if(this.key.right)
				angularAmount -= this.airAngularSpeed * dt;
			else
				angularAmount -= this.airAngularSpeed * 0.5 * dt;
			this.speed -= this.airBrake * dt;
			this.drift += (-this.airDrift - this.drift) * this.driftLerp;
			this.movement.x += this.speed * this.drift * dt;
			if(this.drift < 0.0)
				this.movement.z += this.speed * this.drift * dt;
			rollAmount += this.rollAngle * 0.7;
		}
	}

	this.angular += (angularAmount - this.angular) * this.angularLerp;
	this.rotation.y = this.angular;

	this.speed = Math.max(0.0, Math.min(this.speed, this.maxSpeed));
	this.speedRatio = this.speed / this.maxSpeed;
	this.movement.z += this.speed * dt;

	if(this.repulsionForce.isZero())
	{
		this.repulsionForce.set(0,0,0);
	}
	else
	{
		if(this.repulsionForce.z != 0.0) this.movement.z = 0;
		this.movement.addSelf(this.repulsionForce);
		this.repulsionForce.lerpSelf(this.zero, dt > 1.5 ? this.repulsionLerp*2 : this.repulsionLerp);
	}

	this.collisionPreviousPosition.copy(this.dummy.position);

	this.boosterCheck(dt);

	//this.movement.multiplyScalar(dt);
	//this.rotation.multiplyScalar(dt);

	this.dummy.translateX(this.movement.x);
	this.dummy.translateZ(this.movement.z);


	this.heightCheck(dt);
	this.dummy.translateY(this.movement.y);

	this.currentVelocity.copy(this.dummy.position).subSelf(this.collisionPreviousPosition);

	this.collisionCheck(dt);

	this.quaternion.set(this.rotation.x, this.rotation.y, this.rotation.z, 1).normalize();
	this.dummy.quaternion.multiplySelf(this.quaternion);

	this.dummy.matrix.setPosition(this.dummy.position);
	this.dummy.matrix.setRotationFromQuaternion(this.dummy.quaternion);

	if(this.shield <= 0.0)
	{
		this.shield = 0.0;
		this.destroy();
	}

	if(this.mesh != null)
	{
		this.mesh.matrix.identity();

		// Gradient (Mesh only, no dummy physics impact)
		var gradientDelta = (this.gradientTarget - (yawLeap + this.gradient)) * this.gradientLerp;
		if(Math.abs(gradientDelta) > this.epsilon) this.gradient += gradientDelta;
		if(Math.abs(this.gradient) > this.epsilon)
		{
			this.gradientAxis.set(1,0,0);
			this.mesh.matrix.rotateByAxis(this.gradientAxis, this.gradient);
		}

		// Tilting (Idem)
		var tiltDelta = (this.tiltTarget - this.tilt) * this.tiltLerp;
		if(Math.abs(tiltDelta) > this.epsilon) this.tilt += tiltDelta;
		if(Math.abs(this.tilt) > this.epsilon)
		{
			this.tiltAxis.set(0,0,1);
			this.mesh.matrix.rotateByAxis(this.tiltAxis, this.tilt);
		}

		// Rolling (Idem)
		var rollDelta = (rollAmount - this.roll) * this.rollLerp;
		if(Math.abs(rollDelta) > this.epsilon) this.roll += rollDelta;
		if(Math.abs(this.roll) > this.epsilon)
		{
			this.rollAxis.copy(this.rollDirection);
			this.mesh.matrix.rotateByAxis(this.rollAxis, this.roll);
		}

		this.mesh.applyMatrix(this.dummy.matrix);
		this.mesh.updateMatrixWorld(true);
	}
};

bkcore.hexgl.ShipControls.prototype.teleport = function(pos, quat)
{
	this.quaternion.copy(quat);
	this.dummy.quaternion.copy(this.quaternion);

	this.dummy.position.copy(pos);
	this.dummy.matrix.setPosition(this.dummy.position);

	//console.log(pos.x, pos.y, pos.z);

	this.dummy.matrix.setRotationFromQuaternion(this.dummy.quaternion);

	if(this.mesh != null)
	{
		this.mesh.matrix.identity();
/*
		// Gradient (Mesh only, no dummy physics impact)
		var gradientDelta = (this.gradientTarget - this.gradient) * this.gradientLerp;
		if(Math.abs(gradientDelta) > this.epsilon) this.gradient += gradientDelta;
		if(Math.abs(this.gradient) > this.epsilon)
		{
			this.gradientAxis.set(1,0,0);
			this.mesh.matrix.rotateByAxis(this.gradientAxis, this.gradient);
		}

		// Tilting (Idem)
		var tiltDelta = (this.tiltTarget - this.tilt) * this.tiltLerp;
		if(Math.abs(tiltDelta) > this.epsilon) this.tilt += tiltDelta;
		if(Math.abs(this.tilt) > this.epsilon)
		{
			this.tiltAxis.set(0,0,1);
			this.mesh.matrix.rotateByAxis(this.tiltAxis, this.tilt);
		}
 */
		this.mesh.applyMatrix(this.dummy.matrix);
		this.mesh.updateMatrixWorld(true);
	}
}

bkcore.hexgl.ShipControls.prototype.boosterCheck = function(dt)
{
	if(!this.collisionMap || !this.collisionMap.loaded)
		return false;

	this.boost -= this.boosterDecay * dt;
	if(this.boost < 0)
		this.boost = 0.0;

	var x = Math.round(this.collisionMap.pixels.width/2 + this.dummy.position.x * this.collisionPixelRatio);
	var z = Math.round(this.collisionMap.pixels.height/2 + this.dummy.position.z * this.collisionPixelRatio);
	var pos = new THREE.Vector3(x, 0, z);

	var color = this.collisionMap.getPixel(x, z);

	if(color.r == 255 && color.g < 127 && color.b < 127)
		this.boost = this.boosterSpeed;

	this.movement.z += this.boost * dt;
}

bkcore.hexgl.ShipControls.prototype.collisionCheck = function(dt)
{
	if(!this.collisionDetection || !this.collisionMap || !this.collisionMap.loaded)
		return false;

	if(this.shieldDelay > 0)
		this.shieldDelay -= dt;

	this.collision.left = false;
	this.collision.right = false;
	this.collision.front = false;

	var x = Math.round(this.collisionMap.pixels.width/2 + this.dummy.position.x * this.collisionPixelRatio);
	var z = Math.round(this.collisionMap.pixels.height/2 + this.dummy.position.z * this.collisionPixelRatio);
	var pos = new THREE.Vector3(x, 0, z);

	//console.log({c: this.collisionMap.getPixel(414, 670), d: this.dummy.position, x: x, y: y, p: this.collisionMap.getPixel(x, y)})

	var collision = this.collisionMap.getPixelBilinear(x, z);

	if(collision.r < 255)
	{
		// Shield
		var sr = (this.getRealSpeed() / this.maxSpeed);
		this.shield -= sr * sr * 0.8 * this.shieldDamage;

		// Repulsion
		this.repulsionVLeft.set(1,0,0);
		this.repulsionVRight.set(-1,0,0);
		this.dummy.matrix.rotateAxis(this.repulsionVLeft);
		this.dummy.matrix.rotateAxis(this.repulsionVRight);
		this.repulsionVLeft.multiplyScalar(this.repulsionVScale);
		this.repulsionVRight.multiplyScalar(this.repulsionVScale);

		var lPos = this.repulsionVLeft.addSelf(pos);
		var rPos = this.repulsionVRight.addSelf(pos);
		var lCol = this.collisionMap.getPixel(Math.round(lPos.x), Math.round(lPos.z)).r;
		var rCol = this.collisionMap.getPixel(Math.round(rPos.x), Math.round(rPos.z)).r;

		this.repulsionAmount = Math.max(0.8,
			Math.min(this.repulsionCap,
				this.speed * this.repulsionRatio
				)
			);

		if(rCol > lCol)
		{// Repulse right
			this.repulsionForce.x += -this.repulsionAmount;
			this.collision.left = true;
		}
		else if(rCol < lCol)
		{// Repulse left
			this.repulsionForce.x += this.repulsionAmount;
			this.collision.right = true;
		}
		else
		{
			//console.log(collision.r+"  --  "+fCol+"  @  "+lCol+"  /  "+rCol);
			this.repulsionForce.z += -this.repulsionAmount*4;
			this.collision.front = true;
			this.speed = 0;
		}

		// DIRTY GAMEOVER
		if(rCol < 128 && lCol < 128)
		{
			var fCol = this.collisionMap.getPixel(Math.round(pos.x+2), Math.round(pos.z+2)).r;
			if(fCol < 128)
			{
				console.log('GAMEOVER');
				this.fall();
			}
		}

		this.speed *= this.collisionSpeedDecrease;
		this.speed *= (1-this.collisionSpeedDecreaseCoef*(1-collision.r/255));
		this.boost = 0;

		return true;
	}
	else
	{
		return false;
	}
}

bkcore.hexgl.ShipControls.prototype.heightCheck = function(dt)
{
	if(!this.heightMap || !this.heightMap.loaded)
		return false;

	var x = this.heightMap.pixels.width/2 + this.dummy.position.x * this.heightPixelRatio;
	var z = this.heightMap.pixels.height/2 + this.dummy.position.z * this.heightPixelRatio;
	var height = this.heightMap.getPixelFBilinear(x, z) / this.heightScale + this.heightBias;

	var color = this.heightMap.getPixel(x, z);

	if(height < 16777)
	{
		var delta = (height - this.dummy.position.y);

		if(delta > 0)
		{
			this.movement.y += delta;
		}
		else
		{
			this.movement.y += delta * this.heightLerp;
		}
	}

	// gradient
	this.gradientVector.set(0,0,5);
	this.dummy.matrix.rotateAxis(this.gradientVector);
	this.gradientVector.addSelf(this.dummy.position);

	x = this.heightMap.pixels.width/2 + this.gradientVector.x * this.heightPixelRatio;
	z = this.heightMap.pixels.height/2 + this.gradientVector.z * this.heightPixelRatio;

	var nheight = this.heightMap.getPixelFBilinear(x, z) / this.heightScale + this.heightBias;

	if(nheight < 16777)
		this.gradientTarget = -Math.atan2(nheight-height, 5.0)*this.gradientScale;

	// tilt
	this.tiltVector.set(5,0,0);
	this.dummy.matrix.rotateAxis(this.tiltVector);
	this.tiltVector.addSelf(this.dummy.position);

	x = this.heightMap.pixels.width/2 + this.tiltVector.x * this.heightPixelRatio;
	z = this.heightMap.pixels.height/2 + this.tiltVector.z * this.heightPixelRatio;

	nheight = this.heightMap.getPixelFBilinear(x, z) / this.heightScale + this.heightBias;

	if(nheight >= 16777) // If right project out of bounds, try left projection
	{
		this.tiltVector.subSelf(this.dummy.position).multiplyScalar(-1).addSelf(this.dummy.position);

		x = this.heightMap.pixels.width/2 + this.tiltVector.x * this.heightPixelRatio;
		z = this.heightMap.pixels.height/2 + this.tiltVector.z * this.heightPixelRatio;

		nheight = this.heightMap.getPixelFBilinear(x, z) / this.heightScale + this.heightBias;
	}

	if(nheight < 16777)
		this.tiltTarget = Math.atan2(nheight-height, 5.0)*this.tiltScale;
};

bkcore.hexgl.ShipControls.prototype.getRealSpeed = function(scale)
{
	return Math.round(
		(this.speed+this.boost)
		* (scale == undefined ? 1 : scale)
	);
};

bkcore.hexgl.ShipControls.prototype.getRealSpeedRatio = function()
{
	return Math.min(
		this.maxSpeed,
		this.speed+this.boost
	) / this.maxSpeed;
};

bkcore.hexgl.ShipControls.prototype.getSpeedRatio = function()
{
	return (this.speed+this.boost)/ this.maxSpeed;
};

bkcore.hexgl.ShipControls.prototype.getBoostRatio = function()
{
	return this.boost / this.boosterSpeed;
};

bkcore.hexgl.ShipControls.prototype.getShieldRatio = function()
{
	return this.shield / this.maxShield;
};

bkcore.hexgl.ShipControls.prototype.getShield = function(scale)
{
	return Math.round(
		this.shield
		* (scale == undefined ? 1 : scale)
	);
};

bkcore.hexgl.ShipControls.prototype.getPosition = function()
{
	return this.dummy.position;
}

bkcore.hexgl.ShipControls.prototype.getQuaternion = function()
{
	return this.dummy.quaternion;
}
