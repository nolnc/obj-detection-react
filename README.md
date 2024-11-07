# Description
This project integrates MediaPipe's Object Detection solution with React, enabling real-time object detection in web applications.
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Features
- Real-time object detection using MediaPipe
- React-based user interface
- Support for image and webcam video detection

# References
- This repo: https://github.com/nolnc/obj-detection-react 
- MediaPipe Object Detection Overview: https://ai.google.dev/edge/mediapipe/solutions/vision/object_detector

# Acknowledgments
- MediaPipe Object Detection CodePen Demo: https://codepen.io/mediapipe-preview/pen/vYrWvNg

## Software used
- Node v20.9.0
- Git
- VS Code
- Chrome Version 130.0.6723.92

# Setting up the project

### 1. Clone project
	git clone https://github.com/nolnc/obj-detection-react
	cd obj-detection-react
	
### 2. Update node modules
	npm update
	
### 3. Run project
	npm start
	
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Other useful commands
### To build the app for production
	npm run build
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.\

### Start development server using build folder output
	serve -s build
Note: Might need to install the server first:

	npm install -g serve

### Stopping server
	Ctrl-C
