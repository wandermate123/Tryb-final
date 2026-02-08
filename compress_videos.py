#!/usr/bin/env python3
"""
Video Compression Script
Compresses all videos by 60% (reduces file size to ~40% of original)
"""

import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

def get_file_size(filepath):
    """Get file size in bytes"""
    return os.path.getsize(filepath)

def format_size(size_bytes):
    """Format bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], 
                      capture_output=True, 
                      check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def compress_video(input_path, output_path):
    """Compress a video file using ffmpeg"""
    # CRF 28 provides good compression (lower = better quality, higher = smaller file)
    # Target: 60% reduction = ~40% of original size
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-c:v', 'libx264',
        '-crf', '28',  # Quality setting (18-28 is good range, 28 = more compression)
        '-preset', 'medium',  # Encoding speed vs compression
        '-c:a', 'aac',
        '-b:a', '128k',  # Audio bitrate
        '-movflags', '+faststart',  # Web optimization
        '-y',  # Overwrite output file
        str(output_path)
    ]
    
    try:
        # Run ffmpeg with minimal output
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Error: {e.stderr[:100]}")
        return False

def main():
    print("🎬 Video Compression Script")
    print("=" * 50)
    print("This will compress all videos by ~60% (reducing to ~40% of original size)")
    print("")
    
    # Check if ffmpeg is installed
    if not check_ffmpeg():
        print("❌ Error: ffmpeg is not installed")
        print("")
        print("To install ffmpeg:")
        print("1. Install Homebrew (if not installed):")
        print("   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
        print("")
        print("2. Install ffmpeg:")
        print("   brew install ffmpeg")
        print("")
        print("Or download from: https://ffmpeg.org/download.html")
        sys.exit(1)
    
    # Create backup directory
    backup_dir = Path(f"videos_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    backup_dir.mkdir(parents=True, exist_ok=True)
    print(f"📦 Backup directory: {backup_dir}")
    print("")
    
    # Find all video files
    video_extensions = ['.mp4', '.mov', '.MP4', '.mP4']
    videos_dir = Path('videos')
    
    video_files = []
    for ext in video_extensions:
        video_files.extend(videos_dir.rglob(f'*{ext}'))
    
    # Filter out zip files
    video_files = [v for v in video_files if not v.name.endswith('.zip')]
    
    print(f"📹 Found {len(video_files)} video files")
    print("")
    
    total_original_size = 0
    total_new_size = 0
    compressed_count = 0
    failed_count = 0
    
    for i, video_file in enumerate(video_files, 1):
        print(f"[{i}/{len(video_files)}] Processing: {video_file}")
        
        original_size = get_file_size(video_file)
        total_original_size += original_size
        print(f"   Original size: {format_size(original_size)}")
        
        # Create backup
        backup_path = backup_dir / video_file
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(video_file, backup_path)
        
        # Compress to temp file
        temp_file = video_file.with_suffix('.compressed' + video_file.suffix)
        
        if compress_video(video_file, temp_file):
            if temp_file.exists():
                new_size = get_file_size(temp_file)
                reduction = ((original_size - new_size) / original_size) * 100
                
                if new_size < original_size:
                    # Replace original with compressed
                    video_file.unlink()
                    temp_file.rename(video_file)
                    compressed_count += 1
                    total_new_size += new_size
                    print(f"   ✅ Compressed: {format_size(new_size)} ({reduction:.1f}% reduction)")
                else:
                    # Compression didn't help, keep original
                    temp_file.unlink()
                    total_new_size += original_size
                    print(f"   ⚠️  Skipped (compression didn't reduce size)")
            else:
                failed_count += 1
                total_new_size += original_size
                print(f"   ❌ Failed to create compressed file")
        else:
            failed_count += 1
            total_new_size += original_size
        
        print("")
    
    # Summary
    total_reduction = ((total_original_size - total_new_size) / total_original_size) * 100
    print("=" * 50)
    print("✅ Compression Complete!")
    print("")
    print(f"📊 Statistics:")
    print(f"   Videos processed: {len(video_files)}")
    print(f"   Successfully compressed: {compressed_count}")
    print(f"   Failed: {failed_count}")
    print(f"   Original total size: {format_size(total_original_size)}")
    print(f"   New total size: {format_size(total_new_size)}")
    print(f"   Total reduction: {format_size(total_original_size - total_new_size)} ({total_reduction:.1f}%)")
    print("")
    print(f"💡 Backup location: {backup_dir}")
    print("   If you're happy with the results, you can delete the backup:")
    print(f"   rm -rf {backup_dir}")

if __name__ == '__main__':
    main()
