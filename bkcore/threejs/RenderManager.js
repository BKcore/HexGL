/*!
 * bkcore.threejs.RenderManager helps handling multiple scenes, cameras and render loops.
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license MIT
 * 
 * Initialize the a RenderManager by passing a Renderer object:
 * 		var renderManager = new bkcore.threejs.RenderManager(new THREE.WebGLRenderer());
 * 
 * A render setup structure :
 * 		{
 * 			id 		<String>		: render setup ID,
 * 			scene 	<THREE.Scene>	: main scene, 
 * 			camera 	<THREE.Camera>	: main camera, 
 * 			render 	<Function>		: render loop called when render setup is active (current), 
 * 			objects <Dic>			: object references accessible in the render loop via this.objects
 * 		}
 * 	
 * The render method's context will be the render setup's object, so in your render loop:
 * 		function(delta, renderer)
 * 		{
 * 			this.scene;
 * 			this.camera;
 * 			this.id;
 * 			this.objects;
 * 			renderer.render(...);
 * 		}
 * 		
 * Use the "objects" attribute to store useful references and variables like time, geometries, materials, etc.
 * Example:
 * 		renderManager.add('mySetup', scene, camera, function(delta, renderer)
 *		{
 *			this.objects.timer += delta;
 *			this.objects.torus.rotation.z = Math.PI * Math.cos(this.objects.timer);
 *			renderer.render(this.scene, this.camera);
 *		},
 *		{
 *			timer: 0,
 *			torus: torusMesh
 *		});
 */

var bkcore = bkcore || {};
bkcore.threejs = bkcore.threejs || {};

(function(w){
	var perfNow;
	var perfNowNames = ['now', 'webkitNow', 'msNow', 'mozNow'];
	if(!!w['performance']) for(var i = 0; i < perfNowNames.length; ++i)
	{
		var n = perfNowNames[i];
		if(!!w['performance'][n])
		{
			perfNow = function(){return w['performance'][n]()};
			break;
		}
	}
	if(!perfNow)
	{
		perfNow = Date.now;
	}
	w.perfNow = perfNow;
})(window);

bkcore.threejs.RenderManager = function(renderer)
{
	this.renderer = renderer;
	this.time = window.perfNow();

	this.renders = {};
	this.current = {};
	this.size = 0;

	this.defaultRenderMethod = function(delta, renderer)
	{
		renderer.render(this.scene, this.camera);
	};
};

bkcore.threejs.RenderManager.prototype.add = function(id, scene, camera, render, objects)
{
	render = render || this.defaultRenderMethod;
	objects = objects || {};

	this.renders[id] = {
		id: id,
		scene: scene, 
		camera: camera, 
		render: render, 
		objects: objects
	};

	if(this.size == 0) this.current = this.renders[id];

	this.size++;
};

bkcore.threejs.RenderManager.prototype.get = function(id)
{
	return this.renders[id];
};

bkcore.threejs.RenderManager.prototype.remove = function(id)
{
	if(id in this.renders)
	{
		delete this.renders[id];
		this.size--;
	}
};

bkcore.threejs.RenderManager.prototype.renderCurrent = function()
{
	if(this.current && this.current.render)
	{
		var now = window.perfNow();
		var delta = now - this.time;
		this.time = now;

		this.current.render.call(this.current, delta, this.renderer);
	}
	else console.warn('RenderManager: No current render defined.');
};

bkcore.threejs.RenderManager.prototype.setCurrent = function(id)
{
	if(id in this.renders)
	{
		this.current = this.renders[id];
	}
	else console.warn('RenderManager: Render "'+id+'" not found.');
};