We use cocoSsd/yolo pretrained model with tensorflow js to create web object detection on browser.

## Reproducing 

**1. clone and install dependencies**
```shell
npm install 
```
**2. Run on browser**
```shell
npx parcel index.html
```
**3. Run on IOS Simulator**
```shell
npx cap open ios 
```

***Note:  navigator.mediaDevices.getUserMedia() does not tend to work on ios***
