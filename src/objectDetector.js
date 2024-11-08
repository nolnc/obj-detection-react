// Adapter for MediaPipe Object Detector API
// Ref: https://ai.google.dev/edge/mediapipe/solutions/vision/object_detector
//    objectDetector = Handle to the MediaPipe Object Detector
//    runningMode = task mode {IMAGE, VIDEO, LIVE_STREAM}
//    isObjectDetectorReady = Indicates if object detector is initialized/loaded

import { ObjectDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let objectDetector = null;
let isObjectDetectorReady = false;

const initializeObjectDetector = async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm");
    objectDetector = await ObjectDetector.createFromOptions(
      vision, 
      { baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          delegate: "GPU"
        },
        scoreThreshold: 0.5,
        runningMode: "IMAGE"
      }
    );
    isObjectDetectorReady = true;
  } catch (error) {
    console.error('initializeObjectDetector error:', error);
  }
};

export { initializeObjectDetector, objectDetector, isObjectDetectorReady };