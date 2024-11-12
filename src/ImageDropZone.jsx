// Component for image upload and detection.

import React, { useEffect, useState, useContext } from 'react';
import { DetectionManagerCtx } from './DetectionManagerCtx';

const ImageDropZone = () => {
  const [dragging, setDragging] = useState(false);
  const [imageFileName, setImageFileName] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { requestImageDetection, clearImageOverlays } = useContext(DetectionManagerCtx);

  let resizeTimeout;

  useEffect(() => {
    triggerImageDetection();
  }, [imagePreview]);

  useEffect(() => {
    window.addEventListener('orientationchange', () => {
      console.log("Window orientation changed");
      triggerImageDetection();
    });
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log('Last resize event');
        triggerImageDetection();
      }, 500); // delay (ms)
    });
  }, []);

  async function triggerImageDetection() {
    const imageForDetectElem = document.getElementById("image-for-detect");
    if (imageForDetectElem) {
      await requestImageDetection(imageForDetectElem);
      const dropZoneSelector = document.querySelector('.drop-zone');
      dropZoneSelector.style.width = `${imageForDetectElem.width}px`;
      dropZoneSelector.style.height = `${imageForDetectElem.height}px`;
    }
  }

  const handleClearImageButtonClick = async (e) => {
    e.stopPropagation();
    setImageFileName(null);
    setImagePreview(null);
    clearImageOverlays();
    const dropZoneSelector = document.querySelector('.drop-zone');
    dropZoneSelector.style.width = `50vw`;
    dropZoneSelector.style.height = `25vh`;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setImageFileName(files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) {
      console.log("No file selected");
      return;
    }
    setImageFileName(e.target.files[0]);
    const reader = new FileReader();
    reader.onload = () => {
      //console.log("ImageDropZone handleFileChange() onload");
      setImagePreview(reader.result);
    };
    reader.onerror = (error) => {
      console.error("File read error:", error);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleClick = (e) => {
    //console.log("ImageDropZone handleClick()");
    e.stopPropagation();
    document.getElementById('fileInput').click();
  };

  return (
    <div className="drop-zone-container">
      <div id="image-for-detect-parent" className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          {!imagePreview && <label htmlFor="image-input" className="upload-label-inside">
            {imageFileName ? imageFileName.name : 'Drag & Drop Image or Click to Upload'}
            </label>
          }
        {imagePreview && <img id="image-for-detect" src={imagePreview} alt="Click to detect objects"/>}
        {imageFileName && <label className="upload-label-outside">{imageFileName.name}</label>}
        {imagePreview && <button id="clear-image-button" onClick={handleClearImageButtonClick}>CLEAR IMAGE</button>}
      </div>
    </div>
  );
};

export default ImageDropZone;