(async()=>{
    const { get, set } = await import("https://cdnjs.cloudflare.com/ajax/libs/idb-keyval/6.2.0/index.min.js");
    window.idb_get=get;
    window.idb_set=set;

    if(window.showDirectoryPicker==undefined){
        const { showDirectoryPicker  } = await import("https://cdn.jsdelivr.net/npm/native-file-system-adapter/mod.js"); 
        window.showDirectoryPicker=showDirectoryPicker;
    } else {
        window.musicFolder=await idb_get("musics_folder");
        if(musicFolder!=undefined){
            document.querySelector(".welcome__latest_folder").style.display=""
            document.querySelector(".welcome__latest_folder .name").innerText=musicFolder.name
        }
    }
})();

musicFolder=null;
musicList=[];
customMusicList=[];
extList={};
nowPlayingList={};
nowPlaying=[];
library=document.querySelector(".library");
player=document.querySelector("audio");
aside__search=document.querySelector("aside .search");
__player={
    song_name:document.querySelector(".player .song-name"),
    sound:document.querySelector(".player input.sound"),
    range:document.querySelector("input.play"),
    title:document.querySelector(".title")
}

if(localStorage.shuffle==undefined) localStorage.shuffle=false;
if(localStorage.repeat==undefined) localStorage.repeat=false;
if(localStorage.volume==undefined) localStorage.volume=100;

library__search_update=()=>{
    for (item of library.childNodes.values()) {
        if(item.innerText.toLowerCase().indexOf(aside__search.value.toLowerCase())>-1){
            item.style.display="";
        } else {
            item.style.display="none";
        }
    }
}

aside__search.oninput=library__search_update;

__player.range.oninput=(e)=>{
    player.currentTime=e.target.value
}

__player.range.onmousemove=(e)=>{
    __player.title.style.top=e.clientY+"px";
    __player.title.style.left=e.clientX+"px";
    __player.title.innerText=Math.floor(player.currentTime/60)+":"+Math.round(player.currentTime%60)
}

__player.range.onmouseleave=(e)=>{
    __player.title.style.top="";
    __player.title.style.left="";
}

__player.sound.onmousemove=(e)=>{
    __player.title.style.top=e.clientY+"px";
    __player.title.style.left=e.clientX+"px";
    __player.title.innerText=e.target.value+"%";
}

__player.sound.onmouseleave=(e)=>{
    __player.title.style.top="";
    __player.title.style.left="";
}

__player.sound.oninput=(e)=>{
    player.muted=false;
    localStorage.volume=e.target.value;
    gainNode.gain.value = localStorage.volume/100;
    if(Number(localStorage.volume)>=50){
        document.querySelector(".player .sound2").style.display="";
        document.querySelector(".player .sound0").style.display="none";
        document.querySelector(".player .sound1").style.display="none";
    } else if (Number(localStorage.volume)>0) {
        document.querySelector(".player .sound2").style.display="none";
        document.querySelector(".player .sound1").style.display="";
        document.querySelector(".player .sound0").style.display="none";
    } else {
        document.querySelector(".player .sound2").style.display="none";
        document.querySelector(".player .sound1").style.display="none";
        document.querySelector(".player .sound0").style.display="";
    }
}

document.querySelector(".player .btn.sound").onclick=()=>{
    if(!player.muted){
        player.muted=true;
        document.querySelector(".player .sound2").style.display="none";
        document.querySelector(".player .sound1").style.display="none";
        document.querySelector(".player .sound0").style.display="";
    } else {
        player.muted=false;
        __player.sound.oninput({target:{value:Number(localStorage.volume)}});
    }
}

function sendNotification(message="",title=document.title){
    if (Notification.permission === "granted") {
        new Notification(title, {body:message});
    } else if (Notification.permission !== 'denied' || Notification.permission === "default") {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                new Notification(title, {body:message});
            }
        });
    }
}

(async ()=>{
    if(window["c2VydmVyX3ZlcnNpb24="]==null){
        if(navigator.windowControlsOverlay!=undefined){
            windowControlsOverlay_css=await fetch("./css/windowControlsOverlay.css");
            windowControlsOverlay_css=await windowControlsOverlay_css.text();
            navigator.windowControlsOverlay.ongeometrychange=()=>{
                if(navigator.windowControlsOverlay.visible){
                    if(!document.querySelector("style.windowControlsOverlay")){
                        document.head.insertAdjacentHTML("beforeend","<style class=\"windowControlsOverlay\">"+windowControlsOverlay_css+"</style>")
                    }
                } else {
                    if(document.querySelector("style.windowControlsOverlay")){
                        document.querySelector("style.windowControlsOverlay").remove()
                    }
                }
            }
        }
    } else {
        windowControlsOverlay_css=await fetch("./css/windowControlsOverlay.css");
        windowControlsOverlay_css=await windowControlsOverlay_css.text();
        document.head.insertAdjacentHTML("beforeend","<style>.vebview_resize{display:block;}:root{--titlebar-width:calc(100% - calc(var(--titlebar-height) * 4));}.vebview_window_controls{display:block;}"+windowControlsOverlay_css+"</style>");
    }
})();

function show_playing_song(){
    if(document.querySelector(".welcome").style.display=="none"){
        document.querySelector(".now_playing").style.display="";
        library.style.display="none";
    }
}

function settings__open(){
    document.querySelector('#allow-volume-boost-up-to-300').checked=localStorage["allow-volume-boost-up-to-300"]=="true";
    document.querySelector('.settings').showModal();
}

function settings__save(){
    localStorage["allow-volume-boost-up-to-300"]=document.querySelector('#allow-volume-boost-up-to-300').checked;
    settings__apply();
}

function settings__apply(){
    if(localStorage["allow-volume-boost-up-to-300"]=="true"){
        __player.sound.max=300;
    } else {
        if(__player.sound.value>100){
            gainNode.gain.value = 1;
            localStorage.volume = 100;
        }
        __player.sound.max=100;
    }
}

settings__apply();
