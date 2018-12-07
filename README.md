# Project description

Tactiled is a tool made to test the quality of an image to be used as a tactile graphic. We want to develop and train a Machine Learning model that determines the quality of an image that will be transformed to a tactile graphic, by evaluating the facility for a blind person to understand its content

# Functionalities
1. A Machine Learning model capable of determining the quality of an image, quality understood as the facility for a blind person to understand its content, of a tactile graphic. 
2. A tool for users to test their own images. 
3. A small search engine that provides good images to transform to tactile graphics.

# Project Structure


## Client Folder

Contains the source code for the client side of Tactiled. Here's that [repo](https://github.com/cegonzalv/tactileFinderClient)

## Docker folder

Contains the IBM Cloud Function that predicts any image passed into it. This serverless service can be accesible on this url: 

https://openwhisk.ng.bluemix.net/api/v1/web/carlosegonzaleza%40hotmail.com_dev/default/classify.json?images=[]

Where the images parameter contains an array of images to predict. They can be urls or buffers.

## Backend folder

Contains the initial training process, where nearly 2000 images where trained and fed to the model, then deployed to our own model hosted on a Google Cloud Storage bucket available here:

https://storage.googleapis.com/tactiledmodel/model/model.json

Any person can use this model by using this TensorflowJS command:

```
tf.loadModel("https://storage.googleapis.com/tactiledmodel/model/model.json")
```

## Functions folder

Contains the google cloud functions used on the model. Mainly, a firebase trigger that re-trains the Machine Learning model every 20 insertions on the database. Then uploads the model to the Cloud Storage bucket.

# Development

To train your own model, you will need to follow this instructions:

## Requirements

1. NodeJS >= 8.11.1

## Usage 

1. Clone the repo

2. Go to the backend folder, there's where all the hard stuff is done.
```
 cd backend
```

3. Now you just need to add the categories you want to train inside the "tactile_photos" folder 
For example
```
 tactile_photos/Positive
 tactile_photos/Negative
```
4. Run the program
```
 node index.js
```
