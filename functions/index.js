global.fetch = require("node-fetch");

const model = require("./utils/model");
const data = require("./utils/data");
const App = require("./utils/app");
const path = require("path");
const functions = require('firebase-functions');

if (!process.env.predictMultiple ){
const firestore = require("./firebase").firestore();
const allRef = firestore.collection("All");
}

let imageDir = "./tactile_photos";
let projectName = path.basename(path.dirname(imageDir));

const initTraining = async function(positives, negatives, ) {
  let app = new App(projectName);

  await data.loadLabelsAndImages(images, "Positive");

  console.time("Loading Model");
  await model.init();
  console.timeEnd("Loading Model");

  try {
    await app.trainModel();

    let newModel = await model.saveModel(projectName);
    console.log(newModel)
  } catch (error) {
    console.error(error);
  }
  app.testModel();

}
exports.train = functions.firestore.document('Data/{docId}').onWrite(async (event) => {
  // Get an object representing the document
  // e.g. {'name': 'Marie', 'age': 66}
  if (!event.before.exists) {
    console.log("objeto nuevo")
    // New document Created : add one to count
    let metadata = await allRef.doc("metadata").get()
    if (!metadata.exists) {
      console.log("Metadata no existeeee")
      await allRef.doc("metadata").set({
        numberOfDocs: 1
      })
    } else {
      console.log("entro a crear")
      let newNumber = metadata.data().numberOfDocs + 1;
      await allRef.doc("metadata").update({
        numberOfDocs: newNumber
      })
      if(newNumber % 20 === 0){
        console.log("retrain")
      }
      console.log("nicee")
    }

  } else if (!event.after.exists) {
    // Deleting document : subtract one from count
    console.log("deletinggg")
    db.doc("metadata").get().then(snap => {
        db.doc("metadata").update({
          numberOfDocs: snap.data().numberOfDocs - 1
        });
        return;
      })
      .catch((err) => {
        console.log(err)
      })
  }
  // const newValue = event.after.data();

  // // access a particular field as you would any JS property
  // const positives = newValue.positives;
  // const negatives = newValue.negatives;

  // initTraining(positives, negatives)
});


exports.predictMultiple = functions.https.onRequest(async (request, response) => {
  const app2 = new App("https://storage.googleapis.com/tactiledmodel/model")
  if (request.body.data) {
    let images = request.body.data;

    data.loadImagesFromBuffers(images);

    console.time("Loading Model");
    await model.init("https://storage.googleapis.com/tactiledmodel/model");
    console.timeEnd("Loading Model");

    let result = await app2.predictModel();
    response.json({
      code: 200,
      data: result
    })
  } else {
    response.json({
      code: 105,
      data: "Debe ingresar imagenes"
    })
  }

})

// const loadFrozenModel = async () => {
//   model = await tf.loadFrozenModel(
//     MODEL_URL,
//     WEIGHTS_MANIFEST_URL);
//   let data = await fetch(`https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/retrained_labels.txt`, {
//     mode: "cors",
//   });
//   let text = await data.text();
//   let lines = text.split("\n");
//   this.classes = [];
//   lines.map((l) => {
//     return this.classes.push(l)
//   })
//   // Warmup the model.
//   const result = tf.tidy(
//     () => model.predict(tf.zeros(
//       [1, IMAGE_SIZE, IMAGE_SIZE, 3])));
//   await result.data();
//   result.dispose();
// }

// const predict = (input) => {
//   return tf.tidy(() => {
//     const pixels = tf.fromPixels(input)
//     // Normalize the image from [0, 255] to [-1, 1].
//     let normalized = pixels.toFloat().sub(PREPROCESS_DIVISOR).div(PREPROCESS_DIVISOR);

//     // Resize the image to
//     let resized = normalized;
//     if (pixels.shape[0] !== IMAGE_SIZE || pixels.shape[1] !== IMAGE_SIZE) {
//       const alignCorners = true;
//       resized = tf.image.resizeBilinear(
//         normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
//     }

//     const batched = resized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
//     return model.predict(batched)
//   })

// }
// const getTopKClasses = async (logits) => {
//   const values = logits.dataSync();
//   console.log(values)
//   let predictionList = [];
//   for (let i = 0; i < values.length; i++) {
//     predictionList.push({
//       label: this.classes[i],
//       value: values[i]
//     });
//   }
//   return predictionList;
// }

// exports.classify = functions.https.onRequest(async (request, response) => {

//   let input = await imageToCanvas("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png");
//   console.log(input)
//   await loadFrozenModel()
//   const result = await predict(input)
//   const prediction = await getTopKClasses(result);
//   response.send(prediction)

// })
