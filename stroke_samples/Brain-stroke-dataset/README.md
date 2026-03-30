# Brain Stroke CT Image Dataset

This dataset contains CT images for two types of brain strokes: ischemic and hemorrhagic. It consists of 157 ischemic stroke images and 141 hemorrhagic stroke images, designed for training and evaluating machine learning models in stroke classification.

## Dataset Structure

The dataset is organized into two main directories:
/dataset
/ischemic
- image_001.png
- image_002.png
...
/hemorrhagic
- image_001.png
- image_002.png
...


- **/ischemic**: Contains 157 CT images of ischemic stroke cases.
- **/hemorrhagic**: Contains 141 CT images of hemorrhagic stroke cases.

## Image Format

- All images are in `.png` format.
- Images are pre-processed and standardized to ensure consistent quality and size.

## Usage

This dataset can be used for tasks such as:

- Training machine learning models for stroke classification
- Evaluating model performance on medical imaging tasks
- Researching diagnostic features distinguishing stroke types

## Preprocessing

The images have undergone the following preprocessing steps:

- Skull removal
- Contrast Limited Adaptive Histogram Equalization (CLAHE)
- Normalization

These steps ensure the images are optimized for input into neural networks, facilitating better feature extraction.

## License

Specify the license under which the dataset can be used, such as [MIT License](https://opensource.org/licenses/MIT), if applicable.

## Acknowledgments

If applicable, acknowledge any contributors or institutions that supported the creation or provision of the dataset.

## Citation

If you use this dataset in your research, please cite as follows:
@dataset{stroke_dataset_2023,
title={Brain Stroke CT Image Dataset},
year={2023},
publisher={Aishwarya Kulkarni},
url = {https://github.com/Aishwaryak1234/Brain-stroke-dataset/tree/main}
}
