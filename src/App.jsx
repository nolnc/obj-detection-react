import React, { useState, useEffect } from 'react';
import { initializeObjectDetector } from './objectDetector';
import { initDOMElements, hasGetUserMedia, enableCam, disableCam, requestImageDetection } from './detections';
import ImageDropZone from './ImageDropZone';

function App() {
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [isUserMediaAvailable, setIsUserMediaAvailable] = useState(null);
  const [clearImageReq, setClearImageReq] = useState(false);

  useEffect(() => {
    initializeObjectDetector();
    initDOMElements();
  }, []);

  const handleImageClick = async (event) => {
    requestImageDetection(event.target);
  };

  const handleWebcamButtonClick = async () => {
    const hasMedia = hasGetUserMedia();
    setIsUserMediaAvailable(hasMedia);
    console.log("handleWebcamButtonClick() isWebcamEnabled=" + isWebcamEnabled);
    if (!isWebcamEnabled) {
      enableCam();
    }
    else {
      disableCam();
    }
    setIsWebcamEnabled(!isWebcamEnabled);
  };

  return (
    <div className="App">
      <h1>Multiple object detection using the MediaPipe Object Detector task</h1>
      <div>This demo uses a model trained on the COCO dataset. It can identify 80 different classes of object in an image. <a href="https://github.com/amikelive/coco-labels/blob/master/coco-labels-2014_2017.txt" target="_blank" rel="noreferrer">See a list of available classes</a>
        <p>Also, check out the repository for this project: <a href="https://github.com/nolnc/obj-detection-react" target="_blank" rel="noreferrer">obj-detection-react</a>.</p></div>
      <section id="demos" className="readyUnMask">
        <h2>Detecting Images</h2>
        <p><b>Upload</b> an image below then <b>click</b> on it to detect objects in the image.</p>
        <div className="detectOnClick">
          <ImageDropZone/>
        </div>
        <h2>Webcam continuous detection</h2>
        <p>Hold some objects up close to your webcam to get a real-time detection! When ready click "enable webcam" below and accept access to the webcam.</p>
        <div id="liveView" className="videoView">
          <button id="webcamButton" className="mdc-button mdc-button--raised" onClick={handleWebcamButtonClick}>
            {isWebcamEnabled ? 'DISABLE WEBCAM' : 'ENABLE WEBCAM'}
          </button>
          <video id="webcam" autoPlay playsInline></video>
        </div>
      </section>
    </div>
  );
}

export default App;