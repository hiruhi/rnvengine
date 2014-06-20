module Engine.Background where

import Dict as D
import Engine.Config (..)
import Color as Color
import Debug

data ImageCommand = NewImageSet [{url:String, width: Int, height: Int}]
                  | ClearCanvas {width:Int, height:Int}

data CounterCommand = ClearCounter
                    | Clock
                    | Click

imgToElement dict info  = case D.get info.url dict of Just form -> form

halfFpsNum = fpsNum / 2                                                   

images d c = case c of
               ClearCanvas d -> [empty]
               NewImageSet sets -> map (imgToElement d) sets

counter (c,numOfImages) count =
  case c of
    Click -> if numOfImages <= 1 then count else count + halfFpsNum
    Clock -> if numOfImages <= 1 then -1 else max -1 <| count-1
    ClearCounter -> 0

chooseForm (s,imgs) = let count = max s  0
                          iImgNum =  (toFloat <| length imgs) / (fpsNum * 0.5)
                          ind = mod (floor <| toFloat count * iImgNum) <| length imgs
                          front = head <| drop ind imgs
                      in opacity 1.0 front

shouldRender (x,y) = 0 <= x
  
backgroundForm clickAnim clearCanvas face1down clock dict =
  let aSignal = merges [always ClearCounter <~ clickAnim, always ClearCounter <~ clearCanvas, always Click <~ keepIf id False face1down, always Clock <~ clock] 
      imageSet = images <~ dict ~ merges [ClearCanvas <~ clearCanvas, NewImageSet <~ clickAnim]
      imageSetSize = length <~ imageSet
  in chooseForm <~ (keepIf shouldRender (-1,[empty]) <| (,) <~ (foldp counter -1 <| (,) <~ aSignal ~ imageSetSize) ~ imageSet)
