// Component for image upload and detection.

import React, { useEffect, useState, useContext } from 'react';
import { ImageDetectionCtx } from './ImageDetectionCtx';

const ImageDropZone = () => {
  const [dragging, setDragging] = useState(false);
  const [imageFileName, setImageFileName] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isShowDropDownVisible, setIsShowDropDownVisible] = useState(false);

  const { requestImageDetection, clearImageOverlays, imageDetectionCategories } = useContext(ImageDetectionCtx);

  let resizeTimeout;

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

    return () => {
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    triggerImageDetection();
  }, [imagePreview]);

  useEffect(() => {
    resetDropdownList();
    updateDetectionCategoryDropDown();
  }, [imageDetectionCategories]);

  function resetDropdownList() {
    const dropDownElem = document.getElementById('show-dropdown');
    if (dropDownElem) {
      const firstLi = dropDownElem.querySelector('li:first-child');
      let nextElements = firstLi.nextElementSibling;
      while (nextElements) {
        nextElements.remove();
        nextElements = firstLi.nextElementSibling;
      }
    }
  }

  async function triggerImageDetection() {
    const imageForDetectElem = document.getElementById("image-for-detect");
    console.log("triggerImageDetection() imageForDetectElem=" + imageForDetectElem);
    if (imageForDetectElem) {
      requestImageDetection(imageForDetectElem)
        .then(() => {
          console.log("requestImageDetection() finished");
          const dropZoneSelector = document.querySelector('.drop-zone');
          dropZoneSelector.style.width = `${imageForDetectElem.width}px`;
          dropZoneSelector.style.height = `${imageForDetectElem.height}px`;
        })
        .catch((error) => {
          console.error('requestImageDetection failed:', error);
        });
    }
  }

  const handleClearImageButtonClick = async (e) => {
    e.stopPropagation();
    setImageFileName(null);
    setImagePreview(null);
    clearImageOverlays();
    const dropZoneSelector = document.querySelector('.drop-zone');
    dropZoneSelector.style.width = `75vw`;    // keep this same as the default defined in index.css
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

  const handleDropZoneClick = (e) => {
    //console.log("ImageDropZone handleDropZoneClick()");
    e.stopPropagation();
    document.getElementById('fileInput').click();
  };

  const handleShowLabelsClick = (e) => {
    e.stopPropagation();
    const visible = !isShowDropDownVisible;
    setIsShowDropDownVisible(visible);
    const dropdownElem = (document.getElementById("show-dropdown"));
    dropdownElem.style.display = visible ? 'block' : 'none';
  };

  const handleLabelDropdownClick = (e) => {
    e.stopPropagation();
    const checkbox = e.target.closest('li').querySelector('input[type="checkbox"]');
    if (checkbox.id === "option-all") {
      handleDropdownOptionAllClick(e);
    }
    else {
      const detections = document.getElementsByClassName("detection");
      const optionAllElem = document.getElementById("option-all");
      for (let detection of detections) {
        if (detection.getAttribute("data-category-name") === checkbox.nextSibling.textContent) {
          if (checkbox.checked) {
            detection.style.display = "block";
          }
          else {
            detection.style.display = "none";
            optionAllElem.checked = false;
          }
        }
      }
    }
  };

  const handleDropdownOptionAllClick = (e) => {
    e.stopPropagation();
    const detections = document.getElementsByClassName("detection");
    const optionAllElem = document.getElementById("option-all");
    for (let detection of detections) {
      if (optionAllElem.checked) {
        detection.style.display = "block";
      }
      else {
        detection.style.display = "none";
      }
    }
    const checkboxElems = document.getElementsByClassName("label-option");
    for (let checkbox of checkboxElems) {
      if (optionAllElem.checked) {
        checkbox.checked = true;
      }
      else {
        checkbox.checked = false;
      }
    }
  };

  function updateDetectionCategoryDropDown() {
    console.log("updateDetectionCategoryDropDown()");
    const dropDownElem = document.getElementById('show-dropdown');
    if (dropDownElem) {
      for (const category of imageDetectionCategories) {
        const checkbox = document.createElement("input");
        checkbox.className = "label-option";
        checkbox.type = "checkbox";
        checkbox.id = "option-" + category;
        checkbox.defaultChecked = true;

        const categoryLabel = document.createElement("label");
        categoryLabel.htmlFor = "option-" + category;
        categoryLabel.textContent = category;

        const categoryListItem = document.createElement("li");
        categoryListItem.appendChild(checkbox);
        categoryListItem.appendChild(categoryLabel);

        dropDownElem.firstChild.appendChild(categoryListItem);
      }
    }
  }

  return (
    <div className="drop-zone-container">
      <div id="image-for-detect-parent" className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleDropZoneClick}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          {!imagePreview &&
            <label htmlFor="fileInput" className="upload-label-inside">
              {imageFileName ? imageFileName.name : 'Drag & Drop Image or Click to Upload'}
            </label>
          }
        {imagePreview && <img id="image-for-detect" src={imagePreview} alt="Click to detect objects"/>}
        {imageFileName && <label className="upload-label-outside">{imageFileName.name}</label>}

        {imagePreview &&
          <div className="button-container">
            <button id="clear-image-button" onClick={handleClearImageButtonClick}>Clear Image</button>
            <div className="show-labels-container">
              <button id="show-button" className="show-button" onClick={handleShowLabelsClick}>Show Labels</button>
              <div id="show-dropdown" className="show-dropdown" onClick={handleLabelDropdownClick}>
                <ul>
                  <li>
                    <input className="label-option" type="checkbox" id="option-all" defaultChecked={true}/>
                    <label htmlFor="option-all">All</label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  );
};

export default ImageDropZone;