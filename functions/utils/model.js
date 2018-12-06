const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const fse = require("fs-extra");
const path = require("path");
const fs = require("fs");
const os = require('os');
global.fetch = require("node-fetch");

if (!process.env.predictMultiple) {

  const firebase = require("../firebaseStorage");
  var bucket = firebase.storage().bucket("tactiledmodel");
}

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadDecapitatedMobilenet() {
  const mobilenet = await tf.loadModel(

    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json"
  );

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({
    inputs: mobilenet.inputs,
    outputs: layer.output
  });
}

function reflect(promise) {
  return promise.then(function(v) {
      return {
        v: v,
        status: "resolved"
      }
    },
    function(e) {
      return {
        e: e,
        status: "rejected"
      }
    });
}

class Model {
  constructor(modelsDirectory) {
    this.modelsDirectory = modelsDirectory;
    this.decapitatedMobilenet = null;
    this.model = null;
    this.labels = null;
  }

  async init(projectName) {
    if (this.decapitatedMobilenet === null && this.model === null) {
      let arr = [loadDecapitatedMobilenet(), this.loadModel(projectName)];

      let results = await Promise.all(arr.map(reflect));
      console.log(results)
      this.decapitatedMobilenet = results[0].v;
      this.model = results[1].v;
    }
    else if (this.model === null) {
      this.model = await this.loadModel(projectName)
    }
    else if(this.decapitatedMobilenet === null){
      this.decapitatedMobilenet = await loadDecapitatedMobilenet()
    }
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  buildRetrainingModel(denseUnits, numClasses, learningRate) {
    this.model = tf.sequential({
      layers: [
        // Flattens the input to a vector so we can use it in a dense layer. While
        // technically a layer, this only performs a reshape (and has no training
        // parameters).
        tf.layers.flatten({
          inputShape: this.decapitatedMobilenet.outputs[0].shape.slice(
            1
          )
        }),
        // Layer 1.
        tf.layers.dense({
          units: denseUnits,
          activation: "relu",
          kernelInitializer: "varianceScaling",
          useBias: true
        }),
        // Layer 2. The number of units of the last layer should correspond
        // to the number of classes we want to predict.
        tf.layers.dense({
          units: numClasses,
          kernelInitializer: "varianceScaling",
          useBias: false,
          activation: "softmax"
        })
      ]
    });

    // Creates the optimizers which drives training of the model.
    const optimizer = tf.train.adam(learningRate);
    // We use categoricalCrossentropy which is the loss function we use for
    // categorical classification which measures the error between our predicted
    // probability distribution over classes (probability that an input is of each
    // class), versus the label (100% probability in the true class)>
    this.model.compile({
      optimizer: optimizer,
      loss: "categoricalCrossentropy"
    });
  }

  getModelPath(projectName) {
    return path.join(this.modelsDirectory, projectName);
  }

  getPrediction(x) {
    // Assume we are getting the embeddings from the decapitatedMobilenet
    let embeddings = x;
    // If the second dimension is 224, treat it as though it's an image tensor
    console.log("predictMobilenet")
    if (x.shape[1] === 224) {
      embeddings = this.decapitatedMobilenet.predict(x);
      console.log("finish mobilenet")
    }

    console.log("begin topk")
    let {
      values,
      indices
    } = this.model.predict(embeddings).topk();
    console.log("finish topk")
    console.log("begin datasync");
    return {
      label: this.labels[indices.dataSync()[0]],
      confidence: values.dataSync()[0]
    };
  }

  async loadModel(projectName) {
    let dirName
    let modelDir;
    if (projectName.includes("https:")) {
      dirName = projectName;
      modelDir = projectName + "/model.json";
    } else {
      dirName = this.getModelPath(projectName);
      modelDir = "file://" + dir + "/model.json"

    }

    if (projectName.includes("https:")) {
      let jsonName = dirName + "/labels.json";
      let jsonRes = await fetch(jsonName)
      let json = await jsonRes.json();
      this.labels = json.Labels;

    } else {
      this.labels = await fse
        .readJson(path.join(dirName, "labels.json"))
        .then(obj => obj.Labels);
    }
    this.model = await tf.loadModel(modelDir);
    return this.model;
  }

  async saveModel(projectName) {
    const saveDir = this.getModelPath(projectName);
    fse.ensureDirSync(saveDir);
    await this.model.save(tf.io.withSaveHandler(async (handlerSave) => {
      let rawData = handlerSave;

      let weights = new Buffer(rawData.weightData);
      await this.uploadFile("weights.bin", weights)
      console.log('Uploaded weights bin!');
      let modelJson = { ...rawData
      };
      modelJson.weightsManifest = {
        paths: ["weights.bin"],
        weights: rawData.weightSpecs
      }
      delete modelJson.weightSpecs;
      delete modelJson.weightData;
      await this.uploadFile("model.json", modelJson)
      console.log("Uploaded model json")

      await this.uploadFile("labels.json", {
        Labels: this.labels
      })
      console.log('Uploaded labels json!');

    }));
  }

  async uploadFile(fileName, obj) {
    let contentType = "";
    const tempFilePath = path.join(os.tmpdir(), fileName);
    console.log(fileName)
    console.log(obj)
    if (fileName.includes("json")) {
      contentType = "application/json"
      fse.writeJsonSync(tempFilePath, obj);
    } else {
      contentType = "application/octet-stream";
      var buf = new Buffer(obj, 'binary');
      fs.writeFileSync(tempFilePath, buf);
    }
    console.log("data written")
    const metadata = {
      contentType: contentType,
    };
    console.log(tempFilePath)
    return bucket.upload(tempFilePath, {
      destination: "/model/" + fileName,
      metadata: metadata,
      // Once the thumbnail has been uploaded delete the local file to free up disk space.
    }).then(() => {
      console.log("bucket uploaded!")
      return fs.unlinkSync(tempFilePath)

    });

  }

  /**
   * Sets up and trains the classifier.
   */
  async train(dataset, labels, trainingParams) {
    if (dataset === null || dataset.images === null) {
      throw new Error("Add some examples before training!");
    }

    this.labels = labels.slice(0);
    this.buildRetrainingModel(
      trainingParams.denseUnits,
      labels.length,
      trainingParams.learningRate
    );

    // We parameterize batch size as a fraction of the entire dataset because the
    // number of examples that are collected depends on how many examples the user
    // collects. This allows us to have a flexible batch size.
    const batchSize = Math.floor(
      dataset.images.shape[0] * trainingParams.batchSizeFraction
    );
    if (!(batchSize > 0)) {
      throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`
      );
    }

    // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
    console.time("Training Time");
    return this.model.fit(dataset.images, dataset.labels, {
      batchSize,
      epochs: trainingParams.epochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          trainingParams.trainStatus("Loss: " + logs.loss.toFixed(5));
        },
        onTrainEnd: async logs => {
          console.timeEnd("Training Time");
        }
      }
    });
  }
}
module.exports = new Model(path.join(os.tmpdir(), "trained_models"));