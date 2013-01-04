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
	bkcore.Audio.posMultipler = 1.5;
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
		mediasrc.connect(bkcore.Audio._panner);
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
	bkcore.Audio.sounds[id].volume = volume;
};

bkcore.Audio.setListenerPos = function(vec){
	var panner = bkcore.Audio._panner;
	var vec2 = vec.normalize();
	panner.setPosition(vec2.x*bkcore.Audio.posMultipler,vec2.y*bkcore.Audio.posMultipler,vec2.z*bkcore.Audio.posMultipler);
};

bkcore.Audio.setListenerVelocity = function(vec){
	var panner = bkcore.Audio._panner;
	panner.setVelocity(vec.x,vec.y,vec.z);
};