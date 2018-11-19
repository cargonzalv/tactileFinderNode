rm -rfv ./tf_files/saved_models/$1
rm -rfv ./tf_files/training_summaries/$1
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
docker run -v $SCRIPTPATH/tf_files:/tf_files -i -t cegonzalv/tactilefindertensorflow:latest bash -c "./train.sh $1 $2"
cp -r ./tf_files/web_model/$1/  ../tactileFinderClient/src/tfmodel
cp -r ./tf_files/retrained_labels.txt ../tactileFinderClient/src/tfmodel/$1/
node ../tactileFinderClient/src/sendToFirebase.js
cmd /k