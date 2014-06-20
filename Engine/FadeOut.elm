module Engine.FadeOut where

import Engine.Config (..)
import Easing as E

data Event = Request Int
           | Clock
           | ClearCanvas

type State = {count: Int, efun: Time -> Float}

comp e s =
  case e of
    ClearCanvas -> initialState
    Clock -> {s | count <- max (s.count - 1) -1}
    Request sec -> {efun = E.ease E.linear E.number 1.0 0.0 (toFloat <| sec*fpsNum), count = sec*fpsNum + 1}

initialState = {count = 0, efun = always 0.0}

isCounting s = s.count >= 0

reflect s = s.efun <| toFloat <| max 0 <| s.count - 1

fadingEffect fadeOutRequest clearCanvas clock = 
  reflect <~ (keepIf isCounting initialState <| foldp comp initialState <| merges [Request <~ fadeOutRequest, always ClearCanvas <~ clearCanvas, always Clock <~ clock])
