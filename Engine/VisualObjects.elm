module Engine.VisualObjects where


import Dict as D
import Bitwise (..)
import Engine.CanvasImage (..)

data Event = ShowPicts [{name: String, imageInfo: [{url: String, width: Int, height: Int}]}]
           | ChangePict {name: String, imageInfo: [{url: String, width: Int, height: Int}]}
           | ClearCanvas {width:Int, height:Int}
           | ChangeDict (D.Dict String Form)
           | CanvasSize {width: Int, height: Int}


type State = {moves: D.Dict String Float, vo: D.Dict String Form, canvasSize: {width:Int, height:Int}, dict: D.Dict String Form}

initialState : State
initialState = {moves=D.empty, vo=D.empty, canvasSize={width=0, height=0}, dict=D.empty}


halve i = toFloat i * 0.5

imgToElement dict x = case x.imageInfo of
                        [] -> []
                        hd::tl -> let (base::accs) = map (\info -> D.getOrFail info.url dict) <| x.imageInfo
                                      mw = halve hd.width
                                      mh = hd.height
                                  in base :: (map (\(info,f) -> move (halve info.width - mw, halve <| mh - info.height) f) <| zip tl accs)
                      


makeVisualObjects c s = 
    case c of
      ClearCanvas d -> {s | vo <- D.empty}
      CanvasSize d -> {s | canvasSize <- d}
      ShowPicts lst -> let names = map (\x -> x.name) lst
                           step = (toFloat s.canvasSize.width) / (toFloat <| length names + 1)
                           poslstseed = repeat (length names - 1) step
                           poslst = map (\x -> x - (toFloat <| s.canvasSize.width `shiftRight` 1)) <| scanl (\x y -> x + y) step poslstseed  
                           newMoves = D.fromList <| zip names poslst in
                       {s | moves <- newMoves, vo <- D.fromList <| zip names <| map (group . imgToElement s.dict) lst}
      ChangePict p -> {s | vo <- D.insert p.name (group <| imgToElement s.dict p) s.vo }
      ChangeDict d -> {s | dict <- d}


moveForms moves name e lst = (moveX (D.getOrFail name moves) e) :: lst

makeLayer s = D.foldr (moveForms s.moves) [] s.vo

visualObjectsLayer showPicts changePict clearCanvas canvasSize changeDict = 
    makeLayer <~ (foldp makeVisualObjects initialState <| merges [ShowPicts <~ showPicts, ChangePict <~ changePict, ClearCanvas <~ clearCanvas, CanvasSize <~ canvasSize, ChangeDict <~ changeDict])