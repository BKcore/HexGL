/*!
 * @class bkcore.threejs.Loader
 *
 * Loads multiple recources, get progress, callback friendly.
 * Supports textures, texturesCube, geometries, analysers, images.
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 */

/*!
 * @package bkcore.threejs
 */
var bkcore = bkcore || {};
bkcore.threejs = bkcore.threejs || {};

bkcore.NONE = undefined;

/**
 * Creates a new loader
 * @param {Object{onLoad, onError, onProgress}} opts Callbacks
 */
bkcore.threejs.Loader = function(opts)
{
	var self = this;

	this.jsonLoader = new THREE.JSONLoader();

	this.errorCallback = opts.onError == undefined ? function(s){ console.warn("Error while loading %s.".replace("%s", s)) } : opts.onError;
	this.loadCallback = opts.onLoad == undefined ? function(){ console.log("Loaded.") } : opts.onLoad;
	this.progressCallback = opts.onProgress == undefined ? function(progress, type, name){ /**/ } : opts.onProgress;

	this.types = {
		textures: null,
		texturesCube: null,
		geometries: null,
		analysers: null,
		images: null,
		sounds: null
	};

	this.states = {};
	this.data = {};

	for(var t in this.types)
	{
		this.data[t] = {};
		this.states[t] = {};
	}

	this.progress = {
		total: 0,
		remaining: 0,
		loaded: 0,
		finished: false
	};
}

/**
 * Load the given list of resources
 * @param  {textures, texturesCube, geometries, analysers, images} data 
 */
bkcore.threejs.Loader.prototype.load = function(data)
{
	var self = this;

	for(var k in this.types)
	{
		if(k in data)
		{
			var size = 0;
			for(var j in data[k])
				size++;
			this.progress.total += size;
			this.progress.remaining += size;
		}
	}

	for(var t in data.textures)
		this.loadTexture(t, data.textures[t]);

	for(var c in data.texturesCube)
		this.loadTextureCube(c, data.texturesCube[c]);

	for(var g in data.geometries)
		this.loadGeometry(g, data.geometries[g]);

	for(var a in data.analysers)
		this.loadAnalyser(a, data.analysers[a]);

	for(var i in data.images)
		this.loadImage(i, data.images[i]);

	for(var s in data.sounds)
		this.loadSound(data.sounds[s].src, s, data.sounds[s].loop, data.sounds[s].usePanner);

	this.progressCallback.call(this, this.progress);
}

bkcore.threejs.Loader.prototype.updateState = function(type, name, state)
{
	if(!(type in this.types))
	{
		console.warn("Unkown loader type.");
		return;
	}

	if(state == true)
	{
		this.progress.remaining--;
		this.progress.loaded++;
		this.progressCallback.call(this, this.progress, type, name);
	}

	this.states[type][name] = state;


	if(this.progress.loaded == this.progress.total)
	{
		this.loadCallback.call(this);
	}
}

/**
 * Get loaded resource
 * @param  string type [textures, texturesCube, geometries, analysers, images]
 * @param  string name 
 * @return Mixed
 */
bkcore.threejs.Loader.prototype.get = function(type, name)
{
	if(!(type in this.types))
	{
		console.warn("Unkown loader type.");
		return null;
	}
	if(!(name in this.data[type]))
	{
		console.warn("Unkown file.");
		return null;
	}

	return this.data[type][name];
}

bkcore.threejs.Loader.prototype.loaded = function(type, name)
{
	if(!(type in this.types))
	{
		console.warn("Unkown loader type.");
		return null;
	}
	if(!(name in this.states[type]))
	{
		console.warn("Unkown file.");
		return null;
	}

	return this.states[type][name];
}

bkcore.threejs.Loader.prototype.loadTexture = function(name, url)
{
	var self = this;
	this.updateState("textures", name, false);
	this.data.textures[name] = THREE.ImageUtils.loadTexture(
		url, 
		bkcore.NONE, 
		function(){ 
			self.updateState("textures", name, true); 
		}, 
		function(){ 
			self.errorCallback.call(self, name); 
		}
	);
}

bkcore.threejs.Loader.prototype.loadTextureCube = function(name, url)
{
	var self = this;

	var urls = [
		url.replace("%1", "px"), url.replace("%1", "nx"),
		url.replace("%1", "py"), url.replace("%1", "ny"),
		url.replace("%1", "pz"), url.replace("%1", "nz")
	];

	this.updateState("texturesCube", name, false);
	this.data.texturesCube[name] = THREE.ImageUtils.loadTextureCube( 
		urls, 
		new THREE.CubeRefractionMapping(), 
		function(){ 
			self.updateState("texturesCube", name, true); 
		} 
	);
}

bkcore.threejs.Loader.prototype.loadGeometry = function(name, url)
{
	var self = this;
	this.data.geometries[name] = null;
	this.updateState("geometries", name, false);
	this.jsonLoader.load(
		url, 
		function(a){ 
			self.data.geometries[name] = a;
			self.updateState("geometries", name, true); 
		}
	);
}

bkcore.threejs.Loader.prototype.loadAnalyser = function(name, url)
{
	var self = this;
	this.updateState("analysers", name, false);
	this.data.analysers[name] = new bkcore.ImageData(
		url, 
		function(){ 
			self.updateState("analysers", name, true);
		}
	);
}

bkcore.threejs.Loader.prototype.loadImage = function(name, url)
{
	var self = this;
	this.updateState("images", name, false);
	var e = new Image();
	e.onload = function() { 
		self.updateState("images", name, true) ;
	};
	e.crossOrigin = "anonymous";
	e.src = url;
	this.data.images[name] = e;
}

bkcore.threejs.Loader.prototype.loadSound = function(src, name, loop){
    var self = this;
    this.updateState("sounds", name, false);
    
    bkcore.Audio.addSound(
    	src,
    	name, 
    	loop, 
    	function(){
       	 self.updateState("sounds", name, true);
    	}
    );
    
    this.data.sounds[name] = {
        play: function(){
            bkcore.Audio.play(name);
        },
        stop: function(){
            bkcore.Audio.stop(name);
        },
        volume: function(vol){
            bkcore.Audio.volume(name, vol);
        }
    };
};