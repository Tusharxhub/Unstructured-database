
#! wap in python to sort the images based on the device type (iphone or android) and move them to respective folders. The script should also create a log file in json format with the metadata of each image (device type, filename, etc.). The script should be able to handle various image formats and should be robust against missing or incomplete metadata.

import os
import json
from PIL import Image
from PIL.ExifTags import TAGS
import shutil

def get_image_metadata(image_path):
    try:
        image = Image.open(image_path)
        exif = image._getexif() or {}
        meta = {'filename': os.path.basename(image_path)}
        for tag, val in exif.items():
            name = TAGS.get(tag, tag)
            if name in ['Model', 'Make']:
                meta[name] = str(val).lower()
        return meta
    except:
        return None

def detect_device_type(meta):
    if not meta: return None
    model, make = meta.get('Model', ''), meta.get('Make', '')
    if 'iphone' in model or 'iphone' in make: return 'iphone'
    if any(b in make for b in ['samsung','google','xiaomi','huawei','oneplus','nokia']): return 'android'
    return None

def sort_images(src):
    os.makedirs(os.path.join(src, 'android'), exist_ok=True)
    os.makedirs(os.path.join(src, 'iphone'), exist_ok=True)
    log, exts = [], ('.jpg','.jpeg','.png','.gif','.bmp','.webp','.heic')
    for fn in os.listdir(src):
        fp = os.path.join(src, fn)
        if os.path.isdir(fp) or not fn.lower().endswith(exts): continue
        meta = get_image_metadata(fp)
        if not meta: continue
        dtype = detect_device_type(meta)
        if dtype:
            shutil.move(fp, os.path.join(src, dtype, fn))
            print(f"Moved {fn} to {dtype}")
        else:
            print(f"Skipped {fn}")
        log.append(meta)
    with open(os.path.join(src, 'metadata_log.json'), 'w') as f:
        json.dump(log, f, indent=2)
    print(f"\nProcessed: {len(log)} images")

if __name__ == "__main__":
    src_dir = os.path.join(os.path.dirname(__file__), 'img')
    os.makedirs(src_dir, exist_ok=True)
    sort_images(src_dir)
