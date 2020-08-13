import { useState, useEffect, useRef } from "react";

const _useTimer = time => {
  const [tick, setTick] = useState(0);

  // const countRef = useRef(tick);
  // countRef.current = tick;

  const changeHandler = e => {
    setKnobValue(e.value > 64 ? knobValue + 1 : knobValue - 1);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("still ticking");
      setTick(currCount => currCount + 1);
    }, 1000);
    // Clear timeout if the component is unmounted
    return () => clearInterval(timer);
  }, []);

  return tick;
};

const useTimer = () => {
  return { useTimer: _useTimer };
};

export default useTimer;
