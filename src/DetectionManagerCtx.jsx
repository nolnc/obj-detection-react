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
      console.error('Target element not found or missing parent node');
      return;
    }
    removeImageOverlay(target.parentNode);

    if (!objectDetector || !isObjectDetectorReady) {
      console.log("Object Detector is still loading. Please try again.");
      return;
    }

    if (objectDetector.runningMode !== "IMAGE") {
      //console.log("requestImageDetection() sliderValue=" + sliderValue);
      await objectDetector.setOptions({ runningMode: "IMAGE", score: sliderValue });
    }

    const detections = objectDetector.detect(target);
    displayImageDetections(detections, target);
  };

  function displayImageDetections(result, resultElement) {
    const ratio = resultElement.height / resultElement.naturalHeight;

    for (let detection of result.detections) {
      const p = document.createElement("p");
      p.setAttribute("class", "overlay-text");
      p.innerText =
        detection.categories[0].categoryName + " " +
        Math.round(parseFloat(detection.categories[0].score) * 100) + "%";
      p.style =
        "left: " +
        detection.boundingBox.originX * ratio +
        "px;" +
        "top: " +
        detection.boundingBox.originY * ratio +
        "px; " +
        "width: " +
        (detection.boundingBox.width * ratio - 10) +
        "px;";

      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "overlay-box");
      highlighter.style =
        "left: " +
        detection.boundingBox.originX * ratio +
        "px;" +
        "top: " +
        detection.boundingBox.originY * ratio +
        "px;" +
        "width: " +
        detection.boundingBox.width * ratio +
        "px;" +
        "height: " +
        detection.boundingBox.height * ratio +
        "px;";

      resultElement.parentNode.appendChild(highlighter);
      resultElement.parentNode.appendChild(p);
    }
  };

  function removeImageOverlay(parent) {
    const boxes = parent.getElementsByClassName("overlay-box");
    while (boxes[0]) {
      boxes[0].parentNode.removeChild(boxes[0]);
    }
    const texts = parent.getElementsByClassName("overlay-text");
    while (texts[0]) {
      texts[0].parentNode.removeChild(texts[0]);
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

    for (let detection of result.detections) {
      const p = document.createElement("p");
      p.setAttribute("class", "overlay-text");
      p.innerText =
        detection.categories[0].categoryName + " " +
        Math.round(parseFloat(detection.categories[0].score) * 100) + "%";
      p.style =
        "left: " +
        (videoElem.offsetWidth -
          detection.boundingBox.width -
          detection.boundingBox.originX) +
        "px;" +
        "top: " +
        detection.boundingBox.originY +
        "px; " +
        "width: " +
        (detection.boundingBox.width - 10) +
        "px;";

      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "overlay-box");
      highlighter.style =
        "left: " +
        (videoElem.offsetWidth -
          detection.boundingBox.width -
          detection.boundingBox.originX) +
        "px;" +
        "top: " +
        detection.boundingBox.originY +
        "px;" +
        "width: " +
        (detection.boundingBox.width - 10) +
        "px;" +
        "height: " +
        detection.boundingBox.height +
        "px;";

      liveViewElem.appendChild(highlighter);
      liveViewElem.appendChild(p);

      videoOverlayElems.push(highlighter);
      videoOverlayElems.push(p);
    }
  };

  const detectionMgrShared = {
    clearImageOverlays,
    requestImageDetection,
    enableCam,
    disableCam
  };

  return (
    <DetectionManagerCtx.Provider value={ detectionMgrShared }>
      {children}
    </DetectionManagerCtx.Provider>
  );
};

export { DetectionManagerProvider, DetectionManagerCtx };
