// Share state from ScoreThresholdInput

import { createContext, useState } from 'react';

const ScoreThresholdContext = createContext();

const ScoreThresholdProvider = ({ children }) => {
  const [scoreThreshold, setScoreThreshold] = useState(30);
  const [isScoreThresholdUpdated, setIsScoreThresholdUpdated] = useState(false);

  const sharedContext = {
    scoreThreshold,
    setScoreThreshold,
    isScoreThresholdUpdated,
    setIsScoreThresholdUpdated
  };

  return (
    <ScoreThresholdContext.Provider value={ sharedContext }>
      {children}
    </ScoreThresholdContext.Provider>
  );
};

export { ScoreThresholdProvider, ScoreThresholdContext };