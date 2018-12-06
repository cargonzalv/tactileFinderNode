const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const fse = require("fs-extra");
const path = require("path");
const jpeg = require('jpeg-js');
var Jimp = require('jimp');
const request = require('request').defaults({
  encoding: null
});

const IMAGE_CHANNELS = 3;

function base64ToSensor(data) {
  let buffer;
  if(data.includes("http")){
    let image = await Jimp.read(data);
  
    buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
  }
  else{
    buffer = new Buffer(data, "base64")
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

async function getDirectories(imagesDirectory) {
  return await fse.readdir(imagesDirectory);
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
  bufferToTensor(buffer) {
    return base64ToSensor(buffer);
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

  async loadTrainingData(model) {
    const numClasses = this.labelsAndImages.length;
    const numImages = this.labelsAndImages.reduce(
      (acc, item) => acc + item.images.length,
      0
    );

    const embeddingsShape = model.outputs[0].shape.slice(1);
    const embeddingsFlatSize = tf.util.sizeFromShape(embeddingsShape);
    embeddingsShape.unshift(numImages);
    const embeddings = new Float32Array(
      tf.util.sizeFromShape(embeddingsShape)
    );
    const labels = new Int32Array(numImages);

    // Loop through the files and populate the 'images' and 'labels' arrays
    let embeddingsOffset = 0;
    let labelsOffset = 0;
    await this.labelsAndImages.forEach(element => {
      let labelIndex = this.labelIndex(element.label);
      element.images.forEach(image => {
        tf.tidy(() => {
          let t = urlToTensor(image);
          if (t === null) {
            return;
          }
          let prediction = model.predict(t);
          embeddings.set(prediction.dataSync(), embeddingsOffset);
          labels.set([labelIndex], labelsOffset);
        });

        embeddingsOffset += embeddingsFlatSize;
        labelsOffset += 1;
      });
      console.log("Loading Training Data", {
        label: element.label
      });
    });

    this.dataset = {
      images: tf.tensor4d(embeddings, embeddingsShape),
      labels: tf.oneHot(tf.tensor1d(labels, "int32"), numClasses)
    };
  }
}

module.exports = new Data();