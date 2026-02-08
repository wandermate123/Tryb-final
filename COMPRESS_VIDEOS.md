# 🎬 Video Compression Guide

## Quick Start

I've created scripts to compress all your videos by 60% (reducing them to ~40% of original size).

---

## Step 1: Install ffmpeg

You need `ffmpeg` installed to compress videos. Choose one method:

### Option A: Using Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   (You'll need to enter your password)

2. **Install ffmpeg**:
   ```bash
   brew install ffmpeg
   ```

### Option B: Download ffmpeg directly

1. Go to: https://evermeet.cx/ffmpeg/
2. Download the latest version
3. Extract and add to your PATH

---

## Step 2: Run Compression

Once ffmpeg is installed, run:

```bash
cd /Users/ayushsingh/Desktop/tryb-2026
python3 compress_videos.py
```

**Or use the bash script:**
```bash
./compress_videos.sh
```

---

## What the Script Does

1. ✅ **Finds all videos** in the `videos/` folder (mp4, mov, etc.)
2. ✅ **Creates a backup** of all original videos
3. ✅ **Compresses each video** by ~60% using H.264 encoding
4. ✅ **Replaces originals** with compressed versions
5. ✅ **Shows statistics** of compression results

---

## Compression Settings

- **Video Codec**: H.264 (libx264)
- **Quality**: CRF 28 (good balance of quality and size)
- **Audio**: AAC at 128kbps
- **Target**: ~60% size reduction

---

## Safety Features

- ✅ **Automatic backup** - All originals are backed up before compression
- ✅ **Only replaces if smaller** - Won't replace if compression doesn't help
- ✅ **Progress tracking** - Shows which video is being processed

---

## After Compression

1. **Test your site** - Make sure videos still look good
2. **If happy**: Delete the backup folder
3. **If not happy**: Restore from backup:
   ```bash
   rm -rf videos/
   mv videos_backup_YYYYMMDD_HHMMSS/* videos/
   ```

---

## Expected Results

- **Original total**: ~1.36 GB
- **After compression**: ~544 MB (60% reduction)
- **Time**: 10-30 minutes depending on number of videos

---

## Troubleshooting

### "ffmpeg not found"
→ Install ffmpeg using Step 1 above

### "Permission denied"
→ Make scripts executable:
  ```bash
  chmod +x compress_videos.sh compress_videos.py
  ```

### Videos look too compressed
→ Edit the script and change `-crf 28` to `-crf 23` (better quality, less compression)

---

**Ready to compress? Install ffmpeg first, then run the script!** 🚀
