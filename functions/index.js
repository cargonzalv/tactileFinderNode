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