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
