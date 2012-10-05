/*!
 * @class bkcore.threejs.Preloader
 *
 * Displays a small 3D preloader scene
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 */

/*!
 * @package bkcore.threejs
 */
var bkcore = bkcore || {};
bkcore.threejs = bkcore.threejs || {};

/**
 * Creates a new preloader scene.
 * You have to update Preloader.ratio with the % loaded info (float 0.0-1.0) 
 * @param {Object{width, height, scale, line}} opts
 */
bkcore.threejs.Preloader = function(opts)
{
	this.document = opts.document || document;

	this.end = false;

	this.time = 0.0;
	this.y = 0.3;
	this.ratio = 0.0;

	this.height = opts.height;
	this.width = opts.width;

	this.scale = opts.scale == undefined ? 10 : opts.scale
	this.line = opts.line == undefined ? 3 : opts.line;

	this.container = opts.container;

	this.renderer = new THREE.CanvasRenderer({
		clearColor: 0xffffff
	});
	this.renderer.setSize( opts.width, opts.height );

	this.container.appendChild( this.renderer.domElement );

	this.ctx = this.renderer.domElement.getContext('2d');
	this.ctx.textAlign = "center";

	this.scene = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera( 70, opts.width / opts.height, 1, 1000 );
	this.camera.position.z = 100;
	this.scene.add( this.camera );

	this.stage = new THREE.Object3D();
	this.stage.position.set(0,10,0);
	this.scene.add(this.stage);

	this.cube = new THREE.Mesh( new THREE.CubeGeometry( this.scale, this.scale, this.scale, 1, 1, 1 ), 
		new THREE.MeshBasicMaterial( { color: 0x999999 } ) );
	
	this.cube.scale.set(0.0,0.0,0.0);
	this.stage.add(this.cube);

	this.cubew = new THREE.Mesh( new THREE.CubeGeometry( this.scale, this.scale, this.scale, 1, 1, 1 ), 
		new THREE.MeshBasicMaterial( { 
			wireframe: true, 
			wireframeLinewidth: this.line, 
			//wireframeLinecap: 'square',
			//wireframeLinejoin: 'square',
			color: 0xffffff
		} ) );
	this.cube.add(this.cubew);

	this.outercube = new THREE.Mesh( new THREE.CubeGeometry( this.scale, this.scale, this.scale, 1, 1, 1 ), 
		new THREE.MeshBasicMaterial( { 
			wireframe: true, 
			wireframeLinewidth: this.line, 
			//wireframeLinecap: 'square',
			//wireframeLinejoin: 'square',
			color: 0x0093d8 
		} ) );
	this.stage.add(this.outercube);

	var self = this;

	function raf()
	{
		if(!self.end) 
		{
			requestAnimationFrame( raf );
			self.render();
		}
	}
	raf();

	function mm(e){
		self.mouseMove.call(self, e);
	}

	this.mmsave = mm;

	this.document.addEventListener( 'mousemove', mm, false );
}

/**
 * Render method to be called from a RAF loop
 */
bkcore.threejs.Preloader.prototype.render = function()
{
	this.time += 0.02;

	this.ctx.clearRect(0 , 0 , this.width , this.height);

	var s = (this.ratio - this.cube.scale.x) * 0.3;

	this.cube.scale.addScalar(s);
	this.cube.rotation.y = this.time;
	this.outercube.rotation.y = this.time;

	this.stage.rotation.x += (this.y - this.stage.rotation.x)*0.3;

	this.renderer.render( this.scene, this.camera );

	this.ctx.save();
	this.ctx.font = "40px Arial";
    this.ctx.fillStyle = "rgb(200, 200, 200)";
    this.ctx.fillText(Math.round(this.ratio*100), this.width/2, this.height/2+30);
    this.ctx.restore();
}

bkcore.threejs.Preloader.prototype.mouseMove = function(event) 
{
	var h2 = this.height/2;
	this.y = -(event.clientY - h2)/h2+0.3;
}

/**
 * Deletes the Preloader
 */
bkcore.threejs.Preloader.prototype.remove = function()
{
	this.document.removeEventListener( 'mousemove', this.mm, false );
	this.end = true;
	this.renderer = null;
	this.scene = null;
	this.stage = null;
	this.cube = null;
	this.cubew = null;
	this.innercube = null;
	this.container.innerHTML = "";
}