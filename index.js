require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');


const demoSession = document.getElementById('demos');

let model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  demoSession.classList.remove('invisible');
});


const video = document.getElementById('webcam');
const liveview = document.getElementById('liveView');
const enableWebcamButton = document.getElementById('webcamButton');
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

var vidWidth = 0;
var vidHeight = 0;
var xStart = 0;
var yStart = 0;



// Check if webcam access is supported.
const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
};

//Enable the live webcam view and start classification.
const enableCam = (event) => {
    if (!model) {
        return;
    }
    // Hide the button once clicked.
    enableWebcamButton.classList.add('removed');

    //getUsermedia parameters to force video but not audio.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            vidWidth = video.videoHeight;
            vidHeight = video.videoWidth;
            //The start position of the video (from top left corner of the viewport)
            xStart = Math.floor((vw - vidWidth) / 2);
            yStart = (Math.floor((vh - vidHeight) / 2) >= 0) ? (Math.floor((vh - vidHeight) / 2)) : 0;
            video.play();
        video.addEventListener('loadeddata', predictWebcam);
        }
    });
};

// Keep a reference of all the child elements we create 
// so we can remove them easily on each render 
let children = [];

// If webcam supported, add event listener to button for when user
//want to activate it 
if (hasGetUserMedia()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

// Prediction loop!
const predictWebcam = () => {
    // Now let's start classifying a frame in the stream.
    model.detect(video).then((predictions) => {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            liveview.removeChild(children[i]);
        }
        children.splice(0);

        // Now lets loop through predictions and draw them to the live view if
        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {
            // If we are over 66% sure we are sure we classified it right, draw it!
            if (predictions[n].score > 0.66) {
                const p = document.createElement('p');
                p.innerText = predictions[n].class  + ' - with '
                    + Math.round(parseFloat(predictions[n].score) * 100)
                    + '% confidence.';
                

                p.style = 'left: ' + (predictions[n].bbox[0]+vidWidth) + 'px;' + 
                    'top: ' + predictions[n].bbox[1] + 'px;' +
                    'width: ' + predictions[n].bbox[2] + 'px' +
                    'height: ' + predictions[n].bbox[3] + 'px;';


                //Draw the actual bounding box
                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + (predictions[n].bbox[0] + vidWidth) + 'px; + top; '
                    + predictions[n].bbox[1] + 'px; width: '
                    + (predictions[n].bbox[2]) + 'px; height: '
                    + (predictions[n].bbox[3]+vidHeight) + 'px;';

                liveview.appendChild(highlighter);
                liveview.appendChild(p);

                //Store the child elements we create so we can remove them next time
                children.push(highlighter);
                children.push(p);
            }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);

    });

};
   


