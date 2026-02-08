
#! wap in python to sort the images based on the device type (iphone or android) and move them to respective folders. The script should also create a log file in json format with the metadata of each image (device type, filename, etc.). The script should be able to handle various image formats and should be robust against missing or incomplete metadata.

import os
import json
from PIL import Image
from PIL.ExifTags import TAGS
import shutil

def get_image_metadata(image_path):
    """Extract device info from image."""
    try:
        image = Image.open(image_path)
        exif_data = image._getexif() or {}
        metadata = {'filename': os.path.basename(image_path)}
        
        for tag_id, value in exif_data.items():
            tag_name = TAGS.get(tag_id, tag_id)
            if tag_name in ['Model', 'Make']:
                metadata[tag_name] = str(value).lower()
        
        return metadata
    except:
        return None

def detect_device_type(metadata):
    """Detect device type from metadata."""
    if not metadata:
        return None
    
    model = metadata.get('Model', '')
    make = metadata.get('Make', '')
    
    if 'iphone' in model or 'iphone' in make:
        return 'iphone'
    elif any(brand in make for brand in ['samsung', 'google', 'xiaomi', 'huawei', 'oneplus', 'nokia']):
        return 'android'
    
    return None

def sort_images(source_dir):
    """Sort images by device type into iPhone and Android folders."""
    os.makedirs(os.path.join(source_dir, 'android'), exist_ok=True)
    os.makedirs(os.path.join(source_dir, 'iphone'), exist_ok=True)
    
    metadata_log = []
    extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic')
    
    for filename in os.listdir(source_dir):
        filepath = os.path.join(source_dir, filename)
        
        if os.path.isdir(filepath) or not filename.lower().endswith(extensions):
            continue
        
        metadata = get_image_metadata(filepath)
        if not metadata:
            continue
        
        device_type = detect_device_type(metadata)
        if device_type:
            shutil.move(filepath, os.path.join(source_dir, device_type, filename))
            print(f"Moved {filename} to {device_type}")
        else:
            print(f"Skipped {filename}")
        
        metadata_log.append(metadata)
    
    with open(os.path.join(source_dir, 'metadata_log.json'), 'w') as f:
        json.dump(metadata_log, f, indent=2)
    
    print(f"\nProcessed: {len(metadata_log)} images")

if __name__ == "__main__":
    # Set the source directory where the main images are stored
    source_dir = os.path.join(os.path.dirname(__file__), 'img')
    os.makedirs(source_dir, exist_ok=True)
    sort_images(source_dir)