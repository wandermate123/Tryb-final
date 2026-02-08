#!/bin/bash

# Video Compression Script
# Compresses all videos by 60% (reduces file size to 40% of original)

echo "🎬 Starting video compression..."
echo "This will compress all videos by 60% (reducing to 40% of original size)"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo ""
    echo "To install ffmpeg on macOS:"
    echo "1. Install Homebrew (if not installed):"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "2. Install ffmpeg:"
    echo "   brew install ffmpeg"
    echo ""
    exit 1
fi

# Create backup directory
BACKUP_DIR="videos_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup in: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Find all video files
VIDEO_COUNT=0
COMPRESSED_COUNT=0
TOTAL_ORIGINAL_SIZE=0
TOTAL_NEW_SIZE=0

# Process all video files
find videos -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.MP4" -o -name "*.mP4" \) ! -name "*.zip" | while read -r video_file; do
    VIDEO_COUNT=$((VIDEO_COUNT + 1))
    
    # Get file size
    ORIGINAL_SIZE=$(stat -f%z "$video_file" 2>/dev/null || stat -c%s "$video_file" 2>/dev/null)
    TOTAL_ORIGINAL_SIZE=$((TOTAL_ORIGINAL_SIZE + ORIGINAL_SIZE))
    
    # Create backup
    BACKUP_PATH="$BACKUP_DIR/$video_file"
    mkdir -p "$(dirname "$BACKUP_PATH")"
    cp "$video_file" "$BACKUP_PATH"
    
    # Create temp file for compressed video
    TEMP_FILE="${video_file}.compressed"
    
    echo "📹 Compressing: $video_file"
    echo "   Original size: $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE 2>/dev/null || echo "$(($ORIGINAL_SIZE / 1024 / 1024))MB")"
    
    # Compress video: 60% reduction means target bitrate should be ~40% of original
    # Using CRF (Constant Rate Factor) for quality-based compression
    # CRF 28-30 provides good compression while maintaining quality
    ffmpeg -i "$video_file" \
        -c:v libx264 \
        -crf 28 \
        -preset medium \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "$TEMP_FILE" 2>/dev/null
    
    if [ -f "$TEMP_FILE" ]; then
        NEW_SIZE=$(stat -f%z "$TEMP_FILE" 2>/dev/null || stat -c%s "$TEMP_FILE" 2>/dev/null)
        REDUCTION=$((100 - (NEW_SIZE * 100 / ORIGINAL_SIZE)))
        
        if [ $NEW_SIZE -lt $ORIGINAL_SIZE ]; then
            # Replace original with compressed version
            mv "$TEMP_FILE" "$video_file"
            COMPRESSED_COUNT=$((COMPRESSED_COUNT + 1))
            TOTAL_NEW_SIZE=$((TOTAL_NEW_SIZE + NEW_SIZE))
            echo "   ✅ Compressed: $(numfmt --to=iec-i --suffix=B $NEW_SIZE 2>/dev/null || echo "$(($NEW_SIZE / 1024 / 1024))MB") (${REDUCTION}% reduction)"
        else
            # Compression didn't help, keep original
            rm "$TEMP_FILE"
            TOTAL_NEW_SIZE=$((TOTAL_NEW_SIZE + ORIGINAL_SIZE))
            echo "   ⚠️  Skipped (compression didn't reduce size)"
        fi
    else
        echo "   ❌ Failed to compress"
        TOTAL_NEW_SIZE=$((TOTAL_NEW_SIZE + ORIGINAL_SIZE))
    fi
    echo ""
done

echo "✅ Compression complete!"
echo "📊 Statistics:"
echo "   Videos processed: $VIDEO_COUNT"
echo "   Successfully compressed: $COMPRESSED_COUNT"
echo "   Backup location: $BACKUP_DIR"
echo ""
echo "💡 If you're happy with the results, you can delete the backup:"
echo "   rm -rf $BACKUP_DIR"
