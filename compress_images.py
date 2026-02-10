#!/usr/bin/env python3
"""
Ultra-compress images: ~80% size reduction for fast loading.
Max width 900px, JPEG quality 60, PNG optimized.
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    os.system("pip install Pillow -q")
    from PIL import Image

PHOTO_DIR = Path(__file__).parent / "photography"
MAX_WIDTH = 900
JPEG_QUALITY = 60
PNG_OPTIMIZE = True


def compress_image(path: Path) -> None:
    ext = path.suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png"):
        return
    try:
        with Image.open(path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB") if ext in (".jpg", ".jpeg") else img.convert("RGBA")
            w, h = img.size
            if w > MAX_WIDTH:
                ratio = MAX_WIDTH / w
                new_size = (MAX_WIDTH, int(h * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            if ext in (".jpg", ".jpeg"):
                img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
            else:
                img.save(path, "PNG", optimize=PNG_OPTIMIZE, compress_level=9)
    except Exception as e:
        print(f"Skip {path.name}: {e}")


def main():
    if not PHOTO_DIR.exists():
        print("photography folder not found")
        return
    for f in PHOTO_DIR.iterdir():
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png"):
            compress_image(f)
            print(f"Compressed: {f.name}")
    print("Done.")


if __name__ == "__main__":
    main()
