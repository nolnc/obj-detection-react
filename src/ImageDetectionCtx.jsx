// Manages the object detection requests for images.
//   - Updates the overlay detection rectangles for the selected image by
//     adding the overlay components as child objects to the parent div.
//   - The image is sent directly to the objectDetector for processing.

import React, { createContext, useContext, useState } from 'react';
import { ObjectDetectorAdapterCtx } from './ObjectDetectorAdapterCtx';
import { ScoreThresholdContext } from './ScoreThresholdContext';
import { stringToHash, capitalizeWords } from './detectionUtils';

const ImageDetectionCtx = createContext();

const ImageDetectionProvider = ({ children }) => {
  const [imageDetectionCategories, setImageDetectionCategories] = useState(new Set());
  const { objectDetector, isObjectDetectorReady } = useContext(ObjectDetectorAdapterCtx);
  const { sliderValue } = useContext(ScoreThresholdContext);

  async function requestImageDetection(target) {
    console.log("requestImageDetection()");

    if (!target || !target.parentNode) {
      const error = new Error('Target element not found or missing parent node');
      console.log(error.message);
      return Promise.reject(error);
    }
    removeImageOverlay(target.parentNode);

    //console.log("isObjectDetectorReady=" + isObjectDetectorReady);
    //console.log("objectDetector=" + objectDetector);
    if (!objectDetector || !isObjectDetectorReady) {
      const error = new Error('Object Detector not loaded. Please try again.');
      console.log(error.message);
      return Promise.reject(error);
      /*
      console.log("Attempting to reinitialize object detector...");
      try {
        await initializeObjectDetector();
        console.log("isObjectDetectorReady=" + isObjectDetectorReady);
        console.log("objectDetector=" + objectDetector);

        if (!objectDetector || !isObjectDetectorReady) {
          console.log("Reinitialization attempt failed");
          return Promise.reject(error);
        }
      }
      catch (error) {
        console.error('Reinitialization failed:', error);
        return Promise.reject(error);
      }
      */
    }

    if (objectDetector.runningMode !== "IMAGE") {
      //console.log("requestImageDetection() sliderValue=" + sliderValue);
      await objectDetector.setOptions({ runningMode: "IMAGE", score: sliderValue });
    }

    const detections = objectDetector.detect(target);
    displayImageDetections(detections, target);
  };

  function displayImageDetections(result, resultElement) {
    console.log("displayImageDetections()");
    const ratio = resultElement.height / resultElement.naturalHeight;
    const categorySet = new Set();

    for (let detection of result.detections) {
      const categoryName = capitalizeWords(detection.categories[0].categoryName);
      categorySet.add(categoryName);
      const scorePercent = Math.round(parseFloat(detection.categories[0].score) * 100);

      const pDetectElem = document.createElement("div");
      pDetectElem.setAttribute("class", "detection");
      pDetectElem.setAttribute("data-category-name", categoryName);
      pDetectElem.setAttribute("data-score", scorePercent);

      const nameHash = stringToHash(categoryName);
      const r = (nameHash >> 16) & 0xFF;
      const g = (nameHash >> 8) & 0xFF;
      const b = nameHash & 0xFF;
      const highlightColorStyle = "rgb(" + r + "," + g + "," + b + ")";

      const pTxt = document.createElement("p");
      pTxt.setAttribute("class", "overlay-text");
      pTxt.innerText = categoryName + " " + scorePercent + "%";
      pTxt.style =
        "color: " + highlightColorStyle + ";" +
        "left: " + (detection.boundingBox.originX * ratio) + "px;" +
        "top: " + (detection.boundingBox.originY * ratio) + "px; " +
        "width: " + (detection.boundingBox.width * ratio - 10) + "px;";

      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "overlay-box");
      highlighter.style =
        "border-color: " + highlightColorStyle + ";" +
        "left: " + (detection.boundingBox.originX * ratio) + "px;" +
        "top: " + (detection.boundingBox.originY * ratio) + "px;" +
        "width: " + (detection.boundingBox.width * ratio) + "px;" +
        "height: " + (detection.boundingBox.height * ratio) + "px;";

      pDetectElem.appendChild(highlighter);
      pDetectElem.appendChild(pTxt);

      resultElement.parentNode.appendChild(pDetectElem);
    }
    setImageDetectionCategories(categorySet);
  };

  function removeImageOverlay(parent) {
    const detections = parent.getElementsByClassName("detection");
    while (detections[0]) {
      detections[0].parentNode.removeChild(detections[0]);
    }
    setImageDetectionCategories(new Set());
  };

  const clearImageOverlays = () => {
    const imageParentElem = document.getElementById("image-for-detect-parent");
    removeImageOverlay(imageParentElem);
  };

  const imageDetectionShared = {
    requestImageDetection,
    clearImageOverlays,
    imageDetectionCategories
  };

  return (
    <ImageDetectionCtx.Provider value={imageDetectionShared}>
      {children}
    </ImageDetectionCtx.Provider>
  );
};

export { ImageDetectionProvider, ImageDetectionCtx };