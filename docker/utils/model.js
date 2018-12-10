const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
global.fetch = require("node-fetch");

let decapitatedMobilenet;
let model;
let labels;

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
  }

  async init(projectName) {
    if (!decapitatedMobilenet && !model) {
      //two equals, not three. This checks for undefined + null
      let arr = [loadDecapitatedMobilenet(), this.loadModel(projectName)]; 

      let results = await Promise.all(arr.map(reflect));
      decapitatedMobilenet = results[0].v;
      model = results[1].v;
      console.log("loading both")
      return results;
    } 
    else if(!model) {
      model = await this.loadModel(projectName)    
      console.log("using cached mobilenet")
      return model;
    }
    else if(!decapitatedMobilenet) {
      decapitatedMobilenet = await loadDecapitatedMobilenet(projectName)    
      console.log("using cached model")
      return decapitatedMobilenet;
    }
    else{
      console.log("all cached")
      return true;
    }
  }

  getModel(){
    return model;
  }

  getPrediction(x) {
    // Assume we are getting the embeddings from the decapitatedMobilenet
    let embeddings = x;
    // If the second dimension is 224, treat it as though it's an image tensor
    if (x.shape[1] === 224) {
      embeddings = decapitatedMobilenet.predict(x);
    }

    let {
      values,
      indices
    } = model.predict(embeddings).topk();
    return {
      label: labels[indices.dataSync()[0]],
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
    labels = json.Labels;

    return await tf.loadModel(modelDir);
  }
}
module.exports = new Model();