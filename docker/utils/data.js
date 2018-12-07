const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const jpeg = require('jpeg-js');
var Jimp = require('jimp');

const IMAGE_CHANNELS = 3;

async function base64ToSensor(data) {
  let buffer;
  console.log("URLLLLLLLLLLLLLLLLLLLLLLL: " + data)
  if(data.includes("http")){
    let image = await Jimp.read(data);
  
    buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
  }
  else{
    console.log("ENTRO BUFFER")
    buffer = new Buffer(data, "base64")
    let image = await Jimp.read(buffer);
  
    buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
  }
  try{
    const pixels = jpeg.decode(buffer, true);
    return imageToTensor(pixels, IMAGE_CHANNELS);
    }
    catch (err) {
      console.log("SOI Error")
      return null
    }
}

const imageByteArray = (image, numChannels) => {
  const pixels = image.data;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values;
};

const imageToTensor = (image, numChannels) => {
  console.time('imageByteArray');

  const values = imageByteArray(image, numChannels);
  const outShape = [1, image.height, image.width, numChannels];
  return tf
    .tensor4d(values, outShape, "int32")
    .toFloat()
    .resizeBilinear([224, 224])
    .div(tf.scalar(127))
    .sub(tf.scalar(1));
};

class Data {
  constructor() {
    this.dataset = null;
    this.labelsAndImages = null;
  }

  getEmbeddingsForImage(index) {
    return this.dataset.images.gather([index]);
  }
  async bufferToTensor(buffer) {
    return await base64ToSensor(buffer);
  }

  imageToTensor(image, numChannels) {
    return imageToTensor(image, numChannels);
  }

  labelIndex(label) {
    return this.labelsAndImages.findIndex(item => item.label === label);
  }
  loadImagesFromBuffers(urlImages) {
    this.labelsAndImages = urlImages;
  }
}

module.exports = new Data();