/*!
 * @class bkcore.Utils
 *
 * Various useful methods
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 */

/*!
 * @package bkcore
 */
var bkcore = bkcore || {};

bkcore.Utils = {};

/**
 * Creates a bkcore.threejs.Shaders[ "normalV" | "normal" ] material with given parameters
 */
bkcore.Utils.createNormalMaterial = function(opts)
{
	var shader = bkcore.threejs.Shaders[ opts.perPixel==false ? "normalV" : "normal" ];

	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "enableDiffuse" ].value = true;
	uniforms[ "enableSpecular" ].value = true;
	uniforms[ "enableReflection" ].value = (opts.cube != undefined);

	uniforms[ "tNormal" ].texture = opts.normal;
	uniforms[ "tDiffuse" ].texture = opts.diffuse;
	uniforms[ "tSpecular" ].texture = opts.specular;

	uniforms[ "uAmbientColor" ].value.setHex(opts.ambient == undefined ? 0x444444 : opts.ambient);
	uniforms[ "uAmbientColor" ].value.convertGammaToLinear();

	uniforms[ "uNormalScale" ].value = opts.normalScale == undefined ? 1.0 : opts.normalScale;

	if(opts.cube != undefined)
	{
		uniforms[ "tCube" ].texture = opts.cube;
		uniforms[ "uReflectivity" ].value = opts.reflectivity == undefined ? 0.9 : opts.reflectivity;
	}

	uniforms[ "uShininess" ].value = opts.shininess == undefined ? 42 : opts.shininess;


	var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: false };

	var material = new THREE.ShaderMaterial( parameters );
	material.perPixel = true;
	material.metal = opts.metal == undefined ? false : opts.metal;

	return material;
}

/**
 * Projects an object origin vector to screen using given camera
 * @param  THREE.Object3D object The object which origin you want to project
 * @param  THREE.Camera camera The camera of the projection
 * @return THEE.Vector3 Projected verctor
 */
bkcore.Utils.projectOnScreen = function(object, camera)
{
	var mat = new THREE.Matrix4();
	mat.multiply( camera.matrixWorldInverse, object.matrixWorld);
	mat.multiply( camera.projectionMatrix , mat);

	var c = mat.n44;
	var lPos = new THREE.Vector3(mat.n14/c, mat.n24/c, mat.n34/c);
	lPos.multiplyScalar(0.5);
	lPos.addScalar(0.5);
	return lPos;
}

bkcore.Utils.URLParameters = null;

/**
 * Get an url parameter
 * @param  String name Parameter slug
 * @return Mixed
 */
bkcore.Utils.getURLParameter = function(name)
{
	if(bkcore.Utils.URLParameters == null)
	{
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, 
	    	function(m,key,value) {
	        	vars[key] = value;
	    	}
	    );
	    bkcore.Utils.URLParameters = vars;
	}

	return bkcore.Utils.URLParameters[name];
}

bkcore.Utils.getOffsetTop = function(obj)
{
	var curtop = 0;
	if (obj.offsetParent) {
		do {
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	else
	{
		curtop = obj.offsetTop;
	}
	return [curtop];
}

/**
 * Scrolls page to given element id
 * @param  string id The ID of the element
 */
bkcore.Utils.scrollTo = function(id)
{
	window.scroll(
		0,
		bkcore.Utils.getOffsetTop(
			document.getElementById(id)
		)
	);
}

/**
 * Add or remove a class from an element
 * @param  string id       [description]
 * @param  string cssclass [description]
 * @param  bool active   [description]
 */
bkcore.Utils.updateClass = function(id, cssclass, active)
{
	var element = document.getElementById(id);
	if(active)
		element.classList.add(cssclass);
	else
		element.classList.remove(cssclass);
}

/**
 * PErforms an XMLHttpRequest
 * @param  string   url      [description]
 * @param  bool   postData true = POST, false = GET
 * @param  {Function} callback [description]
 * @param  {Object}   data     [description]
 */
bkcore.Utils.request = function(url, postData, callback, data)
{
	var XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i=0;i<XMLHttpFactories.length;i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}

	var req = createXMLHTTPObject();
	if (!req) return;
	var method = (postData) ? "POST" : "GET";

	var qdata = "o=bk";
	if(data != undefined) for(var i in data)
	{
		qdata += "&"+i+"="+data[i];
		if(!postData) url += "?"+qdata;
	}

	req.open(method,url,true);

	if(postData)
		req.setRequestHeader('Content-type','application/x-www-form-urlencoded');

	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		if (req.status != 200 && req.status != 304) {
			return;
		}
		callback(req);
	}

	req.send(qdata);
}