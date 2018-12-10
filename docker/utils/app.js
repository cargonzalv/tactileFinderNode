const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
global.fetch = require("node-fetch");

const model = require("./model");
const data = require("./data");
const ui = require("./ui_mock");

class App {
  constructor(projName) {
    this.projectName = projName;
  }

  predictModel() {
    if (model.getModel()) {
      let imageIndex = 0;
      return Promise.all(data.labelsAndImages.map(async imgUrl => {
        let embeddings = data.dataset ?
          data.getEmbeddingsForImage(imageIndex++) :
          await data.bufferToTensor(imgUrl);

        if (embeddings === null) {
          return {
            url: imgUrl,
            probability: 0.00
          }
        }
        let prediction = model.getPrediction(embeddings);
        let probability = (Number(prediction.confidence) * 100).toFixed(2);
        console.log("Probability: " + probability, prediction.label)
        probability = prediction.label === "Positive" ? probability : Number(100 - probability).toFixed(2);
        // free memory from TF-internal libraries from input image
        embeddings.dispose()
        return {
          url: imgUrl,
          probability: probability
        }
      }));

    } else {
      return null;
    }
  }

}

module.exports = App;