SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
docker run -v $SCRIPTPATH/tf_files:/tf_files -v $SCRIPTPATH/$1:/img/guess.jpg  -i -t cegonzalv/tactilefindertensorflow:latest sh -c "./guess.sh" 2> /dev/null
cmd /k