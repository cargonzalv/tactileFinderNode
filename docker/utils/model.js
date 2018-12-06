const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
global.fetch = require("node-fetch");

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
  constructor() {
    this.decapitatedMobilenet = null;
    this.model = null;
    this.labels = null;
  }

  async init(projectName) {
    if (this.decapitatedMobilenet === null && this.model === null) {
      let arr = [loadDecapitatedMobilenet(), this.loadModel(projectName)];

      let results = await Promise.all(arr.map(reflect));
      this.decapitatedMobilenet = results[0].v;
      this.model = results[1].v;
    } 
    else if(this.model === null) {
      this.model = await this.loadModel(projectName)    
    }
    else if(this.decapitatedMobilenet === null) {
      this.decapitatedMobilenet = await loadDecapitatedMobilenet(projectName)    
    }
    
  }

  getPrediction(x) {
    // Assume we are getting the embeddings from the decapitatedMobilenet
    let embeddings = x;
    // If the second dimension is 224, treat it as though it's an image tensor
    if (x.shape[1] === 224) {
      embeddings = this.decapitatedMobilenet.predict(x);
    }

    let {
      values,
      indices
    } = this.model.predict(embeddings).topk();
    return {
      label: this.labels[indices.dataSync()[0]],
      confidence: values.dataSync()[0]
    };
  }

  async loadModel(projectName) {
    let dirName
    let modelDir;
    dirName = projectName;
    modelDir = projectName + "/model.json";
    let jsonName = dirName + "/labels.json";
    let jsonRes = await fetch(jsonName)
    let json = await jsonRes.json();
    this.labels = json.Labels;

    this.model = await tf.loadModel(modelDir);
    return this.model;
  }
}
module.exports = new Model();