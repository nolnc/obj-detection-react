// Manages the object detection requests.
// For images,
//    - Updates the overlay detection rectangles for the selected image by
//      adding the overlay components as child objects to the parent div.
//    - The image is sent directly to the objectDetector for processing.
// For webcam,
//    - Updates the overlay detection rectangles by requesting the last video
//      frame from the video stream and forwarding the frame image to the
//      objectDetector for processing.

import { objectDetector, isObjectDetectorReady } from './ObjectDetectorAdapter';

let video = null;
let liveView = null;
let animationId;
let videoOverlayElems = [];
let lastVideoTime = -1;

const initDOMElements = () => {
  if (document.readyState !== 'loading') {
    //console.log("Already loaded");
    video = document.getElementById("videoCam");
    liveView = document.getElementById("liveView");
  }
  else {
    console.log("DOM elements not loaded yet");
    document.addEventListener('DOMContentLoaded', function () {
      console.log("DOM Content Loaded");
        video = document.getElementById("videoCam");
        liveView = document.getElementById("liveView");
    });
  };
};

async function requestImageDetection(target) {
  if (!target || !target.parentNode) {
    console.error('Target element not found or missing parent node');
    return;
  }
  removeImageOverlay(target.parentNode);

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

function clearImageOverlays() {
  const imageParentElem = document.getElementById("image-for-detect-parent");
  removeImageOverlay(imageParentElem);
};

const hasGetUserMedia = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

const enableCam = async () => {
  if (!objectDetector || !isObjectDetectorReady) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  if (objectDetector.runningMode !== "VIDEO") {
    await objectDetector.setOptions({ runningMode: "VIDEO" });
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
      video.addEventListener("loadeddata", predictVideoFrame);
    })
    .catch((err) => {
      console.error('Camera access denied or failed:', err);
      alert('Camera access denied or failed. Please check browser permissions.');
    });
};

const predictVideoFrame = async () => {
  let startTimeMs = performance.now();
  //console.log("video.currentTime=" + video.currentTime + " lastVideoTime=" + lastVideoTime);
  
  if (video.currentTime !== lastVideoTime) {
    //console.log("Attempt video object detect timeMs=" + startTimeMs);
    lastVideoTime = video.currentTime;
    const detections = objectDetector.detectForVideo(video, startTimeMs);
    displayVideoDetections(detections);
  }
  animationId = window.requestAnimationFrame(predictVideoFrame);
};

const disableCam = async () => {
  console.log("disableCam() video=" + video);
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
    video.removeEventListener("loadeddata", predictVideoFrame);
    window.cancelAnimationFrame(animationId);
    animationId = null;
  }
};

const displayVideoDetections = (result) => {
  for (let child of videoOverlayElems) {
    liveView.removeChild(child);
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

    videoOverlayElems.push(highlighter);
    videoOverlayElems.push(p);
  }
};

export { initDOMElements, hasGetUserMedia, clearImageOverlays as clearOverlays,
         enableCam, disableCam, predictVideoFrame as predictWebcam, displayVideoDetections,
         displayImageDetections, requestImageDetection };
