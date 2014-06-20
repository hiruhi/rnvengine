module Gamepad where

import Signal (Signal)
import Native.Gamepad

type ButtonId = Int


isDown : ButtonId -> Signal Bool
isDown = Native.Gamepad.isDown

face1button = isDown 0

face2button = isDown 1

buttonsDown : Signal [ButtonId]
buttonsDown = Native.Gamepad.buttonsDown

lastPressed : Signal ButtonId
lastPressed = Native.Gamepad.lastPressed
