global.fetch = require("node-fetch");

const model = require("./utils/model");
const data = require("./utils/data");
const App = require("./utils/app");
const path = require("path");
const functions = require('firebase-functions');

const firestore = require("./firebase").firestore();
const db = firestore.collection("Data");

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
    let metadata = await db.doc("metadata").get()
    if (!metadata.exists) {
      console.log("Metadata no existeeee")
      await db.doc("metadata").set({
        numberOfDocs: 1
      })
    } else {
      console.log("entro a crear")
      await db.doc("metadata").update({
        numberOfDocs: metadata.data().numberOfDocs + 1
      })
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
    .catch((err)=>{
      console.log(err)
    })
  }
  // const newValue = event.after.data();

  // // access a particular field as you would any JS property
  // const positives = newValue.positives;
  // const negatives = newValue.negatives;

  // initTraining(positives, negatives)
});

// Listen for any change on document `marie` in collection `users`
exports.myFunctionName = functions.firestore
  .document('users/marie').onWrite((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = snap.data();

    // access a particular field as you would any JS property
    const name = newValue.name;

  });

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

exports.test = functions.https.onRequest(async (request, response) => {
  console.log("fiemfioewnfweiowmflekokfoekfoewkfwepfmpwm")
  console.log(request)
  response.send("OKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK")
})