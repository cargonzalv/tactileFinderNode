docker build . --rm --no-cache -t cegonzalv/tactiled:tfjs
docker push cegonzalv/tactiled:tfjs
#ibmcloud fn action delete classify
#ibmcloud fn action create classify --docker cegonzalv/tactiled:tfjs index.js