rm -rfv ./tf_files/saved_models/mobilenet_1.0_224
rm -rfv ./tf_files/training_summaries/mobilenet_1.0_224
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
docker run -v $SCRIPTPATH/tf_files:/tf_files -i -t cegonzalv/tactilefindertensorflow:latest bash -c "./train.sh mobilenet_1.0_224 $1"
cp -r ./tf_files/web_model/mobilenet_1.0_224/  ../tactileFinderClient/src/tfmodel
cp -r ./tf_files/retrained_labels.txt ../tactileFinderClient/src/tfmodel/mobilenet_1.0_224/