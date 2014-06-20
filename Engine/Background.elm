module Engine.Background where

import Dict as D
import Engine.Config (..)
import Color as Color

data ImageCommand = NewImageSet [{url:String, width: Int, height: Int}]
                  | ClearCanvas {width:Int, height:Int}

data CounterCommand = ClearCounter
                    | Clock
                    | Click

imgToElement dict info  = D.getOrFail info.url dict

halfFpsNum = fpsNum / 2                   

cycle lst = if length lst >= 2 then lst ++ (tail <| reverse <| tail lst) else lst

images dict c = case c of
             ClearCanvas d -> [toForm empty]
             NewImageSet sets -> cycle <| map (imgToElement dict) sets

counter (c,numOfImages) count =
  case c of
    Click -> if numOfImages <= 1 then count else count + halfFpsNum
    Clock -> if numOfImages <= 1 then -1 else max -1 <| count-1
    ClearCounter -> 0

chooseForm (s,imgs) = let count = max s  0
                          iImgNum =  (toFloat <| length imgs) / (fpsNum * 0.5)
                          ind = mod (floor <| toFloat count * iImgNum) <| length imgs
                          front = head <| drop ind imgs
                      in alpha 1.0 front

shouldRender (x,y) = 0 <= x
  
backgroundForm clickAnim clearCanvas face1down clock changeDict =
  let aSignal = merges [always ClearCounter <~ clickAnim, always ClearCounter <~ clearCanvas, always Click <~ keepIf id False face1down, always Clock <~ clock, always ClearCounter <~ changeDict] 
      imageSet = images <~ changeDict ~ merges [ClearCanvas <~ clearCanvas, NewImageSet <~ clickAnim]
      imageSetSize = length <~ imageSet
  in chooseForm <~ (keepIf shouldRender (-1,[toForm empty]) <| (,) <~ (foldp counter -1 <| (,) <~ aSignal ~ imageSetSize) ~ imageSet)
