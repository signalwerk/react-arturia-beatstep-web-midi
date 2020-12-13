/*
// https://www.midimonitor.com/
usage:

import Arturia from "./useArturia";
const { usePadPress, useKnobTurn } = Arturia("Arturia BeatStep");

// happyPress(padNr, padDownCallback, padUpCallback );
const happyPress = usePadPress(1);
const sadPress = usePadPress(2);
const [test, setText] = useState("init");
usePadPress(9, _ => setText("down"), _ => setText("up"));

// useKnobTurn(knobNr, initValue, stepSize);
// * optional
const knobA = useKnobTurn(1, 13, 0.1, cb*);
const knobB = useKnobTurn(2, 13, 0.1, cb*);
*/

import { useState, useEffect, useRef } from "react";
import WebMidi from "webmidi";

let input = null;
let boot = false;
let afterBoot = [];

const padMap = {
  "36": 9,
  "37": 10,
  "38": 11,
  "39": 12,
  "40": 13,
  "41": 14,
  "42": 15,
  "43": 16,

  "44": 1,
  "45": 2,
  "46": 3,
  "47": 4,
  "48": 5,
  "49": 6,
  "50": 7,
  "51": 8
};

const knobMap = {
  "10": 1,
  "74": 2,
  "71": 3,
  "76": 4,
  "77": 5,
  "93": 6,
  "73": 7,
  "75": 8,

  "114": 9,
  "18": 10,
  "19": 11,
  "16": 12,
  "17": 13,
  "91": 14,
  "79": 15,
  "72": 16
};

// Enable WebMidi.js
// WebMidi.enable(function(err) {
//   if (err) {
//     console.log("WebMidi could not be enabled.", err);
//   }
//
//   // Viewing available inputs and outputs
//   console.log(WebMidi.inputs);
//   console.log(WebMidi.outputs);
//
//   // Retrieve an input by name, id or index
//   input = WebMidi.getInputByName("Arturia BeatStep");
//   // input = WebMidi.getInputById("1809568182");
//   input = WebMidi.inputs[0];
//
//   // Listen to control change message on all channels
//   input.addListener("controlchange", "all", function(e) {
//     console.log("Received 'controlchange' message.", e);
//   });
//
//   // Listen to pitch bend message on channel 3
//   input.addListener("pitchbend", "all", function(e) {
//     console.log("Received 'pitchbend' message.", e);
//   });
//
//   // Listen to NRPN message on all channels
//   input.addListener("nrpn", "all", function(e) {
//     if (e.controller.type === "entry") {
//       console.log("Received 'nrpn' 'entry' message.", e);
//     }
//     if (e.controller.type === "decrement") {
//       console.log("Received 'nrpn' 'decrement' message.", e);
//     }
//     if (e.controller.type === "increment") {
//       console.log("Received 'nrpn' 'increment' message.", e);
//     }
//     console.log("message value: " + e.controller.value + ".", e);
//   });
//
//   // Listen to pitch bend message on channel 3
//   input.addListener("pitchbend", "all", function(e) {
//     console.log("Received 'pitchbend' message.", e);
//   });
//
//   input.addListener("programchange", "all", function(e) {
//     console.log("Received 'programchange' message.", e);
//   });
//
//   // Listen to control change message on all channels
//   input.addListener("controlchange", "all", function(e) {
//     console.log("Received 'controlchange' message.", e);
//   });
//
//   // Check for the presence of an event listener (in such cases, you cannot use anonymous functions).
//   function test(e) {
//     console.log(e);
//   }
//   input.addListener("programchange", "all", test);
//   console.log(
//     "Has event listener: ",
//     input.hasListener("programchange", "all", test)
//   );
//
//   // Remove a specific listener
//   // input.removeListener("programchange", "all", test);
//   // console.log(
//   //   "Has event listener: ",
//   //   input.hasListener("programchange", "all", test)
//   // );
//
//   // // Remove all listeners of a specific type on a specific channel
//   // input.removeListener("noteoff", "all");
//   //
//   // // Remove all listeners for 'noteoff' on all channels
//   // input.removeListener("noteoff");
//   //
//   // // Remove all listeners on the input
//   // input.removeListener();
// });

const Arturia = nameOfInput => {
  const usePadPress = (targetPad, cbDown, cbUp) => {
    // State for keeping track of whether pad is pressed
    const [padPressed, setPadPressed] = useState(false);

    // If pressed pad set to true
    function downHandler(e) {
      // console.log("Received 'noteon' message", e);

      if (padMap[`${e.note.number}`] === targetPad) {
        setPadPressed(true);

        if (cbDown) {
          cbDown();
        }
      }
    }

    // If released pad set to false
    const upHandler = e => {
      // console.log("Received 'noteoff' message", e);

      if (padMap[`${e.note.number}`] === targetPad) {
        setPadPressed(false);

        if (cbUp) {
          cbUp();
        }
      }
    };

    // Add event listeners
    useEffect(() => {
      if (input) {
        input.addListener("noteon", "all", downHandler);
        input.addListener("noteoff", "all", upHandler);
      } else {
        afterBoot.push(e => {
          input.addListener("noteon", "all", downHandler);
          input.addListener("noteoff", "all", upHandler);
        });

        if (boot === false) {
          boot = true;

          WebMidi.enable(err => {
            if (err) {
              console.log("WebMidi could not be enabled.", err);
            }

            input = WebMidi.getInputByName(nameOfInput);

            if (!input) {
              console.log("device couldn't be started");
              return;
            }

            afterBoot.map(item => item());
            afterBoot = [];
          });
        }
      }
      // Remove event listeners on cleanup
      return () => {
        input.removeListener("noteon", "all", downHandler);
        input.removeListener("noteoff", "all", upHandler);
      };
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return padPressed;
  };

  const useKnobTurn = (targetKnob, init, step, cb) => {
    // State for keeping track of the knob
    const [knobValue, setKnobValue] = useState(init || 100);

    const changeHandler = (e) => {
      // console.log("Received 'controlchange' message.", e);

      if (knobMap[`${e.controller.number}`] === targetKnob) {
        if (cb) {
          if (e.value > 64) {
            cb(step || 1);
          } else {
            cb(0 - (step || 1));
          }
        }
        setKnobValue((knobValue) =>
          e.value > 64 ? knobValue + (step || 1) : knobValue - (step || 1)
        );
      }
    };

    // Add event listeners
    useEffect(() => {
      if (input) {
        input.addListener("controlchange", "all", changeHandler);
      } else {
        afterBoot.push(e => {
          input.addListener("controlchange", "all", changeHandler);
        });

        if (boot === false) {
          boot = true;

          WebMidi.enable(err => {
            if (err) {
              console.log("WebMidi could not be enabled.", err);
            }

            input = WebMidi.getInputByName(nameOfInput);

            if (!input) {
              console.log("device couldn't be started");
              return;
            }

            afterBoot.map(item => item());
            afterBoot = [];
          });
        }
      }
      // Remove event listeners on cleanup
      return () => {
        input.removeListener("controlchange", "all", changeHandler);
      };
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return knobValue;
  };

  return {
    usePadPress,
    useKnobTurn
  };
};

export default Arturia;
