SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
docker run --rm -v $SCRIPTPATH/tf_files:/tf_files -v $SCRIPTPATH/$1:/toScan -v $SCRIPTPATH/$2:/scanned cegonzalv/tactilefindertensorflow sh -c "python /src/py/label_dir.py"
#docker run --rm -it  -v $1:/tf_files -v $2:/toScan -v $3:/scanned tf bash

