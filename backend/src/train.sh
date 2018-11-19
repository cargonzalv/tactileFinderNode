python ./examples/image_retraining/retrain.py \
--bottleneck_dir=/tf_files/bottlenecks \
--how_many_training_steps=$2 \
--model_dir=/tf_files/models/ \
--summaries_dir=/tf_files/training_summaries/$1 \
--output_graph=/tf_files/retrained_graph.pb \
--output_labels=/tf_files/retrained_labels.txt \
--image_dir=/tf_files/tactile_photos \
--saved_model_dir=/tf_files/saved_models/$1 \
--architecture=$1

echo $1
out=""
if [[ $1 == mobile* ]] ; then
    out="MobilenetV1/Predictions/Reshape_1"
else 
    out="pool_3/_reshape"
fi 
echo $out

tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_node_names=final_result \
    --saved_model_tags=serve \
    /tf_files/saved_models/$1 \
    /tf_files/web_model/$1