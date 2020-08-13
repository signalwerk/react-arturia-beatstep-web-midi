import React, { useState } from "react";
import Arturia from "./useArturia";
import "./App.css";

const { usePadPress, useKnobTurn } = Arturia("Arturia BeatStep");

function App() {
  const happyPress = usePadPress(1);
  const sadPress = usePadPress(2);
  const knobA = useKnobTurn(1, 100, 1);
  const knobB = useKnobTurn(2, 100, 1);

  const [test, setText] = useState("init");
  usePadPress(
    9,
    _ => setText("down"),
    _ => setText("up")
  );

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Use Arturia BeatStep and press Pad 1, 2 &amp; 9 or use Knob 1 &amp; 2.
        </p>
        <p>
          Knob 1: {knobA} <br />
          Knob 2: {knobB} <br />
          Pad 1: {happyPress ? "true" : "false"}
          <br />
          Pad 2: {sadPress ? "true" : "false"}
          <br />
          Pad 9: {test}
        </p>
      </header>
    </div>
  );
}

export default App;
