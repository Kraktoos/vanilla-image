import Cropper from "./cropper.esm.js";

const cssThemes = [
  "darkly",
  "journal",
  "lumen",
  "lux",
  "morph",
  "quartz",
  "sketchy",
  "solar",
  "superhero",
  "united",
  "vapor",
];

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.type = "text/css";
linkElement.href = `../css/themes/${
  cssThemes[Math.floor(Math.random() * cssThemes.length)]
}.css`;
document.head.appendChild(linkElement);

let width = 0;
let height = 0;

const options = {
  autoCropArea: 1,
};

const imageElement = document.getElementById("image");
const fileInputElement = document.getElementById("fileinput");
const widthInputElement = document.getElementById("width");
const heightInputElement = document.getElementById("height");
const qualityInputElement = document.getElementById("quality");
const downloadOptions = document.querySelectorAll(".download-option");
const rotateButtonElement = document.getElementById("rotate");
const flipButtonElement = document.getElementById("flip");
const resetButtonElement = document.getElementById("reset");
const zoomInButtonElement = document.getElementById("zoomin");
const zoomOutButtonElement = document.getElementById("zoomout");
let cropper = null;

function initializeCropper() {
  cropper = new Cropper(imageElement, options);
  cropper.on("ready", () => {
    updateDataAfterImageChange();
  });
}

function updateDataAfterImageChange() {
  setTimeout(() => {
    const cropperData = cropper.getCropBoxData();
    width = Math.round(cropperData.width);
    height = Math.round(cropperData.height);
    widthInputElement.value = width;
    heightInputElement.value = height;
    cropper.setAspectRatio(width / height);
  }, 50);
}

window.addEventListener("paste", async function (e) {
  const items = e.clipboardData.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const URLObj = window.URL || window.webkitURL;
        const source = URLObj.createObjectURL(blob);
        imageElement.src = source;
        if (cropper) cropper.destroy();
        initializeCropper();
      }
    }
  }
});

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
  if (cropper) cropper.destroy();
  initializeCropper();
});

fileInputElement.addEventListener("change", async function (e) {
  const file = e.target.files[0];
  const URLObj = window.URL || window.webkitURL;
  const source = URLObj.createObjectURL(file);
  imageElement.src = source;
  if (cropper) cropper.destroy();
  initializeCropper();
});

rotateButtonElement.addEventListener("click", function (e) {
  if (cropper) cropper.rotate(90);
});

flipButtonElement.addEventListener("click", function (e) {
  if (cropper) cropper.scaleX(-cropper.getData().scaleX);
});

resetButtonElement.addEventListener("click", function (e) {
  if (cropper) cropper.reset();
});

zoomInButtonElement.addEventListener("click", function (e) {
  if (cropper) cropper.zoom(0.1);
});

zoomOutButtonElement.addEventListener("click", function (e) {
  if (cropper) cropper.zoom(-0.1);
});

widthInputElement.addEventListener("input", function (e) {
  if (widthInputElement.value) {
    width = widthInputElement.value;
    if (cropper) cropper.setAspectRatio(width / height);
  }
});

heightInputElement.addEventListener("input", function (e) {
  if (heightInputElement.value) {
    height = heightInputElement.value;
    if (cropper) cropper.setAspectRatio(width / height);
  }
});

downloadOptions.forEach((option) => {
  option.addEventListener("click", async function (e) {
    if (!cropper) {
      alert("No image loaded");
      return;
    }
    const format = e.target.getAttribute("data-format");
    const canvas = cropper.getCroppedCanvas();
    if (!canvas) {
      alert("Could not get cropped canvas");
      return;
    }

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

    let mimeType;
    let extension;
    switch (format) {
      case "jpeg":
        mimeType = "image/jpeg";
        extension = "jpeg";
        break;
      case "png":
        mimeType = "image/png";
        extension = "png";
        break;
      case "avif":
        mimeType = "image/avif";
        extension = "avif";
        break;
      case "webp":
      default:
        mimeType = "image/webp";
        extension = "webp";
        break;
    }

    const croppedImageUrl = resizedCanvas.toDataURL(
      mimeType,
      qualityInputElement.value / 100
    );

    const link = document.createElement("a");
    link.download = `cropped.${extension}`;
    link.href = croppedImageUrl;
    link.click();
    link.remove();
  });
});

// Initial cropper setup if image is already present
if (imageElement.src) {
  initializeCropper();
}
