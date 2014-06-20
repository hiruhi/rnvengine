module Engine.VisualObjects where


import Dict as D
import Bitwise (..)
import Engine.CanvasImage (..)

data Event = ShowPicts [{name: String, imageInfo: {url: String, width: Int, height: Int}}]
           | ChangePict {name: String, imageInfo: {url: String, width: Int, height: Int}}
           | ClearCanvas {width:Int, height:Int}
           | CanvasSize {width: Int, height: Int}


type State = {moves: D.Dict String Float, vo: D.Dict String Form, canvasSize: {width:Int, height:Int}}

initialState : State
initialState = {moves=D.empty, vo=D.empty, canvasSize={width=0, height=0}}


imgToElement x = let info = x.imageInfo in
                 canvasImage info.width info.height (0,0) info.url

makeVisualObjects c s = 
    case c of
      ClearCanvas d -> {s | vo <- D.empty}
      CanvasSize d -> {s | canvasSize <- d}
      ShowPicts lst -> let names = map (\x -> x.name) lst
                           step = (toFloat s.canvasSize.width) / (toFloat <| length names + 1)
                           poslstseed = repeat (length names - 1) step
                           poslst = map (\x -> x - (toFloat <| s.canvasSize.width `shiftRight` 1)) <| scanl (\x y -> x + y) step poslstseed  
                           newMoves = D.fromList <| zip names poslst in
                       {s | moves <- newMoves, vo <- D.fromList <| zip names <| map imgToElement lst}
      ChangePict p -> {s | vo <- D.insert p.name (imgToElement p) s.vo }


moveForms moves name e lst = (moveX (D.getOrFail name moves) e) :: lst

makeLayer s = D.foldr (moveForms s.moves) [] s.vo

visualObjectsLayer showPicts changePict clearCanvas canvasSize = 
    makeLayer <~ (foldp makeVisualObjects initialState <| merges [ShowPicts <~ showPicts, ChangePict <~ changePict, ClearCanvas <~ clearCanvas, CanvasSize <~ canvasSize])