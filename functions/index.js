const functions = require('firebase-functions');
const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
const {createCanvas, Image} = require('canvas');
const fs = require('fs')
const os = require("os")
require('@tensorflow/tfjs-node')
global.fetch = require('node-fetch')

const trainedModel = "mobilenet_1.0_224";

const MODEL_URL = `https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/tensorflowjs_model.pb`
const WEIGHTS_MANIFEST_URL = `https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/weights_manifest.json`

let model = null;
const PREPROCESS_DIVISOR = tf.scalar(255 / 2);
const IMAGE_SIZE = 224;
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// const upload = async (binary)=>{
//   let data = binary.replace(/^data:image\/\w+;base64,/, "");
//   var buf = new Buffer(data, 'base64');
//   fs.writeFile("/tmp/test.jpg", buf, function(err) {
//     if(err)
//       console.log(err);
//     else
//       console.log("The file was saved!");
//   }); 

// }

const imageToCanvas = (src) =>{
  console.log(os.tmpdir())
    return new Promise((resolve) => {
      const canvas = createCanvas(224, 224);
      const ctx = canvas.getContext('2d');
      let img = new Image()
      img.src = src
      console.log(img)
      img.onload = async e => {
        ctx.drawImage(img, 0, 0, 224, 224)
        return resolve(canvas);
      }
    })
    
  }
  
  const loadModel = async () => {
    const mn = new mobilenet.MobileNet(1, 1);
    mn.path = `https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json`
    await mn.load()
    model = mn;
    
  }

exports.classifyMN = functions.https.onRequest(async (request, response)=>{

    let input = await imageToCanvas("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png");
    console.log(input)
    await loadModel()
    const prediction = await model.classify(input)   
    response.send(prediction)

})
const loadFrozenModel = async () =>{
    model = await tf.loadFrozenModel(
        MODEL_URL,
        WEIGHTS_MANIFEST_URL);
        let data = await fetch(`https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/retrained_labels.txt`,{
          mode:"cors",
        });
        let text = await data.text();
        let lines = text.split("\n");
        this.classes = [];
        lines.map((l)=>{
          return this.classes.push(l)
        })
      // Warmup the model.
      const result = tf.tidy(
                         () => model.predict(tf.zeros(
                             [1, IMAGE_SIZE, IMAGE_SIZE, 3])));
      await result.data();
      result.dispose();
  }

const predict = (input) => {
    return tf.tidy(() =>{
      const pixels = tf.fromPixels(input)
      // Normalize the image from [0, 255] to [-1, 1].
      let normalized = pixels.toFloat().sub(PREPROCESS_DIVISOR).div(PREPROCESS_DIVISOR);
      
      // Resize the image to
      let resized = normalized;
      if (pixels.shape[0] !== IMAGE_SIZE || pixels.shape[1] !== IMAGE_SIZE) {
        const alignCorners = true;
        resized = tf.image.resizeBilinear(
          normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
        }
        
        const batched = resized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
        return model.predict(batched)
      })
      
    }
    const getTopKClasses = async (logits) => {
        const values = logits.dataSync();
        console.log(values)
        let predictionList = [];
        for (let i = 0; i < values.length; i++) {
          predictionList.push({
            label: this.classes[i],
            value: values[i]
          });
        }
        return predictionList;
    }
    
exports.classify = functions.https.onRequest(async (request, response)=>{


    let input = await imageToCanvas("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png");
    console.log(input)
    await loadFrozenModel()
    const result = await predict(input) 
    const prediction = await getTopKClasses(result);
    response.send(prediction)

})