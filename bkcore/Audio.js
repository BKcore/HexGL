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
		mediasrc.connect(ctx.destination);
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
