// Manages the object detection requests.
// For images,
//    - Updates the overlay detection rectangles for the selected image by
//      adding the overlay components as child objects to the parent div.
//    - The image is sent directly to the objectDetector for processing.
// For webcam,
//    - Updates the overlay detection rectangles by requesting the last video
//      frame from the video stream and forwarding the frame image to the
//      objectDetector for processing.

import { objectDetector, isObjectDetectorReady } from './ObjectDetector';

let video = null;
let liveView = null;
let children = [];
let lastVideoTime = -1;

const initDOMElements = () => {
  if (document.readyState !== 'loading') {
    //console.log("Already loaded");
    video = document.getElementById("webcam");
    liveView = document.getElementById("liveView");
  }
  else {
    console.log("Not loaded yet");
    document.addEventListener('DOMContentLoaded', function () {
        video = document.getElementById("webcam");
        liveView = document.getElementById("liveView");
        //console.log("document.addEventListener video=" + video);
    });
  };
};

const removeHighlighters = (parent) => {
  const highlighters = parent.getElementsByClassName("overlay-box");
  while (highlighters[0]) {
    highlighters[0].parentNode.removeChild(highlighters[0]);
  }
};

const removeInfos = (parent) => {
  const infos = parent.getElementsByClassName("overlay-text");
  while (infos[0]) {
    infos[0].parentNode.removeChild(infos[0]);
  }
};

function clearOverlays() {
  const imageParentElem = document.getElementById("image-for-detect-parent");
  removeHighlighters(imageParentElem);
  removeInfos(imageParentElem);
};

async function requestImageDetection(target) {
  if (!target || !target.parentNode) {
    console.error('Target element not found or missing parent node');
    return;
  }
  removeHighlighters(target.parentNode);
  removeInfos(target.parentNode);

  if (!objectDetector || !isObjectDetectorReady) {
    alert("Object Detector is still loading. Please try again.");
    return;
  }

  if (objectDetector.runningMode !== "IMAGE") {
    await objectDetector.setOptions({ runningMode: "IMAGE" });
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

const hasGetUserMedia = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

const enableCam = async () => {
  //console.log("enableCam() video=" + video);
  if (!objectDetector || !isObjectDetectorReady) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  if (!video) {
    console.log("Wait! video not ready yet.");
    return;
  }

  const constraints = {
    video: true
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      //console.log("getUserMedia() got stream");
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    })
    .catch((err) => {
      console.error('Webcam access denied or failed:', err);
      alert('Webcam access denied or failed. Please check browser permissions.');
    });
};

const predictWebcam = async () => {
  //console.log("predictWebcam()");
  if (objectDetector.runningMode !== "VIDEO") {
    await objectDetector.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  //console.log("predictWebcam() startTimeMs=" + startTimeMs);
  //console.log("video.currentTime=" + video.currentTime + " lastVideoTime=" + lastVideoTime);
  
  if (video.currentTime !== lastVideoTime) {
    //console.log("Attempt object detect...");
    lastVideoTime = video.currentTime;
    const detections = objectDetector.detectForVideo(video, startTimeMs);
    displayVideoDetections(detections);
  }
  window.requestAnimationFrame(predictWebcam);
};

const disableCam = async () => {
  console.log("disableCam() video=" + video);
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
    video.removeEventListener("loadeddata", predictWebcam);
  }
};

const displayVideoDetections = (result) => {
  for (let child of children) {
    liveView.removeChild(child);
  }
  children.splice(0);

  for (let detection of result.detections) {
    const p = document.createElement("p");
    p.setAttribute("class", "overlay-text");
    p.innerText =
      detection.categories[0].categoryName + " " +
      Math.round(parseFloat(detection.categories[0].score) * 100) + "%";
    p.style =
      "left: " +
      (video.offsetWidth -
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
      (video.offsetWidth -
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

    liveView.appendChild(highlighter);
    liveView.appendChild(p);

    children.push(highlighter);
    children.push(p);
  }
};

export { initDOMElements, hasGetUserMedia, clearOverlays,
         enableCam, disableCam, predictWebcam, displayVideoDetections,
         displayImageDetections, requestImageDetection };