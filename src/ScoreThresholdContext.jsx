// Share state from ScoreThresholdInput

import { createContext, useState } from 'react';

const ScoreThresholdContext = createContext();

const ScoreThresholdProvider = ({ children }) => {
  const [sliderValue, setSliderValue] = useState(0.3);

  const sharedContext = {
    sliderValue,
    setSliderValue
  };

  return (
    <ScoreThresholdContext.Provider value={ sharedContext }>
      {children}
    </ScoreThresholdContext.Provider>
  );
};

export { ScoreThresholdProvider, ScoreThresholdContext };