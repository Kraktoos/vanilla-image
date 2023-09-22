import Cropper from "./cropper.esm.js";

let width = 0;
let height = 0;

const options = {
  autoCropArea: 1,
};

const imageElement = document.getElementById("image");
const fileInputElement = document.getElementById("fileinput");
const widthInputElement = document.getElementById("width");
const heightInputElement = document.getElementById("height");
const cropButtonElement = document.getElementById("crop");
const rotateButtonElement = document.getElementById("rotate");
const flipButtonElement = document.getElementById("flip");
const resetButtonElement = document.getElementById("reset");
const zoomInButtonElement = document.getElementById("zoomin");
const zoomOutButtonElement = document.getElementById("zoomout");
let cropper = new Cropper(imageElement, options);

// get pasted image and change the src of the #image element
window.addEventListener("paste", async function (e) {
  const items = e.clipboardData.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const URLObj = window.URL || window.webkitURL;
        const source = URLObj.createObjectURL(blob);
        imageElement.src = source;
        cropper.destroy();
        cropper = new Cropper(imageElement, options);
      }
    }
  }
});

// listen for files dragged into the browser window
window.addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
});

window.addEventListener("drop", async function (e) {
  e.preventDefault();
  e.stopPropagation();
  const file = e.dataTransfer.files[0];
  const URLObj = window.URL || window.webkitURL;
  const source = URLObj.createObjectURL(file);
  imageElement.src = source;
  cropper.destroy();
  cropper = new Cropper(imageElement, options);
});

fileInputElement.addEventListener("change", async function (e) {
  const file = e.target.files[0];
  const URLObj = window.URL || window.webkitURL;
  const source = URLObj.createObjectURL(file);
  imageElement.src = source;
  cropper.destroy();
  cropper = new Cropper(imageElement, options);
});

rotateButtonElement.addEventListener("click", function (e) {
  cropper.rotate(90);
});
flipButtonElement.addEventListener("click", function (e) {
  cropper.scaleX(-cropper.getData().scaleX);
});
resetButtonElement.addEventListener("click", function (e) {
  cropper.reset();
});
zoomInButtonElement.addEventListener("click", function (e) {
  cropper.zoom(0.1);
});
zoomOutButtonElement.addEventListener("click", function (e) {
  cropper.zoom(-0.1);
});

let imageSrcObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type == "attributes") {
      if (mutation.attributeName == "src") {
        if (imageElement.src) {
          width = imageElement.width;
          height = imageElement.height;
        }
      }
    }
  });
});
imageSrcObserver.observe(imageElement, {
  attributes: true,
});

widthInputElement.addEventListener("change", function (e) {
  if (widthInputElement.value) {
    width = widthInputElement.value;
    cropper.setAspectRatio(width / height);
  }
});
heightInputElement.addEventListener("change", function (e) {
  if (heightInputElement.value) {
    height = heightInputElement.value;
    cropper.setAspectRatio(width / height);
  }
});

cropButtonElement.addEventListener("click", async function (e) {
  const canvas = cropper.getCroppedCanvas();
  // resize image
  const resizedCanvas = document.createElement("canvas");
  const resizedContext = resizedCanvas.getContext("2d");
  resizedCanvas.width = width;
  resizedCanvas.height = height;
  resizedContext.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    0,
    0,
    width,
    height
  );
  // convert to webp
  const croppedImageUrl = resizedCanvas.toDataURL("image/webp", 0.75);
  // const croppedImageUrl = canvas.toDataURL("image/webp", 0.75);
  // const croppedImage = await fetch(croppedImageUrl).then((res) => res.blob());
  // // compress image and convert to webp
  // const compressedImage = await imageCompression(croppedImage, {
  //   maxWidthOrHeight: 800,
  //   useWebWorker: true,
  //   fileType: "webp",
  //   initialQuality: 0.75,
  // });
  // download image
  const link = document.createElement("a");
  link.download = "image.webp";
  // link.href = URL.createObjectURL(compressedImage);
  link.href = croppedImageUrl;
  link.click();
  link.remove();
});
