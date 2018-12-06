global.fetch = require("node-fetch");

const model = require("./utils/model");
const data = require("./utils/data");
const App = require("./utils/app");


const memoryUsage = () => {
  let used = process.memoryUsage();
  const values = []
  for (let key in used) {
    values.push(`${key}=${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }

  return `memory used: ${values.join(', ')}`
}

const logTimeAndMemory = label => {
  console.timeEnd(label)
  console.log(memoryUsage())
}
async function main(params) {
  const app  = new App("https://storage.googleapis.com/tactiledmodel/model")
  if (params.images) {
    console.time('main');
    console.log('prediction function called.')
    console.log(memoryUsage())

    console.log('loading image and model...')

    let images = params.images;

    data.loadImagesFromBuffers(images);

    console.time("Loading Model");
    await model.init("https://storage.googleapis.com/tactiledmodel/model");
    logTimeAndMemory('Loading Model')

    console.time('mn_model.classify');
    let result = await app.predictModel();
    logTimeAndMemory('mn_model.classify')

    logTimeAndMemory('main')
    return {
      results: result
    }
  } else {
    return {
      results: "Add some images first"
    }
  }
}