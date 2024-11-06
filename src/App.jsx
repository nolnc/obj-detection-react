import React, { useState, useEffect } from 'react';
import { initializeObjectDetector } from './objectDetector';
import { initDOMElements, hasGetUserMedia, enableCam, requestImageDetection } from './detections';

function App() {
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [isUserMediaAvailable, setIsUserMediaAvailable] = useState(null);

  useEffect(() => {
    //console.log("useEffect()");
    initializeObjectDetector();
    initDOMElements();
    //console.log("useEffect() done with initDOMElements()");
  }, []);

  const handleImageClick = async (event) => {
    requestImageDetection(event);
  };

  const handleWebcamButtonClick = async () => {
    //console.log("handleWebcamButtonClick");
    const hasMedia = hasGetUserMedia();
    //console.log("hasMedia=" + hasMedia);
    setIsUserMediaAvailable(hasMedia);

    enableCam();
    setIsWebcamEnabled(true);
  };

  return (
    <div className="App">
      <h1>Multiple object detection using the MediaPipe Object Detector task</h1>
      <section id="demos" className="readyUnMask">
        <h2>Demo: Detecting Images</h2>
        <p><b>Click on an image below</b> to detect objects in the image.</p>
        <div className="detectOnClick" onClick={handleImageClick}>
          <img src="https://assets.codepen.io/9177687/coupledog.jpeg" crossOrigin="anonymous" alt="Click to get classification!" />
        </div>
        <div className="detectOnClick" onClick={handleImageClick}>
          <img src="https://assets.codepen.io/9177687/doggo.jpeg" crossOrigin="anonymous" alt="Click to get classification!" />
        </div>

        <h2>Demo: Webcam continuous detection</h2>
        <p>Hold some objects up close to your webcam to get a real-time detection! When ready click "enable webcam" below and accept access to the webcam.</p>
        <div>This demo uses a model trained on the COCO dataset. It can identify 80 different classes of object in an image. <a href="https://github.com/amikelive/coco-labels/blob/master/coco-labels-2014_2017.txt" target="_blank" rel="noreferrer">See a list of available classes</a></div>
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