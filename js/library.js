function sortList(list=musicList){
    if(list==musicList){
        list.sort(function (first, second) {
            if (first.name < second.name) {
                return -1;
            }
            if (first.name > second.name) {
                return 1;
            }
            return 0;
        });
    } else {
        list.sort(function (first, second) {
            if (first < second) {
                return -1;
            }
            if (first > second) {
                return 1;
            }
            return 0;
        });
    }
}

async function openFolder(){
    musicFolder = await window.showDirectoryPicker({
        id: 'musics',
        startIn: "music"
    });
    await createList();
    sortList();
    document.querySelector(".welcome").style.display="none";
    document.querySelector(".now_playing").style.display="none";
    library.style.display="";
    renderList();
    await idb_set("musics_folder", musicFolder);
}

async function openFolder_idb(){
    if(await musicFolder.requestPermission()=="granted"){
        await createList();
        sortList();
        document.querySelector(".welcome").style.display="none";
        document.querySelector(".now_playing").style.display="none";
        library.style.display="";
        renderList();
    }
}
function extractArtist(path,name){
    if(name.indexOf("|")>-1){
        return name.split("|").at(0).trim()
    } else if(name.indexOf("-")>-1){
        return name.split("-").at(0).trim()
    } else if(path.split("/").length>3){
        return path.split("/").at(-3).trim()
    } else {
        return "Unknown"
    }
}

function extractAlbum(path){
    if(path.split("/").length>2){
        return path.split("/").at(-2).trim()
    } else {
        return "Unknown"
    }
}

async function createList(folder=musicFolder,path="/"){
    if(folder==musicFolder){
        musicList=[];
    }
    for await (const entry of folder.values()) {
        if(entry.kind=="file"){
            let ext=entry.name.split(".").at(-1)
            if(ext=="mp3"||ext=="wav"||ext=="m4a"||ext=="flac"||ext=="ogg"){
                musicList.push({
                    path:path+entry.name,
                    artist:extractArtist(path,entry.name),
                    album:extractAlbum(path),
                    name:entry.name.split(".",entry.name.split(".").length-1).join(".")
                })
            }
        } else {
            await createList(entry,path+entry.name+"/")
        }
    }
}

function createAlbumsList(){
    extList={};
    musicList.forEach(e => {
        extList[e.album]=true
    });
    extList=Object.keys(extList);
    sortList(extList);
    renderList("album",extList);
}

function loadExt(type, i){
    name=extList[i];
    customMusicList=[];
    if(type=="album"){
        musicList.forEach(e =>{
            if(e.album==name){
                customMusicList.push(e);
            }
        })
    } else if(type=="artist"){
        musicList.forEach(e =>{
            if(e.artist==name){
                customMusicList.push(e);
            }
        })
    }
    renderList("song",customMusicList);
}

function createArtistList(){
    extList={};
    musicList.forEach(e => {
        extList[e.artist]=true
    });
    extList=Object.keys(extList);
    sortList(extList);
    renderList("artist",extList);
}

function renderList(type="song",customList=musicList){
    if(document.querySelector(".welcome").style.display==""){ return }
    library.innerHTML="";
    if(type=="song"){
        isCustomList=customList!=musicList
        for(item in customList){
            var song = document.createElement("div");
            song.setAttribute("class","item "+type);
            song.setAttribute("onclick","loadSong("+item+","+isCustomList+");");
            song.textContent = customList[item].name;
            song.setAttribute("title",customList[item].name);
            library.insertAdjacentElement("beforeend",song)
        }
    } else {
        for(item in customList){
            var song = document.createElement("div");
            song.setAttribute("class","item "+type);
            song.setAttribute("onclick","loadExt(\""+type+"\","+item+");");
            song.setAttribute("title",customList[item]);
            song.textContent = customList[item];
            library.insertAdjacentElement("beforeend",song)
        }
    }
    document.querySelector(".now_playing").style.display="none";
    library.style.display="";
    library__search_update();
}

async function changeAlbumCover(cover){
    if(cover==""){
        document.querySelector(".player .song.cover").style.backgroundImage="";
        document.querySelector(".now_playing .song.cover").style.backgroundImage="";
    } else {
        cover_url=URL.createObjectURL(new Blob([cover.data], { type: 'application/octet-stream' }));
        document.querySelector(".player .song.cover").style.backgroundImage="url("+cover_url+")";
        document.querySelector(".now_playing .song.cover").style.backgroundImage="url("+cover_url+")";
    }
}

function updateNowPlayingUI(now_playing_song){
    document.querySelector(".now_playing .song-name").innerText=now_playing_song.name;
    document.querySelector(".now_playing .song-info .song-artist").innerText=now_playing_song.artist;
    document.querySelector(".now_playing .song-info .song-album").innerText=now_playing_song.album;
}

async function loadSong(id,customList=false){
    if(customList){
        if(customList!=2){
            nowPlayingList=customMusicList;
        }
    } else {
        nowPlayingList=musicList;
    }
    if(player.src!=""){
        URL.revokeObjectURL(player.src)
    }
    nowPlaying=[id,customList];
    __player.song_name.innerText=nowPlayingList[id].name;
    changeAlbumCover("");
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
        title: nowPlayingList[id].name,
        artist: nowPlayingList[id].artist,
        album: nowPlayingList[id].album,
        artwork: []
        });
    }
    sendNotification(nowPlayingList[id].artist+" singing from "+nowPlayingList[id].album+" album", nowPlayingList[id].name);
    updateNowPlayingUI(nowPlayingList[id]);
    blobObject=await getBlobFromLocation(nowPlayingList[id].path);
    player.src=URL.createObjectURL(blobObject);
    console.log(await musicmetadata(blobObject, "audio", function (err, metadata) {
        if (err) throw err;
        if(metadata.picture[0]!=undefined){
            changeAlbumCover(metadata.picture[0])
        } else {
            console.warn("No Cover For This Song")
        }
    }))
    player__play();
}

async function getBlobFromLocation(path, folder=musicFolder){
    if(typeof(path)=="string"){
        path=path.split("/")
        if(path[0]==""){path.shift()}
    }
    if(path.length==1){ // "asd.mp3" => ["asd.mp3"]
        file=await folder.getFileHandle(path[0])
        file=await file.getFile()
        file_arraybuffer=await file.arrayBuffer()
        return new Blob([file_arraybuffer], { type: 'application/octet-stream' });
    } else {
        return await getBlobFromLocation(path, await folder.getDirectoryHandle(path.shift()));
    }
}
