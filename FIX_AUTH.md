# Fix GitHub Authentication

## The Problem
You're getting a 403 error because GitHub is using the wrong account (`ayush99566-sketch`) or old credentials.

## Solution: Use a Personal Access Token (PAT)

GitHub no longer accepts passwords. You need to create a Personal Access Token:

### Step 1: Create a Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Tryb Portfolio Push"
4. Select scopes: Check **`repo`** (this gives full repository access)
5. Click "Generate token"
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!

### Step 2: Push with Token
When you run `git push`, it will ask for:
- **Username**: `wandermate123` (or your GitHub username)
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

### Alternative: Use SSH (Recommended for future)
If you prefer SSH:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Change remote: `git remote set-url origin git@github.com:wandermate123/Tryb-final.git`
4. Then push: `git push -u origin main`
