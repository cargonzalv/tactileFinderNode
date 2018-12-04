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
  async testModel() {
    if (model.model) {
      console.time("Testing Predictions");
      console.log(model.model.summary());

      let totalMislabeled = 0;
      let totalGoodLabeled = 0;
      let mislabeled = [];
      let imageIndex = 0;
      data.labelsAndImages.forEach(item => {
        let results = [];
        item.images.forEach(img_filename => {
          tf.tidy(() => {
            let embeddings = data.dataset ?
              data.getEmbeddingsForImage(imageIndex++) :
              data.bufferToTensor(img_filename);
            console.log(embeddings)
            let prediction = model.getPrediction(embeddings);
            results.push({
              class: prediction.label,
              probability: (
                Number(prediction.confidence) * 100
              ).toFixed(1)
            });
            if (prediction.label !== item.label) {
              mislabeled.push({
                class: item.label,
                prediction: prediction.label,
                filename: img_filename
              });
              totalMislabeled++;
            }
            else{
              totalGoodLabeled++;
            }
          });
        });
        console.log({
          label: item.label,
          predictions: results.slice(0, 10)
        });
      });
      console.timeEnd("Testing Predictions");
      console.log(mislabeled);
      console.log(`Total Mislabeled: ${totalMislabeled}`);
      console.log(`Total Goodlabeled: ${totalGoodLabeled}`);
      console.log(`Accuracy: ${100 - ((totalMislabeled/totalGoodLabeled)*100)}%`)

      
    }
  }

  predictModel() {
    if (model.model) {
      console.log("Testing Predictions");
      let imageIndex = 0;
      return data.labelsAndImages.map(imgUrl => {
          return tf.tidy(() => {
            console.log("starting getting embeddings")
            let embeddings = data.dataset ?
              data.getEmbeddingsForImage(imageIndex++) :
              data.bufferToTensor(imgUrl);
              console.log("finish getting embeddings")

            if(embeddings === null){
              return {
                url: imgUrl,
                probability:0.00
              }
            }
            console.log("starting predictionsss")
            let prediction = model.getPrediction(embeddings);
            console.log("finished predictions")
            let probability = (Number(prediction.confidence) * 10).toFixed(2);
            probability = prediction.label === "Positive" ? probability : 100 - probability;
            return{
                url: imgUrl,
                probability:probability
            }
        });
      });
      
    }
    else{
      return null;
    }
  }


  async trainModel() {
    await data.loadTrainingData(model.decapitatedMobilenet);

    if (data.dataset.images) {
      const trainingParams = {
        batchSizeFraction: ui.getBatchSizeFraction(),
        denseUnits: ui.getDenseUnits(),
        epochs: ui.getEpochs(),
        learningRate: ui.getLearningRate(),
        trainStatus: ui.trainStatus
      };

      const labels = data.labelsAndImages.map(element => element.label);
      const trainResult = await model.train(
        data.dataset,
        labels,
        trainingParams
      );
      console.log("Training Complete!");
      const losses = trainResult.history.loss;
      console.log(
        `Final Loss: ${Number(losses[losses.length - 1]).toFixed(5)}`
      );

      console.log(model.model.summary());
    } else {
      new Error("Must load data before training the model.");
    }
  }
}

module.exports = App;