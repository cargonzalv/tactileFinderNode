cp ./examples/image_retraining/label_image.py /tf_files
cd /tf_files
python label_image.py --graph=retrained_graph.pb --image=/img/guess.jpg