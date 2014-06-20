module Engine.VisualObjects where


import Dict as D
import Bitwise (..)

data Event = ShowPicts [{name: String, imageInfo: {url: String, width: Int, height: Int}}]
           | ChangePict {name: String, imageInfo: {url: String, width: Int, height: Int}}
           | ClearCanvas {width:Int, height:Int}
           | ChangeDict (D.Dict String Element)
           | CanvasSize {width: Int, height: Int}


type State = {moves: D.Dict String Float, vo: D.Dict String Element, dict: D.Dict String Element, canvasSize: {width:Int, height:Int}}

initialState : State
initialState = {moves=D.empty, vo=D.empty, dict=D.empty, canvasSize={width=0, height=0}}

imgToElement dict img = D.getOrFail img.imageInfo.url dict

makeVisualObjects c s = 
    case c of
      ClearCanvas d -> {s | vo <- D.empty}
      CanvasSize d -> {s | canvasSize <- d}
      ChangeDict d -> {s | dict <- d}
      ShowPicts lst -> let names = map (\x -> x.name) lst
                           step = (toFloat s.canvasSize.width) / (toFloat <| length names + 1)
                           poslstseed = repeat (length names - 1) step
                           poslst = map (\x -> x - (toFloat <| s.canvasSize.width `shiftRight` 1)) <| scanl (\x y -> x + y) step poslstseed  
                           newMoves = D.fromList <| zip names poslst in
                       {s | moves <- newMoves, vo <- D.fromList <| zip names <| map (imgToElement s.dict) lst}
      ChangePict p -> {s | vo <- D.insert p.name (imgToElement s.dict p) s.vo }


moveForms moves name e lst = (moveX (D.getOrFail name moves) <| toForm e) :: lst

makeLayer s = collage s.canvasSize.width s.canvasSize.height <| D.foldr (moveForms s.moves) [] s.vo

visualObjectsLayer showPicts changePict clearCanvas changeDict canvasSize = 
    makeLayer <~ (foldp makeVisualObjects initialState <| merges [ShowPicts <~ showPicts, ChangePict <~ changePict, ClearCanvas <~ clearCanvas, ChangeDict <~ changeDict, CanvasSize <~ canvasSize])