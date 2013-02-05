 /*
 * HexGL
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 * 
 * This part is created by Licson Lee <licson0729@gmail.com>, for audio support of HexGL.
 */
var bkcore = bkcore || {};

bkcore.AudioList = {
	bg:{src:'audio/bg.mp3',loop:true},
	crash:{src:'audio/crash.mp3',loop:false},
	destroyed:{src:'audio/destroyed.mp3',loop:false},
	boost:{src:'audio/boost.mp3',loop:false},
	wind:{src:'audio/wind.mp3',loop:true}
};

bkcore.Audio = {};
bkcore.Audio.sounds = {};

bkcore.Audio.init = function(){
	bkcore.Audio._ctx = new (window.AudioContext||window.webkitAudioContext);
	bkcore.Audio._panner = bkcore.Audio._ctx.createPanner();
	bkcore.Audio._panner.connect(bkcore.Audio._ctx.destination);
	bkcore.Audio._gains = {};
	bkcore.Audio.posMultipler = 2.098564;
};

bkcore.Audio.init();

bkcore.Audio.addSound = function(src,id,loop,callback){
	var ctx = bkcore.Audio._ctx;
	var audio = new Audio();
	audio.src = src;
	audio.addEventListener('canplay',callback,false);
	audio.loop = loop;
	audio.load();
	
	if(ctx){
		var mediasrc = ctx.createMediaElementSource(audio);
		var gain = ctx.createGainNode();
		mediasrc.connect(gain);
		gain.connect(bkcore.Audio._panner);
		bkcore.Audio._gains[id] = gain;
	}
	
	bkcore.Audio.sounds[id] = audio;
};

bkcore.Audio.play = function(id){
	if(bkcore.Audio.sounds[id].currentTime > 0){
		bkcore.Audio.sounds[id].pause();
		bkcore.Audio.sounds[id].currentTime = 0;
	}
	bkcore.Audio.sounds[id].play();
};

bkcore.Audio.stop = function(id){
	bkcore.Audio.sounds[id].pause();
	bkcore.Audio.sounds[id].currentTime = 0;
};

bkcore.Audio.volume = function(id,volume){
	bkcore.Audio.sounds[id].volume = Math.min(1,volume);
	if(bkcore.Audio._ctx) bkcore.Audio._gains[id].gain.value = volume;
};

bkcore.Audio.setListenerPos = function(vec){
	var panner = bkcore.Audio._panner;
	var vec2 = vec.normalize();
	vec2.multiplyScalar(bkcore.Audio.posMultipler);
	panner.setPosition(vec2.x,vec2.y,vec2.z);
};

bkcore.Audio.setListenerVelocity = function(vec){
	var panner = bkcore.Audio._panner;
	panner.setVelocity(vec.x,vec.y,vec.z);
};
