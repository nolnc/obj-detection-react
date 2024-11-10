import React, { useEffect } from 'react';
import { initializeObjectDetector } from './ObjectDetectorAdapter';
import { initDOMElements, enableCam, disableCam } from './Detections';
import ImageDropZone from './ImageDropZone';

function App() {

  useEffect(() => {
    initializeObjectDetector();
    initDOMElements();
  }, []);

  const handleModeButtonClick = async () => {
    const videoMode = document.getElementById('video-mode');
    const imageMode = document.getElementById('image-mode');

    if (videoMode.style.display === 'none') {
      videoMode.style.display = 'block';
      imageMode.style.display = 'none';
      enableCam();
    } else {
      disableCam();
      videoMode.style.display = 'none';
      imageMode.style.display = 'block';
    }
  };

  return (
    <div className="App">
      <h1>Multiple object detection using the MediaPipe Object Detector task</h1>
      <div>This demo uses a model trained on the COCO dataset. It can identify 80 different classes of object in an image. <a href="https://github.com/amikelive/coco-labels/blob/master/coco-labels-2014_2017.txt" target="_blank" rel="noreferrer">See a list of available classes</a>
        <p>Also, check out the repository for this project: <a href="https://github.com/nolnc/obj-detection-react" target="_blank" rel="noreferrer">obj-detection-react</a>.</p></div>
      <div id="detector-container">

        <div id="image-mode">
          <h2>Detecting Images</h2>
          <button className="display-mode-toggle" onClick={handleModeButtonClick}>Switch to VIDEO Mode</button>
          <p><b>Upload</b> an image below then <b>click</b> on it to detect objects in the image.</p>
          <div id="staticImageView" className="imageView">
            <ImageDropZone/>
          </div>
        </div>

        <div id="video-mode" style={{ display: "none" }}>
          <h2>Webcam continuous detection</h2>
          <button className="display-mode-toggle" onClick={handleModeButtonClick}>Switch to IMAGE Mode</button>
          <p>Hold some objects up close to your webcam to get a real-time detection! When ready click "enable webcam" below and accept access to the webcam.</p>
          <div id="liveView" className="videoView">
            <video id="videoCam" autoPlay playsInline></video>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;