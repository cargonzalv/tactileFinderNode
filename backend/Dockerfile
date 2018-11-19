FROM tensorflow/tensorflow:latest-devel-py3

MAINTAINER Carlos González "ce.gonzalez13@uniandes.edu.co"

RUN pip install tensorflowjs
WORKDIR /tensorflow

RUN git pull
ADD src .
ADD scripts examples/image_retraining
CMD cd /tensorflow