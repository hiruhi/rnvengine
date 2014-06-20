module Engine where

import Keyboard.Keys as K
import Gamepad as P
import Mouse as M
import Dict as D
import Engine.Config (..)
import Engine.Background (backgroundForm)
import Engine.FadeOut (fadingEffect)
import Color
import Engine.VisualObjects (visualObjectsLayer)
import Debug

port face1direct: Signal Bool
port shaking : Signal Bool
port newScript: Signal [String]
port showPicts: Signal [{name: String, imageInfo: {url: String, width: Int, height: Int}}]
port changePict: Signal {name: String, imageInfo: {url: String, width: Int, height: Int}}
port fadeOut: Signal Int
port isModal: Signal Bool
port proceedRequest: Signal Bool
port clickAnim: Signal [{url:String, width: Int, height: Int}]
port clearCanvas: Signal {width:Int, height:Int}
port preloadImages: Signal [{url:String, width: Int, height: Int}]
port canvasSize: Signal {width: Int, height: Int}
port loading: Signal Bool

type VisibleObject = {name: String, imageInfo: {url: String, width: Int, height: Int}}

data MyChangeEvent = ScriptChange [String]
                   | PressEnter Bool
                   | FaceOneButton Bool
                   | ProceedRequest Bool
                   | FaceOneDirect Bool

type InterpreterState = {script: String,
                         scriptsLeft: [String],
                         goForward: Bool,
                         clickCount: Int}

type EffectState = {visibleObjects: [{name: String, form: Form, x: Int, y: Int}],
                    assets: D.Dict String Form,
                    easer: Int -> Form -> Form,
                    width: Int,
                    height: Int,
                    redraw: Bool,
                    counter: Int,
                    countUpdator: Int -> Int -> Int,
                    stopper: Int -> Bool}

data EffectCommand = ShowPicts [VisibleObject]
                   | ChangePict VisibleObject
                   | FadeOut Float
                   | WindowSize {width:Int,height:Int}
                   | PreloadImages [{url: String, width: Int, height: Int}]
                   | ClearCanvas {width:Float, height:Float}
                   | FaceOneClicked
                   | Clock


initialInterpreterState = {script="", scriptsLeft=[], goForward=False, clickCount = 0, directface1=False}

clock = always Clock <~ (fps fpsNum)

interpretForward s =
  case s.scriptsLeft of
    [] -> {s | script <- "", goForward <- False, clickCount <- 0}
    hd::tl -> {s | script <- hd, scriptsLeft <- tl, goForward <- True, clickCount <- 0}

interpret c s = 
  case c of
    FaceOneButton b -> if b then
                           if s.directface1 then interpretForward s
                           else if (s.clickCount + 1) > (sqrt <| String.length s.script) then interpretForward s
                                else {s | clickCount <- s.clickCount + 1, goForward <- False}
                       else {s | goForward <- False}
    ProceedRequest b -> if b then interpretForward s else { s | goForward <- False}
    PressEnter b -> if b then interpretForward s else { s | goForward <- False}
    ScriptChange newscript -> interpretForward {s | scriptsLeft <- newscript}
    FaceOneDirect b -> {s | directface1 <- b, goForward <- False}

makeProceedRequest = always <| ProceedRequest True

userAccess = dropWhen loading (ProceedRequest False) <| 
             merges [dropWhen isModal (ProceedRequest False) <| makeProceedRequest <~ M.clicks,
                     dropWhen isModal (PressEnter False) <| PressEnter <~ keepIf id False (K.isKeyDown K.enter),
                     dropWhen isModal (FaceOneButton False) <| FaceOneButton <~ keepIf id False P.face1button
                    ]

checkAndLoad img dict =
  case D.get img.url dict of
    Just _ -> dict
    Nothing -> D.insert img.url (form <| FImage img.width img.height (0,0) img.url) dict


load lst dict = foldr (\e d -> if e.url == "" then d else checkAndLoad e d) dict lst

-- changeDict : Signal (D.Dict String Form)
-- changeDict = foldp load D.empty preloadImages

-- createHiddenScreen dict = D.values dict
-- hiddenScreen = createHiddenScreen <~ changeDict

render canvas fading elements = 
    let w = toFloat canvas.width
        h = toFloat canvas.height
        hw = w * 0.5
        hh = h * 0.5
        bs = alpha fading <| filled Color.black <| rect w h
    in collage canvas.width canvas.height <| elements ++ [bs]

main = render <~ canvasSize ~ (fadingEffect fadeOut clearCanvas clock) ~ ((::) <~ backgroundForm clickAnim clearCanvas P.face1button clock  ~ visualObjectsLayer showPicts changePict clearCanvas canvasSize)

port jumpRequest : Signal Bool
port jumpRequest = keepIf id False P.face2button

port shakeRequest : Signal Bool
port shakeRequest = keepWhen shaking False <| always True <~ userAccess

port interpretOneStep : Signal {script: String, goForward: Bool}
port interpretOneStep  = (\x -> {script=x.script, goForward=x.goForward}) <~ (foldp interpret initialInterpreterState <| merges [userAccess, ScriptChange <~ newScript, makeProceedRequest <~ proceedRequest, FaceOneDirect <~ face1direct])
