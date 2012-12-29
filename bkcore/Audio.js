var bkcore = bkcore || {};

bkcore.AudioList = {
	bg:{src:'audio/bg.mp3',loop:true},
	crash:{src:'audio/crash.mp3',loop:false},
	destroyed:{src:'audio/destroyed.mp3',loop:false},
	boost:{src:'audio/boost.mp3',loop:false}
};

bkcore.Audio = {};

bkcore.Audio.sounds = {};

bkcore.Audio.addSound = function(src,id,loop,callback){
	var audio = new Audio();
	audio.src = src;
	audio.addEventListener('canplay',callback,false);
	audio.loop = loop;
	audio.load();
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

bkcore.Audio.pause = function(id){
	bkcore.Audio.sounds[id].pause();
};