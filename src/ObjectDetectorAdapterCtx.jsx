// Adapter for MediaPipe Object Detector API
// Ref: https://ai.google.dev/edge/mediapipe/solutions/vision/object_detector
//    objectDetector = Handle to the MediaPipe Object Detector
//    runningMode = task mode {IMAGE, VIDEO, LIVE_STREAM}
//    isObjectDetectorReady = Indicates if object detector is initialized/loaded
// ObjectDetector class API: https://ai.google.dev/edge/api/mediapipe/js/tasks-vision.objectdetector#objectdetector_class

import { ObjectDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { createContext, useState } from 'react';

const ObjectDetectorAdapterCtx = createContext();

const ObjectDetectorProvider = ({ children }) => {
  const [isObjectDetectorReady, setIsObjectDetectorReady] = useState(false);
  const [objectDetector, setObjectDetector] = useState(null);

  const initializeObjectDetector = async () => {
    try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm");
        setObjectDetector(await ObjectDetector.createFromOptions(
            vision,
            { baseOptions: {
                //modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float32/latest/efficientdet_lite2.tflite',
                delegate: "GPU"
            },
            scoreThreshold: 0.3,
            runningMode: "IMAGE"
            }
        )
        );
        setIsObjectDetectorReady(true);
    }
    catch (error) {
        console.error('initializeObjectDetector error:', error);
        alert('Problem initializing object detector');
    }
  };

  const objDetectorShared = {
    objectDetector,
    isObjectDetectorReady,
    initializeObjectDetector,
    setObjectDetector,
    setIsObjectDetectorReady
  };

  return (
    <ObjectDetectorAdapterCtx.Provider value={ objDetectorShared }>
      {children}
    </ObjectDetectorAdapterCtx.Provider>
  );
};

export { ObjectDetectorProvider, ObjectDetectorAdapterCtx };
