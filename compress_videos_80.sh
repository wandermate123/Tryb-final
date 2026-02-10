#!/bin/bash
# Ultra-compress videos: ~80% size reduction, smooth playback
# Requires ffmpeg. Output: _compressed suffix, then replace originals.

VIDEO_DIRS="videos/videography videos/3d-design videos/graphic-design videos/web-design"

for dir in $VIDEO_DIRS; do
  [ ! -d "$dir" ] && continue
  for f in "$dir"/*.mp4 "$dir"/*.MP4 "$dir"/*.mP4; do
    [ -f "$f" ] || continue
    out="${f%.*}_compressed.mp4"
    echo "Compressing: $f"
    ffmpeg -y -i "$f" -c:v libx264 -crf 32 -preset medium -movflags +faststart \
      -an -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "$out" 2>/dev/null
    if [ -f "$out" ]; then
      mv "$out" "$f"
      echo "  -> Replaced"
    else
      rm -f "$out"
    fi
  done
done
echo "Done."
