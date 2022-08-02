var audioCtx = new AudioContext();
var source = audioCtx.createMediaElementSource(player);

var gainNode = audioCtx.createGain();
gainNode.gain.value = 1;
source.connect(gainNode);

gainNode.connect(audioCtx.destination);

function player__play_pause(){
    if(!player.paused){ //is playing
        player__pause()
    } else {
        player__play();
    }
}

function player__pause(){
    player.pause();
    document.querySelector(".player i.play").style.display="";
    document.querySelector(".player i.pause").style.display="none";
    document.querySelector(".now_playing i.play").style.display="";
    document.querySelector(".now_playing i.pause").style.display="none";
}

function player__play(){
    player.play();
    document.querySelector(".player i.play").style.display="none";
    document.querySelector(".player i.pause").style.display="";
    document.querySelector(".now_playing i.play").style.display="none";
    document.querySelector(".now_playing i.pause").style.display="";
}

async function player__next_song(){
    if(localStorage.repeat=="true"){
        player.currentTime=0;
        player__play();
        return
    }
    if(localStorage.shuffle=="true"){
        loadSong(Math.round(Math.random()*(nowPlayingList.length-1)),2);
    } else {
        if(nowPlaying[0]==nowPlayingList.length-1){
            _id=0;
        } else {
            _id=nowPlaying[0]+1;
        }
        loadSong(_id,2);
    }
}

async function player__previous_song(){
    if(localStorage.repeat=="true"){
        player.currentTime=0;
        player__play();
        return
    }
    if(player.currentTime<10){
        if(localStorage.shuffle=="true"){
            loadSong(Math.round(Math.random()*(nowPlayingList.length-1)),2);
        } else {
            if(nowPlaying[0]==0){
                _id=nowPlayingList.length-1;
            } else {
                _id=nowPlaying[0]-1;
            }
            loadSong(_id,2);
        }
    } else {
        player.currentTime=0;
        player__play();
    }
}

function player__toggle_shuffle(){
    if(localStorage.shuffle=="true"){
        document.querySelector(".player .shuffle").style.filter="var(--player-button-disabled)";
        document.querySelector(".player .shuffle").style.filter="var(--player-button-disabled)";
    } else {
        document.querySelector(".now_playing .shuffle").style.filter="";
        document.querySelector(".now_playing .shuffle").style.filter="";
    }
    localStorage.shuffle=!(localStorage.shuffle=="true");
}

function player__toggle_repeat(){
    if(localStorage.repeat=="true"){
        document.querySelector(".player .bi.repeat").style.display="";
        document.querySelector(".player .bi.repeat1").style.display="none";
        document.querySelector(".now_playing .bi.repeat").style.display="";
        document.querySelector(".now_playing .bi.repeat1").style.display="none";
    } else {
        document.querySelector(".player .bi.repeat").style.display="none";
        document.querySelector(".player .bi.repeat1").style.display="";
        document.querySelector(".now_playing .bi.repeat").style.display="none";
        document.querySelector(".now_playing .bi.repeat1").style.display="";
    }
    localStorage.repeat=!(localStorage.repeat=="true");
}

player.onended=player__next_song

player.onloadedmetadata=()=>{
    __player.range.max=Math.round(player.duration)
}

setInterval(()=>{
    __player.range.value=Math.round(player.currentTime);
},500)

player.onpause=player__pause; //if paused by media keys
player.onplay=player__play; //if resumed by media keys

if(localStorage.shuffle=="true"){
    document.querySelector(".player .shuffle").style.filter="";
    document.querySelector(".now_playing .shuffle").style.filter="";
}
if(localStorage.repeat=="true") {
    document.querySelector(".player .bi.repeat").style.display="none";
    document.querySelector(".player .bi.repeat1").style.display="";
    document.querySelector(".now_playing .bi.repeat").style.display="none";
    document.querySelector(".now_playing .bi.repeat1").style.display="";
}
if(localStorage.volume!=undefined){
    __player.sound.value=Number(localStorage.volume);
    gainNode.gain.value=localStorage.volume/100;
}