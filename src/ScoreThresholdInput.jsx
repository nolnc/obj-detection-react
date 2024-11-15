// Renders a horizontal slider enabling users to adjust the scoreThreshold value for object detection.
// This threshold defines the minimum confidence level (range: 0.0 to 1.0) required for detected objects
// to be reported. 
// A value of 0.0 returns all detected categories, while 1.0 only returns categories with 100% detection
// confidence.

import React, { useContext } from 'react';
import { ScoreThresholdContext } from './ScoreThresholdContext';

const ScoreThresholdInput = () => {
  const { scoreThreshold, setScoreThreshold, setIsScoreThresholdUpdated } = useContext(ScoreThresholdContext);

  const handleSliderChange = (e) => {
    setScoreThreshold(e.target.value);
    console.log("handleSliderChange() score=" + e.target.value);
  };

  const handleManualInput = (e) => {
    const value = e.target.value;
    console.log("handleManualInput() score=" + value);
    if (value >= 1 && value <= 100) {
      setScoreThreshold(value);
      setIsScoreThresholdUpdated(true);
    }
  };

  const handleMouseUp = (e) => {
    console.log("handleMouseUp() score=" + e.target.value);
    setIsScoreThresholdUpdated(true);
  };

  return (
    <div className="slider-component-container">
      <div className="slider-bar-container">
        <label className="slider-name">Min % Confidence</label>
        <input type="range" id="slider-bar" min="1" max="100" step="1" value={scoreThreshold} onChange={handleSliderChange} onMouseUp={handleMouseUp}/>
      </div>
      <input type="number" id="slider-value" min="1" max="100" step="1" value={scoreThreshold} onChange={handleManualInput}/>
    </div>
  );
};

export default ScoreThresholdInput;
