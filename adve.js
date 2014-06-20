/**
 * This library requires jquery 
 */

var thisScript;
var thisSection;
var escapeScript;
var escapeSection;
var shaking=false;
var engine;
var assets;

var face2button;
var face1button;

function bgImage(url){
    return {url: url, width:WIDTH, height:HEIGHT};
}

function se(url){
    return {url: url, volume:100};
}

function startLoading(){
    engine.ports.isModal.send(true);
    engine.ports.loading.send(true);
    $('#loader').css({"visibility":"visible"})
}

function endLoading(){
    $('#loader').css({"visibility":"hidden"})
    engine.ports.loading.send(false);
    engine.ports.isModal.send(false);
}

function setShaking(b){
    engine.ports.shaking.send(b);
    engine.ports.proceedRequest.send(true);
}


function expandMacro(text){
    for(key in macro){
	var pat = new RegExp(key);
	text = text.split(key).join(macro[key]);
    }
    return text;
}

function setVoice(person){
    var v=voiceTable[person];
    var nameplate = $("#nameplate");
    nameplate.empty();
    nameplate.append('<p id="voice">' + v.name + '</p>');
    nameplate.css({"visibility":"visible", "text-shadow":"0px 0px 5px "+ v.color + ", 0px 0px 5px "+ v.color});
    $("#showscript").css({"text-shadow":"0px 0px 2px "+v.color});
    engine.ports.proceedRequest.send(true);
}


function jumpEscape(b){
    if(b && escapeSection != "" && escapeScript != ""){
	gotoScript(escapeScript,escapeSection);
	escapeSection="";
	escapeScript="";
    }
}

function escapeto(file,id,f){
    escapeScript = file;
    escapeSection = id;
    if(typeof f == 'undefined') engine.ports.proceedRequest.send(true);
    else f();
}

function shakeScreen(){
    $("#gamescreen").effect("shake",{direction:"up"});
}

function shake(){
    shakeScreen();
    engine.ports.proceedRequest.send(true);
}

function increasingRepeat(pref,msg,num){
    var txt=new String();
    var ptxt=new String();
    for(var i=0;i<num;i++){
	ptxt += msg;
	txt += pref;
	txt += ptxt;
	txt += "\n";
    }
    return txt;
}

function showScript(t){
    var p = $("#showscript");
    p.empty();
    p.append('<p id="serihu">' + t + '</p>');
    p.css({"visibility":"visible"});
}

function interpretOneStep(t){
    if(typeof t == 'undefined' || !(t.goForward)) return;
    else if(t.script.length==0) engine.ports.proceedRequest.send(true);
    else if(t.script.charAt(0)=="#"){
	engine.ports.isModal.send(true);
	eval(t.script.substring(1));
    }else{
	showScript(t.script);
	engine.ports.isModal.send(false);
    }
}

function clickAnim(picts){
    for(key in picts){
	picts[key]=assets.images[picts[key]]
    }
    engine.ports.clickAnim.send(picts);
    engine.ports.proceedRequest.send(true);
}

function clickAnimOnly(picts){
    hideScripts();
    for(key in picts){
	picts[key]=assets.images[picts[key]]
    }
    engine.ports.clickAnim.send(picts);
    engine.ports.isModal.send(true);
}

function show(f){
    engine.ports.clickAnim.send([assets.images[f]]);
    engine.ports.proceedRequest.send(true);
}

function fadeoutaudio(sec,isec){
    if(sec < 0) return;
    for(key in assets.audio){
	var s = soundManager.getSoundById(key);
	var vol = s.volume;
	if(s.playState == 1 && vol != 0){
	    s.setVolume(Math.max(0,vol-assets.audio[key].volume*isec));
	}
    }
    window.setTimeout(function(){fadeoutaudio(sec-1,isec);},100);
}

function clearCanvas(){
    engine.ports.clearCanvas.send({width:WIDTH, height:HEIGHT});
    engine.ports.proceedRequest.send(true);
}

function blackout(sec){
    hideScripts();
    engine.ports.isModal.send(true);
    engine.ports.fadeOut.send(sec);
    fadeoutaudio(sec*10,1.0/(sec*10.0));
    window.setTimeout(function(){soundManager.stopAll(); engine.ports.clearCanvas.send({width:WIDTH, height:HEIGHT}); engine.ports.proceedRequest.send(true); engine.ports.isModal.send(false);},(sec+0.5)*1000);
}

function hideScripts(){
    $("#showscript").css({"visibility":"hidden"});
    $("#nameplate").css({"visibility":"hidden"});
}


function gotoScript(file,id){
    thisScript=file;
    thisSection=id;
    if(typeof id == 'undefined') id="#begin"
    $("#hiddenplace").load(file,null,function(){
	var scriptview = $(id);
	var code=expandMacro(scriptview.text()).replace(/｜([^《]+)《([^》]+)》/g,'<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>').replace(/ｖ/g,"<span style='color:red'>&hearts;</span>").split("\n");
	scriptview.empty();
	engine.ports.newScript.send(code);
    });
}

function gotoSection(id){
    gotoScript(thisScript,id);
}

function repeatSection(){
    gotoScript(thisScript,thisSection);
}

function gotoEscape(file,id1,id2){
    escapeto(file,id2,function(){gotoScript(file,id1);});
}

function playLoopCore(sound,volume){
    sound.play({loop:9999, volume: volume, onfinish: function(){playLoopCore(sound,volume);}});
}

function playLoop(id){
    var sound = soundManager.getSoundById(id);
    if(sound)
	playLoopCore(sound,assets.audio[id].volume);
    engine.ports.proceedRequest.send(true);
}

function playOnce(id){
    soundManager.play(id,{volume: assets.audio[id].volume});
    engine.ports.proceedRequest.send(true);
}

function playStop(ids){
    for(key in ids)
	soundManager.stop(ids[key])
    engine.ports.proceedRequest.send(true);
}

function showStandPicts(lst){
    var rcd = new Array
    for(key in lst){
	rcd.push({name: key, imageInfo: assets.images[lst[key]]});
    }
    engine.ports.showPicts.send(rcd);
    engine.ports.proceedRequest.send(true);
}

function changeStandPict(n,id){
    engine.ports.changePict.send({name: n, imageInfo: assets.images[id]})
    engine.ports.proceedRequest.send(true);
}

function restart(){
    location.reload();
}

function fastFace1button(){ engine.ports.face1direct.send(true); engine.ports.proceedRequest.send(true);}

function slowFace1button(){ engine.ports.face1direct.send(false); engine.ports.proceedRequest.send(true);}
