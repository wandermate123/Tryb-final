# Fix Authentication Error - Permission Denied

## ❌ Error You're Seeing

```
remote: Permission to wandermate123/tryb_studio.git denied to ayush99566-sketch.
fatal: unable to access 'https://github.com/wandermate123/tryb_studio.git/': The requested URL returned error: 403
```

## 🔍 Problem

Git is trying to use credentials from the **ayush99566-sketch** account, but the repository belongs to **wandermate123**.

---

## ✅ Solution: Clear Stored Credentials

### Method 1: Clear macOS Keychain (Recommended)

1. **Open Keychain Access** (Applications > Utilities > Keychain Access)

2. **Search for**: `github.com`

3. **Delete all entries** related to GitHub:
   - Look for entries like "github.com" or "git:https://github.com"
   - Right-click and select "Delete"
   - Confirm deletion

4. **Try pushing again**:
   ```bash
   cd "/Users/ayushsingh/Desktop/Trybs page 1 "
   git push -u origin main
   ```

5. **When prompted**:
   - Username: `wandermate123`
   - Password: `[paste your wandermate123 Personal Access Token]`

---

### Method 2: Use Git Credential Helper

Run these commands:

```bash
cd "/Users/ayushsingh/Desktop/Trybs page 1 "

# Clear stored credentials
git credential reject <<EOF
host=github.com
protocol=https
EOF

# Or disable credential helper temporarily
git config --global --unset credential.helper

# Try pushing again
git push -u origin main
```

---

### Method 3: Use SSH Instead (Most Secure)

1. **Generate SSH key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH key to GitHub**:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

3. **Change remote to SSH**:
   ```bash
   cd "/Users/ayushsingh/Desktop/Trybs page 1 "
   git remote set-url origin git@github.com:wandermate123/tryb_studio.git
   git push -u origin main
   ```

---

## 🎯 Quick Fix (Easiest)

**Option A: Use URL with credentials**
```bash
cd "/Users/ayushsingh/Desktop/Trybs page 1 "
git push https://wandermate123:YOUR_TOKEN@github.com/wandermate123/tryb_studio.git main
```

Replace `YOUR_TOKEN` with your Personal Access Token from wandermate123 account.

**Option B: Clear keychain and retry**
1. Open Keychain Access
2. Search "github.com"
3. Delete all GitHub entries
4. Run `git push -u origin main` again
5. Enter `wandermate123` and your token

---

## 📝 Get Your Token

1. **Log in as wandermate123** on GitHub
2. Go to: https://github.com/settings/tokens
3. Generate new token (classic)
4. Select scope: `repo`
5. Copy the token (starts with `ghp_`)

---

## ✅ After Fixing

Once you push successfully, you'll see:
```
Enumerating objects: X, done.
Writing objects: 100% (X/X), done.
To https://github.com/wandermate123/tryb_studio.git
 * [new branch]      main -> main
```

Then check: https://github.com/wandermate123/tryb_studio

---

## 🆘 Still Having Issues?

If you're still getting permission errors:
1. Make sure you're logged in as **wandermate123** on GitHub
2. Verify the repository exists: https://github.com/wandermate123/tryb_studio
3. Check you have write access to the repository
4. Try using SSH method (Method 3 above)
