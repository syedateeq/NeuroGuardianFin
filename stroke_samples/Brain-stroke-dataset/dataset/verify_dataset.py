import os
from PIL import Image

def verify_dataset(data_dir):
    # Count images in each folder
    ischemic_dir = os.path.join(data_dir, 'ischemic')
    hemorrhagic_dir = os.path.join(data_dir, 'hemorrhagic')
    
    ischemic_images = [f for f in os.listdir(ischemic_dir) if f.endswith('.jpg')]
    hemorrhagic_images = [f for f in os.listdir(hemorrhagic_dir) if f.endswith('.jpg')]
    
    print(f"Number of Ischemic images: {len(ischemic_images)}")
    print(f"Number of Hemorrhagic images: {len(hemorrhagic_images)}")
    print(f"Total images: {len(ischemic_images) + len(hemorrhagic_images)}")
    
    # Inspect a few images for dimensions and mode
    for img_name in ischemic_images[:3]:
        img_path = os.path.join(ischemic_dir, img_name)
        img = Image.open(img_path)
        print(f"Ischemic/{img_name} - Size: {img.size}, Mode: {img.mode}")
    
    for img_name in hemorrhagic_images[:3]:
        img_path = os.path.join(hemorrhagic_dir, img_name)
        img = Image.open(img_path)
        print(f"Hemorrhagic/{img_name} - Size: {img.size}, Mode: {img.mode}")

if __name__ == "__main__":
    verify_dataset('dataset')