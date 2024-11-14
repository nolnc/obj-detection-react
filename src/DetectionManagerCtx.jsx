// Manages the object detection requests.
// For images,
//    - Updates the overlay detection rectangles for the selected image by
//      adding the overlay components as child objects to the parent div.
//    - The image is sent directly to the objectDetector for processing.
// For webcam,
//    - Updates the overlay detection rectangles by requesting the last video
//      frame from the video stream and forwarding the frame image to the
//      objectDetector for processing.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ObjectDetectorAdapterCtx } from './ObjectDetectorAdapterCtx';
import { ScoreThresholdContext } from './ScoreThresholdContext';

const DetectionManagerCtx = createContext();

const DetectionManagerProvider = ({ children }) => {

  const [imageDetectionCategories, setImageDetectionCategories] = useState(new Set());
  const [videoDetectionCategories, setVideoDetectionCategories] = useState(new Set());

  const [videoElem, setVideoElem] = useState(null);
  const [liveViewElem, setiveViewElem] = useState(null);
  let animationId;
  let videoOverlayElems = [];
  let lastVideoTime = -1;

  const { objectDetector, isObjectDetectorReady } = useContext(ObjectDetectorAdapterCtx);
  const { sliderValue } = useContext(ScoreThresholdContext);

  useEffect(() => {
    initDOMElements();
  }, []);

  function initDOMElements() {
    if (document.readyState !== 'loading') {
      console.log("Already loaded");
      setVideoElem(document.getElementById("videoCam"));
      setiveViewElem(document.getElementById("liveView"));
      //console.log("initDOMElements() document.readyState=" + document.readyState + " videoElem=" + document.getElementById("videoCam"));
    }
    else {
      console.log("DOM elements not loaded yet");
      document.addEventListener('DOMContentLoaded', function () {
        console.log("DOM Content Loaded");
        setVideoElem(document.getElementById("videoCam"));
        setiveViewElem(document.getElementById("liveView"));
        //console.log("initDOMElements() DOMContentLoaded videoElem=" + document.getElementById("videoCam"));
      });
    };
  };

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
      //console.log("categoryName=" + categoryName);
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
      //console.log("nameHash=" + nameHash + " r=" + r + " g=" + g + " b=" + b + " highlightColorStyle=" + highlightColorStyle);

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

  function stringToHash(str) {
    let hash = 987654321;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + str.charCodeAt(i)) | 0;
    }
    return hash & 0xFFFFFF; // 24-bit hash
  };

  function removeImageOverlay(parent) {
    const detections = parent.getElementsByClassName("detection");
    while (detections[0]) {
      detections[0].parentNode.removeChild(detections[0]);
    }
  };

  const clearImageOverlays = () => {
    const imageParentElem = document.getElementById("image-for-detect-parent");
    removeImageOverlay(imageParentElem);
  };

  /*
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  */

  async function enableCam() {
    console.log("enableCam() videoElem=" + videoElem);
    if (!objectDetector || !isObjectDetectorReady) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }

    if (objectDetector.runningMode !== "VIDEO") {
      //console.log("sliderValue=" + sliderValue);
      await objectDetector.setOptions({ runningMode: "VIDEO", score: sliderValue });
    }

    if (!videoElem) {
      console.log("Wait! video not ready yet.");
      return;
    }

    const constraints = {
      video: true
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        //console.log("getUserMedia() got stream");
        videoElem.srcObject = stream;
        videoElem.addEventListener("loadeddata", predictVideoFrame);
      })
      .catch((err) => {
        console.error('Camera access denied or failed:', err);
        alert('Camera access denied or failed. Please check browser permissions.');
      });
  };

  async function predictVideoFrame() {
    let startTimeMs = performance.now();
    //console.log("video.currentTime=" + video.currentTime + " lastVideoTime=" + lastVideoTime);
    
    if (videoElem.currentTime !== lastVideoTime) {
      //console.log("Attempt video object detect timeMs=" + startTimeMs);
      lastVideoTime = videoElem.currentTime;
      const detections = objectDetector.detectForVideo(videoElem, startTimeMs);
      displayVideoDetections(detections);
    }
    animationId = window.requestAnimationFrame(predictVideoFrame);
    //console.log("predictVideoFrame() animationId=" + animationId);
  };

  const disableCam = async () => {
    console.log("disableCam() videoElem=" + videoElem);
    if (videoElem.srcObject) {
      const tracks = videoElem.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoElem.srcObject = null;
      videoElem.removeEventListener("loadeddata", predictVideoFrame);
      //console.log("disableCam() animationId=" + animationId);
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  function displayVideoDetections(result) {
    for (let child of videoOverlayElems) {
      liveViewElem.removeChild(child);
    }
    videoOverlayElems.splice(0);

    const categorySet = new Set();

    for (let detection of result.detections) {
      const categoryName = capitalizeWords(detection.categories[0].categoryName);
      //console.log("categoryName=" + categoryName);
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
      //console.log("nameHash=" + nameHash + " r=" + r + " g=" + g + " b=" + b + " highlightColorStyle=" + highlightColorStyle);

      const pTxt = document.createElement("p");
      pTxt.setAttribute("class", "overlay-text");
      pTxt.innerText = categoryName + " " + scorePercent + "%";
      pTxt.style =
        "color: " + highlightColorStyle + ";" +
        "left: " + (videoElem.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
        "top: " + detection.boundingBox.originY + "px; " +
        "width: " + (detection.boundingBox.width - 10) + "px;";

      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "overlay-box");
      highlighter.style =
        "border-color: " + highlightColorStyle + ";" +
        "left: " + (videoElem.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
        "top: " + detection.boundingBox.originY + "px;" +
        "width: " + detection.boundingBox.width + "px;" +
        "height: " + detection.boundingBox.height + "px;";

      pDetectElem.appendChild(highlighter);
      pDetectElem.appendChild(pTxt);

      liveViewElem.appendChild(pDetectElem);
      videoOverlayElems.push(pDetectElem);
    }
    setVideoDetectionCategories(categorySet);
  };

  const capitalizeWords = (str) => {
    //console.log("capitalizeWords() str=" + str);
    return (str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('_'));
  };

  const detectionMgrShared = {
    clearImageOverlays,
    requestImageDetection,
    enableCam,
    disableCam,
    imageDetectionCategories,
    videoDetectionCategories
  };

  return (
    <DetectionManagerCtx.Provider value={ detectionMgrShared }>
      {children}
    </DetectionManagerCtx.Provider>
  );
};

export { DetectionManagerProvider, DetectionManagerCtx };
