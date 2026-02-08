# Fix Large Files in Git History

## Problem
The git repository has 1.7GB of objects because old large video files are still in the git history, even though we compressed them.

## Solution Options

### Option 1: Use Git LFS (Recommended for Videos)
Git LFS stores large files outside the main repository:

```bash
# Install Git LFS
brew install git-lfs

# Initialize in your repo
cd /Users/ayushsingh/Desktop/tryb-2026
git lfs install

# Track video files
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.MP4"
git lfs track "*.mP4"

# Add .gitattributes
git add .gitattributes

# Migrate existing videos to LFS
git lfs migrate import --include="*.mp4,*.mov,*.MP4,*.mP4" --everything

# Push
git push origin main --force
```

### Option 2: Remove Large Files from History (Advanced)
Use BFG Repo-Cleaner to remove large files from history:

```bash
# Download BFG
brew install bfg

# Remove files larger than 50MB from history
bfg --strip-blobs-bigger-than 50M

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin main --force
```

### Option 3: Create Fresh Repository (Easiest)
Start fresh with only compressed videos:

```bash
# Create new branch with only current files
cd /Users/ayushsingh/Desktop/tryb-2026
git checkout --orphan fresh-start
git add .
git commit -m "Fresh start with compressed videos only"
git branch -D main
git branch -m main
git push -f origin main
```

### Option 4: Push in Smaller Chunks
Push commits one at a time:

```bash
# Push oldest commits first
git push origin 87f1daf:main
git push origin 5b722f3:main
# etc...
```

## Recommended: Option 1 (Git LFS)
This is the best long-term solution for managing video files in Git.
