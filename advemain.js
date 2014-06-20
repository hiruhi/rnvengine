window.onload=function(){
    $("<div>").load(scenariofile,null,function(){
	var dummyCP = {'name': "", 'imageInfo': {'url': "", 'width':0, 'height':0}}
	$("#gamescreen:first").each(function(index,domElm){
	    engine=Elm.embed(Elm.Engine, domElm, {newScript: [], cycledClickAnim: [[],true], showPicts: [],changePict: dummyCP, fadeOut: 0, proceedRequest: false, canvasSize: {width: 0, height:0}, isModal: false, preloadImages: [], clearCanvas: {width:WIDTH, height:HEIGHT}, loading: true, face1direct: false, shaking: false});
	});
	startLoading();

	var scriptview = $(this);
	thisScript=scenariofile;
	thisSection="#begin";
	var maincode = expandMacro(scriptview.text()).replace(/｜([^《]+)《([^》]+)》/g,'<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>').replace(/ｖ/g,"<span style='color:red'>&hearts;</span>").split("\n");
	scriptview.empty();

	var tempspace=$("#hiddenplace");

	function task(){
	    engine.ports.canvasSize.send({width: WIDTH, height: HEIGHT});
	    engine.ports.jumpRequest.subscribe(jumpEscape);
	    engine.ports.interpretOneStep.subscribe(interpretOneStep);
            engine.ports.shakeRequest.subscribe(shakeScreen);
	    engine.ports.newScript.send(maincode);
	    endLoading();
	}

	function preloadImages(preloads,i,lim){
	    if(i >= lim) {engine.ports.preloadImages.send(preloads); task();}
	    else{
		var img = new Image();
		img.onerror=function(){
		    alert('failed to load ' + preloads[i].url);
		}
		img.onload=function(){
//		    tempspace.append($("<div>").css('background-image', "url(" + preloads[i].url + ")"));
		    preloadImages(preloads,i+1,lim);
		};
		img.src=preloads[i].url;
	    }
	}

        function startPreloadImages(){
	    var preloads = new Array;
	    for(key in assets.images){
		preloads.push(assets.images[key]);
	    }
	    preloadImages(preloads,0,preloads.length);
        }
	
	if(assets.audio){
	    soundManager.setup({
		url: swfdir,
		flashVersion: 9,
		debugMode: false,
//		useHighPerformance: true,
//		useFastPolling: true,
		onready: function(){
		    for(key in assets.audio){
			soundManager.createSound({
			    url: assets.audio[key].url,
			    volume: assets.audio[key].volume,
			    autoLoad: true,
			    id: key
			})}
                    startPreloadImages();
		}});
	}else startPreloadImages();
    });
};
