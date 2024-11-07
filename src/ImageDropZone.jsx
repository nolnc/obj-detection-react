import React, { useEffect, useState } from 'react';
import { requestImageDetection, clearOverlays } from './detections';

const ImageDropZone = () => {
  const [dragging, setDragging] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const imagePairRightElem = document.getElementById("imagePairRight");
    if (imagePairRightElem) {
      requestImageDetection(imagePairRightElem);
    }
  }, [imagePreview]);

  const handleClearImageButtonClick = async () => {
    setImageFile(null);
    setImagePreview(null);
    clearOverlays();
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
      setImageFile(files[0]);
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
    setImageFile(e.target.files[0]);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.onerror = (error) => {
      console.error("File read error:", error);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleClick = (e) => {
    document.getElementById('fileInput').click();
  };

  return (
    <div className="drop-zone-container">
      <div className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          {!imagePreview && <label htmlFor="image-input" className="upload-label-inside">
            {imageFile ? imageFile.name : 'Drag & Drop Image or Click to Upload'}
            </label>
          }
        <div id="imagePair">
          {imagePreview && <img id="imagePairLeft" src={imagePreview} alt="Click to detect objects" className="uploaded-image"/>}
          {imagePreview && <img id="imagePairRight" src={imagePreview} alt="Click to detect objects" className="uploaded-image"/>}
        </div>
      </div>
      {imageFile && <label className="upload-label-outside">{imageFile.name}</label>}
      {imagePreview && <button id="clearImage" className="mdc-button mdc-button--raised" onClick={handleClearImageButtonClick}>CLEAR IMAGE</button>}
    </div>
  );
};

export default ImageDropZone;

/*
import React, { useRef, createContext, useContext, useState } from 'react';

const imageDropZoneImgRef = createContext(null);

function ImageDropZone() {
  const [selectedImage, setSelectedImage] = useState(null);
  const imageDropZoneImgRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div width="50%"
      onDrop={handleDrop} onDragOver={handleDragOver} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
      { selectedImage ? (<img ref={imageDropZoneImgRef} src={selectedImage} crossOrigin="anonymous" alt="Click to get classification!" />) :
                        (<p>Drag and drop an image here, or click to select</p>)
      }
    </div>
  );
}

export { ImageDropZone, imageDropZoneImgRef };
*/