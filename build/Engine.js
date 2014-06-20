Elm.Native.Gamepad = {};
Elm.Native.Gamepad.make = function(elm) {
    
    elm.Native = elm.Native || {};
    elm.Native.Gamepad = elm.Native.Gamepad || {};
    if (elm.Native.Gamepad.values) return elm.Native.Gamepad.values;

    function send(node, timestep, changed) {
	var kids = node.kids;
	for (var i = kids.length; i--; ) {
	    kids[i].recv(timestep, changed, node.id);
	}
    }

    var Signal = Elm.Signal.make(elm);
    var NList = Elm.Native.List.make(elm);
    var Utils = Elm.Native.Utils.make(elm);

    var downEvents = Signal.constant(0);
    var upEvents = Signal.constant(0);


    var haveEvents = 'GamepadEvent' in window;
    var controllers = {};
    var rAF = window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.requestAnimationFrame;
    
    function connecthandler(e) {
	addgamepad(e.gamepad);
    }
    function addgamepad(gamepad) {
	controllers[gamepad.index] = gamepad;
	rAF(updateStatus);
    }
    
    function disconnecthandler(e) {
	removegamepad(e.gamepad);
    }
    
    function removegamepad(gamepad) {
	var d = document.getElementById("controller" + gamepad.index);
	document.body.removeChild(d);
	delete controllers[gamepad.index];
    }
    
    function updateStatus() {
	if (!haveEvents) {
	    scangamepads();
	}
	for (j in controllers) {
	    var controller = controllers[j];
	    for (var i=0; i<controller.buttons.length; i++) {
		var val = controller.buttons[i];
		var b;
		var pressed = val == 1.0;
		if (typeof(val) == "object") {
		    pressed = val.pressed;
		    b = val;
		    val = val.value;
		}else{
                    if(typeof controller.prevButtonStates == "undefined")
                        controller.prevButtonStates = new Object;
                    if(typeof controller.prevButtonStates[i] == "undefined")
                        controller.prevButtonStates[i] = new Object;
                    b = controller.prevButtonStates[i];
                }
		if (pressed && !b.previous) {
		    elm.notify(downEvents.id,i);
		} else if(b.previous && !pressed){
		    elm.notify(upEvents.id,i);
		}
		b.previous = pressed;
	    }
	}
	rAF(updateStatus);
    }
    
    function scangamepads() {
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
	for (var i = 0; i < gamepads.length; i++) {
	    if (gamepads[i]) {
		if (!(gamepads[i].index in controllers)) {
		    addgamepad(gamepads[i]);
		} else {
		    controllers[gamepads[i].index] = gamepads[i];
		}
	    }
	}
    }
    
    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
    if (!haveEvents) {
	setInterval(scangamepads, 500);
    }

    function ButtonMerge(down, up) {
	var args = [down,up];
	this.id = Utils.guid();
	// Ignore starting values here
	this.value = NList.Nil
	this.kids = [];
	
	var n = args.length;
	var count = 0;
	var isChanged = false;
	
	this.recv = function(timestep, changed, parentID) {
	    ++count;
	    if (changed) {
		// We know this a change must only be one of the following cases
		if (parentID === down.id && !(NList.member(down.value)(this.value))) {
		    isChanged = true;
		    this.value = NList.Cons(down.value, this.value);
		}
		if (parentID === up.id) {
		    isChanged = true;
		    var notEq = function(kc) { return kc !== up.value };
		    this.value = NList.filter(notEq)(this.value);
		}
	    }
	    if (count == n) {
		send(this, timestep, isChanged);
		isChanged = false;
		count = 0;
	    }
	};	
	for (var i = n; i--; ) { args[i].kids.push(this); }
    }

    var buttonsDown = Signal.dropRepeats(new ButtonMerge(downEvents,upEvents));

    function keySignal(f) {
	var signal = A2(Signal.lift, f, buttonsDown);
	// must set the default number of kids to make it possible to filter
	// these signals if they are not actually used.
	buttonsDown.defaultNumberOfKids += 1;
	signal.defaultNumberOfKids = 1;
	var filtered = Signal.dropRepeats(signal)
	filtered.defaultNumberOfKids = 0;
	return filtered;
    }

    function is(button) { return keySignal(NList.member(button)); }

    var lastPressed = downEvents;

    return elm.Native.Gamepad.values = {
	isDown:is,
	buttonsDown:buttonsDown,
	lastPressed:lastPressed
    };
}
Elm.Engine = Elm.Engine || {};
Elm.Engine.make = function (_elm) {
   "use strict";
   _elm.Engine = _elm.Engine || {};
   if (_elm.Engine.values)
   return _elm.Engine.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Engine";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Debug = Elm.Debug.make(_elm);
   var Dict = Elm.Dict.make(_elm);
   var Engine = Engine || {};
   Engine.Background = Elm.Engine.Background.make(_elm);
   var Engine = Engine || {};
   Engine.Config = Elm.Engine.Config.make(_elm);
   var Engine = Engine || {};
   Engine.FadeOut = Elm.Engine.FadeOut.make(_elm);
   var Engine = Engine || {};
   Engine.VisualObjects = Elm.Engine.VisualObjects.make(_elm);
   var Gamepad = Elm.Gamepad.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var Keyboard = Keyboard || {};
   Keyboard.Keys = Elm.Keyboard.Keys.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Mouse = Elm.Mouse.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var jumpRequest = Native.Ports.portOut("jumpRequest",
   Native.Ports.outgoingSignal(function (v) {
      return v;
   }),
   A3(Signal.keepIf,
   Basics.id,
   false,
   Gamepad.face2button));
   var render = F3(function (canvas,
   fading,
   elements) {
      return function () {
         var h = Basics.toFloat(canvas.height);
         var hh = h * 0.5;
         var w = Basics.toFloat(canvas.width);
         var hw = w * 0.5;
         var bs = Graphics.Collage.alpha(fading)(Graphics.Collage.filled(Color.black)(A2(Graphics.Collage.rect,
         w,
         h)));
         return A2(Graphics.Collage.collage,
         canvas.width,
         canvas.height)(_L.append(elements,
         _L.fromArray([bs])));
      }();
   });
   var createHiddenScreen = function (dict) {
      return Dict.values(dict);
   };
   var checkAndLoad = F2(function (img,
   dict) {
      return function () {
         var _v0 = A2(Dict.get,
         img.url,
         dict);
         switch (_v0.ctor)
         {case "Just": return dict;
            case "Nothing":
            return A3(Dict.insert,
              img.url,
              Graphics.Collage.form(A4(Graphics.Collage.FImage,
              img.width,
              img.height,
              {ctor: "_Tuple2",_0: 0,_1: 0},
              img.url)),
              dict);}
         _E.Case($moduleName,
         "between lines 91 and 93");
      }();
   });
   var load = F2(function (lst,
   dict) {
      return A3(List.foldr,
      F2(function (e,d) {
         return _U.eq(e.url,
         "") ? d : A2(checkAndLoad,e,d);
      }),
      dict,
      lst);
   });
   var interpretForward = function (s) {
      return function () {
         var _v2 = s.scriptsLeft;
         switch (_v2.ctor)
         {case "::":
            return _U.replace([["script"
                               ,_v2._0]
                              ,["scriptsLeft",_v2._1]
                              ,["goForward",true]
                              ,["clickCount",0]],
              s);
            case "[]":
            return _U.replace([["script",""]
                              ,["goForward",false]
                              ,["clickCount",0]],
              s);}
         _E.Case($moduleName,
         "between lines 66 and 68");
      }();
   };
   var initialInterpreterState = {_: {}
                                 ,clickCount: 0
                                 ,directface1: false
                                 ,goForward: false
                                 ,script: ""
                                 ,scriptsLeft: _L.fromArray([])};
   var Clock = {ctor: "Clock"};
   var clock = A2(Signal._op["<~"],
   Basics.always(Clock),
   Time.fps(Engine.Config.fpsNum));
   var FaceOneClicked = {ctor: "FaceOneClicked"};
   var ClearCanvas = function (a) {
      return {ctor: "ClearCanvas"
             ,_0: a};
   };
   var PreloadImages = function (a) {
      return {ctor: "PreloadImages"
             ,_0: a};
   };
   var WindowSize = function (a) {
      return {ctor: "WindowSize"
             ,_0: a};
   };
   var FadeOut = function (a) {
      return {ctor: "FadeOut"
             ,_0: a};
   };
   var ChangePict = function (a) {
      return {ctor: "ChangePict"
             ,_0: a};
   };
   var ShowPicts = function (a) {
      return {ctor: "ShowPicts"
             ,_0: a};
   };
   var EffectState = F9(function (a,
   b,
   c,
   d,
   e,
   f,
   g,
   h,
   i) {
      return {_: {}
             ,assets: b
             ,countUpdator: h
             ,counter: g
             ,easer: c
             ,height: e
             ,redraw: f
             ,stopper: i
             ,visibleObjects: a
             ,width: d};
   });
   var InterpreterState = F4(function (a,
   b,
   c,
   d) {
      return {_: {}
             ,clickCount: d
             ,goForward: c
             ,script: a
             ,scriptsLeft: b};
   });
   var FaceOneDirect = function (a) {
      return {ctor: "FaceOneDirect"
             ,_0: a};
   };
   var ProceedRequest = function (a) {
      return {ctor: "ProceedRequest"
             ,_0: a};
   };
   var makeProceedRequest = Basics.always(ProceedRequest(true));
   var FaceOneButton = function (a) {
      return {ctor: "FaceOneButton"
             ,_0: a};
   };
   var PressEnter = function (a) {
      return {ctor: "PressEnter"
             ,_0: a};
   };
   var ScriptChange = function (a) {
      return {ctor: "ScriptChange"
             ,_0: a};
   };
   var interpret = F2(function (c,
   s) {
      return function () {
         switch (c.ctor)
         {case "FaceOneButton":
            return c._0 ? s.directface1 ? interpretForward(s) : _U.cmp(s.clickCount + 1,
              Basics.sqrt(String.length(s.script))) > 0 ? interpretForward(s) : _U.replace([["clickCount"
                                                                                            ,s.clickCount + 1]
                                                                                           ,["goForward"
                                                                                            ,false]],
              s) : _U.replace([["goForward"
                               ,false]],
              s);
            case "FaceOneDirect":
            return _U.replace([["directface1"
                               ,c._0]
                              ,["goForward",false]],
              s);
            case "PressEnter":
            return c._0 ? interpretForward(s) : _U.replace([["goForward"
                                                            ,false]],
              s);
            case "ProceedRequest":
            return c._0 ? interpretForward(s) : _U.replace([["goForward"
                                                            ,false]],
              s);
            case "ScriptChange":
            return interpretForward(_U.replace([["scriptsLeft"
                                                ,c._0]],
              s));}
         _E.Case($moduleName,
         "between lines 71 and 80");
      }();
   });
   var VisibleObject = F2(function (a,
   b) {
      return {_: {}
             ,imageInfo: b
             ,name: a};
   });
   var loading = Native.Ports.portIn("loading",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "boolean" ? v : _E.raise("invalid input, expecting JSBoolean but got " + v);
   }));
   var canvasSize = Native.Ports.portIn("canvasSize",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "object" && "width" in v && "height" in v ? {_: {}
                                                                      ,width: typeof v.width === "number" ? v.width : _E.raise("invalid input, expecting JSNumber but got " + v.width)
                                                                      ,height: typeof v.height === "number" ? v.height : _E.raise("invalid input, expecting JSNumber but got " + v.height)} : _E.raise("invalid input, expecting JSObject [\"width\",\"height\"] but got " + v);
   }));
   var preloadImages = Native.Ports.portIn("preloadImages",
   Native.Ports.incomingSignal(function (v) {
      return _U.isJSArray(v) ? _L.fromArray(v.map(function (v) {
         return typeof v === "object" && "url" in v && "width" in v && "height" in v ? {_: {}
                                                                                       ,url: typeof v.url === "string" || typeof v.url === "object" && v.url instanceof String ? v.url : _E.raise("invalid input, expecting JSString but got " + v.url)
                                                                                       ,width: typeof v.width === "number" ? v.width : _E.raise("invalid input, expecting JSNumber but got " + v.width)
                                                                                       ,height: typeof v.height === "number" ? v.height : _E.raise("invalid input, expecting JSNumber but got " + v.height)} : _E.raise("invalid input, expecting JSObject [\"url\",\"width\",\"height\"] but got " + v);
      })) : _E.raise("invalid input, expecting JSArray but got " + v);
   }));
   var changeDict = A3(Signal.foldp,
   load,
   Dict.empty,
   preloadImages);
   var hiddenScreen = A2(Signal._op["<~"],
   createHiddenScreen,
   changeDict);
   var clearCanvas = Native.Ports.portIn("clearCanvas",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "object" && "width" in v && "height" in v ? {_: {}
                                                                      ,width: typeof v.width === "number" ? v.width : _E.raise("invalid input, expecting JSNumber but got " + v.width)
                                                                      ,height: typeof v.height === "number" ? v.height : _E.raise("invalid input, expecting JSNumber but got " + v.height)} : _E.raise("invalid input, expecting JSObject [\"width\",\"height\"] but got " + v);
   }));
   var clickAnim = Native.Ports.portIn("clickAnim",
   Native.Ports.incomingSignal(function (v) {
      return _U.isJSArray(v) ? _L.fromArray(v.map(function (v) {
         return typeof v === "object" && "url" in v && "width" in v && "height" in v ? {_: {}
                                                                                       ,url: typeof v.url === "string" || typeof v.url === "object" && v.url instanceof String ? v.url : _E.raise("invalid input, expecting JSString but got " + v.url)
                                                                                       ,width: typeof v.width === "number" ? v.width : _E.raise("invalid input, expecting JSNumber but got " + v.width)
                                                                                       ,height: typeof v.height === "number" ? v.height : _E.raise("invalid input, expecting JSNumber but got " + v.height)} : _E.raise("invalid input, expecting JSObject [\"url\",\"width\",\"height\"] but got " + v);
      })) : _E.raise("invalid input, expecting JSArray but got " + v);
   }));
   var proceedRequest = Native.Ports.portIn("proceedRequest",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "boolean" ? v : _E.raise("invalid input, expecting JSBoolean but got " + v);
   }));
   var isModal = Native.Ports.portIn("isModal",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "boolean" ? v : _E.raise("invalid input, expecting JSBoolean but got " + v);
   }));
   var userAccess = A2(Signal.dropWhen,
   loading,
   ProceedRequest(false))(Signal.merges(_L.fromArray([A2(Signal.dropWhen,
                                                     isModal,
                                                     ProceedRequest(false))(A2(Signal._op["<~"],
                                                     makeProceedRequest,
                                                     Mouse.clicks))
                                                     ,A2(Signal.dropWhen,
                                                     isModal,
                                                     PressEnter(false))(A2(Signal._op["<~"],
                                                     PressEnter,
                                                     A3(Signal.keepIf,
                                                     Basics.id,
                                                     false,
                                                     Keyboard.Keys.isKeyDown(Keyboard.Keys.enter))))
                                                     ,A2(Signal.dropWhen,
                                                     isModal,
                                                     FaceOneButton(false))(A2(Signal._op["<~"],
                                                     FaceOneButton,
                                                     A3(Signal.keepIf,
                                                     Basics.id,
                                                     false,
                                                     Gamepad.face1button)))])));
   var fadeOut = Native.Ports.portIn("fadeOut",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "number" ? v : _E.raise("invalid input, expecting JSNumber but got " + v);
   }));
   var changePict = Native.Ports.portIn("changePict",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "object" && "name" in v && "imageInfo" in v ? {_: {}
                                                                        ,name: typeof v.name === "string" || typeof v.name === "object" && v.name instanceof String ? v.name : _E.raise("invalid input, expecting JSString but got " + v.name)
                                                                        ,imageInfo: typeof v.imageInfo === "object" && "url" in v.imageInfo && "width" in v.imageInfo && "height" in v.imageInfo ? {_: {}
                                                                                                                                                                                                   ,url: typeof v.imageInfo.url === "string" || typeof v.imageInfo.url === "object" && v.imageInfo.url instanceof String ? v.imageInfo.url : _E.raise("invalid input, expecting JSString but got " + v.imageInfo.url)
                                                                                                                                                                                                   ,width: typeof v.imageInfo.width === "number" ? v.imageInfo.width : _E.raise("invalid input, expecting JSNumber but got " + v.imageInfo.width)
                                                                                                                                                                                                   ,height: typeof v.imageInfo.height === "number" ? v.imageInfo.height : _E.raise("invalid input, expecting JSNumber but got " + v.imageInfo.height)} : _E.raise("invalid input, expecting JSObject [\"url\",\"width\",\"height\"] but got " + v.imageInfo)} : _E.raise("invalid input, expecting JSObject [\"name\",\"imageInfo\"] but got " + v);
   }));
   var showPicts = Native.Ports.portIn("showPicts",
   Native.Ports.incomingSignal(function (v) {
      return _U.isJSArray(v) ? _L.fromArray(v.map(function (v) {
         return typeof v === "object" && "name" in v && "imageInfo" in v ? {_: {}
                                                                           ,name: typeof v.name === "string" || typeof v.name === "object" && v.name instanceof String ? v.name : _E.raise("invalid input, expecting JSString but got " + v.name)
                                                                           ,imageInfo: typeof v.imageInfo === "object" && "url" in v.imageInfo && "width" in v.imageInfo && "height" in v.imageInfo ? {_: {}
                                                                                                                                                                                                      ,url: typeof v.imageInfo.url === "string" || typeof v.imageInfo.url === "object" && v.imageInfo.url instanceof String ? v.imageInfo.url : _E.raise("invalid input, expecting JSString but got " + v.imageInfo.url)
                                                                                                                                                                                                      ,width: typeof v.imageInfo.width === "number" ? v.imageInfo.width : _E.raise("invalid input, expecting JSNumber but got " + v.imageInfo.width)
                                                                                                                                                                                                      ,height: typeof v.imageInfo.height === "number" ? v.imageInfo.height : _E.raise("invalid input, expecting JSNumber but got " + v.imageInfo.height)} : _E.raise("invalid input, expecting JSObject [\"url\",\"width\",\"height\"] but got " + v.imageInfo)} : _E.raise("invalid input, expecting JSObject [\"name\",\"imageInfo\"] but got " + v);
      })) : _E.raise("invalid input, expecting JSArray but got " + v);
   }));
   var main = A2(Signal._op["~"],
   A2(Signal._op["~"],
   A2(Signal._op["<~"],
   render,
   canvasSize),
   A3(Engine.FadeOut.fadingEffect,
   fadeOut,
   clearCanvas,
   clock)),
   A2(Signal._op["~"],
   A2(Signal._op["<~"],
   F2(function (x,y) {
      return {ctor: "::"
             ,_0: x
             ,_1: y};
   }),
   A5(Engine.Background.backgroundForm,
   clickAnim,
   clearCanvas,
   Gamepad.face1button,
   clock,
   changeDict)),
   A5(Engine.VisualObjects.visualObjectsLayer,
   showPicts,
   changePict,
   clearCanvas,
   canvasSize,
   changeDict)));
   var newScript = Native.Ports.portIn("newScript",
   Native.Ports.incomingSignal(function (v) {
      return _U.isJSArray(v) ? _L.fromArray(v.map(function (v) {
         return typeof v === "string" || typeof v === "object" && v instanceof String ? v : _E.raise("invalid input, expecting JSString but got " + v);
      })) : _E.raise("invalid input, expecting JSArray but got " + v);
   }));
   var shaking = Native.Ports.portIn("shaking",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "boolean" ? v : _E.raise("invalid input, expecting JSBoolean but got " + v);
   }));
   var shakeRequest = Native.Ports.portOut("shakeRequest",
   Native.Ports.outgoingSignal(function (v) {
      return v;
   }),
   A2(Signal.keepWhen,
   shaking,
   false)(A2(Signal._op["<~"],
   Basics.always(true),
   userAccess)));
   var face1direct = Native.Ports.portIn("face1direct",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "boolean" ? v : _E.raise("invalid input, expecting JSBoolean but got " + v);
   }));
   var interpretOneStep = Native.Ports.portOut("interpretOneStep",
   Native.Ports.outgoingSignal(function (v) {
      return {script: v.script
             ,goForward: v.goForward};
   }),
   A2(Signal._op["<~"],
   function (x) {
      return {_: {}
             ,goForward: x.goForward
             ,script: x.script};
   },
   A2(Signal.foldp,
   interpret,
   initialInterpreterState)(Signal.merges(_L.fromArray([userAccess
                                                       ,A2(Signal._op["<~"],
                                                       ScriptChange,
                                                       newScript)
                                                       ,A2(Signal._op["<~"],
                                                       makeProceedRequest,
                                                       proceedRequest)
                                                       ,A2(Signal._op["<~"],
                                                       FaceOneDirect,
                                                       face1direct)])))));
   _elm.Engine.values = {_op: _op
                        ,initialInterpreterState: initialInterpreterState
                        ,clock: clock
                        ,interpretForward: interpretForward
                        ,interpret: interpret
                        ,makeProceedRequest: makeProceedRequest
                        ,userAccess: userAccess
                        ,checkAndLoad: checkAndLoad
                        ,load: load
                        ,changeDict: changeDict
                        ,createHiddenScreen: createHiddenScreen
                        ,hiddenScreen: hiddenScreen
                        ,render: render
                        ,main: main
                        ,ScriptChange: ScriptChange
                        ,PressEnter: PressEnter
                        ,FaceOneButton: FaceOneButton
                        ,ProceedRequest: ProceedRequest
                        ,FaceOneDirect: FaceOneDirect
                        ,ShowPicts: ShowPicts
                        ,ChangePict: ChangePict
                        ,FadeOut: FadeOut
                        ,WindowSize: WindowSize
                        ,PreloadImages: PreloadImages
                        ,ClearCanvas: ClearCanvas
                        ,FaceOneClicked: FaceOneClicked
                        ,Clock: Clock
                        ,VisibleObject: VisibleObject
                        ,InterpreterState: InterpreterState
                        ,EffectState: EffectState};
   return _elm.Engine.values;
};Elm.Engine = Elm.Engine || {};
Elm.Engine.FadeOut = Elm.Engine.FadeOut || {};
Elm.Engine.FadeOut.make = function (_elm) {
   "use strict";
   _elm.Engine = _elm.Engine || {};
   _elm.Engine.FadeOut = _elm.Engine.FadeOut || {};
   if (_elm.Engine.FadeOut.values)
   return _elm.Engine.FadeOut.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Engine.FadeOut";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Easing = Elm.Easing.make(_elm);
   var Engine = Engine || {};
   Engine.Config = Elm.Engine.Config.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var reflect = function (s) {
      return s.efun(Basics.toFloat(Basics.max(0)(s.count - 1)));
   };
   var isCounting = function (s) {
      return _U.cmp(s.count,
      0) > -1;
   };
   var initialState = {_: {}
                      ,count: 0
                      ,efun: Basics.always(0.0)};
   var State = F2(function (a,b) {
      return {_: {}
             ,count: a
             ,efun: b};
   });
   var ClearCanvas = {ctor: "ClearCanvas"};
   var Clock = {ctor: "Clock"};
   var Request = function (a) {
      return {ctor: "Request"
             ,_0: a};
   };
   var comp = F2(function (e,s) {
      return function () {
         switch (e.ctor)
         {case "ClearCanvas":
            return initialState;
            case "Clock":
            return _U.replace([["count"
                               ,A2(Basics.max,
                               s.count - 1,
                               -1)]],
              s);
            case "Request": return {_: {}
                                   ,count: e._0 * Engine.Config.fpsNum + 1
                                   ,efun: A5(Easing.ease,
                                   Easing.linear,
                                   Easing.number,
                                   1.0,
                                   0.0,
                                   Basics.toFloat(e._0 * Engine.Config.fpsNum))};}
         _E.Case($moduleName,
         "between lines 13 and 16");
      }();
   });
   var fadingEffect = F3(function (fadeOutRequest,
   clearCanvas,
   clock) {
      return A2(Signal._op["<~"],
      reflect,
      A2(Signal.keepIf,
      isCounting,
      initialState)(A2(Signal.foldp,
      comp,
      initialState)(Signal.merges(_L.fromArray([A2(Signal._op["<~"],
                                               Request,
                                               fadeOutRequest)
                                               ,A2(Signal._op["<~"],
                                               Basics.always(ClearCanvas),
                                               clearCanvas)
                                               ,A2(Signal._op["<~"],
                                               Basics.always(Clock),
                                               clock)])))));
   });
   _elm.Engine.FadeOut.values = {_op: _op
                                ,comp: comp
                                ,initialState: initialState
                                ,isCounting: isCounting
                                ,reflect: reflect
                                ,fadingEffect: fadingEffect
                                ,Request: Request
                                ,Clock: Clock
                                ,ClearCanvas: ClearCanvas
                                ,State: State};
   return _elm.Engine.FadeOut.values;
};Elm.Easing = Elm.Easing || {};
Elm.Easing.make = function (_elm) {
   "use strict";
   _elm.Easing = _elm.Easing || {};
   if (_elm.Easing.values)
   return _elm.Easing.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Easing";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var flip = F2(function (easing,
   time) {
      return easing(1 - time);
   });
   var retour = F2(function (easing,
   time) {
      return _U.cmp(time,
      0.5) < 0 ? easing(time * 2) : A2(flip,
      easing,
      (time - 0.5) * 2);
   });
   var invert = F2(function (easing,
   time) {
      return 1 - easing(1 - time);
   });
   var inOut = F3(function (e1,
   e2,
   time) {
      return _U.cmp(time,
      0.5) < 0 ? e1(time * 2) / 2 : 0.5 + e2((time - 0.5) * 2) / 2;
   });
   var easeInElastic = function (time) {
      return function () {
         var t$ = time - 1;
         var p = 0.3;
         var s = 7.5e-2;
         return 0 - Math.pow(2,
         10 * t$) * Basics.sin((t$ - s) * (2 * Basics.pi) / p);
      }();
   };
   var easeOutElastic = invert(easeInElastic);
   var easeInOutElastic = A2(inOut,
   easeInElastic,
   easeOutElastic);
   var easeOutBounce = function (time) {
      return function () {
         var t4 = time - 2.65 / 2.75;
         var t3 = time - 2.25 / 2.75;
         var t2 = time - 1.5 / 2.75;
         var a = 7.5625;
         return _U.cmp(time,
         1 / 2.75) < 0 ? a * time * time : _U.cmp(time,
         2 / 2.75) < 0 ? a * t2 * t2 + 0.75 : _U.cmp(time,
         2.5 / 2.75) < 0 ? a * t3 * t3 + 0.9375 : a * t4 * t4 + 0.984375;
      }();
   };
   var easeInBounce = invert(easeOutBounce);
   var easeInOutBounce = A2(inOut,
   easeInBounce,
   easeOutBounce);
   var easeInBack = function (time) {
      return time * time * (2.70158 * time - 1.70158);
   };
   var easeOutBack = invert(easeInBack);
   var easeInOutBack = A2(inOut,
   easeInBack,
   easeOutBack);
   var easeOutCirc = function (time) {
      return Basics.sqrt(1 - Math.pow(time - 1,
      2));
   };
   var easeInCirc = invert(easeOutCirc);
   var easeInOutCirc = A2(inOut,
   easeInCirc,
   easeOutCirc);
   var easeInExpo = function (time) {
      return Math.pow(2,
      10 * (time - 1));
   };
   var easeOutExpo = invert(easeInExpo);
   var easeInOutExpo = A2(inOut,
   easeInExpo,
   easeOutExpo);
   var easeOutSine = function (time) {
      return Basics.sin(time * (Basics.pi / 2));
   };
   var easeInSine = invert(easeOutSine);
   var easeInOutSine = A2(inOut,
   easeInSine,
   easeOutSine);
   var easeInQuint = function (time) {
      return Math.pow(time,5);
   };
   var easeOutQuint = invert(easeInQuint);
   var easeInOutQuint = A2(inOut,
   easeInQuint,
   easeOutQuint);
   var easeInQuart = function (time) {
      return Math.pow(time,4);
   };
   var easeOutQuart = invert(easeInQuart);
   var easeInOutQuart = A2(inOut,
   easeInQuart,
   easeOutQuart);
   var easeInCubic = function (time) {
      return Math.pow(time,3);
   };
   var easeOutCubic = invert(easeInCubic);
   var easeInOutCubic = A2(inOut,
   easeInCubic,
   easeOutCubic);
   var easeInQuad = function (time) {
      return Math.pow(time,2);
   };
   var easeOutQuad = invert(easeInQuad);
   var easeInOutQuad = A2(inOut,
   easeInQuad,
   easeOutQuad);
   var linear = Basics.id;
   var number = F3(function (from,
   to,
   v) {
      return from + (to - from) * v;
   });
   var point2d = F3(function (from,
   to,
   v) {
      return {_: {}
             ,x: A3(number,from.x,to.x,v)
             ,y: A3(number,from.y,to.y,v)};
   });
   var point3d = F3(function (from,
   to,
   v) {
      return {_: {}
             ,x: A3(number,from.x,to.x,v)
             ,y: A3(number,from.y,to.y,v)
             ,z: A3(number,from.z,to.z,v)};
   });
   var color = F3(function (from,
   to,
   v) {
      return function () {
         var float$ = F3(function (from,
         to,
         v) {
            return Basics.round(A3(number,
            Basics.toFloat(from),
            Basics.toFloat(to),
            v));
         });
         var $ = {ctor: "_Tuple2"
                 ,_0: Color.toRgb(from)
                 ,_1: Color.toRgb(to)},
         rgb1 = $._0,
         rgb2 = $._1;
         var $ = {ctor: "_Tuple4"
                 ,_0: rgb1.red
                 ,_1: rgb1.green
                 ,_2: rgb1.blue
                 ,_3: rgb1.alpha},
         r1 = $._0,
         g1 = $._1,
         b1 = $._2,
         a1 = $._3;
         var $ = {ctor: "_Tuple4"
                 ,_0: rgb2.red
                 ,_1: rgb2.green
                 ,_2: rgb2.blue
                 ,_3: rgb2.alpha},
         r2 = $._0,
         g2 = $._1,
         b2 = $._2,
         a2 = $._3;
         return A4(Color.rgba,
         A3(float$,r1,r2,v),
         A3(float$,g1,g2,v),
         A3(float$,b1,b2,v),
         A3(number,a1,a2,v));
      }();
   });
   var bezier = F5(function (x1,
   y1,
   x2,
   y2,
   time) {
      return function () {
         var casteljau = function (ps) {
            return function () {
               switch (ps.ctor)
               {case "::": switch (ps._0.ctor)
                    {case "_Tuple2":
                       switch (ps._1.ctor)
                         {case "[]": return ps._0._1;}
                         break;}
                    break;}
               return casteljau(A3(List.zipWith,
               F2(function (_v5,_v6) {
                  return function () {
                     switch (_v6.ctor)
                     {case "_Tuple2":
                        return function () {
                             switch (_v5.ctor)
                             {case "_Tuple2":
                                return {ctor: "_Tuple2"
                                       ,_0: A3(number,
                                       _v5._0,
                                       _v6._0,
                                       time)
                                       ,_1: A3(number,
                                       _v5._1,
                                       _v6._1,
                                       time)};}
                             _E.Case($moduleName,
                             "on line 121, column 71 to 111");
                          }();}
                     _E.Case($moduleName,
                     "on line 121, column 71 to 111");
                  }();
               }),
               ps,
               List.tail(ps)));
            }();
         };
         return casteljau(_L.fromArray([{ctor: "_Tuple2"
                                        ,_0: 0
                                        ,_1: 0}
                                       ,{ctor: "_Tuple2",_0: x1,_1: y1}
                                       ,{ctor: "_Tuple2",_0: x2,_1: y2}
                                       ,{ctor: "_Tuple2"
                                        ,_0: 1
                                        ,_1: 1}]));
      }();
   });
   var ease = F6(function (easing,
   interpolate,
   from,
   to,
   duration,
   time) {
      return A3(interpolate,
      from,
      to,
      easing(A2(Basics.min,
      time / duration,
      1)));
   });
   _elm.Easing.values = {_op: _op
                        ,ease: ease
                        ,number: number
                        ,point2d: point2d
                        ,point3d: point3d
                        ,color: color
                        ,linear: linear
                        ,bezier: bezier
                        ,easeInQuad: easeInQuad
                        ,easeOutQuad: easeOutQuad
                        ,easeInOutQuad: easeInOutQuad
                        ,easeInCubic: easeInCubic
                        ,easeOutCubic: easeOutCubic
                        ,easeInOutCubic: easeInOutCubic
                        ,easeInQuart: easeInQuart
                        ,easeOutQuart: easeOutQuart
                        ,easeInOutQuart: easeInOutQuart
                        ,easeInQuint: easeInQuint
                        ,easeOutQuint: easeOutQuint
                        ,easeInOutQuint: easeInOutQuint
                        ,easeInSine: easeInSine
                        ,easeOutSine: easeOutSine
                        ,easeInOutSine: easeInOutSine
                        ,easeInExpo: easeInExpo
                        ,easeOutExpo: easeOutExpo
                        ,easeInOutExpo: easeInOutExpo
                        ,easeInCirc: easeInCirc
                        ,easeOutCirc: easeOutCirc
                        ,easeInOutCirc: easeInOutCirc
                        ,easeInBack: easeInBack
                        ,easeOutBack: easeOutBack
                        ,easeInOutBack: easeInOutBack
                        ,easeInBounce: easeInBounce
                        ,easeOutBounce: easeOutBounce
                        ,easeInOutBounce: easeInOutBounce
                        ,easeInElastic: easeInElastic
                        ,easeOutElastic: easeOutElastic
                        ,easeInOutElastic: easeInOutElastic
                        ,inOut: inOut
                        ,invert: invert
                        ,flip: flip
                        ,retour: retour};
   return _elm.Easing.values;
};Elm.Engine = Elm.Engine || {};
Elm.Engine.Background = Elm.Engine.Background || {};
Elm.Engine.Background.make = function (_elm) {
   "use strict";
   _elm.Engine = _elm.Engine || {};
   _elm.Engine.Background = _elm.Engine.Background || {};
   if (_elm.Engine.Background.values)
   return _elm.Engine.Background.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Engine.Background";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Dict = Elm.Dict.make(_elm);
   var Engine = Engine || {};
   Engine.Config = Elm.Engine.Config.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var shouldRender = function (_v0) {
      return function () {
         switch (_v0.ctor)
         {case "_Tuple2":
            return _U.cmp(0,_v0._0) < 1;}
         _E.Case($moduleName,
         "on line 37, column 22 to 28");
      }();
   };
   var chooseForm = function (_v4) {
      return function () {
         switch (_v4.ctor)
         {case "_Tuple2":
            return function () {
                 var iImgNum = Basics.toFloat(List.length(_v4._1)) / (Engine.Config.fpsNum * 0.5);
                 var count = A2(Basics.max,
                 _v4._0,
                 0);
                 var ind = Basics.mod(Basics.floor(Basics.toFloat(count) * iImgNum))(List.length(_v4._1));
                 var front = List.head(A2(List.drop,
                 ind,
                 _v4._1));
                 return A2(Graphics.Collage.alpha,
                 1.0,
                 front);
              }();}
         _E.Case($moduleName,
         "between lines 31 and 35");
      }();
   };
   var cycle = function (lst) {
      return _L.append(lst,
      List.tail(List.reverse(List.tail(lst))));
   };
   var halfFpsNum = Engine.Config.fpsNum / 2;
   var imgToElement = F2(function (dict,
   info) {
      return A2(Dict.getOrFail,
      info.url,
      dict);
   });
   var Click = {ctor: "Click"};
   var Clock = {ctor: "Clock"};
   var ClearCounter = {ctor: "ClearCounter"};
   var counter = F2(function (_v8,
   count) {
      return function () {
         switch (_v8.ctor)
         {case "_Tuple2":
            return function () {
                 switch (_v8._0.ctor)
                 {case "ClearCounter": return 0;
                    case "Click":
                    return _U.cmp(_v8._1,
                      1) < 1 ? count : count + halfFpsNum;
                    case "Clock":
                    return _U.cmp(_v8._1,
                      1) < 1 ? -1 : Basics.max(-1)(count - 1);}
                 _E.Case($moduleName,
                 "between lines 26 and 29");
              }();}
         _E.Case($moduleName,
         "between lines 26 and 29");
      }();
   });
   var ClearCanvas = function (a) {
      return {ctor: "ClearCanvas"
             ,_0: a};
   };
   var NewImageSet = function (a) {
      return {ctor: "NewImageSet"
             ,_0: a};
   };
   var images = F2(function (dict,
   c) {
      return function () {
         switch (c.ctor)
         {case "ClearCanvas":
            return _L.fromArray([Graphics.Collage.toForm(Graphics.Element.empty)]);
            case "NewImageSet":
            return cycle(A2(List.map,
              imgToElement(dict),
              c._0));}
         _E.Case($moduleName,
         "between lines 21 and 23");
      }();
   });
   var backgroundForm = F5(function (clickAnim,
   clearCanvas,
   face1down,
   clock,
   changeDict) {
      return function () {
         var imageSet = A2(Signal._op["~"],
         A2(Signal._op["<~"],
         images,
         changeDict),
         Signal.merges(_L.fromArray([A2(Signal._op["<~"],
                                    ClearCanvas,
                                    clearCanvas)
                                    ,A2(Signal._op["<~"],
                                    NewImageSet,
                                    clickAnim)])));
         var imageSetSize = A2(Signal._op["<~"],
         List.length,
         imageSet);
         var aSignal = Signal.merges(_L.fromArray([A2(Signal._op["<~"],
                                                  Basics.always(ClearCounter),
                                                  clickAnim)
                                                  ,A2(Signal._op["<~"],
                                                  Basics.always(ClearCounter),
                                                  clearCanvas)
                                                  ,A2(Signal._op["<~"],
                                                  Basics.always(Click),
                                                  A3(Signal.keepIf,
                                                  Basics.id,
                                                  false,
                                                  face1down))
                                                  ,A2(Signal._op["<~"],
                                                  Basics.always(Clock),
                                                  clock)
                                                  ,A2(Signal._op["<~"],
                                                  Basics.always(ClearCounter),
                                                  changeDict)]));
         return A2(Signal._op["<~"],
         chooseForm,
         A2(Signal.keepIf,
         shouldRender,
         {ctor: "_Tuple2"
         ,_0: -1
         ,_1: _L.fromArray([Graphics.Collage.toForm(Graphics.Element.empty)])})(A2(Signal._op["~"],
         A2(Signal._op["<~"],
         F2(function (v0,v1) {
            return {ctor: "_Tuple2"
                   ,_0: v0
                   ,_1: v1};
         }),
         A2(Signal.foldp,
         counter,
         -1)(A2(Signal._op["~"],
         A2(Signal._op["<~"],
         F2(function (v0,v1) {
            return {ctor: "_Tuple2"
                   ,_0: v0
                   ,_1: v1};
         }),
         aSignal),
         imageSetSize))),
         imageSet)));
      }();
   });
   _elm.Engine.Background.values = {_op: _op
                                   ,imgToElement: imgToElement
                                   ,halfFpsNum: halfFpsNum
                                   ,cycle: cycle
                                   ,images: images
                                   ,counter: counter
                                   ,chooseForm: chooseForm
                                   ,shouldRender: shouldRender
                                   ,backgroundForm: backgroundForm
                                   ,NewImageSet: NewImageSet
                                   ,ClearCanvas: ClearCanvas
                                   ,ClearCounter: ClearCounter
                                   ,Clock: Clock
                                   ,Click: Click};
   return _elm.Engine.Background.values;
};Elm.Engine = Elm.Engine || {};
Elm.Engine.VisualObjects = Elm.Engine.VisualObjects || {};
Elm.Engine.VisualObjects.make = function (_elm) {
   "use strict";
   _elm.Engine = _elm.Engine || {};
   _elm.Engine.VisualObjects = _elm.Engine.VisualObjects || {};
   if (_elm.Engine.VisualObjects.values)
   return _elm.Engine.VisualObjects.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Engine.VisualObjects";
   var Basics = Elm.Basics.make(_elm);
   var Bitwise = Elm.Bitwise.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Dict = Elm.Dict.make(_elm);
   var Engine = Engine || {};
   Engine.CanvasImage = Elm.Engine.CanvasImage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var moveForms = F4(function (moves,
   name,
   e,
   lst) {
      return {ctor: "::"
             ,_0: A2(Graphics.Collage.moveX,
             A2(Dict.getOrFail,name,moves),
             e)
             ,_1: lst};
   });
   var makeLayer = function (s) {
      return A3(Dict.foldr,
      moveForms(s.moves),
      _L.fromArray([]),
      s.vo);
   };
   var imgToElement = F2(function (dict,
   x) {
      return A2(Dict.getOrFail,
      x.imageInfo.url,
      dict);
   });
   var initialState = {_: {}
                      ,canvasSize: {_: {}
                                   ,height: 0
                                   ,width: 0}
                      ,dict: Dict.empty
                      ,moves: Dict.empty
                      ,vo: Dict.empty};
   var State = F4(function (a,
   b,
   c,
   d) {
      return {_: {}
             ,canvasSize: c
             ,dict: d
             ,moves: a
             ,vo: b};
   });
   var CanvasSize = function (a) {
      return {ctor: "CanvasSize"
             ,_0: a};
   };
   var ChangeDict = function (a) {
      return {ctor: "ChangeDict"
             ,_0: a};
   };
   var ClearCanvas = function (a) {
      return {ctor: "ClearCanvas"
             ,_0: a};
   };
   var ChangePict = function (a) {
      return {ctor: "ChangePict"
             ,_0: a};
   };
   var ShowPicts = function (a) {
      return {ctor: "ShowPicts"
             ,_0: a};
   };
   var makeVisualObjects = F2(function (c,
   s) {
      return function () {
         switch (c.ctor)
         {case "CanvasSize":
            return _U.replace([["canvasSize"
                               ,c._0]],
              s);
            case "ChangeDict":
            return _U.replace([["dict"
                               ,c._0]],
              s);
            case "ChangePict":
            return _U.replace([["vo"
                               ,A3(Dict.insert,
                               c._0.name,
                               A2(imgToElement,s.dict,c._0),
                               s.vo)]],
              s);
            case "ClearCanvas":
            return _U.replace([["vo"
                               ,Dict.empty]],
              s);
            case "ShowPicts":
            return function () {
                 var names = A2(List.map,
                 function (x) {
                    return x.name;
                 },
                 c._0);
                 var step = Basics.toFloat(s.canvasSize.width) / Basics.toFloat(List.length(names) + 1);
                 var poslstseed = A2(List.repeat,
                 List.length(names) - 1,
                 step);
                 var poslst = List.map(function (x) {
                    return x - Basics.toFloat(A2(Bitwise.shiftRight,
                    s.canvasSize.width,
                    1));
                 })(A3(List.scanl,
                 F2(function (x,y) {
                    return x + y;
                 }),
                 step,
                 poslstseed));
                 var newMoves = Dict.fromList(A2(List.zip,
                 names,
                 poslst));
                 return _U.replace([["moves"
                                    ,newMoves]
                                   ,["vo"
                                    ,Dict.fromList(List.zip(names)(A2(List.map,
                                    imgToElement(s.dict),
                                    c._0)))]],
                 s);
              }();}
         _E.Case($moduleName,
         "between lines 24 and 34");
      }();
   });
   var visualObjectsLayer = F5(function (showPicts,
   changePict,
   clearCanvas,
   canvasSize,
   changeDict) {
      return A2(Signal._op["<~"],
      makeLayer,
      A2(Signal.foldp,
      makeVisualObjects,
      initialState)(Signal.merges(_L.fromArray([A2(Signal._op["<~"],
                                               ShowPicts,
                                               showPicts)
                                               ,A2(Signal._op["<~"],
                                               ChangePict,
                                               changePict)
                                               ,A2(Signal._op["<~"],
                                               ClearCanvas,
                                               clearCanvas)
                                               ,A2(Signal._op["<~"],
                                               CanvasSize,
                                               canvasSize)
                                               ,A2(Signal._op["<~"],
                                               ChangeDict,
                                               changeDict)]))));
   });
   _elm.Engine.VisualObjects.values = {_op: _op
                                      ,initialState: initialState
                                      ,imgToElement: imgToElement
                                      ,makeVisualObjects: makeVisualObjects
                                      ,moveForms: moveForms
                                      ,makeLayer: makeLayer
                                      ,visualObjectsLayer: visualObjectsLayer
                                      ,ShowPicts: ShowPicts
                                      ,ChangePict: ChangePict
                                      ,ClearCanvas: ClearCanvas
                                      ,ChangeDict: ChangeDict
                                      ,CanvasSize: CanvasSize
                                      ,State: State};
   return _elm.Engine.VisualObjects.values;
};Elm.Engine = Elm.Engine || {};
Elm.Engine.CanvasImage = Elm.Engine.CanvasImage || {};
Elm.Engine.CanvasImage.make = function (_elm) {
   "use strict";
   _elm.Engine = _elm.Engine || {};
   _elm.Engine.CanvasImage = _elm.Engine.CanvasImage || {};
   if (_elm.Engine.CanvasImage.values)
   return _elm.Engine.CanvasImage.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Engine.CanvasImage";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var canvasImage = F4(function (w,
   h,
   pos,
   url) {
      return Graphics.Collage.form(A4(Graphics.Collage.FImage,
      w,
      h,
      pos,
      url));
   });
   _elm.Engine.CanvasImage.values = {_op: _op
                                    ,canvasImage: canvasImage};
   return _elm.Engine.CanvasImage.values;
};Elm.Engine = Elm.Engine || {};
Elm.Engine.Config = Elm.Engine.Config || {};
Elm.Engine.Config.make = function (_elm) {
   "use strict";
   _elm.Engine = _elm.Engine || {};
   _elm.Engine.Config = _elm.Engine.Config || {};
   if (_elm.Engine.Config.values)
   return _elm.Engine.Config.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Engine.Config";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var fpsNum = 20;
   _elm.Engine.Config.values = {_op: _op
                               ,fpsNum: fpsNum};
   return _elm.Engine.Config.values;
};Elm.Gamepad = Elm.Gamepad || {};
Elm.Gamepad.make = function (_elm) {
   "use strict";
   _elm.Gamepad = _elm.Gamepad || {};
   if (_elm.Gamepad.values)
   return _elm.Gamepad.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Gamepad";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Gamepad = Elm.Native.Gamepad.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var lastPressed = Native.Gamepad.lastPressed;
   var buttonsDown = Native.Gamepad.buttonsDown;
   var isDown = Native.Gamepad.isDown;
   var face1button = isDown(0);
   var face2button = isDown(1);
   _elm.Gamepad.values = {_op: _op
                         ,isDown: isDown
                         ,face1button: face1button
                         ,face2button: face2button
                         ,buttonsDown: buttonsDown
                         ,lastPressed: lastPressed};
   return _elm.Gamepad.values;
};Elm.Keyboard = Elm.Keyboard || {};
Elm.Keyboard.Keys = Elm.Keyboard.Keys || {};
Elm.Keyboard.Keys.make = function (_elm) {
   "use strict";
   _elm.Keyboard = _elm.Keyboard || {};
   _elm.Keyboard.Keys = _elm.Keyboard.Keys || {};
   if (_elm.Keyboard.Keys.values)
   return _elm.Keyboard.Keys.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Keyboard.Keys";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var Keyboard = Elm.Keyboard.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var zero = {_: {}
              ,keyCode: 58
              ,name: "0"};
   var nine = {_: {}
              ,keyCode: 57
              ,name: "9"};
   var eight = {_: {}
               ,keyCode: 56
               ,name: "8"};
   var seven = {_: {}
               ,keyCode: 55
               ,name: "7"};
   var six = {_: {}
             ,keyCode: 54
             ,name: "6"};
   var five = {_: {}
              ,keyCode: 53
              ,name: "5"};
   var four = {_: {}
              ,keyCode: 52
              ,name: "4"};
   var three = {_: {}
               ,keyCode: 51
               ,name: "3"};
   var two = {_: {}
             ,keyCode: 50
             ,name: "2"};
   var one = {_: {}
             ,keyCode: 49
             ,name: "1"};
   var f10 = {_: {}
             ,keyCode: 121
             ,name: "F10"};
   var f9 = {_: {}
            ,keyCode: 120
            ,name: "F9"};
   var f8 = {_: {}
            ,keyCode: 119
            ,name: "F8"};
   var f4 = {_: {}
            ,keyCode: 115
            ,name: "F4"};
   var f2 = {_: {}
            ,keyCode: 113
            ,name: "F2"};
   var escape = {_: {}
                ,keyCode: 27
                ,name: "Escape"};
   var pageUp = {_: {}
                ,keyCode: 33
                ,name: "Page up"};
   var pageDown = {_: {}
                  ,keyCode: 34
                  ,name: "Page down"};
   var home = {_: {}
              ,keyCode: 36
              ,name: "Home"};
   var end = {_: {}
             ,keyCode: 35
             ,name: "End"};
   var insert = {_: {}
                ,keyCode: 45
                ,name: "Insert"};
   var $delete = {_: {}
                 ,keyCode: 46
                 ,name: "Delete"};
   var backspace = {_: {}
                   ,keyCode: 8
                   ,name: "Backspace"};
   var arrowDown = {_: {}
                   ,keyCode: 40
                   ,name: "Down arrow"};
   var arrowUp = {_: {}
                 ,keyCode: 38
                 ,name: "Up arrow"};
   var arrowLeft = {_: {}
                   ,keyCode: 39
                   ,name: "Left arrow"};
   var arrowRight = {_: {}
                    ,keyCode: 37
                    ,name: "Right arrow"};
   var enter = {_: {}
               ,keyCode: 13
               ,name: "Enter"};
   var space = {_: {}
               ,keyCode: 32
               ,name: "Space"};
   var commandRight = {_: {}
                      ,keyCode: 93
                      ,name: "Command right"};
   var commandLeft = {_: {}
                     ,keyCode: 91
                     ,name: "Command left"};
   var windows = {_: {}
                 ,keyCode: 91
                 ,name: "Windows"};
   var meta = {_: {}
              ,keyCode: 91
              ,name: "Meta"};
   var $super = {_: {}
                ,keyCode: 91
                ,name: "Super"};
   var tab = {_: {}
             ,keyCode: 9
             ,name: "Tab"};
   var shift = {_: {}
               ,keyCode: 16
               ,name: "Shift"};
   var ctrl = {_: {}
              ,keyCode: 17
              ,name: "Ctrl"};
   var z = {_: {}
           ,keyCode: 90
           ,name: "z"};
   var y = {_: {}
           ,keyCode: 89
           ,name: "y"};
   var x = {_: {}
           ,keyCode: 88
           ,name: "x"};
   var w = {_: {}
           ,keyCode: 87
           ,name: "w"};
   var v = {_: {}
           ,keyCode: 86
           ,name: "v"};
   var u = {_: {}
           ,keyCode: 85
           ,name: "u"};
   var t = {_: {}
           ,keyCode: 84
           ,name: "t"};
   var s = {_: {}
           ,keyCode: 83
           ,name: "s"};
   var r = {_: {}
           ,keyCode: 82
           ,name: "r"};
   var q = {_: {}
           ,keyCode: 81
           ,name: "q"};
   var p = {_: {}
           ,keyCode: 80
           ,name: "p"};
   var o = {_: {}
           ,keyCode: 79
           ,name: "o"};
   var n = {_: {}
           ,keyCode: 78
           ,name: "n"};
   var m = {_: {}
           ,keyCode: 77
           ,name: "m"};
   var l = {_: {}
           ,keyCode: 76
           ,name: "l"};
   var k = {_: {}
           ,keyCode: 75
           ,name: "k"};
   var j = {_: {}
           ,keyCode: 74
           ,name: "j"};
   var i = {_: {}
           ,keyCode: 73
           ,name: "i"};
   var h = {_: {}
           ,keyCode: 72
           ,name: "h"};
   var g = {_: {}
           ,keyCode: 71
           ,name: "g"};
   var f = {_: {}
           ,keyCode: 70
           ,name: "f"};
   var e = {_: {}
           ,keyCode: 69
           ,name: "e"};
   var d = {_: {}
           ,keyCode: 68
           ,name: "d"};
   var c = {_: {}
           ,keyCode: 67
           ,name: "b"};
   var b = {_: {}
           ,keyCode: 66
           ,name: "b"};
   var a = {_: {}
           ,keyCode: 65
           ,name: "a"};
   var isKeyDown = function (k) {
      return Keyboard.isDown(k.keyCode);
   };
   var directionKeys = F4(function (up,
   down,
   right,
   left) {
      return A4(Keyboard.directions,
      up.keyCode,
      down.keyCode,
      right.keyCode,
      left.keyCode);
   });
   var Key = F2(function (a,b) {
      return {_: {}
             ,keyCode: a
             ,name: b};
   });
   _elm.Keyboard.Keys.values = {_op: _op
                               ,directionKeys: directionKeys
                               ,isKeyDown: isKeyDown
                               ,a: a
                               ,b: b
                               ,c: c
                               ,d: d
                               ,e: e
                               ,f: f
                               ,g: g
                               ,h: h
                               ,i: i
                               ,j: j
                               ,k: k
                               ,l: l
                               ,m: m
                               ,n: n
                               ,o: o
                               ,p: p
                               ,q: q
                               ,r: r
                               ,s: s
                               ,t: t
                               ,u: u
                               ,v: v
                               ,w: w
                               ,x: x
                               ,y: y
                               ,z: z
                               ,ctrl: ctrl
                               ,shift: shift
                               ,tab: tab
                               ,$super: $super
                               ,meta: meta
                               ,windows: windows
                               ,commandLeft: commandLeft
                               ,commandRight: commandRight
                               ,space: space
                               ,enter: enter
                               ,arrowRight: arrowRight
                               ,arrowLeft: arrowLeft
                               ,arrowUp: arrowUp
                               ,arrowDown: arrowDown
                               ,backspace: backspace
                               ,$delete: $delete
                               ,insert: insert
                               ,end: end
                               ,home: home
                               ,pageDown: pageDown
                               ,pageUp: pageUp
                               ,escape: escape
                               ,f2: f2
                               ,f4: f4
                               ,f8: f8
                               ,f9: f9
                               ,f10: f10
                               ,one: one
                               ,two: two
                               ,three: three
                               ,four: four
                               ,five: five
                               ,six: six
                               ,seven: seven
                               ,eight: eight
                               ,nine: nine
                               ,zero: zero
                               ,Key: Key};
   return _elm.Keyboard.Keys.values;
};