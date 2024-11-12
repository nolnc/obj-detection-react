// Renders a horizontal slider enabling users to adjust the scoreThreshold value for object detection.
// This threshold defines the minimum confidence level (range: 0.0 to 1.0) required for detected objects
// to be reported. 
// A value of 0.0 returns all detected categories, while 1.0 only returns categories with 100% detection
// confidence.

import React, { useContext } from 'react';
import { ScoreThresholdContext } from './ScoreThresholdContext';

const ScoreThresholdInput = () => {
  const { sliderValue, setSliderValue } = useContext(ScoreThresholdContext);

  const handleSliderChange = (e) => {
    setSliderValue(parseFloat(e.target.value).toFixed(2));
    console.log("handleSliderChange() sliderValue=" + sliderValue);
  };

  const handleManualInput = (e) => {
    const value = parseFloat(e.target.value);
    if (value >= 0.01 && value <= 1.00) {
      setSliderValue(value.toFixed(2));
    }
    console.log("handleManualInput() sliderValue=" + sliderValue);
  };

  return (
    <div className="slider-container">
      <input type="range" id="slider" min="0.01" max="1.00" step="0.01" value={sliderValue} onChange={handleSliderChange}/>
      <input type="number" id="slider-value" min="0.01" max="1.00" step="0.01" value={sliderValue} onChange={handleManualInput}/>
    </div>
  );
};

export default ScoreThresholdInput;
