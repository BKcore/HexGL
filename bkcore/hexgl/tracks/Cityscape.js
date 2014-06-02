 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License.
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};
bkcore.hexgl.tracks = bkcore.hexgl.tracks || {};

bkcore.hexgl.tracks.Cityscape = {

	lib: null,
	materials: {},

	name: "Cityscape",

	checkpoints: {
		list: [0,1,2],
		start: 0,
		last: 2
	},

	spawn: {
		x: -1134*2,
		y: 387,
		z: -443*2
	},

	spawnRotation: {
		x: 0,
		y: 0,
		z: 0
	},

	analyser: null,
	pixelRatio: 2048.0 / 6000.0,

	load: function(opts, quality)
	{
		this.lib = new bkcore.threejs.Loader(opts);

		// desktop + quality low
		// OR
		// mobile + quality low or mid
		if(quality < 2) // LOW
		{
			this.lib.load({
				textures: {
					'hex'								: "textures/hud/hex.jpg",
					'spark'								: "textures/particles/spark.png",
					'cloud'								: "textures/particles/cloud.png",
					'ship.feisar.diffuse'				: "textures/ships/feisar/diffuse.jpg",
					'booster.diffuse'					: "textures/ships/feisar/booster/booster.png",
					'booster.sprite'					: "textures/ships/feisar/booster/boostersprite.jpg",
					'track.cityscape.diffuse'			: "textures/tracks/cityscape/diffuse.jpg",
					'track.cityscape.scrapers1.diffuse'	: "textures/tracks/cityscape/scrapers1/diffuse.jpg",
					'track.cityscape.scrapers2.diffuse'	: "textures/tracks/cityscape/scrapers2/diffuse.jpg",
					'track.cityscape.start.diffuse'		: "textures/tracks/cityscape/start/diffuse.jpg",
					'track.cityscape.start.banner'		: "textures/tracks/cityscape/start/start.jpg",
					'bonus.base.diffuse'				: "textures/bonus/base/diffuse.jpg"
				},
				texturesCube: {
					'skybox.dawnclouds'					: "textures/skybox/dawnclouds/%1.jpg"
				},
				geometries: {
					'bonus.base'						: "geometries/bonus/base/base.js",
					'booster'							: "geometries/booster/booster.js",
					'ship.feisar'						: "geometries/ships/feisar/feisar.js",
					'track.cityscape'					: "geometries/tracks/cityscape/track.js",
					'track.cityscape.scrapers1'			: "geometries/tracks/cityscape/scrapers1.js",
					'track.cityscape.scrapers2'			: "geometries/tracks/cityscape/scrapers2.js",
					'track.cityscape.start'				: "geometries/tracks/cityscape/start.js",
					'track.cityscape.start.banner'		: "geometries/tracks/cityscape/startbanner.js",
					'track.cityscape.bonus.speed'		: "geometries/tracks/cityscape/bonus/speed.js"
				},
				analysers: {
					'track.cityscape.collision'			: "textures/tracks/cityscape/collision.png",
					'track.cityscape.height'			: "textures/tracks/cityscape/height.png"
				},
				images: {
					'hud.bg'							: "textures/hud/hud-bg.png",
					'hud.speed'							: "textures/hud/hud-fg-speed.png",
					'hud.shield'						: "textures/hud/hud-fg-shield.png"
				}
			});
		}
		// desktop + quality mid or high
		// OR
		// mobile + quality high
		else // HIGH
		{console.log('HIGH');
			this.lib.load({
				textures: {
					'hex'								: "textures.full/hud/hex.jpg",
					'spark'								: "textures.full/particles/spark.png",
					'cloud'								: "textures.full/particles/cloud.png",
					'ship.feisar.diffuse'				: "textures.full/ships/feisar/diffuse.jpg",
					'ship.feisar.specular'				: "textures.full/ships/feisar/specular.jpg",
					'ship.feisar.normal'				: "textures.full/ships/feisar/normal.jpg",
					'booster.diffuse'					: "textures.full/ships/feisar/booster/booster.png",
					'booster.sprite'					: "textures.full/ships/feisar/booster/boostersprite.jpg",
					'track.cityscape.diffuse'			: "textures.full/tracks/cityscape/diffuse.jpg",
					'track.cityscape.specular'			: "textures.full/tracks/cityscape/specular.jpg",
					'track.cityscape.normal'			: "textures.full/tracks/cityscape/normal.jpg",
					'track.cityscape.scrapers1.diffuse'	: "textures.full/tracks/cityscape/scrapers1/diffuse.jpg",
					'track.cityscape.scrapers1.specular': "textures.full/tracks/cityscape/scrapers1/specular.jpg",
					'track.cityscape.scrapers1.normal'	: "textures.full/tracks/cityscape/scrapers1/normal.jpg",
					'track.cityscape.scrapers2.diffuse'	: "textures.full/tracks/cityscape/scrapers2/diffuse.jpg",
					'track.cityscape.scrapers2.specular': "textures.full/tracks/cityscape/scrapers2/specular.jpg",
					'track.cityscape.scrapers2.normal'	: "textures.full/tracks/cityscape/scrapers2/normal.jpg",
					'track.cityscape.start.diffuse'		: "textures.full/tracks/cityscape/start/diffuse.jpg",
					'track.cityscape.start.specular'	: "textures.full/tracks/cityscape/start/specular.jpg",
					'track.cityscape.start.normal'		: "textures.full/tracks/cityscape/start/normal.jpg",
					'track.cityscape.start.banner'		: "textures.full/tracks/cityscape/start/start.jpg",
					'bonus.base.diffuse'				: "textures.full/bonus/base/diffuse.jpg",
					'bonus.base.normal'					: "textures.full/bonus/base/normal.jpg",
					'bonus.base.specular'				: "textures.full/bonus/base/specular.jpg"
				},
				texturesCube: {
					'skybox.dawnclouds'					: "textures.full/skybox/dawnclouds/%1.jpg"
				},
				geometries: {
					'bonus.base'						: "geometries/bonus/base/base.js",
					'booster'							: "geometries/booster/booster.js",
					'ship.feisar'						: "geometries/ships/feisar/feisar.js",
					'track.cityscape'					: "geometries/tracks/cityscape/track.js",
					'track.cityscape.scrapers1'			: "geometries/tracks/cityscape/scrapers1.js",
					'track.cityscape.scrapers2'			: "geometries/tracks/cityscape/scrapers2.js",
					'track.cityscape.start'				: "geometries/tracks/cityscape/start.js",
					'track.cityscape.start.banner'		: "geometries/tracks/cityscape/startbanner.js",
					'track.cityscape.bonus.speed'		: "geometries/tracks/cityscape/bonus/speed.js"
				},
				analysers: {
					'track.cityscape.collision'			: "textures.full/tracks/cityscape/collision.png",
					'track.cityscape.height'			: "textures.full/tracks/cityscape/height.png"
				},
				images: {
					'hud.bg'							: "textures.full/hud/hud-bg.png",
					'hud.speed'							: "textures.full/hud/hud-fg-speed.png",
					'hud.shield'						: "textures.full/hud/hud-fg-shield.png"
				}
			});
		}
	},

	buildMaterials: function(quality)
	{
		// desktop + quality low
		// OR
		// mobile + quality low or mid
		if(quality < 2) // LOW
		{
			this.materials.track = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "track.cityscape.diffuse"),
				ambient: 0xcccccc
			});

			this.materials.bonusBase = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "bonus.base.diffuse"),
				ambient: 0xcccccc
			});

			this.materials.bonusSpeed = new THREE.MeshBasicMaterial({
				color: 0x0096ff
			});

			this.materials.ship = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "ship.feisar.diffuse"),
				ambient: 0xaaaaaa
			});

			this.materials.booster = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "booster.diffuse"),
				transparent: true
			});

			this.materials.scrapers1 = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "track.cityscape.scrapers1.diffuse"),
				ambient: 0xcccccc
			});

			this.materials.scrapers2 = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "track.cityscape.scrapers2.diffuse"),
				ambient: 0xcccccc
			});

			this.materials.start = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "track.cityscape.start.diffuse"),
				ambient: 0xcccccc
			});

			this.materials.startBanner = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "track.cityscape.start.banner"),
				transparent: false
			});
		}
		// desktop + quality mid or high
		// OR
		// mobile + quality high
		else // HIGH
		{
			this.materials.track = bkcore.Utils.createNormalMaterial({
				diffuse: this.lib.get("textures", "track.cityscape.diffuse"),
				specular: this.lib.get("textures", "track.cityscape.specular"),
				normal: this.lib.get("textures", "track.cityscape.normal"),
				ambient: 0xffffff,
				shininess: 42,
				metal: true,
				perPixel: true
			});

			this.materials.bonusBase = bkcore.Utils.createNormalMaterial({
				diffuse: this.lib.get("textures", "bonus.base.diffuse"),
				specular: this.lib.get("textures", "bonus.base.specular"),
				normal: this.lib.get("textures", "bonus.base.normal"),
				normalScale: 3.0,
				ambient: 0x444444,
				shininess: 42,
				metal: false,
				perPixel: false
			});

			this.materials.bonusSpeed = new THREE.MeshBasicMaterial({
				color: 0x0096ff
			});

			this.materials.ship = bkcore.Utils.createNormalMaterial({
				diffuse: this.lib.get("textures", "ship.feisar.diffuse"),
				specular: this.lib.get("textures", "ship.feisar.specular"),
				normal: this.lib.get("textures", "ship.feisar.normal"),
				ambient: 0x444444,
				shininess: 42,
				metal: true,
				perPixel: false
			});

			this.materials.booster = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "booster.diffuse"),
				transparent: true
			});

			this.materials.scrapers1 = bkcore.Utils.createNormalMaterial({
				diffuse: this.lib.get("textures", "track.cityscape.scrapers1.diffuse"),
				specular: this.lib.get("textures", "track.cityscape.scrapers1.specular"),
				normal: this.lib.get("textures", "track.cityscape.scrapers1.normal"),
				cube: this.lib.get("texturesCube", "skybox.dawnclouds"),
				reflectivity: 0.8,
				ambient: 0x444444,
				shininess: 42,
				metal: false,
				perPixel: false
			});

			this.materials.scrapers2 = bkcore.Utils.createNormalMaterial({
				diffuse: this.lib.get("textures", "track.cityscape.scrapers2.diffuse"),
				specular: this.lib.get("textures", "track.cityscape.scrapers2.specular"),
				normal: this.lib.get("textures", "track.cityscape.scrapers2.normal"),
				cube: this.lib.get("texturesCube", "skybox.dawnclouds"),
				reflectivity: 0.8,
				ambient: 0x000000,
				shininess: 42,
				metal: false,
				perPixel: false
			});

			this.materials.start = bkcore.Utils.createNormalMaterial({
				diffuse: this.lib.get("textures", "track.cityscape.start.diffuse"),
				specular: this.lib.get("textures", "track.cityscape.start.specular"),
				normal: this.lib.get("textures", "track.cityscape.start.normal"),
				ambient: 0xaaaaaa,
				shininess: 42,
				metal: false,
				perPixel: false
			});

			this.materials.startBanner = new THREE.MeshBasicMaterial({
				map: this.lib.get("textures", "track.cityscape.start.banner"),
				transparent: false
			});
		}
	},

	buildScenes: function(ctx, quality)
	{
		// IMPORTANT
		this.analyser = this.lib.get("analysers", "track.cityscape.collision");

		// SKYBOX
		var sceneCube = new THREE.Scene();

		var cameraCube = new THREE.PerspectiveCamera( 70, ctx.width / ctx.height, 1, 6000 );
		sceneCube.add( cameraCube );

		var skyshader = THREE.ShaderUtils.lib[ "cube" ];
		skyshader.uniforms[ "tCube" ].texture = this.lib.get("texturesCube", "skybox.dawnclouds");

		var skymaterial = new THREE.ShaderMaterial(
		{
			fragmentShader: skyshader.fragmentShader,
			vertexShader: skyshader.vertexShader,
			uniforms: skyshader.uniforms,
			depthWrite: false
		});

		var mesh = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), skymaterial );
		mesh.flipSided = true;

		sceneCube.add(mesh);

		ctx.manager.add("sky", sceneCube, cameraCube);

		var ambient = 0xbbbbbb, diffuse = 0xffffff, specular = 0xffffff, shininess = 42, scale = 23;

		// MAIN SCENE
		var camera = new THREE.PerspectiveCamera( 70, ctx.width / ctx.height, 1, 60000 );

		var scene = new THREE.Scene();
		scene.add( camera );
		scene.add( new THREE.AmbientLight( ambient ) );

		// SUN
		var sun = new THREE.DirectionalLight( diffuse, 1.5, 30000 );
		sun.position.set( -4000, 1200, 1800 );
		sun.lookAt(new THREE.Vector3());

		// desktop + quality mid or high
		if(quality > 2)
		{
			sun.castShadow = true;
			sun.shadowCameraNear = 50;
			sun.shadowCameraFar = camera.far*2;
			sun.shadowCameraRight     =  3000;
			sun.shadowCameraLeft      = -3000;
			sun.shadowCameraTop       =  3000;
			sun.shadowCameraBottom    = -3000;
			//sun.shadowCameraVisible = true;
			sun.shadowBias = 0.0001;
			sun.shadowDarkness = 0.7;
			sun.shadowMapWidth = 2048;
			sun.shadowMapHeight = 2048;
		}
		scene.add( sun );

		// SHIP
		var ship = ctx.createMesh(scene, this.lib.get("geometries", "ship.feisar"), -1134*2, 10, -443*2, this.materials.ship);

		var booster = ctx.createMesh(ship, this.lib.get("geometries", "booster"), 0, 0.665, -3.8, this.materials.booster);
		booster.depthWrite = false;

		var boosterSprite = new THREE.Sprite({
			map: this.lib.get("textures", "booster.sprite"),
			blending: THREE.AdditiveBlending,
			useScreenCoordinates: false,
			color: 0xffffff
		});
		boosterSprite.scale.set(0.02, 0.02, 0.02);
		boosterSprite.mergeWith3D = false;
		booster.add(boosterSprite);

		var boosterLight = new THREE.PointLight(0x00a2ff, 4.0, 60);
		boosterLight.position.set(0, 0.665, -4);
		
		// desktop + quality low, mid or high
		// OR
		// mobile + quality mid or high
		// NB booster is now enabled on desktop + low quality,
		// when it wasn't before; this is because this booster setting
		// is the only difference between mobile + mid quality
		// and desktop + low quality, so I merged them for convenience
		if(quality > 0)
			ship.add(boosterLight);

		// SHIP CONTROLS
		var shipControls = new bkcore.hexgl.ShipControls(ctx);
		shipControls.collisionMap = this.lib.get("analysers", "track.cityscape.collision");
		shipControls.collisionPixelRatio = 2048.0 / 6000.0;
		shipControls.collisionDetection = true;
		shipControls.heightMap = this.lib.get("analysers", "track.cityscape.height");;
		shipControls.heightPixelRatio = 2048.0 / 6000.0;
		shipControls.heightBias = 4.0;
		shipControls.heightScale = 10.0;
		shipControls.control(ship);
		ctx.components.shipControls = shipControls;
		ctx.tweakShipControls();

		// SHIP EFFECTS AND PARTICLES
		var fxParams = {
			scene: scene,
			shipControls: shipControls,
			booster: booster,
			boosterSprite: boosterSprite,
			boosterLight: boosterLight,
			useParticles: false
		};
		
		// desktop + quality mid or high
		if(quality > 2)
		{
			fxParams.textureCloud = this.lib.get("textures", "cloud");
			fxParams.textureSpark = this.lib.get("textures", "spark");
			fxParams.useParticles = true;
		}
		ctx.components.shipEffects = new bkcore.hexgl.ShipEffects(fxParams);

		// TRACK
		var track = ctx.createMesh(scene, this.lib.get("geometries", "track.cityscape"), 0, -5, 0, this.materials.track);
		var bonusBase = ctx.createMesh(scene, this.lib.get("geometries", "bonus.base"), 0, -5, 0, this.materials.bonusBase);
		var bonusSpeed = ctx.createMesh(scene, this.lib.get("geometries", "track.cityscape.bonus.speed"), 0, -5, 0, this.materials.bonusSpeed);
		bonusSpeed.receiveShadow = false;
		var scrapers1 = ctx.createMesh(scene, this.lib.get("geometries", "track.cityscape.scrapers1"), 0, 0, 0, this.materials.scrapers1);
		var scrapers2 = ctx.createMesh(scene, this.lib.get("geometries", "track.cityscape.scrapers2"), 0, 0, 0, this.materials.scrapers2);
		var start = ctx.createMesh(scene, this.lib.get("geometries", "track.cityscape.start"), 0, -5, 0, this.materials.start);
		var startbanner = ctx.createMesh(scene, this.lib.get("geometries", "track.cityscape.start.banner"), 0, -5, 0, this.materials.startBanner);
		startbanner.doubleSided = true;

		// CAMERA
		ctx.components.cameraChase = new bkcore.hexgl.CameraChase({
			target: ship,
			camera: camera,
			cameraCube: ctx.manager.get("sky").camera,
			lerp: 0.5,
			yoffset: 8.0,
			zoffset: 10.0,
			viewOffset: 10.0
		});

		ctx.manager.add("game", scene, camera, function(delta, renderer)
		{
			if(delta > 25 && this.objects.lowFPS < 1000) this.objects.lowFPS++;

			var dt = delta/16.6;

			this.objects.components.shipControls.update(dt);

			this.objects.components.shipEffects.update(dt);

			this.objects.components.cameraChase.update(dt, this.objects.components.shipControls.getSpeedRatio());
			/*this.objects.time += 0.002;
			var c = this.objects.components.cameraChase.camera;
			c.position.set(
				Math.cos(this.objects.time)*15+this.objects.components.shipControls.dummy.position.x,
				10+this.objects.components.shipControls.dummy.position.y,
				Math.sin(this.objects.time)*15+this.objects.components.shipControls.dummy.position.z
			);
			c.lookAt(this.objects.components.shipControls.dummy.position);
			this.objects.components.cameraChase.cameraCube.rotation.copy(c.rotation);*/

			this.objects.composers.game.render(dt);
			if(this.objects.hud) this.objects.hud.update(
				this.objects.components.shipControls.getRealSpeed(100),
				this.objects.components.shipControls.getRealSpeedRatio(),
				this.objects.components.shipControls.getShield(100),
				this.objects.components.shipControls.getShieldRatio()
			);
			if(this.objects.components.shipControls.getShieldRatio() < 0.2)
				this.objects.extras.vignetteColor.setHex(0x992020);
			else
				this.objects.extras.vignetteColor.setHex(0x458ab1);
		},
		{
			components: ctx.components,
			composers: ctx.composers,
			extras: ctx.extras,
			quality: quality,
			hud: ctx.hud,
			time: 0.0,
			lowFPS: 0
		});
	}
}
