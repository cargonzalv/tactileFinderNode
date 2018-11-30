global.fetch = require("node-fetch");
const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");

const model = require("./model");
const data = require("./data");
const App = require("./app");
const path = require("path");


let imageDir = "./tactile_photos";
let projectName = path.basename(path.dirname(imageDir));


train = async function() {
  let app = new App(projectName);
  await data.loadLabelsAndImages(imageDir);

  console.time("Loading Model");
  await model.init();
  console.timeEnd("Loading Model");

  try {
    await app.trainModel();

    await model.saveModel(projectName);
  } catch (error) {
    console.error(error);
  }
  app.testModel();


}
train();