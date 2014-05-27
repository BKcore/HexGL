 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

'use strict';
'v1.0.1';

if(!(window.console && console.log)){
    window.console.log = function(){
        var args = arguments;
        var str;
        for(var i = 0; i < args.length; i++){
            str += args[i];
        }
        window.alert(str);
    };
}

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

bkcore.hexgl.HexGL = function(opts)
{
	var self = this;

	this.document = opts.document || document;

	this.a = window.location.href;

	this.active = true;

	this.width = opts.width === undefined ? window.innerWidth : opts.width;
	this.height = opts.height === undefined ? window.innerHeight : opts.height;

	this.quality = opts.quality === undefined ? 2 : opts.quality;
	this.difficulty = opts.difficulty === undefined ? 0 : opts.difficulty;
	this.player = opts.player === undefined ? "Anonym" : opts.player;

	this.half = opts.half === undefined ? false : opts.half;

	this.track = bkcore.hexgl.tracks[ opts.track === undefined ? 'Cityscape' : opts.track ];

	if(this.half)
	{
		this.width /= 2;
		this.height /=2;
	}

	this.settings = null;
	this.renderer = null;
	this.manager = null;
	this.lib = null;
	this.materials = {};
	this.components = {};
	this.extras = {
		vignetteColor: new THREE.Color(0x458ab1),
		bloom: null,
		fxaa: null
	};

	this.containers = {};
	this.containers.main = opts.container === undefined ? document.body : opts.container;
	this.containers.overlay = opts.overlay === undefined ? document.body : opts.overlay;

	this.hud = null;

	this.gameplay = null;

	this.composers = {
		game: null
	};

	this.initRenderer();

	function onKeyPress(event) 
	{
		if(event.keyCode == 27/*escape*/) 
		{
			self.reset();
		}
	}

	this.document.addEventListener('keydown', onKeyPress, false);
};

bkcore.hexgl.HexGL.prototype.start = function()
{

	this.manager.setCurrent("game");

	var self = this;

	function raf()
	{
		requestAnimationFrame( raf );
		self.update();
	}

	//if(this.a[15] == "o")
		raf();

	this.initGameplay();
};

bkcore.hexgl.HexGL.prototype.reset = function()
{
	this.manager.get('game').objects.lowFPS = 0;
	bkcore.Audio.play('bg');
	
	bkcore.Audio.volume('wind',0.05);
	bkcore.Audio.play('wind');
	
	//bkcore.Audio.setListenerPos(new THREE.Vector3(0,0,0));
	
	this.gameplay.start();
};

bkcore.hexgl.HexGL.prototype.restart = function()
{
	this.document.getElementById('finish').style.display = 'none';
	this.reset();
};

bkcore.hexgl.HexGL.prototype.resize = function(w,h){
    this.renderer.setSize(w,h);
    this.hud.setSize(w,h);
};

bkcore.hexgl.HexGL.prototype.update = function()
{
	if(!this.active) return;

	if(this.gameplay !== null)
		this.gameplay.update();

	this.manager.renderCurrent();
};

bkcore.hexgl.HexGL.prototype.init = function()
{
	this.initHUD();

	this.track.buildMaterials(this.quality);

	this.track.buildScenes(this, this.quality);

	this.initGameComposer();
};

bkcore.hexgl.HexGL.prototype.load = function(opts)
{
	this.track.load(opts, this.quality);
};

bkcore.hexgl.HexGL.prototype.initGameplay = function()
{
	var self = this;

	this.gameplay = new bkcore.hexgl.Gameplay({
		mode: "timeattack",
		hud: this.hud,
		shipControls: this.components.shipControls,
		analyser: this.track.analyser,
		pixelRatio: this.track.pixelRatio,
		track: {
			checkpoints: this.track.checkpoints,
			spawn: this.track.spawn,
			spawnRotation: this.track.spawnRotation
		},
		onFinish: function() {
			self.displayScore(this.finishTime, this.lapTimes);
		}
	});
	
	bkcore.Audio.play('bg');
	bkcore.Audio.play('wind');
	bkcore.Audio.volume('wind',0.05);
	//bkcore.Audio.setListenerPos(new THREE.Vector3(0,0,0));

	this.gameplay.start();
};

bkcore.hexgl.HexGL.prototype.displayScore = function(f, l)
{
	var t = 'cityscape';
	var dc = this.document.getElementById("finish");
	var ds = this.document.getElementById("finish-state");
	var dh = this.document.getElementById("finish-hallmsg");
	var dr = this.document.getElementById("finish-msg");
	var dt = this.document.getElementById("finish-result");
	var dl1 = this.document.getElementById("finish-lap1");
	var dl2 = this.document.getElementById("finish-lap2");
	var dl3 = this.document.getElementById("finish-lap3");
	var dd = this.document.getElementById("finish-diff");
	var st = this.document.getElementById("finish-twitter");
	var sf = this.document.getElementById("finish-fb");
	var sl = this.document.getElementById("lowfps-msg");
	var d = this.difficulty === 0 ? 'casual' : 'hard';
	var ts = this.hud.timeSeparators;
	var tf = bkcore.Timer.msToTimeString(f);
	var tl = [
		bkcore.Timer.msToTimeString(l[0]),
		bkcore.Timer.msToTimeString(l[1]),
		bkcore.Timer.msToTimeString(l[2])
	];

	if(this.gameplay.result == this.gameplay.results.FINISH)
	{
		ds !== undefined && (ds.innerHTML = "Finished!");
		// local record
		if(typeof(Storage)!=="undefined")
		{
			if(localStorage['score-'+t+'-'+d] == undefined || localStorage['score-'+t+'-'+d] > f)
			{
				dr != undefined && (dr.innerHTML = "New local record!");
				localStorage['score-'+t+'-'+d] = f;
			}
			else
			{
				dr != undefined && (dr.innerHTML = "Well done!");
			}
		}
        /*
		// ladder record
		var p = bkcore.hexgl.Ladder.global[t][d][bkcore.hexgl.Ladder.global[t][d].length-2];
		if(p != undefined && p['score'] > f)
		{
			dh != undefined && (dh.innerHTML = "You made it to the HOF!");
		}
		else
		{
			dh != undefined && (dh.innerHTML = "Hall Of Fame");
		}
        */

		dt !== undefined && (dt.innerHTML = tf.m + ts[1] + tf.s + ts[2] + tf.ms);
		dl1 !== undefined && (dl1.innerHTML = tl[0].m !== undefined ? tl[0].m + ts[1] + tl[0].s + ts[2] + tl[0].ms : "-");
		dl2 !== undefined && (dl2.innerHTML = tl[1].m !== undefined ? tl[1].m + ts[1] + tl[1].s + ts[2] + tl[1].ms : "-");
		dl3 !== undefined && (dl3.innerHTML = tl[2].m !== undefined ? tl[2].m + ts[1] + tl[2].s + ts[2] + tl[2].ms : "-");

		// Ladder save
		// Undisclosed
	}
	else
	{
		ds != undefined && (ds.innerHTML = "Destroyed!");
		dr != undefined && (dr.innerHTML = "Maybe next time!");
		dh != undefined && (dh.innerHTML = "Hall Of Fame");
		dt != undefined && (dt.innerHTML = "None");
		dl1 != undefined && (dl1.innerHTML = "None");
		dl2 != undefined && (dl2.innerHTML = "None");
		dl3 != undefined && (dl3.innerHTML = "None");
	}

	dd != undefined && (dd.innerHTML = d);
	st != undefined && (st.href='http://twitter.com/share?text='+encodeURIComponent('I just scored '+dt.innerHTML+' in '+'Cityscape ('+d+') on #HexGL! Come try it and beat my record on '));
	sf != undefined && (sf.href='http://www.facebook.com/sharer.php?s=100'
		+'&p[title]='+encodeURIComponent('I just scored '+dt.innerHTML+' in '+'Cityscape ('+d+') on HexGL!')
		+'&p[summary]='+encodeURIComponent('HexGL is a futuristic racing game built by Thibaut Despoulain (BKcore) using HTML5, Javascript and WebGL. Come challenge your friends on this fast-paced 3D game!')
		+'&p[url]='+encodeURIComponent('http://hexgl.bkcore.com')
		+'&p[images][0]='+encodeURIComponent('http://hexgl.bkcore.com/image.png'));

	//bkcore.hexgl.Ladder.displayLadder('finish-ladder', t, d, 8);

	if(this.manager.get('game').objects.lowFPS >= 999)
		sl != undefined && (sl.innerHTML = 'Note: Your framerate was pretty low, you should try a lesser graphic setting!');
	else
		sl != undefined && (sl.innerHTML = '');

	dc.style.display = 'block';
};

bkcore.hexgl.HexGL.prototype.initRenderer = function()
{
	var renderer = new THREE.WebGLRenderer({
		antialias: false,
		clearColor: 0x000000
	});

	renderer.physicallyBasedShading = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	renderer.autoClear = false;
	renderer.sortObjects = false;
	renderer.setSize( this.width, this.height );
	renderer.domElement.style.position = "relative";

	this.containers.main.appendChild( renderer.domElement );	
	this.renderer = renderer;
	this.manager = new bkcore.threejs.RenderManager(renderer);
};

bkcore.hexgl.HexGL.prototype.initHUD = function()
{
	this.hud = new bkcore.hexgl.HUD({
		width: this.width,
		height: this.height,
		font: "BebasNeueRegular",
		bg: this.track.lib.get("images", "hud.bg"),
		speed: this.track.lib.get("images", "hud.speed"),
		shield: this.track.lib.get("images", "hud.shield")
	});	
	this.containers.overlay.appendChild(this.hud.canvas);
};

bkcore.hexgl.HexGL.prototype.initGameComposer = function()
{
	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	var renderTarget = new THREE.WebGLRenderTarget( this.width, this.height, renderTargetParameters );

	// GAME COMPOSER	
	var renderSky = new THREE.RenderPass( this.manager.get("sky").scene, this.manager.get("sky").camera );

	var renderModel = new THREE.RenderPass( this.manager.get("game").scene, this.manager.get("game").camera );
	renderModel.clear = false;

	this.composers.game = new THREE.EffectComposer( this.renderer, renderTarget );

	var effectScreen = new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );				
	var effectVignette = new THREE.ShaderPass( THREE.ShaderExtras[ "vignette" ] );

	var effectHex = new THREE.ShaderPass( bkcore.threejs.Shaders[ "hexvignette" ] );
	effectHex.uniforms[ 'size' ].value = 512.0 * (this.width/1633);
	effectHex.uniforms[ 'rx' ].value = this.width;
	effectHex.uniforms[ 'ry' ].value = this.height;
	effectHex.uniforms[ 'tHex' ].texture = this.track.lib.get("textures", "hex");
	effectHex.uniforms[ 'color' ].value = this.extras.vignetteColor;

	effectHex.renderToScreen = true;

	this.composers.game.addPass( renderSky );
	this.composers.game.addPass( renderModel );

	if(this.quality > 0)
	{
		var effectFXAA = new THREE.ShaderPass( THREE.ShaderExtras[ "fxaa" ] );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / this.width, 1 / this.height );

		this.composers.game.addPass( effectFXAA );
		
		this.extras.fxaa = effectFXAA;
	}
	if(this.quality > 1)
	{	
		var effectBloom = new THREE.BloomPass( 0.8, 25, 4 , 256);

		this.composers.game.addPass( effectBloom );

		this.extras.bloom = effectBloom;
	}

	this.composers.game.addPass( effectHex );

	
};

bkcore.hexgl.HexGL.prototype.createMesh = function(parent, geometry, x, y, z, mat) 
{
	geometry.computeTangents();

	var mesh = new THREE.Mesh( geometry, mat );
	mesh.position.set( x, y, z );
	parent.add(mesh);

	if(this.quality > 0)
	{
		mesh.castShadow = true;
		mesh.receiveShadow = true;
	}

	return mesh;
};

bkcore.hexgl.HexGL.prototype.tweakShipControls = function()
{
	var c = this.components.shipControls;
	if(this.difficulty == 1)
	{
		c.airResist = 0.035;
		c.airDrift = 0.07;
		c.thrust = 0.035;
		c.airBrake = 0.04;
		c.maxSpeed = 9.6;
		c.boosterSpeed = c.maxSpeed * 0.35;
		c.boosterDecay = 0.007;
		c.angularSpeed = 0.0140;
		c.airAngularSpeed = 0.0165;
		c.rollAngle = 0.6;
		c.shieldDamage = 0.03;
		c.collisionSpeedDecrease = 0.8;
		c.collisionSpeedDecreaseCoef = 0.5;
		c.rollLerp = 0.1;
		c.driftLerp = 0.4;
		c.angularLerp = 0.4;
	}
	else if(this.difficulty == 0)
	{
		c.airResist = 0.02;
		c.airDrift = 0.06;
		c.thrust = 0.02;
		c.airBrake = 0.025;
		c.maxSpeed = 7.0;
		c.boosterSpeed = c.maxSpeed * 0.5;
		c.boosterDecay = 0.007;
		c.angularSpeed = 0.0125;
		c.airAngularSpeed = 0.0135;
		c.rollAngle = 0.6;
		c.shieldDamage = 0.06;
		c.collisionSpeedDecrease = 0.8;
		c.collisionSpeedDecreaseCoef = 0.5;
		c.rollLerp = 0.07;
		c.driftLerp = 0.3;
		c.angularLerp = 0.4;
	}
};